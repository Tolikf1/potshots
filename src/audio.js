import { Howl, Howler } from "howler"
import { useForceRerender } from "./App"

let _startedMusic = false
export const startedMusic = (newValue) => {
    _startedMusic = _startedMusic || newValue
    return _startedMusic
}

const audioLevelChanged = {
    listeners: [],
    addListener: (listener) => {
        audioLevelChanged.listeners.push(listener)
    },
    dispatch: (newVolume) => {
        audioLevelChanged.listeners
            .forEach(handler => {
                handler(newVolume)
            })
    }
}

export const mute = () => {
    Howler.volume(0)
    audioLevelChanged.dispatch(0)
}
export const unmute = () => {
    Howler.volume(1)
    audioLevelChanged.dispatch(1)
}
export const switchMute = () => {
    const onMute = isOnMute()
    onMute ? unmute() : mute()
}
export const isOnMute = () => Howler.volume() == 0

export function MuteButton({onSwitchMute}) {
    const forceRerender = useForceRerender()
    return <>
        <div className='muteButton' onClick={() => {
            switchMute()
            onSwitchMute && onSwitchMute()
            forceRerender()
        }}>
            { isOnMute() 
                && <i className="fa-solid fa-volume-mute mute"></i> 
                || <i className="fa-solid fa-volume-up mute"></i> }
        </div>
    </>
}

class AudioChannelPool {
    constructor(src, bufferSize, volume) {
        this.pool = Array(bufferSize).fill(null)
            .map(_ => ({audio: new Audio(src), busy: false}))
        this.pool.forEach(v => {
            v.audio.onended = () => v.busy = false
            audioLevelChanged.addListener(newVolume => {
                v.audio.volume = volume * newVolume
            })
        })
        this.pool.forEach(v =>
            v.audio.volume = volume)
    }

    play() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].busy) {
                this.pool[i].busy = true
                this.pool[i].audio.play()
                break
            }
        }
    }
}

export const missileLaunch = new AudioChannelPool('sfx/round.wav', 8, 0.1)
export const explosion = new AudioChannelPool('sfx/explosion.wav', 32, 0.3)
export const hitSfx = new AudioChannelPool('sfx/hit.mp3', 2, 1)
export const lifeSfx = new AudioChannelPool('sfx/life.mp3', 1, 1)
mute()

let music = () => ({
    battleMusicIntro: new Howl({
        src: ['music/battle_intro.mp3'],
        volume: 0.95,
        onend: () => battleMusicLoop.play(),
    }),
    battleMusicLoop: new Howl({
        src: ['music/battle_loop.mp3'],
        volume: 0.95,
        loop: true,
    }),
    menuMusic: new Howl({
        src: ['music/menu.mp3'],
        loop: true,
    }),
    endMusicBad: new Howl({
        src: ['music/end_bad.mp3'],
        volume: 0.25,
    }),
    endMusicGood: new Howl({
        src: ['music/end_good.mp3'],
        volume: 0.95,
    }),
})

const battleMusicIntro = new Howl({
    src: ['music/battle_intro.mp3'],
    volume: 0.95,
    onend: () => battleMusicLoop.play(),
})
const battleMusicLoop = new Howl({
    src: ['music/battle_loop.mp3'],
    volume: 0.95,
    loop: true,
})

export function playBattleMusic() {
    battleMusicIntro.play()
}

export function stopBattleMusic() {
    battleMusicIntro.stop()
    battleMusicLoop.stop()
}

export const menuMusic = new Howl({
    src: ['music/menu.mp3'],
    loop: true,
})
export const endMusicBad = new Howl({
    src: ['music/end_bad.mp3'],
    volume: 0.82,
})
export const endMusicGood = new Howl({
    src: ['music/end_good.mp3'],
    volume: 0.95,
})
