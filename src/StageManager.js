import { getGameStages, getPlateTypes } from './ConfigProvider';

export function gameManager(gameWorld) {
    const {
        stats,
        platform,
        rounds,
        plates,
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
            CreateNewPlate(getPlateTypes()[type], plates)
        }
    })
}

// plateTemplate -> [ ] -> newPlate
function CreateNewPlate(plateTemplate, plates) {
    const x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    const plate = {
        x: x,
        y: 0,
        width: 80,
        flightDiretion: x > window.innerWidth/2 ? -1 : 1,
        ...plateTemplate,
    };

    plates.push(plate);
}

function getPlateConfig(stats) {
    const currentStage = getGameStages().slice().reverse()
        .find(stage => stage.startScore <= stats.score)
    return currentStage.plateConfig
}
