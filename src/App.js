import logo from './logo.svg';
import './App.css';
import React, { useRef } from 'react';

import { 
  CreateNewPlate, 
  PlateFlyAway, 
  CheckPlateOutOfBounds, 
  detectCollision, 
  DecrementPlateSize,
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

export function App() {
  const forceRerender = useForceRerender();

  const _gameWorld = useRef({
    stats: {
      score: 0,
      misses: 0,
      homingMissiles: 0,
    },
    
    platform: {
      x: undefined
    },

    rounds: [],
  
    plate: {
      x: 0,
      y: 0,
      width: 0,
      flightDiretion: 1,
      collisionAnimation: 'none',
      speed: 3,
      horizontalSpeed: 7,
      sprite: './speed1.png',
    },
  
    parachutes: [],
  
    collisionAnimations: [],
  })

  React.useEffect(() => {
    // Initialization code
    CreateNewPlate(_gameWorld.current.plate);

    const intervalId = setInterval(() => {
      const {
        stats,
        platform,
        rounds,
        plate,
        parachutes,
        collisionAnimations,
      } = _gameWorld.current;
      // const plate = gameWorld.plate;
      switch (stats.score) {
        case 0:
          plate.speed = 3
          plate.horizontalSpeed = 7
          plate.sprite = './speed1.png'
          break
        case 10:  
          plate.speed = 6
          plate.horizontalSpeed = 1.5
          plate.sprite = './speed2.png'
          break
        case 20:
          plate.speed = 8
          plate.horizontalSpeed = 0.75
          plate.sprite = './speed3.png'
          break
        case 40:
          plate.speed = 12
          plate.horizontalSpeed = 0.5
          plate.sprite = './speed4.png'
          break
      }
      
      PlateFlyAway(plate);
      CheckPlateOutOfBounds(plate, stats);

      CollisionAnimationsTick(collisionAnimations)

      detectCollision(plate, rounds, stats, collisionAnimations, parachutes);
      DecrementPlateSize(plate);

      if (parachutes.length) {
        moveParachute(parachutes);
        CheckParachuteOutOfBounds(parachutes);
        parachuteCollision(rounds, parachutes, collisionAnimations, stats);
      }

      MoveRound(rounds);
      
      forceRerender();
    }, 1000/60);

    return () => clearInterval(intervalId);
  }, []);

  // console.log(_gameWorld.current)

  const {
    stats,
    platform,
    rounds,
    plate,
    parachutes,
    collisionAnimations,
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
      }}>
      <div className='score'>
        <div>Score: {stats.score}</div>
        <div>{stats.misses}</div>
        <div>Highscore {localStorage.getItem('highscore')}</div>
      </div>
      <div className='Platform' style={{left: platform.x - 25}}>
        <img src='./manpad.png' width='50px'></img>
        {/* <div className={`Gun ${round.shot}`}></div> */}
        <div className={`Gun`}></div>
        {
          stats.homingMissiles &&
          <div>{
            Array.apply(null, Array(stats.homingMissiles)).map((_, i) =>
              <div className='homingIndicator' style={{
                bottom: 10 + i*10,
              }}></div>
            )
          }</div>
        }
      </div>
      <div className={`Plate ${plate.collisionAnimation}`} style={
          {
            left: plate.x - plate.width/2,
            bottom: plate.y,
            width: plate.width,
            height: plate.width / 2,
          }
        }>
        <img src={plate.sprite} width={plate.width} className = {`Direction${plate.flightDiretion}`}></img>
      </div>
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
