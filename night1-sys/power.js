// --- night1-sys/power.js ---

const powerDisplay = document.getElementById('power-display');
const panoramaBg = document.getElementById('office-panorama');
const btnLights = document.getElementById('btn-lights');

let power = 100.0;
let isBlackout = false;
let lightsOn = true;

// 100% / 300 seconds (5 mins) = ~0.33 drain per second
const BASE_DRAIN = 0.33; 

// Toggle Lights Button Logic
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
    }

    // Update the UI in the top left corner
    powerDisplay.innerText = `Power: ${Math.floor(power)}%`;

}, 1000); // Runs exactly once per second

// Blackout State
function triggerBlackout() {
    isBlackout = true;
    lightsOn = false;
    
    // Switch to dark room
    panoramaBg.style.backgroundImage = "url('../Scenes/Presidential-room-blackout.jpg')";
    
    // Force everything off to mimic a total system failure
    powerDisplay.innerText = "Power: 0%";
    powerDisplay.style.color = "#ff0000";

    // Open doors if they were closed
    window.leftDoorClosed = false;
    window.rightDoorClosed = false;
    document.getElementById('left-shadow').style.opacity = 0;
    document.getElementById('right-shadow').style.opacity = 0;

    // Kick the player out of the cameras if they are using them
    if (window.isCameraOpen) {
        window.toggleCamera();
    }

    console.log("SYSTEM FAILURE: OUT OF POWER");
}
