
export function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for redrawing 
   ctx.fillStyle = backgroundColor; //"#DE3A83"; //'#FF564F'; // your color here (hex, rgb, etc.)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawObstacles();
    manageBalls(balls); // Yes I am proud of the name 
    
   
    requestAnimationFrame(gameLoop); // Continue the game loop
}