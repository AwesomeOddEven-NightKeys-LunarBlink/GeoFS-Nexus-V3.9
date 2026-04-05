<p align="center">
  <img src="logo.png" alt="GeoFS Nexus Logo" width="300px">
</p>

> [!IMPORTANT]
> ⚠️ **Performance Note**: This bundle may load slowly due to the 26+ integrated community addons. If the Nexus menu or UI fails to initialize, please **restart your flight** or **refresh the page**. ⚠️
>
> 💥 **UI Layout & Camera Fixes**:
> - **Bottom Bar Overlapping**: If the bottom bar looks "exploded" (too many icons), please **zoom out** your browser using `CTRL` + `-` or `CMD` + `-`.
> - **Missing Gear/Flaps**: If you don't see the Gear or Flaps buttons in the bottom right, press `G` or `F` once to activate them.
> - **Broken Camera**: If the camera view breaks, click the **CAMERA** button in the top menu and re-select **Follow Cam** to fix it.


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

## 📚 Sources and Contributors
GeoFS Nexus is a massive collaborative effort, integrating the work of many talented developers within the Geo-FS community. Below is a comprehensive list of all the sources and individuals who have contributed to this project:

### 🏗️ Core Engineering
*   **AwesomeOddEven** - Lead architect, project vision, and core integration.
*   **NightKeys** - UI design lead, glassmorphism implementation, and modern aesthetic overhaul.
*   **LunarBlink** - Systems engineering, cross-addon compatibility, and optimization.

### 🎙️ AI Air Traffic Control (ATC)
*   **Milan Avramovic ([avramovic](https://github.com/avramovic))** - Developer of the [geofs-ai-atc](https://github.com/avramovic/geofs-ai-atc) system.
*   **[Puter.js](https://js.puter.com/)** - AI engine for PuterJS GPT-powered ATC interactions.
*   **[Vanilla Notify](https://github.com/avramovic/geofs-ai-atc/blob/master/vanilla-notify.min.js)** - Notification system used for real-time ATC communication feedback.

### ✈️ Realism & Aircraft Systems
*   **[geofs-pilot](https://github.com/geofs-pilot)** - Developer of the [Realism Pack Modded](https://github.com/geofs-pilot/realism-pack-modded), adding wingflex, clickable cockpits, and sonic booms.
*   **[geofs-pilot](https://github.com/geofs-pilot)** - Developer of [GPWS](https://github.com/geofs-pilot/geofs-gpws-modified), [Cockpit Volume](https://github.com/geofs-pilot/geofs-cockpit-volume), and [Autoland Pro](https://github.com/geofs-pilot/Joystick-supported-autoland).
*   **[Kolos26](https://github.com/kolos26)** - Creator of the original Livery Selector (integrated within Realism Pack).
*   **[MeatBroc](https://github.com/meatbroc)** - Developer of the [Autothrottle](https://github.com/meatbroc/geofs-autothrottle) utility.
*   **[Tylerbmusic](https://github.com/tylerbmusic)** - Contributor of [Landing Statistics](https://github.com/tylerbmusic/geofs-utilities), [Slew Mode](https://github.com/tylerbmusic/GeoFS-Slew-Mode), [Sky Dolly](https://github.com/tylerbmusic/GeoFS-Sky-Dolly), and high-quality audio resources.

### 🏢 World Enhancement & Infrastructure
*   **[Spice9](https://github.com/Spice9)** - Developer of the [Jetbridge System](https://github.com/Spice9/Geofs-Jetbridge) and animated airport objects.
*   **[CementAndRebar](https://github.com/CementAndRebar)** - Developer of the [Extra Maritime Structures](https://github.com/CementAndRebar/GeoFS-Extra-Maritime-Structures) mod.
*   **[JXT (af267)](https://github.com/af267)** - Provider of the [Extra Vehicles](https://github.com/af267/GeoFS-Extra-Vehicles) expansion pack.
*   **[Tylerbmusic](https://github.com/tylerbmusic)** - Developer of [Taxiway Signs](https://github.com/tylerbmusic/GeoFS-Taxiway-Signs) and [Taxiway Lights/Lighting](https://github.com/tylerbmusic/GeoFS-Taxiway-Lights).

### 🛠️ Key Tools & Fixes
*   **[Scitor](https://github.com/scitor)** - Developer of [Random Jobs](https://github.com/scitor/GeoFS) career mode and mission generator.
*   **[ZetaPossibly](https://github.com/ZetaPossibly)** - Developer of the [GeoFS Chat Fix](https://github.com/ZetaPossibly/GeoFS-Chat-Fix) tool.
*   **[RadioactivePotato](https://github.com/RadioactivePotato)** - Developer of the [Ad Remover](https://github.com/RadioactivePotato/GeoFS-Ad-Remover) utility.

### 🌟 Community Support
*   **SALhik** - For his continuous feedback, bug reporting, and stress-testing.
*   **Scitor, Kolos26, and JXT** - For their foundational scripts that paved the way for modern GeoFS modding.

---
*Disclaimer: This is a community-made project and is not officially affiliated with Geo-FS.*

