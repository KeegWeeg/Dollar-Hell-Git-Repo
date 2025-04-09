// ========================== 
// TODOs & Future Work
// ==========================

// - Split code into separate modules 
// - Refactor Ball class to separate movement, prompts, and rendering
// - Improve NPC movement logic (Instead Of The Test Logic)
// - Add visual polish (bush assets, player animations, etc)
// - Refactor Redundancy 
// - Setup SQL Database For Saved Data
// - Make Welcome Message Dynamic 

// ==========================
// Canvas Setup
// ==========================

// Defining The Canvas
const canvas = document.getElementById('myCanvas');
// Creating A 2D Instance Of Canvas
const ctx = canvas.getContext('2d');

// Resizes Canvas To Window Dimensions 
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ==========================
// Game Classes
// ==========================

// Class representing a controllable or NPC ball entity
class Ball {
  constructor(x, y, radius, speed, playable, color) {
    this.playable = playable;           // true for player-controlled ball, false for NPC
    this.x = x;                         // horizontal position
    this.y = y;                         // vertical position
    this.radius = radius;               // size of the ball
    this.speed = speed;                 // movement speed
    this.harvestSpeed = 0;             // cooldown between collecting resources
    this.timer = 0;                     // timer for interaction logic
    this.messages = [];                // list of floating text messages
    this.resources = 0;                // resource count
    this.collectionDistance = 45;      // distance threshold for interaction
    this.color = color;                // fill color of the ball
  }

  // Draw the ball on the canvas
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  // Calculate next potential position based on input keys
  calculateMovement(keys) {
    let nextX = this.x;
    let nextY = this.y;

    if ((keys.ArrowUp || keys.w) && this.y - this.radius > 0) nextY -= this.speed;
    if ((keys.ArrowDown || keys.s) && this.y + this.radius < canvas.height) nextY += this.speed;
    if ((keys.ArrowLeft || keys.a) && this.x - this.radius > 0) nextX -= this.speed;
    if ((keys.ArrowRight || keys.d) && this.x + this.radius < canvas.width) nextX += this.speed;

    return { nextX, nextY };
  }

  // Update position if no collision is detected
  updatePositionIfNoCollision(nextX, nextY, obstacles) {
    if (!this.willCollide(nextX, nextY, obstacles)) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  // Check if moving to (nextX, nextY) would collide with any obstacle
  willCollide(nextX, nextY, listOfObstacles) {
    return listOfObstacles.some(obj => this.radius > this.findDistance(nextX, nextY, obj));
  }

  // Check if this ball is currently within interaction range of any obstacle
  isColliding(listOfObstacles) {
    if (Array.isArray(listOfObstacles)) {
      return listOfObstacles.some(obj => this.collectionDistance > this.findDistance(this.x, this.y, obj));
    } else {
      return this.collectionDistance > this.findDistance(this.x, this.y, listOfObstacles);
    }
  }

  // Calculate distance from (x, y) to the nearest point on a rectangular object
  findDistance(x, y, obj) {
    const closestX = Math.max(obj.x, Math.min(x, obj.x + obj.width));
    const closestY = Math.max(obj.y, Math.min(y, obj.y + obj.height));
    return Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
  }

  // Show "Harvest" prompt near bushes, and collect if space is pressed
  updatePromptBushes(listOfInteractables) {
    if (this.timer > this.harvestSpeed) this.timer = 0;
    this.timer += 1000 / 60;

    if (this.isColliding(listOfInteractables)) {
      this.drawTextBox(this.x - this.radius, this.y - this.radius * 2, "15", "black", "Harvest (space)");
      if (keys.space && this.timer > this.harvestSpeed) {
        this.collectResources();
      }
    }
  }

  // Show "Deposit" prompt near depositors, and deposit if space is pressed
  updatePromptDepositors(listOfInteractables) {
    if (this.isColliding(listOfInteractables)) {
      this.drawTextBox(this.x - this.radius, this.y - this.radius * 2, "15", "#10c23f", "Deposit (space)");
      if (keys.space) {
        this.depositResources();
      }
    }
  }

  // Add one resource and generate floating message
  collectResources() {
    this.resources += 1;
    this.messages.push([
      [this.x + getRandomInt(-30, 30), this.y + getRandomInt(-30, 30), "10", "black", this.resources],
      0
    ]);
    keys.space = false;
  }

  // Deposit one resource with a colorful message
  depositResources() {
    this.resources += 1;
    let color = `hsl(${getRandomInt(135, 360)}, 100%, 50%)`;
    this.messages.push([
      [this.x + getRandomInt(-30, 30), this.y + getRandomInt(-30, 30), "10", color, this.resources],
      0
    ]);
  }

  // Update, display, and remove old floating messages
  handleMessages() {
    this.messages = this.messages.filter((message) => {
      message[1] += 16.67;
      return message[1] <= 2000;
    });

    this.messages.forEach((message) => {
      const [x, y, fontSize, color, text] = message[0];
      this.drawTextBox(x, y, fontSize, color, text);
    });
  }

  // Render floating message text at a given position
  drawTextBox(x, y, fontSize, color, message) {
    ctx.font = `${fontSize}px Pixelify Sans`;
    ctx.fillStyle = color;
    ctx.fillText(message, x, y);
  }
}

// Represents a deposit station made up of multiple rectangular collision zones
class Depo {
  constructor(x, y, width, height, color) {
    this.x = x;                   // top-left X coordinate
    this.y = y;                   // top-left Y coordinate
    this.width = width;          // main desk width
    this.height = height;        // main desk height
    this.color = color;          // fill color

    // Internal layout variables
    this.intersect = width - height;     // used for lower base section
    this.xOfDesk = width * 0.25;         // offset for side collider
    this.hole = width * 0.35;            // size of gap in vertical bar

    this.sides = [];             // array of collider objects to be drawn & used in collision
  }

