import { getGameStages, getPlateTypes } from './ConfigProvider';
import { createFlare } from './flares';

export function gameManager(gameWorld) {
    const {
        stats,
        platform,
        rounds,
        plates,
        flares,
        parachutes,
        collisionAnimations,
    } = gameWorld;

    let existingPlateTypesCount = {}
    plates.forEach(({type}) => 
        existingPlateTypesCount[type] = 1 + (existingPlateTypesCount[type] ?? 0))

    let plateConfig = getPlateConfig(stats);
    plateConfig.forEach(({type, count}) => {
        let presentSpritesCount = existingPlateTypesCount[type] ?? 0
        for (let i = 0; i < (count - presentSpritesCount); i++) {
            CreateNewPlate(getPlateTypes()[type], plates, flares)
        }
    })
}

// plateTemplate -> [ ] -> newPlate
function CreateNewPlate(plateTemplate, plates, flares) {
    const x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    const levelMultiplier = parseInt(plateTemplate.sprite[7]);
    const willDeployFlares = (Math.random()*10 > 2 / levelMultiplier);
    const willBackfire = (Math.random()*10 > 2 * levelMultiplier);
    const plate = {
        x: x,
        y: 0,
        width: 80,
        flightDiretion: x > window.innerWidth/2 ? -1 : 1,
        ...plateTemplate,
        flares: willDeployFlares,
        flaresCD: 30,
        backfire: willBackfire,
        backfireCD: 60,
    };
    if (willDeployFlares) {
        createFlare(plate, flares);
    }

    plates.push(plate);
}

function getPlateConfig(stats) {
    let currentStage = getGameStages()[stats.stage]
    if (currentStage.scoreToBeat != -1 && currentStage.scoreToBeat <= stats.stageScore) {
        stats.stage++
        stats.stageScore %= currentStage.scoreToBeat
        currentStage = getGameStages()[stats.stage]
    }
    return currentStage.plateConfig
}
