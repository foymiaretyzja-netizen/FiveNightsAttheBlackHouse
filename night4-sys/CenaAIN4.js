// --- night4-sys/CenaAIN4.js ---

window.aiPositions = window.aiPositions || {};

// Movement and State
let cenaState = 0; // 0: Kitchen, 1: Diner, 2: At Door
let cenaInterval = null;
const cenaSpeed = 7000; // Moves/acts every 7 seconds

// Door Closed - Punching Mechanic
let cenaPunchCount = 0;
const punchSnd = new Audio('../Sounds/freesound_community-pounding-on-door-44023.mp3');
const breakDoorSnd = new Audio('../Sounds/yodguard-wooden_crate_smash-4-387903.mp3');

// Door Open - Stalking Mechanic
let openDoorWaitTimer = null;
let isFadingIn = false;
const openDoorSounds = [
    new Audio('../Sounds/soundreality-knocking-on-a-metal-door-226310.mp3'),
    new Audio('../Sounds/aglaxle-glass-shattering-461637.mp3'),
    new Audio('../Sounds/freesound_community-hitting-metal-31859.mp3'),
    new Audio('../Sounds/dragon-studio-knocking-door-1-397992.mp3'),
    new Audio('../Sounds/alesiadavina-horror-sound-monster-breath-189934.mp3')
];

function moveCena() {
    if (isFadingIn) return; // Stop logic if he's currently killing the player

    // If there's a global blackout, adjust behavior as needed (optional)
    if (typeof window.isBlackout !== 'undefined' && window.isBlackout) return;

    if (cenaState === 0) {
        // Move from Kitchen to Diner
        changeCenaRoom('Diner');
        cenaState = 1;
        console.log("[Cena AI] Moved to Diner.");
    } 
    else if (cenaState === 1) {
        // Move from Diner to Door (Hidden from cameras)
        changeCenaRoom('Hidden'); 
        cenaState = 2;
        cenaPunchCount = 0; // Reset punch count when he arrives
        console.log("[Cena AI] Arrived at the door!");
    } 
    else if (cenaState === 2) {
        // Attack Logic at the Door
        handleCenaAttack();
    }
}

function changeCenaRoom(newRoom) {
    let oldRoom = window.aiPositions.cena;
    window.aiPositions.cena = newRoom;
    
    if (typeof window.triggerLongFlicker === 'function' && oldRoom !== 'Hidden') {
        window.triggerLongFlicker(oldRoom, newRoom);
    } else if (typeof window.refreshCameraUI === 'function') {
        window.refreshCameraUI();
    }
}

function handleCenaAttack() {
    // ** Ensure 'window.isDoorClosed' matches your actual door variable! **
    if (window.isDoorClosed) {
        // --- DOOR IS CLOSED: PUNCHING LOGIC ---
        
        // Cancel the open-door timer if player closed the door in time
        if (openDoorWaitTimer) {
            clearTimeout(openDoorWaitTimer);
            openDoorWaitTimer = null;
        }

        cenaPunchCount++;
        console.log(`[Cena AI] Punched door! Count: ${cenaPunchCount}/4`);

        if (cenaPunchCount < 4) {
            punchSnd.currentTime = 0;
            punchSnd.play().catch(e => console.log("Audio block", e));
        } else {
            // Broke through!
            breakDoorSnd.play().catch(e => console.log("Audio block", e));
            triggerCenaJumpscare();
        }

    } else {
        // --- DOOR IS OPEN: WAITING & FADE IN LOGIC ---
        
        // Reset punch count since he isn't punching
        cenaPunchCount = 0; 

        // Play random creepy sound
        const randomSnd = openDoorSounds[Math.floor(Math.random() * openDoorSounds.length)];
        randomSnd.currentTime = 0;
        randomSnd.play().catch(e => console.log("Audio block", e));
        
        console.log("[Cena AI] Door is open. Playing creepy sound. 10 seconds until he enters...");

        // Start the 10-second timer if it hasn't started yet
        if (!openDoorWaitTimer) {
            openDoorWaitTimer = setTimeout(() => {
                // If the door is STILL open after 10 seconds, he walks in
                if (!window.isDoorClosed && !isFadingIn) {
                    startCenaFadeIn();
                }
            }, 10000);
        }
    }
}

