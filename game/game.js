const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_COLS = 9;
const GRID_ROWS = 5;
const CELL_WIDTH = 80;
const CELL_HEIGHT = 100;
const GRID_OFFSET_X = 80;
const GRID_OFFSET_Y = 80;
const UI_HEIGHT = 80;

const PLANT_TYPES = {
    PEASHOOTER: {
        name: '豌豆射手',
        cost: 100,
        cooldown: 5000,
        health: 100,
        icon: '🌱',
        color: '#4CAF50'
    },
    SUNFLOWER: {
        name: '向日葵',
        cost: 50,
        cooldown: 5000,
        health: 80,
        icon: '🌻',
        color: '#FFEB3B'
    },
    WALLNUT: {
        name: '坚果墙',
        cost: 50,
        cooldown: 20000,
        health: 400,
        icon: '🥜',
        color: '#8B4513'
    },
    CHERRYBOMB: {
        name: '樱桃炸弹',
        cost: 150,
        cooldown: 30000,
        health: 50,
        icon: '🍒',
        color: '#DC143C'
    },
    SNOWPEA: {
        name: '寒冰射手',
        cost: 175,
        cooldown: 5000,
        health: 100,
        icon: '❄️',
        color: '#00BCD4'
    }
};

const ZOMBIE_TYPES = {
    NORMAL: {
        name: '普通僵尸',
        health: 100,
        speed: 0.3,
        damage: 20,
        icon: '🧟',
        color: '#7B8B6F'
    },
    CONE: {
        name: '路障僵尸',
        health: 200,
        speed: 0.3,
        damage: 20,
        icon: '🧟‍♂️',
        color: '#FF8C00'
    },
    BUCKET: {
        name: '铁桶僵尸',
        health: 400,
        speed: 0.25,
        damage: 20,
        icon: '🧟‍♀️',
        color: '#708090'
    },
    NEWSPAPER: {
        name: '读报僵尸',
        health: 150,
        speed: 0.2,
        damage: 25,
        icon: '📰',
        color: '#D2691E',
        enraged: false,
        enragedSpeed: 0.6
    },
    FOOTBALL: {
        name: '橄榄球僵尸',
        health: 500,
        speed: 0.5,
        damage: 30,
        icon: '🏈',
        color: '#2F4F4F'
    }
};

