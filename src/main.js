// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 20 * 64, // num tiles * tile size
    height: 15 * 64,
    zoom: 0.5,
    scene: [mapGen]
}

const game = new Phaser.Game(config);