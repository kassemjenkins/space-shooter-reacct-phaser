import Phaser from 'phaser';
import Scene1 from './scenes/Scene1';
import Loader from './scenes/Loader'

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    scene: [Loader, Scene1]
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Phaser.Game(config);