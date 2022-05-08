import React from "react";

// const homingMissiles = [];

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
        speed: 25,
    }
}

export function createMissile(platform, stats, homingMissiles) {
    if (stats.homingMissiles <= 0) {
        return
    }
    
    const newMissile = missileTemplate(platform.x)
    homingMissiles.push(newMissile);
    stats.homingMissiles--
}

// homingMissiles{x,y,id}; plates{x,y,id} [] -> [{missileId -> targetId}]
// export function targetDetection(plates, homingMissiles) {
//     let missileIndex = 0;
//     let missileToTarget = [];
//     homingMissiles.forEach((missile, missileId) => {
//         let distance = 0;
//         let minimalDistance = 0;
//         let targetIndex = 0;
//         plates.forEach((plate, plateIndex) => {
//             distance = (plate.x - missile.x)**2 + (plate.y - missile.y)**2;
//             if (distance !== 0 && distance < minimalDistance) {
//                 minimalDistance = distance;
//                 targetIndex = plateIndex;
//             }
//         })
//         missileIndex = missileId;
//         missileToTarget.push({
//             missileIndex: missileId,
//             targetIndex: targetIndex,
//         })
//     })
    
//     return missileToTarget;
// }

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
    let maxRotation = Math.PI*7.5/180;
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


// export function detectCollision(plates, homingMissiles, missileToTarget, stats, collisionAnimations, parachutes) {
//     if (stats.misses === 'loser') {
//       stats.misses = 0;
//     }

//     plates.forEach((plate, missileToTarget) => {
//         const plateCenterX = plate.x + plate.width/2;
//         const plateCenterY = plate.y + plate.width/2;
//         const plateWidthSquared = plate.width * plate.width;

//         rounds.forEach((homingMissiles, missileToTarget) => {
//             const centerToRoundX = plateCenterX - missile.x;
//             const centerToRoundY = plateCenterY - missile.y;
//             const centerToRoundDistance = centerToRoundX*centerToRoundX + centerToRoundY*centerToRoundY
        
//             if (centerToRoundDistance < plateWidthSquared) {
//                 stats.score++

//                 collisionAnimations.push(CreateCollisionAnimation(
//                     missile.x,
//                     missile.y,
//                     plate.width,
//                     200,
//                 ))

//                 rounds.splice(roundIndex, 1)
//                 let probabilityOfEjection = (Math.random()*10) + 1;
//                 if (probabilityOfEjection <= 2) {
//                     createParachute(parachutes, plate);
//                 }

//                 plates.splice(plateIndex, 1);
//                 homingMissiles.splice(missileToTarget, 1)
//             }
//         })
//     })
// }