export function CreateCollisionAnimation(x, y, width, msToLive) {
    return {
        x: x,
        y: y,
        width: width,
        framesLeft: msToLive / (1000/60),
    }
}

export function CollisionAnimationsTick(collisionAnimations) {
    collisionAnimations.forEach((collisionAnimation, i) => {
        collisionAnimation.framesLeft--
        if (collisionAnimation.framesLeft <= 0) {
            collisionAnimations.splice(i, 1)
        }
    })
}
