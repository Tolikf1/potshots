import { hitSfx } from "./audio"
import { bombCollision } from "./backfire"
import { CreateCollisionAnimation } from "./collisionAnimation"
import { getBossConfig } from "./ConfigProvider"
import { createFlare, flareTemplate } from "./flares"
import { rotateDirectionObject, toRad } from "./homingMissile"
import { SetScreenEffect } from "./utils"

export function createBoss(bossStats) {
    const boss = {
        x: window.innerWidth/2,
        y: 0.75 * window.innerHeight,
        width: 100,
        height: () => boss.width * 1.5,
        offsetHeight: () => boss.width / 4,
        hp: getBossConfig().hp.boss,
        attackLock: 'no',
        initialPosition: 'yes',
        hitBox: createHitBox(
            () => boss.width,
            () => boss.height(),
            () => boss.x - boss.width/2,
            () => boss.y - boss.height()*0.75,
            0, 
            () => {
                boss.hp--
            }),
        cannonCooldown: 180,
        roundsCooldown: 320,
        flaresCooldown: 240,
        stationaryTime: 60,
        direction: 1,
    }
    boss.leftWing = createWing(boss, true)
    boss.rightWing = createWing(boss, false)
    
    bossStats.boss = boss
}

function createWing(boss, isLeft) {
    const bossHpConfig = getBossConfig().hp
    
    const direction = isLeft && -1 || 1
    const _createBox = (wFunc, hFunc, xFunc, yFunc, onCollision) =>
        createHitBox(wFunc, hFunc, xFunc, yFunc,
            isLeft && 1 || 0, onCollision)
    const onWingHit = () => {
        wing.hp--
        if (wing.hp <= 0) {
            if (isLeft) {
                delete boss.leftWing
            }
            else {
                delete boss.rightWing
            }
        }
    }
    const wing = {
        hitBox1: _createBox(
            () => boss.width / 4,
            () => boss.width / 4,
            () => boss.x + direction * boss.width*0.5,
            () => boss.y - boss.width*0.5,
            onWingHit,
        ),
        hitBox2: _createBox(
            () => boss.width / 4,
            () => boss.width / 4,
            () => boss.x + direction * boss.width*1,
            () => boss.y - boss.width*0.75,
            onWingHit,
        ),
        roundLauncher: {
            ..._createBox(
                () => boss.width / 4,
                () => boss.width / 4,
                () => boss.x + direction * boss.width*0.75,
                () => boss.y - boss.width,
                () => {
                    wing.roundLauncher.hp--
                    if (wing.roundLauncher.hp <= 0) {
                        delete wing.roundLauncher
                    }
                }),
            hp: bossHpConfig.roundLauncher,
        },
        missileLauncher: {
            ..._createBox(
                () => boss.width * 1.5 / 10,
                () => boss.width * 1.5 / 10,
                () => boss.x + direction * boss.width*1.25,
                () => boss.y - boss.width,
                () => {
                    wing.missileLauncher.cooldown = 480
                }),
            cooldown: 480,
        },
        hp: bossHpConfig.wing,
    }

    return wing
}

function getBossBodyRect(boss) {
    const lowerLeft = {
        x: boss.x - boss.width/2,
        y: boss.y - boss.height()*0.75,
    }
    const upperRight = {
        x: lowerLeft.x + boss.width,
        y: lowerLeft.y + boss.height(),
    }

    return [lowerLeft, upperRight]
}

function createHitBox(widthFunc, heightFunc, 
    xFunc, yFunc, shouldOffsetByWidth, onCollision) {
    const box = {
        width: widthFunc,
        height: heightFunc,
        onCollision: onCollision
    }
    box.x = () => xFunc() 
        - shouldOffsetByWidth * box.width()
    box.y = () => yFunc()

    box.checkCollisionPoint = (x, y) => {
        return x >= box.x() 
            && x <= box.x() + box.width() 
            && y >= box.y() 
            && y <= box.y() + box.height()
    }

    return box
}

