#!/bin/bash
cd /home/kavia/workspace/code-generation/financial-insights-tracker-42345-42354/spendsense_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

