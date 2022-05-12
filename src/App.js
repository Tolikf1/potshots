import logo from './logo.svg';
import './App.css';
import React, { useRef } from 'react';

import { 
  CreateNewPlate, 
  PlateFlyAway, 
  CheckPlateOutOfBounds, 
  detectCollision, 
  DecrementPlateSize,
  checkScore,
} from './plate';

import { 
  moveParachute, 
  parachuteCollision, 
  CheckParachuteOutOfBounds
} from './parachute';

import { 
  CreateRound,
  MoveRound, 
  ShootRound, 
  shotAnimation 
} from './round';
import { CollisionAnimationsTick } from './collisionAnimation';
import { gameManager } from './StageManager';
import { createMissile, MoveHomingMissiles } from './homingMissile';

export function App() {
  const forceRerender = useForceRerender();

  const _gameWorld = useRef({
    stats: {
      score: 0,
      stage: 0,
      stageScore: 0,

      misses: 0,
    },

    homingMissilesStats: {
      shot: false,
      onScreen: 1,
    },
    
    platform: {
      x: undefined
    },

    rounds: [],
    homingMissiles: [],
    plates: [],
    parachutes: [],
    collisionAnimations: [],

    keysPressed: {},
  })

  React.useEffect(() => {
    const keydownEventListener = e => {
      // e.preventDefault()
      // console.log('down:', e);
      _gameWorld.current.keysPressed[e.code] = '';
      // if (e.code === 'KeyZ') {
      //   createMissile(
      //     _gameWorld.current.platform,
      //     _gameWorld.current.homingMissiles,
      //     _gameWorld.current.homingMissilesStats
      //   )
      //   ShootRound(
      //     _gameWorld.current.rounds,
      //     _gameWorld.current.platform)
      // }
    }
    const keyupEventListener = e => {
      // console.log('up:', e)
      delete _gameWorld.current.keysPressed[e.code];
    }
    document.addEventListener('keydown', keydownEventListener);
    document.addEventListener('keyup', keyupEventListener);

    const keyMappings = {
      'KeyZ': () => createMissile(
        _gameWorld.current.platform,
        _gameWorld.current.homingMissiles,
        _gameWorld.current.homingMissilesStats
      ),
      'KeyX': () => ShootRound(
        _gameWorld.current.rounds,
        _gameWorld.current.platform
      ),
    }

    const intervalId = setInterval(() => {
      const {
        stats,
        platform,
        rounds,
        homingMissiles,
        plates,
        parachutes,
        collisionAnimations,
        homingMissilesStats,
        keysPressed,
      } = _gameWorld.current;

      Object.keys(keysPressed).forEach(key => {
        if (keyMappings[key]) {
          keyMappings[key]();
        }
      })

      gameManager(_gameWorld.current);

      PlateFlyAway(plates);
      CheckPlateOutOfBounds(plates, homingMissilesStats);

      CollisionAnimationsTick(collisionAnimations)

      detectCollision(plates, rounds, stats, collisionAnimations, parachutes);
      detectCollision(plates, homingMissiles, stats, collisionAnimations, parachutes);
      DecrementPlateSize(plates);

      if (parachutes.length) {
        moveParachute(parachutes);
        CheckParachuteOutOfBounds(parachutes);
        parachuteCollision(rounds, parachutes, collisionAnimations, homingMissilesStats);
        parachuteCollision(homingMissiles, parachutes, collisionAnimations, homingMissilesStats);
      }

      MoveRound(rounds);

      MoveHomingMissiles(homingMissiles, plates, collisionAnimations)
      
      forceRerender();
    }, 1000/60);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('keydown', keydownEventListener);
      document.removeEventListener('keyup', keyupEventListener);
    }
  }, []);

  // console.log(_gameWorld.current)

  const {
    stats,
    platform,
    rounds,
    plates,
    parachutes,
    collisionAnimations,
    homingMissiles,
    homingMissilesStats,
  } = _gameWorld.current;

  return (
    <div className="Container"
      onMouseMove={(e) => {
        if (e.clientX > 50 && e.clientX < (window.innerWidth - 50)) {
          platform.x = e.clientX;
        }
      }}
      >
      <div className='score'>
        <div>Score: {stats.score}</div>
        <div>Missiles: {homingMissilesStats.onScreen}</div>
        <div>Highscore {localStorage.getItem('highscore')}</div>
      </div>
      <div className='Platform' style={{left: platform.x - 25}}>
        <img src='./manpad.png' width='50px'></img>
        <div className={`Gun`}></div>
      </div>
      {
        plates.map((plate) =>
          <div className="Plate" style={
              {
                left: plate.x - plate.width/2,
                bottom: plate.y,
                width: plate.width,
                height: plate.width / 2,
              }
            }>
            <img src={plate.sprite} width={plate.width} className = {`Direction${plate.flightDiretion}`}></img>
          </div>
        )
      }
      {
        collisionAnimations.map(collisionAnimation => 
          <img src='./explosion.png' className='destruction' style={{
            left: collisionAnimation.x,
            bottom: collisionAnimation.y,
            width: collisionAnimation.width,
          }}></img>
        )
      }
      {
        rounds.map(v => <div className='Round' style={{
            display: "Block",
            left: v.x,
            bottom: v.y,
        }}>
          <img src='./rocket.png' className='rocket'></img>
        </div>)
      }
      {
        homingMissiles
          .filter(({x, y}) => 
            0 < x && x < window.innerWidth - 10
            && 20 < y && y < window.innerHeight)
          .map(v => <div className='Round' style={{
            display: "Block",
            left: v.x,
            bottom: v.y,
            height: v.lifespan/10,
            transform: `rotate(${-v.direction.angle}rad)`,
        }}>
          <img src='./missile.png' className='rocket'></img>
        </div>)
      }
      {
        parachutes.map(parachute => 
          <img src='./chute.png' className='parachute' style={{
            position: 'absolute',
            left: parachute.x - parachute.width/2,
            bottom: parachute.y,
            width: parachute.width,
            height: parachute.height,
          }}></img>
        )
      }
    </div>
  );
}

function useForceRerender() {
  const [, updateState] = React.useState();
  return () => updateState(new Date());
}