export function bossFrameRun(boss, bullets, boss_rounds, boss_missiles, flares, platform, collisionAnimations, bossStats) {
    bossMove(boss, platform, collisionAnimations, bossStats);

    moveBullet(bullets)
    moveBossRounds(boss_rounds)
    if (boss_missiles.length >= 0) {
        if (boss.flaresCooldown >= 0) {
            boss.flaresCooldown--
        }
        else {
            createBossFlare(boss, flares, 1);
            createBossFlare(boss, flares, -1);
            boss.flaresCooldown = 80
        }
    }
    fireBoss_missile(boss.leftWing, boss_missiles);
    fireBoss_missile(boss.rightWing, boss_missiles);
}

export function renderBoss(boss, bullets, boss_rounds, boss_missiles, flares, platform, collisionAnimations, bossStats) {
    const bossBodyRect = getBossBodyRect(boss)

    // bossMove(boss, platform, collisionAnimations, bossStats);

    // moveBullet(bullets)
    // moveBossRounds(boss_rounds)
    // if (boss_missiles.length >= 0) {
    //     if (boss.flaresCooldown >= 0) {
    //         boss.flaresCooldown--
    //     }
    //     else {
    //         createBossFlare(boss, flares, 1);
    //         createBossFlare(boss, flares, -1);
    //         boss.flaresCooldown = 80
    //     }
    // }
    // fireBoss_missile(boss.leftWing, boss_missiles);
    // fireBoss_missile(boss.rightWing, boss_missiles);

    return <>
        {
            renderWingHitboxes(boss.leftWing, 'left')
        }
        {
            renderWingHitboxes(boss.rightWing, 'right')
        }
        {
            boss.leftWing &&
            <div>
                <img src="boss_wing.png" className='boss_wing left' style={{
                    left: boss.leftWing.hitBox2.x() - 0.25 * boss.width,
                    bottom: boss.leftWing.hitBox2.y() - 0.3*boss.leftWing.hitBox2.height(),
                    width: 1.02 * boss.width,
                    height: boss.width / 2,
                }}></img>
                {
                    boss.leftWing.roundLauncher &&
                    <div>
                        <img src="boss_rounds.png" className='boss_wing' style={{
                            left: boss.leftWing.roundLauncher.x(),
                            bottom: boss.leftWing.roundLauncher.y(),
                            width: boss.leftWing.roundLauncher.width(),
                            height: boss.leftWing.roundLauncher.height(),
                    }}></img>
                    </div>
                }
                {
                    (boss.leftWing.missileLauncher.cooldown < 120) &&
                    <div>
                        <img src="boss_missiles.png" className='boss_wing' style={{
                            left: boss.leftWing.missileLauncher.x(),
                            bottom: boss.leftWing.missileLauncher.y(),
                            width: boss.leftWing.missileLauncher.width(),
                            height: boss.leftWing.missileLauncher.height(),
                    }}></img>
                    </div>
                }
            </div>
        }
        {
            boss.rightWing &&
            <div>
                <img src="boss_wing.png" className='boss_wing right' style={{
                    left: boss.rightWing.hitBox1.x() - 0.02 * boss.width,
                    bottom: boss.rightWing.hitBox1.y() - 1.3 *boss.rightWing.hitBox2.height(),
                    width: 1.02 * boss.width,
                    height: boss.width / 2,
                }}></img>
                {
                    boss.rightWing.roundLauncher &&
                    <div>
                        <img src="boss_rounds.png" className='boss_wing' style={{
                            left: boss.rightWing.roundLauncher.x(),
                            bottom: boss.rightWing.roundLauncher.y(),
                            width: boss.rightWing.roundLauncher.width(),
                            height: boss.rightWing.roundLauncher.height(),
                    }}></img>
                    </div>
                }
                {
                    (boss.rightWing.missileLauncher.cooldown < 120) &&
                    <div>
                        <img src="boss_missiles.png" className='boss_wing' style={{
                            left: boss.rightWing.missileLauncher.x(),
                            bottom: boss.rightWing.missileLauncher.y(),
                            width: boss.rightWing.missileLauncher.width(),
                            height: boss.rightWing.missileLauncher.height(),
                    }}></img>
                    </div>
                }
            </div>
        }
        <div className="hitbox bossBody" style={{
            left: boss.x - boss.width/2,
            bottom: boss.y - boss.height()*0.75,
            width: boss.width,
            height: boss.height(),
            // filter: 'invert(1)',
        }}>
            <img src="boss_body.png" width={boss.width*1.35} className='boss_body'></img>
        </div>
        <div className='bladesAssembly' style={{
            left: boss.x - boss.width * 1.5,
            bottom: boss.y + boss.offsetHeight()
        }}>
            <img src="boss_blades2.png" className='bladesLeft' style={{
                width: boss.width * 3,
            }}></img>
            {/* <img src="boss_blades.png" className='bladesRight' style={{
                width: boss.width * 1.5,
            }}></img> */}
        </div>
        <div className="hitbox bossBody" style={{
            left: boss.x,
            bottom: boss.y,
            width: 5,
            height: 5,
        }}></div>
        {
            bossBodyRect.map(({x, y}) => 
            <div className="hitbox bossBody" style={{
                left: x,
                bottom: y,
                width: 5,
                height: 5,
                filter: 'hue-rotate(180deg)'
            }}></div>)
        }
        {
            <div className="bossHPbox" style={{
                left: boss.x - 20,
                bottom: boss.y - 3,
                width: boss.width * 0.4,
                height: 0.15 * boss.width,
            }}>
                <div className="bossHP" style={{
                    width: 0.4 * boss.width * boss.hp / 400,
                    height: 0.2 * boss.width,
                    filter: `hue-rotate(${180 + 180 * boss.hp / 400}deg)`  
                }}></div>
            </div>
        }
        {
            bullets.map(bullet => 
            <div className="bullet" style={{
                left: bullet.x,
                bottom: bullet.y,
                height: 15,
                width: 3,
            }}>
            </div>)
        }
        {
            boss_rounds.map(round => 
            <div>
                <img src='./rocket.png' className="boss_roundRocket" style={{
                    left: round.x -2,
                    bottom: round.y,
                    width: 15
                }}></img>
                <div className='boss_roundRocketPropulsion' style={{
                    left: round.x -2,
                    bottom: round.y,
                }}></div>
            </div>)
        }
        {
            boss_missiles.filter(({x, y}) => 
            0 < x && x < window.innerWidth - 10
            && 20 < y && y < window.innerHeight).
            map(missile =>
            <div className="boss_roundRocket"  style={{
                    left: missile.x -7.5,
                    bottom: missile.y,
                    width: 30,
                    transform: `rotate(${-missile.direction.angle}rad)`
                }}>
                <img src='./rocket.png' width='30px' style={{
                    filter: 'invert(1)',
                }}></img>
                <div className='boss_roundRocketPropulsion boss_missile' style={{
                    height: missile.lifespan/10,
                }}></div>
            </div>)
        }
    </>
}

