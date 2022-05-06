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

    let [plateOnScreenCount, plateTemplate] = getPlateTemplate(stats);
    for (let i = 0; i < (plateOnScreenCount - plates.length); i++) {
        CreateNewPlate(plateTemplate, plates)
    }
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
    let plateTemplate = {
        speed: 0,
        horizontalSpeed: 0,
        sprite: '',
    }
    let plateOnScreenCount = 1;
    if (stats.score >=40) {
        plateOnScreenCount = 1;
        plateTemplate.speed = 12
        plateTemplate.horizontalSpeed = 0.35
        plateTemplate.sprite = './speed4.png'
    }
    else if (stats.score >=20) {
        plateOnScreenCount = 1;
        plateTemplate.speed = 8
        plateTemplate.horizontalSpeed = 2
        plateTemplate.sprite = './speed3.png'
    }
    else if (stats.score >=10) {
        plateOnScreenCount = 1;
        plateTemplate.speed = 6
        plateTemplate.horizontalSpeed = 3
        plateTemplate.sprite = './speed2.png'
    }
    else if (stats.score >=5) {
        plateOnScreenCount = 2;
        plateTemplate.speed = 3
        plateTemplate.horizontalSpeed = 7
        plateTemplate.sprite = './speed1.png'
    }
    else if (stats.score >=0) {
        plateTemplate.speed = 3
        plateTemplate.horizontalSpeed = 7
        plateTemplate.sprite = './speed1.png'
    }
    return [plateOnScreenCount, plateTemplate]
}