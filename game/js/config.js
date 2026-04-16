// 游戏配置
const GAME_CONFIG = {
    // 画布设置
    CANVAS_WIDTH: 1000,
    CANVAS_HEIGHT: 600,
    
    // 草坪设置
    LAWN_X: 250,
    LAWN_Y: 100,
    CELL_WIDTH: 80,
    CELL_HEIGHT: 100,
    COLS: 9,
    ROWS: 5,
    
    // 游戏设置
    INITIAL_SUN: 150,
    SUN_DROP_INTERVAL: 10000, // 阳光掉落间隔(ms)
    SUN_VALUE: 25,
    
    // 植物配置
    PLANTS: {
        sunflower: {
            name: '向日葵',
            cost: 50,
            health: 300,
            cooldown: 5000,
            sunProduction: 25,
            sunProductionInterval: 8000,
            emoji: '🌻',
            color: '#FFD700'
        },
        peashooter: {
            name: '豌豆射手',
            cost: 100,
            health: 300,
            cooldown: 5000,
            damage: 20,
            shootInterval: 1500,
            emoji: '🌱',
            color: '#32CD32',
            projectile: 'pea'
        },
        wallnut: {
            name: '坚果墙',
            cost: 50,
            health: 4000,
            cooldown: 15000,
            emoji: '🥜',
            color: '#8B4513'
        },
        cherrybomb: {
            name: '樱桃炸弹',
            cost: 150,
            health: 100,
            cooldown: 30000,
            damage: 500,
            explosionRadius: 150,
            emoji: '🍒',
            color: '#DC143C',
            explodeDelay: 1000
        },
        snowpea: {
            name: '寒冰射手',
            cost: 175,
            health: 300,
            cooldown: 5000,
            damage: 20,
            shootInterval: 1500,
            slowDuration: 3000,
            emoji: '❄️',
            color: '#87CEEB',
            projectile: 'snowpea'
        }
    },
    
    // 僵尸配置
    ZOMBIES: {
        normal: {
            name: '普通僵尸',
            health: 200,
            speed: 0.3,
            damage: 10,
            eatInterval: 1000,
            emoji: '🧟',
            color: '#8B4513'
        },
        cone: {
            name: '路障僵尸',
            health: 400,
            speed: 0.3,
            damage: 10,
            eatInterval: 1000,
            emoji: '🧟',
            color: '#FF8C00',
            hasCone: true
        },
        bucket: {
            name: '铁桶僵尸',
            health: 1200,
            speed: 0.25,
            damage: 10,
            eatInterval: 1000,
            emoji: '🧟',
            color: '#708090',
            hasBucket: true
        },
        newspaper: {
            name: '读报僵尸',
            health: 350,
            speed: 0.2,
            enragedSpeed: 0.6,
            damage: 10,
            eatInterval: 1000,
            emoji: '📰',
            color: '#D2691E',
            newspaperHealth: 150
        },
        football: {
            name: '橄榄球僵尸',
            health: 1600,
            speed: 0.6,
            damage: 20,
            eatInterval: 800,
            emoji: '🏈',
            color: '#8B0000'
        }
    },
    
    // 关卡配置
    LEVELS: [
        {
            id: 1,
            name: '前院草坪',
            sunInterval: 10000,
            waves: [
                { zombies: [{ type: 'normal', count: 2, interval: 3000 }], delay: 3000 },
                { zombies: [{ type: 'normal', count: 3, interval: 3000 }], delay: 10000 },
                { zombies: [{ type: 'normal', count: 3, interval: 2500 }, { type: 'cone', count: 1, interval: 5000 }], delay: 15000 },
                { zombies: [{ type: 'normal', count: 4, interval: 2000 }, { type: 'cone', count: 2, interval: 4000 }], delay: 20000 },
                { zombies: [{ type: 'normal', count: 4, interval: 2000 }, { type: 'cone', count: 2, interval: 3000 }, { type: 'bucket', count: 1, interval: 5000 }], delay: 25000 }
            ]
        },
        {
            id: 2,
            name: '夜间花园',
            sunInterval: 15000,
            waves: [
                { zombies: [{ type: 'normal', count: 3, interval: 3000 }], delay: 3000 },
                { zombies: [{ type: 'normal', count: 3, interval: 2500 }, { type: 'cone', count: 1, interval: 5000 }], delay: 10000 },
                { zombies: [{ type: 'cone', count: 3, interval: 3500 }, { type: 'bucket', count: 1, interval: 6000 }], delay: 15000 },
                { zombies: [{ type: 'normal', count: 4, interval: 2000 }, { type: 'newspaper', count: 1, interval: 5000 }], delay: 20000 },
                { zombies: [{ type: 'cone', count: 3, interval: 2500 }, { type: 'bucket', count: 2, interval: 4000 }, { type: 'newspaper', count: 1, interval: 5000 }], delay: 25000 }
            ]
        },
        {
            id: 3,
            name: '泳池派对',
            sunInterval: 12000,
            waves: [
                { zombies: [{ type: 'normal', count: 3, interval: 3000 }], delay: 3000 },
                { zombies: [{ type: 'cone', count: 2, interval: 3500 }, { type: 'bucket', count: 1, interval: 6000 }], delay: 10000 },
                { zombies: [{ type: 'newspaper', count: 2, interval: 4000 }, { type: 'football', count: 1, interval: 8000 }], delay: 15000 },
                { zombies: [{ type: 'normal', count: 5, interval: 2000 }, { type: 'bucket', count: 1, interval: 5000 }, { type: 'football', count: 1, interval: 7000 }], delay: 20000 },
                { zombies: [{ type: 'cone', count: 3, interval: 2500 }, { type: 'bucket', count: 2, interval: 3500 }, { type: 'newspaper', count: 2, interval: 4000 }, { type: 'football', count: 1, interval: 6000 }], delay: 25000 }
            ]
        },
        {
            id: 4,
            name: '浓雾迷城',
            sunInterval: 14000,
            waves: [
                { zombies: [{ type: 'normal', count: 3, interval: 2500 }], delay: 3000 },
                { zombies: [{ type: 'cone', count: 3, interval: 3000 }, { type: 'bucket', count: 1, interval: 5000 }], delay: 10000 },
                { zombies: [{ type: 'newspaper', count: 2, interval: 3500 }, { type: 'football', count: 1, interval: 6000 }], delay: 15000 },
                { zombies: [{ type: 'bucket', count: 2, interval: 3500 }, { type: 'newspaper', count: 3, interval: 3000 }, { type: 'football', count: 1, interval: 5500 }], delay: 20000 },
                { zombies: [{ type: 'cone', count: 4, interval: 2000 }, { type: 'bucket', count: 3, interval: 3000 }, { type: 'newspaper', count: 3, interval: 3500 }, { type: 'football', count: 2, interval: 5000 }], delay: 25000 }
            ]
        },
        {
            id: 5,
            name: '屋顶决战',
            sunInterval: 13000,
            waves: [
                { zombies: [{ type: 'normal', count: 3, interval: 2500 }], delay: 3000 },
                { zombies: [{ type: 'cone', count: 3, interval: 3000 }, { type: 'bucket', count: 2, interval: 4500 }], delay: 10000 },
                { zombies: [{ type: 'newspaper', count: 3, interval: 3500 }, { type: 'football', count: 2, interval: 5000 }], delay: 15000 },
                { zombies: [{ type: 'bucket', count: 3, interval: 3500 }, { type: 'newspaper', count: 3, interval: 3000 }, { type: 'football', count: 2, interval: 4500 }], delay: 20000 },
                { zombies: [{ type: 'cone', count: 5, interval: 2000 }, { type: 'bucket', count: 3, interval: 3000 }, { type: 'newspaper', count: 3, interval: 3500 }, { type: 'football', count: 2, interval: 4500 }], delay: 25000 }
            ]
        }
    ]
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}
