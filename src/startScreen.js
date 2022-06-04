import './ui.css';
import React from 'react';

export function StartScreen({setStartScreen}) {
    const [hintsHidden, updateHintsHidden] = React.useState(false)
    return <>
        <div className='container'>
            <div className='buttonSelector'>
                <div className='button' onClick={() => {
                    setStartScreen(false)
                }}>Start</div>
                <div className='button' onClick={() => {
                    updateHintsHidden(!hintsHidden)
                }}>Hints:</div>
                <div className='hints'>
                    { hintsHidden &&
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