const LEVELS = [
    {
        id: 1,
        name: '第一天',
        waves: [
            { zombies: [{ type: 'NORMAL', count: 3, delay: 0 }], delay: 10000 },
            { zombies: [{ type: 'NORMAL', count: 5, delay: 0 }], delay: 20000 },
            { zombies: [{ type: 'NORMAL', count: 5, delay: 0 }, { type: 'CONE', count: 2, delay: 5000 }], delay: 25000 }
        ],
        startSun: 150,
        availablePlants: ['PEASHOOTER', 'SUNFLOWER', 'WALLNUT']
    },
    {
        id: 2,
        name: '第二天',
        waves: [
            { zombies: [{ type: 'NORMAL', count: 5, delay: 0 }, { type: 'CONE', count: 3, delay: 3000 }], delay: 10000 },
            { zombies: [{ type: 'CONE', count: 5, delay: 0 }, { type: 'BUCKET', count: 1, delay: 5000 }], delay: 20000 },
            { zombies: [{ type: 'NORMAL', count: 8, delay: 0 }, { type: 'BUCKET', count: 2, delay: 8000 }], delay: 25000 }
        ],
        startSun: 100,
        availablePlants: ['PEASHOOTER', 'SUNFLOWER', 'WALLNUT', 'CHERRYBOMB']
    },
    {
        id: 3,
        name: '第三天',
        waves: [
            { zombies: [{ type: 'NORMAL', count: 6, delay: 0 }, { type: 'CONE', count: 4, delay: 2000 }], delay: 8000 },
            { zombies: [{ type: 'NEWSPAPER', count: 4, delay: 0 }, { type: 'BUCKET', count: 2, delay: 5000 }], delay: 18000 },
            { zombies: [{ type: 'CONE', count: 6, delay: 0 }, { type: 'BUCKET', count: 3, delay: 5000 }, { type: 'NEWSPAPER', count: 3, delay: 8000 }], delay: 22000 }
        ],
        startSun: 100,
        availablePlants: ['PEASHOOTER', 'SUNFLOWER', 'WALLNUT', 'CHERRYBOMB', 'SNOWPEA']
    },
    {
        id: 4,
        name: '第四天',
        waves: [
            { zombies: [{ type: 'BUCKET', count: 3, delay: 0 }, { type: 'NEWSPAPER', count: 5, delay: 3000 }], delay: 8000 },
            { zombies: [{ type: 'FOOTBALL', count: 2, delay: 0 }, { type: 'BUCKET', count: 3, delay: 5000 }], delay: 18000 },
            { zombies: [{ type: 'FOOTBALL', count: 3, delay: 0 }, { type: 'NEWSPAPER', count: 5, delay: 3000 }, { type: 'BUCKET', count: 4, delay: 8000 }], delay: 25000 }
        ],
        startSun: 150,
        availablePlants: ['PEASHOOTER', 'SUNFLOWER', 'WALLNUT', 'CHERRYBOMB', 'SNOWPEA']
    },
    {
        id: 5,
        name: '最终之战',
        waves: [
            { zombies: [{ type: 'FOOTBALL', count: 3, delay: 0 }, { type: 'BUCKET', count: 4, delay: 2000 }], delay: 6000 },
            { zombies: [{ type: 'FOOTBALL', count: 4, delay: 0 }, { type: 'NEWSPAPER', count: 6, delay: 2000 }], delay: 15000 },
            { zombies: [{ type: 'FOOTBALL', count: 5, delay: 0 }, { type: 'BUCKET', count: 5, delay: 2000 }, { type: 'NEWSPAPER', count: 5, delay: 5000 }], delay: 20000 },
            { zombies: [{ type: 'FOOTBALL', count: 6, delay: 0 }, { type: 'BUCKET', count: 6, delay: 2000 }, { type: 'NEWSPAPER', count: 6, delay: 4000 }, { type: 'CONE', count: 8, delay: 6000 }], delay: 25000 }
        ],
        startSun: 200,
        availablePlants: ['PEASHOOTER', 'SUNFLOWER', 'WALLNUT', 'CHERRYBOMB', 'SNOWPEA']
    }
];

class Game {
    constructor() {
        this.sun = 50;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.lawnmowers = [];
        this.selectedPlant = null;
        this.currentLevel = 0;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.gameState = 'menu';
        this.lastTime = 0;
        this.sunDropTimer = 0;
        this.waveTimer = 0;
        this.zombieSpawnQueue = [];
        this.unlockedLevels = parseInt(localStorage.getItem('unlockedLevels') || '1');
        this.cooldowns = {};
        this.totalWaves = 0;
        this.completedWaves = 0;
        
        this.initUI();
        this.initEventListeners();
        this.gameLoop();
    }
    
    initUI() {
        const plantCardsContainer = document.getElementById('plantCards');
        plantCardsContainer.innerHTML = '';
        
        Object.keys(PLANT_TYPES).forEach(type => {
            const plant = PLANT_TYPES[type];
            const card = document.createElement('div');
            card.className = 'plantCard';
            card.dataset.type = type;
            card.innerHTML = `
                <div class="icon">${plant.icon}</div>
                <div class="cost">${plant.cost}</div>
                <div class="cooldownOverlay" style="height: 0%"></div>
            `;
            plantCardsContainer.appendChild(card);
        });
        
        const levelButtons = document.getElementById('levelButtons');
        levelButtons.innerHTML = '';
        for (let i = 1; i <= LEVELS.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'menuBtn levelBtn' + (i > this.unlockedLevels ? ' locked' : '');
            btn.textContent = i;
            btn.dataset.level = i;
            if (i <= this.unlockedLevels) {
                btn.addEventListener('click', () => this.startLevel(i - 1));
            }
            levelButtons.appendChild(btn);
        }
    }
    
    initEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startLevel(0);
        });
        
        document.getElementById('selectLevelBtn').addEventListener('click', () => {
            document.getElementById('menuScreen').classList.add('hidden');
            document.getElementById('levelSelectScreen').classList.remove('hidden');
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            document.getElementById('levelSelectScreen').classList.add('hidden');
            document.getElementById('menuScreen').classList.remove('hidden');
        });
        
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startLevel(this.currentLevel);
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('menuBtn2').addEventListener('click', () => this.showMenu());
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            if (this.currentLevel < LEVELS.length - 1) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.showMenu();
            }
        });
        
        document.querySelectorAll('.plantCard').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = card.dataset.type;
                const level = LEVELS[this.currentLevel];
                if (!level.availablePlants.includes(type)) return;
                if (this.cooldowns[type] > 0) return;
                if (this.sun < PLANT_TYPES[type].cost) return;
                
                document.querySelectorAll('.plantCard').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedPlant = type;
            });
        });
        
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    handleClick(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = this.suns.length - 1; i >= 0; i--) {
            const sun = this.suns[i];
            const dx = x - sun.x;
            const dy = y - sun.y;
            if (dx * dx + dy * dy < 900) {
                this.sun += 25;
                this.suns.splice(i, 1);
                this.updateSunDisplay();
                return;
            }
        }
        
        if (this.selectedPlant) {
            const gridX = Math.floor((x - GRID_OFFSET_X) / CELL_WIDTH);
            const gridY = Math.floor((y - GRID_OFFSET_Y) / CELL_HEIGHT);
            
            if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
                if (!this.getPlantAt(gridX, gridY)) {
                    this.plantSeed(this.selectedPlant, gridX, gridY);
                }
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('menuScreen').classList.remove('hidden');
        document.getElementById('levelSelectScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('victoryScreen').classList.add('hidden');
        this.initUI();
    }
    
    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const level = LEVELS[levelIndex];
        
        this.sun = level.startSun;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.selectedPlant = null;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.sunDropTimer = 0;
        this.waveTimer = 0;
        this.zombieSpawnQueue = [];
        this.cooldowns = {};
        this.totalWaves = level.waves.length;
        this.completedWaves = 0;
        
        this.lawnmowers = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.lawnmowers.push({
                row: row,
                x: GRID_OFFSET_X - 60,
                y: GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2,
                active: false,
                used: false
            });
        }
        
        document.querySelectorAll('.plantCard').forEach(card => {
            const type = card.dataset.type;
            if (!level.availablePlants.includes(type)) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
            card.classList.remove('selected');
        });
        
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('levelSelectScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('victoryScreen').classList.add('hidden');
        
        document.getElementById('levelInfo').textContent = `关卡 ${level.id}: ${level.name}`;
        this.updateSunDisplay();
        this.updateWaveProgress();
        
        this.gameState = 'playing';
    }
    
    plantSeed(type, gridX, gridY) {
        const plantData = PLANT_TYPES[type];
        if (this.sun < plantData.cost) return;
        
        this.sun -= plantData.cost;
        this.updateSunDisplay();
        
        const x = GRID_OFFSET_X + gridX * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_OFFSET_Y + gridY * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        let plant;
        switch (type) {
            case 'PEASHOOTER':
                plant = new Peashooter(x, y, gridX, gridY);
                break;
            case 'SUNFLOWER':
                plant = new Sunflower(x, y, gridX, gridY);
                break;
            case 'WALLNUT':
                plant = new WallNut(x, y, gridX, gridY);
                break;
            case 'CHERRYBOMB':
                plant = new CherryBomb(x, y, gridX, gridY);
                break;
            case 'SNOWPEA':
                plant = new SnowPea(x, y, gridX, gridY);
                break;
        }
        
        if (plant) {
            this.plants.push(plant);
            this.cooldowns[type] = plantData.cooldown;
        }
        
        document.querySelectorAll('.plantCard').forEach(c => c.classList.remove('selected'));
        this.selectedPlant = null;
    }
    
    getPlantAt(gridX, gridY) {
        return this.plants.find(p => p.gridX === gridX && p.gridY === gridY);
    }
    
    updateSunDisplay() {
        document.getElementById('sunCounter').textContent = `☀️ ${this.sun}`;
        
        document.querySelectorAll('.plantCard').forEach(card => {
            const type = card.dataset.type;
            const cost = PLANT_TYPES[type].cost;
            if (this.sun < cost || this.cooldowns[type] > 0) {
                card.classList.add('disabled');
            } else {
                const level = LEVELS[this.currentLevel];
                if (level.availablePlants.includes(type)) {
                    card.classList.remove('disabled');
                }
            }
        });
    }
    
    updateWaveProgress() {
        const progress = (this.completedWaves / this.totalWaves) * 100;
        document.getElementById('waveProgressBar').style.width = `${progress}%`;
    }
    
    spawnZombie(type, row) {
        const zombieData = ZOMBIE_TYPES[type];
        const x = canvas.width + 50;
        const y = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        let zombie;
        switch (type) {
            case 'NORMAL':
                zombie = new NormalZombie(x, y, row);
                break;
            case 'CONE':
                zombie = new ConeZombie(x, y, row);
                break;
            case 'BUCKET':
                zombie = new BucketZombie(x, y, row);
                break;
            case 'NEWSPAPER':
                zombie = new NewspaperZombie(x, y, row);
                break;
            case 'FOOTBALL':
                zombie = new FootballZombie(x, y, row);
                break;
        }
        
        if (zombie) {
            this.zombies.push(zombie);
        }
    }
    
    startWave(waveIndex) {
        const level = LEVELS[this.currentLevel];
        if (waveIndex >= level.waves.length) return;
        
        this.waveInProgress = true;
        const wave = level.waves[waveIndex];
        
        wave.zombies.forEach(zombieGroup => {
            for (let i = 0; i < zombieGroup.count; i++) {
                this.zombieSpawnQueue.push({
                    type: zombieGroup.type,
                    delay: zombieGroup.delay + i * 2000,
                    timer: 0
                });
            }
        });
    }
    
    gameLoop() {
        const now = Date.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        this.sunDropTimer += deltaTime;
        if (this.sunDropTimer >= 10000) {
            this.sunDropTimer = 0;
            this.dropSun();
        }
        
        Object.keys(this.cooldowns).forEach(type => {
            if (this.cooldowns[type] > 0) {
                this.cooldowns[type] -= deltaTime;
                if (this.cooldowns[type] < 0) this.cooldowns[type] = 0;
                
                const card = document.querySelector(`.plantCard[data-type="${type}"]`);
                if (card) {
                    const overlay = card.querySelector('.cooldownOverlay');
                    const percent = (this.cooldowns[type] / PLANT_TYPES[type].cooldown) * 100;
                    overlay.style.height = `${percent}%`;
                }
            }
        });
        
        if (!this.waveInProgress && this.zombieSpawnQueue.length === 0 && this.zombies.length === 0) {
            this.waveTimer += deltaTime;
            const level = LEVELS[this.currentLevel];
            const waveDelay = level.waves[this.currentWave]?.delay || 20000;
            
            if (this.waveTimer >= waveDelay) {
                this.waveTimer = 0;
                if (this.currentWave < level.waves.length) {
                    this.startWave(this.currentWave);
                }
            }
        }
        
        for (let i = this.zombieSpawnQueue.length - 1; i >= 0; i--) {
            const spawn = this.zombieSpawnQueue[i];
            spawn.timer += deltaTime;
            if (spawn.timer >= spawn.delay) {
                const row = Math.floor(Math.random() * GRID_ROWS);
                this.spawnZombie(spawn.type, row);
                this.zombieSpawnQueue.splice(i, 1);
            }
        }
        
        if (this.zombieSpawnQueue.length === 0 && this.waveInProgress) {
            if (this.zombies.length === 0) {
                this.waveInProgress = false;
                this.completedWaves++;
                this.updateWaveProgress();
                this.currentWave++;
                
                const level = LEVELS[this.currentLevel];
                if (this.currentWave >= level.waves.length) {
                    this.victory();
                }
            }
        }
        
        this.plants.forEach(plant => plant.update(deltaTime, this));
        this.zombies.forEach(zombie => zombie.update(deltaTime, this));
        this.projectiles.forEach(proj => proj.update(deltaTime, this));
        this.suns.forEach(sun => sun.update(deltaTime));
        this.lawnmowers.forEach(lm => {
            if (lm.active) {
                lm.x += 5;
                this.zombies.forEach(zombie => {
                    if (zombie.row === lm.row && Math.abs(zombie.x - lm.x) < 40) {
                        zombie.health = 0;
                    }
                });
                if (lm.x > canvas.width + 100) {
                    lm.used = true;
                    lm.active = false;
                }
            }
        });
        
        this.lawnmowers = this.lawnmowers.filter(lm => !lm.used);
        
        this.plants = this.plants.filter(p => p.health > 0);
        this.zombies = this.zombies.filter(z => z.health > 0);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.suns = this.suns.filter(s => s.active);
        
        for (let zombie of this.zombies) {
            if (zombie.x < GRID_OFFSET_X - 30) {
                const lm = this.lawnmowers.find(l => l.row === zombie.row && !l.active && !l.used);
                if (lm) {
                    lm.active = true;
                } else if (zombie.x < 30) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    dropSun() {
        const x = GRID_OFFSET_X + Math.random() * (GRID_COLS * CELL_WIDTH);
        const sun = new Sun(x, -30, true);
        this.suns.push(sun);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    victory() {
        this.gameState = 'victory';
        
        if (this.currentLevel + 1 > this.unlockedLevels - 1) {
            this.unlockedLevels = Math.min(this.currentLevel + 2, LEVELS.length);
            localStorage.setItem('unlockedLevels', this.unlockedLevels.toString());
        }
        
        const level = LEVELS[this.currentLevel];
        if (this.currentLevel >= LEVELS.length - 1) {
            document.getElementById('victoryText').textContent = '恭喜你通关所有关卡！';
            document.getElementById('nextLevelBtn').classList.add('hidden');
        } else {
            document.getElementById('victoryText').textContent = `关卡 ${level.id} 完成！`;
            document.getElementById('nextLevelBtn').classList.remove('hidden');
        }
        
        document.getElementById('victoryScreen').classList.remove('hidden');
    }
    
    render() {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.drawLawn();
        
        if (this.selectedPlant && this.gameState === 'playing') {
            this.drawPlantPreview();
        }
        
        this.lawnmowers.forEach(lm => this.drawLawnmower(lm));
        this.plants.forEach(plant => plant.render(ctx));
        this.zombies.forEach(zombie => zombie.render(ctx));
        this.projectiles.forEach(proj => proj.render(ctx));
        this.suns.forEach(sun => sun.render(ctx));
    }
    
    drawLawn() {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = GRID_OFFSET_X + col * CELL_WIDTH;
                const y = GRID_OFFSET_Y + row * CELL_HEIGHT;
                
                if ((row + col) % 2 === 0) {
                    ctx.fillStyle = '#7CBA3D';
                } else {
                    ctx.fillStyle = '#8FD14F';
                }
                ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
                
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);
            }
        }
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, GRID_OFFSET_Y, GRID_OFFSET_X - 10, GRID_ROWS * CELL_HEIGHT);
    }
    
    drawLawnmower(lm) {
        ctx.save();
        ctx.translate(lm.x, lm.y);
        
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(-20, -15, 40, 30);
        
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, 15, 8, 0, Math.PI * 2);
        ctx.arc(10, 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#666';
        ctx.fillRect(-15, -25, 30, 10);
        
        ctx.restore();
    }
    
    drawPlantPreview() {
        const gridX = Math.floor((this.mouseX - GRID_OFFSET_X) / CELL_WIDTH);
        const gridY = Math.floor((this.mouseY - GRID_OFFSET_Y) / CELL_HEIGHT);
        
        if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
            const x = GRID_OFFSET_X + gridX * CELL_WIDTH + CELL_WIDTH / 2;
            const y = GRID_OFFSET_Y + gridY * CELL_HEIGHT + CELL_HEIGHT / 2;
            
            ctx.globalAlpha = 0.5;
            const plantData = PLANT_TYPES[this.selectedPlant];
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(plantData.icon, x, y);
            ctx.globalAlpha = 1;
        }
    }
}

