let waveImages = [];
let shipRandom;
let shipImage;
let waves;
let starTotal = 60;
let starArray = [];

function preload() {
  for (let i = 0; i < 6; i++) {
    waveImages[i] = loadImage(`assets/${i}.png`);
  }
  shipRandom = random(1,100);
  if(shipRandom > 90){
    shipImage = loadImage('assets/rugged.png');
  }else if(shipRandom > 80){
    shipImage = loadImage('assets/pirate.png');
  }else{
    shipImage = loadImage('assets/ship.png');
  }
}
function setup() {
  var canvas = createCanvas(windowWidth, 2000);
  canvas.parent('sketch-container');
  frameRate(24);
  angleMode(DEGREES);
  ship = new Ship();
  waves = [
    (wave0 = new Wave(0, height - 70, waveImages[0])),
    (wave1 = new Wave(0, height - 120, waveImages[1])),
    (wave2 = new Wave(0, height - 150, waveImages[2])),
    (wave3 = new Wave(0, height - 170, waveImages[3])),
    (wave4 = new Wave(0, height - 220, waveImages[4])),
    (wave5 = new Wave(0, height - 250, waveImages[5])),
  ];
  
  for(i=0;i<=starTotal; i++){
    let location = createVector(random(0,width), random(0,height-400));
    starArray.push({location: location, strength:(random(1,3))});    
  }
  starfield = new StarField(starTotal, starArray);
}

function windowResized() {
  resizeCanvas(windowWidth, 2000);
  ship.reset();
}

function draw() {
  background('#13132c');
  for (i = 5; i > 1; i--) {
    if (frameCount % 10 == 0) {
      waves[i].wind(random(-0.01, 0.01));
    }
    if (frameCount % 40 == 0) {
      waves[i].yaw();
    }
    if (frameCount % 20 == 0) {
      let bob = createVector(0, random(-0.01, 0.01));
      waves[i].bob(bob);
    }
    waves[i].friction();
    waves[i].update();
    waves[i].edges();
    waves[i].show();
  }
  if (frameCount % 10 == 0) {
    ship.wind(random(-0.01, 0.01));
  }
  if (frameCount % 40 == 0) {
    ship.yaw();
  }
  if (frameCount % 20 == 0) {
    let bob = createVector(0, random(-0.01, 0.01));
    ship.bob(bob);
  }
  ship.friction();
  ship.update();
  ship.edges();
  ship.show();
  for (i = 1; i > -1; i--) {
    if (frameCount % 10 == 0) {
      waves[i].wind(random(-0.01, 0.01));
    }
    if (frameCount % 40 == 0) {
      waves[i].yaw();
    }
    if (frameCount % 20 == 0) {
      let bob = createVector(0, random(-0.01, 0.01));
      waves[i].bob(bob);
    }
    waves[i].friction();
    waves[i].edges();
    waves[i].update();
    waves[i].show();
  }
  if (frameCount % 40 == 0) {
    starfield.update("odd");
  }else if(frameCount % 30 == 0){
    starfield.update("even");
  }else{}
    starfield.show();
}

class StarField{
    constructor(total, seedStars){
        this.starCounter = starTotal;
        this.starTotal = total;
        this.starArray = seedStars;
    }
    addstar(){
        let location = createVector(random(0,width), random(0,height-400));
        this.starArray.push({location: location, strength:(random(1,3))});    
        this.starCounter++;
    }
    update(arg){
        if(this.starCounter <= this.starTotal){
            this.addstar();
        }        
        for(i=0;i<this.starArray.length;i++){
            if(arg === "odd" && i % 2 != 0){
                this.strengthChange(i);
            }else{
                this.strengthChange(i);
            }
        }
    }
    strengthChange(i){
        if(this.starArray[i].strength <= 0){
            this.starCounter--
            this.starArray[i].splice
        }else if(this.starArray[i].strength <=2){
            this.starArray[i].strength = this.starArray[i].strength+(random(-.5,.5))
        }else{
            this.starArray[i].strength = this.starArray[i].strength-.05;
        }
    }
    show(){
        for(i=0;i<this.starArray.length;i++){
        circle(this.starArray[i].location.x,this.starArray[i].location.y, 3*this.starArray[i].strength)  
        }          
    }
}
class Wave {
  constructor(x, y, img) {
    this.location = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.originX = this.location.x;
    this.originY = this.location.y;
    this.wave = img;
    this.rotation = 0;
    this.finalRotation = 0;
    this.stepRotation = 0;
  }
  reset() {
    this.location = createVector(width / 2, height / 2);
  }
  friction() {
    this.velocity = this.velocity.mult(0.9);
  }
  yaw() {
    this.finalRotation = random(-.05, .05);
    this.stepRotation = (this.rotation - this.finalRotation) / 40;
  }
  bob(force) {
    this.acceleration = this.acceleration.add(force);
    this.acceleration.limit(0.05);
  }
  wind(force) {
    this.acceleration = this.acceleration.add(force);
    this.acceleration.limit(2);
  }
  update() {
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.velocity.limit(5);
    this.rotation = this.rotation - this.stepRotation;
  }
  edges() {
    if (
      this.location.x < -20
    ) {      
      this.velocity.x = this.velocity.x + .25;
    }else if(this.location.x > this.originX){
      this.velocity.x = this.velocity.x - .25;
    }
    if (
      this.location.y < this.originY -20
    ) {      
      this.velocity.y = this.velocity.y + .25;
    }else if(this.location.y > this.originY + 20){
      this.velocity.y = this.velocity.y - .25;
    }
  }
  show() {
    push();
    translate(this.location.x, this.location.y);
    rotate(this.rotation);
    imageMode(CORNER);
    image(this.wave, 0, 0);
    pop();
  }
}
class Ship {
  constructor() {
    this.location = createVector(width / 2, height-200);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.originX = this.location.x;
    this.originY = this.location.y;
    this.ship = shipImage;
    this.rotation = 0;
    this.finalRotation = 0;
    this.stepRotation = 0;
  }
  reset() {
    this.location = createVector(width / 2, height-200);
  }
  friction() {
    this.velocity = this.velocity.mult(0.9);
  }
  yaw() {
    this.finalRotation = random(-5, 5);
    this.stepRotation = (this.rotation - this.finalRotation) / 40;
  }
  bob(force) {
    this.acceleration = this.acceleration.add(force);
    this.acceleration.limit(0.05);
  }
  wind(force) {
    this.acceleration = this.acceleration.add(force);
    this.acceleration.limit(2);
  }
  update() {
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.velocity.limit(1);
    this.rotation = this.rotation - this.stepRotation;
  }
  edges() {
    if (
      this.location.x < this.originX -400 ||
      this.location.x > this.originX +400
    ) {
      this.velocity.x *= -1;
    }
    if (
      this.location.y < this.originY - 5 ||
      this.location.y > this.originY + 20
    ) {
      this.velocity.y *= -1;
    }
  }
  show() {
    push();
    translate(this.location.x, this.location.y);
    rotate(this.rotation);
    imageMode(CENTER);
    image(this.ship, 0, 0, 370, 300);
    pop();
  }
}
