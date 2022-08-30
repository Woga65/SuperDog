export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.touchY = '';
        this.touchX = '';
        this.touchTreshold = 25;
        this.validInputs = [
            'SwipeUp', 'SwipeDown', 'SwipeLeft', 'SwipeRight',
            'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight',
            'Shift', 'Alt', 'Control', ' '
        ];
        this.aboveCanvas = Math.floor(this.game.canvas.getBoundingClientRect().top);
        this.belowCanvas = Math.floor(this.aboveCanvas + this.game.canvas.getBoundingClientRect().height);

        // keyboard events

        // check if pressed key is a valid input
        // if so, push it to the keys array
        window.addEventListener('keydown', e => {
            if (this.validInputs.includes(e.key) && !this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }
        });
        // check if released key is a valid input
        // if so, remove it to the keys array
        window.addEventListener('keyup', e => {
            if (this.validInputs.includes(e.key)) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
            this.processSpecialKeys(e.key);
        });

        // touch events

        // prepare start of a swipe, check if
        // a tap outside the canvas occured 
        window.addEventListener('touchstart', e => {
            e.preventDefault();
            if (e.changedTouches[0].pageY >= this.aboveCanvas && e.changedTouches[0].pageY <= this.belowCanvas) {
                this.touchX = e.changedTouches[0].pageX;
                this.touchY = e.changedTouches[0].pageY;
            } else {
                (!this.keys.includes('AttackBtn')) ? this.keys.push('AttackBtn') : this.keys.splice(this.keys.indexOf('AttackBtn'), 1);
            }
        });
        // check for swipes and if so, push
        // the swipe action to the keys array
        window.addEventListener('touchmove', e => {
            e.preventDefault();
            if (e.changedTouches[0].pageY >= this.aboveCanvas && e.changedTouches[0].pageY <= this.belowCanvas) {
                const swipeDistY = e.changedTouches[0].pageY - this.touchY;
                if (Math.abs(swipeDistY) > this.touchTreshold) {
                    (swipeDistY < 0) ? this.processInput('SwipeUp') : this.processInput('SwipeDown');
                }
                const swipeDistX = e.changedTouches[0].pageX - this.touchX;
                if (Math.abs(swipeDistX) > this.touchTreshold) {
                    (swipeDistX < 0) ? this.processInput('SwipeLeft') : this.processInput('SwipeRight');
                }
            }
        });
        // remove swipe actions from the keys array
        // also, check for special swipes
        window.addEventListener('touchend', e => {
            e.preventDefault();
            if (this.game.gameOver && this.keys.includes('SwipeUp')) {
                this.keys = [];
                this.game.restart();
            }
            if (this.game.firstStart && this.keys.includes('SwipeUp')) this.game.firstStart = false;
            this.keys = this.keys.filter(key => !this.validInputs.includes(key));
        });
    }

    // check whether input is already present
    // if not, push it to the key array
    processInput(key) {
        if (!this.keys.includes(key)) this.keys.push(key);
    }
    // handle special keys like
    // restart, pause & debug
    processSpecialKeys(key) {
        if (key === 'F1') this.game.debug = !this.game.debug;
        if (key === 'Pause') this.game.pause = !this.game.pause;
        if (key === 'Enter' && this.game.gameOver) this.game.restart();
        if (key === 'Enter' && this.game.firstStart) this.game.firstStart = false;
    }
    // remove a specific input from the keys array
    resetInput(key) {
        if (this.keys.includes(key)) this.keys = this.keys.filter(k => !k.startsWith(key));
    }
}