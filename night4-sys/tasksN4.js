// --- night4-sys/tasksN4.js ---

// Re-using old IDs, updated variables for our new Vents & Calibration tasks
const btnFixVents = document.getElementById('btn-deport'); 
const btnCalibrate = document.getElementById('btn-missile'); 
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
let ventsCount = 0;
const MAX_VENTS = 10; 

let calibrateCount = 0;
const MAX_CALIBRATE = 5; 

window.isTaskActive = false; 

// Storage for minigame loops
let minigameAnimationFrame = null;
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
        text-align: center; box-shadow: 0 0 20px rgba(0,0,0,1); max-width: 90vw;
    }
    .cancel-hint { margin-top: 20px; color: #aaa; font-size: 0.9rem; }
    
    /* Air Vents Task CSS */
    .vent-bar-bg { width: 300px; height: 30px; background: #111; border: 2px solid #555; margin: 20px auto; position: relative; }
    .vent-bar-fill { width: 0%; height: 100%; background: #00ff00; transition: width 0.05s linear; }
    .fan-icon { font-size: 50px; display: inline-block; margin-top: 10px; color: #aaa; }
    .spam-hint { font-weight: bold; color: #ffaa00; margin-top: 10px; }

    /* Calibration Task CSS */
    .calib-track { width: 320px; height: 60px; background: #111; border: 2px solid #555; position: relative; margin: 20px auto; overflow: hidden; }
    .calib-zone { position: absolute; top: 0; height: 100%; border: 1px solid rgba(0,0,0,0.5); box-sizing: border-box; }
    .calib-zone.idle { background: rgba(255, 0, 0, 0.6); }
    .calib-zone.next { background: rgba(255, 255, 0, 0.8); box-shadow: 0 0 10px #ffff00; }
    .calib-zone.done { background: rgba(0, 255, 0, 0.8); box-shadow: 0 0 10px #00ff00; }
    .calib-cursor { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #fff; box-shadow: 0 0 5px #fff; z-index: 10; }
`;
document.head.appendChild(styles);

// Click off minigame to cancel
minigameOverlay.addEventListener('mousedown', (e) => {
    if (e.target === minigameOverlay) {
        window.cancelCurrentTask();
    }
});

function setTaskButtonsDisabled(disabled) {
    if (btnFixVents) btnFixVents.disabled = disabled || (ventsCount >= MAX_VENTS);
    if (btnCalibrate) btnCalibrate.disabled = disabled || (calibrateCount >= MAX_CALIBRATE);
}

// --- Spacebar Listener for both Minigames ---
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && window.isTaskActive) {
        e.preventDefault(); // Stop page scrolling
        if (activeTaskType === 'vents') {
            handleVentSpam();
        } else if (activeTaskType === 'calibrate') {
            handleCalibrateSpace();
        }
    }
});

// --- Cancellation Logic ---
window.cancelCurrentTask = function() {
    if (window.isTaskActive) {
        window.isTaskActive = false;
        stopTaskAudio();
        
        cancelAnimationFrame(minigameAnimationFrame);
        
        minigameOverlay.style.display = 'none';
        minigameOverlay.innerHTML = ''; 

        if (activeTaskType === 'vents') {
            btnFixVents.style.color = "#ccc";
            btnFixVents.innerText = `Fix Air Vents (${ventsCount}/${MAX_VENTS})`;
        } else if (activeTaskType === 'calibrate') {
            btnCalibrate.style.color = "#ccc";
            btnCalibrate.innerText = `Calibrate Systems (${calibrateCount}/${MAX_CALIBRATE})`;
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
// TASK 1: AIR VENTS (SPAM & HOLD MINIGAME)
// ==========================================
let ventProgress = 0;
let fanSpeed = 0;
let fanRotation = 0;

if (btnFixVents) {
    btnFixVents.innerText = `Fix Air Vents (${ventsCount}/${MAX_VENTS})`;
    btnFixVents.addEventListener('click', () => {
        if (typeof isBlackout !== 'undefined' && isBlackout) return; 
        if (window.isTaskActive || ventsCount >= MAX_VENTS) return;

        window.isTaskActive = true;
        activeTaskType = 'vents';
        setTaskButtonsDisabled(true);
        btnFixVents.style.color = "#ffaa00"; 
        
        startTaskAudio();
        startVentsMinigame();
    });
}

function startVentsMinigame() {
    minigameOverlay.style.display = 'flex';
    
    ventProgress = 0;
    fanSpeed = 0;
    fanRotation = 0;

    minigameOverlay.innerHTML = `
        <div class="minigame-box">
            <h2>RESTART AIR VENTS</h2>
            <div class="spam-hint">SPAM [SPACE] TO PUMP POWER</div>
            <div class="vent-bar-bg">
                <div class="vent-bar-fill" id="vent-fill"></div>
            </div>
            <div class="fan-icon" id="fan-icon">☢</div>
            <div class="cancel-hint">Click outside the box to cancel</div>
        </div>
    `;

    const fillEl = document.getElementById('vent-fill');
    const fanEl = document.getElementById('fan-icon');
    const maxFanSpeed = 25; // Speed required to beat the task

    function animateVents() {
        if (!window.isTaskActive || activeTaskType !== 'vents') return;

        // Drain the progress bar constantly
        ventProgress -= 0.6; 
        if (ventProgress < 0) ventProgress = 0;
        
        fillEl.style.width = `${ventProgress}%`;

        // If bar is full, fan accelerates. Otherwise, it decelerates.
        if (ventProgress >= 99) {
            fanSpeed += 0.1;
            fillEl.style.background = "#ffff00"; // Visual cue it's maxed
        } else {
            fanSpeed -= 0.2;
            fillEl.style.background = "#00ff00";
        }
        
        // Clamp fan speed
        if (fanSpeed < 0) fanSpeed = 0;
        if (fanSpeed > maxFanSpeed) fanSpeed = maxFanSpeed;

        // Apply rotation
        fanRotation += fanSpeed;
        fanEl.style.transform = `rotate(${fanRotation}deg)`;

        // Check Win Condition for this task
        if (fanSpeed >= maxFanSpeed) {
            successSound.play();
            ventsCount++;
            window.cancelCurrentTask(); 
            
            if (ventsCount >= MAX_VENTS) {
                btnFixVents.style.color = "#00ff00";
                btnFixVents.style.borderColor = "#00ff00";
                btnFixVents.innerText = "Air Vents Running";
                btnFixVents.disabled = true;
            }
            checkWinCondition();
            return;
        }

        minigameAnimationFrame = requestAnimationFrame(animateVents);
    }
    animateVents();
}

function handleVentSpam() {
    ventProgress += 12; // Amount of progress per click
    if (ventProgress > 100) ventProgress = 100;
}


// ==========================================
// TASK 2: CALIBRATION (TIMING ZONES MINIGAME)
// ==========================================
let calibZones = [];
let currentZoneIndex = 0;
let cursorX = 0;
let cursorDir = 1;
let cursorSpeed = 2;

if (btnCalibrate) {
    btnCalibrate.innerText = `Calibrate Systems (${calibrateCount}/${MAX_CALIBRATE})`;
    btnCalibrate.addEventListener('click', () => {
        if (typeof isBlackout !== 'undefined' && isBlackout) return;
        if (window.isTaskActive || calibrateCount >= MAX_CALIBRATE) return;

        window.isTaskActive = true;
        activeTaskType = 'calibrate';
        setTaskButtonsDisabled(true);
        btnCalibrate.style.color = "#ffaa00"; 
        
        startTaskAudio();
        startCalibrateMinigame();
    });
}

function startCalibrateMinigame() {
    minigameOverlay.style.display = 'flex';
    
    // Scale Difficulty: First 2 completions = 2 boxes. Last 3 completions = 5 boxes.
    const numZones = calibrateCount < 2 ? 2 : 5;
    
    // Base speed gets slightly faster each completion
    cursorSpeed = 3.0 + (calibrateCount * 0.5);
    cursorX = 0;
    cursorDir = 1;
    currentZoneIndex = 0;
    calibZones = [];

    // Generate non-overlapping zones
    const trackWidth = 320;
    const segmentWidth = trackWidth / numZones;
    
    let zonesHTML = '';
    for (let i = 0; i < numZones; i++) {
        const isThin = Math.random() > 0.5;
        const width = isThin ? 15 : 35;
        
        // Random placement within its dedicated segment to avoid overlap
        const x = (i * segmentWidth) + (Math.random() * (segmentWidth - width));
        
        calibZones.push({ x, width });
        
        // Build the HTML for the boxes
        const statusClass = i === 0 ? 'next' : 'idle';
        zonesHTML += `<div class="calib-zone ${statusClass}" id="zone-${i}" style="left: ${x}px; width: ${width}px;"></div>`;
    }

    minigameOverlay.innerHTML = `
        <div class="minigame-box" style="width: 380px;">
            <h2>CALIBRATE FREQUENCIES</h2>
            <div class="spam-hint">PRESS [SPACE] IN THE ZONES</div>
            <div class="calib-track">
                ${zonesHTML}
                <div class="calib-cursor" id="calib-cursor"></div>
            </div>
            <div class="cancel-hint">Click outside the box to cancel</div>
        </div>
    `;

    const cursorEl = document.getElementById('calib-cursor');

    function animateCalibrate() {
        if (!window.isTaskActive || activeTaskType !== 'calibrate') return;

        cursorX += cursorSpeed * cursorDir;
        if (cursorX <= 0 || cursorX >= trackWidth - 4) {
            cursorDir *= -1; // Bounce
        }
        
        cursorEl.style.left = `${cursorX}px`;
        minigameAnimationFrame = requestAnimationFrame(animateCalibrate);
    }
    animateCalibrate();
}

function handleCalibrateSpace() {
    if (currentZoneIndex >= calibZones.length) return;

    const targetZone = calibZones[currentZoneIndex];
    const cursorCenter = cursorX + 2; // Add half cursor width

    // Check if cursor is within the current target box boundaries
    if (cursorCenter >= targetZone.x && cursorCenter <= targetZone.x + targetZone.width) {
        // HIT
        const currentEl = document.getElementById(`zone-${currentZoneIndex}`);
        currentEl.classList.remove('next', 'idle');
        currentEl.classList.add('done');
        
        successSound.currentTime = 0;
        successSound.play();
        
        currentZoneIndex++;
        
        if (currentZoneIndex >= calibZones.length) {
            // Task Complete
            calibrateCount++;
            setTimeout(() => {
                window.cancelCurrentTask(); 
                if (calibrateCount >= MAX_CALIBRATE) {
                    btnCalibrate.style.color = "#00ff00";
                    btnCalibrate.style.borderColor = "#00ff00";
                    btnCalibrate.innerText = "Systems Calibrated";
                    btnCalibrate.disabled = true;
                }
                checkWinCondition();
            }, 300);
        } else {
            // Highlight the next required zone
            const nextEl = document.getElementById(`zone-${currentZoneIndex}`);
            nextEl.classList.remove('idle');
            nextEl.classList.add('next');
        }
    } else {
        // MISS - Brutal Reset
        failSound.currentTime = 0;
        failSound.play();
        currentZoneIndex = 0;
        
        // Reset visually
        for (let i = 0; i < calibZones.length; i++) {
            const el = document.getElementById(`zone-${i}`);
            el.classList.remove('next', 'done');
            el.classList.add(i === 0 ? 'next' : 'idle');
        }
    }
}


// --- End of Night Win Condition ---
function checkWinCondition() {
    if (ventsCount >= MAX_VENTS && calibrateCount >= MAX_CALIBRATE) {
        triggerWin();
    }
}

// --- Confetti & Win Sequence ---
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
        window.completeNight(4); 
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
