import { CreateCollisionAnimation } from "./collisionAnimation";

export function createParachute(parachute, plate) {
    parachute.x = plate.x + 20; 
    parachute.y = plate.y + 20;
    parachute.width = plate.width;
    parachute.height = parachute.width*1.5;
    parachute.generated = true;
    if (parachute.x > window.innerWidth/2) {
      parachute.direction = -1
    }
    else {parachute.direction = 1}
  }
  
  export function moveParachute(parachute) {
    parachute.x += parachute.xSpeed * parachute.direction;
    parachute.y -= parachute.ySpeed;
  }
  
  export function CheckParachuteOutOfBounds(parachute) {
    if ((parachute.x > window.innerWidth || parachute.x < 0) || parachute.y < 0) {
      parachute.x = 0; 
      parachute.y = 0;
      parachute.width = 0;
      parachute.height = 0;
      parachute.generated = false;
    }
  }
  
  export function parachuteCollision(rounds, parachute, collisionAnimations) {
    let x1 = parachute.x;
    let y1 = parachute.y;
    let x2 = parachute.x - parachute.width/2;
    let y2 = parachute.y + parachute.height;
    let x3 = parachute.x + parachute.width/2;
    let y3 = y2;
    let parachuteArea = Math.abs((x2 - x1)*(y3 - y1) - (x3 - x1)*(y2 - y1));

    rounds.forEach((round, i) => {
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

            rounds.splice(i, 1)

            parachute.generated = false;
            parachute.x = 0; 
            parachute.y = 0;
            parachute.width = 0;
            parachute.height = 0;
            parachute.homingMissiles += 3;
        }
    })
  }

  export function parachuteCollisionAnimation(parachute) {
    if (parachute.collisionAnimation == 'none') {
      parachute.collisionAnimation = 'destruction'
    }
    else {
      parachute.collisionAnimation = 'none'
    }
  }