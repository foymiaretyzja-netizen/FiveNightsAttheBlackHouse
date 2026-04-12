// --- night3-sys/tasksN3.js ---

// Re-using old IDs, but updating variable names for Night 3 context
const btnRepairLights = document.getElementById('btn-deport'); 
const btnFixBreaker = document.getElementById('btn-missile'); 
const btnCamera = document.getElementById('camera-btn');

// --- Audio System ---
const taskAudio = new Audio('../Sounds/alex_jauk-coffee-machine-noise-218424.mp3');
taskAudio.loop = true;

const successSound = new Audio('../Sounds/musheran-beep-313342.mp3'); // Clear beep
const failSound = new Audio('../Sounds/freesound_community-beep-beep-43875.mp3'); // Warning beep

function startTaskAudio() {
    taskAudio.currentTime = 0;
    taskAudio.play().catch(e => console.log("[Tasks] Audio block:", e));
}

function stopTaskAudio() {
    taskAudio.pause();
    taskAudio.currentTime = 0;
}

// --- Task Variables ---
let lightsCount = 0;
const MAX_LIGHTS = 5;

let breakerCount = 0;
const MAX_BREAKER = 1;

window.isTaskActive = false; 

// Storage for minigame loops
let minigameAnimationFrame = null;
let minigameInterval = null;
let activeTaskType = null; 

// --- Inject Minigame Container & Styles ---
const minigameOverlay = document.createElement('div');
minigameOverlay.id = 'minigame-overlay';
document.body.appendChild(minigameOverlay);

const styles = document.createElement('style');
styles.innerHTML = `
    #minigame-overlay {
        display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center;
        flex-direction: column; color: white; font-family: 'Courier New', monospace;
    }
    .minigame-box {
        background: #222; border: 4px solid #555; padding: 20px; border-radius: 10px;
        text-align: center; box-shadow: 0 0 20px rgba(0,0,0,1);
    }
    /* Lights Task CSS */
    .track-container { display: flex; gap: 20px; margin-top: 20px; }
    .track { width: 40px; height: 200px; background: #111; border: 2px solid #444; position: relative; }
    .slider { width: 100%; height: 40px; background: #00ff00; position: absolute; left: 0; box-shadow: 0 0 10px #00ff00; }
    .slider.paused { background: #ffaa00; box-shadow: 0 0 10px #ffaa00; }
    .track-btn { margin-top: 10px; padding: 10px; width: 100%; cursor: pointer; font-weight: bold; background: #444; color: #fff; border: 2px solid #666; }
    /* Breaker Task CSS */
    .color-box { width: 150px; height: 150px; margin: 20px auto; border: 4px solid #fff; }
    .breaker-btn { padding: 15px 30px; font-size: 1.2rem; cursor: pointer; font-weight: bold; background: #ff4444; color: white; border: 2px solid #ffaaaa; }
    .cancel-hint { margin-top: 20px; color: #aaa; font-size: 0.9rem; }
`;
document.head.appendChild(styles);

// Click off minigame to cancel
minigameOverlay.addEventListener('click', (e) => {
    if (e.target === minigameOverlay) {
        window.cancelCurrentTask();
    }
});

function setTaskButtonsDisabled(disabled) {
    if (btnRepairLights) btnRepairLights.disabled = disabled || (lightsCount >= MAX_LIGHTS);
    if (btnFixBreaker) btnFixBreaker.disabled = disabled || (breakerCount >= MAX_BREAKER);
}

// --- Cancellation Logic ---
window.cancelCurrentTask = function() {
    if (window.isTaskActive) {
        window.isTaskActive = false;
        stopTaskAudio();
        
        cancelAnimationFrame(minigameAnimationFrame);
        clearInterval(minigameInterval);
        
        minigameOverlay.style.display = 'none';
        minigameOverlay.innerHTML = ''; // Clear contents

        if (activeTaskType === 'lights') {
            btnRepairLights.style.color = "#ccc";
            btnRepairLights.innerText = `Repair Lights (${lightsCount}/${MAX_LIGHTS})`;
        } else if (activeTaskType === 'breaker') {
            btnFixBreaker.style.color = "#ccc";
            btnFixBreaker.innerText = `Fix Breaker (${breakerCount}/${MAX_BREAKER})`;
        }
        
        setTaskButtonsDisabled(false);
        activeTaskType = null;
        console.log("Task canceled by player!");
    }
};

