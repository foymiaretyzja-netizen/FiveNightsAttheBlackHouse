// --- night4-sys/LeebronAIN4.js ---

// Ensure the global AI positions object exists
window.aiPositions = window.aiPositions || {};

// Anti-camp parameters
let leebronDarknessTimer = 0;
const leebronIntervalSpeed = 1000; // Checks every 1 second
let leebronInterval = null;

// How many seconds of darkness before he acts?
const darknessStage1 = 8;  // Spawns in Guest Room
const darknessStage2 = 14; // Moves closer (e.g., to the Diner)
const darknessAttack = 18; // Jumpscares you!

function checkLeebron() {
    // If there's a global blackout, Leebron ignores the timer and attacks (optional, adjust to your lore)
    if (typeof window.isBlackout !== 'undefined' && window.isBlackout) return;

    // Check if the player is camping in the dark
    // ** Ensure this matches your actual lights variable! **
    if (window.isLightOff) {
        leebronDarknessTimer++;
        console.log(`[Leebron AI] Darkness level: ${leebronDarknessTimer}`);

        let newRoom = window.aiPositions.leebron;

        if (leebronDarknessTimer === darknessStage1) {
            newRoom = 'Guest Room';
            console.log("[Leebron AI] The darkness gathers... Leebron spawned in the Guest Room.");
        } else if (leebronDarknessTimer === darknessStage2) {
            newRoom = 'Diner'; 
            console.log("[Leebron AI] He is getting closer...");
        } else if (leebronDarknessTimer >= darknessAttack) {
            triggerLeebronJumpscare();
            return;
        }

        // If he changed rooms, trigger the camera updates
        if (newRoom !== window.aiPositions.leebron) {
            let oldRoom = window.aiPositions.leebron;
            window.aiPositions.leebron = newRoom;
            
            // Only trigger the long flicker if he was already visible on the map
            if (oldRoom !== 'Hidden' && typeof window.triggerLongFlicker === 'function') {
                window.triggerLongFlicker(oldRoom, newRoom);
            } else if (typeof window.refreshCameraUI === 'function') {
                window.refreshCameraUI();
            }
        }

    } else {
        // LIGHTS ARE ON - Reset his progress and make him vanish
        if (leebronDarknessTimer > 0) {
            leebronDarknessTimer = 0;
            
            if (window.aiPositions.leebron !== 'Hidden') {
                console.log("[Leebron AI] The light burned him away! Leebron retreated.");
                let oldRoom = window.aiPositions.leebron;
                window.aiPositions.leebron = 'Hidden';
                
                if (typeof window.triggerLongFlicker === 'function') {
                    window.triggerLongFlicker(oldRoom, 'Hidden');
                } else if (typeof window.refreshCameraUI === 'function') {
                    window.refreshCameraUI();
                }
            }
        }
    }
}

function triggerLeebronJumpscare() {
    stopLeebronAI();
    console.log("[Leebron AI] YOU CAMPED IN THE DARK TOO LONG. (Jumpscare triggered)");

    if (typeof window.triggerJumpscare === 'function') {
        window.triggerJumpscare('leebron');
    } else {
        // Fallback death screen
        const deathScreen = document.createElement('div');
        deathScreen.style.position = 'fixed';
        deathScreen.style.top = '0';
        deathScreen.style.left = '0';
        deathScreen.style.width = '100vw';
        deathScreen.style.height = '100vh';
        deathScreen.style.backgroundColor = 'black';
        deathScreen.style.color = 'white';
        deathScreen.style.display = 'flex';
        deathScreen.style.justifyContent = 'center';
        deathScreen.style.alignItems = 'center';
        deathScreen.style.fontSize = '4rem';
        deathScreen.style.fontFamily = "'Courier New', monospace";
        deathScreen.style.zIndex = '99999';
        deathScreen.innerText = "THE DARKNESS CONSUMED YOU.";
        document.body.appendChild(deathScreen);

        setTimeout(() => {
            window.location.href = '../title.html';
        }, 3000);
    }
}

// --- Lifecycle Functions ---

window.startLeebronAI = function() {
    if (leebronInterval) clearInterval(leebronInterval);
    leebronDarknessTimer = 0;
    leebronInterval = setInterval(checkLeebron, leebronIntervalSpeed);
    console.log("[Leebron AI] Anti-camp system online.");
};

window.stopLeebronAI = function() {
    if (leebronInterval) clearInterval(leebronInterval);
    console.log("[Leebron AI] Deactivated.");
};
