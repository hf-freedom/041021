// 僵尸基类
class Zombie extends Entity {
    constructor(row, type) {
        const startX = GAME_CONFIG.CANVAS_WIDTH + 50;
        const pos = getCellPosition(0, row);
        super(startX, pos.y + 20, 60, 70);
        this.row = row;
        this.type = type;
        this.config = GAME_CONFIG.ZOMBIES[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.speed = this.config.speed;
        this.baseSpeed = this.config.speed;
        this.damage = this.config.damage;
        this.eatInterval = this.config.eatInterval;
        this.lastEat = 0;
        this.isEating = false;
        this.slowed = false;
        this.slowEndTime = 0;
        this.flashTime = 0;
        this.animOffset = Math.random() * 1000;
        this.eatingPlant = null;
    }

    update(deltaTime, plants) {
        // 检查减速效果
        if (this.slowed && Date.now() > this.slowEndTime) {
            this.slowed = false;
            this.speed = this.baseSpeed;
        }

        // 闪光效果
        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }

        // 检查前方是否有植物
        let blocked = false;
        this.eatingPlant = null;

        for (const plant of plants) {
            if (plant.row === this.row && !plant.markedForDeletion) {
                const plantRight = plant.x + plant.width;
                const zombieLeft = this.x;

                if (zombieLeft <= plantRight && zombieLeft > plant.x) {
                    blocked = true;
                    this.eatingPlant = plant;
                    break;
                }
            }
        }

        if (blocked && this.eatingPlant) {
            // 吃植物
            this.isEating = true;
            const now = Date.now();
            if (now - this.lastEat >= this.eatInterval) {
                this.lastEat = now;
                return { action: 'eat', damage: this.damage, plant: this.eatingPlant };
            }
        } else {
            // 移动
            this.isEating = false;
            const speedMultiplier = this.slowed ? 0.5 : 1;
            this.x -= this.speed * speedMultiplier * (deltaTime / 1000);
        }

        // 检查是否到达最左侧（游戏失败）
        if (this.x < GAME_CONFIG.LAWN_X - 50) {
            return { action: 'reach_house' };
        }

        return null;
    }

