// --- night4-sys/ZuckenBurgerN4.js ---

// --- Audio Setup ---
const zuckArrivalSound = new Audio('../Sounds/dragon-studio-door-opening-454242.mp3');
const zuckJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');

// --- Sprite Setup ---
let zuckOfficeSprite = document.getElementById('zuck-sprite-office');

if (!zuckOfficeSprite) {
    zuckOfficeSprite = document.createElement('img');
    zuckOfficeSprite.id = 'zuck-sprite-office';
    // Ensure this path points to your actual sprite location!
    zuckOfficeSprite.src = '../night4-sys/sprites/ZuckenBurger.png'; 
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
let zuckLightSyncInterval = null;
let darknessCounter = 0; // NEW: Tracks how long the player has been hiding!

window.aiPositions = window.aiPositions || {};

// 1. Randomizes the next attack between 12s and 20s
function scheduleZuckAttack() {
    if (typeof window.isBlackout !== 'undefined' && window.isBlackout) return;

    const nextAttackTime = Math.floor(Math.random() * 8000) + 12000; 
    console.log(`[ZuckenBurger AI] Next attack in ${nextAttackTime / 1000} seconds.`);

    zuckTimer = setTimeout(() => {
        enterOffice();
    }, nextAttackTime);
}

// 2. ZuckenBurger bypasses doors and enters the office
function enterOffice() {
    if (typeof window.isBlackout !== 'undefined' && window.isBlackout) return;

    console.log("[ZuckenBurger AI] ZuckenBurger has entered the office! TURN OFF THE LIGHTS!");
    zuckActive = true;
    darknessCounter = 0; // Reset the darkness tracking
    window.aiPositions.zuck = 'Office'; 
    
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

    // Player has exactly 5.5 seconds to react
    zuckTimer = setTimeout(() => {
        // If this timer goes off, the player didn't hide in time!
        console.log("[ZuckenBurger AI] The lights were on too long. Jumpscare triggered!");
        triggerZuckJumpscare();
    }, 5500);
}

// 3. ZuckenBurger resets to the Janitor Room
function leaveOffice() {
    zuckActive = false;
    zuckOfficeSprite.style.display = 'none';
    window.aiPositions.zuck = 'Janitor Room';
    
    // Ensure cameras update if open
    if (typeof window.refreshCameraUI === 'function') {
        window.refreshCameraUI();
    }
    
    // Start the attack cycle over
    scheduleZuckAttack();
}

// 4. The game over sequence
function triggerZuckJumpscare() {
    window.stopZuckAI();

    // Hide UI elements to focus on the scare
    const mon = document.getElementById('camera-monitor');
    if (mon) mon.style.display = 'none';
    const leftPanel = document.getElementById('left-panel');
    if (leftPanel) leftPanel.style.display = 'none';
    const rightPanel = document.getElementById('right-panel');
    if (rightPanel) rightPanel.style.display = 'none';

    // Force his visibility back to normal
    zuckOfficeSprite.style.opacity = '1';
    zuckOfficeSprite.style.filter = 'brightness(1.5) contrast(1.2)';

    // Play Jumpscare Audio
    zuckJumpscareSound.currentTime = 0;
    zuckJumpscareSound.play().catch(e => console.warn("[Audio] Zuck jumpscare blocked:", e));

    // Scale the sprite from the bottom center so it engulfs the screen
    zuckOfficeSprite.style.transition = 'transform 0.15s ease-in, filter 0.15s ease-in';
    zuckOfficeSprite.style.transformOrigin = 'bottom center';
    zuckOfficeSprite.style.transform = 'scale(8)';

    setTimeout(() => {
        if (typeof window.triggerJumpscare === 'function') {
            window.triggerJumpscare('zuck');
        } else {
            alert("ZUCKENBURGER HAS HARVESTED YOUR DATA.");
            window.location.href = '../title.html';
        }
    }, 1500);
}

// --- Lifecycle Functions ---

window.startZuckAI = function() {
    if (zuckTimer) clearTimeout(zuckTimer);
    if (zuckLightSyncInterval) clearInterval(zuckLightSyncInterval);

    window.aiPositions.zuck = 'Janitor Room';
    zuckActive = false;
    darknessCounter = 0;

    console.log("[ZuckenBurger AI] Online. First attack in 30 seconds...");
    
    // Initial Grace Period
    zuckTimer = setTimeout(() => {
        enterOffice(); 
    }, 30000); 

    // REAL-TIME LIGHTING SYNC & SURVIVAL CHECK
    zuckLightSyncInterval = setInterval(() => {
        if (zuckActive && zuckOfficeSprite.style.display === 'block') {
            
            // Prevent him from evaluating logic if he is currently jumping at you
            if (zuckOfficeSprite.style.transform.includes('scale(8)')) return;

            if (window.isLightOff || (typeof window.isBlackout !== 'undefined' && window.isBlackout)) {
                // Dim sprite to match darkness
                zuckOfficeSprite.style.opacity = '0.2';
                zuckOfficeSprite.style.filter = 'brightness(0)';
                zuckOfficeSprite.style.transition = 'opacity 0.2s ease, filter 0.2s ease';
                
                // --- NEW: Actively track how long they are hiding ---
                darknessCounter += 100; // Interval runs every 100ms
                if (darknessCounter >= 1500) { // 1.5 seconds of darkness
                    console.log("[ZuckenBurger AI] The room stayed dark. ZuckenBurger leaves early!");
                    clearTimeout(zuckTimer); // Cancel the 5.5s jumpscare timer
                    leaveOffice();
                }
            } else {
                // Lights are ON! Reset the hiding counter
                darknessCounter = 0;
                zuckOfficeSprite.style.opacity = '1';
                zuckOfficeSprite.style.filter = 'brightness(1)';
            }
        }
    }, 100);
};

window.stopZuckAI = function() {
    if (zuckTimer) clearTimeout(zuckTimer);
    if (zuckLightSyncInterval) clearInterval(zuckLightSyncInterval);
    zuckActive = false;
    console.log("[ZuckenBurger AI] Deactivated.");
};
