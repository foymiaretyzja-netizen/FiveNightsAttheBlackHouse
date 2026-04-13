// --- night4-sys/powerN4.js ---

const powerDisplay = document.getElementById('power-display');
const panoramaBg = document.getElementById('office-panorama');
const btnLights = document.getElementById('btn-lights');

// UI elements for the motion sensors
const btnSensorLeft = document.getElementById('btn-sensor-left');
const btnSensorRight = document.getElementById('btn-sensor-right');
const sensorDisplay = document.getElementById('sensor-display'); 

// NEW UI Elements for Night 4
const btnShock = document.getElementById('btn-shock');
const flashOverlay = document.getElementById('flash-overlay');

// --- Audio Setup ---
const lightSwitchSound = new Audio('../Sounds/soundreality-switch-150130.mp3');
const lightHumSound = new Audio('../Sounds/freesound_community-fluoresent_light_hum_and_refrigerator-48831.mp3');
lightHumSound.loop = true; 
lightHumSound.volume = 0.5; 

const warningBeepSound = new Audio('../Sounds/freesound_community-beep-beep-43875.mp3');
const clearBeepSound = new Audio('../Sounds/musheran-beep-313342.mp3');
const powerDownSound = new Audio('../Sounds/freesound_community-machine-powering-down-84722.mp3');

// Reusing boom for the shock impact
const shockBoomSound = new Audio('../Sounds/dragon-studio-cinematic-boom-335489.mp3'); 

let power = 100.0;
let isBlackout = false;
let lightsOn = true;
let hasInteracted = false; 
let isFlickering = false; // Prevents overlapping shock sequences

// Global States for AI Hooks
window.isOfficeDark = false; 
window.powerShockActive = false; // Cena's script will listen for this!

// Power Drain Stats
const BASE_DRAIN = 0.07; 
const SENSOR_POWER_COST = 1.0; 
const SHOCK_POWER_COST = 5.0; // Adjusted from 15.0 to 5.0 for better late-night balance

// Global click listener to bypass Autoplay restrictions
document.addEventListener('click', () => {
    if (!hasInteracted) {
        hasInteracted = true;
        if (lightsOn && !isBlackout) {
            lightHumSound.play().catch(e => console.warn("[Audio] Hum blocked:", e));
        }
    }
});

// Toggle Lights Button Logic
if (btnLights) {
    btnLights.addEventListener('click', () => {
        if (isBlackout || isFlickering) return;

        lightsOn = !lightsOn;
        window.isOfficeDark = !lightsOn;
        
        lightSwitchSound.currentTime = 0;
        lightSwitchSound.play().catch(e => console.warn("[Audio] Switch sound error:", e));

        if (lightsOn) {
            panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room.jpg')";
            btnLights.innerText = "Turn Off Lights";
            btnLights.style.borderColor = "#ffbb00";
            btnLights.style.color = "#ffbb00";
            
            lightHumSound.play().catch(e => console.warn("[Audio] Hum resume error:", e));
        } else {
            panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
            btnLights.innerText = "Turn On Lights";
            btnLights.style.borderColor = "#555";
            btnLights.style.color = "#aaa";
            
            lightHumSound.pause();
        }
    });
}

// Night 4 Dynamic Motion Sensor Logic
function scanDoor(side) {
    if (isBlackout || isFlickering) return;

    power -= SENSOR_POWER_COST;
    updatePowerUI();

    if (power <= 0) {
        triggerBlackout();
        return;
    }

    let isEntityPresent = false;
    const targetDoor = side === 'left' ? 'Presidential Left Door' : 'Presidential Right Door';

    // Dynamically check ALL entities in the N4 roster
    if (window.aiPositions) {
        for (const aiName in window.aiPositions) {
            if (window.aiPositions[aiName] === targetDoor) {
                isEntityPresent = true;
                break;
            }
        }
    }

    const feedbackMsg = isEntityPresent ? `WARNING: MOTION AT ${side.toUpperCase()} DOOR` : `CLEAR: NO MOTION`;
    console.log(`[Motion Sensor] ${feedbackMsg}`);
    
    if (isEntityPresent) {
        warningBeepSound.currentTime = 0;
        warningBeepSound.play().catch((e) => console.warn("[Audio] Warning beep error:", e));
    } else {
        clearBeepSound.currentTime = 0;
        clearBeepSound.play().catch((e) => console.warn("[Audio] Clear beep error:", e));
    }
    
    if (sensorDisplay) {
        sensorDisplay.innerText = feedbackMsg;
        sensorDisplay.style.color = isEntityPresent ? "#ff0000" : "#00ff00";
        
        setTimeout(() => { 
            if (!isBlackout) {
                sensorDisplay.innerText = "Scanner Ready"; 
                sensorDisplay.style.color = "#fff";
            }
        }, 2000);
    }
}

