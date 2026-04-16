// 工具函数

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 圆形碰撞检测
function checkCircleCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

// 点是否在矩形内
function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

// 获取草坪格子坐标
function getCellFromPosition(x, y) {
    const config = GAME_CONFIG;
    const col = Math.floor((x - config.LAWN_X) / config.CELL_WIDTH);
    const row = Math.floor((y - config.LAWN_Y) / config.CELL_HEIGHT);
    
    if (col >= 0 && col < config.COLS && row >= 0 && row < config.ROWS) {
        return { col, row };
    }
    return null;
}

// 获取格子的像素坐标
function getCellPosition(col, row) {
    const config = GAME_CONFIG;
    return {
        x: config.LAWN_X + col * config.CELL_WIDTH,
        y: config.LAWN_Y + row * config.CELL_HEIGHT,
        centerX: config.LAWN_X + col * config.CELL_WIDTH + config.CELL_WIDTH / 2,
        centerY: config.LAWN_Y + row * config.CELL_HEIGHT + config.CELL_HEIGHT / 2
    };
}

// 随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机选择数组元素
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 限制数值范围
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// 线性插值
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// 格式化时间
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 绘制圆角矩形
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 绘制带边框的文本
function drawStrokedText(ctx, text, x, y, fontSize = 20, fillColor = '#fff', strokeColor = '#000') {
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
}

// 缓动函数
const Easing = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => 1 - (1 - t) * (1 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};

// 粒子效果类
class Particle {
    constructor(x, y, color, velocity, lifetime, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.alpha = 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.lifetime -= deltaTime;
        this.alpha = this.lifetime / this.maxLifetime;
        return this.lifetime > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 粒子系统
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 10, speed = 100, lifetime = 1000, size = 3) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.particles.push(new Particle(x, y, color, velocity, lifetime, size));
        }
    }

    emitExplosion(x, y, color, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const lifetime = 500 + Math.random() * 1000;
            const size = 2 + Math.random() * 5;
            this.particles.push(new Particle(x, y, color, velocity, lifetime, size));
        }
    }

    update(deltaTime) {
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}

// 动画类
class Animation {
    constructor(duration, onUpdate, onComplete = null, easing = Easing.linear) {
        this.duration = duration;
        this.elapsed = 0;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.easing = easing;
        this.finished = false;
    }

    update(deltaTime) {
        if (this.finished) return;
        
        this.elapsed += deltaTime;
        const progress = Math.min(this.elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        
        this.onUpdate(easedProgress);
        
        if (progress >= 1) {
            this.finished = true;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    isFinished() {
        return this.finished;
    }
}

// 动画管理器
class AnimationManager {
    constructor() {
        this.animations = [];
    }

    add(animation) {
        this.animations.push(animation);
    }

    update(deltaTime) {
        this.animations.forEach(anim => anim.update(deltaTime));
        this.animations = this.animations.filter(anim => !anim.isFinished());
    }

    clear() {
        this.animations = [];
    }
}

// 音效管理器（简化版，可扩展）
class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }

    load(name, url) {
        // 简化实现，实际项目中可以加载真实音频文件
        this.sounds[name] = { url, loaded: false };
    }

    play(name) {
        if (this.muted || !this.sounds[name]) return;
        // 简化实现
        console.log(`Playing sound: ${name}`);
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// 创建全局实例
const particleSystem = new ParticleSystem();
const animationManager = new AnimationManager();
const soundManager = new SoundManager();
