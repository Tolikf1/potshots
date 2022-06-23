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
import { createFlare, flareCollision, getFlarePoints, manageFlare } from './flares';
import { bombCollision, createBomb, moveBombs } from './backfire';
import { bossCollision, bossFrameRun, bulletsCollision, checkMissileCollision, fireBossRounds, fireCannon, moveBossRounds, moveBullet, renderBoss } from './boss';
import { StartScreen } from './startScreen';
import { EndScreen } from './endScreen';
import { MuteButton } from './audio';
import { FormatTimeElapsed, GetTimeElapsed } from './utils';

export const getInitialGameWorld = () => { return {
  stats: {
    score: 0,
    stage: 0,
    stageScore: 0,
    lives: 3,
    bombsHit: 0,

    starScreen: true,
    endScreen: false,
  },

  homingMissilesStats: {
    shot: false,
    onScreen: 0,
  },

  roundStats: {
    shot: false,
  },
  
  platform: {
    x: undefined
  },

  rounds: [],
  homingMissiles: [],
  plates: [],
  flares: [],
  bombs: [],
  parachutes: [],
  collisionAnimations: [],

  keysPressedPrev: {},
  keysPressed: {},

  paused: false,

  screenEffect: {
    present: false,
    type: null,
    ttl: 0,
    maxTtl: 0,
  },

  bossStats: {
    dead: false,
    boss: null,
    arrived: false,
  },

  bullets: [],
  boss_rounds: [],
  boss_missiles: [],
  
  startScreen: true,
  endScreen: false,
  time: {
    start: new Date(),
    elapsed: 0,
  }
}};