    takeDamage(damage, isSlow = false) {
        this.health -= damage;
        this.flashTime = 200;

        if (isSlow) {
            this.slowed = true;
            this.slowEndTime = Date.now() + 3000;
            this.speed = this.baseSpeed * 0.5;
        }

        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    draw(ctx) {
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 减速效果
        if (this.slowed) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 闪光效果
        if (this.flashTime > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
        }

        // 行走/吃食动画
        let animY = 0;
        if (this.isEating) {
            // 吃食时的抖动
            animY = Math.sin(Date.now() / 50) * 2;
        } else {
            // 行走时的上下摆动
            animY = Math.sin((Date.now() + this.animOffset) / 200) * 3;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + animY);

        // 绘制僵尸
        ctx.font = '45px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, 0, 0);

        // 特殊装饰
        this.drawAccessories(ctx);

        ctx.restore();

        if (this.flashTime > 0) {
            ctx.restore();
        }

        // 绘制血条
        const barWidth = 50;
        const barHeight = 5;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 15;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    drawAccessories(ctx) {
        // 子类可以重写此方法添加装饰
    }
}

// 普通僵尸
class NormalZombie extends Zombie {
    constructor(row) {
        super(row, 'normal');
    }
}

// 路障僵尸
class ConeZombie extends Zombie {
    constructor(row) {
        super(row, 'cone');
        this.coneHealth = 200;
        this.maxConeHealth = 200;
    }

    takeDamage(damage, isSlow = false) {
        // 先伤害路障
        if (this.coneHealth > 0) {
            this.coneHealth -= damage;
            this.flashTime = 200;
            
            if (this.coneHealth <= 0) {
                // 路障破碎，剩余伤害传递给僵尸
                const overflowDamage = -this.coneHealth;
                this.coneHealth = 0;
                if (overflowDamage > 0) {
                    return super.takeDamage(overflowDamage, isSlow);
                }
            }
            
            if (isSlow) {
                this.slowed = true;
                this.slowEndTime = Date.now() + 3000;
                this.speed = this.baseSpeed * 0.5;
            }
            return false;
        }
        return super.takeDamage(damage, isSlow);
    }

    drawAccessories(ctx) {
        // 绘制路障
        if (this.coneHealth > 0) {
            ctx.font = '25px Arial';
            ctx.fillText('🔶', 5, -20);
            
            // 路障血条
            const conePercent = this.coneHealth / this.maxConeHealth;
            ctx.fillStyle = '#FF8C00';
            ctx.fillRect(-15, -35, 30 * conePercent, 3);
        }
    }
}

// 铁桶僵尸
class BucketZombie extends Zombie {
    constructor(row) {
        super(row, 'bucket');
        this.bucketHealth = 1000;
        this.maxBucketHealth = 1000;
    }

    takeDamage(damage, isSlow = false) {
        // 先伤害铁桶
        if (this.bucketHealth > 0) {
            this.bucketHealth -= damage;
            this.flashTime = 200;
            
            if (this.bucketHealth <= 0) {
                // 铁桶掉落，剩余伤害传递给僵尸
                const overflowDamage = -this.bucketHealth;
                this.bucketHealth = 0;
                if (overflowDamage > 0) {
                    return super.takeDamage(overflowDamage, isSlow);
                }
            }
            
            if (isSlow) {
                this.slowed = true;
                this.slowEndTime = Date.now() + 3000;
                this.speed = this.baseSpeed * 0.5;
            }
            return false;
        }
        return super.takeDamage(damage, isSlow);
    }

    drawAccessories(ctx) {
        // 绘制铁桶
        if (this.bucketHealth > 0) {
            ctx.font = '28px Arial';
            ctx.fillText('🪣', 5, -20);
            
            // 铁桶血条
            const bucketPercent = this.bucketHealth / this.maxBucketHealth;
            ctx.fillStyle = '#708090';
            ctx.fillRect(-15, -38, 30 * bucketPercent, 3);
        }
    }
}

// 读报僵尸
class NewspaperZombie extends Zombie {
    constructor(row) {
        super(row, 'newspaper');
        this.newspaperHealth = this.config.newspaperHealth;
        this.maxNewspaperHealth = this.config.newspaperHealth;
        this.enraged = false;
    }

    update(deltaTime, plants) {
        const result = super.update(deltaTime, plants);
        
        // 狂暴状态下速度更快
        if (this.enraged) {
            this.speed = this.config.enragedSpeed;
        }
        
        return result;
    }

    takeDamage(damage, isSlow = false) {
        // 先伤害报纸
        if (this.newspaperHealth > 0) {
            this.newspaperHealth -= damage;
            this.flashTime = 200;
            
            if (this.newspaperHealth <= 0) {
                // 报纸掉落，进入狂暴状态
                this.enraged = true;
                const overflowDamage = -this.newspaperHealth;
                this.newspaperHealth = 0;
                if (overflowDamage > 0) {
                    return super.takeDamage(overflowDamage, isSlow);
                }
            }
            
            if (isSlow) {
                this.slowed = true;
                this.slowEndTime = Date.now() + 3000;
                this.speed = this.baseSpeed * 0.5;
            }
            return false;
        }
        return super.takeDamage(damage, isSlow);
    }

    drawAccessories(ctx) {
        // 绘制报纸
        if (this.newspaperHealth > 0) {
            ctx.font = '30px Arial';
            ctx.fillText('📰', -15, 5);
            
            // 报纸血条
            const paperPercent = this.newspaperHealth / this.maxNewspaperHealth;
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(-25, -10, 20 * paperPercent, 3);
        }
        
        // 狂暴效果
        if (this.enraged) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 橄榄球僵尸
class FootballZombie extends Zombie {
    constructor(row) {
        super(row, 'football');
        this.helmetHealth = 800;
        this.maxHelmetHealth = 800;
    }

    takeDamage(damage, isSlow = false) {
        // 先伤害头盔
        if (this.helmetHealth > 0) {
            this.helmetHealth -= damage;
            this.flashTime = 200;
            
            if (this.helmetHealth <= 0) {
                // 头盔掉落，剩余伤害传递给僵尸
                const overflowDamage = -this.helmetHealth;
                this.helmetHealth = 0;
                this.speed = this.baseSpeed * 0.7; // 头盔掉落后速度降低
                if (overflowDamage > 0) {
                    return super.takeDamage(overflowDamage, isSlow);
                }
            }
            
            if (isSlow) {
                this.slowed = true;
                this.slowEndTime = Date.now() + 3000;
                this.speed = this.baseSpeed * 0.5;
            }
            return false;
        }
        return super.takeDamage(damage, isSlow);
    }

    drawAccessories(ctx) {
        // 绘制橄榄球头盔
        if (this.helmetHealth > 0) {
            ctx.font = '28px Arial';
            ctx.fillText('🏈', 8, -18);
            
            // 头盔血条
            const helmetPercent = this.helmetHealth / this.maxHelmetHealth;
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(-12, -35, 24 * helmetPercent, 3);
        }
    }
}

// 僵尸工厂
class ZombieFactory {
    static create(type, row) {
        switch (type) {
            case 'normal':
                return new NormalZombie(row);
            case 'cone':
                return new ConeZombie(row);
            case 'bucket':
                return new BucketZombie(row);
            case 'newspaper':
                return new NewspaperZombie(row);
            case 'football':
                return new FootballZombie(row);
            default:
                console.error('Unknown zombie type:', type);
                return new NormalZombie(row);
        }
    }
}
