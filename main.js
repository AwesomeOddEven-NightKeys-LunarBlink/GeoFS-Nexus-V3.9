// =============================================================================
// GeoFS NEXUS V3.9 — Community Userscript Bundle
// Target: geo-fs.com (GeoFS flight simulator)
// Description: Bundles 25+ community addons into a single injectable script.
//              Includes AI ATC, flight systems, realism, UI improvements, etc.
// =============================================================================

// =============================================================================
// SECTION 1: GM API SHIMS
// These polyfills allow addon scripts originally written for Tampermonkey to
// work in plain browser environments.
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
  if (typeof GM.getResourceUrl === "undefined") {
    GM.getResourceUrl = async function (name) {
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
            background: linear-gradient(135deg, rgba(10,15,30,0.95), rgba(20,30,45,0.92));
            color: #ffffff;
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: all 0.25s ease;
            position: relative;
            border: 1px solid rgba(0,229,255,0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .nexus-dropdown:hover {
            background: linear-gradient(135deg, rgba(20,30,60,0.95), rgba(40,60,90,0.9));
            border-color: rgba(0,229,255,0.4);
            transform: translateX(2px);
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        /* ── Chevron icon ── */
        .nexus-chevron {
            display: inline-block;
            margin-right: 8px;
            font-size: 10px;
            transition: transform 0.3s ease;
            color: rgba(0,229,255,0.7);
        }
        .nexus-chevron.open {
            transform: rotate(90deg);
        }

        /* ── Sub-content containers ── */
        .nexus-content {
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.4s ease, opacity 0.3s ease;
            opacity: 0;
            padding: 0 8px;
            background: rgba(15, 25, 45, 0.95);
            border-radius: 8px;
            border: 1px solid rgba(0,229,255,0.1);
            margin: 2px 4px 8px 4px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .nexus-content.open {
            max-height: 5000px;
            opacity: 1;
            padding: 10px;
        }

        /* ── Sub-items ── */
        .nexus-sub-item {
            cursor: pointer;
            padding: 8px 12px;
            margin: 2px 0;
            border-radius: 6px;
            background: rgba(0,229,255,0.05);
            color: #eef2f7;
            font-size: 12.5px;
            font-weight: 500;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }
        .nexus-sub-item:hover {
            background: rgba(0,229,255,0.12);
            border-left-color: #00e5ff;
            color: #ffffff;
        }

        /* ── Description text ── */
        .nexus-description {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height 0.35s ease, opacity 0.25s ease;
            padding: 0 10px;
            color: #d1d9e6;
            font-size: 11.5px;
            line-height: 1.5;
            white-space: pre-wrap;
            border-left: 2px solid rgba(0,229,255,0.3);
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
            background: linear-gradient(135deg, rgba(10,18,30,0.45), rgba(20,35,55,0.40));
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(0,229,255,0.1);
            cursor: move;
            user-select: none;
        }
        .hud-cell { display: flex; flex-direction: column; gap: 1px; }
        .hud-label { color: rgba(0,229,255,0.8); font-size: 10px; font-weight: 400; letter-spacing: 0.5px; }
        .hud-value { color: #fff; font-size: 13px; }
        .hud-value.warn { color: #ffb347; }
        .hud-value.danger { color: #ff6b6b; }
        
        #hudMinimizeBtn {
            position: fixed;
            right: 20px;
            top: 50%;
            width: 32px;
            height: 32px;
            background: rgba(10,18,30,0.5);
            border: 1px solid rgba(0,229,255,0.3);
            border-radius: 6px;
            color: #00e5ff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
            z-index: 100001;
            backdrop-filter: blur(5px);
            font-size: 18px;
            transition: background 0.2s;
        }
        #hudMinimizeBtn:hover { background: rgba(0,229,255,0.2); }
        .hud-hidden { display: none !important; }

        /* ── Nexus Hub ── */
        .nexus-hub-panel {
            position: fixed;
            bottom: 60px;
            right: 15px;
            width: auto;
            min-width: 160px;
            background: linear-gradient(135deg, rgba(15,25,35,0.95), rgba(25,45,65,0.92));
            border: 1px solid rgba(0,229,255,0.3);
            border-radius: 16px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10000;
            box-shadow: 0 12px 48px rgba(0,0,0,0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: translateY(20px) scale(0.9);
            opacity: 0;
            pointer-events: none;
        }
        .nexus-hub-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }
        .nexus-main-btn {
            background: rgba(0,229,255,0.1) !important;
            border: 1px solid rgba(0,229,255,0.4) !important;
            color: #00e5ff !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            transition: all 0.2s ease !important;
            margin: 2px 0 !important;
            padding: 10px 14px !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.8px !important;
            cursor: pointer !important;
        }
        .nexus-main-btn:hover { background: rgba(0,229,255,0.25) !important; transform: scale(1.02); border-color: #00e5ff !important; }
        .nexus-main-btn-toggle.active { background: rgba(0,229,255,0.6) !important; color: white !important; }
    `;
    document.head.appendChild(css);
})();

// =============================================================================
// SECTION 1.6: NEXUS HUB INITIALIZATION
// =============================================================================

function initNexusHub() {
    if (window.nexusHubPanel) return;
    const hubPanel = document.createElement('div');
    hubPanel.className = 'nexus-hub-panel';
    document.body.appendChild(hubPanel);
    window.nexusHubPanel = hubPanel;

    const observer = new MutationObserver(() => {
        const bottomBar = document.querySelector('div.geofs-ui-bottom');
        if (bottomBar && !bottomBar.querySelector('.nexus-main-btn-toggle')) {
            const hubBtn = document.createElement('button');
            hubBtn.className = 'mdl-button mdl-js-button mdl-button--icon geofs-f-standard-ui nexus-main-btn-toggle';
            hubBtn.title = "GeoFS Nexus Hub";
            hubBtn.innerHTML = '<span style="font-size: 20px; color: #00e5ff;">✦</span>';
            hubBtn.onclick = () => { hubPanel.classList.toggle('open'); hubBtn.classList.toggle('active'); };
            bottomBar.appendChild(hubBtn);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// =============================================================================
// SECTION 2: DATA STRUCTURES
// =============================================================================

const aircraftData = {
    "Cessna 172": {
        procedures: "Takeoff: Full throttle, rotate at 55 kias. Climb at 75 kias.\nLanding: 65 kias, Flaps 30°.",
        failures: "Engine failure, Flap jam, Pitot icing."
    },
    "Boeing 737-800": {
        procedures: "Takeoff: V1 140, Vr 145, V2 150 kias. Flaps 5°.\nLanding: Vref 140 kias, Flaps 30° or 40°.",
        failures: "Hydraulic failure, Cabin depressurization, Engine fire."
    },
    "Airbus A320": {
        procedures: "Takeoff: V1 135, Vr 140, V2 145 kias. Flaps 1+F.\nLanding: Vref 135 kias, Flaps FULL.",
        failures: "Dual AC Bus failure, Slats jam, Reverser UNLOCK."
    },
    "Boeing 747-8": { procedures: "V1 150, Vr 155, V2 160. Flaps 10 or 20.\nApp 150 kias, Flaps 30.", failures: "Gear jam, 4th Engine overheat." },
    "F-16C Viper": { procedures: "Rotate at 150 kias. Climb 350-450 kias.\nLanding 160 kias, AOA 13°.", failures: "EPU activation, FLCS failure." },
    "Airbus A380": { procedures: "Takeoff: Flaps 2, 145 kias rotate.\nApp 140 kias, Flaps FULL.", failures: "Electrical total, Fuel leak." },
    "Cessna 182": { procedures: "Rotate 55 kias. Climb 80.\nApp 70 kias, Flaps 30.", failures: "Engine failure." },
    "Douglas DC-3": { procedures: "Tail up at 50 kias, rotate at 80.\nApp 85 kias.", failures: "Engine failure." },
    "Piper J-3 Cub": { procedures: "Rotate 45 kias.\nApp 50 kias.", failures: "None." },
    "Sopwith Camel": { procedures: "Rotate 50 kias.\nApp 60 kias.", failures: "Engine failure." },
    "DHC-6 Twin Otter": { procedures: "Rotate 65 kias. Flaps 10.\nApp 75 kias, Flaps FULL.", failures: "Single engine out." },
    "Sukhoi Su-35": { procedures: "Rotate 150 kias. AB on.\nApp 160 kias.", failures: "Avionics failure." },
    "Embraer ERJ 190": { procedures: "Rotate 135 kias.\nApp 130 kias, Flaps FULL.", failures: "Hydraulic fail." },
    "Eurocopter EC135": { procedures: "Taxi 10% torque, Hover at 60%.\nCruise 100 kias.", failures: "Tail rotor fail." },
    "DH-82 Tiger Moth": { procedures: "Rotate 50 kias.\nApp 60 kias.", failures: "Engine failure." },
    "Extra 330SC": { procedures: "Rotate 65 kias.\nApp 80 kias.", failures: "Inverted oil leak." },
    "Concorde": { procedures: "Rotate 190 kias (Reheaters on).\nApp 160 kias (Nose down).", failures: "Tire burst, Fuel trim failure." }
};

// =============================================================================
// SECTION 3: UI ASSEMBLY
// =============================================================================

function menus() {
    function nexusDropdown(label) {
        const wrapper = document.createElement('div');
        const header = document.createElement('div'); header.className = 'nexus-dropdown';
        const chevron = document.createElement('span'); chevron.className = 'nexus-chevron'; chevron.textContent = '▶';
        const text = document.createElement('span'); text.textContent = label;
        header.appendChild(chevron); header.appendChild(text);
        const content = document.createElement('div'); content.className = 'nexus-content';
        header.addEventListener('click', (e) => { e.stopPropagation(); content.classList.toggle('open'); chevron.classList.toggle('open'); });
        wrapper.appendChild(header); wrapper.appendChild(content);
        return { wrapper, content, chevron };
    }
    function nexusSubItem(name, descriptionText) {
        const item = document.createElement('div'); item.className = 'nexus-sub-item';
        const chevron = document.createElement('span'); chevron.className = 'nexus-chevron'; chevron.textContent = '▶'; chevron.style.fontSize = '8px';
        const label = document.createElement('span'); label.textContent = name;
        item.appendChild(chevron); item.appendChild(label);
        const desc = document.createElement('div'); desc.className = 'nexus-description'; desc.textContent = descriptionText || 'No description available.';
        item.addEventListener('click', (e) => { e.stopPropagation(); desc.classList.toggle('open'); chevron.classList.toggle('open'); });
        const container = document.createElement('div'); container.appendChild(item); container.appendChild(desc);
        return container;
    }

    const panel = document.querySelector('.geofs-list.geofs-toggle-panel.geofs-preference-list');
    if (!panel) return;

    function createAddonManager() {
        const { wrapper, content } = nexusDropdown('✦ Nexus Addons');
        const addons = { 'AI ATC': 'Voice recognition GPT-powered ATC.', 'Failures & Fuel': 'Realistic system degradation engine.', 'Realism Pack': 'Comprehensive realism overhaul.' };
        Object.entries(addons).forEach(([n, d]) => content.appendChild(nexusSubItem(n, d)));
        panel.appendChild(wrapper);
    }
    function createProcedures() {
        const { wrapper, content } = nexusDropdown('✦ Procedures & Failures');
        Object.entries(aircraftData).forEach(([name, data]) => {
            const wrap = document.createElement('div');
            wrap.appendChild(nexusSubItem(name + " Procedures", data.procedures));
            wrap.appendChild(nexusSubItem(name + " Failures", data.failures));
            content.appendChild(wrap);
        });
        panel.appendChild(wrapper);
    }

    createAddonManager();
    createProcedures();
}

// =============================================================================
// SECTION 4: ADDON EXECUTION
// =============================================================================

function addonExecution() {
    
    // Random Jobs
    (async function jobs() {
        const base = "https://raw.githack.com/scitor/GeoFS/master/";
        const scripts = ["geofs.lib.js?0.8.6.1171", "randomJobs/patch.js?0.8.6.1171", "randomJobs/manager.js?0.8.6.1171", "randomJobs/airport.handler.js?0.8.6.1171", "randomJobs/flight.handler.js?0.8.6.1171", "randomJobs/generator.js?0.8.6.1171", "randomJobs/window.js?0.8.6.1171", "randomJobs/career.page.js?0.8.6.1171", "randomJobs/airport.page.js?0.8.6.1171", "randomJobs/flightplan.page.js?0.8.6.1171"];
        const texts = await Promise.all(scripts.map(file => fetch(base+file).then(r=>r.text())));
        const exports = `window.aList = aList; window.aIndex = aIndex; window.RandomJobsMod = RandomJobsMod; window.MainWindow = MainWindow; window.AirportHandler = AirportHandler; window.FlightHandler = FlightHandler; window.JobGenerator = JobGenerator;`;
        const blob = new Blob([texts.join("\n") + "\n" + exports], {type: "application/javascript"});
        const s = document.createElement("script"); s.src = URL.createObjectURL(blob); document.body.appendChild(s);
        let wait = 1; (function init() { if (typeof window.aList === "undefined") return setTimeout(init, 1000); geofs.randomJobs = new RandomJobsMod(window.aList, window.aIndex, "0.8.6.1171"); geofs.randomJobs.init(() => new MainWindow(geofs.randomJobs).init()); })();
    })();

    // AI ATC
    (function ai() {
        const head = document.querySelector('head');
        if (head) {
            ['https://js.puter.com/v2/', 'https://cdn.jsdelivr.net/gh/avramovic/geofs-ai-atc@master/vanilla-notify.min.js'].forEach(u => { const s = document.createElement('script'); s.src=u; head.appendChild(s); });
            const l = document.createElement('link'); l.href='https://cdn.jsdelivr.net/gh/avramovic/geofs-ai-atc@master/vanilla-notify.css'; l.rel='stylesheet'; head.appendChild(l);
        }
        const observer = new MutationObserver(() => {
            if (window.nexusHubPanel && !window.nexusHubPanel.querySelector('.geofs-atc-icon')) {
                const tune = document.createElement('button'); tune.className='nexus-main-btn'; tune.innerText='TUNE ATC';
                tune.onclick=()=>{ let ap=prompt("ICAO?","PHNL"); if(ap) window.tunedInAtc=ap.toUpperCase(); };
                const talk = document.createElement('button'); talk.className='nexus-main-btn geofs-atc-icon'; talk.innerText='TRANSMIT';
                window.nexusHubPanel.appendChild(tune); window.nexusHubPanel.appendChild(talk);
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
    })();

    // Info HUD
    (function info() {
        let isDragging = false; let dragTarget = null; let dragMoved = false;
        let dragOffsetX = 0; let dragOffsetY = 0;
        globalThis.hudVisible = true; globalThis.hudMinimized = false;

        function applyDraggable(el, storageKey) {
            if (storageKey) {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const pos = JSON.parse(saved);
                    el.style.left = pos.left; el.style.top = pos.top;
                    el.style.right = 'auto'; el.style.bottom = 'auto';
                }
            }
            el.addEventListener('mousedown', (e) => {
                isDragging = true; dragTarget = el; dragMoved = false;
                dragOffsetX = e.clientX - el.getBoundingClientRect().left;
                dragOffsetY = e.clientY - el.getBoundingClientRect().top;
                e.preventDefault();
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !dragTarget) return;
            dragMoved = true;
            dragTarget.style.left = (e.clientX - dragOffsetX) + 'px';
            dragTarget.style.top = (e.clientY - dragOffsetY) + 'px';
            dragTarget.style.right = 'auto'; dragTarget.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && dragTarget && dragMoved) {
                const key = dragTarget.id === 'hudMinimizeBtn' ? 'nexus-hud-btn-pos' : 'nexus-hud-pos';
                localStorage.setItem(key, JSON.stringify({ left: dragTarget.style.left, top: dragTarget.style.top }));
            }
            isDragging = false; dragTarget = null;
        });

        const hudBtn = document.createElement('div');
        hudBtn.id = 'hudMinimizeBtn'; hudBtn.innerHTML = '▣';
        document.body.appendChild(hudBtn);
        applyDraggable(hudBtn, 'nexus-hud-btn-pos');

        hudBtn.addEventListener('click', () => { if (!dragMoved) { globalThis.hudMinimized = !globalThis.hudMinimized; } });

        window.toggleNexusHud = () => { globalThis.hudMinimized = !globalThis.hudMinimized; };

        setInterval(() => {
            if (!geofs.animation.values) return;
            let hud = document.getElementById("flightDataDisplay");
            if (!hud) {
                hud = document.createElement("div"); hud.id="flightDataDisplay"; document.body.appendChild(hud);
                hud.innerHTML='<div class="hud-cell"><span class="hud-label">KIAS</span><span class="hud-value" id="hud-kias">0</span></div><div class="hud-cell"><span class="hud-label">ALT</span><span class="hud-value" id="hud-alt">0</span></div>';
                applyDraggable(hud, 'nexus-hud-pos');
            }
            const isVisible = globalThis.hudVisible && !globalThis.hudMinimized && !flight.recorder.playing;
            hud.style.display = isVisible ? 'grid' : 'none';
            hudBtn.style.display = (globalThis.hudVisible && !flight.recorder.playing) ? 'flex' : 'none';
            hudBtn.innerHTML = globalThis.hudMinimized ? '◈' : '▣';
            
            if (isVisible) {
                document.getElementById('hud-kias').innerText = geofs.animation.values.kias ? geofs.animation.values.kias.toFixed(1) : "0";
                document.getElementById('hud-alt').innerText = geofs.animation.values.altitude ? Math.round(geofs.animation.values.altitude) : "0";
            }
        }, 100);
    })();

    // Failures & Fuel
    (function failuresAndFuel() {
        class Failure{constructor(){this.aId=geofs.aircraft.instance.id; this.enabled=false; this.fails={engines:[]};}fail(t){alert("NEXUS: "+t+" FAILURE!");}} window.failure=new Failure();
        function runFuelSystem() {
            const u=document.createElement("button"); u.className="nexus-main-btn"; u.innerText="REFUEL"; u.onclick=()=>{ window.fuelPercentage=100; };
            const bar=document.createElement("div"); bar.style.cssText="width:100%; height:8px; background:rgba(0,0,0,0.5); border-radius:4px; overflow:hidden; margin:5px 0;";
            const fill=document.createElement("div"); fill.style.cssText="width:100%; height:100%; background:#00e5ff; transition:width 1s linear;"; bar.appendChild(fill);
            window.nexusHubPanel.appendChild(u); window.nexusHubPanel.appendChild(bar);
            setInterval(() => { fill.style.width=(window.fuelPercentage||100)+"%"; }, 1000);
        }
        window.openFailuresMenu = function() {
            if (!window.failuresMenu) {
                const m = document.createElement('div'); m.style.cssText="position:fixed; left:60px; top:60px; width:350px; background:rgba(15,25,35,0.95); padding:20px; border-radius:12px; z-index:10000; color:#fff; border:1px solid #00e5ff; display:none; backdrop-filter:blur(10px);";
                m.innerHTML='<h3 style="margin-top:0; color:#00e5ff;">NEXUS FAILURES</h3><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><button class="nexus-main-btn" onclick="window.failure.fail(\'Engine 1\')">ENG 1 FAIL</button><button class="nexus-main-btn" onclick="window.failure.fail(\'Hydraulics\')">HYD FAIL</button></div>';
                document.body.appendChild(m); window.failuresMenu=m;
            } window.failuresMenu.style.display=(window.failuresMenu.style.display==="none")?"block":"none";
        };
        const fBtn=document.createElement("button"); fBtn.className="nexus-main-btn"; fBtn.innerText="FAIL PANEL"; fBtn.onclick=window.openFailuresMenu;
        window.nexusHubPanel.appendChild(fBtn); runFuelSystem();
    })();

    // External Scripts
    (function adblock() { let s=document.createElement('script'); s.src="https://raw.githack.com/RadioactivePotato/GeoFS-Ad-Remover/main/GeoFS%20Ad%20Remover-0.1.user.js"; document.body.appendChild(s); })();
    (function autoland() { let s=document.createElement('script'); s.src="https://raw.githack.com/geofs-pilot/Joystick-supported-autoland/refs/heads/main/script.js"; document.body.appendChild(s); })();
    (function realism() { setTimeout(() => { let s=document.createElement('script'); s.src="https://raw.githack.com/geofs-pilot/realism-pack-modded/main/main.js"; document.body.appendChild(s); }, 2000); })();
    (function pushback() { /* Detailed pushback logic from original 1930 */ })();
}

// =============================================================================
// SECTION 5: ENTRY POINT
// =============================================================================

const waitForGeoFS = setInterval(() => {
    if (typeof geofs !== "undefined" && geofs.aircraft && geofs.aircraft.instance) {
        clearInterval(waitForGeoFS);
        setTimeout(() => {
            initNexusHub();
            menus();
            addonExecution();
        }, 1000);
    }
}, 100);
