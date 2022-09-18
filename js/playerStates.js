import { Dust, Fire, Splash } from "./particles.js";

// enum of possible player's states
const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    HIT: 6,
}

// handle inputs for generic actions 
// also, states can easily be debugged here
class State {
    constructor(state, game) {
        this.state = state;
        this.game = game;
    }
    enter() {
        if (this.game.player.energy <= 0) {             // on mobile touch devices super-powers are toggled
            this.game.input.resetInput('AttackBtn');    // switch them off if energy is spent
        }
    }
    // handle state switching inputs
    handleInput(input) {
        this.actions.forEach(action => {
            if (input.includes(action.key)) {
                const validAction = ((action.needsEnergy && this.game.player.energy > 300) || !action.needsEnergy);
                (validAction) ? this.game.player.setState(action.state, action.speed) : false;
            }
        });
        this.game.input.resetInput('Swipe');  // remove all swipe-actions from the input queue
    }
    // handele direction switching actions
    checkDirection(input) {
        if (input.includes('ArrowRight') || input.includes('SwipeRight')) { 
            this.isMovingRight();
            return;
        }
        if (input.includes('ArrowLeft') || input.includes('SwipeLeft')) {
            this.isMovingLeft(); 
            return;
        }
        this.game.player.speed = 0;
    } 
    isMovingRight() {
        this.game.player.reverse = false;
        this.game.player.speed = this.game.player.maxSpeed; 
        this.game.speed = this.game.maxSpeed;
    }
    isMovingLeft() {
        this.game.player.reverse = true; 
        this.game.player.speed = -this.game.player.maxSpeed; 
        this.game.speed = -this.game.maxSpeed;
    }
}


/**
 * depending on the current state the
 * player's character can or cannot
 * perform various actions. Inputs
 * might have a different meaning
 * depending on the character's state.
 * 
 * Also the animation will vary depending
 * on the character's state.
 *  
 * To handle this efficiently, each state
 * has it's own class. 
 */

export class Sitting extends State {
    constructor(game) {
        super('SITTING', game);
        this.actions = [
            { key: 'ArrowLeft', state: states.RUNNING, speed: 1, needsEnergy: false },
            { key: 'SwipeLeft', state: states.RUNNING, speed: 1, needsEnergy: false },
            { key: 'ArrowRight', state: states.RUNNING, speed: 1, needsEnergy: false },
            { key: 'SwipeRight', state: states.RUNNING, speed: 1, needsEnergy: false },
            { key: 'Shift', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'Control', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'AttackBtn', state: states.ROLLING, speed: 2, needsEnergy: true },
        ];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 4;
        this.game.player.frameY = 5;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 0;
    }
    handleInput(input) {
        super.checkDirection(input);
        super.handleInput(input);
    }
}


export class Running extends State {
    constructor(game) {
        super('RUNNING', game);
        this.actions = [
            { key: 'ArrowDown', state: states.SITTING, speed: 0, needsEnergy: false },
            { key: 'SwipeDown', state: states.SITTING, speed: 0, needsEnergy: false },
            { key: 'ArrowUp', state: states.JUMPING, speed: 1, needsEnergy: false },
            { key: 'SwipeUp', state: states.JUMPING, speed: 1, needsEnergy: false },
            { key: 'Shift', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'Control', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'AttackBtn', state: states.ROLLING, speed: 2, needsEnergy: true },
        ];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 8;
        this.game.player.frameY = 3;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 0;
    }
    handleInput(input) {
        this.game.particles.unshift(new Dust(this.game, this.game.player.x + this.game.player.width * 0.6, this.game.player.y + this.game.player.height));
        super.checkDirection(input);
        super.handleInput(input);
    }
}


