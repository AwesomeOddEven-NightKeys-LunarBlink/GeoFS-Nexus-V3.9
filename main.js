// =============================================================================
// GeoFS NEXUS V3.9 — Community Userscript Bundle
// Target: geo-fs.com (GeoFS flight simulator)
// Description: Bundles 25+ community addons into a single injectable script.
//              Includes AI ATC, flight systems, realism, UI improvements, etc.
// =============================================================================

// =============================================================================
// SECTION 1: GM API SHIMS
// These polyfills allow addon scripts originally written for Tampermonkey to
// work in plain browser environments (e.g. injected via the console or a
// browser extension that does not expose GM_* globals).
// =============================================================================

if (typeof unsafeWindow === "undefined") {
    window.unsafeWindow = window;
}
(function () {
    const GM_resources = {
        airports:   "https://raw.githack.com/avramovic/geofs-ai-atc/master/airports.json",
        radiostatic:"https://raw.githack.com/avramovic/geofs-ai-atc/master/radio-static.mp3"
    };

    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
    }

    if (typeof window.GM === "undefined") window.GM = {};

    if (typeof GM.getResourceText === "undefined") {
        GM.getResourceText = async function(name) {
            const url = GM_resources[name];
            if (!url) throw new Error("Unknown resource: " + name);

            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);

            if (/\.(json|txt)(\?|$)/i.test(url)) {
                return res.text();
            }

            const blob = await res.blob();
            const dataUrl = await blobToDataURL(blob); 
            const semi = dataUrl.indexOf(";");         
            return dataUrl.slice(semi + 1);         
  };
}
  if (typeof window.GM.getResourceUrl === "undefined") {
    window.GM.getResourceUrl = async function (name) {
      const url = GM_resources[name];
      if (!url) throw new Error("Unknown resource: " + name);
      return url;
    };
  }

  if (typeof GM_xmlhttpRequest === "undefined") {
    window.GM_xmlhttpRequest = function (details) {
      fetch(details.url, {
        method: details.method || "GET",
        headers: details.headers || {},
        body: details.data || null,
      })
        .then(async res => {
          const text = await res.text();
          details.onload && details.onload({
            responseText: text,
            status: res.status,
            statusText: res.statusText,
            responseHeaders: Array.from(res.headers.entries())
              .map(([k, v]) => `${k}: ${v}`).join("\n"),
            finalUrl: res.url
          });
        })
        .catch(err => {
          details.onerror && details.onerror({ status: 0, statusText: err.message });
        });
    };
  }

  if (typeof GM_addStyle === "undefined") {
    window.GM_addStyle = function (css) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
  }
})();

// =============================================================================
// SECTION 1.5: NEXUS UI DESIGN SYSTEM
// Injects a global CSS stylesheet that provides modern, polished styling for
// all Nexus-created UI elements. Uses glassmorphism, smooth transitions, and
// a consistent dark navy + cyan accent colour palette.
// =============================================================================

(function injectNexusCSS() {
    const css = document.createElement("style");
    css.id = "nexus-design-system";
    css.textContent = `
        /* ── Nexus dropdown items ── */
        .nexus-dropdown {
            cursor: pointer;
            padding: 10px 14px;
            margin: 3px 0;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(10,15,30,0.9), rgba(20,30,45,0.85));
            color: #ffffff;
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: all 0.25s ease;
            position: relative;
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }
        .nexus-dropdown:hover {
            background: linear-gradient(135deg, rgba(20,30,60,0.95), rgba(40,60,90,0.9));
            border-color: rgba(80,120,200,0.3);
            transform: translateX(2px);
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }

        /* ── Chevron icon ── */
        .nexus-chevron {
            display: inline-block;
            margin-right: 8px;
            font-size: 10px;
            transition: transform 0.3s ease;
            color: rgba(100,200,255,0.7);
        }
        .nexus-chevron.open {
            transform: rotate(90deg);
        }

        /* ── Sub-content containers ── */
        .nexus-content {
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease;
            opacity: 0;
            padding: 0 8px;
            background: rgba(15, 25, 45, 0.95);
            border-radius: 8px;
            border: 1px solid rgba(100,200,255,0.1);
            margin: 2px 4px 8px 4px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .nexus-content.open {
            max-height: 5000px;
            opacity: 1;
            padding: 10px;
        }

        /* ── Sub-items (addon entries, aircraft entries) ── */
        .nexus-sub-item {
            cursor: pointer;
            padding: 8px 12px;
            margin: 2px 0;
            border-radius: 6px;
            background: rgba(100,200,255,0.05);
            color: #eef2f7;
            font-size: 12.5px;
            font-weight: 500;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }
        .nexus-sub-item:hover {
            background: rgba(100,200,255,0.1);
            border-left-color: rgba(100,200,255,0.6);
            color: #ffffff;
        }

        /* ── Description text ── */
        .nexus-description {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease;
            padding: 0 10px;
            color: #d1d9e6;
            font-size: 11.5px;
            line-height: 1.5;
            white-space: pre-wrap;
            border-left: 2px solid rgba(100,200,255,0.3);
            margin-left: 12px;
        }
        .nexus-description.open {
            max-height: 8000px;
            opacity: 1;
            padding: 8px 10px;
        }

        /* ── Flight data display (HUD) ── */
        #flightDataDisplay {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 230px;
            background: linear-gradient(145deg, rgba(10,18,30,0.75), rgba(20,35,55,0.70));
            padding: 14px 16px;
            border-radius: 12px;
            font-family: 'Roboto Mono', 'Consolas', monospace;
            font-size: 12.5px;
            font-weight: 600;
            color: #e0e8f0;
            pointer-events: auto;
            z-index: 100000;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.35);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(100,200,255,0.12);
            cursor: move;
            user-select: none;
        }
        #flightDataDisplay .hud-label {
            color: rgba(140,220,255,0.9);
            font-size: 10px;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        #flightDataDisplay .hud-value {
            color: #fff;
            font-size: 13px;
        }
        #flightDataDisplay .hud-value.warn {
            color: #ffb347;
        }
        #flightDataDisplay .hud-value.danger {
            color: #ff6b6b;
        }
        #flightDataDisplay .hud-cell {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        #flightDataDisplay .hud-drag-handle {
            grid-column: 1 / -1;
            text-align: center;
            color: rgba(100,200,255,0.3);
            font-size: 16px;
            letter-spacing: 4px;
            line-height: 1;
            margin-bottom: 4px;
            cursor: move;
        }

        /* ── Category headers inside Aircraft menu ── */
        .nexus-category {
            padding: 8px 14px;
            margin: 4px 0;
            border-radius: 6px;
            background: rgba(100,200,255,0.12);
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .nexus-category:hover {
            background: rgba(100,200,255,0.15);
        }

        /* ── HUD minimize button ── */
        #hudMinimizeBtn {
            position: fixed;
            top: 50% !important;
            margin-top: -15px !important;
            left: 0 !important;
            transform: none !important;
            width: 30px;
            height: 30px;
            background: linear-gradient(145deg, rgba(10,18,30,0.85), rgba(20,35,55,0.80));
            border: 1px solid rgba(100,200,255,0.25);
            border-left: none;
            border-radius: 0 7px 7px 0;
            color: rgba(100,200,255,0.8);
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
            z-index: 100002;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
            user-select: none;
        }
        #hudMinimizeBtn:hover {
            background: linear-gradient(145deg, rgba(20,35,60,0.95), rgba(35,60,95,0.90));
            border-color: rgba(100,200,255,0.5);
            color: #fff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        }
        #flightDataDisplay.hud-minimized {
            display: none !important;
        }
    `;
    document.head.appendChild(css);
})();

// =============================================================================
// SECTION 2: RANDOM JOBS ADDON
// Loads the Random Jobs addon (by scitor), which shows departure flights from
// the nearest airport and tracks career statistics.
// Also injects a CSS fix for airline icon sizing and syncs METAR text.
// =============================================================================

