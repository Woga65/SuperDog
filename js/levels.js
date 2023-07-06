import { LevelEnemies } from "./level-enemies.js";
import { levelStates } from "./level-states.js";
import { LevelTexts } from "./level-texts.js";


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
        this.text = LevelTexts.getLevelTexts.call(this)[this.levelName];
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
            this.text = LevelTexts.getLevelTexts.call(this)[this.levelName];
            this.finished = true;
        }
    }
    reset() {
        this.state = levelStates.WAITING;
        this.finished = false;
    }
    getEnemies() {
        return LevelEnemies.getEnemies.call(this);
    }
}
