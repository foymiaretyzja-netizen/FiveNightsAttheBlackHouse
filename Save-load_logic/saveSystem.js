// --- Save-load_logic/saveSystem.js ---

// Progress Data (Default state)
let gameProgress = {
    Night1done: 0,
    Night2done: 0,
    Night3done: 0,
    Night4done: 0,
    Night5done: 0
};

// --- 1. AUTO-SAVE SYSTEM (Invisible) ---
function saveToBrowser() {
    localStorage.setItem('fnafCloneProgress', JSON.stringify(gameProgress));
    console.log("Game auto-saved to browser memory!");
}

function loadFromBrowser() {
    const savedData = localStorage.getItem('fnafCloneProgress');
    if (savedData) {
        gameProgress = JSON.parse(savedData);
        console.log("Loaded save from browser memory:", gameProgress);
    }
}

// Call this when they beat a night (e.g., completeNight(1))
window.completeNight = function(nightNumber) {
    if (gameProgress.hasOwnProperty(`Night${nightNumber}done`)) {
        gameProgress[`Night${nightNumber}done`] = 1;
        saveToBrowser(); // Automatically save to browser memory
    }
};

// Run this immediately when the script loads
loadFromBrowser();


// --- 2. MANUAL EXPORT/IMPORT (File Backup) ---
window.exportSaveFile = function() {
    let saveString = "";
    for (const key in gameProgress) {
        saveString += `${key}=${gameProgress[key]} `;
    }
    
    const blob = new Blob([saveString.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'progress.save'; 
    link.click();
    URL.revokeObjectURL(url);
};

window.importSaveFile = function(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const pairs = e.target.result.split(' ');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (gameProgress.hasOwnProperty(key)) {
                gameProgress[key] = parseInt(value);
            }
        });
        
        saveToBrowser(); // Save the imported data to browser memory
        updateMenuUI();
        alert("Save file loaded successfully!");
    };
    reader.readAsText(file);
};


// --- 3. MENU UI LOGIC ---
function getCurrentNight() {
    if (gameProgress.Night5done === 1) return 6; 
    if (gameProgress.Night4done === 1) return 5;
    if (gameProgress.Night3done === 1) return 4;
    if (gameProgress.Night2done === 1) return 3;
    if (gameProgress.Night1done === 1) return 2;
    return 1; 
}

window.updateMenuUI = function() {
    const nightDisplay = document.getElementById('current-night-display');
    const startButton = document.getElementById('btn-start-game');
    const night = getCurrentNight();
    
    if (nightDisplay) {
        nightDisplay.innerText = night > 5 ? "Game Complete!" : `Current Night: ${night}`;
    }
    
    if (startButton) {
        startButton.onclick = () => {
            window.location.href = `night${night}.html`;
        };
    }
};

// Try to update UI if we are on the title screen
if (document.getElementById('current-night-display')) {
    updateMenuUI();
}
