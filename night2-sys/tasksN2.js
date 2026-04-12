// --- night2-sys/tasksN2.js ---

// NOTE: If you changed the IDs in your HTML, update 'btn-deport' and 'btn-missile' here!
const btnCure = document.getElementById('btn-deport'); 
const btnPs7 = document.getElementById('btn-missile'); 
const btnCamera = document.getElementById('camera-btn');

// --- Audio System ---
// Using ../ to ensure it routes out of night2-sys correctly
const taskAudio = new Audio('../Sounds/alex_jauk-coffee-machine-noise-218424.mp3');

function startTaskAudio() {
    taskAudio.currentTime = 0;
    taskAudio.play().catch(e => console.log("[Tasks] Audio block:", e));
}

function stopTaskAudio() {
    taskAudio.pause();
    taskAudio.currentTime = 0;
}

// Task 1: Cure Variables
let cureCount = 0;
const MAX_CURE = 15;

// Task 2: PS7 Variables
let ps7Count = 0;
const MAX_PS7 = 1;

// AI Data Relay & State Variables
window.isTaskActive = false; 

// Timer Storage
let activeTaskTimer = null;
let activeTaskType = null; // 'cure' or 'ps7'

// Helper: Disables/Enables buttons while respecting max limits
function setTaskButtonsDisabled(disabled) {
    btnCure.disabled = disabled || (cureCount >= MAX_CURE);
    btnPs7.disabled = disabled || (ps7Count >= MAX_PS7);
}

// --- Cancellation Logic ---
window.cancelCurrentTask = function() {
    if (activeTaskTimer) {
        clearInterval(activeTaskTimer);
        activeTaskTimer = null;
        window.isTaskActive = false;
        
        stopTaskAudio(); // Stop the sound if canceled by opening cameras or a jumpscare
        
        // Reset Button UI
        if (activeTaskType === 'cure') {
            btnCure.style.color = "#ccc";
            btnCure.innerText = `Fund cure for Liberal virius (${cureCount}/${MAX_CURE})`;
        } else if (activeTaskType === 'ps7') {
            btnPs7.style.color = "#ccc";
            btnPs7.innerText = `Buy the new PS7 (${ps7Count}/${MAX_PS7})`;
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

// --- Task 1: Fund Cure (5 Seconds) ---
btnCure.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return; 
    if (window.isTaskActive || cureCount >= MAX_CURE) return;

    window.isTaskActive = true;
    activeTaskType = 'cure';
    setTaskButtonsDisabled(true);
    btnCure.style.color = "#ffaa00"; 
    
    startTaskAudio();

    let timeLeft = 5;
    btnCure.innerText = `Funding... (${timeLeft}s)`;

    activeTaskTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnCure.innerText = `Funding... (${timeLeft}s)`;
        } else {
            clearInterval(activeTaskTimer);
            activeTaskTimer = null;
            finishCure(); // Finishes task and stops audio
        }
    }, 1000);
});

function finishCure() {
    cureCount++;
    window.isTaskActive = false;
    activeTaskType = null;
    
    stopTaskAudio(); // Cuts off the 20s audio loop early
    setTaskButtonsDisabled(false);
    
    btnCure.style.color = "#ccc"; 
    btnCure.innerText = `Fund cure for Liberal virius (${cureCount}/${MAX_CURE})`;
    
    if (cureCount >= MAX_CURE) {
        btnCure.style.color = "#00ff00";
        btnCure.style.borderColor = "#00ff00";
        btnCure.innerText = "Cure Funded";
        btnCure.disabled = true;
    }
    
    checkWinCondition();
}

// --- Task 2: Buy PS7 (15 Seconds) ---
btnPs7.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return;
    if (window.isTaskActive || ps7Count >= MAX_PS7) return;

    window.isTaskActive = true;
    activeTaskType = 'ps7';
    setTaskButtonsDisabled(true);
    btnPs7.style.color = "#ffaa00"; 
    
    startTaskAudio();

    let timeLeft = 15;
    btnPs7.innerText = `Purchasing... (${timeLeft}s)`;

    activeTaskTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btnPs7.innerText = `Purchasing... (${timeLeft}s)`;
        } else {
            clearInterval(activeTaskTimer);
            activeTaskTimer = null;
            finishPs7(); // Finishes task and stops audio
        }
    }, 1000);
});

function finishPs7() {
    ps7Count++;
    window.isTaskActive = false;
    activeTaskType = null;
    
    stopTaskAudio(); // Cuts off the 20s audio loop early
    setTaskButtonsDisabled(false);
    
    btnPs7.style.color = "#ccc";
    btnPs7.innerText = `Buy the new PS7 (${ps7Count}/${MAX_PS7})`;
    
    if (ps7Count >= MAX_PS7) {
        btnPs7.style.color = "#00ff00";
        btnPs7.style.borderColor = "#00ff00";
        btnPs7.innerText = "PS7 Purchased";
        btnPs7.disabled = true;
    }
    
    checkWinCondition();
}

// --- End of Night Win Condition ---
function checkWinCondition() {
    if (cureCount >= MAX_CURE && ps7Count >= MAX_PS7) {
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

        const duration = Math.random() * 3 + 2; 
        const delay = Math.random() * 1.5; 

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

    // Using ../ for consistent audio paths
    const clockChime = new Audio('../Sounds/li-bing-tower-clock-chimewestminster-187254.mp3');
    const confettiCheer = new Audio('../Sounds/u_jspnqv1glx-1gift-confetti-447240.mp3');

    if (typeof window.completeNight === 'function') {
        window.completeNight(2); 
    } else {
        console.warn("Save system not found. Make sure saveSystem.js is linked in your HTML.");
    }

    setTimeout(() => { 
        fadeOutDiv.style.opacity = '1'; 
        clockChime.play().catch(e => console.log("[Tasks] Audio block:", e));
    }, 100);

    setTimeout(() => { 
        winText.style.opacity = '1'; 
        confettiCheer.play().catch(e => console.log("[Tasks] Audio block:", e));
        launchConfetti(); 
        
        // Return to title screen
        setTimeout(() => { 
            window.location.href = '../title.html'; 
        }, 15000);
        
    }, 2000); 
}
