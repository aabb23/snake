const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake = [{x:10,y:10}];
let dir = {x:0,y:0};
const foodCount = 3;
let foods = [];
let speed = 100; // ms per tick
let timer = null;
let score = 0;

document.addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowUp' && dir.y!==1) dir = {x:0,y:-1};
  if (k === 'ArrowDown' && dir.y!==-1) dir = {x:0,y:1};
  if (k === 'ArrowLeft' && dir.x!==1) dir = {x:-1,y:0};
  if (k === 'ArrowRight' && dir.x!==-1) dir = {x:1,y:0};
  if (k === 'r' || k === 'R') reset();
});

function randomFood(){
  let p;
  do{
    p = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)};
  } while (snake.some(s=>s.x===p.x&&s.y===p.y) || foods.some(f=>f.x===p.x&&f.y===p.y));
  return p;
}

function initFoods(){
  foods = [];
  while (foods.length < foodCount) {
    foods.push(randomFood());
  }
}

function update(){
  if (dir.x===0 && dir.y===0) { draw(); return; }
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (head.x<0||head.x>=cols||head.y<0||head.y>=rows || snake.some(s=>s.x===head.x&&s.y===head.y)){
    return gameOver();
  }
  snake.unshift(head);
  const foodIndex = foods.findIndex(f => f.x===head.x && f.y===head.y);
  if (foodIndex !== -1){
    score++;
    foods.splice(foodIndex, 1);
    foods.push(randomFood());
  } else {
    snake.pop();
  }
  draw();
}

function draw(){
  ctx.fillStyle = '#111';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'lime';
  snake.forEach((s,i)=>{
    ctx.fillRect(s.x*grid, s.y*grid, grid-1, grid-1);
  });
  ctx.fillStyle = 'red';
  foods.forEach(f => {
    ctx.fillRect(f.x*grid, f.y*grid, grid-1, grid-1);
  });
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('Score: '+score, 8, 14);
}

function loop(){
  if (!timer) timer = setInterval(update, speed);
}

function gameOver(){
  clearInterval(timer); timer = null;
  alert('游戏结束。得分: '+score+'. 按 R 键重玩。');
}

function reset(){
  snake = [{x:10,y:10}];
  dir = {x:0,y:0};
  score = 0;
  clearInterval(timer); timer = null;
  initFoods();
  loop();
}

initFoods();
loop();
