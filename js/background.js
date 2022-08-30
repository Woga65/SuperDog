// draw background images and let them scroll 
// at the game's scrolling speed times a speed modifier
// for a parallax effect 

class Layer {
    constructor(game, width, height, speedModifier, image, isMoving) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier; // background layers can move at different speed for parallax effect
        this.image = image;
        this.isMoving = isMoving; // if this flag is true, set the minimum speed to 'speedModifier' even if the game is not moving
        this.x = 0;
        this.y = 0;
    }
    update() {
        if (this.game.speed >= 0 && this.x < -this.width) {     // regular scrolling
            this.x = 0; 
        }
        if (this.game.speed < 0 && this.x > this.width) {       // reverse scrolling, for future use  
            this.x = -this.width; 
        }
        this.x -= (this.isMoving) ? this.speedModifier + (this.game.speed * this.speedModifier) : this.game.speed * this.speedModifier;
    }
    draw(context) {
        context.drawImage(this.image, this.x - this.width, this.y, this.width, this.height);    // for reverse scrolling
        context.drawImage(this.image, this.x, this.y, this.width, this.height);                 // background initially displayed on screen
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);    // for regular scrolling

    }
}

export class Background {
    constructor(game) {
        this.game = game;
        this.width = 1667;
        this.height = 500;
        this.backgroundLayers = [];
        this.layerElements = [
            { image: 'layer1', speed: 0.0, isMoving: false },
            { image: 'layer2', speed: 0.1, isMoving: true },  // clouds are slowly moving
            { image: 'layer3', speed: 0.3, isMoving: false },
            { image: 'layer4', speed: 0.8, isMoving: false },
            { image: 'layer5', speed: 1.0, isMoving: false },
        ]
        this.layerElements.forEach(layer => {
            this.backgroundLayers.push(new Layer(this.game, this.width, this.height, layer.speed, document.getElementById(layer.image), layer.isMoving))
        });
    }
    update() {
        this.backgroundLayers.forEach(layer => layer.update());
    }
    draw(context) {
        this.backgroundLayers.forEach(layer => layer.draw(context));
    }
}