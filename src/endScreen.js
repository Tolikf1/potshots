import './ui.css';
import React from 'react';
import { getInitialGameWorld, useForceRerender } from './App';

export function EndScreen({setStartScreen, initializeGameWorld, stats , forceRerender, setEndScreen}) {
    const [name, updateName] = React.useState(false)
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
                }}>Restart</div>
                {
                    stats.score > localStorage.getItem('highscore') &&
                    <>
                        <div className='highScoreBox'>
                            <div>You've set a new highscore</div>
                            <div>Please input your name</div>
                            <input type='text' className='inputformline' placeholder='input your name here' onChange={e => updateName(e.target.value.trim())
                            }></input>
                            <div className='setButton' onClick={() => {
                                localStorage.setItem('highscore', stats.score)
                                localStorage.setItem('name', name)
                                forceRerender()
                            }}>SET</div>
                        </div>
                    </>
                    
                }
            </div>
        </div>
    </>
}