function jobs() {
    // Scripts are fetched as text, concatenated, then injected as ONE <script> tag.
    // This is required because geofs.lib.js uses top-level `const aList` / `const aIndex`,
    // and each separate <script src> or eval() call creates its own isolated lexical scope —
    // meaning those consts would be invisible to manager.js, window.js, etc.
    // By joining everything into one script tag, all declarations share a single scope.
    (async function () {
        const base = "https://raw.githack.com/scitor/GeoFS/master/";

        const scripts = [
            "geofs.lib.js?0.8.6.1171",
            "randomJobs/patch.js?0.8.6.1171",
            "randomJobs/manager.js?0.8.6.1171",
            "randomJobs/airport.handler.js?0.8.6.1171",
            "randomJobs/flight.handler.js?0.8.6.1171",
            "randomJobs/generator.js?0.8.6.1171",
            "randomJobs/window.js?0.8.6.1171",
            "randomJobs/career.page.js?0.8.6.1171",
            "randomJobs/airport.page.js?0.8.6.1171",
            "randomJobs/flightplan.page.js?0.8.6.1171"
        ];

        // Fetch all in parallel, then concatenate preserving order
        const texts = await Promise.all(
            scripts.map(file =>
                fetch(base + file)
                    .then(r => r.ok ? r.text() : Promise.reject("HTTP " + r.status + " " + file))
                    .then(code => code.replace(/^\s*['"]use strict['"]\s*;?\s*/m, ""))
            )
        );

        // Set the repo base URL so scripts can self-reference it at eval time
        window.githubRepo = "https://raw.githubusercontent.com/scitor/GeoFS/master";

        // Expose key names onto window — const in a <script> is NEVER a window property,
        // so we must assign them explicitly after the const declarations run.
        const windowExports = `
window.aList = aList;
window.aIndex = aIndex;
window.RandomJobsMod = RandomJobsMod;
window.MainWindow = MainWindow;
window.AirportHandler = AirportHandler;
window.FlightHandler = FlightHandler;
window.JobGenerator = JobGenerator;
`;
        const blob = new Blob([texts.join("\n;\n") + "\n;\n" + windowExports], {type: "application/javascript"});
        const blobUrl = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = blobUrl;
            s.onload = () => { URL.revokeObjectURL(blobUrl); resolve(); };
            s.onerror = reject;
            document.body.appendChild(s);
        });


        let wait = 1;
        (function init() {
            if (typeof window.aList === "undefined" || (!Object.keys(window.aList[0]).length && wait < 5)) {
                return setTimeout(init, 1000 * wait++);
            }
            geofs.randomJobs = new RandomJobsMod(window.aList, window.aIndex, "0.8.6.1171");

            // Monkey-patch the buggy init method that crashes on geofs.api.map.markerLayers
            const _origInit = geofs.randomJobs.init.bind(geofs.randomJobs);
            geofs.randomJobs.init = function(ready) {
                try {
                    _origInit(ready);
                } catch (e) {
                    console.warn("RandomJobs: Bypassed markerLayers crash:", e);
                    this.aList.forEach((sList, s) => Object.keys(sList).forEach(icao => this.aIndex[s].addPoint(icao, ...sList[icao])));
                    $.getJSON(`${window.githubRepo}/icaos.json?${Date.now()}`, json => {
                        json.forEach(e => window.aList.push(e));
                        this.aHandler.init();
                        setInterval(() => this.update(), 1000);
                        ready();
                    });
                }
            };

            geofs.randomJobs.init(() => new MainWindow(geofs.randomJobs).init());
        })();
    })();


    const style = document.createElement("style");
    style.textContent = `
        /* airline icon same size as text */
        .flightno img {
        width: 18px !important;
        height: 18px !important;
        object-fit: contain !important;
        display: inline-block !important;
        }

        /* just in case some script injects airline name */
        .flightno .airline-name {
        display: none !important;
        }   
    `;

    function updateMetar() {
        let source = document.querySelector(".geofs-metarDisplay");
        let target = document.querySelector(".metar");

        if (source && target && source.textContent.trim() !== "") {
            target.textContent = "METAR: " + source.textContent;
        } else if (target) {
            target.textContent = "METAR: INOP";
        }
    }

    // Wait for the jobs window to appear in the DOM, then apply z-index fix
    // and begin syncing METAR from the GeoFS weather display element
    let zIndexRun = false;
    const jobsWindow = document.querySelector(".jobs-window");
    if (jobsWindow && !zIndexRun) {
        jobsWindow.style.zIndex = "99999"
        document.head.appendChild(style);
        setInterval(updateMetar, 2000);
        zIndexRun = true;
    }
    const jobsWindowObserver = new MutationObserver(() => {
        const jobsWindow = document.querySelector(".jobs-window");
        if (jobsWindow && !zIndexRun) {
            jobsWindow.style.zIndex = "99999"
            document.head.appendChild(style);
            setInterval(updateMetar, 2000);
            zIndexRun = true;
            jobsWindowObserver.disconnect();
        }
    });
    jobsWindowObserver.observe(document.body, { childList: true, subtree: true });

};

// =============================================================================
// SECTION 3: PREFERENCE PANEL MENUS
// Injects collapsible dropdown sections into the GeoFS preferences panel
// (the gear icon menu). Each sub-function adds one top-level dropdown:
//   - Addons     : Lists all active addons with expandable descriptions
//   - Procedures : Flight rules, ATC phraseology, climb/descent procedures
//   - Failures   : Emergency checklists for each system failure type
//   - Aircraft   : Per-aircraft procedures and failure references
// =============================================================================

function menus() {

    // ── Helper: create a Nexus-styled collapsible dropdown ──
    function nexusDropdown(label) {
        const wrapper = document.createElement('div');
        const header = document.createElement('div');
        header.className = 'nexus-dropdown';

        const chevron = document.createElement('span');
        chevron.className = 'nexus-chevron';
        chevron.textContent = '▶';

        const text = document.createElement('span');
        text.textContent = label;

        header.appendChild(chevron);
        header.appendChild(text);

        const content = document.createElement('div');
        content.className = 'nexus-content';

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            content.classList.toggle('open');
            chevron.classList.toggle('open');
        });

        wrapper.appendChild(header);
        wrapper.appendChild(content);
        return { wrapper, content, chevron };
    }

    // ── Helper: create a sub-item with expandable description ──
    function nexusSubItem(name, descriptionText) {
        const item = document.createElement('div');
        item.className = 'nexus-sub-item';

        const chevron = document.createElement('span');
        chevron.className = 'nexus-chevron';
        chevron.textContent = '▶';
        chevron.style.fontSize = '8px';

        const label = document.createElement('span');
        label.textContent = name;

        item.appendChild(chevron);
        item.appendChild(label);

        const desc = document.createElement('div');
        desc.className = 'nexus-description';
        desc.textContent = descriptionText || 'No description available.';

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            desc.classList.toggle('open');
            chevron.classList.toggle('open');
        });

        const container = document.createElement('div');
        container.appendChild(item);
        container.appendChild(desc);
        return container;
    }

    // -------------------------------------------------------------------------
    // Addon Manager
    // -------------------------------------------------------------------------
    function createAddonManager() {
        const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
        if (!panel) return;

        const descriptions = {
            'AI ATC': 'Uses PuterJS GPT and speech-to-text to provide AI air traffic control.\nSend a voice message by clicking the headset icon or type a message using Ctrl+click. Pressing [D] acts as a push-to-talk key.\nYou have to be within 50 nautical miles of the airport to talk to it.',
            'Autoland++': 'Automatically deploys spoilers, disables autopilot and autothrottle, and activates reverse thrust on touchdown.',
            'Autothrottle': 'Regulates aircraft speed while retaining pilot control. Press [Shift + ~] to turn it on and off.',
            'Camera cycling': 'Randomly cycles through the camera angles every 30 seconds. Toggle on/off by pressing [W].',
            'Chat fix': 'Fixes the removal of the [T] keybind for opening the chat window in GeoFS.',
            'Cockpit volume': 'Lowers the volume when in interior views in aircraft without dedicated cockpit sounds.',
            'Extra vehicles': 'Extra vehicles in GeoFS presented by JXT.',
            'Failures': 'Adds the ability for systems to fail (you have to enable it first):\n• Landing gear  • Fuel leak  • Flight control\n• Electrical  • Structural  • Hydraulic\n• Pressurization  • MCAS  • Engines',
            'Flight path vector': 'Shows approximately where your flight path intersects the ground. Hidden by pressing [Insert].',
            'Fuel': 'Simulates fuel consumption. To refuel, you must be on the ground, stationary, and have engines off.',
            'GPWS': 'Adds GPWS callouts (airliners). For minimums to work, type in the BAROMETRIC (MSL) minimum altitude.',
            'Information display': 'Displays IAS, Mach, GS, ALT, AGL, HDG, V/S, THR, AOA, Glideslope, G-force, and fuel. Draggable. Toggle by pressing [ K ].',
            'Jetbridge': 'Loads a jetbridge which you can adjust the position of.',
            'Landing stats': 'Upon landing, displays V/S, G-forces, airspeed, roll, tilt, TDZ accuracy, and a landing score.',
            'Overpowered engines': 'Sets engine thrust to 6x normal and ceiling to 300,000 ft. Toggle using [Q].',
            'Pushback': 'Adds pushback tugs for most military and civilian aircraft.',
            'Random Jobs': 'Shows flights departing from your airport and tracks completed flights under "Career".',
            'Realism pack': 'Toggle KCAS/KTAS, fixed PFD/HUD sizes, blackout over 9 Gs, fighter condensation, SSR shaders, Livery Selector by Kolos26, swing wing physics, 8 addon aircraft, clickable cockpits, sonic booms, stall buffet, wingflex, ejection seats, 2D clouds.',
            'Sky Dolly': 'Adds MSFS Sky Dolly functionality: formation mode and logbook.',
            'Slew mode': 'Mimics slew mode from FSX. Toggle: [Y], Fwd: [I], Back: [K], Left: [J], Right: [L], Up: [U], Down: [Enter].',
            'Streetlights': 'Adds streetlights to the GeoFS map during nighttime.',
            'Maritime Structures': 'Adds extra maritime structures to the environment.',
            'Utilities': 'Adds various utility functions for GeoFS.',
            'Taxiway lights': 'Adds illuminated taxiway edge lights.',
            'Taxiway signs': 'Adds ICAO-standard taxiway signage.',
            'UI tweaks': 'Adds a popout chat window.',
            'Ad Remover': 'Removes banner ads from the GeoFS UI.'
        };

        const { wrapper, content } = nexusDropdown('✦ Addons');
        Object.keys(descriptions).sort().forEach(name => {
            content.appendChild(nexusSubItem(name, descriptions[name]));
        });
        panel.appendChild(wrapper);
    }

    // -------------------------------------------------------------------------
    // Procedures
    // -------------------------------------------------------------------------
    function createInstructions() {
        const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
        if (!panel) return;

        const descriptions = {
            'Preflight procedures': 'Review procedures\nLoad/create flight plan\nCheck METAR, decide on VFR or IFR\nCheck elevations of departure and arrival airports\nChoose suitable cruise altitude (for short flights, 10x distance eg. 150nm = 15,000ft)\nCheck duration, fuel range, choose suitable aircraft\nCalculate top of descent (0.003 x cruise alt minus airport elevation)\nLoad in aircraft at gate, recheck everything, check controls, pushback',
            'VFR rules': '1. Weather Minimums:\nMaintain specific visibility and cloud clearance.\n2. Altitude Rules (above 3,000 ft AGL, below 18,000 ft MSL):\n  East (0-179): Odd thousand + 500 ft (e.g., 3,500, 5,500)\n  West (180-359): Even thousand + 500 ft (e.g., 4,500, 6,500)\n3. Airspace Requirements:\n  Class A: VFR not permitted\n  Class B: Requires ATC clearance\n  Class C/D: Two-way radio required\n  Class E/G: No clearance required unless specified\n4. Weather Minimums by Airspace:\n  Class B: 3SM vis, clear of clouds\n  Class C/D: 3SM vis, 500ft below, 1000ft above, 2000ft horizontal\n5. Minimum Safe Altitudes:\n  1,000 ft above highest obstacle (congested)\n  500 ft above surface (uncongested)',
            'IFR rules': '1. Flight Plan: Mandatory before departure.\n2. Clearance: Must receive ATC clearance (CRAFT format).\n3. Weather: Can operate in IMC (clouds, fog, low visibility).\n4. Equipment: VOR/GPS nav, attitude indicator, heading indicator, altimeter, radio, clock.\n5. Altitude: Fly assigned altitude or MEA. Off-route: 1,000ft above obstacles (2,000ft mountainous).\n6. Approaches: Precision (ILS) = lateral + vertical. Non-precision (VOR, RNAV) = lateral only.\n7. Lost Comms: Route = last assigned/expected. Altitude = highest of assigned, MEA, expected.\n8. Alternate Required: Unless destination has 2,000ft ceiling and 3SM vis within 1hr of ETA.',
            'Other rules, METAR, airspace': 'Speed Limits:\n  250 kts below FL100\n  200 kts in Class B/C/D surface areas\nStandard Rate Turns: Speed / 10 + 7 = bank angle\n\nMETAR Example: PHNL 250953Z 05007G17KT 10SM FEW024 27/19 A3001\n  PHNL = Location\n  250953Z = 25th, 09:53 Zulu\n  05007G17KT = Wind 050 at 7kts gusting 17\n  10SM = 10 statute miles vis\n  FEW024 = Few clouds 2,400ft AGL\n  27/19 = Temp 27C / Dewpoint 19C\n  A3001 = Altimeter 30.01 inHg\n\nAirspace Classes:\n  A: FL180-FL600, IFR only\n  B: Surface-10,000ft, major airports\n  C: Surface-4,000ft AGL, two-way radio\n  D: Surface-2,500ft AGL, smaller towered\n  E: 1,200ft AGL-FL180, controlled\n  G: Surface-1,200ft AGL, uncontrolled',
            'ATC procedures': '1. Clearance: "[Airport] Clearance, [Callsign], IFR to [Dest], ready to copy."\n   ATC: "Cleared to [Dest] via [SID], climb maintain [alt], departure [freq], squawk [code]."\n2. Ground: "[Airport] Ground, [Callsign], gate [XX], ready for pushback."\n   ATC: "Pushback approved, taxi via [taxiway] to runway [XX]."\n3. Tower: "[Airport] Tower, [Callsign], holding short runway [XX], ready."\n   ATC: "Cleared for takeoff runway [XX]."\n4. Departure: Check in with departure frequency after handoff.\n5. Enroute: "[Center], [Callsign], level at [FL]."\n6. Approach: "[Approach], [Callsign], requesting ILS runway [XX]."\n7. Landing: "Established on ILS runway [XX]." -> "Cleared to land."\n8. Ground: "Clear of runway [XX], taxi to gate."',
            'Climb procedures': '1) Set flaps 2 for takeoff. Set V/S 3,000 fpm, speed 230 kts.\n2) At 1,500ft AGL: Retract flaps. Reduce thrust 80%. Engage autopilot.\n3) At 4,000ft AGL: V/S 2,400 fpm.\n4) At 10,000ft: Speed 250 kts, V/S 2,200 fpm.\n5) At 18,000ft: Speed 270 kts, V/S 1,800 fpm.\n6) At 25,000ft: Speed 280 kts, V/S 1,500 fpm.\n7) At 30,000ft: Speed M0.76, V/S 1,000 fpm.\n8) At cruise altitude: Set cruise speed, V/S 0.',
            'Descent procedures': '1) Calculate T/D: (Cruise alt - Airport elev) x 0.003 = T/D distance (nm).\n2) At T/D-5nm: Speed M0.76, V/S -2,400 fpm.\n3) At T/D: Set target 4,000ft.\n4) 30,000ft: Speed 280 kts, V/S -2,200 fpm.\n5) 25,000ft: Speed 270 kts.\n6) 18,000ft: V/S -1,800 fpm.\n7) 12,000ft: Speed 250 kts.\n8) 10,000ft: Speed 240 kts.\n9) 7,000ft: Speed 230 kts, V/S -1,500 fpm.\n10) 5,000ft: Speed 210 kts, Flaps 1.\n11) 4,000ft: Speed 190 kts, Flaps 2, hold until 12nm.\n12) 12nm: Tune ILS.\n13) 3,000ft: Speed 170 kts, Flaps 3.\n14) 2,500ft: Speed 160 kts, Full flaps, Gear DOWN.\n15) Below 1,000ft: Disengage AP.',
            'Go around procedures': '1) Announce "Go-Around" -- inform ATC.\n2) Apply full power smoothly.\n3) Pitch for positive climb, monitor airspeed.\n4) Retract flaps gradually as airspeed increases.\n5) Verify positive climb rate -- Gear UP.\n6) Stabilize at safe airspeed, maintain runway heading.\n7) Communicate: "[Callsign] going around, climbing to [alt]."\n8) Follow published missed approach procedure.'
        };

        const { wrapper, content } = nexusDropdown('✦ Procedures');
        ['Preflight procedures', 'VFR rules', 'IFR rules', 'Other rules, METAR, airspace', 'ATC procedures', 'Climb procedures', 'Descent procedures', 'Go around procedures'].forEach(name => {
            content.appendChild(nexusSubItem(name, descriptions[name]));
        });
        panel.appendChild(wrapper);
    }

    // -------------------------------------------------------------------------
    // Failures
    // -------------------------------------------------------------------------
    function createFailures() {
        const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
        if (!panel) return;

        const descriptions = {
            'Electrical': '1. Check circuit breakers and reset if safe.\n2. Turn off non-essential electrical systems.\n3. Switch to battery power or emergency generator.\n4. Use handheld radio or 121.5 MHz if primary radios fail.\n5. Divert to nearest airport for a visual approach.',
            'Fuel leak / starvation': 'Fuel Leak:\n1. Detect: fuel pressure loss, quantity drop.\n2. Isolate: shut off fuel to affected engine/tank.\n3. Declare emergency, divert to nearest airport.\n4. After landing: shut down engines, evacuate.\n\nFuel Starvation:\n1. Establish best glide speed, trim for stable flight.\n2. Switch fuel tanks, auxiliary pump ON.\n3. Declare emergency, squawk 7700.\n4. Select landing site and execute forced landing.',
            'Landing gear': '1. Check indicators and circuit breakers.\n2. Cycle gear (up then down).\n3. Use manual/emergency extension system.\n4. Low pass for visual inspection.\n5. Land on operable side or belly land.\n6. Shut down engines and fuel before touchdown.',
            'Hydraulic / flight control': 'Controls Failure:\n1. Identify which controls are inoperative.\n2. Engage autopilot to stabilize if available.\n3. Use trim, rudder, or asymmetric thrust.\n4. Declare emergency, aim for long runway.\n\nHydraulic Failure:\n1. Check hydraulic pressure and fluid levels.\n2. Activate backup/manual hydraulic pumps.\n3. Use manual control for flaps, brakes, gear.\n4. Prepare for longer landing roll.',
            'Loss of cabin pressure': '1. Monitor cabin altitude and oxygen levels.\n2. Don oxygen masks (crew and passengers).\n3. Emergency descent to 10,000ft or safe altitude.\n4. Divert to nearest suitable airport.',
            'Loss of power': '1. Pitch for best glide speed immediately.\n2. Attempt restart: switch fuel tanks, aux pump ON, check mixture/ignition.\n3. Declare emergency, squawk 7700.\n4. Select best landing site within gliding distance.\n5. Secure aircraft: fuel OFF, ignition OFF, electrical OFF.',
            'Structural': '1. Slow to maneuvering speed (Va) immediately.\n2. Limit maneuvers, avoid turbulence.\n3. Declare emergency, head to nearest airport.'
        };

        const { wrapper, content } = nexusDropdown('✦ Failures');
        Object.keys(descriptions).forEach(name => {
            content.appendChild(nexusSubItem(name, descriptions[name]));
        });
        panel.appendChild(wrapper);
    }

    // -------------------------------------------------------------------------
    // Aircraft — per-aircraft procedures with real V-speeds, flap schedules
    // -------------------------------------------------------------------------
    function createAircraftMenus() {
        const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
        if (!panel) return;

        const aircraftData = {
            'Cessna 172 Skyhawk': {
                procedures: 'TAKEOFF:\n  - Roll: Full Throttle, Flaps 0° (Normal) or 10° (Short).\n  - Vr (Rotation): 55 KIAS.\n  - Initial Climb (0-1000ft): Vy 74 KIAS, Gear FIXED.\n\nAPPROACH & LANDING:\n  - Downwind: 1000ft AGL, 80-90 KIAS, Flaps 10°.\n  - Base: 70-75 KIAS, Flaps 20°.\n  - Final: 60-65 KIAS, Flaps 30° (Full).\n  - Flare: 10-15ft, Throttle IDLE, Aerodynamic braking.\n  - Rollout: Smooth wheel braking, Flaps UP.',
                failures: 'ENGINE FAILURE (In Flight):\n1. Best glide speed: 65 KIAS\n2. Select a landing site within glide range\n3. Attempt restart: fuel selector BOTH, mixture RICH, carb heat ON\n4. If no restart: fuel OFF, mixture IDLE CUT-OFF, ignition OFF\n5. Flaps as needed once landing is assured\n\nENGINE FAILURE (On Takeoff):\n1. Below 500 ft AGL: Land straight ahead, do NOT turn back\n2. Above 500 ft AGL: Consider 30 offset or modified return'
            },
            'Piper J-3 Cub': {
                procedures: 'TAKEOFF:\n  - Roll: Full Throttle, No Flaps, Tail up at 30 MPH.\n  - Vr: 40-45 MPH (~35 KIAS).\n  - Initial Climb: 55-60 MPH.\n\nAPPROACH & LANDING:\n  - Downwind: 800ft AGL, 60 MPH.\n  - Final: 50-55 MPH, No Spoilers.\n  - Flare: 5-10ft, Throttle IDLE, 3-point stall landing.\n  - Rollout: Manual brakes (avoid nose-over), Flaps N/A.',
                failures: 'ENGINE FAILURE:\n1. Best glide speed: 55 MPH\n2. Land in any available field\n3. No electrical system -- focus on fuel and ignition checks'
            },
            'DHC-2 Beaver': {
                procedures: 'TAKEOFF (STOL):\n  - Roll: Max Manifold Pressure, Flaps 15-25°.\n  - Vr: 55-60 KIAS (Lift tail early).\n  - Initial Climb: 80 KIAS, Gear UP (if amphibious).\n\nAPPROACH & LANDING:\n  - Initial: 85 KIAS, Flaps 15°.\n  - Final: 65-70 KIAS, Flaps 35-50° (Full).\n  - Flare: 15ft, Throttle to Idle, Wheel landing for stability.\n  - Rollout: Heavy braking if short field, Spoilers N/A.',
                failures: 'ENGINE FAILURE:\n1. Best glide speed: 80 KIAS\n2. Attempt restart: mixture, fuel selector, magnetos\n3. If on floats: water landing preferred over rough terrain'
            },
            'Douglas DC-3': {
                procedures: 'TAKEOFF:\n  - Roll: Approx 48" Manifold Press, Flaps 1/4 (15°).\n  - Vr: 84 KIAS, Tail up early.\n  - Initial Climb: 120 KIAS, Gear UP above 50ft.\n\nAPPROACH & LANDING:\n  - Downwind: 1000ft AGL, 120 KIAS, Gear DOWN.\n  - Final: 95 KIAS, Flaps 1/2 (Base) to FULL (Final).\n  - Flare: 20ft, Idle Throttle, Wheel landing (Main gear first).\n  - Rollout: Gentle brakes, keep tail up as long as possible.',
                failures: 'SINGLE ENGINE:\n1. Identify dead engine: "dead foot, dead engine"\n2. Feather propeller on dead engine\n3. Minimum control speed (Vmc): ~84 KIAS\n4. Maintain 100+ KIAS, 5 degree bank into live engine'
            },
            'DHC-6 Twin Otter': {
                procedures: 'TAKEOFF:\n  - Roll: Max Torque, Flaps 10-20°.\n  - Vr: 70 KIAS.\n  - Initial Climb: 90 KIAS, Gear FIXED.\n\nAPPROACH & LANDING:\n  - Approach: 80-85 KIAS, Flaps 20°.\n  - Final: 70-75 KIAS, Flaps FULL (37.5°).\n  - Flare: 15ft, Throttle IDLE then Beta/Reverse if STOL.\n  - Rollout: Max braking, Reverse Thrust for full stop.',
                failures: 'SINGLE ENGINE:\n1. Identify and feather failed engine\n2. Maintain 85 KIAS minimum\n3. Can maintain altitude on one engine at light weights'
            },
            'Embraer Phenom 100': {
                procedures: 'TAKEOFF:\n  - Roll: Throttle TO (FADEC), Flaps 1 (10°).\n  - V1: 95 KIAS | Vr: 100 KIAS | V2: 110 KIAS.\n  - Initial Climb: Gear UP (Positive rate), 160 KIAS.\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 160 KIAS, Flaps 1.\n  - Final App: 115 KIAS, Gear DOWN, Flaps 2.\n  - Landing: Vref 95-105 KIAS, Flaps FULL (3), Throttle IDLE.\n  - Rollout: Heavy wheel braking (No Reversers/Spoilers).',
                failures: 'SINGLE ENGINE:\n1. Identify failed engine, advance thrust on operative engine\n2. Maintain V2 minimum\n3. Single-engine ceiling: ~15,000 ft'
            },
            'Boeing 737-700/800': {
                procedures: 'TAKEOFF:\n  - Roll: Throttle TOGA (95% N1), Flaps 5.\n  - Vr: 140 KIAS (Typical weight).\n  - Initial Climb (0-1000ft): V2+15, Gear UP (Positive rate).\n  - Acceleration (1000ft+): Retract Flaps per PFD schedule.\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 210 KIAS, Flaps 1.\n  - Int (2000ft): 170 KIAS, Gear DOWN, Flaps 15.\n  - Landing: Vref+5 (Flaps 30/40), Throttle IDLE at 50ft RA.\n  - Touchdown: Spoilers DEPLOYED (Auto), Max Reverse Thrust.\n  - Rollout: Autobrake 2/3, Manual braking below 60 KIAS.',
                failures: 'ENGINE FAILURE ON TAKEOFF:\n  Below V1: Reject -- MAX braking, spoilers, reverse thrust\n  Above V1: Continue, maintain V2, positive climb, gear UP\n  Single-engine ceiling: ~20,000 ft\n\nDUAL ENGINE FAILURE:\n  Best glide speed: ~220 KIAS clean\n  Look for nearest suitable airport'
            },
            'Boeing 757-200': {
                procedures: 'TAKEOFF:\n  - Roll: EPR 1.4-1.6 (EPR Limit), Flaps 5 or 15.\n  - Vr: 145 KIAS.\n  - Initial Climb: V/S 3000+ fpm, Gear UP (Positive rate).\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 210 KIAS, Flaps 1.\n  - Final App (2000ft): 160 KIAS, Gear DOWN, Flaps 20.\n  - Landing: Vref ~135 KIAS (Flaps 30), Idle at 30-50ft RA.\n  - Touchdown: Spoilers (Full), Reverse Thrust.\n  - Rollout: Autobrake 3, Manual braking as needed.',
                failures: 'ENGINE FAILURE:\n  Maintain V2, gear UP after positive climb\n  Single-engine performance excellent\n  Can maintain FL250+ on one engine'
            },
            'Boeing 747-400': {
                procedures: 'TAKEOFF:\n  - Roll: TOGA (1.5 EPR / 100% N1), Flaps 10 or 20.\n  - Vr: 165 KIAS (Heavy).\n  - Initial Climb: V/S 2500 fpm, Gear UP (Positive rate).\n\nAPPROACH & LANDING:\n  - Initial (4000ft): 210 KIAS, Flaps 5.\n  - Int (2500ft): 180 KIAS, Gear DOWN, Flaps 20.\n  - Landing: Vref 145-155 KIAS (Flaps 30), Idle at 50ft RA.\n  - Touchdown: Spoilers (Auto), Full Reverse Thrust.\n  - Rollout: Autobrake 3/4 (Heavy load), Flaps UP.',
                failures: 'ENGINE FAILURE (Quad Engine):\n  Handles single engine loss well\n  3-engine cruise altitude: FL250-FL310\n  Maintain V2, gear UP, accelerate to Venr'
            },
            'Boeing 777-200ER': {
                procedures: 'TAKEOFF:\n  - Roll: TOGA (Detent), Flaps 5 or 15.\n  - Vr: 155 KIAS.\n  - Initial Climb: 175 KIAS (V2+15), Gear UP (Positive rate).\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 210 KIAS, Flaps 5.\n  - Final App (2000ft): 170 KIAS, Gear DOWN, Flaps 20.\n  - Landing: Vref 140 KIAS (Flaps 30), IDLE at 30ft RA.\n  - Touchdown: Spoilers Deploy, Reverse Thrust.\n  - Rollout: Autobrake 3, Manual brakes at taxi speed.',
                failures: 'ENGINE FAILURE:\n  Excellent single-engine performance\n  Single-engine ceiling: FL200-FL260\n  ETOPS rated: can fly 330+ minutes on one engine'
            },
            'Boeing 787-9 Dreamliner': {
                procedures: 'TAKEOFF:\n  - Roll: Throttle TOGA, Flaps 5 or 15.\n  - Vr: 155 KIAS.\n  - Initial Climb: Gear UP (Positive rate), V/S 2800 fpm.\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 210 KIAS, Flaps 5.\n  - Final App (2000ft): 175 KIAS, Gear DOWN, Flaps 20.\n  - Landing: Vref 135 KIAS (Flaps 25/30), Idle at 30ft RA.\n  - Touchdown: Electronic braking (Auto), Spoilers (Auto).\n  - Rollout: Electronic Reverse Thrust, Flaps UP.',
                failures: 'ENGINE FAILURE:\n  Excellent single-engine performance\n  Single-engine ceiling: FL200+\n  ETOPS 330 minute rating\n  Composite airframe -- no depressurization from fatigue'
            },
            'Airbus A320-200': {
                procedures: 'TAKEOFF:\n  - Roll: FLX or TOGA Detent, Flaps CONF 1+F or 2.\n  - Vr: 140 KIAS.\n  - Initial Climb: Gear UP (Positive rate), SRS Mode pitch.\n  - Acceleration (1000ft): LVR CLB (Thrust Climb Flashing).\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 210 KIAS (Green Dot), CONF 1.\n  - Final App (2000ft): 160 KIAS, Gear DOWN, CONF 2/3.\n  - Landing: Vapp (CONF FULL), RETARD call at 20ft RA.\n  - Touchdown: Ground Spoilers (Auto), Reverse Thrust.\n  - Rollout: Autobrake MED/LO, Sidestick for directional control.',
                failures: 'ENGINE FAILURE:\n  ECAM handles checklists automatically\n  Maintain SRS guidance, gear UP, Flaps on schedule\n  Single-engine ceiling: FL200-FL250\n  Fly-by-wire protections active'
            },
            'Airbus A330-300': {
                procedures: 'TAKEOFF:\n  - Roll: FLX or TOGA, Flaps CONF 1+F or 2.\n  - Vr: 155 KIAS.\n  - Initial Climb: Gear UP (Positive rate), Thrust CLB.\n\nAPPROACH & LANDING:\n  - Initial (3000ft): 220 KIAS, CONF 1.\n  - Final App (2500ft): 170 KIAS, Gear DOWN, CONF 2.\n  - Landing: Vref 140 KIAS (CONF FULL), Idle at 40ft RA.\n  - Touchdown: Spoilers (Auto), Max Reverse.\n  - Rollout: Autobrake MED, Flaps UP below 40 KIAS.',
                failures: 'ENGINE FAILURE:\n  ECAM actions guide crew response\n  Excellent single-engine performance\n  ETOPS 180 rated\n  Fly-by-wire maintains control authority'
            },
            'Airbus A350-900': {
                procedures: 'TAKEOFF:\n  - Roll: FLX 1 or TOGA, Flaps CONF 1+F.\n  - Vr: 155 KIAS.\n  - Initial Climb: Gear UP (Positive rate), SRS mode pitch.\n\nAPPROACH & LANDING:\n  - Initial: Green Dot speed, CONF 1.\n  - Final App (2000ft): 165 KIAS, Gear DOWN, CONF 2/3.\n  - Landing: Vref 140 KIAS (CONF FULL), Idle at 30ft RA.\n  - Touchdown: Spoilers (Auto), Heavy Reverse Thrust.\n  - Rollout: Advanced BTV (Brake to Vacate) if enabled.',
                failures: 'ENGINE FAILURE:\n  Trent XWB engines -- excellent reliability\n  Single-engine ceiling: FL250+\n  ETOPS 370 capable -- longest twin-engine rating'
            },
            'Airbus A380-800': {
                procedures: 'TAKEOFF (Super):\n  - Roll: 100% N1 (TOGA), Flaps CONF 2 or 3.\n  - Vr: 165 KIAS (MTOW).\n  - Initial Climb: Gear UP (Positive rate), V/S 1800 fpm.\n\nAPPROACH & LANDING:\n  - Initial (4000ft): 215 KIAS, CONF 1.\n  - Final App (2500ft): 180 KIAS, Gear DOWN, CONF 2.\n  - Landing: Vref 145-150 KIAS (CONF FULL), Idle at 40ft RA.\n  - Touchdown: Ground Spoilers (Auto), Reverse Thrust (Inner Engines).\n  - Rollout: Autobrake MED/HI, Long landing roll required.',
                failures: 'ENGINE FAILURE (Quad Engine):\n  Loss of 1 engine: minimal impact\n  3-engine cruise: FL280-FL330\n  Loss of 2 engines (same side): significant asymmetric thrust\n  ECAM guides all failure management'
            },
            'F-16 Fighting Falcon': {
                procedures: 'TAKEOFF:\n  - Roll: MIL Power or MAX A/B, AUTO Flaps.\n  - Vr: 155 KIAS (rotate to 10° pitch).\n  - Initial Climb: Gear UP immediately, 350 KIAS.\n\nAPPROACH & LANDING:\n  - Initial: 250 KIAS, Gear DOWN, Speedbrakes as needed.\n  - Final: 160 KIAS (13° AoA / E-bracket), Flaps AUTO.\n  - Flare: 10ft, Throttle IDLE, maintain 12° nose high.\n  - Rollout: Aero-braking (nose high) until 100 KIAS, then Brakes.',
                failures: 'SINGLE ENGINE FIGHTER:\n  Engine failure = glide. Best glide: ~200 KIAS\n  Ejection seat available [E] (Realism Pack)\n  After ejection, use spoilers key to descend faster'
            },
            'F-22 Raptor': {
                procedures: 'TAKEOFF:\n  - Roll: MIL or Afterburner, AUTO Flaps.\n  - Vr: 150 KIAS.\n  - Initial Climb: Gear UP, high α climb if tactical.\n\nAPPROACH & LANDING:\n  - Initial: 200 KIAS, Gear DOWN, Spoilers for energy mgmt.\n  - Final: 155 KIAS, Thrust Vectoring active.\n  - Flare: 10ft, Throttle IDLE, Aerobraking.\n  - Rollout: Heavy Brakes, maintain directional stability.',
                failures: 'DUAL ENGINE FIGHTER:\n  Single-engine capable, limited performance\n  Glide ratio is very poor (stealth config)\n  Ejection seat: [E] (Realism Pack)'
            }
        };

        const { wrapper, content: topContent } = nexusDropdown('✦ Aircraft');

        // Procedures sub-section
        const procHeader = document.createElement('div');
        procHeader.className = 'nexus-category';
        const procChevron = document.createElement('span');
        procChevron.className = 'nexus-chevron';
        procChevron.textContent = '▶';
        procHeader.appendChild(procChevron);
        procHeader.appendChild(document.createTextNode(' PROCEDURES'));
        const procContent = document.createElement('div');
        procContent.className = 'nexus-content';
        procHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            procContent.classList.toggle('open');
            procChevron.classList.toggle('open');
        });
        topContent.appendChild(procHeader);
        topContent.appendChild(procContent);

        // Failures sub-section
        const failHeader = document.createElement('div');
        failHeader.className = 'nexus-category';
        const failChevron = document.createElement('span');
        failChevron.className = 'nexus-chevron';
        failChevron.textContent = '▶';
        failHeader.appendChild(failChevron);
        failHeader.appendChild(document.createTextNode(' FAILURES'));
        const failContent = document.createElement('div');
        failContent.className = 'nexus-content';
        failHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            failContent.classList.toggle('open');
            failChevron.classList.toggle('open');
        });
        topContent.appendChild(failHeader);
        topContent.appendChild(failContent);

        Object.entries(aircraftData).forEach(([name, data]) => {
            procContent.appendChild(nexusSubItem(name, data.procedures));
            failContent.appendChild(nexusSubItem(name, data.failures));
        });

        panel.appendChild(wrapper);
    }

    // Build all menu sections in order
    createAddonManager();
    createInstructions();
    createFailures();
    createAircraftMenus();
};

