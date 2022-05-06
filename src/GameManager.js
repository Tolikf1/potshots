import React from "react";
import { createPlate, detectCollision } from "./plate";

import stagesRaw from './gameConfig/stages.yaml'
import plateTypesRaw from './gameConfig/plateTypes.yaml'

const yaml = require('js-yaml')

let stages = []
fetch(stagesRaw)
  .then(r => r.text())
  .then(text => {
    stages = yaml.load(text)
  });

let plateTypes = []
fetch(plateTypesRaw)
  .then(r => r.text())
  .then(text => {
    plateTypes = yaml.load(text)
  });

export function gameManager(gameWorld) {
    const {
        stats,
        platform,
        rounds,
        plates,
        parachutes,
        collisionAnimations,
    } = gameWorld;

    // console.log(stages_parsed)

    let plateConfig = getPlateTemplate(stats);
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
    const currentStage = stages.slice().reverse()
        .find(stage => stage.startScore <= stats.score)
    return currentStage.plateConfig
}
