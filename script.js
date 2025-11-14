class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.initializeGame();
        this.loadHighScore();
        this.setupEventListeners();
        this.showOverlay('准备开始', '按空格键或点击开始按钮');
        this.draw();
    }
    
    initializeGame() {
        this.snake = [
            {x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2)}
        ];
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameState = 'ready'; // ready, playing, paused, gameover
        this.gameSpeed = 100;
        this.lastRenderTime = 0;
        this.isProcessing = false;
        this.animationFrame = 0;
        
        this.difficulties = {
            easy: 150,
            normal: 100,
            hard: 60,
            extreme: 40
        };
        
        this.colors = {
            snake: {
                head: '#27ae60',
                body: '#2ecc71',
                gradient: ['#2ecc71', '#27ae60']
            },
            food: '#e74c3c',
            foodHighlight: '#c0392b',
            background: '#2c3e50',
            grid: '#34495e'
        };
    }
    
    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        this.updateScoreDisplay();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('overlayStartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.gameSpeed = this.difficulties[e.target.value];
            if (this.gameState === 'playing') {
                this.showNotification(`难度已切换到${e.target.options[e.target.selectedIndex].text}`);
            }
        });
        
        // 触摸事件支持
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameState !== 'playing') return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 水平滑动
                if (diffX > 0 && this.direction.x === 0) {
                    this.nextDirection = {x: 1, y: 0};
                } else if (diffX < 0 && this.direction.x === 0) {
                    this.nextDirection = {x: -1, y: 0};
                }
            } else {
                // 垂直滑动
                if (diffY > 0 && this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: 1};
                } else if (diffY < 0 && this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: -1};
                }
            }
            e.preventDefault();
        });
    }
    
    handleKeyPress(e) {
        if (this.isProcessing) return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.gameState === 'ready' || this.gameState === 'gameover') {
                    this.startGame();
                } else if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.togglePause();
                }
                break;
                
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                if (this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: -1};
                }
                break;
                
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                if (this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: 1};
                }
                break;
                
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                if (this.direction.x === 0) {
                    this.nextDirection = {x: -1, y: 0};
                }
                break;
                
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                if (this.direction.x === 0) {
                    this.nextDirection = {x: 1, y: 0};
                }
                break;
                
            case 'r':
            case 'R':
                e.preventDefault();
                this.restartGame();
                break;
        }
    }
    
    startGame() {
        if (this.gameState === 'playing') return;
        
        if (this.gameState === 'gameover') {
            this.initializeGame();
            this.loadHighScore();
        }
        
        this.gameState = 'playing';
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.hideOverlay();
        this.updateButtonStates();
        this.gameLoop();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('游戏暂停', '按空格键继续游戏');
            document.getElementById('pauseBtn').textContent = '继续';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            document.getElementById('pauseBtn').textContent = '暂停';
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.initializeGame();
        this.loadHighScore();
        this.showOverlay('准备开始', '按空格键或点击开始按钮');
        this.updateButtonStates();
        this.draw();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        requestAnimationFrame((time) => this.gameLoop(time));
        
        const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
        if (secondsSinceLastRender < this.gameSpeed / 1000) return;
        
        this.lastRenderTime = currentTime;
        this.update();
        this.draw();
        this.animationFrame++;
    }
    
    update() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        // 更新方向
        this.direction = {...this.nextDirection};
        
        // 计算新头部位置
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            this.isProcessing = false;
            return;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
            this.animateScore();
            this.playEatSound();
        } else {
            // 移除尾部
            this.snake.pop();
        }
        
        this.isProcessing = false;
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = i * this.gridSize;
            
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // 蛇头
                this.drawSnakeHead(x, y);
            } else {
                // 蛇身
                this.drawSnakeBody(x, y, index);
            }
        });
    }
    
    drawSnakeHead(x, y) {
        // 主体
        this.ctx.fillStyle = this.colors.snake.head;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        
        // 眼睛
        this.ctx.fillStyle = '#fff';
        const eyeSize = 3;
        const eyeOffset = 5;
        
        if (this.direction.x === 1) { // 向右
            this.ctx.fillRect(x + this.gridSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(x + this.gridSize - eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.direction.x === -1) { // 向左
            this.ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(x + eyeOffset - eyeSize, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.direction.y === -1) { // 向上
            this.ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
            this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.direction.y === 1) { // 向下
            this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
        }
    }
    
    drawSnakeBody(x, y, index) {
        // 渐变效果
        const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
        const colorIndex = index % 2;
        gradient.addColorStop(0, this.colors.snake.gradient[colorIndex]);
        gradient.addColorStop(1, this.colors.snake.gradient[1 - colorIndex]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 动画效果
        const pulse = Math.sin(this.animationFrame * 0.1) * 2;
        const size = (this.gridSize / 2 - 3) + pulse;
        
        // 食物主体
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 食物高光
        this.ctx.fillStyle = this.colors.foodHighlight;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2 - 3, y + this.gridSize / 2 - 3, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            document.getElementById('high-score').textContent = this.highScore;
        }
    }
    
    animateScore() {
        const scoreElement = document.getElementById('score');
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = '#f39c12';
        
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = '';
        }, 300);
    }
    
    playEatSound() {
        // 创建简单的音效
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // 忽略音频错误
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        let message = `最终得分: ${this.score}`;
        if (this.score === this.highScore && this.score > 0) {
            message += ' 🎉 新纪录！';
        }
        
        this.showOverlay('游戏结束', message);
        this.updateButtonStates();
        this.playGameOverSound();
    }
    
    playGameOverSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // 忽略音频错误
        }
    }
    
    showOverlay(title, message) {
        const overlay = document.getElementById('gameOverlay');
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        
        if (this.gameState === 'ready' || this.gameState === 'gameover') {
            document.getElementById('overlayStartBtn').style.display = 'inline-block';
        } else {
            document.getElementById('overlayStartBtn').style.display = 'none';
        }
        
        overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    updateButtonStates() {
        const pauseBtn = document.getElementById('pauseBtn');
        const startBtn = document.getElementById('startBtn');
        const overlayStartBtn = document.getElementById('overlayStartBtn');
        
        if (this.gameState === 'playing') {
            pauseBtn.textContent = '暂停';
            pauseBtn.disabled = false;
            startBtn.style.display = 'none';
        } else if (this.gameState === 'paused') {
            pauseBtn.textContent = '继续';
            pauseBtn.disabled = false;
            startBtn.style.display = 'none';
        } else {
            pauseBtn.textContent = '暂停';
            pauseBtn.disabled = true;
            startBtn.style.display = 'inline-block';
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});