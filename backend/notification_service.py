from database import get_db
from datetime import datetime

OPPORTUNITY_THRESHOLD = 10

def get_opportunity_count(user_id: str) -> dict:
    """Returns current new opportunity count and whether threshold is reached."""
    try:
        db = get_db()
        result = db.table('opportunity_counters') \
            .select('*') \
            .eq('user_id', user_id) \
            .maybe_single() \
            .execute()
        if not result.data:
            return {'count': 0, 'threshold': OPPORTUNITY_THRESHOLD, 'threshold_reached': False, 'last_reset_at': None}
        count = result.data.get('new_opportunity_count', 0)
        return {
            'count': count,
            'threshold': OPPORTUNITY_THRESHOLD,
            'threshold_reached': count >= OPPORTUNITY_THRESHOLD,
            'last_reset_at': result.data.get('last_reset_at')
        }
    except Exception as e:
        print(f'[Notification] get_opportunity_count error: {e}')
        return {'count': 0, 'threshold': OPPORTUNITY_THRESHOLD, 'threshold_reached': False, 'last_reset_at': None}

def increment_opportunity_counter(user_id: str, count_to_add: int) -> dict:
    """Increments the counter by the number of newly found opportunity emails."""
    try:
        db = get_db()
        existing = db.table('opportunity_counters') \
            .select('new_opportunity_count') \
            .eq('user_id', user_id) \
            .maybe_single() \
            .execute()
        if existing.data:
            new_count = existing.data.get('new_opportunity_count', 0) + count_to_add
            db.table('opportunity_counters').update({
                'new_opportunity_count': new_count,
                'last_updated_at': datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
        else:
            new_count = count_to_add
            db.table('opportunity_counters').insert({
                'user_id': user_id,
                'new_opportunity_count': new_count,
                'last_updated_at': datetime.utcnow().isoformat(),
                'last_reset_at': None
            }).execute()
        threshold_reached = new_count >= OPPORTUNITY_THRESHOLD
        return {'count': new_count, 'threshold_reached': threshold_reached}
    except Exception as e:
        print(f'[Notification] increment error: {e}')
        return {'count': count_to_add, 'threshold_reached': False}

def reset_opportunity_counter(user_id: str) -> dict:
    """Resets counter after the user clicks Organize (acknowledges the notification)."""
    try:
        db = get_db()
        db.table('opportunity_counters').upsert({
            'user_id': user_id,
            'new_opportunity_count': 0,
            'last_reset_at': datetime.utcnow().isoformat(),
            'last_updated_at': datetime.utcnow().isoformat()
        }).execute()
        return {'reset': True}
    except Exception as e:
        print(f'[Notification] reset error: {e}')
        return {'reset': False}