class Plant {
    constructor(x, y, gridX, gridY, type) {
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.health = PLANT_TYPES[type].health;
        this.maxHealth = this.health;
    }
    
    update(deltaTime, game) {}
    
    render(ctx) {
        const plantData = PLANT_TYPES[this.type];
        
        ctx.fillStyle = plantData.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plantData.icon, this.x, this.y);
        
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - 25, this.y - 40, 50, 6);
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
            ctx.fillRect(this.x - 25, this.y - 40, 50 * healthPercent, 6);
        }
    }
}

class Peashooter extends Plant {
    constructor(x, y, gridX, gridY) {
        super(x, y, gridX, gridY, 'PEASHOOTER');
        this.shootTimer = 0;
        this.shootInterval = 1500;
    }
    
    update(deltaTime, game) {
        this.shootTimer += deltaTime;
        
        const hasZombieInRow = game.zombies.some(z => 
            z.row === this.gridY && z.x > this.x
        );
        
        if (hasZombieInRow && this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            game.projectiles.push(new Pea(this.x + 30, this.y, this.gridY));
        }
    }
}

class Sunflower extends Plant {
    constructor(x, y, gridX, gridY) {
        super(x, y, gridX, gridY, 'SUNFLOWER');
        this.sunTimer = 0;
        this.sunInterval = 24000;
        this.animOffset = Math.random() * Math.PI * 2;
    }
    
