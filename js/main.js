import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlameItem } from "./items.js";
import { UI } from "./ui.js";
import { Level } from "./levels.js";
import { levelStates } from "./level-states.js";


/* PWA setup */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(res => {
        console.log("Service Worker registered successfully!", res);
    }).catch(err => {
        console.log("Service Worker registration failed: ", err);
    });
} else {
    console.log("Service Worker not supported!");
}


/* canvas and demo video */

const demo = document.getElementById('demo1');
const canvas = document.getElementById('canvas1');
canvas.width = window.innerWidth > 1667 ? 1667 : window.innerWidth < 1280 ? 1280 : window.innerWidth; // 1368;
canvas.height = 500;


/********************** 
 *  Main Game Class  **
 **********************/

class Game {
    constructor(canvas) {
        this.fps = 60;                          // while the animation loop runs at the display's FPS, 
        this.frameInterval = 1000 / this.fps;   // keep the game loop at 60 Hz or slightly above.
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.groundMargin = 83;     // solid ground for player and enemies to stay on
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
        this.totalScore = 0;        // initial score
        this.firstStart = true;     // display help message on first start
        this.maxLevel = 4;          // number of the last level (level count - 1)
        this.level = 0;             // current level (0 = practice, 1 - 3 ascending difficulty, 4 = crazy)
        this.startTime = 0;         // time when the level has been started
        this.levels = [             // array of yet implemented levels
            new Level('1', 40000, 50, this),
            new Level('2', 45000, 60, this),
            new Level('3', 45000, 60, this),
            new Level('4', 90000, 130, this),
            new Level('5', 90000, 130, this),
        ]
    }
    start(level = 4) {
        this.level = level;
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
        this.currentLevel = this.levels[this.level];
        this.currentLevel.reset();
        this.frameTimer = 0;
        this.lastTime = performance.now();  // counter for consitent animation speed
        this.animate();                     // start game
    }
    restart() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.totalScore = 0;
        this.firstStart = true;
        this.level = 0;
        this.start(this.level);
    }
    nextLevel() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.firstStart = false;
        this.level = (this.level + 1) % (this.maxLevel + 1);
        this.start(this.level);
    }
    update(deltaTime) {
        this.time = +new Date() - this.startTime;
        // update current level's state
        this.currentLevel.update();
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
        this.enemies = this.enemies.concat(this.currentLevel.getEnemies());
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
    // the animation loop
    animate() {
        const timeStamp = performance.now();
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            if (!this.pause && !this.firstStart && this.currentLevel.state != levelStates.WAITING && !this.currentLevel.finished) this.update(deltaTime);
            this.frameTimer = this.frameTimer - this.frameInterval;
        }
        this.context.clearRect(0, 0, this.width, this.height);
        this.draw(this.context);
        requestAnimationFrame(this.animate.bind(this));
    }
}


/* Initialize Game */ 

addStartGameListeners();


function startGameListener(e) {
    e.preventDefault();
    removeStartGameListeners();
    setTimeout(() => startGame());
    canvas.style.display = 'unset';
    demo.style.opacity = '0';
    setTimeout(() => canvas.style.opacity = '1');
    setTimeout(() => demo.style.display = 'none', 500);
}


function startGame() {
    const game = new Game(canvas);
    game.start(0);
}


function addStartGameListeners() {
    ['keydown', 'touchstart', 'click'].forEach( ev => window.addEventListener(ev, startGameListener));
}


function removeStartGameListeners() {
    ['keydown', 'touchstart', 'click'].forEach( ev => window.removeEventListener(ev, startGameListener));
}
