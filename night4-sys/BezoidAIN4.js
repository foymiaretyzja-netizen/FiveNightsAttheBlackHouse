// --- night4-sys/BezoidAIN4.js ---

window.aiPositions = window.aiPositions || {};

// Movement and State
let bezoidState = 0; // 0: Storage, 1: Conference Room, 2: At Door
let bezoidInterval = null;
const bezoidSpeed = 8500; // Moves every 8.5 seconds silently

// Sabotage Mechanic
const compromiseSound = new Audio('../Sounds/freesound_community-electricity-101990.mp3');
window.systemCompromised = false; // Global flag to lock UI

function moveBezoid() {
    if (typeof window.isBlackout !== 'undefined' && window.isBlackout) return;

    if (bezoidState === 0) {
        // Move from Storage to Conference Room
        changeBezoidRoom('Conference Room');
        bezoidState = 1;
        console.log("[Bezoid AI] Silently moved to Conference Room.");
    } 
    else if (bezoidState === 1) {
        // Move from Conference Room to the Door (Hidden from cameras)
        changeBezoidRoom('Hidden'); 
        bezoidState = 2;
        console.log("[Bezoid AI] Waiting silently at the door...");
    } 
    else if (bezoidState === 2) {
        // Attack Logic at the Door
        handleBezoidAttack();
    }
}

function changeBezoidRoom(newRoom) {
    let oldRoom = window.aiPositions.bezoid;
    window.aiPositions.bezoid = newRoom;
    
    // Bezoid is sneaky, so we ONLY trigger the long flicker to give the player a hint!
    // No loud movement noises for him.
    if (typeof window.triggerLongFlicker === 'function' && oldRoom !== 'Hidden') {
        window.triggerLongFlicker(oldRoom, newRoom);
    } else if (typeof window.refreshCameraUI === 'function') {
        window.refreshCameraUI();
    }
}

function handleBezoidAttack() {
    // ** Ensure 'window.isDoorClosed' matches your actual door variable! **
    if (window.isDoorClosed) {
        // Door is closed! He is blocked.
        console.log("[Bezoid AI] Blocked by the door! Resetting to Storage.");
        bezoidState = 0;
        changeBezoidRoom('Storage');
    } else {
        // Door is open! He gets in.
        console.log("[Bezoid AI] Got inside! Sabotaging systems...");
        triggerCompromise();
        
        // Reset him back to Storage so he can try again later
        bezoidState = 0;
        changeBezoidRoom('Storage');
    }
}

function triggerCompromise() {
    // Prevent overlapping sabotages
    if (window.systemCompromised) return;
    window.systemCompromised = true;

    // Force close cameras if they are open
    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    // Play the electricity short-circuit sound
    compromiseSound.currentTime = 0;
    compromiseSound.play().catch(e => console.log("Audio block", e));

    // Create the visual "COMPROMISED" warning
    const glitchScreen = document.createElement('div');
    glitchScreen.id = 'bezoid-glitch-screen';
    glitchScreen.style.position = 'fixed';
    glitchScreen.style.top = '20%';
    glitchScreen.style.left = '50%';
    glitchScreen.style.transform = 'translateX(-50%)';
    glitchScreen.style.color = 'red';
    glitchScreen.style.fontSize = '4rem';
    glitchScreen.style.fontFamily = "'Courier New', monospace";
    glitchScreen.style.fontWeight = 'bold';
    glitchScreen.style.textShadow = '2px 2px 0px #000, -2px -2px 0px #000';
    glitchScreen.style.zIndex = '9999';
    glitchScreen.style.pointerEvents = 'none'; // Lets you click through it to use doors/lights
    glitchScreen.style.animation = 'flicker 0.2s infinite';
    glitchScreen.innerHTML = "SYSTEM COMPROMISED<br><span style='font-size:2rem; color:yellow;'>CAMERAS & TASKS OFFLINE</span>";
    document.body.appendChild(glitchScreen);

    // Add CSS for the glitch text if it doesn't exist
    if (!document.getElementById('glitch-style')) {
        const style = document.createElement('style');
        style.id = 'glitch-style';
        style.innerHTML = `
            @keyframes flicker {
                0% { opacity: 1; }
                50% { opacity: 0.3; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Systems remain offline for 12 seconds
    setTimeout(() => {
        window.systemCompromised = false;
        if (document.getElementById('bezoid-glitch-screen')) {
            document.getElementById('bezoid-glitch-screen').remove();
        }
        console.log("[Bezoid AI] Systems restored.");
    }, 12000);
}

// --- Lifecycle Functions ---
window.startBezoidAI = function() {
    if (bezoidInterval) clearInterval(bezoidInterval);
    
    window.aiPositions.bezoid = 'Storage';
    bezoidState = 0;
    window.systemCompromised = false;
    
    bezoidInterval = setInterval(moveBezoid, bezoidSpeed);
    console.log("[Bezoid AI] Online. Starting in Storage.");
};

window.stopBezoidAI = function() {
    if (bezoidInterval) clearInterval(bezoidInterval);
    console.log("[Bezoid AI] Deactivated.");
};