// Cancel tasks if camera opens
if (btnCamera) {
    btnCamera.addEventListener('click', () => {
        window.cancelCurrentTask();
    });
}

// ==========================================
// TASK 1: REPAIR LIGHTS (ALIGNMENT MINIGAME)
// ==========================================
if (btnRepairLights) {
    btnRepairLights.innerText = `Repair Lights (${lightsCount}/${MAX_LIGHTS})`;
    btnRepairLights.addEventListener('click', () => {
        if (typeof isBlackout !== 'undefined' && isBlackout) return; 
        if (window.isTaskActive || lightsCount >= MAX_LIGHTS) return;

        window.isTaskActive = true;
        activeTaskType = 'lights';
        setTaskButtonsDisabled(true);
        btnRepairLights.style.color = "#ffaa00"; 
        
        startTaskAudio();
        startLightsMinigame();
    });
}

function startLightsMinigame() {
    minigameOverlay.style.display = 'flex';
    
    const sliders = [
        { y: 0, speed: 2.5, dir: 1, paused: false },
        { y: 80, speed: 3.5, dir: -1, paused: false },
        { y: 150, speed: 4.5, dir: 1, paused: false }
    ];

    minigameOverlay.innerHTML = `
        <div class="minigame-box">
            <h2>ALIGN THE FREQUENCIES</h2>
            <div class="track-container" id="track-container"></div>
            <div class="cancel-hint">Click outside the box to cancel</div>
        </div>
    `;

    const container = document.getElementById('track-container');
    const sliderEls = [];

    // Build the 3 tracks
    for (let i = 0; i < 3; i++) {
        const trackWrap = document.createElement('div');
        
        const track = document.createElement('div');
        track.className = 'track';
        
        const sliderEl = document.createElement('div');
        sliderEl.className = 'slider';
        track.appendChild(sliderEl);
        sliderEls.push(sliderEl);

        const btn = document.createElement('button');
        btn.className = 'track-btn';
        btn.innerText = 'PAUSE';
        
        btn.onclick = () => {
            sliders[i].paused = !sliders[i].paused;
            sliderEl.classList.toggle('paused');
            btn.innerText = sliders[i].paused ? 'RESUME' : 'PAUSE';
            checkLightsWin(sliders);
        };

        trackWrap.appendChild(track);
        trackWrap.appendChild(btn);
        container.appendChild(trackWrap);
    }

    // Animation Loop
    function animateLights() {
        for (let i = 0; i < 3; i++) {
            if (!sliders[i].paused) {
                sliders[i].y += sliders[i].speed * sliders[i].dir;
                if (sliders[i].y <= 0 || sliders[i].y >= 160) { // 200 track - 40 slider
                    sliders[i].dir *= -1;
                }
                sliderEls[i].style.top = `${sliders[i].y}px`;
            }
        }
        minigameAnimationFrame = requestAnimationFrame(animateLights);
    }
    
    animateLights();
}

function checkLightsWin(sliders) {
    if (sliders.every(s => s.paused)) {
        // Find the difference between the highest and lowest slider
        const ys = sliders.map(s => s.y);
        const diff = Math.max(...ys) - Math.min(...ys);

        if (diff < 25) { // 25px tolerance for overlap
            successSound.play();
            lightsCount++;
            window.cancelCurrentTask(); // Closes UI cleanly
            
            if (lightsCount >= MAX_LIGHTS) {
                btnRepairLights.style.color = "#00ff00";
                btnRepairLights.style.borderColor = "#00ff00";
                btnRepairLights.innerText = "Lights Repaired";
                btnRepairLights.disabled = true;
            }
            checkWinCondition();
        } else {
            failSound.currentTime = 0;
            failSound.play();
            // Automatically unpause them so the player has to try again
            document.querySelectorAll('.track-btn').forEach(btn => btn.click());
        }
    }
}