    update(deltaTime, game) {
        this.sunTimer += deltaTime;
        if (this.sunTimer >= this.sunInterval) {
            this.sunTimer = 0;
            game.suns.push(new Sun(this.x, this.y - 20, false));
        }
    }
    
    render(ctx) {
        const wobble = Math.sin(Date.now() / 300 + this.animOffset) * 3;
        
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(this.x, this.y + wobble, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌻', this.x, this.y + wobble);
        
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - 25, this.y - 40, 50, 6);
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
            ctx.fillRect(this.x - 25, this.y - 40, 50 * healthPercent, 6);
        }
    }
}

class WallNut extends Plant {
    constructor(x, y, gridX, gridY) {
        super(x, y, gridX, gridY, 'WALLNUT');
    }
    
    render(ctx) {
        const healthPercent = this.health / this.maxHealth;
        let color = '#8B4513';
        
        if (healthPercent < 0.33) {
            color = '#654321';
        } else if (healthPercent < 0.66) {
            color = '#7B3F00';
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 28, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🥜', this.x, this.y);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 25, this.y - 45, 50, 6);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(this.x - 25, this.y - 45, 50 * healthPercent, 6);
    }
}

class CherryBomb extends Plant {
    constructor(x, y, gridX, gridY) {
        super(x, y, gridX, gridY, 'CHERRYBOMB');
        this.fuseTimer = 0;
        this.fuseTime = 1000;
        this.exploded = false;
    }
    
