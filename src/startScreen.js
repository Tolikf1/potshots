import './ui.css';
import React from 'react';
import { hitSfx, isOnMute, lifeSfx, menuMusic, MuteButton, playBattleMusic, startedMusic, switchMute } from './audio';
import { useForceRerender } from './App';

export function StartScreen({startGame, forceRerender}) {
    const [hintsHidden, updateHintsHidden] = React.useState(localStorage.getItem('hintsClicked'))
    const [startEnabled, updateStartEnabled] = React.useState(true)

    React.useEffect(() => {
        if (startedMusic() && !isOnMute()) {
            playMusic()
        }
    }, [])

    const musicEndAction = React.useRef(() => {})
    const musicStarted = React.useRef(false)
    const playMusic = () => {
        menuMusic.play()
        menuMusic.fade(0, 1, 5000)

        musicEndAction.current = () => {
            menuMusic.fade(1, 0, 500)
            setTimeout(() => menuMusic.stop(), 500)
        }
        musicStarted.current = true
    }

    return <>
        <div className='container'>
            <div>
                <div className='title'>POTSHOTS</div>
            </div>
            <div className='buttonSelector'>
                <MuteButton onSwitchMute={() => {
                        if (!musicStarted.current) {
                            playMusic()
                            startedMusic(true)
                        }
                    }}
                />
                <div className='button' disabled={!startEnabled} onClick={() => {
                    if (musicStarted.current) {
                        setTimeout(() => {
                            musicEndAction.current()
                            startGame()
                            playBattleMusic()
                        }, 500)
                    }
                    else {
                        startGame()
                        playBattleMusic()
                        startedMusic(true)
                    }
                    localStorage.setItem('hintsClicked', true)
                    updateStartEnabled(false)
                }}>Start</div>
                <div className='button' onClick={() => {
                    updateHintsHidden(!hintsHidden)
                }}>Controls and Mechanics</div>
                <div className='hints'>
                    { !hintsHidden &&
                    <>
                        <div className='hintsRow'>Use<i className="fa-solid fa-mouse awesomePadding"></i>to move a shooter sideways</div>
                        <div className='hintsRow'>Press X key on a <i className="fa-regular fa-keyboard awesomePadding"></i> to shoot</div>
                        <div className='hintsRow'>Press P key to pause the game</div>
                        <div className='hintsRow'>
                            <div className='infoIconRow'>
                                Shoot down parachutes to earn homing missile
                                <div>
                                    <i className="fa-solid fa-info-circle infoIcon"></i>
                                    <div className='legalInformationBox'>
                                        <div className='legalInformation'>
                                            Please notice that shooting down catapulted pilots in real life is a grave war crime punished by the international law (even if pilot is a russian)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
        </div>
    </>
}