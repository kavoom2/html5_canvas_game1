// * 1. Variables and Constants
let isGameStarted = false;

const ballonPos = {
  x: null,
  y: null,
};

const ballonVelo = {
  x: null,
  y: null,
};

let fuel = 100;
let isBallonHeating = false;

let trees = [];
let backgroundTrees = [];

const mainAreaWidth = 400;
const mainAreaHeight = 375;

let horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
let verticalPadding = (window.innerHeight - mainAreaHeight) / 2;

const hill1 = {
  baseHeight: 80,
  speed: 0.2,
  amplitude: 10,
  stretch: 1,
};

const hill2 = {
  baseHeight: 50,
  speed: 0.2,
  amplitude: 15,
  stretch: 0.5,
};

const hill3 = {
  baseHeight: 15,
  speed: 1,
  amplitude: 10,
  stretch: 0.2,
};

// * 2. DOM - Canvas and Interface elements
const canvas = document.getElementById("game-board");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introEl = document.getElementById("interface-intro");
const restartBtnEl = document.getElementById("interface-btn-restart");

// * 3. Functions
Math.sinWithDegree = (degree) => {
  return Math.sin((degree / 180) * Math.PI);
};

window.onload = () => resetGame();

// ** 3. 1. App Controller - Initiation
const resetGame = () => {
  // * Game Env init
  isGameStarted = false;
  isBallonHeating = false;

  // * User object init
  ballonVelo.x = 5;
  ballonVelo.y = 5;

  ballonPos.x = 0;
  ballonPos.y = 0;

  fuel = 100;

  // * Background Objects and Interface
  introEl.style.opacity = 1;
  restartBtnEl.style.display = "none";

  trees = [];
  for (let i = 1; i < window.innerWidth / 50; i++) generateTree();

  backgroundTrees = [];
  for (let i = 1; i < window.innerWidth / 30; i++) generateBackgroundTree();

  draw(); // * Rendering Canvas
};

// ** 3. 2. Background Object Generator
const generateTree = () => {
  // * Default Constants
  const minGap = 50;
  const maxGap = 600;
  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];

  const x =
    trees.length > 0
      ? trees[trees.length - 1].x +
        minGap +
        Math.floor(Math.random() * (maxGap - minGap))
      : 400;

  const h = 60 + Math.random() * 80;

  const r1 = 32 + Math.random() * 16;
  const r2 = 32 + Math.random() * 16;
  const r3 = 32 + Math.random() * 16;
  const r4 = 32 + Math.random() * 16;
  const r5 = 32 + Math.random() * 16;
  const r6 = 32 + Math.random() * 16;
  const r7 = 32 + Math.random() * 16;

  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({
    x,
    h,
    r1,
    r2,
    r3,
    r4,
    r5,
    r6,
    r7,
    color,
  });
};

const generateBackgroundTree = () => {
  // * Default Constants
  const minGap = 30;
  const maxGap = 150;
  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];

  // * Generate a tree...
  const lastTree = backgroundTrees[backgroundTrees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x = furthestX + minGap + Math.floor(Math.random() * (maxGap - minGap));
  const color = treeColors[Math.floor(Math.random() * 3)];

  backgroundTrees.push({ x, color });
};

// ** 3. 3. Event Listener
window.addEventListener("keydown", (event) => {
  // If press *SPACE*, restart game
  if (event.which == 32) {
    event.preventDefault();
    resetGame();
  }
});

