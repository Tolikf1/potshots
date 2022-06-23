import './ui.css';
import React from 'react';
import { getInitialGameWorld, useForceRerender } from './App';
import { endMusicBad, endMusicGood, playBattleMusic, stopBattleMusic, MuteButton } from './audio';
import { FormatTimeElapsed } from './utils';

export function EndScreen({setStartScreen, initializeGameWorld, stats , forceRerender, setEndScreen, timeScore}) {
    const [name, updateName] = React.useState(false)
    React.useEffect(() => {
        stopBattleMusic()
        const endMusic = stats.lives
            ? endMusicGood
            : endMusicBad
        const endMusicId = endMusic.play()

        return () => endMusic.stop(endMusicId)
    }, [])

    return <>
        <div className='container'>
            {
                !stats.lives &&
                <div>
                    <div className='title'>WELL, AT LEAST YOU TRIED...</div>
                </div>
                ||
                <div>
                    <div className='title'>CONGRATS</div>
                    {
                        (!localStorage.getItem('highscore') || timeScore < localStorage.getItem('highscore')) &&
                        <>
                        <div className='highScoreBox'>
                            <div>You've set a new highscore</div>
                            <div>{FormatTimeElapsed(timeScore)}</div>
                            <div>Please input your name</div>
                            <input type='text' className='inputformline' placeholder='input your name here' onChange={e => updateName(e.target.value.trim())
                            }></input>
                            <div className='setButton' onClick={() => {
                                localStorage.setItem('highscore', timeScore)
                                localStorage.setItem('name', name)
                                forceRerender()
                            }}>SET</div>
                        </div>
                    </>                        
                    }
                </div>
            }
            <div className='buttonSelector'>
                <div className='button' onClick={() => {
                    initializeGameWorld(getInitialGameWorld())
                    forceRerender()
                }}>Home Screen</div>
                <div className='button' onClick={() => {
                    initializeGameWorld(getInitialGameWorld())
                    setStartScreen(false)
                    forceRerender()
                    playBattleMusic()
                }}>Restart</div>
                <MuteButton/>
            </div>
        </div>
    </>
}