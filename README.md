# Opportunity Inbox Copilot

Opportunity Inbox Copilot is a powerful engine designed to extract, rank, and organize personal academic and career opportunities automatically synced from your Gmail.

## 🛠 Prerequisites & Database Setup (Supabase)

To persistently store profiles and prevent duplicate processings, you must manually create the following tables in your **[Supabase](https://supabase.com/)** SQL Editor.

1. **Copy the SQL block below.**
2. **Go to your Supabase project -> SQL Editor.**
3. **Paste and execute.**

```sql
-- 1. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
INSERT INTO users (id) VALUES ('demo_user') ON CONFLICT DO NOTHING;

-- 2. User Profiles Table
CREATE TABLE user_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    name TEXT,
    degree TEXT,
    department TEXT,
    cgpa NUMERIC,
    semester TEXT,
    github_url TEXT,
    skills JSONB,
    interests JSONB,
    preferred_opportunities JSONB,
    resume_path TEXT,
    
    skill_level_summary TEXT,
    strengths JSONB,
    weaknesses JSONB,
    domain_focus JSONB,
    readiness_notes JSONB,
    
    last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Processed Emails (Prevents re-processing the same email)
CREATE TABLE processed_emails (
    email_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Gmail Checkpoints
CREATE TABLE gmail_checkpoints (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    history_id TEXT,
    last_sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Opportunities
CREATE TABLE opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    email_id TEXT REFERENCES processed_emails(email_id),
    
    title TEXT,
    organization TEXT,
    opportunity_type TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    deadline_text TEXT,
    stipend_or_amount TEXT,
    location TEXT,
    duration TEXT,
    eligibility JSONB,
    requirements JSONB,
    apply_link TEXT,
    summary TEXT,
    
    score INTEGER,
    urgency TEXT,
    reason TEXT,
    confidence TEXT,
    
    application_guidance JSONB,
    interview_guidance JSONB,
    preparation_checklist JSONB,
    gap_insight TEXT,
    deadline_warning TEXT,
    
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

## ⚙️ Environment Variables

Add these to `backend/.env`:

```env
XAI_API_KEY="xai-YourGrokKeyHere"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="eyJhbG...your_anon_key..."
PORT=8000
```

*Drop your Google Cloud OAuth `credentials.json` directly into the `/backend` folder.*