    update(deltaTime, game) {
        if (!this.exploded) {
            this.fuseTimer += deltaTime;
            if (this.fuseTimer >= this.fuseTime) {
                this.explode(game);
            }
        }
    }
    
    explode(game) {
        this.exploded = true;
        
        const explosionRadius = CELL_WIDTH * 1.5;
        
        game.zombies.forEach(zombie => {
            const dx = zombie.x - this.x;
            const dy = zombie.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < explosionRadius) {
                zombie.health = 0;
            }
        });
        
        this.health = 0;
    }
    
    render(ctx) {
        if (!this.exploded) {
            const shake = Math.sin(Date.now() / 50) * 3;
            
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(this.x - 12 + shake, this.y, 22, 0, Math.PI * 2);
            ctx.arc(this.x + 12 + shake, this.y, 22, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍒', this.x + shake, this.y);
        }
    }
}

class SnowPea extends Plant {
    constructor(x, y, gridX, gridY) {
        super(x, y, gridX, gridY, 'SNOWPEA');
        this.shootTimer = 0;
        this.shootInterval = 1500;
    }
    
    update(deltaTime, game) {
        this.shootTimer += deltaTime;
        
        const hasZombieInRow = game.zombies.some(z => 
            z.row === this.gridY && z.x > this.x
        );
        
        if (hasZombieInRow && this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            game.projectiles.push(new SnowPeaProjectile(this.x + 30, this.y, this.gridY));
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#00BCD4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄️', this.x, this.y);
        
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - 25, this.y - 40, 50, 6);
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
            ctx.fillRect(this.x - 25, this.y - 40, 50 * healthPercent, 6);
        }
    }
}

