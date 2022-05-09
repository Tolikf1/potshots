import configRaw from './gameConfig/gameConfig.yaml'
const yaml = require('js-yaml')

let config = {}
fetch(configRaw)
  .then(r => r.text())
  .then(text => {
    config = yaml.load(text)

    const plateTypes = config.plateTypes
    Object.keys(plateTypes).forEach(k => plateTypes[k].type = k)
  });

export function getConfig() {
    return config
}

export function getPlateTypes() {
    return config.plateTypes
}

export function getGameStages() {
    return config.gameStages
}

export function getRoundConfig() {
    return config.round
}

export function getHomingMissileConfig() {
    return config.homingMissile
}

export function getParachuteConfig() {
    return config.parachute
}