// ==========================================
// TASK 2: FIX BREAKER (COLOR MATCH MINIGAME)
// ==========================================
if (btnFixBreaker) {
    btnFixBreaker.innerText = `Fix Breaker (${breakerCount}/${MAX_BREAKER})`;
    btnFixBreaker.addEventListener('click', () => {
        if (typeof isBlackout !== 'undefined' && isBlackout) return;
        if (window.isTaskActive || breakerCount >= MAX_BREAKER) return;

        window.isTaskActive = true;
        activeTaskType = 'breaker';
        setTaskButtonsDisabled(true);
        btnFixBreaker.style.color = "#ffaa00"; 
        
        startTaskAudio();
        startBreakerMinigame();
    });
}

function startBreakerMinigame() {
    minigameOverlay.style.display = 'flex';
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    let currentColor = '';

    minigameOverlay.innerHTML = `
        <div class="minigame-box">
            <h2>RE-ROUTE BREAKER</h2>
            <p>TARGET COLOR:</p>
            <div class="color-box" style="background: ${targetColor}; width: 80px; height: 80px; border-radius: 50%;"></div>
            <p>CURRENT FREQUENCY:</p>
            <div class="color-box" id="flicker-box"></div>
            <button class="breaker-btn" id="btn-lock-breaker">LOCK CONNECTION</button>
            <div class="cancel-hint">Click outside the box to cancel</div>
        </div>
    `;

    const flickerBox = document.getElementById('flicker-box');
    const lockBtn = document.getElementById('btn-lock-breaker');

    // Rapidly change colors
    minigameInterval = setInterval(() => {
        currentColor = colors[Math.floor(Math.random() * colors.length)];
        flickerBox.style.background = currentColor;
    }, 120); // 120ms makes it fast and challenging!

    lockBtn.onclick = () => {
        clearInterval(minigameInterval); // Freeze the color
        
        if (currentColor === targetColor) {
            successSound.play();
            breakerCount++;
            window.cancelCurrentTask(); // Closes UI cleanly
            
            if (breakerCount >= MAX_BREAKER) {
                btnFixBreaker.style.color = "#00ff00";
                btnFixBreaker.style.borderColor = "#00ff00";
                btnFixBreaker.innerText = "Breaker Fixed";
                btnFixBreaker.disabled = true;
            }
            checkWinCondition();
        } else {
            failSound.currentTime = 0;
            failSound.play();
            // Wait a second, then restart the flickering
            lockBtn.innerText = "FAILED! REBOOTING...";
            lockBtn.disabled = true;
            setTimeout(() => {
                if (window.isTaskActive) { // Ensure they haven't canceled
                    lockBtn.innerText = "LOCK CONNECTION";
                    lockBtn.disabled = false;
                    minigameInterval = setInterval(() => {
                        currentColor = colors[Math.floor(Math.random() * colors.length)];
                        flickerBox.style.background = currentColor;
                    }, 120);
                }
            }, 1000);
        }
    };
}

// --- End of Night Win Condition ---
function checkWinCondition() {
    if (lightsCount >= MAX_LIGHTS && breakerCount >= MAX_BREAKER) {
        triggerWin();
    }
}

// (Confetti and triggerWin logic remains untouched to preserve your ending sequence!)
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

    const clockChime = new Audio('../Sounds/li-bing-tower-clock-chimewestminster-187254.mp3');
    const confettiCheer = new Audio('../Sounds/u_jspnqv1glx-1gift-confetti-447240.mp3');

    if (typeof window.completeNight === 'function') {
        window.completeNight(3); // Updated to mark night 3 complete
    } else {
        console.warn("Save system not found.");
    }

    setTimeout(() => { 
        fadeOutDiv.style.opacity = '1'; 
        clockChime.play().catch(e => console.log("[Tasks] Audio block:", e));
    }, 100);

    setTimeout(() => { 
        winText.style.opacity = '1'; 
        confettiCheer.play().catch(e => console.log("[Tasks] Audio block:", e));
        launchConfetti(); 
        
        setTimeout(() => { 
            window.location.href = '../title.html'; 
        }, 15000);
        
    }, 2000); 
}
