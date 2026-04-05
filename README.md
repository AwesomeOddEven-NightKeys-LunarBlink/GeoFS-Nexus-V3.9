<p align="center">
  <img src="logo.png" alt="GeoFS Nexus Logo" width="300px">
</p>

> [!IMPORTANT]
> ⚠️ **Performance Note**: This bundle may load slowly due to the 26+ integrated community addons. If the Nexus menu or UI fails to initialize, please **restart your flight** or **refresh the page**. ⚠️

# GeoFS Nexus V3.9
### The Ultimate All-in-One Community Userscript Bundle

**GeoFS Nexus** is a massive, high-performance integration of over 25 community-made addons for [Geo-FS](https://geo-fs.com). Instead of managing dozens of individual scripts, Nexus bundles everything into a single, polished payload with a modern UI, unified keybinds, and exclusive feature enhancements.

Experience AI-powered ATC, dynamic systems failures, realistic flight procedures, and a complete career mode—all with zero hassle and total immersion.

---

## 🚀 Key Features
- **26+ Integrated Addons**: From AI ATC to Realism Packs, all in one script.
- **Modern UI Suite**: Polished, glassmorphic dropdowns and a draggable HUD.
- **Real-World Procedures**: Built-in V-speeds, checklists, and rules for 20+ aircraft.
- **Dynamic Failures**: Experience engine fires, fuel leaks, and landing gear issues.
- **Career Mode**: Track your flights and earn your rank with Random Jobs.
- **One-Key Control**: Toggle everything easily with unified shortcuts.

---

## 🛠️ Installation Guide
1. **Install Tampermonkey**: Download and install the [Tampermonkey extension](https://www.tampermonkey.net/) for your browser (Chrome, Firefox, Edge, etc.).
2. **Create New Script**: Open the Tampermonkey dashboard, click the **"+"** (plus) icon to create a new script.
3. **Copy & Paste**: Replace the entire default code with the contents of [`tampermonkey.user.js`](./tampermonkey.user.js) from this repository.
4. **Save**: Click **File > Save**.
5. **Launch GeoFS**: Go to [geo-fs.com](https://www.geo-fs.com/geofs.php?v=3.9) and the script will initialize automatically after the aircraft loads.

---

## 📖 Complete Tutorial

### 1. Accessing the Nexus Menu
Once the script is loaded, click the **Gear Icon** (Preferences) in the GeoFS left-hand menu. You will see four new **✦ Nexus** sections:
- **✦ Addons**: View and enable/disable individual components.
- **✦ Procedures**: Access VFR/IFR rules, ATC phraseology, and flight checklists.
- **✦ Failures**: View emergency procedures for various system failures.
- **✦ Aircraft**: Step-by-step procedures and V-speeds for specific airplanes.

### 2. The Information Display (HUD)
The Nexus HUD provides real-time flight data like KIAS, Mach, AGL, G-force, and Fuel.
- **Toggle**: Press `K` to show/hide the HUD.
- **Move**: Click and drag the `⋯⋯⋯` handle at the top of the HUD or the `▣` icon on the right side of the screen to reposition them.
- **Warnings**: Values will turn **yellow** or **red** if you are overstressing the aircraft or running low on fuel.

### 3. AI Air Traffic Control
Nexus includes **AI ATC** powered by PuterJS GPT. 
- **Tuning In**: Click the **Headset Icon** in the bottom menu to set your airport frequency. You must be within 50nm of the airport.
- **Speaking**: Press and hold `D` (Push-to-Talk) to use your microphone.
- **Typing**: `Ctrl + Click` the headset icon to type your message instead.

### 4. Careers & Random Jobs
Navigate to the **Jobs** window to find flights departing from your current airport.
- Complete flights to track your statistics in the **Career** tab.
- Includes dynamic METAR syncing and airline icon fixes.

### 5. Managing Emergencies
Toggle **Failures** in the addon menu to experience realistic system issues. If a failure occurs (e.g., Engine Fire), refer to the **✦ Failures** menu for the correct emergency checklist.

---

## 📦 Addon Directory
| Addon Name | Description |
| :--- | :--- |
| **AI ATC** | PuterJS GPT-powered air traffic control with voice/text. |
| **Realism Pack** | Clickable cockpits, wingflex, sonic booms, and more. |
| **Autoland++** | Automated landing systems. |
| **Failures & Fuel** | Simulates system malfunctions and fuel consumption. |
| **GPWS** | Realistic terrain and minimums callouts for airliners. |
| **Landing Stats** | Detailed touchdown analysis (Vertical speed, G-force, Score). |
| **Random Jobs** | Career mode with departure tracking and logbooks. |
| **Slew Mode**| FSX-style position and attitude editor (`Y`). |
| **Sky Dolly** | Formation flying and flight recorder. |
| **Jetbridge** | Interactive, animated jetways for all gates. |
| **Extra Vehicles** | Adds JXT vehicles and custom objects. |
| **Sea Structures** | Adds maritime buildings and structures to the ocean. |
| **Taxiway Lights/Signs** | ICAO-standard airport lighting and signage. |

---

## ⌨️ Keybinds Reference
| Key | Action |
| :--- | :--- |
| `K` | Toggle Information Display (HUD) |
| `D` | AI ATC Push-to-Talk (Hold) |
| `Shift + ~` | Toggle Autothrottle |
| `Q` | Toggle Overpowered Engines (6x Thrust) |
| `W` | Toggle Camera Cycling (Every 30s) |
| `Y` | Toggle Slew Mode |
| `I` / `K` / `J` / `L` | Slew Move: Forward / Back / Left / Right |
| `U` / `Enter` | Slew Move: Up / Down |
| `E` | Ejection Seat (Realism Pack) |
| `Insert` | Hide Flight Path Vector |
| `T` | Fix GeoFS Chat Window (Re-enables T bind) |

---

---

## 🌍 Resource Directory (External Addons)
GeoFS Nexus dynamically loads these high-quality community scripts. 

| Addon Category | Development Source |
| :--- | :--- |
| **Realism Mod** | [geofs-pilot/realism-pack-modded](https://raw.githack.com/geofs-pilot/realism-pack-modded/main/main.js) |
| **AI ATC Service** | [avramovic/geofs-ai-atc](https://raw.githack.com/avramovic/geofs-ai-atc/master/airports.json) |
| **Jetbridge System** | [Spice9/Geofs-Jetbridge](https://raw.githack.com/Spice9/Geofs-Jetbridge/main/jetbridge-main.js) |
| **Autoland Pro** | [geofs-pilot/Joystick-supported-autoland](https://raw.githack.com/geofs-pilot/Joystick-supported-autoland/refs/heads/main/script.js) |
| **Landing Statistics** | [tylerbmusic/geofs-utilities](https://raw.githack.com/tylerbmusic/geofs-utilities/refs/heads/main/userscript.js) |
| **Sky Dolly Utility** | [tylerbmusic/GeoFS-Sky-Dolly](https://raw.githack.com/tylerbmusic/GeoFS-Sky-Dolly/main/userscript.js) |
| **Maritime Structures** | [CementAndRebar/GeoFS-Extra-Maritime-Structures](https://raw.githack.com/CementAndRebar/GeoFS-Extra-Maritime-Structures/main/main.js) |
| **Airport Signage** | [tylerbmusic/GeoFS-Taxiway-Signs](https://raw.githack.com/tylerbmusic/GeoFS-Taxiway-Signs/main/userscript.js) |
| **Chat Fix Tool** | [ZetaPossibly/GeoFS-Chat-Fix](https://raw.githack.com/ZetaPossibly/GeoFS-Chat-Fix/refs/heads/main/fix_chat.js) |
| **Ad Remover** | [RadioactivePotato/GeoFS-Ad-Remover](https://raw.githack.com/RadioactivePotato/GeoFS-Ad-Remover/main/GeoFS%20Ad%20Remover-0.1.user.js) |

---

## ❤️ Special Thanks & Appreciation
A project of this scale is only possible because of the incredible talent in the GeoF-S community. We want to extend a massive thank you to everyone who has contributed:

- **AwesomeOddEven**, **NightKeys**, and **LunarBlink** for the core engineering and vision.
- **Scitor**, **Kolos26**, and **JXT** for their foundational scripts that paved the way.
- **Spice9**, **CementAndRebar**, **RadioactivePotato**, and **ZetaPossibly** for their specialized mods.
- **Tylerbmusic** for providing the audio resources and utilities that make landing feel real.
- **The Alpha Testers** and users who report bugs to keep the project soaring.

*Disclaimer: This is a community-made project and is not officially affiliated with Geo-FS.*

