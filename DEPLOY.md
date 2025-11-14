# 🚀 GitHub Pages 部署指南

## 📋 部署步骤

### 1. 创建GitHub仓库

1. 访问 [GitHub](https://github.com) 并登录你的账户
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `snake-game`
   - **Description**: `🐍 一个现代化的贪吃蛇游戏`
   - **Public**: ✅ 选择公开（GitHub Pages需要）
   - **Add a README file**: ❌ 不需要（我们已经有了）
   - **Add .gitignore**: ❌ 不需要（我们已经有了）
   - **Choose a license**: 可选，建议选择 MIT License

4. 点击 "Create repository"

### 2. 连接本地仓库到GitHub

创建仓库后，GitHub会显示快速设置页面。选择 "…or push an existing repository from the command line" 部分，运行以下命令：

```bash
git remote add origin https://github.com/yyy93yy/snake-game.git
git branch -M main
git push -u origin main
```

### 3. 启用GitHub Pages

1. 在你的仓库页面，点击 "Settings" 标签
2. 在左侧菜单中找到 "Pages" 选项
3. 在 "Source" 部分，选择：
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
4. 点击 "Save"

### 4. 等待部署完成

GitHub Pages会自动构建你的网站，通常需要1-5分钟。构建完成后，你可以在Pages设置页面看到你的网站地址：

**https://yyy93yy.github.io/snake-game/**

## 🛠️ 快速部署脚本

我已经为你创建了部署脚本，可以使用：

### Windows用户
```bash
deploy.bat
```

### Linux/Mac用户
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 更新游戏

当你修改游戏后，只需要运行：

```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

GitHub Pages会自动更新你的网站。

## 🎮 游戏特性

✅ **已完成的功能：**
- 现代化界面设计
- 三种难度模式
- 响应式设计
- 触屏支持
- 本地最高分存储
- 流畅动画效果
- 内置音效系统
- 暂停/继续功能

## 🔧 故障排除

### 常见问题

1. **网站显示404错误**
   - 确保仓库是公开的
   - 检查GitHub Pages设置是否正确
   - 等待几分钟让GitHub完成构建

2. **游戏无法正常加载**
   - 检查浏览器控制台是否有错误
   - 确保所有文件都已正确推送

3. **样式显示异常**
   - 检查CSS文件路径
   - 确保没有CORS错误

### 获取帮助

如果遇到问题，可以：
1. 查看 [GitHub Pages文档](https://docs.github.com/en/pages)
2. 检查仓库的Actions标签页查看构建状态
3. 在GitHub仓库中创建Issue

## 🌟 分享你的游戏

部署完成后，你可以：
- 分享游戏链接给朋友
- 在社交媒体上展示你的作品
- 添加到你的作品集

---

🎉 **恭喜！你的贪吃蛇游戏现在可以在全球范围内访问了！**