if (btnSensorLeft) btnSensorLeft.addEventListener('click', () => scanDoor('left'));
if (btnSensorRight) btnSensorRight.addEventListener('click', () => scanDoor('right'));

// --- NEW: Night 4 Power Shock Logic ---
if (btnShock) {
    btnShock.addEventListener('click', () => {
        if (isBlackout || isFlickering) return;

        // Drain the massive power chunk
        power -= SHOCK_POWER_COST;
        updatePowerUI();

        if (power <= 0) {
            triggerBlackout();
            return;
        }

        isFlickering = true;
        window.powerShockActive = true; // Alerts the AI scripts
        console.log("[SYSTEM] POWER SHOCK INITIATED!");

        // 1. Play Boom & Flash White
        shockBoomSound.currentTime = 0;
        shockBoomSound.volume = 1.0;
        shockBoomSound.play().catch(e => console.warn(e));
        
        flashOverlay.style.transition = 'none';
        flashOverlay.style.opacity = '1';
        lightHumSound.pause();

        // 2. Fade out white flash quickly and start flickering
        setTimeout(() => {
            flashOverlay.style.transition = 'opacity 0.5s ease-out';
            flashOverlay.style.opacity = '0';

            // 3. Flicker sequence
            let flickers = 0;
            const maxFlickers = 8;
            
            const flickerInterval = setInterval(() => {
                flickers++;
                
                // Rapidly toggle the background
                if (flickers % 2 !== 0) {
                    panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
                } else {
                    panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room.jpg')";
                    lightSwitchSound.currentTime = 0;
                    lightSwitchSound.play().catch(e=>e);
                }

                // End flicker sequence
                if (flickers >= maxFlickers) {
                    clearInterval(flickerInterval);
                    isFlickering = false;
                    window.powerShockActive = false; // Reset hook
                    
                    // Restore to current light switch state
                    if (lightsOn) {
                        panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room.jpg')";
                        lightHumSound.play().catch(e=>e);
                    } else {
                        panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
                    }
                }
            }, 150); // 150ms per rapid flash
            
        }, 100); // Hold white flash for 100ms
    });
}

function updatePowerUI() {
    if (powerDisplay) {
        powerDisplay.innerText = `Power: ${Math.max(0, Math.floor(power))}%`;
    }
}

// Main Power Drain Loop
setInterval(() => {
    if (isBlackout) return;

    let currentDrain = BASE_DRAIN;

    if (!lightsOn) {
        currentDrain *= 0.5; // Saving power by turning off lights
    }

    if (window.leftDoorClosed) currentDrain += 0.15;
    if (window.rightDoorClosed) currentDrain += 0.15;
    if (window.isCameraOpen) currentDrain += 0.10;

    power -= currentDrain;

    if (power <= 0) {
        power = 0;
        triggerBlackout();
    } else {
        updatePowerUI();
    }

}, 1000);

// Blackout State
function triggerBlackout() {
    if (isBlackout) return; 
    isBlackout = true;
    lightsOn = false;
    window.isOfficeDark = true;
    
    lightHumSound.pause();
    
    powerDownSound.currentTime = 0;
    powerDownSound.play().catch(e => console.warn("[Audio] Power down sound error:", e));
    
    if (panoramaBg) panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
    
    if (powerDisplay) {
        powerDisplay.innerText = "Power: 0%";
        powerDisplay.style.color = "#ff0000";
    }

    if (sensorDisplay) {
        sensorDisplay.innerText = "SYSTEM OFFLINE";
        sensorDisplay.style.color = "#ff0000";
    }

    window.leftDoorClosed = false;
    window.rightDoorClosed = false;
    
    const leftShadow = document.getElementById('left-shadow');
    const rightShadow = document.getElementById('right-shadow');
    if (leftShadow) leftShadow.style.opacity = 0;
    if (rightShadow) rightShadow.style.opacity = 0;

    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    console.log("SYSTEM FAILURE: OUT OF POWER");
}