function renderWingHitboxes(wing, wingName) {
    const why = [
        'hitBox1',
        'hitBox2',
        'roundLauncher',
        'missileLauncher',
    ]
// Hitboxes are rendered here//

    // return <>
    //     { wing &&
    //         why.map(k => [k, wing[k]])
    //             .filter(([_, v]) => v)
    //             .map(([k, {x, y, width, height}]) => <>
    //             <div className={`hitbox ${k} ${wingName}`} style={{
    //                 left: x(),
    //                 bottom: y(),
    //                 width: width(),
    //                 height: height ? height() : 5
    //             }}>
    //             </div>
    //             <div className={`hitbox ${k} ${wingName}`} style={{
    //                 left: x(),
    //                 bottom: y(),
    //                 width: 3,
    //                 height: 3,
    //                 filter: 'hue-rotate(270deg)'
    //             }}></div>
                
    //             </>)
    //     }
    // </>
}

export function bossCollision(rounds, bossStats) {
    const boss = bossStats.boss;
    let hitBoxes = getBossHitboxes(boss)

    for (let i=0; i < rounds.length; i++) {
        for (let j=0; j < hitBoxes.length; j++) {
            if (hitBoxes[j].checkCollisionPoint(rounds[i].x, rounds[i].y)) {
                hitBoxes[j].onCollision()
                hitBoxes = getBossHitboxes(boss)
                CreateCollisionAnimation(rounds[i].x, rounds[i].y, 80, 200);
                rounds.splice(i, 1);
                i--
                break
            }
        }
    }
}

