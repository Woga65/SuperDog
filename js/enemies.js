class Enemy {
    constructor() {
        this.outerWidth = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.reverse = false;   // some enemies can move both directions
        this.markedForDeletion = false;
    }
    update(deltaTime) {
        // if enemy's actual width is smaller than the sprite's width
        // this should be fixed rather while creating the images, not here
        this.outerWidth = (this.outerWidth) ? this.outerWidth : this.width;
        // movement
        this.x -= this.speedX + this.game.speed;
        this.y += this.speedY;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            (this.frameX < this.maxFrame) ? this.frameX++ : this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        // check if off screen
        if (this.x + this.width < -this.game.width * 2 || this.x + this.width > this.game.width * 2) 
            this.markedForDeletion = true;
    }
    draw(context) {
        this.processDebugMode(context);
        this.x = this.game.flipImage(context, this.x - (this.outerWidth - this.width) / 2, this.outerWidth, this.reverse) + (this.outerWidth - this.width) / 2;
        context.drawImage(this.image, this.frameX * this.outerWidth, 0, this.outerWidth, this.height, this.x - (this.outerWidth - this.width) / 2, this.y, this.outerWidth, this.height);
        this.x = this.game.flipImageBack(context, this.x - (this.outerWidth - this.width) / 2, this.reverse) + (this.outerWidth - this.width) / 2;
    }
    processDebugMode(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}


export class FlyingEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 60;
        this.height = 44;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        // enemy from behind?
        this.reverse = (Math.random() < 0.5) ? true : false;
        this.x = (this.reverse) ? this.x - (2 * this.game.width) : this.x;
        this.speedX = (this.reverse) ? -this.speedX - Math.abs(game.speed) : this.speedX + Math.abs(game.speed);
        //
        this.maxFrame = 5;
        this.image = document.getElementById('enemy_fly');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}


export class GroundEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 60;
        this.height = 87;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        // enemy behind?
        this.reverse = (game.speed < 0) ? true : false;
        this.x = (this.reverse) ? -this.width : this.x;
        //
        this.speedX = 0;
        this.speedY = 0;
        this.maxFrame = 1;
        this.image = document.getElementById('enemy_plant');
    }
}


export class ClimbingEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 120;
        this.height = 144;
        this.x = this.game.width;
        // enemy behind?
        this.reverse = (game.speed < 0) ? true : false;
        this.x = (this.reverse) ? -this.width : this.x;
        //
        this.y = Math.random() * this.game.height * 0.5;
        this.image = document.getElementById('enemy_spider_big');
        this.speedX = 0;
        this.speedY = Math.random() > 0.5 ? 1 : -1;
        this.maxFrame = 5;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y > this.game.height - this.height -this.game.groundMargin) this.speedY *= -1;
        if (this.y < -this.height) this.markedForDeletion = true;  
    }
    draw(context) {
        super.draw(context);
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        context.stroke();
    }
}


export class WalkingEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.outerWidth = 240;
        this.width = 170;
        this.height = 215;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        // enemy attacking from behind?
        this.reverse = (game.speed == 0) ? ((Math.random() < 0.5) ? true : false) : ((game.speed < 0) ? true : false);
        this.x = (this.reverse) ? this.x - (2 * this.game.width) : this.x;
        this.speedX = (this.reverse) ? -this.speedX : this.speedX;
        //
        this.maxFrame = 3;
        this.image = document.getElementById('enemy_lalinea');
    }
}