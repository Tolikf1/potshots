import { CreateCollisionAnimation } from "./collisionAnimation";

export function createFlare(plate, flares) {
    if (plate.flaresCD !== 0) {
        plate.flaresCD--
    }
    else {
        const flare = flareTemplate(plate.x, plate.y, plate.direction)
        flares.push(flare);
        plate.flaresCD = 30;
    }
}

function flareTemplate(x, y) {
    return {
        x: x,
        y: y,
        width: 10,
        lifespan: 60,
        direction: 1,
    }
}

export function manageFlare(flares) {
    for (let i = 0; i < flares.length; i++) {
        const flare = flares[i];
        if (flare.width < 60) {
            flare.width++
        }
        flare.lifespan--
        if (flare.lifespan == 0) {
            flares.splice(i, 1)
            i--
        } 
    }
}

export function flareCollision(flares, rounds, homingMissiles, collisionAnimations) {
    for (let i = 0; i < flares.length; i++) {
        const projectile = collidingOneOfProjectiles(flares[i], rounds, homingMissiles);
        if (projectile) {
            flares.splice(i, 1);
            i--;
            collisionAnimations.push(CreateCollisionAnimation(
                projectile.x,
                projectile.y,
                flares[i].width,
                200,
            ));
            continue;
        }
    }
}

function collidingOneOfProjectiles(flare, ...projectileArrays) {
    for (let i = 0; i < projectileArrays.length; i++) {
        for (let j = 0; j < projectileArrays[i].length; j++) {
            if (isColliding(flare, projectileArrays[i][j])) {
                return projectileArrays[i].splice(j, 1)[0];
            }
        }
    }
    return null;
}

function isColliding(flare, projectile) {
    const x1 = flare.x;
    const x2 = x1 + flare.direction * flare.width;
    const x3 = x1 +  flare.direction * flare.width * Math.cos(Math.PI / 3);
    const y1 = flare.y;
    const y2 = y1;
    const y3 = y1 - flare.width * Math.sin(Math.Pi / 3);
    const flareArea = Math.abs((x2 - x1)*(y3 - y1) - (x3 - x1)*(y2 - y1));

    let area1 = Math.abs(
        (x1 - projectile.x)*(y2 - projectile.y) - (x2 - projectile.x)*(y1 - projectile.y));
    let area2 = Math.abs(
        (x2 - projectile.x)*(y3 - projectile.y) - (x3 - projectile.x)*(y2 - projectile.y));
    let area3 = Math.abs(
        (x3 - projectile.x)*(y1 - projectile.y) - (x1 - projectile.x)*(y3 - projectile.y));

    if (Math.abs(area1+area2+area3 - flareArea) < 0.01) {
        return true;
    }
    return false
}
