const gameArea = document.getElementById('game-area');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const missDisplay = document.getElementById('misses');

const crosshair = document.getElementById('crosshair');
const colorSelect = document.getElementById('color-select');
const shapeSelect = document.getElementById('shape-select');

let level = 1;
let score = 0;
let misses = 0;
let targetsHit = 0;
let gameLoop;

const levelTargets = [
    { count: 1, moving: 0 },
    { count: 3, moving: 0 },
    { count: 5, moving: 0 },
    { count: 7, moving: 0 },
    { count: 10, moving: 0 },
    { count: 5, moving: 2 },
    { count: 7, moving: 3 },
    { count: 10, moving: 5 },
    { count: 12, moving: 8 },
    { count: 15, moving: 10 }
];

const TARGET_SIZE = 100;

function createTarget(moving = false) {
    const target = document.createElement('div');
    target.classList.add('target');
    
    target.style.width = `${TARGET_SIZE}px`;
    target.style.height = `${TARGET_SIZE}px`;
    target.style.borderRadius = '50%';
    target.style.border = '2px solid black';
    target.style.boxSizing = 'border-box';
    target.style.position = 'absolute';
    
    // Create the dartboard-like pattern
    target.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                red 0deg 60deg,
                white 60deg 120deg,
                red 120deg 180deg,
                white 180deg 240deg,
                red 240deg 300deg,
                white 300deg 360deg
            );
        ">
            <div style="
                position: absolute;
                top: 20%;
                left: 20%;
                width: 60%;
                height: 60%;
                border-radius: 50%;
                background: white;
                border: 2px solid black;
            "></div>
            <div style="
                position: absolute;
                top: 40%;
                left: 40%;
                width: 20%;
                height: 20%;
                border-radius: 50%;
                background: red;
                border: 1px solid black;
            "></div>
        </div>
    `;
    
    const maxX = gameArea.clientWidth - TARGET_SIZE;
    const maxY = gameArea.clientHeight - TARGET_SIZE;
    target.style.left = `${Math.random() * maxX}px`;
    target.style.top = `${Math.random() * maxY}px`;
    
    target.addEventListener('click', hitTarget);
    
    if (moving) {
        target.dataset.speedX = Math.random() * 4 - 2;
        target.dataset.speedY = Math.random() * 4 - 2;
    }
    
    gameArea.appendChild(target);
}

function moveTargets() {
    const targets = document.querySelectorAll('.target');
    targets.forEach(target => {
        if (target.dataset.speedX) {
            let x = parseFloat(target.style.left);
            let y = parseFloat(target.style.top);
            let speedX = parseFloat(target.dataset.speedX);
            let speedY = parseFloat(target.dataset.speedY);
            
            x += speedX;
            y += speedY;
            
            if (x <= 0 || x >= gameArea.clientWidth - TARGET_SIZE) {
                speedX *= -1;
                target.dataset.speedX = speedX;
            }
            if (y <= 0 || y >= gameArea.clientHeight - TARGET_SIZE) {
                speedY *= -1;
                target.dataset.speedY = speedY;
            }
            
            target.style.left = `${x}px`;
            target.style.top = `${y}px`;
        }
    });
}

function hitTarget(event) {
    event.target.remove();
    score++;
    targetsHit++;
    scoreDisplay.textContent = score;
    
    if (targetsHit === levelTargets[level - 1].count) {
        levelComplete();
    }
}

function handleMiss(event) {
    if (event.target === gameArea) {
        misses++;
        missDisplay.textContent = misses;
    }
}

function levelComplete() {
    clearInterval(gameLoop);
    gameArea.innerHTML = '';
    
    const message = document.createElement('div');
    message.innerHTML = `<h2>Level ${level} Complete!</h2>`;
    message.style.textAlign = 'center';
    gameArea.appendChild(message);
    
    setTimeout(startNextLevel, 1000);
}

function startNextLevel() {
    level++;
    if (level > levelTargets.length) {
        endGame(true);
        return;
    }
    levelDisplay.textContent = level;
    targetsHit = 0;
    gameArea.innerHTML = '';
    startGame();
}

function endGame(completed = false) {
    clearInterval(gameLoop);
    gameArea.innerHTML = `
        <h2>${completed ? 'Congratulations! You completed all levels!' : 'Game Over'}</h2>
        <p>Your final score: ${score}</p>
        <p>Total misses: ${misses}</p>
        <p>Levels completed: ${level - 1}</p>
        <button id="restart">Play Again</button>
    `;
    document.getElementById('restart').addEventListener('click', resetGame);
    document.removeEventListener('mousemove', updateCrosshair);
    colorSelect.removeEventListener('change', updateCrosshairStyle);
    shapeSelect.removeEventListener('change', updateCrosshairStyle);
}

function resetGame() {
    level = 1;
    score = 0;
    misses = 0;
    targetsHit = 0;
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
    missDisplay.textContent = misses;
    gameArea.innerHTML = '';
    startGame();
}

function startGame() {
    const currentLevel = levelTargets[level - 1];
    for (let i = 0; i < currentLevel.count - currentLevel.moving; i++) {
        createTarget(false);
    }
    for (let i = 0; i < currentLevel.moving; i++) {
        createTarget(true);
    }
    gameArea.addEventListener('click', handleMiss);
    document.addEventListener('mousemove', updateCrosshair);
    colorSelect.addEventListener('change', updateCrosshairStyle);
    shapeSelect.addEventListener('change', updateCrosshairStyle);
    updateCrosshairStyle();
    
    gameLoop = setInterval(moveTargets, 30);
}

function updateCrosshair(e) {
    crosshair.style.left = `${e.clientX}px`;
    crosshair.style.top = `${e.clientY}px`;
}

function updateCrosshairStyle() {
    crosshair.style.color = colorSelect.value;
    crosshair.style.borderColor = colorSelect.value;
    crosshair.className = shapeSelect.value;
}

startGame();
