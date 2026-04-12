// --- night3-sys/ZuckenBurgerN3.js ---

// --- Audio Setup ---
const zuckArrivalSound = new Audio('../Sounds/dragon-studio-door-opening-454242.mp3');
const zuckJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');

// --- Sprite Setup (FIXED NAMING COLLISION) ---
let zuckOfficeSprite = document.getElementById('zuck-sprite-office');

// Dynamically create the sprite if it doesn't exist in the HTML yet
if (!zuckOfficeSprite) {
    zuckOfficeSprite = document.createElement('img');
    zuckOfficeSprite.id = 'zuck-sprite-office';
    zuckOfficeSprite.src = '../night3-sys/sprites/ZuckenBurger.png';
    zuckOfficeSprite.style.display = 'none';
    zuckOfficeSprite.style.position = 'absolute';
    zuckOfficeSprite.style.left = '50%';
    zuckOfficeSprite.style.top = '50%';
    zuckOfficeSprite.style.transform = 'translate(-50%, -50%)';
    zuckOfficeSprite.style.zIndex = '100'; 
    zuckOfficeSprite.style.pointerEvents = 'none';
    document.body.appendChild(zuckOfficeSprite);
}

// --- AI State Variables ---
let zuckTimer = null;
let zuckActive = false;

window.aiPositions = window.aiPositions || {};
window.aiPositions.zuckenburger = 'Janitor Room';

// Starts the AI after the initial delay
function initZuckenBurger() {
    console.log("[ZuckenBurger AI] Initialized. Waiting 3 seconds...");
    setTimeout(() => {
        zuckActive = true;
        console.log("[ZuckenBurger AI] ZuckenBurger is now active.");
        scheduleZuckAttack();
    }, 3000); // Set to 3 seconds for testing!
}

// Randomizes the next attack between 15s and 26s
function scheduleZuckAttack() {
    if (window.isBlackout) return;

    const nextAttackTime = Math.floor(Math.random() * 11000) + 15000; 
    console.log(`[ZuckenBurger AI] Next attack in ${nextAttackTime / 1000} seconds.`);

    zuckTimer = setTimeout(() => {
        enterOffice();
    }, nextAttackTime);
}

// ZuckenBurger bypasses doors and enters the office
function enterOffice() {
    if (window.isBlackout) return;

    console.log("[ZuckenBurger AI] ZuckenBurger has entered the office! TURN OFF THE LIGHTS!");
    window.aiPositions.zuckenburger = 'Office';
    
    // Update Cameras if looking at Janitor Room
    if (typeof window.refreshCameraUI === 'function') window.refreshCameraUI();
    
    // Play an eerie arrival sound
    zuckArrivalSound.currentTime = 0;
    zuckArrivalSound.play().catch(e => console.warn("[Audio] Zuck arrival blocked:", e));

    // Force the camera down if the player is looking at the monitor
    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    // Display the office sprite
    zuckOfficeSprite.style.display = 'block';

    // Player has exactly 6 seconds to react
    zuckTimer = setTimeout(() => {
        checkZuckSurvival();
    }, 6000);
}

// Evaluate if the player turned off the lights in time
function checkZuckSurvival() {
    // If the power went out, the lights are technically off, which saves the player
    if (window.isOfficeDark || window.isBlackout) {
        console.log("[ZuckenBurger AI] The room is dark. ZuckenBurger leaves.");
        leaveOffice();
    } else {
        console.log("[ZuckenBurger AI] The lights were on. Jumpscare triggered!");
        triggerZuckJumpscare();
    }
}

// ZuckenBurger resets to the Janitor Room
function leaveOffice() {
    zuckOfficeSprite.style.display = 'none';
    window.aiPositions.zuckenburger = 'Janitor Room';
    
    // Ensure cameras update if open
    if (typeof window.refreshCameraUI === 'function') {
        window.refreshCameraUI();
    }
    
    // Start the attack cycle over
    scheduleZuckAttack();
}

// The game over sequence
function triggerZuckJumpscare() {
    // Hide UI elements to focus on the scare
    const mon = document.getElementById('camera-monitor');
    if (mon) mon.style.display = 'none';
    const leftPanel = document.getElementById('left-panel');
    if (leftPanel) leftPanel.style.display = 'none';
    const rightPanel = document.getElementById('right-panel');
    if (rightPanel) rightPanel.style.display = 'none';

    // Play Jumpscare Audio
    zuckJumpscareSound.currentTime = 0;
    zuckJumpscareSound.play().catch(e => console.warn("[Audio] Zuck jumpscare blocked:", e));

    // Scale the sprite from the bottom center so it engulfs the screen
    zuckOfficeSprite.style.transition = 'transform 0.15s ease-in, filter 0.15s ease-in';
    zuckOfficeSprite.style.transformOrigin = 'bottom center';
    zuckOfficeSprite.style.transform = 'scale(8)';
    zuckOfficeSprite.style.filter = 'brightness(1.5) contrast(1.2)';

    setTimeout(() => {
        alert("ZUCKENBURGER HAS HARVESTED YOUR DATA.");
        location.reload();
    }, 1500);
}

// Kick off the AI!
initZuckenBurger();
