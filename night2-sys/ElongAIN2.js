// --- night2-sys/ElongAIN2.js ---

const elongAudioCues = [
    new Audio('Sounds/soundreality-knocking-on-a-metal-door-226310.mp3'),
    new Audio('Sounds/aglaxle-glass-shattering-461637.mp3'),
    new Audio('Sounds/freesound_community-hitting-metal-31859.mp3'),
    new Audio('Sounds/dragon-studio-knocking-door-1-397992.mp3'),
    new Audio('Sounds/alesiadavina-horror-sound-monster-breath-189934.mp3')
];

const elongJumpscareSound = new Audio('Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');
const elongStaticSound = new Audio('Sounds/yourugor-tv-static-noise-291374.mp3'); 
const elongOfficeSprite = document.getElementById('elong-sprite-office');

const elongMap = {
    'Storage': ['Kitchen', 'Conference Room'],
    'Kitchen': ['Storage', 'Diner', 'Conference Room'],
    'Conference Room': ['Presidential Right Door', 'Storage'],
    'Diner': ['Janitor Room', 'Presidential Left Door', 'Kitchen'],
    'Janitor Room': ['Diner', 'Presidential Left Door']
};

let elongCurrentRoom = 'Storage';
let elongAtDoor = false;
let elongGraceTimer = null;
let elongSoundLoop = null;

// NEW: Dynamic timers to replace setInterval
let elongMoveTimeout = null; 
let elongLingerTimeout = null;

let elongActive = false; 

window.aiPositions = window.aiPositions || {};
window.aiPositions.elong = elongCurrentRoom;

// NEW: Recursive AI Loop (Much better than setInterval for FNAF games)
function loopElong() {
    if (elongActive) {
        moveElong();
    }
    // Schedule next move randomly between 12 and 15 seconds
    elongMoveTimeout = setTimeout(loopElong, Math.random() * 3000 + 12000);
}

function moveElong() {
    // FIX: Removed `window.rightDoorClosed`. He can now roam the cameras even if the door is shut!
    if (!elongActive || elongAtDoor) return; 

    console.log(`[Elong AI] Assessing move... Current location: ${elongCurrentRoom}`);

    const roll = Math.floor(Math.random() * 3) + 1;
    let nextRoom = elongCurrentRoom;
    const connections = elongMap[elongCurrentRoom];

    if (roll === 1) {
        nextRoom = connections[Math.floor(Math.random() * connections.length)];
    } else {
        if (elongCurrentRoom === 'Storage') nextRoom = 'Conference Room';
        else if (elongCurrentRoom === 'Conference Room') nextRoom = 'Presidential Right Door';
        else if (elongCurrentRoom === 'Kitchen') nextRoom = 'Conference Room';
        else nextRoom = connections[0];
    }

    if (nextRoom !== elongCurrentRoom) {
        console.log(`[Elong AI] Moving from ${elongCurrentRoom} to ${nextRoom}`);
        
        elongStaticSound.currentTime = 0;
        elongStaticSound.play().catch(() => {});

        if (window.isCameraOpen && typeof window.triggerLongFlicker === "function") {
            window.triggerLongFlicker(); 
        }

        setTimeout(() => {
            elongCurrentRoom = nextRoom;
            window.aiPositions.elong = elongCurrentRoom;
            
            if (typeof window.refreshCameraUI === "function") {
                window.refreshCameraUI();
            }

            if (elongCurrentRoom === 'Presidential Right Door') {
                console.log(`[Elong AI] Arrived at Right Door!`);
                triggerElongAtDoor();
            }
        }, 200); 
    } else {
        console.log(`[Elong AI] Decided to stay in ${elongCurrentRoom}`);
    }
}

function triggerElongAtDoor() {
    elongAtDoor = true;
    playElongHorrorSound();

    elongGraceTimer = setTimeout(() => {
        if (!window.rightDoorClosed) {
            console.log(`[Elong AI] Door open. Triggering jumpscare!`);
            triggerElongJumpscare();
        } else {
            console.log(`[Elong AI] Door closed. Lingering...`);
            handleElongLinger();
        }
    }, 10000);

    // Bang on the door while waiting
    elongSoundLoop = setInterval(() => {
        if (Math.random() < 0.33) playElongHorrorSound();
    }, 5000); 
}

function handleElongLinger() {
    const lingerTime = Math.random() * 5000 + 5000;
    elongLingerTimeout = setTimeout(() => {
        if (window.rightDoorClosed) {
            console.log(`[Elong AI] Gave up. Returning to Storage.`);
            resetElong();
        } else {
            console.log(`[Elong AI] Player opened the door while lingering! Jumpscare!`);
            triggerElongJumpscare(); 
        }
    }, lingerTime);
}

function resetElong() {
    elongAtDoor = false;
    
    // Clear all possible door timers
    clearTimeout(elongGraceTimer);
    clearTimeout(elongLingerTimeout);
    clearInterval(elongSoundLoop);
    
    elongCurrentRoom = 'Storage';
    window.aiPositions.elong = elongCurrentRoom;
    
    if (typeof window.refreshCameraUI === "function") window.refreshCameraUI();
    
    // FIX: Instantly restart his movement loop so he doesn't stall in Storage
    clearTimeout(elongMoveTimeout);
    elongMoveTimeout = setTimeout(loopElong, 5000); // Wait 5 seconds, then resume the hunt
}

function playElongHorrorSound() {
    const sound = elongAudioCues[Math.floor(Math.random() * elongAudioCues.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function triggerElongJumpscare() {
    const mon = document.getElementById('camera-monitor');
    if (mon) mon.style.display = 'none';

    elongOfficeSprite.style.display = 'block';
    elongOfficeSprite.style.left = '50%';
    elongOfficeSprite.style.transform = 'translateX(-50%) scale(1.5)';
    
    elongJumpscareSound.play();

    setTimeout(() => {
        elongOfficeSprite.style.transform = 'translateX(-50%) scale(8)';
        elongOfficeSprite.style.filter = 'brightness(2)';
    }, 50);

    setTimeout(() => {
        alert("ELONG TERMINATED YOUR CONTRACT.");
        location.reload();
    }, 1500);
}

// --- NIGHT 2 INITIAL GRACE PERIOD ---
setTimeout(() => {
    elongActive = true;
    console.log("[Elong AI] 45 SECONDS PASSED: Elong is now active.");
    
    // Start the dynamic loop instead of setInterval
    loopElong(); 
}, 45000);
