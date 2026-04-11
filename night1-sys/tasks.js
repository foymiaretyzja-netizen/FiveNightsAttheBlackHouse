// --- night1-sys/tasks.js ---

const btnDeport = document.getElementById('btn-deport');
const btnMissile = document.getElementById('btn-missile');
const btnCamera = document.getElementById('camera-btn'); // Grab the camera button

// Task Progress Variables
let deportCount = 0;
const MAX_DEPORT = 10;

let missileCount = 0;
const MAX_MISSILES = 5;

// AI Data Relay & State Variables
window.lastMissileTime = Date.now();
window.elongAngerMultiplier = 1.0; 
window.isTaskActive = false; 

// Timer Storage
let activeTaskTimer = null;
let activeTaskType = null; // 'deport' or 'missile'

// Helper: Disables/Enables buttons while respecting max limits
function setTaskButtonsDisabled(disabled) {
    btnDeport.disabled = disabled || (deportCount >= MAX_DEPORT);
    btnMissile.disabled = disabled || (missileCount >= MAX_MISSILES);
}

// --- Cancellation Logic ---
window.cancelCurrentTask = function() {
    if (activeTaskTimer) {
        clearInterval(activeTaskTimer);
        activeTaskTimer = null;
        window.isTaskActive = false;
        
        // Reset Button UI
        if (activeTaskType === 'deport') {
            btnDeport.style.color = "#ccc";
            btnDeport.innerText = `Deport liberals (${deportCount}/${MAX_DEPORT})`;
        } else if (activeTaskType === 'missile') {
            btnMissile.style.color = "#ccc";
            btnMissile.innerText = `Send missiles to Irun (${missileCount}/${MAX_MISSILES})`;
        }
        
        setTaskButtonsDisabled(false);
        activeTaskType = null;
        console.log("Task canceled by player movement!");
    }
};

// Cancel tasks if the player opens the camera monitor
if (btnCamera) {
    btnCamera.addEventListener('click', () => {
        window.cancelCurrentTask();
    });
}

// --- Task 1: Deportation (5 Seconds) ---
btnDeport.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return; 
    if (window.isTaskActive || deportCount >= MAX_DEPORT) return;

    window.isTaskActive = true;
    activeTaskType = 'deport';
    setTaskButtonsDisabled(true);
    btnDeport.style.color = "#ffaa00"; 
    
    let timeLeft = 5;
    btnDeport.innerText = `Processing... (${timeLeft}s)`;

    activeTaskTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnDeport.innerText = `Processing... (${timeLeft}s)`;
        } else {
            clearInterval(activeTaskTimer);
            activeTaskTimer = null;
            finishDeportation();
        }
    }, 1000);
});

function finishDeportation() {
    deportCount++;
    window.isTaskActive = false;
    activeTaskType = null;
    setTaskButtonsDisabled(false);
    
    btnDeport.style.color = "#ccc"; 
    btnDeport.innerText = `Deport liberals (${deportCount}/${MAX_DEPORT})`;
    
    if (deportCount >= MAX_DEPORT) {
        btnDeport.style.color = "#00ff00";
        btnDeport.style.borderColor = "#00ff00";
        btnDeport.innerText = "Deportation Complete";
        btnDeport.disabled = true;
    }
    
    checkWinCondition();
}

// --- Task 2: Missiles (10 Seconds) ---
btnMissile.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return;
    if (window.isTaskActive || missileCount >= MAX_MISSILES) return;

    window.isTaskActive = true;
    activeTaskType = 'missile';
    setTaskButtonsDisabled(true);
    btnMissile.style.color = "#ffaa00"; 
    
    window.lastMissileTime = Date.now();
    window.elongAngerMultiplier = 1.0;

    let timeLeft = 10;
    btnMissile.innerText = `Preparing Launch... (${timeLeft}s)`;

    activeTaskTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnMissile.innerText = `Preparing Launch... (${timeLeft}s)`;
            window.lastMissileTime = Date.now(); 
        } else {
            clearInterval(activeTaskTimer);
            activeTaskTimer = null;
            finishMissile();
        }
    }, 1000);
});

function finishMissile() {
    missileCount++;
    window.isTaskActive = false;
    activeTaskType = null;
    setTaskButtonsDisabled(false);
    
    btnMissile.style.color = "#ccc";
    btnMissile.innerText = `Send missiles to Irun (${missileCount}/${MAX_MISSILES})`;
    
    if (missileCount >= MAX_MISSILES) {
        btnMissile.style.color = "#00ff00";
        btnMissile.style.borderColor = "#00ff00";
        btnMissile.innerText = "Missiles Depleted";
        btnMissile.disabled = true;
    }
    
    checkWinCondition();
}

// --- Elong Anger Monitor ---
setInterval(() => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return;
    if (missileCount >= MAX_MISSILES) return; 

    const secondsSinceLastMissile = Math.floor((Date.now() - window.lastMissileTime) / 1000);
    
    if (secondsSinceLastMissile > 20) {
        window.elongAngerMultiplier += 0.2; 
    }
}, 5000);

// --- End of Night Win Condition ---
function checkWinCondition() {
    if (deportCount >= MAX_DEPORT && missileCount >= MAX_MISSILES) {
        triggerWin();
    }
}

function triggerWin() {
    const fadeOutDiv = document.createElement('div');
    fadeOutDiv.style.position = 'fixed';
    fadeOutDiv.style.top = '0';
    fadeOutDiv.style.left = '0';
    fadeOutDiv.style.width = '100vw';
    fadeOutDiv.style.height = '100vh';
    fadeOutDiv.style.backgroundColor = '#000';
    fadeOutDiv.style.opacity = '0';
    fadeOutDiv.style.zIndex = '9999'; 
    fadeOutDiv.style.transition = 'opacity 3s ease-in-out';
    fadeOutDiv.style.pointerEvents = 'all'; 
    document.body.appendChild(fadeOutDiv);

    const winText = document.createElement('div');
    winText.innerText = "6:00 AM";
    winText.style.position = 'fixed';
    winText.style.top = '50%';
    winText.style.left = '50%';
    winText.style.transform = 'translate(-50%, -50%)';
    winText.style.color = '#fff';
    winText.style.fontFamily = "'Courier New', Courier, monospace";
    winText.style.fontSize = '4rem';
    winText.style.fontWeight = 'bold';
    winText.style.zIndex = '10000';
    winText.style.opacity = '0';
    winText.style.transition = 'opacity 3s ease-in-out 1.5s'; 
    document.body.appendChild(winText);

    setTimeout(() => { fadeOutDiv.style.opacity = '1'; }, 100);
    setTimeout(() => { winText.style.opacity = '1'; }, 2000);
}
