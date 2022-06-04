export function SetScreenEffect(screenEffect, type, ttl) {
    screenEffect.present = true
    screenEffect.type = type
    screenEffect.ttl = ttl
    screenEffect.maxTtl = ttl
}
