// --- night4-sys/camerasN4.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const cameraScreen = document.getElementById('camera-screen');

// Night 4 Sprite References
const leebronSprite = document.getElementById('leebron-sprite');
const bezoidSprite = document.getElementById('bezoid-sprite');
const cenaSprite = document.getElementById('cena-sprite');
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
    'Guest Room': '../Scenes/Guest room.jpg', 
    'Janitor Room': '../Scenes/Janitor-room.jpg',
    'Kitchen': '../Scenes/Kitchen.jpg',
    'Storage': '../Scenes/Storage.jpg'
};

// Expose the current camera globally
window.currentCamera = 'Guest Room'; 

// --- Inject Snow Effect ---
function initSnowEffect() {
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
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMCKcCBXY/C6MAAAAASUVORK5CYII=') repeat;
            opacity: 0.15; 
            pointer-events: none;
            z-index: 15;
            mix-blend-mode: screen;
            animation: snowDrift 0.2s linear infinite;
        }
    `;
    document.head.appendChild(style);

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
    
    initSnowEffect(); 
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
    void flash.offsetWidth; 
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

    // Load static background
    cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;

    // --- NIGHT 4 AI SPRITE LOGIC ---
    
    if (leebronSprite) {
        if (window.aiPositions && window.aiPositions.leebron === roomName) {
            leebronSprite.style.display = 'block';
            
            // Dynamic Room Positioning for Leebron
            if (roomName === 'Guest Room') {
                leebronSprite.style.left = '40%';
                leebronSprite.style.bottom = '100px';
                leebronSprite.style.transform = 'scale(0.85)';
                leebronSprite.style.filter = 'brightness(0.5)'; // Extra dark since he spawns in the dark!
            } else if (roomName === 'Diner') {
                leebronSprite.style.left = '25%';
                leebronSprite.style.bottom = '60px';
                leebronSprite.style.transform = 'scale(1.1)';
                leebronSprite.style.filter = 'brightness(0.8)';
            } else {
                // Default fallback
                leebronSprite.style.left = '20%';
                leebronSprite.style.bottom = '50px';
                leebronSprite.style.transform = 'scale(1)';
                leebronSprite.style.filter = 'brightness(1)';
            }
        } else {
            leebronSprite.style.display = 'none';
        }
    }

    if (bezoidSprite) {
        bezoidSprite.style.display = (window.aiPositions && window.aiPositions.bezoid === roomName) ? 'block' : 'none';
    }

    if (zuckSprite) {
        zuckSprite.style.display = (window.aiPositions && window.aiPositions.zuck === roomName) ? 'block' : 'none';
    }

    if (cenaSprite) {
        if (window.aiPositions && window.aiPositions.cena === roomName) {
            cenaSprite.style.display = 'block';
            
            // Dynamic Room Positioning for Cena
            if (roomName === 'Kitchen') {
                cenaSprite.style.left = '35%';
                cenaSprite.style.bottom = '80px';
                cenaSprite.style.transform = 'scale(0.8)';
                cenaSprite.style.filter = 'brightness(0.7)'; // Dimmer for the kitchen
            } else if (roomName === 'Diner') {
                cenaSprite.style.left = '60%';
                cenaSprite.style.bottom = '50px';
                cenaSprite.style.transform = 'scale(0.9)';
                cenaSprite.style.filter = 'brightness(0.8)';
            } else {
                // Default position for Storage, Janitor, Conference
                cenaSprite.style.left = '80%';
                cenaSprite.style.bottom = '50px';
                cenaSprite.style.transform = 'scale(1)';
                cenaSprite.style.filter = 'brightness(1)';
            }
        } else {
            cenaSprite.style.display = 'none';
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
    // --- NEW: Sabotage Lockout Mechanic ---
    if (window.systemCompromised) {
        console.log("[Cameras] Offline! System Compromised by Bezoid.");
        // If you want a little static buzz when they try to click it while broken, uncomment the next line:
        // new Audio('../Sounds/freesound_community-electricity-101990.mp3').play();
        return; 
    }
    // --------------------------------------

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
