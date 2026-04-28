from supabase import create_client, Client
from functools import lru_cache
import os

@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    # Check if key is placeholder
    if not url or not key or "your-supabase" in key or "placeholder" in key:
        print("⚠️ Supabase credentials missing or invalid. Using placeholder mode.")
        raise ValueError("Invalid Supabase credentials")
        
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"❌ Failed to create Supabase client: {e}")
        raise e

def ping_supabase() -> bool:
    try:
        client = get_supabase()
        client.table("shipments").select("id").limit(1).execute()
        return True
    except Exception:
        return False