// --- The Slow 5-Second Fade-In Kill ---
function startCenaFadeIn() {
    isFadingIn = true;
    console.log("[Cena AI] He is walking in...");

    // Create the fade-in overlay
    const fadeScreen = document.createElement('div');
    fadeScreen.id = 'cena-fade-screen';
    fadeScreen.style.position = 'fixed';
    fadeScreen.style.top = '0';
    fadeScreen.style.left = '0';
    fadeScreen.style.width = '100vw';
    fadeScreen.style.height = '100vh';
    fadeScreen.style.backgroundColor = 'black'; // Or set a background image of Cena here!
    fadeScreen.style.opacity = '0';
    fadeScreen.style.transition = 'opacity 5s ease-in-out';
    fadeScreen.style.zIndex = '99998';
    fadeScreen.style.pointerEvents = 'none';

    // Optional text for the fade
    fadeScreen.style.display = 'flex';
    fadeScreen.style.justifyContent = 'center';
    fadeScreen.style.alignItems = 'center';
    fadeScreen.style.color = 'darkred';
    fadeScreen.style.fontSize = '3rem';
    fadeScreen.style.fontFamily = "'Courier New', monospace";
    fadeScreen.innerText = "YOU CAN'T SEE ME...";

    document.body.appendChild(fadeScreen);

    // Trigger the CSS transition
    setTimeout(() => {
        fadeScreen.style.opacity = '1';
    }, 50);

    // After 5 seconds of fading, trigger the final jumpscare/death
    setTimeout(() => {
        triggerCenaJumpscare();
    }, 5000);
}

// --- Player Mechanic: Shock Cena ---
// Call this function when the player clicks the Shock Button!
window.shockCena = function() {
    if (cenaState === 2) {
        console.log("[Cena AI] ZAPPED! Cena sent back to the Kitchen.");
        
        // Reset timers and counts
        cenaState = 0;
        cenaPunchCount = 0;
        if (openDoorWaitTimer) {
            clearTimeout(openDoorWaitTimer);
            openDoorWaitTimer = null;
        }

        // Send him back to Kitchen
        changeCenaRoom('Kitchen');
        
        // Optional: Play a shock sound here if you have one
        // new Audio('../Sounds/shock-sound.mp3').play();
    } else {
        console.log("[Cena AI] Shocked, but he wasn't at the door.");
    }
};

function triggerCenaJumpscare() {
    window.stopCenaAI();
    console.log("[Cena AI] JUMPSCARE TRIGGERED!");

    if (typeof window.triggerJumpscare === 'function') {
        window.triggerJumpscare('cena');
    } else {
        // Fallback death screen
        document.body.innerHTML = '';
        document.body.style.backgroundColor = 'black';
        setTimeout(() => {
            window.location.href = '../title.html';
        }, 3000);
    }
}

// --- Lifecycle Functions ---
window.startCenaAI = function() {
    if (cenaInterval) clearInterval(cenaInterval);
    
    // Ensure he starts in the Kitchen globally
    window.aiPositions.cena = 'Kitchen';
    cenaState = 0;
    cenaPunchCount = 0;
    isFadingIn = false;
    
    cenaInterval = setInterval(moveCena, cenaSpeed);
    console.log("[Cena AI] Online. Starting in Kitchen.");
};

window.stopCenaAI = function() {
    if (cenaInterval) clearInterval(cenaInterval);
    if (openDoorWaitTimer) clearTimeout(openDoorWaitTimer);
    console.log("[Cena AI] Deactivated.");
};
