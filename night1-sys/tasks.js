// --- night1-sys/tasks.js ---

const btnDeport = document.getElementById('btn-deport');
const btnMissile = document.getElementById('btn-missile');

// Task Progress Variables
let deportCount = 0;
const MAX_DEPORT = 10;

let missileCount = 0;
const MAX_MISSILES = 5;

// AI Data Relay Variables
window.lastMissileTime = Date.now();
window.elongAngerMultiplier = 1.0; 

// --- Task 1: Deportation ---
btnDeport.addEventListener('click', () => {
    // Prevent tasks if power is out
    if (typeof isBlackout !== 'undefined' && isBlackout) return; 

    if (deportCount < MAX_DEPORT) {
        deportCount++;
        btnDeport.innerText = `Deport liberals (${deportCount}/${MAX_DEPORT})`;
        
        // Add a visual cue and disable when finished
        if (deportCount === MAX_DEPORT) {
            btnDeport.style.color = "#00ff00";
            btnDeport.style.borderColor = "#00ff00";
            btnDeport.innerText = "Deportation Complete";
            btnDeport.disabled = true;
            
            // Optional: You could make completing this task slow down Charrlie
            console.log("Deportation task complete!");
        }
    }
});

// --- Task 2: Missiles (Tied to Elong's AI) ---
btnMissile.addEventListener('click', () => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return;

    if (missileCount < MAX_MISSILES) {
        missileCount++;
        btnMissile.innerText = `Send missiles to Irun (${missileCount}/${MAX_MISSILES})`;
        
        // Reset Elong's patience every time a missile is fired
        window.lastMissileTime = Date.now();
        window.elongAngerMultiplier = 1.0;
        console.log("Missile sent! Elong is appeased (for now).");

        if (missileCount === MAX_MISSILES) {
            btnMissile.style.color = "#00ff00";
            btnMissile.style.borderColor = "#00ff00";
            btnMissile.innerText = "Missiles Depleted";
            btnMissile.disabled = true;
        }
    }
});

// --- Elong Anger Monitor ---
// Checks every 5 seconds to see if the player is neglecting the missile task
setInterval(() => {
    if (typeof isBlackout !== 'undefined' && isBlackout) return;
    
    // Stop getting mad if all missiles are depleted (or maybe he gets permanently mad? Up to you!)
    if (missileCount >= MAX_MISSILES) return; 

    // Calculate how many seconds it has been since the last missile was launched
    const secondsSinceLastMissile = Math.floor((Date.now() - window.lastMissileTime) / 1000);
    
    // If the player hasn't sent a missile in 20 seconds, Elong gets faster
    if (secondsSinceLastMissile > 20) {
        window.elongAngerMultiplier += 0.2; // Increases his speed multiplier
        console.log(`Elong is getting impatient! Anger Multiplier: ${window.elongAngerMultiplier.toFixed(1)}x`);
    }
}, 5000);
