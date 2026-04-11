// --- night1-sys/ElongAI.js ---

const elongAudioCues = [
    new Audio('../Sounds/freesound_community-creepy-vocal-ambience-6074.mp3'),
    new Audio('../Sounds/dragon-studio-heavy-creaking-515252.mp3'),
    new Audio('../Sounds/freesound_community-hitting-metal-31859.mp3'),
    new Audio('../Sounds/jusatti890-scream-horror-sfx-490916.mp3'),
    new Audio('../Sounds/alesiadavina-horror-sound-monster-breath-189934.mp3')
];

const elongJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');
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

window.aiPositions.elong = elongCurrentRoom;

function moveElong() {
    if (elongAtDoor || window.rightDoorClosed) return; 

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

    // --- THE FIX: Flicker to hide the move ---
    if (nextRoom !== elongCurrentRoom) {
        // If the player is looking at the camera, flicker the screen
        if (window.isCameraOpen && typeof window.triggerFlicker === "function") {
            window.triggerFlicker(); 
        }

        // Delay the actual position swap by 150ms (halfway through flicker)
        setTimeout(() => {
            elongCurrentRoom = nextRoom;
            window.aiPositions.elong = elongCurrentRoom;
            
            if (elongCurrentRoom === 'Presidential Right Door') {
                triggerElongAtDoor();
            }
        }, 150);
    }
}

function triggerElongAtDoor() {
    elongAtDoor = true;
    playElongHorrorSound();

    elongGraceTimer = setTimeout(() => {
        if (!window.rightDoorClosed) {
            triggerElongJumpscare();
        } else {
            handleElongLinger();
        }
    }, 10000);

    elongSoundLoop = setInterval(() => {
        if (Math.random() < 0.33) playElongHorrorSound();
    }, 10000);
}

function handleElongLinger() {
    const lingerTime = Math.random() * 5000 + 5000;
    setTimeout(() => {
        if (window.rightDoorClosed) resetElong();
        else triggerElongJumpscare(); // If they opened it while he was still there!
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
    sound.play().catch(() => {});
}

function triggerElongJumpscare() {
    // Hide camera monitor immediately
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

// Night 1 Speed: Every 18 seconds (slightly slower for better pacing)
setInterval(moveElong, 18000);
