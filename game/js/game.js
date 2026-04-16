// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.state = 'menu'; // menu, playing, paused, gameover, victory
        this.level = 1;
        this.sun = GAME_CONFIG.INITIAL_SUN;
        this.wave = 0;
        this.maxWaves = 5;
        
        // 游戏对象
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.explosions = [];
        this.damageNumbers = [];
        
        // 游戏系统
        this.cooldownManager = new CooldownManager();
        this.selectedPlant = null;
        this.plantGrid = {}; // 记录每个格子的植物
        
        // 波次系统
        this.waveSystem = null;
        this.lastSunDrop = 0;
        
        // 动画循环
        this.lastTime = 0;
        this.animationId = null;
        
        // 鼠标位置
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoverCell = null;
        
        // 绑定事件
        this.bindEvents();
    }

    init() {
        this.updateUI();
        this.showScreen('startScreen');
    }

    bindEvents() {
        // 画布点击事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 植物卡片点击
        document.querySelectorAll('.plant-card').forEach(card => {
            card.addEventListener('click', (e) => this.handlePlantCardClick(e));
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame(1));
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.showScreen('levelSelectScreen'));
        document.getElementById('helpBtn').addEventListener('click', () => this.showScreen('helpScreen'));
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('backFromHelpBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('quitBtn').addEventListener('click', () => this.quitGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        
        // 关卡选择
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const level = parseInt(card.dataset.level);
                this.startGame(level);
            });
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    startGame(level) {
        this.level = level;
        this.resetGame();
        this.state = 'playing';
        this.showScreen('gameScreen');
        this.setupWaveSystem();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    resetGame() {
        this.sun = GAME_CONFIG.INITIAL_SUN;
        this.wave = 0;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.explosions = [];
        this.damageNumbers = [];
        this.plantGrid = {};
        this.selectedPlant = null;
        this.cooldownManager = new CooldownManager();
        particleSystem.clear();
        animationManager.clear();
        this.updateUI();
    }

    setupWaveSystem() {
        const levelConfig = GAME_CONFIG.LEVELS[this.level - 1];
        const now = Date.now();
        this.waveSystem = {
            waves: levelConfig.waves,
            currentWave: 0,
            waveStartTime: now, // 立即开始第一波
            zombiesInWave: [],
            zombiesSpawned: 0,
            waveComplete: false
        };
        this.maxWaves = levelConfig.waves.length;
        this.lastSunDrop = now;
    }

    gameLoop() {
        if (this.state !== 'playing') return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // 更新冷却
        this.cooldownManager.update(deltaTime);
        
        // 更新粒子系统
        particleSystem.update(deltaTime);
        animationManager.update(deltaTime);
        
        // 阳光掉落
        this.updateSunDrops(deltaTime);
        
        // 更新波次系统
        this.updateWaveSystem(deltaTime);
        
        // 更新植物
        this.updatePlants(deltaTime);
        
        // 更新僵尸
        this.updateZombies(deltaTime);
        
        // 更新投射物
        this.updateProjectiles(deltaTime);
        
        // 更新阳光
        this.updateSuns(deltaTime);
        
        // 更新爆炸
        this.updateExplosions(deltaTime);
        
        // 更新伤害数字
        this.updateDamageNumbers(deltaTime);
        
        // 检查游戏结束
        this.checkGameOver();
        
        // 更新UI
        this.updateUI();
    }

    updateSunDrops(deltaTime) {
        const levelConfig = GAME_CONFIG.LEVELS[this.level - 1];
        const now = Date.now();
        
        if (now - this.lastSunDrop >= levelConfig.sunInterval) {
            this.lastSunDrop = now;
            const x = GAME_CONFIG.LAWN_X + Math.random() * (GAME_CONFIG.COLS * GAME_CONFIG.CELL_WIDTH);
            this.suns.push(new Sun(x, 50));
        }
    }

    updateWaveSystem(deltaTime) {
        if (!this.waveSystem || this.waveSystem.waveComplete) return;
        
        const now = Date.now();
        
        // 检查是否需要开始新波次
        if (this.waveSystem.currentWave < this.waveSystem.waves.length) {
            const currentWave = this.waveSystem.waves[this.waveSystem.currentWave];
            
            if (now >= this.waveSystem.waveStartTime) {
                // 生成僵尸
                this.spawnZombies(currentWave);
                this.waveSystem.currentWave++;
                this.wave = this.waveSystem.currentWave;
                
                // 设置下一波时间
                if (this.waveSystem.currentWave < this.waveSystem.waves.length) {
                    this.waveSystem.waveStartTime = now + this.waveSystem.waves[this.waveSystem.currentWave].delay;
                }
            }
        }
        
        // 检查是否所有波次完成且所有僵尸被消灭
        if (this.waveSystem.currentWave >= this.waveSystem.waves.length && 
            this.zombies.length === 0 && 
            this.waveSystem.zombiesInWave.length === 0) {
            this.victory();
        }
    }

    spawnZombies(wave) {
        let currentDelay = 0;
        
        wave.zombies.forEach(zombieGroup => {
            for (let i = 0; i < zombieGroup.count; i++) {
                const delay = currentDelay;
                setTimeout(() => {
                    if (this.state === 'playing') {
                        const row = randomInt(0, GAME_CONFIG.ROWS - 1);
                        const zombie = ZombieFactory.create(zombieGroup.type, row);
                        this.zombies.push(zombie);
                        this.waveSystem.zombiesInWave.push(zombie);
                    }
                }, delay);
                currentDelay += zombieGroup.interval;
            }
        });
    }

    updatePlants(deltaTime) {
        this.plants.forEach(plant => {
            if (plant.markedForDeletion) return;
            
            let result = null;
            
            if (plant instanceof Peashooter || plant instanceof SnowPea) {
                result = plant.update(deltaTime, this.zombies);
                if (result instanceof Projectile) {
                    this.projectiles.push(result);
                }
            } else if (plant instanceof Sunflower) {
                result = plant.update(deltaTime);
                if (result instanceof Sun) {
                    this.suns.push(result);
                }
            } else if (plant instanceof CherryBomb) {
                result = plant.update(deltaTime);
                if (result === true) {
                    // 爆炸
                    const explosionData = plant.getExplosionData();
                    this.createExplosion(explosionData.x, explosionData.y, explosionData.radius, explosionData.damage);
                }
            } else {
                plant.update(deltaTime);
            }
        });
        
        // 移除死亡的植物
        this.plants = this.plants.filter(plant => !plant.markedForDeletion);
        
        // 更新植物网格
        this.updatePlantGrid();
    }

    updateZombies(deltaTime) {
        this.zombies.forEach(zombie => {
            if (zombie.markedForDeletion) return;
            
            const result = zombie.update(deltaTime, this.plants);
            
            if (result) {
                if (result.action === 'eat') {
                    // 僵尸吃植物
                    const plantKilled = result.plant.takeDamage(result.damage);
                    if (plantKilled) {
                        // 植物被吃掉，从网格中移除
                        delete this.plantGrid[`${result.plant.col},${result.plant.row}`];
                    }
                } else if (result.action === 'reach_house') {
                    // 僵尸到达房子，游戏失败
                    this.gameOver(false);
                }
            }
        });
        
        // 移除死亡的僵尸
        this.zombies = this.zombies.filter(zombie => !zombie.markedForDeletion);
    }

    updateProjectiles(deltaTime) {
        this.projectiles.forEach(projectile => {
            if (projectile.markedForDeletion) return;
            
            projectile.update(deltaTime);
            
            // 检查碰撞
            for (const zombie of this.zombies) {
                if (zombie.markedForDeletion) continue;
                
                if (checkCollision(projectile.getBounds(), zombie.getBounds())) {
                    const isSlow = projectile.type === 'snowpea';
                    const killed = zombie.takeDamage(projectile.damage, isSlow);
                    
                    // 显示伤害数字
                    this.damageNumbers.push(new DamageNumber(
                        zombie.x + zombie.width / 2,
                        zombie.y,
                        projectile.damage,
                        false
                    ));
                    
                    if (killed) {
                        particleSystem.emitExplosion(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, '#8B4513');
                    }
                    
                    projectile.destroy();
                    break;
                }
            }
        });
        
        // 移除超出边界或碰撞的投射物
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    updateSuns(deltaTime) {
        this.suns.forEach(sun => {
            sun.update(deltaTime);
        });
        
        // 移除已收集的阳光
        this.suns = this.suns.filter(sun => !sun.markedForDeletion);
    }

    updateExplosions(deltaTime) {
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });
        
        // 移除消失的爆炸
        this.explosions = this.explosions.filter(e => !e.markedForDeletion);
    }

    updateDamageNumbers(deltaTime) {
        this.damageNumbers.forEach(dn => {
            dn.update(deltaTime);
        });
        
        // 移除消失的伤害数字
        this.damageNumbers = this.damageNumbers.filter(dn => !dn.markedForDeletion);
    }

    createExplosion(x, y, radius, damage) {
        this.explosions.push(new Explosion(x, y, radius, damage));
        
        // 对范围内僵尸造成伤害
        this.zombies.forEach(zombie => {
            if (zombie.markedForDeletion) return;
            
            const dx = (zombie.x + zombie.width / 2) - x;
            const dy = (zombie.y + zombie.height / 2) - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                const killed = zombie.takeDamage(damage);
                
                // 显示伤害数字
                this.damageNumbers.push(new DamageNumber(
                    zombie.x + zombie.width / 2,
                    zombie.y,
                    damage,
                    true
                ));
                
                if (killed) {
                    particleSystem.emitExplosion(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, '#FF6347');
                }
            }
        });
        
        // 爆炸粒子效果
        particleSystem.emitExplosion(x, y, '#FFD700', 50);
    }

    updatePlantGrid() {
        this.plantGrid = {};
        this.plants.forEach(plant => {
            if (!plant.markedForDeletion) {
                this.plantGrid[`${plant.col},${plant.row}`] = plant;
            }
        });
    }

    checkGameOver() {
        // 检查是否有僵尸到达最左侧
        for (const zombie of this.zombies) {
            if (zombie.x < GAME_CONFIG.LAWN_X - 50) {
                this.gameOver(false);
                return;
            }
        }
    }

    handleCanvasClick(e) {
        if (this.state !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了阳光
        for (let i = this.suns.length - 1; i >= 0; i--) {
            if (this.suns[i].containsPoint(x, y)) {
                const value = this.suns[i].collect();
                this.sun += value;
                this.updateUI();
                return;
            }
        }
        
        // 检查是否点击了草坪格子
        const cell = getCellFromPosition(x, y);
        if (cell && this.selectedPlant) {
            this.plantPlant(cell.col, cell.row);
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        this.hoverCell = getCellFromPosition(this.mouseX, this.mouseY);
    }

    handlePlantCardClick(e) {
        const card = e.currentTarget;
        const plantType = card.dataset.plant;
        
        if (this.cooldownManager.isReady(plantType)) {
            const config = GAME_CONFIG.PLANTS[plantType];
            if (this.sun >= config.cost) {
                // 取消选择
                if (this.selectedPlant === plantType) {
                    this.selectedPlant = null;
                    document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                } else {
                    // 选择新植物
                    this.selectedPlant = plantType;
                    document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                }
            }
        }
    }

    plantPlant(col, row) {
        if (!this.selectedPlant) return;
        
        // 检查格子是否已被占用
        if (this.plantGrid[`${col},${row}`]) return;
        
        const config = GAME_CONFIG.PLANTS[this.selectedPlant];
        if (this.sun >= config.cost) {
            // 扣除阳光
            this.sun -= config.cost;
            
            // 创建植物
            const plant = PlantFactory.create(this.selectedPlant, col, row);
            if (plant) {
                this.plants.push(plant);
                this.plantGrid[`${col},${row}`] = plant;
                
                // 开始冷却
                this.cooldownManager.start(this.selectedPlant, config.cooldown);
                
                // 取消选择
                this.selectedPlant = null;
                document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                
                this.updateUI();
            }
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制草坪
        this.drawLawn();
        
        // 绘制植物
        this.plants.forEach(plant => plant.draw(this.ctx));
        
        // 绘制僵尸
        this.zombies.forEach(zombie => zombie.draw(this.ctx));
        
        // 绘制投射物
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        
        // 绘制阳光
        this.suns.forEach(sun => sun.draw(this.ctx));
        
        // 绘制爆炸
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        
        // 绘制伤害数字
        this.damageNumbers.forEach(dn => dn.draw(this.ctx));
        
        // 绘制粒子
        particleSystem.draw(this.ctx);
        
        // 绘制悬停效果
        this.drawHoverEffect();
        
        // 绘制拖拽的植物
        this.drawDraggingPlant();
    }

    drawBackground() {
        // 绘制天空渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0E0E6');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵
        this.drawClouds();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const time = Date.now() / 1000;
        
        // 云朵1
        let x = (time * 10) % (this.canvas.width + 200) - 100;
        this.drawCloud(x, 50, 60);
        
        // 云朵2
        x = (time * 8 + 300) % (this.canvas.width + 200) - 100;
        this.drawCloud(x, 100, 40);
        
        // 云朵3
        x = (time * 12 + 600) % (this.canvas.width + 200) - 100;
        this.drawCloud(x, 30, 50);
    }

    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.8, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLawn() {
        const config = GAME_CONFIG;
        
        // 绘制草坪背景
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(config.LAWN_X, config.LAWN_Y, 
            config.COLS * config.CELL_WIDTH, 
            config.ROWS * config.CELL_HEIGHT);
        
        // 绘制格子
        for (let row = 0; row < config.ROWS; row++) {
            for (let col = 0; col < config.COLS; col++) {
                const x = config.LAWN_X + col * config.CELL_WIDTH;
                const y = config.LAWN_Y + row * config.CELL_HEIGHT;
                
                // 交替颜色
                if ((row + col) % 2 === 0) {
                    this.ctx.fillStyle = 'rgba(144, 238, 144, 0.3)';
                } else {
                    this.ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
                }
                this.ctx.fillRect(x, y, config.CELL_WIDTH, config.CELL_HEIGHT);
                
                // 绘制边框
                this.ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, config.CELL_WIDTH, config.CELL_HEIGHT);
            }
        }
        
        // 绘制割草机区域
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(config.LAWN_X - 60, config.LAWN_Y, 50, config.ROWS * config.CELL_HEIGHT);
        
        // 绘制割草机
        for (let row = 0; row < config.ROWS; row++) {
            const y = config.LAWN_Y + row * config.CELL_HEIGHT + config.CELL_HEIGHT / 2;
            this.drawLawnMower(config.LAWN_X - 35, y);
        }
    }

    drawLawnMower(x, y) {
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚜', x, y);
    }

    drawHoverEffect() {
        if (this.hoverCell && this.selectedPlant) {
            const pos = getCellPosition(this.hoverCell.col, this.hoverCell.row);
            const config = GAME_CONFIG.PLANTS[this.selectedPlant];
            
            // 检查是否可以种植
            const canPlant = !this.plantGrid[`${this.hoverCell.col},${this.hoverCell.row}`];
            
            this.ctx.fillStyle = canPlant ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(pos.x, pos.y, GAME_CONFIG.CELL_WIDTH, GAME_CONFIG.CELL_HEIGHT);
            
            // 绘制预览
            this.ctx.globalAlpha = 0.5;
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(config.emoji, 
                pos.x + GAME_CONFIG.CELL_WIDTH / 2, 
                pos.y + GAME_CONFIG.CELL_HEIGHT / 2);
            this.ctx.globalAlpha = 1;
        }
    }

    drawDraggingPlant() {
        if (this.selectedPlant) {
            const config = GAME_CONFIG.PLANTS[this.selectedPlant];
            
            this.ctx.globalAlpha = 0.7;
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(config.emoji, this.mouseX, this.mouseY);
            this.ctx.globalAlpha = 1;
        }
    }

    updateUI() {
        // 更新阳光显示
        document.getElementById('sunCount').textContent = this.sun;
        
        // 更新关卡信息
        document.getElementById('currentLevel').textContent = `关卡 ${this.level}`;
        document.getElementById('waveInfo').textContent = `波次: ${this.wave}/${this.maxWaves}`;
        
        // 更新进度条
        const progress = (this.wave / this.maxWaves) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        
        // 更新植物卡片状态
        document.querySelectorAll('.plant-card').forEach(card => {
            const plantType = card.dataset.plant;
            const config = GAME_CONFIG.PLANTS[plantType];
            
            // 检查阳光是否足够
            if (this.sun < config.cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
            
            // 检查冷却
            if (!this.cooldownManager.isReady(plantType)) {
                card.classList.add('cooling');
                const progress = this.cooldownManager.getProgress(plantType);
                const overlay = card.querySelector('.cooldown-overlay');
                overlay.style.height = `${(1 - progress) * 100}%`;
            } else {
                card.classList.remove('cooling');
            }
        });
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
            cancelAnimationFrame(this.animationId);
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    gameOver(victory) {
        this.state = victory ? 'victory' : 'gameover';
        cancelAnimationFrame(this.animationId);
        
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (victory) {
            title.textContent = '🎉 胜利！';
            title.style.color = '#FFD700';
            message.textContent = `恭喜你完成了关卡 ${this.level}！`;
        } else {
            title.textContent = '💀 游戏结束';
            title.style.color = '#8B0000';
            message.textContent = '僵尸吃掉了你的脑子！';
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    victory() {
        this.gameOver(true);
    }

    restartGame() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.startGame(this.level);
    }

    returnToMenu() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.showScreen('startScreen');
        this.state = 'menu';
    }

    quitGame() {
        this.returnToMenu();
    }
}
