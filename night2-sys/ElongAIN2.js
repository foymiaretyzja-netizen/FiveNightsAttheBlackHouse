// --- night2-sys/ElongAIN2.js ---

// REMOVED ../ to fix pathing!
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

// Hardware lock for the initial timer
let elongActive = false; 

window.aiPositions.elong = elongCurrentRoom;

function moveElong() {
    // If he's not active yet, or he's at the door, or door is closed, do nothing.
    if (!elongActive || elongAtDoor || window.rightDoorClosed) return; 

    const roll = Math.floor(Math.random() * 3) + 1;
    let nextRoom = elongCurrentRoom;
    const connections = elongMap[elongCurrentRoom];

    if (roll === 1) {
        nextRoom = connections[Math.floor(Math.random() * connections.length)];
    } else {
        if (elongCurrentRoom === 'Storage