// =============================================================================
// SECTION 4: ADDON EXECUTION
// Each function loads one addon. Scripts hosted externally are injected via a
// dynamically created <script> tag pointing to raw.githack.com (which serves
// GitHub files with the correct Content-Type header for browser JS execution).
// Addons are grouped below by category for readability.
// =============================================================================

function addonExecution () {

    // -------------------------------------------------------------------------
    // ATC & COMMUNICATIONS
    // -------------------------------------------------------------------------

    jobs();

    // AI ATC — PuterJS GPT-powered ATC with voice and text input
    function ai () {
        (function() {
            'use strict';

            const head = document.querySelector('head');
            if (head) {
                const puterJS = document.createElement('script');
                puterJS.src = 'https://js.puter.com/v2/';
                head.appendChild(puterJS);

                const growlJS = document.createElement('script');
                growlJS.src = 'https://cdn.jsdelivr.net/gh/avramovic/geofs-ai-atc@master/vanilla-notify.min.js';
                head.appendChild(growlJS);

                const growlCSS = document.createElement('link');
                growlCSS.href = 'https://cdn.jsdelivr.net/gh/avramovic/geofs-ai-atc@master/vanilla-notify.css';
                growlCSS.rel = 'stylesheet';
                head.appendChild(growlCSS);
            }

            let airports;
            GM.getResourceText("airports").then((data) => {
                airports = JSON.parse(data);
            });

            let radiostatic;
            GM.getResourceText("radiostatic").then((data) => {
                radiostatic = new Audio('data:audio/mp3;'+data);
                radiostatic.loop = false;
            });

            let tunedInAtc;
            let controllers = {};
            let context = {};
            let oldNearest = null;

            const observer = new MutationObserver(() => {
                const menuList = document.querySelector('div.geofs-ui-bottom');

                if (menuList && !menuList.querySelector('.geofs-atc-icon')) {
                    const micIcon = document.createElement('i');
                    micIcon.className = 'material-icons';
                    micIcon.innerText = 'headset_mic';

                    const knobIcon = document.createElement('i');
                    knobIcon.className = 'material-icons';
                    knobIcon.innerText = 'radio';

                    const tuneInButton = document.createElement('button');
                    tuneInButton.className = 'mdl-button mdl-js-button mdl-button--icon geofs-f-standard-ui geofs-tunein-icon';
                    tuneInButton.title = "Click to set ATC frequency.";

                    tuneInButton.addEventListener('click', (e) => {
                        let nearestAp = findNearestAirport();
                        let apCode = prompt('Enter airport ICAO code', nearestAp.code);
                        if (apCode == null || apCode === '') {
                            error('You cancelled the dialog.')
                        } else {
                            apCode = apCode.toUpperCase();
                            if (typeof unsafeWindow.geofs.mainAirportList[apCode] === 'undefined') {
                                error('Airport with code '+ apCode + ' can not be found!');
                            } else {
                                tunedInAtc = apCode;
                                initController(apCode);
                                info('Your radio is now tuned to '+apCode+' frequency. You will now talk to them.');
                            }
                        }
                    });

                    const atcButton = document.createElement('button');
                    atcButton.className = 'mdl-button mdl-js-button mdl-button--icon geofs-f-standard-ui geofs-atc-icon';
                    atcButton.title = "Click to talk to the ATC. Ctrl+click (Cmd+click on Mac) to input text instead of talking. Right click to toggle PTT text and voice.";

                    const toggleContainer = document.createElement('div')
                    toggleContainer.style.width = "200px"
                    toggleContainer.style.position = "fixed"
                    //toggleContainer.style.right = "700px" //temporary positioning. needs to stay above the atc button
                    toggleContainer.style.bottom = "40px"
                    toggleContainer.style.background = "linear-gradient(135deg, rgba(15,25,45,0.95), rgba(25,45,75,0.9))"
                    toggleContainer.style.color = "#e0e6ed"
                    toggleContainer.style.border = "1px solid rgba(100,200,255,0.2)"
                    toggleContainer.style.backdropFilter = "blur(10px)"
                    toggleContainer.style.justifyContent = "space-between"; // spread items evenly
                    toggleContainer.style.display = "none"
                    toggleContainer.style.padding = "10px 10px";            // add side padding
                    toggleContainer.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
                    toggleContainer.style.borderRadius = "8px";
                    toggleContainer.style.fontFamily = "sans-serif";
                    toggleContainer.style.fontSize = "14px";
                    toggleContainer.style.zIndex = "9999"
                    document.body.appendChild(toggleContainer);
                    
                    //create 2 divs to act as text boxes here 
                    const textContainer = document.createElement('div')
                    textContainer.innerText = "Transmit Text"

                    const voiceContainer = document.createElement('div')
                    voiceContainer.innerText = "Transmit Voice"

                    //create container to hold text boxes
                    const labelContainer = document.createElement('div')
                    labelContainer.style.display = "flex"
                    labelContainer.style.justifyContent = "space-between"
                    labelContainer.style.marginTop = "5px"

                    //create title container
                    const titleContainer = document.createElement('div')
                    titleContainer.style.display = "flex"
                    titleContainer.style.justifyContent = "space-between"
                    titleContainer.style.marginBottom = "5px"
                    titleContainer.innerText = "AI ATC PTT key function"
                    titleContainer.style.fontWeight = "bold";

                    const toggle = document.createElement("div");
                    toggle.style.width = "60px";
                    toggle.style.height = "30px";
                    toggle.style.borderRadius = "10%";
                    toggle.style.background = "#ccc";
                    toggle.style.position = "relative";
                    toggle.style.margin = "0 auto"
            
                    toggle.style.cursor = "pointer";

                    const knob = document.createElement("div");
                    knob.style.width = "26px";
                    knob.style.height = "26px";
                    knob.style.borderRadius = "10%";
                    knob.style.background = "#000000ff";
                    knob.style.position = "absolute";
                    knob.style.top = "2px";
                    knob.style.left = "2px";
                    knob.style.transition = "0.3s";

                    toggle.appendChild(knob);

                    labelContainer.appendChild(voiceContainer);
                    labelContainer.appendChild(textContainer);

            
                    toggleContainer.appendChild(titleContainer)
                    toggleContainer.appendChild(toggle);
                    toggleContainer.appendChild(labelContainer)

                    let pushToTalk = false;
                    toggle.addEventListener("click", () => {
                        pushToTalk = !pushToTalk;
                        knob.style.left = pushToTalk ? "32px" : "2px";
                    });

                    

                    function handleBtnClick (e) {
                        if (typeof tunedInAtc === 'undefined') {
                            error("No frequency set. Click the radio icon to set the frequency!");
                        } else if (e.ctrlKey || e.metaKey || pushToTalk === true && dpress === true) { //add if/else handler for pushToTalk here
                            let pilotMsg = prompt("Please enter your message to the ATC:");
                            if (pilotMsg != null && pilotMsg != "") {
                                callAtc(pilotMsg);
                            } else {
                                error("You cancelled the dialog");
                            }
                            dpress = false;
                        } else {
                            navigator.mediaDevices.getUserMedia({ audio: true });
                            let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                            let recognition = new SpeechRecognition();
                            recognition.continuous = false;
                            recognition.lang = 'en-US';
                            recognition.interimResults = false;
                            recognition.maxAlternatives = 1;
                            recognition.start();
                            recognition.onresult = (event) => {
                                let pilotMsg = event.results[event.results.length - 1][0].transcript;
                                if (pilotMsg != null && pilotMsg != "") {
                                    callAtc(pilotMsg);
                                } else {
                                    error("No speech recognized. Speak up?");
                                }
                                recognition.stop();
                            };
                            recognition.onerror = (event) => {
                                error('Speech recognition error: ' + event.error);
                            };
                            dpress = false;
                        }
                    }; //end of handle click function

                    function handleRightClick () {
                        
                        // get button's position
                        const rect = atcButton.getBoundingClientRect();

                        // position container above the button
                        toggleContainer.style.position = "absolute";
                        toggleContainer.style.left = (rect.left - 100) + "px";

                        toggleContainer.style.display = 
                            toggleContainer.style.display === "none"? "block": "none"
                    };

                    atcButton.addEventListener('click', handleBtnClick);
                    atcButton.addEventListener("contextmenu", (e) => {
                        e.preventDefault(); // stops the default browser menu
                        //console.log("Right click detected on button");
                        handleRightClick();
                    });

                    //hide container when a click is detected outside it
                    document.addEventListener('click', (e) => {
                        if (!toggleContainer.contains(e.target)) {
                            toggleContainer.style.display = "none"
                        }
                    });

                    // Also trigger on "d" press
                    let dpress = false;
                    document.addEventListener('keydown', (e) => {
                        if (e.key.toLowerCase() === 'd' && !window.flight.recorder.playing) {
                            dpress = true;
                            handleBtnClick(e); // same behavior as clicking
                        }
                    });

                    atcButton.appendChild(micIcon);
                    tuneInButton.appendChild(knobIcon);

                    menuList.appendChild(tuneInButton);
                    menuList.appendChild(atcButton);
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});

            function haversine(lat1, lon1, lat2, lon2) {
                const R = 6371; // Radius of the Earth in kilometers
                const toRad = (deg) => deg * (Math.PI / 180);

                const dLat = toRad(lat2 - lat1);
                const dLon = toRad(lon2 - lon1);

                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return (R * c) / 1.852; // Distance in nautical miles
            }

            function findNearestAirport() {
                let nearestAirport = null;
                let minDistance = Infinity;

                for (let apCode in unsafeWindow.geofs.mainAirportList) {
                    let distance = findAirportDistance(apCode);

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestAirport = {
                            code: apCode,
                            distance: distance
                        };
                    }
                }

                return nearestAirport;
            }

            function findAirportDistance(code) {
                let aircraftPosition = {
                    lat: unsafeWindow.geofs.aircraft.instance.lastLlaLocation[0],
                    lon: unsafeWindow.geofs.aircraft.instance.lastLlaLocation[1],
                };
                let ap = unsafeWindow.geofs.mainAirportList[code];
                let airportPosition = {
                    lat: ap[0],
                    lon: ap[1]
                };

                return haversine(
                aircraftPosition.lat,
                aircraftPosition.lon,
                airportPosition.lat,
                airportPosition.lon
                );
            }

            function calculateBearing(lat1, lon1, lat2, lon2) {
                const toRadians = (deg) => deg * (Math.PI / 180);
                const toDegrees = (rad) => rad * (180 / Math.PI);

                const dLon = toRadians(lon2 - lon1);
                const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
                const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
                Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
                const bearing = toDegrees(Math.atan2(y, x));

                // Normalize to 0-360 degrees
                return (bearing + 360) % 360;
            }

            function getRelativeDirection(airportLat, airportLon, airplaneLat, airplaneLon) {
                // Calculate the bearing from the airport to the airplane
                const bearing = calculateBearing(airportLat, airportLon, airplaneLat, airplaneLon);

                // Determine the direction based on the bearing
                if (bearing >= 337.5 || bearing < 22.5) {
                    return "north";
                } else if (bearing >= 22.5 && bearing < 67.5) {
                    return "northeast";
                } else if (bearing >= 67.5 && bearing < 112.5) {
                    return "east";
                } else if (bearing >= 112.5 && bearing < 157.5) {
                    return "southeast";
                } else if (bearing >= 157.5 && bearing < 202.5) {
                    return "south";
                } else if (bearing >= 202.5 && bearing < 247.5) {
                    return "southwest";
                } else if (bearing >= 247.5 && bearing < 292.5) {
                    return "west";
                } else if (bearing >= 292.5 && bearing < 337.5) {
                    return "northwest";
                }
            }

            function initController(apCode) {
                controllers[apCode] = controllers[apCode] || null;

                if (controllers[apCode] == null) {
                    let date = new Date().toISOString().split('T')[0];
                    fetch('https://randomuser.me/api/?gender=male&nat=au,br,ca,ch,de,us,dk,fr,gb,in,mx,nl,no,nz,rs,tr,ua,us&seed='+apCode+'-'+date)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('HTTP error! status: '+response.status);
                        }
                        return response.text();
                    }).then(resourceText => {
                        let json = JSON.parse(resourceText)
                        controllers[apCode] = json.results[0];
                    });
                }
            }

            function error(msg) {
                vNotify.error({text:msg, title:'Error', visibleDuration: 10000});
            }

            function info(msg, title) {
                title = title || 'Information';
                vNotify.info({text:msg, title:title, visibleDuration: 10000});
            }

            function atcSpeak(text) {
                let synth = window.speechSynthesis;
                let voices = synth.getVoices();
                let toSpeak = new SpeechSynthesisUtterance(text);
                toSpeak.voice = voices[0];
                synth.speak(toSpeak);
            }

            function atcGrowl(text, airport_code) {
                vNotify.warning({text: text, title: airport_code+' ATC', visibleDuration: 20000});
            }

            function atcMessage(text, airport_code) {
                atcGrowl(text, airport_code);
                atcSpeak(text);
            }

            function pilotMessage(text) {
                let user = unsafeWindow.geofs.userRecord;
                let airplane = unsafeWindow.geofs.aircraft.instance.aircraftRecord;

                let callsign = "Foo";
                if (user.id != 0) {
                    callsign = user.callsign;
                }

                vNotify.success({text: text, title: airplane.name+': '+callsign, visibleDuration: 10000});
            }

            function isOnGround() {
                return unsafeWindow.geofs.animation.values.groundContact === 1;
            }

            function seaAltitude() {
                return unsafeWindow.geofs.animation.values.altitude;
            }

            function groundAltitude() {
                return Math.max(seaAltitude() - unsafeWindow.geofs.animation.values.groundElevationFeet - 50, 0);
            }

            function getPilotInfo(today) {
                let user = unsafeWindow.geofs.userRecord;

                let pilot = {
                    callsign: 'Foo',
                    name: 'not known',
                    licensed_at: today
                };

                if (user.id != 0) {
                    pilot = {
                        callsign: user.callsign,
                        name: user.firstname + ' ' + user.lastname,
                        licensed_at: user.created
                    };
                }

                return pilot;
            }

            // generate controller for the nearest airport for today
            setInterval(function() {
                let airport = findNearestAirport();
                if (!airport || !airports) return;
                let airportMeta = airports[airport.code];

                if (oldNearest !== airport.code) {
                    let apName = airportMeta ? airportMeta.name+' ('+airport.code+')' : airport.code;
                    info('You are now in range of '+apName+'. Set your radio frequency to <b>'+airport.code+'</b> to tune in with them');
                    oldNearest = airport.code;
                    initController(airport.code);
                }
            }, 500);

            function callAtc(pilotMsg) {
                let airport = {
                    distance: findAirportDistance(tunedInAtc),
                    code: tunedInAtc,
                };

                let date = new Date().toISOString().split('T')[0];
                let time = unsafeWindow.geofs.animation.values.hours + ':' + unsafeWindow.geofs.animation.values.minutes;
                let airportMeta = airports[airport.code];
                let controller = controllers[airport.code];
                let apName = airportMeta ? airportMeta.name + ' (' + airport.code + ')' : airport.code;
                let pilot = getPilotInfo(date);

                if (typeof controller === 'undefined') {
                    radiostatic.play();
                    info('Airport '+apName+' seems to be closed right now. Try again later...');
                    initController(airport.code);
                    return;
                }

                if (airport.distance > 50) {
                    radiostatic.play();
                    error('Frequency '+airport.code+' is out of range. You need to be at least 50 nautical miles away from the airport to contact it.');
                    return;
                }

                let airportPosition = {
                    lat: unsafeWindow.geofs.mainAirportList[airport.code][0],
                    lon: unsafeWindow.geofs.mainAirportList[airport.code][1],
                };

                if (typeof context[airport.code] === "undefined") {
                    let season = unsafeWindow.geofs.animation.values.season;
                    let daynight = unsafeWindow.geofs.animation.values.night ? 'night' : 'day';
                    if (unsafeWindow.geofs.isSnow || unsafeWindow.geofs.isSnowy) {
                        daynight = 'snowy '+daynight;
                    }

                    let intro = 'You are '+controller.name.first+' '+controller.name.last+', a '+controller.dob.age+' years old '+controller.gender+' ATC controller on the '+apName+' for today. ' +
                        'Your airport location is (lat: '+airportPosition.lat+', lon: '+airportPosition.lon+'). You are talking to pilot whose name is '+pilot.name+' callsign ('+pilot.callsign+') and they\'ve been piloting since '+pilot.licensed_at+'. ' +
                        'You will be acting as ground, tower (if the plane is below or at 5000 ft) or approach or departure (if above 5000 ft), depending on whether the plane is on the ground, their distance from the airport, heading and previous context. ' +
                        'If the aircraft is in the air, keep your communication short and concise, as a real ATC. If they\'re on the ground, your replies should still be short (1-2 sentence per reply), but you can ' +
                        'use a more relaxed communication like making jokes, discussing weather, other traffic etc. If asked why so slow on replies, say you\'re busy, like the real ATC. '+
                        'Today is '+date+', time is '+time+', a beautiful '+season+' '+daynight;

                    context[airport.code] = [];
                    context[airport.code].push({content: intro, role: 'system'});
                }

                // provide current update
                let airplane = unsafeWindow.geofs.aircraft.instance.aircraftRecord;
                let aircraftPosition = {
                    lat: unsafeWindow.geofs.aircraft.instance.lastLlaLocation[0],
                    lon: unsafeWindow.geofs.aircraft.instance.lastLlaLocation[1],
                };

                let onGround = isOnGround() ? 'on the ground' : 'in the air';
                let distance;

                if (airport.distance > 1) {
                    let relativeDirection = getRelativeDirection(airportPosition.lat, airportPosition.lon, aircraftPosition.lat, aircraftPosition.lon);
                    distance = airport.distance+' nautical miles '+relativeDirection+' from the airport';
                } else if (isOnGround()) {
                    distance = 'at the airport';
                } else {
                    distance = 'above the airport';
                }

                let movingSpeed;
                if (isOnGround()) {
                    if (unsafeWindow.geofs.animation.values.kias > 1) {
                        movingSpeed = 'moving at '+unsafeWindow.geofs.animation.values.kias+' kts'
                    } else {
                        movingSpeed = 'stationary';
                    }
                } else {
                    movingSpeed = 'flying at '+unsafeWindow.geofs.animation.values.kias+' kts, heading '+unsafeWindow.geofs.animation.values.heading360;
                }

                let address = pilot.callsign+', '+airport.code;
                if (isOnGround()) {
                    address += ' Ground';
                } else if (seaAltitude() <= 5000) {
                    address += ' Tower';
                } else {
                    address += ' Area Control';
                }

                if (airplane.name.toLowerCase().includes('cessna') || airplane.name.toLowerCase().includes('piper')) {
                    address = airplane.name + ' ' + address;
                }

                let relativeWindDirection = unsafeWindow.geofs.animation.values.relativeWind;
                let windDirection = (unsafeWindow.geofs.animation.values.heading360 + relativeWindDirection + 360) % 360;
                let wind = unsafeWindow.geofs.animation.values.windSpeedLabel + ', direction '+ windDirection + ' degrees (or '+relativeWindDirection+' degrees relative to the heading of the aircraft)';

                let currentUpdate = 'Date and time: '+date+' '+time+'. '+
                    'The pilot is flying '+airplane.name+' and their position is '+onGround+' '+distance+'. The altitude of the aircraft is '+seaAltitude()+' feet above the sea level ('+groundAltitude()+' feet above ground). ' +
                    'The plane is '+movingSpeed+'. Wind speed is '+wind+'. Air temperature is '+unsafeWindow.geofs.animation.values.airTemp+' degrees celsius. '+
                    'You should address them with "'+address+'", followed by the message.';

                // remove old currentUpdate, leaving only the last one
                if (context[airport.code].length >= 4) {
                    context[airport.code].splice(-3, 1);
                }

                context[airport.code].push({content: currentUpdate, role: 'system'});
                context[airport.code].push({content: pilotMsg, role: 'user'});

                pilotMessage(pilotMsg);

                puter.ai.chat(context[airport.code]).then(function(resp) {
                    context[airport.code].push(resp.message);
                    atcMessage(resp.message.content, airport.code);
                });
            }

        })();
    };

    // -------------------------------------------------------------------------
    // FLIGHT SYSTEMS & AUTOMATION
    // -------------------------------------------------------------------------

    // Ad Remover — removes banner ads on the GeoFS page
    function adblock () {
        (() => {var adblockScript = document.createElement('script'); adblockScript.src="https://raw.githack.com/RadioactivePotato/GeoFS-Ad-Remover/main/GeoFS%20Ad%20Remover-0.1.user.js";document.body.appendChild(adblockScript);})()
    };

    // Autoland++ — joystick-supported autoland with spoiler/reverse thrust automation
    function autoland () {
        (() => {var autolandScript = document.createElement('script'); autolandScript.src="https://raw.githack.com/geofs-pilot/Joystick-supported-autoland/refs/heads/main/script.js";document.body.appendChild(autolandScript);})()
    };

    // Autothrottle — speed management keybind [Shift + ~] to toggle on/off
    function athrottle () {
        (() => {var athrScript = document.createElement('script'); athrScript.src="https://raw.githack.com/meatbroc/geofs-autothrottle/main/userscript.js";document.body.appendChild(athrScript);})()
        document.addEventListener('keydown', (e) => {
            if (e.key === "~" && e.shiftKey) {
                // Compatibility check: Ensure geofs and autothrottle system are present
                if (window.geofs && window.geofs.autothrottle) {
                    if (window.geofs.autothrottle.on) {
                        $(document).trigger("autothrottleOff");
                    } else {
                        $(document).trigger("autothrottleOn");
                    }
                }
            }
        });

    };

    // Camera Cycling — cycles camera angles every 30s. Toggle with [W]
    function camera () {
        !function(){"use strict";let e=[],t=0,a=null,n=null;function c(){cycling=!1,a&&clearInterval(a)}globalThis.cycling=!1,!function r(){let i=setInterval(()=>{geofs?.camera?.modes&&geofs?.aircraft?.instance&&(clearInterval(i),n=geofs.aircraft.instance.id,setInterval(()=>{if(geofs.aircraft&&geofs.aircraft.instance){let e=geofs.aircraft.instance.id;e!==n&&(n=e,console.log("Stopped cycling due to aircraft change"),c())}},1e3),document.addEventListener("keydown",function(n){"w"!==n.key.toLowerCase()||n.ctrlKey||n.altKey||n.metaKey||((cycling=!cycling)?(console.log("Camera cycling started."),!geofs.camera||!geofs.camera.modes||(a&&clearInterval(a),function a(){let n=[2,3,4,5];e=geofs.camera.modes.map((e,t)=>t).filter(e=>!n.includes(e));for(let c=e.length-1;c>0;c--){let r=Math.floor(Math.random()*(c+1));[e[c],e[r]]=[e[r],e[c]]}t=0}(),a=setInterval(()=>{!geofs.pause&&cycling&&e.length>0&&(geofs.camera.set(e[t]),console.log("Switched to camera:",e[t]),t=(t+1)%e.length)},3e4))):(c(),console.log("Camera cycling stopped.")))}),console.log("Script running. Press 'W' to toggle."))},500)}()}();    
    };

    // Chat Fix — restores the [T] keybind for opening the in-game chat window
    function chatFix() {
        (() => {var fixScript = document.createElement('script'); fixScript.src="https://raw.githack.com/ZetaPossibly/GeoFS-Chat-Fix/refs/heads/main/fix_chat.js";document.body.appendChild(fixScript);})()
    }

    // Cockpit Volume — lowers engine audio when in interior camera views
    function volume () {
        (() => {var volumeScript = document.createElement('script'); volumeScript.src="https://raw.githack.com/geofs-pilot/geofs-cockpit-volume/main/userscript.js";document.body.appendChild(volumeScript);})()
    };

    // Extra Vehicles — loads additional community-made aircraft (by JXT)
    // Note: delayed until the livery selector button appears in the DOM
    function vehicles () {
        (() => {var vehicleScript = document.createElement('script'); vehicleScript.src="https://raw.githack.com/af267/GeoFS-Extra-Vehicles/main/main.js";document.body.appendChild(vehicleScript);})()
        class Failure{constructor(){this.aId=window.geofs.aircraft.instance.id,this.enabled=!1,this.failures=[],this.mcasTime=0,this.fails={landingGear:{front:!1,left:!1,right:!1},fuelLeak:!1,flightCtrl:{ailerons:!1,elevators:!1,rudder:!1},electrical:!1,structural:!1,hydraulic:{flaps:!1,brakes:!1,spoilers:!1},pitotStatic:!1,pressurization:!1,engines:[],mcas:!1};if(window.geofs.aircraft.instance.engines){for(var e=0;e<window.geofs.aircraft.instance.engines.length;e++)this.fails.engines.push(!1)}this.chances={landingGear:{front:0,left:0,right:0},fuelLeak:0,flightCtrl:{ailerons:0,elevators:0,rudder:0},electrical:0,structural:0,hydraulic:{flaps:0,brakes:0,spoilers:0},pitotStatic:0,pressurization:0,engines:[],mcas:0};if(window.geofs.aircraft.instance.engines){for(var t=0;t<window.geofs.aircraft.instance.engines.length;t++)this.chances.engines.push(0)}}fail(e){for(var t=(window.geofs.aircraft.instance.engines?window.geofs.aircraft.instance.engines.length:0),i=0;i<t;i++)e=="engine"+i&&(alert("Engine "+(i+1)+" failed!"),window.geofs.aircraft.instance.engines[i].thrust=0,new window.geofs.fx.ParticleEmitter({off:0,anchor:window.geofs.aircraft.instance.engines[0].points.contrailAnchor||{worldPosition:window.geofs.aircraft.instance.engines[0].object3d.worldPosition},duration:1e10,rate:.03,life:1e4,easing:"easeOutQuart",startScale:.01,endScale:.2,randomizeStartScale:.01,randomizeEndScale:.15,startOpacity:1,endOpacity:.2,startRotation:"random",texture:"whitesmoke"}),setInterval(()=>{window.geofs.fx.setParticlesColor(new window.Cesium.Color(.1,.1,.1,1))},20));if(!e.includes("engine"))switch(e){case"fuelLeak":this.fails.fuelLeak||(alert("Fuel leak! About 2 minutes of fuel remaining at 50% throttle"),this.fails.fuelLeak=!0,globalThis.leakingFuel=!0);break;case"gearFront":if(!this.fails.landingGear.front){alert("Nose gear failure"),this.fails.landingGear.front=!0;var a=2;for(i=0;i<window.geofs.aircraft.instance.suspensions.length;i++)(window.geofs.aircraft.instance.suspensions[i].name.includes("front")||window.geofs.aircraft.instance.suspensions[i].name.includes("nose")||window.geofs.aircraft.instance.suspensions[i].name.includes("tail"))&&(a=i);this.failures.push(setInterval(()=>{window.geofs.aircraft.instance.suspensions[a].collisionPoints[0][2]=30},1e3))}break;case"gearLeft":if(!this.fails.landingGear.left){alert("Left gear failure"),this.fails.landingGear.left=!0;var n=0;for(i=0;i<window.geofs.aircraft.instance.suspensions.length;i++)(window.geofs.aircraft.instance.suspensions[i].name.includes("left")||window.geofs.aircraft.instance.suspensions[i].name.includes("l"))&&(n=i);this.failures.push(setInterval(()=>{window.geofs.aircraft.instance.suspensions[n].collisionPoints[0][2]=30},1e3))}break;case"gearRight":if(alert("Right gear failure"),!this.fails.landingGear.right){this.fails.landingGear.right=!0;var l=1;for(i=0;i<window.geofs.aircraft.instance.suspensions.length;i++)(window.geofs.aircraft.instance.suspensions[i].name.includes("right")||window.geofs.aircraft.instance.suspensions[i].name.includes("r_g"))&&(l=i);this.failures.push(setInterval(()=>{window.geofs.aircraft.instance.suspensions[l].collisionPoints[0][2]=30},1e3))}break;case"ailerons":alert("Flight control failure (ailerons)"),this.fails.flightCtrl.ailerons||(this.fails.flightCtrl.ailerons=!0,this.failures.push(setInterval(()=>{for(var e in window.geofs.aircraft.instance.airfoils)window.geofs.aircraft.instance.airfoils[e].name.toLowerCase().includes("aileron")&&(window.geofs.aircraft.instance.airfoils[e].object3d._scale=[0,0,0])},1e3)));break;case"elevators":alert("Flight control failure (elevators)"),this.fails.flightCtrl.elevators||(this.fails.flightCtrl.elevators=!0,this.failures.push(setInterval(()=>{for(var e in window.geofs.aircraft.instance.airfoils)window.geofs.aircraft.instance.airfoils[e].name.toLowerCase().includes("elevator")&&(window.geofs.aircraft.instance.airfoils[e].object3d._scale=[0,0,0])},1e3)));break;case"rudder":alert("Flight control failure (rudder)"),this.fails.flightCtrl.rudder||(this.fails.flightCtrl.rudder=!0,this.failures.push(setInterval(()=>{for(var e in window.geofs.aircraft.instance.airfoils)window.geofs.aircraft.instance.airfoils[e].name.toLowerCase().includes("rudder")&&(window.geofs.aircraft.instance.airfoils[e].object3d._scale=[0,0,0])},1e3)));break;case"electrical":this.fails.electrical||(alert("Electrical failure"),this.fails.electrical=!0,this.failures.push(setInterval(()=>{for(var e=1;e<=5;e++)window.geofs.aircraft.instance.cockpitSetup.parts[e].object3d._scale=[0,0,0];window.geofs.autopilot.turnOff(),window.instruments.hide()},1e3)));break;case"structural":this.fails.structural||(alert("Significant structural damage detected"),console.log("Boeing, am I right?"),this.fails.structural=!0,this.failures.push(setInterval(()=>{window.weather.definition.turbulences=3},1e3)));break;case"flaps":this.fails.hydraulic.flaps||(alert("Hydraulic failure (flaps)"),this.fails.hydraulic.flaps=!0,this.failures.push(setInterval(()=>{window.controls.flaps.target=Math.floor(.6822525475345469*(2*window.geofs.animation.values.flapsSteps)),window.controls.flaps.delta=20},1e3)));break;case"brakes":this.fails.hydraulic.brakes||(alert("Hydraulic failure (brakes)"),this.fails.hydraulic.brakes=!0,this.failures.push(setInterval(()=>{window.controls.brakes=0},500)));break;case"spoilers":this.fails.hydraulic.spoilers||(alert("Hydraulic failure (spoilers)"),this.fails.hydraulic.spoilers=!0,this.failures.push(setInterval(()=>{window.controls.airbrakes.target=.2,window.controls.airbrakes.delta=20},1e3)));break;case"pressurization":this.fails.pressurization||(alert("Cabin depressurization! Get at or below 9,000 ft MSL!"),this.fails.pressurization=!0,this.failures.push(setInterval(()=>{window.geofs.animation.values.altitude>9e3?window.weather.definition.turbulences=(window.geofs.animation.values.altitude-9e3)/5200:window.weather.definition.turbulences=0}),1e3));break;case"mcas":this.fails.mcas||(this.fails.mcas=!0,this.mcasTime=Date.now(),this.mcasRandT=Math.floor(1e4*Math.random()),this.mcasActive=!0,window.controls.elevatorTrimMin=-10,this.failures.push(setInterval(()=>{!window.geofs.autopilot.on&&0==window.controls.flaps.position&&this.fails.mcas&&(this.mcasActive&&Date.now()<=this.mcasTime+this.mcasRandT?window.controls.elevatorTrim>window.controls.elevatorTrimMin&&(window.controls.elevatorTrim-=window.controls.elevatorTrimStep/10):this.mcasActive?(this.mcasActive=!1,this.mcasTime+=this.mcasRandT,this.mcasRandT=Math.floor(1e4*Math.random())):!this.mcasActive&&Date.now()>=this.mcasTime+5e3&&(this.mcasActive=!0,this.mcasTime+=5e3,window.controls.elevatorTrim>window.controls.elevatorTrimMin&&(window.controls.elevatorTrim-=window.controls.elevatorTrimStep/10)))},40)))}}tick(){if(this.enabled&&window.flight&&window.flight.recorder&&!window.flight.recorder.playing&&!window.geofs.pause){for(var e in console.log("tick"),this.chances.landingGear)Math.random()<this.chances.landingGear[e]&&this.fail("gear"+(e[0].toUpperCase()+e.substr(1,e.length)));for(var t in this.chances)if("number"==typeof this.chances[t])Math.random()<this.chances[t]&&this.fail(t);else if("landingGear"!==t)for(var i in this.chances[t])Math.random()<this.chances[t][i]&&this.fail(t==="engines"?"engine"+i:i);if(this.enabled)setTimeout(()=>{this.tick()},6e4)}}reset(){for(var e in this.failures)clearInterval(this.failures[e]);this.enabled=!1}}function waitForEntities(){try{if(!1==window.geofs.cautiousWithTerrain){window.mainFailureFunction();return}}catch(e){console.log("Error in waitForEntities:",e)}setTimeout(()=>{waitForEntities()},1e3)}function runFuelSystem(){var e,t;function i(){let e=document.createElement("div");e.style.position="absolute",e.style.bottom="8px",e.style.right="108px",e.style.width="75px",e.style.height="17px",e.style.border="1px solid black",e.style.borderRadius="5px",e.style.backgroundColor="black",e.style.zIndex="1000";let t=document.createElement("div");return t.style.height="100%",t.style.width="100%",t.style.backgroundColor="green",t.style.borderRadius="5px",e.appendChild(t),document.querySelector(".geofs-ui-bottom").appendChild(e),{fuelBar:t,fuelBarContainer:e}}let a=null,n;setInterval(()=>{0===r.fuel&&(controls.throttle=0,window.geofs.aircraft.instance.stopEngine())},10);let l,s,r=(s=(l=window.geofs.aircraft.instance.definition.mass)<15e3?.25:.75,globalThis.initialFuel=l*s,{fuel:initialFuel,initialFuel}),u=function e(t){let i=document.createElement("button");return i.textContent="Refuel",i.style.position="absolute",i.style.bottom="5px",i.style.right="108px",i.style.padding="4px 8px",i.style.fontSize="14px",i.style.backgroundColor="yellow",i.style.border="1px solid black",i.style.borderRadius="5px",i.style.zIndex="1000",document.querySelector(".geofs-ui-bottom").appendChild(i),i.addEventListener("click",()=>{t.fuel=t.initialFuel,console.log("Plane refueled.")}),i}(r);e=r,n=setInterval(()=>{if(window.geofs.pause||(window.flight && window.flight.recorder && window.flight.recorder.playing)||document.hidden)return;let t=(window.geofs.aircraft.instance.engines?window.geofs.aircraft.instance.engines.reduce((e,t)=>e+(t.thrust||0),0):0),i=window.geofs.aircraft.instance.engines && window.geofs.aircraft.instance.engines[0]?.afterBurnerThrust!==void 0,n=i&&Math.abs(window.geofs.animation.values.smoothThrottle)>.9,l=i?window.geofs.aircraft.instance.engines.reduce((e,t)=>e+(t.afterBurnerThrust||0),0):0,s=Math.abs(window.geofs.animation.values.smoothThrottle),r=n?l/150:t/150,u=3*r;if(globalThis.leakingFuel){if(null===a){a=e.fuel;let o=a/120*3600;globalThis.fuelLeakRate=Math.max(0,o-(r+.5*(u-r)))}}else globalThis.fuelLeakRate=0,a=null;let d=window.geofs.aircraft.instance.engine.on?r+s*(u-r):0;0==t&&(d=0),fuelBurnRate=d+globalThis.fuelLeakRate,console.log(globalThis.fuelLeakRate),e.fuel-=fuelBurnRate*(1/3600),e.fuel<0&&(e.fuel=0),globalThis.fuelPercentage=e.fuel/e.initialFuel*100,0===e.fuel&&(window.fuelBurnRate=0),console.log(`Fuel Burn Rate per Hour: ${fuelBurnRate.toFixed(6)}`),console.log(`Fuel Burned This Second: ${(fuelBurnRate/3600).toFixed(6)}`),console.log(`Fuel Remaining: ${e.fuel.toFixed(2)}`)},1e3);let o=window.geofs.aircraft.instance.aircraftRecord.id;setInterval(()=>{window.geofs.aircraft.instance.aircraftRecord.id!==o&&(u.remove(),o=window.geofs.aircraft.instance.aircraftRecord.id,clearInterval(n),runFuelSystem())},1e3),setInterval(()=>{let e=window.geofs.aircraft.instance.groundSpeed,t=window.geofs.aircraft.instance.groundContact,i=window.geofs.aircraft.instance.engine.on; (window.flight && window.flight.recorder && window.flight.recorder.playing)?u.style.display="none":u.style.display=e<1&&t&&!i?"block":"none"},100)}window.openFailuresMenu=function(){if(window.failuresMenu){if(window.failuresMenu.hidden=!window.failuresMenu.hidden,window.geofs.aircraft.instance.id!==window.aId)for(window.failure.reset(),window.failure=new Failure,e=`
        <div style="position: fixed; width: 640px; height: 10px; background: lightgray; cursor: move;" id="dragPart"></div>
        <p style="cursor: pointer;right: 0px;position: absolute;background: gray;height: fit-content;" onclick="window.failuresMenu.hidden=true;">X</p>
    <p>Note: Some failures may require a manual refresh of the page.</p>
    <button id="enBtn" onclick="(function(){window.failure.enabled=true; window.failure.tick(); document.getElementById('enBtn').hidden = true;})();">Enable</button>
    <button onclick="window.failure.reset()">RESET ALL</button>
        <h1>Landing Gear</h1>
        <h2>Front</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" value="0" min="0" max="1" step="0.01" id="slide1" onchange="[document.getElementById('input1').value, window.failure.chances.landingGear.gearFront]=[document.getElementById('slide1').value, document.getElementById('slide1').value]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="input1" style="
    width: 40px;
">
    <button onclick="failure.fail('gearFront')">FAIL</button>
        <br>
        <h2>Left</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideGearL" onchange="[document.getElementById('inputGearL').value, window.failure.chances.landingGear.left]=[document.getElementById('slideGearL').valueAsNumber, document.getElementById('slideGearL').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputGearL" style="
    width: 40px;
">


        <button onclick="failure.fail('gearLeft')">FAIL</button>
    <br>
        <h2>Right</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
            <input type="range" min="0" max="1" step="0.01" id="slideGearR" onchange="[document.getElementById('inputGearR').value, window.failure.chances.landingGear.right]=[document.getElementById('slideGearR').valueAsNumber, document.getElementById('slideGearR').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputGearR" style="
    width: 40px;
">
    <button onclick="failure.fail('gearRight')">FAIL</button>
    <br>
        <h1>Fuel Leak</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFuelLeak" onchange="[document.getElementById('inputFuelLeak').value, window.failure.chances.fuelLeak]=[document.getElementById('slideFuelLeak').valueAsNumber, document.getElementById('slideFuelLeak').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputFuelLeak" style="
    width: 40px;
">






        <button onclick="failure.fail('fuelLeak')">FAIL</button>
    <br>
    <h1>Flight Control</h1>
    <h2>Ailerons</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFlightCtrl" onchange="[document.getElementById('inputFlightCtrl').value, window.failure.chances.flightCtrl.ailerons]=[document.getElementById('slideFlightCtrl').valueAsNumber, document.getElementById('slideFlightCtrl').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputFlightCtrl" style="
    width: 40px;
">
        <button onclick="failure.fail('ailerons')">FAIL</button><br>
            <h2>Elevators</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideElevator" onchange="[document.getElementById('inputElevator').value, window.failure.chances.flightCtrl.elevator]=[document.getElementById('slideElevator').valueAsNumber, document.getElementById('slideElevator').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputElevator" style="
    width: 40px;
">
        <button onclick="failure.fail('elevators')">FAIL</button><br>
        <h2>Rudder</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideRudder" onchange="[document.getElementById('inputRudder').value, window.failure.chances.flightCtrl.rudder]=[document.getElementById('slideRudder').valueAsNumber, document.getElementById('slideRudder').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputRudder" style="
    width: 40px;
">
        <button onclick="failure.fail('rudder')">FAIL</button><br>
    <h1>Electrical</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideElectrical" onchange="[document.getElementById('inputElectrical').value, window.failure.chances.electrical]=[document.getElementById('slideElectrical').valueAsNumber, document.getElementById('slideElectrical').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputElectrical" style="
    width: 40px;
">
        <button onclick="failure.fail('electrical')">FAIL</button>


    <br>


    <h1>Structural</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideStructural" onchange="[document.getElementById('inputStructural').value, window.failure.chances.structural]=[document.getElementById('slideStructural').valueAsNumber, document.getElementById('slideStructural').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputStructural" style="
    width: 40px;
">
        <button onclick="failure.fail('structural')">FAIL</button>


    <br>
    <h1>Hydraulic</h1>
<h2>Flaps</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFlaps" onchange="[document.getElementById('inputFlaps').value, window.failure.chances.hydraulic.flaps]=[document.getElementById('slideFlaps').valueAsNumber, document.getElementById('slideFlaps').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputFlaps" style="
    width: 40px;
">
        <button onclick="failure.fail('flaps')">FAIL</button>
<h2>Brakes</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideBrakes" onchange="[document.getElementById('inputBrakes').value, window.failure.chances.hydraulic.brakes]=[document.getElementById('slideBrakes').valueAsNumber, document.getElementById('slideBrakes').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputBrakes" style="
    width: 40px;
">
        <button onclick="failure.fail('brakes')">FAIL</button>
<h2>Spoilers</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideSpoilers" onchange="[document.getElementById('inputSpoilers').value, window.failure.chances.hydraulic.spoilers]=[document.getElementById('slideSpoilers').valueAsNumber, document.getElementById('slideSpoilers').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputSpoilers" style="
    width: 40px;
">
<button onclick="failure.fail('spoilers')">FAIL</button>
    <h1>Cabin Pressurization</h1>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slidePressurization" onchange="[document.getElementById('inputPressurization').value, window.failure.chances.pressurization]=[document.getElementById('slidePressurization').valueAsNumber, document.getElementById('slidePressurization').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputPressurization" style="
    width: 40px;
">
        <button onclick="failure.fail('pressurization')">FAIL</button>
        <h1>MCAS</h1>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideMCAS" onchange="[document.getElementById('inputMCAS').value, window.failure.chances.mcas]=[document.getElementById('slideMCAS').valueAsNumber, document.getElementById('slideMCAS').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputMCAS" style="
    width: 40px;
">
        <button onclick="failure.fail('mcas')">FAIL</button>
        <h1>Engines</h1>
        `,t=0;t<window.geofs.aircraft.instance.engines.length;t++)e+=`
            <h2>Engine ${t+1}</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideEngine${t}" onchange="document.getElementById('inputEngine${t}').value=document.getElementById('slideEngine${t}').valueAsNumber; window.failure.chances.engines[${t}] = document.getElementById('slideEngine${t}').valueAsNumber;" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputEngine${t}" style="
    width: 40px;
">
        <button onclick="failure.fail('engine${t}')">FAIL</button>
            `,window.failuresMenu.innerHTML=e}else{window.failure=new Failure,window.failuresMenu=document.createElement("div"),window.failuresMenu.style.position="fixed",window.failuresMenu.style.width="640px",window.failuresMenu.style.height="480px",window.failuresMenu.style.background="linear-gradient(135deg, rgba(15,25,45,0.98), rgba(25,45,75,0.95))",window.failuresMenu.style.color="#e0e6ed",window.failuresMenu.style.borderRadius="12px",window.failuresMenu.style.border="1px solid rgba(100,200,255,0.2)",window.failuresMenu.style.backdropFilter="blur(10px)",window.failuresMenu.style.display="block",window.failuresMenu.style.overflow="scroll",window.failuresMenu.style.zIndex="10000",window.failuresMenu.id="failMenu",window.failuresMenu.className="geofs-ui-left",document.body.appendChild(window.failuresMenu);for(var e=`
        <div style="position: fixed; width: 640px; height: 10px; background: lightgray; cursor: move;" id="dragPart"></div>
        <p style="cursor: pointer;right: 0px;position: absolute;background: gray;height: fit-content;" onclick="window.failuresMenu.hidden=true;">X</p>
    <p>Note: Some failures may require a manual refresh of the page.</p>
    <button id="enBtn" onclick="(function(){window.failure.enabled=true; window.failure.tick(); document.getElementById('enBtn').hidden = true;})();">Enable</button>
    <button onclick="window.failure.reset()">RESET ALL</button>
        <h1>Landing Gear</h1>
        <h2>Front</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" value="0" min="0" max="1" step="0.01" id="slide1" onchange="[document.getElementById('input1').value, window.failure.chances.landingGear.gearFront]=[document.getElementById('slide1').value, document.getElementById('slide1').value]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="input1" style="
    width: 40px;
">
    <button onclick="failure.fail('gearFront')">FAIL</button>
        <br>
        <h2>Left</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideGearL" onchange="[document.getElementById('inputGearL').value, window.failure.chances.landingGear.left]=[document.getElementById('slideGearL').valueAsNumber, document.getElementById('slideGearL').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputGearL" style="
    width: 40px;
">


        <button onclick="failure.fail('gearLeft')">FAIL</button>
    <br>
        <h2>Right</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
            <input type="range" min="0" max="1" step="0.01" id="slideGearR" onchange="[document.getElementById('inputGearR').value, window.failure.chances.landingGear.right]=[document.getElementById('slideGearR').valueAsNumber, document.getElementById('slideGearR').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputGearR" style="
    width: 40px;
">
    <button onclick="failure.fail('gearRight')">FAIL</button>
    <br>
        <h1>Fuel Leak</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFuelLeak" onchange="[document.getElementById('inputFuelLeak').value, window.failure.chances.fuelLeak]=[document.getElementById('slideFuelLeak').valueAsNumber, document.getElementById('slideFuelLeak').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputFuelLeak" style="
    width: 40px;
">






        <button onclick="failure.fail('fuelLeak')">FAIL</button>
    <br>
    <h1>Flight Control</h1>
    <h2>Ailerons</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFlightCtrl" onchange="[document.getElementById('inputFlightCtrl').value, window.failure.chances.flightCtrl.ailerons]=[document.getElementById('slideFlightCtrl').valueAsNumber, document.getElementById('slideFlightCtrl').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputFlightCtrl" style="
    width: 40px;
">
        <button onclick="failure.fail('ailerons')">FAIL</button><br>
            <h2>Elevators</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideElevator" onchange="[document.getElementById('inputElevator').value, window.failure.chances.flightCtrl.elevator]=[document.getElementById('slideElevator').valueAsNumber, document.getElementById('slideElevator').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputElevator" style="
    width: 40px;
">
        <button onclick="failure.fail('elevators')">FAIL</button><br>
        <h2>Rudder</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideRudder" onchange="[document.getElementById('inputRudder').value, window.failure.chances.flightCtrl.rudder]=[document.getElementById('slideRudder').valueAsNumber, document.getElementById('slideRudder').valueAsNumber]" draggable="false" style="vertical-align: bottom;">
    <input disabled="true;" id="inputRudder" style="
    width: 40px;
">
        <button onclick="failure.fail('rudder')">FAIL</button><br>
    <h1>Electrical</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideElectrical" onchange="[document.getElementById('inputElectrical').value, window.failure.chances.electrical]=[document.getElementById('slideElectrical').valueAsNumber, document.getElementById('slideElectrical').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputElectrical" style="
    width: 40px;
">
        <button onclick="failure.fail('electrical')">FAIL</button>


    <br>


    <h1>Structural</h1>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideStructural" onchange="[document.getElementById('inputStructural').value, window.failure.chances.structural]=[document.getElementById('slideStructural').valueAsNumber, document.getElementById('slideStructural').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputStructural" style="
    width: 40px;
">
        <button onclick="failure.fail('structural')">FAIL</button>


    <br>
    <h1>Hydraulic</h1>
<h2>Flaps</h2>
        <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideFlaps" onchange="[document.getElementById('inputFlaps').value, window.failure.chances.hydraulic.flaps]=[document.getElementById('slideFlaps').valueAsNumber, document.getElementById('slideFlaps').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputFlaps" style="
    width: 40px;
">
        <button onclick="failure.fail('flaps')">FAIL</button>
<h2>Brakes</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideBrakes" onchange="[document.getElementById('inputBrakes').value, window.failure.chances.hydraulic.brakes]=[document.getElementById('slideBrakes').valueAsNumber, document.getElementById('slideBrakes').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">


        <input disabled="true;" id="inputBrakes" style="
    width: 40px;
">
        <button onclick="failure.fail('brakes')">FAIL</button>
<h2>Spoilers</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideSpoilers" onchange="[document.getElementById('inputSpoilers').value, window.failure.chances.hydraulic.spoilers]=[document.getElementById('slideSpoilers').valueAsNumber, document.getElementById('slideSpoilers').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputSpoilers" style="
    width: 40px;
">
<button onclick="failure.fail('spoilers')">FAIL</button>
    <h1>Cabin Pressurization</h1>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slidePressurization" onchange="[document.getElementById('inputPressurization').value, window.failure.chances.pressurization]=[document.getElementById('slidePressurization').valueAsNumber, document.getElementById('slidePressurization').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputPressurization" style="
    width: 40px;
">
        <button onclick="failure.fail('pressurization')">FAIL</button>
        <h1>MCAS</h1>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideMCAS" onchange="[document.getElementById('inputMCAS').value, window.failure.chances.mcas]=[document.getElementById('slideMCAS').valueAsNumber, document.getElementById('slideMCAS').valueAsNumber]" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputMCAS" style="
    width: 40px;
">
        <button onclick="failure.fail('mcas')">FAIL</button>
        <h1>Engines</h1>
        `,t=0;t<window.geofs.aircraft.instance.engines.length;t++){e+=`
            <h2>Engine ${t+1}</h2>
    <span style="
    font-size: large;
    vertical-align: top;
">Chance per minute: </span>
        <input type="range" min="0" max="1" step="0.01" id="slideEngine${t}" onchange="document.getElementById('inputEngine${t}').value=document.getElementById('slideEngine${t}').valueAsNumber; window.failure.chances.engines[${t}] = document.getElementById('slideEngine${t}').valueAsNumber;" draggable="false" style="
    vertical-align: bottom;
">
        <input disabled="true;" id="inputEngine${t}" style="
    width: 40px;
">
        <button onclick="failure.fail('engine${t}')">FAIL</button>
            `,window.failuresMenu.innerHTML=e;let i=document.getElementById("failMenu"),a=document.getElementById("dragPart");a.addEventListener("mousedown",function(e){let t=e.clientX-i.getBoundingClientRect().left,a=e.clientY-i.getBoundingClientRect().top;function n(e){i.style.left=`${e.clientX-t}px`,i.style.top=`${e.clientY-a}px`}function l(){document.removeEventListener("mousemove",n),document.removeEventListener("mouseup",l)}document.addEventListener("mousemove",n),document.addEventListener("mouseup",l)})}}},window.mainFailureFunction=function(){"use strict";window.failBtn=document.createElement("div"),window.failBtn.style.position="fixed",window.failBtn.style.right="60px",window.failBtn.style.height="36px",window.failBtn.style.bottom="0px",window.failBtn.style.border="transparent",window.failBtn.style.background="rgb(255,0,0)",window.failBtn.style.color="white",window.failBtn.style.fontWeight="600",window.failBtn.style.fontSize="20px",window.failBtn.style.cursor="pointer",window.failBtn.style.zIndex="10000",document.body.appendChild(window.failBtn),window.failBtn.innerHTML='<button style="position: inherit; right: inherit; height: inherit; top: inherit; border: inherit; background: inherit; color: inherit; font-weight: inherit; fontSize: inherit; cursor: inherit;" onclick="window.openFailuresMenu()">FAIL</button>',setInterval(()=>{flight.recorder.playing?failBtn.style.display="none":failBtn.style.display="block"},100),console.log("Failures loaded.")},waitForEntities(),runFuelSystem();
    };

    // Flight Path Vector — shows where the flight path intersects the ground
    // Press [Insert] to toggle visibility
    function fpv () {
        function cF(a,t,i){return{x:a,y:t,z:i}}function waitForEntities(){try{if(geofs.api){window.DEGREES_TO_RAD=window.DEGREES_TO_RAD||.017453292519943295,window.RAD_TO_DEGREES=window.RAD_TO_DEGREES||57.29577951308232,main();return}}catch(a){console.log("Error in waitForEntities:",a)}setTimeout(waitForEntities,1e3)}function main(){let a;window.y=geofs.api.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(geofs.camera.lla[1],geofs.camera.lla[0],geofs.animation.values.groundElevationFeet/3.2808399),billboard:{image:"https://tylerbmusic.github.io/GPWS-files_geofs/FPV.png",scale:.03*(1/geofs.api.renderingSettings.resolutionScale)}}),geofs.api.renderingSettings.resolutionScale<=.6&&(window.y.billboard.image="https://tylerbmusic.github.io/GPWS-files_geofs/FPV_Lowres.png"),window.lastLoc=Cesium.Cartesian3.fromDegrees(geofs.camera.lla[1],geofs.camera.lla[0],geofs.camera.lla[2]),setInterval(function a(){if(geofs.animation.values&&!geofs.isPaused()){window.currLoc&&(window.lastLoc=window.currLoc),window.currLoc=Cesium.Cartesian3.fromDegrees(geofs.camera.lla[1],geofs.camera.lla[0],geofs.camera.lla[2]),window.deltaLoc=[window.currLoc.x-window.lastLoc.x,window.currLoc.y-window.lastLoc.y,window.currLoc.z-window.lastLoc.z];var t,i=(void 0!==geofs.animation.values.altitude&&void 0!==geofs.animation.values.groundElevationFeet && geofs.aircraft.instance.collisionPoints && geofs.aircraft.instance.collisionPoints.length >= 2)?Math.round(geofs.animation.values.altitude-geofs.animation.values.groundElevationFeet+3.2808399*geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length-2].worldPosition[2]):"N/A";t=geofs.animation.getValue("NAV1Direction")&&600!==geofs.animation.getValue("NAV1Distance")?"to"===geofs.animation.getValue("NAV1Direction")?(Math.atan(.3048*i/(geofs.animation.getValue("NAV1Distance")+600))*RAD_TO_DEGREES).toFixed(1):(Math.atan(.3048*i/Math.abs(geofs.animation.getValue("NAV1Distance")-600))*RAD_TO_DEGREES).toFixed(1):"N/A",geofs.aircraft.instance.groundContact||window.deltaLoc[0]+window.deltaLoc[1]+window.deltaLoc[2]==0||(window.y.position=cF(window.currLoc.x+window.howFar*window.deltaLoc[0],window.currLoc.y+window.howFar*window.deltaLoc[1],window.currLoc.z+window.howFar*window.deltaLoc[2]))}},geofs.debug.fps?1/Number(geofs.debug.fps)+5:100),a=!0,document.addEventListener("keydown",function(t){"Insert"===t.key&&(a=!a)}),setInterval(()=>{a?window.y.show=!geofs.aircraft.instance.groundContact:window.y.show=!1},100)}waitForEntities(), window.howFar=15;
    };

    // GPWS — Ground Proximity Warning System callouts for airliners
    function gpws () {
        (() => {var gpwsScript = document.createElement('script'); gpwsScript.src="https://raw.githack.com/geofs-pilot/geofs-gpws-modified/main/gpws.js";document.body.appendChild(gpwsScript);})()
    };

    // Information Display — floating HUD panel (top-right) showing live flight data:
    // KIAS, Mach, GS, ALT, AGL, HDG, V/S, THR, AOA, GSLOPE, G-force, OP, CC, FUEL
    function info () {
        let isDragging = false;
        let dragTarget = null;
        let dragMoved = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        globalThis.hudVisible = true;
        globalThis.hudMinimized = false;
        console.log("Nexus: Info HUD initialized");

        function toggleHud() {
            globalThis.hudMinimized = !globalThis.hudMinimized;
            const hud = document.getElementById('flightDataDisplay');
            if (hud) hud.classList.toggle('hud-minimized', globalThis.hudMinimized);
            const btn = document.getElementById('hudMinimizeBtn');
            if (btn) {
                btn.innerHTML = globalThis.hudMinimized ? '◈' : '▣';
                btn.title = globalThis.hudMinimized ? 'Restore information display' : 'Minimize information display';
            }
        }

        function applyDraggable(el, storageKey) {
            if (storageKey) {
                try {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const pos = JSON.parse(saved);
                        if (pos.left && pos.top) {
                            el.style.left = pos.left;
                            el.style.top = pos.top;
                            el.style.right = 'auto';
                            el.style.bottom = 'auto';
                            el.style.transform = 'none'; // Disable baseline centering transform
                        }
                    }
                } catch (e) {}
            }

            el.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragTarget = el;
                dragMoved = false;
                dragOffsetX = e.clientX - el.getBoundingClientRect().left;
                dragOffsetY = e.clientY - el.getBoundingClientRect().top;
                el.style.cursor = 'grabbing';
                el.style.transform = 'none'; // Ensure transform doesn't interfere with manual positioning
                e.preventDefault();
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !dragTarget) return;
            dragMoved = true;
            let newX = e.clientX - dragOffsetX;
            let newY = e.clientY - dragOffsetY;
            
            if (newY < 0) newY = 0;
            if (newX < 0) newX = 0;
            let maxX = window.innerWidth - dragTarget.offsetWidth;
            let maxY = window.innerHeight - dragTarget.offsetHeight;
            if (newX > maxX) newX = maxX;
            if (newY > maxY) newY = maxY;
            
            dragTarget.style.left = newX + 'px';
            dragTarget.style.top = newY + 'px';
            dragTarget.style.right = 'auto';
            dragTarget.style.bottom = 'auto';
            dragTarget.style.transform = 'none'; // Anchor position firmly
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && dragTarget) {
                dragTarget.style.cursor = 'move';
                const key = dragTarget.id === 'hudMinimizeBtn' ? 'geofs-nexus-hud-icon-pos' : 
                          (dragTarget.id === 'flightDataDisplay' ? 'geofs-nexus-hud-pos' : null);
                if (key && dragMoved) {
                    localStorage.setItem(key, JSON.stringify({
                        left: dragTarget.style.left,
                        top: dragTarget.style.top
                    }));
                }
            }
            isDragging = false;
            dragTarget = null;
        });

        // --- 2. Create Icon ---
        const hudMinBtn = document.createElement('div');
        hudMinBtn.id = 'hudMinimizeBtn';
        hudMinBtn.title = 'Toggle information display [K]';
        hudMinBtn.innerHTML = '▣';
        
        // Directly set initial position for middle-left docking
        hudMinBtn.style.left = '0px';
        hudMinBtn.style.top = '50%';
        hudMinBtn.style.transform = 'translateY(-50%)';
        
        document.body.appendChild(hudMinBtn);
        
        // One-time automated reset if stale positions exist from previous versions
        if (!localStorage.getItem('geofs-nexus-v3.9-reset-v2')) {
            localStorage.removeItem('geofs-nexus-hud-icon-pos');
            localStorage.setItem('geofs-nexus-v3.9-reset-v2', 'true');
        }

        applyDraggable(hudMinBtn, 'geofs-nexus-hud-icon-pos');

        hudMinBtn.addEventListener('click', () => {
            if (dragMoved) return;
            toggleHud();
        });

        // Toggle function exposed globally for the global key listener
        window.toggleNexusHud = toggleHud;

        function hudCell(label, value, warnClass) {
            return `<div class="hud-cell"><span class="hud-label">${label}</span><span class="hud-value ${warnClass || ''}">${value}</span></div>`;
        }

        setInterval(function() {
            if (!geofs.animation.values) return;
            let y = document.getElementById("flightDataDisplay");
            if (!y) {
                y = document.createElement("div");
                y.id = "flightDataDisplay";
                document.body.appendChild(y);
                applyDraggable(y, 'geofs-nexus-hud-pos');
            }
            if (hudMinBtn) hudMinBtn.style.display = globalThis.hudVisible ? 'flex' : 'none';
            if (!globalThis.hudVisible || globalThis.hudMinimized || flight.recorder.playing) {
                if (y) y.style.display = 'none';
                return;
            }
            const o = geofs.animation.values.kias ? geofs.animation.values.kias.toFixed(1) : "N/A";
            const l = geofs.animation.values.mach ? geofs.animation.values.mach.toFixed(2) : "N/A";
            const t = geofs.animation.values.groundSpeed ? geofs.animation.values.groundSpeed.toFixed(1) : "N/A";
            const r = geofs.animation.values.altitude ? Math.round(geofs.animation.values.altitude) : "N/A";
            const d = geofs.animation.values.heading360 ? Math.round(geofs.animation.values.heading360) : "N/A";
            const $ = (void 0 !== geofs.animation.values.altitude && void 0 !== geofs.animation.values.groundElevationFeet && geofs.aircraft.instance.collisionPoints && geofs.aircraft.instance.collisionPoints.length >= 2)
                ? Math.round(geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet + 3.2808399 * geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2])
                : "N/A";
            const s = void 0 !== geofs.animation.values.verticalSpeed ? Math.round(geofs.animation.values.verticalSpeed) : "N/A";
            const p = (geofs.aircraft.instance.engine && !1 === geofs.aircraft.instance.engine.on) ? "OFF"
                : void 0 !== geofs.animation.values.throttle
                    ? (geofs.animation.values.throttle < .005 && geofs.animation.values.throttle >= 0 ? "IDLE" : (100 * geofs.animation.values.throttle).toFixed(0) + "%")
                    : "N/A";
            const c = void 0 !== geofs.aircraft.instance.angleOfAttackDeg ? geofs.aircraft.instance.angleOfAttackDeg.toFixed(1) : "N/A";

            window.DEGREES_TO_RAD = window.DEGREES_TO_RAD || .017453292519943295;
            window.RAD_TO_DEGREES = window.RAD_TO_DEGREES || 57.29577951308232;

            let nav_slope;
            if (typeof $ === 'number' && geofs.animation.getValue("NAV1Direction") && 600 !== geofs.animation.getValue("NAV1Distance")) {
                nav_slope = ("to" === geofs.animation.getValue("NAV1Direction")
                    ? (Math.atan(.3048 * $ / (geofs.animation.getValue("NAV1Distance") + 600)) * RAD_TO_DEGREES).toFixed(1)
                    : (Math.atan(.3048 * $ / Math.abs(geofs.animation.getValue("NAV1Distance") - 600)) * RAD_TO_DEGREES).toFixed(1));
            } else { nav_slope = "N/A"; }

            const u = geofs.animation.values.loadFactor ? geofs.animation.values.loadFactor.toFixed(1) : "N/A";
            const i = globalThis.isOverpowered === true ? "ON" : "OFF";
            const e = globalThis.cycling === true ? "ON" : "OFF";
            const fuel = globalThis.fuelPercentage;
            const b = void 0 !== fuel ? (0 === fuel ? "0%" : fuel < 1 ? "1%" : fuel.toFixed(0) + "%") : "N/A";

            const fuelWarn = (typeof fuel === 'number' && fuel < 15) ? (fuel < 5 ? 'danger' : 'warn') : '';
            const gWarn = (parseFloat(u) > 4) ? 'danger' : (parseFloat(u) > 2.5 ? 'warn' : '');
            const vsWarn = (typeof s === 'number' && s < -2000) ? 'danger' : (typeof s === 'number' && s < -1000 ? 'warn' : '');

            y.innerHTML = 
                `<div class="hud-drag-handle">⋯⋯⋯</div>` +
                hudCell('KIAS', o) + hudCell('MACH', l) + hudCell('GS', t) +
                hudCell('ALT', r) + hudCell('AGL', $) + hudCell('HDG', d) +
                hudCell('V/S', s, vsWarn) + hudCell('THR', p) + hudCell('AOA', c) +
                hudCell('GSLOPE', nav_slope) + hudCell('G', u, gWarn) +
                hudCell('OP', i, i === 'ON' ? 'warn' : '') + hudCell('CC', e) +
                hudCell('FUEL', b, fuelWarn);

            y.style.display = 'grid';
        }, 100);
    };

    // Jetbridge — animated jetway that attaches to the aircraft door
    // Note: delayed until the #extras-button element appears in the DOM
    function jetbridge () {
        (() => {var jetScript = document.createElement('script'); jetScript.src="https://raw.githack.com/Spice9/Geofs-Jetbridge/main/jetbridge-main.js";document.body.appendChild(jetScript);})()
    };

    // Landing Stats — shows V/S, G-force, roll, TDZ accuracy etc. on touchdown
    function stats () {
        setTimeout(function(){"use strict";window.DEGREES_TO_RAD=window.DEGREES_TO_RAD||.017453292519943295,window.RAD_TO_DEGREES=window.RAD_TO_DEGREES||57.29577951308232,window.closeTimer=!0,window.closeSeconds=10,window.refreshRate=20,window.counter=0,window.isLoaded=!1,window.justLanded=!1,window.vertSpeed=0,window.oldAGL=0,window.newAGL=0,window.calVertS=0,window.groundSpeed=0,window.ktias=0,window.kTrue=0,window.bounces=0,window.statsOpen=!1,window.isGrounded=!0,window.isInTDZ=!1,window.softLanding=new Audio("https://tylerbmusic.github.io/GPWS-files_geofs/soft_landing.wav"),window.hardLanding=new Audio("https://tylerbmusic.github.io/GPWS-files_geofs/hard_landing.wav"),window.crashLanding=new Audio("https://tylerbmusic.github.io/GPWS-files_geofs/crash_landing.wav"),window.statsDiv=document.createElement("div"),window.statsDiv.style.width="fit-content",window.statsDiv.style.height="fit-content",window.statsDiv.style.background="linear-gradient(to bottom right, rgb(29, 52, 87), rgb(20, 40, 70))",window.statsDiv.style.zIndex="100000",window.statsDiv.style.margin="30px",window.statsDiv.style.padding="15px",window.statsDiv.style.fontFamily="Arial, sans-serif",window.statsDiv.style.boxShadow="0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",window.statsDiv.style.color="white",window.statsDiv.style.position="fixed",window.statsDiv.style.borderRadius="12px",window.statsDiv.style.left="-50%",window.statsDiv.style.transition="0.4s ease",window.statsDiv.style.border="1px solid rgba(255,255,255,0.1)",document.body.appendChild(window.statsDiv),setInterval(function e(){if(!1==geofs.cautiousWithTerrain&&!geofs.isPaused()&&!(window.sd&&window.sd.cam.data)){if((void 0!==geofs.animation.values.altitude&&void 0!==geofs.animation.values.groundElevationFeet?geofs.animation.values.altitude-geofs.animation.values.groundElevationFeet+3.2808399*geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length-2].worldPosition[2]:"N/A")<500){if(window.justLanded=geofs.animation.values.groundContact&&!window.isGrounded,window.justLanded&&!window.statsOpen){window.closeTimer&&setTimeout(window.closeLndgStats,1e3*window.closeSeconds);let a=window.clamp((window.lVS-50)/70,0,5),t=window.clamp(2*Math.abs(window.geofs.animation.values.accZ/9.80665-1),0,2),i=Math.min(2*window.bounces,6),n=window.clamp(window.lRoll/10,0,1.5),s=!0==window.isInTDZ?0:1;if(window.landingScore=window.clamp(10-a-t-i-n-s,0,10),console.log("Landing score: "+window.landingScore),window.statsOpen=!0,window.statsDiv.innerHTML=`
                <button style="
                    right: 10px;
                    top: 10px;
                    position: absolute;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    font-weight: bold;"
                    onclick="window.closeLndgStats()">✕</button>
                    <style>
                        .info-block {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                            font-size: 14px;
                        }
                        .landing-quality {
                            grid-column: 1 / -1;
                            text-align: center;
                            font-weight: bold;
                            margin-top: 10px;
                            padding: 5px;
                            border-radius: 5px;
                        }
                    </style>
                    <div class="info-block">
                        <span>Landing Score: ${window.landingScore.toFixed(1)}/10</span>
                        <span>Vertical speed: ${window.vertSpeed} fpm</span>
                        <span>G-Forces: ${(window.geofs.animation.values.accZ/9.80665).toFixed(2)}G</span>
                        <span>Terrain-calibrated V/S: ${window.calVertS.toFixed(1)}</span>
                        <span>True airspeed: ${window.kTrue} kts</span>
                        <span>Ground speed: ${window.groundSpeed.toFixed(1)} kts</span>
                        <span>Indicated speed: ${window.ktias} kts</span>
                        <span>Roll: ${window.geofs.animation.values.aroll ? window.geofs.animation.values.aroll.toFixed(1) : "N/A"} degrees</span>
                        <span>Tilt: ${window.geofs.animation.values.atilt ? window.geofs.animation.values.atilt.toFixed(1) : "N/A"} degrees</span>
                        <span id="bounces">Bounces: 0</span>
                    </div>
                `,window.statsDiv.style.left="0px",window.statsDiv.innerHTML+=`
                        <div style="margin-top: 10px; font-size: 14px;">
                            <span>Landed in TDZ? ${window.isInTDZ}</span><br>
                            ${window.geofs.nav.units.NAV1.inRange?`<span>Deviation from center: ${window.geofs.nav.units.NAV1.courseDeviation.toFixed(1)}</span>`:""}
                        </div>`,0>Number(window.vertSpeed)){let o="",l="";Number(window.vertSpeed)>=-50?(o="landing-quality",l="SUPER BUTTER!",window.statsDiv.innerHTML+=`
                                <div class="${o}" style="background-color: green; color: white;">
                                    ${l}
                                </div>`,window.softLanding.play()):Number(window.vertSpeed)>=-200?(o="landing-quality",l="BUTTER",window.statsDiv.innerHTML+=`
                                <div class="${o}" style="background-color: green; color: white;">
                                    ${l}
                                </div>`,window.softLanding.play()):Number(window.vertSpeed)>=-500&&-200>Number(window.vertSpeed)?(window.hardLanding.play(),o="landing-quality",l="ACCEPTABLE",window.statsDiv.innerHTML+=`
                                <div class="${o}" style="background-color: yellow; color: black;">
                                    ${l}
                                </div>`):Number(window.vertSpeed)>=-1e3&&-500>Number(window.vertSpeed)&&(window.hardLanding.play(),o="landing-quality",l="HARD LANDING",window.statsDiv.innerHTML+=`
                                <div class="${o}" style="background-color: red; color: white;">
                                    ${l}
                                </div>`)}(-1e3>=Number(window.vertSpeed)||Number(window.vertSpeed>200))&&(window.crashLanding.play(),window.statsDiv.innerHTML+=`
                            <div class="landing-quality" style="background-color: crimson; color: white;">
                                CRASH LANDING
                            </div>`)}else if(window.justLanded&&window.statsOpen){window.bounces++,document.getElementById("bounces").innerHTML=`Bounces: ${window.bounces}`,window.softLanding.pause();let r=window.clamp((window.lVS-50)/70,0,5),d=window.clamp(2*Math.abs(window.geofs.animation.values.accZ/9.80665-1),0,2),$=Math.min(2*window.bounces,6),c=window.clamp(window.lRoll/10,0,1.5),g=!0==window.isInTDZ?0:1;window.landingScore=window.clamp(10-r-d-$-c-g,0,10),console.log("Landing score: "+window.landingScore)}window.geofs.animation.values.groundContact||(window.lVS=Math.abs(window.geofs.animation.values.verticalSpeed),window.lRoll=Math.abs(window.geofs.animation.values.aroll)),window.isInTDZ=window.getTDZStatus(),window.groundSpeed=window.geofs.animation.values.groundSpeedKnt,window.ktias=window.geofs.animation.values.kias?window.geofs.animation.values.kias.toFixed(1):"N/A",window.kTrue=window.geofs.aircraft.instance.trueAirSpeed?window.geofs.aircraft.instance.trueAirSpeed.toFixed(1):"N/A",window.vertSpeed=window.geofs.animation.values.verticalSpeed?window.geofs.animation.values.verticalSpeed.toFixed(1):"N/A",window.gForces=window.geofs.animation.values.accZ/9.80665,window.isGrounded=window.geofs.animation.values.groundContact,window.refreshRate=12}else window.refreshRate=60}},window.refreshRate),setInterval(async()=>{var e=.05*Math.floor(window.geofs.aircraft.instance.llaLocation[0]/.05),a=.05*Math.floor(window.geofs.aircraft.instance.llaLocation[1]/.05);let t=`[out:json];
(
  way["aeroway"="runway"]({{bbox}});
);
out body;
>;
out skel qt;
`,i=await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(t.replace("{{bbox}}",e+", "+a+", "+(e+.05)+", "+(a+.05)))}`),n=await i.json();window.lData=n},5e3),window.getTDZStatus=function(){if(window.lData){let e=window.lData,a=[],t=[-1,1/0];for(let i in e.elements){let n=e.elements[i];if("way"==n.type){let s=n.nodes;a.push(s[0]),a.push(s[s.length-1])}else"node"==n.type&&-1!=a.indexOf(n.id)&&window.sd.getDistance(window.geofs.aircraft.instance.llaLocation,[n.lat,n.lon])<t[1]&&(t=[[n.lat,n.lon],window.sd.getDistance(window.geofs.aircraft.instance.llaLocation,[n.lat,n.lon])])}let o=window.geofs.aircraft.instance.llaLocation,l=window.Cesium.Cartesian3.fromDegrees(t[0][1],t[0][0],o[2]),r=window.Cesium.Cartesian3.fromDegrees(o[1],o[0],o[2]),d=window.Cesium.Cartesian3.distance(l,r)*window.METERS_TO_FEET;return d>1e3&&d<1200}return!1},setInterval(function e(){void 0===window.geofs.animation.values||window.geofs.isPaused()||(void 0!==window.geofs.animation.values.altitude&&void 0!==window.geofs.animation.values.groundElevationFeet?window.geofs.animation.values.altitude-window.geofs.animation.values.groundElevationFeet+3.2808399*window.geofs.aircraft.instance.collisionPoints[window.geofs.aircraft.instance.collisionPoints.length-2].worldPosition[2]:"N/A")===window.oldAGL||(window.newAGL=void 0!==window.geofs.animation.values.altitude&&void 0!==window.geofs.animation.values.groundElevationFeet?window.geofs.animation.values.altitude-window.geofs.animation.values.groundElevationFeet+3.2808399*window.geofs.aircraft.instance.collisionPoints[window.geofs.aircraft.instance.collisionPoints.length-2].worldPosition[2]:"N/A",window.newTime=Date.now(),window.calVertS=(window.newAGL-window.oldAGL)*(6e4/(window.newTime-window.oldTime)),window.oldAGL=void 0!==window.geofs.animation.values.altitude&&void 0!==window.geofs.animation.values.groundElevationFeet?window.geofs.animation.values.altitude-window.geofs.animation.values.groundElevationFeet+3.2808399*window.geofs.aircraft.instance.collisionPoints[window.geofs.aircraft.instance.collisionPoints.length-2].worldPosition[2]:"N/A",window.oldTime=Date.now())},25),window.closeLndgStats=function(){window.statsDiv.style.left="-50%",setTimeout(function(){window.statsDiv.innerHTML="",window.statsOpen=!1,window.bounces=0},400)}},1e3);
    };

    // Overpowered Engines — sets engine thrust to 6× and ceiling to 300,000 ft
    // Toggle with [Q]
    function opengines () {
        function toggleAircraftProperties(){globalThis.isOverpowered=!1;let t={thrust:{},zeroThrustAltitude:null,zeroRPMAltitude:null},r=geofs?.aircraft?.instance?.aircraftRecord?.id||null,e=geofs.aircraft.instance.definition.mass;document.addEventListener("keydown",function(r){"q"!==r.key.toLowerCase()||r.ctrlKey||r.altKey||r.metaKey||(globalThis.isOverpowered?(function r(){if(geofs?.aircraft?.instance){let e=geofs.aircraft.instance;if(e.definition&&(null!==t.zeroThrustAltitude&&(e.definition.zeroThrustAltitude=t.zeroThrustAltitude),null!==t.zeroRPMAltitude&&(e.definition.zeroRPMAltitude=t.zeroRPMAltitude)),e.parts)for(let i in t.thrust){let u=e.parts[i];u?.thrust!==void 0&&(u.thrust=t.thrust[i].thrust,void 0!==u.afterBurnerThrust&&null!==t.thrust[i].afterBurnerThrust&&(u.afterBurnerThrust=t.thrust[i].afterBurnerThrust),void 0!==u.reverseThrust&&null!==t.thrust[i].reverseThrust&&(u.reverseThrust=t.thrust[i].reverseThrust))}}}(),globalThis.isOverpowered=!1,console.log("Aircraft properties set to normal.")):(function r(){if(geofs?.aircraft?.instance){let i=geofs.aircraft.instance;if(e=i.definition.mass,null===t.zeroThrustAltitude&&i.definition?.zeroThrustAltitude!==void 0&&(t.zeroThrustAltitude=i.definition.zeroThrustAltitude),null===t.zeroRPMAltitude&&i.definition?.zeroRPMAltitude!==void 0&&(t.zeroRPMAltitude=i.definition.zeroRPMAltitude),i.definition&&(i.definition.zeroThrustAltitude=3e5,i.definition.zeroRPMAltitude=3e5),i.parts)for(let u in i.parts){let s=i.parts[u];if(s?.thrust!==void 0){t.thrust[u]||(t.thrust[u]={thrust:s.thrust,afterBurnerThrust:s.afterBurnerThrust||null,reverseThrust:s.reverseThrust||null});let n,o,l;n=6*Number(t.thrust[u].thrust),o=null!==t.thrust[u].afterBurnerThrust?6*t.thrust[u].afterBurnerThrust:n;l=6*Number(t.thrust[u].reverseThrust),console.log(t.thrust),console.log(n),s.thrust=n,void 0!==s.afterBurnerThrust&&(s.afterBurnerThrust=o),void 0!==s.reverseThrust&&(s.reverseThrust=l)}}}}(),globalThis.isOverpowered=!0,console.log("Aircraft properties set to overpowered mode.")))}),console.log("Press 'Q' to toggle aircraft properties between normal and overpowered."),setInterval(()=>{let e=geofs?.aircraft?.instance?.aircraftRecord?.id||null;e!==r&&(console.log("Aircraft changed, resetting toggle."),t={thrust:{},zeroThrustAltitude:null,zeroRPMAltitude:null},globalThis.isOverpowered=!1,r=e)},500)}toggleAircraftProperties();
    };

    // Pushback — adds a driveable pushback tug for most aircraft
    function pushback () {
        !function($,x){let a=_0x5694,e=$();for(;;)try{let t=parseInt(a(299))/1*(parseInt(a(291))/2)+-parseInt(a(377))/3+-parseInt(a(365))/4+parseInt(a(328))/5+-parseInt(a(292))/6*(-parseInt(a(315))/7)+parseInt(a(372))/8*(-parseInt(a(364))/9)+-parseInt(a(346))/10*(-parseInt(a(295))/11);if(648459===t)break;e.push(e.shift())}catch(_){e.push(e.shift())}}(_0x1c81,648459);let itv=setInterval(function(){try{window.ui&&window.flight&&(main(),getData(),clearInterval(itv))}catch($){}},500),defaultFriction,pushbackInfo,pushbackModels;async function getData(){let $=_0x5694;await fetch("https://raw.githubusercontent.com/TotallyRealElonMusk/GeoFS-Pushback/main/pushback%20data/pushback.json")[$(375)](x=>x[$(316)]())[$(375)]($=>pushbackInfo=$);await fetch($(312))[$(375)]($=>$.json()).then($=>pushbackModels=$)}function _0x5694($,x){let a=_0x1c81();return(_0x5694=function($,x){return a[$-=291]})($,x)}function main(){let $=_0x5694;window[$(340)]={},pushback[$(370)]=0,pushback[$(349)]=0,pushback[$(368)]=function(x){let a=$;pushback[a(370)]=x,.5===x&&(x=1),-.5===x&&(x=-1),pushback[a(301)]&&clearInterval(pushback.lockInt),pushback.lockInt=setInterval(function(){pushback[a(308)](x)})},pushback.stopBack=function(){let x=$;clearInterval(pushback[x(301)]),pushback[x(370)]=0,pushback.pushBack(0),clearInterval(pushback[x(301)])},pushback[$(308)]=function(x){let a=$,e=Math.round(window.geofs.animation.values[a(311)]);geofs[a(355)].instance[a(363)].setLinearVelocity([x*Math[a(324)](e*Math.PI/180),x*Math[a(337)](e*Math.PI/180),0])},pushback[$(367)]=function(x){let a=$;pushback[a(349)]=x,geofs[a(298)].values[a(321)]=x};let x;pushback[$(332)]=!1,pushback.checkAircraft=function($){return!!pushbackInfo[$]},pushback[$(296)]=function(){let x=$;for(let a=0;a<geofs[x(355)].instance[x(354)][x(303)][x(330)];a++)if(geofs[x(355)][x(359)][x(354)][x(303)][a][x(306)])for(let e=0;e<geofs[x(355)][x(359)][x(354)][x(303)][a].animations[x(330)];e++)geofs[x(355)][x(359)][x(354)][x(303)][a][x(306)][e].value==x(349)&&(geofs[x(355)].instance.setup.parts[a][x(306)][e][x(342)]="yawPushback",geofs[x(355)][x(359)][x(354)][x(303)][a][x(335)]&&(pushback[x(334)]=geofs[x(355)][x(359)][x(354)].parts[a].animations[e].ratio))},pushback[$(373)]=function(){let x=$;clearInterval(pushback[x(301)]),window.geofs.aircraft[x(359)].setup.contactProperties[x(369)][x(376)]=defaultFriction;for(let a=0;a<geofs[x(355)][x(359)].setup.parts.length;a++)if(window.geofs.aircraft.instance.setup.parts[a].animations)for(let e=0;e<geofs[x(355)][x(359)][x(354)][x(303)][a].animations[x(330)];e++)window.geofs.aircraft[x(359)][x(354)][x(303)][a][x(306)][e][x(342)]==x(321)&&(window.geofs.aircraft.instance[x(354)][x(303)][a][x(306)][e][x(342)]=x(349))},pushback[$(317)]=function(){pushback.addPushBackTruck()},pushback[$(350)]=function(){let x=$;if(pushbackInfo[window.geofs.aircraft[x(359)].id]){let a={name:x(331),model:pushbackModels[pushbackInfo[window.geofs.aircraft[x(359)].id][x(339)]],position:pushbackInfo[geofs[x(355)][x(359)].id][x(319)],animations:[{type:x(351),axis:"Z",value:x(321),ratio:pushback.defaultYaw},{value:x(309),type:x(343),value:x(348)},{type:x(351),value:"atilt",axis:"X",ratio:-1}],rotation:[0,0,0]};geofs[x(355)][x(359)][x(323)]([a],x(336),1,x(366))}};let a=document.getElementsByClassName("geofs-autopilot-bar"),e=document[$(327)]($(320));e[$(341)].add($(356)),e.id=$(300),e.style[$(318)]=$(357),e[$(305)]=$(314),a[0][$(347)](e);document[$(362)]($(300))[$(293)]=function(){!function a(){let e=$;void 0!=x&&x[e(338)](),(x=window[e(352)]("",e(374),"toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=780,height=300,top="+(screen[e(358)]-400)+e(307)+(screen[e(322)]-840)))[e(345)][e(326)][e(305)]=e(297);let t=x[e(345)][e(362)](e(349)),_=x.document[e(362)](e(370)),n=x[e(345)][e(362)](e(340)),i=x[e(345)][e(362)]("reset"),o=x[e(345)][e(362)](e(294)),s=x[e(345)].getElementById(e(361));_[e(333)]=function(){let $=e;!0==pushback[$(332)]&&(pushback[$(368)]((parseInt(this[$(342)])-40)/2),o[$(305)]=(parseInt(this.value)-40)/2)},t[e(333)]=function(){let $=e;!0==pushback[$(332)]&&(pushback[$(367)]((parseInt(this.value)-50)/50),s[$(305)]=(parseInt(this[$(342)])-50)/50)},n[e(333)]=async function(){let $=e;!1===pushback.pushBackState?!0===pushback[$(304)](geofs[$(355)][$(359)].id)&&!0==geofs[$(355)][$(359)][$(353)]&&geofs[$(298)][$(360)].rollingSpeed<.5&&(await pushback.setUpdate(),pushback[$(317)](),pushback[$(332)]=!0,geofs[$(298)][$(360)].pushBackTruck=1,defaultFriction=geofs[$(355)][$(359)].setup[$(310)][$(369)].lockSpeed,geofs[$(355)][$(359)].setup[$(310)][$(369)][$(376)]=.5):(pushback[$(332)]=!1,geofs[$(298)].values[$(348)]=0,window.geofs.aircraft[$(359)][$(303)].pushbackTruck[$(344)][$(313)](),pushback[$(373)](),pushback[$(325)](),i[$(293)]())},i.onclick=function(){let $=e;t[$(342)]="50",s[$(305)]="0",_[$(342)]="40",o[$(305)]="0",pushback[$(325)](),pushback[$(368)](0),pushback[$(325)](),pushback.startYaw(0)},x[e(371)]=function(){let $=e;pushback[$(332)]=!1,window.geofs.animation[$(360)].pushBackTruck=0,geofs[$(355)][$(359)][$(303)].pushbackTruck.object3d[$(313)](),pushback[$(373)](),pushback[$(325)](),i[$(293)]()},x[e(329)]("keydown",function($){let x=e;if(38===$[x(302)]&&pushback.speed<20){let a=pushback[x(370)]+.5;pushback.startBack(a),o.innerHTML=a,_[x(342)]=2*a+40}else if(40===$[x(302)]&&pushback[x(370)]>-20){let n=pushback[x(370)]-.5;pushback[x(368)](n),o[x(305)]=n,_[x(342)]=2*n+40}else if(39===$.keyCode&&pushback[x(349)]<1){let i=Math[x(378)]((pushback[x(349)]+.02)*100)/100;pushback[x(367)](i),s[x(305)]=i,t[x(342)]=50*i+50}else if(37===$[x(302)]&&pushback[x(349)]>-1){let c=Math[x(378)]((pushback[x(349)]-.02)*100)/100;pushback[x(367)](c),s[x(305)]=c,t[x(342)]=50*c+50}})}()}}function _0x1c81(){let $=["then","lockSpeed","1258782BnpTvr","round","6TtZgaV","12AvIPhZ","onclick","speedInfo","319TOOmos","setUpdate",'<style>\n.slidecontainer {\n  width: 100%;\n  /* Width of the outside container */\n}\n\n/* The slider itself */\n.slider {\n  -webkit-appearance: none;\n  /* Override default CSS styles */\n  appearance: none;\n  width: 50%;\n  /* Full-width */\n  height: 25px;\n  /* Specified height */\n  background: #d3d3d3;\n  /* Grey background */\n  outline: none;\n  /* Remove outline */\n  opacity: 0.7;\n  /* Set transparency (for mouse-over effects on hover) */\n  -webkit-transition: .2s;\n  /* 0.2 seconds transition on hover */\n  transition: opacity .2s;\n}\n\n/* Mouse-over effects */\n.slider:hover {\n  opacity: 1;\n  /* Fully shown on mouse-over */\n}\n\n/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */\n.slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  /* Override default look */\n  appearance: none;\n  width: 25px;\n  /* Set a specific slider handle width */\n  height: 25px;\n  /* Slider handle height */\n  background: #04AA6D;\n  /* Green background */\n  cursor: pointer;\n  /* Cursor on hover */\n}\n\n.slider::-moz-range-thumb {\n  width: 25px;\n  /* Set a specific slider handle width */\n  height: 25px;\n  /* Slider handle height */\n  background: #04AA6D;\n  /* Green background */\n  cursor: pointer;\n  /* Cursor on hover */\n}\n\n.center {\n  font-family: verdana;\n  display: center;\n}\n</style>\n<input type="checkbox" id="pushback" name="pushback" value="pushback" class="center"></input>\n<labelfor="pushback" class="center"> Toggle pushback </label></p> Yaw:\n<div id="yawInfo">0</div>\n<div class="slidecontainer">\n  <input type="range" min="0" max="100" value="50" class="slider" id="yaw">\n  </p> Speed: <div id="speedInfo">0</div>\n  <div class="slidecontainer">\n    <input type="range" min="0" max="80" value="40" class="slider" id="speed">\n    </p>\n    <button class="center" type="button" id="reset">Reset</button>\n    <br>\n  </div>',"animation","363367mttbUH","pushbackButtonMain","lockInt","keyCode","parts","checkAircraft","innerHTML","animations",",left=","pushBack","view","contactProperties","heading360","https://raw.githubusercontent.com/TotallyRealElonMusk/GeoFS-Pushback/main/pushback%20data/pushbackModel.json","destroy",'<div style="line-height: 27px;font-size: 12px !important;pointer-events: none;color: #FFF;text-align: center;">PUSHBACK</div>',"4303656PWCiJH","json","addPushBackTruckHandler","cssText","pos","div","yawPushback","width","addParts","sin","stopBack","body","createElement","1931860IqPriw","addEventListener","length","pushbackTruck","pushBackState","oninput","defaultYaw","collisionPoints","https://raw.githubusercontent.com/","cos","close","model","pushback","classList","value","show","object3d","document","75250HvkrXo","append","pushBackTruck","yaw","addPushBackTruck","rotate","open","groundContact","setup","aircraft","control-pad","width: 90px;height: 25px;margin: 0px 10px;border-radius: 15px;outline: none;","height","instance","values","yawInfo","getElementById","rigidBody","324036SVkzvQ","4544724bXaXlh","Zup","startYaw","startBack","wheel","speed","onbeforeunload","160yAxlOT","revertUpdate","Title"];return(_0x1c81=function(){return $})()}
    };

    // -------------------------------------------------------------------------
    // REALISM & ENVIRONMENT
    // -------------------------------------------------------------------------

    // Realism Pack — comprehensive realism overhaul (clickable cockpits, wingflex,
    // ejection seats, condensation, livery selector, and more)
    // Note: delayed until the JOBS button appears in the DOM
    function realism () {
        (() => {var realismScript = document.createElement('script'); realismScript.src="https://raw.githack.com/geofs-pilot/realism-pack-modded/main/main.js";document.body.appendChild(realismScript);realismScript.onload = (function(){realismGo()});})()
    };

    // Sky Dolly — formation mode and logbook (port of MSFS Sky Dolly)
    function dolly () {
        (() => {var dollyScript = document.createElement('script'); dollyScript.src="https://raw.githack.com/tylerbmusic/GeoFS-Sky-Dolly/main/userscript.js";document.body.appendChild(dollyScript);})()
    };

    // Slew Mode — FSX-style position/attitude editor. Toggle [Y], fly with IJKL/UE
    function slew () {
        (() => {var slewScript = document.createElement('script'); slewScript.src="https://raw.githack.com/tylerbmusic/GeoFS-Slew-Mode/main/userscript.js";document.body.appendChild(slewScript);})()
    };

    // Maritime Structures — additional sea-based 3D objects in the world
    function maritimeStructures () {
        fetch("https://raw.githack.com/CementAndRebar/GeoFS-Extra-Maritime-Structures/main/main.js")
            .then(res => res.text())
            .then(code => {
                // Initialize addons to prevent undefined ReferenceErrors after eval()
                code = "window.addons = window.addons || {}; let addons = window.addons;\n" + code;

                // Execute using eval to maintain compatibility with the original addon context
                eval("(async function() { " + code + " \n})();");
                
                // Reposition the button (landButton) to follow the Extras button in the bottom bar
                const moveButton = setInterval(() => {
                    const landButton = document.getElementById('landButton');
                    const extrasButton = document.getElementById('extras-button');
                    const bottomBar = document.querySelector('.geofs-ui-bottom');
                    
                    if (landButton && bottomBar) {
                        // Ensure it has standard button classes for consistent flow
                        landButton.classList.add('mdl-button', 'mdl-js-button', 'geofs-f-standard-ui');
                        
                        if (extrasButton) {
                            // If Extras button exists, place Maritime Structures after it
                            extrasButton.parentNode.insertBefore(landButton, extrasButton.nextSibling);
                            clearInterval(moveButton);
                            console.log("Nexus: Maritime Structures button moved after Extras.");
                        } else {
                            // If Extras button is not found yet, we wait.
                            // The original script already appends landButton to geofs-ui-bottom by default.
                        }
                    }
                }, 1000);
                setTimeout(() => clearInterval(moveButton), 30000); // Failsafe
            })
            .catch(e => console.error("Could not load Maritime Structures", e));
    }

    // Streetlights — renders streetlights at night on roads around airports
    function streetlights () {
        (() => {var slScript = document.createElement('script'); slScript.src="https://raw.githack.com/tylerbmusic/GeoFS-Streetlights/main/userscript.js";document.body.appendChild(slScript);})()
    }

    // Utilities — general-purpose GeoFS utility functions
    function utilities () {
        (() => {var utilScript = document.createElement('script'); utilScript.src="https://raw.githack.com/tylerbmusic/geofs-utilities/refs/heads/main/userscript.js";document.body.appendChild(utilScript);})()
    }

    // Taxiway Lights — adds illuminated taxiway edge lights
    function twlights () {
        (() => {var twlScript = document.createElement('script'); twlScript.src="https://raw.githack.com/tylerbmusic/GeoFS-Taxiway-Lights/main/userscript.js";document.body.appendChild(twlScript);})()
    };

    // Taxiway Signs — adds ICAO-standard taxiway signage
    function twsigns() {
        (() => {var twsScript = document.createElement('script'); twsScript.src="https://raw.githack.com/tylerbmusic/GeoFS-Taxiway-Signs/main/userscript.js";document.body.appendChild(twsScript);})()
    }

    // -------------------------------------------------------------------------
    // UI TWEAKS
    // -------------------------------------------------------------------------

    // UI Tweaks — popout chat window
    function tweaks () {
        const POPOUT_CHAT=!0;!function e(){"use strict";if(!window.jQuery)return setTimeout(e,1e3);{let t=$('<button class="mdl-button mdl-js-button mdl-button--icon" tabindex="0"><i class="material-icons">text_fields</i></button>')[0];document.querySelectorAll(".geofs-button-mute").forEach(e=>e.parentNode.appendChild(t));let o,n,a;t.onclick=function(){n=(a=document.querySelector(".geofs-chat-messages")).parentNode,(o=window.open("about:blank","_blank","height=580, width=680, popup=1")).document.body.append(a),o.document.head.append($("<title>GeoFS - Chat</title>")[0]),o.document.head.append($("<style>.geofs-chat-message{opacity:1!important;font-family:sans-serif;}</style>")[0]),o.onbeforeunload=()=>n.append(a)},window.onbeforeunload=()=>o&&o.close()}}();
    }

    // -------------------------------------------------------------------------
    // ADDON EXECUTION — called immediately (no waiting required)
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // ADDON EXECUTION — called immediately (no waiting required)
    // -------------------------------------------------------------------------
    
    // First, initialize global UI components
    info();

    // Global Keybinds for Nexus Addons
    document.addEventListener('keydown', function(e) {
        // Toggle HUD minimization with 'K'
        if ((e.key === 'k' || e.key === 'K') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (typeof window.toggleNexusHud === 'function') {
                window.toggleNexusHud();
            }
        }
    });


    try { ai(); } catch(e) { console.error('Error in ai:', e); }
    try { adblock(); } catch(e) { console.error('Error in adblock:', e); }
    try { autoland(); } catch(e) { console.error('Error in autoland:', e); }
    try { athrottle(); } catch(e) { console.error('Error in athrottle:', e); }
    try { camera(); } catch(e) { console.error('Error in camera:', e); }
    try { chatFix(); } catch(e) { console.error('Error in chatFix:', e); }
    try { volume(); } catch(e) { console.error('Error in volume:', e); }
    try { fpv(); } catch(e) { console.error('Error in fpv:', e); }

    try { gpws(); } catch(e) { console.error('Error in gpws:', e); }
    try { stats(); } catch(e) { console.error('Error in stats:', e); }
    try { opengines(); } catch(e) { console.error('Error in opengines:', e); }
    try { pushback(); } catch(e) { console.error('Error in pushback:', e); }
    try { dolly(); } catch(e) { console.error('Error in dolly:', e); }
    try { slew(); } catch(e) { console.error('Error in slew:', e); }
    try { maritimeStructures(); } catch(e) { console.error('Error in maritimeStructures:', e); }
    try { streetlights(); } catch(e) { console.error('Error in streetlights:', e); }
    try { utilities(); } catch(e) { console.error('Error in utilities:', e); }
    try { twlights(); } catch(e) { console.error('Error in twlights:', e); }
    try { twsigns(); } catch(e) { console.error('Error in twsigns:', e); }
    try { tweaks(); } catch(e) { console.error('Error in tweaks:', e); }

    // -------------------------------------------------------------------------
    // DEFERRED ADDON EXECUTION — triggered by DOM element observation
    // Some addons depend on specific GeoFS UI elements being present first.
    // -------------------------------------------------------------------------

    // Realism Pack — delayed to ensure GeoFS DOM and job UI is stable
    setTimeout(() => { try { realism(); } catch(e) { console.error('Error in realism:', e); } }, 2000);

    // Extra Vehicles — delayed to ensure Realism Pack's livery selector has loaded
    setTimeout(() => { try { vehicles(); } catch(e) { console.error('Error in vehicles:', e); } }, 5000);

    // Jetbridge — delayed to ensure Extra Vehicles 'extras-button' has loaded
    setTimeout(() => { try { jetbridge(); } catch(e) { console.error('Error in jetbridge:', e); } }, 8000);

    // GMenu fix — hide the GMenu panel on load to prevent it opening/closing
    // alongside the GeoFS preferences panel (they share a toggle state)
    let cycled = false;
    const GmenuBtn = document.getElementById("gamenu");
    if (GmenuBtn && !cycled && window.gmenu) {
            window.gmenu.menuDiv.style.display = "none";
        cycled = true;
    }
    const gmenuObserver = new MutationObserver(() => {
        const GmenuBtn = document.getElementById("gamenu");
        if (GmenuBtn && !cycled && window.gmenu) {
            window.gmenu.menuDiv.style.display = "none";
            cycled = true;
            gmenuObserver.disconnect();
        }
    });
    gmenuObserver.observe(document.body, { childList: true, subtree: true });
}

// =============================================================================
// SECTION 5: ENTRY POINT
// Poll every 100ms until the GeoFS aircraft instance is ready, then wait an
// additional 1 second before injecting menus and executing addons. This ensures
// that the GeoFS UI is fully rendered and all global APIs are available.
// =============================================================================

// ── Robust entry point ──────────────────────────────────────────────────────
// Tries to call menus() once the preference panel is in the DOM.
// Falls back to a MutationObserver retry if the panel isn't ready yet.
function tryInjectMenus() {
    const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
    if (panel) {
        menus();
        return;
    }
    // Panel not found yet — watch for it
    const obs = new MutationObserver(() => {
        if (document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list')) {
            obs.disconnect();
            menus();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });
}

let _nexusStarted = false;
function startNexus() {
    if (_nexusStarted) return;
    _nexusStarted = true;
    tryInjectMenus();
    addonExecution();
}

// Primary trigger: wait for geofs.aircraft.instance (normal GeoFS load)
// Fallback trigger: if the aircraft instance check never resolves within 15 s,
// start anyway so the UI and addons still load.
let _nexusFallback = setTimeout(() => {
    clearInterval(waitForGeoFS);
    console.warn('GeoFS Nexus: aircraft instance not detected — starting with fallback.');
    startNexus();
}, 15000);

const waitForGeoFS = setInterval(() => {
    if (typeof geofs !== "undefined" && geofs.aircraft && geofs.aircraft.instance) {
        clearInterval(waitForGeoFS);
        clearTimeout(_nexusFallback);
        setTimeout(startNexus, 1000);
    }
}, 100);
