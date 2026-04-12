// --- night3-sys/ZuckenBurgerN3.js ---

// --- Audio Setup (Using placeholders you can swap later) ---
const zuckArrivalSound = new Audio('../Sounds/dragon-studio-door-opening-454242.mp3');
const zuckJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');

// --- Sprite Setup ---
let zuckSprite = document.getElementById('zuck-sprite-office');

// Dynamically create the sprite if it doesn't exist in the HTML yet
if (!zuckSprite) {
    zuckSprite = document.createElement('img');
    zuckSprite.id = 'zuck-sprite-office';
    zuckSprite.src = '../night3-sys/sprites/ZuckenBurger.png';
    zuckSprite.style.display = 'none';
    zuckSprite.style.position = 'absolute';
    zuckSprite.style.left = '50%';
    zuckSprite.style.top = '50%';
    zuckSprite.style.transform = 'translate(-50%, -50%) scale(1.5)';
    zuckSprite.style.zIndex = '100'; // Make sure he renders on top of the office
    zuckSprite.style.pointerEvents = 'none';
    document.body.appendChild(zuckSprite);
}

// --- AI State Variables ---
let zuckTimer = null;
let zuckActive = false;

window.aiPositions = window.aiPositions || {};
window.aiPositions.zuckenburger = 'Janitor Room';

// Starts the AI after the initial 35-second delay
function initZuckenBurger() {
    console.log("[ZuckenBurger AI] Initialized. Waiting 35 seconds...");
    setTimeout(() => {
        zuckActive = true;
        console.log("[ZuckenBurger AI] ZuckenBurger is now active.");
        scheduleZuckAttack();
    }, 35000);
}

// Randomizes the next attack between 15s and 26s
function scheduleZuckAttack() {
    if (window.isBlackout) return;

    const nextAttackTime = Math.floor(Math.random() * 11000) + 15000; // 15s to 26s
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
    
    // Play an eerie arrival sound
    zuckArrivalSound.currentTime = 0;
    zuckArrivalSound.play().catch(e => console.warn("[Audio] Zuck arrival blocked:", e));

    // Force the camera down if the player is looking at the monitor
    if (window.isCameraOpen && typeof window.toggleCamera === 'function') {
        window.toggleCamera();
    }

    // Display the sprite
    zuckSprite.style.display = 'block';

    // Player has exactly 6 seconds to react
    zuckTimer = setTimeout(() => {
        checkZuckSurvival();
    }, 6000);
}

// Evaluate if the player turned off the lights in time
function checkZuckSurvival() {
    // If the power went out, the lights are technically off, which saves the player from Zuck
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
    zuckSprite.style.display = 'none';
    window.aiPositions.zuckenburger = 'Janitor Room';
    
    // Start the attack cycle over
    scheduleZuckAttack();
}

// The game over sequence
function triggerZuckJumpscare() {
    // Hide UI elements to focus on the scare
    const mon = document.getElementById('camera-monitor');
    if (mon) mon.style.display = 'none';

    // Play Jumpscare Audio
    zuckJumpscareSound.currentTime = 0;
    zuckJumpscareSound.play().catch(e => console.warn("[Audio] Zuck jumpscare blocked:", e));

    // Animate the sprite to rush the screen
    zuckSprite.style.transition = 'transform 0.1s ease-in, filter 0.1s ease-in';
    zuckSprite.style.transform = 'translate(-50%, -50%) scale(8)';
    zuckSprite.style.filter = 'brightness(1.5) contrast(1.2)';

    setTimeout(() => {
        alert("ZUCKENBURGER HAS HARVESTED YOUR DATA.");
        location.reload();
    }, 1500);
}

// Kick off the AI!
initZuckenBurger();
