// 基础实体类
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.markedForDeletion = false;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    update(deltaTime) {
        // 子类实现
    }

    draw(ctx) {
        // 子类实现
    }

    destroy() {
        this.markedForDeletion = true;
    }
}

// 投射物类
class Projectile extends Entity {
    constructor(x, y, type, damage, speed = 300) {
        super(x, y, 20, 20);
        this.type = type; // 'pea' 或 'snowpea'
        this.damage = damage;
        this.speed = speed;
        this.vx = speed;
        this.vy = 0;
    }

    update(deltaTime) {
        this.x += this.vx * (deltaTime / 1000);
        
        // 超出屏幕边界则删除
        if (this.x > GAME_CONFIG.CANVAS_WIDTH) {
            this.destroy();
        }
    }

    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        if (this.type === 'pea') {
            // 绘制豌豆
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = '#90EE90';
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'snowpea') {
            // 绘制冰冻豌豆
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // 冰霜效果
            ctx.strokeStyle = '#E0FFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // 雪花装饰
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                const angle = (Date.now() / 500 + i * Math.PI / 2);
                const px = centerX + Math.cos(angle) * 5;
                const py = centerY + Math.sin(angle) * 5;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// 阳光类
class Sun extends Entity {
    constructor(x, y, value = GAME_CONFIG.SUN_VALUE, isFalling = true) {
        super(x, y, 40, 40);
        this.value = value;
        this.isFalling = isFalling;
        this.targetY = isFalling ? y + randomInt(100, 200) : y;
        this.vy = isFalling ? 50 : 0;
        this.collected = false;
        this.scale = 1;
        this.rotation = 0;
    }

    update(deltaTime) {
        if (this.collected) {
            this.scale -= deltaTime / 500;
            if (this.scale <= 0) {
                this.destroy();
            }
            return;
        }

        if (this.isFalling && this.y < this.targetY) {
            this.y += this.vy * (deltaTime / 1000);
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.isFalling = false;
            }
        }

        // 旋转动画
        this.rotation += deltaTime / 1000;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        
        // 绘制阳光
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        
        // 绘制太阳光芒
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const outerX = Math.cos(angle) * 20;
            const outerY = Math.sin(angle) * 20;
            const innerX = Math.cos(angle + Math.PI / 8) * 10;
            const innerY = Math.sin(angle + Math.PI / 8) * 10;
            
            if (i === 0) {
                ctx.moveTo(outerX, outerY);
            } else {
                ctx.lineTo(outerX, outerY);
            }
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        
        // 中心圆
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    collect() {
        if (!this.collected) {
            this.collected = true;
            return this.value;
        }
        return 0;
    }

    containsPoint(x, y) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        return Math.sqrt(dx * dx + dy * dy) <= 25;
    }
}

// 爆炸效果类
class Explosion extends Entity {
    constructor(x, y, radius, damage) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.radius = radius;
        this.damage = damage;
        this.lifetime = 500; // 毫秒
        this.maxLifetime = 500;
        this.expanded = false;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    draw(ctx) {
        const progress = 1 - (this.lifetime / this.maxLifetime);
        const currentRadius = this.radius * (progress < 0.5 ? progress * 2 : 2 - progress * 2);
        const alpha = progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 外圈
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, currentRadius
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF6347');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 爆炸粒子
        if (progress < 0.3) {
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12 + progress * 5;
                const distance = currentRadius * (0.5 + Math.random() * 0.5);
                const px = this.x + this.width / 2 + Math.cos(angle) * distance;
                const py = this.y + this.height / 2 + Math.sin(angle) * distance;
                
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(px, py, 5 + Math.random() * 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

// 伤害数字类
class DamageNumber extends Entity {
    constructor(x, y, damage, isCritical = false) {
        super(x, y, 50, 30);
        this.damage = damage;
        this.isCritical = isCritical;
        this.lifetime = 1000;
        this.maxLifetime = 1000;
        this.vy = -50;
    }

    update(deltaTime) {
        this.y += this.vy * (deltaTime / 1000);
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    draw(ctx) {
        const progress = 1 - (this.lifetime / this.maxLifetime);
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const text = this.damage.toString();
        const fontSize = this.isCritical ? 28 : 20;
        const color = this.isCritical ? '#FF4500' : '#fff';
        
        drawStrokedText(ctx, text, this.x, this.y, fontSize, color, '#000');
        
        ctx.restore();
    }
}

// 冷却管理器
class CooldownManager {
    constructor() {
        this.cooldowns = {};
    }

    start(plantType, duration) {
        this.cooldowns[plantType] = {
            duration: duration,
            remaining: duration
        };
    }

    update(deltaTime) {
        for (const type in this.cooldowns) {
            if (this.cooldowns[type].remaining > 0) {
                this.cooldowns[type].remaining -= deltaTime;
                if (this.cooldowns[type].remaining < 0) {
                    this.cooldowns[type].remaining = 0;
                }
            }
        }
    }

    isReady(plantType) {
        return !this.cooldowns[plantType] || this.cooldowns[plantType].remaining <= 0;
    }

    getProgress(plantType) {
        if (!this.cooldowns[plantType]) return 1;
        const cd = this.cooldowns[plantType];
        return 1 - (cd.remaining / cd.duration);
    }

    getRemainingTime(plantType) {
        if (!this.cooldowns[plantType]) return 0;
        return Math.ceil(this.cooldowns[plantType].remaining / 1000);
    }
}
