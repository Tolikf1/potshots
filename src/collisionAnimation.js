export function CreateCollisionAnimation(x, y, width, msToLive) {
    return {
        x: x,
        y: y,
        width: width,
        framesLeft: msToLive / (1000/60),
    }
}

export function CollisionAnimationsTick(collisionAnimations) {
    for (let i = 0; i < collisionAnimations.length; i++) {
        collisionAnimations[i].framesLeft--
        if (collisionAnimations[i].framesLeft <= 0) {
            collisionAnimations.splice(i, 1)
        }
    }
}
