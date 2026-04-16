const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GameState = {
    sun: 50,
    currentLevel: 1,
    currentWave: 0,
    totalWaves: 0,
    isPlaying: false,
    isPaused: false,
    selectedPlant: null,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: [],
    particles: [],
    grid: [],
    lastTime: 0,
    waveTimer: 0,
    sunTimer: 0
};

const GRID_COLS = 9;
const GRID_ROWS = 5;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 100;
const GRID_OFFSET_X = 150;
const GRID_OFFSET_Y = 100;

const PLANT_TYPES = {
    sunflower: { name: '向日葵', cost: 50, cooldown: 5000, health: 100, sunProduction: 25, sunInterval: 5000, color: '#FFD700' },
    peashooter: { name: '豌豆射手', cost: 100, cooldown: 5000, health: 100, damage: 20, attackSpeed: 1500, color: '#4CAF50' },
    snowpea: { name: '寒冰射手', cost: 175, cooldown: 5000, health: 100, damage: 20, attackSpeed: 1500, slowEffect: 0.5, slowDuration: 3000, color: '#81D4FA' },
    wallnut: { name: '坚果墙', cost: 50, cooldown: 20000, health: 400, color: '#8D6E63' },
    cherrybomb: { name: '樱桃炸弹', cost: 150, cooldown: 30000, health: 100, explosionDamage: 1800, explosionRadius: 1.5, fuseTime: 1000, color: '#E53935' }
};

const ZOMBIE_TYPES = {
    normal: { name: '普通僵尸', health: 200, damage: 100, speed: 0.02, attackSpeed: 1000, color: '#795548' },
    flag: { name: '路障僵尸', health: 400, damage: 100, speed: 0.025, attackSpeed: 1000, color: '#FF9800' },
    bucket: { name: '铁桶僵尸', health: 800, damage: 100, speed: 0.018, attackSpeed: 1000, color: '#607D8B' },
    newspaper: { name: '读报僵尸', health: 350, damage: 150, speed: 0.02, rageSpeed: 0.05, attackSpeed: 800, color: '#3F51B5' },
    football: { name: '橄榄球僵尸', health: 1600, damage: 150, speed: 0.04, attackSpeed: 800, color: '#D32F2F' }
};

const LEVELS = {
    1: {
        name: '草坪入门',
        waves: [
            { delay: 5000, zombies: [{ type: 'normal', row: -1, count: 3 }] },
            { delay: 15000, zombies: [{ type: 'normal', row: -1, count: 5 }] },
            { delay: 15000, zombies: [{ type: 'normal', row: -1, count: 7 }] }
        ]
    },
    2: {
        name: '路障来袭',
        waves: [
            { delay: 5000, zombies: [{ type: 'normal', row: -1, count: 4 }] },
            { delay: 12000, zombies: [{ type: 'flag', row: -1, count: 3 }, { type: 'normal', row: -1, count: 2 }] },
            { delay: 15000, zombies: [{ type: 'flag', row: -1, count: 5 }] },
            { delay: 15000, zombies: [{ type: 'flag', row: -1, count: 4 }, { type: 'normal', row: -1, count: 4 }] }
        ]
    },
    3: {
        name: '铁桶先锋',
        waves: [
            { delay: 5000, zombies: [{ type: 'flag', row: -1, count: 5 }] },
            { delay: 12000, zombies: [{ type: 'bucket', row: -1, count: 2 }, { type: 'flag', row: -1, count: 3 }] },
            { delay: 15000, zombies: [{ type: 'bucket', row: -1, count: 4 }] },
            { delay: 15000, zombies: [{ type: 'bucket', row: -1, count: 3 }, { type: 'flag', row: -1, count: 5 }] }
        ]
    },
    4: {
        name: '疯狂读报',
        waves: [
            { delay: 5000, zombies: [{ type: 'bucket', row: -1, count: 3 }] },
            { delay: 12000, zombies: [{ type: 'newspaper', row: -1, count: 4 }] },
            { delay: 15000, zombies: [{ type: 'newspaper', row: -1, count: 5 }, { type: 'bucket', row: -1, count: 2 }] },
            { delay: 15000, zombies: [{ type: 'newspaper', row: -1, count: 6 }, { type: 'flag', row: -1, count: 4 }] }
        ]
    },
    5: {
        name: '终极对决',
        waves: [
            { delay: 5000, zombies: [{ type: 'bucket', row: -1, count: 4 }, { type: 'newspaper', row: -1, count: 3 }] },
            { delay: 12000, zombies: [{ type: 'football', row: -1, count: 2 }] },
            { delay: 15000, zombies: [{ type: 'football', row: -1, count: 2 }, { type: 'bucket', row: -1, count: 4 }] },
            { delay: 15000, zombies: [{ type: 'football', row: -1, count: 3 }, { type: 'newspaper', row: -1, count: 5 }] },
            { delay: 20000, zombies: [{ type: 'football', row: -1, count: 5 }, { type: 'bucket', row: -1, count: 5 }, { type: 'newspaper', row: -1, count: 5 }] }
        ]
    }
};

