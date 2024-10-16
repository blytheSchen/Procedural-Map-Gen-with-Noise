class mapGen extends Phaser.Scene {
    constructor() {
        super("mapGen");
    }

    preload() {
        this.load.path = "./assets/"
        this.load.image("mapTiles", "mapPack_spritesheet.png"); 
        document.getElementById('description').innerHTML = '<h2>mapGen.js<br>R = regen map<br>, = zoom in<br>. = zoom out<br>T = toggle mushroom visibility</h2>\n'
    }

    create() {
        this.mapWidth = 20;
        this.mapHeight = 15;
        this.frequency = 10;
        
        this.blankTile = 97;
        this.waterTile = 56;
        this.grassTile = 40;
        this.dirtTile = 105;
        this.shroomTile1 = 62;
        this.shroomTile2 = 48;

        this.grassPlacement = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ];

        this.dirtPlacement = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ];

        this.shroomPlacement = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ];

        // fill background with water
        let waterTileArray = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ];

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                waterTileArray[y][x] = this.waterTile;
            }
        }

        this.waterMap = this.make.tilemap({
            data: waterTileArray,
            tileWidth: 64,
            tileHeight: 64
        })

        this.tilesheet = this.waterMap.addTilesetImage("mapTiles");
        this.waterLayer = this.waterMap.createLayer(0, this.tilesheet, 0, 0);

        noise.seed(Math.random());

        this.setMapVals();

        this.regen = this.input.keyboard.addKey('R');
        this.toggleShrooms = this.input.keyboard.addKey('T');
        this.zoomIn = this.input.keyboard.addKey('COMMA');
        this.zoomOut = this.input.keyboard.addKey('PERIOD');
    }

    setMapVals() {
        this.genVals = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ];

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                let n = noise.perlin2(x / this.frequency, y / this.frequency); // basically zoom in
                n = (n + 1.0) / 2.0;

                this.genVals[y][x] = n;
            }
        }

        console.log(this.genVals); // essentially an array of heights

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                this.grassPlacement[y][x] = this.blankTile;
                this.dirtPlacement[y][x] = this.blankTile;
                this.shroomPlacement[y][x] = this.blankTile;

                if (this.genVals[y][x] > 0.67) {
                    this.dirtPlacement[y][x] = this.dirtTile; //dirt
                    this.grassPlacement[y][x] = this.grassTile;
                }
                else if (this.genVals[y][x] > 0.5) {
                    this.grassPlacement[y][x] = this.grassTile; //grass
                }
                // remaining vals are for blank areas/water
            }
        }

        this.setGrassTransition();
        this.setDirtTransition();
        this.setShrooms();

        this.dirtMap = this.make.tilemap({
            data: this.dirtPlacement,
            tileWidth: 64,
            tileHeight: 64
        })

        this.grassMap = this.make.tilemap({
            data: this.grassPlacement,
            tileWidth: 64,
            tileHeight: 64
        })

        this.shroomMap = this.make.tilemap({
            data: this.shroomPlacement,
            tileWidth: 64,
            tileHeight: 64
        })

        this.grassLayer = this.grassMap.createLayer(0, this.tilesheet, 0, 0);
        this.dirtLayer = this.dirtMap.createLayer(0, this.tilesheet, 0, 0);
        this.shroomLayer = this.shroomMap.createLayer(0, this.tilesheet, 0, 0);
    }

    setShrooms() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.grassPlacement[y][x] == this.grassTile && this.dirtPlacement[y][x] == this.blankTile) // if the tile has grass ONLY
                {
                    if (this.genVals[y][x] > 0.66) {
                        this.shroomPlacement[y][x] = this.shroomTile1;
                    }
                    else if (this.genVals[y][x] < 0.54 && this.genVals[y][x] > 0.53) {
                        this.shroomPlacement[y][x] = this.shroomTile2;
                    }
                }
                else
                {
                    this.shroomPlacement[y][x] = this.blankTile;
                }
            }
        }
    }

    setGrassTransition() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {

                // decide on transition depending on current tile type and where it is touching water
                if (this.grassPlacement[y][x] == this.grassTile) { // for grass
                    if (x < this.mapWidth -1 && this.grassPlacement[y][x + 1] == this.blankTile) { // right
                        this.grassPlacement[y][x] = 26;
                    }
                    else if (x > 0 && this.grassPlacement[y][x - 1] == this.blankTile) { // left
                        this.grassPlacement[y][x] = 54;
                    }

                    if (y < this.mapHeight - 1 && this.grassPlacement[y + 1][x] == this.blankTile) { // under
                        this.grassPlacement[y][x] = 10;

                        if (x < this.mapWidth - 1 && this.grassPlacement[y][x + 1] == this.blankTile) { // under and right
                            this.grassPlacement[y][x] = 11;
                        }
                        else if (x > 0 && this.grassPlacement[y][x - 1] == this.blankTile) { // under and left
                            this.grassPlacement[y][x] = 24;
                        }
                    }
                    else if (y > 0 && this.grassPlacement[y - 1][x] == this.blankTile) { // above
                        this.grassPlacement[y][x] = 55;

                        if (x < this.mapWidth - 1 && this.grassPlacement[y][x + 1] == this.blankTile) { // above and right
                            this.grassPlacement[y][x] = 41;
                        }
                        else if (x > 0 && this.grassPlacement[y][x - 1] == this.blankTile) { // above and left
                            this.grassPlacement[y][x] = 69;
                        }
                    }
                }
            }
        }
    }

    setDirtTransition() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {

                // decide on transition depending on current tile type and where it is touching water
                if (this.dirtPlacement[y][x] == this.dirtTile) { // for grass
                    if (x < this.mapWidth -1 && this.dirtPlacement[y][x + 1] == this.blankTile) { // right
                        this.dirtPlacement[y][x] = 91;
                    }
                    else if (x > 0 && this.dirtPlacement[y][x - 1] == this.blankTile) { // left
                        this.dirtPlacement[y][x] = 119;
                    }

                    if (y < this.mapHeight - 1 && this.dirtPlacement[y + 1][x] == this.blankTile) { // under
                        this.dirtPlacement[y][x] = 75;

                        if (x < this.mapWidth - 1 && this.dirtPlacement[y][x + 1] == this.blankTile) { // under and right
                            this.dirtPlacement[y][x] = 76;
                        }
                        else if (x > 0 && this.dirtPlacement[y][x - 1] == this.blankTile) { // under and left
                            this.dirtPlacement[y][x] = 104;
                        }
                    }
                    else if (y > 0 && this.dirtPlacement[y - 1][x] == this.blankTile) { // above
                        this.dirtPlacement[y][x] = 120;

                        if (x < this.mapWidth - 1 && this.dirtPlacement[y][x + 1] == this.blankTile) { // above and right
                            this.dirtPlacement[y][x] = 106;
                        }
                        else if (x > 0 && this.dirtPlacement[y][x - 1] == this.blankTile) { // above and left
                            this.dirtPlacement[y][x] = 134;
                        }
                    }
                }
            }
        }
    }

    update() {
        if(Phaser.Input.Keyboard.JustDown(this.regen)) {
            console.log("regenerating map!");
            this.scene.restart();
        }

        if(Phaser.Input.Keyboard.JustDown(this.toggleShrooms)) {
            console.log("toggling shroom visibility");
            
            if (this.shroomLayer.visible == true) {
                this.shroomLayer.setVisible(false);
            }
            else {
                this.shroomLayer.setVisible(true);
            }
        }

        if(Phaser.Input.Keyboard.JustDown(this.zoomIn)) {
            console.log("in");

            this.frequency += 0.3;

            this.grassMap.destroy();
            this.dirtMap.destroy();
            this.shroomMap.destroy();
            this.setMapVals();
        }

        if(Phaser.Input.Keyboard.JustDown(this.zoomOut)) {
            console.log("out");

            this.frequency -= 0.3;

            this.grassMap.destroy();
            this.dirtMap.destroy();
            this.shroomMap.destroy();
            this.setMapVals();
        }
    }
}