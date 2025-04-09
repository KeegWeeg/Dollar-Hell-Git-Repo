import { Ball } from './Ball.js';
import { keys } from './Input.js';
import { getRandomInt } from './Math.js';
import { ctx, canvas } from './Canvas.js';
import { Depo } from './Depo.js';
import { init } from './Init.js';

 



// Game Variables and Initial Setup
let obstacles = []; // Add more obstacles as needed
let bushes = [];
let balls = [];
let backgroundColor ="#E0417B";
let obstacleColor = "#3F0071";
let ballColor = "#7BD5F5"; //
let NPCColor = "#FFBD6B"; //"#0CDD08"
let bushColor = "#FF7230"
const ball = new Ball(600, 100, 20, 5, true, ballColor, canvas, ctx);
const NPC = new Ball(90, 90, 20, 5, false, NPCColor, canvas, ctx);
balls.push(ball, NPC);
const depo = new Depo(50, 50, 500, 15, obstacleColor);

// Initialize the game, set up event listeners and game loop
window.onload = function () {
 
};


// Helper functions
function drawFromObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
     ctx.strokeStyle = 'black';  // Border color
    ctx.lineWidth = 2;        // Border width

    // Draw the border around the rectangle
   ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
}


function drawObstacles(){
  obstacles.forEach(drawFromObject);
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







