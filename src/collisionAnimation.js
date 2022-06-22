import { Howl } from "howler";
import { explosion, playExplosion } from "./audio";

export function CreateCollisionAnimation(x, y, width, msToLive) {
    return {
        x: x,
        y: y,
        width: width,
        framesLeft: msToLive / (1000/60),
    }
}

export function CollisionAnimationsTick(collisionAnimations) {
    // const effect = new Howl({
    //     src: ['explosion.wav'],
    //     html5: true,
    //     volume: 0.5,
    //     onend: () => {unloadHowl(effect)}
    // })

    // function unloadHowl(howl) {
    //     howl.src = '';
    //     howl.currentSrc = null;
    //     howl.srcObject = null
    //     howl.unload();
    // }

    for (let i = 0; i < collisionAnimations.length; i++) {
        if (collisionAnimations[i].framesLeft == 12) {
            explosion.play()
        }
        collisionAnimations[i].framesLeft--
        if (collisionAnimations[i].framesLeft <= 0) {
            collisionAnimations.splice(i, 1)
        }
    }
}
