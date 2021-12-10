export default class Rectangle {
    constructor(p5, x, y, width, height, colour) {
        this.p = p5;
        this.origX = x;
        this.x = x;
        this.origY = y;
        this.y = y;
        this.origWidth = width;
        this.width = width;
        this.origHeight = height;
        this.height = height;
        this.area = this.width * this.height;
        this.colour = colour;
        this.currentFill = colour;
        this.switchFill = false;
        this.animate = false;
        this.drawOutline = false;
        this.rotation = 0;
        this.clockwise = Math.random() < 0.5; 
        this.maxArea = this.area * 1.25;
        this.direction = 'left';
    }

    reset() {
        this.x = this.origX;
        this.y = this.origY;
        this.width = this.origWidth;
        this.height = this.origHeight;
        this.area = this.width * this.height;
        this.animate = false;
        this.rotation = 0;
    }

    update() {
        if(this.animate){
            const centerX = this.p.width / 2; 
            if(this.direction === 'left' &&  this.x < this.p.width){
                this.x = this.x + 16 > this.p.width ? this.p.width :  this.x + 16;
            }
            else if(this.direction === 'right' &&  centerX && this.x > 0){
                this.x = this.x - 16 < 0 ? 0 : this.x - 16;
            }
            if(this.y < this.p.height){
               this.y = this.y + 8 >= this.p.height ? this.p.height : this.y + 8;
            }
            this.width = this.width + 2;
            this.height = this.height + 2;
            this.area = this.width * this.height;
            this.rotation = this.clockwise ? this.rotation + 6 : this.rotation - 6;
        }
    }

    draw() {
        this.p.strokeWeight(1);
        if(this.switchFill){
            this.p.strokeWeight(5);
            if(this.currentFill === 'white'){
                this.p.stroke(this.colour)
                this.p.fill(255);
            }
            else {
                this.p.stroke(255);
                this.p.fill(this.colour);
            }
            this.p.rect(this.origX, this.origY, this.origWidth / 2, this.origHeight / 2);
        }
        else if(this.drawOutline) {
            this.p.fill(this.colour);
            this.p.rect(this.origX, this.origY, this.origHeight, this.origHeight);
        }
        this.p.stroke(this.colour);
        this.p.noFill();
        this.p.translate(this.x, this.y);
        if(!this.animate) {
             //this.p.fill(this.colour);
        }
        this.p.rotate(this.rotation);
         if(this.animate) {
            let baseWidth = this.width, 
                baseHeight = this.height;
            // this.p.fill(this.colour);
            //this.p.rect(0, 0, baseWidth, baseHeight);
            this.p.strokeWeight(2);
            for (let i = 0; i <= 8; i++) {
                this.p.rect(0, 0, baseWidth, baseHeight);
                baseWidth = baseWidth * 0.8;
                baseHeight = baseHeight * 0.8;
            }
        }
        //this.p.rect(0, 0, this.width, this.height);
        this.p.rotate(-this.rotation);
        this.p.translate(-this.x, -this.y);
    }
}