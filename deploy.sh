#!/bin/bash

# 贪吃蛇游戏部署脚本
# 使用方法：./deploy.sh

echo "🚀 开始部署贪吃蛇游戏到GitHub Pages..."

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是Git仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "🚀 部署更新 - $(date)"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 游戏地址：https://yyy93yy.github.io/snake-game/"
echo "⏳ GitHub Pages可能需要几分钟时间来构建..."

# 等待用户确认
read -p "按Enter键继续..."