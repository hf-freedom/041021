// 植物基类
class Plant extends Entity {
    constructor(col, row, type) {
        const pos = getCellPosition(col, row);
        super(pos.x + 10, pos.y + 20, 60, 60);
        this.col = col;
        this.row = row;
        this.type = type;
        this.config = GAME_CONFIG.PLANTS[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.plantTime = Date.now();
        this.flashTime = 0;
    }

    takeDamage(damage) {
        this.health -= damage;
        this.flashTime = 200;
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    update(deltaTime) {
        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }
    }

    draw(ctx) {
        // 绘制植物阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 绘制植物
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, this.x + this.width / 2, this.y + this.height / 2);

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 绘制血条（如果受伤）
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }

    drawRange(ctx, range) {
        // 绘制攻击范围（用于调试或特殊效果）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// 向日葵
class Sunflower extends Plant {
    constructor(col, row) {
        super(col, row, 'sunflower');
        this.lastSunProduction = Date.now();
        this.productionInterval = this.config.sunProductionInterval;
        this.bobOffset = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // 摇摆动画
        this.bobOffset = Math.sin(Date.now() / 500) * 3;

        // 生产阳光
        const now = Date.now();
        if (now - this.lastSunProduction >= this.productionInterval) {
            this.lastSunProduction = now;
            return new Sun(
                this.x + this.width / 2 - 20,
                this.y - 20,
                this.config.sunProduction,
                false
            );
        }
        return null;
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 绘制摇摆的向日葵
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.bobOffset);
        ctx.rotate(Math.sin(Date.now() / 800) * 0.1);

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, 0, 0);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 绘制生产阳光的提示
        const timeUntilNext = this.productionInterval - (Date.now() - this.lastSunProduction);
        if (timeUntilNext < 2000) {
            ctx.fillStyle = `rgba(255, 215, 0, ${1 - timeUntilNext / 2000})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // 血条
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }
}

// 豌豆射手
class Peashooter extends Plant {
    constructor(col, row) {
        super(col, row, 'peashooter');
        this.lastShot = 0;
        this.shootInterval = this.config.shootInterval;
        this.shootAnim = 0;
    }

    update(deltaTime, zombies) {
        super.update(deltaTime);

        // 射击动画
        if (this.shootAnim > 0) {
            this.shootAnim -= deltaTime;
        }

        // 检查前方是否有僵尸（在屏幕内且在植物右侧）
        const hasZombieInRow = zombies.some(zombie => {
            return zombie.row === this.row &&
                   zombie.x > this.x &&
                   zombie.x < GAME_CONFIG.CANVAS_WIDTH &&
                   !zombie.markedForDeletion;
        });

        if (hasZombieInRow) {
            const now = Date.now();
            if (now - this.lastShot >= this.shootInterval) {
                this.lastShot = now;
                this.shootAnim = 200;
                return new Projectile(
                    this.x + this.width,
                    this.y + this.height / 2 - 10,
                    this.config.projectile,
                    this.config.damage
                );
            }
        }
        return null;
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 绘制射击动画
        const recoil = this.shootAnim > 0 ? Math.sin((200 - this.shootAnim) / 200 * Math.PI) * 5 : 0;

        ctx.save();
        ctx.translate(this.x + this.width / 2 - recoil, this.y + this.height / 2);

        // 绘制头部摇摆
        ctx.rotate(Math.sin(Date.now() / 600) * 0.05);

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, 0, 0);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 血条
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }
}

// 坚果墙
class Wallnut extends Plant {
    constructor(col, row) {
        super(col, row, 'wallnut');
        this.damageStates = [
            { threshold: 0.75, emoji: '🥜' },
            { threshold: 0.5, emoji: '🌰' },
            { threshold: 0.25, emoji: '🥔' }
        ];
        this.currentEmoji = this.config.emoji;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // 根据血量更新外观
        const healthPercent = this.health / this.maxHealth;
        for (const state of this.damageStates) {
            if (healthPercent <= state.threshold) {
                this.currentEmoji = state.emoji;
                break;
            }
        }
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 绘制坚果（有轻微晃动）
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.sin(Date.now() / 1000) * 0.05);

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentEmoji, 0, 0);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 血条
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }
}

// 樱桃炸弹
class CherryBomb extends Plant {
    constructor(col, row) {
        super(col, row, 'cherrybomb');
        this.plantedAt = Date.now();
        this.explodeDelay = this.config.explodeDelay;
        this.exploded = false;
        this.pulseScale = 1;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // 爆炸前脉动效果
        const timeUntilExplode = this.explodeDelay - (Date.now() - this.plantedAt);
        if (timeUntilExplode > 0) {
            this.pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1 * (1 - timeUntilExplode / this.explodeDelay);
        }

        // 检查是否该爆炸了
        if (!this.exploded && Date.now() - this.plantedAt >= this.explodeDelay) {
            this.exploded = true;
            this.destroy();
            return true; // 返回true表示需要爆炸
        }
        return false;
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 绘制脉动的樱桃
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.pulseScale, this.pulseScale);

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, 0, 0);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 绘制倒计时
        const timeUntilExplode = Math.max(0, this.explodeDelay - (Date.now() - this.plantedAt));
        if (timeUntilExplode < 1000) {
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 50) * 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 35, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getExplosionData() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: this.config.explosionRadius,
            damage: this.config.damage
        };
    }
}

// 寒冰射手
class SnowPea extends Plant {
    constructor(col, row) {
        super(col, row, 'snowpea');
        this.lastShot = 0;
        this.shootInterval = this.config.shootInterval;
        this.shootAnim = 0;
    }

    update(deltaTime, zombies) {
        super.update(deltaTime);

        // 射击动画
        if (this.shootAnim > 0) {
            this.shootAnim -= deltaTime;
        }

        // 检查前方是否有僵尸（在屏幕内且在植物右侧）
        const hasZombieInRow = zombies.some(zombie => {
            return zombie.row === this.row &&
                   zombie.x > this.x &&
                   zombie.x < GAME_CONFIG.CANVAS_WIDTH &&
                   !zombie.markedForDeletion;
        });

        if (hasZombieInRow) {
            const now = Date.now();
            if (now - this.lastShot >= this.shootInterval) {
                this.lastShot = now;
                this.shootAnim = 200;
                return new Projectile(
                    this.x + this.width,
                    this.y + this.height / 2 - 10,
                    this.config.projectile,
                    this.config.damage
                );
            }
        }
        return null;
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 冰霜光环效果
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 35 + Math.sin(Date.now() / 300) * 3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制射击动画
        const recoil = this.shootAnim > 0 ? Math.sin((200 - this.shootAnim) / 200 * Math.PI) * 5 : 0;

        ctx.save();
        ctx.translate(this.x + this.width / 2 - recoil, this.y + this.height / 2);

        // 绘制头部摇摆
        ctx.rotate(Math.sin(Date.now() / 600) * 0.05);

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, 0, 0);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 血条
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }
}

// 植物工厂
class PlantFactory {
    static create(type, col, row) {
        switch (type) {
            case 'sunflower':
                return new Sunflower(col, row);
            case 'peashooter':
                return new Peashooter(col, row);
            case 'wallnut':
                return new Wallnut(col, row);
            case 'cherrybomb':
                return new CherryBomb(col, row);
            case 'snowpea':
                return new SnowPea(col, row);
            default:
                console.error('Unknown plant type:', type);
                return null;
        }
    }
}
