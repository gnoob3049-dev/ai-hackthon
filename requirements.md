# Copilot Configuration Requirements

This file breaks down exactly what you must manually configure to power up the newly stateful OpportunityIQ Engine.

## Environment Variables (`.env`)

You must append the following variables to your existing `backend/.env` file. These connect the LLM and the Database.

```env
# Required for core AI pipeline operations
XAI_API_KEY="xai-YourGrokKeyHere"

# Required for Persistent Data Storage
# Copy these from your Supabase dashboard -> Project Settings -> API
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="eyJhbG...your_anon_key..."

# The port where FastAPI will launch (Optional, defaults to 8000)
PORT=8000
```

## Database Initialization (Supabase)

Before starting the server, you need to spawn the tables.
1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab from the left sidebar.
3. Open `supabase_schema.sql` from your project root.
4. Paste the entire content into the SQL Editor and click **Run**.
5. Wait for the "Success" confirmation in the console indicating the 5 tables are provisioned.

## Gmail OAuth Credentials (`credentials.json`)

The OAuth Web Flow relies on your registered Google Cloud application.
1. Download your OAuth 2.0 Client IDs payload from the Google Cloud Console.
2. The downloaded JSON file is typically named `client_secret_xxx.json`.
3. **Rename** the file to `credentials.json`.
4. Place this file strictly into the `backend/` directory (`d:/Email-Organizer/backend/credentials.json`).

## Running the Servers

Once variables and tables are set up, run both pieces of the engine:

**Terminal 1 (Backend/FastAPI):**
```bash
cd backend
# Make sure you are in the virtual environment
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend/React):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application. The Onboarding screen will detect the connected Database effortlessly!
