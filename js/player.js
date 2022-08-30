import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from "./playerStates.js";
import { CollisionAnimation } from "./collisionAnimation.js";
import { floatingMessage } from "./floatingMessages.js";

export class Player {
    constructor(game) {
        this.game = game;       // reference to game object
        this.width = 100;       // dimensions of a single frame in the sprite sheet
        this.height = 91.3;
        this.reverse = false;       // player is moving from right to left?
        this.x = 0;                 // initial player position on canvas
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.yAxisVelocity = 0;     // velocity Y-axis
        this.weight = 1;            // counteracts.yAxisVelocity
        this.image = document.getElementById('player'); // get reference to sprite sheet
        this.frameX = 0;     // position of the animation frame in the sprite sheet
        this.frameY = 0;
        this.maxFrame;       // max frames in a specific row
        this.fps = 20;       // for consistent animation speed
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;      // actual speed of the player
        this.maxSpeed = 10;  // max speed the player can reach
        this.maxEnergy = 70000;         // max amount of energy for super powers  
        this.energy = this.maxEnergy;   // initial aomount of energy
        this.consumesEnergy = false;    // player consumes energy?
        this.scoreFactor = 0;           // initial score count of a collision
        this.states = [      // array of the yet implemented player's character's states
            new Sitting(this.game), 
            new Running(this.game), 
            new Jumping(this.game), 
            new Falling(this.game), 
            new Rolling(this.game), 
            new Diving(this.game), 
            new Hit(this.game),
        ];
    }
    restart() {          // set player to the initial values
        this.x = this.game.width / 2 - this.width / 2; 
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.frameX = 0;
        this.frameY = 0;
        this.yAxisVelocity = 0;
        this.energy = this.maxEnergy;
        this.consumesEnergy = false;
        this.reverse = false;
        this.scoreFactor = 0;
    }
    update(input, deltaTime) {
        this.handleCollisions();
        this.currentState.handleInput(input);
        // energy management
        (this.consumesEnergy) ? this.energy -= deltaTime * 3 : this.energy += deltaTime;
        if (this.energy < 0) this.energy = 0;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        // horizontal movement
        this.x += this.speed;
         // horizontal boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        // vertical movement
        this.y += this.yAxisVelocity;
        (!this.onGround()) ? this.yAxisVelocity += this.weight : this.yAxisVelocity = 0;
        // vertical boundaries
        if (this.y > this.game.height - this.height - this.game.groundMargin) {
            this.y = this.game.height - this.height - this.game.groundMargin;
        }
        // sprite animation
        (this.frameTimer > this.frameInterval) ? (this.frameTimer = 0, (this.frameX < this.maxFrame) ? this.frameX++ : this.frameX = 0) : this.frameTimer += deltaTime;
    }
    draw(context) {
        this.processDebugMode(context);
        this.x = this.game.flipImage(context, this.x, this.width, this.reverse);
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        this.x = this.game.flipImageBack(context, this.x, this.reverse);
    }
    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    setState(state, speed) {
        this.currentState = this.states[state];
        this.game.speed = (this.reverse) ? -this.game.maxSpeed * speed : this.game.maxSpeed * speed;
        this.currentState.enter();
    }
    handleCollisions() {
        this.handleCollisionEnemy();
        this.handleCollisionItem();
    }
    handleCollisionEnemy() {
        this.game.enemies.forEach(enemy => {
            if (this.game.checkCollision(enemy, this)) {    // has a collision occured?
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                if (this.scoreFactor > 0) {
                    this.game.score += this.scoreFactor;     // enemy got hit by player
                    this.game.messages.push(new floatingMessage(this.game.fontColor, this.scoreFactor, enemy.x, enemy.y, 145, 50));
                } else {
                    this.setState(6, 0);    // player got hit by enemy -> dizzy animation
                }
            }
        });
    }
    handleCollisionItem() {
        this.game.items.forEach(item => {
            if (this.game.checkCollision(item, this)) {    // has a power-up been collected?
                item.markedForDeletion = true;
                (this.energy < this.maxEnergy - item.energyBoost) ? this.energy += item.energyBoost : this.energy = this.maxEnergy;
                this.game.messages.push(new floatingMessage('#ffac5c', item.energyBoost / 1000, item.x, item.y + 75, 130, 155));
            }
        });
    }
    processDebugMode(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}