export function App() {
  const forceRerender = useForceRerender();

  const _gameWorld = useRef(getInitialGameWorld())

  React.useEffect(() => {
    const keydownEventListener = e => {
      _gameWorld.current.keysPressed[e.code] = 'down';
    }
    const keyupEventListener = e => {
      _gameWorld.current.keysPressed[e.code] = 'up';
    }
    document.addEventListener('keydown', keydownEventListener);
    document.addEventListener('keyup', keyupEventListener);

    const keyMappings = {
      'KeyX': () => {
        if (_gameWorld.current.keysPressed['KeyX'] !== 'down') {
          return;
        }

        createMissile(
          _gameWorld.current.platform,
          _gameWorld.current.homingMissiles,
          _gameWorld.current.homingMissilesStats
        );
        ShootRound(
          _gameWorld.current.rounds,
          _gameWorld.current.platform,
          _gameWorld.current.roundStats
        );
      },
      'KeyP': () => {
        if (_gameWorld.current.startScreen || _gameWorld.current.endScreen) {
          return
        }

        if (_gameWorld.current.keysPressed['KeyP'] === 'down' && 
          _gameWorld.current.keysPressedPrev['KeyP'] !== 'down') {
          _gameWorld.current.paused = !_gameWorld.current.paused;
          forceRerender();
        }
      }
    }

    let frame = 0;

    const intervalId = setInterval(() => {
      const {
        stats,
        platform,
        rounds,
        homingMissiles,
        plates,
        flares,
        bombs,
        parachutes,
        collisionAnimations,
        homingMissilesStats,
        keysPressed,
        roundStats,
        screenEffect,
        bullets,
        boss_rounds,
        boss_missiles,
        startScreen,
        endScreen,
        bossStats,
        time,
      } = _gameWorld.current;

      time.elapsed = GetTimeElapsed(time.start, new Date())

      // frame++;
      // if (frame%4 !== 0) {
      //   return;
      // }

      Object.keys(keysPressed).forEach(key => {
        if (keyMappings[key]) {
          keyMappings[key]();
        }
      });
      _gameWorld.current.keysPressedPrev = {...keysPressed};


      if (_gameWorld.current.paused 
        || _gameWorld.current.startScreen 
        || _gameWorld.current.endScreen) {
        return;
      }

      if (_gameWorld.current.stats.lives <= 0) {
        _gameWorld.current.endScreen = true;
        forceRerender();
        return;
      }

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

      MoveHomingMissiles(homingMissiles, collisionAnimations, plates, flares)

      manageFlare(flares);
      flareCollision(flares, rounds, homingMissiles, collisionAnimations);

      plates
        .filter(p => p.backfire)
        .forEach(p => createBomb(p, bombs));

      moveBombs(bombs, platform, stats, collisionAnimations, screenEffect);
      MoveHomingMissiles(boss_missiles, collisionAnimations, [{ x: platform.x - 18, y: 20 }])
      bombCollision(bombs, rounds, homingMissiles, collisionAnimations, stats, screenEffect);
      bombCollision(boss_rounds, rounds, homingMissiles, collisionAnimations, stats, screenEffect);
      bombCollision(boss_missiles, rounds, homingMissiles, collisionAnimations, stats, screenEffect);


      plates
        .filter(p => p.flares)
        .forEach(p => createFlare(p, flares));

      if (bossStats.boss && !bossStats.dead) {
        bossCollision(rounds, bossStats)
        bossCollision(homingMissiles, bossStats)
        fireCannon(bossStats.boss, bullets, collisionAnimations)
        bulletsCollision(bullets, platform, stats, collisionAnimations, screenEffect)
        bulletsCollision(boss_rounds, platform, stats, collisionAnimations, screenEffect)
        checkMissileCollision(boss_missiles, platform, stats, collisionAnimations, screenEffect)

        bossStats.boss.roundsCooldown--
        bossStats.boss.leftWing && fireBossRounds(bossStats.boss.leftWing, boss_rounds, bossStats.boss, collisionAnimations)
        bossStats.boss.rightWing && fireBossRounds(bossStats.boss.rightWing, boss_rounds, bossStats.boss, collisionAnimations)

        bossFrameRun(bossStats.boss, bullets, boss_rounds, boss_missiles, flares, 
          platform, collisionAnimations, bossStats)
      }

      // manage screen effects
      if (screenEffect.present) {
        screenEffect.ttl--
        if (screenEffect.ttl <= 0) {
          screenEffect.present = false
          screenEffect.type = ''
          screenEffect.maxTtl = 0
        }
      }
      
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
    flares,
    bombs,
    parachutes,
    collisionAnimations,
    homingMissiles,
    homingMissilesStats,
    paused,
    screenEffect,
    bossStats,
    bullets,
    boss_rounds,
    boss_missiles,
    startScreen,
    endScreen,
    time,
  } = _gameWorld.current;

  return <>
    {
    startScreen && <StartScreen 
      startGame={() => {
          _gameWorld.current.startScreen = false
          _gameWorld.current.time.start = new Date()
          _gameWorld.current.time.elapsed = 0
        }
      }
      forceRerender={forceRerender}/>
    || endScreen && <EndScreen 
        setStartScreen={val => _gameWorld.current.startScreen = val}
        initializeGameWorld={val => _gameWorld.current = val}
        stats={stats}
        forceRerender={forceRerender}
        setEndScreen={val => _gameWorld.current.endScreen = val}
        timeScore={_gameWorld.current.time.elapsed}
        />
    || <>
        <div className="Container"
          onMouseMove={(e) => {
            if (e.clientX > 50 && e.clientX < (window.innerWidth - 50)) {
              platform.x = e.clientX;
            }
          }}
          >
          <div className='Background'>
            <img src='./background.png'></img>
          </div>
          <div className='time'>
            {
              localStorage.getItem('highscore') && <>
              <div className='scoreBlock'>{localStorage.getItem('name')} &nbsp; <i className='fa-solid fa-crown'></i> &nbsp; {FormatTimeElapsed(localStorage.getItem('highscore'))}</div>
              </>
            }
            <div className='scoreBlock'><i className='fa-solid fa-stopwatch'></i> &nbsp; {FormatTimeElapsed(time.elapsed)}</div>
          </div>
          <div className='score'>
            <div className='scoreBlock'>{
              Array(5).fill(<div className='scoreBlock'></div>)
                .map((v, i) => i < stats.lives 
                  && <i className='fa-solid fa-heartbeat'></i>
                  || v).concat(stats.lives > 5 && <div className='scoreBlock'>&nbsp;+</div> || '')
            }</div>
            {
              <div className='scoreBlock'>{
                Array(5).fill(<div className='scoreBlock'></div>)
                .map((v, i) => i < homingMissilesStats.onScreen 
                  && <i className='fa-solid fa-rocket'></i>
                  || v)
              }</div>
              
            }
          </div>
          <div className='Platform' style={{left: platform.x - 25}}>
            <img src='./manpad.png' width='50px'></img>
            <div className={`Gun`}></div>
          </div>
          {
            plates
            .filter(({x, y}) => 
                0 < x && x < window.innerWidth - 10
                && 20 < y && y < window.innerHeight)
                .map((plate) =>
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
              .map((v, i) => <div className='HomingMissile' style={{
                display: "Block",
                left: v.x,
                bottom: v.y,
                height: v.lifespan/10,
                transform: `rotate(${-v.direction.angle}rad)`,
                filter: `${v.powerful ? 'invert(100%)' : v.mid ? '' : 'hue-rotate(45deg)'}`,
            }}>
              <img src='./missile.png' className='missileTail'></img>
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
                filter: 'invert(0.9)'
              }}></img>
            )
          }
          {
            flares.map(flare =>
              <>
              <div className='destruction' style={{
                  left: flare.x,
                  bottom: flare.y,
                  width: 5,
                  height: 5,
                }}>
              </div>
              {
                getFlarePoints(flare).map((p, i) => 
                  <div className={`test`} style={{
                    left: p[0],
                    bottom: p[1],
                    // width: 1 + i/4,
                    // height: 1 + i/4
                    width: 1 + p[2] * 2,
                    height: 1 + p[2] * 2,
                    opacity: flare.lifespan / 60
                  }}></div>)
              }
              </>
              )
          }
          {
            bombs
              .filter(({x, y}) => 
                0 < x && x < window.innerWidth - 10
                && 20 < y && y < window.innerHeight)
                .map(bomb =>
              <div className={`Direction${bomb.direction} bomb`} style={{
                  left: bomb.x,
                  bottom: bomb.y,
                  width: 20,
                  height: 10,
                }}>
                <img src='./bomb.png' className='bomb' style={{
                  width: 20,
                  height: 10,
                  transform: `scaleX(${bomb.direction})`
                }}></img>
              </div>
              )
          }
          {
            bossStats.boss && renderBoss(bossStats.boss, bullets, boss_rounds, boss_missiles, flares, platform, collisionAnimations, bossStats)
          }
        </div>
        {
          paused &&
          <div className='pausedContainer'>
            <div className='pauseWindow'>
              <div>Game paused</div>
              <div>press P to continue</div>
              <MuteButton/>
            </div>
          </div>
        }
        {
          screenEffect.present &&        
          <div className='effect' style={{
            backgroundColor: screenEffect.type === '+life'
              ? `rgba(0,255,0,${screenEffect.ttl/screenEffect.maxTtl * 0.15})`
              : screenEffect.type === '-life'
              ? `rgba(255,0,0,${screenEffect.ttl/screenEffect.maxTtl * 0.15})`
              : ''
          }}>
          </div>
        }
      </>
    }
  </>
}

export function useForceRerender() {
  const [, updateState] = React.useState();
  return () => updateState(new Date());
}
