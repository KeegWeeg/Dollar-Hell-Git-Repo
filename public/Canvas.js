const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

export { canvas, ctx, resizeCanvas};
