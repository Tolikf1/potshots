import { CreateCollisionAnimation } from "./collisionAnimation";
import { getHomingMissileConfig, getParachuteConfig } from "./ConfigProvider";

export function createParachute(parachutes, plate) {
    const config = getParachuteConfig()
    const parachute = {
        x: plate.x + 20,
        y: plate.y + 20,
        width: plate.width,
        xSpeed: config.xSpeed,
        ySpeed: config.ySpeed,
    }
    parachute.height = parachute.width*1.5
    parachute.direction = parachute.x > window.innerWidth/2
        ? -1
        : 1
    
    parachutes.push(parachute)
}
  
export function moveParachute(parachutes) {
    parachutes.forEach(parachute => {
        parachute.x += parachute.xSpeed * parachute.direction;
        parachute.y -= parachute.ySpeed;
    })
}
  
export function CheckParachuteOutOfBounds(parachutes) {
    parachutes.forEach((parachute, i) => {
        if ((parachute.x > window.innerWidth || parachute.x < 0) || parachute.y < 0) {
            parachutes.splice(i, 1)
        }
    })
}
  
export function parachuteCollision(rounds, parachutes, collisionAnimations, homingMissilesStats) {
    for (let i = 0; i < parachutes.length; i++) {
        const parachute = parachutes[i];
        let x1 = parachute.x;
        let y1 = parachute.y;
        let x2 = parachute.x - parachute.width/2;
        let y2 = parachute.y + parachute.height;
        let x3 = parachute.x + parachute.width/2;
        let y3 = y2;
        let parachuteArea = Math.abs((x2 - x1)*(y3 - y1) - (x3 - x1)*(y2 - y1));

        for (let j = 0; j < rounds.length; j++) {
            const round = rounds[j];
            let area1 = Math.abs((x1 - round.x)*(y2 - round.y) - (x2 - round.x)*(y1 - round.y));
            let area2 = Math.abs((x2 - round.x)*(y3 - round.y) - (x3 - round.x)*(y2 - round.y));
            let area3 = Math.abs((x3 - round.x)*(y1 - round.y) - (x1 - round.x)*(y3 - round.y));

            if (Math.abs(area1+area2+area3 - parachuteArea) < 0.01) {
                collisionAnimations.push(CreateCollisionAnimation(
                    round.x,
                    round.y,
                    parachute.width,
                    200,
                ))

                homingMissilesStats.onScreen = Math.min(
                    homingMissilesStats.onScreen + 1,
                    getHomingMissileConfig().maxOnScreen)

                rounds.splice(j, 1)
                parachutes.splice(i, 1)
                i--;
                break;
            }
        }
    }
}