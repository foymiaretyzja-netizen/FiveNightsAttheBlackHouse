// --- night2-sys/CharrlieAIN2.js ---

// --- Audio Setup ---
const charrlieCreakSound = new Audio('../Sounds/dragon-studio-heavy-creaking-515252 (1).mp3');
const charrlieRunSound = new Audio('../Sounds/freesound_community-foley_footsteps_metal_001-77032.mp3');

// --- AI State Variables ---
let charrlieStage = 1; // Stages 1 to 4 (guestroom-1.jpg to guestroom-4.jpg)
let charrlieState = 'waiting'; // 'waiting', 'progressing', 'dashing', 'bounced'
let charrlieTimer;
let charrlieTargetDoor = null;

// Initialize global position so the motion scanners in powerN2.js can see him
window.aiPositions = window.aiPositions || {};
window.aiPositions.charrlie = 'Guest Room';

// Starts the AI after the initial 45-second delay
function initCharrlie() {
    console.log("[Charrlie AI] Initialized. Waiting 45 seconds...");
    charrlieTimer = setTimeout(() => {
        charrlieState = 'progressing';
        scheduleNextCharrlieMove();
    }, 45000);
}

// Randomizes the next stage movement between 10 and 20 seconds
function scheduleNextCharrlieMove() {
    if (window.isBlackout) return; // Stop if power is out

    const nextMoveTime = Math.floor(Math.random() * 10000) + 10000; // 10s - 20s
    
    charrlieTimer = setTimeout(() => {
        advanceCharrlieStage();
    }, nextMoveTime);
}

// Moves Charrlie to the next visual stage
function advanceCharrlieStage() {
    if (window.isBlackout) return;

    charrlieStage++;
    console.log(`[Charrlie AI] Advanced to Stage ${charrlieStage}`);
    
    // Update the camera feed immediately if the player happens to be watching him
    updateGuestRoomCamera();

    if (charrlieStage === 3) {
        // Play the heavy creaking sound
        charrlieCreakSound.currentTime = 0;
        charrlieCreakSound.play().catch(e => console.warn("[Audio] Charrlie creak blocked:", e));
        scheduleNextCharrlieMove();
    } else if (charrlieStage >= 4) {
        // Stage 4: He breaks into a sprint!
        startCharrlieDash();
    } else {
        scheduleNextCharrlieMove();
    }
}

// Charrlie runs down the hall
function startCharrlieDash() {
    charrlieState = 'dashing';
    
    // Randomly pick left or right door
    charrlieTargetDoor = Math.random() < 0.5 ? 'left' : 'right';
    
    // Update his global position so the player can ping him on the motion scanner!
    window.aiPositions.charrlie = charrlieTargetDoor === 'left' ? 'Presidential Left Door' : 'Presidential Right Door';
    console.log(`[Charrlie AI] DASHING to ${charrlieTargetDoor.toUpperCase()} door!`);
    
    // Play the metal footsteps running sound
    charrlieRunSound.currentTime = 0;
    charrlieRunSound.play().catch(e => console.warn("[Audio] Charrlie run blocked:", e));

    // Turn on the global camera static to induce panic
    applyDashStatic(true);

    // Player has exactly 7 seconds to react
    charrlieTimer = setTimeout(() => {
        checkCharrlieAttack();
    }, 7000);
}

// Evaluate if the player survived the dash
function checkCharrlieAttack() {
    if (window.isBlackout) return;

    // Check if the door he ran to is currently closed
    const isDoorBlocked = (charrlieTargetDoor === 'left' && window.leftDoorClosed) || 
                          (charrlieTargetDoor === 'right' && window.rightDoorClosed);

    if (!isDoorBlocked) {
        // Door was open. Player dies.
        triggerCharrlieJumpscare();
    } else {
        // Door was closed!
        if (charrlieState === 'dashing') {
            // THE BOUNCE MECHANIC: He runs to the OTHER door!
            charrlieState = 'bounced';
            charrlieTargetDoor = charrlieTargetDoor === 'left' ? 'right' : 'left';
            
            // Update global position for scanners again
            window.aiPositions.charrlie = charrlieTargetDoor === 'left' ? 'Presidential Left Door' : 'Presidential Right Door';
            console.log(`[Charrlie AI] BLOCKED! Bouncing to the ${charrlieTargetDoor.toUpperCase()} door!`);
            
            // Play footsteps again to warn the player he is still moving
            charrlieRunSound.currentTime = 0;
            charrlieRunSound.play().catch(() => {});
            
            // Give them another 7 seconds for the new door
            charrlieTimer = setTimeout(() => {
                checkCharrlieAttack();
            }, 7000);
            
        } else if (charrlieState === 'bounced') {
            // He tried both doors and was blocked both times. He gives up.
            resetCharrlie();
        }
    }
}

// Charrlie returns to his starting position
function resetCharrlie() {
    console.log("[Charrlie AI] Attack failed. Resetting to Guest Room.");
    charrlieStage = 1;
    charrlieState = 'progressing';
    window.aiPositions.charrlie = 'Guest Room';
    
    // Turn off camera static and update the room image
    applyDashStatic(false);
    updateGuestRoomCamera();
    
    // Start the cycle over
    scheduleNextCharrlieMove();
}

// The game over sequence
function triggerCharrlieJumpscare() {
    console.log("[Charrlie AI] JUMPSCARE!");
    applyDashStatic(false);
    
    // Force the monitor down if they are hiding in the cameras
    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    // Grab his 2D sprite element from the office HTML
    const jumpscareSprite = document.getElementById('charrlie-sprite-office');
    if (jumpscareSprite) {
        jumpscareSprite.style.display = 'block';
        
        // Quick CSS animation to make him pop out
        jumpscareSprite.style.transition = 'transform 0.1s ease-in';
        jumpscareSprite.style.transform = 'scale(2.5) translateY(-10%)';
        
        // Reload the game after 2 seconds
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

// --- Helper Functions ---

// Controls the static overlay across all cameras while he runs
function applyDashStatic(isActive) {
    const staticFlash = document.getElementById('static-flash');
    if (staticFlash) {
        if (isActive) {
            staticFlash.style.opacity = '0.4';
            staticFlash.style.background = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMCKcCBXY/C6MAAAAASUVORK5CYII=') repeat";
        } else {
            staticFlash.style.opacity = '0';
        }
    }
}

// Dynamically changes the Guest Room camera image based on his current stage
function updateGuestRoomCamera() {
    // Only swap the image if the player is currently viewing the Guest Room
    if (window.currentCamera === 'Guest Room') {
        const feed = document.getElementById('camera-feed');
        if (feed) {
            // Keep the image number between 1 and 4
            const safeStage = Math.min(Math.max(charrlieStage, 1), 4);
            feed.style.backgroundImage = `url('../ScenesN2/guestroom-${safeStage}.jpg')`;
        }
    }
}

// Kick off the AI!
initCharrlie();
