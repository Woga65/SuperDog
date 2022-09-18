export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Helvetica';
    }
    draw(context) {
        // score + level
        UI.scoreAndLevel(context, this.game, this.fontFamily, this.fontSize);
        // progress bar
        UI.timeLeftBar(context, this.game, this.fontFamily, this.fontSize);
        // energy bar
        UI.energyLeftBar(context, this.game, this.fontFamily, this.fontSize);
        // game over msg
        if (this.game.gameOver) UI.gameOverMsg(context, this.game, this.fontFamily, this.fontSize);
        // how to play game msg
        if (this.game.firstStart) UI.gameStartMsg(context, this.game, this.fontFamily, this.fontSize);
    }
    static gameOverMsg(context, game, fontFamily, fontSize) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0; 
        context.textAlign = 'center';
        context.font = fontSize * 2.0 + 'px ' + fontFamily;
        if (game.score >= game.minScore[game.level]) {
            context.fillText('Boo-yah', game.width * 0.5, game.height * 0.5 - 60);
            context.font = fontSize * 0.7 + 'px ' + fontFamily;
            context.fillText('What are creatures of the night afraid of? YOU!!!', game.width * 0.5, game.height * 0.5 - 20);
        } else {
            context.fillText('Love at first bite?', game.width * 0.5, game.height * 0.5 - 60);
            context.font = fontSize * 0.7 + 'px ' + fontFamily;
            context.fillText('Nope. Better luck next time!', game.width * 0.5, game.height * 0.5 - 20);
        }
        context.font = fontSize * 1 + 'px ' + fontFamily;
        context.fillText('Hit ENTER to restart.', game.width * 0.5, game.height * 0.5 + 40);
        context.restore();
    }
    static gameStartMsg(context, game, fontFamily, fontSize) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0; 
        context.textAlign = 'center';
        context.font = fontSize * 1.2 + 'px ' + fontFamily;
        context.fillText('ARROW KEYS or SWIPE to move the brave little dog', game.width * 0.5, game.height * 0.5 - 130);
        context.fillText('ARROW DOWN or SWIPE DOWN while in the air for diving attack', game.width * 0.5, game.height * 0.5 - 90);
        context.fillText("SHIFT or TAP on the screen's lower edge for rolling attack", game.width * 0.5, game.height * 0.5 - 50);
        context.fillText('PAUSE button to pause game', game.width * 0.5, game.height * 0.5 - 10);
        context.fillText('Rolling attack counts 1x, diving attack counts 5x', game.width * 0.5, game.height * 0.5 + 30);
        context.fillText('Hit ENTER or SWIPE UP to start game.', game.width * 0.5, game.height * 0.5 + 110);
        context.restore();
    }
    // we do not use text shadow in the main loop 
    // because of it's lack of performance 
    static scoreAndLevel(context, game, fontFamily, fontSize) {
        // score + level shadow
        context.textAlign = 'left';
        context.font = fontSize + 'px ' + fontFamily;
        context.fillStyle = 'white';
        context.fillText('Score: ' + game.totalScore, 22, 42);
        context.textAlign = 'right';
        context.fillText('Level:   ' + (game.level + 1).toFixed().valueOf() + '  ', game.width, 42);
        // score + level
        context.textAlign = 'left';
        context.font = fontSize + 'px ' + fontFamily;
        context.fillStyle = game.fontColor;
        context.fillText('Score: ' + game.totalScore, 20, 40);
        context.textAlign = 'right';
        context.fillText('Level:   ' + (game.level + 1).toFixed().valueOf() + '  ', game.width - 2, 40);
    }
    static timeLeftBar(context, game, fontFamily, fontSize) {
        context.save();
        context.font = fontSize * 0.8 + 'px ' + fontFamily;

        context.textAlign = 'left';
        context.fillStyle = 'white';
        context.fillText('Time: ' , 22, 87);
        context.fillStyle = game.fontColor;
        context.fillText('Time: ' , 20, 85);

        context.textAlign = 'center';
        context.fillStyle = '#444444';
        context.strokeRect(110, 62, 104, 30);
        context.fillStyle = '#20c7f0';
        context.fillRect(112, 64, (100 - (game.time / game.maxTime[game.level]) * 100).toFixed().valueOf(), 26);
        context.fillStyle = '#444444';
        context.fillText(Math.abs(100 - (game.time / game.maxTime[game.level]) * 100).toFixed().valueOf(), 158, 86);
        context.restore();
    }
    static energyLeftBar(context, game, fontFamily, fontSize) {
        context.save();
        context.font = fontSize * 0.8 + 'px ' + fontFamily;

        context.textAlign = 'left';
        context.fillStyle = 'white';
        context.fillText('Energy: ' , 22, 128);
        context.fillStyle = game.fontColor;
        context.fillText('Energy: ' , 20, 126);

        context.textAlign = 'center';
        context.fillStyle = '#444444';
        context.strokeRect(110, 104, 104, 30);
        context.fillStyle = '#ffac5c';
        context.fillRect(112, 106, ((game.player.energy / game.player.maxEnergy) * 100).toFixed().valueOf(), 26);
        context.fillStyle = '#444444';
        context.fillText(Math.abs((game.player.energy / game.player.maxEnergy) * 100).toFixed().valueOf(), 158, 128);
        context.restore();
    }
}