class Zombie {
    constructor(x, y, row, type) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.type = type;
        this.health = ZOMBIE_TYPES[type].health;
        this.maxHealth = this.health;
        this.speed = ZOMBIE_TYPES[type].speed;
        this.baseSpeed = this.speed;
        this.damage = ZOMBIE_TYPES[type].damage;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackInterval = 1000;
        this.slowTimer = 0;
        this.animOffset = Math.random() * Math.PI * 2;
    }
    
    update(deltaTime, game) {
        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime;
            this.speed = this.baseSpeed * 0.5;
        } else {
            this.speed = this.baseSpeed;
        }
        
        const plant = game.plants.find(p => 
            p.gridY === this.row && 
            Math.abs(p.x - this.x) < 40
        );
        
        if (plant) {
            this.attacking = true;
            this.attackTimer += deltaTime;
            if (this.attackTimer >= this.attackInterval) {
                this.attackTimer = 0;
                plant.health -= this.damage;
            }
        } else {
            this.attacking = false;
            this.x -= this.speed;
        }
    }
    
    render(ctx) {
        const zombieData = ZOMBIE_TYPES[this.type];
        const wobble = Math.sin(Date.now() / 200 + this.animOffset) * 2;
        
        ctx.save();
        ctx.translate(this.x, this.y + wobble);
        
        if (this.slowTimer > 0) {
            ctx.fillStyle = '#87CEEB';
        } else {
            ctx.fillStyle = zombieData.color;
        }
        
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zombieData.icon, 0, 0);
        
        ctx.restore();
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 25, this.y - 50, 50, 6);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(this.x - 25, this.y - 50, 50 * healthPercent, 6);
    }
}

class NormalZombie extends Zombie {
    constructor(x, y, row) {
        super(x, y, row, 'NORMAL');
    }
}

class ConeZombie extends Zombie {
    constructor(x, y, row) {
        super(x, y, row, 'CONE');
    }
    
    render(ctx) {
        super.render(ctx);
        
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 45);
        ctx.lineTo(this.x - 15, this.y - 25);
        ctx.lineTo(this.x + 15, this.y - 25);
        ctx.closePath();
        ctx.fill();
    }
}

class BucketZombie extends Zombie {
    constructor(x, y, row) {
        super(x, y, row, 'BUCKET');
    }
    
