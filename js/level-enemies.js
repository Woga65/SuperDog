import { FlyingEnemy, GroundEnemy, ClimbingEnemy, WalkingEnemy } from "./enemies.js";

export class LevelEnemies {
    static getEnemies() {
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
}
