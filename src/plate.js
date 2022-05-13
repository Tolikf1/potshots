import { incrementMisses } from "./round";
import { createParachute } from "./parachute";
import { CreateCollisionAnimation } from "./collisionAnimation";
import { getParachuteConfig } from "./ConfigProvider";

export function createPlate(x, y, width, flightDiretion, collisionAnimation, speed, horizontalSpeed, sprite, flares, flaresCD, backfire, backfireCD) {
    return {
        x: x,
        y: y,
        width: width,
        flightDiretion: flightDiretion,
        collisionAnimation: collisionAnimation,
        speed: speed,
        horizontalSpeed: horizontalSpeed,
        sprite: sprite,
        flares: flares,
        flaresCD: flaresCD,
        backfire: backfire,
        backfireCD: backfire
    }
}

export function checkScore(stats, plate) {
    if (stats.score >=40) {
        plate.speed = 12
        plate.horizontalSpeed = 0.35
        plate.sprite = './speed4.png'
    }
    else if (stats.score >=20) {
        plate.speed = 8
        plate.horizontalSpeed = 2
        plate.sprite = './speed3.png'
    }
    else if (stats.score >=10) {
        plate.speed = 6
        plate.horizontalSpeed = 3
        plate.sprite = './speed2.png'
    }
    else if (stats.score >=0) {
        plate.speed = 3
        plate.horizontalSpeed = 7
        plate.sprite = './speed1.png'
    }
}

export function CreateNewPlate(plates, stats) {
    const x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    const plate = createPlate(
        x,
        0,
        80,
        x > window.innerWidth/2 ? -1 : 1,
        '',
        0,
        0,
        '',
        false,
        false
    )

    checkScore(stats, plate);

    plates.push(plate);
  }

// Move a plate by SPEED every frame
export function PlateFlyAway(plates) {
    plates.forEach(plate => {
        plate.y += plate.speed;
        plate.x += plate.flightDiretion * Math.sqrt(plate.y)/plate.horizontalSpeed;
    })
}

export function CheckPlateOutOfBounds(plates, homingMissilesStats) {
    for (let i = 0; i < plates.length; i++) {
        const plate = plates[i];
        if (plate.y > (window.innerHeight - plate.width)) {
            plates.splice(i, 1);
            i--;
            homingMissilesStats.onScreen = Math.max(
                homingMissilesStats.onScreen - 1,
                1)
        }
    }
}

export function DecrementPlateSize(plates) {
    plates.forEach(plate => {
        plate.width -= plate.y / (2 * window.innerHeight)
    })
}

export function detectCollision(plates, rounds, stats, collisionAnimations, parachutes) {
    if (stats.misses === 'loser') {
      stats.misses = 0;
    }

    for (let i = 0; i < plates.length; i++) {
        const plate = plates[i];
        const plateCenterX = plate.x + plate.width/2;
        const plateCenterY = plate.y + plate.width/2;
        const plateWidthSquared = plate.width * plate.width;

        for (let j = 0; j < rounds.length; j++) {
            const round = rounds[j];
            const centerToRoundX = plateCenterX - round.x;
            const centerToRoundY = plateCenterY - round.y;
            const centerToRoundDistance = centerToRoundX*centerToRoundX + centerToRoundY*centerToRoundY
        
            if (centerToRoundDistance < plateWidthSquared) {
                stats.score++
                stats.stageScore++

                collisionAnimations.push(CreateCollisionAnimation(
                    round.x,
                    round.y,
                    plate.width,
                    200,
                ))

                rounds.splice(j, 1)
                let probabilityOfEjection = (Math.random()*100);
                if (probabilityOfEjection <= getParachuteConfig().chance) {
                    createParachute(parachutes, plate);
                }

                plates.splice(i, 1)
                i--;
                break;
            }
        }
    }
}
