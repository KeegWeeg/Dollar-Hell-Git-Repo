// Defining the canvas
const canvas = document.getElementById('myCanvas');
// Creating a 2D instance of canvas
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
 
// Class for the ball in case I want to implement more balls later 
class Ball {
  constructor (x,y,radius, speed, playable, color){
    this.playable = playable; // Wether its an NPC or not 
    this.x = x; // X position of ball
    this.y = y; // Y position of ball 
    this.radius = radius; // Radius (size) of ball
    this.speed = speed; // Speed ball moves
    this.harvestSpeed = 0; // Cooldown time in between collecting 
    this.timer = 0; // Timer used to check for cooldowns
    this.messages = []; // A queue to hold prompts to display around the ball 
    this.resources = 0; // Resources held
    this.collectionDistance = 45; // How many pixels the ball within to collect 
    this.color = color; // Ball color 
  }
  // Method for drawing the ball
  draw(ctx){
   
     ctx.beginPath(); 
     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // Draw circle
     ctx.fillStyle = this.color; // Fill color
     ctx.fill();
     ctx.lineWidth = 2; // Border width
     ctx.strokeStyle = 'black'; // Border color
     ctx.stroke();  
  }
  
  // Method for taking the key presses and updating the change in X or Y of ball
  calculateMovement(keys, canvasHeight, canvasWidth) {  
    let nextX = this.x; // Update nextX
    let nextY = this.y; // Update nextY

  // Each statement checks for key press, and bounds, if valid it updates corresponding axis by the speed. 
    if ((keys.ArrowUp || keys.w) && this.y - this.radius > 0) nextY -= this.speed; 
    if ((keys.ArrowDown || keys.s) && this.y + this.radius < canvas.height) nextY += this.speed;
    if ((keys.ArrowLeft || keys.a) && this.x - this.radius > 0) nextX -= this.speed;
    if ((keys.ArrowRight || keys.d) && this.x + this.radius < canvas.width) nextX += this.speed;
    
  // Returns the new X and Y positions as object 
    return { nextX, nextY };
    }
    updatePositionIfNoCollision(nextX, nextY, obstacles) {
  // Calls willCollide and only updates if it returns with false for no collision 
        if (!this.willCollide(nextX, nextY, obstacles)) {
          // Updates the balls X and Y 
            this.x = nextX;
            this.y = nextY;
        }
    }
  
  // Checks for collision using the list of obstacles and the X and Y of the ball
  willCollide(nextX, nextY, listOfObstacles) {
  // For each object in obstacles it checks if the ball's radius is greater than the distance from the obstacle, if it is, there is a collision and it immediately returns true. 
  return listOfObstacles.some(obj => this.radius > this.findDistance(nextX, nextY, obj));
}
  // Checks for an active collision 
   isColliding(listOfObstacles) {
if (Array.isArray(listOfObstacles)){ // If statement to use an array for isColliding 
   
  // For each object it checks if the collection distance is greater than the distance of the ball from the obstacle if it is it returns true
  return listOfObstacles.some(obj => this.collectionDistance > this.findDistance(this.x, this.y, obj));
 
} else {  // If statement if just a singular obstacle is being checked
 
  // Checks if the collection distance is greater than the distance of the ball from the obstacle if it is it returns true
   return this.collectionDistance > this.findDistance(this.x, this.y, listOfObstacles)
}
   }

// Finds distance between two objects 
  findDistance(x, y, obj) {
        const closestX = Math.max(obj.x, Math.min(x, obj.x + obj.width));
        const closestY = Math.max(obj.y, Math.min(y, obj.y + obj.height)); 
        return Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2); // Returns Distance
    }
  updatePromptBushes(listOfInteractables) {
       if (this.timer > this.harvestSpeed){
         this.timer = 0;
       }
        // Increment timer based on game loop speed
        this.timer += 1000 / 60;

        // Check if the prompt can be shown and display it

        if (this.isColliding(listOfInteractables)) {
              this.drawTextBox(this.x - this.radius, this.y - this.radius * 2, "15", "black", "Harvest (space)")
            if (keys.space && this.timer > this.harvestSpeed) {
                this.collectResources();
            }
        }
  }
    updatePromptDepositors(listOfInteractables){
        if (this.isColliding(listOfInteractables)){
          this.drawTextBox(this.x - this.radius, this.y - this.radius * 2, "15", "#10c23f", "Deposit (space)")
           if (keys.space){
             this.depositResources();
           }
          
        }
    }
        

//Gathers one resoruce and assigns it a random Y and X to be displayed
    collectResources() {
        this.resources += 1;
        this.messages.push([
            [this.x + getRandomInt(-30, 30), this.y + getRandomInt(-30, 30), "10", "black", this.resources],
            0
        ]);
        keys.space = false; // Reset the key to prevent multiple triggers
    }
  depositResources(){
       this.resources += 1;
       let color = "hsl(" + getRandomInt(135,360)+ ",100%,50%)";
      
        this.messages.push([
            [this.x + getRandomInt(-30, 30), this.y + getRandomInt(-30, 30), "10", color, this.resources],
            0
        ]);
      //  keys.space = false; // Reset the key to prevent multiple triggers
    }
  
// Removes messages after time, displays them if not removed 
handleMessages(){
  this.messages = this.messages.filter((message) => {
        message[1] += 16.67777;
        return message[1] <= 2000;
    });
  this.messages.forEach((message) => {
        const [x, y, fontSize, color, text] = message[0];
        this.drawTextBox(x, y, fontSize, color, text);
    });
  }
  // Draw the text box above the ball
