import { CreateCollisionAnimation } from "./collisionAnimation";
import { getHomingMissileConfig } from "./ConfigProvider";
import { Howl} from "howler";

// xPosition -> [] -> missileTemplate
function missileTemplate(xPosition, angle, homingMissilesStats) {
    const config = getHomingMissileConfig();
    return {
        x: xPosition,
        y: 80,
        direction: createDirectionObject(angle, homingMissilesStats),
        speed: config.speed,
        angleSpeed: toRad(config.angleSpeedDeg),
        lifespan: config.lifespan,
        fallSpeed: config.fallSpeed,
    }
}

function createDirectionObject(angle, homingMissilesStats) {
    const direction = {
        x: 0,
        y: 1,
        angle: 0,
    }
    if (angle) {
        rotateDirectionObject(direction, angle);
    }
    return direction;
}

export function createMissile(platform, homingMissiles, homingMissilesStats) {
    if (!homingMissilesStats.shot) {
        for (let i = 0; i < homingMissilesStats.onScreen; i++) {
            let newMissile;
            let angleIncrease = 90/(homingMissilesStats.onScreen - 1);
            if (homingMissilesStats.onScreen == 1) {
                newMissile = missileTemplate(platform.x)
            }
            else {
                newMissile = missileTemplate(
                    platform.x - (homingMissilesStats.onScreen*20)/2 + i*20,
                    toRad(45 - angleIncrease*i))
                if (homingMissilesStats.onScreen === 5) {
                    if (i === 0 || i === 4) {
                        newMissile.speed *= 2;
                        newMissile.powerful = true;
                    }
                    else if (i === 1 || i === 3) {
                        newMissile.speed *= 1.5;
                        newMissile.mid = true;
                    }
                }
                else if (homingMissilesStats.onScreen === 3 || homingMissilesStats.onScreen === 4) {
                    if (i === 0 || i === homingMissilesStats.onScreen-1) {
                        newMissile.speed *= 1.5;
                        newMissile.mid = true;
                    }
                }
            }
            
            homingMissiles.push(newMissile);
        }

        const effect = new Howl({
            src: ['round.wav'],
            html5: true,
            volume: 0.25,
        })
        effect.play()

        homingMissilesStats.shot = true;
        setTimeout(() => {
            homingMissilesStats.shot = false;
        }, getHomingMissileConfig().cooldown)
    }
    
}

// missile. plates[] -> targetPLate
export function detectTarget(missile, targets) {
    const costCoordinates = targetsToCost(missile, targets)

    if (!costCoordinates.length)
        return null;

    const costs = costCoordinates.map(({cost}) => cost);
    const minCost = Math.min(...costs);
    const minCostIndex = costs.indexOf(minCost);

    return costCoordinates[minCostIndex];
}

// targetsToCost returns an array of {x, y, cost}
// getCoordinates takes a target and returns {x, y}
function targetsToCost(missile, targets) {
    return targets.map(target => {
        const {x, y} = target;
        const distance = (x - missile.x)**2 + (y - missile.y)**2;
        const angle = Math.abs(getAngleToPlate(missile, target));
        const cost = distance * angle**2;
        return { x: x, y: y, cost: cost };
    })
}

export function MoveHomingMissiles(homingMissiles, collisionAnimations, ...targets) {
    homingMissiles.forEach((missile, index) => {
        missile.lifespan--;
        if (missile.lifespan > 0) {
            const currentTarget = detectTarget(missile, targets.flat());
            moveMissile(missile, currentTarget);
        }
        else {
            freefallRotate(missile);
            freefallMissile(missile);
        }

        if (missile.y <= 0) {
            collisionAnimations.push(CreateCollisionAnimation(missile.x, missile.y, 25, 200));
            homingMissiles.splice(index, 1);
        }
    })
}

function moveMissile(missile, targetPlate) {
    // update direction
    if (targetPlate) {
        let theta = getAngleToPlate(missile, targetPlate);
        let rotationAngle = -Math.sign(theta) * Math.min(missile.angleSpeed, Math.abs(theta));
        rotateDirectionObject(missile.direction, rotationAngle);
    }

    // update position
    missile.x = missile.x + missile.direction.x * missile.speed;
    missile.y = missile.y + missile.direction.y * missile.speed;
}

export function rotateDirectionObject(direction, rotationAngle) {
    const mDir = {...direction}

    direction.angle += rotationAngle;
    direction.x = mDir.x * Math.cos(rotationAngle) - mDir.y * Math.sin(rotationAngle);
    direction.y = mDir.x * Math.sin(rotationAngle) + mDir.y * Math.cos(rotationAngle);
}

function freefallMissile(missile) {
    // update speed.x
    missile.speed = Math.max(missile.speed - missile.fallSpeed.x, 0);

    // update position
    missile.x = missile.x + missile.direction.x * missile.speed;
    missile.y = missile.y + missile.direction.y * missile.speed;

    missile.y -= missile.fallSpeed.y * Math.abs(missile.lifespan);
}

function freefallRotate(missile) {
    const direction = missile.direction;
    let rotationAngle = toRad(missile.fallSpeed.rotation);
    let freefallAngeDifference = toRad(180) - Math.abs(direction.angle);
    if (direction.angle !== toRad(180)) {
        if (freefallAngeDifference < rotationAngle) {
            rotationAngle = freefallAngeDifference;
        }
    }
    direction.angle += rotationAngle * Math.sign(direction.angle);
}

function getAngleToPlate(missile, plate) {
    let plateVector = {
        x: plate.x - missile.x,
        y: plate.y - missile.y,
    };
    return getSignedAngle(missile.direction, plateVector);
}

function getSignedAngle(mVec, pVec) {
    let cosTeta = (mVec.x*pVec.x + mVec.y*pVec.y) / Math.sqrt(pVec.x**2 + pVec.y**2);
    let theta = Math.acos(cosTeta);
    if (mVec.y*pVec.x - pVec.y*mVec.x < 0) {
        theta = -theta;
    }
    return theta
}

export function toRad(deg) {
    return deg * Math.PI / 180;
}
