import React from "react";
import { createPlate, detectCollision } from "./plate";

export function gameManager(gameWorld) {
    const {
        stats,
        platform,
        rounds,
        plates,
        parachutes,
        collisionAnimations,
    } = gameWorld;

    let plateConfig = getPlateTemplate(stats);
    // let {count, type} = plateConfig[0];
    plateConfig.forEach(({type, count}) => {
        let presentSpritesCount = 0;
        plates.forEach(({sprite}) => {
            if (sprite.includes(type)) {
                presentSpritesCount++
            }
        })
        
        for (let i = 0; i < (count - presentSpritesCount); i++) {
            CreateNewPlate(plateTypes[type], plates)
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
        speed: plateTemplate.speed,
        horizontalSpeed: plateTemplate.horizontalSpeed,
        sprite: plateTemplate.sprite,
    };

    plates.push(plate);
}

function getPlateTemplate(stats) {
    let plateConfig = []
    if (stats.score >=40) {
        plateConfig = [
            {
                count: 1,
                type: 'speed4',
            }
        ]
    }
    else if (stats.score >=20) {
        plateConfig = [
            {
                count: 1,
                type: 'speed3',
            }
        ]
    }
    else if (stats.score >=15) {
        plateConfig = [
            {
                count: 1,
                type: 'speed2',
            },
            {
                count: 1,
                type: 'speed1',
            }
        ]
    }
    else if (stats.score >=10) {
        plateConfig = [
            {
                count: 1,
                type: 'speed2',
            }
        ]
    }
    else if (stats.score >=5) {
        plateConfig = [
            {
                type: 'speed1',
                count: 2,
            }
        ]
    }
    else if (stats.score >=0) {
        plateConfig = [
            {
                type: 'speed1',
                count: 1,
            },
        ]
    }
    return plateConfig
}

const plateTypes = {
    'speed1': {
        speed: 3,
        horizontalSpeed: 7,
        sprite: './speed1.png',
    },
    'speed2': {
        speed: 6,
        horizontalSpeed: 3,
        sprite: './speed2.png',
    },
    'speed3': {
        speed: 8,
        horizontalSpeed: 2,
        sprite: './speed3.png',
    },
    'speed4': {
        speed: 12,
        horizontalSpeed: 0.35,
        sprite: './speed4.png',
    }
}
