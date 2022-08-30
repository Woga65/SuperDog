class Item {
    constructor() {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.reverse = false;
    }
    update(deltaTime) {
        // movement if any
        this.x -= this.speedX + this.game.speed;
        this.y += this.speedY;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            (this.frameX < this.maxFrameX) ? this.frameX++ : this.frameX = 0, (this.frameY < this.maxFrameY) ? this.frameY++ : this.frameY = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        // check if off screen
        if (this.x + this.width < -this.game.width || this.x + this.width > this.game.width * 2) 
            this.markedForDeletion = true;
        //if (this.x + this.width < -this.game.width * 2 || this.x + this.width > this.game.width * 2)
        //    this.markedForDeletion = true;
    }
    draw(context) {
        this.processDebugMode(context);
        context.drawImage(this.image, this.frameX * this.outerWidth, this.frameY * this.outerHeight, this.outerWidth, this.outerHeight, this.x - (this.outerWidth - this.width) / 2, this.y, this.outerWidth, this.outerHeight);
    }
    // draw hit box
    processDebugMode(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y + this.outerHeight - this.height, this.width, this.height);
    }
}

export class FlameItem extends Item {
    constructor(game) {
        super();
        this.energyBoost = 5000;
        this.game = game;
        this.width = 64;
        this.height = 180;
        this.outerWidth = 128;
        this.outerHeight = 256;
        //this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.x = this.game.width + this.width;
        this.y = this.game.height - this.outerHeight - this.game.groundMargin;
        this.speedX = 0;
        this.speedY = 0;
        this.reverse = (game.speed < 0) ? true : false;
        //this.x = (this.reverse) ? this.x - (2 * this.game.width) : this.x;
        this.x = (this.reverse) ? -this.width : this.x;
        this.maxFrameX = 7;
        this.maxFrameY = 3;
        this.image = document.getElementById('item_flame');
    }
}