import os
from celery import Celery
import requests
import json
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Post, Translation, User, Badge, UserBadge

from .celery_app import celery_app

# 开发环境更常见的是在宿主机跑 LibreTranslate（localhost:5000）。
# Docker 环境会通过 docker-compose 显式设置为 http://libretranslate:5000
LIBRETRANSLATE_URL = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")

@celery_app.task
def translate_post(post_id: int, target: str = None):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return "Post not found"

        def app_lang_to_lt(code: str) -> str:
            if not code:
                return code
            if code == "zh":
                return "zh-Hans"
            return code

        source_lang = app_lang_to_lt(post.source_language) if post.source_language else "auto"
        if target:
            # target 参数使用应用语言码（zh/en/ja），这里映射为 LibreTranslate 语言码
            lt_target = app_lang_to_lt(target)
            targets = [lt_target] if lt_target != source_lang else []
        else:
            # 自动翻译：应用层期望 ja/zh/en
            app_targets = [l for l in ['ja', 'zh', 'en'] if l != (post.source_language or '')]
            targets = [app_lang_to_lt(t) for t in app_targets if app_lang_to_lt(t) != source_lang]
        
        translations_cache = post.translated_cache or {}
        if not isinstance(translations_cache, dict):
            translations_cache = {}

        success_count = 0

        for target in targets:
            try:
                # Call LibreTranslate
                response = requests.post(
                    f"{LIBRETRANSLATE_URL}/translate",
                    json={
                        "q": post.content,
                        "source": source_lang or "auto",
                        "target": target,
                        "format": "text"
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    translated_text = result.get("translatedText")
                    if translated_text:
                        # 反向映射：把 zh-Hans 存成应用的 zh，方便前端读取
                        app_key = "zh" if target in ["zh-Hans", "zh-Hant"] else target
                        # Update cache
                        translations_cache[app_key] = translated_text
                        
                        # Update Translation table
                        trans_entry = db.query(Translation).filter(
                            Translation.post_id == post_id,
                            Translation.lang == app_key
                        ).first()
                        
                        if not trans_entry:
                            trans_entry = Translation(
                                post_id=post_id,
                                lang=app_key,
                                translated_text=translated_text
                            )
                            db.add(trans_entry)
                        else:
                            trans_entry.translated_text = translated_text
                        
                        success_count += 1
            except Exception as e:
                print(f"Translation failed for {target}: {e}")

        if success_count > 0:
            post.translated_cache = translations_cache
            post.is_translated = True
            db.commit()
            
            # Trigger badge check
            from .services.badge_service import check_badges_for_user
            check_badges_for_user(post.author_id, db)
            
        return f"Translated {success_count} languages"
    finally:
        db.close()
