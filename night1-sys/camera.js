// --- cameras.js ---

const cameraNav = document.getElementById('camera-nav');
const cameraFeed = document.getElementById('camera-feed');
const staticFlash = document.getElementById('static-flash');

const charrlieSprite = document.getElementById('charrlie-sprite');
const elongSprite = document.getElementById('elong-sprite');

// The Audio
const camSounds = [
    new Audio('../Sounds/freesound_community-aiwa-cx-930-vhs-vcr-video-cassette-recorderwav-14430.mp3'),
    new Audio('../Sounds/designerschoice-comav_vcr-rewinding-vhs-tape_nicholas-judy_tdc-493294.mp3')
];

// Room Database
const rooms = {
    'Conference Room': '../Scenes/Conference room.jpg',
    'Diner': '../Scenes/Diner.jpg',
    'Guest Room': '../Scenes/Guest-room.jpg',
    'Janitor Room': '../Scenes/Janitor-room.jpg',
    'Kitchen': '../Scenes/Kitchen.jpg',
    'Storage': '../Scenes/Storage.jpg'
};

// Hardcoded initial AI positions (The AI brains will update these later)
window.aiPositions = {
    charrlie: 'Guest Room',
    elong: 'Storage'
};

let currentCamera = 'Guest Room';

// Initialize the camera buttons
function setupCameraButtons() {
    for (const roomName in rooms) {
        const btn = document.createElement('button');
        btn.className = 'cam-btn';
        btn.innerText = `CAM: ${roomName}`;
        
        btn.onclick = () => {
            // Remove active class from all, add to this one
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            switchCamera(roomName);
        };
        
        cameraNav.appendChild(btn);
    }
    
    // Set the first button as active by default
    cameraNav.firstChild.classList.add('active');
    switchCamera(currentCamera, false); // Load initial room without sound
}

function playCameraSound() {
    const sound = camSounds[Math.floor(Math.random() * camSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio block", e));
}

function switchCamera(roomName, playAudio = true) {
    if (playAudio) playCameraSound();
    
    currentCamera = roomName;

    // Trigger static flash animation
    staticFlash.classList.remove('is-switching');
    void staticFlash.offsetWidth; // CSS trick to force animation restart
    staticFlash.classList.add('is-switching');

    // Change background image
    cameraFeed.style.backgroundImage = `url('${rooms[roomName]}')`;

    // Check if AIs are in this room
    charrlieSprite.style.display = (window.aiPositions.charrlie === roomName) ? 'block' : 'none';
    elongSprite.style.display = (window.aiPositions.elong === roomName) ? 'block' : 'none';
}

// Modify the toggleCamera function from the HTML to trigger the audio and static
const originalToggleCamera = window.toggleCamera;
window.toggleCamera = function() {
    originalToggleCamera(); // Run the slide-up animation
    
    if (isCameraOpen) {
        playCameraSound();
        staticFlash.classList.remove('is-switching');
        void staticFlash.offsetWidth;
        staticFlash.classList.add('is-switching');
        
        // Ensure sprites are showing correctly when opening
        switchCamera(currentCamera, false);
    }
};

// Start the setup
setupCameraButtons();
