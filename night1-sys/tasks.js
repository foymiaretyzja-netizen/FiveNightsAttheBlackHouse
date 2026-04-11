// --- night1-sys/tasks.js ---

const btnDeport = document.getElementById('btn-deport');
const btnMissile = document.getElementById('btn-missile');
const btnCamera = document.getElementById('camera-btn'); // Grab the camera button

// --- Audio System ---
const taskAudio = new Audio('../Sounds/alex_jauk-coffee-machine-noise-218424.mp3');

function startTaskAudio() {
    taskAudio.currentTime = 0;
    taskAudio.play().catch(e => console.log("Audio block:", e));
}

function stopTaskAudio() {
    taskAudio.pause();
    taskAudio.currentTime = 0;
}

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
        
        stopTaskAudio(); // Stop the sound if canceled
        
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
    
    startTaskAudio(); // Start the sound

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
    
    stopTaskAudio(); // Stop the sound when finished
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
    
    startTaskAudio(); // Start the sound
    
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
    
    stopTaskAudio(); // Stop the sound when finished
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

function launchConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 20 + 10 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.zIndex = '10001';
        confetti.style.opacity = Math.random() + 0.5;
        confetti.style.pointerEvents = 'none';
        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2; // 2 to 5 seconds fall time
        const delay = Math.random() * 1.5; // Random start delay

        confetti.animate([
            { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random() * 200 - 100}px, 100vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            easing: 'cubic-bezier(.37, 0, .63, 1)',
            fill: 'forwards'
        });

        setTimeout(() => confetti.remove(), (duration + delay) * 1000 + 100);
    }
}

function triggerWin() {
    // 1. Create the black fade-out overlay
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

    // 2. Create the 6:00 AM Text
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

    // 3. Load Audio
    const clockChime = new Audio('../Sounds/li-bing-tower-clock-chimewestminster-187254.mp3');
    const confettiCheer = new Audio('../Sounds/u_jspnqv1glx-1gift-confetti-447240.mp3');

    // 4. Trigger Auto-Save! (Make sure saveSystem.js is linked in night1.html)
    if (typeof window.completeNight === 'function') {
        window.completeNight(1); // Tells the system Night 1 is done
    } else {
        console.warn("Save system not found. Make sure saveSystem.js is linked in your HTML.");
    }

    // 5. Execute Sequence
    setTimeout(() => { 
        fadeOutDiv.style.opacity = '1'; 
        clockChime.play().catch(e => console.log("Audio block:", e));
    }, 100);

    setTimeout(() => { 
        winText.style.opacity = '1'; 
        confettiCheer.play().catch(e => console.log("Audio block:", e));
        launchConfetti(); // Trigger the visual confetti effect
        
        // Redirect back to title screen 15 seconds after the text appears
        setTimeout(() => { 
            window.location.href = '../title.html'; 
        }, 15000);
        
    }, 2000); 
}
