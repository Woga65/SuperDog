export class floatingMessage {
    constructor(fontColor, message, x, y, targetX, targetY) {
        this.fontColor = fontColor;
        this.message = message; // the message to display
        this.x = x;             // source coordinates
        this.y = y;
        this.targetX = targetX; // target coordinates
        this.targetY = targetY;
        this.markedForDeletion = false;
        this.timer = 0;         // counting up until maxTime is reached,
        this.maxTime = 100;     // then the message will be deleted
        this.fontSize = 20;
        this.fontFamily = 'Helvetica';
    }
    update() {
        this.x += (this.targetX - this.x) * 0.03;
        this.y += (this.targetY - this.y) * 0.03;
        this.timer++;
        if (this.timer > this.maxTime) this.markedForDeletion = true;
    }
    draw(context) {
        context.fontSize = this.fontSize + 'px ' + this.fontFamily;
        context.fillstyle = 'white';
        context.fillText(this.message, this.x, this.y);
        context.fillStyle = this.fontColor;
        context.fillText(this.message, this.x - 2, this.y - 2);
        
    }
    
} 