function getBossHitboxes(boss) {
    function getWingHitboxes(wing) {
        const wingParts = [wing.hitBox1, wing.hitBox2, 
            wing.roundLauncher, wing.missileLauncher]
        
        return wingParts.filter(p => p)
    }

    const hitBoxes = [boss.leftWing, boss.rightWing]
        .filter(w => w)
        .map(w => getWingHitboxes(w))
        .flat()
    hitBoxes.push(boss.hitBox)

    return hitBoxes
}

function createBullet(boss, bullets, collisionAnimations) {
    let bullet = {
        x: boss.x,
        y: boss.y - boss.height() + boss.offsetHeight(),
        speed: 5,
    }
    collisionAnimations.push(CreateCollisionAnimation(bullet.x - 5, bullet.y + 5, 10, 200))

    bullets.push(bullet)
}

export function fireCannon(boss, bullets, collisionAnimations) {
    if (boss.hp) {
        if (boss.cannonCooldown <= 0) {
            createBullet(boss, bullets, collisionAnimations)
            boss.cannonCooldown = 30
        }
        else {
            boss.cannonCooldown--
        }
    }
}

export function moveBullet(bullets) {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bullets[i].speed * 2
    }
}

export function bulletsCollision(bullets, platform, stats, collisionAnimations, screenEffect) {
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].y <= 30) {
            collisionAnimations.push(CreateCollisionAnimation(bullets[i].x - 10, bullets[i].y, 20, 200));
            if (Math.abs(bullets[i].x - platform.x) < 35) {
                stats.lives--
                SetScreenEffect(screenEffect, '-life', 15)
                hitSfx.play()
            }
            bullets.splice(i, 1);
            i--
        }
    }
}

function createBoss_rounds(boss_rounds, x, y, collisionAnimations) {
    let boss_round = {
        x: x,
        y: y - 5,
        speed: 4,
        width: 10
    }

    boss_rounds.push(boss_round);
    collisionAnimations.push(CreateCollisionAnimation(boss_round.x - 5, boss_round.y, 10, 200))
}

export function fireBossRounds(wing, boss_rounds, boss, collisionAnimations) {
    if (!wing.roundLauncher || !boss.hp)
        return

    let incrementX = wing.roundLauncher.width()/4;
    let incrementY = incrementX;
    let x = 0;
    let y = 0;
    let row;
    let fireIndex = boss.roundsCooldown % 15;
    if (0 < boss.roundsCooldown && boss.roundsCooldown <= 135) {
        if (boss.roundsCooldown <= 135
            && boss.roundsCooldown > 90) {
                row = 1;
            }
            else if (boss.roundsCooldown <= 90
            && boss.roundsCooldown > 45) {
                row = 2;
            }
            else if (boss.roundsCooldown <= 45) {
                row = 3;
            }
        if (fireIndex === 0) {
            let column = (Math.floor((boss.roundsCooldown % 45) / 15) + 2) % 3 + 1

            x = wing.roundLauncher.x() + column * incrementX;
            y = wing.roundLauncher.y() + row * incrementY;
            createBoss_rounds(boss_rounds, x, y, collisionAnimations)
            if (boss.roundsCooldown <= 0) {
                boss.roundsCooldown = 240
            }
        }
    }
    if (boss.roundsCooldown <= 0) {
        boss.roundsCooldown = 240
    }
}

export function moveBossRounds(boss_rounds) {
    for (let i = 0; i < boss_rounds.length; i++) {
        boss_rounds[i].y -= boss_rounds[i].speed * 2
    }
}

function createBossFlare(boss, flares, side) {
    const flare = flareTemplate(
        boss.x + side * (boss.width / 2 - 10), 
        boss.y - 4.5 * boss.offsetHeight() + 5, 
        side)
    flares.push(flare);
    boss.flaresCooldown = 40;
}

function createDirectionObject(angle) {
    const direction = {
        x: 0,
        y: -1,
        angle: toRad(180),
    }
    if (angle) {
        rotateDirectionObject(direction, angle);
    }
    return direction;
}

function boss_missileTemplate(wing, angle, boss_missiles) {
    return {
        x: wing.missileLauncher.x() + wing.missileLauncher.width()/2,
        y: wing.missileLauncher.y() + wing.missileLauncher.height()/2,
        direction: createDirectionObject(angle, boss_missiles),
        speed: 6,
        angleSpeed: Math.PI/180,
        lifespan: 180,
        fallSpeed: {
            x: 0.25,
            y: 1,
            rotation: 5
        },
        width: 50,
    }
}

