@echo off
chcp 65001 >nul

echo 🚀 开始部署贪吃蛇游戏到GitHub Pages...

REM 检查是否在Git仓库中
if not exist ".git" (
    echo ❌ 错误：当前目录不是Git仓库
    pause
    exit /b 1
)

REM 检查是否有未提交的更改
for /f "tokens=*" %%i in ('git status --porcelain') do (
    if not "%%i"=="" (
        echo 📝 发现未提交的更改，正在提交...
        git add .
        git commit -m "🚀 部署更新 - %date% %time%"
        goto :push
    )
)

:push
REM 推送到GitHub
echo 📤 推送到GitHub...
git push origin main

echo ✅ 部署完成！
echo 🌐 游戏地址：https://yyy93-yy.github.io/snake-game-pygame77/
echo ⏳ GitHub Pages可能需要几分钟时间来构建...

pause