const plantCooldowns = {};

function initGrid() {
    GameState.grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        GameState.grid[row] = [];
        for (let col = 0; col < GRID_COLS; col++) {
            GameState.grid[row][col] = null;
        }
    }
}

function startGame(level) {
    GameState.currentLevel = level;
    GameState.sun = 50;
    GameState.currentWave = 0;
    GameState.totalWaves = LEVELS[level].waves.length;
    GameState.isPlaying = true;
    GameState.plants = [];
    GameState.zombies = [];
    GameState.projectiles = [];
    GameState.suns = [];
    GameState.particles = [];
    GameState.waveTimer = 0;
    GameState.sunTimer = 0;
    GameState.selectedPlant = null;
    initGrid();
    updateUI();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('loseScreen').classList.add('hidden');
    document.getElementById('levelNum').textContent = `关卡 ${level}`;
    requestAnimationFrame(gameLoop);
}

function showStartScreen() {
    GameState.isPlaying = false;
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('loseScreen').classList.add('hidden');
}

function updateUI() {
    document.getElementById('sunCount').textContent = GameState.sun;
    document.getElementById('waveInfo').textContent = `波次: ${GameState.currentWave}/${GameState.totalWaves}`;
    
    document.querySelectorAll('.plantCard').forEach(card => {
        const plantType = card.dataset.plant;
        const cost = PLANT_TYPES[plantType].cost;
        const now = Date.now();
        const cooldownEnd = plantCooldowns[plantType] || 0;
        
        if (GameState.sun < cost) {
            card.style.opacity = '0.5';
        } else if (now < cooldownEnd) {
            card.classList.add('cooldown');
            const remaining = cooldownEnd - now;
            const total = PLANT_TYPES[plantType].cooldown;
            const percent = (remaining / total) * 100;
            card.querySelector('.cooldownOverlay').style.height = percent + '%';
        } else {
            card.style.opacity = '1';
            card.classList.remove('cooldown');
            card.querySelector('.cooldownOverlay').style.height = '0%';
        }
        
        if (GameState.selectedPlant === plantType) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function spawnZombie(type, row) {
    const zombieType = ZOMBIE_TYPES[type];
    const actualRow = row === -1 ? Math.floor(Math.random() * GRID_ROWS) : row;
    const zombie = {
        type: type,
        x: GRID_OFFSET_X + GRID_COLS * CELL_WIDTH + 50,
        y: GRID_OFFSET_Y + actualRow * CELL_HEIGHT + CELL_HEIGHT / 2,
        row: actualRow,
        health: zombieType.health,
        maxHealth: zombieType.health,
        damage: zombieType.damage,
        speed: zombieType.speed,
        baseSpeed: zombieType.speed,
        attackSpeed: zombieType.attackSpeed,
        lastAttack: 0,
        slowedUntil: 0,
        enraged: false,
        color: zombieType.color,
        attacking: null
    };
    GameState.zombies.push(zombie);
}

function spawnWave() {
    if (GameState.currentWave >= GameState.totalWaves) return;
    
    const wave = LEVELS[GameState.currentLevel].waves[GameState.currentWave];
    wave.zombies.forEach(z => {
        for (let i = 0; i < z.count; i++) {
            setTimeout(() => spawnZombie(z.type, z.row), i * 1500 + Math.random() * 1000);
        }
    });
    GameState.currentWave++;
    updateUI();
}

function spawnSun() {
    const sun = {
        x: GRID_OFFSET_X + 100 + Math.random() * (GRID_COLS * CELL_WIDTH - 200),
        y: -30,
        targetY: GRID_OFFSET_Y + 100 + Math.random() * (GRID_ROWS * CELL_HEIGHT - 150),
        value: 25,
        collected: false,
        fallSpeed: 1,
        lifetime: 10000,
        spawnTime: Date.now()
    };
    GameState.suns.push(sun);
}

function spawnSunFromSunflower(plant) {
    const sun = {
        x: plant.x + CELL_WIDTH / 2,
        y: plant.y,
        targetY: plant.y - 20,
        value: 25,
        collected: false,
        fallSpeed: 0,
        lifetime: 8000,
        spawnTime: Date.now(),
        fromSunflower: true,
        bobOffset: 0
    };
    GameState.suns.push(sun);
}

class Plant {
    constructor(type, row, col) {
        this.type = type;
        this.row = row;
        this.col = col;
        this.x = GRID_OFFSET_X + col * CELL_WIDTH;
        this.y = GRID_OFFSET_Y + row * CELL_HEIGHT;
        const plantType = PLANT_TYPES[type];
        this.health = plantType.health;
        this.maxHealth = plantType.health;
        this.lastAction = Date.now();
        this.exploded = false;
    }
    
    update(deltaTime) {
        const now = Date.now();
        const plantType = PLANT_TYPES[this.type];
        
        switch (this.type) {
            case 'sunflower':
                if (now - this.lastAction >= plantType.sunInterval) {
                    spawnSunFromSunflower(this);
                    this.lastAction = now;
                }
                break;
                
            case 'peashooter':
            case 'snowpea':
                const zombieInRow = GameState.zombies.find(z => z.row === this.row && z.x > this.x + CELL_WIDTH / 2);
                if (zombieInRow && now - this.lastAction >= plantType.attackSpeed) {
                    this.shoot();
                    this.lastAction = now;
                }
                break;
                
            case 'cherrybomb':
                if (!this.exploded && now - this.lastAction >= plantType.fuseTime) {
                    this.explode();
                }
                break;
        }
    }
    
    shoot() {
        const plantType = PLANT_TYPES[this.type];
        const projectile = {
            x: this.x + CELL_WIDTH - 10,
            y: this.y + CELL_HEIGHT / 2,
            row: this.row,
            damage: plantType.damage,
            speed: 5,
            isIce: this.type === 'snowpea',
            slowEffect: plantType.slowEffect,
            slowDuration: plantType.slowDuration
        };
        GameState.projectiles.push(projectile);
    }
    
    explode() {
        this.exploded = true;
        const plantType = PLANT_TYPES[this.type];
        const centerX = this.x + CELL_WIDTH / 2;
        const centerY = this.y + CELL_HEIGHT / 2;
        
        GameState.zombies.forEach(zombie => {
            const dx = zombie.x - centerX;
            const dy = zombie.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy) / CELL_WIDTH;
            if (distance <= plantType.explosionRadius) {
                zombie.health -= plantType.explosionDamage;
            }
        });
        
        for (let i = 0; i < 30; i++) {
            GameState.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1,
                color: ['#E53935', '#FF9800', '#FFEB3B'][Math.floor(Math.random() * 3)],
                size: 8 + Math.random() * 12
            });
        }
        
        GameState.grid[this.row][this.col] = null;
        const idx = GameState.plants.indexOf(this);
        if (idx > -1) GameState.plants.splice(idx, 1);
    }
    
    draw() {
        const plantType = PLANT_TYPES[this.type];
        
        ctx.save();
        ctx.translate(this.x + CELL_WIDTH / 2, this.y + CELL_HEIGHT / 2);
        
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        switch (this.type) {
            case 'sunflower':
                ctx.fillStyle = '#558B2F';
                ctx.fillRect(-6, 15, 12, 30);
                ctx.fillStyle = '#7CB342';
                ctx.beginPath();
                ctx.ellipse(-15, 20, 12, 6, -0.3, 0, Math.PI * 2);
                ctx.ellipse(15, 22, 12, 6, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                for (let i = 0; i < 12; i++) {
                    ctx.save();
                    ctx.rotate(i * Math.PI / 6 + Date.now() / 3000);
                    ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FFA000';
                    ctx.beginPath();
                    ctx.ellipse(0, -22, 6, 14, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-5, -3, 5, 0, Math.PI * 2);
                ctx.arc(5, -3, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
                ctx.arc(6, -3, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.fillText('🌻向日', 0, -40);
                break;
                
            case 'peashooter':
                ctx.fillStyle = '#558B2F';
                ctx.fillRect(-10, 15, 20, 30);
                ctx.fillStyle = '#33691E';
                ctx.beginPath();
                ctx.ellipse(-18, 25, 10, 5, -0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#689F38';
                ctx.beginPath();
                ctx.arc(0, -5, 28, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1B5E20';
                ctx.fillRect(15, -15, 20, 20);
                ctx.beginPath();
                ctx.arc(35, -5, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#81C784';
                ctx.beginPath();
                ctx.arc(35, -5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(8, -12, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(11, -11, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(12, -13, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1B5E20';
                ctx.fillText('🌱豌豆', 0, -42);
                break;
                
            case 'snowpea':
                ctx.shadowColor = '#81D4FA';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#4FC3F7';
                ctx.fillRect(-10, 15, 20, 30);
                ctx.fillStyle = '#0288D1';
                ctx.beginPath();
                ctx.ellipse(-18, 25, 10, 5, -0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#81D4FA';
                ctx.beginPath();
                ctx.arc(0, -5, 28, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0277BD';
                ctx.fillRect(15, -15, 20, 20);
                ctx.beginPath();
                ctx.arc(35, -5, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#E3F2FD';
                ctx.beginPath();
                ctx.arc(35, -5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(8, -12, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#01579B';
                ctx.beginPath();
                ctx.arc(11, -11, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(12, -13, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0288D1';
                for (let i = 0; i < 4; i++) {
                    ctx.save();
                    ctx.translate(-20 + i * 5, -30 + Math.sin(Date.now() / 200 + i) * 3);
                    ctx.beginPath();
                    ctx.moveTo(0, -4);
                    ctx.lineTo(-3, 2);
                    ctx.lineTo(3, 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
                ctx.fillStyle = '#0288D1';
                ctx.fillText('❄️寒冰', 0, -42);
                break;
                
            case 'wallnut':
                const wobble = Math.sin(Date.now() / 200) * 1;
                ctx.fillStyle = '#6D4C41';
                ctx.beginPath();
                ctx.roundRect(-30 + wobble, -25, 60, 65, 15);
                ctx.fill();
                ctx.fillStyle = '#8D6E63';
                ctx.beginPath();
                ctx.roundRect(-26 + wobble, -21, 52, 45, 12);
                ctx.fill();
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-22 + wobble, -10);
                ctx.lineTo(22 + wobble, -10);
                ctx.moveTo(-18 + wobble, 8);
                ctx.lineTo(18 + wobble, 8);
                ctx.moveTo(-12 + wobble, 24);
                ctx.lineTo(12 + wobble, 24);
                ctx.stroke();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-12 + wobble, -3, 10, 0, Math.PI * 2);
                ctx.arc(12 + wobble, -3, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#5D4037';
                ctx.beginPath();
                ctx.arc(-11 + wobble, -1, 6, 0, Math.PI * 2);
                ctx.arc(13 + wobble, -1, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0 + wobble, 12, 10, 0.2, Math.PI - 0.2);
                ctx.stroke();
                ctx.fillStyle = '#5D4037';
                ctx.fillText('🥜坚果', 0, -42);
                break;
                
            case 'cherrybomb':
                const pulse = Math.sin(Date.now() / 80) * 0.3 + 1;
                ctx.shadowColor = '#FF5722';
                ctx.shadowBlur = 20 * pulse;
                ctx.fillStyle = '#D32F2F';
                ctx.beginPath();
                ctx.arc(-15, 2, 22 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath();
                ctx.arc(15, 2, 22 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#880E4F';
                ctx.beginPath();
                ctx.arc(0, -5, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-18, -2, 7, 0, Math.PI * 2);
                ctx.arc(12, -2, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(-16, -1, 4, 0, Math.PI * 2);
                ctx.arc(14, -1, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFEB3B';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.bezierCurveTo(-5, -35, 8, -30, 5, -45);
                ctx.stroke();
                ctx.fillStyle = '#FF9800';
                for (let s = 0; s < 3; s++) {
                    ctx.beginPath();
                    ctx.arc(5 + s * 2, -48 - s * 5, 6 - s, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#D32F2F';
                ctx.fillText('💣樱桃', 0, -55);
                break;
        }
        
        ctx.restore();
        
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x + 15, this.y - 10, CELL_WIDTH - 30, 6);
            ctx.fillStyle = this.health / this.maxHealth > 0.3 ? '#4CAF50' : '#F44336';
            ctx.fillRect(this.x + 15, this.y - 10, (CELL_WIDTH - 30) * (this.health / this.maxHealth), 6);
        }
    }
}

function updateZombies(deltaTime) {
    const now = Date.now();
    
    for (let i = GameState.zombies.length - 1; i >= 0; i--) {
        const zombie = GameState.zombies[i];
        const zombieType = ZOMBIE_TYPES[zombie.type];
        
        if (now < zombie.slowedUntil) {
            zombie.speed = zombie.baseSpeed * 0.5;
        } else {
            zombie.speed = zombie.baseSpeed;
            if (zombie.type === 'newspaper' && zombie.enraged) {
                zombie.speed = zombieType.rageSpeed;
            }
        }
        
        if (zombie.type === 'newspaper' && !zombie.enraged && zombie.health < zombieType.health * 0.5) {
            zombie.enraged = true;
            zombie.baseSpeed = zombieType.rageSpeed;
        }
        
        let blocked = false;
        for (const plant of GameState.plants) {
            if (zombie.row === plant.row && 
                zombie.x < plant.x + CELL_WIDTH - 20 && 
                zombie.x > plant.x + CELL_WIDTH - 40) {
                blocked = true;
                zombie.attacking = plant;
                if (now - zombie.lastAttack >= zombie.attackSpeed) {
                    plant.health -= zombie.damage;
                    zombie.lastAttack = now;
                    
                    if (plant.health <= 0) {
                        GameState.grid[plant.row][plant.col] = null;
                        const idx = GameState.plants.indexOf(plant);
                        if (idx > -1) GameState.plants.splice(idx, 1);
                    }
                }
                break;
            }
        }
        
        if (!blocked) {
            zombie.attacking = null;
            zombie.x -= zombie.speed * deltaTime;
        }
        
        if (zombie.x < GRID_OFFSET_X) {
            gameOver(false);
            return;
        }
        
        if (zombie.health <= 0) {
            for (let j = 0; j < 15; j++) {
                GameState.particles.push({
                    x: zombie.x,
                    y: zombie.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 1,
                    color: zombie.color,
                    size: 5 + Math.random() * 8
                });
            }
            GameState.zombies.splice(i, 1);
        }
    }
}

function updateProjectiles(deltaTime) {
    for (let i = GameState.projectiles.length - 1; i >= 0; i--) {
        const proj = GameState.projectiles[i];
        proj.x += proj.speed;
        
        for (const zombie of GameState.zombies) {
            if (zombie.row === proj.row && 
                Math.abs(zombie.x - proj.x) < 30 && 
                Math.abs(zombie.y - proj.y) < 40) {
                zombie.health -= proj.damage;
                if (proj.isIce) {
                    zombie.slowedUntil = Date.now() + proj.slowDuration;
                }
                GameState.projectiles.splice(i, 1);
                break;
            }
        }
        
        if (proj.x > canvas.width) {
            GameState.projectiles.splice(i, 1);
        }
    }
}

function updateSuns(deltaTime) {
    const now = Date.now();
    
    for (let i = GameState.suns.length - 1; i >= 0; i--) {
        const sun = GameState.suns[i];
        
        if (!sun.fromSunflower) {
            if (sun.y < sun.targetY) {
                sun.y += sun.fallSpeed;
            }
        } else {
            sun.bobOffset = Math.sin(now / 300) * 5;
        }
        
        if (now - sun.spawnTime > sun.lifetime) {
            GameState.suns.splice(i, 1);
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = GameState.particles.length - 1; i >= 0; i--) {
        const p = GameState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.95;
        
        if (p.life <= 0) {
            GameState.particles.splice(i, 1);
        }
    }
}

function drawGrid() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 80, canvas.width, canvas.height - 80);
    
    ctx.fillStyle = '#76a829';
    ctx.fillRect(GRID_OFFSET_X - 10, GRID_OFFSET_Y - 10, GRID_COLS * CELL_WIDTH + 20, GRID_ROWS * CELL_HEIGHT + 20);
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const x = GRID_OFFSET_X + col * CELL_WIDTH;
            const y = GRID_OFFSET_Y + row * CELL_HEIGHT;
            
            ctx.fillStyle = (row + col) % 2 === 0 ? '#8BC34A' : '#7CB342';
            ctx.fillRect(x + 2, y + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4);
            
            if (GameState.selectedPlant && !GameState.grid[row][col]) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x + 2, y + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4);
            }
        }
    }
}

function drawZombies() {
    GameState.zombies.forEach(zombie => {
        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        
        const zombieType = ZOMBIE_TYPES[zombie.type];
        const isSlowed = Date.now() < zombie.slowedUntil;
        const walkCycle = Math.sin(Date.now() / 150) * 3;
        
        if (isSlowed) {
            ctx.shadowColor = '#81D4FA';
            ctx.shadowBlur = 20;
        }
        
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(-18 + walkCycle, 15, 12, 28);
        ctx.fillRect(6 - walkCycle, 15, 12, 28);
        
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(-15 + walkCycle, 38, 14, 8);
        ctx.fillRect(9 - walkCycle, 38, 14, 8);
        
        ctx.save();
        ctx.translate(-28, -15 + Math.sin(Date.now() / 200) * 5);
        ctx.rotate(-0.3);
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(0, 0, 8, 25);
        ctx.restore();
        
        ctx.save();
        ctx.translate(20, -15 - Math.sin(Date.now() / 200) * 5);
        ctx.rotate(0.3);
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(0, 0, 8, 25);
        ctx.restore();
        
        switch (zombie.type) {
            case 'normal':
                ctx.fillStyle = '#795548';
                ctx.fillRect(-22, -25, 44, 42);
                ctx.fillStyle = '#8D6E63';
                ctx.beginPath();
                ctx.arc(0, -40, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-9, -42, 7, 0, Math.PI * 2);
                ctx.arc(9, -42, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#D32F2F';
                ctx.beginPath();
                ctx.arc(-8, -41, 4, 0, Math.PI * 2);
                ctx.arc(10, -41, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(-10, -30, 20, 6);
                ctx.fillStyle = '#4E342E';
                for (let t = 0; t < 5; t++) {
                    ctx.fillRect(-8 + t * 4, -30, 2, 4);
                }
                ctx.fillStyle = '#795548';
                ctx.fillText('🧟普通', 0, -72);
                break;
                
            case 'flag':
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(-22, -25, 44, 42);
                ctx.fillStyle = '#A1887F';
                ctx.beginPath();
                ctx.arc(0, -40, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FF9800';
                ctx.shadowColor = '#FF9800';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(0, -75);
                ctx.lineTo(-18, -48);
                ctx.lineTo(18, -48);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#F57C00';
                ctx.fillRect(-4, -75, 8, 30);
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-9, -42, 7, 0, Math.PI * 2);
                ctx.arc(9, -42, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#D32F2F';
                ctx.beginPath();
                ctx.arc(-8, -41, 4, 0, Math.PI * 2);
                ctx.arc(10, -41, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FF9800';
                ctx.fillText('🚧路障', 0, -85);
                break;
                
            case 'bucket':
                ctx.fillStyle = '#6D4C41';
                ctx.fillRect(-24, -28, 48, 48);
                ctx.fillStyle = '#795548';
                ctx.beginPath();
                ctx.arc(0, -42, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#546E7A';
                ctx.shadowColor = '#607D8B';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(-20, -52);
                ctx.lineTo(-16, -82);
                ctx.lineTo(16, -82);
                ctx.lineTo(20, -52);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#455A64';
                ctx.fillRect(-22, -55, 44, 6);
                ctx.fillStyle = '#78909C';
                ctx.fillRect(-12, -75, 24, 4);
                ctx.fillRect(-8, -68, 16, 3);
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-9, -44, 6, 0, Math.PI * 2);
                ctx.arc(9, -44, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#D32F2F';
                ctx.beginPath();
                ctx.arc(-8, -43, 3.5, 0, Math.PI * 2);
                ctx.arc(10, -43, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#607D8B';
                ctx.fillText('🪣铁桶', 0, -95);
                break;
                
            case 'newspaper':
                ctx.fillStyle = zombie.enraged ? '#6D4C41' : '#8D6E63';
                ctx.fillRect(-22, -25, 44, 42);
                ctx.fillStyle = zombie.enraged ? '#795548' : '#9E9E9E';
                ctx.beginPath();
                ctx.arc(0, -40, 24, 0, Math.PI * 2);
                ctx.fill();
                
                if (!zombie.enraged) {
                    ctx.fillStyle = '#FAFAFA';
                    ctx.shadowColor = '#9E9E9E';
                    ctx.shadowBlur = 5;
                    ctx.fillRect(-40, -60, 35, 48);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#BDBDBD';
                    ctx.lineWidth = 1;
                    for (let l = 0; l < 7; l++) {
                        ctx.beginPath();
                        ctx.moveTo(-36, -55 + l * 6);
                        ctx.lineTo(-9, -55 + l * 6);
                        ctx.stroke();
                    }
                    ctx.fillStyle = '#F44336';
                    ctx.font = 'bold 8px Arial';
                    ctx.fillText('NEWS', -23, -52);
                } else {
                    ctx.fillStyle = '#D32F2F';
                    ctx.shadowColor = '#F44336';
                    ctx.shadowBlur = 15;
                }
                
                ctx.beginPath();
                ctx.arc(-10, -42, zombie.enraged ? 9 : 6, 0, Math.PI * 2);
                ctx.arc(8, -42, zombie.enraged ? 9 : 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                if (zombie.enraged) {
                    ctx.strokeStyle = '#5D4037';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-18, -52);
                    ctx.lineTo(-5, -48);
                    ctx.moveTo(18, -52);
                    ctx.lineTo(5, -48);
                    ctx.stroke();
                    ctx.fillStyle = '#B71C1C';
                    ctx.fillText('😡狂暴', 0, -72);
                } else {
                    ctx.fillStyle = '#3F51B5';
                    ctx.fillText('📰读报', 0, -72);
                }
                break;
                
            case 'football':
                ctx.fillStyle = '#B71C1C';
                ctx.fillRect(-26, -30, 52, 52);
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(-22, -26, 44, 44);
                ctx.fillStyle = '#FFEB3B';
                ctx.fillRect(-18, -18, 36, 6);
                ctx.fillRect(-18, -6, 36, 6);
                ctx.fillRect(-18, 6, 36, 6);
                ctx.fillStyle = '#D32F2F';
                ctx.shadowColor = '#F44336';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.ellipse(0, -45, 28, 22, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.ellipse(0, -48, 20, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#B71C1C';
                ctx.fillRect(-8, -55, 16, 20);
                ctx.fillStyle = 'black';
                ctx.fillRect(-5, -50, 10, 12);
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.arc(0, -58, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-10, -45, 5, 0, Math.PI * 2);
                ctx.arc(10, -45, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(-9, -44, 3, 0, Math.PI * 2);
                ctx.arc(11, -44, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#D32F2F';
                ctx.fillText('🏈橄榄', 0, -80);
                break;
        }
        
        ctx.restore();
        
        const healthPercent = zombie.health / zombie.maxHealth;
        ctx.fillStyle = '#212121';
        ctx.fillRect(zombie.x - 28, zombie.y - 15, 56, 8);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : (healthPercent > 0.25 ? '#FF9800' : '#F44336');
        ctx.fillRect(zombie.x - 27, zombie.y - 14, 54 * healthPercent, 6);
        
        if (Date.now() < zombie.slowedUntil) {
            ctx.fillStyle = '#81D4FA';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('❄️', zombie.x + 30, zombie.y - 30);
        }
    });
}

function drawProjectiles() {
    GameState.projectiles.forEach(proj => {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        
        if (proj.isIce) {
            ctx.fillStyle = '#81D4FA';
            ctx.shadowColor = '#81D4FA';
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.shadowColor = '#4CAF50';
        }
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function drawSuns() {
    GameState.suns.forEach(sun => {
        const y = sun.fromSunflower ? sun.targetY + sun.bobOffset : sun.y;
        
        ctx.save();
        ctx.translate(sun.x, y);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA000');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFEB3B';
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI / 4 + Date.now() / 2000);
            ctx.beginPath();
            ctx.moveTo(0, -28);
            ctx.lineTo(-5, -35);
            ctx.lineTo(5, -35);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    });
}

function drawParticles() {
    GameState.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function checkWin() {
    if (GameState.currentWave >= GameState.totalWaves && GameState.zombies.length === 0) {
        gameOver(true);
    }
}

function gameOver(win) {
    GameState.isPlaying = false;
    if (win) {
        document.getElementById('winScreen').classList.remove('hidden');
    } else {
        document.getElementById('loseScreen').classList.remove('hidden');
    }
}

function gameLoop(timestamp) {
    if (!GameState.isPlaying) return;
    
    const deltaTime = timestamp - GameState.lastTime;
    GameState.lastTime = timestamp;
    
    GameState.sunTimer += deltaTime;
    if (GameState.sunTimer >= 10000) {
        spawnSun();
        GameState.sunTimer = 0;
    }
    
    GameState.waveTimer += deltaTime;
    if (GameState.currentWave < GameState.totalWaves) {
        const wave = LEVELS[GameState.currentLevel].waves[GameState.currentWave];
        if (GameState.waveTimer >= wave.delay) {
            spawnWave();
            GameState.waveTimer = 0;
        }
    }
    
    GameState.plants.forEach(plant => plant.update(deltaTime));
    updateZombies(deltaTime);
    updateProjectiles(deltaTime);
    updateSuns(deltaTime);
    updateParticles(deltaTime);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    GameState.plants.forEach(plant => plant.draw());
    drawSuns();
    drawZombies();
    drawProjectiles();
    drawParticles();
    
    updateUI();
    checkWin();
    
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    if (!GameState.isPlaying) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let i = GameState.suns.length - 1; i >= 0; i--) {
        const sun = GameState.suns[i];
        const sunY = sun.fromSunflower ? sun.targetY : sun.y;
        const dist = Math.sqrt((x - sun.x) ** 2 + (y - sunY) ** 2);
        if (dist < 30) {
            GameState.sun += sun.value;
            GameState.suns.splice(i, 1);
            updateUI();
            return;
        }
    }
    
    if (GameState.selectedPlant) {
        const col = Math.floor((x - GRID_OFFSET_X) / CELL_WIDTH);
        const row = Math.floor((y - GRID_OFFSET_Y) / CELL_HEIGHT);
        
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            const plantType = PLANT_TYPES[GameState.selectedPlant];
            
            if (!GameState.grid[row][col] && GameState.sun >= plantType.cost) {
                const plant = new Plant(GameState.selectedPlant, row, col);
                GameState.plants.push(plant);
                GameState.grid[row][col] = plant;
                GameState.sun -= plantType.cost;
                plantCooldowns[GameState.selectedPlant] = Date.now() + plantType.cooldown;
                GameState.selectedPlant = null;
                updateUI();
            }
        }
    }
});

document.querySelectorAll('.plantCard').forEach(card => {
    card.addEventListener('click', () => {
        if (!GameState.isPlaying) return;
        
        const plantType = card.dataset.plant;
        const cost = parseInt(card.dataset.cost);
        const now = Date.now();
        
        if (GameState.sun >= cost && now >= (plantCooldowns[plantType] || 0)) {
            GameState.selectedPlant = GameState.selectedPlant === plantType ? null : plantType;
            updateUI();
        }
    });
});

document.querySelectorAll('.levelBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        startGame(parseInt(btn.dataset.level));
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        GameState.selectedPlant = null;
        updateUI();
    }
});
