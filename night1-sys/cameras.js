// --- cameras.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const staticFlash = document.getElementById('static-flash');
const charrlieSprite = document.getElementById('charrlie-sprite');
const elongSprite = document.getElementById('elong-sprite');

// Renamed these variables so they don't clash with the ones in night1.html!
const camUIMonitor = document.getElementById('camera-monitor');
const camUILeftPanel = document.getElementById('left-panel');
const camUIRightPanel = document.getElementById('right-panel');

const camSounds = [
    new Audio('../Sounds/freesound_community-aiwa-cx-930-vhs-vcr-video-cassette-recorderwav-14430.mp3'),
    new Audio('../Sounds/designerschoice-comav_vcr-rewinding-vhs-tape_nicholas-judy_tdc-493294.mp3')
];

let currentCamAudio = null;

const rooms = {
    'Conference Room': '../Scenes/Conference room.jpg',
    'Diner': '../Scenes/Diner.jpg',
    'Guest Room': '../Scenes/Guest-room.jpg',
    'Janitor Room': '../Scenes/Janitor-room.jpg',
    'Kitchen': '../Scenes/Kitchen.jpg',
    'Storage': '../Scenes/Storage.jpg'
};

window.aiPositions = {
    charrlie: 'Guest Room',
    elong: 'Storage'
};

let currentCamera = 'Guest Room';

function setupCameraButtons() {
    for (const roomName in rooms) {
        const btn = document.createElement('button');
        btn.className = 'cam-btn';
        btn.innerText = `CAM: ${roomName}`;
        
        btn.onclick = () => {
            if (currentCamera === roomName) return;
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchCamera(roomName);
        };
        
        cameraNav.appendChild(btn);
    }
    
    const firstBtn = cameraNav.querySelector('.cam-btn');
    if (firstBtn) firstBtn.classList.add('active');
    switchCamera(currentCamera, false);
}

function playCameraSound() {
    if (currentCamAudio) {
        currentCamAudio.pause();
        currentCamAudio.currentTime = 0;
    }
    currentCamAudio = camSounds[Math.floor(Math.random() * camSounds.length)];
    currentCamAudio.play().catch(e => console.log("Audio block", e));
}

function triggerFlicker() {
    staticFlash.classList.remove('is-switching');
    void staticFlash.offsetWidth; // Force CSS animation reflow
    staticFlash.classList.add('is-switching');
}

function switchCamera(roomName, playAudio = true) {
    if (playAudio) {
        playCameraSound();
        triggerFlicker();
    }
    
    currentCamera = roomName;
    cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;

    charrlieSprite.style.display = (window.aiPositions.charrlie === roomName) ? 'block' : 'none';
    elongSprite.style.display = (window.aiPositions.elong === roomName) ? 'block' : 'none';
}

// --- BULLETPROOF TOGGLE LOGIC ---
window.toggleCamera = function() {
    window.isCameraOpen = !window.isCameraOpen;
    
    if (window.isCameraOpen) {
        // Slide monitor up & hide task panels using the renamed variables
        camUIMonitor.style.transform = 'translateY(0)'; 
        camUILeftPanel.classList.remove('is-visible');
        camUIRightPanel.classList.remove('is-visible');
        
        playCameraSound();
        triggerFlicker();
        switchCamera(currentCamera, false); 
    } else {
        // Slide monitor down & stop audio
        camUIMonitor.style.transform = 'translateY(100%)'; 
        if (currentCamAudio) {
            currentCamAudio.pause();
            currentCamAudio.currentTime = 0;
        }
    }
};

setupCameraButtons();