function fireBoss_missile(wing, boss_missiles) {
    if (!wing) {
        return
    }
    if (wing.missileLauncher.cooldown > 0) {
        wing.missileLauncher.cooldown--
    }
    else {
        const angle = Math.PI / 180
        const boss_missile = boss_missileTemplate(wing, angle);
        boss_missiles.push(boss_missile);
        wing.missileLauncher.cooldown = 480;
    }
}

export function checkMissileCollision(boss_missiles, platform, stats, collisionAnimations, screenEffect) {
    for (let i = 0; i < boss_missiles.length; i++) {
        const boss_missile = boss_missiles[i];
        if (boss_missile.y < 10) {
            collisionAnimations.push(CreateCollisionAnimation(
                boss_missile.x,
                boss_missile.y,
                100,
                200,
            ))
            if (Math.abs(boss_missile.x - platform.x) < 35) {
                stats.lives--
                SetScreenEffect(screenEffect, '-life', 15)
                hitSfx.play()
            }
            boss_missiles.splice(i, 1)
            i--;
        }
    }
}

function bossMove(boss, platform, collisionAnimations, bossStats) {
    const hpPercentage = boss.hp / getBossConfig().hp.boss;
    const behaviorHpPercentages = getBossConfig().behaviorHpPercentages;

    const leftBound = () => 1.5 * boss.width;
    const rightBound = () => window.innerWidth - 1.5 * boss.width;
    const insideLeftBound = () => leftBound() < boss.x;
    const insideRightBound = () => boss.x < rightBound();
    const inBounds = () => insideLeftBound() && insideRightBound();

    const ySpeedBase = 2
    const xSpeedBase = 2

    if (!inBounds()) {

    }

    if (boss.initialPosition === 'yes') {
        boss.y += 0.5 * ySpeedBase;
        if (boss.y >= (window.innerHeight - boss.height())) {
            boss.initialPosition = 'no';
        }
    }
    if (hpPercentage <= behaviorHpPercentages.seeking) {
        if (boss.attackLock == 'no') {
            if (inBounds()) {
                boss.x += 2*boss.direction * xSpeedBase
            }
            else {
                boss.x = !insideLeftBound()
                    ? leftBound() + 5
                    : rightBound() - 5;
                boss.direction = -boss.direction
            }

            if (boss.y <= window.innerHeight - boss.height()) {
                boss.y += 1 * ySpeedBase
            }
            else {
                boss.attackLock = platform.x
                boss.direction = Math.sign(boss.attackLock - boss.x)
            }
        }
        else {
            boss.x += 3*boss.direction * xSpeedBase;
            boss.y -= 3 * ySpeedBase
            if (!inBounds() || Math.abs(boss.x - boss.attackLock) < 5 || boss.y < 225) {
                boss.attackLock = 'no'
            }
        }
    }
    else if (hpPercentage <= behaviorHpPercentages.diagonal) {
        if (inBounds()) {
            boss.x += boss.direction * 3 * xSpeedBase
            boss.y -= 0.5 * ySpeedBase
        }
        else if (boss.y <= window.innerHeight - boss.height()) {
            boss.y += 1 * ySpeedBase
        }
        else {
            boss.direction = - boss.direction
            boss.x += 3*boss.direction * xSpeedBase
        }
    }
    else {
        if (boss.stationaryTime <= 0) {
            boss.x += boss.direction * 2 * xSpeedBase;
            if (!inBounds()) {
                boss.direction = -boss.direction
            }
            if (boss.x == window.innerWidth / 2) {
                boss.stationaryTime = 60;
            }
        }
        else {
            boss.stationaryTime--
        }
    }
    if (boss.hp <= 0) {
        boss.x += boss.direction * xSpeedBase
        boss.y -= 5 * ySpeedBase
        let collisionX = Math.random() * boss.width / 2
        let collisionY = Math.random() * boss.width / 2
        collisionAnimations.push(CreateCollisionAnimation(boss.x + collisionX, boss.y + collisionY, 50, 200))

        if (boss.y <= 20) {
            collisionAnimations.push(CreateCollisionAnimation(boss.x - 200, boss.y - 200, 400, 200))
            setTimeout(bossStats.dead = true, 400)
        }
    }
}