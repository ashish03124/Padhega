@echo off
cd /d "%~dp0"
echo Starting server... > server_log.txt
npm run dev >> server_log.txt 2>&1
