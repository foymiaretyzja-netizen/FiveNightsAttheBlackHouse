// --- night1-sys/ElongAI.js ---

const elongAudioCues = [
    new Audio('../Sounds/freesound_community-creepy-vocal-ambience-6074.mp3'),
    new Audio('../Sounds/dragon-studio-heavy-creaking-515252.mp3'),
    new Audio('../Sounds/freesound_community-hitting-metal-31859.mp3'),
    new Audio('../Sounds/jusatti890-scream-horror-sfx-490916.mp3'),
    new Audio('../Sounds/alesiadavina-horror-sound-monster-breath-189934.mp3')
];

const elongJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');
const elongSpriteImg = document.getElementById('elong-sprite');

// Map Logic based on your connections
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

// Initial state
window.aiPositions.elong = elongCurrentRoom;

/**
 * ELONG MOVEMENT LOGIC (The 1/3 System)
 * Triggered by Missile Task failure thresholds or global game loop
 */
function moveElong() {
    if (elongAtDoor) return; // Don't move if already at the door

    // 1/3 System: 1 = Wander, 2 & 3 = Hunt (Point to player)
    const roll = Math.floor(Math.random() * 3) + 1;
    const connections = elongMap[elongCurrentRoom];

    if (roll === 1) {
        // WANDER: Pick any connected room
        elongCurrentRoom = connections[Math.floor(Math.random() * connections.length)];
    } else {
        // HUNT: Point to Presidential Room
        // Sharp Pathing: Storage -> Conference -> Door
        if (elongCurrentRoom === 'Storage') elongCurrentRoom = 'Conference Room';
        else if (elongCurrentRoom === 'Conference Room') elongCurrentRoom = 'Presidential Right Door';
        else if (elongCurrentRoom === 'Kitchen') elongCurrentRoom = 'Conference Room';
        else {
            // Fallback: move to a random connection if path is unclear
            elongCurrentRoom = connections[0];
        }
    }

    window.aiPositions.elong = elongCurrentRoom;
    console.log("Elong moved to: " + elongCurrentRoom);

    if (elongCurrentRoom === 'Presidential Right Door') {
        triggerElongAtDoor();
    }
}

function triggerElongAtDoor() {
    elongAtDoor = true;
    
    // 1. Guaranteed first sound
    playElongHorrorSound();

    // 2. Start the 10s Death Timer
    elongGraceTimer = setTimeout(() => {
        // Check if door is closed via the global variable from night1.html
        if (!window.rightDoorClosed) {
            triggerElongJumpscare();
        } else {
            // Player saved themselves, start lingering logic
            handleElongLinger();
        }
    }, 10000);

    // 3. 1/3 Sound Loop (Every 10s)
    elongSoundLoop = setInterval(() => {
        if (Math.random() < 0.33) {
            playElongHorrorSound();
        }
    }, 10000);
}

function handleElongLinger() {
    // Wait 5-10s before leaving
    const lingerTime = Math.random() * 5000 + 5000;
    
    setTimeout(() => {
        // If door is still closed, he leaves back to start
        console.log("Elong gave up and went back to Storage.");
        resetElong();
    }, lingerTime);
}

function resetElong() {
    elongAtDoor = false;
    clearTimeout(elongGraceTimer);
    clearInterval(elongSoundLoop);
    elongCurrentRoom = 'Storage';
    window.aiPositions.elong = elongCurrentRoom;
}

function playElongHorrorSound() {
    const sound = elongAudioCues[Math.floor(Math.random() * elongAudioCues.length)];
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio Blocked"));
}

function triggerElongJumpscare() {
    console.log("GAME OVER: Elong caught you.");
    
    // Visuals: Show sprite, center it, and zoom
    elongSpriteImg.style.display = 'block';
    elongSpriteImg.style.left = '50%';
    elongSpriteImg.style.transform = 'translateX(-50%) scale(1)';
    elongSpriteImg.style.transition = 'transform 0.2s ease-in';
    elongSpriteImg.style.zIndex = '999';
    
    // Zoom effect
    setTimeout(() => {
        elongSpriteImg.style.transform = 'translateX(-50%) scale(5)';
    }, 50);

    // Sound
    elongJumpscareSound.play();

    // End Game Logic (optional: reload page)
    setTimeout(() => {
        alert("YOU DIED");
        location.reload();
    }, 1000);
}

// Start his movement loop (Every 15s for Night 1)
setInterval(() => {
    // Only move if stress is high enough (placeholder check)
    // In a full build, this would check: if (missileStress > 33)
    moveElong();
}, 15000);
