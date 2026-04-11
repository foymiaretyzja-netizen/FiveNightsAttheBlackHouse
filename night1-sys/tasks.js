// --- night1-sys/tasks.js ---

const btnDeport = document.getElementById('btn-deport');
const btnMissile = document.getElementById('btn-missile');

// Task Progress Variables
let deportCount = 0;
const MAX_DEPORT = 10;

let missileCount = 0;
const MAX_MISSILES = 5;

// AI Data Relay & State Variables
window.lastMissileTime = Date.now();
window.elongAngerMultiplier = 1.0; 
window.isTaskActive = false; // Locks the camera while true

// Helper: Disables/Enables buttons while a task is running
function setTaskButtonsDisabled(disabled) {
    if (deportCount < MAX_DEPORT) btnDeport.disabled = disabled;
    if (missileCount < MAX_MISSILES) btnMissile.disabled = disabled;
}

// --- Task 1: Deportation (5 Seconds) ---
btnDeport.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return; 
    if (window.isTaskActive || deportCount >= MAX_DEPORT) return;

    window.isTaskActive = true;
    setTaskButtonsDisabled(true);
    btnDeport.style.color = "#ffaa00"; // Turn yellow to show it's working
    
    let timeLeft = 5;
    btnDeport.innerText = `Processing... (${timeLeft}s)`;

    const countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnDeport.innerText = `Processing... (${timeLeft}s)`;
        } else {
            clearInterval(countdown);
            finishDeportation();
        }
    }, 1000);
});

function finishDeportation() {
    deportCount++;
    window.isTaskActive = false;
    setTaskButtonsDisabled(false);
    
    btnDeport.style.color = "#ccc"; // Reset color
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
    setTaskButtonsDisabled(true);
    btnMissile.style.color = "#ffaa00"; 
    
    // Reset Elong's patience immediately upon starting the sequence
    window.lastMissileTime = Date.now();
    window.elongAngerMultiplier = 1.0;

    let timeLeft = 10;
    btnMissile.innerText = `Preparing Launch... (${timeLeft}s)`;

    const countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnMissile.innerText = `Preparing Launch... (${timeLeft}s)`;
            // Keep resetting his timer so he doesn't get mad *during* the 10-second launch
            window.lastMissileTime = Date.now(); 
        } else {
            clearInterval(countdown);
            finishMissile();
        }
    }, 1000);
});

function finishMissile() {
    missileCount++;
    window.isTaskActive = false;
    setTaskButtonsDisabled(false);
    
    btnMissile.style.color = "#ccc";
    btnMissile.innerText = `Send missiles to Irun (${missileCount}/${MAX_MISSILES})`;
    
    console.log("Missile sent! Elong is appeased.");

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
        console.log(`Elong is getting impatient! Anger Multiplier: ${window.elongAngerMultiplier.toFixed(1)}x`);
    }
}, 5000);

// --- End of Night Win Condition ---
function checkWinCondition() {
    if (deportCount >= MAX_DEPORT && missileCount >= MAX_MISSILES) {
        console.log("All tasks complete. Ending night!");
        triggerWin();
    }
}

function triggerWin() {
    // 1. Create a black overlay
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
    fadeOutDiv.style.pointerEvents = 'all'; // Blocks player from clicking anything else
    document.body.appendChild(fadeOutDiv);

    // 2. Create the "6:00 AM" text
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
    winText.style.transition = 'opacity 3s ease-in-out 1.5s'; // Fades in AFTER screen goes black
    document.body.appendChild(winText);

    // 3. Trigger Animations
    setTimeout(() => { fadeOutDiv.style.opacity = '1'; }, 100);
    setTimeout(() => { winText.style.opacity = '1'; }, 2000);
    
    // 4. (Optional) Redirect to main menu or next night after reading text
    setTimeout(() => {
        // window.location.href = 'menu.html';
        console.log("Redirect to next scene here.");
    }, 8000);
}
