@echo off
cd /d C:\Users\KYH\Documents\iris

git add .

git diff --cached --quiet
if %errorlevel%==0 (
    echo.
    echo 변경된 파일이 없습니다.
    pause
    exit
)

set /p msg=커밋 메시지(Enter면 Auto update): 
if "%msg%"=="" set msg=Auto update

git commit -m "%msg%"
git push

echo.
echo ============================
echo GitHub 업로드 완료!
echo ============================
pause