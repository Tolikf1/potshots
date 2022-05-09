import { getHomingMissileConfig } from "./ConfigProvider";

// xPosition -> [] -> missileTemplate
function missileTemplate(xPosition) {
    return {
        x: xPosition,
        y: 80,
        direction: {
            x: 0,
            y: 1,
            angle: 0,
        },
        speed: getHomingMissileConfig().speed,
    }
}

export function createMissile(platform, stats, homingMissiles) {
    const isInfinite = getHomingMissileConfig().isInfinite
    if (!isInfinite && stats.homingMissiles <= 0) {
        return
    }
    
    const newMissile = missileTemplate(platform.x)
    homingMissiles.push(newMissile);
    stats.homingMissiles--
}

// missile. plates[] -> targetPLate
export function detectTarget(missile, plates) {
    let targetPlate = null;
    let minimalDistance = Infinity;
    plates.forEach(plate => {
        const distance = (plate.x - missile.x)**2 + (plate.y - missile.y)**2;
        if (distance !== 0 && distance < minimalDistance) {
            minimalDistance = distance;
            targetPlate = plate;
        }
    })
    
    return targetPlate;
}

export function MoveHomingMissiles(homingMissiles, plates) {
    homingMissiles.forEach(missile => {
        const currentTarget = detectTarget(missile, plates);
        moveMissile(missile, currentTarget);
    })
}

function moveMissile(missile, targetPlate) {
    // update direction
    const mDir = {...missile.direction}
    let plateVector = {
        x: targetPlate.x - missile.x,
        y: targetPlate.y - missile.y,
    };
    let theta = getSignedAngle(mDir, plateVector);
    let rotationAngle = - getDeltaTheta(theta);
    missile.direction.angle += rotationAngle;
    missile.direction.x = mDir.x * Math.cos(rotationAngle) - mDir.y * Math.sin(rotationAngle);
    missile.direction.y = mDir.x * Math.sin(rotationAngle) + mDir.y * Math.cos(rotationAngle);

    // update position
    missile.x = missile.x + missile.direction.x * missile.speed;
    missile.y = missile.y + missile.direction.y * missile.speed;
}

function getSignedAngle(mVec, pVec) {
    let cosTeta = (mVec.x*pVec.x + mVec.y*pVec.y) / Math.sqrt(pVec.x**2 + pVec.y**2);
    let theta = Math.acos(cosTeta);
    if (mVec.y*pVec.x - pVec.y*mVec.x < 0) {
        theta = -theta;
    }
    return theta
}

function getDeltaTheta(theta) {
    let maxRotation = getHomingMissileConfig().angleSpeedDeg * Math.PI/180;
    if (Math.abs(theta) > maxRotation) {
        if (theta < 0) {
            maxRotation = -maxRotation
        }
        return maxRotation
    }
    else {
        return theta
    }
}