drawTextBox(x, y, fontSize, color, message) {
    ctx.font = `${fontSize}px Pixelify Sans`;
    ctx.fillStyle = `${color}`;
    ctx.fillText(`${message}`, x, y); // Message inside the box
  }
}



class Depo {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; 
        this.intersect = width - height;
        this.xOfDesk = width*.25;
        this.hole = width *.35;
        this.sides = [];
    }

    drawDepo(x, y, width, height, color) {
        this.sides = [
             { x: x + this.xOfDesk, y: y, width: height, height: width, color: color },
            { x: x, y: y, width: width, height: height, color: color },
          { x: x, y: y, width: height, height: width, color: color },
          { x: x + width, y: y, width: height, height:  this.hole, color: color },
          { x: x + width, y: y + width -  this.hole , width: height, height:  this.hole, color: color },
           { x: x, y: y + this.intersect, width: width, height: height, color: color },
       
        ];
      
    }
}
// Game Variables and Initial Setup
let messages = [];
let obstacles = []; // Add more obstacles as needed
let bushes = [];
let balls = [];
let backgroundColor ="#E0417B";
let obstacleColor = "#3F0071";
let ballColor = "#7BD5F5"; //
let NPCColor = "#FFBD6B"; //"#0CDD08"
let bushColor = "#FF7230"
const ball = new Ball(600, 100, 20, 5, true, ballColor);
const NPC = new Ball(90, 90, 20, 5, false, NPCColor);
balls.push(ball, NPC);
console.log(balls);
const depo = new Depo(50, 50, 500, 15, obstacleColor);

// Initialize the game, set up event listeners and game loop
window.onload = function () {
  document.getElementById("popup").addEventListener("click", function() {
    this.classList.add("hidden"); // Smoothly fades out
    setTimeout(() => this.style.display = "none", 500); // Hides after animation
});
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    bushes = generateBushes(120);
    depo.drawDepo(depo.x, depo.y, depo.width, depo.height, depo.color);
    obstacles.push(...depo.sides,...bushes);
    
    // Key press event listeners
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
  
    gameLoop(); // Start the game loop
};

// Handle key press down events
function handleKeydown(event) {
  if (event.key in keys) {

      keys[event.key] = true;
  }
if (event.key == " "){
  keys["space"] = true;
}
}

// Handle key release events
function handleKeyup(event) {
  if (event.key in keys) {
      keys[event.key] = false;
  }
if (event.key == " "){
  keys["space"] = false;
}
}

// Helper functions
function drawFromObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
     ctx.strokeStyle = 'black';  // Border color
    ctx.lineWidth = 2;        // Border width

    // Draw the border around the rectangle
   ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawObstacles(){
  obstacles.forEach(drawFromObject);
}



// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for redrawing 
   ctx.fillStyle = backgroundColor; //"#DE3A83"; //'#FF564F'; // your color here (hex, rgb, etc.)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawObstacles();
    manageBalls(balls); // Yes I am proud of the name 
    
   
    requestAnimationFrame(gameLoop); // Continue the game loop
}

function manageBalls(balls){
  balls.forEach(object => {
    if (object.playable){
        object.draw(ctx);
    const { nextX, nextY } = object.calculateMovement(keys, canvas.height, canvas.width);
    object.updatePositionIfNoCollision(nextX, nextY, obstacles); // Pass obstacles array
    object.handleMessages();
    object.updatePromptBushes(bushes);
   object.updatePromptDepositors(depo.sides[0]);
    }
    else {
       object.draw(ctx);
       let rng = getRandomInt(1,30); // I will need to go back and make this more efficient 
       if(rng == 30){
        object.updatePositionIfNoCollision(object.x, object.y + getRandomInt(-object.speed * 2, object.speed * 2), obstacles); // Pass obstacles array
       }
       
    }
  })

}

function generateBushes(bushNum){
  const bushes = [];
  //const bush = new Bush(600, 170, 100, 100);

  for (let i = 0; i <= bushNum; i++){
    const x = 300 + (i * 30) + getRandomInt(-10,100);
    const y = 300 + getRandomInt(-200,50);
    const width = 15;
    const height = 15;
    
 
    const bush = new Bush(x,y,width,height,bushColor);
           //This rhymes 
    bushes.push(bush); 


    
  }
  return bushes;
  
}
class Bush {
    constructor(x, y, width, height, color, size) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; 
        this.size = Math.max(width, height); 
    }

}


// Record key presses
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, space: false, a: false, s: false, d: false, w: false,
};




// Make these functions work outside of class for everyone COMMUNISM!
  willCollide(nextX, nextY, listOfObstacles) {
    // For each object in obstacles it checks if the ball's radius is greater than the distance from the obstacle, if it is, there is a collision and it immediately returns true. 
    return listOfObstacles.some(obj => this.radius > this.findDistance(nextX, nextY, obj));
  }
    // Checks for an active collision 
     isColliding(listOfObstacles) {
  if (Array.isArray(listOfObstacles)){ // If statement to use an array for isColliding 
     
    // For each object it checks if the collection distance is greater than the distance of the ball from the obstacle if it is it returns true
    return listOfObstacles.some(obj => this.collectionDistance > this.findDistance(this.x, this.y, obj));
   
  } else {  // If statement if just a singular obstacle is being checked
   
    // Checks if the collection distance is greater than the distance of the ball from the obstacle if it is it returns true
     return this.collectionDistance > this.findDistance(this.x, this.y, listOfObstacles)
  }
     }
  
  // Finds distance between two objects 
    findDistance(x, y, obj) {
          const closestX = Math.max(obj.x, Math.min(x, obj.x + obj.width));
          const closestY = Math.max(obj.y, Math.min(y, obj.y + obj.height)); 
          return Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2); // Returns Distance
      }