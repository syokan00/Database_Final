from sqlalchemy.orm import Session
from ..models import Post, User, Badge, UserBadge, Translation

def check_badges_for_user(user_id: int, db: Session):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return

        # 1. First Post Badge
        first_post_badge = db.query(Badge).filter(Badge.name == 'first_post').first()
        if first_post_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id, 
                UserBadge.badge_id == first_post_badge.id
            ).first()
            
            if not has_badge:
                post_count = db.query(Post).filter(Post.author_id == user_id).count()
                if post_count >= 1:
                    db.add(UserBadge(user_id=user_id, badge_id=first_post_badge.id))
        
        # 2. Translation Master (polyglot)
        trans_badge = db.query(Badge).filter(Badge.name == 'polyglot').first()
        if trans_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id, 
                UserBadge.badge_id == trans_badge.id
            ).first()
            if not has_badge:
                # Count posts that are translated
                trans_count = db.query(Post).filter(
                    Post.author_id == user_id, 
                    Post.is_translated == True
                ).count()
                if trans_count >= 5:
                    db.add(UserBadge(user_id=user_id, badge_id=trans_badge.id))

        # 3. Popular (Likes) - heart_collector
        pop_badge = db.query(Badge).filter(Badge.name == 'heart_collector').first()
        if pop_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id, 
                UserBadge.badge_id == pop_badge.id
            ).first()
            if not has_badge:
                # Sum likes
                user_posts = db.query(Post).filter(Post.author_id == user_id).all()
                total_likes = sum(len(p.likes) for p in user_posts)
                if total_likes >= 10:
                    db.add(UserBadge(user_id=user_id, badge_id=pop_badge.id))

        db.commit()
    except Exception as e:
        print(f"Badge check failed: {e}")
