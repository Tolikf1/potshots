import logo from './logo.svg';
import './App.css';
import React, { useRef } from 'react';

export function App() {
  const forceRerender = useForceRerender();

  const _gameWorld = useRef({
    stats: {
      score: 0,
      misses: 0,
    },
    
    platform: {
      x: undefined
    },

    round: {
      x: 0,
      y: 0,
      speed: 15,
      display: "None",
      shot: 'none',
    },
  
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
  
    parachute: {
      generated: false,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      xSpeed: 3,
      ySpeed: 2,
      direction: 1,
      sprite: './chute.png',
      homingMissiles: 0,
      collisionAnimation: 'none',
    },
  
    collisionLocation: {
      x: 0,
      y: 0,
    },
  })

  React.useEffect(() => {
    // Initialization code
    CreateNewPlate(_gameWorld.current.plate);

    const intervalId = setInterval(() => {
      const {
        stats,
        platform,
        round,
        plate,
        parachute,
        collisionLocation,
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

      detectCollision(plate, round, stats, collisionLocation);
      DecrementPlateSize(plate);

      if (parachute.generated) {
        moveParachute(parachute);
        parachuteCollision(parachute);
        CheckParachuteOutOfBounds(parachute);
      }

      MoveRound(round, plate);
      
      forceRerender();
    }, 1000/60);

    return () => clearInterval(intervalId);
  }, []);


  function CreateNewPlate(plate) {
    plate.width = 80;
    plate.y = 0;
    plate.x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    if (plate.x > window.innerWidth/2) {
      plate.flightDiretion = -1
    }
    else {plate.flightDiretion = 1}
  }

  function createParachute(parachute, plate) {
    parachute.x = plate.x + 20; 
    parachute.y = plate.y + 20;
    parachute.width = plate.width;
    parachute.height = parachute.width*1.5;
    parachute.generated = true;
    if (parachute.x > window.innerWidth/2) {
      parachute.direction = -1
    }
    else {parachute.direction = 1}
  }

  function moveParachute(parachute) {
    parachute.x += parachute.xSpeed * parachute.direction;
    parachute.y -= parachute.ySpeed;
  }

  function CheckParachuteOutOfBounds(parachute) {
    if ((parachute.x > window.innerWidth || parachute.x < 0) || parachute.y < 0) {
      parachute.x = 0; 
      parachute.y = 0;
      parachute.width = 0;
      parachute.height = 0;
      parachute.generated = false;
    }
  }

  function parachuteCollision(round, parachute) {
    if (round.display == 'Block') {
      if (round.y >= parachute.y || round.y <= (parachute.y + parachute.height)) {
      let rhCollision = (parachute.width/2)* (round.y - parachute.y) - (round.x - parachute.x)*(parachute.height);
      let lhCollision = (round.x - parachute.x)*( parachute.height) - (-parachute.width/2)*(round.y - parachute.y);

      if (rhCollision < 0 && lhCollision < 0) {
        parachuteCollisionAnimation(parachute)
        setTimeout(() => {
          collisionLocation.x = round.x;
          collisionLocation.y = round.y + 30;
          round.display = 'none';
          round.x = 0;
          round.y = 0;
          parachuteCollisionAnimation(parachute)
          parachute.generated = false;
          parachute.x = 0; 
          parachute.y = 0;
          parachute.width = 0;
          parachute.height = 0;
          parachute.homingMissiles += 3;
        }, 200)
      }
    }
  }
    return false
  }

  // Move a plate by SPEED every frame
  function PlateFlyAway(plate) {
    plate.y += plate.speed;
    plate.x += plate.flightDiretion * Math.sqrt(plate.y)/7
  }

  function CheckPlateOutOfBounds(plate, stats) {
    if (plate.y > (window.innerHeight - plate.width)) {
      CreateNewPlate(plate);
      incrementMisses(stats);
    }
  }

  function DecrementPlateSize(plate) {
    plate.width -= plate.y / (2 * window.innerHeight)
  }

  function ShootRound(round, platform) {
    round.display = "Block";
    round.y = 80;
    round.x = platform.x;
  }

  function MoveRound(round, plate) {
    if (round.display == "Block") {
        round.y += round.speed;
      if (round.x !== (plate.x + plate.width)) {
        if (round.y > window.innerHeight) {
          round.y = 80
          round.display = "None"
        }
      }
      else if (round.y > window.innerHeight || round.y > plate.y) {
        round.y = 80
        round.display = "None"
      }
    }
  }

  function incrementMisses(stats) {
    if (isNaN(stats.misses)) {
      return;
    }
    
    stats.misses++;
    if (stats.misses > 2) {
      if (stats.score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', stats.score)
      }
      stats.misses = "loser";
      stats.score = 0;
    }
  }

  function collisionAnimation(plate) {
    if (plate.collisionAnimation == 'none') {
      plate.collisionAnimation = 'destruction'
    }
    else {
      plate.collisionAnimation = 'none'
    }
  }

  function parachuteCollisionAnimation(parachute) {
    if (parachute.collisionAnimation == 'none') {
      parachute.collisionAnimation = 'destruction'
    }
    else {
      parachute.collisionAnimation = 'none'
    }
  }

  function detectCollision(plate, round, stats, collisionLocation) {
    if (stats.misses === 'loser') {
      stats.misses = 0;
    }

    let plateCenterX = plate.x + plate.width/2;
    let plateCenterY = plate.y + plate.width/2;
    let centerToRoundX = plateCenterX - round.x;
    let centerToRoundY = plateCenterY - round.y;
    let centerToRoundDistance = Math.sqrt(centerToRoundX*centerToRoundX + centerToRoundY*centerToRoundY) 

    if (round.display == "Block" && centerToRoundDistance < plate.width) {
      collisionLocation.x = round.x;
      collisionLocation.y = round.y;
      collisionAnimation(plate)
      round.y = 0;
      round.x = 0;
      round.display = "None"
      stats.score++
      createParachute(parachute, plate);
      setTimeout(() => {
        collisionAnimation(plate);
        CreateNewPlate(plate);
      }, 200)
    }
  }

  function shotAnimation(round) {
    round.shot = 'shot';
    forceRerender();
    setTimeout(() => {
      round.shot = 'none'
    }, 100);
  }

  const {
    stats,
    platform,
    round,
    plate,
    parachute,
    collisionLocation,
  } = _gameWorld.current;

  return (
    <div className="Container"
      onMouseMove={(e) => {
        if (e.clientX > 50 && e.clientX < (window.innerWidth - 50)) {
          platform.x = e.clientX;
        }
      }}
      onClick={() => {
        ShootRound(round, platform);
        shotAnimation(round);
      }}>
      <div className='score'>
        <div>Score: {stats.score}</div>
        <div>{stats.misses}</div>
        <div>Highscore {localStorage.getItem('highscore')}</div>
      </div>
      <div className='Platform' style={{left: platform.x - 25}}>
        <img src='./manpad.png' width='50px'></img>
        <div className={`Gun ${round.shot}`}></div>
        {
          parachute.homingMissiles &&
          <div>{
            Array.apply(null, Array(parachute.homingMissiles)).map((_, i) =>
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
        plate.collisionAnimation !== "none" && 
        <div>
          <img src='./explosion.png' className={plate.collisionAnimation} style={{
            left: collisionLocation.x,
            bottom: collisionLocation.y,
            width: plate.width,
          }}></img>
        </div>
      }
      {
        parachute.collisionAnimation !== "none" && 
        <div>
          <img src='./explosion.png' className={parachute.collisionAnimation} style={{
            left: collisionLocation.x,
            bottom: collisionLocation.y - parachute.height/2,
            width: parachute.width,
          }}></img>
        </div>
      }
      <div className='Round' style={{
        display: round.display,
        left: round.x,
        bottom: round.y,
      }}>
        <img src='./rocket.png' className='rocket'></img>
      </div>
      {
        parachute.generated &&
        <div>
          <img src='./chute.png' className='parachute' style={{
            left: parachute.x - parachute.width/2,
            bottom: parachute.y,
            width: parachute.width,
            height: parachute.height,
          }}></img>
        </div>
      }
    </div>
  );
}

function useForceRerender() {
  const [, updateState] = React.useState();
  return () => updateState(new Date());
}
