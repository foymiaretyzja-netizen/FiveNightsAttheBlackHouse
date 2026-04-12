// --- night3-sys/camerasN3.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const cameraScreen = document.getElementById('camera-screen');
const elongSprite = document.getElementById('elong-sprite'); 
// NEW: ZuckenBurger sprite reference
const zuckSprite = document.getElementById('zuck-sprite'); 

const camUIMonitor = document.getElementById('camera-monitor');
const camUILeftPanel = document.getElementById('left-panel');
const camUIRightPanel = document.getElementById('right-panel');

// Audio setup
const camSounds = [
    new Audio('../Sounds/freesound_community-aiwa-cx-930-vhs-vcr-video-cassette-recorderwav-14430.mp3'),
    new Audio('../Sounds/designerschoice-comav_vcr-rewinding-vhs-tape_nicholas-judy_tdc-493294.mp3')
];

let currentCamAudio = null;

// The static rooms
const rooms = {
    'Conference Room': '../Scenes/Conference room.jpg',
    'Diner': '../Scenes/Diner.jpg',
    'Guest Room': 'DYNAMIC', 
    'Janitor Room': '../Scenes/Janitor-room.jpg',
    'Kitchen': '../Scenes/Kitchen.jpg',
    'Storage': '../Scenes/Storage.jpg'
};

// Expose the current camera globally
window.currentCamera = 'Guest Room'; 

// --- NEW: Inject Snow Effect ---
function initSnowEffect() {
    // 1. Create the CSS animation for the static movement
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes snowDrift {
            0% { background-position: 0px 0px; }
            100% { background-position: 100px 100px; }
        }
        #snow-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            /* Using a tiny base64 noise texture */
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMCKcCBXY/C6MAAAAASUVORK5CYII=') repeat;
            opacity: 0.15; /* Subtle enough to see, thick enough to be creepy */
            pointer-events: none;
            z-index: 15;
            mix-blend-mode: screen;
            animation: snowDrift 0.2s linear infinite;
        }
    `;
    document.head.appendChild(style);

    // 2. Create the overlay div and add it to the camera screen
    const snowOverlay = document.createElement('div');
    snowOverlay.id = 'snow-overlay';
    cameraScreen.appendChild(snowOverlay);
}

function setupCameraButtons() {
    cameraNav.innerHTML = '<img id="camera-map-img" src="../StoryScenes/Screenshot 2026-04-10 9.12.19 PM.png" alt="Office Map">';
    
    for (const roomName in rooms) {
        const btn = document.createElement('button');
        btn.className = 'cam-btn';
        btn.innerText = `CAM: ${roomName}`;
        
        btn.onclick = () => {
            if (window.currentCamera === roomName) return;
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchCamera(roomName);
        };
        
        cameraNav.appendChild(btn);
    }
    
    const firstBtn = cameraNav.querySelector('.cam-btn');
    if (firstBtn) firstBtn.classList.add('active');
    
    initSnowEffect(); // Fire up the snow!
    switchCamera(window.currentCamera, false);
}

function playCameraSound() {
    if (currentCamAudio) {
        currentCamAudio.pause();
        currentCamAudio.currentTime = 0;
    }
    currentCamAudio = camSounds[Math.floor(Math.random() * camSounds.length)];
    currentCamAudio.play().catch(e => console.log("[Camera] Audio block", e));
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
    if (!window.isCameraOpen) return;

    if (oldRoom && newRoom) {
        if (window.currentCamera !== oldRoom && window.currentCamera !== newRoom) {
            return; 
        }
    }

    playCameraSound();

    const flash = document.getElementById('static-flash');
    if (!flash) return;
    
    flash.classList.remove('is-switching', 'is-long-switching');
    void flash.offsetWidth; 
    flash.classList.add('is-long-switching');

    setTimeout(() => {
        flash.classList.remove('is-long-switching');
    }, 5000);
};

function switchCamera(roomName, playAudio = true) {
    if (playAudio) {
        playCameraSound();
        window.triggerFlicker(); 
    }
    
    window.currentCamera = roomName;

    // --- GUEST ROOM LOGIC (Stitched with Charrlie's AI) ---
    if (roomName === 'Guest Room') {
        const stage = (typeof window.charrlieStage !== 'undefined') ? Math.min(window.charrlieStage, 4) : 1;
        // Keeping N2 scenes path unless you created a ScenesN3 folder!
        cameraFeed.style.backgroundImage = `url('../ScenesN2/guestroom-${stage}.jpg')`;
    } else {
        cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;
    }

    // --- AI SPRITE LOGIC ---
    
    // Elong's Sprite
    if (window.aiPositions && window.aiPositions.elong === roomName) {
        elongSprite.style.display = 'block';
    } else {
        elongSprite.style.display = 'none';
    }

    // ZuckenBurger's Sprite
    if (zuckSprite) {
        // UPDATED: Changed .zuck to .zuckenburger to correctly sync with ZuckenBurgerN3.js
        if (window.aiPositions && window.aiPositions.zuckenburger === roomName) {
            zuckSprite.style.display = 'block';
        } else {
            zuckSprite.style.display = 'none';
        }
    }
}

// Called by AI scripts when they move, so the camera feed updates live
window.refreshCameraUI = function() {
    if (window.isCameraOpen) {
        switchCamera(window.currentCamera, false); 
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
        switchCamera(window.currentCamera, false); 
    } else {
        camUIMonitor.style.transform = 'translateY(100%)'; 
        if (currentCamAudio) {
            currentCamAudio.pause();
            currentCamAudio.currentTime = 0;
        }
    }
};

setupCameraButtons();
