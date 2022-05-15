import { CreateCollisionAnimation } from "./collisionAnimation";

export function createBomb(plate, bombs) {
    if (plate.backfireCD !== 0) {
        plate.backfireCD--
    }
    else if (plate.y >= 300) {
        const bomb = bombTemplate(
            plate.x + plate.width / 2 * plate.flightDiretion, 
            plate.y, 
            plate.flightDiretion)
        bombs.push(bomb);
        if (plate.type === 'speed4') {
            plate.backfireCD = 10;
        }
        plate.backfireCD = 20;
    }
}

function bombTemplate(x, y, direction) {
    return {
        x: x,
        y: y,
        width: 10,
        speedX: 4,
        speedY: 0,
        direction: direction,
    }
}

export function moveBombs(bombs, platform, stats, collisionAnimations) {
    for (let i = 0; i < bombs.length; i++) {
        const bomb = bombs[i];
        if (bomb.y < 10) {
            collisionAnimations.push(CreateCollisionAnimation(
                bomb.x,
                bomb.y,
                100,
                200,
            ))
            if (Math.abs(bomb.x - platform.x) < 35) {
                stats.lives--
            }
            bombs.splice(i, 1)
            i--;
        }
        bomb.speedY++
        bomb.x += bomb.speedX * bomb.direction;
        bomb.y -= bomb.speedY/4; 
    }
}

export function bombCollision(bombs, rounds, homingMissiles, collisionAnimations, stats) {
    for (let i = 0; i < bombs.length; i++) {
        const projectile = collidingOneOfProjectiles(bombs[i], rounds, homingMissiles);
        if (projectile) {
            collisionAnimations.push(CreateCollisionAnimation(
                projectile.x,
                projectile.y,
                bombs[i].width,
                200,
            ));
            stats.bombsHit++;
            if (stats.bombsHit == 100) {
                stats.lives++
                stats.bombsHit = 0
            }
            bombs.splice(i, 1);
            i--;
            continue;
        }
    }
}

function collidingOneOfProjectiles(bomb, ...projectileArrays) {
    for (let i = 0; i < projectileArrays.length; i++) {
        for (let j = 0; j < projectileArrays[i].length; j++) {
            if (isColliding(bomb, projectileArrays[i][j])) {
                return projectileArrays[i].splice(j, 1)[0];
            }
        }
    }
    return null;
}

function isColliding(bomb, projectile) {
    const bombWidth = 40
    const bombRadii = bombWidth**2;
    const x = projectile.x - bomb.x
    const y = projectile.y - bomb.y;
    const distance = x**2 + y**2

    if (distance < bombRadii) {
        return true;
    }
    return false
}
