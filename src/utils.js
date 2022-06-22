export function SetScreenEffect(screenEffect, type, ttl) {
    screenEffect.present = true
    screenEffect.type = type
    screenEffect.ttl = ttl
    screenEffect.maxTtl = ttl
}

export function GetTimeElapsed(start, end) {
    return end - start
}

export function FormatTimeElapsed(elapsed) {
    const m = Math.floor(elapsed / 1000 / 60)
    const s = Math.floor(elapsed / 1000) % 60
    const ms = Math.floor(elapsed) % 1000
    
    return (
        `${m}`.padStart(2, '0') + ':' 
        + `${s}`.padStart(2, '0') + ':' 
        + `${ms}`.padStart(3, '0')
    )
}
