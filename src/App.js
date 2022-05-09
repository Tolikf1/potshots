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
  MoveRound, 
  ShootRound, 
  shotAnimation 
} from './round';
import { CollisionAnimationsTick } from './collisionAnimation';
import { gameManager } from './GameManager';
import { createMissile, MoveHomingMissiles } from './homingMissile';

export function App() {
  const forceRerender = useForceRerender();

  const _gameWorld = useRef({
    stats: {
      score: 0,
      misses: 0,
      homingMissiles: 5,
    },
    
    platform: {
      x: undefined
    },

    rounds: [],
    homingMissiles: [],
    plates: [],
    parachutes: [],
    collisionAnimations: [],
  })

  React.useEffect(() => {
    const keydownEventListener = e => {
      if (e.code !== 'Space') {
        return
      }
      e.preventDefault()
      
      createMissile(_gameWorld.current.platform, _gameWorld.current.stats, _gameWorld.current.homingMissiles)
    }
    document.addEventListener('keydown', keydownEventListener)

    const intervalId = setInterval(() => {
      const {
        stats,
        platform,
        rounds,
        homingMissiles,
        plates,
        parachutes,
        collisionAnimations,
      } = _gameWorld.current;
      // const plate = gameWorld.plate;
      
      // checkScore(stats);

      gameManager(_gameWorld.current);

      PlateFlyAway(plates);
      CheckPlateOutOfBounds(plates, stats);

      CollisionAnimationsTick(collisionAnimations)

      detectCollision(plates, rounds, stats, collisionAnimations, parachutes);
      detectCollision(plates, homingMissiles, stats, collisionAnimations, parachutes);
      DecrementPlateSize(plates);

      if (parachutes.length) {
        moveParachute(parachutes);
        CheckParachuteOutOfBounds(parachutes);
        parachuteCollision(rounds, parachutes, collisionAnimations, stats);
        parachuteCollision(homingMissiles, parachutes, collisionAnimations, stats);
      }

      MoveRound(rounds);

      MoveHomingMissiles(homingMissiles, plates)
      
      forceRerender();
    }, 1000/60);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('keydown', keydownEventListener);
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
  } = _gameWorld.current;

  return (
    <div className="Container"
      onMouseMove={(e) => {
        if (e.clientX > 50 && e.clientX < (window.innerWidth - 50)) {
          platform.x = e.clientX;
        }
      }}
      onClick={() => {
        ShootRound(rounds, platform);
      }}
      onContextMenu={e => {
        e.preventDefault();
        createMissile(platform, stats, homingMissiles);
        console.log(homingMissiles)
      }}>
      <div className='score'>
        <div>Score: {stats.score}</div>
        <div>{stats.misses}</div>
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
          .map(v => <div className='Missile Round' style={{
            display: "Block",
            left: v.x,
            bottom: v.y,
            transform: `rotate(${-v.direction.angle}rad)`,
        }}>
          <img src='./rocket.png' className='rocket'></img>
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
