#!/bin/bash
if [ -f .pids ]; then
  while read line; do
    PID=$(echo $line | awk '{print $3}')
    kill $PID 2>/dev/null
  done < .pids
  rm .pids
  echo 'Servers stopped.'
else
  pkill -f uvicorn
  pkill -f 'vite'
  echo 'Stopped all uvicorn and vite processes.'
fi
