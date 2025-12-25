from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from ..models import Post, User, Badge, UserBadge, Translation, Item, Comment, Like

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
        
        # 2. Night Owl Badge - Posted between 0:00-6:00
        night_owl_badge = db.query(Badge).filter(Badge.name == 'night_owl').first()
        if night_owl_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == night_owl_badge.id
            ).first()
            if not has_badge:
                # Check if user has posted between 0:00-6:00
                night_posts = db.query(Post).filter(
                    Post.author_id == user_id,
                    func.extract('hour', Post.created_at).between(0, 5)
                ).first()
                if night_posts:
                    db.add(UserBadge(user_id=user_id, badge_id=night_owl_badge.id))
        
        # 3. Streak Poster - Posted 5 days in a row
        streak_badge = db.query(Badge).filter(Badge.name == 'streak_poster').first()
        if streak_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == streak_badge.id
            ).first()
            if not has_badge:
                # Check for 5 consecutive days of posting
                posts = db.query(Post).filter(
                    Post.author_id == user_id
                ).order_by(Post.created_at.desc()).all()
                
                if len(posts) >= 5:
                    # Get unique dates
                    post_dates = set()
                    for p in posts:
                        post_date = p.created_at.date()
                        post_dates.add(post_date)
                    
                    # Check for consecutive days
                    sorted_dates = sorted(post_dates, reverse=True)
                    if len(sorted_dates) >= 5:
                        consecutive = 1
                        for i in range(len(sorted_dates) - 1):
                            if sorted_dates[i] - sorted_dates[i+1] == timedelta(days=1):
                                consecutive += 1
                            else:
                                consecutive = 1
                            if consecutive >= 5:
                                db.add(UserBadge(user_id=user_id, badge_id=streak_badge.id))
                                break
        
        # 4. Translation Master (polyglot) - Posted in multiple languages
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

        # 5. Popular (Likes) - heart_collector
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
        
        # 6. Comment King - Posted 20 comments
        comment_king_badge = db.query(Badge).filter(Badge.name == 'comment_king').first()
        if comment_king_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == comment_king_badge.id
            ).first()
            if not has_badge:
                comment_count = db.query(Comment).filter(Comment.author_id == user_id).count()
                if comment_count >= 20:
                    db.add(UserBadge(user_id=user_id, badge_id=comment_king_badge.id))
        
        # 7. Top Seller - Sold 5 items
        top_seller_badge = db.query(Badge).filter(Badge.name == 'top_seller').first()
        if top_seller_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == top_seller_badge.id
            ).first()
            if not has_badge:
                sold_count = db.query(Item).filter(
                    Item.user_id == user_id,
                    Item.status == 'sold'
                ).count()
                if sold_count >= 5:
                    db.add(UserBadge(user_id=user_id, badge_id=top_seller_badge.id))
        
        # 8. Smart Buyer - Bought 3 items (需要根据实际业务逻辑调整)
        smart_buyer_badge = db.query(Badge).filter(Badge.name == 'smart_buyer').first()
        if smart_buyer_badge:
            has_badge = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == smart_buyer_badge.id
            ).first()
            if not has_badge:
                # 这里需要根据实际的购买记录来检查，暂时使用消息数作为替代
                # 或者需要额外的购买记录表
                pass  # TODO: 实现购买逻辑后添加

        db.commit()
    except Exception as e:
        print(f"Badge check failed: {e}")
        db.rollback()
