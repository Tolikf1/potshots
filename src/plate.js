import { incrementMisses } from "./round";
import { createParachute } from "./parachute";
import { CreateCollisionAnimation } from "./collisionAnimation";

export function CreateNewPlate(plate) {
    plate.width = 80;
    plate.y = 0;
    plate.x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    if (plate.x > window.innerWidth/2) {
      plate.flightDiretion = -1
    }
    else {plate.flightDiretion = 1}
  }

// Move a plate by SPEED every frame
export function PlateFlyAway(plate) {
    plate.y += plate.speed;
    plate.x += plate.flightDiretion * Math.sqrt(plate.y)/7
}

export function CheckPlateOutOfBounds(plate, stats) {
    if (plate.y > (window.innerHeight - plate.width)) {
        CreateNewPlate(plate);
        incrementMisses(stats);
    }
}

export function DecrementPlateSize(plate) {
    plate.width -= plate.y / (2 * window.innerHeight)
}

export function detectCollision(plate, rounds, stats, collisionAnimations, parachutes) {
    if (stats.misses === 'loser') {
      stats.misses = 0;
    }
  
    const plateCenterX = plate.x + plate.width/2;
    const plateCenterY = plate.y + plate.width/2;
    const plateWidthSquared = plate.width * plate.width;

    rounds.forEach((round, i) => {
        const centerToRoundX = plateCenterX - round.x;
        const centerToRoundY = plateCenterY - round.y;
        const centerToRoundDistance = centerToRoundX*centerToRoundX + centerToRoundY*centerToRoundY
    
        if (centerToRoundDistance < plateWidthSquared) {
            stats.score++

            collisionAnimations.push(CreateCollisionAnimation(
                round.x,
                round.y,
                plate.width,
                200,
            ))

            rounds.splice(i, 1)
            
            createParachute(parachutes, plate);
            CreateNewPlate(plate);
        }
    })
  }
