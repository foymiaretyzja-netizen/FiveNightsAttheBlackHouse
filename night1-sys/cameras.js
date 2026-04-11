// --- night1-sys/cameras.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const staticFlash = document.getElementById('static-flash');
const charrlieSprite = document.getElementById('charrlie-sprite');
const elongSprite = document.getElementById('elong-sprite');

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

let currentCamera = 'Guest Room';

function setupCameraButtons() {
    cameraNav.innerHTML = '<img id="camera-map-img" src="../night1-sys/sprites/Screenshot 2026-04-10 11.54.10 PM.png" alt="Office Map">';
    
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

// Short flicker for manually switching cameras
window.triggerFlicker = function() {
    staticFlash.classList.remove('is-switching', 'is-long-switching');
    void staticFlash.offsetWidth; // Force CSS animation reflow
    staticFlash.classList.add('is-switching');
};

// NEW: Long 5-second flicker for AI Movement
window.triggerLongFlicker = function() {
    staticFlash.classList.remove('is-switching', 'is-long-switching');
    void staticFlash.offsetWidth; 
    staticFlash.classList.add('is-long-switching');

    // Clean up the class after 5 seconds so it can be triggered again later
    setTimeout(() => {
        staticFlash.classList.remove('is-long-switching');
    }, 5000);
};

function switchCamera(roomName, playAudio = true) {
    if (playAudio) {
        playCameraSound();
        window.triggerFlicker(); 
    }
    
    currentCamera = roomName;
    cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;

    if (window.aiPositions && window.aiPositions.elong === roomName) {
        elongSprite.style.display = 'block';
    } else {
        elongSprite.style.display = 'none';
    }

    if (window.aiPositions && window.aiPositions.charrlie === roomName) {
        charrlieSprite.style.display = 'block';
    } else {
        charrlieSprite.style.display = 'none';
    }
}

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
