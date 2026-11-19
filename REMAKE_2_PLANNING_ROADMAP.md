# DRAWSTAR REMAKE 2.0 — MASTER ARCHITECTURE & DEVELOPMENT ROADMAP

> **SOURCE OF TRUTH FOR REMAKE 2.0**: Completely self-contained architectural blueprint. Any AI agent reading this document has all data models, algorithms, 37 starting city definitions, 37 10-team youth league rosters, all 8 player archetype stat tables, bad reputation formulas, agent equations, store pricing tables, business ROI equations, physical growth formulas, individual world awards, farewell testimonial match mechanics, penalty QTEs, quality presets, startup onboarding flow, tutorial toggle rules, and phased milestones required to build Remake 2.0 without needing access to legacy code.  
> **CURRENT STATUS**: STRICT PLANNING MODE (No source code modifications until user approval).  
> **CLEANUP STATUS**: Legacy migration scripts (`/scripts/`, `updateLoc.js`, `all_cards_export.json`) safely purged. Codebase builds cleanly.

---

## 1. CORE PHILOSOPHY & PILLARS

### Pillar I: The Living, Unforgiving World Engine ("We Are Not the Special One")
* **Living Global Ecosystem:** 10,000+ autonomous footballers across 20+ global leagues develop, peak, stagnate, rot, and retire independently of the user player.
* **Brutal Realism & Variable Fates:** You are merely one footballer in the ecosystem. You can peak at 57 OVR in the Mexican 2nd division and retire in obscurity with 0 trophies. Or you could have 94 potential, tear your ACL twice, lose your pace, and spend your career in the English Championship.
* **Flavor & Destinies via Cards:** Cards do not provide pay-to-win cheat codes; they represent luck, heritage, life opportunities, and catastrophic disasters:
  * *Disaster Cards:* Muramasa Blade, Career-Threatening Injury, Agent Extortion, Club Hostage Lock, Locker Room Mutiny, Media Scandal.
  * *Breakthrough Cards:* Miracle Surgery Recovery, Late Bloomer Awakening, Tactician's Protégé, Stat Break Ascension.

### Pillar II: Unified Fullscreen Console Architecture (PS2 / PS3 Era)
* **Zero Window-in-Window Dialogs:** Complete elimination of nested modals, overlapping popups, and tiny scrollable sub-windows.
* **Fullscreen Screen Stack:** Every menu, event, match, and editor is a dedicated 100% viewport screen with a universal Return/Back action (`[O]` / `ESC` / `Back Button`).
* **Dynamic Morphing 32-Bit UI:** Menus change geometric accents, beveled borders, and color palettes depending on the active competition (e.g. Neon Magenta for Premier League, Ornate Gold for UCL, Concrete Slate for Street Football).

### Pillar III: Three-Tier Match System (Playable 2D, SIM, Quick Sim)
* **Tier 1: "Play Match" (2D Pixel Gameplay):** Full playable top-down pitch inspired by *Sensible World of Soccer* and *Retro Goal*, with aftertouch curve shots, 360° passing, slide tackles, and goalkeeper duels. Directly renders the player's 32-bit custom sprite model.
* **Tier 2: "SIM Match" (Interactive Tactical QTE):** The tactical chance system from v1.0. Critical match moments pause for interactive decisions (1v1 with keeper, last-ditch tackle, penalty shootout QTE, tactical shift).
* **Tier 3: "Quick Sim" (Instant Engine):** Ultra-fast Poisson-Elo simulation resolving background and skipped matches in <1 millisecond on budget hardware.

### Pillar IV: Universal Accessibility & Inclusivity
* **Game Reader & Screen Reader:** Native speech synthesis narrating menus, match commentary, and dialogue choices for visually impaired/blind players.
* **Colorblind Visual Pipelines:** True mathematical Protanopia, Deuteranopia, Tritanopia, and High-Contrast modes built into canvas and CSS themes.
* **One-Handed Mobile Mode:** Ergonomic thumb-cluster layout toggleable for left or right hand.
* **Universal Input Abstraction:** Seamless switching between Touch, Gamepad (D-Pad, Face Buttons, Bumpers), and Desktop Keyboard/Mouse.

---

## 2. GRAPHIC QUALITY PRESETS & ENGINE OPTIMIZATION

Remake 2.0 supports 3 distinct rendering modes selectable in Settings and calibrated during initial setup:

| Preset | Target Platform | Visual Presentation | Architectural Rules |
| :--- | :--- | :--- | :--- |
| **Performance** | Low-End Android (Mali-G52, Adreno 5xx), Budget Tablets, Legacy Laptops | **Ultra-Simplistic Flat Minimalist** | • **Zero Backdrop Shaders:** No `backdrop-blur-*`. Solid high-contrast backgrounds (`#020617`, `#0f172a`).<br>• **Zero Overdraw Shadows & Glows:** Solid 1px borders instead of box-shadows.<br>• **Zero Scanlines & Dither Overlays:** Display none for scanline elements.<br>• **Flat Rectangles:** No complex polygon clip-paths (`pixel-corners`).<br>• **Instant Transitions:** 0ms animation time for lightning speed (solid 60/120 FPS). |
| **Balanced** | Standard PCs, Mainstream Phones, Consoles | **32-Bit Retro Arcade (CPS-2 / Neo Geo / SNES)** | Stepped orthogonal pixel corners (`.pixel-corners`), tactile bevel highlights (`.pixel-bevel-gold`, `.pixel-bevel-raised`), subtle CRT scanlines, arcade typography (`Press Start 2P`, `Silkscreen`, `Chakra Petch`). |
| **High Quality** | High-End PCs, Flagship iOS/Android, Ultra Displays | **Modern Next-Gen Cyber-Arcade Glass** | Frosted multi-layer glassmorphism (`backdrop-blur-2xl`), interactive 3D gyroscope/cursor tilt, dynamic neon ambient blooms, 60fps micro-particle stadium floodlights, smooth bezier curves. |

* **DOM Synchronization:** Presets update `html[data-quality="performance" | "balanced" | "high"]`, font scales (`sm`, `base`, `lg`, `xl`), and mathematical colorblind filters (`none`, `protanopia`, `deuteranopia`, `tritanopia`, `high_contrast`).

---

## 3. GAME STARTUP SEQUENCE & TUTORIAL SYSTEM

### A. The Startup Intro Flow & Pre-Boot Profile Detection (`StartupIntroFlow`)

The startup sequence features smart hardware detection, persistent profile routing, and an instant **Quick Resume** shortcut:

```
                      [GAME APPLICATION LAUNCH]
                                  │
          ┌───────────────────────┴───────────────────────┐
   [Profile Exists in Storage]                     [No Profile Found]
          │                                               │
   • Pre-load profile settings                    • Play 32-bit Animated Logo
     (Language, Preset, Audio)                    • Step 1: Language Selector
   • Play 32-bit Animated Logo                      (Immediate UI translation)
          │                                       • Step 2: Quality Preset
   ┌──────┴──────────────────────┐                  (GPU/RAM hardware scan)
[Active Career Save Found]  [No Active Save]      • Step 3: Profile Creator
   │                              │                 (3-profile slot setup,
   ▼                              │                  4 presets / Custom avatar)
[QUICK RESUME PROMPT]             │                       │
 • [▶️ Quick Resume] ─────────────┼───────────────► [MAIN MENU SCREEN]
   (Direct jump into career)      ▼
 • [🏠 Main Menu] ─────────► [MAIN MENU]
```

#### 1. Pre-Boot Profile Detection (Before Logo Renders)
* Prior to displaying the animated DrawStar logo, the engine queries storage (`getActiveProfileId()`, `getProfileList()`).
* **If an Existing Profile is Detected:**
  * Instantly loads that profile's stored configuration (language packet, graphic quality preset, audio volume, colorblind filter, and active option file).
  * Plays the **32-Bit Animated DrawStar Logo Sequence** with retro synthesizer audio chime (tap or press `(X)` / `Enter` to skip).
  * Performs an instant check for an existing Unique Career save (Continue slot or Slots 1–3).
    * **Active Career Found $\rightarrow$ "Quick Resume" Prompt:** A sleek 32-bit prompt asks:
      * `[▶️ Quick Resume]`: Bypasses all main menus and loads straight into the last saved state of Unique Career for immediate play.
      * `[🏠 Main Menu]`: Exits to the standard Main Menu.
    * **No Active Career Found:** Transitions smoothly from the logo sequence directly to the Main Menu.

#### 2. First-Launch Sequence (When No Profile Exists)
When a fresh user launches the game or all profiles have been deleted:
1. **Animated DrawStar Logo Sequence:**
   * 32-bit animated boot logo with retro synthesizer chime.
2. **Step 1: Language Selection:**
   * Interactive carousel/grid of the 5 synchronized language packets (`es_ES`, `es_AR`, `en_GB`, `pt_BR`, `fr_FR`).
   * **Instant Application:** From the moment a language is selected, all subsequent screens, prompts, and audio cues immediately display in that language.
3. **Step 2: Graphic Preset Selection:**
   * Built-in hardware detection (`detectDeviceHardware()`) analyzes GPU vendor, RAM, and CPU core count, automatically recommending:
     * **Performance Mode:** For lower-spec mobile chips, budget tablets, or legacy laptops.
     * **Balanced Mode:** For standard PCs, mainstream phones, and consoles (stepped pixel corners, scanlines).
     * **High Quality Mode:** For flagship devices (multi-layer frosted glass, dynamic bloom).
4. **Step 3: Profile Creator & Avatar Setup:**
   * Enters the complete Profile Creator wizard (see Section 4 for avatar options and preset clubs).
   * Persists profile data and transitions to the Main Menu with a 3-second celebratory fanfare.

### B. The Strict Tutorial Rule (`tutorialSystem.ts`)
* All in-game explainer callouts, tooltip overlays, Wiki prompts, and tutorial modals are gated behind `isTutorialEnabled()`.
* **If Tutorial is OFF:** No tutorial modals, arrows, or explanatory popups ever appear anywhere in the game. All screens immediately open directly to their functional interfaces without interruptions.

### C. Mandatory First-Time Player Store Onboarding Flow (`storeOnboarding.ts`)
When a brand-new player creates their first profile and arrives at the Main Menu, the game initiates the **First-Time Store Onboarding Flow** before allowing entry into Unique Career:
1. **Starting Balance (0 Champion Coins):**
   * New profiles start with **🪙 0 Champion Coins** (no artificial handouts). Players must earn their currency through real performances.
2. **Forced Store Navigation Tutorial:**
   * The UI highlights and directs the player to open the **Card Store**.
   * Introduces the distinction between in-run unique items and global card packs.
3. **All 5 Starter Packs are 100% FREE (0 Champion Coins):**
   * To establish the player's initial collection, all starter packs are set to **0 Coins**:
     * **🥉 Bronze Starter Pack (50 Cards):** Cost: **FREE (0 Coins)**
     * **🥈 Silver Starter Pack (25 Cards):** Cost: **FREE (0 Coins)**
     * **🥇 Gold Starter Pack (15 Cards):** Cost: **FREE (0 Coins)**
     * **⚔️ Double-Edged Starter Pack (50 Cards):** Cost: **FREE (0 Coins)**
     * **💎 EPIC Upgrade Starter Pack (25 Cards, Guaranteed Legendary & Iconic Cards):** Cost: **FREE (0 Coins)** — Provides top-tier foundational heritage cards without spending currency.
4. **Mandatory Pack Opening & Duplicate Recycle Tutorial:**
   * The tutorial guides the player to claim and open the **Bronze Starter Pack** and claims the free starter bundles.
   * Illustrates card rarity animations, card categories, and deck additions.
   * Directs the player to the **DECK Collection Album** where duplicate cards are identified.
   * Explains the **"Dust" Economy**: prompts the player to press `[♻️ Recycle All Duplicates]` to convert repeated cards into Dust while preserving 1 copy of every unique card.
   * Reveals the glowing header **Dust Meter** and guides the player to inspect the **Upgrades** tab (the 11 permanent meta-perks).
5. **One-Time Claim Rule:**
   * Once claimed, each starter pack is marked permanently as **`[CLAIMED / OUT OF STOCK]`** and cannot be re-purchased.
   * The player is now fully equipped with a starter card deck and returns to the Main Menu to begin their maiden Unique Career!

---

## 4. MULTI-PROFILE & LOCAL SAVE SYSTEM (`profileSystem.ts` & `careerSaveSystem.ts`)

DrawStar Remake 2.0 provides an isolated, multi-user storage architecture supporting up to **3 independent profiles**:

### A. The 3-Profile Architecture & Strict Scoped Isolation
* **Maximum 3 Profiles:** Up to 3 distinct profiles can exist concurrently on the same device (`profile_1`, `profile_2`, `profile_3`).
* **Strict Scoped Data Boundary ("New Profile = Brand New Game"):**
  Every profile maintains its own completely isolated storage keys:
  `drawstar_profile_${profileId}_*`
  * **Champion Credits & Dust Balance:** Independent wallets; no cross-profile currency leaks.
  * **Unlocked Card Album & Deck:** Unique collection per profile.
  * **Career Save Slots (3 Slots + Continue + Autosave):** Each profile has 3 manual save slots plus a dedicated quick-resume Continue slot.
  * **Settings & Language Preferences:** Independent graphics, audio, and language packets per profile.
  * **Option Files:** Scoped custom rosters, names, and team edits.
* Creating a new profile provides a 100% clean, fresh game experience without erasing another player's progress.

### B. Profile Avatar & Emblem Creation
When setting up or editing a profile, players select their visual identity:

#### 1. Four Quick Emblem Presets (With Matching Color Themes)
For players who want an instant, iconic identity without manual design:
1. **Madrid Chamartín / Real Madrid:** Royal White & Gold crown crest with Midnight Obsidian background.
2. **Barcelona Blaugrana / FC Barcelona:** Deep Garnet & Royal Blue shield with Navy Gold background.
3. **North London Gunners / Arsenal:** Scarlet & Gold cannon crest with Crimson Slate background.
4. **Turin Zebras / Juventus:** Iconic Monochrome J-Shield with Matte Charcoal background.
*(All preset club names adapt dynamically to active localization and Option File settings).*

#### 2. The 5th Choice: "CUSTOM" Identity Engine
Tapping `[CUSTOM]` unlocks two flexible design avenues:
* **Option A: Global Club Emblem Picker:**
  Browse and select any official crest from the 400+ clubs in the global database (across all 20+ domestic leagues and 37 youth leagues).
* **Option B: 32-Bit Character Creator Player Face:**
  Opens the full 32-bit pixel face generator (skin tone, eye shape/color, eyebrows, nose, mouth, hair style & color, facial hair, accessories/glasses) identical to the Unique Career Character Creator. Players can design their own custom pixel face and wear it as their profile badge.
* **Custom Background Color:** Select custom accent/background gradients (`royal_navy`, `emerald`, `crimson`, `gold`, `violet`, `charcoal`).

### C. Persistent Top-Right Avatar Display
* **Universal Presence:** The active profile's avatar badge, profile name, and current level are permanently rendered in the **top-right corner of the console shell across all menus, the store, the card album, and the editors**.
* **Clean Visibility Exceptions:** Automatically hidden during active matchplay (Playable 2D matches, SIM tactical match moments) and during fullscreen **Cinematics** to maximize immersive field presence.
* **Interactive Profile Hub:** Clicking or pressing `[Profile]` on the top-right avatar instantly opens the Profile Management Modal, allowing players to switch active profiles, edit avatars, inspect career trophy cabinets, or export save files.

### D. The Boyhood "Home Club" Affinity Engine (`homeClubSystem.ts`)
Football is rooted in tribal devotion and childhood passion. When initializing a Unique Career, players establish their emotional allegiance through the **Home Club Prompt**:

#### 1. The Boyhood Club Choice Flow
* **During Starting Academy Selection:** The game asks:
  $$\text{"Is [Starting Academy Club] your boyhood club, or are you a lifelong supporter of another club in your nation?"}$$
* **The Options:**
  1. *[Stay Loyal to Starting Club]:* Your youth academy's parent club becomes your permanent boyhood club.
  2. *[Choose My True Home Club]:* Opens a national club picker containing all top-flight, second-tier, and historic clubs in your home nation (e.g. an Italian player can choose Empoli FC, Napoli, Juventus, or Roma; an English player can choose Burnley, Arsenal, or Liverpool; an Argentine player can choose Boca Juniors, River Plate, or Rosario Central).
* This choice registers `homeClubId` and `isBoyhoodClubSupporter = true` into the career save file.

#### 2. Unique Lifetime Narrative Events & Mechanics
Designating a Home Club fundamentally alters mid-career and veteran dynamics:
1. **The Veteran "Come Back Home" Call (Age 31+):**
   * As you reach the twilight of your career, if you are playing abroad or for another club, your Home Club's sporting director calls you directly via the **Phone Call Event Engine**.
   * They offer an emotional contract to return home and finish your career wearing the shirt of your boyhood dreams.
   * Accepting triggers a special **Homecoming Presentation Cinematic**, wild city celebrations, guaranteed leadership standing, and activates the **Homecoming Icon Points Engine (Section 25.E)**. Arriving world legends gain instant Tier 3–4 (or Tier 5 at underdog clubs) standing on day one!
2. **Anytime "Return Home" Transfer Directive:**
   * At any transfer window, you can instruct your agent: *"Prioritize a move to my boyhood club."* Your agent will immediately submit inquiries to your Home Club, accepting lower wage tiers if necessary to make the dream transfer happen.
   * **Permanent Standing Guarantee:** If you previously played for the club and reached e.g. Tier 4, you **remain Tier 4 upon returning** (all previous icon points are 100% preserved), plus you receive the $+50$ to $+100$ point Returning Hero loyalty bonus! If arriving for the first time, your peak career stature unlocks instant Tier 2 to Tier 4 status on arrival.
3. **The "Rescue the Club" Financial & Relegation Crisis Event:**
   * If your Home Club suffers financial distress, slips into administrative debt, or faces relegation to lower tiers, an emergency narrative dilemma triggers:
     * *Choice A (Philanthropic Bailout):* Donate personal career fortune (€500k to €10,000,000 depending on club size and player wealth) to save the youth academy and clear debts, earning permanent club veneration and +50 Icon Points.
     * *Choice B (The Savior Transfer):* Request an immediate emergency transfer to join the club on reduced wages, fighting on the pitch to rescue them from relegation!
     * *Choice C (Minority Ownership Stake):* Purchase an equity stake in the club (integrating with the Business Engine), becoming player-part-owner.
4. **Dynamic Scaling by Club Stature:**
   * **Super Giant Home Club (e.g., Real Madrid, Barcelona, Bayern Munich):**
     * Never faces financial insolvency. Instead, the narrative focuses on the immense pressure of proving you are elite enough to represent the Galácticos/royalty. Fans expect multiple UCLs and Ballon d'Or standards.
   * **Mid-Tier / Underdog Home Club (e.g., Empoli FC, Burnley, Rayo Vallecano, Rosario Central):**
     * Financial bailouts are realistically achievable; returning from abroad turns you into an immediate cultural deity; you are awarded the captain's armband upon arrival, and any top-flight silverware won triggers the maximum underdog miracle multipliers (Section 25.D).

5. **The Annual 5% "Homesick Family Call" & Continental Flight Fatigue Engine (`homesickFamilyEvent.ts`):**
   * **Eligibility & Probability:**
     * Rolled **once per season (5% annual probability)** if the player is currently playing in a league **outside their primary homeland/nationality** (e.g., a Colombian or Argentine playing in the Premier League, an English player playing in Serie A or Japan, a Japanese player in La Liga).
   * **The Narrative Dilemma:**
     * Your family calls you via the **Phone Call Event Engine** (Section 20.D). They miss you dearly, feeling the strain of foreign distance, family health matters, or homesickness, and ask you:
       $$\text{"Son, we need you closer to home. Can you talk to your agent and find a way back to the motherland?"}$$
   * **The 3 Branching Player Choices:**
     * **Choice A: Request Return to Home League / Boyhood Club (`negotiateReturnHome`):**
       * You instruct your agent to negotiate an exit with your current club. The resolution algorithm evaluates your contract status, remaining years, player wage, and boyhood club transfer budget:
         * *Path 1 — 1-Year / 6-Month Loan:* Triggered if you have 2+ years left on an expensive contract and your Home Club cannot afford the transfer fee. Current club and Home Club agree to a 50/50 or 70/30 wage-split loan.
         * *Path 2 — Permanent Transfer:* If your Home Club has accumulated sufficient budget or you accept a wage reduction tier to match their wage cap.
         * *Path 3 — Mutual Contract Termination / Release:* If you are in the final year of your contract or negotiate a compassionate release with club management.
       * *Outcome:* You return home to wear your boyhood colors, boosting Family Happiness to 100%, resetting homesickness, and earning +25 Home Club Icon Points!
     * **Choice B: Emergency Family Visit Flight (`emergencyRoundtripVisit`):**
       * You stay committed to your overseas club, but immediately book an expedited round-trip flight back home to spend 3–4 days resolving family matters before flying back to rejoin the squad.
       * *Physical Cost (The Continental Distance Fatigue Penalty):* Long-haul transatlantic and transcontinental flights cause jet lag, disrupted recovery, and travel exhaustion. A temporary **Fitness & Stamina / Energy Penalty** is deducted from your player's condition for the next 2 matchdays, calculated directly by the **Continental Distance Matrix**:
       
       | Origin Continent | Destination Continent (Homeland) | Travel Distance Profile | Temporary Stamina & Fitness Penalty |
       | :--- | :--- | :--- | :---: |
       | **Same Continent** | Domestic flight / Short-haul (e.g., England $\leftrightarrow$ Spain, Argentina $\leftrightarrow$ Brazil) | Intra-continental baseline | **-5% Fitness & Stamina** |
       | **Europe** | **Africa** | North-South continental transition | **-10% Fitness & Stamina** |
       | **Europe** | **Asia** | East-West multi-time zone crossing | **-10% Fitness & Stamina** |
       | **Europe** | **North America** | Transatlantic flight (5–8 time zones) | **-10% Fitness & Stamina** |
       | **Europe** | **South America** | Deep transatlantic long-haul (11–14 hours) | **-15% Fitness & Stamina** |
       | **North America** | **South America** | Hemispheric transition | **-10% Fitness & Stamina** |
       | **North America** | **Asia or Africa** | Transpacific / Transatlantic long-haul | **-15% Fitness & Stamina** |
       | **South America** | **Asia** | Near-antipodal transpacific route | **-20% Fitness & Stamina** |
       | **Europe** | **Oceania** (Australia / NZ) | Full antipodal marathon (22–26 hours flight) | **-20% Fitness & Stamina** |
       | **South America** | **Oceania** | Trans-Pacific Southern Ocean route | **-20% Fitness & Stamina** |
       | **Asia** | **Oceania** | Regional Pacific crossing | **-10% Fitness & Stamina** |

     * **Choice C: Reassure Family & Stay Focused on Overseas Career:**
       * You explain to your family that you must remain 100% focused on European/foreign sporting glory.
       * *Outcome:* Zero physical stamina loss; preserves peak condition for upcoming matches; but incurs a small temporary Morale dip (-10 Morale) and Family Pressure event hook next season.

---

## 5. PHYSICAL GROWTH, GENETICS, THE DYNAMIC WEIGHT SYSTEM & BODY CONDITIONING

Player height and weight are not static; they evolve realistically during youth development and dynamically throughout an entire professional career (`playerGrowthSystem.ts` & `conditioningSystem.ts`):

### A. Inherited Height from Parent Cards
Upon birth, Parent Cards roll an inherited height modifier:
* 1–5 CM: 50% probability ("Slightly taller")
* 6–9 CM: 25% probability ("Noticeably taller")
* 10–12 CM: 20% probability ("Significant height advantage")
* 13–15 CM: 5% probability ("Exceptional height advantage")

### B. Annual Physical Growth & The 1:1 Height-to-Weight Link
* **Annual Growth Curve (Ages 10–18):**
  * Age 10: 5–7 cm
  * Age 11: 5–7 cm
  * Age 12: 5–8 cm
  * Age 13: 5–8 cm
  * Age 14: 4–7 cm
  * Age 15: 3–6 cm
  * Age 16: 2–4 cm
  * Age 17: 1–2 cm
  * Age 18+: Exactly 0 cm (Growth permanently halts).
* **The 1:1 Rule:** $+1\text{ cm} = +1\text{ kg}$ to maintain authentic adolescent proportions.
* **Growth Spurt Event:** 20% annual chance between ages 12 and 16 to trigger a massive Growth Spurt ($+8\text{ to }+12\text{ cm}$ in a single season), shifting attribute dynamics (accelerates Aerial Strength and Heading; temporarily lowers Agility and Ball Control until physical adaptation).
* **Genetic Activations:** Dormant physical traits inherited from parents (e.g. *Dense Skeletal Frame*, *Fast-Twitch Muscle Fibers*) unlock at ages 14 and 16 via fullscreen cinematic scenes.

### C. Age 10 Origin Progression & Embedded Parent Card Cinematics (`originCinematicEngine.ts`)

At age 10, the user officially takes hands-on control of their footballer. The opening origin narrative is dynamically generated by fusing the player's chosen **Parent Card & Rarity Tier** with their **Player Archetype**:

#### 1. Parent Card Tier Scaling (Bronze $\rightarrow$ Iconic)
As parent cards rise in rarity tier, their unique personality traits, financial scale, and parental pressures become dramatically exaggerated:
* **Rich Parents:**
  * *Bronze:* Middle-class suburban comfort, reliable family SUV, paying for private weekend skills clinics.
  * *Silver:* Exclusive private prep academy, personal athletic trainer, summer training camps in Spain/England.
  * *Gold:* Gated country villa with private floodlit astroturf pitch, personal nutritionist and physio on retainer.
  * *Legendary / Iconic:* Extravagant billionaire estate, arriving at youth tournaments in private helicopters, superyachts, personal PR team, and golden bespoke training cleats.
* **Helicopter Parents:**
  * *Bronze:* Vocal sideline cheering, replaying every mistake during the car ride home.
  * *Silver:* Strict 6-day training schedules, tracking hydration and sleep schedules on clipboards.
  * *Gold:* Biometric GPS vests at age 9, measuring heart-rate variability, mandatory post-match video tactical analysis sessions at the dinner table.
  * *Legendary / Iconic:* Crazily tyrannical football stage parents: screaming tactical orders over the coach's voice, firing youth trainers, hiring personal sports psychologists, and enforcing 5 AM sprint drills with military whistles.
* **Working-Class / Humble Parents:**
  * *Bronze:* Parents working double shifts in factories to afford a single pair of second-hand cleats.
  * *Silver:* Neighborhood bakery/garage sponsoring your youth tournament bus tickets.
  * *Gold / Legendary:* Fierce working-class neighborhood pride; football as the family's sole salvation, forging unmatched mental grit and hunger.
* **Iconic Football Royalty Parents:**
  * Born to an immortal World Cup winner or Ballon d'Or legend. National sports press cameras outside your U10 academy gates; relentless media comparisons and the crushing weight of an iconic surname.

#### 2. The "Wasted Talent" Archetype Unique Exception
While all other 7 player archetypes share generally disciplined, motivated introductory trajectories, the **Wasted Talent** archetype features a unique, dark-comedy origin narrative:
* **Celestial Natural Ability:** Astounding god-given flair, 5-star skill moves, celestial close control, and natural explosive athleticism.
* **Catastrophic Attitude & Discipline:** An explosive, childish temper, zero work ethic, unnecessary dressing-room fights, and ridiculous disciplinary meltdowns (leaning into comedic yet tragic Mario Balotelli-style antics).
* **Automatic Disciplinary Penalty at Age 10:**
  * Begins career at age 10 **locked permanently to Bad Reputation Tier 1 ("Hothead")**!
* **Unique Origin Cinematic:**
  * The 10-year-old prodigy dazzles onlookers by pulling off three consecutive rainbow flicks and a scorpion kick, but is shown a straight red card 30 seconds later for arguing with the referee, kicking the linesman's corner flag into the parking lot, or throwing their boots into a tree!

#### 3. Embedded Age-10 Origin Cinematics for All 8 Archetypes
When the player crosses from early childhood simulation into active user control at Age 10, the engine launches a unique fullscreen 32-bit pixel prologue cinematic customized to the intersection of their **Player Archetype** and **Parent Card**:
1. **⚡ Speedster:**
   * *Cinematic Vignette:* Dawn mist clinging to a gravel sprint track or neighborhood alley. A coach or parent clicks a vintage stopwatch. The 10-year-old explodes out of the starting blocks, racing a neighborhood stray dog or clocking an unbelievable sub-13-second 100m split. The stopwatch hand freezes as the coach whispers: *"The boy doesn't run... he flies."*
2. **🛡️ Tank:**
   * *Cinematic Vignette:* A torrential downpour turning the pitch into thick mud. Three opposing youth players converge simultaneously to strip the ball. The 10-year-old drops a shoulder, absorbs the triple collision without flinching, and powers through the mud while dragging two defenders along his shirt. He helps them up with a grin and carries his team's kit bags home.
3. **✨ Flair:**
   * *Cinematic Vignette:* Sun-drenched cobblestone street or vibrant neighborhood square. Music pulses from an open window. The 10-year-old juggles an orange, transitions into barefoot Rabonas, and executes a dizzying elastico nutmeg between two parked bicycles. Street vendors stop their work to applaud as a local scout marks down a gold star in his notepad.
4. **📐 Architect:**
   * *Cinematic Vignette:* Late evening in the kitchen. While other kids play video games, the 10-year-old rearranges salt and pepper shakers into a tactical 4-3-3 formation on the table. Cut to the weekend match: pointing authoritatively at an open corridor before executing a millimeter-perfect 40-yard looping diagonal pass onto his striker's laces without looking.
5. **❄️ Ice-Cold:**
   * *Cinematic Vignette:* The 94th minute of a regional youth cup final. Parents screaming hysterically on the touchline; hostile away fans banging drums behind the goal. The referee awards a decisive penalty. Camera cuts to the 10-year-old's unblinking, calm eyes. With ice in his veins, he chips a slow-motion Panenka right down the center, turns around with a nonchalant shrug, and walks back to his teammates.
6. **🧱 Patient:**
   * *Cinematic Vignette:* Long shadows stretch across a cracked brick schoolyard wall as dusk falls and the streetlights flicker on. The rest of the team went home hours ago. The 10-year-old repeatedly strikes the ball against the same chipped brick, controlling the rebound with left foot, right foot, thigh, and chest. 500 repetitions without dropping the ball. A father watches silently from the fence with quiet pride.
7. **💥 Cannon:**
   * *Cinematic Vignette:* A bouncing clearance rolls outside the 18-yard box. The 10-year-old winds up with violent technique and unleashes an absurd 30-yard thunderbolt volley. The ball tears through the top corner netting and shatters a wooden fence plank behind the goal. The opposing goalkeeper stares down at his vibrating, stinging gloves in utter disbelief.
8. **🔮 Wasted Talent:**
   * *Cinematic Vignette:* Pulls off celestial, god-given acrobatics—a rainbow flick over the defender's head followed by a bicycle kick into the top stanchion. But 30 seconds later, when an opponent tugs his collar, he kicks the corner flag into the parking lot, yells at the referee, and is shown a straight red card. Parents bury their faces in their hands as the boy storms off grinning into the dugout.

---

### D. The Dynamic Weight System & Ideal Body Composition Engine

In DrawStar Remake 2.0, body weight is a living metric that dynamically impacts pitch athleticism, movement physics, and duel viability across your entire career.

#### 1. The Ideal Weight Baseline Formula
* **The Canonical Formula:**
  $$\text{Ideal Weight (kg)} = \text{Height (cm)} - 100$$
  *(Floor clamped at $40\text{ kg}$ for early youth prospects)*.
* **Athletic Real-World Grounding:**
  * Real professional footballers carry an unusually high proportion of lean muscle mass and very low body fat ($8\% - 11\%$). The classic Broca athletic index ($\text{Height} - 100$) models elite football body composition with pinpoint realism:
    * **165 cm:** $\text{Ideal} = 65\text{ kg}$ (e.g. Lorenzo Insigne, Mathieu Valbuena)
    * **170 cm:** $\text{Ideal} = 70\text{ kg}$ (e.g. Lionel Messi ~68–72 kg, Alexis Sánchez ~69–71 kg)
    * **175 cm:** $\text{Ideal} = 75\text{ kg}$ (e.g. Neymar ~68–74 kg, Eden Hazard ~74–76 kg)
    * **180 cm:** $\text{Ideal} = 80\text{ kg}$ (e.g. Cristiano Ronaldo ~80–83 kg, Luka Modrić ~68–72 kg lean buffer)
    * **185 cm:** $\text{Ideal} = 85\text{ kg}$ (e.g. Robert Lewandowski ~81–84 kg, Karim Benzema ~81–85 kg)
    * **190 cm:** $\text{Ideal} = 90\text{ kg}$ (e.g. Erling Haaland ~88–92 kg, Virgil van Dijk ~90–92 kg)
    * **195 cm:** $\text{Ideal} = 95\text{ kg}$ (e.g. Zlatan Ibrahimović ~95 kg, Thibaut Courtois ~94–96 kg)

#### 2. The Three Body Conditioning Zones & Attribute Penalties

| Conditioning Zone | Weight Range (Relative to Ideal) | Attribute Penalty Applied | Pitch Gameplay Effect |
| :--- | :--- | :---: | :--- |
| **1. Peak Lean Safe Zone** | $[\text{Ideal} - 5\text{ kg}, \text{Ideal}]$ | **0 Penalty (None)** | Shredded match conditioning; full agility, top sprint velocity, and uncompromised strength. |
| **2. Severe Underweight** | $< (\text{Ideal} - 5\text{ kg})$ | **$-1$ Strength (STR)** per kg below $(\text{Ideal} - 5)$ | Easily muscled off the ball, loses aerial & shoulder duels, unable to shield possession. |
| **3. Overweight Penalty** | $> \text{Ideal}$ | **$-1$ Pace (PAC) & $-1$ Stamina (STA)** per 1 kg above Ideal | Sluggish initial acceleration, reduced top speed, faster late-game aerobic energy drain. |

* **Mathematical Formulations:**
  $$\text{Underweight Deficit} = \max\big(0, (\text{Ideal} - 5) - \text{Weight}\big)$$
  $$\text{Overweight Deficit} = \max\big(0, \text{Weight} - \text{Ideal}\big)$$
  $$\text{Strength}_{\text{effective}} = \text{Strength}_{\text{base}} - \text{Underweight Deficit}$$
  $$\text{Pace}_{\text{effective}} = \text{Pace}_{\text{base}} - \text{Overweight Deficit}$$
  $$\text{Stamina}_{\text{effective}} = \text{Stamina}_{\text{base}} - \text{Overweight Deficit}$$

* **Worked Examples (for a 170 cm Player with Ideal = 70 kg):**
  * *Weight 66 kg (Safe Zone):* Within 5 kg of ideal ($65 - 70\text{ kg}$) $\rightarrow$ **0 Penalty** (Optimal Athleticism).
  * *Weight 64 kg (Underweight):* $1\text{ kg}$ below 65 kg threshold $\rightarrow$ **$-1$ Strength**.
  * *Weight 60 kg (Severely Underweight):* $5\text{ kg}$ below 65 kg threshold $\rightarrow$ **$-5$ Strength**.
  * *Weight 72 kg (Overweight):* $2\text{ kg}$ above ideal 70 kg $\rightarrow$ **$-2$ Pace, $-2$ Stamina**.
  * *Weight 76 kg (Heavily Overweight):* $6\text{ kg}$ above ideal 70 kg $\rightarrow$ **$-6$ Pace, $-6$ Stamina**.

#### 3. Weight Fluctuation Vectors (How Weight Changes During Gameplay)
A player's weight fluctuates dynamically in response to lifestyle choices, card acquisitions, training habits, and physical events:
* **Weight Gain Triggers ($+1\text{ to }+3\text{ kg}$):**
  * **Nightlife & Party Benders:** Attending VIP clubs, late-night alcohol benders, and festival events (e.g. *Noche de Boliche*, *Parranda Vallenata*, *Pub Darts Tournament*).
  * **Fast Food & Poor Nutrition:** Eating greasy takeout deliveries, skipping club meal prep, excessive cheat days.
  * **Training Indiscipline:** Refusing to train, skipping voluntary fitness sessions, laziness events under Wasted Talent archetype.
  * **Sedentary Injury Lay-Offs:** Extended muscle tears or fractures without cross-training metabolic upkeep.
  * **Off-Season Overindulgence:** Luxury holiday indulgences (yachts, all-inclusive resorts) entering pre-season out of shape.
* **Weight Loss Triggers ($-1\text{ to }-3\text{ kg}$):**
  * **Overtraining & Exhaustion:** High-volume extra sessions without proper caloric replenishment.
  * **Brutal Tactical Drills:** High-intensity pre-season boot camps under demanding Gegenpress or Simeone-style managers.
  * **Special Diet Cards:** Consumable/Lifestyle diet cards like *Keto Precision*, *Plant-Powered Elite*, *Mediterranean Lean*, or hiring a *Private Michelin Nutritionist* (boost Stamina and Fitness while trimming excess kilograms).
  * **Dehydration & Illness:** Food poisoning, tropical flu, or heatwave match conditions.

---

### E. The Club Medical Staff "Special Diet" Directive & Disciplinary Dilemma

When a contracted professional player's body weight drifts outside the Peak Lean Safe Zone (either overweight $> \text{Ideal}$, or severely underweight $< \text{Ideal} - 5\text{ kg}$), the club's medical hierarchy intervenes:

#### 1. The Medical Directive Trigger
* At the start of each monthly cycle, the **Chief Team Doctor** and **Head Nutritionist** review the squad's biometric body composition scans.
* If a player is flagged as overweight or severely underweight, an urgent cinematic event triggers: **"Office Summons: Medical Staff Diet Mandate"**.
* The Head Nutritionist presents a bespoke, scientifically tailored nutritional and conditioning regimen designed to return the footballer to their exact **Ideal Weight**.

#### 2. The 3-Way Player Choice & Branching Consequences

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLUB MEDICAL STAFF: SPECIAL DIET DIRECTIVE                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ "The biometric scans don't lie. Your conditioning is compromising your pitch metrics and the manager's  │
│  tactical pressing intensity. We have prepared an intensive nutritional protocol to restore your       │
│  optimal weight. How do you respond?"                                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [1] FOLLOW STRICTLY        │ 100% adherence. Weight normalizes month-by-month toward Ideal.            │
│                            │ Monthly buffs: +5% to +10% Fitness, +2 to +4 Stamina.                     │
│                            │ +15 Manager Trust, +10 Medical Staff Respect, +5 Squad Chemistry.         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [2] "CHEAT" ON DIET        │ Publicly agree, but privately sneak fast food and cheat meals.            │
│                            │ Effectiveness slashed by 65%–75% (weight barely moves).                   │
│                            │ 35% Monthly Risk of Discovery via surprise weigh-ins or paparazzi photos. │
│                            │ IF CAUGHT: +10 Bad Reputation, -15 Manager Trust, wage fine, bench threat.│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [3] OUTRIGHT REFUSE        │ Defiant rejection: "My body, my business. I play best at this weight."    │
│                            │ IMMEDIATE CONSEQUENCES: +15 Bad Reputation, -25 Manager Trust.            │
│                            │ Dropped from matchday squad (benched/reserves) until weight is resolved.  │
│                            │ Transfer list risk if defiance persists over consecutive months.          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3. Progression Mechanics of the Special Diet
* **Strict Adherence Progression:**
  * While active, the special diet normalizes weight at a rate of **$1\text{ to }2\text{ kg per month}$** until reaching Ideal Weight (if overweight) or until reaching the Safe Zone threshold (if underweight).
  * Once the player hits their target Ideal Weight, the medical staff clears them with high praise (+5 Manager Trust bonus), terminating the restrictive diet protocol.
* **Cheating Adherence Progression:**
  * The player gains partial relief, but weight normalizes at only $0.3\text{ to }0.5\text{ kg per month}$ (often stalling completely).
  * Each month, a hidden RNG roll ($35\%$ probability) checks for discovery:
    * *Discovery Triggers:* Surprise body-fat caliper tests at the training ground, GPS sprint data flagging sluggish acceleration, or local tabloids capturing paparazzi snapshots of the player leaving a midnight fast-food drive-thru!
    * *Discovery Sanctions:* Heavy club wage deduction (1–2 weeks' wages), scathing manager press conference critique, and demotion from Starter down to Bench/Rotation.

---

## 6. THE 8 PLAYER TYPES (ARCHETYPES, 5-STATE STAT MATRICES, STRENGTHS & WEAKNESSES)

In DrawStar Remake 2.0, player archetypes do not merely establish initial starting attribute distributions; they permanently govern **how your footballer develops over their entire career**. Every single one of the 18 outfield attributes is assigned one of **5 potential developmental states** tailored to each archetype:

### A. The 5 Developmental Attribute States

| State | Visual Badge | Annual Growth Bonus | Training Point Cost Multiplier | Mechanical & Narrative Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **1. 🌟 Natural** | `🌟 NATURAL (+2/YR)` | **+2 / Year** | **1.00x** (Standard) | Effortless genetic intuition. Automatically gains **+2 attribute points each year** during the annual June off-season progression step without spending training points. |
| **2. ⚡ Skillful** | `⚡ SKILLFUL (+1/YR)` | **+1 / Year** | **1.00x** (Standard) | High developmental affinity. Automatically gains **+1 attribute point each year** during annual off-season progression. |
| **3. ⚪ Normal** | `⚪ NORMAL` | **+0 / Year** | **1.00x** (Standard) | Standard baseline development. Grows only through manual training point allocation or match performance milestones with zero training cost penalty. |
| **4. ⚠️ Poor** | `⚠️ POOR (+5% COST)` | **+0 / Year** | **1.05x** (+5% penalty) | Developmental resistance. Advancing to the next level in this attribute requires **5% more stat points than normal** ($\lceil \text{BasePoints} \times 1.05 \rceil$). |
| **5. ❌ Weakness** | `❌ WEAKNESS (+10% COST)` | **+0 / Year** | **1.10x** (+10% penalty) | Core physiological/tactical liability. Advancing to the next level requires **10% more stat points than normal** ($\lceil \text{BasePoints} \times 1.10 \rceil$). |

#### Mathematical Progression Integration
* **Off-Season Annual Leap:**
  $$\text{Attribute}_{\text{new}} = \min(99, \text{Attribute}_{\text{current}} + \text{YearlyBonus}(\text{State}))$$
* **Level Upgrade Cost in Training Center:**
  $$\text{PointsRequired}(L, \text{attribute}) = \left\lceil \text{BasePointsForLevel}(L) \times \text{CostMultiplier}(\text{State}) \right\rceil$$

---

### B. Archetype Comprehensive Profiles & 18-Attribute Matrices

#### 1. ⚡ Speedster (`speedster`)
* **Archetype Role:** Pure Kinetic Engine | **Badge:** `⚡ VELOCITY`
* **Tagline:** Outrunning defensive lines before they can even set their shape.
* **Profile Summary:** Born with explosive twitch muscle fibers and blazing acceleration. Relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.
* **Initial Stats (OVR ~50.2):**
  * *PHY (165):* Pace: 90, Stamina: 55, Strength: 20
  * *PRO (155):* Ball Control: 50, Retention: 40, Dribbling: 65
  * *CRE (125):* Short Pass: 45, Long Pass: 35, Crossing: 45
  * *GOA (95):* Shooting: 45, Heading: 15, Long Shots: 35
  * *DEF (50):* Tackling: 15, Marking: 20, Interceptions: 15
  * *MEN (135):* Positioning: 40, Composure: 35, Reactions: 60
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Pace, Dribbling
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Reactions, Stamina, Ball Control
  * ⚪ **Normal (+0/yr, 1.0x cost):** Shooting, Crossing, Short Pass, Positioning, Composure, Retention
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Long Pass, Long Shots, Marking
  * ❌ **Weakness (+0/yr, 1.10x cost):** Strength, Heading, Tackling, Interceptions
* **Annual Spontaneous Off-Season Growth:** Pace (+2), Dribbling (+2), Reactions (+1), Stamina (+1), Ball Control (+1).

#### 2. 🛡️ Tank (`tank`)
* **Archetype Role:** Immovable Colossus | **Badge:** `🛡️ COLOSSUS`
* **Tagline:** Dominating physical duels, aerial battles, and defensive collisions.
* **Profile Summary:** A commanding physical presence who overpowers adversaries in shoulder-to-shoulder contests, wins every ball in the air, and anchors defensive or offensive duels with sheer raw strength.
* **Initial Stats (OVR ~51.4):**
  * *PHY (183):* Pace: 35, Stamina: 60, Strength: 88
  * *PRO (75):* Ball Control: 35, Retention: 20, Dribbling: 20
  * *CRE (75):* Short Pass: 35, Long Pass: 25, Crossing: 15
  * *GOA (157):* Shooting: 50, Heading: 72, Long Shots: 35
  * *DEF (160):* Tackling: 60, Marking: 55, Interceptions: 45
  * *MEN (75):* Positioning: 25, Composure: 25, Reactions: 25
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Strength, Heading
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Tackling, Marking, Stamina
  * ⚪ **Normal (+0/yr, 1.0x cost):** Shooting, Interceptions, Ball Control, Short Pass, Positioning, Reactions
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Pace, Long Shots, Composure
  * ❌ **Weakness (+0/yr, 1.10x cost):** Dribbling, Retention, Crossing, Long Pass
* **Annual Spontaneous Off-Season Growth:** Strength (+2), Heading (+2), Tackling (+1), Marking (+1), Stamina (+1).

#### 3. ✨ Flair (`flair`)
* **Archetype Role:** Samba Virtuoso | **Badge:** `✨ MAGICIAN`
* **Tagline:** Mesmerizing defenders with close control, elastis, and feints in tight spaces.
* **Profile Summary:** Blessed with supernatural close touch and effortless improvisation. The Flair archetype dances out of tight traps, manipulates defenders off-balance, and keeps the ball glued to their boots under heavy pressure.
* **Initial Stats (OVR ~49.7):**
  * *PHY (115):* Pace: 55, Stamina: 40, Strength: 20
  * *PRO (243):* Ball Control: 80, Retention: 75, Dribbling: 88
  * *CRE (130):* Short Pass: 50, Long Pass: 35, Crossing: 45
  * *GOA (97):* Shooting: 45, Heading: 12, Long Shots: 40
  * *DEF (45):* Tackling: 15, Marking: 15, Interceptions: 15
  * *MEN (95):* Positioning: 25, Composure: 55, Reactions: 15
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Dribbling, Ball Control
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Retention, Short Pass, Composure
  * ⚪ **Normal (+0/yr, 1.0x cost):** Pace, Shooting, Long Shots, Crossing, Long Pass, Reactions
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Stamina, Positioning
  * ❌ **Weakness (+0/yr, 1.10x cost):** Strength, Tackling, Marking, Interceptions, Heading
* **Annual Spontaneous Off-Season Growth:** Dribbling (+2), Ball Control (+2), Retention (+1), Short Pass (+1), Composure (+1).

#### 4. 📐 Architect (`architect`)
* **Archetype Role:** Metronome Conductor | **Badge:** `📐 MAESTRO`
* **Tagline:** Dictating the match tempo with surgical line-breaking passes and spatial geometry.
* **Profile Summary:** A chess master with supreme footballing IQ. The Architect sees passing angles before they develop, threading pinpoint diagonal switches and controlling match rhythm from deep or attacking midfield.
* **Initial Stats (OVR ~49.7):**
  * *PHY (95):* Pace: 25, Stamina: 45, Strength: 25
  * *PRO (160):* Ball Control: 65, Retention: 55, Dribbling: 40
  * *CRE (222):* Short Pass: 82, Long Pass: 80, Crossing: 60
  * *GOA (100):* Shooting: 40, Heading: 15, Long Shots: 45
  * *DEF (80):* Tackling: 20, Marking: 25, Interceptions: 35
  * *MEN (168):* Positioning: 70, Composure: 60, Reactions: 38
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Short Pass, Long Pass
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Positioning, Composure, Crossing
  * ⚪ **Normal (+0/yr, 1.0x cost):** Ball Control, Retention, Long Shots, Reactions, Stamina, Interceptions
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Dribbling, Shooting, Marking
  * ❌ **Weakness (+0/yr, 1.10x cost):** Pace, Strength, Tackling, Heading
* **Annual Spontaneous Off-Season Growth:** Short Pass (+2), Long Pass (+2), Positioning (+1), Composure (+1), Crossing (+1).

#### 5. ❄️ Ice-Cold (`ice_cold`)
* **Archetype Role:** Apex Assassin | **Badge:** `❄️ FINISHER`
* **Tagline:** Zero heartbeat in the penalty box; clinical execution when everything is on the line.
* **Profile Summary:** Possesses nerves of steel and unmatched instincts inside the final third. Excels in high-pressure moments, finding the bottom corners with supreme composure and razor-sharp positional sense.
* **Initial Stats (OVR ~47.8):**
  * *PHY (110):* Pace: 30, Stamina: 45, Strength: 35
  * *PRO (135):* Ball Control: 50, Retention: 45, Dribbling: 40
  * *CRE (85):* Short Pass: 45, Long Pass: 20, Crossing: 20
  * *GOA (170):* Shooting: 80, Heading: 35, Long Shots: 55
  * *DEF (50):* Tackling: 15, Marking: 15, Interceptions: 20
  * *MEN (225):* Positioning: 75, Composure: 85, Reactions: 65
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Composure, Shooting
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Positioning, Reactions, Long Shots
  * ⚪ **Normal (+0/yr, 1.0x cost):** Ball Control, Retention, Heading, Short Pass, Stamina, Strength
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Dribbling, Interceptions, Pace
  * ❌ **Weakness (+0/yr, 1.10x cost):** Crossing, Long Pass, Tackling, Marking
* **Annual Spontaneous Off-Season Growth:** Composure (+2), Shooting (+2), Positioning (+1), Reactions (+1), Long Shots (+1).

#### 6. 🧱 Patient (`patient`)
* **Archetype Role:** Tactical Anchor | **Badge:** `🧱 GUARDIAN`
* **Tagline:** Relentless work rate, discipline, and anticipation that smothers opposition attacks.
* **Profile Summary:** An indefatigable workhorse who never tires. The Patient archetype reads opposition passing lanes before they materialize, tracks runners relentlessly for 90 minutes, and forms an impenetrable defensive wall.
* **Initial Stats (OVR ~45.3):**
  * *PHY (180):* Pace: 45, Stamina: 85, Strength: 50
  * *PRO (102):* Ball Control: 40, Retention: 42, Dribbling: 20
  * *CRE (110):* Short Pass: 50, Long Pass: 40, Crossing: 20
  * *GOA (55):* Shooting: 15, Heading: 25, Long Shots: 15
  * *DEF (218):* Tackling: 68, Marking: 72, Interceptions: 78
  * *MEN (60):* Positioning: 25, Composure: 15, Reactions: 20
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Stamina, Interceptions
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Marking, Tackling, Strength
  * ⚪ **Normal (+0/yr, 1.0x cost):** Short Pass, Composure, Positioning, Reactions, Pace, Ball Control
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Retention, Long Pass, Heading
  * ❌ **Weakness (+0/yr, 1.10x cost):** Shooting, Long Shots, Dribbling, Crossing
* **Annual Spontaneous Off-Season Growth:** Stamina (+2), Interceptions (+2), Marking (+1), Tackling (+1), Strength (+1).

#### 7. 💥 Cannon (`cannon`)
* **Archetype Role:** Long-Range Bombarder | **Badge:** `💥 ARTILLERY`
* **Tagline:** Unleashing unstoppable supersonic strikes from anywhere in the attacking half.
* **Profile Summary:** Armed with immense leg power and raw ballistic velocity. The Cannon punishes goalkeepers from impossible distances, crashes through physical duels, and finishes chances with violent shot power.
* **Initial Stats (OVR ~47.6):**
  * *PHY (160):* Pace: 45, Stamina: 45, Strength: 70
  * *PRO (105):* Ball Control: 45, Retention: 20, Dribbling: 40
  * *CRE (105):* Short Pass: 45, Long Pass: 35, Crossing: 25
  * *GOA (225):* Shooting: 82, Heading: 55, Long Shots: 88
  * *DEF (45):* Tackling: 15, Marking: 15, Interceptions: 15
  * *MEN (135):* Positioning: 40, Composure: 40, Reactions: 55
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Long Shots, Shooting
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Strength, Heading, Reactions
  * ⚪ **Normal (+0/yr, 1.0x cost):** Pace, Ball Control, Short Pass, Positioning, Composure, Stamina
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Long Pass, Crossing, Retention
  * ❌ **Weakness (+0/yr, 1.10x cost):** Tackling, Marking, Interceptions, Dribbling
* **Annual Spontaneous Off-Season Growth:** Long Shots (+2), Shooting (+2), Strength (+1), Heading (+1), Reactions (+1).

#### 8. 🔮 Wasted Talent (`wasted_talent`)
* **Archetype Role:** Unpredictable Maverick | **Badge:** `🔮 VOLATILE GENIUS`
* **Tagline:** World-class celestial technique and long-range fireworks, notorious for heated brawls and stupid red cards.
* **Profile Summary:** A player blessed with generational raw genius, capable of celestial close control and breathtaking 35-yard screamer goals. However, you are widely known for getting into heated fights, volatile outbursts, and picking up stupid red cards, earning you an immediate reputation as a troublesome maverick.
* **Archetype Disciplinary Constraints:**
  * **Permanent Bad Rep Tier Lock:** Locked to **Bad Reputation Tier I ("Bad Boy") minimum** permanently. Can never drop to Tier 0 ("Clean Record").
  * **Volatile On-Pitch Penalties:** Permanent **+20% higher red card risk** in all matches.
  * **Locker Room Friction:** Starts new careers with **40 Initial Club Chemistry** (instead of standard 50).
* **Initial Stats (OVR ~54.7):**
  * *PHY (126):* Pace: 76, Stamina: 20, Strength: 30
  * *PRO (224):* Ball Control: 85, Retention: 55, Dribbling: 84
  * *CRE (209):* Short Pass: 68, Long Pass: 75, Crossing: 66
  * *GOA (179):* Shooting: 78, Heading: 15, Long Shots: 86
  * *DEF (30):* Tackling: 10, Marking: 10, Interceptions: 10
  * *MEN (73):* Positioning: 18, Composure: 30, Reactions: 25
* **Development Matrix (18 Attributes):**
  * 🌟 **Natural (+2/yr, 1.0x cost):** Ball Control, Long Shots
  * ⚡ **Skillful (+1/yr, 1.0x cost):** Dribbling, Shooting, Pace, Long Pass
  * ⚪ **Normal (+0/yr, 1.0x cost):** Short Pass, Crossing, Retention
  * ⚠️ **Poor (+0/yr, 1.05x cost):** Composure, Reactions, Positioning
  * ❌ **Weakness (+0/yr, 1.10x cost):** Stamina, Strength, Tackling, Marking, Interceptions, Heading
* **Annual Spontaneous Off-Season Growth:** Ball Control (+2), Long Shots (+2), Dribbling (+1), Shooting (+1), Pace (+1), Long Pass (+1). (Remarkable offensive growth, balanced by brutal defensive and mental training stagnation).

---

### B. The Positional Hierarchy: Positions, Sub-Positions & Authentic Playstyles

In DrawStar Remake 2.0, positions are strictly structured in an authoritative 3-tier hierarchy: **Primary Position $\rightarrow$ Tactical Sub-Position $\rightarrow$ Characteristic Playstyle**. Every primary position possesses designated standard sub-positions, plus specialized tactical sub-positions requested by managers in specific tactical systems:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CANONICAL POSITIONAL & PLAYSTYLE MATRIX                                   │
├──────────────┬───────────────────────────────┬─────────────────────────────────────────────────────────┤
│ 1. ATTACKER  │ • Striker (ST)                │ Poacher, Target, Complete, Finisher, Decoy              │
│    (ATT)     │ • Winger (LW / RW)            │ Traditional, Inverted, Prolific, Pressing               │
│              │ • [SPECIAL] Second Striker    │ Inherits CAM Playstyles: Creator, Shadow,               │
│              │   (SS / False 9)              │ Classic N10, Engine                                     │
├──────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 2. MIDFIELD  │ • Central Attacking Mid       │ Creator, Shadow, Classic N10, Engine                    │
│    (MID)     │   (CAM / MO)                  │                                                         │
│              │ • Central Midfielder (CM)     │ Box-to-Box, Maestro, Runner                             │
│              │ • Central Defensive Mid       │ Enforcer, Anchor, Regista                               │
│              │   (CDM / MCD)                 │                                                         │
│              │ • [SPECIAL] Wide Midfielder   │ Inherits Winger Playstyles: Traditional,                │
│              │   (LM / RM)                   │ Inverted, Prolific, Pressing                            │
├──────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 3. DEFENDER  │ • Fullback (LB / RB)          │ Defensive, Inverted, Attacker, Balanced                 │
│    (DEF)     │ • Center Back (CB)            │ Destroyer, Distributor, Playmaker, Stopper              │
│              │ • [SPECIAL] Wingback          │ Inherits Fullback Playstyles: Defensive,                │
│              │   (LWB / RWB)                 │ Inverted, Attacker, Balanced                            │
│              │ • [SPECIAL] Libero / Sweeper  │ Inherits CB & CDM Playstyles: Playmaker,                │
│              │   (LIB / SW)                  │ Distributor, Stopper, Sweeper                           │
├──────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 4. GOALKEEPER│ • Goalkeeper (GK)             │ Balanced, Sweeper, Wall                                 │
│    (GK)      │                               │                                                         │
└──────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

#### 1. Position: Attacker (ATT)

* **Sub-Position: Striker (ST)**
  * **Playstyle: Poacher** — Waits in the area for his chance.
    * *Modern:* Erling Haaland | *Legends:* Gerd Müller
  * **Playstyle: Target** — Holds the ball up to create chances.
    * *Modern:* Olivier Giroud | *Legends:* Didier Drogba
  * **Playstyle: Complete** — Can dribble, run, shoot from far, finish, a nightmare for defenders.
    * *Modern:* Kylian Mbappé | *Legends:* Ronaldo Nazário
  * **Playstyle: Finisher** — Runs into space at the right time and knows exactly how to end the job.
    * *Modern:* Lautaro Martínez | *Legends:* Eusébio
  * **Playstyle: Decoy** — Tirelessly runs all match to create gaps for his teammates and starts attacks with his pressing.
    * *Modern:* Ferran Torres | *Legends:* Roberto Firmino

* **Sub-Position: Winger (LW / RW)**
  * **Playstyle: Traditional** — Stays on the wing and from there causes chaos with his crosses.
    * *Modern:* Bukayo Saka | *Legends:* Garrincha
  * **Playstyle: Inverted** — Uses elite dribbling to go past defenders and enter into the middle, a nightmare for defenders.
    * *Modern:* Lamine Yamal | *Legends:* Lionel Messi
  * **Playstyle: Prolific** — Knows how to position himself to score entering from the wing (covers the Inside Forward archetype).
    * *Modern:* Cole Palmer, Mohamed Salah | *Legends:* Cristiano Ronaldo, Arjen Robben
  * **Playstyle: Pressing** — Tirelessly runs all match to create gaps for his teammates and starts attacks with his pressing.
    * *Modern:* Luis Díaz | *Legends:* Park Ji-sung

* **Special Sub-Position: Second Striker / False 9 (`SS`):**
  * *Tactical Role:* Deployed in 2-striker formations (4-4-2, 3-5-2, 4-3-1-2) operating in the hole behind the target forward, or as the fluid focal point in a **4-3-3 False 9** system (frequently utilized by Spain with Mikel Oyarzabal, or Pep Guardiola's iconic Barcelona with Messi). An Attacker (ATT) who borrows CAM playstyles.
  * *Playstyles:* Inherits CAM playstyles (*Creator*, *Shadow*, *Classic N10*, *Engine*).
  * *Modern Examples:* Mikel Oyarzabal (Spain False 9), Antoine Griezmann (Atlético Madrid), Paulo Dybala (Roma) | *Legends:* Alessandro Del Piero, Dennis Bergkamp, Roberto Baggio, Johan Cruyff.

---

#### 2. Position: Midfielder (MID)

* **Sub-Position: Central Attacking Midfielder (CAM / MO)**
  * **Playstyle: Creator** — Sees passes other players don't even imagine and creates chances with long shots and passing.
    * *Modern:* Kevin De Bruyne | *Legends:* Zinedine Zidane
  * **Playstyle: Shadow** — Arrives into the box at the right moment from behind the strikers to score.
    * *Modern:* Jude Bellingham | *Legends:* Johan Cruyff
  * **Playstyle: Classic N10** — A pure artist with the ball, slows down the tempo, dribbles in tight spaces and delivers impossible passes.
    * *Modern:* James Rodríguez | *Legends:* Juan Román Riquelme
  * **Playstyle: Engine** — A complete midfielder who attacks, defends, and runs tirelessly from box to box.
    * *Modern:* Federico Valverde | *Legends:* Pavel Nedvěd

* **Sub-Position: Central Midfielder (CM)**
  * **Playstyle: Box-to-Box** — Covers every blade of grass, providing presence in both penalty areas.
    * *Modern:* Dominik Szoboszlai | *Legends:* Lothar Matthäus
  * **Playstyle: Maestro** — Sets the tempo of the entire game with short and long passing, never loses the ball.
    * *Modern:* Pedri | *Legends:* Xavi Hernández
  * **Playstyle: Runner** — Uses intelligent runs from deep to break through defensive lines and score or assist.
    * *Modern:* Marcos Llorente | *Legends:* Yaya Touré

* **Sub-Position: Central Defensive Midfielder (CDM / MCD)**
  * **Playstyle: Enforcer** — Dominates the midfield through sheer physicality, strong tackles and tactical fouls.
    * *Modern:* Casemiro | *Legends:* Roy Keane
  * **Playstyle: Anchor** — Protects the back four, intercepts passes, and calmly initiates the buildup play.
    * *Modern:* Rodri | *Legends:* Sergio Busquets
  * **Playstyle: Regista** — Deep-lying orchestrator deployed at the base of midfield with zero destructive duties; dictates overall match tempo with press-resistant composure, elite vision, and exquisite diagonal passing.
    * *Modern:* Toni Kroos, Jorginho, Hakan Çalhanoğlu | *Legends:* Andrea Pirlo, Xabi Alonso, Pep Guardiola

* **Special Sub-Position: Wide Midfielder (`LM` / `RM`):**
  * *Tactical Role:* Deployed in 4-4-2, 4-5-1, or 4-2-3-1 formations (and rarely in 3-at-the-back setups under highly offensive managers). A midfielder who patrols the wide channels, combining the defensive discipline of a midfielder with the dribbling, pacing, and crossing repertoire of a winger.
  * *Playstyles:* Inherits Winger playstyles (*Traditional*, *Inverted*, *Prolific*, *Pressing*).
  * *Modern Examples:* Kingsley Coman, Federico Chiesa, Nico Williams | *Legends:* David Beckham, Ryan Giggs, Park Ji-sung, Pavel Nedvěd (Lazio/Juventus flank).

---

#### 3. Position: Defender (DEF)

* **Sub-Position: Fullback (LB / RB)**
  * **Playstyle: Defensive** — Rarely crosses the halfway line, focused entirely on shutting down opposing wingers.
    * *Modern:* Kyle Walker | *Legends:* Lilian Thuram
  * **Playstyle: Inverted** — Cuts inside into the midfield area during possession to overload central spaces (covers the Inverted Fullback archetype).
    * *Modern:* Pedro Porro, Trent Alexander-Arnold | *Legends:* Philipp Lahm
  * **Playstyle: Attacker** — Constant threat on the overlap, acts almost as an additional winger.
    * *Modern:* Achraf Hakimi | *Legends:* Roberto Carlos
  * **Playstyle: Balanced** — Solid in defense while knowing exactly when to support the attack.
    * *Modern:* Andrew Robertson | *Legends:* Paolo Maldini

* **Sub-Position: Center Back (CB)**
  * **Playstyle: Destroyer** — Aggressive, physical defender who charges into tackles and bullies strikers.
    * *Modern:* Antonio Rüdiger | *Legends:* Nemanja Vidić
  * **Playstyle: Distributor** — Calm under pressure, excels at playing accurate passes out from the back.
    * *Modern:* William Saliba | *Legends:* Franco Baresi
  * **Playstyle: Playmaker** — Visionary defender with long-range passing ability to launch immediate counter-attacks.
    * *Modern:* Virgil van Dijk | *Legends:* Franz Beckenbauer
  * **Playstyle: Stopper** — Reads the game brilliantly, relying on positioning, interceptions and clean challenges.
    * *Modern:* Gabriel Magalhães | *Legends:* Fabio Cannavaro

* **Special Sub-Position: Wingback / Carrilero (`LWB` / `RWB`):**
  * *Tactical Role:* Deployed in 3-at-the-back (3-5-2, 3-4-3) or 5-at-the-back (5-3-2) formations. An ultra-athletic hybrid who single-handedly owns the entire touchline from corner flag to corner flag.
  * *Playstyles:* Inherits Fullback playstyles (*Attacker*, *Inverted*, *Defensive*, *Balanced*).
  * *Modern Examples:* Federico Dimarco (Inter 3-5-2), Denzel Dumfries (Inter), Jeremie Frimpong / Álex Grimaldo (Bayer Leverkusen) | *Legends:* Cafu, Roberto Carlos, Marcos Alonso (Chelsea 3-4-2-1).

* **Special Sub-Position: Libero / Sweeper (`LIB` / `SW`):**
  * *Tactical Role:* Stationed as the central anchor of a 3-at-the-back defense (3-4-3, 3-5-2) or 5-3-2 in possession-based systems. Sweeps up loose balls behind the defensive line without the ball, and steps forward into central midfield with the ball to create overloads and launch diagonal switches.
  * *Playstyles:* Inherits CB & CDM playstyles (*Playmaker*, *Distributor*, *Stopper*, *Sweeper*).
  * *Modern Examples:* John Stones (Manchester City hybrid center-back/pivot) | *Legends:* Franz Beckenbauer, Franco Baresi, Ronald Koeman, Matthias Sammer, Gaetano Scirea.

---

#### 4. Position: Goalkeeper (GK)

* **Sub-Position: Goalkeeper (GK)**
  * **Playstyle: Balanced** — Solid all-round goalkeeper with good handling, positioning and distribution.
    * *Modern:* Thibaut Courtois | *Legends:* Iker Casillas
  * **Playstyle: Sweeper** — Acts as an eleventh outfield player, rushing off his line and distributing with his feet (covers the Sweeper Keeper archetype).
    * *Modern:* Manuel Neuer, Alisson Becker, Ederson Moraes | *Legends:* Lev Yashin, René Higuita
  * **Playstyle: Wall** — Has one job and knows how to do it: saves everything that comes near his box.
    * *Modern:* Emiliano Martínez | *Legends:* Oliver Kahn

---

* **GOA — Goalkeeper Specialist Skills (7 Core Metrics):**
  Goalkeepers possess a dedicated set of 7 specialist attributes on their cards, governing shot-stopping, box command, and rapid transitions.
  *(Attribute Scale Notation: **`[40 → 99 → ⚡ Break]`** denotes that base progression scales naturally from a minimum floor of 40 up to 99; once maxed at 99, attributes advance above 99 exclusively via the **100-point Stat Break (⚡ Break)** system)*:
  1. **Saving (SAV) [40 → 99 → ⚡ Break]:** Shot-stopping ability on inside-the-box and diving strikes.
  2. **Reflexes (REF) [40 → 99 → ⚡ Break]:** Reaction speed to quick strikes, deflections, and point-blank shots.
  3. **Handling (HAN) [40 → 99 → ⚡ Break]:** Clean catches without spills or dangerous rebounds.
  4. **Positioning (POS) [40 → 99 → ⚡ Break]:** Goal frame spatial alignment, cutting down shooting angles.
  5. **Aerial Reach (AER) [40 → 99 → ⚡ Break]:** Wingspan & vertical reach on contested crosses and corners.
  6. **One-on-One (1v1) [40 → 99 → ⚡ Break]:** Breakaway box duel success when charging down unassisted strikers.
  7. **Distribution (DIS) [40 → 99 → ⚡ Break]:** Throwing & kicking counter accuracy triggering fast breaks.

#### 5. Concrete Gameplay Functions of Attributes & Playstyles (Gameplay Integration Bridge)

Whenever match gameplay or simulation runs (whether in 2D playable pitch mode or rapid engine simulation), **Stats** and **Playstyles** serve distinct, interlocking, and vital gameplay functions:

* **The 18 Outfield Attributes across 6 Canonical Core Groups:**
  All outfield footballers develop across 18 specialized attributes organized into 6 core functional pillars *(Scale: `[40 → 99 → ⚡ Break]` denotes attribute values scale from 40 to 99 with standard progression points, pushing above 99 into immortal status via ⚡ Stat Break)*:
  1. **Physical (PHY):**
     * **Pace [40 → 99 → ⚡ Break]:** Top sprinting speed and acceleration curve.
     * **Stamina [40 → 99 → ⚡ Break]:** Energy reservoir preventing late-match stat penalty and fatigue degradation.
     * **Strength [40 → 99 → ⚡ Break]:** Physical mass and duel power shielding the ball and absorbing contact.
  2. **Progression (PRO):**
     * **Ball Control [40 → 99 → ⚡ Break]:** Clean first touch trapping passes under pressure.
     * **Retention [40 → 99 → ⚡ Break]:** Shielding possession under heavy opponent challenges and pressing traps.
     * **Dribbling [40 → 99 → ⚡ Break]:** Close control at high speeds, rapid cuts, and evasion turns.
  3. **Passing (PAS):**
     * **Short Pass [40 → 99 → ⚡ Break]:** Ground distribution accuracy under 15 yards to unlock compact blocks.
     * **Long Pass [40 → 99 → ⚡ Break]:** Lofted accuracy, backspin & switches across lines.
     * **Crossing [40 → 99 → ⚡ Break]:** Accuracy of wide deliveries into the penalty box.
  4. **Goalscoring (GOA):** *(Encompasses complete finishing art)*
     * **Shooting [40 → 99 → ⚡ Break]:** Inside-box accuracy, clinical finishing, and target cone tightness.
     * **Heading [40 → 99 → ⚡ Break]:** Aerial timing, leaping trajectory, and header accuracy on crosses.
     * **Long Shots [40 → 99 → ⚡ Break]:** Striking power, ball dip, and accuracy from outside the penalty area.
  5. **Defending (DEF):**
     * **Tackling [40 → 99 → ⚡ Break]:** Clean standing and sliding challenges without conceding fouls.
     * **Marking [40 → 99 → ⚡ Break]:** Stickiness to assigned opponent receiving space and blindside runs.
     * **Interceptions [40 → 99 → ⚡ Break]:** Anticipation stepping into passing lanes to disrupt build-up play.
  6. **Mental (MEN):**
     * **Positioning [40 → 99 → ⚡ Break]:** Off-ball spatial awareness, defensive shape discipline, and offensive channel timing.
     * **Composure [40 → 99 → ⚡ Break]:** Pressure resistance, maintaining execution quality in high-stakes moments.
     * **Reactions [40 → 99 → ⚡ Break]:** Mental speed responding to loose balls, ricochets, and sudden vector turns.

* **The Canonical Duel System — Which Stat Goes Against Which in Duels:**
  During 1v1 collisions, match highlights, and clutch QTE contests, DrawStar resolves outcomes using direct statistical contests weighted with Composure (`EffectiveScore = Stat × 0.60 + Composure × 0.40`):

  | Contest Type | Duel ID & Name | Attacking / User Stat | Defending / Opponent Stat | Mechanical Pitch Resolution |
  | :--- | :--- | :--- | :--- | :--- |
  | **Defending** | `DEF_POSITION_VS_PACE` | **Positioning (MEN)** (Runner) | **Pace (PHY)** (Recovery Defender) | Defender sprints back to catch runner before an open breakaway shot. |
  | **Defending** | `DEF_BALLCONTROL_VS_REACTION` | **Ball Control (PRO)** (Receiver) | **Reactions (MEN)** (Pressing Marker) | Marker pounces on the receiver's first touch before ball stabilization. |
  | **Defending** | `DEF_DRIBBLING_VS_TACKLING` | **Dribbling (PRO)** (Ball-carrier) | **Tackling (DEF)** (Challenger) | 1v1 take-on: clean ball tackle vs ankle-breaking dribble bypass. |
  | **Defending** | `DEF_SHORTPASS_VS_INTERCEPTIONS` | **Short Pass (PAS)** (Playmaker) | **Interceptions (DEF)** (Interceptor) | Threading ground pass vs anticipation cutting the passing lane. |
  | **Defending** | `DEF_LONGPASS_VS_MARKING` | **Long Pass (PAS)** (Distributor) | **Marking (DEF)** (Marker) | Diagonal ball over the top vs tight man-marking neutralizing target. |
  | **Defending** | `DEF_CROSSING_VS_INTERCEPTIONS` | **Crossing (PAS)** (Winger) | **Interceptions (DEF)** (Blocker) | Whipped cross past wide defender vs leg stick-out to deflect cross. |
  | **Defending** | `DEF_RETENTION_VS_STRENGTH` | **Retention (PRO)** (Shielding player)| **Strength (PHY)** (Dispossessor) | Back-to-goal shielding vs upper body muscle dispossessing the ball. |
  | **Defending** | `DEF_HEADING_VS_STRENGTH` | **Heading (GOA)** (Target aerialist) | **Strength (PHY)** (Center Back) | Displacing the aerialist in mid-air vs powering a contested header. |
  | **Creation** | `CRE_POSITION_VS_PACE` | **Positioning (MEN)** (Attacking runner)| **Pace (PHY)** (Tracking Defender) | Off-ball cut into half-space vs recovery sprint to close down. |
  | **Creation** | `CRE_BALLCONTROL_VS_REACTION` | **Ball Control (PRO)** (Playmaker) | **Reactions (MEN)** (Presser) | Press-resistant soft cushion away from incoming defensive press. |
  | **Creation** | `CRE_DRIBBLING_VS_TACKLING` | **Dribbling (PRO)** (Attacking winger)| **Tackling (DEF)** (Fullback) | Isolation 1v1 take-on to penetrate the penalty area. |
  | **Creation** | `CRE_SHORTPASS_VS_INTERCEPTIONS`| **Short Pass (PAS)** (Central Mid) | **Interceptions (DEF)** (Holding Mid) | Needle pass through lines vs defensive screen cut-off. |
  | **Creation** | `CRE_LONGPASS_VS_MARKING` | **Long Pass (PAS)** (Deep Quarterback)| **Marking (DEF)** (Backline CB) | Inch-perfect 40-yard diagonal delivery vs trailing marking runner. |
  | **Creation** | `CRE_CROSSING_VS_INTERCEPTIONS` | **Crossing (PAS)** (Wide Attacker) | **Interceptions (DEF)** (Fullback block)| Beating wide defender block to put venomous cross in danger zone. |
  | **Goalscoring Stage 1** | `GOAL_SHOOTING_VS_INTERCEPTIONS` | **Shooting (GOA)** (Striker) | **Interceptions (DEF)** (Shot Blocker) | Finding box shooting angle vs last-ditch defender sliding block. |
  | **Goalscoring Stage 1** | `GOAL_LONGSHOTS_VS_TACKLING` | **Long Shots (GOA)** (Distance shooter)| **Tackling (DEF)** (Closing Midfielder)| Unleashing long-range missile before close-down tackle lands. |
  | **Goalscoring Stage 1** | `GOAL_HEADING_VS_STRENGTH` | **Heading (GOA)** (Aerial Striker) | **Strength (PHY)** (Center Back) | Winning aerial duel positioning to angle power header on frame. |
  | **Goalscoring Stage 2 (GK)**| `GOAL_SHOOTING_VS_GK` | **Shooting (GOA)** (Striker) | **Saving / Reflexes (GOA)** (Goalkeeper)| Clinical box finish placement vs goalkeeper reaction dive / save. |
  | **Goalscoring Stage 2 (GK)**| `GOAL_LONGSHOTS_VS_GK` | **Long Shots (GOA)** (Shooter) | **Positioning / Saving (GOA)** (GK) | Top corner screamer vs goalkeeper lateral reach & tip over bar. |
  | **Goalscoring Stage 2 (GK)**| `GOAL_HEADING_VS_GK` | **Heading (GOA)** (Aerial forward) | **Positioning / Reflexes (GOA)** (GK) | Downward header bouncing in corner vs goalkeeper reflex stop. |
  | **Goalkeeper Breakaway** | `GK_1V1_VS_DRIBBLING` | **One-on-One (GOA)** (Goalkeeper) | **Dribbling (PRO)** / **Shooting (GOA)**| Sweeping rush off line to smother runaway striker before shot. |
  | **Goalkeeper Aerial Claim** | `GK_AER_VS_HEADING` | **Aerial Reach (GOA)** (Goalkeeper)| **Heading (GOA)** (Opponent target) | Flapped corner/cross punch vs commanding high-point catch. |
  | **Goalkeeper Counter-Break** | `GK_DIS_VS_INTERCEPTIONS` | **Distribution (GOA)** (Goalkeeper)| **Interceptions (DEF)** (Midfield line) | Laser 50-yard throwing or half-volley counter to start fast break. |

* **Playstyles Define Qualitative Behavioral AI, Tactical Movement Tendencies & Pitch Physics:**
  * Even two players with identical 85 Overall attributes will behave completely differently on the pitch depending on their Playstyle:
    * An 85 OVR Striker with **Poacher** will linger on the shoulder of the last defender, rarely dropping into midfield, prioritizing blindside box runs to tap in crosses.
    * An 85 OVR Striker with **Target** will deliberately drop deep to meet aerial balls, post up physically against center backs, and hold up play to lay off passes to runners.
    * An 85 OVR Striker with **Decoy** will make continuous diagonal dummy runs toward the touchline to pull central defenders out of position and trigger intense high pressing upon turnover.
    * An 85 OVR Fullback with **Inverted** will drift centrally into the half-spaces to act as a pivot during possession, whereas an **Attacker** fullback hugs the touchline and overlaps to cross.
    * An 85 OVR Winger with **Traditional** stays glued to the sideline to deliver early crosses; an **Inverted** winger constantly cuts inside to shoot on their strong foot; a **Pressing** winger relentlessly tracks back to double-team opponent fullbacks.

* **The "Basic" Default Playstyle & Initial Career Trajectory:**
  * **Starting Baseline:** Every player begins their football journey with the **"Basic" Playstyle** (`basic`). The Basic playstyle represents an unspecialized raw youth prospect: it has **zero special behavior modifiers, zero positioning biases, and zero tactical buffs or penalties**. The player moves strictly according to fundamental positional geometry.
  * **Signing with a Professional Club & Manager Assignment:**
    * Upon signing a professional contract with a club, the manager assigns a tactical playstyle to each position on the team sheet based on their tactical system (e.g. Pep's system assigns *Inverted Fullback* and *Maestro CM*; Simeone's system assigns *Enforcer CDM* and *Poacher ST*).
    * When a player joins the club, the manager directly asks them to assume the specific **desired playstyle** called for by the club's tactical blueprint.
  * **Playing Out of Assigned Playstyle (Tactical Selection AI):**
    * A player **can** play a position without having that position's tactically desired playstyle.
    * **Manager Decision Rule:** Managers naturally prefer fielding players who already possess their system's desired playstyle. However, **if a player is +2 or more OVR higher than the alternative option who has the desired playstyle, the manager will start the higher-rated player regardless!**
  * **The Playstyle Learning Event System:**
    * When a manager plays an elite player (+2 OVR higher) without the desired playstyle, or wishes to mold the player into their tactical scheme, it triggers the **"Learn Manager's Desired Playstyle" Event**.
    * The player engages in tactical training drills and match experience over multiple fixtures. Upon reaching the adaptation threshold, the player successfully learns and adopts the manager's desired playstyle, permanently adding it to their tactical repertoire!

---

### C. Special Tactical Positions & Manager Repositioning Directives

Beyond the standard positions above, DrawStar Remake 2.0 features **Special Positions**. Special positions cannot be selected during the initial Youth Career onboarding; they are unlocked and earned exclusively when managers ask you to train for specific tactical systems (3ATB, 5ATB, 4-2-2-2, 4-2-3-1, Cruyffian 3-4-3):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SPECIAL POSITIONS & ADAPTATION TAXONOMY                                │
├─────────────────────┬──────────┬─────────────────┬─────────────────────────────────────────────────────┤
│ SPECIAL POSITION    │ BASE CAT │ BORROWED FROM   │ PLAYSTYLES ACCESSIBLE                               │
├─────────────────────┼──────────┼─────────────────┼─────────────────────────────────────────────────────┤
│ 1. Wingback         │ DEF      │ Fullback (LB/RB)│ Attacker, Inverted, Defensive, Balanced             │
│    (LWB / RWB)      │          │ (runs flank)    │                                                     │
├─────────────────────┼──────────┼─────────────────┼─────────────────────────────────────────────────────┤
│ 2. Second Striker   │ ATT      │ CAM / MO        │ Creator, Shadow, Classic N10, Engine                │
│    (SS / False 9)   │          │ (in hole/f9)    │                                                     │
├─────────────────────┼──────────┼─────────────────┼─────────────────────────────────────────────────────┤
│ 3. Wide Midfielder  │ MID      │ Winger (LW/RW)  │ Traditional, Inverted, Prolific, Pressing           │
│    (LM / RM)        │          │ (in midfield)   │                                                     │
├─────────────────────┼──────────┼─────────────────┼─────────────────────────────────────────────────────┤
│ 4. Libero / Sweeper │ DEF      │ CB & CDM        │ Playmaker, Distributor, Stopper, Sweeper            │
│    (LIB / SW)       │          │ (sweeper pivot) │                                                     │
└─────────────────────┴──────────┴─────────────────┴─────────────────────────────────────────────────────┘
```

#### 1. Detailed Breakdown of Special Positions
1. **Wingback / Carrilero (`LWB` / `RWB`):**
   * *Tactical Formations:* Deployed in 3-at-the-back (3-5-2, 3-4-3, 3-4-2-1) or 5-at-the-back (5-3-2) systems. An ultra-athletic hybrid who owns the entire touchline single-handedly.
   * *Playstyles:* Inherits Fullback playstyles (*Attacker*, *Inverted*, *Defensive*, *Balanced*).
   * *Notable Real-World Archetypes:* Federico Dimarco (Inter 3-5-2), Denzel Dumfries (Inter), Jeremie Frimpong / Álex Grimaldo (Bayer Leverkusen) | *Legends:* Cafu, Roberto Carlos, Marcos Alonso (Chelsea 3-4-2-1).
2. **Second Striker / False 9 (`SS`):**
   * *Tactical Formations:* Deployed in 2-striker systems (4-4-2, 3-5-2, 4-3-1-2) operating in the hole behind the primary striker, or as the fluid focal point in a **4-3-3 False 9** system (frequently utilized by Spain with Mikel Oyarzabal, or Pep Guardiola's iconic Barcelona with Messi). An Attacker (ATT) who borrows CAM playstyles.
   * *Playstyles:* Inherits CAM playstyles (*Creator*, *Shadow*, *Classic N10*, *Engine*).
   * *Notable Real-World Archetypes:* Mikel Oyarzabal (Spain False 9), Antoine Griezmann (Atlético Madrid), Paulo Dybala (Roma) | *Legends:* Alessandro Del Piero, Dennis Bergkamp, Roberto Baggio, Johan Cruyff.
3. **Wide Midfielder (`LM` / `RM`):**
   * *Tactical Formations:* Deployed in 4-4-2, 4-5-1, 4-2-3-1, or 5-4-1 formations (and rarely in 3-at-the-back setups under offensive coaches). Midfielders who patrol the wide channels, combining defensive tracking with the dribbling, pacing, and crossing qualities of wingers.
   * *Playstyles:* Inherits Winger playstyles (*Traditional*, *Inverted*, *Prolific*, *Pressing*).
   * *Notable Real-World Archetypes:* Kingsley Coman, Federico Chiesa, Nico Williams | *Legends:* David Beckham, Ryan Giggs, Park Ji-sung, Pavel Nedvěd.
4. **Libero / Sweeper (`LIB` / `SW`):**
   * *Tactical Formations:* Stationed as the central anchor of a 3-at-the-back defense (3-4-3, 3-5-2) or 5-3-2 in possession-based systems. Sweeps up loose balls behind the backline out of possession, and steps into central midfield with the ball to create overloads and launch diagonal switches.
   * *Playstyles:* Inherits CB & CDM playstyles (*Playmaker*, *Distributor*, *Stopper*, *Sweeper*).
   * *Notable Real-World Archetypes:* John Stones (Manchester City hybrid center-back/pivot) | *Legends:* Franz Beckenbauer, Franco Baresi, Ronald Koeman, Matthias Sammer, Gaetano Scirea.

* **Design Discipline & Playstyle Integration Rationale:**
  * **Inside Forward (`IF`):** Discarded as a special sub-position because it is already fully covered by the **Prolific** playstyle for Wingers (`LW` / `RW`) who cut inside diagonally to function as primary goalscorers.
  * **Regista:** Integrated directly as an authentic tactical **Playstyle for Central Defensive Midfielders (CDM)** (alongside *Enforcer* and *Anchor*), rather than creating an artificial sub-position.
  * **Sweeper Keeper (`SK`):** Discarded as a special sub-position because **Sweeper** is already an authentic playstyle under Goalkeepers (`GK`).
  * **Inverted Fullback:** Discarded as a special sub-position because **Inverted** is already an authentic playstyle under Fullbacks (`LB` / `RB`).
  * **Strict Positional Hierarchy:** The career engine therefore strictly maintains exactly four (4) specialized tactical sub-positions: **SS**, **LM / RM**, **WB (LWB / RWB)**, and **LIB (Libero / Sweeper)**.

#### 2. Manager Tactical Demands, Playstyle Conflicts & Squad Competition Engine

In real football, tactical fit often supersedes raw talent. DrawStar Remake 2.0 models the realistic psychological and structural tension between **Player Identity vs. Manager System**:

* **Manager Directives: Learn New Playstyle or Position**
  * When a manager's formation or philosophy doesn't align with your profile (e.g., a Gegenpress manager demanding a classic luxury CAM convert to an *Engine*, or an attacking Fullback asked to convert to an *Inverted* Fullback or *Carrilero*), the manager calls an urgent office meeting.
  * The manager presents a choice:
    1. **Accept Retraining:**
       * You agree to retrain your playstyle or learn the proposed new/special position.
       * Gain **$+15$ Manager Trust**, temporary training focus dedicated to adaptation, and eventually master the new tactical archetype.
    2. **Reject Retraining & Retain Your Authentic Style:**
       * You stand your ground: *"Boss, my game is about being a traditional creator; I won't change."*
       * **Consequences:** You suffer **$-10$ Chemistry** and **$-15$ Manager Trust**, but keep your original playstyle and identity intact!
       * **The Results Clause:** If you continue delivering exceptional pitch results (match ratings $\ge 7.2$, consistent goals/assists/clean sheets), the manager is forced to keep starting you because of your undeniable impact on the pitch.

* **Squad Competition & The Bench Dilemma (Tactical Fit vs. Raw OVR):**
  * If the squad features a positional competitor with similar Overall ($|\Delta\text{OVR}| \le 3$) and comparable statistical contribution, but who possesses the **exact Playstyle the manager desires for his tactic**, the manager will bench you in favor of the competitor!
  * Sitting on the bench triggers an interactive **Office Confrontation Meeting** where you can demand answers:
    * *"Boss, why am I on the bench? My form and OVR are higher than the starter's."*
  * The manager evaluates your age, upside, and squad status to offer realistic career paths:
    1. **Master the Desired Playstyle / Position:**
       * *"You're competing with a player who fits my system like a glove. If you adapt to my required playstyle, you'll win your starting spot back."*
    2. **Learn an Alternative Position Where an Opening Exists:**
       * *"Look, the central striker spot is locked, but we lack depth on the flank. Learn Wingback or Wide Midfielder, and once you master the position, you'll be an undisputed starter."*
    3. **Go Out on Loan (For Young Players $\le 22$ Years Old):**
       * *"You have immense talent, but you need 35 starts this season to develop that potential. A loan move to a club that plays your style will give you guaranteed minutes."*
       * Player can accept loan listing to be scouted by clubs in lower leagues or partner clubs.
    4. **Request Transfer / Placed on the Market:**
       * *"If our philosophies are incompatible and you refuse to adapt, it's best for both parties if we part ways. I'll instruct the board to put you on the transfer list."*
       * Places the player on the transfer market for incoming offers in the upcoming transfer window.

---

### D. The Career Menu HUD & Core Player Status (Professional & Free Agent)

Whether currently contracted to a world superclub or navigating the open market as a free agent, the primary Career Hub HUD (`CareerHubScreen.tsx` / `CareerPlayerStatusHUD.tsx`) displays an authoritative, real-time snapshot of the footballer's condition, standing, and mechanical bonuses:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [★ PROFILE EMBLEM]   CARLOS "EL MATADOR" SILVA                   AGE: 22 | OVR: 84    │
│  CLUB: ATLÉTICO MADRID (LA LIGA)   |   NAT: ARGENTINA 🇦🇷          WAGE: €65,000 / WK   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  POSITION: RWB (WINGBACK / CARRILERO)  •  SUB: HIGH-MOTOR SHUTTLE                      │
│  PLAYSTYLES: [⚡ TURBINE ENGINE] [🎯 ENDLINE CUTBACK] [🛡️ TRACKBACK DEMON]             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  CHEMISTRY:  [████████████████████░░░░░]  78% (HIGH SQUAD HARMONY)                     │
│  FITNESS:    [██████████░░░░░░░░░░░░░░░]  42% ⚠️ FATIGUED (-8 PHYSICAL PENALTY)        │
│  BODY COND:  [████████████████░░░░░░░░░]  73 KG / 170 CM (+3 KG OVERWEIGHT: -3 PAC, -3 STA) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ⚡ ACTIVE STAT MODIFIERS & TEMPORARY BONUSES LEDGER:                                  │
│  [+] +3 SHOOTING  │ Titanium Strike Cleats (Consumable Equipment)    │ 3 Matches Left  │
│  [+] +2 VISION    │ Manager Masterclass Tactical Card (Card System)  │ 1 Match Left    │
│  [-] -3 PACE      │ Overweight Penalty (+3 kg over ideal 70 kg)      │ Active In-Match │
│  [-] -3 STAMINA   │ Overweight Penalty (+3 kg over ideal 70 kg)      │ Active In-Match │
│  [-] -8 PACE      │ Severe Fitness Depletion (< 50% Threshold)       │ Active In-Match │
│  [-] -8 STAMINA   │ Severe Fitness Depletion (< 50% Threshold)       │ Active In-Match │
│  [-] -8 STRENGTH  │ Severe Fitness Depletion (< 50% Threshold)       │ Active In-Match │
│  [-] -2 COMPOSURE │ Media Defamation Backroom Scandal (Event)        │ 2 Weeks Left    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. The Chemistry Bar ($0 - 100\%$)
* Represents dressing room cohesion, tactical understanding with teammates, and squad respect.
* Influenced by time spent at the club, shared victories, Bad Reputation tier, and personality compatibility.
* **Mechanical Benefit:** High chemistry ($\ge 75\%$) boosts teammate passing accuracy toward player by $+15\%$ and increases AI cutback frequency in the attacking third.

#### 2. The Strict Fitness Depletion Penalty Rule (Under 50% Threshold)
* Normal fitness ranges from $50\%$ to $100\%$, where the player operates with zero physical impairment.
* **The Mathematical Penalty:** When Fitness dips below $50\%$, **every single $1\%$ drop below $50\%$ inflicts an immediate $-1$ point temporary penalty across ALL THREE Physical Attributes (Pace, Stamina, Strength)**:
  $$\text{Deficit} = \max(0, 50 - \text{Fitness})$$
  $$\text{Pace}_{\text{effective}} = \text{Pace}_{\text{base}} - \text{Deficit}$$
  $$\text{Stamina}_{\text{effective}} = \text{Stamina}_{\text{base}} - \text{Deficit}$$
  $$\text{Strength}_{\text{effective}} = \text{Strength}_{\text{base}} - \text{Deficit}$$
* **Penalty Impact Examples:**
  * *Fitness 48%:* $50 - 48 = 2\%$ deficit $\rightarrow$ **$-2$ Pace, $-2$ Stamina, $-2$ Strength**.
  * *Fitness 42%:* $50 - 42 = 8\%$ deficit $\rightarrow$ **$-8$ Pace, $-8$ Stamina, $-8$ Strength**.
  * *Fitness 30%:* $50 - 30 = 20\%$ deficit $\rightarrow$ **$-20$ Pace, $-20$ Stamina, $-20$ Strength** (devastating sluggishness, severe injury risk).
  * *Fitness 15%:* $50 - 15 = 35\%$ deficit $\rightarrow$ **$-35$ Pace, $-35$ Stamina, $-35$ Strength** (unplayable exhaustion).

#### 3. The Body Conditioning & Weight Status HUD (From Section 5.D)
* Displays current Weight relative to **Ideal Weight ($\text{Height} - 100$)**:
  * **Optimal Lean Safe Zone ($[\text{Ideal}-5, \text{Ideal}]$):** Displays in **Emerald Green** (`Optimal Conditioning • 0 Penalty`).
  * **Overweight Zone ($> \text{Ideal}$):** Displays in **Amber/Red** (`Overweight: -X PAC, -X STA`), automatically injecting active penalties into the ledger.
  * **Severe Underweight Zone ($< \text{Ideal}-5$):** Displays in **Amber/Red** (`Underweight: -X STR`), automatically injecting active strength penalty into the ledger.
* Informs player if club medical staff has initiated a **Special Diet Directive** (Strict, Cheating, or Refused).

#### 4. The Active Bonus Stats Ledger (Positive & Negative Modifiers)
* Every temporary stat modification is visible in two synchronized UI locations:
  1. **Directly on the Player Card / Attribute Hexagon:** Numeric deltas render in vibrant **Emerald Green (`+X`)** for bonuses and **Crimson Red (`-X`)** for penalties.
  2. **The Active Modifiers Breakdown Ledger:** An itemized, scrollable card beneath the attributes explicitly declaring:
     * **Modifier Source:** Originating Event, Consumable Item, Equipable Customization, Card Deck Buff, or Physical Fatigue.
     * **Attribute Target & Exact Value:** (e.g. `+3 Shooting`, `-5 Reactions`).
     * **Expiration & Remaining Duration:** Matches remaining, weeks remaining, or active status.

#### 4. Prominent OVR & Positional Badge Display
* Calculated live from current effective attributes, dynamically showing both Base OVR and Effective OVR (e.g. `84 (-3 Fatigue)`).
* Fully accessible for both signed professionals and unattached **Free Agents** seeking club trials.

---

## 7. THE BAD REPUTATION SYSTEM (MATHEMATICAL MECHANICS)

### A. The Core Bad Reputation Tiers & Gameplay Modifiers

| Tier | Label | Red Card Multiplier | Transfer Drop Chance | Starting Club Chemistry | Gameplay Intimidation Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | *Clean Record* | **1.00x** (Standard) | **0%** | **50** (Standard) | None |
| **Tier I** | *I "Bad Boy"* | **1.20x** (+20%) | **25%** | **40** (-10) | +5% physical duel aggression |
| **Tier II** | *II "Menace"* | **1.40x** (+40%) | **50%** | **30** (-20) | Opponents suffer -5% composure when marking |
| **Tier III** | *III "Psycho"* | **1.60x** (+60%) | **75%** | **20** (-30) | Maximum fear in 50/50 duels; heavy wage fines |

* **Escalation Triggers:** Earning 2+ straight red cards in a season, dressing-room physical brawls, public media outbursts, illicit partying benders, cheating on medical diets, or choosing violent/defiant options in events advances the tier by +1.

---

### B. The Club Tenure Bad Reputation Offset Engine (Loyalty Stature)

In real football, long-serving club icons (like Sergio Ramos at Real Madrid, Roy Keane at Man United, or Diego Costa at Atlético Madrid) are beloved and protected by their home fans and club hierarchy despite their ferocious reputation abroad. DrawStar Remake 2.0 captures this through the **Club Tenure Offset Mechanic**:

#### 1. Tenure Stature Tiers & Temporary Offsets
* **2+ Consecutive Seasons at Same Club (Local Pillar):**
  * Grants a **1-Tier Temporary Offset**:
    * **Tier I** appears, behaves, and applies in club interactions as **Tier 0 (Clean Record)**.
    * **Tier II** appears and behaves as **Tier I**.
    * **Tier III** appears and behaves as **Tier II**.
* **5+ Consecutive Seasons at Same Club (Club Legend / Protected Talisman):**
  * Stacks up to a **2-Tier Temporary Offset**:
    * **Tier I** appears and behaves as **Tier 0**.
    * **Tier II** appears, behaves, and applies as **Tier 0 (Clean Record)**!
    * **Tier III** appears and behaves as **Tier I**.

#### 2. The Absolute Shatter & Season 0 Reset Rule
* **Underlying True Value Persistence:** The player's **True Bad Reputation Tier** is continuously tracked in the background. The offset is strictly a fragile protective halo granted by local club loyalty.
* **Instant Shatter Trigger:**
  * **The exact moment the player gains ANY Bad Reputation points or incurs a new disciplinary infraction** (e.g. receiving a straight red card, discovered cheating on a special diet, provoking a nightclub brawl, or public insubordination toward the manager):
    1. **The Offset Instantly Shatters:** The protective veil collapses in real time. The player's Bad Reputation immediately reverts to its full, unmitigated **True Tier**!
    2. **Tenure Offset Counter Resets to Season 0:** The club hierarchy's patience is completely exhausted. The loyalty tenure counter resets back to **Season 0**, meaning the player must spend another **2 full consecutive seasons with zero incidents** before earning even a 1-tier offset again—even if they remain at the same club!
* **Transfer Nullification:** If the player transfers or moves to a different club, all loyalty offsets instantly evaporate. The new club and its supporters view the player exclusively through their **True Bad Reputation** value.

---

### C. Behavioral Locks for Bad Reputation Tier I or Higher (Ego & Rebellion Restrictions)

Players possessing an effective Bad Reputation of **Tier I or higher** cannot magically act as humble, obedient model citizens when it suits them. Their volatile ego, rebellious pride, and cynical disposition permanently lock out submissive choices:

#### 1. The Medical Special Diet Behavioral Lock
* As established in Section 5.E, when the Club Medical Staff issues a **Special Diet Directive**, a player with **Tier I+ Bad Reputation CANNOT choose to "Follow Strictly"**!
* The `[Follow Strictly]` button is visually disabled / grayed out, displaying an unyielding character tooltip:
  > *"🔒 LOCKED — Your rebellious ego and defiant nature refuse strict nutritional subservience. You will either cheat or confront them head-on."*
* The player is strictly restricted to choosing between:
  1. **"Cheat" on Diet:** Sneak junk food, cheat meals, and fast-food deliveries while pretending to comply (35% monthly discovery risk).
  2. **Outright Refuse:** Arrogantly defy the club doctor and head nutritionist in front of the squad (+15 Bad Rep, -25 Manager Trust, squad exile).

#### 2. Broader Disciplinary Behavioral Constraints for Tier I+ Players
* **Apologies & PR Scenarios:** Cannot issue scripted submissive club PR apologies following red cards or training spats; must either double-down defiantly or deflect blame onto referee bias.
* **Wage Deferrals & Financial Crises:** Cannot accept voluntary wage reductions or compassionate payment delays during club administration/crises.
* **Quiet Reserve Demotions:** If dropped to the reserves or placed on the bench, cannot choose "Wait patiently for my turn"; must either request a hostile office confrontation with the manager or instruct their agent to demand an immediate transfer.
* **Mediation Meetings:** Disciplinary mediation sessions with club management have a baseline $+30\%$ chance of devolving into shouting matches unless their Agent possesses an elite Negotiation rating ($\ge 85$).

---

## 8. THE AGENT & MANAGER RELATIONSHIP SYSTEMS

### A. The Agent System (Mathematical Formulas & Directives)

* **Effective Transfer Visibility Formula:**
  $$\text{Effective Visibility} = (0.50 \times \text{Player Fame}) + (0.50 \times \text{Agent Network})$$
* **Wage Negotiation Multiplier:**
  $$\text{Final Wage} = \text{Base Club Offer} \times \left(1.0 + \frac{\text{Agent Negotiation}}{200}\right)$$
* **Directives (Fullscreen Scene Dialogue):** Contract Renewal, Transfer Request, Demand Playing Time, Arrange Tactical Meeting (cleanses Defiance penalties).

---

### B. The Club & National Team Manager Relationship Engine (`managerRelationshipSystem.ts`)

Football careers are forged in the dynamic tension between player ambition and managerial philosophy. Both club and national teams operate an active **Manager Relationship Engine**:

#### 1. The Manager Trust Metric ($0 - 100$)
* **Trust Mechanics:**
  * Starting trust at a new club is calibrated to your arrival stature (e.g. 50 for academy prospects, 75 for marquee signings).
  * **Trust $\ge 75$ (Talisman):** Guaranteed starter; granted positional freedom; preferred penalty/free-kick taker; captaincy candidate.
  * **Trust $45 - 74$ (Regular / Rotational):** Starts standard matches; substituted if match rating dips below 6.0; expected to strictly obey tactical instructions.
  * **Trust $< 45$ (In the Doghouse):** Demoted to bench or reserves; public criticisms in press conferences; transfer listing or loan exile if trust drops below 25.
* **Trust Drivers:** Training ratings, match performance ratings ($\ge 7.0$ grants $+3$ Trust), tactical obedience, maintaining low Bad Reputation, and fulfilling manager directives.

#### 2. Tri-Tier National Team Management (Different Managers for U17, U20, Senior)
National football associations do NOT use a single monolithic coach. Each national youth and senior division employs a **completely distinct manager** with independent personality archetypes, favored tactical formations, and squad selection criteria:
* **U17 National Team Manager:**
  * *Focus:* Raw technical fundamentals, work ethic, and developmental upside.
  * *Priority:* Will play a 15-year-old with 85 Potential over a static 17-year-old with low ceiling.
* **U20 National Team Manager:**
  * *Focus:* Tactical maturity, tournament endurance, and international physicality.
  * *Priority:* Values positional discipline and composure in high-pressure knockout environments.
* **Senior National Team Head Coach:**
  * *Focus:* Ruthless immediate results, elite form rating ($\ge 7.0$), big-match pedigree, and international tactical coherence.
  * *First-Time Call-Up:* The maiden senior call-up is a monumental career milestone triggering a **Phone Call Event** (Section 20.D).

#### 3. Cultural Tactical Identities of the 6 Footballing Superpowers
While lower-tier and smaller national teams utilize varied or randomized tactical systems (e.g. Direct Long Ball, Wing Play, High Press, Park the Bus, Fluid 4-3-3), the **6 Global Superpowers** strictly enforce their world-famous, historically ingrained tactical dogmas:

| Nation | Tactical Dogma | Core Tactical Identity & Demanded Attributes | Youth $\rightarrow$ Senior Continuity |
| :--- | :--- | :--- | :--- |
| **🇪🇸 Spain** | **Tiki-Taka / Juego de Posición** | Extreme possession-based suffocating dominance ($\ge 65\%$ possession). Short passing triangles, patient territorial pinning. Demands elite **Short Passing ($\ge 78$)**, **Vision**, and **Ball Retention**. | **Strictly Streamlined:** U17, U20, and Senior teams all enforce identical 4-3-3 positional grids. |
| **🇮🇹 Italy** | **Catenaccio / Solidità Difensiva** | Unshakeable defensive compactness, structured low block, masterclass tactical cynicism, and lethal vertical counter-attacks. Demands elite **Defensive Awareness**, **Tackling**, and **Concentration**. | Structured defensive discipline drilled relentlessly from U17 upward. |
| **🇩🇪 Germany** | **Gegenpressing / Heavy Metal Rock & Roll** | Relentless high-octane pressing, ferocious counter-pressing within 5 seconds of turnover, punishing vertical velocity. Demands maximum **Stamina**, **Work Rate**, and **Acceleration**. | Aggressive physical intensity and collective athletic pressing across all tiers. |
| **🇫🇷 France** | **Deadly Transition Counter-Attack** | Compact athletic mid-block absorbing opponent pressure, followed by explosive vertical transitions powered by terrifying speed, physical dominance, and clinical finishing. Demands **Pace**, **Strength**, and **Finishing**. | Devastating transition speed and athletic physical prowess. |
| **🇦🇷 Argentina** | **Fútbol Champán / Garra & Potrero** | The classic free-roaming Number 10 maestro orchestrating play with swagger, combined with ferocious *Garra Criolla* intensity. Tactical gamesmanship: cynical time-wasting when ahead, feigning fouls, breaking opponent tempo, bone-crunching challenges, and intense psychological provocation of rivals. Demands **Flair**, **Composure**, **Short Pass**, and **Aggression**. | Street cunning (*Potrero*) and emotional warrior spirit across all levels. |
| **🇧🇷 Brazil** | **Jogo Bonito & Relational Play** | Unbridled technical flair, joyful 1v1 samba dribbling, and organic collective improvisation over rigid geometric lines. While youth squads celebrate individual flair, the **Senior National Team leans into modern South American relational functional fluidity** (players gravitating together to overload zones organically). Demands **Dribbling**, **Agility**, **Ball Control**, and **Flair**. | Pure samba freedom in youth, evolving into dynamic relational overloads at Senior level. |

* **Domestic Giant Clubs Continuity:**
  The largest clubs in each league similarly reflect their institutional heritage:
  * *Real Madrid:* Individual brilliance, lethal clutch mentality, and European Champions League aura.
  * *FC Barcelona:* Pure Cruyffian positional play, high possession, La Masia technical DNA.
  * *Juventus:* Tenacious defensive pragmatism (*Fino alla fine*), physical tactical discipline.
  * *Bayern Munich:* Dominant, high-intensity pressing machine with relentless attacking power.
  * *Arsenal:* Fluid, artistic passing combinations and dynamic offensive interchanges.
  * *Boca Juniors:* Fierce, heart-on-sleeve intensity echoing the roar of La Bombonera.
  * *River Plate:* Silky, offensive, technical aristocracy (*La Máquina* legacy).

---

### C. Transfer Market Origin System, Proposal Presentation & Contract Negotiation (`transferOriginEngine.ts`, `TransferInterestModal.tsx`)

In real-world football, player transfers do not materialize out of a generic corporate vacuum; they originate either from the **Head Coach / Manager's tactical masterplan** or from the **Club Figurehead's (President, Chairman, Owner, Sporting Director) commercial or political agenda**. DrawStar Remake 2.0 explicitly models this dynamic tension:

#### 1. Transfer Origin Taxonomy
* **Type A: Manager-Requested Tactical Signing (85%–90% of Offers)**
  * **Genesis:** The head coach scouted you to fill an exact role vacancy within their favored tactical formation (e.g., an aggressive *Carrilero* in a 3-5-2, an inverted playmaker on the flank, or a relentless pressing box-to-box midfielder in a Gegenpress setup).
  * **Starting Manager Trust:** High baseline (**$65 - 75$ Trust** upon arrival). You are immediately designated as an intended starter.
  * **Tactical Leeway:** The manager exhibits high patience and provides tactical forgiveness during your first 5 adaptation fixtures.
  * **Wage Structure:** Fair market squad parity matching your wage bracket.

* **Type B: Rare Club Figurehead / Presidential Signing (10%–15% Rare Phenomenon)**
  * **Genesis:** The transfer is spearheaded by the Club President, Majority Owner, or Sporting Director as a marquee commercial acquisition, election-promise signing, or global vanity showcase (the iconic *"Galáctico"* or billionaire vanity phenomenon), irrespective of the manager's tactical system.
  * **Trigger Conditions:**
    * Player Fame $\ge 70$, or Marketability $\ge 65$, or Global Icon Points $\ge 150$.
    * Base frequency: **5% chance** per transfer window at Tier 2 clubs; **12%–15% chance** at Tier 1 global titans if you finished on a continental or world award podium (e.g. Ballon d'Or top 3, Golden Boy winner).
  * **Financial & Commercial Privileges:**
    * **Exorbitant Wages:** $+25\%$ to $+50\%$ above standard wage proposals for your current overall.
    * **Commercial Hype:** $+15$ Marketability, $+25$ Personal Wealth signing bonus, $+20$ Global Club Brand Hype.
    * **Presidential Unveiling:** Lavish stadium presentation gala with presidential photo-op and immediate jersey number prestige.
  * **The Managerial Friction Arc (The "Unwanted Star" Narrative):**
    * **Skeptical Manager:** Because the head coach did *not* request you and may resent the board imposing an unneeded superstar over their disciplined tactical system, **Starting Manager Trust begins depressed at $40 - 50$ (Rotational / Under Scrutiny)**.
    * **Trial by Fire:** You must earn the coach's trust through high match ratings ($\ge 7.2$) or training excellence. If you fail to deliver early, the coach will deliberately bench you to assert managerial sovereignty over the board.
    * **Boardroom Cold War Events:** If the manager benches you while the President champions your stardom, dynamic media headlines trigger (*"President Clashes with Coach Over Benched Marquee Signing"*), unlocking dramatic dialogue options: appease the manager by volunteering for defensive shifts, or leverage presidential favor to exert dressing-room influence!

---

#### 2. Comprehensive Transfer Offer Presentation UI (Small-Phone Mobile-First Architecture)
When an interested club submits a formal transfer offer, the player is presented with a complete dossier designed for clean, scannable reading on small mobile viewports (minimum 360px width, zero horizontal scrolling, high-contrast typography, zero nested walls of text):

```
┌────────────────────────────────────────────────────────┐
│ 🔴 BAYERN MUNICH                     [★ ★ ★ ★ ★ TIER 1]│
│ 💼 Manager-Requested Signing  •  4-2-3-1 Gegenpress    │
├────────────────────────────────────────────────────────┤
│ 🎯 PITCH INTENT & TACTICAL FIT                         │
│ • Position Offered: Central Attacking Midfielder (CAM) │
│ • Desired Playstyle: "Creator" (Tactical Role: Playmaker│
│ • Position Competitors: Jamal Musiala (88), Müller (83)│
│                                                        │
│ 🏅 PROPOSED SQUAD ROLE & HIERARCHY                     │
│ • Squad Level: First Team                              │
│ • Role: [ KEY PLAYER ]                                 │
│   (Starter rotates regularly; Key Player starts all    │
│    league/continental ties & only rests in low cups)   │
├────────────────────────────────────────────────────────┤
│ 📈 YOUTH DEVELOPMENT TIERS (Under 20 Years Old Only)   │
│ • Youth Academy Rating: Tier 5 (World Class Facilities)│
│ • Training XP Multiplier: +25% Stat Training Velocity  │
├────────────────────────────────────────────────────────┤
│ 💶 CONTRACT COMPENSATION & FINANCIAL TERMS             │
│ • Weekly Wage: €185,000 / week (€9,620,000 / year)     │
│ • Signing Bonus: €1,154,400 (12% of Annual Salary)     │
│ • Contract Length: 4 Years                             │
│ • Release Clause: €150,000,000 (Mandatory Buyout)      │
├────────────────────────────────────────────────────────┤
│ [ 🤝 NEGOTIATE TERMS ]  [ 🟢 ACCEPT ]  [ 🔴 DECLINE ] │
└────────────────────────────────────────────────────────┘
```

##### Exact Data Dossier Breakdown:
1. **Club Identity & Tactical System:**
   * Full Club Name, Crest, Competition, and **Club Competitive Tier** (Tiers 1–12).
   * **Favored Formation & Tactical Style:** (e.g. `4-3-3 Tiki-Taka`, `3-5-2 Direct Counter`, `4-2-3-1 High Press`).
   * **Target Position:** The exact position on the pitch the manager plans to field you (e.g. ST, CAM, LW, CDM, CB, RB, GK).
   * **Desired Playstyle:** The specific tactical playstyle requested for that slot (e.g. *Poacher*, *Maestro*, *Inverted*, *Enforcer*).
   * **Position Competitors in the Squad:** Direct listing of teammates currently playing in that position along with their OVR ratings (e.g. *Musiala 88 OVR, Müller 83 OVR*), allowing the player to evaluate whether they will walk into the starting lineup or face a fierce fight for minutes.
2. **Squad Hierarchy & Distinction between "Starter" vs. "Key Player":**
   * **Hierarchy Tiers:** `U17` $\rightarrow$ `U20` $\rightarrow$ `Reserves` $\rightarrow$ `Rotation` $\rightarrow$ `Starter` $\rightarrow$ `Key Player`.
   * **The Vital "Starter" vs. "Key Player" Operational Difference:**
     * **Starter:** Standard first-choice starter who undergoes routine fitness squad rotation throughout a 50+ match season (e.g. rested during midweek congested fixtures, rotated out when energy drops below 85%).
     * **Key Player:** Untouchable team cornerstone. A Key Player **never** rotates during league campaigns or knockout continental ties; they **only rest during low-importance fixtures** (such as early-stage domestic cup rounds, dead-rubber continental group stages when qualification is secured, or blowout home games against bottom-tier relegation fodder).
3. **Youth Development Tier (Active for Prospects Under 20 Years Old):**
   * Displays the club's youth academy training infrastructure grade (Tiers 1–5).
   * Explains the tangible youth training boost: Tier 1 (+0%), Tier 2 (+5%), Tier 3 (+10%), Tier 4 (+18%), Tier 5 (+25% training XP velocity), helping wonderkids decide between playing time at a smaller club vs. accelerated stat growth at an elite training campus.
4. **Contract Compensation & Financial Terms:**
   * **Weekly Wage & Annual Salary:** Calculated via the canonical market wage formula scaled by Club Fame and prestige.
   * **Signing Bonus Math:**
     * Standard European transfers: $\text{AnnualSalary} \times 0.12$ (12%).
     * Free Agents: $\text{AnnualSalary} \times 0.35 + (\text{OVR} \times \text{€}25,000)$ (elevated signing bounty due to zero transfer fee).
     * Saudi Pro League mega bids: $\text{AnnualSalary} \times 0.20$ (20%).
     * Mercenary Perk: +20% bonus multiplier to all calculated bonuses.
   * **Contract Duration:** 1 to 5 years.
   * **Release Clause:** Formal buyout clause amount (or `None`).

---

#### 3. Interactive "Sit-Down" Contract Negotiation System (`contractNegotiationEvent.ts`)
When the player taps the **[ 🤝 Negotiate Terms ]** button, the app transitions into an interactive, atmospheric narrative sit-down negotiation scene:

```
┌────────────────────────────────────────────────────────┐
│ 🏛️ CONTRACT SUMMIT: THE NEGOTIATION TABLE             │
│                                                        │
│ 👔 Lead Negotiator: Karl-Heinz Rummenigge (CEO)        │
│ 🗣️ Your Representative: Mino Raiola (Agent - 92 Rating)│
│                                                        │
│ "We value your talent, Mateo. But our wage structure   │
│ is disciplined. What points are you looking to adjust?"│
├────────────────────────────────────────────────────────┤
│ 🎯 SELECT NEGOTIATION PRIORITIES (Pick up to 2 items): │
│                                                        │
│ [x] 💵 Base Salary (+15% to +35% weekly wage)          │
│ [ ] 💰 Signing-On Bonus (+30% to +60% upfront cash)    │
│ [x] 🔓 Release Clause (Insist on / Lower buyout fee)   │
│ [ ] ⚽ Goal / Assist Milestone Bonus                   │
│ [ ] 🛡️ Clean Sheet / Match Rating Performance Bonus    │
│ [ ] 🏆 UCL / Continental Trophy Bonus                  │
│ [ ] 🥇 Domestic League Championship Bonus              │
│ [ ] 🚀 Promotion / Relegation Avoidance Bonus          │
│                                                        │
│ [ 💼 INSTRUCT AGENT TO PUSH ]  [ 🗣️ NEGOTIATE DIRECTLY ]│
└────────────────────────────────────────────────────────┘
```

##### Negotiation Mechanics & Dynamics:
1. **Representation Context:**
   * **With an Agent:** If the player has signed representation (e.g. *Ex-Pro Parent*, *Helicopter Parent*, *Independent Agent*, *Syndicate Broker*), the agent leads the discussion. The agent's **Negotiation Rating (50–99)** dictates the success probability, counter-offer pushback, and prevents the bidding club from walking away abruptly.
   * **Without an Agent (Representing Yourself):** The player sits directly across from the club's Lead Figurehead (Sporting Director, President, or Manager). Negotiations carry higher volatility: aggressive demands risk offending the club lead, resulting in a **"Bids Withdrawn"** walkout if the player overplays their hand!
2. **Customizable Negotiation Clauses:**
   The player can select up to **2 specific contract clauses** to challenge and renegotiate:
   * **1. Base Salary:** Push for a $+15\%$ to $+35\%$ wage hike.
   * **2. Signing-On Bonus:** Demand a $+30\%$ to $+60\%$ cash injection upon signing.
   * **3. Release Clause Insertion / Adjustment:**
     * Insert a low release clause to guarantee an exit path to a European mega-club later.
     * Remove or elevate the release clause in exchange for higher guaranteed wages.
   * **4. Individual Milestone Bonuses:**
     * *Attacker / Midfielder:* Goal & Assist milestones (€15k to €75k per goal/assist threshold).
     * *Goalkeeper / Defender:* Clean Sheet & High Match Rating ($\ge 7.5$) bonuses.
   * **5. Competition Silverware Bonuses (Contextual to Club Objectives):**
     * *Elite Champions League Contenders:* Huge payout for hoisting the UEFA Champions League / Copa Libertadores.
     * *Title Contenders:* Domestic League Championship glory bonus.
     * *Tier 2 / Mid-Table Clubs:* UEFA Europa League / Conference League qualification bounty.
     * *Lower Pyramid / Promoted Clubs:* **Promotion Bonus** or **Relegation Survival Guarantee Bonus**.
3. **Resolution Engine:**
   * **Accepted with Smiles:** The bidding club concedes to your demands; updated contract terms reflect immediately.
   * **Compromise Counter-Offer:** The club meets you halfway (e.g. grants the goal bonus but caps the salary bump at +10%).
   * **Hard Stance & Take-It-Or-Leave-It:** The club holds the line on their original terms, warning that further demands will collapse the move.
   * **Walkout / Offer Dropped:** Only occurs if negotiating without an agent or pushing greedy demands at a lower-tier club with tight financial budgets.

---

## 9. INDIVIDUAL WORLD AWARDS & GALA CEREMONIES

The individual awards architecture accurately mirrors modern football's two distinct awarding cycles: **Continental Seasonal Awards (June & December)** and the **Annual World Gala (Late December / Ballon d'Or)**:

### A. The Two Distinct Awarding Calendars
1. **European Season Awards Gala (Early June — Post-UCL Final):**
   * **Scope:** Covers the August-to-May European domestic leagues and UEFA club competitions.
   * **Accolades Awarded:**
     * **European Golden Shoe:** Awarded to top league goalscorer in Europe weighted by UEFA league coefficient ($2.0\times$ for Top 5 leagues, $1.5\times$ for Tier 2 leagues, $1.0\times$ for others).
     * **Domestic League Player of the Season & Team of the Year (XI):** Best performer per domestic pyramid.
     * **UEFA Champions League Player of the Tournament:** Top-rated knockout star.
     * **European Best Young Player (U21):** Standout wonderkid in European competitions.

2. **South American Season Awards Gala (Mid-December — Post-Libertadores & League Climax):**
   * **Scope:** Covers the February-to-December South American seasons (Brasileirão, Apertura/Clausura, and Copa Libertadores).
   * **Accolades Awarded:**
     * **Rey de América (South American Footballer of the Year):** Best performer across Copa Libertadores and South American leagues.
     * **Brasileirão Série A Bola de Ouro & Team of the Season:** Premier Brazilian honors.
     * **Copa Libertadores MVP & Top Scorer:** Continental tournament kings.

3. **The Global Annual Gala (Late December — The Ballon d'Or & FIFA The Best):**
   * **Scope:** Strictly evaluates the **Full Calendar Year (January 1 – December 31)** combining both hemispheres ($H_1$ Spring Climax + $H_2$ Autumn Campaign) via the **Dual-Semester Rolling Snapshot Engine** (Section 19.F).
   * **Accolades Awarded:**
     * **The Ballon d'Or / World Footballer of the Year:** Supreme global honor (Top 5 ranking reveal, fullscreen golden envelope unveiling cinematic, permanent 810–1000 Career Heritage prestige).
     * **The Kopa Trophy (World Young Player of the Year, U21):** Best talent under 21 across all competitions worldwide.
     * **The Yashin Trophy (World Best Goalkeeper):** Highest clean-sheet percentage, save ratio, and big-match knockout rating.
     * **FIFA FIFPRO World 11:** The definitive global team of the calendar year (4-3-3 formation).

### B. The Ballon d'Or Calendar Year Scoring Algorithm ($H_1 + H_2$)
Because the European season concludes in June and South America concludes in December, the Ballon d'Or calculation seamlessly fuses both semesters:
$$\text{Ballon d'Or Index} = (0.35 \times \text{Rating}_{\text{Year}}) + (0.30 \times \text{Silverware}_{\text{Points}}) + (0.20 \times \text{G+A}_{\text{Index}}) + (0.15 \times \text{BigMatchClutch})$$

* **$\text{Rating}_{\text{Year}}$:** Minutes-weighted average match rating across Semester 1 ($H_1$, Jan–Jun) and Semester 2 ($H_2$, Jul–Dec) in all official club and national team matches.
* **$\text{Silverware}_{\text{Points}}$ (Calculated Directly from the Canonical Glory Points Matrix — Section 18.E):**
  Trophy merit is scaled directly from the game's universal Glory Points hierarchy ($\frac{\text{GloryPoints}}{10}$):
  * **FIFA World Cup:** $+500.0\text{ pts}$ (Unstoppable Ballon d'Or tilt)
  * **UEFA Champions League (UCL):** $+100.0\text{ pts}$ (Primary European benchmark)
  * **Eurocopa (UEFA Euro):** $+85.0\text{ pts}$
  * **Copa América:** $+65.0\text{ pts}$
  * **Africa Cup of Nations (AFCON):** $+45.0\text{ pts}$
  * **UEFA Europa League (UEL):** $+40.0\text{ pts}$
  * **Copa Libertadores:** $+35.0\text{ pts}$
  * **UEFA Nations League:** $+27.5\text{ pts}$
  * **Premier League (EPL):** $+25.0\text{ pts}$
  * **La Liga:** $+22.5\text{ pts}$
  * **CONCACAF Gold Cup / AFC Asian Cup:** $+20.0\text{ to } +30.0\text{ pts}$
  * **Serie A / Bundesliga / Ligue 1:** $+17.5\text{ to } +7.5\text{ pts}$
  * **UEFA Conference League:** $+6.0\text{ pts}$
  * **Brasileirão Série A / Eredivisie / Primeira Liga:** $+3.8\text{ to } +5.0\text{ pts}$
* **$\text{G+A}_{\text{Index}}$:** Combined calendar year Goals + Assists per 90 minutes (prestige-weighted across leagues).
* **$\text{BigMatchClutch}$:** Performance multiplier in Quarterfinals, Semifinals, and Finals of major international and continental tournaments.

---

### C. The Official Season Summary Screen & Academic Season Qualification Grade (F to S)

The **Season Qualification Note (Grade)** and **Season Summary Screen** represent the ultimate academic evaluation of your campaign's performance:

#### 1. The Sacred Chronological Climax Rule (Calendar Placement)
* **The Absolute Final Event of the Sporting Season:**
  * The Season Summary Screen is **strictly the LAST thing to appear in a season**.
  * It executes **AFTER** all domestic league rounds are completed, **AFTER** all domestic cup finals, **AFTER** all continental club tournament finals (UEFA Champions League, Europa League, Conference League, Copa Libertadores), and **AFTER** all summer international tournaments (FIFA World Cup, UEFA Eurocopa, CONMEBOL Copa América, CONCACAF Gold Cup, Olympic Football, and International Youth Cup).
  * **Never before.** Every single competitive ball in that sporting campaign must be kicked before the Season Summary calculates the final verdict, providing closure to the year before the pre-season rollover.

#### 2. The Traditional Academic Qualification Grade Ladder (F to S)
The player is awarded an official letter grade ranking their season performance from **F (Catastrophic)** to **S (Superb / Godlike)**:

| Season Grade | Designation & Standing | Season Performance Score ($\Sigma_{\text{season}}$) | Mechanical Criteria & Prerequisites |
| :---: | :--- | :---: | :--- |
| **S** | **Superb / Godlike** | **$\ge 90.0$** | Won a major trophy (Domestic League, UCL, or World Cup) OR reached finals while leading league in G+A; Average Match Rating $\ge 8.15$; 0 red cards. |
| **A** | **Outstanding** | **$80.0 - 89.9$** | Key talisman; team qualified for continental football or won domestic cup; Average Match Rating $7.60 - 8.14$; strong G+A return. |
| **B** | **Good / Solid** | **$70.0 - 79.9$** | Reliable regular starter; team fulfilled baseline expectations (top-half finish); Average Match Rating $7.10 - 7.59$. |
| **C** | **Average / Passing** | **$60.0 - 69.9$** | Standard squad contributor; mid-table finish; occasional bright spots balanced by dry spells; Average Match Rating $6.50 - 7.09$. |
| **D** | **Disappointing** | **$50.0 - 59.9$** | Underperformed expectations; lost starting spot or team battled relegation; Average Match Rating $6.00 - 6.49$. |
| **E** | **Critical Flop** | **$40.0 - 49.9$** | Disastrous campaign; manager benching; team relegated or failed all club objectives; Average Match Rating $5.50 - 5.99$. |
| **F** | **Catastrophic Disaster** | **$< 40.0$** | Campaign completely derailed by scandals, multiple red cards, catastrophic relegation, and transfer listing; Average Match Rating $< 5.50$. |

#### 3. Mathematical Season Scoring Formula ($\Sigma_{\text{season}}$)
$$\Sigma_{\text{season}} = (0.35 \times S_{\text{rating}}) + (0.30 \times S_{\text{objectives}}) + (0.20 \times S_{\text{production}}) + (0.15 \times S_{\text{discipline}})$$
* **$S_{\text{rating}}$ (Match Rating Index):** Scaled linearly: a $6.0$ average yields $50\text{ pts}$, a $7.0$ yields $70\text{ pts}$, an $8.0$ yields $90\text{ pts}$, and an $8.5+$ yields $100\text{ pts}$.
* **$S_{\text{objectives}}$ (Silverware & Club Targets):**
  * League Champions: $+100\text{ pts}$ | Continental Champions: $+100\text{ pts}$ | Cup Winners: $+75\text{ pts}$
  * Secured European/Continental spot: $+70\text{ pts}$ | Survived Relegation (if underdog): $+60\text{ pts}$
  * Relegated: $10\text{ pts}$ (severe penalty).
* **$S_{\text{production}}$ (Individual Milestone Output):** Goals, assists, clean sheets, and MOTM awards compared against positional benchmarks.
* **$S_{\text{discipline}}$ (Professional Conduct):** Starts at 100 pts; $-15\text{ pts}$ per yellow card, $-30\text{ pts}$ per straight red card, $-25\text{ pts}$ per public controversy/scandal.

#### 4. Season Grade to Champion Coins Reward Distribution & Currency Balance
The academic season grade directly determines the **Champion Coins (`🪙`)** payout deposited into the player's persistent meta-wallet upon the conclusion of every season:

| Season Grade | Performance Category | End-of-Season Champion Coins Reward | Career Cumulative Impact (15–18 Year Career) |
| :---: | :--- | :---: | :--- |
| **S** | **Superb / Godlike** | **+25 Champion Coins** | Generating $\approx 375\text{ to }450\text{ Coins}$ across an elite career. |
| **A** | **Outstanding** | **+20 Champion Coins** | Generating $\approx 300\text{ to }360\text{ Coins}$. |
| **B** | **Good / Solid** | **+15 Champion Coins** | Generating $\approx 225\text{ to }270\text{ Coins}$. |
| **C** | **Average / Passing** | **+10 Champion Coins** | Generating $\approx 150\text{ to }180\text{ Coins}$. |
| **D** | **Disappointing** | **+5 Champion Coins** | Generating $\approx 75\text{ to }90\text{ Coins}$. |
| **E** | **Critical Flop** | **+2 Champion Coins** | Generating $\approx 30\text{ to }36\text{ Coins}$. |
| **F** | **Catastrophic Disaster** | **+0 Champion Coins** | Zero reward (reprimanded season). |

* **The Career Macroeconomic Balance Equation:**
  * **Starting Slate:** New players begin with **0 Champion Coins** (all Starter Packs are 100% Free).
  * **Career Entry Cost:** Starting a standard Unique Career run costs **50 Champion Coins** (the first career run is free via the initial tutorial sponsorship).
  * **Economic Health Verification:**
    * A successful playthrough (averaging A and S grades) yields **300 to 450 Champion Coins**.
    * At retirement, this funds the entry fee for the player's **NEXT career run (50 Coins)** PLUS unlocks **25 to 40 premium Card Packs** (at 10 Coins per pack)!
    * An average playthrough (B and C grades) yields **150 to 250 Coins**, funding the next career run (50 Coins) plus 10 to 20 card packs.
    * This creates a perfectly calibrated roguelite progression loop where your performance directly fuels your next superstar's pedigree.

#### 5. The Fullscreen Season Summary Console Screen (`SeasonSummaryScreen.tsx`)
Rendered in glorious 32-bit console aesthetic:
* Prominent, glowing **Season Grade Stamp (`[ S ]`, `[ A ]`, etc.)** with particle bursts and sound chime.
* Complete season ledger: Matches Played, Minutes, Goals, Assists, Clean Sheets, MOTM Trophies, Avg Rating.
* Silverware Cabinet Delta: 3D trophy display of all domestic, continental, and international cups won that year.
* Manager's End-of-Season Appraisal: A personalized review quote from your manager based on your grade.
* Financial Campaign Overview: Total salary earned, bonuses, business profits, lifestyle spending, net worth change.
* Single action button: `[▶ Advance to Pre-Season]` transitions cleanly into the next year's pre-season training camp.

---

### D. The 6 Master Silverware, Statistics & Records Categories & Goalkeeper Yashin Engine

To provide absolute structure across all 37 nations, 6 confederations, and 20+ leagues, all Silverware, Trophies, Matchday Records, and Career Statistics are partitioned into **Six Canonical Categories**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │    THE 6 CANONICAL SILVERWARE & STATISTICAL TIERS      │
                       └────────────────────────────────────────────────────────┘
                                                    │
        ┌──────────────┬──────────────┬─────────────┴────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼                          ▼              ▼              ▼
  [INDIVIDUAL]      [WORLD]     [CONTINENTAL]                [NATIONAL]      [YOUTH]       [FRIENDLY]
  • Ballon d'Or     • World Cup • Champions Leagues (UCL/Lib)• League Titles • U20 World Cup• Summer Cups
  • The Best        • Club WC   • Euro / Copa América        • National Cups • U17 World Cup• Testimonials
  • Golden Boot     • Intercont.• Europa / Sudamericana      • Supercups     • Youth League • Int. Friendlies
  • Yashin (GK)     • Finaliss. • Conf. Cups (AFC/CAF/CONC)  • League Cups   • U23 Olympics • Tours
```

#### 1. Canonical Silverware Breakdown Across the 6 Categories:
1. **🏆 `individual` (Personal Accolades & Trophies):**
   * **The Ballon d'Or / World Footballer of the Year:** Supreme individual honor of the calendar year.
   * **The Best FIFA Men's Player:** Global coaches and captains federation vote.
   * **European Golden Shoe & Domestic Golden Boot:** Top goalscorer awards across leagues.
   * **World Best Playmaker (Assists Leader):** Continental and domestic assist crowns.
   * **The Yashin Trophy (World Best Goalkeeper):** Supreme global shot-stopping accolade.
   * **The Kopa Trophy (World Young Player of the Year, U21):** Standout global prodigy.
   * **The Puskás Award (Goal of the Year):** Most breathtaking acrobatic strike/solo run.
   * **Continental Tournament MVP:** Player of the tournament for UCL, Libertadores, Euro, Copa América.
   * **Domestic League Player of the Season & Best XI:** Domestic pyramid league MVP.

2. **🌍 `world` (Global Senior Championships):**
   * **FIFA World Cup:** The pinnacle of international football (every 4 years).
   * **FIFA Club World Cup (Quadrennial 32-Team Format):** Ultimate global club supremacy.
   * **Intercontinental Cup (Annual):** Champions League winners vs. Copa Libertadores winners.
   * **Finalissima:** UEFA Euro Champions vs. CONMEBOL Copa América Champions.

3. **🌐 `continental` (Confederation Club & Senior National Tournaments):**
   * **Club Competitions:** UEFA Champions League, UEFA Europa League, UEFA Conference League, CONMEBOL Copa Libertadores, Copa Sudamericana, AFC Champions League Elite, CAF Champions League, CONCACAF Champions Cup.
   * **National Team Championships:** UEFA European Championship (Eurocopa), CONMEBOL Copa América, CAF Africa Cup of Nations (AFCON), AFC Asian Cup, CONCACAF Gold Cup, OFC Nations Cup.

4. **🏛️ `national` (Domestic Pyramids, Cups & Supercups):**
   * **Top-Flight League Titles:** Premier League (England), La Liga (Spain), Serie A (Italy), Bundesliga (Germany), Ligue 1 (France), Brasileirão Série A (Brazil), Primera División (Argentina), etc.
   * **Lower Division Championships:** English Championship, League One, Segunda División, Serie B, etc.
   * **Domestic Major Cups:** The FA Cup, Copa del Rey, DFB-Pokal, Coppa Italia, Coupe de France, Copa do Brasil, Copa Argentina, etc.
   * **Domestic League Cups & Supercups:** EFL Carabao Cup, Supercopa de España, Supercoppa Italiana, DFL-Supercup, Community Shield, Supercopa do Brasil.

5. **🌱 `youth` (Age-Restricted Developmental Tournaments):**
   * **FIFA U-20 World Cup:** Global showpiece for elite under-20 national prospects.
   * **FIFA U-17 World Cup:** Global developmental festival for under-17 talents.
   * **UEFA Youth League:** Continental U-19 club championship mirroring the Champions League.
   * **U-20 South American Championship (*Sudamericano Sub-20*):** Grueling CONMEBOL youth proving ground.
   * **UEFA U-19 & U-17 European Championships:** Elite European age-group championships.
   * **Olympic Men's Football (U-23 + 3 Over-Age):** Quadrennial Olympic gold medal tournament.

6. **🤝 `friendly` (Exhibitions, Tours, Summer Cups & Testimonials):**
   * **Pre-Season Summer Invitational Cups:** Joan Gamper Trophy (Barcelona), International Champions Cup, Audi Cup (Munich), Emirates Cup (London), Trofeo Santiago Bernabéu (Madrid).
   * **The Farewell Testimonial Match:** Dedicated retirement showcase match honoring Icon Tier 5+ legends with 32 invited career comrades (Section 12.B).
   * **Senior & Youth International Friendlies:** 4-match autumn/spring non-competitive tours for non-European nations.

---

#### 2. The 6-Category Career Statistics Ledger (`careerCategoryStats.ts`)
Rather than flattening stats into a generic career total where summer friendly goals dilute official league records, DrawStar Remake 2.0 tracks stats in **isolated categorical buckets**:

```typescript
export type CompetitionCategory = 'individual' | 'world' | 'continental' | 'national' | 'youth' | 'friendly';

export interface CategoryStatsRecord {
  category: CompetitionCategory;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;        // For GKs & Defenders
  saves: number;              // For GKs
  shotsFaced: number;         // For GKs
  goalsConceded: number;      // For GKs
  penaltiesSaved: number;     // For GKs
  yellowCards: number;
  redCards: number;
  motmAwards: number;
  averageMatchRating: number;
  silverwareWon: string[];    // Array of trophy IDs
  individualHonors: string[]; // Array of award IDs
}
```

* **Interactive Career Ledger Filter:** The player's profile and trophy cabinet features a tactile console bumper tab (`L1/R1`):
  `[ALL TOTALS] | [🏆 INDIVIDUAL] | [🌍 WORLD] | [🌐 CONTINENTAL] | [🏛️ NATIONAL] | [🌱 YOUTH] | [🤝 FRIENDLY]`
* **Official Milestone Filtering:** 
  * "100 Career Goals" achievements and "Club All-Time Top Scorer" records strictly count **Official Competitive Matches** (`national`, `continental`, `world`), excluding `friendly` and `youth` goals.
  * Youth records (`youth`) remain preserved in an immutable "Youth Heritage Log" when graduating to the senior squad at age 16.

---

#### 3. Complete Goalkeeper Mechanics & The Yashin Trophy Engine

To make Goalkeepers feel authentic, powerful, and tactically distinct, DrawStar Remake 2.0 includes dedicated Goalkeeper stats, playstyles, and rating formulas:

* **Goalkeeper Specialist Attributes (7 Core Metrics):**
  *(Attribute Scale: `[40 → 99 → ⚡ Break]` denotes base scaling from 40 to 99, passing 99 exclusively through 100-point Stat Breaks)*:
  * **Saving (SAV) [40 → 99 → ⚡ Break]:** Shot-stopping ability on inside-the-box and diving strikes.
  * **Reflexes (REF) [40 → 99 → ⚡ Break]:** Reaction speed to quick strikes, deflections, and point-blank shots.
  * **Handling (HAN) [40 → 99 → ⚡ Break]:** Clean catches without spills or dangerous rebounds.
  * **Positioning (POS) [40 → 99 → ⚡ Break]:** Goal frame spatial alignment, cutting down shooting angles.
  * **Aerial Reach (AER) [40 → 99 → ⚡ Break]:** Wingspan & vertical reach on contested crosses and corners.
  * **One-on-One (1v1) [40 → 99 → ⚡ Break]:** Breakaway box duel success when charging down unassisted strikers.
  * **Distribution (DIS) [40 → 99 → ⚡ Break]:** Throwing & kicking counter accuracy triggering fast breaks.

* **Goalkeeper Match Rating Calculation:**
  $$\text{GK Rating} = 6.0 + (\text{Saves} \times 0.35) + (\text{Big Chance Saves} \times 0.50) + (\text{Clean Sheet} \times 1.20) + (\text{Penalty Saved} \times 1.50) - (\text{Goals Conceded} \times 0.55) - (\text{Spilled Rebound} \times 0.40) - (\text{Error to Goal} \times 1.50)$$

* **The Yashin Trophy Qualification & Scoring Formula:**
  Awarded annually at the Late December World Gala to the supreme goalkeeper worldwide:
  $$\text{Yashin Index} = (0.35 \times \text{CleanSheetPct}) + (0.30 \times \text{SavePct}) + (0.20 \times \text{SilverwarePts}) + (0.15 \times \text{BigMatchCleanSheets})$$
  * **$\text{CleanSheetPct}$:** $\frac{\text{Clean Sheets}}{\text{Matches Played}} \times 100$ in competitive club and international matches (min 30 matches).
  * **$\text{SavePct}$:** $\frac{\text{Saves}}{\text{Shots on Target Faced}} \times 100$. Elite threshold: $> 78.5\%$.
  * **$\text{SilverwarePts}$:** Trophies hoisted where the keeper started in the finals (UCL +40, World Cup +60, Domestic League +25).
  * **$\text{BigMatchCleanSheets}$:** Clean sheets kept in Quarterfinals, Semifinals, and Finals of `continental` and `world` competitions.

---

## 10. PENALTY SHOOTOUT QTE & CLUTCH MATCH MOMENTS

During Tier 2 ("SIM Match") and key finals:
* **The Penalty Shootout QTE:**
  1. *Horizontal Aim Indicator:* Oscillating bar across goal corners. Press `(X)` to set placement.
  2. *Power Bar:* Rising meter. Stop in green zone for pinpoint accuracy; overcharging risks blazing over the bar.
  3. *Goalkeeper Jump / Dive Physics:* Goalkeeper dives according to Reflexes vs. penalty strike accuracy.
* **Clutch Match Interventions:**
  * In the 85th+ minute of derbies and finals, critical moments pause the game:
    * 1v1 with goalkeeper: Choose *Finesse Curler*, *Power Blast*, or *Round the Keeper*.
    * Last-ditch defensive tackle: Choose *Standing Block* or *Slide Tackle* (risk of red card / penalty).

---

### B. Unique Career Match Engagement: Match Frequency & Difficulty Architecture (`careerMatchEngagement.ts`)

In **Unique Career Mode**, the player does NOT control an entire 11-player squad like a traditional arcade title; you play **exclusively as your own custom footballer** (Be-A-Pro / Locked Player Perspective). You dictate your runs, call for passes with `(A)`, execute skill moves in 1v1 duels, track back defensively, manage positional stamina, and time clutch shots/crosses.

To give players absolute agency over career pacing and challenge, Unique Career introduces two pivotal match configuration selectors:

#### 1. Match Frequency Selector (`matchFrequencyMode`)
Controls which fixtures are actively playable on the pitch versus rapidly simulated by the background text engine:

| Match Frequency Mode | Description | Which Matches are Playable? | Pacing & Career Duration |
| :--- | :--- | :--- | :--- |
| **`Slow`**<br>*(Play All Matches)* | Total immersion & full statistical control. 100% of all fixtures are played manually on the pitch. | • Every single League matchday (38 fixtures)<br>• All Domestic Cup rounds<br>• Continental group stages & knockouts<br>• National team friendlies, qualifiers & tournaments | ~15–25 hours per full career. Ideal for purists and hardcore roleplayers. |
| **`Standard`**<br>*(Play Important Matches)* | Balanced modern career rhythm. Only high-stakes matches and dramatic rivalries are played on pitch; routine routine fixtures are simulated. | • Fierce local derbies & El Clásico clashes<br>• Continental knockout fixtures (Round of 16 through Final)<br>• Top-4 table clashes and direct promotion clashes<br>• Relegation 6-pointer deciders<br>• Domestic Cup Semifinals & Finals<br>• Major international tournament matches (World Cup, Euros, Copa América) | ~4–8 hours per full career. Maximizes drama while skipping tedious routine games. |
| **`Finals Only`**<br>*(Silverware & Survival Only)* | Ultra-fast express pace. Routine league and group fixtures are simulated at lightning speed, automatically stopping *only* when silverware or existential survival is directly at stake. | • Cup Finals (Champions League, Copa Libertadores, FA Cup, etc.)<br>• Matchday 38 if the league title is undecided ($\le 3$ points gap)<br>• Relegation playoff second leg if facing the drop<br>• International tournament Quarterfinals, Semifinals & Finals | ~1–2 hours per full career. Perfect for quick trophy runs and meta-grinding. |

#### 2. Match Difficulty Selector (`matchDifficulty`)
Calibrates AI reaction speeds, tactical pressing intensity, goalkeeper physics, and window forgiveness:
* **Amateur:** Relaxed opponent pressing; generous pass/shot trajectory assistance; goalkeepers react 400ms slower; ideal for relaxed progression.
* **Semi-Pro:** Balanced standard difficulty; opponents maintain defensive lines; goalkeepers dive realistically.
* **Professional:** Active midfield pressing; aggressive double-teams when dribbling; goalkeepers anticipate near-post shots; opponents exploit defensive gaps on the break.
* **World Class:** High-intensity tactical pressing; punishing turnover punishment; goalkeepers possess elite reflexes requiring acute angles or finessed placement.
* **Legendary / Icon:** Unforgiving tactical AI; opponents read passing lanes instantly; ruthless counter-attacks; goalkeepers make miraculous saves unless beaten with supreme composure.

---

### C. Player & NPC Appearance Integration Engine (`appearanceCustomizationSystem.ts`)

A central pillar of Remake 2.0 is seamless visual continuity: **in-game 2D/3D match pitch models and cutscene models must accurately reflect card customizations, equipment items, and player aesthetics**, while consuming virtually zero device memory.

#### 1. Ultra-Lightweight Procedural Seed Architecture (Zero Texture Bloat)
* **The Problem:** Storing separate high-resolution 3D textures or sprite sheets for hundreds of players and equipment permutations would easily blow past mobile web memory limits (leading to browser crashes).
* **The Remake 2.0 Solution:** A **64-bit Procedural Appearance Descriptor (`CompactAppearanceSeed`)** combined with modular SVG/Canvas palettized rasterization:
  * **Skin Tone (4 bits):** 16 Fitzpatrick-calibrated skin shades.
  * **Hair Style & Color (8 bits):** 32 distinct hairstyles (Buzzcut, Afro, Samurai Bun, Dreads, Fade, Long Locks, etc.) $\times$ 8 tint palettes (Natural Black, Brown, Blonde, Red, Platinum Bleach, Golden Highlights, Electric Blue, Emerald).
  * **Facial Hair (4 bits):** Clean shaven, stubble, trimmed beard, mustache, full warrior beard.
  * **Body Physique (4 bits):** Mesomorph, ectomorph, athletic slim, powerhouse tank (matches physical height/weight metrics).
  * **Kit Customization (8 bits):** Short sleeves, long sleeves, thermal undershirt, tucked vs. untucked shirt, high socks vs. low socks with ankle tape, left/right wrist tape.
  * **Boots & Accessories (8 bits):** Neon speed boots, classic black leather, golden chrome studs, headband, protective face mask.
* **Memory Footprint:** Each player's complete visual appearance requires **only 8 bytes of storage** in memory!

#### 2. Procedural NPC Teammates & Opponents (No Generic Clones)
* Teammates and opposing club players are NOT generic duplicate clones. Each squad member possesses a deterministic `appearanceSeed` generated from their name, squad number, nationality, and position:
  * Scandinavian and Northern European players procedurally roll realistic demographic distributions (blond/light brown tones).
  * Latin American, African, and Asian players roll culturally authentic demographic distributions.
  * Star players and captains automatically roll distinguished boots and distinct hairstyles.
* When rendering on HTML5 2D Canvas or WebGL pitch viewports, the rendering engine combines base athletic meshes with modular SVG/tint overlays in a single draw-call batch, delivering buttery-smooth 60fps performance on low-end mobile phones!

---

## 11. SHADY PROPOSITIONS & BACKROOM SCANDALS

* Periodic backroom narrative events triggered in Free Agency or lower divisions:
  * Corrupt bookmakers offering €200,000 to deliberately pick up a yellow card or throw a match.
* **Outcomes:**
  * *Acceptance:* Immediate cash payout, but 35% chance of investigative journalist exposure resulting in a **12-month match ban** and instant **Bad Rep Tier III ("Psycho") lock**.
  * *Rejection & Report:* Awards +15 Club Integrity, +10 Manager Trust, and the *Clean Conscience* perk.

---

## 12. RETIREMENT, TESTIMONIAL MATCH, HALL OF FAME & THE CAREER EPITAPH ENGINE

### A. The Retirement Sequence Stages

When a player reaches age 35+ (or suffers an unrecoverable career-ending injury), the career conclusion flow triggers in three emotional stages:

1. **Retirement Announcement Stage:**
   * Media press conference confirming this is the player's final campaign.
   * Generates dynamic press headlines, standing ovations in visiting stadiums, and heartfelt tifo displays from supporters.

2. **The Farewell Testimonial Match & "Invite Players" Engine (`retirementTestimonialMatch.ts`):**
   * **Unlock Condition (Icon Tier 5+ Requirement):**
     * A formal testimonial match is a revered sporting honor reserved strictly for legends.
     * **Unlocks only from Tier 5 Icon Status ("Club Legend" or "National Hero", $\ge 500\text{ Icon Points}$) onward** on any club or national team you have represented.
     * *Players retiring below Tier 5* receive a dignified, quiet retirement and proceed directly to the Career Conclusion Report Card and Epitaph.
   * **The 5 Lifetime Teammate Relationship Tracking Ledgers:**
     Throughout your entire career, the simulation engine automatically tracks and tallies your deep connections with every teammate across 5 relationship categories:
     1. **Longest Comrades:** Teammates who have shared the pitch with you for the most combined matches and minutes.
     2. **Chief Beneficiaries:** Teammates whom you have personally assisted the most times across your career.
     3. **Top Playmakers:** Teammates who have assisted you for the most of your career goals.
     4. **Silverware Captains:** Team captains who hoisted trophies alongside you when your teams won domestic or international titles.
     5. **Original Youth Cohort:** The fellow academy graduates and teammates who shared the pitch with you during your very first season at your starting club/academy.
   * **The 32-Player Invitation Selection Roster:**
     * The engine aggregates the top performers from these 5 categories into an interactive **Candidate Legends Pool**.
     * The user opens the **"Invite Players" Screen** and hand-picks exactly **32 players** (16 vs 16: starting XI + 5 bench substitutes per side) to take part in the testimonial friendly.
   * **Team Style & Aesthetic Customizer:**
     * The player selects the thematic identity and visual design of both teams:
       * **Thematic Options:**
         * *National Pride:* Primary National Team Legends vs. World Star Allies.
         * *Club Dynasty:* All-Time XI of the club you played the most for vs. Continental Rivals.
         * *Boyhood Homecoming:* Boyhood Home Club XI vs. Career Superstars.
       * **Custom Kit Design:** The player chooses custom kit patterns, collar trims, and colorways for both sides using the built-in `KitRenderer`.
   * **The 3 Testimonial Match Tiers (Scaled to Lifetime Icon Points):**
     * | Testimonial Tier | Icon Points Requirement | Atmosphere & Venue | Cinematics & Presentation |
       | :--- | :---: | :--- | :--- |
       | **Tier 1: Local Hero Testimonial** | **500–699 Icon Points** (Tier 5 Icon) | Packed domestic home stadium (~35,000 capacity), local flags and flares. | Heartfelt local fan chants calling your name, pre-match bouquet presentation, club president handshake. |
       | **Tier 2: Continental Legend Testimonial** | **700–899 Icon Points** (Tier 6 Icon) | Sold-out major European/South American cathedral (~65,000 capacity), coordinated card stunts. | Pyro entrance show, national primetime television broadcast, star-studded pundit tributes, pitch-side ceremonial guard of honor. |
       | **Tier 3: Monumental Global GOAT Testimonial** | **900+ Icon Points** (Tier 7 Icon) | Iconic world arena (~85,000+ capacity), colossal 4-stand hand-painted tifos. | Global satellite broadcast, heads of state & sporting legends in attendance, emotional orchestral soundtrack, monumental pre-match video wall montage across the stadium screens. |
   * **Playable Friendly Match & Cinematic Emotional Flow:**
     * **Full 2D Playable Exhibition:** The player controls their own avatar on the pitch in a joyous, high-scoring celebration match.
     * **Ceremonial Kickoff:** The match kicks off with a ceremonial touch from the player's family or childhood mentor.
     * **Dynamic Fan Chanting:** Crowds chant unique procedural songs featuring the player's name and jersey number.
     * **The 80th-Minute Emotional Substitution:** In the 80th minute, play pauses as the referee blows the whistle for your final substitution:
       * Both teams stop and form a double-row **Tunnel Guard of Honor**.
       * Teammates lift you onto their shoulders as the stadium erupts into an emotional standing ovation.
       * A fullscreen 32-bit cinematic sequence renders your final lap of honor around the pitch, kissing the turf and hugging loved ones.

3. **Career Conclusion Report Card:**
   * Full statistical accounting: Total Matches, Goals, Assists, Yellow/Red Cards, Major Trophies, Individual Honors (Ballon d'Or, Golden Boots), Lifetime Earnings, and Hall of Fame Legend Tier score.

### B. The End-of-Career Epitaph & Retirement Newspaper (`careerEpitaphSystem.ts`)
Upon hanging up the boots, the engine generates an official **Front-Page 32-Bit Retirement Broadsheet** (dynamic pixel news print) summarizing your legacy for eternity. The headline is determined by the **Ranked Title Hierarchy**, an objective priority algorithm evaluating your lifetime Icon Points, silverware miracles, and individual honors:

#### 1. The 10 Ranked Epitaph Titles (Hierarchical Priority Order)
When generating the retirement newspaper, the engine evaluates criteria from Rank 1 downwards and assigns the single highest unlocked title as your primary career epitaph headline:

| Rank | Title | Unlocking Condition | Example Generated Headline |
| :---: | :--- | :--- | :--- |
| **Rank 1** | **"The Greatest Player in the History of [Club / Nation]"** | Attained **Tier 7 Icon Status** at any top-flight club or national team. | *"THE IMMORTAL GOD OF MADRID: [Player] Retires as the Greatest Player in the History of Madrid White"* / *"BEYOND PELÉ: [Player] Retires as the Greatest in Brazil's History"* |
| **Rank 2** | **"The Ballon d'Or from [Club / Nation]"** | Won 1+ Ballon d'Or / World Footballer of the Year awards during career. | *"THE GOLDEN MAESTRO: Arsenal's First Ballon d'Or Legend Calls Time on Storied Career"* / *"PRIDE OF COLOMBIA: The Ballon d'Or from Bogota Leaves the Pitch"* |
| **Rank 3** | **"The Miracle Worker of [Club]"** | Won a Tier 1 Domestic League or Continental Champions League with an underdog club (Historic Trophy Cabinet $\le 2$ titles, e.g. Burnley, Leicester, Napoli). | *"THE PROPHET OF TURF MOOR: The Miracle Worker Who Brought Burnley an Impossible Premier League Title Leaves the Game"* |
| **Rank 4** | **"The Continental Conqueror"** | Won 3+ Continental Champions League titles across career. | *"EMPEROR OF THE CONTINENT: 4-Time European Champion Hangs Up His Boots"* |
| **Rank 5** | **"The Immortal Club Legend of [Club]"** | Attained **Tier 5 or Tier 6 Icon Status** at an established top-flight club. | *"FOREVER NUMBER 10: Napoli's Immortal Icon [Player] Announces Retirement"* |
| **Rank 6** | **"The Eternal One-Club Icon"** | Spent 12+ consecutive seasons with a single club, never transferring, reaching Tier 5+ Icon status. | *"THE IL CAPITANO OF OUR HEARTS: One-Club Monument [Player] Retires Having Only Ever Worn One Shirt"* |
| **Rank 7** | **"The Nomadic Emperor"** | Won top-flight domestic league championships in 3 or more different countries. | *"CONQUEROR OF THREE REALMS: The Nomadic Champion Who Dominated Spain, England and Italy Retires"* |
| **Rank 8** | **"The Finals Maestro"** | Scored or assisted in 3+ major cup / continental finals. | *"MR. CLUTCH HANGS UP THE BOOTS: The Greatest Big-Game Performer of His Generation Retires"* |
| **Rank 9** | **"The Mercurial Outlaw"** | Won major silverware while maintaining Bad Reputation level $\ge 70$. | *"THE FLAWED GENIUS WALKS AWAY: Football's Most Controversial Superstar Retires with Silverware and Scars"* |
| **Rank 10** | **"The Respected Veteran"** | Completed 15+ professional seasons with Tier 2–3 contributor status. | *"A LIFETIME OF DEDICATION: Honest Professional [Player] Leaves the Pitch with Heads Held High"* |

---

### C. The Global Prestige Hierarchy for Career Epitaphs (Clubs vs. Nations vs. Awards)

When a player qualifies for multiple epitaph titles (for example, being Tier 7 for a national team AND Tier 7 for a club, or having won Ballon d'Ors alongside club icon honors), the engine resolves the conflict by calculating the **Global Heritage Prestige Value ($P_{\text{epitaph}}$)**. The title with the highest prestige score claims the front-page headline:

#### 1. The Global Entity Prestige Ladder
Based on historical trophies, fanbase size, cultural relevance, and international weight:

```
[Real Madrid / 10 Ballon d'Ors: 1000]
         │
[Brazil National Team: 980]
         │
[FC Barcelona / 5 Ballon d'Ors: 950]
         │
[Germany National Team: 940]
         │
[Argentina National Team: 930]
         │
[Bayern Munich: 910] ─── [3-4 Ballon d'Ors: 910-930]
         │
[Italy National Team: 900]
         │
[Liverpool FC: 880]
         │
[AC Milan: 870] ─── [2 Ballon d'Ors: 860]
         │
[Inter Milan / Juventus: 850]
         │
[Spain National Team: 845]
         │
[France National Team: 840]
         │
[Manchester United: 820]
         │
[★ 1 Ballon d'Or Winner: 810]
         │
[Boca Juniors: 800]
         │
[River Plate: 790]
         │
[Arsenal FC: 780]
         │
[Chelsea / Atlético Madrid / Dortmund: 740-760]
         │
[Tier B Clubs & Nations (Napoli, Roma, Ajax, Benfica, Colombia, Netherlands): 600-720]
         │
[Tier C Clubs & Nations (Burnley, Empoli, Poland, USA, Scotland): 450-590]
         │
[Tier D Emerging Nations & Grassroots Clubs (Zambia, Bolivia, Iceland): 250-440]
```

#### 2. The Ballon d'Or & Golden Boot Mathematical Weighting
Individual awards scale into the global prestige ladder according to the following mathematical rules:
* **1 Ballon d'Or:** Assigned a baseline prestige rating of **810** (sitting directly beneath Manchester United at 820, and above Boca Juniors at 800 and Arsenal at 780).
* **Multi-Ballon d'Or Progression:**
  * 2 Ballon d'Ors: **860 Prestige** (surpassing Inter Milan).
  * 3 Ballon d'Ors: **910 Prestige** (Bayern Munich tier).
  * 4 Ballon d'Ors: **930 Prestige** (Argentina tier).
  * **5 Ballon d'Ors:** **950 Prestige** (FC Barcelona / Lionel Messi tier).
  * **10 Ballon d'Ors:** **1000 Prestige** (Real Madrid apex tier).
* **The Golden Boot Rule:**
  * Each European / Continental **Golden Boot weights exactly half a Ballon d'Or (0.5 Ballon d'Or equivalent = +405 Effective Award Points)**.
  * 2 Golden Boots $\equiv$ 1 Ballon d'Or equivalent.
  * 4 Golden Boots $\equiv$ 2 Ballon d'Ors equivalent.

#### 3. Concrete Resolution Examples
1. **Zambia's Greatest Ever vs. Atlético Madrid's Greatest Ever:**
   * Player attains Tier 7 with Zambia National Team ($P = 320$).
   * Player also attains Tier 7 with Atlético Madrid ($P = 740$).
   * **Verdict:** Atlético Madrid wins ($740 > 320$). The broadsheet headlines: *"THE IMMORTAL ROJIBLANCO: [Player] Retires as the Greatest Player in Atlético Madrid History"*. (A sub-paragraph highlights their status as Zambia's national hero).
2. **Atlético Madrid's Greatest Ever vs. 1 Ballon d'Or Winner:**
   * Tier 7 at Atlético Madrid ($P = 740$).
   * Won 1 Ballon d'Or ($P = 810$).
   * **Verdict:** Ballon d'Or wins ($810 > 740$). The broadsheet headlines: *"THE GOLDEN MAESTRO: Atlético Madrid's Historic Ballon d'Or Winner Hangs Up His Boots"*.
3. **Real Madrid Tier 7 vs. 1 Ballon d'Or:**
   * Tier 7 at Real Madrid ($P = 1000$).
   * Won 1 Ballon d'Or ($P = 810$).
   * **Verdict:** Real Madrid Tier 7 wins ($1000 > 810$). The headline crowns them the immortal god of Real Madrid, with the Ballon d'Or mentioned prominently in the career summary.
4. **Liverpool Tier 7 vs. 5 Ballon d'Ors:**
   * Tier 7 at Liverpool ($P = 880$).
   * Won 5 Ballon d'Ors ($P = 950$).
   * **Verdict:** 5 Ballon d'Ors wins ($950 > 880$). The headline celebrates them as one of football's five-time golden immortals.

---

### D. Procedural Retirement Newspaper Structure
The broadsheet renders with:
* **The Master Headline:** The Rank 1–10 title banner.
* **Pixel Cover Illustration:** Retro 32-bit illustration of the player wearing their highest Icon club shirt, waving to a stadium in confetti.
* **Editorial Biography:** Procedural article reflecting on:
  * Debut city and grassroots origin (from the 37 starting cities).
  * The crowning club where highest Icon Tier was achieved.
  * Historical trophy contribution calculation (e.g., *"Responsible for 100% of Burnley's modern-era Premier League silverware"*).
  * International legacy and World Cup / continental campaign memories.
* **The Hall of Fame Ballot Box:** Inducted with first-ballot voting percentage (e.g., *"Inducted into the International Hall of Fame with 98.7% of votes cast"*).

---

## 13. THE 37 STARTING CITIES, ROTATING 32-BIT WORLD GLOBE & 10-TEAM YOUTH LEAGUES

### A. The Interactive 32-Bit Rotating World Globe Selector (`WorldGlobeCitySelector`)
Rather than a static flat list, the Starting City Selection is an authentic 32-bit retro arcade experience featuring a **fully interactive, rotating 3D pixel-art Earth globe**:

```
           ┌──────────────────────────────────────────────┐
           │      32-BIT ROTATING WORLD GLOBE CANVAS      │
           │                                              │
           │                  .---''''---.                │
           │               .-'  EUROPE    '-.  ◄ City Dot │
           │              /   ◆London       \             │
           │             | ◆Madrid   ◆Rome   | (Pulsing)  │
           │             |  AFRICA  ◆Cairo   |            │
           │              \   ◆Lagos        /             │
           │               '-.            .-'             │
           │                  '---....---'                │
           │   [◄/► Spin Globe]  [L1/R1 Next Nearest City]│
           │   [(X) Snap to Closest / Expand Dossier]     │
           └──────────────────────────────────────────────┘
```

#### 1. Rendering Architecture & Performance
* **Canvas Resolution & Pixelation:** Rendered on a native $320 \times 320$ HTML5 Canvas with `image-rendering: pixelated` and crisp orthogonal edges, keeping CPU/GPU consumption $< 2\%$ even on budget Android devices.
* **Orthographic 3D Projection:**
  * Continents are mapped using pre-computed low-resolution pixel bitmasks on a 3D sphere rotating around the Y-axis (longitude $\lambda$) with pitch tilt on the X-axis (latitude $\phi$).
  * Grid lines: Subtle glowing meridians and parallels in cyan/emerald at 20% opacity.
  * Real-Time City Coordinates: Each of the 37 starting cities is placed using real-world spherical coordinates $(\text{lat}, \text{lon})$:
    $$\begin{aligned}
    x &= R \cdot \cos(\text{lat}) \cdot \sin(\text{lon} + \text{rotationY}) \\
    y &= -R \cdot \sin(\text{lat}) \cdot \cos(\text{tiltX}) + R \cdot \cos(\text{lat}) \cdot \cos(\text{lon} + \text{rotationY}) \cdot \sin(\text{tiltX}) \\
    z &= R \cdot \cos(\text{lat}) \cdot \cos(\text{lon} + \text{rotationY}) \cdot \cos(\text{tiltX}) + R \cdot \sin(\text{lat}) \cdot \sin(\text{tiltX})
    \end{aligned}$$
* **Depth Culling & Depth Sorting:**
  * **Front Hemisphere ($z > 0$):** City dots are fully visible, glowing, and interactable with animated radar pulses.
  * **Back Hemisphere ($z \le 0$):** Cities located behind the curvature of the Earth are culled or drawn as faint 15% opacity silhouettes so the user knows where they are relative to the horizon.

#### 2. Multi-Platform Navigation & "Next Closest City" Snapping
* **Keyboard Navigation:**
  * `Left` / `Right` Arrow keys: Smoothly spin the globe horizontally.
  * `Up` / `Down` Arrow keys: Tilt the globe up/down (clamped between $-40^\circ$ and $+40^\circ$).
  * `Tab` / `Shift+Tab`: Calculate the **next geographically closest city** using the Great-Circle Haversine distance formula:
    $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lon}}{2}\right)}\right)$$
    The camera smoothly lerps and rotates the globe to face that neighbor directly!
  * `Enter` / `Space`: If no city is selected, snaps immediately to the **closest city to the camera's center crosshair** ($z \approx R$) and expands its dossier.
* **Console Gamepad Navigation:**
  * `Left Thumbstick` / `D-Pad Left/Right`: Rotates globe with analog velocity.
  * `L1 / R1 Bumpers`: Jump to the next nearest starting city across the globe.
  * `(X) Button`: Snap & expand the selected city's full briefing card.
  * `(O) Button`: Return from expanded dossier back to free globe rotation.
* **Touch & Mouse:**
  * Intuitive 360° inertia drag to spin the globe like a tactile physical desktop sphere.
  * Clicking/tapping any city dot immediately locks onto it, rotates it smoothly to the center, and opens the dossier.

#### 3. Expanding 32-Bit City Dossier View
When a city is selected (via direct click or keyboard/pad snap):
* The globe shifts smoothly to the left side of the screen and smoothly locks onto the coordinates.
* A high-contrast retro 32-bit dossier card expands on the right (or bottom drawer on mobile):
  1. **City Header:** City name, Country Flag pixel badge, Landmark hero art, and Cultural Mononym (e.g. *Paulista*, *Mancunian*, *Carioca*, *Porteño*).
  2. **Starting Attribute Bonus:** Permanent player trait boost (+Pace, +Dribbling, +Stamina, +Tactical IQ).
  3. **10-Team Youth League Preview:** Shows the authentic neighborhood clubs (e.g. *Triana Balompié*, *Villa Crespo Juniors*, *Gràcia Esportiu*).
  4. **Action Command:** `[X] Confirm & Enter Youth League Trials` or `[O] Back to World Globe`.

---

### B. The 37 Starting Cities Roster & Cultural Origins

| City | Country | Gentilic / Mononym | Origin Last Name | Primary Academy Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Madrid** | Spain | Madrileño | De Madrid | Elite Tier 1 |
| **Barcelona** | Spain | Català / Culé | De Barcelona | Elite Tier 1 |
| **Sevilla** | Spain | Sevillano / De Triana | De Sevilla | Tier 2 |
| **London** | England | Londoner | Londoner | Elite Tier 1 |
| **Manchester** | England | Mancunian | Of Manchester | Elite Tier 1 |
| **Liverpool** | England | Scouser | The Scouser | Elite Tier 1 |
| **Glasgow** | Scotland | Glaswegian / Weegie | Of Glasgow | Tier 2 |
| **Paris** | France | Parisien | Parisien | Elite Tier 1 |
| **Marseille** | France | Marseillais / Phocéen | Le Marseillais | Tier 2 |
| **Buenos Aires** | Argentina | Porteño | El Porteño | Elite Tier 1 |
| **Córdoba** | Argentina | Cordobés | El Cordobés | Tier 2 |
| **Rosario** | Argentina | Rosarino | El Rosarino | Elite Tier 1 |
| **São Paulo** | Brazil | Paulista | Paulista | Elite Tier 1 |
| **Rio de Janeiro** | Brazil | Carioca | Carioca | Elite Tier 1 |
| **Porto Alegre** | Brazil | Gaúcho | Gaúcho | Tier 2 |
| **Milan** | Italy | Meneghino / Milanese | Da Milano | Elite Tier 1 |
| **Roma** | Italy | Romano / Capitolino | Romano | Tier 2 |
| **Naples** | Italy | Partenopeo / Napoletano| Di Napoli | Elite Tier 1 |
| **Berlin** | Germany | Berliner | Berliner | Tier 2 |
| **Munich** | Germany | Münchner / Bavarian | Von München | Elite Tier 1 |
| **Dortmund** | Germany | Dortmunder / Borusse | Aus Dortmund | Tier 2 |
| **Amsterdam** | Netherlands | Amsterdamer / Mokum | Van Amsterdam | Elite Tier 1 |
| **Brussels** | Belgium | Brusseleir | De Bruxelles | Tier 2 |
| **Lisbon** | Portugal | Alfacinha / Lisboeta | De Lisboa | Elite Tier 1 |
| **Montevideo** | Uruguay | Charrúa / Montevideano | El Charrúa | Elite Tier 1 |
| **Medellín** | Colombia | Paisa | El Paisa | Tier 2 |
| **Zagreb** | Croatia | Zagrepčanin / Purger | Zagrebački | Tier 2 |
| **Riyadh** | Saudi Arabia | Najdi / Riyadhi | Al-Riyadhi | Tier 2 |
| **Cairo** | Egypt | Cairote / Qahiri | Al-Qahiri | Elite Tier 1 |
| **Casablanca** | Morocco | Casablancais / Bidawi | Al-Bidawi | Tier 2 |
| **Lagos** | Nigeria | Lagosian | Of Lagos | Tier 2 |
| **Istanbul** | Turkey | İstanbullu | İstanbullu | Tier 2 |
| **Tokyo** | Japan | Edokko / Tokyoite | Tokyojin | Tier 2 |
| **Ciudad de México**| Mexico | Chilango / Defeño | El Chilango | Elite Tier 1 |
| **Guadalajara** | Mexico | Tapatío | El Tapatío | Tier 2 |
| **Los Angeles** | USA | Angelino | Angelino | Tier 3 |
| **Melbourne** | Australia | Melburnian | Of Melbourne | Tier 3 |

---

### The 37 Respective 10-Team Youth Leagues (Neighborhoods + Traditions)

1. **Madrid (Liga Madrileña Juvenil):** Chamartín Atlético, Salamanca Club Deportivo, Retiro Deportivo, Chamberí Balompié, Malasaña Unión Deportiva, Moncloa FC, Vallecas Deportivo, Carabanchel Atlético, Usera Juventud, Villaverde Sport Club.
2. **Barcelona (Lliga Catalana Juvenil):** Gràcia Esportiu, Eixample Balompié, Sarrià Atlètic, Poblenou Recreatiu, Sants Club Deportiu, Raval Futbol Club, Barceloneta Marítim, Les Corts FC, Sant Andreu Unió, Horta Joventut.
3. **Sevilla (Liga Hispalense Juvenil):** Triana Balompié, Nervión Atlético, Macarena Deportivo, Los Remedios FC, Santa Cruz Recreativo, Heliópolis Sporting, San Bernardo Unión, Alfalfa Balompié, Bellavista Atlético, Polígono San Pablo Deportivo.
4. **London (London Youth Premier Division):** Westminster United, Kensington & Chelsea FC, Camden Athletic, Islington Rovers, Hackney City, Greenwich Albion, Southwark Wanderers, Lambeth Rangers, Hammersmith Town, Fulham District FC.
5. **Manchester (Greater Manchester Youth League):** Salford United, Trafford Athletic, Didsbury City, Ancoats Albion, Cheetham Rovers, Rusholme FC, Hulme Town, Chorlton Wanderers, Prestwich Sporting, Stockport District FC.
6. **Liverpool (Merseyside Youth Championship):** Anfield Sporting, Toxteth United, Everton District FC, Kirkdale Rovers, Wavertree Athletic, Walton Albion, Aigburth FC, Bootle Wanderers, Croxteth Rangers, Kensington Liverpool FC.
7. **Glasgow (Clydeside Youth League):** Govan Rangers Youth, Parkhead Celtic Boys, Partick Thistle Juveniles, Gorbals Albion, Hillhead Athletic, Shawlands United, Maryhill Rovers, Dennistoun City, Pollokshields FC, Clydebank Youth.
8. **Paris (Ligue Île-de-France Espoirs):** Montmartre Olympique, Saint-Germain Athletic, Marais Football Club, Belleville Étoile, Bastille Sportif, Latin Sporting Club, Vaugirard Racing, Batignolles Stade, Ménilmontant Union, Bercy Club de Football.
9. **Marseille (Ligue Phocéenne de Football):** Vieux-Port Olympique, La Canebière Sporting, Prado Football Club, Castellane Athletic, Panier Étoile, Roucas Blanc Stade, Saint-Charles FC, Bonneveine Racing, Noailles Union, Belle de Mai Club.
10. **Buenos Aires (Liga Bonaerense Juvenil):** Palermo Juniors, Belgrano Plate, Recoleta Estudiantes, Caballito Atlético, San Telmo Deportivo, Flores FC, La Boca Unión, Barracas Sportivo, Mataderos Juniors, Villa Lugano Deportivo.
11. **Córdoba (Liga Cordobesa Juvenil):** Nueva Córdoba Juniors, Alberdi Atlético, Alta Córdoba Instituto, Cerro de las Rosas FC, General Paz Juniors, San Vicente Deportivo, Güemes Unión, Argüello Athletic, Cofico Club, Villa Belgrano Plate.
12. **Rosario (Liga Rosarina de Canteranos):** Pichincha Juniors, Arroyito Canalla, Parque Independencia Leproso, Echesortu Central, Saladillo Atlético, Fisherton Athletic, Alberdi Newell's, Tiro Suizo Rosarino, Refinería FC, Tablada Deportivo.
13. **São Paulo (Liga Paulista Juvenil):** Moema Atlético Clube, Pinheiros Futebol Clube, Vila Mariana Esporte Clube, Tatuapé Atlético, Liberdade Futebol Clube, Santana União Esportiva, Lapa Associação Futebol, Ipiranga Esporte Clube, Guaianases Juventude, Capela do Socorro Atlético.
14. **Rio de Janeiro (Liga Carioca de Base):** Copacabana Esporte Clube, Ipanema Futebol Clube, Leblon Atlético, Tijuca Fluminense, Maracanã Botafogo, Lapa Associação, Flamengo da Praia, Botafogo da Estrela, Madureira Suburbano, São Cristóvão Vasco Juvenil.
15. **Porto Alegre (Liga Gaúcha de Canteras):** Moinhos de Vento FC, Bela Vista Grêmio, Menino Deus Internacional, Bom Fim Atlético, Petrópolis Esporte Clube, Partenon Sporting, Azenha Tricolor, Navegantes Colorado, Cristal União, Restinga Futebol Clube.
16. **Milan (Lega Giovanile Milanese):** Brera Calcio Giovanile, Navigli Football Club, San Siro Polisportiva, Isola Stella Rossa, Porta Romana Virtus, Città Studi Calcio, Ticinese Sporting, Lambrate Unione, Bicocca Athletic, Baggio San Paolo.
17. **Roma (Campionato Primavera Capitolino):** Trastevere Calcio, Testaccio Virtus, Monti Sporting Club, Prati Polisportiva, Parioli Football Club, Flaminio Roma, San Lorenzo Stella, Garbatella Unione, Ostiense Athletic, Campo de' Fiori FC.
18. **Naples (Lega Partenopea Primavera):** Vomero Partenope, Chiaia Stella Azzurra, Spaccanapoli Calcio, Posillipo Polisportiva, Fuorigrotta San Paolo, Mergellina Virtus, Rione Sanità Sporting, Soccavo Athletic, San Ferdinando FC, Bagnoli Unione.
19. **Berlin (Berliner Jugend-Stadtliga):** Mitte Borussia Jugend, Kreuzberg Eintracht, Prenzlauer Berg FC, Charlottenburg Sportfreunde, Schöneberg SpVgg, Friedrichshain Sportverein, Neukölln SV, Moabit Kickers, Pankow Union, Tempelhof Sportfreunde.
20. **Munich (Münchner Nachwuchs-Oberliga):** Schwabing Bayern Jugend, Maxvorstadt FC, Glockenbach 1860, Haidhausen Sportfreunde, Bogenhausen SpVgg, Sendling Eintracht, Nymphenburg SV, Lehel Borussia, Neuhausen Kickers, Giesing Löwen.
21. **Dortmund (Ruhrgebiet Nachwuchs-Liga):** Hörde Borussia Jugend, Kreuzviertel Sportfreunde, Hombruch FC, Dorstfeld Eintracht, Brackel SV, Marten SpVgg, Mengede Schwarz-Gelb, Wickede Sportverein, Scharnhorst Kickers, Lütgendortmund Union.
22. **Amsterdam (Amsterdamse Jeugd Competitie):** De Pijp Jongeren, Jordaan Sons FC, Oud-Zuid Sporting, Amsterdam-Noord Voetbal, Indische Buurt SV, Bos en Lommer United, Westerpark Combinatie, Oost Zeeburgia, Nieuw-West Athletic, Buitenveldert Boys.
23. **Brussels (Ligue Bruxelloise des Jeunes):** Ixelles Royale Union, Saint-Gilles Sporting, Schaerbeek White Star, Uccle Football Club, Molenbeek Jeunesse, Etterbeek Athletic, Woluwe Saint-Lambert FC, Forest Forestière, Anderlecht Cantera, Marolles Unité.
24. **Lisbon (Liga Juvenil de Lisboa):** Alfama Benfica Juvenil, Bairro Alto Sporting, Belém Belenenses, Chiado Futebol Clube, Alvalade Leões, Graça Estrela, Campolide Atlético, Mouraria Oriental, Campo de Ourique Desportivo, Parque das Nações FC.
25. **Montevideo (Torneo Juvenil Rioplatense):** Pocitos Wanderers, Carrasco Defensor, Punta Carretas Danubio, Cordón Bella Vista, Parque Rodó Progreso, Buceo Fénix, Ciudad Vieja Racing, Maroñas Athletic, Malvín Club, Sayago Deportivo.
26. **Medellín (Copa Paisa Sub-16):** El Poblado Envigado, Laureles Leones, Belén Itagüí, Castilla Fútbol Club, Robledo Atlético, Buenos Aires DIM, Aranjuez Cantera, Guayabal Real, Manrique Verde, San Javier Deportivo.
27. **Zagreb (Zagrebačka Kadetska Liga):** Maksimir Dinamo Kadeti, Trešnjevka Lokomotiva, Dubrava Zagreb, Jarun Sportski Klub, Kustošija Zmajevi, Rudeš Dečki, Črnomerec Plavi, Trnje Omladinac, Vrapče Athletic, Špansko Mladost.
28. **Riyadh (Riyadh Youth Federation Cup):** Al-Olaya Crescent Youth, Al-Malaz Knights Club, Al-Sulaimaniyah Tigers, Al-Nakheel Sporting, Al-Yasmin Stars, Al-Murabba United, Al-Diriyah Falcons, Al-Waha FC, Al-Shifa Athletic, Diplomatic Quarter Club.
29. **Cairo (Cairo Youth Championship):** Zamalek Royal Juveniles, Al-Ahly Red Devils Youth, Heliopolis Sporting, Maadi Olympic, Nasr City Athletic, Dokki Club, Giza Pyramids FC, Shubra United, Garden City Sporting, Mohandessin Stars.
30. **Casablanca (Ligue de Casablanca Espoirs):** Anfa Raja Juniors, Maârif Wydad Étoile, Ain Diab Club, Bourgogne Sporting, Derb Sultan Jeunesse, Roches Noires Olympic, Sidi Belyout Athletic, Californie Casablanca FC, Mers Sultan Union, Hay Hassani Football.
31. **Lagos (Lagos Grassroots Youth League):** Surulere Stationery Stores, Ikeja United Academy, Victoria Island Islanders, Yaba Tech Athletic, Lagos Island First Bank, Lekki Crown FC, Mainland Bridge Boys, Agege Bombers, Mushin Lions, Apapa Mariners.
32. **Istanbul (İstanbul Gençlik Ligi):** Beyoğlu Lions Gençlik, Kadıköy Canaries Gençlik, Beşiktaş Black Eagles Youth, Üsküdar Bosphorus FC, Şişli Sporting, Fatih Hilal Kulübü, Sarıyer Martıları, Bakırköy Gençlerbirliği, Maltepe Athletic, Eyüpsultan Spor.
33. **Tokyo (Tokyo Youth Metropolitan Cup):** Shibuya Verdy Youth, Shinjuku FC Tokyo, Setagaya Machida Boys, Roppongi Musashino, Ginza Tokyoites, Harajuku Tricksters, Akihabara Cyber FC, Ikebukuro Samurai, Asakusa Traditional, Ueno Park Sporting.
34. **Ciudad de México (Torneo Capitalino Juvenil):** Coyoacán Pumas Cantera, Polanco Águilas, Roma Norte Atlante, Condesa Tecos, Tlalpan Potros, Benito Juárez FC, Del Valle Deportivo, San Ángel Sporting, Iztapalapa Guerreros, Xochimilco Aztecas.
35. **Guadalajara (Liga Tapatía de Fuerzas Básicas):** Zapopan Chivas Cantera, Providencia Atlas Juvenil, Tlaquepaque Oro, Chapalita Tecos, Centro Histórico Charros, Oblatos Leones Negros, Country Club Deportivo, Minerva Atlético, Miravalle FC, Tonalá Guerreros.
36. **Los Angeles (Southern California Academy League):** Santa Monica Waves, Hollywood FC, Downtown LA Galaxy Academy, Venice Beach FC, Pasadena Crown, Westwood Bruins SC, Silver Lake Athletic, Long Beach Mariners, Glendale Kings, Koreatown United.
37. **Melbourne (Victorian Youth Premier League):** South Melbourne Hellas Youth, Brunswick Zebras, Carlton Blues FC, Fitzroy Lions, Richmond Tigers SC, St Kilda Saints, Footscray Knights, Preston Lions, Box Hill United, Heidelberg Alexander.

---

## 14. GLOBAL RETRO COUNTRY SOUNDTRACK ENGINE (5+ SONGS PER NATION WITH A LEAGUE)

Every nation featuring a domestic league or youth circuit possesses a **dedicated authentic retro soundtrack playlist (at least 5 unique songs per country)**. Songs are synthesized in real-time via the Web Audio API (0 KB audio asset downloads, 100% offline-ready) capturing iconic national musical styles, famous melodies, and matchday terrace traditions.

```
        ┌────────────────────────────────────────────────────────┐
        │     WEB AUDIO CHIPTUNE & FM SYNTHESIS ENGINE (0 KB)    │
        │                                                        │
        │   [Channel 1: FM Slap / Sub Bass]                      │
        │   [Channel 2: Polyphonic Analog Pad / String Bed]      │
        │   [Channel 3: Authentic Folk Lead (Saz/Oud/Bagpipe)]   │
        │   [Channel 4: 16-Bit Stadium Noise / Rhythm Drums]     │
        └────────────────────────────────────────────────────────┘
```

### Dynamic Matchday Playback Rule
* When you sign with a club or enter a matchday in a specific country, the sound engine automatically transitions to that nation's playlist.
* Cup finals trigger the country's dedicated **Dramatic Final Anthem** (`*-final`).

### The 25 National & Continental Soundtrack Playlists (160+ Retro Tracks)

#### 1. Netherlands 🇳🇱 (5 Tracks) — *Dutch Euro-Trance, Nederpop & Levenslied*
1. *Oranje Koorts (Orange Fever):* High-energy Euro-trance with euphoric arpeggios, pulsing 138 BPM kick, and melodic stadium hook inspired by Dutch festival anthems.
2. *De Pijp Draaiorgel:* Authentic 16-bit accordion & barrel-organ *Levenslied* street chiptune with warm walking bass and sentimental canal melody.
3. *Mokum Ska Beat:* Bouncy 1980s Nederpop ska groove featuring clean staccato guitar chops, walking slap bass, and quirky analog brass stabs.
4. *Rotterdam Hard-Kick:* 90s early gabber / happy hardcore crossover with rapid 160 BPM rolling bass, bright rave stabs, and electrifying matchday drive.
5. *Koning Voetbal (Dutch Final Anthem):* Soaring symphonic electro anthem with grand brass fanfares and terrace singalong crescendo for the KNVB Beker final.

#### 2. Belgium 🇧🇪 (5 Tracks) — *Belgian New Beat, EBM & Eurodance*
1. *Atomium New Beat:* Heavy, dark 1988 Belgian New Beat groove at 116 BPM with chunky distorted bass synth, industrial claps, and hypnotic lead hooks.
2. *Pump the Grand Place:* High-octane 90s Belgian Eurodance inspired by Technotronic with punchy 909 kick/snare, bright organ chords, and rapid hi-hats.
3. *Brussel Valse Electronique:* Melodic waltz-time accordion synth building into an emotional Stromae-style modern electro-pop matchday groove.
4. *Flanders Flandrien Rock:* Driving pub-rock rhythm with gritty overdriven electric guitar leads and rolling tom-tom fills for rainy derby afternoons.
5. *Coupe des Diables (Belgian Final Anthem):* Epic orchestral brass and electronic synth fusion designed for the Belgian Cup Final at King Baudouin Stadium.

#### 3. Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿 (5 Tracks) — *Celtic Folk-Rock, Tartan Chants & Bagpipe Synths*
1. *Hampden Roar:* Roaring Celtic stadium rock with driving 4/4 drums, distorted power chords, and a soaring simulated bagpipe/whistle lead melody.
2. *Five Hundred Miles Home:* Uptempo acoustic bounce with stomping quarter-note bass drum, clapping rhythm, and infectious terrace singalong refrain.
3. *Highland Mist:* Emotional Celtic ballad featuring delicate acoustic fingerpicking, resonant flute synth, and reflective bagpipe drone harmonics.
4. *Glasgow Saturday Night:* Punchy 80s Scottish post-punk / new-wave synth with chorus-drenched basslines and driving arena percussion.
5. *Clydeside Glory (Scottish Final Anthem):* Colossal orchestral rock march with massed snare rolls, twin bagpipe harmonies, and thundering timpani.

#### 4. Turkey 🇹🇷 (5 Tracks) — *Anatolian Rock, Microtonal Saz & Darbuka Grooves*
1. *Boğaziçi Fırtınası (Bosphorus Storm):* Psychedelic Anatolian rock with driving 7/8 rhythm, fuzz guitar riffs, and authentic microtonal bağlama synth lead.
2. *Şıkıdım Arena:* Joyful 1990s Turkish pop groove with rapid darbuka polyrhythms, bouncy synth bass, and infectious oriental string hooks.
3. *Gece Pazarı (Night Bazaar):* Atmospheric Mediterranean-Anatolian acoustic melody with fingerpicked oud synth, ney flute breath pads, and hand claps.
4. *Cehennem Stadı (Hell Stadium):* Blistering heavy metal and Ottoman mehter brass crossover capturing the fiery wall of noise in Istanbul derbies.
5. *Kupa Zaferi (Turkish Final Anthem):* Epic symphonic march combining traditional davul drums, zurna fanfares, and modern rock guitars for the Turkish Cup Final.

#### 5. Croatia 🇭🇷 (5 Tracks) — *Dalmatian Klapa, Tamburica & Maksimir Rock*
1. *Vatreni Ponos (Fiery Pride):* Heroic Croatian stadium rock with roaring electric guitar riffs, thunderous drums, and soaring patriotic anthemic lead.
2. *Jadransko More (Adriatic Sea):* Melodic Mediterranean tamburica folk with rapid tremolo plucked leads, warm accordion, and relaxing coastal acoustic rhythm.
3. *Zagreb 80s Val:* Croatian new-wave synth-pop inspired by Prljavo Kazalište with energetic rhythm guitar, warm Juno pads, and catchy hooks.
4. *Klapa Na Tribini:* Lush polyphonic vocal-choir synths emulating traditional Dalmatian a cappella singing with subtle orchestral strings.
5. *Kup Pobjednika (Croatian Final Anthem):* Dramatic symphonic rock crescendo with sweeping violins, brass fanfares, and explosive stadium fireworks effects.

#### 6. Colombia 🇨🇴 (5 Tracks) — *Cumbia, Vallenato Accordion & Salsa-Funk*
1. *Caña y Acordeón:* Energetic Colombian vallenato with fast diatonic accordion synth runs, guacharaca scraper rhythm, and driving caja vallenata bass.
2. *Barranquilla Carnival:* High-octane salsa-funk fusion in the style of Joe Arroyo with punchy brass horn stabs, syncopated cowbell, and blazing piano tumbao.
3. *Cumbia de la Montaña:* Traditional slow cumbia with hypnotic tambor alegre beat, maracón shakers, and evocative gaita flute melodies.
4. *Paisa Callejera:* Modern Medellín electro-cumbia with 808 sub-bass, tropical synth plucks, and energetic street-football rhythm.
5. *Noche de Campeones (Colombian Final Anthem):* Triumphant Latin big-band brass fanfare and stadium percussion for the Liga BetPlay championship.

#### 7. Mexico 🇲🇽 (5 Tracks) — *Mariachi Brass, Cumbia Sonidera & Latin Arena Rock*
1. *Trompetas de Jalisco:* Vibrant Mexican mariachi brass fanfare with twin trumpet harmonies, guitarrón acoustic bass, and lively vihuela strumming.
2. *Cumbia del Barrio Sonidero:* Deep echo-drenched cumbia sonidera with pitched-down vocal shouts, heavy synth bassline, and hypnotic güiro scrapes.
3. *Azteca Rockero:* Driving 90s Latin arena rock in the style of Maná with melodic guitar arpeggios, driving drums, and passionate chorus hooks.
4. *Huapango del Triunfo:* Rapid 6/8 huapango rhythm featuring virtuoso acoustic guitar rasgueados, celebratory violin runs, and festive stadium mood.
5. *Cielito Campeón (Mexican Final Anthem):* Monumental stadium rendition of Mexico's most beloved terrace melody with brass section and roaring fireworks.

#### 8. Uruguay 🇺🇾 (5 Tracks) — *Candombe Drums, Murga Choir & Garra Charrúa*
1. *Llamada del Candombe:* Powerful Afro-Uruguayan candombe rhythm with authentic Chico, Repique, and Piano drum polyrhythms and bouncy funk bass.
2. *Murga de Tablado:* Festive carnival murga with redoblante snare, platillos cymbals, bombos, and colorful theatrical choir synth harmonies.
3. *Garra Charrúa 1950:* Dramatic, determined Uruguayan battle rock with heavy distorted guitars and relentless kick drum for clutch 90th-minute comebacks.
4. *Rambla de Montevideo:* Mellow acoustic tango-candombe with nostalgic bandoneón synth touches and gentle ocean breeze ambiance.
5. *Centenario Dorado (Uruguayan Final Anthem):* Epic brass and candombe march celebrating the world's most historic football stadium and cup glory.

#### 9. Chile 🇨🇱 (5 Tracks) — *Andean Charango, Cueca Tempo & 80s Rock*
1. *La Voz de los Ochenta:* Punchy Chilean new-wave post-punk in the style of Los Prisioneros with driving bass, snappy drum machine, and sharp guitar riffs.
2. *Viento de los Andes:* Andean rock fusion featuring virtuoso charango plucks, soaring zampoña panpipe synths, and powerful rock drum kit.
3. *Cueca de la Victoria:* Festive 6/8 Chilean cueca with rhythmic hand clapping, acoustic guitar rasgueados, and bright accordion melodies.
4. *Estadio en Llamas:* High-energy stadium ska-punk with fast walking bassline, bright horn section, and rowdy terrace singalong feel.
5. *Copa de la Cordillera (Chilean Final Anthem):* Grand symphonic rock with soaring electric guitar solos and majestic Andean flute choir for the final.

#### 10. Japan 🇯🇵 (5 Tracks) — *80s City Pop, Shamisen FM Leads & J-Rock*
1. *Shibuya Midnight Drive:* Pristine 1980s Japanese City Pop with slap bass groove, sparkling FM electric piano chords, and breezy brass stabs.
2. *Streets of Neo Tokyo:* Hard-hitting FM synthwave in the legendary style of Yuzo Koshiro with aggressive bassline, synth brass, and 16th-note drums.
3. *Samurai Stadium Taiko:* Powerful traditional taiko drum ensemble combined with modern rock guitars and pentatonic shamisen FM lead.
4. *Shonen Anime Matchday:* Blistering high-tempo J-Rock anthem with twin lead guitars, double-bass drums, and uplifting heroic melodies.
5. *Emperor's Cup Glory (Japanese Final Anthem):* Ornate symphonic fanfare blending ancient gagaku-inspired flutes with colossal modern stadium orchestra.

#### 11. South Korea 🇰🇷 (5 Tracks) — *2002 Red Devils, Gayageum Folk & K-Pop Beats*
1. *Red Devils Roar:* The legendary 2002 World Cup stadium chant rhythm ("Dae-Han-Min-Guk! Claps") built into an electrifying electronic stadium dance anthem.
2. *Seoul Neon Night:* Sleek 90s K-Pop synth-dance with deep rolling bass, punchy vocal-chop synths, and ultra-catchy pentatonic hooks.
3. *Gayageum Cyber Beat:* Traditional Korean gayageum 12-string zither plucks over driving 128 BPM electronic breakbeats and sub-bass.
4. *Han River Sunrise:* Emotional, gentle Korean drama-style piano and flute ballad for post-match reflection and youth academy graduation.
5. *Taeguk Warrior (Korean Final Anthem):* Colossal orchestral fanfare with traditional buk drums, gong accents, and thundering rock crescendos.

#### 12. Egypt 🇪🇬 (5 Tracks) — *Electro-Shaabi, Baladi Accordion & Nile Sunset*
1. *Mahraganat Cairo Street:* Explosive Cairo electro-shaabi street beat with rapid auto-tuned synth melodies, distorted 808 kick, and energetic darbuka rolls.
2. *Habibi Stadium Pop:* Sunny 1990s Mediterranean Egyptian pop in the style of Amr Diab with nylon acoustic guitar, Spanish-Arabic strings, and dance groove.
3. *Baladi Groove:* Traditional baladi accordion with quarter-tone microtonal runs, hypnotic riq tambourine, and syncopated hand-claps.
4. *Nile River Sunset:* Reflective oriental oud synth solo over warm ambient strings and gentle percussion.
5. *Pharaohs' Triumph (Egyptian Final Anthem):* Grand cinematic orchestral march with thunderous mizmar horns and royal fanfares for the Egyptian Cup.

#### 13. Morocco 🇲🇦 (5 Tracks) — *Gnawa Guembri, Chaabi Percussion & Atlas Rai*
1. *Gnawa Spirit:* Hypnotic Moroccan Gnawa groove with deep resonant guembri lute bassline, metallic qraqeb castanets, and trance-like stadium chant.
2. *Casablanca Chaabi Frenzy:* Rapid Moroccan chaabi wedding rhythm with fiery violin runs, bendir frame drums, and relentless festive energy.
3. *Atlas Lions Rai-Synth:* Nostalgic Maghreb rai-pop featuring warm analog synth leads, reggae-infused guitar chops, and emotional melodic lines.
4. *Marrakech Medina:* Acoustic oud and darbuka duet evoking the ancient bustling souks before a big derby showdown.
5. *Throne Cup Fanfare (Moroccan Final Anthem):* Royal symphonic anthem with Moroccan brass fanfares and stadium fireworks for the Coupe du Trône.

#### 14. Nigeria 🇳🇬 (5 Tracks) — *Fela Afrobeat, Talking Drums & Highlife*
1. *Lagos Afrobeat Machine:* Authentic 70s Afrobeat in the style of Fela Kuti with interlocking funky rhythm guitars, punchy brass stabs, and hypnotic 12-minute groove.
2. *Afrobeats Hitmaker:* Modern Afrobeats / Afro-fusion groove with rolling log-drum bassline, lush marimba plucks, and smooth infectious dance tempo.
3. *Talking Drum Alert:* High-energy traditional Yoruba talking drum (dundun) conversation with shekere shakers and celebratory matchday horns.
4. *Palmwine Highlife:* Sweet, breezy West African highlife with dual clean electric guitars weaving intricate melodic counterpoints.
5. *Super Eagles Soar (Nigerian Final Anthem):* Triumphant brass section and massive stadium percussion celebrating championship coronation.

#### 15. Australia 🇦🇺 (5 Tracks) — *Aussie Pub Rock, Sydney 80s Funk & Didgeridoo Bass*
1. *Pub Rock Thunder:* Hard-driving Australian stadium rock with raw overdriven guitars, thumping 4/4 drums, and AC/DC-style unyielding energy.
2. *Down Under Groove:* 1980s Australian new-wave funk-pop with bouncy bassline, bright electric guitars, and cheerful melodic flute hooks.
3. *Outback Dreamtime:* Deep resonant didgeridoo sub-bass drone layered with ambient acoustic guitars and spacious stadium atmosphere.
4. *Bondi Beach Chillwave:* Upbeat coastal electronic synth-pop with sparkling bells, warm Rhodes chords, and sunny Australian summer matchday vibes.
5. *Grand Final Fanfare (Australian Final Anthem):* Colossal arena rock anthem with roaring guitars and stadium brass for the A-League Grand Final.

#### 16. United States 🇺🇸 (5 Tracks) — *West Coast G-Funk, Boom-Bap & Arena Rock*
1. *West Coast Whistle:* Iconic 90s California G-Funk with high-pitched sine-wave synth whistle, deep rolling Moog bassline, and laid-back boom-bap drums.
2. *East Coast Stadium Break:* Hard-hitting New York hip-hop boom-bap drum break with dusty jazz horn loops, upright bass, and gritty scratch accents.
3. *Fourth of July Arena Rock:* Colossal 80s American stadium rock anthem with soaring harmonized electric guitars and thundering gated-reverb drums.
4. *Broadway Matchday March:* Upbeat American marching band brass and drumline cadence capturing collegiate and derby excitement.
5. *MLS Cup Anthem (US Final Anthem):* Cinematic orchestral brass and electronic synth celebration for the MLS Cup championship stage.

#### Existing Nations (Fully Retained with 7–12 Tracks Each):
* **Germany 🇩🇪:** Industrial metal, Neue Deutsche Welle, 80s synth-pop, stadium hard rock, techno rave, Berliner finale (8 tracks).
* **Italy 🇮🇹:** Italia 90 pop-rock, classic songwriting, Bocelli crossover, Sunday pop, Italo-disco, Coppa Italia final (7 tracks).
* **France 🇫🇷:** French touch disco-house, 80s synth-pop, Paris chanson accordion, Marseille hip-hop, Stade de France final (8 tracks).
* **Spain 🇪🇸:** Flamenco rumba guitar, 80s Movida Madrileña rock, synth-pop, Copa del Rey final (12 tracks).
* **Brazil 🇧🇷:** Samba batucada, MPB acoustic, funk carioca, pagode, Maracanã final (9 tracks).
* **Argentina 🇦🇷:** Tango bandoneón rock, cumbia villera, murga porteña, Bombonera/Monumental rock, Copa Argentina final (7 tracks).
* **England 🏴󠁧󠁢󠁥󠁮󠁧󠁿:** Britpop 90s, Premier League electric rock, Two-Tone ska, terrace chants, Wembley FA Cup final (7 tracks).
* **Portugal 🇵🇹:** Fado guitarra portuguesa, Pimba accordion fiesta, Lisbon pop, Taça de Portugal final (7 tracks).
* **Saudi Arabia 🇸🇦:** Khaleeji oud and violin, modern Riyadh electro-pop, King Cup final (7 tracks).
* **Continental 🏆:** 11 European and South American orchestral epics for Champions League & Copa Libertadores.
* **World 🌍:** 12 international tournament anthems including World Cup ceremonies and farewell testimonials.

---

## 15. CANONICAL UNIQUE CAREER STORE (VERIFIED FROM `storeItems.ts`)

### Pricing Calibration
| Store Tier | Coin Cost | Cash Cost (€) | Visual Scheme & Border |
| :--- | :--- | :--- | :--- |
| **Tier 1** | 50 coins | €10,000 | Bronze (`border-amber-700`) |
| **Tier 2** | 150 coins | €50,000 | Silver (`border-slate-300`) |
| **Tier 3** | 400 coins | €250,000 | Gold (`border-yellow-400`) |
| **Tier 4** | 1,000 coins | €1,000,000 | Platinum (`border-cyan-300`) |
| **Tier 5** | 2,500 coins | €10,000,000 | Diamond (`border-blue-400`) |
| **Tier 6** | 5,000 coins | €100,000,000 | Shiny Purple (`border-purple-400`, glow) |

### Verified Item Pools
1. **Consumables (`consumables`):**
   * *Tier 1:* Ankle Taping (-15% injury chance for 6 months), Electrolyte Energy Gel (+2 Stamina, +2% Fitness), Joint Compression Wrap (-10% injury chance, +1 Recovery Point).
   * *Tier 2:* Hydrating Drink (+5 Stamina, +5% Fitness), Muscle Cryo-Freeze Spray (-25% injury chance for 6 months), Bio-Protein Shake (+5 Strength, +3% Fitness).
   * *Tier 3:* Recovery Supplement (+1 Recovery Point), Hyperbaric Oxygen Shot (+1 Recovery Point, +8% Fitness), Nootropic Focus Capsule (+5 Reactions, +5 Composure for 6 months).
   * *Tier 4:* Performance Taping, Regenerative Stem Peptide.
   * *Tier 5:* Nano-Recovery Infusion (+2 Recovery Points, +15% Fitness).
   * *Tier 6:* Divine Panacea (Full fitness restore, -80% injury risk for 1 season).
2. **Facilities & Upgrades (`upgrade`):**
   * *Tier 1:* Resistance Bands, Agility Ladder (+1 Pace/Stamina yield).
   * *Tier 2:* Personal Gym Equipment, Tactical Analysis Rig.
   * *Tier 3:* Cryotherapy Chamber, Hyperbaric Sleep Pod (+25% weekly recovery).
   * *Tier 4:* Biomechanical Motion Lab, Altitude Simulator.
   * *Tier 5:* Private Training Compound, Neuro-Tracker Suite.
   * *Tier 6:* Mythic Apex Performance Institute.
3. **Season Boosts (`season_boost`):**
   * *Tier 1:* Preseason Conditioning Camp (+10% season training yield).
   * *Tier 2:* Tactical Mastery Clinic.
   * *Tier 3:* Veteran Mentorship (+15% Composure & Chemistry gains).
   * *Tier 4:* Super-Agent Global PR Blitz.
   * *Tier 5:* Elite Gene-Expression Protocol (+25% physical attributes cap).
   * *Tier 6:* Golden Era Transcendence.
4. **Pro Equipment (`pro_equipment`):**
   * *Tier 1:* Lightweight Cleats, Carbon Fiber Shin Guards.
   * *Tier 2:* Speed Cleats, Grip Socks Pro.
   * *Tier 3:* Precision Striker Boots, Aerodynamic Match Jersey (+2 Finishing).
   * *Tier 4:* Elite Predator Boots, Biometric GPS Vest.
   * *Tier 5:* Custom Tailored Carbon Studs, Cyber-Mesh Undersuit.
   * *Tier 6:* Golden Cleats of Destiny, Mythic Chrono-Studs.
5. **Cosmetics (`special_hair`):**
   * Classic Retro Buzzcut, Headband Classic, Modern Fade, Samurai Bun, Frohawk, Golden Highlights, Dragon Neck Tattoo, Platinum Bleach, Full Sleeve Masterpiece, Crown of the Champion.

---

## 16. CANONICAL CARD STORE & COLLECTION (FROM `storeCollectionSystem.ts`)

* **Champion Coins (`🪙`) Meta-Progression Economy & Champion Points (`🏆`):**
  * **Starting Slate:** New player profiles start with **🪙 0 Champion Coins**. Currency must be earned through on-pitch performance.
  * **1-Time Starter Packs (100% FREE for New Players, 0 Coins):**
    * **Bronze Starter:** 50 cards $\rightarrow$ **0 Coins (Free)**.
    * **Silver Starter:** 25 cards $\rightarrow$ **0 Coins (Free)**.
    * **Gold Starter:** 15 cards $\rightarrow$ **0 Coins (Free)**.
    * **Double-Edged Starter:** 50 cards $\rightarrow$ **0 Coins (Free)**.
    * **EPIC Upgrade Starter Pack:** 25 cards (Guaranteed Legendary & Iconic Cards) $\rightarrow$ **0 Coins (Free)**.
    * *One-Time Rule:* Once opened, each starter pack is permanently marked **`[CLAIMED / OUT OF STOCK]`**.
  * **Career Entry & Progression Loop:**
    * Maiden career run is sponsored/free via the initial onboarding tutorial.
    * Subsequent Unique Career runs cost **50 Champion Coins** to initialize.
    * Every season completed awards **0 to 25 Champion Coins** directly scaled to your Academic Season Grade (Grade S: +25, A: +20, B: +15, C: +10, D: +5, E: +2, F: +0).
    * Over a 15–18 year career, a quality player earns **250 to 450 Champion Coins**, perfectly funding their next career run plus 20 to 40 premium card packs.
  * **The Apex Currency: "Champion Points" (`🏆`) & "Play as Legend" Mode:**
    * Distinct from seasonal Champion Coins, **Champion Points** are the supreme, most prestigious meta-currency in DrawStar, earned exclusively upon retiring a player in Unique Career based on lifetime Silverware Glory Points and accolades (Section 18.E.2).
    * Used to unlock immortal playable legends in the dedicated **"Play as Legend" Mode** (e.g. Pelé, Maradona, Zidane, Cruyff, Ronaldo R9, Ronaldinho) to relive and rewrite history, with additional mythic expansion unlocks slated for the future.
  * **Standard Packs (10 Coins / 5 Cards):** Parents, Youth, Career, Sponsor, Life, Agent, Street packs.
  * **High-End Collector Packs (Subsequent Purchases):** Additional Epic Upgrade Packs (50 coins, 25 cards), Legendary Upgrade Pack (100 coins, 15 cards), GOAT Master Pack (250 coins, 10 cards).
* **Card Special Mechanics:** Preserves *Muramasa Blade*, *Disaster Cards* (ash, rust, scrap, career threats), *Iconic Cards*, and *GOAT Tier* diamond rhombus patterns.
* **Duplicate Discard & Dust Conversion:** Handled strictly via the **Duplicate Dust Recycling Engine** (Section 28), converting repeated surplus cards into Dust for permanent meta-upgrades while preserving 1 copy of every unlocked card.

---

### B. The Dual Pack Opening Animation Engines (`PackOpeningEngine.tsx`)

DrawStar Remake 2.0 replaces generic card reveals with two bespoke, hardware-accelerated animation engines engineered to balance thrilling pack-opening dopamine with rapid, buttery-smooth mobile responsiveness:

#### 1. Engine 1: Big Pack Batch Cascade (6+ Cards, Supporting Up to 100 Cards Simultaneously)
* **Target Packs:** Starter packs (Bronze 50 cards, Silver 25 cards, Gold 15 cards, Double-Edged 50 cards), massive seasonal milestone drops, and bulk purchase bundles (up to 100 cards simultaneously).
* **Cinematic Staging:**
  * **Stage 1 (Vault Unseal):** The heavyweight pack container hovers in 3D perspective; ambient lightning/sparks coil around its seal before bursting outward in an explosive particle shockwave.
  * **Stage 2 (Waterfall Grid Fan-Out):** Cards erupt upward in an arc, fanning out smoothly into an interactive, scrollable 4-to-6 column card gallery. Performance is optimized with CSS `transform: translate3d` and GPU compositor layers, guaranteeing a solid 60fps even with 100 active cards on screen.
  * **Stage 3 (Suspense Highlighting):** High-tier cards (Epic, Legendary, Iconic, Muramasa, Disaster) remain shrouded face-down with pulsating colored electrical auras teasing their presence.
  * **Stage 4 (Interactive Reveal & 'Reveal All'):** Players can tap individual cards to trigger localized flip micro-animations, or tap the prominent `[⚡ Reveal All]` button to initiate a rhythmic, domino-style cascade reveal that flips each row sequentially with crisp audio feedback!

#### 2. Engine 2: Enhanced Solo & Epic Draw Animation (1 to 5 Cards & Special Packs)
* **Target Packs:** Standard 5-card booster packs (Parents, Youth, Street, Agent), high-end Epic/Legendary upgrade packs, and single card event rewards.
* **Cinematic Staging:**
  * **Tear / Unsheathe Action:** Interactive swipe gesture or tap that cleanly tears the holographic foil envelope with haptic feedback.
  * **Silhouette Anticipation:** The card back glows with escalating chromatic intensity corresponding to the highest rarity contained within the pack (e.g., deep gold for Legendary, cosmic violet for Iconic, ominous obsidian-red for Disaster).
  * **Dramatic Flip & Flare:** The card rotates along its Y-axis in perspective 3D, exploding into custom particle rays as the card face resolves with high-contrast sharpness.

---

### C. Enhanced Card Visual Design & Mobile-First Anatomy (`CardDisplay.tsx`)

Every card in Remake 2.0 features an ultra-clean, high-visibility layout designed for instant readability on both high-resolution desktop monitors and compact 360px mobile screens:

```
┌────────────────────────────────────────────────────────┐
│ [★ RARITY BADGE]                    [TYPE BADGE 🏷️]   │
│ (Top-Left)                                (Top-Right)  │
├────────────────────────────────────────────────────────┤
│                                                        │
│                 CENTRAL ARTWORK / ICON                 │
│               (High-Contrast Vector / SVG)             │
│                                                        │
├────────────────────────────────────────────────────────┤
│  CARD TITLE (Bold Serif/Sans, High Contrast)           │
│  ⭐ ⭐ ⭐ ⭐ ⭐ (Tier Stars & Level Indicator)         │
├────────────────────────────────────────────────────────┤
│  STAT MODIFIERS & EFFECTS LIST                         │
│  • +4 Pace, +3 Finishing, -2 Composure                 │
├────────────────────────────────────────────────────────┤
│  DESCRIPTION & FLAVOR LORE                             │
│  "A double-edged blessing forged in street cages..."   │
└────────────────────────────────────────────────────────┘
 [TIER-COLORED CHROMATIC BORDER & SUBTLE CORNER ACCENTS]
```

#### 1. Strict Visual Component Hierarchy
* **Tier-Colored Outer Border:** Precision 2px–3px border utilizing canonical tier color codes:
  * *Bronze:* Rustic aged copper `#CD7F32`
  * *Silver:* Polished platinum chrome `#C0C0C0`
  * *Gold:* Gleaming aurum gold `#FFD700`
  * *Platinum / Diamond:* Prismatic cyan frost `#00F0FF`
  * *Legendary:* Radiant solar gold with ember particles `#FFA500`
  * *Iconic / Epic:* Cosmic violet with nebula iridescence `#9933FF`
  * *Double-Edged:* Dual obsidian-crimson split border `#DC143C`
  * *Disaster:* Cursed abyssal black with jagged cracked fissures `#2F0000`
* **Top-Left Rarity Badge:** High-contrast pill-free badge displaying exact card tier (`COMMON`, `RARE`, `EPIC`, `LEGENDARY`, `ICONIC`, `DISASTER`).
* **Top-Right Type Badge:** Clean category indicator (`SKILL`, `PHYSICAL`, `TACTICAL`, `MENTALITY`, `DOUBLE-EDGED`, `DISASTER`, `CULTURAL`, `ICON`, `EQUIPMENT`, `CONSUMABLE`).
* **Central Focal Artwork:** Bold, recognizable emblem or cinematic icon rendered in crisp vector SVG with radial lighting backdrop.
* **Middle Section (Title & Stars):** High-legibility typography paired with 1–7 star indicators displaying current upgrade rank.
* **Lower Section (Stat Modifiers & Lore):** Explicit green (`+`) / red (`-`) stat numbers in bold tabular font, followed by italicized flavor text.
* **Mobile-First Readability:** Zero blurry micro-text; minimum font size is calibrated to 11px on mobile viewports with WCAG AAA contrast ratios.

---

### D. Bespoke Rarity Reveal VFX & Mythic Clash Sequences

To make opening cards an unforgettable emotional event, each elite card tier features custom audiovisual reveal VFX, capped by jaw-dropping **Clash Sequences** when opposing cosmic forces drop simultaneously:

#### 1. Tier-Specific Reveal VFX
* **👑 Legendary Reveal:**
  * Screen gently dims into letterbox cinema mode.
  * Beams of warm celestial golden light pierce through heavy volumetric fog.
  * A triumphant orchestral brass chime resonates as the card lands with heavy golden ember dust billowing across the screen.
* **🌌 Iconic / Epic Transcendence Reveal:**
  * Distinct from and superior to Legendary: a cosmic reality-shattering singularity effect.
  * The screen border develops a purple/magenta gravitational lens distortion.
  * A deep resonant sub-bass pulse shakes the screen as geometric crystalline shards shatter outward, revealing the Iconic card bathed in celestial ultraviolet starfire.
* **⚔️ Double-Edged Katana Slice:**
  * The pack envelope is suddenly bifurcated by a hyper-fast diagonal slash across the screen.
  * A metallic katana unsheathing sound (`*SCHWING!*`) echoes alongside a spray of glowing crimson and obsidian sparks.
* **👹 Muramasa Cursed Blade Reveal:**
  * An elevated, deeply supernatural variant of the katana slice:
  * The screen flashes into inverted monochromatic negative lighting.
  * A demonic blood-red spectral slash tears through the canvas, leaving glowing purple-black cursed flames and drifting spirit embers.
  * An eerie, resonant temple bell rings out as cursed kanji mist dissipates around the card's dark chrome borders.
* **🌋 Disaster Card Apocalyptic Omen:**
  * A chilling psychological reveal designed to invoke genuine dread.
  * The screen flickers with electrical static and violent seismic camera shake.
  * The sky background turns pitch black with jagged blood-red lightning fissures cracking across the screen glass.
  * A booming bass thunderclap sounds as jagged volcanic magma cracks glow on the card's face.

#### 2. Special Mythic Clash Sequences (Simultaneous Drops)
When conflicting cosmic forces appear together within a single pack opening, the engine overrides standard reveals with an exclusive **Clash Cinematic**:

* **⚔️ Clash 1: Disaster vs. Iconic (The Abyssal War):**
  * When a Disaster Card and an Iconic Card are pulled in the same pack, the screen violently splits down the center!
  * Left side: Abyssal volcanic storm and dark lightning vortex.
  * Right side: Celestial violet nebula and blinding prismatic starfire.
  * The two gravitational waves collide at center screen with a deafening sonic boom, unleashing a shockwave that leaves both cards floating side-by-side amidst drifting cosmic/volcanic embers.
* **🗡️ Clash 2: Disaster vs. Muramasa Blade (The Cursed Cleave):**
  * When a Disaster Card and the Muramasa Cursed Blade drop together:
  * The Disaster's apocalyptic storm clouds gather and begin suffocating the screen in pitch darkness.
  * Suddenly, a blinding flash of cursed crimson steel pierces the center of the storm!
  * The Muramasa Blade executes an ultra-rapid cinematic cross-slash that literally **cleaves the disaster storm in half**, shattering the darkness into millions of red crystalline fragments!
  * The Muramasa Blade and Disaster card stand revealed back-to-back, locked in eternal supernatural tension.

---

### E. Canonical Card Tier Taxonomy by Category & Exact Chromatic Styling Guide

Every card in DrawStar Remake 2.0 belongs to one of three core systemic categories: **Positive**, **Negative**, or **Double-Edged**. To provide crystal-clear visual clarity for UI engineers, 3D shader developers, and 2D card artists, each tier features an unmistakable, standardized color format, lighting model, and particle signature matching DrawStar's canonical tier taxonomy:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CANONICAL CARD CATEGORY CHROMATIC MATRIX                                  │
├───────────────────┬──────────────────────────┬─────────────────────────────┬───────────────────────────┤
│ CATEGORY          │ TIER RANK & NAME         │ PRIMARY / SECONDARY HEX     │ BORDER & AURA EFFECT      │
├───────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ POSITIVE          │ Tier 1: Bronze           │ #CD7F32 / #8B4513           │ Aged Copper / Amber Glow  │
│                   │ Tier 2: Silver           │ #C0C0C0 / #E8E8E8           │ Platinum Mirror Chrome    │
│                   │ Tier 3: Gold             │ #FFD700 / #D4AF37           │ 24k Aurum Sunburst        │
│                   │ Tier 4: Legendary        │ #FFA500 / #FF4500           │ Solar Coronal Ember Flame │
│                   │ Tier 5: Iconic (GOAT)    │ #9933FF / #E024C3           │ Cosmic Nebula Singularity │
├───────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ NEGATIVE          │ Tier 1: Scrap            │ #64748B / #94A3B8           │ Dark Stonelike / Silver   │
│                   │ Tier 2: Rust             │ #78350F / #B45309           │ Corroded Iron / Rust Ocre │
│                   │ Tier 3: Ash              │ #000000 / #DC2626           │ Burnt Black / Fire Red Rim│
│                   │ Tier 4: Disaster         │ #450A0A / #22C55E           │ Deep Crimson Flame / Toxic│
├───────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ DOUBLE-EDGED      │ Tier 1: Stone / Obsidian │ #1C1917 / #A855F7           │ Dark Volcanic Glass/Purple│
│                   │ Tier 2: Copper Dagger    │ #C2410C / #EA580C           │ Warm Polished Copper Rim  │
│                   │ Tier 3: Steel Blade/Sword│ #E2E8F0 / #FFFFFF           │ Mirror Polished Steel/Pure│
│                   │ Tier 4: Muramasa Blade   │ #3B0764 / #22C55E / #990000 │ Purple Metal / Toxic Blade│
└───────────────────┴──────────────────────────┴─────────────────────────────┴───────────────────────────┘
```

#### 1. Category 1: Positive Cards (Pure Buffs, Talents & Professional Growth)
* **Tier 1: Bronze (Base Foundation):**
  * *Palette:* Primary Rustic Copper `#CD7F32`, Secondary Oxidized Brown `#8B4513`, Ambient Glow `#D27D2D` (`rgba(205, 127, 50, 0.35)`).
  * *Texture & Finish:* Matte brushed bronze alloy with subtle industrial rivets at four corners.
  * *Border Styling:* 2px solid copper rim, warm satin edge highlights, zero bloom flares.
  * *Particles:* Sparse drifting bronze flecks upon card inspection.
* **Tier 2: Silver (Developed Quality):**
  * *Palette:* Primary Polished Sterling Silver `#C0C0C0`, Chrome Highlight `#FFFFFF`, Moonlight Blue Sheen `#A0C4E2`.
  * *Texture & Finish:* Vertical brushed aerospace aluminum with a vertical metallic specular light sweep.
  * *Border Styling:* 2.5px beveled silver frame with polished chamfered bevels.
  * *Particles:* Soft silver shimmer sparkles along top and bottom edges.
* **Tier 3: Gold (Elite Distinction):**
  * *Palette:* Primary Gleaming 24k Aurum Gold `#FFD700`, Deep Bullion `#D4AF37`, Radiant Glow `#FFE066`.
  * *Texture & Finish:* Micro-etched gold leaf filigree with metallic sunburst reflections radiating from card center.
  * *Border Styling:* 3px dual-lined golden trim with laurel leaf embossing on upper corners.
  * *Particles:* Steady upward-drifting golden dust motes with soft lens flare on title badge.
* **Tier 4: Legendary (World-Class / Solar Transcendence):**
  * *Palette:* Molten Solar Amber `#FFA500`, Radiant Corona Crimson-Orange `#FF4500`, Sacred Gold Leaf `#FFD700`.
  * *Texture & Finish:* Liquid sun gold core surrounded by swirling solar prominence flares and ornate baroque gold scrolling.
  * *Border Styling:* 4px radiant solar frame with pulsating inner coronary glow (`box-shadow: 0 0 25px rgba(255, 165, 0, 0.6)`).
  * *Particles:* Active rising molten ember sparks, pulsing heat haze distortion layer, and orchestral golden chimes on inspection.
* **Tier 5: Iconic (GOAT / Mythic Masterpiece):**
  * *Palette:* Cosmic Ultraviolet Void `#9933FF`, Interstellar Magenta `#E024C3`, Celestial Neon Starfire `#D946EF`, Supernova White `#FFFFFF`.
  * *Texture & Finish:* Deep space nebula iridescence layered over an animated diamond rhombus constellation grid.
  * *Border Styling:* 4.5px cosmic singularity rim with a perpetual slow-cycling gravitational lens chromatic aberration.
  * *Particles:* Swirling celestial vortex motes, miniature orbiting star clusters, and deep sub-bass cosmic hum on hover.

#### 2. Category 2: Negative Cards (Official 4 Tiers: Scrap, Rust, Ash, Disaster)
* **Tier 1: Scrap (🗑️ Scrap):**
  * *Palette:* Dark Stonelike Charcoal `#1E293B`, Raw Lead `#475569`, Scuffed Silver Sheen `#94A3B8`.
  * *Texture & Finish:* Dark stone-like base material with silver industrial scuffs, rough damaged texture, and chipped masonry edges.
  * *Border Styling:* 2px distressed slate-silver border with rough, weathered bevels.
  * *Particles:* Faint falling dust particles and metal filings crumbling from the edges.
* **Tier 2: Rust (⚙️ Rust):**
  * *Palette:* Corroded Cast Iron Grey `#57534E`, Oxidized Rust Ochre `#78350F`, Burnt Amber `#B45309`.
  * *Texture & Finish:* Heavy flaking rust patches on cold iron; granular corroded texture with pitted ferric oxidation.
  * *Border Styling:* 3px heavily rusted iron border with flaking oxide layers and irregular jagged edging.
  * *Particles:* Flaking orange-brown rust powder motes drifting downward.
* **Tier 3: Ash (🔥 Ash):**
  * *Palette:* Burnt Pitch Black `#0A0A0A`, Charred Charcoal `#171717`, Smoldering Fire Red `#DC2626`, Fiery Orange Glow `#F97316`.
  * *Texture & Finish:* Pitch-black incinerated ash body with glowing volcanic ember fissures breathing beneath charred crust.
  * *Border Styling:* 2px intense fire-red border (`#DC2626`) with an active smoldering heat line and charred black bevels.
  * *Particles:* Rising red-orange spark embers and faint black soot smoke curling upward.
* **Tier 4: Disaster (☠️ Disaster — The Apocalyptic Threat):**
  * *Palette:* Deep Hellfire Crimson `#450A0A`, Blood Red `#991B1B`, Toxic Radioactivity Green Border `#22C55E` / `#4ADE80`.
  * *Texture & Finish:* Pulsing deep crimson magma flame core contained within a sinister, hazardous toxic green containment rim—an unmistakable signature warning of catastrophe.
  * *Border Styling:* 2.5px radiant bright toxic-green neon border (`#22C55E`) pulsating against a deep apocalyptic crimson-to-black gradient canvas.
  * *Particles & Audio:* Menacing toxic green lightning arcs flashing across a boiling crimson smoke cloud, accompanied by a low-frequency tectonic earthquake rumble.

#### 3. Category 3: Double-Edged Cards (Official 4 Tiers: Stone Knife/Obsidian Knife, Copper Dagger, Steel Blade/Sword, Muramasa Blade)
Every Double-Edged card utilizes a weaponized blade motif representing high risk and high reward:

* **Tier 1: Stone Knife / Obsidian Knife (🗡️ Stone Knife / Obsidian Knife):**
  * *Palette:* Volcanic Obsidian Black `#0C0A09`, Smoked Glass `#1C1917`, Sharp Amethyst Purple Trim `#A855F7` / `#9333EA`.
  * *Texture & Finish:* Glossy chipped obsidian volcanic glass with razor-sharp conchoidal fracture lines and a dark violet gleam.
  * *Border Styling:* 2px deep purple-tinted obsidian rim with sharp pointed corner notches.
  * *Blade Motif:* Chipped prehistoric stone knife / knapped obsidian blade silhouette.
  * *Particles:* Faint violet edge glints when rotated.
* **Tier 2: Copper Dagger (🥉🗡️ Copper Dagger):**
  * *Palette:* Warm Hammered Copper `#9A3412`, Radiant Bronze-Orange `#C2410C`, Polished Copper Highlight `#EA580C`.
  * *Texture & Finish:* Distinct hand-forged antique copper plate with warm metallic reflection and hammered forge dimples.
  * *Border Styling:* 2.5px bright polished copper frame with warm metallic luster and dual-line bevels.
  * *Blade Motif:* Curved Mediterranean bronze/copper stabbing dagger.
  * *Particles:* Warm copper sparks upon draw or inspection.
* **Tier 3: Steel Blade / Steel Sword (⚔️ Steel Blade / Steel Sword):**
  * *Palette:* Pure High-Carbon Blade Steel `#E2E8F0`, Mirror White Highlight `#FFFFFF`, Cold Gunmetal `#475569`.
  * *Texture & Finish:* Mirror-polished Damascus steel blade surface with longitudinal grind lines and a brilliant specular light sweep.
  * *Border Styling:* 2.5px pure gleaming white-and-silver steel border with pristine edge bevels and intense specular glint.
  * *Blade Motif:* Double-edged knight broadsword / arming sword silhouette.
  * *Particles:* Sharp bright white laser glints and metallic edge gleam audio (*ching!*).
* **Tier 4: Muramasa Blade (👹🗡️ Muramasa Blade — Cursed Mythic Katana):**
  * *Palette:* Demonic Void Black `#050505`, Deep Cursed Purple Metallic `#3B0764` / `#581C87`, Blood Crimson Splatter `#990000`, Toxic Neon Green Containment Border `#22C55E` / `#4ADE80`.
  * *Texture & Finish:* Legendary Japanese *Tamahagane* folded steel with a flowing wavy temper line (*Hamon*), blood-groove (*Bo-Hi*), deep purple-metallic sheen, and an unmistakable bright green supernatural containment border.
  * *Border Styling:* 2.5px intense glowing emerald/toxic green border (`#22C55E`) encasing the dark purple and blood-red steel, creating the legendary cursed juxtaposition.
  * *Blade Motif:* Curved masterwork katana blade with ornate brass sword-guard (*Tsuba*) and demon-crest hilt.
  * *Particles & Audio:* Swirling violet demon mist, flickering green lightning, and the iconic metallic katana draw sound effect (*SCHWING!*) followed by a haunting temple bell chime.

---

### F. Distinctive Type Identity & Material Architecture (The 8 Archetypal Card Types)

Beyond tier coloring, **every card type possesses a unique physical material, tactile texture, background watermark, corner ornamentation, and audiovisual signature**. This guarantees that a player can instantly recognize a card's origin and archetype at a single glance, even before reading the title:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ARCHETYPAL CARD TYPE MATERIAL & HALLMARK MATRIX                          │
├─────────────┬───────────────────────────────┬────────────────────────────────┬─────────────────────────┤
│ CARD TYPE   │ CORE PHYSICAL MATERIAL        │ DISTINCTIVE HALLMARK / EMBLEM  │ CORNER & TRIM DETAIL    │
├─────────────┼───────────────────────────────┼────────────────────────────────┼─────────────────────────┤
│ 1. PARENT   │ Sepia Textured Photo Cardstock│ Vintage Polaroid Frame & Tree  │ Antique Brass Corners   │
│ 2. STREET   │ Distressed Asphalt Concrete   │ Spray Stencil Graffiti Tagging │ Reinforced Duct-Tape    │
│ 3. YOUTH    │ 5mm Blueprint Drafting Grid   │ Academy Wax/Ink Stamp & Radar  │ Millimeter Ruler Gauge  │
│ 4. CAREER   │ Breathable Athletic Match Mesh│ Gold Embroidered Stars & Laurel│ Metallic Trophy Ribbon  │
│ 5. LIFESTYLE│ Ultra-Gloss Mirror UV Varnish │ Diamond-Quilted Leather & VIP  │ Art Deco Geometric Gold │
│ 6. SPONSOR  │ High-Tech Woven Carbon Fiber  │ Vertical Hologram Barcode Seal │ Microprinted Contracts  │
│ 7. AGENT    │ Pebbled Italian Calfskin      │ Red Wax Notary Seal & Cursive  │ Brass Briefcase Clasps  │
│ 8. CULTURAL │ Hand-Woven Ancestral Textile  │ Indigenous Totem / Flag Ribbons│ Mythic Folklore Filigree│
└─────────────┴───────────────────────────────┴────────────────────────────────┴─────────────────────────┘
```

#### 1. Parent Cards (`parent` — Heritage, Lineage & Upbringing)
* **Distinguishing Hallmark:** Vintage Family Polaroid Mount & Family Tree Heritage Watermark.
* **Tactile Surface Material:** Warm textured cream/sepia heavy cardstock reminiscent of a cherished 1990s family photo album.
* **Ornamentation & Accents:** Four antique stamped brass photo-corner mounts hold the card face; card title is rendered in warm, humanized hand-written script.
* **Background Watermark:** Faint watermark of deeply rooted ancestral tree branches extending upwards from the base.
* **Interactive Signature & Audio:** Gentle warm acoustic guitar chord strum and nostalgic vinyl warmth when tapped or flipped.
* **The Canonical Parent Card Archetypes & Mechanics:**
  1. **Ex-Pro Player (`ex_pro_player`):**
     * *Lore:* One of your parents was a professional footballer who now serves as your personal agent.
     * *Bonuses:* +1 to +5 Weak Foot, +10 to +40 Free Stat Points, +3 to +20 Fame, Permanent Agent (Pro to Master).
     * *Perk:* **"In The Shadow Of"** (50% chance Fame cards turn negative; -10 Chemistry when joining a new club).
  2. **Average Family (`average_family`):**
     * *Lore:* Raised in a grounded, loving household that instilled emotional equilibrium.
     * *Bonuses:* +5 to +30 Composure, Potential Bonus.
     * *Perk:* **"Ask Parents for Advice"** (Unlocks 1x per season button in Persistent UI granting +10 Composure, +10 Chemistry, -10 Bad Rep, +10 Recovery, or +10 Focus).
  3. **Helicopter Parents (`helicopter_parents`):**
     * *Lore:* Overbearing perfectionists who controlled every training session and represent you with iron-fisted rigor.
     * *Bonuses:* +1 to +5 Weak Foot, Permanent Agent (Strict to Master), Potential Bonus.
     * *Perk:* **"Forced To Train"** (+1 Injury Recovery Point automatically every month).
  4. **Immigrant Family / Immigrant Parent (`immigrant_family`):**
     * *Lore:* Your family left their homeland in search of a better future, raising you with unbreakable work ethic between two worlds.
     * *Bonuses:* +5 to +30 Stamina, Potential Bonus, Dual/Triple Nationalities (drawn from Top 10/15/50 FIFA nations).
     * *Perk:* **"Outsider Adaptability"** (+5 Squad Chemistry upon signing with any new club; +1 Permanent Potential every time you switch clubs [up to +5 career cap]; eligible to represent multiple youth and senior national teams).
  5. **Raised in the Streets / Ghetto (`raised_in_ghetto`):**
     * *Lore:* Football was your life raft from concrete cage turf, poverty, and adversity; forged in relentless survival instincts.
     * *Bonuses:* +5 to +30 Strength, +5 to +30 Dribbling, Potential Bonus.
     * *Perk:* **"Street Survivor"** (If injured right before a Semi-Final, Final, or Key Match, can play 1 extra fixture through injury before being forced to rest; receives a massive +5 to ALL player attributes and +10 Composure during all Semi-Finals, Finals, and Key Match fixtures).
  6. **Rich Parents (`rich_parents`):**
     * *Lore:* Family wealth provided private trainers, state-of-the-art youth facilities, and immense starting capital.
     * *Bonuses:* €1.0M to €12.0M Starting Cash, 1 Pre-Purchased Commercial Business (Sportswear Line, Gym Franchise, or VC Fund Tiers 1–2).
     * *Perk:* **"Well Off"** (Passive lifestyle luxury and immediate business empire dividend cash flow).
  7. **Iconic Parent (`iconic_parent`):**
     * *Lore:* Direct child of an immortal football royalty legend (Pelé, Maradona, Zidane, Cruyff, Ronaldo).
     * *Bonuses:* +5 Weak Foot, +40 Free Stat Points, +18 Potential, +20 Composure, +15 Stamina/Reactions/Positioning, 99-Rated Master Agent.
     * *Perk:* **"Born For Greatness"** (+10 Stat Points every 5 years, +20% Fame gained from all sources, Fame cards immune to negative penalties, upgradeable multi-choice advice menu).

#### 2. Street Cards (`street` — Cage Turf, Concrete & Raw Grit)
* **Distinguishing Hallmark:** Distressed Asphalt Tarmac Grain & Spray Paint Stencil Tagging.
* **Tactile Surface Material:** Coarse, heavy-grit urban asphalt surface with authentic micro-bump texturing and sidewalk pavement seams.
* **Ornamentation & Accents:** Card corners are secured with diagonal strips of textured metallic silver duct-tape; typography is rendered in raw, distressed spray-paint stencil lettering with authentic paint overspray splatters.
* **Background Watermark:** Heavy welded steel chain-link cage wire mesh stamped with an underground street tournament stencil (`[CAGE BRED]`).
* **Interactive Signature & Audio:** Resonant rattle of chain-link fences being shaken, distant train pass, and sneaker squeak on concrete.

#### 3. Youth Cards (`youth` — Academies, Scouting & Raw Potential)
* **Distinguishing Hallmark:** Technical Scouting Blueprint Grid & Stamped Academy Verification Seal.
* **Tactile Surface Material:** Matte technical blueprint paper covered with a subtle 5mm millimetric graph pattern and neon yellow highlighter accents.
* **Ornamentation & Accents:** Left card border features a vertical metric centimeter ruler gauge; top corner bears a prominent diagonal ink stamp in emerald green: `[SCOUT VERIFIED / ACADEMY CLASS]`.
* **Background Watermark:** Semi-transparent 8-axis player attribute radar polygon graph centered behind the focal icon.
* **Interactive Signature & Audio:** Sharp coach whistle chirp echo and rapid clipboard pencil scrawl sound on inspection.

#### 4. Career Cards (`career` — Matchday Glory, Transfers & Trophies)
* **Distinguishing Hallmark:** Authentic Breathable Match Jersey Fabric Weave & Championship Laurel Ribbon.
* **Tactile Surface Material:** Micro-perforated polyester athletic jersey mesh weave with visible knit fibers and moisture-wicking aerodynamic seams.
* **Ornamentation & Accents:** Top header features embroidered golden championship stars (1 to 5 stars); footer is anchored by an embossed metallic golden laurel wreath ribbon; card edge features official match badge stitching.
* **Background Watermark:** Official holographic FIFA/Continental competition crest watermark that gleams with iridescent sheen upon tilting.
* **Interactive Signature & Audio:** Roaring thunderous stadium crowd ovation, booming drum cadence, and celebratory referee match whistle.

#### 5. Lifestyle Cards (`lifestyle` — Fame, Luxury, Romance & Entourage)
* **Distinguishing Hallmark:** Ultra-Gloss Mirror UV Varnish & Diamond-Quilted Leather Backing.
* **Tactile Surface Material:** Ultra-reflective high-gloss luxury magazine cover coating with deep satin sheen and diamond-quilted Italian Nappa leather textures.
* **Ornamentation & Accents:** Sleek 1920s Art Deco geometric champagne-gold corner flourishes; card title is stamped in gleaming metallic rose-gold foil; top-right features an exclusive `[VIP ALL-ACCESS]` holographic lanyard badge.
* **Background Watermark:** Elegant interlocking gold monogram initials and luxury watch bezel guilloché pattern.
* **Interactive Signature & Audio:** Rapid paparazzi camera shutter flashes, smooth jazz saxophone chord, and the clinking of crystal champagne flutes.

#### 6. Sponsor Cards (`sponsor` — Corporate Endorsements, Brands & Gear Deals)
* **Distinguishing Hallmark:** Woven Carbon Fiber Twill & Vertical Iridescent Hologram Barcode Strip.
* **Tactile Surface Material:** Lightweight high-tech matte carbon-fiber twill weave crossed with glossy metallic circuit traces.
* **Ornamentation & Accents:** Right margin is bounded by a vertical 8mm rainbow holographic security foil strip that shifts colors under lighting; bottom edge features a laser-etched EAN-13 barcode and authentic corporate serial number registration stamp.
* **Background Watermark:** High-contrast corporate global brand endorsement seal with dynamic microprinted contract clauses forming the outer border.
* **Interactive Signature & Audio:** Crisp electronic cash register chime (`*CHA-CHING!*`) paired with a high-tech biometric laser scanner chirp.

#### 7. Agent Cards (`agent` — Contract Negotiations, Retainers & Legal Clout)
* **Distinguishing Hallmark:** Pebbled Italian Calfskin Leather, Red Wax Notary Seal & Cursive Signature.
* **Tactile Surface Material:** Deep mahogany or charcoal pebbled Italian leather briefcase grain with hand-stitched perimeter thread seams.
* **Ornamentation & Accents:** Four reinforced polished brass briefcase corner protectors; bottom section features an authentic red sealing-wax stamp with gold-leaf trim, underlined by an ink fountain-pen signature line (`Contract Authenticated`).
* **Background Watermark:** Watermark of legal contract parchment paper displaying legal boilerplate terms (`"IN WITNESS WHEREOF..."`) and a balanced scale of justice.
* **Interactive Signature & Audio:** Heavy mahogany courtroom gavel strike followed by the crisp sound of a fountain pen signing heavy parchment.

#### 8. Cultural Cards (`cultural` — National Heritage, Roots & Ancestral Pride)
* **Distinguishing Hallmark:** Ancestral Hand-Woven Textile Relief & Continental Heritage Motifs.
* **Tactile Surface Material:** Authentic organic hand-woven textile relief adapting to the player's continent (e.g. vibrant Andean wool geometry for South America, intricate geometric Kente cloth for Africa, Celtic knotwork weaves for Western Europe, silk brocade damask for East Asia).
* **Ornamentation & Accents:** Card perimeter features subtle gradient washes of the player's national flag colors; card corners are hand-carved with mythological ancestral totems or folklore filigree.
* **Background Watermark:** Sacred ancestral sun medallion or traditional folklore spirit creature radiating light from behind the player avatar.
* **Interactive Signature & Audio:** Resonant ancestral tribal drums, authentic regional ethnic flutes, and a deep harmonic spiritual hum on inspect.

---

## 17. CANONICAL BUSINESSES & CLUB ECONOMY (FROM `businesses.ts`)

1. **Premium Sportswear Line (`sportswear`):** Operating cost 68%, Net profit 32%. Tiers 1–5 (Cost €150k to €23.05M; max annual revenue €85M).
2. **Fitness Center Franchise (`fitness`):** Operating cost 71%, Net profit 29%. Tiers 1–5 (Cost €750k to €40.5M; max annual revenue €128M).
3. **Fine Dining Restaurant (`restaurant`):** Operating cost 76%, Net profit 24%. Tiers 1–5 (Cost €1.2M to €47.45M; max annual revenue €155M).
4. **Tech Venture Capital Fund (`vc_fund`):** Operating cost 30%, Net profit 70%. Tiers 1–5 (Cost €2.5M to €480M; max annual revenue €900M).
5. **Boutique Hotel & Resort (`hotel`):** Operating cost 66%, Net profit 34%. Tiers 1–5 (Cost €15M to €1.081B; max annual revenue €405M).

---

## 18. STAT PROGRESSION & STAT BREAK SYSTEM (FROM `statProgressionSystem.ts`)

### A. The Core Attributes & Groups
* **18 Outfield Attributes across 6 Core Groups & 7 Goalkeeper Specialist Metrics:** Full progression tracking across:
  * **PHY (3) — Physical:** Pace, Stamina, Strength
  * **PRO (3) — Progression:** Ball Control, Retention, Dribbling
  * **PAS (3) — Passing:** Short Pass, Long Pass, Crossing
  * **GOA (3) — Goalscoring:** Shooting (inside-box finishing), Heading, Long Shots
  * **DEF (3) — Defending:** Tackling, Marking, Interceptions
  * **MEN (3) — Mental:** Positioning, Composure, Reactions
  * **GOA (7) — Goalkeeper Specialists:** Saving (SAV), Reflexes (REF), Handling (HAN), Positioning (POS), Aerial Reach (AER), One-on-One (1v1), Distribution (DIS)

---

### B. Annual Stat Point Allotment & Development Lifecycle Curve
Footballer development follows a realistic biographical career curve governed by yearly free stat point allotments to distribute as the user sees fit:
* **The 4 Career Development Phases:**
  1. **Youth Acceleration (Ages 10–20):** **15 Stat Points** awarded annually. The user distributes these 15 points across any individual attributes to rapidly shape their player's archetype and development trajectory.
  2. **Professional Maturation (Ages 20–28):** Drops to **5 Stat Points** awarded annually. Progression slows into fine-tuning tactical and physical refinements.
  3. **Peak Prime Stasis (Ages 28–30):** Exactly **0 Stat Points** awarded annually. The footballer has achieved their natural biological prime; attribute focus shifts entirely to tactical consistency, form maintenance, and trophy conquests.
  4. **Biological Aging & Veteran Decay (Ages 30+):** Progression halts; the player enters physical regression unless protected by Stat Break immortality.

---

### C. Base Tiered Level Progression & 100-Point Break Threshold
* **Base Tiered Level Progression:**
  * 0–20: 1 stat point = 5 levels
  * 20–50: 1.5 to 3 levels per point
  * 50–70: 1 to 1.25 levels per point
  * 70–85: 2 to 4 points per level
  * 85–95: 6.67 to 10 points per level
  * 95–99: 20 points per level
  * **99 $\rightarrow$ 100:** Exactly **100 stat points** needed to trigger a **STAT BREAK (⚡ Break)**.
* **Development State Multipliers (5-State Integration):**
  Applied to the base points needed for any attribute upgrade:
  * 🌟 **Natural / ⚡ Skillful / ⚪ Normal:** $1.00\times$ base stat points required.
  * ⚠️ **Poor:** $1.05\times$ base stat points required (**+5% training penalty**).
  * ❌ **Weakness:** $1.10\times$ base stat points required (**+10% training penalty**).
  $$\text{FinalPointsNeeded} = \left\lceil \text{BasePoints} \times \text{StateMultiplier} \right\rceil$$

---

### D. Age 30+ Physical Decay, Compounding Injury Vulnerability & Market Aging
Starting at age 30, human biology begins an irreversible athletic decline:

#### 1. Annual Physical Attribute Loss (Random PHY Stat Deduction):
Every off-season, an aging player loses physical points directly subtracted from their physical attribute levels (1 lost physical point = exactly 1 stat level subtracted from that attribute):
* **Age 30:** Loses **1 Physical Point** ($-1$ stat level).
* **Age 31:** Loses **2 Physical Points** ($-2$ stat levels).
* **Age 32:** Loses **2 Physical Points** ($-2$ stat levels).
* **Age 33:** Loses **3 Physical Points** ($-3$ stat levels).
* **Age 34:** Loses **4 Physical Points** ($-4$ stat levels).
* **Age 35+:** Permanently loses **5 Physical Points** ($-5$ stat levels every year).
* **Random Allocation Among Physical Attributes:**
  * Each lost point is picked randomly among the 3 Physical (PHY) attributes: **Pace**, **Stamina**, or **Strength** (e.g. at age 30, if Stamina is 84 and selected, it permanently drops to 83).
* **⚡ Stat Break Immortality Shield:** If a physical attribute has achieved a **Stat Break**, it is **100% immune to physical decay**; the random selector will bypass it and target only non-broken physical attributes!

#### 2. Veteran Compounding Injury Mechanics (5% Multiplier Scaling):
Past age 30, muscles and joints lose elasticity, increasing both injury probability and recovery time:
* **Compounding Injury Risk:** Baseline injury risk is modified by a **compounding $+5\%$ per year past 30** ($\text{Risk} \times 1.05^{(\text{Age} - 30)}$). This is applied as a **relative modifier on the player's calculated injury %**, NOT as a flat additive percentage!
  * *Example:* A 32-year-old player with a base calculated injury risk of 8.0% suffers an effective risk of $8.0\% \times (1.05)^2 = 8.82\%$.
* **Compounding Recovery Time:** Required rehabilitation time for any sustained injury increases by a **compounding $+5\%$ per year past 30** ($\text{Weeks} \times 1.05^{(\text{Age} - 30)}$), reflecting slower cellular repair in veteran athletes.

#### 3. Transfermarkt Market Value Aging Decay:
* Based on authentic **Transfermarkt** valuation models, player market value peaks between ages 24–28 and begins aggressive annual depreciation past age 30:
  * Age 30: $-10\%$ annual market value decay factor.
  * Age 31–32: $-18\%$ annual market value decay factor.
  * Age 33–34: $-28\%$ annual market value decay factor.
  * Age 35+: $-40\%$ annual market value decay factor.
* **Salary Disconnection Rule:** A veteran's contracted wage or market salary does **not** automatically collapse with age alone—clubs continue paying premium wages based on current OVR, iconic stature, and commercial fame, only lowering salary if the player's actual OVR regresses.

---

### E. Career "Prime Card" Recording, Glory Points System & Retirement Conversion (`careerPrimeSystem.ts`)

Throughout a player's career, the engine continuously tracks and preserves an immutable **"Prime Card"** representing the absolute pinnacle of their football journey, while computing their lifetime **Silverware Glory Points**:

#### 1. The Canonical Competition Glory Points Matrix (Scaled with UCL = 1,000 pts):
Silverware points govern **Prime Season tiebreaking**, **Ballon d'Or seasonal voting merits**, **Season Academic Grades**, and **Career Retirement Conversion into Champion Points**:

$$\text{SeasonGloryScore} = \sum_{\text{Trophies Won}} \text{GloryPoints}(\text{Competition})$$

* 🏆 **FIFA World Cup:** **5,000 pts** (The absolute summit of world football; $10.0$ baseline ratio)
* ⭐ **UEFA Champions League (UCL):** **1,000 pts** (The pinnacle of world club football; $2.0$ baseline ratio)
* 🇪🇺 **Eurocopa (UEFA European Championship):** **850 pts** (Premier continental national championship; below UCL)
* 🌎 **Copa América:** **650 pts** (Historic South American continental championship)
* 🌍 **Africa Cup of Nations (AFCON):** **450 pts**
* 🥈 **UEFA Europa League (UEL):** **400 pts**
* 🏆 **Copa Libertadores:** **350 pts** (The crown jewel of South American club football)
* 🌏 **AFC Asian Cup:** **300 pts**
* 🌐 **UEFA Nations League:** **275 pts**
* 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League (EPL):** **250 pts** ($0.50$ baseline ratio; toughest domestic league)
* 🇪🇸 **La Liga:** **225 pts** ($0.45$ baseline ratio)
* 🥇 **CONCACAF Gold Cup:** **200 pts**
* 🇮🇹 **Serie A:** **175 pts** ($0.35$ baseline ratio)
* 🇩🇪 **Bundesliga:** **125 pts** ($0.25$ baseline ratio)
* 🇫🇷 **Ligue 1:** **75 pts** ($0.15$ baseline ratio)
* 🥉 **UEFA Conference League (UECL):** **60 pts** (Calibrated strictly beneath Ligue 1)
* 🥈 **Copa Sudamericana:** **55 pts**
* 🇵🇹 **Primeira Liga (Portugal):** **50 pts** ($0.10$ baseline ratio)
* 🇳🇱 **Eredivisie (Netherlands):** **40 pts** ($0.08$ baseline ratio)
* 🇧🇷 **Brasileirão Série A (Liga Brasileña):** **38 pts** (Calibrated directly under Eredivisie)
* 🏆 **Top 5 Domestic Cup (FA Cup, Copa del Rey, DFB-Pokal, Coppa Italia, Coupe de France):** **35 pts**
* 🌍 **CAF Champions League:** **30 pts**
* 🌏 **AFC Champions League Elite:** **25 pts**
* 🌎 **CONCACAF Champions Cup:** **20 pts**
* ⚽ **Top 10 Domestic League (Argentine Primera, Belgian Pro League, etc.):** **18 pts**
* 🌐 **FIFA Club World Cup (Quadrennial 32-Team):** **150 pts**
* 🌐 **FIFA Intercontinental Cup (Annual):** **50 pts**
* 🏆 **Top 10 Domestic Cup:** **15 pts**
* ⚽ **Top 20 League (Scottish Premiership, MLS, Saudi Pro League, Liga MX, Süper Lig):** **10 pts**
* 🛡️ **Domestic Supercups (Community Shield, Supercopa):** **5 pts**

---

#### 2. Universal Integration Across the 4 Core Football Systems:
1. **Ballon d'Or Calendar-Year Voting Merit (Section 9.B):**
   The Silverware component of the Ballon d'Or index uses the Glory Points Matrix: winning the World Cup (+5,000 pts equivalent) or UCL (+1,000 pts) provides the definitive trophy leverage that tilts global voting over domestic-only contenders.
2. **End-of-Season Academic Qualification (Grade F to S — Section 9.C):**
   A player's seasonal silverware score ($\text{SeasonGloryScore}$) feeds directly into their Academic Grade criteria: racking up $\ge 1,000$ glory points (UCL or World Cup) virtually guarantees an **S-Grade** campaign if match ratings exceed 8.0.
3. **Deciding the Career "Prime Card" (Section 18.E.3):**
   When peak OVR is tied across multiple seasons, the season with the highest cumulative **Season Glory Score** is officially crowned as the player's Prime Season.
4. **Career Retirement Conversion into "Champion Points" (`🪙`):**
   * **The Supreme Meta-Currency:** Upon completing your career and officially retiring in Unique Career mode, all accumulated Career Glory Points and career accolades convert into **Champion Points**!
   * **Retirement Conversion Formula:**
     $$\text{Champion Points Earned} = \text{round}\left( \frac{\text{Lifetime Glory Points}}{100} \right) + (\text{Ballon d'Ors} \times 25) + (\text{Peak Prime OVR} - 70) \times 2$$
   * **Unlocking "Play as Legend" Mode:** Champion Points are the **most valuable and prestigious currency in the entire game**. They are used exclusively to unlock immortal real-world legends in the dedicated **"Play as Legend" Mode** (e.g. unlocking Pelé, Diego Maradona, Zinedine Zidane, Johan Cruyff, Ronaldo Nazário, Ronaldinho) to relive or rewrite their historic careers, with additional mythic content releasing in future expansions!

---

#### 3. Prime Card Minting & Multi-Season Tiebreaker Engine:
* **Core Definition:** The single highest-OVR Player Card achieved during the entire unique career run.
* **Multi-Season Tiebreaker Sequence:**
  If a player maintains their peak OVR across multiple seasons (e.g. 92 OVR at age 26, 27, and 28):
  1. **Primary Tiebreaker:** Highest cumulative **Season Glory Score** via the Glory Points Matrix above.
  2. **Secondary Tiebreaker:** Combined official competitive Goals + Assists (or Clean Sheets + Saves for GKs).
  3. **Tertiary Tiebreaker:** Highest campaign Average Match Rating (e.g. 7.92 vs 7.84).
* **Hall of Fame & Legacy Showcase:** The finalized Prime Card is minted in the Career Hall of Fame, displaying their peak attributes, prime season stats, and trophy cabinet as a golden museum centerpiece!

---

### F. The 3 Canonical Ways to Trigger a Stat Break
A Stat Break can **only** be triggered upon reaching **99** in an individual attribute (or through direct iconic card/perk unlock mechanics):
1. **Natural 100-Point Investment:** Reaching 99 on an individual stat and subsequently investing the required **100 stat points** into that attribute.
2. **Iconic Career Cards:** A select few ultra-rare Iconic Career milestone cards that directly grant an instant Stat Break to a designated signature attribute (e.g. *The Flea's Balance*, *The Phenomenon's Stride*).
3. **Prodigy Perks (Early Breakthrough at 5% Chance under Age 20):**
   * When an outfield player reaches **90+** in any **Physical (PHY)** or **Mental (MEN)** attribute before turning **20 years old**, they roll a **5% probability check** to instantly unlock that attribute's legendary Prodigy Perk, triggering an immediate Stat Break!
   * **Goalkeeper Prodigy Perks:** Goalkeepers have their own dedicated **5% prodigy perk pool** when reaching **90+ before age 20** on any of the 7 Goalkeeper Specialist attributes (restricted strictly to Goalkeepers):
     * **The Iron Fortress** *(Saving ⚡ Break)*: Unstoppable reaction dives turning sure-fire inside-the-box goals into miraculous palm-aways.
     * **Temporal Warp** *(Reflexes ⚡ Break)*: Sub-second neuro-twitch reactions denying point-blank deflections and double-tap rebounds.
     * **Vise Grip** *(Handling ⚡ Break)*: Magnetic adhesive palms that lock onto 120 km/h rockets cleanly without spilling a rebound.
     * **The Spatial Oracle** *(Positioning ⚡ Break)*: Flawless geometric post-to-post angle cutting that shrinks the striker's target cone to zero.
     * **Titan of the Heavens** *(Aerial Reach ⚡ Break)*: Uncontested vertical ascension and wingspan snatching crosses out of the sky over swarming forwards.
     * **The Ghost Wall** *(One-on-One ⚡ Break)*: Suffocating box intimidation that charges down breakaway strikers and forces panicked miskicks.
     * **Quarterback of the Pitch** *(Distribution ⚡ Break)*: Laser-guided 60-meter trajectory throws and counter-attack clearing volleys that instantly spark 3v1 breakaways.

---

### G. Stat Break Effects, Potential Bottleneck Prevention & Group Synergy Multipliers
* **The Potential Bottleneck Prevention Rule:**
  * When an attribute achieves a Stat Break, the player receives **+1 OVR** and **+1 POT (Potential)**!
  * *Why this is essential:* If a player was rated **89 OVR with 90 POT**, triggering a stat break without potential growth would make them **90 OVR / 90 POT**, permanently capping their remaining 17 attributes from ever receiving further training points. By granting **+1 POT along with +1 OVR**, the player becomes **90 OVR / 91 POT**, preserving that spare potential point for free distribution across other attributes!
* **Stat Break Immortality (⚡ Break):** Awards the glistening "BROKEN" Crown badge and grants permanent immunity to physical age regression for that broken attribute throughout veteran years.

#### 1. Group Attribute Card Calculation (Specialized Archetype Weighting 60% / 25% / 15%):
* The Player Card UI displays the **6 core group values** (PHY, PRO, PAS, GOA, DEF, MEN for outfield; specialist groups for GK), rather than crowding the card face with all individual attributes.
* **Weighted Group Formula (Without Stat Breaks):**
  To allow specialized players to look great and authentic on their cards (e.g. an elite inside-box striker with 95 Shooting, 82 Long Shots, and 60 Heading still achieves an imposing Goalscoring card stat of $\approx 86$ rather than being dragged down to 79 by an unweighted flat average), the 3 individual attributes within any group are sorted in descending order:
  $$\text{Sorted Group Stats}: [S_{\text{highest}}, S_{\text{second}}, S_{\text{lowest}}]$$
  $$\text{Base Group Value} = \text{round}\Big(0.60 \times S_{\text{highest}} + 0.25 \times S_{\text{second}} + 0.15 \times S_{\text{lowest}}\Big)$$
* **Card Display Only — No Impact on OVR:**
  This weighted formula applies **strictly to the visual group value displayed on the card**. It does **not** alter or inflate the core calculation of the player's overall rating (OVR), which remains tied to their canonical position-weighted attribute model.
* **Definition of "Group Was Already at 99":**
  "Group was already at 99" refers strictly to the **Base Group Value calculated without stat breaks** reaching 99.

#### 2. Group Attribute Display on Player Card with Stat Breaks:
* **1 Stat Break in Group:**
  * If the base group value is $< 99$: Group rating increases by **+1** on the card.
  * If the base group value was already at **99**: It moves to **100**.
* **2 Stat Breaks in Group:**
  * Group rating receives a **+3 bonus** on the card.
  * If the base group value was already at **99**: It leaps to **105**!
  * **OVR & POT Synergy:** Grants **+2 OVR** and **+2 POT**!
* **3 Stat Breaks in Group (Complete Group Mastery):**
  * Group rating receives a **+5 bonus** on the card.
  * If the base group value was already at **99**: It ascends to an astounding **127**!
  * **OVR & POT Synergy:** Grants **+3 OVR** and **+3 POT**!

#### 3. Pushing Past 99 OVR (The Divine Transcendence Ceiling):
* **Strict Prerequisite for Pushing Past 99:**
  * **A player's OVR can ONLY push past 99 if their base OVR is ALREADY at 99 without counting any stat breaks!**
  * If a player is rated 94 base OVR and achieves stat break group bonuses, the bonuses contribute normally up to 99, but will never push past 99 until the underlying base attributes independently reach a pure 99 OVR foundation.
* **Only Stat Break Group Synergy Bonuses Can Push Past 99:**
  * Base attribute training alone strictly hard-caps at 99.
  * Stat break group synergy bonuses are the **sole mechanical channel in the entire game** capable of elevating a footballer above 99 OVR into transcendent status.
* **The 127 Group Ascendance Rule:**
  * When a player achieves **one full group at 127** (all 3 attributes broken with a base group value of 99 before breaks) AND their base OVR is at 99 without counting stat breaks, instead of the standard $+1$ per break ($+3$ OVR/POT), the player receives a colossal **+5 OVR and +5 POT**, blasting past 99 to reach **104 OVR / 104 POT**!
  * **The Mythic Double-127 Rule (Absolute Hard Cap):** If an extraordinarily lucky player manages to achieve a **second group at 127** (an astronomically rare phenomenon requiring insane prodigy RNG and flawless maxed career investment) while sitting at 99 base OVR without stat breaks, their **OVR and POT are immediately crowned at the absolute hard cap of 127 OVR / 127 POT**!

---

---

## 19. DEEP DOMESTIC PYRAMIDS, 6 CONTINENTAL CHAMPIONS LEAGUES & 2 GLOBAL CLUB TOURNAMENTS

DrawStar Remake 2.0 implements the complete global club competition ecosystem across all 6 FIFA confederations plus both annual and quadrennial world club championships:

```
                               ┌───────────────────────────────────┐
                               │     FIFA CLUB WORLD CUP (32)      │
                               │   (Quadrennial World Showdown)    │
                               └─────────────────┬─────────────────┘
                                                 ▲
                               ┌─────────────────┴─────────────────┐
                               │   FIFA INTERCONTINENTAL CUP (6)   │
                               │   (Annual Intercontinental Clash) │
                               └─────────────────▲─────────────────┘
                                                 │
       ┌───────────┬───────────┬───────────┼───────────┬───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼           ▼           ▼
   [UEFA CL]  [CONMEBOL]  [CONCACAF]    [AFC]       [CAF]       [OFC]      [Host]
    Europe     Libertad.  Champions   ACL Elite   Champions   Champions   Champion
   (36 Swiss)  (32 Grps)  Cup (27 KO) (24 Lge)    (16 Grps)   (8 Grps)
```

### A. Domestic Pyramids Structure
* **England (4 Tiers):** Premier League (20) $\rightarrow$ Championship (24) $\rightarrow$ League One (24) $\rightarrow$ League Two (24). FA Cup, EFL Cup, Community Shield.
* **Spain (3 Tiers):** Primera División (20) $\rightarrow$ Segunda División (22) $\rightarrow$ Primera Federación (20). Copa del Rey, Supercopa de España.
* **Italy (3 Tiers):** Serie A (20) $\rightarrow$ Serie B (20) $\rightarrow$ Serie C (20). Coppa Italia, Supercoppa Italiana.
* **Germany (3 Tiers):** Bundesliga (18) $\rightarrow$ 2. Bundesliga (18) $\rightarrow$ 3. Liga (20). DFB-Pokal, DFL-Supercup.
* **Two-Tier Global Leagues (18 Nations):** Scotland, France, Netherlands, Belgium, Portugal, Turkey, Croatia, Colombia, Mexico, Uruguay, Chile, Japan, South Korea, Saudi Arabia, Egypt, Morocco, Nigeria, Australia.
* **Single-Tier Leagues:** USA / MLS (30 clubs, Eastern & Western Conferences, MLS Cup Playoffs).

---

### B. The 6 Continental Champions Tournaments

#### 1. UEFA (Europe) — *UCL, UEL, UECL & Super Cup*
* **UEFA Champions League (36 Clubs):** Modern single league Swiss phase with 4 seeded pots (Bombos 1–4, 8 matches per club) $\rightarrow$ Top 8 advance directly to Round of 16 $\rightarrow$ 9th–24th play 2-legged knockout playoffs $\rightarrow$ QF $\rightarrow$ SF $\rightarrow$ Single Final.
* **UEFA Europa League (36 Clubs):** Identical 36-club Swiss system.
* **UEFA Conference League (36 Clubs):** 36-club Swiss system (6 league matches).
* **UEFA Super Cup:** Single match between UCL and UEL winners.

#### 2. CONMEBOL (South America) — *Copa Libertadores, Sudamericana & Recopa*
* **Copa Libertadores (32 Clubs):** 8 groups of 4 clubs (Home & Away, 6 matches) $\rightarrow$ Top 2 advance to Round of 16 $\rightarrow$ Quarterfinals $\rightarrow$ Semifinals $\rightarrow$ Single Neutral Final (Maracanã, Monumental, Centenario).
* **Copa Sudamericana (32 Clubs):** 8 groups of 4 $\rightarrow$ Playoff round vs Libertadores 3rd place teams $\rightarrow$ R16 $\rightarrow$ QF $\rightarrow$ SF $\rightarrow$ Single Final.
* **Recopa Sudamericana:** 2-legged clash between Libertadores and Sudamericana champions.

#### 3. CONCACAF (North/Central America & Caribbean) — *Champions Cup*
* **CONCACAF Champions Cup (27 Clubs):** Elite knockout tournament featuring champions from Liga MX (Mexico), MLS (USA), Leagues Cup, Central American Cup, and Caribbean Cup.
* **Format:** Round One (22 clubs) $\rightarrow$ Round of 16 (Round 1 winners + 5 bye champions: Liga MX Apertura/Clausura, MLS Cup, Leagues Cup, Central American Cup) $\rightarrow$ 2-legged QF and SF $\rightarrow$ Single Final.

#### 4. AFC (Asia & Australia) — *AFC Champions League Elite & ACL Two*
* **AFC Champions League Elite (24 Clubs):** Divided geographically into West Region (12 clubs: Saudi Arabia, UAE, Qatar, Iran) and East Region (12 clubs: Japan, South Korea, Australia, China).
* **League Stage:** Each club plays 8 matches against regional opponents $\rightarrow$ Top 8 in West & Top 8 in East advance to Round of 16 (2-legged regional matches).
* **Elite Final Stage (Centralized Hub):** The 4 West winners and 4 East winners travel to a centralized host (e.g. Riyadh or Tokyo) for single-leg Quarterfinals, Semifinals, and Grand Final!
* **AFC Champions League Two (32 Clubs):** Tier 2 continental competition with 8 groups of 4.

#### 5. CAF (Africa) — *CAF Champions League & Confederation Cup*
* **CAF Champions League (16 Clubs):** 4 groups of 4 clubs (Home & Away) featuring Egyptian titans (Al Ahly, Zamalek), Moroccan giants (Wydad, Raja), Nigerian champions, and South African powerhouses.
* **Knockout Stage:** Top 2 from each group advance to 2-legged Quarterfinals $\rightarrow$ Semifinals $\rightarrow$ Grand Final.
* **CAF Confederation Cup (16 Clubs):** Tier 2 African cup with 4 groups of 4 and knockouts.
* **CAF Super Cup:** Annual single-match duel between CAF Champions League and Confed Cup winners.

#### 6. OFC (Oceania) — *OFC Men's Champions League*
* **OFC Champions League (8 Clubs):** Centralized host tournament featuring champions from New Zealand (e.g. Auckland City), Fiji, Tahiti, Vanuatu, New Caledonia, and Solomon Islands.
* **Format:** 2 groups of 4 clubs $\rightarrow$ Top 2 advance to single-leg Semifinals $\rightarrow$ Grand Final. Winner qualifies directly for the FIFA Intercontinental Cup and the FIFA Club World Cup!

---

### C. The 2 Global Club Tournaments

#### 1. Annual FIFA Intercontinental Cup (Every December)
The annual championship pitting the 6 continental champions against each other in a progressive bracket:
* **Stage 1 — FIFA African-Asian-Pacific Cup Playoff:**
  $$\text{OFC Champion} \quad \text{vs} \quad \text{AFC Champion or CAF Champion (Rotates annually)}$$
* **Stage 2A — FIFA African-Asian-Pacific Cup Final:**
  $$\text{Stage 1 Playoff Winner} \quad \text{vs} \quad \text{The Remaining Asian or African Champion}$$
* **Stage 2B — FIFA Derby of the Americas:**
  $$\text{CONCACAF Champions Cup Winner} \quad \text{vs} \quad \text{CONMEBOL Copa Libertadores Winner}$$
* **Stage 3 — FIFA Challenger Cup:**
  $$\text{African-Asian-Pacific Cup Winner} \quad \text{vs} \quad \text{Derby of the Americas Winner}$$
* **Stage 4 — The Grand Final (FIFA Intercontinental Cup):**
  $$\text{FIFA Challenger Cup Winner} \quad \text{vs} \quad \mathbf{UEFA\ Champions\ League\ Winner}$$
* **Honors:** Awards the annual **World Club Champion 🌍🏆** crown, +3.0% permanent Powerscale heritage stack, and front-page global news coverage!

#### 2. Quadrennial 32-Club FIFA Club World Cup (Every 4 Years in June/July)
The ultimate global club competition featuring 32 clubs across 4 calendar years:
* **Participant Allocation (32 Clubs):**
  * **UEFA (12 clubs):** 4 previous UCL champions + 8 top 4-year European coefficient clubs.
  * **CONMEBOL (6 clubs):** 4 previous Copa Libertadores champions + 2 ranking clubs.
  * **CONCACAF (4 clubs):** 4 previous Champions Cup winners.
  * **AFC (4 clubs):** 4 previous ACL Elite winners.
  * **CAF (4 clubs):** 4 previous CAF Champions League winners.
  * **OFC (1 club):** Highest-ranked OFC champion across the 4-year cycle.
  * **Host Nation (1 club):** Reigning league champion of the host country (e.g. USA MLS Cup winner).
* **Tournament Format:**
  * **Group Stage:** 8 groups of 4 clubs (3 round-robin matches).
  * **Knockout Stage:** Top 2 from each group (16 clubs) advance to single-leg knockouts:
    $$\text{Round of 16} \;\longrightarrow\; \text{Quarterfinals} \;\longrightarrow\; \text{Semifinals} \;\longrightarrow\; \text{World Final}$$
* **Dynasty Coronation:**
  * Lifts the **Undisputed Quadrennial World Club Championship Trophy**.
  * Grants the player the permanent **Club World Legend** trait, maximum Ballon d'Or / Best Player voting boost, and €50,000,000 club prize purse.

---

### D. Up-to-Date 2026+ FIFA International Windows, UEFA Nations League & Qualifiers Engine (`nationalTeamSystem.ts`)

To ensure **National Teams play accurately, authentically, and without scheduling conflicts**, the calendar synchronizes domestic leagues and international fixtures into an authentic 4-year cycle adhering strictly to the **official 2026+ revised FIFA International Match Calendar**:

#### 1. The 2026+ Revised FIFA International Windows Architecture
Under the modernized FIFA international calendar reform, the former fragmented autumn windows are consolidated into higher-stakes, less travel-disruptive blocks:
* **Late September – Early October (The 16-Day "Mega Window" — 4 Matches):**
  * Consolidates the former separate September and October breaks into a single continuous **16-day mega window**.
  * Each national team plays up to **4 competitive international matches** back-to-back.
  * Used for: UEFA Nations League Matchdays 1–4, CONMEBOL World Cup Qualifying double-headers, CONCACAF Nations League, and AFC/CAF preliminary qualifiers.
* **Mid-November (9-Day Window — 2 Matches):**
  * Decisive group matchdays (UEFA Nations League Matchdays 5–6, final group phase standings, qualification crunch matches).
* **Late March (9-Day Window — 2 Matches):**
  * UEFA Nations League Quarterfinals (League A top 2 home-and-away) and Promotion/Relegation Playoffs.
  * Inter-confederation and continental tournament playoff deciders (Euro Qualifiers Playoff Finals, World Cup Playoffs).
* **Early June (9-Day Window / Summer Tournament Block — 2 Matches or Full Tournament):**
  * **Odd Years (Non-Tournament):** The **UEFA Nations League Final Four** (Semis, 3rd-place, and Grand Final) + International Friendlies.
  * **Even Years (Major Tournament):** Pre-tournament preparation camps and direct entry into Continental Championships (UEFA Euro, Copa América) or the FIFA World Cup!
* **Domestic Schedule Pause:** When any FIFA window begins, all top-tier domestic leagues automatically pause. Star players are never forced to play concurrent domestic league matches.

#### 2. UEFA Nations League Replacing Meaningless Friendlies
UEFA has completely eliminated redundant international friendly matches in favor of the competitive **UEFA Nations League**:
* **Division Hierarchy:**
  * **League A (16 Nations):** 4 groups of 4 (France, England, Spain, Germany, Italy, Portugal, Netherlands, Croatia, etc.). Top 2 from each group advance to March two-legged Quarterfinals $\rightarrow$ June Final Four! Bottom teams relegated to League B.
  * **League B (16 Nations):** 4 groups of 4. Group winners promoted to League A; runners-up contest promotion playoffs in March.
  * **League C (16 Nations):** 4 groups of 4 with promotion/relegation play-outs.
  * **League D (6 Nations):** 2 groups of 3 (micro-nations).
* **High Stakes & Tournament Bids:** Top performance in the Nations League guarantees secondary playoff safety nets for Eurocopa and World Cup qualification paths!

#### 3. UEFA European Championship (Eurocopa) Qualifiers System
* **Format:** 10 Qualifying Groups (Groups A through J) contested across March, the Sep–Oct Mega Window, and November.
* **Direct Qualification (20 Nations):** Top 2 teams from each of the 10 groups qualify directly for the 24-nation Eurocopa finals.
* **The Nations League Playoff Pathway (3 Nations):** 12 nations not directly qualified earn spots based on UEFA Nations League rankings into 3 play-off paths (Path A, B, and C). Each path features single-leg Semi-finals and a Final in March of tournament year.
* **Host Nation (1 Nation):** Automatically qualified. Total = **24 Finalists**.

#### 4. CONCACAF Gold Cup & Nations League Qualifiers
* **CONCACAF Nations League:** Serves as the official qualification engine for the CONCACAF Gold Cup.
* **Direct Qualification:** The 4 group winners and 4 runners-up of League A (the 8 quarter-finalists) secure direct entry to the 16-nation Gold Cup.
* **Gold Cup Prelims (Play-in):** League B group winners and League A play-in winners contest the remaining Gold Cup slots.

#### 5. CONMEBOL, AFC & CAF Qualifying Formats
* **CONMEBOL (South America):** The grueling 10-nation, 18-match round-robin marathon where all 10 South American nations face each other home-and-away across the 4-year cycle.
* **AFC (Asia):** 3-round progressive qualifying culminating in 3 groups of 6 and regional playoff knockouts.
* **CAF (Africa):** 9 groups of 6 teams with group winners qualifying directly, plus CAF playoff for the inter-confederation slot.

#### 6. Senior National Team Selection AI & Match Simulation
* **Squad Selection AI:** National team managers select a 23–26 man roster based on current form rating ($\ge 7.0$), attribute level, reputation, and tactical position needs.
* **The Maiden Call-Up Rule:** The *very first time* your player is selected for the senior national squad, it triggers the exclusive **Senior National Call-Up Phone Call Event** (Section 20.D). Routine subsequent selections simply populate your calendar without repetitive interruption.
* **Tournament Camps & Knockouts:**
  * Prior to summer tournaments (Euros, Copa America, World Cup), national teams hold a 2-week training camp with 2 warm-up matches.
  * Knockout matches feature full 90-minute simulation, 30 minutes of extra time, and sudden-death penalty shootouts (integrating with Section 10).
* **International Stat Tracking:** Caps, International Goals, Clean Sheets, Assists, and Tournament MVPs track permanently on the player's 32-bit card and directly accumulate **National Icon Points** (Section 25.C).

---

### E. Dual-Hemisphere Synchronized League Calendars (`calendarEngine.ts`)

Football across the globe does not operate on a single uniform calendar. DrawStar Remake 2.0 features **Dual-Hemisphere Synchronized Scheduling** that models both European and South American league structures with pinpoint accuracy:

```
Month:       JAN  FEB  MAR  APR  MAY  JUN  JUL  AUG  SEP  OCT  NOV  DEC
European:   [──── League R2 / UCL KO ────][AWARDS]   [─── League Kickoff / UCL Groups ───]
South Amer: [Break] [── Apertura / Estadual ──][BREAK] [── Clausura / Brasileirão Climax ──][AWARDS]
FIFA Windows:       [MAR]             [JUN]         [─── SEP-OCT MEGA ───][NOV]  [GALA]
```

#### 1. The European Fall-to-Spring Calendar (August 15 – May 31 / Early June)
* **Active Competitions:** Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, Europa League, Conference League, FA Cup, Copa del Rey.
* **Mid-Week Continental Fixtures:** UCL and European cup matches run Tuesday/Wednesday/Thursday, while domestic league fixtures occupy Saturdays/Sundays.
* **Calendar Flow:**
  * **Mid-August:** European domestic leagues kick off.
  * **Sept – Jan:** Continental League/Group Phase fixtures.
  * **Feb – May:** Knockout stages (Round of 16 $\rightarrow$ Quarterfinals $\rightarrow$ Semifinals).
  * **Late May / Early June:** Domestic Cup Finals and UEFA Champions League Grand Final!
* **European Season Awards Ceremony (Early June):** Domestic League Player of the Season, Team of the Year (XI), Golden Shoe / Pichichi, and UCL Player of the Tournament awarded immediately following the UCL Final.

#### 2. The South American Spring-to-Fall Calendar (February 1 – Mid-December)
* **Brazil (Brasileirão Série A + State Championships):**
  * **Feb – April:** State Championships (*Campeonatos Estaduais* like Paulista, Carioca, Gaúcho, Mineiro) — 12 to 16 intense regional matches.
  * **April – Early December:** Brasileirão Série A — The grueling 38-match national marathon.
  * **Winter Break / International Pause (June – July):** Full **3-to-4 week domestic shutdown** whenever the Copa América or FIFA World Cup is contested!
  * **Late November – Early December:** Copa do Brasil Finals and Brasileirão trophy coronation.
* **Apertura & Clausura Dual-Tournament Format (Colombia, Mexico, Argentina):**
  * **Torneo Apertura (Semester 1):** February to June. Features 19–20 regular season matchdays followed by the Quadrangular / Liguilla playoff final in mid-June.
  * **Torneo Clausura (Semester 2):** July to December. Fresh table standings reset to 0; playoff final in mid-December.
* **Copa Libertadores & Copa Sudamericana:**
  * **April – June:** Group Stage matchdays (6 matches).
  * **August – October:** Round of 16, Quarterfinals, and Semifinals.
  * **Late November:** The neutral-venue single-match Copa Libertadores Grand Final!
* **South American Season Awards Ceremony (Mid-December):** *Rey de América*, Copa Libertadores MVP, and Brasileirão Bola de Ouro awarded mid-December.

---

### F. Ultra-Low-Memory Stats Architecture & Dual-Semester Rolling Snapshot Engine (`statsEngine.ts`)

Simulating 500+ clubs and 15,000+ AI players across a 20-to-30 year career presents a severe data hazard: storing individual per-match player performance rows for every player would generate over **12,000,000 database objects ($> 1.2\text{ GB}$ JSON heap)**, triggering browser out-of-memory crashes, stuttering simulations, and broken saves. 

DrawStar Remake 2.0 solves this permanently through the **Dual-Semester Rolling Snapshot Engine ($H_1$ & $H_2$)** combined with **3-Tier AI Stat Pruning**:

#### 1. The Dual-Semester Snapshot Concept ($H_1$ & $H_2$)
Because European awards trigger in June while South American and World Awards (Ballon d'Or) trigger in December, calendar tracking is bifurcated into two distinct 6-month statistical semesters per calendar year:

$$\text{Full Calendar Year Stats} = H_1\text{ (Jan 1 – Jun 30)} \;+\; H_2\text{ (Jul 1 – Dec 31)}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SEMESTER 1 (H1: JAN 1 – JUN 30)                                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Climax of European League season (Rounds 20–38) + UCL Knockouts (R16 to Final)       │
│ • South American Torneo Apertura + Brazilian State Championships + Libertadores Groups  │
│ • June Summer Tournaments: UEFA Euro, Copa América, FIFA World Cup, or UNL Finals      │
│ ➔ EARLY JUNE: European Season Awards Gala executed.                                    │
│ ➔ JUNE 30: Top performer H1 stats snapshotted into YearlyAwardsAccumulator.           │
│   European domestic seasonal tallies cleanly reset for new 2026/27 campaign.           │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SEMESTER 2 (H2: JUL 1 – DEC 31)                                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • New European League kickoff + UCL League Phase (Matchdays 1–6)                       │
│ • South American Torneo Clausura + Brasileirão Série A Climax + Libertadores Final     │
│ • Autumn FIFA Windows: The 16-Day Sep-Oct Mega Window + November Window                │
│ ➔ MID-DECEMBER: South American Season Awards Gala executed.                            │
│ ➔ LATE DECEMBER: Ballon d'Or & FIFA The Best World Gala executed using (H1 + H2).      │
│ ➔ DEC 31: Temporary H1 accumulator pruned; fresh calendar year begins Jan 1.           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2. How the Ballon d'Or Resolves Seamlessly Without Losing Stats
* **The Challenge:** When Europe resets its season on July 1 for the new campaign, naive systems wipe all stats, causing European players to lose their spring achievements (goals, assists, UCL trophy) when the Ballon d'Or evaluates in December.
* **The DrawStar Solution (`YearlyAwardsAccumulator`):**
  1. On **June 30**, before the European season data structure rolls over, the engine runs a fast ranking pass and extracts the $H_1$ stats (Matches, Goals, Assists, Match Rating, Trophies) for the **Top 100 Global Contenders** into a lightweight in-memory vector:
     ```ts
     interface H1ContenderSnapshot {
       playerId: string;
       h1Apps: number;
       h1Goals: number;
       h1Assists: number;
       h1AvgRating: number;
       h1Trophies: TrophyId[];
       h1Tournaments: TournamentHonor[];
     }
     ```
  2. European seasonal tables and player records for the 2025/26 season can now be safely archived or reset.
  3. Throughout Semester 2 (July–December), contenders accumulate $H_2$ stats in their active profiles.
  4. At the **December Ballon d'Or Gala**, the engine simply blends:
     $$\text{Full Year Goals} = \text{h1Goals} + \text{h2Goals}$$
     $$\text{Full Year Rating} = \frac{(\text{h1Apps} \times \text{h1AvgRating}) + (\text{h2Apps} \times \text{h2AvgRating})}{\text{h1Apps} + \text{h2Apps}}$$
     Plus full recognition of spring trophies (UCL, Premier League) and autumn trophies (Libertadores, Intercontinental Cup, autumn qualifiers).
  5. On December 31, the world awards are finalized and written to the history books, and the temporary $H_1$ vector is deallocated!

#### 3. The 3-Tier AI Stat Pruning Architecture (Memory Footprint < 5.5 MB)
To prevent memory bloat over a 30-year career, player data is strictly segregated into three retention tiers:

| Storage Tier | Target Population | Retention Policy | Stored Data Schema | Memory Footprint (20 Years) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: User Player** | Your Created Legend (1 player) | **Permanent 100% Full-Fidelity Lifetime Archive** | Every season's club, league, matches, goals, assists, yellow/red cards, average rating, trophies won, and individual awards. | $\approx 25\text{ KB}$ |
| **Tier 2: Elite AI Shortlist** | Top 100 Global Superstars (Mbappé, Haaland, Yamal, world stars) | **2-Year Rolling Seasonal Window + Compact Career Vector** | • **Current Active Season:** Full tallies.<br>• **Previous Season (1 year ago):** Full tallies.<br>• **Career Totals (Compact Vector):** 5 flat integers (`careerApps, careerGoals, careerAssists, careerTrophies, ballonDors`). | $\approx 350\text{ KB}$ across all 100 players |
| **Tier 3: The General AI Universe** | $\approx 15,000$ simulated AI players across 37+ leagues | **Current Active Season Only (Previous Seasons Pruned on Rollover)** | Single aggregate row: `{ apps, goals, assists, avgRating }`. At season end, previous season is overwritten. | $\approx 4.8\text{ MB}$ total in RAM! |

#### 4. Instant Transient Match Garbage Collection
* In AI-vs-AI background match simulations, granular event logs (minute-by-minute passes, tackles, dribbles) are **purely transient in stack memory**.
* Once the final whistle blows, only the aggregate counters (`teamA_goals`, `scorer_goals++`, `rating`) increment. The detailed match instance is immediately collected by JavaScript's garbage collector.
* Result: **Lightning-fast season simulations, zero frame drops, and tiny instant-loading profile saves.**

---

### G. Sovereign Country Seasonality Engine: Climates, Seasons & Winter Mechanics (`countrySeasonalitySystem.ts`)

In DrawStar Remake 2.0, seasonality and climate are explicitly grounded at the **Sovereign Country level** (rather than arbitrary league flags). Every nation in the global database defines whether it experiences winter and four distinct seasons:

```ts
interface CountrySeasonalityProfile {
  countryId: string;
  countryName: string;
  hasSeasons: boolean; // Flagged true for temperate/continental nations; false for equatorial/tropical
  hemisphere: 'northern' | 'southern' | 'equatorial_tropical';
  climateType: 'temperate' | 'continental' | 'mediterranean' | 'tropical_equatorial' | 'arid_desert';
  winterMonths: number[]; // Calendar months triggering Winter matchday conditions
  averageWinterTempC: number;
}
```

#### 1. Global Sovereign Climate Classification
* **Northern Hemisphere Seasonal (`hasSeasons: true`):**
  * *Nations:* England, Scotland, Germany, Spain, France, Italy, Netherlands, Belgium, Portugal, Turkey, Croatia, Japan, South Korea, USA (Northern/Midwest).
  * *Winter Months:* November, December, January, February (`winterMonths: [11, 12, 1, 2]`).
* **Southern Hemisphere Seasonal (`hasSeasons: true`):**
  * *Nations:* Argentina, Chile, Uruguay, South Africa, Southern Australia.
  * *Winter Months:* June, July, August (`winterMonths: [6, 7, 8]`).
* **Equatorial & Tropical Nations (`hasSeasons: false`):**
  * *Nations:* Colombia, Brazil (Equatorial/Tropical regions), Nigeria, Ghana, Ivory Coast, Egypt, Morocco, Saudi Arabia, UAE, Qatar.
  * *Climate Dynamic:* **Winter never occurs.** Sub-zero freezing or snow is biologically and geographically impossible. Instead, fixtures alternate between dry heat, high humidity, and intense tropical monsoon cloudbursts.

#### 2. Winter Matchday Gameplay & Physical Impact (When `hasSeasons: true` & Active Winter)
When a match is scheduled in a seasonal country during its active winter window, the simulation and 2D pitch engine automatically activate winter rules:
1. **Weather & Pitch Surface:**
   * High probability of freezing rain, sleet, or heavy snowfall.
   * On snowy pitches, turf turns crisp white with high-visibility red or orange chalk boundary lines.
2. **The High-Visibility Winter Ball:**
   * Automatically replaces the standard ball with the official **Hi-Vis Neon Orange Winter Match Ball**.
3. **Player Stamina & Metabolic Drain:**
   * Freezing temperatures increase overall player physical strain; base sprinting and stamina depletion accelerates by $+10\%$.
4. **Cold Snaps & Muscle Injury Modifier:**
   * Sub-zero pitch conditions tighten muscles and tendons.
   * **Injury Risk Modifier:** $+15\%$ compound risk on pulled hamstrings, groin strains, and calf pulls if pre-match fitness is $< 65\%$ or if stamina drops into exhaustion.
5. **Authentic Winter Cosmetics:**
   * Players automatically don long-sleeved thermal compression undershirts, matchday gloves, and neck warmers.
   * 2D pitch sprites emit subtle, rhythmic pixel puffs of **visible breath vapor** in cold air.

---

### H. Stadium Stand Customization, Matchday Economics & Continental Venue Requirements (`stadiumSystem.ts`)

Every football club in DrawStar Remake 2.0 possesses a fully customizable home ground featuring independent modular stand architecture, realistic ticketing economics, and authentic continental regulatory compliance:

#### 1. Modular Stand Customization Architecture (4 Independent Stands)
Each stadium is engineered with 4 distinct stands (`north`, `south`, `east`, `west` — or *Kop*, *Curva*, *Main Grandstand*, *Lateral*):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MODULAR STADIUM STAND ARCHITECTURE & ECONOMICS                  │
├─────────────────┬──────────────────────┬────────────────────────┬──────────────────────┤
│ Stand Parameter │ Available Options    │ Capacity Range         │ Matchday Impact      │
├─────────────────┼──────────────────────┼────────────────────────┼──────────────────────┤
│ 1. Stand Type & │ • Safe-Standing      │ • Small: 1,500–5,000   │ • Low construction   │
│    Style        │   Terrace (Historic) │ • Medium: 5,000–15,000 │   cost; high fan     │
│                 │ • Traditional Tiered │ • Large: 15,000–30,000 │   vocal atmosphere;  │
│                 │ • Modern Cantilever  │ • Monumental Bowl:     │   lower ticket yield │
│                 │ • Triple-Tier Arena  │   30,000–85,000+ seats │ • Luxury VIP suites  │
│                 │ • Luxury Suite Tower │                        │   yield 5x corporate │
│                 │ • Open-Air Bleachers │                        │   hospitality revenue│
├─────────────────┼──────────────────────┼────────────────────────┼──────────────────────┤
│ 2. Seat Colors  │ • Club Primary Color │ N/A (Visual Aesthetic) │ Custom seat mosaic   │
│    & Mosaics    │ • Secondary Accent   │                        │ spells club name,    │
│                 │ • Checkered Mosaic   │                        │ initials, or year of │
│                 │ • Dual-Tone Stripes  │                        │ foundation (e.g.1899)│
└─────────────────┴──────────────────────┴────────────────────────┴──────────────────────┘
```

* **Capacity & Matchday Revenue Formulation:**
  $$\text{Total Stadium Capacity} = \sum_{\text{Stand} \in \{N, S, E, W\}} \text{Stand.Capacity}$$
  $$\text{Matchday Gate Receipts} = \text{Capacity} \times \text{Attendance \%} \times \text{Base Ticket Price} \times \text{Hospitality Multiplier}$$
  * Monumental arenas (e.g. 75,000+ seats with corporate boxes) yield €3,000,000–€5,000,000 per home match, funding elite player wages and transfer budgets.

#### 2. Continental Competition Venue Requirements & The Stadium Loaning System
Continental confederations enforce strict regulatory venue requirements that stadiums must satisfy to host continental fixtures:
* **UEFA Champions League / Europa League (UEFA Category 4 Standard):**
  * Minimum all-seater capacity: $\ge 8,000$ (Qualifiers/Early rounds) to $\ge 30,000$ (Knockout stages).
  * High-lux LED floodlighting ($\ge 1,400\text{ lux}$), dedicated VAR operational rooms, media press theaters, and modern player tunnel access.
* **CONMEBOL Copa Libertadores / Sudamericana:**
  * Strict capacity minimums: Group stage $\ge 10,000$; Round of 16/QF $\ge 20,000$; Semifinals $\ge 30,000$.
* **CAF & AFC Champions League Elite:**
  * Mandatory international security turnstiles, anti-hooligan segregation fences, and runway clearances.

#### 3. The Non-Compliant Stadium Rule (Ground-Sharing & Stadium Loaning)
If an ambitious underdog or lower-tier club qualifies for a continental competition (e.g., winning a domestic cup or earning a surprise top-4 league finish) but their home stadium **fails to meet mandatory continental requirements**:
1. **Home Ground Ineligibility:**
   * The club **is strictly barred from hosting continental matches at their historic home ground**.
2. **Mandatory Stadium Loan / Ground-Sharing:**
   * The club automatically **loans a compliant stadium from a nearby team or regional metropolitan arena** (e.g., Union Berlin playing Champions League fixtures at Berlin's Olympiastadion; Atalanta ground-sharing at Sassuolo's Mapei Stadium or Milan's San Siro; Shakhtar Donetsk playing European matches in Warsaw or Hamburg; provincial South American clubs renting municipal capitals).
3. **Matchday Financial & Atmospheric Dynamics:**
   * **Stadium Rental Fee:** The club pays a flat per-match lease fee (e.g. €75,000–€250,000) to the host venue.
   * **Capacity Surge:** The club unlocks the massive seating capacity of the loaned arena, resulting in historic gate receipt windfalls from tens of thousands of traveling and local supporters!

---

## 20. DYNAMIC NEWS SYSTEM, DYNASTY CELEBRATIONS & THE CINEMATIC ENGINE

### A. Hierarchical News Media Engine
* **Local Newspapers (32-Bit Pixel Print):** Lower-division matches, grassroots youth league breakthroughs, and academy graduations.
* **National Sports Dailies (Tabloid & Broadsheet Spreads):** Top-flight domestic matches, derby controversies, and national cup triumphs.
* **Global Digital Outlets (High-Impact Broadcast Feeds):** Mega-transfers, Champions League knockouts, World Cup tournaments, and Ballon d'Or galas.
* **The Career Retirement Broadsheet (`careerEpitaphSystem.ts`):** Historic front-page final edition displaying the player's crowning **Ranked Epitaph Title** (e.g., *"The Greatest Player in the History of Madrid White"*, Section 12), career trophy cabinet contributions, and Hall of Fame induction verdict.

### B. Post-Final Media Headline Ranking System & Dynasty Stages

When any championship final concludes (Domestic Cup Final, Continental UCL Final, World Cup Final, FIFA Club World Cup Final), the match simulation logs every dramatic event and resolves the front-page news broadcast through the **Post-Final Narrative Priority Hierarchy**. The engine selects the single most dramatic match event to lead the global press:

#### 1. The Post-Final Headline Priority Ladder
| Priority | Match Narrative Scenario | Trigger Condition | Example Generated Front-Page Headline |
| :---: | :--- | :--- | :--- |
| **Priority 1** | **The Hat-Trick Hero / Divine Treble** | Player scores 3+ goals in the final. | *"THE UNSTOPPABLE GOD: [Player] Shatters Final with Historic Hat-Trick to Crown [Club/Nation] Champions!"* |
| **Priority 2** | **The Miraculous Comeback / Remontada** | Trailing into the 80th+ minute, team scores equalizer and late winner in regulation or stoppage time. | *"THE MIRACLE OF [CITY]: Unbelievable 89th-Minute Turnaround Seals Legendary Comeback Title!"* |
| **Priority 3** | **The Sudden-Death Shootout Heroics** | Match decided on penalties where player scores decisive sudden-death penalty, or goalkeeper saves 2+ penalties. | *"ICE-COLD IMMORTALITY: [Player] Bags Championship on Nerve-Shredding Penalty Shootout Drama!"* |
| **Priority 4** | **The Clutch Brace / Finals MVP** | Player scores 2 goals or records a 9.2+ match rating in a tightly contested final. | *"THE CROWN JEWEL: [Player] Dominates the Big Stage with Masterclass Double to Lift the Cup!"* |
| **Priority 5** | **The Steel Fortress Shutout** | Defensive masterclass: 1-0 or 0-0 victory with 8+ clearances, 5+ tackles, and 0 goals conceded. | *"THE IMPENETRABLE WALL: Tactical Masterclass and Iron Curtain Defense Nullifies Opponent in Gritty Final Triumph!"* |
| **Priority 6** | **The Total Demolition / Blowout** | Victory by 3 or more goals ($\ge 3$ goal margin). | *"A WALK IN THE PARK: [Club/Nation] Decimates Rivals in Uncontested Finals Rout!"* |
| **Priority 7** | **Bitter Agony at the Death** | Losing team conceded the deciding goal in the 88th+ minute or stoppage time. | *"CRUEL AGONY AT THE WIRE: Heartbreaking 92nd-Minute Strike Denies [Club/Nation] in Closing Seconds!"* |

#### 2. Dynasty Coronation Fullscreen Stages
* **Maiden Glory:** First-ever trophy in a club's history.
* **Bicampeón (Back-to-Back):** Two consecutive titles.
* **Tricampeón (Three-Peat):** Historic three consecutive titles.
* **Tetracampeón / Absolute Kings:** 4+ consecutive titles.
* **Star of the Final:** MVP award ceremony for 9.0+ match ratings in decisive finals.

---

### C. The Cinematic Engine vs. The Event Engine (`cinematicSystem.ts` vs. `eventSystem.ts`)

A central architectural pillar of DrawStar Remake 2.0 is the strict separation between **interactive decision dilemmas ("Events")** and **high-production spectacle showcases ("Cinematics")**:

```
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│        THE EVENT SYSTEM (`eventSystem.ts`)   │  │    THE CINEMATIC ENGINE (`cinematicSystem.ts`)│
├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
│ • Interactive decision dilemmas.             │  │ • Monumental landmark spectacle showcase.    │
│ • Branching player choices & dialogue trees. │  │ • A momentous football milestone is happening│
│ • Risk/Reward rolls & attribute tests.       │  │   and the player experiences it in rich      │
│ • Mutates Bad Rep, Cash, Morale, Chemistry.  │  │   narrative detail (illustrations, text, SFX)│
│ • Examples: Backroom bribe, Locker room feud,│  │ • Non-branching / cinematic pacing; future   │
│   Street cage brawl, Agent contract dispute. │  │   high-resolution video cutscene readiness.  │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

#### 1. The 5 Canonical Cinematic Showcases

##### 1. Tournament Draws (`cinematic_tournament_draw`)
* **UEFA Champions League 36-Team Swiss Draw:** Fullscreen presentation of the 4 seeded pots, automated fixture software drawing balls, and dynamic fixture reveal displaying your 8 marquee league phase opponents.
* **FIFA World Cup Group Stage Draw:** High-tension broadcast studio stage with football legends unsealing seeded pot balls, assigning teams into Groups A–L, and highlighting the dramatic "Group of Death".

##### 2. The Yearly World Awards Gala (`cinematic_yearly_awards_gala`)
* **Red Carpet Arrival & Gala Stage:** Black-tie ballroom atmosphere with flashing cameras, orchestra accompaniment, and spotlight countdown.
* **The Envelope Unveiling:** The presenter unseals the official golden envelope, announcing the Ballon d'Or / World Best Player recipient.
* **The Trophy Lift & Speech:** Fullscreen 32-bit illustration of your player holding the gleaming golden sphere before a standing ovation of world managers and legends.

##### 3. First Professional Contract Signing (`cinematic_first_pro_contract`)
* **Act I: The Boardroom Pen-to-Paper:** Sitting at a polished mahogany desk in the official club boardroom flanked by your agent and club president. A fountain pen is placed in your hand above the federation registration papers. Dynamic prompt allows the player to physically sign or tap to sign.
* **Act II: The Scarf & Kit Presentation:** Standing before flashing press cameras, holding the club scarf aloft above your head beside the president, holding up your new senior squad number. Blinding camera flashes wash across the 32-bit pixel artwork.
* **Act III: Family Emotion & Senior Registration:** Proud family members wipe tears in the back row of the press room; your childhood boyhood memories flash on screen for 2 seconds. The screen displays: *"OFFICIALLY REGISTERED AS A PROFESSIONAL FOOTBALLER"*. Unlocks your weekly wage salary, unlocks the Professional Career Menu HUD, and transitions you from Academy prospect to Senior squad member.

##### 4. First Senior Professional Pitch Debut (`cinematic_first_senior_debut`)
* **Act I: The Roaring Tunnel:** Standing in the narrow concrete tunnel beside towering veteran pros. Stadium floodlights blazing through the exit arch; 40,000 roaring voices shaking the concrete tunnel walls. Heartbeat SFX thumps in rhythmic bass.
* **Act II: The Substitution Board:** The manager slaps you on the back with final tactical words: *"Show the world what you're made of."* The fourth official raises the electronic board with your squad number glowing in neon green.
* **Act III: Crossing the Chalk Line:** Fullscreen slow-motion 32-bit sequence touching the grass, making a sign of focus, and crossing the white chalk line into the professional arena for the very first time. Crowd roar surges to maximum volume; stadium announcer bellows your name over the loudspeakers. Unlocks your first senior appearance stats and kicks off your professional legacy.

##### 5. Superclub Mega-Signing & Stadium Unveiling (`cinematic_mega_club_unveiling`)
* **Boardroom Contract Execution:** Flanked by the club president and sporting director, penning a blockbuster 5-year contract before a barrage of press flashbulbs.
* **Stadium Presentation:** Walking down the tunnel out onto the pitch before 80,000 roaring fans, holding up the club kit with your squad number, juggling the ball, and kissing the crest before the fans.

##### 6. Championship Trophy Coronation & Bus Parades (`cinematic_championship_parade`)
* **Podium Trophy Lift:** Podium pyrotechnics, sparkling golden confetti blasts, and team captain lifting the Champions League or World Cup trophy surrounded by euphoric teammates.
* **City Open-Top Bus Parade:** Double-decker open-top bus parade rolling through smoke-filled city boulevards lined with hundreds of thousands of singing supporters waving flags and flares.

##### 7. Generational Milestones & Heritage Chronicles (`cinematic_milestone_chronicle`)
* **All-Time Goalscoring Record:** Match pauses for a standing ovation, presentation of a golden commemorative match ball, and congratulatory video tributes.
* **Adolescent Physical Awakening:** Cinematic sequences at ages 14 and 16 visualizing sudden physical growth spurts, muscle mass consolidation, and unlocked dormant physical traits.
* **Testimonial Farewell Lap of Honor:** Teammates forming a guard of honor, emotional farewell speech, and children wearing your commemorative shirt.

#### 2. Media Presentation Architecture & Video Cutscene Readiness
* **32-Bit Pixel Illustrations:** Hand-crafted, atmospheric 32-bit retro pixel backdrops calibrated for all 3 graphic quality presets (Performance, Balanced, High Quality).
* **Rich Narrative Prose & Localized Broadcast Audio:** Elaborate descriptions translated across all 5 synchronized language packets (`es_ES`, `es_AR`, `en_GB`, `pt_BR`, `fr_FR`) accompanied by procedural retro synth stingers, camera pans, and authentic crowd chants.
* **Future Video Integration Layer:** Built with dedicated HTML5 `<video>` / canvas stream container slots (`CinematicMediaStage`), allowing high-definition pre-rendered cutscene video files or animation reels to plug into the pipeline in future versions without rewriting game logic.

---

### D. The High-Impact "Phone Call" Interactive Event Engine (`phoneCallSystem.ts`)

A signature narrative innovation of DrawStar Remake 2.0 is the **"Phone Call" Event Type**. Unlike passive popups, a Phone Call is a dramatic audio-visual event that pauses the simulation with an authentic vibrating retro smartphone / flip phone graphic on screen, accompanied by an urgent ringing chiptune ringtone.

```
       ┌──────────────────────────────────────────────────┐
       │   [ 📳 INCOMING ENCRYPTED SATELLITE CALL... ]    │
       │                                                  │
       │        📞  +34 91 398 43 00 (MADRID, SPAIN)      │
       │        "Real Madrid Sporting Directorate"        │
       │                                                  │
       │        [ 🟢 SLIDE TO ANSWER ]    [ 🔴 REJECT ]   │
       └──────────────────────────────────────────────────┘
```

#### The 5 Canonical Phone Call Triggers
Phone calls are strictly reserved for seismic, career-defining moments:

1. **The Mega-Club Suitor Call:**
   * **Trigger:** When a giant club boasting a higher Heritage Prestige Tier than your current employer (e.g., Real Madrid, Manchester City, Bayern Munich, Barcelona) submits a formal transfer inquiry.
   * **Experience:** The legendary manager or sporting director calls you directly into your headset:
     $$\text{"We've been watching you dominate the league. The white shirt is waiting for you. Are you ready for Madrid?"}$$
   * **Player Choices:**
     * *[Accept Transfer Pitch]:* Signals strong intent, granting agent negotiation leverage and accelerating the transfer deadline.
     * *[Pledge Loyalty to Current Club]:* Politely declines, boosting Current Club Chemistry (+25%) and Fan Admiration (+30%).
2. **The Maiden Senior National Team Call-Up (One-Time Emotional Trigger):**
   * **Trigger:** The **very first time** in your career that your nation's senior national team manager calls you up to the senior squad (e.g. at age 17 or 18 after stellar club form).
   * **Critical Frequency Rule:** Fires **only once** in your entire career to preserve goosebumps. Routine future qualifying call-ups appear silently in the calendar.
   * **Experience:** The national coach calls you late in the evening:
     $$\text{"Son, I'm releasing the squad list tomorrow morning. Pack your bags. You're putting on the national shirt."}$$
   * **Effect:** Unlocks +20 National Icon Points, permanent emotional milestone badge on Player Card, and pride dialogue with family.
3. **The Generational Arabian / Crazy Money Offer:**
   * **Trigger:** When an elite Saudi Pro League club or multi-billionaire Gulf consortium submits a colossal financial buyout during a transfer window.
   * **Experience:** An international intermediary calls with life-altering figures:
     $$\text{"We have an offer on the table: €85,000,000 net per season, private villa, royal diplomatic protection, and equity perks. Will you take the flight?"}$$
   * **Player Choices:**
     * *[Take the Generational Bag]:* Instant massive cash injection, luxury lifestyle assets, but $-15$ European Continental Prestige and $-10$ National Team selection probability.
     * *[Reject for European Glory]:* Preserves European sporting ambition, boosting Continental Icon points and Ballon d'Or voter respect.
4. **The Boyhood Club "Come Back Home" Call (Age 31+):**
   * **Trigger:** From your designated **Home Club** (Section 4.D) when reaching veteran status.
   * **Experience:** The club president or childhood hero sporting director calls you:
     $$\text{"You've conquered the world, but your home will always be here. Come back and retire where it all began."}$$
   * **Player Choices:**
     * *[Return to Boyhood Club]:* Sets up the emotional homecoming transfer, captaincy, and fan festival.
     * *[Decline / Continue Abroad]:* Focuses on final elite European campaigns.
5. **The Homesick Family Call ("Please Come Back to Us"):**
   * **Trigger:** 5% annual probability rolled if playing in a league outside your primary nationality (Section 4.D.5).
   * **Experience:** Incoming personal call from your family:
     $$\text{"We miss you so much. It's too hard being so far away. Can you speak with your agent about coming back to play at home?"}$$
   * **Player Choices:**
     * *[Request Transfer / Loan to Boyhood Club]:* Agent negotiates with current club for a loan, permanent transfer, or mutual release.
     * *[Emergency Family Visit Flight]:* Immediate round-trip flight home; incurs continental distance stamina penalty (-5% to -20% based on geographic distance matrix).
     * *[Stay Focused on Overseas Career]:* Preserves 100% physical fitness; small short-term morale dip.

---

## 21. CULTURAL CARDS SYSTEM (SEASON BREAK EVENTS & NATIONAL DECKS)

Cultural Cards are **exclusive, non-pack progression cards** that organically emerge from the cultural life, traditions, weather, cuisine, and national events of the country you play in (`culturalCardsSystem.ts`):

```
                        [SEASON BREAK SIMULATION TICK]
                                       │
                  ┌────────────────────┴────────────────────┐
           Pre-Season (July)                      Winter Break (Dec/Jan)
            (10% Probability)                        (10% Probability)
                  └────────────────────┬────────────────────┘
                                       ▼
                       [TRIGGER CULTURAL EVENT DIALOGUE]
                                       │
                      • Game simulation pauses
                      • Country detected (Club nation or Free Agent origin)
                      • Fullscreen 32-bit Envelope/Card Draw Stage
                      • Apply Effects: Stats, Money, Weight, Chemistry, etc.
```

### A. Core Acquisition & Scoping Rules
* **No Store Packs:** Cultural Cards **never** appear in store packs or card collection gachas.
* **Random Event Triggers:**
  * **10% Chance** during the annual **Pre-Season window** (July/August).
  * **10% Chance** during the annual **Mid-Season / Winter Break** (December/January).
* **Strict Geographic Scoping:**
  * You can **only draw Cultural Cards from the country of the club you are currently contracted to**!
  * If you are a **Free Agent**, cultural cards are drawn from your **Starting City's Country of Origin**.
* **Simulation Interruption:** When the 10% roll succeeds, the simulation automatically pauses and presents the **Cultural Discovery Fullscreen Stage**, complete with the country's authentic retro soundtrack, animated card revelation, and decision choices.

---

### B. Mathematical Deck Structure per Country (12 Card Concepts per Nation)
Every nation with a domestic league possesses a complete, culturally themed deck of **12 distinct card archetypes**:

| Card Classification | Count | Available Tiers | Typical In-Game Effects |
| :--- | :--- | :--- | :--- |
| **Positive Cards** | 4 | Bronze, Silver, Gold | Permanent or seasonal stat boosts, conditioning recovery, endorsement cash, fan admiration, locker room morale. |
| **Negative Cards** | 2 | Bronze, Silver, Gold, Platinum, Diamond *(No Disaster)* | Local media scrutiny, cultural misunderstandings, fatigue from local weather extremes, administrative fines, temporary stat debuffs. |
| **Double-Edged Cards** | 2 | Bronze, Silver, Gold, Platinum, Diamond | High risk / high reward tradeoffs (e.g. huge boost to Flair and Fame at the expense of Stamina, Weight, and Manager Trust). |
| **Iconic Card** | 1 | Iconic Rarity (Unique) | Transcendent cultural archetype or legendary national tradition providing powerful unique traits. |
| **Disaster Card** | 1 | Disaster Rarity (Catastrophic) | Devastating cultural calamity or scandalous public controversy that derails form, finances, or squad harmony. |
| **Legendary Cards** | 2 | Legendary Rarity (Mythic) | Historic national blessings, national holiday bonanzas, or once-in-a-career cultural windfalls. |

---

### C. The Multi-Vector Effect System
Cultural cards affect far more than raw attributes:
* **Attribute Modifiers:** Permanent attribute gains or multi-month temporary forms (+Pace, +Dribbling, +Finishing, +Vision, +Strength, +Composure).
* **Biometric Evolution:**
  * *Weight ($\pm 1$ to $3$ kg):* Heavy traditional gastronomy feasts increase weight and strength but shave acceleration; high-altitude endurance training burns fat.
  * *Height ($+1$ to $2$ cm):* Youth development genetic growth spurts triggered by nutritious regional diets.
* **Club & Squad Dynamics:**
  * *Locker Room Chemistry ($\pm 5\%$ to $30\%$):* Bonding over traditional barbecues and team rituals increases chemistry; cultural friction damages trust.
  * *Manager Satisfaction:* Professional discipline vs. partying and lifestyle choices.
* **Financial Life:** Traditional festival gifts, unexpected tax audits, municipal honors, endorsement windfalls.
* **Physical Condition:** Instant 100% fitness restore, immunity to illness, or multi-week hangover/fatigue debuffs.
* **Bad Reputation:** Cultural controversies, fan adulation, or local terrace friction.

---

### D. Representative National Cultural Decks (23 Leagues / Nations)

#### 1. Spain 🇪🇸
* **Positive (4):** *Siesta Sagrada* (+25% weekly recovery, +3 Composure), *Tapas con la Plantilla* (+15% Team Chemistry), *Campus de la Roja* (+2 Short Pass, +2 Vision), *Dieta Mediterránea* (+1 Stamina, -1 kg Weight).
* **Negative (2):** *Ola de Calor Ibérica* (-4 Stamina for 2 months), *Trámites Burocráticos* (-€15,000 legal fees, -5 Focus).
* **Double-Edged (2):** *Fiesta de San Fermín* (+4 Reactions & Aggression, 20% slight injury risk), *Noche de Chiringuito* (+10 Fame, +5 Flair, -10 Fitness).
* **Iconic (1):** *El Toque Eterno:* Permanent +3 Ball Control, +3 Composure, grants the *Tiki-Taka Conductor* trait.
* **Disaster (1):** *Escándalo de Hacienda:* Surprise tax audit! Loses 35% of total bank savings and receives +1 Bad Rep tier.
* **Legendary (2):** *Regalo de los Reyes Magos* (Choose €50,000 cash or +100 Stat Break points), *Milagro del Camino de Santiago* (Heals all lingering minor injuries, sets Fitness to 100%).

#### 2. England 🏴󠁧󠁢󠁥󠁮󠁧󠁿
* **Positive (4):** *Sunday Roast Feast* (+2 Strength, +1 kg), *Tea Time Composure* (+3 Composure, +2 Positioning), *Grassroots Pitch Grit* (+2 Tackling, +2 Stamina), *Boxing Day Surge* (+4 Key Match Rating for December).
* **Negative (2):** *London Underground Strike* (Late to training fine -€5,000, -5 Manager Trust), *Persistent English Drizzle* (-3 Mood, -2 Acceleration for 1 month).
* **Double-Edged (2):** *Glastonbury Festival Mud* (+20 Fame, -15 Fitness for 2 matches), *Pub Dart Tournament* (+10 Team Chemistry, +2 kg Weight).
* **Iconic (1):** *Cold Rainy Night in Stoke:* Permanent +4 Physicality & Bravery in adverse weather; immune to wet pitch debuffs.
* **Disaster (1):** *Tabloid Front-Page Sting:* Paparazzi scandal causes -30 Fan Reputation and 3-match manager benching.
* **Legendary (2):** *Knight of the Realm Honor* (+50 Fame, permanent +10% wage bonus), *FA Cup Giant-Killing Spirit* (+5 Finishing & Composure against Top 4 clubs).

#### 3. Brazil 🇧🇷
* **Positive (4):** *Futevôlei na Praia* (+3 Agility, +2 Ball Control), *Churrasco dos Crias* (+20% Team Chemistry), *Açaí Power Surge* (+3 Stamina, +1 Acceleration), *Roda de Samba da Vitória* (+15 Morale).
* **Negative (2):** *Trânsito na Marginal* (Missed tactical meeting, -10 Manager Trust), *Calor Tropical Asfixiante* (-4 Fitness).
* **Double-Edged (2):** *Carnaval do Rio:* +5 Dribbling & Flair, +30 Fame, but -20 Stamina and -2 kg Weight. *Pelada de Várzea:* +3 Street Trickery, 25% injury risk.
* **Iconic (1):** *Ginga Ancestral:* Permanent +5 Dribbling, +4 Flair, unlock *Samba Stepover* pitch animation.
* **Disaster (1):** *Resenha Desenfreada:* Late-night partying caught on social media! -40 Manager Trust, 2-week salary fine.
* **Legendary (2):** *Bênção do Maracanã* (Instant +100 Stat Break points & Golden Boot aura), *Herdeiro do Rei* (+5 Finishing, +5 Composure).

#### 4. Argentina 🇦🇷
* **Positive (4):** *Ronda de Mate Matutino* (+2 Focus, +2 Stamina), *Asado de Concentración* (+20% Team Chemistry, +1 Strength), *Potrero Indomable* (+3 Dribbling, +2 Agility), *Picado en el Barrio* (+2 Composure).
* **Negative (2):** *Corte de Calle Piquete* (Delayed travel, -5 Match Energy), *Viento Pampero Helado* (-3 Sprint Speed for 2 weeks).
* **Double-Edged (2):** *Locura de Superclásico:* +5 Aggression & Tackling, but +35% yellow card probability for 3 matches. *Noche de Boliche:* +10 Fame, -10 Fitness.
* **Iconic (1):** *La Gambeta de Villa Fiorito:* Permanent +5 Balance, +4 Dribbling in congested penalty boxes.
* **Disaster (1):** *Crisis Cambiaria & Corralito:* Inflation wipes 30% of domestic currency savings.
* **Legendary (2):** *Mística de la Scaloneta* (Permanent +15% performance in national team & cup finals), *Mano de Dios* (+4 Clutch Finishing in 85th+ minute).

#### 5. Germany 🇩🇪
* **Positive (4):** *Deutsche Gründlichkeit* (+3 Tactical Positioning, +2 Interceptions), *Winterpause Erholung* (Full Fitness restore), *Waldlauf Ausdauer* (+3 Stamina), *Brezel & Bratwurst Fest* (+1 Strength).
* **Negative (2):** *Verspätung der Bahn* (-€5,000 fine for late arrival), *Grauer Winterblues* (-2 Reactions for 3 weeks).
* **Double-Edged (2):** *Oktoberfest Feier:* +25% Team Chemistry, but +2 kg Weight and -15 Stamina for 1 match. *Autobahn Speed Test:* +2 Acceleration, 15% traffic fine risk.
* **Iconic (1):** *Titanischer Siegeswille:* Permanent +4 Mentality, +4 Composure when trailing in the 80th+ minute.
* **Disaster (1):** *Trainingslager Zerwürfnis:* Physical brawl at winter training camp! -40 Team Chemistry and -20 Manager Trust.
* **Legendary (2):** *Wunder von Bern Geist* (Permanent +5 Stamina & +5 Clutch Mentality in international knockout matches), *Goldene Meisterfeier* (+€100,000 bonus & 100 Stat Break points).

#### 6. Italy 🇮🇹
* **Positive (4):** *Pranzo della Nonna* (+2 Strength, +1 kg, +3 Composure), *Espresso Doppio Ristretto* (+2 Reactions, +2 Acceleration), *Lezione di Tattica Catenaccio* (+3 Marking, +3 Tackling), *Passeggiata Pomeridiana* (+2 Recovery).
* **Negative (2):** *Traffico della Tangenziale* (-5 Match Energy), *Polemica dei Giornali* (-10 Fan Morale).
* **Double-Edged (2):** *Milano Fashion Week:* +30 Fame, +10 Style, but -€50,000 cash and -5 Training Focus. *Calcio Storico Grit:* +3 Strength, +10% injury risk.
* **Iconic (1):** *L'Arte della Difesa:* Permanent +4 Interceptions, +4 Standing Tackle, grants the *Maestro Difensivo* trait.
* **Disaster (1):** *Calcioscommesse Suspicion:* Wrongfully questioned in betting inquiry; 1-month media lockdown and -20 Rep.
* **Legendary (2):** *Notti Magiche 1990* (+10 Finishing in summer tournaments), *Cena dei Campioni* (+100 Stat Break points & 200% Chemistry).

#### 7. France 🇫🇷
* **Positive (4):** *Haute Cuisine Énergétique* (+2 Stamina, +1 Agility), *Café de Paris Causerie* (+2 Composure, +2 Vision), *Tour de France Résistance* (+3 Aerobic Endurance), *Génération Clairefontaine* (+2 Ball Control).
* **Negative (2):** *Grève des Transports* (Match postponed, -10 Match Sharpness), *Pluie Parisienne* (-2 Sprint Speed).
* **Double-Edged (2):** *Soirée sur les Champs-Élysées:* +25 Fame, -15 Fitness. *Mode Avant-Garde:* +15 Brand Value, -€40,000.
* **Iconic (1):** *Roulette de Marseille:* Permanent +4 Agility, +3 Dribbling, unlocks signature 360 spin.
* **Disaster (1):** *Mutinerie de Bus (Knysna Echo):* Locker room rebellion against manager! Squad chemistry resets to 0%.
* **Legendary (2):** *Légion d'Honneur Sportive* (+50 Fame, permanent +15% sponsor income), *L'Étoile Tricolore* (+5 Clutch Rating in World Finals).

#### 8. Japan 🇯🇵
* **Positive (4):** *Onsen Hot Springs Soak* (Instant 100% Fitness, cures minor fatigue), *Zen Temple Meditation* (+4 Composure, +3 Focus), *Kaizen Training Discipline* (+10% monthly stat growth), *Bento Box Precision* (+2 Lean Fitness).
* **Negative (2):** *Typhoon Match Delay* (-5 Match Sharpness), *Polite Hesitation* (-2 Aggression in 50/50 duels).
* **Double-Edged (2):** *Karaoke All-Night Marathon:* +20 Team Chemistry, but -15 Stamina next morning. *Shibuya Neon Distraction:* +15 Fame, -5 Tactical Focus.
* **Iconic (1):** *Bushido Spirit:* Permanent +4 Work Rate, +4 Tenacity; never slows down when stamina drops below 30%.
* **Disaster (1):** *Social Media Bow of Apology:* Minor public etiquette blunder creates viral storm; -30 Fan Reputation and public apology conference.
* **Legendary (2):** *Sakura Bloom Blessing* (+100 Stat Break points & full mental peace), *Capitán Tsubasa Drive* (+5 Long Shots & Curve).

#### 9. Mexico 🇲🇽
* **Positive (4):** *Taquería de la Esquina* (+2 Strength, +1 Morale), *Fuerzas Básicas del Desierto* (+2 Stamina, +2 Pace), *Lucha Libre Agility* (+3 Balance, +2 Jumping), *Música de Mariachi Festiva* (+15 Team Chemistry).
* **Negative (2):** *Montezuma's Revenge Stomach Bug* (-5 Stamina for 10 days), *Contaminación en el Valle* (-2 Breathing Endurance).
* **Double-Edged (2):** *Boda de Pueblo de Tres Días:* +30 Morale, +20 Chemistry, but +2 kg Weight and -20 Fitness. *Fútbol de Llano Barrial:* +3 Bravery, 20% injury risk.
* **Iconic (1):** *El Cañonazo Azteca:* Permanent +4 Shot Power, +3 Volleys at high altitude.
* **Disaster (1):** *Escándalo de Clembuterol:* Accidental food contamination triggers false drug-test suspension for 1 month!
* **Legendary (2):** *Bendición del Día de Muertos* (+5 Clutch Composure, guardian ancestor aura), *Grito de Campeón* (+€75,000 and 100 Stat Break points).

#### 10. Colombia 🇨🇴
* **Positive (4):** *Café de Origen del Eje* (+3 Stamina, +2 Reactions), *Bandeja Paisa Fuerza* (+3 Physical Strength, +1 kg), *Feria de las Flores* (+15 Morale), *Cumbia de Concentración* (+20% Team Chemistry).
* **Negative (2):** *Lluvia Torrencial Tropical* (Pitch waterlogged, -3 Short Passing for 2 weeks), *Vuelo Retrasado en el Dorado* (-5 Match Energy).
* **Double-Edged (2):** *Parranda Vallenata:* +25 Morale, +15 Fame, but -20 Fitness. *Fútbol Callejero en la Comuna:* +4 Dribbling, 20% slight injury risk.
* **Iconic (1):** *El Toque Sabrosón:* Permanent +4 Dribbling, +4 Short Pass rhythm.
* **Disaster (1):** *Rifirrafe en la Chiva Rumbera:* Public argument with security caught on tape; -€25,000 fine and -15 Manager Trust.
* **Legendary (2):** *El Escorpión Legendario* (+5 Flair & Acrobatics), *Cafetero de Oro* (+€80,000 & 100 Stat Break points).

#### 11. Saudi Arabia 🇸🇦
* **Positive (4):** *Desert Falconry Focus* (+3 Vision, +3 Composure), *Dates & Gahwa Energy* (+2 Stamina, +1 Recovery Point), *Ramadan Midnight Energy* (+15 Fan Love, +2 Night Match Rating), *Luxury Oasis Recovery* (Full fitness restore).
* **Negative (2):** *Sandstorm Shamal* (-3 Vision for 1 matchday), *Summer Heatwave (48°C)* (-4 Stamina for 1 month).
* **Double-Edged (2):** *Royal Banquet Invitation:* +€50,000 royal gift, +20 Fame, but -10 Training Discipline. *Dune Bashing Weekend:* +5 Bravery, 15% muscle strain risk.
* **Iconic (1):** *The Desert Falcon:* Permanent +4 Acceleration, +3 Composure in extreme heat.
* **Disaster (1):** *Ferrari Desert Breakdown:* Late for team charter flight; -€30,000 club fine and benched for 1 match.
* **Legendary (2):** *Royal Patron's Favor* (+€500,000 cash grant & Gold card pack), *Green Falcons Pride* (+5 National Team OVR).

#### 12. Nigeria 🇳🇬
* **Positive (4):** *Jollof Rice Pride* (+3 Strength, +15 Morale), *Street Hustle Agility* (+3 Acceleration, +2 Dribbling), *Afrobeats Locker Room Groove* (+25% Team Chemistry), *Cassava Energy Meal* (+2 Stamina).
* **Negative (2):** *Lagos Traffic Gridlock (Go-Slow)* (Missed warm-up, -5 First-Half Sharpness), *Harmattan Dust Haze* (-3 Breathing Stamina for 2 weeks).
* **Double-Edged (2):** *Owambe Saturday Wedding:* +30 Fame, +15 Chemistry, but -20 Fitness and -€10,000 gifts. *Naija Street Football:* +4 Raw Pace, 20% knock risk.
* **Iconic (1):** *Super Eagle Flight:* Permanent +4 Jumping, +3 Heading, +3 Sprint Speed.
* **Disaster (1):** *Disputed Youth Bonus Feud:* Argument with local academy scouts over transfer kickback; -20 Rep and media distraction.
* **Legendary (2):** *Spirit of Atlanta 1996* (Permanent +5 Clutch Comeback boost against European giants), *Naija Boy of Destiny* (+100 Stat Break points & €100,000 bonus).

#### 13. Australia 🇦🇺
* **Positive (4):** *Morning Surf Session* (+3 Balance, +2 Core Strength), *Backyard Barbie Feast* (+20% Team Chemistry, +1 Strength), *Outback Resilience Run* (+3 Aerobic Stamina), *Vegemite Toast Ritual* (+1 Energy).
* **Negative (2):** *Magpie Swooping Season* (-3 Focus during outdoor training), *Red-Eye Transcontinental Flight* (-5 Match Energy across timezones).
* **Double-Edged (2):** *Aussie Rules Football Cross-Training:* +4 Aerial Reach & Shoulder Strength, but -3 Fine Dribbling touch for 2 weeks. *Bondi Beach Party:* +20 Fame, -15 Fitness.
* **Iconic (1):** *The Boomerang Curler:* Permanent +4 Crossing, +3 Curve on set pieces.
* **Disaster (1):** *Outback Jet Ski Mishap:* Bruised ribs while water skiing on weekend off; 3-week injury setback!
* **Legendary (2):** *Socceroos Golden Era Spirit* (+5 Never-Say-Die Fighting Spirit in World Cup qualifiers), *Melbourne Cup Miracle* (+€100,000 betting windfall & 100 Stat Break points).

#### 14. United States 🇺🇸
* **Positive (4):** *Tailgate BBQ Party* (+20% Team Chemistry, +1 Strength), *High-Tech Biometrics Lab* (+2 Sprint Speed, +1 Recovery Point), *College Draft Work Ethic* (+3 Work Rate), *American Protein Shake* (+2 Muscle Mass).
* **Negative (2):** *Cross-Country 5-Hour Timezone Jetlag* (-4 Reactions for away games), *Suburban Sprawl Commute* (-5 Energy).
* **Double-Edged (2):** *Hollywood Red Carpet Appearance:* +40 Global Fame, +€30,000 sponsor deal, but -15 Manager Trust and media gossip. *Black Friday Super-Sale:* +Equipment upgrade, -€20,000 cash.
* **Iconic (1):** *Clutch Super Sunday Mentality:* Permanent +4 Composure in playoff shootouts and cup finals.
* **Disaster (1):** *Franchise Relocation Drama:* Club ownership threatens to move city; stadium protests cause -30 Squad Chemistry and 1-month unrest.
* **Legendary (2):** *American Dream Breakthrough* (+€250,000 commercial endorsement deal & 100 Stat Break points), *Hall of Fame Inductee Blessing* (+5 All Attributes in Championship Final).

*(Full decks for Netherlands, Belgium, Scotland, Turkey, Croatia, Uruguay, Chile, South Korea, Egypt, Morocco, and Portugal are integrated into `culturalCardsSystem.ts` following identical 12-card matrices).*

---

## 22. EDITOR DEEP-LINK CONTINUITY ARCHITECTURE

### The Problem in Legacy 1.0
In legacy DrawStar, navigating to Team Editor $\rightarrow$ Roster $\rightarrow$ "Edit Player" opened a restricted sub-modal (`TeamPlayerEditorModal.tsx`) with basic form fields. It lacked the visual 32-bit player card, visual hair/skin customizer, badges, dynamic OVR calculation, and flip card inspection available in the main menu's Player Editor (`PlayerEditorAllCardsPanel.tsx` / `CustomizationModal.tsx`).

### The 2.0 Fullscreen Deep-Link Pattern
1. **Unified Screen Route (`VIEW_PLAYER_EDITOR`):**
   * The Player Editor is a single, first-class fullscreen view that accepts an optional `context` payload:
     ```ts
     interface PlayerEditorContext {
       origin: 'main_menu' | 'team_roster' | 'career_dressing_room';
       teamId?: string;
       slotNumber?: number;
       squadGroup?: 'starters' | 'subs' | 'reserves';
       player: PlayerCardData;
       onSave: (updated: PlayerCardData) => void;
     }
     ```
2. **Seamless Navigation & Return Stack:**
   * When the user clicks **[Edit Player]** in the Team Editor Squad section, the router pushes `VIEW_PLAYER_EDITOR` onto the stack with the target player's card data and an `onSave` callback.
   * The user enters the full Player Editor with interactive 32-bit Card View, card flipping, biometrics, kit preview, position tuning, and stat progression breakdown.
   * When the user presses **[Save & Return]** or gamepad `[O] Back`:
     * The updated player is saved directly into `EditorTeamData.squadSaveFile[squadGroup][slotNumber]`.
     * The router pops back to `VIEW_TEAM_EDITOR`, instantly re-rendering the squad list with the updated player's sprite, OVR, name, and position.

---

## 23. 37 YOUTH LEAGUES SQUAD POPULATION & DEMOGRAPHIC MATRICES

### A. Roster Size & No Placeholders Rule
* **Minimum 15 Players per Youth Team:** Every team across all 37 starting city youth leagues (37 leagues $\times$ 10 teams = 370 teams) must be generated with at least **15 to 18 players**:
  * 11 Starting XI players (1 GK, 4 DEF, 3-4 MID, 2-3 ATT).
  * 4–7 Substitutes & Reserves (1 Sub GK, 1-2 Sub DEF, 1-2 Sub MID, 1-2 Sub ATT).
  * Total populated youth pool: $\approx 5,920$ fully defined youth prospects.
* **Strict Ban on Placeholders:** Names like `City FC Player #3` or `Youth Striker 1` are permanently forbidden.
* **Authentic Cultural Names:** Every player receives authentic first and last names generated from culturally curated name tables for their assigned nationality.

### B. League Demographic Nationality Matrices (% Breakdown)
Youth league nationalities reflect authentic real-world football demographics:

| Starting City / League | Dominant Domestic | Secondary Demographic (%) | Regional & International (%) |
| :--- | :--- | :--- | :--- |
| **London, Manchester, Liverpool** (England) | 64% English | 8% Scottish / Welsh / Irish | 14% European (French, Spanish, Dutch, German), 8% African / Caribbean, 6% South American |
| **Barcelona, Sevilla** (Spain) | 78% Spanish | 12% Latin American (Argentine, Brazilian, Colombian, Uruguayan) | 6% Moroccan / North African, 4% French / Western European |
| **Milan, Rome, Naples** (Italy) | 76% Italian | 10% South American (Italo-Argentine/Brazilian) | 8% Balkan / Eastern European, 6% African |
| **Berlin, Munich, Dortmund** (Germany) | 70% German | 12% Turkish-German | 10% Balkan / Polish / Austrian, 8% African / West European |
| **Paris, Marseille** (France) | 62% French | 24% African & Maghreb (Algerian, Moroccan, Senegalese, Ivorian, Malian) | 10% European (Portuguese, Spanish, Belgian), 4% South American |
| **Buenos Aires, Córdoba, Rosario** (Argentina) | 93% Argentine | 4% Uruguayan / Paraguayan | 2% Colombian / Chilean, 1% others |
| **Rio de Janeiro, Porto Alegre, São Paulo** (Brazil) | 95% Brazilian | 4% South American (Uruguayan, Argentine, Colombian) | 1% African / European |
| **Amsterdam, Rotterdam** (Netherlands) | 70% Dutch | 16% Surinamese / Antillean | 8% Moroccan / Turkish, 6% European |
| **Brussels** (Belgium) | 66% Belgian | 16% Congolese / West African | 12% French / Dutch European, 6% North African |
| **Lisbon, Porto** (Portugal) | 74% Portuguese | 16% Brazilian | 8% Angolan / Cape Verdean / Mozambican, 2% European |
| **Glasgow, Edinburgh** (Scotland) | 78% Scottish | 12% English / Northern Irish / Irish | 6% European, 4% Commonwealth |
| **Zagreb** (Croatia) | 92% Croatian | 6% Bosnian / Serbian / Slovenian | 2% other European |
| **Medellín, Bogotá** (Colombia) | 94% Colombian | 4% Venezuelan | 2% other South American |
| **Mexico City, Guadalajara** (Mexico) | 91% Mexican | 6% South American (Argentine, Uruguayan, Colombian) | 3% American / Central American |
| **Montevideo** (Uruguay) | 95% Uruguayan | 4% Argentine | 1% Brazilian |
| **Tokyo, Osaka** (Japan) | 94% Japanese | 3% South Korean | 2% Brazilian-Nikkei, 1% European |
| **Riyadh, Jeddah** (Saudi Arabia) | 72% Saudi | 14% Arab (Egyptian, Moroccan, Algerian, Jordanian) | 8% West African, 6% Brazilian / European |
| **Istanbul** (Turkey) | 82% Turkish | 6% Balkan / Caucasian | 6% African, 6% South American / European |
| **Cairo** (Egypt) | 94% Egyptian | 4% Sudanese / North African | 2% Sub-Saharan African |
| **Casablanca** (Morocco) | 95% Moroccan | 3% Sub-Saharan African | 2% French-Moroccan |
| **Lagos** (Nigeria) | 97% Nigerian | 2% Ghanaian / West African | 1% Cameroonian / Central African |
| **Melbourne, Sydney** (Australia) | 74% Australian | 10% British / Irish heritage | 8% Pacific Islander / East Asian, 8% European / South American |
| **Los Angeles, New York** (USA) | 62% American | 22% Hispanic / Mexican-American | 8% European, 8% African / Caribbean |

### C. Prestige & Academy Rating Scaling
Youth players are calibrated to realistic tiers based on the academy's reputation:
* **Tier 1 Elite Academies (Real Madrid, Barcelona, Man City, Bayern, PSG, River Plate, Boca, Flamengo):**
  * Starters (11): 66–78 OVR (High Potential Ceilings: 85–94).
  * Reserves (4–7): 60–65 OVR (Potential: 78–84).
* **Tier 2 Mid-Table Academies (Sevilla, West Ham, Real Sociedad, Feyenoord, Dinamo Zagreb):**
  * Starters (11): 58–67 OVR (Potential: 76–84).
  * Reserves (4–7): 52–57 OVR (Potential: 70–76).
* **Tier 3 Lower & Neighborhood Academies (Local youth clubs in starting cities):**
  * Starters (11): 48–59 OVR (Potential: 65–75).
  * Reserves (4–7): 42–47 OVR (Potential: 58–64).

---

## 24. HEAVY CHAMPION PRESTIGE MODIFIERS & DROUGHT DECAY SYSTEM

The match simulation engine incorporates dynamic club heritage weight, drought penalties, and championship renaissance boosts (`powerscaleSystem.ts`):

```
                       [Title Drought Tracker]
                                  │
         ┌────────────────────────┴────────────────────────┐
   Drought < 5 yrs                                   Drought >= 5 yrs
         │                                                 │
 [Full Modifier Active]                      [Dynamic Drought Decay Applied]
 (e.g. 1.35x League Mod)                     (Decays -2%/yr above yr 4, max 65% cap)
         │                                                 │
         └─────────────► [Lifts Silverware] ◄──────────────┘
                                  │
                  • Drought resets to 0 yrs
                  • Heritage title stack increments +1
                  • Modifier 100% restored to full power
```

### A. Historical Heritage Baselines
* **Spain:** FC Barcelona: 1.38x League, 1.20x Continental (5 UCLs). Real Madrid: 1.35x League, 1.375x Continental (15 UCLs $\times$ 2.5% = +37.5% King of UCL boost).
* **England:** Man City: 1.36x League. Liverpool: 1.28x League, 1.15x UCL. Man United: 1.18x League (subject to drought decay). Arsenal: 1.16x League.
* **Germany:** Bayern Munich: 1.35x League, 1.15x UCL. Dortmund: 1.15x League.
* **Italy:** Inter: 1.22x League. Juventus: 1.13x League (historic giant). AC Milan: 1.12x League, 1.18x UCL (European royalty).
* **France:** PSG: 1.45x League (dominant domestic favorite).
* **Argentina:** River Plate: 1.28x League, 1.15x Libertadores. Boca Juniors: 1.25x League, 1.15x Libertadores.
* **Brazil:** Flamengo: 1.26x League, 1.15x Libertadores. Palmeiras: 1.24x League.
* **Saudi Arabia:** Al-Hilal: 1.15x League (smaller modifier curve for Asian parity).
* **National Teams (World Cup):** Brazil (5 titles, 1.25x), Germany (4 titles, 1.20x), Italy (4 titles, 1.20x), Argentina (3 titles, 1.18x), France (2 titles, 1.14x), Uruguay (2 titles, 1.14x), England (1 title, 1.08x), Spain (1 title, 1.08x).

### B. Mathematical Drought Decay Formula
* **Grace Period:** 4 consecutive seasons without lifting the trophy.
* **Decay Rate:** Starting at season 5 of drought, the modifier decays by **2.0% per drought year** past the grace period:
  $$\text{Decay} = \min\left(0.65 \times (\text{BaseMod} - 1.0), \; (\text{YearsWithoutTitle} - 4) \times 0.02\right)$$
  $$\text{EffectiveModifier} = \max\left(0.85, \; \text{BaseModifier} - \text{Decay} + (\text{Trend} \times 0.015)\right)$$
* **Promoted Team Penalty:** Teams playing their first season after promotion receive an immediate $-8\%$ underdog penalty (`0.92x`).

### C. Silverware Renaissance & Title Refresh
* **Winning a League Title (`recordLeagueWinnerTitle`):**
  * Resets `yearsWithoutLeagueTitle = 0`.
  * Increments `leagueTitlesCount += 1`.
  * 100% restores `currentLeagueModifier = baseLeagueModifier`.
* **Winning a Continental Title (`recordContinentalWinnerTitle`):**
  * Resets `yearsWithoutContinentalTitle = 0`.
  * Increments `continentalTitlesCount += 1`.
  * Increases base continental modifier by $+0.025$ (+2.5%).
  * 100% restores `currentContinentalModifier = baseContinentalModifier`.
* **Domestic Cup Sharing Rule:**
  * Domestic cups (FA Cup, Copa del Rey, DFB-Pokal, Coppa Italia) share the active league modifier in match simulation.
  * *Critical Rule:* Winning a local cup does **NOT** refresh a league drought. Only winning the league championship resets the league drought counter.

---

## 25. THE CLUB & NATIONAL ICON POINTS ENGINE, TROPHY CABINET HERITAGE & 7-TIER LEGEND STATUS

In DrawStar Remake 2.0, greatness is not measured solely by overall attribute ratings, but by the indelible mark left on the clubs and nations you represent. The **Icon Points Engine (`iconPointsSystem.ts`)** mathematically calculates your standing in club and international folklore.

```
                      [Match / Silverware / Derby Action]
                                       │
                      ┌────────────────┴────────────────┐
             Club Competition                  International Campaign
                      │                                 │
           [Trophy Cabinet Check]              [National Heritage Check]
           (Madrid: 36 Leagues/15 UCLs)       (Brazil: 5 WCs / Colombia: 0 WCs)
                      │                                 │
        [Inverse Expectation Quotient]        [Tournament Miracle Multiplier]
       (Burnley EPL: 200 pts Miracle)         (Colombia Semi-Final: 125 pts)
       (Real Madrid EPL: 25 pts Standard)     (Brazil WC Quarters: Expected 0 pts)
                      │                                 │
                      └────────────────┬────────────────┘
                                       │
                      [Cumulative Icon Points Tracked]
                         (Per-Club & Per-Nation)
                                       │
                                ┌──────┴──────┐
                       Club Tiers (1–7)   National Tiers (1–7)
                                │             │
                    [Retirement Broadsheet & Ranked Epitaph Title]
                       "The Greatest in the History of [Club]"
```

### A. Core Architecture (`iconPointsSystem.ts`)
* **Persistent Multi-Club & National Tracking:**
  * Lifetime icon points are tracked separately for every club played for (`clubIconPoints: Record<string, number>`) and the national team (`nationalIconPoints: number`).
  * Icon points **never reset upon transfer**. If a player returns to a boyhood club after a decade abroad, their accumulated standing remains intact.
* **Match & Season Baseline Icon Points:**
  * **Appearances:** $+1$ Icon Point per 10 competitive appearances.
  * **Derby Triumphs:** $+5$ Icon Points for scoring or assisting the winning goal in a heated local derby (e.g., El Clásico, North London Derby, Superclásico).
  * **Season Golden Boot / Top Assister:** $+30$ Icon Points.
  * **Club Player of the Year Award:** $+25$ Icon Points.
  * **Captaining the Squad for a Season:** $+15$ Icon Points.
  * **Underdog Relegation Rescue:** $+20$ Icon Points for scoring the decisive goal/assist that secures top-flight survival on the final matchday.

### B. The 7 Club Icon Status Tiers (100 Points per Tier)
Every tier unlocks dynamic crowd reactions, commentary lines, board patience, and merchandise revenue:

| Tier | Status Title | Points Required | Fan & Club Sentiment | Unlocking Perks & In-Game Behavior |
| :---: | :--- | :---: | :--- | :--- |
| **Tier 1** | **"Passing Familiar"** | **100–199** | *"The fans kind of remember you played here."* | Polite applause upon returning as an opponent; generic stadium announcer mention. |
| **Tier 2** | **"Respected Contributor"** | **200–299** | *"Remembered for doing well; a solid servant."* | Warm reception from home supporters; board offers slightly higher base contract extensions. |
| **Tier 3** | **"Local Hero"** | **300–399** | *"A true terrace favorite and local hero."* | Fan chants sung during match build-ups; custom retro jersey available in the Club Store. |
| **Tier 4** | **"Club Great"** | **400–499** | *"Known as one of the great players of an era."* | Featured in club promotional billboards; standing ovation during substitutions; captaincy offered. |
| **Tier 5** | **"Club Legend"** | **500–599** | *"An undisputed immortal legend of the club."* | Permanent standing ovation at every match; mural painted outside stadium; Club Hall of Fame induction. |
| **Tier 6** | **"All-Time Icon"** | **600–699** | *"Among the top 3–5 best players in club history."* | VIP lifetime stadium box; matchday program special features; shirt retirement consideration. |
| **Tier 7** | **"The Greatest in Club History (Supreme GOAT)"** | **700+** *(See Gating)* | *"The single best player to ever wear the shirt."* | **Bronze Statue unveiled outside stadium gates**; grants the permanent **Rank 1 Retirement Epitaph Title**; mythical status. |

#### The Super Giant Tier 7 Gating Rule
At super legendary football royalty clubs (clubs with $\ge 20$ domestic leagues or $\ge 5$ Continental UCL titles: Real Madrid, Barcelona, Bayern Munich, Manchester United, Juventus, AC Milan, Liverpool), Tier 7 cannot be achieved simply by grinding appearances. To unlock **Tier 7 ("The Greatest in History")** at a Super Giant, a player must attain **700+ Icon Points AND fulfill at least one Historical Master Condition**:
1. Win **2 or more Continental Champions League titles** with the club.
2. Win the **Ballon d'Or** while playing for the club.
3. Break the club's **all-time competitive goalscoring or appearance record**.

### C. The 7 National Team Icon Status Tiers
National icon points reflect the hopes, pride, and collective emotion of an entire sovereign nation:

| Tier | Status Title | Points Required | National Standing |
| :---: | :--- | :---: | :--- |
| **Tier 1** | **"Capped International"** | **100–199** | Earned international selections; recognized squad prospect across qualifying rounds. |
| **Tier 2** | **"Reliable Patriot"** | **200–299** | Dependable regular starter; respected presence in continental championship qualifiers. |
| **Tier 3** | **"National Hero"** | **300–399** | Clutch goalscorer in major tournaments; recognized on every street in the homeland. |
| **Tier 4** | **"Golden Generation Leader"** | **400–499** | Captain of the national team; leads deep tournament runs; face of the national sporting federation. |
| **Tier 5** | **"Patriot of the Century"** | **500–599** | Lifts major continental silverware (Copa America, Euros, AFCON, Asian Cup, Gold Cup) or reaches World Cup final; awarded national state honors. |
| **Tier 6** | **"Pantheon of the Motherland"** | **600–699** | One of the 3–5 immortal sporting legends in the nation's history; permanent national icon. |
| **Tier 7** | **"The Greatest in Nation's History (National GOAT)"** | **700+** *(Weighted)* | The undisputed greatest player ever produced by the country. For underdog nations, unlocks the legendary epitaph: *"The Greatest in the History of [Nation]"*. |

#### National Superpower vs. Underdog Scaling:
* **Historic Superpowers (Brazil 5 WCs, Germany 4 WCs, Italy 4 WCs, Argentina 3 WCs, France 2 WCs):**
  * Qualifying for a World Cup yields **0 points** (it is expected).
  * Reaching the World Cup Quarter-Final yields only **15 points**.
  * Reaching Tier 7 requires winning the World Cup + winning the World Cup Golden Ball or breaking the national all-time scoring record (e.g., surpassing Pelé/Ronaldo for Brazil, Maradona/Messi for Argentina).
* **Underdog Nations (e.g. Colombia, Norway, Nigeria, Japan, USA, Wales, Poland, Chile):**
  * Qualifying for the World Cup yields **+25 Icon Points**.
  * Reaching the World Cup Quarter-Finals / Semi-Finals yields **+100 to +150 Icon Points** (country goes into national celebration).
  * Winning a Continental Championship (Copa America, AFCON, Asian Cup, Gold Cup) yields an instant **+200 Icon Points**.
  * Winning the World Cup yields **+400 Icon Points** and guarantees **Instant Tier 7 Immortality**!

### D. Trophy Cabinet Representation & The Inverse Expectation Formula
Every club in the game features an authentic, mathematically calibrated **Trophy Cabinet (`clubHeritageData.ts`)**. Even though unlicensed default clubs utilize creative localized fantasy names (e.g., Madrid White, Barcelona Blue-Garnet, Manchester Red, London Cannons, Lancashire Claret, Naples Sky-Blue, Turin Zebras, Milan Red-Black, Munich Red, Paris Blue, Buenos Aires Red-Sash) and competitions use stylized names, their **trophy cabinets depict exact real-world historical tallies**:

* **Option File Continuity:** Option files and user in-game editor adjustments (`optionFileSystem.ts`) rename clubs and competitions freely without disrupting the underlying trophy cabinet numbers or expectation math.

#### 1. Baseline Silverware Values
* **Domestic League Championship:** 25 Base Points
* **Continental Champions League (UCL / Libertadores / AFC CL):** 50 Base Points
* **Domestic Cup (FA Cup, Copa del Rey, DFB-Pokal):** 15 Base Points
* **FIFA Club World Cup:** 20 Base Points
* **Domestic Supercup:** 10 Base Points

#### 2. The Mathematical Silverware Multiplier Formula
$$\text{SilverwareIconPoints}(\text{Club}, \text{Comp}) = \text{BasePoints}(\text{Comp}) \times \text{HeritageMultiplier}(\text{Club}, \text{Comp})$$

$$\text{HeritageMultiplier}(\text{Club}, \text{Comp}) = \min\left(8.0, \; 1.0 + \max\left(0, \; \frac{30 - \text{ClubTitles}}{3.5}\right) + \min\left(2.0, \; \frac{\text{YearsSinceLastTitle}}{20}\right)\right)$$

#### 3. Concrete Examples of the Formula in Action:
1. **Real Madrid / Madrid White (36 League Titles, 15 UCLs):**
   * Winning La Liga: ClubTitles = 36 $\rightarrow \max(0, 30-36) = 0$. Multiplier = $1.0\times$.
   * **Points Earned:** $25 \times 1.0 = \mathbf{25\text{ Icon Points}}$ *(Winning the league is expected minimum standard)*.
   * Winning UCL: Multiplier = $1.0\times$.
   * **Points Earned:** $50 \times 1.0 = \mathbf{50\text{ Icon Points}}$.
2. **Napoli / Naples Sky-Blue (3 Scudetti in history, 33-year drought before 2023, 0 UCLs):**
   * Winning Serie A: ClubTitles = 3 $\rightarrow (30-3)/3.5 = +7.71$ (capped). Multiplier = $6.0\times$.
   * **Points Earned:** $25 \times 6.0 = \mathbf{150\text{ Icon Points}}$ *(A generational citywide miracle)*.
   * Winning UCL: ClubTitles = 0 $\rightarrow$ Multiplier = $4.5\times$.
   * **Points Earned:** $50 \times 4.5 = \mathbf{225\text{ Icon Points}}$ *(First Champions League in club history)*.
3. **Burnley / Lancashire Claret (2 Top-Flight Titles: 1921 & 1960; 60+ year top-flight title drought, 0 UCLs):**
   * Winning the Premier League: Zero pre-season expectation. Maximum underdog miracle cap applies ($8.0\times$).
   * **Points Earned:** $25 \times 8.0 = \mathbf{200\text{ Instant Icon Points}}$ *(Instant local hero & legend status; fans name streets after you)*.
   * Winning the Champions League:
   * **Points Earned:** $50 \times 7.0 = \mathbf{350\text{ Instant Icon Points}}$ *(Unprecedented European fairy tale)*.
4. **Arsenal / London Cannons (13 League Titles, 20+ year drought, 0 UCLs):**
   * Winning the Premier League: $(30-13)/3.5 = 4.85 + \text{drought bonus } (20/20 = 1.0) \rightarrow 2.5\times$ multiplier.
   * **Points Earned:** $25 \times 2.5 = \mathbf{62.5\text{ Icon Points}}$.
   * Winning First-Ever Champions League: $50 \times 4.0 = \mathbf{200\text{ Icon Points}}$ *(Finally lifting the Holy Grail)*.

---

### E. The Homecoming Icon Points Engine & Career Stature Carryover (`homecomingIconSystem.ts`)

When a player makes the emotional decision to return to their designated **Boyhood / Home Club** (or re-signs for any club they previously represented), the engine does not treat them as an ordinary incoming transfer. Their standing is calculated through the **Homecoming Stature Transfer Formula**:

#### 1. The Club Icon Preservation Invariant (Zero Decay on Departure)
* **The Permanent Legacy Rule:** Icon points earned at *any* club (`clubIconPoints[clubId]`) are **100% permanent and immutable**. They never decay, expire, or reset upon transferring away.
* **The Return Test:** If a player achieves **Tier 4 ("Club Great", e.g., 420 points)** at Arsenal, moves to Real Madrid or Bayern Munich for 7 seasons, and returns to Arsenal at age 32:
  * They return with their **exact 420 points intact** (retaining Tier 4 status on day one).
  * Fans welcome them with terrace songs, the club reserves their former shirt number, and the dressing room immediately offers the captain's armband.

#### 2. The Career Stature Homecoming Bonus (Arriving at Your Home Club)
When a player signs for their designated **Home Club** (Section 4.D), the city and fanbase celebrate their return. The player receives an **Instant Arrival Icon Points Injection** scaled directly to their overall **Career Greatness Tier ($S_{\text{career}}$)**:

$$\text{Career Stature Score} = \text{MaxClubTierScore} + \text{NationalTierScore} + (100 \times \text{BallonDors}) + (80 \times \text{UCL\_WCs}) + (40 \times \text{GoldenBoots})$$

* **Scenario A: First Time Playing for the Home Club (0 Prior Minutes at Club)**
  Even if the player never played for the first team of their boyhood club (e.g. came through a different academy or left abroad as a teenager), their monumental career standing instantly commands awe:
  
  | Player Global Career Peak | Career Stature Profile | Instant Home Club Arrival Bonus | Resulting Arrival Standing at Home Club |
  | :--- | :--- | :---: | :--- |
  | **Global Tier 7 (Supreme GOAT)** | Multi-Ballon d'Or, UCL/World Cup champion, Tier 7 legend elsewhere | **+350 to +450 Icon Points** | **Instant Tier 3 ("Local Hero") to Tier 4 ("Club Great")** before kicking a ball! |
  | **Global Tier 6 (All-Time Icon)** | World-class superstar, 1 Ballon d'Or or continental conqueror | **+250 to +300 Icon Points** | **Instant Tier 3 ("Local Hero")** on arrival. |
  | **Global Tier 5 (Club Legend)** | Major trophy winner, continental leader, national team idol | **+180 to +220 Icon Points** | **Instant Tier 2 ("Respected Contributor")**. |
  | **Global Tier 4 (Club Great)** | Established international star, domestic champion abroad | **+100 to +150 Icon Points** | **Instant Tier 1 ("Passing Familiar") to Tier 2**. |

* **The Underdog Home Club Earthquake Multiplier:**
  If the player's boyhood club is an underdog or lower-prestige club (e.g. Empoli FC, Rosario Central, Burnley, Real Zaragoza, Rayo Vallecano) and a **Tier 7 Global Legend** returns in their twilight years:
  * The local community experiences a once-in-a-lifetime sporting miracle.
  * A **$+25\%$ Underdog Hype Multiplier** is applied to the arrival bonus:
    $$\text{Arrival Bonus} = 400 \times 1.25 = \mathbf{500\text{ Instant Icon Points}}$$
  * Result: The player walks in through the gates as an **Instant Tier 5 ("Club Legend") on day one**! Stadium murals are unveiled before the opening match of the season.

* **Scenario B: Returning to a Home Club You Previously Played For**
  If the player already represented their Home Club earlier in their career:
  $$\text{Starting Icon Points on Return} = \text{PreviousClubPoints} \;+\; \text{ProdigalSonLoyaltyBonus}$$
  * **Previous Points:** 100% preserved (e.g., 420 points = Tier 4).
  * **Prodigal Son Loyalty Bonus:** $+50\text{ to }+100\text{ Icon Points}$ awarded for returning in prime or veteran years to help the boyhood club.
  * *Example:* A player who left with 420 points (Tier 4) and returns after winning European honors receives $+80\text{ points} \rightarrow \mathbf{500\text{ Icon Points}}$, immediately crossing into **Tier 5 ("Club Legend")** upon signing!

---

## 26. PHASE 0: AUDIT, ASSET RETENTION & DUAL-TRACK ARCHITECTURE

Before creating the new screens, we execute **Phase 0: Triage, Modular Asset Extraction & Dual-Track Setup**:

### A. Is It Feasible to Develop 2.0 While Keeping the Older Game Around?
* **Yes, absolutely — and it is strongly recommended:**
  * Developing in a parallel `src/v2/` workspace preserves the 100% working legacy game while Remake 2.0 is built piece by piece.
  * A lightweight launcher toggle on the initial screen allows switching between `[Play Remake 2.0]` and `[Play Legacy 1.0]`.
  * Players and developers can compare performance, layout, and gameplay side-by-side on the live preview server at any time.
  * Once Remake 2.0 reaches full feature parity, legacy files can be safely archived or removed without risking data loss.

### B. What We KEEP & PRESERVE (Gold-Standard Assets)
1. **Character Creator & 32-Bit SVG Avatar Engine:**
   * 100+ hairstyles, scalp cap geometries, and hair dye shaders (which took dozens of hours to eliminate forehead/temple deformation).
   * Facial hair styles, skin tones, biometrics, eyes, and expressions.
   * Strength-based anatomical morphing (`strengthCalculations`): dynamic neck widening, shoulder/chest expansion, trapezoid muscle growth, and vascularity/vein layers across strength tiers 1–5.
   * Tattoos (Arm, Neck, Face) and Earrings (Left/Right, with materials: Gold, Silver, Diamond, Titanium).
   * Club Kits and Custom Crest Engine (`KitRenderer`, `CustomEmblem`, kit stripes, sash, hoops, gradients, and collar types).
2. **Core Mathematical & Progression Engines (`src/utils/`):**
   * `statProgressionSystem.ts`: Level curves, stat point scaling from Level 50 up to the 99 $\rightarrow$ 100 Stat Break (0.01 per point requirement).
   * `statCalculations.ts`: Position weights, category attributes, goalkeeper formulas.
   * `badReputationSystem.ts`: 5 tiers of infamy, referee bias, booking probabilities, and transfer locks.
   * `perksSystem.ts`: The complete 10-category career perk registry.
   * `nicknameSystem.ts` & `originLastNameSystem.ts`: Cultural nicknames, Brazilian (-inho) rules, last name genealogy.
   * `playerGrowthSystem.ts`: Youth growth spurts, genetic ceilings, and physical conditioning (ages 10–18).
   * `powerscaleSystem.ts`: The heavy champion heritage modifiers, drought decay, and title refresh algorithms.
3. **Procedural Chiptune Web Audio Synthesizer:**
   * 0 KB download size, infinite procedural retro loops and tactile hit/action SFX with zero external MP3/WAV dependencies.
4. **Localization Packets:**
   * Complete 5-language dictionary (`es_ES`, `es_AR`, `en_GB`, `pt_BR`, `fr_FR`).
5. **Exact Career Store & Business Catalog:**
   * All Tier 1–6 upgrades, energy drinks, boots, training equipment, and 5 business investment templates from `storeItems.ts`.

### C. What We FIX During Extraction (Identified Flaws)
1. **Necklace Drapery Alignment:**
   * *The Problem:* Currently in `PlayerCard.tsx`, `renderNecklace` uses fixed draping coordinates (`midX = 108, drapeY = 192, topY = 152`) inside a scaled head container. As the character's neck width (`neckW`) widens with higher strength tiers (Tiers 3–5), the necklace clips into the neck or floats unnaturally.
   * *The 2.0 Fix:* Anchor necklace drape curves to dynamic coordinates derived from `strengthCalculations.neckLeft` and `neckW`. Render the necklace on a dedicated collar layer between the neck skin and outer jersey fabric.
2. **V-Neck Shirt Collar Alignment:**
   * *The Problem:* The V-neck collar SVG currently uses a fixed `100 85` viewBox inside a container scaled to `neckW + 8`. This distorts the inner V-ribbon angle when strength tiers change, creating jagged polygon tears between the neckline and the chest fabric.
   * *The 2.0 Fix:* Unify the torso shirt cutout and the V-collar ribbons into a single synchronized SVG path that scales proportionally with the chest width and neck boundary, eliminating edge tears.

### D. What We REMOVE (Purge for 2.0)
1. **The 50+ Nested Floating Modals (`*Modal.tsx`):**
   * Eliminate all window-inside-window popups, multi-layered modal overlays, and tiny cramped scroll containers.
   * Replaced by 10 full-screen console views in the unified `ViewStack`.
2. **Monolithic `App.tsx` State Soup:**
   * Eliminate 4,000+ lines containing 80+ interdependent `useState` variables in a single file.
   * Replaced by clean Zustand / Context domain stores (`usePlayerStore`, `useWorldStore`, `useCareerStore`).
3. **Fragmented Tournament Code:**
   * Purge separate, disconnected mock simulators (`ContinentalDashboardModal`, `WorldResultsModal`, `GroupDrawSimulator`).
   * Replaced by the unified `TournamentEngine` (36-team Swiss UCL, World Cups, Leagues).
4. **Transient Test Panels:**
   * Purge temporary test dashboards (`DeveloperTestDashboard`, `ProjectSyncModal`).

---

## 27. RECALIBRATED 9-DAY PHASED ROADMAP (CALIBRATED TO GEMINI FREE TOKEN BUDGETS & LEAN ARCHITECTURE)

### A. Lead Systems Architect Overview: Free-Tier Constraints vs. Scope Execution

Developing an expansive, console-grade sports RPG like DrawStar Remake 2.0 within **Google AI Studio's Free-Tier Environment** requires the discipline of veteran game development. While Gemini provides world-class reasoning and code generation capabilities, free-tier execution is bounded by real physical constraints:
* **Rate Limits & Daily Request Ceilings:** 15 Requests Per Minute (RPM), daily request quotas, and context window limits.
* **Context Compaction & Token Inflation:** As an AI development session progresses, giant file reads and monolithic file rewrites can inflate turn costs from 10k tokens to 100k+ tokens per prompt. If an agent tries to modify a 4,000-line monolithic file (like legacy `App.tsx`), token quotas vanish in 2 to 3 turns, triggering aggressive context compaction and amnesia.
* **Client-Side Browser Runtime Boundaries:** The game runs in modern desktop and mobile browsers (often inside iframes). Loading 15,000 players with unoptimized static JSON or unrestricted memory allocations will cause tab crashes (Out-Of-Memory OOM) on mobile devices (Adreno 5xx, Mali-G52).

To achieve 100% completion of this ambitious vision without hitting daily token walls or memory bottlenecks, Remake 2.0 enforces **Four Lean Architecture Pillars**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │     FOUR LEAN ARCHITECTURE PILLARS (FREE-TIER SAFE)    │
                       └────────────────────────────────────────────────────────┘
                                                    │
        ┌───────────────────┬───────────────────────┴───────────────────────┬───────────────────┐
        ▼                   ▼                                               ▼                   ▼
 [PILLAR I: PROCEDURAL] [PILLAR II: 350-LOC CEILING]             [PILLAR III: TRANSIENT SIM] [PILLAR IV: DUAL-TRACK]
 • Seeded PRNG rosters   • Strict file size limit (<350 lines)    • Stack-allocated matches   • Legacy 1.0 safe in dev
 • Demographic tables    • Modular: Types, Engine, Store, View   • H1/H2 6-mo rolling stats  • v2 built in parallel
 • 95% token savings     • Zero-amnesia, surgical diffs           • <5.5 MB RAM footprint     • Instant preview toggle
```

1. **Pillar I: Deterministic Procedural Seeding over Static JSON Bloat (95% Token Savings):**
   * *Anti-Pattern:* Hardcoding 370 youth teams $\times$ 15 players = 5,550 static player objects in raw JSON files. This would consume over **180,000 tokens of file creation**, eat 15 MB of bundle size, and burn an entire day's token budget on repetitive data typing.
   * *The 2.0 Solution:* A deterministic seed-based procedural generator (`proceduralRosterEngine.ts`). We define 37 compact city archetypes, demographic name frequency arrays, and age/position formulas. In **less than 25 KB of code (< 600 lines)**, the engine dynamically generates all 5,550 players deterministically in $< 4\text{ milliseconds}$ with 0 KB static payload!
2. **Pillar II: The "350-Line Architectural Ceiling" (Compaction-Immune Modularity):**
   * No single source file in `src/v2/` may exceed **350 lines of code**.
   * Monolithic systems are strictly divided into 4 atomic units:
     * `*Types.ts` (Pure TypeScript interfaces, ~50-80 lines)
     * `*Engine.ts` (Pure deterministic math & business logic, zero React dependencies, ~200-300 lines)
     * `*Store.ts` (Reactive state slice via lightweight Zustand/Context, ~100-200 lines)
     * `*View.tsx` (Fullscreen UI rendering, ~200-350 lines)
   * *Benefit:* When the AI agent implements or refines a feature, it inspects and edits only 50–100 lines at a time. Token usage per turn drops by **75%**, completely preventing context exhaustion and compaction truncation.
3. **Pillar III: Zero-Allocation Transient Simulation & Tiered Memory:**
   * High-speed match simulation (Quick Sim and background league ticks) uses object pooling. Match event logs for AI leagues are transiently processed in stack memory and immediately garbage collected.
   * Player data uses the **3-Tier Retention System** (User Player: permanent lifetime log; Top 100 AI: 2-year rolling snapshot; General 15k AI: current active season only). Total memory footprint remains strictly under **5.5 MB RAM**.
4. **Pillar IV: Dual-Track Staging & Continuous Compilation:**
   * Remake 2.0 lives exclusively in `src/v2/`. Legacy 1.0 remains completely intact and functional in `App.tsx` behind a simple dev launcher toggle (`[Play 2.0]` vs `[Play 1.0]`).
   * Every day concludes with `compile_applet` and `lint_applet` validation to ensure zero compiler regressions.

---

### B. The Calibrated 9-Day Phase-by-Phase Plan

Each phase represents **exactly 1 productive developer day of Google AI Studio Free Tier token quota** (calibrated to ~70,000–95,000 generated tokens, ~25–40 surgical tool calls, well under the daily request limits):

```
[Day 0] ──────► [Day 1] ──────► [Day 2] ──────► [Day 3] ──────► [Day 4] ──────► [Day 5] ──────► [Day 6] ──────► [Day 7] ──────► [Day 8]
Phase 0         Phase 1         Phase 2         Phase 3         Phase 4         Phase 5         Phase 6         Phase 7         Phase 8
Dual-Track &    Console Shell,  World Engine,   Living World    Store, Cards,   Dressing Room   Playable 2D &   Cinematics,     Packaging,
Avatar Fixes    Boot, 5-Tier    37 Cities,      Sim, 2026 FIFA, Dust Upgrades,  & 2D Pitch      Kick Off Mode,  Epitaphs, Yashin PWA & Final
                Team Picker &   6-Category Stats GK Yashin Sim  6-Category Cab  Sprite Link     Match Setup &   & 6-Cat Honors  Polish
                5 Starter Packs & Dual Cal      & Powerscale    & Editors                       Tactical SIM
```

---

#### Phase 0 (Day 0) — Dual-Track Scaffold, Character Extraction & Anatomical Fixes
* **Developer Day Token Budget:** ~60,000 tokens (Comfortably under daily free quota).
* **Core Focus:** Establishing clean `src/v2/` directory structure, extracting the 32-bit SVG Character Creator from legacy `PlayerCard.tsx` into modular units, and fixing known anatomical clipping bugs.
* **Target File Deliverables:**
  * `src/v2/types/characterTypes.ts` (~80 lines): Clean TypeScript types for hairstyles, facial hair, skin tones, strength tiers (1–5), earrings, tattoos, and kits.
  * `src/v2/character/strengthCalculations.ts` (~160 lines): Neck widening, shoulder expansion, trapezoid muscle growth, and vascularity layers.
  * `src/v2/character/SvgAvatarRenderer.tsx` (~320 lines): Modular SVG avatar renderer.
  * `src/v2/character/fixes/necklaceDrape.ts` (~60 lines): **Fix:** Anchors necklace curves dynamically to `neckLeft` and `neckW` across all strength tiers, eliminating neck clipping.
  * `src/v2/character/fixes/vNeckCollar.ts` (~80 lines): **Fix:** Synchronizes V-collar ribbons and chest cutout paths to eliminate polygon tearing.
  * `src/App.tsx` (Launcher toggle edit): Adds clean 2-button dev switcher: `[⚡ Launch Remake 2.0]` / `[🕹️ Launch Legacy 1.0]`.
* **Lean Optimization Guardrails:** Zero modifications to working legacy game logic. Modular character files allow rendering anywhere without importing monolithic state.
* **Verification Gate:** `compile_applet` passes; switching between 1.0 and 2.0 renders cleanly in dev preview.

---

#### Phase 1 (Day 1) — PS2/PS3 Console Navigation Stack, Startup Routing & Profile Engine
* **Developer Day Token Budget:** ~85,000 tokens.
* **Core Focus:** Fullscreen console UI navigation stack, pre-boot profile scan, Quick Resume shortcut, 3-profile storage, quality preset hardware scanner, boyhood Home Club engine, the 5-Tier Universal Team Picker, 5 FREE Starter Packs, the Dual Pack Opening Animation Engine, and Career Hub HUD.
* **Target File Deliverables:**
  * `src/v2/navigation/ViewStack.tsx` (~220 lines): PS2/PS3 fullscreen view stack (push, pop, replace, history, universal `[O]` / `ESC` back button).
  * `src/v2/navigation/ConsoleHeader.tsx` (~140 lines): L1/R1 bumper navigation, date, cash, energy, and top-right active Profile Avatar Badge.
  * `src/v2/navigation/ConsoleFooter.tsx` (~110 lines): 32-bit tactile action prompts (`[X] Confirm`, `[O] Back`, `[Square] Action`).
  * `src/v2/navigation/UniversalTeamPicker.tsx` (~260 lines): Reusable 5-tier hierarchical team selector (Category: Clubs/Nations/Special $\rightarrow$ 6 Confederations $\rightarrow$ Country $\rightarrow$ League $\rightarrow$ Team) powering Boyhood Home Club, Profile Avatar Crest, and Kick Off mode.
  * `src/v2/input/InputManager.ts` (~180 lines): Unified input abstraction (Touch virtual pad, Gamepad API, Keyboard WASD/Arrows).
  * `src/v2/profile/profileStorage.ts` (~210 lines): 3-profile slot engine, pre-logo detection, persistent settings (language, quality, audio).
  * `src/v2/screens/StartupIntroScreen.tsx` (~280 lines): Pre-boot check $\rightarrow$ 32-bit DrawStar Logo $\rightarrow$ Quick Resume prompt (if active career save exists) OR First-Launch wizard (Language carousel $\rightarrow$ Quality auto-detect $\rightarrow$ Profile Creator with 4 preset club crests + "CUSTOM" avatar face picker).
  * `src/v2/screens/CareerHubScreen.tsx` (~320 lines): Fullscreen Career HUD for contracted pros and free agents: Chemistry bar ($0-100\%$), Fitness bar with mathematical penalty ($-1$ on Pace, Stamina, Strength per $1\%$ under $50\%$), Body Conditioning & Weight status (Ideal vs. Actual with Overweight $-1$ PAC/STA or Underweight $-1$ STR penalties), Active Bonus Stats Ledger itemizing bonuses/penalties from events/cards/gear, and dynamic OVR display.
  * `src/v2/player/positionPlaystyleSystem.ts` (~270 lines): Complete 3-tier positional hierarchy (Positions $\rightarrow$ Sub-Positions $\rightarrow$ Authentic Playstyles), 4 canonical special tactical sub-positions (`WB`, `SS`, `LM`/`RM`, `LIB`), and manager tactical playstyle assignment/retraining (including *Regista* under CDM).
  * `src/v2/store/storeOnboarding.ts` (~170 lines): Mandatory first-time card store tutorial, setting initial balance to 🪙 0 Champion Coins, claiming the **5 FREE Starter Packs** (Bronze, Silver, Gold, Double-Edged, and 💎 EPIC Upgrade Pack with guaranteed Legendary/Iconic pulls), and introducing the Duplicate Dust recycling flow.
  * `src/v2/cards/PackOpeningEngine.tsx` (~290 lines): **Dual Pack Opening Engine:** Big Pack Batch Cascade (supporting up to 100 cards simultaneously for 50-card Starter packs with domino flip) vs. Enhanced Solo/Epic Draw (suspense glow & tear), plus bespoke Legendary/Iconic/Katana/Muramasa/Disaster VFX and Disaster vs. Iconic & Muramasa Mythic Clash cinematics.
  * `src/v2/cards/CardDisplay.tsx` (~280 lines): Mobile-first card anatomy adhering strictly to Section 16.E and 16.F: category chromatic shaders (Positive: Bronze, Silver, Gold, Legendary, Iconic; Negative: Scrap, Rust, Ash, Disaster; Double-Edged: Stone/Obsidian Knife, Copper Dagger, Steel Blade, Muramasa Blade), plus 8 bespoke tactile type materials (Parent polaroid/tree, Youth blueprint grid, Street asphalt/stencil, Career jersey mesh, Lifestyle UV varnish, Sponsor carbon hologram, Agent calfskin notary seal, Cultural hand-woven tapestry).
  * `src/v2/homeclub/homeClubSystem.ts` & `homecomingIconSystem.ts` (~290 lines combined): Boyhood club affinity picker via `UniversalTeamPicker`, veteran return hooks, and career stature homecoming arrival bonus matrix (+350 to +500 Icon points for returning legends).
* **Lean Optimization Guardrails:** State separated into `useProfileStore` and `useNavigationStore`. Zero nested modals.
* **Verification Gate:** App starts with pre-boot scan; fresh profiles walk through 3-step setup; existing profiles show Quick Resume prompt; Career Hub displays live Chemistry, Fitness penalty, and bonus stats; 50-card starter pack batch reveal runs at smooth 60 FPS.

---

#### Phase 2 (Day 2) — Procedural World DB, 37 Cities, Dual Calendars & 6-Category Low-Memory Stats
* **Developer Day Token Budget:** ~90,000 tokens.
* **Core Focus:** Global league structure, 37 starting cities with 10-team youth leagues, deterministic procedural player seeding, dual-hemisphere calendars, and the 6-Category low-memory stats ledger.
* **Target File Deliverables:**
  * `src/v2/world/worldPyramidData.ts` (~250 lines): Compact definitions for European pyramids (England 4 tiers, Spain 3 tiers, Italy 3 tiers, Germany 3 tiers), global 2-tier leagues, and South American leagues.
  * `src/v2/world/startingCitiesData.ts` (~220 lines): 37 starting cities with coordinate, demographic name weighting, and youth academy prestige ratings.
  * `src/v2/world/proceduralRosterEngine.ts` (~280 lines): **Pillar I Breakthrough:** Generates all 370 youth teams $\ge 15$ authentic youth players deterministically from city seeds in $< 4\text{ ms}$, saving ~180,000 tokens of static JSON bloat.
  * `src/v2/calendar/calendarEngine.ts` (~240 lines): Synchronized dual-hemisphere calendars (European August–May vs. South American February–December with Apertura/Clausura and Brasileirão winter pause).
  * `src/v2/stats/careerCategoryStats.ts` (~250 lines): **6-Category Ledger:** Partitions all matches, minutes, goals, assists, clean sheets, saves, and cards across `individual`, `world`, `continental`, `national`, `youth`, and `friendly` buckets.
  * `src/v2/stats/statsEngine.ts` (~260 lines): **Pillar III Breakthrough:** Dual-Semester $H_1/H_2$ rolling snapshot accumulator, 3-tier memory retention (Lifetime user log, 2-year rolling Top 100 AI, 1-season transient general AI). Heap memory strictly $< 5.5\text{ MB}$.
* **Lean Optimization Guardrails:** Zero static player JSON files in repo. All 5,550 youth players generated via deterministic hashing.
* **Verification Gate:** Benchmarks show 370 teams populated in $< 10\text{ ms}$; memory profiler confirms $< 5.5\text{ MB}$ RAM footprint.

---

#### Phase 3 (Day 3) — Living World Sim Engine, 2026+ FIFA Mega-Window & Goalkeeper Yashin Engine
* **Developer Day Token Budget:** ~85,000 tokens.
* **Core Focus:** Background league simulation worker, Poisson-Elo match resolver, Goalkeeper rating and metrics engine, 2026+ FIFA international windows, UEFA Nations League, qualifying tournaments, champion powerscale decay, and Manager vs Figurehead transfer origin dynamics.
* **Target File Deliverables:**
  * `src/v2/sim/matchResolver.ts` (~240 lines): Pure Poisson-Elo mathematical match resolver with venue bias, tactical adjustments, and full Goalkeeper tracking (saves, save %, clean sheets, penalties saved, GAA).
  * `src/v2/sim/powerscaleEngine.ts` (~210 lines): Heavy champion heritage modifiers, 4-year grace period, 2%/yr drought decay, and title refresh algorithms.
  * `src/v2/international/nationalTeamSystem.ts` (~320 lines): Up-to-date 2026+ FIFA international windows (including the new 16-day late Sep / early Oct Mega Window), UEFA Nations League A/B/C/D replacing friendlies, Eurocopa Qualifiers, and CONCACAF Gold Cup/Nations League Qualifiers.
  * `src/v2/managers/managerRelationshipSystem.ts` (~260 lines): Club & national manager trust meter (0–100), tri-tier national coaches (U17, U20, Senior with distinct managers), and 6 superpower tactical dogmas (Spain, Italy, Germany, France, Argentina, Brazil).
  * `src/v2/transfers/transferMarketEngine.ts` (~280 lines): AI player valuation, contract durations, wage demands, mobile-first transfer offer breakdown (tactics, formation, desired role u17/u20/reserves/rotation/starter/key, positional competitors list, development tier), and interactive contract negotiation event (wages, signing bonus, goal/assist/trophy bonuses, release clause).
  * `src/v2/transfers/transferOriginEngine.ts` (~220 lines): **Transfer Origin Dynamic:** Partitions offers into Manager-Requested Tactical Signings (85%–90%, starting trust 65–75) vs. Rare Club Figurehead / Presidential Signings (10%–15%, +25% to +50% wage premium, signing bonuses, lower starting trust 40–50, boardroom friction arc).
* **Lean Optimization Guardrails:** Simulations run purely in headless TypeScript; match logs for AI teams are processed on the stack and discarded immediately.
* **Verification Gate:** Simulating a full 38-game season for all 20 global leagues executes in $< 1.2\text{ seconds}$ on low-spec hardware without UI thread lag; transfer offers correctly identify manager vs. figurehead origins and render complete tactical/squad role terms on mobile viewports.

---

#### Phase 4 (Day 4) — Career Store, Card Recycling "Dust" Economy, Bad Reputation Engine, In-Game Wiki & Editors
* **Developer Day Token Budget:** ~95,000 tokens.
* **Core Focus:** Fullscreen career store, card deck collection, duplicate recycling "Dust" engine (calibrated for 5 starter packs), 11 core meta-upgrades, Bad Reputation engine with club loyalty offset and behavioral locks, 6-Category Silverware Cabinet, the 7-volume In-Game Wiki Compendium, and player/team editors with live card preview.
* **Target File Deliverables:**
  * `src/v2/screens/CareerStoreScreen.tsx` (~290 lines): Tiers 1–6 store items, boots, energy drinks, and 5 business investment templates, plus dedicated 6-Category Silverware & Trophy Cabinet viewer (`individual`, `world`, `continental`, `national`, `youth`, `friendly`).
  * `src/v2/cards/cardDustEngine.ts` (~220 lines): Duplicate recycling algorithms (Bronze 25, Silver 100, Gold 200, Legendary 500, Iconic 1,000, Double-edged 50/50 rolls, Epic Upgrade starter pack conversion), "Recycle All Duplicates" preserving 1 copy of every card.
  * `src/v2/screens/CardStoreUpgradesScreen.tsx` (~310 lines): Main Menu Card Store with dedicated `[⚡ Upgrades]` tab, animated Dust Meter, and all 11 core Dust Upgrades catalog (Tactical Reroll, Prodigy Boost, Extra Draws).
  * `src/v2/reputation/badReputationEngine.ts` (~220 lines): Bad Reputation tiers (0 to III), 2-year (-1 tier) and 5-year (-2 tiers) club tenure loyalty offsets, instant offset shatter on any bad rep gain with Season 0 reset, and Tier I+ behavioral locks (forced cheat/refuse on special diets, rebellious choices).
  * `src/v2/wiki/DrawStarWikiScreen.tsx` (~320 lines): Fullscreen 32-bit in-game encyclopedia compendium with all 7 volumes chronologically organized by relevance (Vol I: Youth Dev & Dynamic Weight [Ages 10-20] $\rightarrow$ Vol II: Attributes & ⚡ Stat Breaks $\rightarrow$ Vol III: Tactics & Playstyles $\rightarrow$ Vol IV: Transfers & Contract Negotiations $\rightarrow$ Vol V: Bad Reputation & Club Loyalty $\rightarrow$ Vol VI: Glory, Ballon d'Or & Retirement $\rightarrow$ Vol VII: Lifecycle Cards [Parent $\rightarrow$ Street $\rightarrow$ Youth $\rightarrow$ Career $\rightarrow$ Lifestyle $\rightarrow$ Sponsor $\rightarrow$ Agent $\rightarrow$ Cultural] & Duplicate Dust Economy), instant fuzzy keyword search, and console L1/R1 bumper navigation (`wikiDataRegistry.ts`).
  * `src/v2/screens/PlayerEditorScreen.tsx` (~320 lines): Live 32-bit card view, stat calibration, archetype selection, and deep-link navigation between player and club rosters.
  * `src/v2/editor/optionFileExporter.ts` (~160 lines): Clean JSON export/import for custom squads, player faces, and tournament structures.
* **Lean Optimization Guardrails:** Card upgrade catalog and Wiki knowledge base structured as static immutable definitions in `dustUpgradeRegistry.ts` and `wikiDataRegistry.ts`.
* **Verification Gate:** Opening packs, recycling duplicates, and purchasing the 1,000 Dust upgrades works seamlessly with state saved to profile; In-Game Wiki searches and switches volumes instantaneously at $< 150\text{ KB}$ RAM overhead.

---

#### Phase 5 (Day 5) — Fullscreen Dressing Room, Dynamic Strength Morphing & Pitch Sprites
* **Developer Day Token Budget:** ~80,000 tokens.
* **Core Focus:** Interactive fullscreen dressing room, real-time strength-based body morphing preview, lightweight procedural appearance seeds for player and NPCs, and dynamic 2D canvas sprite sheet generator for matchday gameplay.
* **Target File Deliverables:**
  * `src/v2/screens/DressingRoomScreen.tsx` (~310 lines): Fullscreen locker room view with 32-bit animated player avatar, kit switcher, boots, hairstyles, facial hair, tattoos, and earrings.
  * `src/v2/character/strengthMorphPreview.ts` (~180 lines): Dynamic SVG layer scaling for Neck, Traps, Shoulders, and Veins across Strength Tiers 1 to 5.
  * `src/v2/character/appearanceCustomizationSystem.ts` (~240 lines): **64-Bit Procedural Appearance Descriptor (`CompactAppearanceSeed`):** Compact 8-byte bitmask encoding skin tone, hair, facial hair, body physique, kit styling (sleeves, socks height, wrist tape), boots, and accessories for the user player and procedural NPC teammates/opponents with zero memory bloat.
  * `src/v2/graphics/pitchSpriteCompiler.ts` (~280 lines): Pre-renders custom player appearance (hair, skin, kit colors, jersey number) into an optimized 2D off-screen canvas sprite sheet (Run, Kick, Tackle, Celebrate).
* **Lean Optimization Guardrails:** Sprite sheets are rasterized once into a lightweight offscreen canvas buffer, eliminating SVG DOM rendering overhead during 60 FPS matchplay.
* **Verification Gate:** Changing strength tier or kit dynamically updates both the 32-bit dressing room avatar and the compiled pitch sprite sheet; NPC squads render varied appearances with $< 100\text{ KB}$ memory overhead.

---

#### Phase 6 (Day 6) — Playable 2D Pixel Matchday, Standalone Kick Off Mode & Pitch Setup Matrix
* **Developer Day Token Budget:** ~95,000 tokens.
* **Core Focus:** Full 2D top-down arcade matchday (*Sensible Soccer* / *Retro Goal* inspired), Locked Player Perspective in Unique Career with Match Frequency & Difficulty selectors, Standalone Kick Off Mode with Dual Side-by-Side selection, Pitch & Environmental Setup, and modular external gameplay adapter bridge.
* **Target File Deliverables:**
  * `src/v2/match/careerMatchEngagement.ts` (~230 lines): **Locked Player Perspective Engine:** Player controls only their custom footballer. Introduces the **Match Frequency Selector** (`Slow` 100% playable, `Standard` key derbies/knockouts, `Finals Only` silverware deciders) and **Match Difficulty Selector** (`Amateur`, `Semi-Pro`, `Professional`, `World Class`, `Legendary/Icon`).
  * `src/v2/screens/KickOffModeScreen.tsx` (~320 lines): Standalone exhibition mode featuring Dual Side-by-Side team selection (Home vs Away) powered by `UniversalTeamPicker`, local 2P controls, and network multiplayer readiness.
  * `src/v2/match/MatchEnvironmentSetup.tsx` (~260 lines): Comprehensive environmental setup: Match Duration (4–20 mins), Stadium Venue & Stand Customization (4 stands: types, capacities, seat colors & mosaics), Tactical Pitch Dimensions (100m×64m compact to 110m×74m expansive), Goalpost Profiles & Netting, Grass Length (Short, Normal, Long), Turf Quality (Pristine, Normal, Poor with micro-bounces), Pitch Watering Policy (Slick Watered vs Dry Unwatered), Country Seasonality (Snow with orange winter ball & breath vapor for countries with seasons, tropical heat for non-seasonal), Time of Day, Match Ball, Rules (ET+Pens, Golden Goal, Friendly Draw), and AI Difficulty.
  * `src/v2/match/IGameplayEngineAdapter.ts` (~80 lines): Cleanly abstracted interface allowing an external gameplay engine or match simulator program to plug in seamlessly.
  * `src/v2/match/PitchRenderer.ts` (~290 lines): HTML5 Canvas 2D top-down pitch renderer with custom tactical pitch dimensions, turf quality degradation patches (bare mud in 6-yard boxes for poor turf), grass cut mower patterns, goalpost frames with continental box nets, stadium shadow lines, floodlights, and crowd noise visualizers.
  * `src/v2/match/BallPhysicsEngine.ts` (~220 lines): 3D ball arc trajectories, bounce friction, aerial headers, and aftertouch curve spin mechanics.
  * `src/v2/match/PlayerController.ts` (~260 lines): Responsive 360° dribbling, sprint stamina depletion, slide tackle hitboxes, and AI opponent behavior.
  * `src/v2/match/TacticalQteEngine.ts` (~240 lines): Tier 2 SIM Match tactical pause moments (1v1 with goalkeeper, penalty shootout QTE, last-ditch block).
  * `src/v2/screens/MatchdayScreen.tsx` (~320 lines): Fullscreen matchday hub with scoreboard, radar minimap, in-match stamina bars, and post-match rating report.
  * `src/v2/screens/SeasonSummaryScreen.tsx` (~310 lines): **The Sacred Chronological Climax Screen:** Executes strictly as the final event of the sporting season (AFTER continental club finals, World Cup, Eurocopa, Copa América, and youth cups). Displays the glowing 32-bit **Academic Season Qualification Grade (`[ S ]`, `[ A ]`, `[ B ]`, `[ C ]`, `[ D ]`, `[ E ]`, `[ F ]`)**, campaign statistics partitioned into the 6 categories, silverware delta, and manager's final review.
* **Lean Optimization Guardrails:** Zero React re-renders during active match loops; canvas updates run strictly inside an isolated `requestAnimationFrame` loop.
* **Verification Gate:** Playable matchday achieves stable 60 FPS on Balanced/Performance presets; locked player perspective functions smoothly; Match Frequency filter correctly skips routine fixtures to finals when set.

---

#### Phase 7 (Day 7) — Cinematic Engine, Phone Calls, Career Epitaphs & Yashin Gala Presentation
* **Developer Day Token Budget:** ~85,000 tokens.
* **Core Focus:** Dynamic theming UI per competition, the 5 canonical high-impact Phone Call events (including Homesick Family Call and Continental Flight Fatigue), Cinematic Presentation Engine, Yashin Trophy Gala, Post-Final News Headline Priority Ladder, and 6-Category Career Retirement Epitaph ranking.
* **Target File Deliverables:**
  * `src/v2/events/phoneCallSystem.ts` (~290 lines): Interactive phone call UI with caller ID audio chimes, handling Mega-Club Suitors, Maiden National Call-Up, Saudi Bag, Boyhood Return, and the 5% Annual Homesick Call with continental flight fatigue penalty matrix.
  * `src/v2/retirement/retirementTestimonialMatch.ts` (~320 lines): **The Farewell Testimonial Match Engine:** Unlocks at Icon Tier 5+; tracks 5 lifetime comrade categories (Longest Comrades, Top Playmakers, Chief Beneficiaries, Silverware Captains, Youth Cohort); generates interactive **"Invite Players" Screen** to select **32 legends** (16 vs 16); customizes team style (National, Main Club, Home Club) and kits; scales to 3 Testimonial Tiers (Local Hero, Continental Legend, Global GOAT); features playable exhibition, emotional fan chants, and the 80th-minute Guard of Honor substitution.
  * `src/v2/cinematics/originCinematicEngine.ts` (~260 lines): Age 10 Origin Progression fusing Parent Card Tier scaling (Bronze middle-class $\rightarrow$ Iconic billionaire/royalty) across all 8 Archetype origin prologues (Speedster stopwatch sprints, Tank mud collisions, Flair street dancing, Architect kitchen tactics, Ice-Cold unblinking Panenka, Patient brick wall repetitions, Cannon shattered fences, and the comic/tragic Wasted Talent red card disaster starting locked at Bad Rep Tier 1).
  * `src/v2/cinematics/cinematicSystem.ts` (~290 lines): Landmark fullscreen spectacles: Tournament Draws, Ballon d'Or Gala, **The Yashin Trophy Gala**, **First Pro Contract Signing** (boardroom scarf unveiling), **First Senior Match Debut** (tunnel lights & 4th official board), Mega-Signing Stadium Unveiling, Dynasty Coronation, and Farewell Testimonial Lap of Honor.
  * `src/v2/news/headlinePriorityEngine.ts` (~210 lines): Post-final news generation resolving priority (Hat-trick hero > 90th+ min Remontada > Penalty shootout heart-stopper > Goalkeeper fortress).
  * `src/v2/epitaph/careerEpitaphSystem.ts` (~280 lines): Retirement broadsheet resolving the Global Prestige Ladder (Real Madrid > Brazil > Barcelona > Germany > Argentina > Bayern > Liverpool > Milan > Inter > Spain > France > Man United > 1 Ballon d'Or > Boca > River > Arsenal...) across all 6 competitive categories.
* **Lean Optimization Guardrails:** Reusable modal-free fullscreen templates; procedural chiptune audio synthesizers require 0 external audio assets.
* **Verification Gate:** Simulating career retirement triggers the correct ranked epitaph title based on trophy and icon stature; phone calls and cinematics trigger on key milestones.

---

#### Phase 8 (Day 8) — Packaging, PWA Offline Service Worker, 5 Languages & Final QA
* **Developer Day Token Budget:** ~75,000 tokens.
* **Core Focus:** 100% offline PWA caching, Capacitor/Tauri configuration, the 3 graphic quality presets, complete 5-language localization verification (including Kick Off environments and 6 trophy categories), and final system integration.
* **Target File Deliverables:**
  * `src/v2/localization/locDictionary.ts` (~320 lines): Complete 5-language synchronized vocabulary (`es_ES`, `es_AR`, `en_GB`, `pt_BR`, `fr_FR`) across all 6 trophy categories, Kick Off settings, and console UI strings.
  * `src/v2/quality/graphicPresetEngine.ts` (~160 lines): Real-time switching between Performance (flat rectangles, 0 shadows, 0 blurs), Balanced (32-bit pixel corners, CRT scanlines), and High Quality (frosted glass, dynamic bloom).
  * `src/serviceWorker.ts` / PWA cache configuration (~120 lines): Offline caching for all chiptune audio, fonts, and assets.
  * `src/v2/save/saveGameManager.ts` (~210 lines): Multi-slot career save manager with auto-save, checksum verification, and JSON backup export/import.
  * Final launcher cutover in `src/App.tsx`.
* **Lean Optimization Guardrails:** Zero unused dead code; all legacy 1.0 references cleanly partitioned.
* **Verification Gate:** `compile_applet` and `lint_applet` pass with 0 errors; full playthrough from Startup Flow to Kick Off and Matchday runs offline with 0 network dependencies.

---

## 28. THE CARD RECYCLING "DUST" ECONOMY & STORE UPGRADES ENGINE

### A. The Core Principle: Duplicate Discard & "Dust" Conversion
In DrawStar Remake 2.0, card packs opened with Champion Credits frequently yield duplicate copies. Rather than letting repeated cards clutter player decks or dilute active career draw probability without utility, players can dismantle duplicate copies into **"Dust"** (a precious crafting and meta-progression currency).

* **The Sacred Preservation Rule:** Hitting `[♻️ Recycle All Duplicates]` in the DECK / Card Collection album **always preserves exactly one copy of every unlocked card**. Only repeated surplus copies ($\text{OwnedCount} - 1$) are pulverized into Dust.
* **Granular Discard Option:** Players can also inspect individual cards in the Album view and choose `[Recycle 1 Duplicate (+X Dust)]` to manually trim specific cards down to their desired copy count.

---

### B. Mathematical Dust Valuation by Card Tier & Category

The amount of Dust yielded by recycling a card is strictly determined by its tier, effect category, and risk profile:

| Tier / Card Family | Category | Recycling Dust Yield | Mathematical Behavior / Rule |
| :--- | :--- | :--- | :--- |
| **🥉 Bronze (Tier 1)** | Positive | **25 Dust** | Base baseline for entry-tier cards. |
| **🥈 Silver (Tier 2)** | Positive | **100 Dust** | $4\times$ Bronze yield. |
| **🥇 Gold (Tier 3)** | Positive | **200 Dust** | $8\times$ Bronze yield. |
| **👑 Legendary (Tier 4)** | Positive | **500 Dust** | Premier milestone yield. |
| **💎 Iconic (Tier 5 / GOAT)** | Masterpiece | **1,000 Dust** | Instantly funds one full Store Upgrade on duplicate salvage! |
| **🗑️ Scrap (Tier 1 Negative)** | Negative Hazard | **12.5 Dust** | Bronze tier halved ($25 / 2 = 12.5$). Decimal precision preserved. |
| **⚙️ Rust (Tier 2 Negative)** | Negative Hazard | **50 Dust** | Silver tier halved ($100 / 2 = 50$). |
| **🔥 Ash (Tier 3 Negative)** | Negative Hazard | **100 Dust** | Gold tier halved ($200 / 2 = 100$). |
| **☠️ Disaster (Tier 4 Negative)** | Catastrophe | **1 Dust** | Fixed token penalty yield (worthless wreckage). |
| **🗡️ Obsidian Knife (Tier 1)** | Double-Edged | **50% chance of 1 Dust / 50% chance of 50 Dust** | Regular Bronze (25) doubled is 50. Expected Value: $0.5(1) + 0.5(50) = \mathbf{25.5\text{ Dust}}$. |
| **🥉🗡️ Copper Dagger (Tier 2)** | Double-Edged | **50% chance of 1 Dust / 50% chance of 200 Dust** | Regular Silver (100) doubled is 200. Expected Value: $0.5(1) + 0.5(200) = \mathbf{100.5\text{ Dust}}$. |
| **⚔️ Steel Blade (Tier 3)** | Double-Edged | **50% chance of 1 Dust / 50% chance of 400 Dust** | Regular Gold (200) doubled is 400. Expected Value: $0.5(1) + 0.5(400) = \mathbf{200.5\text{ Dust}}$. |
| **👹🗡️ Muramasa Blade (Tier 4)** | Cursed Masterpiece | **50% chance of 1 Dust / 50% chance of 1,000 Dust** | Regular Tier 4 (500) doubled is 1,000. Expected Value: $0.5(1) + 0.5(1000) = \mathbf{500.5\text{ Dust}}$. |

* **Live Roll Implementation:**
  When recycling batch duplicates, each individual Double-Edged card rolls a live independent uniform random boolean (`Math.random() < 0.5`). If true, it yields double its standard tier dust; if false, it yields exactly 1 Dust. In preview dialogs, the UI displays the expected mathematical average so players know their estimated return prior to confirming.

---

### C. Main Menu Card Store: Dedicated "Upgrades" Section
In the Main Menu Card Store (accessible from the main navigation, **completely separate** from the in-run Unique Career Store where items like Energy Drinks and Boots are purchased with player cash), the store window features two distinct 32-bit primary sections:
1. `[🃏 Card Packs]`: Purchase Starter Packs, Basic Category Packs, and Epic Upgrade Packs with Champion Credits.
2. `[⚡ Upgrades]`: Purchase permanent, career-wide meta-progression perks with accumulated **Dust**.

#### Header Dust Meter
Beside the Champion Coins counter (`🪙 Champion Coins Balance`), the store header renders a glowing, animated **Dust Meter**:
$$\text{✨ [Dust Meter]: } \mathbf{1,250\text{ Dust}} \quad \text{• [♻️ Go to Deck to Recycle]}$$

---

### D. The 11 Core Dust Upgrades Catalog (Cost: 1,000 Dust Each)

All upgrades are persistent across all saves and profile runs once unlocked:

| Upgrade ID | Name & Visual Icon | Dust Cost | Mechanical In-Game Benefit |
| :--- | :--- | :--- | :--- |
| `reroll_runs` | 🎲 **Tactical Reroll Protocol** | **1,000 Dust** | Unlocks the in-run **Reroll Button** on all card selection events (Parents, Youth, Street, Career Stage). Each reroll in a run costs **5 Champion Coins** from the player's wallet and rolls a fresh hand. Without this upgrade, rerolls are locked with a tooltip prompt directing the player to the Upgrades Store. |
| `starting_stats_boost_15` | ⚡ **Prodigy Talent Surge** | **1,000 Dust** | Permanently grants **+15 bonus starting stat attribute points** when initializing any new career run (starting unassigned pool increases from 5 to **20 points** in Character Creation). |
| `extra_draw_parents` | 👨‍👩‍👦 **Heritage Choice Expansion** | **1,000 Dust** | Expands the origin Parent Card selection from 3 cards to **4 cards** (Draw 4, Pick 1), dramatically increasing the chance of rolling rare bloodlines. |
| `extra_draw_youth` | 🏆 **Youth Academy Scouting Net** | **1,000 Dust** | Expands Youth Academy developmental milestone card events from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_career` | 🛡️ **Career Stage Horizon** | **1,000 Dust** | Expands Pre-Season & Mid-Season Career Stage card events from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_sponsor` | 💼 **Commercial Deal Roster** | **1,000 Dust** | Expands commercial sponsor contract negotiations from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_life` | ✨ **Lifestyle Spotlight** | **1,000 Dust** | Expands off-pitch lifestyle and publicity events from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_agent` | 🤝 **Boardroom Advisory Network** | **1,000 Dust** | Expands agent contract negotiations and advisory proposals from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_street` | 🔥 **Street Cage Radar** | **1,000 Dust** | Expands concrete street football cage challenge draws from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_match_day` | ⚡ **Clutch Matchday Intel** | **1,000 Dust** | Expands matchday condition modifier draws from 3 to **4 cards** (Draw 4, Pick 1). |
| `extra_draw_interview` | 🎙️ **Press Room Charisma** | **1,000 Dust** | Expands post-match media press room soundbite draws from 3 to **4 cards** (Draw 4, Pick 1). |

---

### E. Rigorous Cost Analysis: Is 1,000 Dust Too Little or Too Much?

To ensure the game feels rewarding rather than either trivial or an unplayable grind, let us analyze the exact mathematical economy of Dust generation across the game loop:

#### 1. How Much Dust Does a Pack Yield?
* **Starter Packs (1-Time 100% FREE Claims for New Players, 0 Coins):**
  * *Bronze Starter (50 cards, 0 Coins Free):* The canonical bronze pool contains ~15 unique cards. 50 cards rolled across 15 cards yields $\approx 35\text{ duplicates}$.
    $$35 \times 25\text{ Dust} = \mathbf{875\text{ Dust}}$$
  * *Silver Starter (25 cards, 0 Coins Free):* Yields $\approx 15\text{ duplicates} \times 100\text{ Dust} = \mathbf{1,500\text{ Dust}}$.
  * *Gold Starter (15 cards, 0 Coins Free):* Yields $\approx 8\text{ duplicates} \times 200\text{ Dust} = \mathbf{1,600\text{ Dust}}$.
  * *Double-Edged Starter (50 cards, 0 Coins Free):* Yields $\approx 30\text{ duplicates} \times \approx 100\text{ Dust avg} = \mathbf{3,000\text{ Dust}}$.
  * *EPIC Upgrade Starter (25 cards, 0 Coins Free):* High-tier starter seeding 25 cards with guaranteed Legendary/Iconic pulls. Yields $\approx 10\text{ duplicates} \times \approx 350\text{ Dust avg} = \mathbf{3,500\text{ Dust}}$.
* **Basic Store Packs (Continuous 5-card packs for 10 Champion Coins):**
  * In a standard 5-card pack, the drop distribution is:
    * 60% Bronze ($3.0$ cards $\times 25 = 75$ Dust potential)
    * 25% Silver ($1.25$ cards $\times 100 = 125$ Dust potential)
    * 10% Gold ($0.5$ cards $\times 200 = 100$ Dust potential)
    * 4% Legendary ($0.2$ cards $\times 500 = 100$ Dust potential)
    * 1% Iconic ($0.05$ cards $\times 1,000 = 50$ Dust potential)
  * **Gross Dust value of an entire 5-card pack:** $\approx \mathbf{450\text{ Dust per pack}}$ if all cards were duplicates.

#### 2. The Duplicate Accumulation Curve
* **Stage 1: Early Collection (0–40 unique cards owned):**
  * Duplicate rate is low ($\approx 10\%\text{ to }20\%$).
  * Most cards are new and kept in the player's active deck.
  * Dust yield per basic pack: $\mathbf{45\text{ to }90\text{ Dust}}$.
  * Pace to 1,000 Dust: $\approx 12\text{ to }18\text{ basic packs opened}$.
* **Stage 2: Mid Collection (40–100 unique cards owned):**
  * Duplicate rate reaches $\approx 40\%\text{ to }60\%$.
  * Dust yield per basic pack: $\mathbf{180\text{ to }270\text{ Dust}}$.
  * Pace to 1,000 Dust: $\approx 4\text{ to }5\text{ basic packs opened}$ ($40\text{ to }50\text{ Champion Credits}$).
* **Stage 3: Late Collection (100+ unique cards owned):**
  * Duplicate rate reaches $\approx 80\%\text{ to }90\%$.
  * Dust yield per basic pack: $\mathbf{360\text{ to }405\text{ Dust}}$.
  * Pace to 1,000 Dust: $\approx 2.5\text{ to }3\text{ basic packs opened}$ ($25\text{ to }30\text{ Champion Credits}$).

#### 3. Verdict: 1,000 Dust is the Perfect "Sweet Spot"
* **Why it is NOT too little:**
  * If upgrades cost only 200–500 Dust, purchasing just one Bronze Starter Pack would allow the player to unlock 4 to 8 permanent game-changing upgrades instantly within the first 5 minutes of play, completely collapsing the roguelite meta-progression progression loop.
* **Why it is NOT too much:**
  * Starting with 0 Champion Coins and free starter packs claimed during the initial tutorial, 1,000 Dust requires opening just 4–6 standard packs once a base collection is seeded from your first earned career coins.
  * Unlocking all 11 core upgrades costs a total of **11,000 Dust**, requiring approximately 35–45 pack openings total.
  * This matches the exact duration of a player's first 2 to 3 career playthroughs, providing constant, satisfying milestones between seasons.

---

## 29. THE KICK OFF MODE & UNIVERSAL 5-TIER HIERARCHICAL TEAM SELECTOR FRAMEWORK

To provide immediate exhibition gameplay independent of career mode, DrawStar Remake 2.0 features a standalone, console-grade **Kick Off Mode** powered by the **Universal 5-Tier Hierarchical Team Selector Framework**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │     DUAL SIDE-BY-SIDE KICK OFF SELECTION STACK         │
                       └────────────────────────────────────────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
     [HOME / PLAYER 1 (USER)]                                              [AWAY / PLAYER 2 (CPU)]
     • Category: Clubs / Nations                                           • Category: Clubs / Nations
     • Confederation: UEFA, CONMEBOL...                                    • Confederation: UEFA, CONMEBOL...
     • Country ➔ League ➔ Team                                             • Country ➔ League ➔ Team
     • Crest, Kit, Tactical Formation                                      • Crest, Kit, Tactical Formation
```

### A. Core Architecture & Gameplay Engine Bridge

1. **Dual Side-by-Side Selection Screen (`KickOffModeScreen.tsx`):**
   * Two independent interactive team selection panels displayed simultaneously:
     * **Left Panel:** Home Team / Player 1 (defaults to User Player's current career club or boyhood team).
     * **Right Panel:** Away Team / Player 2 or CPU (with randomized "Quick Match" rival selector button).
   * Displays live 32-bit animated kit previews, team crests, overall team star rating (1–5 Stars), and key star players.

2. **Future-Proofed Multiplayer Compatibility (Local & Online Network Staging):**
   * **Local 2-Player Play:** Supports two gamepads or split Keyboard/Gamepad controls (Player 1 WASD + Space; Player 2 Arrows + Enter).
   * **Online Multiplayer Architectural Readiness:**
     * The match state machine is completely decoupled into a pure serializable state:
       ```typescript
       export interface KickOffMatchState {
         matchId: string;
         homeTeamId: string;
         awayTeamId: string;
         score: [number, number];
         gameClock: number; // In simulated match seconds
         events: MatchEvent[];
         possessionTeam: 'home' | 'away';
         environment: MatchEnvironmentConfig;
       }
       ```
     * Can be transmitted cleanly via lightweight peer-to-peer WebRTC data channels or WebSocket room relays without rewriting the UI or physics.

3. **Modular External Gameplay Integration Bridge (`IGameplayEngineAdapter`):**
   * Designed to effortlessly host an external gameplay engine or simulation program:
     ```typescript
     export interface IGameplayEngineAdapter {
       initializeMatch(config: KickOffMatchConfig): Promise<void>;
       startMatch(): void;
       pauseMatch(): void;
       resumeMatch(): void;
       sendPlayerInput(playerId: string, input: ControllerInput): void;
       onMatchEvent(listener: (event: MatchEvent) => void): void;
       onMatchComplete(listener: (result: MatchSummary) => void): void;
     }
     ```
   * When the external gameplay module is connected, it plugs into this contract in $< 50$ lines of integration code.

---

### B. The Universal 5-Tier Hierarchical Team Selector Framework (`UniversalTeamPicker.tsx`)

To avoid duplicating selection trees across the codebase, the team picker is built as a single, highly optimized, reusable 5-tier hierarchical component:

```
[Tier 1: Category] ──► [Tier 2: Confederation] ──► [Tier 3: Country] ──► [Tier 4: League/Tier] ──► [Tier 5: Team Selection]
• Clubs                • Europe (UEFA)            • England, Spain...   • Top Flight (D1)           • Crest, Kits, OVR
• National Teams       • South America (CONMEBOL) • Brazil, Argentina...• Second Tier (D2)          • Tactical Formation
• Special (Future)     • North America (CONCACAF) • USA, Mexico...      • Domestic Cups             • Star Players
                       • Asia (AFC)               • Japan, S. Korea...
                       • Africa (CAF)             • Nigeria, Senegal...
                       • Oceania (OFC)            • New Zealand...
```

#### 1. The 5 Drill-Down Tiers:
* **Tier 1 — Category / Entity Type:**
  * `Clubs` (Domestic & Continental club teams).
  * `National Teams` (Senior men's national teams & youth squads).
  * `Special` (*Disabled / Locked for future release* — Classic historical teams, All-Star World XIs).
* **Tier 2 — Continental Confederation (6 Global Regions):**
  * 🇪🇺 **Europe (UEFA):** England, Spain, Italy, Germany, France, Netherlands, Portugal, Scotland, Turkey, Belgium, etc.
  * 🌎 **South America (CONMEBOL):** Brazil, Argentina, Colombia, Uruguay, Chile, Ecuador, Paraguay, Peru, Bolivia, Venezuela.
  * 🌎 **North America & Caribbean (CONCACAF):** USA, Mexico, Canada, Costa Rica, Jamaica, Honduras, Panama.
  * 🌏 **Asia (AFC):** Japan, South Korea, Saudi Arabia, Australia, Iran, Qatar, UAE.
  * 🌍 **Africa (CAF):** Nigeria, Senegal, Morocco, Egypt, Ghana, Cameroon, Ivory Coast, Algeria, South Africa.
  * 🌊 **Oceania (OFC):** New Zealand, Fiji, Tahiti, Solomon Islands, Papua New Guinea.
* **Tier 3 — Country Selection:**
  * Selects the sovereign nation within the active confederation.
* **Tier 4 — League / Competition Tier Selection:**
  * For Clubs: Division 1 (Top Flight), Division 2 (Second Division), Domestic Cups.
  * For National Teams: Senior Squad, U-20 Squad, U-17 Squad.
* **Tier 5 — Team Selection:**
  * Displays the final club/national team card: Club Crest, Primary & Away Kits, Overall Stars (★☆☆☆☆ to ★★★★★), Offensive/Defensive ratings, and tactical formation.

#### 2. Universal Reusability Across the Game
The exact same `UniversalTeamPicker.tsx` component powers:
1. **Kick Off Mode:** Dual team selection for home and away.
2. **Boyhood / Home Club Selection:** When an event prompts the player to pick their beloved hometown club (`homeClubSystem.ts`).
3. **Profile Avatar Emblem:** When choosing an official club crest for your player profile or card aesthetic.
4. **Transfer Shortlist & Rivalry Selection:** When identifying preferred future destinations or bitter cross-town rivals.

---

### C. Match Environment, Pitch Conditions & Rules Configuration Matrix (`MatchEnvironmentSetup.tsx`)

Once teams are selected, players configure the comprehensive matchday environment:

| Environmental Setting | Available Options | Direct Gameplay & Simulation Impact |
| :--- | :--- | :--- |
| **Match Duration** | `4 Min`, `6 Min`, `8 Min`, `10 Min`, `12 Min`, `15 Min`, `20 Min` | Scales match simulation pace, stamina depletion rate, and scoring frequency. |
| **Stadium Venue** | `Cathedral of Football`, `Coastal Arena`, `Metropolitan Dome`, `Historic Terrace`, `Rain Forest Pitch`, `High-Altitude Bowl` | Influences crowd noise visualizer, camera angle tilt, and home field advantage atmosphere. |
| **Grass Length** | `Short`, `Medium`, `Long` | • **Short:** Ball rolls ultra-fast; slick low ground passes.<br>• **Medium:** Standard balanced friction and natural bounce.<br>• **Long:** High drag; slows ground balls, encourages aerial crosses and physical challenges. |
| **Grass Status** | `Normal`, `Wet`, `Dry` | • **Normal:** Standard pitch firmness.<br>• **Wet:** Ball skids forward rapidly; slide tackles travel 30% further; water splash particles.<br>• **Dry:** Higher rebound bounce; passes slow down quickly; slightly increases player fatigue. |
| **Weather** | `Clear / Sunny`, `Rain`, `Heavy Rain`, `Snow` | • **Clear:** Pristine visibility and optimal handling.<br>• **Rain:** Light precipitation, slick pitch.<br>• **Heavy Rain:** Mud patches form; ball decelerates in puddles; kit uniforms get mud-stained.<br>• **Snow:** Turf turns white with red penalty lines; **High-Visibility Neon Orange Ball** spawns automatically; players emit visible breath vapor. |
| **Time of Day** | `Morning`, `Afternoon`, `Dusk / Sunset`, `Night` | • **Morning:** Long eastward shadows.<br>• **Afternoon:** Overhead bright illumination.<br>• **Dusk:** Dramatic golden-hour lighting; stadium floodlights activate.<br>• **Night:** Full floodlight illumination against pitch-black night skies. |
| **Match Ball** | `Classic 32-Panel B&W`, `Hi-Vis Winter Orange`, `Modern Aerodynamic`, `Vintage 1970 Leather` | Visual aesthetic and retro arcade flavor. |
| **Extra Time & Penalties** | `Extra Time + Penalties`, `Direct to Penalties`, `Golden Goal`, `Draw Allowed (Friendly)` | Determines knockout resolution in the event of a tie. |
| **Substitutions** | `3 Subs`, `5 Subs (3 Windows)`, `Unlimited (Friendly)` | Governs tactical bench rotation and fresh legs management. |
| **AI Difficulty** | `Amateur`, `Semi-Pro`, `Professional`, `World Class`, `Legendary` | Calibrates opponent pressing intensity, passing precision, and defensive anticipation. |

---

### D. Tactical Pitch Dimension Architecture, Boundaries & Goalposts (`pitchTacticsSystem.ts`)

In DrawStar Remake 2.0, pitch dimensions are not uniform cosmetic placeholders. They represent authentic tactical battlegrounds directly affecting match physics, space congestion, passing angles, and stamina consumption:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PITCH DIMENSION TACTICAL MATRIX                                       │
├──────────────────────┬──────────────────────────────┬──────────────────────────────────────────────────┤
│ Pitch Preset         │ Dimensions (Length × Width)  │ Tactical Gameplay Impact                         │
├──────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Small / Compact   │ 100m × 64m                   │ • Favors defensive blocks, pressing & long-ball  │
│    (e.g., Burnley)   │ (Legal IFAB Minimum)         │   teams.                                         │
│                      │                              │ • Compresses midfield channels; reduces passing  │
│                      │                              │   angles.                                        │
│                      │                              │ • Aerial long passes and direct duels become     │
│                      │                              │   lethal.                                        │
├──────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ 2. Balanced          │ 105m × 68m                   │ • Standard international tournament & UEFA       │
│    (Standard)        │ (FIFA Benchmark)             │   specification.                                 │
│                      │                              │ • Symmetrical spacing for both wide and central  │
│                      │                              │   play.                                          │
├──────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ 3. Wide / Expansive  │ 110m × 74m                   │ • Favors possession, tiki-taka & wide wingers.   │
│    (e.g., Barcelona) │ (Legal IFAB Maximum)         │ • Stretches low blocks; opens huge half-spaces   │
│                      │                              │   for runs.                                      │
│                      │                              │ • Requires higher player Stamina to cover ground.│
├──────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ 4. Custom Dimension  │ Sliders within               │ • Fully configurable within 90m–120m length and  │
│                      │ 90–120m × 45–90m             │   45m–90m width limits.                          │
└──────────────────────┴──────────────────────────────┴──────────────────────────────────────────────────┘
```

#### 1. Tactical Strategic Deployment
* **Defensive / Underdog Tactics:** Underdog and defensive clubs intentionally construct compact pitches ($100\text{m} \times 64\text{m}$) to congest space, strangle passing lanes for elite playmakers, and turn matches into physical aerial duels.
* **Possession & High-Press Tactics:** Dominant attacking teams maximize pitch width ($110\text{m} \times 74\text{m}$) to force compact low blocks to stretch horizontally, creating massive half-space pockets for overlapping fullbacks and inverted wingers.

#### 2. Goalpost Customization & Options (Within IFAB $7.32\text{m} \times 2.44\text{m}$ Boundaries)
Goalposts and net setups are customizable per club within official regulatory limits:
* **Post Profiles:**
  * **Round Classic Steel:** Traditional cylindrical white posts with signature metallic rebound acoustic.
  * **Modern Oval Aluminum:** Aerodynamic elliptical crossbars designed for modern elite arenas.
  * **Retro Square Profile:** Historic 1970s squared wooden-style posts producing dramatic deflection angles.
* **Net Suspension & Stanchions:**
  * **Continental Box Nets:** Deep rectangular netting suspended from exterior tension poles (standard in European elite arenas; produces a satisfying ball ripple).
  * **Standard Triangular Nets:** Classical angled netting tied directly to ground pegs.
  * **Shallow Municipal Nets:** Compact box nets found in historic community stadiums.
* **Netting Mesh Patterns & Colors:**
  * Single-color white or black honeycomb hexagonal mesh.
  * Classic square grid netting.
  * Dual-tone club-striped netting matching home team identity (e.g. Red-White, Blue-White, Green-White).

---

### E. The Three Turf Quality Grades, Grass Cut & Matchday Watering Management

Pitch quality is an active operational investment that costs money to install and maintain from the club groundskeeping budget:

#### 1. The Three Turf Quality Grades
1. **Pristine / High-End Turf (€€€ High Groundskeeping Budget):**
   * *Features:* Hybrid reinforced fibers (GrassMaster), laser-graded sub-base, heated underground pipes, and precision drainage.
   * *Gameplay Impact:* Ultra-smooth, true ball roll; zero unexpected bobbles; high durability against divot gouging; withstands heavy rain without waterlogging.
2. **Normal Turf (€€ Standard Budget):**
   * *Features:* Natural rye/bluegrass turf maintained under standard municipal care.
   * *Gameplay Impact:* Balanced rolling friction; authentic divot wear during intense matches; true ball bounce.
3. **Poor Quality Turf (€ Low Maintenance / Neglected Budget):**
   * *Features:* Sparse natural grass with bare soil patches; uneven grading; lack of drainage systems.
   * *Visual Presentation:* Match kicks off with visible dry, bare, brown patches in the 6-yard goalmouth boxes, center circle spot, and heavily trafficked touchlines.
   * *Gameplay Impact:* Generates unpredictable **micro-bounces and sudden ball hops** that disrupt smooth ground passing; degrades twice as fast under slide tackles, leaving bare mud craters and dirt clouds.

#### 2. Grass Length (Mower Cut)
* **Short Cut:** Ball rolls faster and further; ground passes zip across the turf; promotes rapid one-touch transition attacks and quick counter-attacks.
* **Normal Cut:** Standard balanced rolling resistance and natural deceleration.
* **Long Cut:** Noticeable roll friction; ground passes decelerate quickly; sprinting players burn stamina slightly faster due to turf drag; heavily favors aerial crossing and physical target men.

#### 3. Matchday Pitch Watering Tactics (Pre-Match & Halftime Watering Policy)
Clubs establish an institutional matchday watering directive reflecting their tactical identity:
* **Heavily Watered / Slick Pitch (`slick_watered`):**
  * Ground staff douse the turf thoroughly 15 minutes before kickoff and during halftime.
  * Creates a micro-slick surface film: ball skids rapidly on ground passes, slide tackles travel 30% further, and quick one-touch passing reigns supreme. Favored by tiki-taka, possession, and high-tempo passing clubs.
* **Balanced / Standard (`balanced`):**
  * Light regulatory watering ensuring natural traction and ball grip.
* **Dry Turf / Unwatered (`dry_unwatered`):**
  * Pitch is deliberately kept unwatered and bone-dry by defensive or physically dominant clubs.
  * High rolling friction kills the pace of low passes; ball bobbles unpredictably, disrupting the passing rhythm of elite visiting teams and leveling the playing field.

---

### F. Complete Team Information & Infrastructure Schema (`teamSystem.ts` & `clubData.ts`)

To ensure seamless integration across both the current career simulation and future interactive match engines, every team in the database contains comprehensive infrastructure and environmental data:

```ts
export interface StandProfile {
  standId: 'north' | 'south' | 'east' | 'west';
  standName: string; // e.g., "The Kop", "Curva Nord", "Main Grandstand"
  standType: 'terrace_standing' | 'traditional_tiered' | 'modern_cantilever' | 'triple_tier_arena' | 'luxury_suite_tower' | 'open_air_bleachers';
  capacity: number;
  seatColorPrimary: string; // Hex color (e.g. "#DC052D")
  seatColorAccent: string;
  mosaicPattern: 'solid' | 'checkered' | 'club_lettering' | 'striped';
  mosaicText?: string; // e.g., "FCB", "1899"
  hasExecutiveSuites: boolean;
}

export interface StadiumProfile {
  stadiumId: string;
  stadiumName: string;
  cityName: string;
  stands: {
    north: StandProfile;
    south: StandProfile;
    east: StandProfile;
    west: StandProfile;
  };
  totalCapacity: number;
  isContinentalCompliant: boolean; // Must meet UEFA/CONMEBOL criteria
  loanedContinentalStadium?: {
    stadiumName: string;
    cityName: string;
    capacity: number;
    perMatchLeaseFee: number; // In Euros
  };
  ticketPriceBase: number;
  hospitalityMultiplier: number;
}

export interface PitchProfile {
  lengthMeters: number; // 90m to 120m
  widthMeters: number;  // 45m to 90m
  dimensionPreset: 'compact' | 'balanced' | 'expansive' | 'custom';
  goalpostProfile: 'round_classic' | 'oval_modern' | 'square_retro';
  netSuspension: 'continental_box' | 'standard_triangular' | 'shallow_municipal';
  netMeshPattern: 'hexagonal' | 'square' | 'striped_dual_tone';
  netColorPrimary: string;
  netColorSecondary?: string;
  turfQuality: 'pristine' | 'normal' | 'poor';
  grassLength: 'short' | 'normal' | 'long';
  wateringPolicy: 'slick_watered' | 'balanced' | 'dry_unwatered';
  annualMaintenanceCost: number; // Groundskeeping operational expense
}

export interface ClubProfile {
  clubId: string;
  clubName: string;
  shortName: string;
  countryId: string; // References CountrySeasonalityProfile (hasSeasons, winterMonths)
  leagueId: string;
  stadium: StadiumProfile;
  pitch: PitchProfile;
  primaryTactics: {
    formation: string; // e.g., "4-3-3", "4-4-2", "3-5-2"
    playstylePreference: string;
    defensiveBlock: 'low_block' | 'mid_block' | 'high_press';
  };
}
```

---

---

## 30. IN-GAME WIKI & COMPENDIUM ARCHITECTURE ("THE DRAWSTAR ENCYCLOPEDIA")

To ensure players have complete transparency over all game systems without needing external web guides, DrawStar Remake 2.0 incorporates a fully integrated, offline, console-styled **In-Game Wiki & Compendium** (`src/v2/wiki/DrawStarWikiScreen.tsx` & `src/v2/wiki/wikiDataRegistry.ts`).

### A. Core Architecture & Design Philosophy
* **Offline & Instant:** Compiles 100% of game rules, tables, and algorithms directly from this planning roadmap into immutable client-side TypeScript dictionaries. Requires zero network calls and runs with $< 150\text{ KB}$ heap memory footprint.
* **Console-First Navigation:**
  * Accessible at any moment from the **Main Menu (`[📖 Compendium]`)**, **Career Pause Menu**, and **Career Hub HUD**.
  * Navigated via `[L1]` / `[R1]` shoulder bumpers across 7 categorized volumes, with an instant-filter fuzzy search input (`[Square] Search`).
* **Tactile 32-Bit Presentation:** Styled as a retro leather-bound tactical binder with crisp typography, color-coded attribute tags, and clickable cross-reference links.
* **Strict Roadmap Grounding:** The wiki draws its content directly from the canonical specifications established in this roadmap.

### B. The 7 Canonical Knowledge Volumes (Chronological Career & Lifecycle Order)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE DRAWSTAR FOOTBALL ENCYCLOPEDIA (COMPENDIUM)                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [L1] PREV VOLUME  │  ACTIVE: VOL I — YOUTH DEVELOPMENT & PHYSICAL GROWTH (AGES 10-20)  │ [R1] NEXT VOLUME │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 [SEARCH: "Ideal Weight"]                                          INDEX: 1 / 32 TOPICS              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • VOL I: EARLY PRODIGY DEVELOPMENT, PHYSICAL GROWTH & DYNAMIC WEIGHT (BIRTH TO AGE 20)                 │
│ • VOL II: ATTRIBUTES, PROGRESSION CURVES & THE ⚡ STAT BREAK SYSTEM                                    │
│ • VOL III: TACTICAL FOUNDATIONS: POSITIONS, SUB-POSITIONS & AUTHENTIC PLAYSTYLES                       │
│ • VOL IV: THE PROFESSIONAL TRANSFER MARKET, CONTRACT NEGOTIATIONS & SQUAD ROLES                        │
│ • VOL V: REPUTATION, MORAL DISCIPLINE & CLUB TENURE LOYALTY                                            │
│ • VOL VI: THE GLOBAL GLORY SYSTEM, BALLON D'OR, PRIME, VETERAN DECAY & RETIREMENT CHAMPION POINTS     │
│ • VOL VII: THE CARD COMPENDIUM (CHRONOLOGICAL LIFECYCLE ORDER) & DUPLICATE DUST ECONOMY                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Volume I: Early Prodigy Development, Physical Growth & Dynamic Weight (Birth to Age 20) (From Section 5 & 18)
* **Inherited Baseline at Birth:** Height, weak foot, and genetic foundations drawn from Parent Cards (Section 5.A).
* **Adolescent Growth Curves (Ages 10–18):** Annual growth spurts governed by genetic height ceilings and the strictly realistic $1\text{ cm} = 1\text{ kg}$ biological link.
* **The Canonical Ideal Weight Formula:**
  $$\text{Ideal Weight (kg)} = \text{Height (cm)} - 100$$
  *(Floor-clamped at 40 kg for early academy youth prospects).*
* **The 3 Body Conditioning Zones & Attribute Modifiers:**
  * **Peak Lean Safe Zone ($[\text{Ideal}-5, \text{Ideal}]$):** Optimal footballer athletic build. Zero penalties.
  * **Severe Underweight Zone ($< \text{Ideal}-5$):** Insufficient core muscle mass. Penalty: $-1\text{ Strength}$ per kg below $(\text{Ideal}-5)$.
  * **Overweight Penalty Zone ($> \text{Ideal}$):** Excess body fat and sluggish acceleration. Penalty: $-1\text{ Pace}$ and $-1\text{ Stamina}$ per kg above $\text{Ideal}$.
* **Dynamic Weight Fluctuation Vectors:** Weight shifts dynamically from lifestyle choices (fast food, partying, refusing training increase weight; overtraining and strict diet cards decrease weight).
* **Club Medical Staff Special Diet Directive:**
  * Triggered for contracted professionals when body conditioning deviates into penalty zones.
  * Interactive 3-way decision:
    1. **Strict Adherence:** $+2$ Stamina, $+3$ Fitness recovery/mo, shifts weight towards Ideal by $1.0\text{ kg/mo}$, awards manager trust and staff praise.
    2. **"Cheat" on Diet:** Only $0.5\text{ kg/mo}$ progress, 35% monthly chance of discovery by biometrics/paparazzi resulting in $+10$ Bad Rep, $-15$ Manager Trust, and wage fines.
    3. **Outright Refusal:** Rebellious rejection triggering $+15$ Bad Rep, $-25$ Manager Trust, and matchday squad exclusion (benched or exiled to reserves).
  * **The Bad Reputation Tier I+ Behavioral Lock:** Rebellious players (Tier I or higher) are permanently barred from following diets strictly—they will either Cheat or Outright Refuse!
* **Youth Stat Point Allocation (Ages 10–20):**
  * Young players receive **15 free stat points per year** to freely distribute across attributes as they see fit.
* **The 5 Developmental States:** Very Bad ($-20\%$ dev rate) $\rightarrow$ Bad $\rightarrow$ Normal $\rightarrow$ Good $\rightarrow$ Elite ($+30\%$ dev rate, rapid tactical assimilation).

#### 2. Volume II: Attributes, Progression Curves & The ⚡ Stat Break System (From Section 18)
* **The 18 Outfield Attributes across 6 Canonical Pillars:**
  * Physical (`PHY`): Pace, Acceleration, Stamina, Strength, Agility, Jumping.
  * Professionalism (`PRO`): Work Rate, Positioning, Heading, Composure, Leadership, Determination.
  * Passing (`PAS`): Short Pass, Long Pass, Vision, Crossing, Curve, Free Kick.
  * Goalscoring (`GOA`): Finishing, Long Shots, Shot Power, Volleys, Penalties, Weak Foot.
  * Defending (`DEF`): Marking, Standing Tackle, Sliding Tackle, Interceptions, Defensive Awareness, Aggression.
  * Mental (`MEN`): Tactical IQ, Composure, Flair, Anticipation, Bravery, Focus.
* **The 7 Goalkeeper Specialist Metrics:** Diving, Handling, Kicking, Reflexes, Speed, Positioning, Aerial Command.
* **Prime Progression Curve (Post-20):**
  * Ages 20–28: Annual allocation drops to **5 free stat points per year**.
  * Ages 28–30 (Peak Prime): **0 points per year** (peak biological plateau).
* **The ⚡ Stat Break System:**
  * Reaching 99 in an attribute requires **100 breakthrough points** to breach the 99 barrier.
  * Each attribute successfully broken awards $+1\text{ OVR}$ and $+1\text{ POT}$ to the player card.
* **Specialized Card Face Group Display:** 60% / 25% / 15% weighted group calculation for specialized cards.
* **The Divine Transcendence Ceiling:**
  * Base 99 OVR is strictly required before stat breaks can push OVR past 99.
  * Single 127 Group (+5 OVR/POT bonus) vs Mythic Double-127 Group (Absolute 127 Hard Cap).

#### 3. Volume III: Tactical Foundations: Positions, Sub-Positions & Authentic Playstyles (From Section 4)
* **The 3-Tier Tactical Hierarchy:** Primary Position $\rightarrow$ Tactical Sub-Position $\rightarrow$ Characteristic Playstyle.
* **The 4 Canonical Special Tactical Sub-Positions:**
  1. **Second Striker (`SS` / False 9):** Attacker operating in 2-striker formations or as a fluid False 9 in 4-3-3 (borrows CAM playstyles). *Examples:* Mikel Oyarzabal, Antoine Griezmann, Paulo Dybala | *Legends:* Del Piero, Bergkamp, Baggio.
  2. **Wide Midfielder (`LM` / `RM`):** Midfielder on the flanks in 4-4-2 or 4-5-1 formations (borrows Winger playstyles). *Examples:* David Beckham, Ryan Giggs, Koke.
  3. **Wingback (`LWB` / `RWB`):** Fullback-midfielder hybrid owning the touchline in 3ATB / 5ATB systems (borrows Fullback attacking/balanced playstyles). *Examples:* Achraf Hakimi, Jeremie Frimpong, Federico Dimarco | *Legends:* Roberto Carlos, Cafu.
  4. **Libero (`LIB` / `SW`):** Sweeper central defender who steps into midfield to orchestrate possession in 3ATB systems (borrows CDM playmaker/distributor playstyles). *Examples:* John Stones (hybrid libero role), Leonardo Bonucci | *Legends:* Franz Beckenbauer, Franco Baresi, Ronald Koeman.
* **Core Authentic Playstyles Catalog:**
  * Includes **Regista** as a dedicated playmaker playstyle under Central Defensive Midfielder (`CDM`) (e.g. Andrea Pirlo, Sergio Busquets, Rodri).
  * Goalkeepers: Sweeper, Shot Stopper, Wall.
  * Fullbacks: Balanced, Inverted, Attacking, Defensive.
  * Wingers: Prolific, Inverted, Traditional, Pressing.
* **Manager Playstyle Assignment & The $+2\text{ OVR}$ Starting Rule:**
  * Managers prioritize tactical fit when naming the starting XI.
  * *Exception:* If a bench player is $+2\text{ OVR}$ or higher than the tactically aligned starter, the manager starts the superior talent anyway, triggering tactical retraining events.
* **Tactical Pitch Dimensions, Turf Quality & Watering Directives (From Section 29):**
  * **Pitch Dimension Presets:** Small/Compact ($100\text{m} \times 64\text{m}$, e.g. Burnley) chokes passing lanes and favors direct aerial duels; Balanced ($105\text{m} \times 68\text{m}$ FIFA standard); Wide/Expansive ($110\text{m} \times 74\text{m}$, e.g. Barcelona Camp Nou) stretches defensive blocks and empowers tiki-taka wingers.
  * **Three Turf Quality Grades:** Pristine (€€€ true ball roll, zero bobbles), Normal (€€ balanced friction), Poor (€ bare dry patches in 6-yard boxes, unpredictable micro-bounces, rapid divot degradation).
  * **Grass Mower Cut:** Short (zipping low passes, fast transitions), Normal, Long (noticeable roll drag, extra sprint stamina burn).
  * **Matchday Pitch Watering Policy:** Heavily Watered / Slick (`slick_watered` for fast 1-touch passing) vs Balanced (`balanced`) vs Dry / Unwatered (`dry_unwatered` to disrupt technical opposition rhythm).
  * **Goalpost Options:** Classic round steel, modern aerodynamic oval, retro square profile, and deep continental tension-box nets.

#### 4. Volume IV: The Professional Transfer Market, Contract Negotiations & Squad Roles (From Section 8 & 19)
* **Anatomy of Incoming Transfer Offers:**
  * Tactics, Formation, and Position demanded by the bidding club.
  * Current Squad Competitors list for that position (with their OVR and status).
  * Development Tier of the club (vital consideration for players under 20 years old).
  * Contract Duration (years) and Release Clause terms.
  * Financial Terms: Base Salary, Signing Bonus math, and competitive bonus packages.
* **Sovereign Country Seasonality & Climate Mechanics (`hasSeasons: boolean`):**
  * Countries (not leagues) dictate climate and seasonal cycles.
  * Seasonal countries (England, Germany, Spain, Italy, Argentina) activate authentic Winter fixtures: snowfall, icy turf, mandatory **Hi-Vis Neon Orange Match Ball**, $+10\%$ cold metabolic stamina drain, $+15\%$ cold muscle/hamstring injury risks, and thermal gear with animated breath vapor.
  * Equatorial/Tropical countries (Colombia, Nigeria, Saudi Arabia) feature zero winter or snow, experiencing high heat, humidity, or monsoon downpours.
* **Stadium Stand Customization & Matchday Economics (From Section 19.H):**
  * 4 Modular Stands (North, South, East, West) with customizable styles (safe-standing terraces to luxury suite towers), capacities, seat colors, and mosaic club lettering.
  * Capacity and corporate VIP suites directly scale gate receipts and club wage budgets.
* **The Continental Stadium Loan / Ground-Sharing Rule:**
  * Continental competitions (UEFA Champions League, Europa League, Copa Libertadores) enforce strict stadium criteria (minimum capacity, $\ge 1,400\text{ lux}$ floodlights, press theaters).
  * If a qualified club's home ground is non-compliant, they **cannot play continental matches at home** and must **loan a compliant stadium from a nearby team or regional metropolitan arena** (paying a per-match lease fee while capturing massive metropolitan ticket windfalls).
* **The 6-Tier Squad Role Hierarchy:**
  1. `u17` — Under-17 youth squad prospect.
  2. `u20` — Under-20 reserve/academy competitor.
  3. `reserves` — Senior squad depth; only features in emergencies or early cup rounds.
  4. `rotation` — Regular rotational player receiving 15–20 starts per season.
  5. `starter` — First-choice starting XI player rotating under normal fatigue management.
  6. `key_player` — Indispensable superstar who **only rests on low-importance matches** (early stage domestic cup rounds, dead-rubber group fixtures in continental tournaments, or home matches against heavily outmatched rivals).
* **Mobile-First Interactive Contract Negotiation:**
  * Face-to-face sit-down event with your Agent (if represented) or the bidding club's Lead Figure / President / Manager.
  * Direct negotiable clauses:
    * Higher Base Weekly Salary.
    * Increased Sign-on Bonus.
    * Goal, Assist, Match Appearance, and Clean Sheet Bonuses.
    * Match Rating Performance Incentives ($\ge 7.5$ bonus).
    * Silverware Trophies Bonuses (Winning UEFA Champions League, National League, Europa League, or Continental Cups).
    * Promotion / Ascending or Relegation-Avoidance Bonuses for battling clubs.
    * Insertion or Adjustment of a Mandatory Buyout Release Clause.
* **Transfer Origin Archetypes:**
  * Manager-Requested Tactical Signings (85%–90%): Full tactical alignment and manager trust.
  * Club Figurehead / Presidential Signings (10%–15%): Commercial/star prestige signings made over the manager's head, requiring the player to prove themselves to skeptical staff.

#### 5. Volume V: Reputation, Moral Discipline & Club Tenure Loyalty (From Section 7)
* **Bad Reputation Tiers:**
  * **Tier 0:** Clean Record (0–19 pts) — Model professional, default match referee leniency.
  * **Tier I:** Problem Child (20–49 pts) — $1.5\times$ yellow card rate, 20% transfer bid drop, $-5$ starting chemistry at new clubs.
  * **Tier II:** Bad Boy (50–79 pts) — $2.0\times$ card rate, 50% transfer bid drop, $-12$ starting chemistry, locker room friction.
  * **Tier III:** Psycho (80–100 pts) — $3.0\times$ straight red card rate, 80% transfer bid drop, $-25$ starting chemistry, public scandal events.
* **The Club Tenure Loyalty Offset Engine:**
  * Long service at a single club earns local goodwill and offsets the public perception of your Bad Reputation:
    * **2+ Consecutive Seasons at Same Club:** $-1\text{ Tier}$ temporary offset (Tier I appears as Tier 0; Tier II appears as Tier I; Tier III appears as Tier II).
    * **5+ Consecutive Seasons at Same Club:** $-2\text{ Tiers}$ temporary offset (Tier II appears as Tier 0; Tier III appears as Tier I).
* **The Absolute Shatter Rule:**
  * This loyalty offset is purely temporary.
  * **The moment ANY new Bad Reputation is gained** (red card, press brawl, missed training, caught cheating on diet), **the offset instantly shatters in full!**
  * True Bad Reputation is restored immediately, and the tenure loyalty counter resets to Season 0 as if you were a brand-new arrival.
* **Tier I+ Behavioral Locks:**
  * Players with Tier I or higher Bad Reputation cannot select docile choices:
    * Permanently locked out of "Follow Strictly" on Special Diets (must Cheat or Refuse).
    * Cannot quietly accept demotions to the reserves.
    * Press conference answers are locked into aggressive or defiant tones.

#### 6. Volume VI: The Global Glory System, Ballon d'Or, Prime, Veteran Decay & Retirement Champion Points (From Section 19)
* **The Global Competition Glory Ranking Matrix:**
  * Normalizing factor based on real-world prestige and historical weight:
    * **World Cup (`world_cup`):** 1,000 pts (The Pinnacle of Football).
    * **UEFA Champions League (`ucl`):** 200 pts.
    * **UEFA European Championship (`euro`):** 180 pts (Higher than continental club cups outside UCL; strictly below UCL).
    * **Copa América (`copa_america`):** 150 pts.
    * **Europa League (`uel`):** 60 pts.
    * **Premier League (`epl`):** 50 pts.
    * **La Liga (`la_liga`):** 45 pts.
    * **Serie A (`serie_a`):** 35 pts.
    * **Bundesliga (`bundesliga`):** 25 pts.
    * **Ligue 1 (`ligue_1`):** 15 pts.
    * **UEFA Conference League (`uecl`):** 12 pts (Balanced strictly below Ligue 1).
    * **Primeira Liga (`primeira_liga`):** 10 pts.
    * **Eredivisie (`eredivisie`):** 8 pts.
    * **Campeonato Brasileiro Série A (`brasileirao`):** 7 pts (Directly beneath Eredivisie).
    * **Remaining Tournaments:** Ranked proportionally (Copa Libertadores 20, African Cup of Nations 40, Asian Cup 30, CONCACAF Gold Cup 18, Domestic Top 5 FA Cups 10, Sudamericana 8, CAF Champions League 6, AFC Champions League 5, CONCACAF Champions Cup 5).
* **The Ballon d'Or Annual Qualification Formula:**
  * Calculated at season conclusion combining individual output (Goals, Assists, Clean Sheets), average match rating ($\ge 7.5$), and silverware glory points accumulated across the season.
* **Career Prime Identification:**
  * The career engine tracks your "Prime" as the single season in which your card achieved the highest OVR.
  * *Tiebreaker:* If the highest OVR was sustained across multiple seasons, the game crowns the season with the superior individual statistics and highest trophy glory rank.
* **Veteran Physical Decay (Age 30+):**
  * Biological aging begins at age 30:
    * **Age 30:** $-1$ physical point deducted randomly between Stamina, Pace, or Strength.
    * **Age 31:** $-2$ physical points deducted randomly.
    * **Age 32:** $-2$ physical points deducted randomly.
    * **Age 33:** $-3$ physical points deducted randomly.
    * **Age 34:** $-4$ physical points deducted randomly.
    * **Age 35+:** $-5$ physical points deducted randomly every year until retirement.
  * **Injury Vulnerability:** Injury recovery time increases by $+5\%$ per year of age past 30.
  * **Injury Risk:** Injury chance increases by $+5\%$ compound modifier on current injury chance per year past 30.
  * **Transfermarkt Market Value Decay:** Market value depreciates annually past age 30 based on age brackets and contract length, while wages only decrease if OVR drops.
* **Retirement & The 🪙 Champion Points Currency:**
  * Upon retiring from a Unique Career, your lifetime accumulated Glory Points are converted into **🪙 Champion Points**.
  * **The Most Valuable Currency in DrawStar:** Champion Points are preserved permanently on your profile and are used to unlock legendary football icons in **"Play as Legend" Mode**.

#### 7. Volume VII: The Card Compendium (Chronological Lifecycle Order) & Duplicate Dust Economy (From Section 16 & 28)

##### Part A: Chronological Lifecycle Cards
The DrawStar card deck is structured to mirror the authentic chronological stages of a footballer's life:
1. **Parent Cards (`parent` — Heritage, Lineage & Upbringing):**
   * *Hallmark:* Sepia Polaroid photo cardstock, vintage brass corners, and family tree watermark.
   * *7 Canonical Archetypes:* Ex-Pro Player, Average Family, Helicopter Parents, Immigrant Family, Raised in Ghetto/Street Survivor, Rich Parents, Iconic Parent.
   * *Impact:* Inherited height, starting weak foot, early cash, and permanent family traits.
2. **Street Cards (`street` — Cage Turf, Concrete & Raw Grit):**
   * *Hallmark:* Distressed asphalt tarmac grain, duct-tape corner bindings, and spray-paint stencil tags.
   * *Focus:* Childhood cage matches, asphalt survival, raw dribbling flair, uncoached resilience, and street tricks.
3. **Youth Cards (`youth` — Academies, Scouting & Raw Potential):**
   * *Hallmark:* Technical 5mm blueprint drafting grid, centimeter gauge, and emerald academy ink stamps.
   * *Focus:* Tactical discipline, foundational gym regimens, scouting trials, and academy coaching drills.
4. **Career Cards (`career` — Matchday Glory, Transfers & Trophies):**
   * *Hallmark:* Breathable match jersey mesh weave, embroidered gold stars, and championship laurel ribbon.
   * *Focus:* Matchday heroics, senior contract milestones, silverware triumphs, and Iconic Career Cards that trigger instant Stat Breaks.
5. **Lifestyle Cards (`lifestyle` — Fame, Luxury, Romance & Entourage):**
   * *Hallmark:* Ultra-gloss mirror UV varnish, diamond-quilted leather, and champagne-gold Art Deco flourishes.
   * *Focus:* Supercars, VIP galas, relationship choices, fast-food binges, and nightlife events that directly alter weight and reputation.
6. **Sponsor Cards (`sponsor` — Corporate Endorsements, Brands & Gear Deals):**
   * *Hallmark:* High-tech woven carbon fiber, vertical rainbow hologram barcode, and microprinted clauses.
   * *Focus:* Custom boot endorsements, commercial photo shoots, apparel partnerships, and passive business dividends.
7. **Agent Cards (`agent` — Contract Negotiations, Retainers & Legal Clout):**
   * *Hallmark:* Pebbled Italian calfskin leather, red sealing wax stamp, and brass briefcase clasps.
   * *Focus:* Representation tiers (Rookie to Master), contract leverage, bonus maximization, release clause clauses, and club relations.
8. **Cultural Cards (`cultural` — National Heritage, Roots & Ancestral Pride):**
   * *Hallmark:* Hand-woven continental ancestral textile, national flag gradients, and folklore spirit motifs.
   * *Focus:* International call-ups, World Cup fervor, diaspora pride, and ancestral mental composure bonuses.

##### Part B: Card Deck Mechanics, Tactile Shaders & Duplicate Dust Economy
* **The 8 Bespoke Tactile Shader Surfaces:** Physical texture simulation for card inspections (Polaroid cardstock, asphalt bump-map, blueprint grid, jersey mesh, high-gloss UV, carbon fiber twill, Italian calfskin, ancestral woven textile).
* **The 4 Functional Card Categories:** Positive, Negative, Double-Edged (50/50 rolls), and Cultural cards.
* **The Duplicate Dust Economy & Recycling Values:**
  * Bronze Duplicate: $+25\text{ Dust}$
  * Silver Duplicate: $+100\text{ Dust}$
  * Gold Duplicate: $+200\text{ Dust}$
  * Legendary Duplicate: $+500\text{ Dust}$
  * Iconic Duplicate: $+1,000\text{ Dust}$
  * Double-Edged Duplicate: Random 50/50 roll between 50 or 150 Dust.
* **The Sacred 1-Copy Preservation Rule:** "Recycle All Duplicates" automatically retains exactly 1 active copy of every discovered card for deck-building.
* **The 11 Core Meta-Upgrades Catalog:** Purchased using Dust in the Card Store (Tactical Reroll, Prodigy Boost, Extra Hand Draw, Iron Lungs, Master Negotiator, etc.).

---

## 31. CURRENT STATUS & READY FOR EXECUTION

* **Roadmap File:** Fully self-contained at `/REMAKE_2_PLANNING_ROADMAP.md`. Any future AI or developer can build Remake 2.0 using this file alone without needing legacy context.
* **Build State:** Verified via `compile_applet` (100% successful build).
* **State:** **Strict Planning Mode**. We remain on standby until you confirm the plan and instruct us to begin Phase 0.
