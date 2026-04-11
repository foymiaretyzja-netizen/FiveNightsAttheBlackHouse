<style>
    /* ... (previous styles) ... */

    /* Map Styling */
    #camera-map-img {
        width: 100%;
        height: auto;
        border: 2px solid #555;
        margin-bottom: 10px;
        filter: brightness(0.8) contrast(1.2); /* Makes it look a bit more like a monitor screen */
    }

    #camera-nav {
        flex: 0 0 280px; /* Slightly wider to fit the map better */
        display: flex;
        flex-direction: column;
        justify-content: flex-start; /* Align to top now that map is there */
        gap: 10px;
        overflow-y: auto; /* Just in case the buttons get long */
    }
</style>

<div id="camera-monitor">
    <div id="camera-layout">
        <div id="camera-nav">
            <img id="camera-map-img" src="../night1-sys/sprites/Screenshot 2026-04-10 9.12.19 PM.png" alt="Office Map">
            </div>
        
        <div id="camera-screen">
            <div id="camera-feed"></div>
            <img id="charrlie-sprite" class="ai-sprite" src="../night1-sys/sprites/Charrlie.png" alt="Charrlie">
            <img id="elong-sprite" class="ai-sprite" src="../night1-sys/sprites/Elong.png" alt="Elong">
            <div id="crt-overlay"></div>
            <div id="static-flash"></div>
        </div>
    </div>
</div>