window.addEventListener("mousedown", () => {
  isBallonHeating = true;

  if (!isGameStarted) {
    introEl.style.opacity = 0;
    isGameStarted = true;
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", () => {
  isBallonHeating = false;
});

window.addEventListener("resize", () => {
  // * When resize event occurs, change canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
  verticalPadding = (window.innerHeight - mainAreaHeight) / 2;

  draw(); // * Rerendering Canvas
});

restartBtnEl.addEventListener("click", (event) => {
  event.preventDefault();
  resetGame();
  restartBtnEl.style.display = "none";
});

// ** 3. 4. Requset Animation Frame
const animate = () => {
  // if game is not started, terminate funcs.
  if (!isGameStarted) return;

  const velocityChangeWhileHeating = 0.4;
  const velocityChangeWhileCooling = 0.2;

  // * Control Vertical Pos and Left fuels
  if (isBallonHeating && fuel > 0) {
    if (ballonVelo.y > -8) {
      // 1. 1. Limit Max rising speed
      ballonVelo.y -= velocityChangeWhileHeating;
    }

    fuel -= 0.002 * -ballonPos.y;
  } else if (ballonVelo.y < 5) {
    // 1. 2. Limit Max descending speed
    ballonVelo.y += velocityChangeWhileCooling;
  }

  // * Execute Animations Per Frame
  ballonPos.y += ballonVelo.y;

  if (ballonPos.y > 0) ballonPos.y = 0; // Ballon landed on the ground
  if (ballonPos.y < 0) ballonPos.x += ballonVelo.x; // Move ballon to the right if not on the ground

  if (trees[0].x - (ballonPos.x - horizontalPadding) < -100) {
    // If a tree moves out of the screen, replace it with a new one
    trees.shift();
    generateTree();
  }

  if (
    backgroundTrees[0].x - (ballonPos.x * hill1.speed - horizontalPadding) <
    -40
  ) {
    // If a tree moves out of the screen, replace it with a new one
    backgroundTrees.shift();
    generateBackgroundTree();
  }

  draw(); // * Rerendering canvas

  // * Game Condition - Detect isHit
  const isHit = hitDetection();
  if (isHit || (fuel <= 0 && ballonPos.y >= 0)) {
    restartBtnEl.style.display = "block";
    return; // * Terminate Recursive request animation frame
  }

  window.requestAnimationFrame(animate);
};

const draw = () => {
  // * Init PrevCanvas
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // * Draw From low-level-layer To High-level-layer
  drawSky();
  ctx.save();

  ctx.translate(0, verticalPadding + mainAreaHeight);
  drawBackgroundHills();

  ctx.translate(horizontalPadding, 0);

  ctx.translate(-ballonPos.x, 0); // Center main canvas area to the middle of the screen

  drawTrees();

  drawBallon();

  // * Restore Last *Drawing State*
  // ** Canvas drawing State:
  // ** a. current transformation maxtrix
  // ** b. current clipping region
  // ** c. current dash list
  // ** (ex) strokeStyle, fillStyle, lineWidth, ...etc...
  ctx.restore();

  drawHeader();
};

const drawCircle = (cx, cy, radius) => {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fill();
};

const drawSky = () => {
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#AADBEA");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
};

const drawBackgroundHills = () => {
  drawHill({
    ...hill1,
    color: "#AAD155",
  });

  drawHill({
    ...hill2,
    color: "#84B249",
  });

  drawHill({
    ...hill3,
    color: "#26532B",
  });

  // * Draw background trees
  backgroundTrees.forEach((tree) => drawBackgroundTree(tree.x, tree.color));
};

const drawHill = ({ baseHeight, speed, amplitude, stretch, color }) => {
  ctx.beginPath();

  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i <= window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, speed, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;

  ctx.fill();
};

const drawBackgroundTree = (x, color) => {
  // * Constants
  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  const { baseHeight, speed, amplitude, stretch } = hill1;

  // * Draw trunk
  ctx.save();
  ctx.translate(
    (-ballonPos.x * speed + x) * stretch,
    getTreeY(x, baseHeight, amplitude)
  );

  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // * Draw crown
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
};

const drawTrees = () => {
  trees.forEach(({ x, h, r1, r2, r3, r4, r5, r6, r7, color }) => {
    ctx.save();
    ctx.translate(x, 0);

    // * 1. Draw Trunk
    const trunkWidth = 40;
    ctx.fillStyle = "#885F37";

    ctx.beginPath();
    ctx.moveTo(-trunkWidth / 2, 0);
    ctx.quadraticCurveTo(-trunkWidth / 4, -h / 2, -trunkWidth / 2, -h);
    ctx.lineTo(trunkWidth / 2, -h);
    ctx.quadraticCurveTo(trunkWidth / 4, -h / 2, trunkWidth / 2, 0);
    ctx.closePath();

    ctx.fill();

    // * 2. Draw Crown
    ctx.fillStyle = color;

    drawCircle(-20, -h - 15, r1);
    drawCircle(-30, -h - 25, r2);
    drawCircle(-20, -h - 35, r3);
    drawCircle(0, -h - 45, r4);
    drawCircle(20, -h - 35, r5);
    drawCircle(30, -h - 25, r6);
    drawCircle(20, -h - 15, r7);

    ctx.restore();
  });
};

const drawBallon = () => {
  ctx.save();

  ctx.translate(ballonPos.x, ballonPos.y);

  // * 1. Draw Cart
  ctx.fillStyle = "#DB504A";
  ctx.fillRect(-30, -40, 60, 10);
  ctx.fillStyle = "#EA9E8D";
  ctx.fillRect(-30, -30, 60, 30);

  // * 2. Draw Cables
  ctx.strokeStyle = "#D62828";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -40);
  ctx.lineTo(-24, -60);
  ctx.moveTo(24, -40);
  ctx.lineTo(24, -60);
  ctx.stroke();

  // * 3. Draw Ballon
  ctx.fillStyle = "#D62828";
  ctx.beginPath();
  ctx.moveTo(-30, -60);
  ctx.quadraticCurveTo(-80, -120, -80, -160);
  ctx.arc(0, -160, 80, Math.PI, 0, false);
  ctx.quadraticCurveTo(80, -120, 30, -60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const drawHeader = () => {
  // Fuel meter
  ctx.strokeStyle = fuel <= 30 ? "red" : "white";
  ctx.strokeRect(30, 30, 150, 30);
  ctx.fillStyle = fuel <= 30 ? "rgba(255,0,0,0.5)" : "rgba(150,150,200,0.5)";
  ctx.fillRect(30, 30, (150 * fuel) / 100, 30);

  // Score
  const score = Math.floor(ballonPos.x / 30);
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Tahoma";
  ctx.textAlign = "end";
  ctx.textBaseline = "top";
  ctx.fillText(`${score} m`, window.innerWidth - 30, 30);
};

const getHillY = (x, baseHeight, speed, amplitude, stretch) => {
  const sineBaseY = -baseHeight;

  return (
    Math.sinWithDegree((ballonPos.x * speed + x) * stretch) * amplitude +
    sineBaseY
  );
};

const getTreeY = (x, baseHeight, amplitude) => {
  const sineBaseY = -baseHeight;

  return Math.sinWithDegree(x) * amplitude + sineBaseY;
};

function hitDetection() {
  const cartBottomLeft = { x: ballonPos.x - 30, y: ballonPos.y };
  const cartBottomRight = { x: ballonPos.x + 30, y: ballonPos.y };
  const cartTopRight = { x: ballonPos.x + 30, y: ballonPos.y - 40 };

  for (const { x, h, r1, r2, r3, r4, r5 } of trees) {
    const treeBottomLeft = { x: x - 20, y: -h - 15 };
    const treeLeft = { x: x - 30, y: -h - 25 };
    const treeTopLeft = { x: x - 20, y: -h - 35 };
    const treeTop = { x: x, y: -h - 45 };
    const treeTopRight = { x: x + 20, y: -h - 35 };

    if (getDistance(cartBottomLeft, treeBottomLeft) < r1) return true;
    if (getDistance(cartBottomRight, treeBottomLeft) < r1) return true;
    if (getDistance(cartTopRight, treeBottomLeft) < r1) return true;

    if (getDistance(cartBottomLeft, treeLeft) < r2) return true;
    if (getDistance(cartBottomRight, treeLeft) < r2) return true;
    if (getDistance(cartTopRight, treeLeft) < r2) return true;

    if (getDistance(cartBottomLeft, treeTopLeft) < r3) return true;
    if (getDistance(cartBottomRight, treeTopLeft) < r3) return true;
    if (getDistance(cartTopRight, treeTopLeft) < r3) return true;

    if (getDistance(cartBottomLeft, treeTop) < r4) return true;
    if (getDistance(cartBottomRight, treeTop) < r4) return true;
    if (getDistance(cartTopRight, treeTop) < r4) return true;

    if (getDistance(cartBottomLeft, treeTopRight) < r5) return true;
    if (getDistance(cartBottomRight, treeTopRight) < r5) return true;
    if (getDistance(cartTopRight, treeTopRight) < r5) return true;
  }
}

function getDistance(point1, point2) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}
