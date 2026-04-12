// --- night2-sys/powerN2.js ---

const powerDisplay = document.getElementById('power-display');
const panoramaBg = document.getElementById('office-panorama');
const btnLights = document.getElementById('btn-lights');

// NEW: UI elements for the motion sensors (ensure these match your HTML IDs)
const btnSensorLeft = document.getElementById('btn-sensor-left');
const btnSensorRight = document.getElementById('btn-sensor-right');
const sensorDisplay = document.getElementById('sensor-display'); 

let power = 100.0;
let isBlackout = false;
let lightsOn = true;

// 100% / 300 seconds (5 mins) = ~0.33 drain per second
const BASE_DRAIN = 0.33; 

// NEW: Flat power penalty for pinging the motion scanner
const SENSOR_POWER_COST = 1.5; 

// Toggle Lights Button Logic
if (btnLights) {
    btnLights.addEventListener('click', () => {
        if (isBlackout) return; // Can't toggle lights if the power is already dead

        lightsOn = !lightsOn;

        if (lightsOn) {
            panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room.jpg')";
            btnLights.innerText = "Turn Off Lights";
            btnLights.style.borderColor = "#ffbb00";
            btnLights.style.color = "#ffbb00";
        } else {
            panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
            btnLights.innerText = "Turn On Lights";
            btnLights.style.borderColor = "#555";
            btnLights.style.color = "#aaa";
        }
    });
}

// NEW: Motion Sensor Logic
function scanDoor(side) {
    if (isBlackout) return;

    // Instantly deduct power for using the scanner
    power -= SENSOR_POWER_COST;
    updatePowerUI();

    if (power <= 0) {
        triggerBlackout();
        return;
    }

    let isEntityPresent = false;

    // Check global AI positions from your AI scripts
    if (window.aiPositions) {
        if (side === 'left' && window.aiPositions.charrlie === 'Presidential Left Door') {
            isEntityPresent = true;
        } else if (side === 'right' && window.aiPositions.elong === 'Presidential Right Door') {
            isEntityPresent = true;
        }
    }

    // Update feedback for the player
    const feedbackMsg = isEntityPresent ? `WARNING: MOTION AT ${side.toUpperCase()} DOOR` : `CLEAR: NO MOTION`;
    console.log(`[Motion Sensor] ${feedbackMsg}`);
    
    if (sensorDisplay) {
        sensorDisplay.innerText = feedbackMsg;
        sensorDisplay.style.color = isEntityPresent ? "#ff0000" : "#00ff00";
        
        // Reset the display after 2 seconds
        setTimeout(() => { 
            if (!isBlackout) {
                sensorDisplay.innerText = "Scanner Ready"; 
                sensorDisplay.style.color = "#fff";
            }
        }, 2000);
    }
}

// Hook up motion sensor buttons
if (btnSensorLeft) btnSensorLeft.addEventListener('click', () => scanDoor('left'));
if (btnSensorRight) btnSensorRight.addEventListener('click', () => scanDoor('right'));

// Helper function to keep UI updates clean
function updatePowerUI() {
    if (powerDisplay) {
        powerDisplay.innerText = `Power: ${Math.max(0, Math.floor(power))}%`;
    }
}

// Main Power Drain Loop
setInterval(() => {
    if (isBlackout) return;

    let currentDrain = BASE_DRAIN;

    // Turning off the lights stops draining so much power (-50% base drain)
    if (!lightsOn) {
        currentDrain *= 0.5; 
    }

    // Heavy Power Drainers
    if (window.leftDoorClosed) currentDrain += 0.15;
    if (window.rightDoorClosed) currentDrain += 0.15;
    if (window.isCameraOpen) currentDrain += 0.10;

    power -= currentDrain;

    // Check for game over
    if (power <= 0) {
        power = 0;
        triggerBlackout();
    } else {
        updatePowerUI();
    }

}, 1000); // Runs exactly once per second

// Blackout State
function triggerBlackout() {
    if (isBlackout) return; // Prevent multiple triggers
    isBlackout = true;
    lightsOn = false;
    
    // Switch to dark room
    if (panoramaBg) panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
    
    // Force everything off to mimic a total system failure
    if (powerDisplay) {
        powerDisplay.innerText = "Power: 0%";
        powerDisplay.style.color = "#ff0000";
    }

    if (sensorDisplay) {
        sensorDisplay.innerText = "SYSTEM OFFLINE";
        sensorDisplay.style.color = "#ff0000";
    }

    // Open doors if they were closed
    window.leftDoorClosed = false;
    window.rightDoorClosed = false;
    
    const leftShadow = document.getElementById('left-shadow');
    const rightShadow = document.getElementById('right-shadow');
    if (leftShadow) leftShadow.style.opacity = 0;
    if (rightShadow) rightShadow.style.opacity = 0;

    // Kick the player out of the cameras if they are using them
    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    console.log("SYSTEM FAILURE: OUT OF POWER");
}
