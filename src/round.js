import { getRoundConfig } from "./ConfigProvider";
import { Howl } from "howler";
import { missileLaunch } from "./audio";

export function CreateRound(x, y) {
    return {
        x: x,
        y: y,
        speed: getRoundConfig().speed,
    }
}

export function ShootRound(rounds, platform, roundStats) {
    if (!roundStats.shot) {
        const round = CreateRound(
            platform.x,
            40,
        )
        rounds.push(round)

        missileLaunch.play()
    
        roundStats.shot = true;
        setTimeout(() => {
            roundStats.shot = false;
        }, getRoundConfig().cooldown)
    }
}
  
export function MoveRound(rounds) {
    rounds.forEach((round, i) => {
        round.y += round.speed;
        if (round.y > window.innerHeight) {
            rounds.splice(i, 1)
        }
    })
}
  
export function incrementMisses(stats) {
    if (isNaN(stats.misses)) {
        return;
    }

    stats.misses++;
    if (stats.misses > 2) {
        if (stats.score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', stats.score)
        }
        stats.misses = "loser";
        stats.score = 0;
        stats.stage = 0;
        stats.stageScore = 0;
    }
}
  