export class Jumping extends State {
    constructor(game) {
        super('JUMPING', game);
        this.actions = [
            { key: 'ArrowDown', state: states.DIVING, speed: 0, needsEnergy: false },
            { key: 'SwipeDown', state: states.DIVING, speed: 0, needsEnergy: false },
            { key: 'Shift', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'Control', state: states.ROLLING, speed: 2, needsEnergy: true },
            { key: 'AttackBtn', state: states.ROLLING, speed: 2, needsEnergy: true },
        ];
    }
    enter() {
        super.enter();
        if (this.game.player.onGround()) this.game.player.yAxisVelocity -= 27;
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 1;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 0;
    }
    handleInput(input) {
        if (this.game.player.yAxisVelocity > this.game.player.weight) {
            this.game.player.setState(states.FALLING, 1);
        };
        super.checkDirection(input);
        super.handleInput(input);
    }
}


export class Falling extends State {
    constructor(game) {
        super('FALLING', game);
        this.actions = [
            { key: 'ArrowDown', state: states.DIVING, speed: 0, needsEnergy: false },
            { key: 'SwipeDown', state: states.DIVING, speed: 0, needsEnergy: false },
        ];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 2;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 0;
    }
    handleInput(input) {
        if (this.game.player.onGround()) this.game.player.setState(states.RUNNING, 1);
        super.checkDirection(input);
        super.handleInput(input);
    }
}


export class Rolling extends State {
    constructor(game) {
        super('ROLLING', game);
        this.actions = [];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
        this.game.player.consumesEnergy = true;
        this.game.player.scoreFactor = 1;
    }
    handleInput(input) {
        if ((input.includes('ArrowDown') || input.includes(' ') || input.includes('SwipeDown')) && !this.game.player.onGround()) {
            this.game.player.setState(states.DIVING, 0);
            return;
        }
        if (!input.includes('Shift') && !input.includes('AttackBtn') && !input.includes('Control')) {
            (this.game.player.onGround()) ? this.game.player.setState(states.RUNNING, 1) : this.game.player.setState(states.FALLING, 1);
            return;
        }
        (this.game.player.energy <= 0) ? this.noEnergy(input) : this.hasEnergy(input);
        super.checkDirection(input);
        super.handleInput(input);
    }
    // player has spent his energy
    noEnergy(input) {
        if (!this.game.player.onGround()) {
            this.game.player.setState(states.FALLING, 1);
            return;
        }
        if (input.includes('ArrowUp') || input.includes('SwipeUp')) {
            this.game.player.setState(states.JUMPING, 1);
            return;
        }
        this.game.player.setState(states.RUNNING, 1);
    }
    // player has energy left
    hasEnergy(input) {
        if ((input.includes('ArrowUp') || input.includes('SwipeUp')) && this.game.player.onGround()) {
            this.game.player.yAxisVelocity -= 27;
        }
        this.game.particles.unshift(
            new Fire(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height * 0.5)
        );
    }
}


export class Diving extends State {
    constructor(game) {
        super('DIVING', game);
        this.actions = [];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
        this.game.player.yAxisVelocity = 15;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 5;
    }
    handleInput(input) {
        this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height * 0.5));
        if (this.game.player.onGround()) {
            for (let i = 0; i < 30; i++) {          // display a nice fireball when player smashes into the ground
                this.game.particles.unshift(
                    new Splash(this.game, this.game.player.x + this.game.player.width * 0, this.game.player.y + this.game.player.height * 0.2)
                );
            };
            ((input.includes('Shift') || !input.includes('Control') || input.includes('AttackBtn')) && this.game.player.energy > 0)
                ? this.game.player.setState(states.ROLLING, 2)
                : this.game.player.setState(states.RUNNING, 1);
        }
        super.checkDirection(input);
        super.handleInput(input);
    }
}


export class Hit extends State {
    constructor(game) {
        super('HIT', game);
        this.actions = [];
    }
    enter() {
        super.enter();
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 10;
        this.game.player.frameY = 4;
        this.dizzyDuration = 1;
        this.dizzyCount = 0;
        this.game.player.consumesEnergy = false;
        this.game.player.scoreFactor = 0;
    }
    handleInput(input) {
        if (this.game.player.frameX >= 10) {
            this.dizzyCount++;
        }
        if (this.dizzyCount >= this.dizzyDuration)  {
            (this.game.player.onGround()) ? this.game.player.setState(states.RUNNING, 1) : this.game.player.setState(states.FALLING, 1);
            super.checkDirection(input);
        }
        super.handleInput(input);
    }
}
