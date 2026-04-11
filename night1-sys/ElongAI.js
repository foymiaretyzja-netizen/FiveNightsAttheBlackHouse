// --- night1-sys/ElongAI.js ---

const elongAudioCues = [
    new Audio('../Sounds/soundreality-knocking-on-a-metal-door-226310.mp3'),
    new Audio('../Sounds/aglaxle-glass-shattering-461637.mp3'),
    new Audio('../Sounds/freesound_community-hitting-metal-31859.mp3'),
    new Audio('../Sounds/dragon-studio-knocking-door-1-397992.mp3'),
    new Audio('../Sounds/alesiadavina-horror-sound-monster-breath-189934.mp3')
];

const elongJumpscareSound = new Audio('../Sounds/sound_effects75-eyesaur-jumpscare-sound-482110.mp3');
const elongStaticSound = new Audio('../Sounds/yourugor-tv-static-noise-291374.mp3'); 
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

// Hardware lock for the 1-minute timer
let elongActive = false; 

window.aiPositions.elong = elongCurrentRoom;

function moveElong() {
    // If 1 minute hasn't passed, or he's at the door, or door is closed, do nothing.
    if (!elongActive || elongAtDoor || window.rightDoorClosed) return; 

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
        
        // 1. Play static noise
        elongStaticSound.currentTime = 0;
        elongStaticSound.play().catch(() => {});

        // 2. Trigger the 5-second long visual static if camera is open
        if (window.isCameraOpen && typeof window.triggerLongFlicker === "function") {
            window.triggerLongFlicker(); 
        }

        // 3. Wait 200ms for static to cover screen, then move him
        setTimeout(() => {
            elongCurrentRoom = nextRoom;
            window.aiPositions.elong = elongCurrentRoom;
            
            // Force camera screen to redraw
            if (typeof window.refreshCameraUI === "function") {
                window.refreshCameraUI();
            }

            if (elongCurrentRoom === 'Presidential Right Door') {
                triggerElongAtDoor();
            }
        }, 200); 
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
        else triggerElongJumpscare(); 
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

// --- INITIAL GRACE PERIOD ---
// Unlock the AI after exactly 60 seconds.
setTimeout(() => {
    elongActive = true;
    console.log("1 MINUTE PASSED: Elong is now active.");
    
    // He makes his first move immediately, then checks every 20 seconds
    moveElong();
    setInterval(moveElong, 20000);
    
}, 60000);
