// ==UserScript==
// @name         GeoFS-Nexus-V3.9
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  26+ Addons with polished UI, draggable HUD, real aircraft procedures!
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==
(() => {
    // Dynamic injection ensures Tampermonkey doesn't permanently cache your development code.
    var ts = Date.now(); // Instant cache buster during development
    var addonScript = document.createElement('script'); 
    addonScript.src="https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-All-in-One-Addon_GeoFS-Nexus/main/main.js?t=" + ts;
    document.body.appendChild(addonScript);
})();
