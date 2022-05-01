import logo from './logo.svg';
import './App.css';
import React from 'react';

export function App() {
  const forceRerender = useForceRerender();

  const score = React.useRef(0);
  const misses = React.useRef(0);
  
  const platformX = React.useRef();
  const roundX = React.useRef(0);
  const roundY = React.useRef(0);
  const roundDisplay = React.useRef("None");
  const shot = React.useRef('none');

  const plate = React.useRef({
    x: 0,
    y: 0,
    width: 0,
    flightDiretion: 1,
    collisionAnimation: 'none',
    speed: 3,
    horizontalSpeed: 7,
    sprite: './speed1.png',
  })

  const parachute = React.useRef({
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
  })

  const collisionLocation = React.useRef({
    x: 0,
    y: 0,
  })

  const roundSpeed = 15;

  function CreateNewPlate() {
    plate.current.width = 80;
    plate.current.y = 0;
    plate.current.x = Math.floor(Math.random()*(window.innerWidth - 100) + 100);
    if (plate.current.x > window.innerWidth/2) {
      plate.current.flightDiretion = -1
    }
    else {plate.current.flightDiretion = 1}
  }

  function createParachute() {
    parachute.current.x = plate.current.x + 20; 
    parachute.current.y = plate.current.y + 20;
    parachute.current.width = plate.current.width;
    parachute.current.height = parachute.current.width*1.5;
    parachute.current.generated = true;
    if (parachute.current.x > window.innerWidth/2) {
      parachute.current.direction = -1
    }
    else {parachute.current.direction = 1}
  }

  function moveParachute() {
    parachute.current.x += parachute.current.xSpeed * parachute.current.direction;
    parachute.current.y -= parachute.current.ySpeed;
  }

  function CheckParachuteOutOfBounds() {
    if ((parachute.current.x > window.innerWidth || parachute.current.x < 0) || parachute.current.y < 0) {
      parachute.current.x = 0; 
      parachute.current.y = 0;
      parachute.current.width = 0;
      parachute.current.height = 0;
      parachute.current.generated = false;
    }
  }

  function parachuteCollision() {
    if (roundDisplay.current == 'Block') {
      if (roundY.current >= parachute.current.y || roundY.current <= (parachute.current.y + parachute.current.height)) {
      let rhCollision = (parachute.current.width/2)*
      (roundY.current - parachute.current.y) -
      (roundX.current - parachute.current.x)*
      (parachute.current.height);
      let lhCollision = (roundX.current - parachute.current.x)*( parachute.current.height) - (-parachute.current.width/2)*(roundY.current - parachute.current.y);

      if (rhCollision < 0 && lhCollision < 0) {
        parachuteCollisionAnimation()
        setTimeout(() => {
          collisionLocation.current.x = roundX.current;
          collisionLocation.current.y = roundY.current + 30;
          roundDisplay.current = 'none';
          roundX.current = 0;
          roundY.current = 0;
          parachuteCollisionAnimation()
          parachute.current.generated = false;
          parachute.current.x = 0; 
          parachute.current.y = 0;
          parachute.current.width = 0;
          parachute.current.height = 0;
          parachute.current.homingMissiles += 3;
        }, 200)
      }
    }
  }
    return false
  }

  React.useEffect(() => {
    // Initialization code
    CreateNewPlate();

    const intervalId = setInterval(() => {
      switch (score.current) {
        case 0:
          plate.current.speed = 3
          plate.current.horizontalSpeed = 7
          plate.current.sprite = './speed1.png'
          break
        case 10:  
          plate.current.speed = 6
          plate.current.horizontalSpeed = 1.5
          plate.current.sprite = './speed2.png'
          break
        case 20:
          plate.current.speed = 8
          plate.current.horizontalSpeed = 0.75
          plate.current.sprite = './speed3.png'
          break
        case 40:
          plate.current.speed = 12
          plate.current.horizontalSpeed = 0.5
          plate.current.sprite = './speed4.png'
          break
      }
      
      PlateFlyAway();
      CheckPlateOutOfBounds();

      detectCollision();
      DecrementPlateSize();

      if (parachute.current.generated) {
        moveParachute();
        parachuteCollision();
        CheckParachuteOutOfBounds();
      }

      MoveRound();
      
      forceRerender();
    }, 1000/60);

    return () => clearInterval(intervalId);
  }, []);

  // Move a plate by SPEED every frame
  function PlateFlyAway() {
    plate.current.y += plate.current.speed;
    plate.current.x += plate.current.flightDiretion * Math.sqrt(plate.current.y)/7
  }

  function CheckPlateOutOfBounds() {
    if (plate.current.y > (window.innerHeight - plate.current.width)) {
      CreateNewPlate();
      incrementMisses();
    }
  }

  function DecrementPlateSize() {
    plate.current.width -= plate.current.y / (2 * window.innerHeight)
  }

  function ShootRound() {
    roundDisplay.current = "Block";
    roundY.current = 80;
    roundX.current = platformX.current;
  }

  function MoveRound() {
    if (roundDisplay.current == "Block") {
        roundY.current += roundSpeed;
      if (roundX.current !== (plate.current.x + plate.current.width)) {
        if (roundY.current > window.innerHeight) {
          roundY.current = 80
          roundDisplay.current = "None"
        }
      }
      else if (roundY.current > window.innerHeight || roundY.current > plate.current.y) {
        roundY.current = 80
        roundDisplay.current = "None"
      }
    }
  }

  function incrementMisses() {
    if (isNaN(misses.current)) {
      return;
    }
    
    misses.current++;
    if (misses.current > 2) {
      if (score.current > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', score.current)
      }        
      misses.current = "loser";
      score.current = 0;
    }
  }

  function collisionAnimation() {
    if (plate.current.collisionAnimation == 'none') {
      plate.current.collisionAnimation = 'destruction'
    }
    else {
      plate.current.collisionAnimation = 'none'
    }
  }

  function parachuteCollisionAnimation() {
    if (parachute.current.collisionAnimation == 'none') {
      parachute.current.collisionAnimation = 'destruction'
    }
    else {
      parachute.current.collisionAnimation = 'none'
    }
  }

  function detectCollision() {
    if (misses.current === 'loser') {
      misses.current = 0;
    }

    let plateCenterX = plate.current.x + plate.current.width/2;
    let plateCenterY = plate.current.y + plate.current.width/2;
    let centerToRoundX = plateCenterX - roundX.current;
    let centerToRoundY = plateCenterY - roundY.current;
    let centerToRoundDistance = Math.sqrt(centerToRoundX*centerToRoundX + centerToRoundY*centerToRoundY) 

    if (roundDisplay.current == "Block" && centerToRoundDistance < plate.current.width) {
      collisionLocation.current.x = roundX.current;
      collisionLocation.current.y = roundY.current;
      collisionAnimation()
      roundY.current = 0;
      roundX.current = 0;
      roundDisplay.current = "None"
      score.current++
      createParachute();
      setTimeout(() => {
        collisionAnimation();
        CreateNewPlate();
      }, 200)
    }
  }

  function shotAnimation() {
    shot.current = 'shot';
    forceRerender();
    setTimeout(() => {
      shot.current = 'none'
    }, 100);
  }

  return (
    <div className="Container"
      onMouseMove={(e) => {
        if (e.clientX > 50 && e.clientX < (window.innerWidth - 50)) {
          platformX.current = e.clientX;
        }
      }}
      onClick={() => {
        ShootRound();
        shotAnimation();
      }}>
      <div className='score'>
        <div>Score: {score.current}</div>
        <div>{misses.current}</div>
        <div>Highscore {localStorage.getItem('highscore')}</div>
      </div>
      <div className='Platform' style={{left: platformX.current - 25}}>
        <img src='./manpad.png' width='50px'></img>
        <div className={`Gun ${shot.current}`}></div>
        {
          parachute.current.homingMissiles &&
          <div>{
            Array.apply(null, Array(parachute.current.homingMissiles)).map((_, i) =>
              <div className='homingIndicator' style={{
                bottom: 10 + i*10,
              }}></div>
            )
          }</div>
        }
      </div>
      <div className={`Plate ${plate.current.collisionAnimation}`} style={
          {
            left: plate.current.x - plate.current.width/2,
            bottom: plate.current.y,
            width: plate.current.width,
            height: plate.current.width / 2,
          }
        }>
        <img src={plate.current.sprite} width={plate.current.width} className = {`Direction${plate.current.flightDiretion}`}></img>
      </div>
      {
        plate.current.collisionAnimation !== "none" && 
        <div>
          <img src='./explosion.png' className={plate.current.collisionAnimation} style={{
            left: collisionLocation.current.x,
            bottom: collisionLocation.current.y,
            width: plate.current.width,
          }}></img>
        </div>
      }
      {
        parachute.current.collisionAnimation !== "none" && 
        <div>
          <img src='./explosion.png' className={parachute.current.collisionAnimation} style={{
            left: collisionLocation.current.x,
            bottom: collisionLocation.current.y - parachute.current.height/2,
            width: parachute.current.width,
          }}></img>
        </div>
      }
      <div className='Round' style={{
        display: roundDisplay.current,
        left: roundX.current,
        bottom: roundY.current,
      }}>
        <img src='./rocket.png' className='rocket'></img>
      </div>
      {
        parachute.current.generated &&
        <div>
          <img src='./chute.png' className='parachute' style={{
            left: parachute.current.x - parachute.current.width/2,
            bottom: parachute.current.y,
            width: parachute.current.width,
            height: parachute.current.height,
          }}></img>
        </div>
      }
    </div>
  );
}

export function App2() {
  const forceRerender = useForceRerender();
  const [counter, updateCounter] = useRefLikeUseState(0);
  const maxTick = React.useRef(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      updateCounter(counter() + 1);
      forceRerender();
    }, 1000/60);

    return () => clearInterval(intervalId);
  }, []);

  return <>
    <div>Count {counter()}</div>
    <button onClick={() => {
        if (counter() > maxTick) {
          maxTick.current = counter();
        }
        updateCounter(0);
        forceRerender();
      }}>
      Stop tick
    </button>
      <div>
        Max tick count: {maxTick.current}
      </div>
  </>
}

function useForceRerender() {
  const [, updateState] = React.useState();
  return () => updateState(new Date());
}

function useRefLikeUseState(initialVal) {
  const val = React.useRef(initialVal);

  return [
    () => val.current,
    (newVal) => val.current = newVal
  ]
}
