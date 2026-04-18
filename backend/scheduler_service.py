from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
import os
from database import get_db

scheduler = AsyncIOScheduler()

PROFILE_REFRESH_DAYS = int(os.getenv('PROFILE_REFRESH_DAYS', 3))
EMAIL_SCAN_DAYS = int(os.getenv('EMAIL_SCAN_DAYS', 3))

async def run_profile_refresh():
    """Recomputes skill profile for all users whose profile is stale."""
    print(f'[Scheduler] Profile refresh job triggered at {datetime.utcnow()}')
    try:
        db = get_db()
        if not db:
            print('[Scheduler] DB not available, skipping profile refresh')
            return
        cutoff = (datetime.utcnow() - timedelta(days=PROFILE_REFRESH_DAYS)).isoformat()
        result = db.table('user_profiles') \
            .select('user_id, github_url, resume_text, cgpa, major, semester') \
            .lt('last_profile_updated_at', cutoff) \
            .execute()
        stale_profiles = result.data or []
        print(f'[Scheduler] Found {len(stale_profiles)} stale profiles to refresh')
        for profile_row in stale_profiles:
            user_id = profile_row.get('user_id')
            try:
                from github_analyzer_service import fetch_github_profile_data
                from profile_builder_service import generate_llm_profile
                
                github_data = {}
                if profile_row.get('github_url'):
                    github_data = fetch_github_profile_data(profile_row['github_url'])
                
                updated_summary = generate_llm_profile(
                    resume_text=profile_row.get('resume_text', ''),
                    github_data=github_data,
                    form_data=profile_row
                )
                
                db.table('user_profiles').update({
                    'skill_level_summary': updated_summary,
                    'last_profile_updated_at': datetime.utcnow().isoformat()
                }).eq('user_id', user_id).execute()
                print(f'[Scheduler] Profile refreshed for user {user_id}')
            except Exception as e:
                print(f'[Scheduler] Failed to refresh profile for user {user_id}: {e}')
    except Exception as e:
        print(f'[Scheduler] Profile refresh job failed: {e}')

async def run_email_rescan():
    """Triggers incremental Gmail scan for all users due for re-scan."""
    print(f'[Scheduler] Email rescan job triggered at {datetime.utcnow()}')
    try:
        db = get_db()
        if not db:
            print('[Scheduler] DB not available, skipping email rescan')
            return
        cutoff = (datetime.utcnow() - timedelta(days=EMAIL_SCAN_DAYS)).isoformat()
        result = db.table('gmail_checkpoints') \
            .select('user_id, last_history_id, last_scan_at') \
            .lt('last_scan_at', cutoff) \
            .execute()
        due_users = result.data or []
        print(f'[Scheduler] Found {len(due_users)} users due for email rescan')
        for row in due_users:
            print(f'[Scheduler] Queued rescan for user {row["user_id"]}')
            # Logic to trigger full sync pipeline here if desired
    except Exception as e:
        print(f'[Scheduler] Email rescan job failed: {e}')

def get_scheduler_status():
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            'id': job.id,
            'next_run': str(job.next_run_time),
            'trigger': str(job.trigger)
        })
    return {
        'running': scheduler.running,
        'jobs': jobs,
        'profile_refresh_interval_days': PROFILE_REFRESH_DAYS,
        'email_scan_interval_days': EMAIL_SCAN_DAYS
    }

def start_scheduler():
    scheduler.add_job(
        run_profile_refresh,
        trigger=IntervalTrigger(days=PROFILE_REFRESH_DAYS),
        id='profile_refresh',
        replace_existing=True,
        max_instances=1
    )
    scheduler.add_job(
        run_email_rescan,
        trigger=IntervalTrigger(days=EMAIL_SCAN_DAYS),
        id='email_rescan',
        replace_existing=True,
        max_instances=1
    )
    scheduler.start()
    print(f'[Scheduler] Started. Profile refresh every {PROFILE_REFRESH_DAYS}d, email scan every {EMAIL_SCAN_DAYS}d')

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print('[Scheduler] Stopped.')
