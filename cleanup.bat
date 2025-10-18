@echo off
echo Cleaning up duplicate files...
timeout /t 5 /nobreak >nul
rd /s /q "durian-3d-site"
echo Done! You can now delete this cleanup.bat file.
pause
