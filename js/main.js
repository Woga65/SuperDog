import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy, WalkingEnemy } from "./enemies.js";
import { FlameItem } from "./items.js";
import { UI } from "./ui.js";


const canvas = document.getElementById('canvas1');
canvas.width = 1368;
canvas.height = 500;

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.groundMargin = 83;     // solid ground for player ans enemies to stay on
        this.maxSpeed = 3;          // max scrolling speed
        this.background = new Background(this);
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.userInterface = new UI(this);
        this.maxParticles = 200;    // max count of fire and dust particles when running or rolling
        this.enemyInterval = 1000;  // how often will enemies be placed on canvas
        this.itemsInterval = 1200;  // how often will items be placed on canvas
        this.randomModifier = 1;    // used to modify random numbers depending on game's state
        this.debug = false;         // display hit boxes
        this.pause = false;
        this.fontColor = 'black';
        this.maxTime = [40000, 45000, 45000, 90000, 90000]; // duration of a level
        this.minScore = [ 50, 60, 60, 130, 130 ];           // the minimum score that is needed to win a level
        this.totalScore = 0;                                // initial score
        this.gameOver = false;
        this.firstStart = true;     // display help message on first start
        this.lastTime = 0;          // counter for consitent animation speed
        this.maxLevel = 4;          // level count
        this.level = 0;             // current level (0 = practice, 1 - 3 ascending difficulty, 4 = crazy)
        this.startTime = 0;         // time when the level has been started
    }
    start(level = 4) {
        this.level = level;
        this.gameOver = false;
        this.score = 0;             // initial level score
        this.time = 0;              // elapsed time
        this.speed = 0;             // actual speed for side scrolling
        this.player.restart();
        this.player.currentState = this.player.states[0];   // set initial state for the player character
        this.player.currentState.enter();                   // enter initial state of the player
        this.enemies = [];          // arrays for the various 
        this.items = [];            // objects an entities that
        this.particles = [];        // will be placed on canvas
        this.collisions = [];
        this.messages = [];
        this.enemyTimer = 0;        // count the time until a new enemy will be placed
        this.itemsTimer = 0;        // count the time until a new item will be placed
        this.setStartTime();        // get the time when the level has been started
        this.animate(0);            // start game
    }
    restart() {
        this.totalScore = 0;
        this.firstStart = true;
        this.level = 0;
        this.start(this.level);
    }
    nextLevel() {
        this.firstStart = false;
        this.level = (this.level + 1) % (this.maxLevel + 1);
        this.start(this.level);
    }
    setStartTime() {
        this.startTime = +new Date();
    }
    update(deltaTime) {
        this.time = +new Date() - this.startTime;
        // check for game over
        if (this.time >= this.maxTime[this.level]) this.gameOver = true;
        // background and player
        this.background.update();
        this.player.update(this.input.keys, deltaTime);
        // handle enemies
        this.enemyTimer = (this.enemyTimer > this.enemyInterval) ? this.addEnemy() : this.enemyTimer + deltaTime;
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        // handle items
        this.itemsTimer = (this.itemsTimer > this.itemsInterval) ? this.addItem() : this.itemsTimer + deltaTime;
        this.items.forEach(item => item.update(deltaTime));
        // handle messages
        this.messages.forEach(message => message.update(deltaTime));
        // handle particles
        this.particles.forEach((particle, index) => particle.update());
        if (this.particles.length > this.maxParticles) {
            this.particles.length = this.maxParticles;
        }
        // handle collision sprites
        this.collisions.forEach((collision, index) => collision.update(deltaTime));
        // remove elements no longer present on the screen
        this.removeElements();
    }
    // draw what should be on the screen
    draw(context) {
        this.background.draw(context);
        this.player.draw(context);
        this.enemies.forEach(enemy => enemy.draw(context));
        this.items.forEach(item => item.draw(context));
        this.messages.forEach(message => message.draw(context));
        this.particles.forEach(particle => particle.draw(context));
        this.collisions.forEach(collision => collision.draw(context));
        this.userInterface.draw(context);
    }
    // add various enemies
    addEnemy() {
        this.randomModifier = (this.speed) ? 1 : 0.5;
        if (this.speed != 0) {
            if (this.level > 0) {
                (Math.random() < 0.5)
                    ? this.enemies.push(new GroundEnemy(this))
                    : this.enemies.push(new ClimbingEnemy(this));
            } else {
                this.enemies.push(new GroundEnemy(this));
            }
        }
        if (Math.random() < 0.7) {
            if (this.level > 1) {
                this.enemies.push(new FlyingEnemy(this));
                if (this.level > 3) this.enemies.push(new FlyingEnemy(this));
            }
        }
        if (Math.random() < 0.5 * this.randomModifier) {
            if (this.level > 2) {
                this.enemies.push(new WalkingEnemy(this));
            }
        }
        return 0;
    }
    // add collectable power-up items
    addItem() {
        if (this.speed != 0 && Math.random() < 0.2) this.items.push(new FlameItem(this));
        return 0;
    }
    // remove what is destroyed or has left the game area
    removeElements() {
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        this.items = this.items.filter(item => !item.markedForDeletion);
        this.messages = this.messages.filter(message => !message.markedForDeletion);
        this.particles = this.particles.filter(particle => !particle.markedForDeletion);
        this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
    }
    // let the nose allways point forward
    flipImage(context, x, width, flipIt) {
        return (flipIt) ? (this.isFlipped = true, context.save(), context.translate(width, 0), context.scale(-1, 1), -x) : x;
    }
    flipImageBack(context, x, flipIt) {
        return (flipIt) ? (this.isFlipped = false, context.restore(), -x) : x;
    }
    // check for collision between two objects
    checkCollision(firstObject, secondObject) {
        return (
            firstObject.x < secondObject.x + secondObject.width &&
            firstObject.x + firstObject.width > secondObject.x &&
            firstObject.y < secondObject.y + secondObject.height &&
            firstObject.y + firstObject.height > secondObject.y
        );
    }
    // the main loop
    animate(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        this.context.clearRect(0, 0, this.width, this.height);
        if (!this.pause && !this.firstStart) this.update(deltaTime);
        this.draw(this.context);
        if (!this.gameOver) requestAnimationFrame(ts => this.animate(ts))
    }
}

const game = new Game(canvas);
game.start(0);
