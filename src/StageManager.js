import { createBomb } from './backfire';
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
    } = gameWorld;

    let existingPlateTypesCount = {}
    plates.forEach(({type}) => 
        existingPlateTypesCount[type] = 1 + (existingPlateTypesCount[type] ?? 0))

    let plateConfig = getPlateConfig(stats);
    plateConfig.forEach(({type, count}) => {
        let presentSpritesCount = existingPlateTypesCount[type] ?? 0
        for (let i = 0; i < (count - presentSpritesCount); i++) {
            CreateNewPlate(getPlateTypes()[type], plates, flares, bombs)
        }
    })
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
            console.log('a')
            x = window.innerWidth - 85
        }
        else {
            console.log('b')
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
    console.log(plate);
    if (willDeployFlares) {
        createFlare(plate, flares);
    }
    if (willBackfire) {
        createBomb(plate, bombs);
    }
    console.log('pushed')
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
