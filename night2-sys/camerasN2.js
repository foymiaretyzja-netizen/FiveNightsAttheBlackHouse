// --- night2-sys/camerasN2.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const elongSprite = document.getElementById('elong-sprite'); // Charrlie is handled via background images now

const camUIMonitor = document.getElementById('camera-monitor');
const camUILeftPanel = document.getElementById('left-panel');
const camUIRightPanel = document.getElementById('right-panel');

const camSounds = [
    new Audio('Sounds/freesound_community-aiwa-cx-930-vhs-vcr-video-cassette-recorderwav-14430.mp3'),
    new Audio('Sounds/designerschoice-comav_vcr-rewinding-vhs-tape_nicholas-judy_tdc-493294.mp3')
];

let currentCamAudio = null;

// NEW FOR NIGHT 2: Global variable for Charrlie's phase in the Guest Room
// CharrlieAIN2.js will update this variable as he opens the door.
window.currentGuestRoomImg = 'ScenesN2/guestroom-1.jpg';

const rooms = {
    'Conference Room': 'Scenes/Conference room.jpg',
    'Diner': 'Scenes/Diner.jpg',
    'Guest Room': 'DYNAMIC', // Flagged so the script knows to use the window variable
    'Janitor Room': 'Scenes/Janitor-room.jpg',
    'Kitchen': 'Scenes/Kitchen.jpg',
    'Storage': 'Scenes/Storage.jpg'
};

let currentCamera = 'Guest Room';

function setupCameraButtons() {
    // Updated path to night2-sys
    cameraNav.innerHTML = '<img id="camera-map-img" src="night2-sys/sprites/Screenshot 2026-04-10 11.54.10 PM.png" alt="Office Map">';
    
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

// Global short flicker (for clicking buttons)
window.triggerFlicker = function() {
    const flash = document.getElementById('static-flash');
    if (!flash) return;
    flash.classList.remove('is-switching', 'is-long-switching');
    void flash.offsetWidth; // Force CSS animation reflow
    flash.classList.add('is-switching');
};

// Global long flicker (for AI Movement)
window.triggerLongFlicker = function(oldRoom, newRoom) {
    // 1. If camera monitor is closed, do nothing (no sound, no flash)
    if (!window.isCameraOpen) return;

    // 2. If rooms are passed, ONLY trigger if the player is looking at the room the AI left, or the room it entered
    if (oldRoom && newRoom) {
        if (currentCamera !== oldRoom && currentCamera !== newRoom) {
            return; // Player is looking at a different room
        }
    }

    // 3. Play the static noise and trigger the flash effect
    playCameraSound();

    const flash = document.getElementById('static-flash');
    if (!flash) return;
    
    flash.classList.remove('is-switching', 'is-long-switching');
    void flash.offsetWidth; 
    flash.classList.add('is-long-switching');

    // Clean up class after 5s so it can be reused
    setTimeout(() => {
        flash.classList.remove('is-long-switching');
    }, 5000);
};

function switchCamera(roomName, playAudio = true) {
    if (playAudio) {
        playCameraSound();
        window.triggerFlicker(); 
    }
    
    currentCamera = roomName;

    // --- NIGHT 2 GUEST ROOM LOGIC ---
    if (roomName === 'Guest Room') {
        cameraFeed.style.backgroundImage = `url('${window.currentGuestRoomImg}')`;
    } else {
        cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;
    }

    // --- AI SPRITE LOGIC ---
    if (window.aiPositions && window.aiPositions.elong === roomName) {
        elongSprite.style.display = 'block';
    } else {
        elongSprite.style.display = 'none';
    }
}

// Global UI refresher so AI can change what you see mid-static
window.refreshCameraUI = function() {
    if (window.isCameraOpen) {
        switchCamera(currentCamera, false); 
    }
};

window.toggleCamera = function() {
    window.isCameraOpen = !window.isCameraOpen;
    
    if (window.isCameraOpen) {
        camUIMonitor.style.transform = 'translateY(0)'; 
        camUILeftPanel.classList.remove('is-visible');
        camUIRightPanel.classList.remove('is-visible');
        
        playCameraSound();
        window.triggerFlicker();
        switchCamera(currentCamera, false); 
    } else {
        camUIMonitor.style.transform = 'translateY(100%)'; 
        if (currentCamAudio) {
            currentCamAudio.pause();
            currentCamAudio.currentTime = 0;
        }
    }
};

setupCameraButtons();
