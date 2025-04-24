@echo off
cd /d "C:\Users\Klay\OneDrive\Documentos\GitHub Ton-Chyod-S\api-scraper-mailer\dist\main\web"
pm2 start index.js --name api-scraper-mailer

cd /d "C:\Users\Klay\.pm2"
pm2 save
pm2 resurrect