  // Build the deposit structure as a set of rectangles (obstacles)
  drawDepo(x, y, width, height, color) {
    this.sides = [
      { x: x + this.xOfDesk, y: y, width: height, height: width, color: color }, // side bar
      { x: x, y: y, width: width, height: height, color: color },               // top surface
      { x: x, y: y, width: height, height: width, color: color },               // left leg
      { x: x + width, y: y, width: height, height: this.hole, color: color },   // right top leg
      { x: x + width, y: y + width - this.hole, width: height, height: this.hole, color: color }, // right bottom leg
      { x: x, y: y + this.intersect, width: width, height: height, color: color } // bottom bar
    ];
  }
}

// ==========================
// Game State Variables
// ==========================

// Global game variables and color palette
let messages = [];
let obstacles = [];
let bushes = [];
let balls = [];

let backgroundColor = "#E0417B";
let obstacleColor   = "#3F0071";
let ballColor       = "#7BD5F5";
let NPCColor        = "#FFBD6B";
let bushColor       = "#FF7230";

// ==========================
// Game Initialization
// ==========================

// Create player and NPC ball instances
const ball = new Ball(600, 100, 20, 5, true, ballColor);
const NPC  = new Ball(90, 90, 20, 5, false, NPCColor);
balls.push(ball, NPC);

// Create deposit station instance
const depo = new Depo(50, 50, 500, 15, obstacleColor);

// Setup once the page loads
window.onload = function () {
  // Dismiss intro popup on click
  document.getElementById("popup").addEventListener("click", function () {
    this.classList.add("hidden");
    setTimeout(() => this.style.display = "none", 500);
  });

  // Canvas responsiveness
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Generate interactive bushes and deposit collider zones
  bushes = generateBushes(120);
  depo.drawDepo(depo.x, depo.y, depo.width, depo.height, depo.color);
  obstacles.push(...depo.sides, ...bushes);

  // Set up keyboard input tracking
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keyup', handleKeyup);

  // Start main game loop
  gameLoop();
};

// ==========================
// Input Handling
// ==========================

// Track key down events and update state
function handleKeydown(event) {
  if (event.key in keys) {
    keys[event.key] = true;
  }
  if (event.key === " ") {
    keys["space"] = true;
  }
}

// Track key release events and update state
function handleKeyup(event) {
  if (event.key in keys) {
    keys[event.key] = false;
  }
  if (event.key === " ") {
    keys["space"] = false;
  }
}

// ==========================
// Utility & Drawing Helpers
// ==========================

// Draw a solid rectangle with a black outline
function drawFromObject(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
}

// Return a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Draw all environmental obstacles
function drawObstacles() {
  obstacles.forEach(drawFromObject);
}

// ==========================
// Game Loop & Entity Updates
// ==========================

// Main game loop: clears canvas, draws environment and entities
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawObstacles();
  manageBalls(balls);

  requestAnimationFrame(gameLoop); // Loop continuously
}

// Update logic for player and NPC balls
function manageBalls(balls) {
  balls.forEach(object => {
    object.draw(ctx);

    if (object.playable) {
      const { nextX, nextY } = object.calculateMovement(keys);
      object.updatePositionIfNoCollision(nextX, nextY, obstacles);
      object.handleMessages();
      object.updatePromptBushes(bushes);
      object.updatePromptDepositors(depo.sides[0]);

    } else {
      // Simple RNG-based NPC movement (could be improved)
      let rng = getRandomInt(1, 30);
      if (rng === 30) {
        object.updatePositionIfNoCollision(
          object.x,
          object.y + getRandomInt(-object.speed * 2, object.speed * 2),
          obstacles
        );
      }
    }
  });
}

// ==========================
// World Generation
// ==========================

// Generate a list of bushes with random positions
function generateBushes(bushNum) {
  const bushes = [];

  for (let i = 0; i <= bushNum; i++) {
    const x = 300 + (i * 30) + getRandomInt(-10, 100);
    const y = 300 + getRandomInt(-200, 50);
    const width = 15;
    const height = 15;

    const bush = new Bush(x, y, width, height, bushColor);
    bushes.push(bush);
  }

  return bushes;
}

// Basic rectangle collider class for bushes
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

// ==========================
// Key State Tracking
// ==========================

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  space: false,
  a: false,
  s: false,
  d: false,
  w: false
};
