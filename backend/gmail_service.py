import os.path
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import base64
from bs4 import BeautifulSoup
from database import get_db

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailService:
    def __init__(self, credentials_path='credentials.json', token_path='token.json'):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.state_path = 'gmail_state.json'
        
    def is_connected(self):
        """Check if we have a valid token."""
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            if creds and creds.valid:
                return True
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    with open(self.token_path, 'w') as token:
                        token.write(creds.to_json())
                    return True
                except Exception:
                    pass
        return False

    def get_service(self):
        """Get the Gmail service, prompting for auth if needed."""
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                client_id = os.environ.get("GOOGLE_CLIENT_ID")
                client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
                
                if client_id and client_secret:
                    client_config = {
                        "installed": {
                            "client_id": client_id,
                            "project_id": "opportunity-copilot",
                            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                            "token_uri": "https://oauth2.googleapis.com/token",
                            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                            "client_secret": client_secret,
                            "redirect_uris": ["http://localhost"]
                        }
                    }
                    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
                else:    
                    if not os.path.exists(self.credentials_path):
                        raise FileNotFoundError(f"Missing env variables and {self.credentials_path}. Please configure them.")
                    flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                    
                creds = flow.run_local_server(port=0)
            
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
                
        return build('gmail', 'v1', credentials=creds)

    def load_state(self):
        db = get_db()
        if db:
            try:
                res = db.table('processed_emails').select('email_id').eq('user_id', 'demo_user').execute()
                ids = [row['email_id'] for row in res.data]
                return {'processed_email_ids': ids}
            except Exception as e:
                print(f"Supabase load error: {e}")
                
        # Fallback to local json
        if os.path.exists(self.state_path):
            try:
                with open(self.state_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {'processed_email_ids': []}

    def save_state(self, state, new_ids=[]):
        db = get_db()
        if db and new_ids:
            try:
                data = [{'email_id': i, 'user_id': 'demo_user'} for i in new_ids]
                db.table('processed_emails').upsert(data).execute()
            except Exception as e:
                print(f"Supabase save error: {e}")
                
        # Always save fallback
        with open(self.state_path, 'w') as f:
            json.dump(state, f, indent=2)

    def fetch_recent_unprocessed_emails(self, limit=15):
        """Fetches up to `limit` unprocessed emails from INBOX."""
        service = self.get_service()
        state = self.load_state()
        processed_ids = set(state.get('processed_email_ids', []))
        
        # We query recent messages. To ensure we find unprocessed ones, we get a bit more.
        max_results = min(limit * 2, 100) 
        
        results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=max_results).execute()
        messages = results.get('messages', [])
        
        unprocessed_messages = [msg for msg in messages if msg['id'] not in processed_ids]
        messages_to_process = unprocessed_messages[:limit]
        
        emails_content = []
        new_processed_ids = []
        
        for msg_ref in messages_to_process:
            try:
                msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
                
                # Extract subject from headers
                headers = msg['payload'].get('headers', [])
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown Sender')
                date = next((h['value'] for h in headers if h['name'].lower() == 'date'), 'Unknown Date')
                
                # Extract body
                body = self._extract_body(msg['payload'])
                
                email_text = f"From: {sender}\nDate: {date}\nSubject: {subject}\n\n{body}"
                emails_content.append(email_text)
                
                new_processed_ids.append(msg_ref['id'])
            except Exception as e:
                print(f"Failed to fetch msg {msg_ref['id']}: {e}")
                
        # Update state
        state['processed_email_ids'] = list(processed_ids.union(set(new_processed_ids)))
        self.save_state(state, new_ids=new_processed_ids)
        
        return emails_content
        
    def _extract_body(self, payload):
        """Recursively parses email payload to extract plain text or HTML body."""
        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain':
                    data = part.get('body', {}).get('data', '')
                    if data:
                        return base64.urlsafe_b64decode(data).decode('utf-8')
            # Fallback to HTML if no text/plain
            for part in payload['parts']:
                if part.get('mimeType') == 'text/html':
                    data = part.get('body', {}).get('data', '')
                    if data:
                        html_content = base64.urlsafe_b64decode(data).decode('utf-8')
                        return BeautifulSoup(html_content, 'html.parser').get_text(separator='\n')
            # Still nothing, try recursive parts
            for part in payload['parts']:
                body = self._extract_body(part)
                if body:
                    return body
        elif 'body' in payload and 'data' in payload['body']:
            data = payload['body']['data']
            content = base64.urlsafe_b64decode(data).decode('utf-8')
            if payload.get('mimeType') == 'text/html':
                return BeautifulSoup(content, 'html.parser').get_text(separator='\n')
            return content
        return ""

gmail_service = GmailService()