    render(ctx) {
        super.render(ctx);
        
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x - 18, this.y - 50, 36, 25);
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(this.x - 20, this.y - 52, 40, 5);
    }
}

class NewspaperZombie extends Zombie {
    constructor(x, y, row) {
        super(x, y, row, 'NEWSPAPER');
        this.enraged = false;
        this.hasNewspaper = true;
        this.newspaperHealth = 100;
    }
    
    update(deltaTime, game) {
        if (this.hasNewspaper && this.health < this.maxHealth - this.newspaperHealth) {
            this.hasNewspaper = false;
            this.enraged = true;
            this.speed = ZOMBIE_TYPES.NEWSPAPER.enragedSpeed;
            this.baseSpeed = this.speed;
        }
        
        super.update(deltaTime, game);
    }
    
    render(ctx) {
        const zombieData = ZOMBIE_TYPES[this.type];
        const wobble = Math.sin(Date.now() / 200 + this.animOffset) * 2;
        
        ctx.save();
        ctx.translate(this.x, this.y + wobble);
        
        if (this.enraged) {
            ctx.fillStyle = '#FF6347';
        } else if (this.slowTimer > 0) {
            ctx.fillStyle = '#87CEEB';
        } else {
            ctx.fillStyle = zombieData.color;
        }
        
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.enraged ? '😠' : '🧟', 0, 0);
        
        ctx.restore();
        
        if (this.hasNewspaper) {
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(this.x + 20, this.y - 20, 25, 35);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(this.x + 20, this.y - 20, 25, 35);
        }
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 25, this.y - 50, 50, 6);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(this.x - 25, this.y - 50, 50 * healthPercent, 6);
    }
}

class FootballZombie extends Zombie {
    constructor(x, y, row) {
        super(x, y, row, 'FOOTBALL');
    }
    
    render(ctx) {
        super.render(ctx);
        
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 35, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 30, this.y - 5, 12, 25);
    }
}

class Projectile {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.speed = 5;
        this.damage = 20;
        this.active = true;
    }
    
    update(deltaTime, game) {
        this.x += this.speed;
        
        if (this.x > canvas.width) {
            this.active = false;
            return;
        }
        
        for (let zombie of game.zombies) {
            if (zombie.row === this.row && Math.abs(zombie.x - this.x) < 30) {
                zombie.health -= this.damage;
                this.active = false;
                break;
            }
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Pea extends Projectile {
    constructor(x, y, row) {
        super(x, y, row);
    }
}

class SnowPeaProjectile extends Projectile {
    constructor(x, y, row) {
        super(x, y, row);
        this.damage = 20;
    }
    
    update(deltaTime, game) {
        this.x += this.speed;
        
        if (this.x > canvas.width) {
            this.active = false;
            return;
        }
        
        for (let zombie of game.zombies) {
            if (zombie.row === this.row && Math.abs(zombie.x - this.x) < 30) {
                zombie.health -= this.damage;
                zombie.slowTimer = 5000;
                this.active = false;
                break;
            }
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#00BCD4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#80DEEA';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Sun {
    constructor(x, y, falling) {
        this.x = x;
        this.y = y;
        this.falling = falling;
        this.targetY = falling ? GRID_OFFSET_Y + Math.random() * (GRID_ROWS * CELL_HEIGHT - 50) : y;
        this.active = true;
        this.lifetime = 10000;
        this.timer = 0;
        this.collected = false;
        this.animOffset = Math.random() * Math.PI * 2;
    }
    
    update(deltaTime) {
        if (this.falling && this.y < this.targetY) {
            this.y += 1;
        }
        
        this.timer += deltaTime;
        if (this.timer >= this.lifetime) {
            this.active = false;
        }
    }
    
    render(ctx) {
        const pulse = 1 + Math.sin(Date.now() / 200 + this.animOffset) * 0.1;
        const size = 25 * pulse;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '25px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☀️', this.x, this.y);
    }
}

const game = new Game();
