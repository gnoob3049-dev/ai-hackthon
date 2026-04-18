#!/bin/bash
echo '🚀 Starting OpportunityIQ...'

if [ ! -f backend/.env ]; then
  echo '❌ Missing backend/.env file. Run: cp backend/.env.example backend/.env'
  exit 1
fi

if grep -q 'your_anthropic_api_key_here' backend/.env; then
  echo '⚠️  Warning: API key not set in backend/.env - demo mode will be used'
fi

echo '📦 Starting backend on http://localhost:8000...'
cd backend && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

echo '⚛️  Starting frontend on http://localhost:5173...'
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ''
echo '✅ Both servers running!'
echo '   Frontend: http://localhost:5173'
echo '   Backend:  http://localhost:8000'
echo '   API Docs: http://localhost:8000/docs'
echo ''
echo 'Press Ctrl+C to stop both servers'
echo "Backend PID: $BACKEND_PID" > .pids
echo "Frontend PID: $FRONTEND_PID" >> .pids

wait
