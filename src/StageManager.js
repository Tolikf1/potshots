import { createBomb } from './backfire';
import { createBoss } from './boss';
import { CreateCollisionAnimation } from './collisionAnimation';
import { getGameStages, getPlateTypes } from './ConfigProvider';
import { createFlare } from './flares';

export function gameManager(gameWorld) {
    const {
        stats,
        platform,
        rounds,
        plates,
        flares,
        bombs,
        parachutes,
        collisionAnimations,
        bossStats,
    } = gameWorld;

    let currentStage = getStageConfig(stats);
    let plateConfig = getPlateConfig(currentStage);

    if (currentStage.scoreToBeat === 'boss') {
        if (!bossStats.dead && !bossStats.boss) {
            createBoss(bossStats)
            bossStats.dead = false
            bossStats.boss.width = 1
        } 
        else if (bossStats.dead) {
            stats.stage++
            bossStats.dead = false
            bossStats.boss = null
        }
        else {
            if (bossStats.boss.width < 100) {
                const step = 75 * (bossStats.boss.width/100)**2
                bossStats.boss.width = Math.min(
                    bossStats.boss.width + step,
                    100
                )
            }
            else {
                bossStats.arrived = true
            }
        }
    }
    if (plateConfig) {
        let existingPlateTypesCount = {}
        plates.forEach(({type}) => 
            existingPlateTypesCount[type] = 1 + (existingPlateTypesCount[type] ?? 0))

        plateConfig.forEach(({type, count}) => {
            let presentSpritesCount = existingPlateTypesCount[type] ?? 0
            for (let i = 0; i < (count - presentSpritesCount); i++) {
                CreateNewPlate(getPlateTypes()[type], plates, flares, bombs)
            }
        })
    }
}

// plateTemplate -> [ ] -> newPlate
function CreateNewPlate(plateTemplate, plates, flares, bombs) {
    let x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    let y = 0;
    let backfireCD = 20;
    const side = Math.random()
    const levelMultiplier = parseInt(plateTemplate.sprite[7]);
    let willBackfire = (Math.random()*10 > 2 * levelMultiplier);
    const willDeployFlares = (Math.random()*10 > 2 / levelMultiplier);
    if (plateTemplate.type === 'speed4') {
        backfireCD = 10
        willBackfire = true;
        if (side > 0.5) {
            x = window.innerWidth - 85
        }
        else {
            x = 85
        } 
        y =  window.innerHeight - 100;
    }

    const plate = {
        x: x,
        y: y,
        width: 80,
        flightDiretion: x > window.innerWidth/2 ? -1 : 1,
        ...plateTemplate,
        flares: willDeployFlares,
        flaresCD: 30,
        backfire: willBackfire,
        backfireCD: backfireCD,
    };
    if (willDeployFlares) {
        createFlare(plate, flares);
    }
    if (willBackfire) {
        createBomb(plate, bombs);
    }
    plates.push(plate);
}

function getStageConfig(stats) {
    let currentStage = getGameStages()[stats.stage]
    if (currentStage.scoreToBeat != -1 && currentStage.scoreToBeat <= stats.stageScore) {
        stats.stage++
        stats.stageScore %= currentStage.scoreToBeat
        currentStage = getGameStages()[stats.stage]
    }
    return currentStage
}

function getPlateConfig(stage) {
    return stage.plateConfig
}
