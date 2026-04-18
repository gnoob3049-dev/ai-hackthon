import os
from supabase import create_client, Client

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_KEY", "")

# In local dev without keys configured yet, we can stub or fail gracefully
try:
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
    else:
        # Provide a dummy or raise so we know it's missing
        print("WARNING: SUPABASE_URL and/or SUPABASE_KEY not found in environment.")
        supabase = None
except Exception as e:
    print(f"Failed to initialize Supabase: {e}")
    supabase = None

def get_db():
    return supabase
