import { levelStates } from "./level-states.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy, WalkingEnemy } from "./enemies.js";


export class Level {
    constructor(levelName, maxTime, minScore, game) {
        this.levelName = levelName;
        this.maxTime = maxTime;
        this.minScore = minScore;
        this.game = game;
        this.time = 0;
        this.startTime = +new Date();
        this.state = levelStates.WAITING;
        this.finished = false;
        this.text = this.getLevelTexts()[this.levelName];
    }
    start() {
        this.time = 0;
        this.startTime = +new Date();
        this.finished = false;
        this.state = levelStates.RUNNING; 
    }
    update() {
        this.time = +new Date() - this.startTime;
        if (this.time >= this.maxTime) {
            this.state = this.game.score >= this.minScore ? levelStates.WON : levelStates.LOST;
            this.text = this.getLevelTexts()[this.levelName];
            this.finished = true;
        }
    }
    reset() {
        this.state = levelStates.WAITING;
        this.finished = false;
    }
    getEnemies() {
        switch (this.levelName) {
            case '1':
                return this.game.speed !== 0 ? [ new GroundEnemy(this.game) ] : [];
            case '2':
                return this.game.speed !== 0 
                    ? [ Math.random() < 0.5 ? new GroundEnemy(this.game) : new ClimbingEnemy(this.game) ]
                    : [];
            case '3':
                return (
                    (this.game.speed !== 0 
                        ? [ Math.random() < 0.5 ? new GroundEnemy(this.game) : new ClimbingEnemy(this.game) ]
                        : []
                    ).concat(
                        Math.random() < 0.7 ? [new FlyingEnemy(this.game)] : []
                    )
                );
            case '4':
                return (
                    (this.game.speed !== 0 
                        ? [ Math.random() < 0.5 ? new GroundEnemy(this.game) : new ClimbingEnemy(this.game) ]
                        : []
                    ).concat(
                        Math.random() < 0.7 ? [new FlyingEnemy(this.game)] : []
                    ).concat(
                        Math.random() < 0.5 * (this.game.speed ? 1 : 0.5) ? [new WalkingEnemy(this.game)] : []
                    )
                );
            case '5':
                return (
                    (this.game.speed !== 0 
                        ? [ Math.random() < 0.5 ? new GroundEnemy(this.game) : new ClimbingEnemy(this.game) ]
                        : []
                    ).concat(
                        Math.random() < 0.7 ? [new FlyingEnemy(this.game), new FlyingEnemy(this.game)] : []
                    ).concat(
                        Math.random() < 0.5 * (this.game.speed ? 1 : 0.5) ? [new WalkingEnemy(this.game)] : []
                    )
                );
        }
    }
    getLevelTexts() {
        return {
            '1': { 
                description: [
                    'Jump into the air and hit the enemies form above with ARROW DOWN or by', 
                    `SWIPING DOWN. You have ${this.maxTime / 1000} seconds to score as much hits as possible.`,
                    `Hit ENTER or SWIPE UP to start level ${this.levelName}`,
                ],
                hasWon: [
                    'Not bad!',
                    `You achieved a score of ${this.game.score}.`,
                    'Hit ENTER or SWIPE UP to start the next level.',
                ],
                hasLost: this.getLevelLostText(),
            },
           '2': { 
                description: [
                    'Also try to hit the spiders form above or use the rolling attack', 
                    `(SHIFT KEY or TAP outside playing area). You have ${this.maxTime / 1000} seconds.`,
                    `Hit ENTER or SWIPE UP to start level ${this.levelName}`,
                ],
                hasWon: [
                    'Not bad!',
                    `You've added ${this.game.score} points to your score.`,
                    'Hit ENTER or SWIPE UP to start the next level.',
                ],
                hasLost: this.getLevelLostText(),
            },
            '3': { 
                description: [
                    'Be careful when jumping. Flying enemies entering the area!', 
                    `Fill up spent energy by collecting flames. You have ${this.maxTime / 1000} seconds.`,
                    `Hit ENTER or SWIPE UP to start level ${this.levelName}`,
                ],
                hasWon: [
                    `Bravo!`,
                    `You've added another ${this.game.score} points to your score.`,
                    'Hit ENTER or SWIPE UP to start the next level.',
                ],
                hasLost: this.getLevelLostText(),
            },
            '4': { 
                description: [
                    "If you don't go for enemies, they will come for you!", 
                    `Walking enemies ahead! You have ${this.maxTime / 1000} seconds.`,
                    `Hit ENTER or SWIPE UP to start level ${this.levelName}`,
                ],
                hasWon: [
                    `You're still alive!`,
                    `You increased your score by ${this.game.score} points.`,
                    'Hit ENTER or SWIPE UP to start the next level.',
                ],
                hasLost: this.getLevelLostText(),
            },
            '5': { 
                description: [
                    "A huge wave of monsters is coming for you.", 
                    `Will you survive the next ${this.maxTime / 1000} seconds?`,
                    `Hit ENTER or SWIPE UP to start level ${this.levelName}`,
                ],
                hasWon: [
                    'Boo-yah',
                    'What are creatures of the night afraid of? YOU!!!',
                    'Hit ENTER or SWIPE UP to restart the game.',
                ],
                hasLost: this.getLevelLostText(),
            }
        }
    }
    getLevelLostText() {
        return [
            'Love at first bite?',
            'Nope. Better luck next time!',
            'Hit ENTER or SWIPE UP to restart the game.',
        ]
    }
}
