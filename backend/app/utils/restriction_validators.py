"""
限制机制验证器
用于验证帖子内容是否符合各种限制规则
"""
import re
from typing import Tuple, Optional

def validate_restriction(content: str, restriction_type: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    验证内容是否符合限制规则
    返回: (是否通过, 错误消息)
    """
    if not restriction_type:
        return True, None
    
    if restriction_type == "no-kanji":
        # 禁止汉字，只能使用平假名、片假名、英文字母、数字
        kanji_pattern = re.compile(r'[\u4e00-\u9faf]')
        if kanji_pattern.search(content):
            return False, "禁止使用汉字，只能使用平假名、片假名、英文字母和数字"
    
    elif restriction_type == "emoji-only":
        # 只能使用emoji
        emoji_pattern = re.compile(r'[\U0001F300-\U0001F9FF\U0001FA00-\U0001FAFF\U00002600-\U000027BF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002700-\U000027BF\U0001F900-\U0001F9FF\U0001FA70-\U0001FAFF\U00002600-\U000026FF\U00002700-\U000027BF]')
        non_emoji = re.sub(r'[\s\n]', '', content)  # 移除空格和换行
        if not all(emoji_pattern.match(char) for char in non_emoji if char):
            return False, "只能使用emoji，不能使用文字"
    
    elif restriction_type == "50char":
        if len(content) > 50:
            return False, "内容不能超过50个字符"
    
    elif restriction_type == "120char":
        if len(content) > 120:
            return False, "内容不能超过120个字符"
    
    elif restriction_type == "200char":
        if len(content) > 200:
            return False, "内容不能超过200个字符"
    
    elif restriction_type == "no-desu-masu":
        # 禁止使用「です・ます」
        if re.search(r'です|ます', content):
            return False, "禁止使用「です・ます」"
    
    elif restriction_type == "kansai-ben":
        # 必须使用关西弁（简单检查：必须包含某些关西弁特征词）
        kansai_keywords = ['やで', 'やねん', 'やろ', 'やった', 'やったで', 'やな', 'ええ', 'ほんま']
        if not any(keyword in content for keyword in kansai_keywords):
            return False, "必须使用关西弁（例如：やで、やねん等）"
    
    elif restriction_type == "must-emoji":
        # 必须包含至少一个emoji
        emoji_pattern = re.compile(r'[\U0001F300-\U0001F9FF\U0001FA00-\U0001FAFF\U00002600-\U000027BF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]')
        if not emoji_pattern.search(content):
            return False, "必须包含至少一个emoji"
    
    elif restriction_type == "must-end-exclamation":
        # 末尾必须加"！！！"
        if not content.rstrip().endswith('！！！'):
            return False, "末尾必须加「！！！」"
    
    elif restriction_type == "must-end-wan":
        # 每句话结尾加"ワン"
        sentences = re.split(r'[。！？\n]', content)
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not sentence.endswith('ワン'):
                return False, "每句话结尾必须加「ワン」"
    
    return True, None

def get_daily_restrictions() -> dict:
    """
    获取每日随机限制（示例实现）
    在实际应用中，可以从数据库或缓存中获取
    """
    import random
    from datetime import datetime
    
    # 基于日期生成随机种子，确保同一天的限制相同
    seed = datetime.now().toordinal()
    random.seed(seed)
    
    restrictions = {
        "char_limit": random.choice([50, 120, 200]),
        "forbidden_word": random.choice(["学校", "就活", "研究室", "授業", "テスト"]),
        "must_emoji": random.choice(["🐸", "🍙", "🦖", "🍀", "⭐"]),
        "random_question": random.choice([
            "你喜欢可颂吗？",
            "今天咖啡喝了吗？",
            "选一个：猫 or 老师？",
            "今天的心情如何？"
        ])
    }
    
    return restrictions

