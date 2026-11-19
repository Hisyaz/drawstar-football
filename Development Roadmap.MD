# DrawStar Football — Master Development Roadmap
> **League Isolation Forensics, 3-Tier Stadium Architecture, Turf/Muddy Physics, Playable Youth Leagues, U17 World Championship & 7v7 Street Football**

> **Purpose:** Token-optimized, strictly dependency-ordered engineering plan (~1 day of Google AI Studio free tokens per phase) covering:
> 1. **Phases 1–2 (PRIORITY ZERO):** Deep-dive root-cause elimination & automated isolation testing for the **League Intertwining / Cross-Country Contamination Bug** (São Paulo / Argentina Youth academies merging into England, team-switching corruption, and Pro transfer South America ↔ Europe competition leakage).
> 2. **Phases 3–5:** Core Match-Mode Type Contracts, Dedicated **Stadium Editor** (`Professional Stadiums` | `Youth Stadiums` | `Street Fields`), All Youth Stadium Locks, Renderers, **`Sand` (< `Poor`) & Rain `'Muddy'` Physics (5–10% tuning)**, and Dynamic `[CITY NAME] [YEAR]` Final Adboards.
> 3. **Phases 6–7:** Youth 23-Player Squads (Age 10→16 OVR Escalation; Kickoff Age 16), Int'l Youth Cup Country Bundling, Generated BIG/SMALL & Special Unlocked Youth Stadiums, **U17 National Team DB Squad Population & Call-Ups**, Pro-Parity Youth Simulation, and **Int'l Youth Cup Final (Pro Stadium, 45m halves, 60–80% Casual Crowd, City/Year Boards)**.
> 4. **Phases 8–10:** 1 Unique Street Stadium per Starting City, **Dynamic Per-Play 13-Player Street Pool** from Current City, 7v7 Physics (30m halves, +10% speed, wall rebounds, throw-in corners, double-tap `E` hit fouls, tackle injuries), **Mode-Specific Broadcast Scoreboards** (Street, Individual Youth Leagues, Int'l Youth Cup), 3-Mode Kick Off (`PROFESSIONAL | YOUTH LEAGUES | STREET`), `PLAY` buttons for Youth League + Int'l Youth Cup + U17 World Championship, Unique Career Street Dev Points, and E2E QA.
>
> **How Each Phase Saves Tokens:**
> - Phases execute in strict dependency order so **data isolation & types** precede **editors & generators**, which precede **simulation & engine physics**, which precede **UI flows & HUD polish**.
> - Every phase lists exact **`CHECK (Read-Only)`** and **`ALTER / CREATE`** files with verified symbol names and line ranges so the implementing agent never wastes tokens hunting blindly across `/src`.
> - **Source of Truth Rule:** Always treat `/src` as authoritative (see `/PROJECT_CONTEXT.md`). Preserve all existing 11v11 Professional mechanics.
>
> ### Confirmed Q&A Design Locks
> - **All 9 Starting Cities Get Full Youth Leagues:** Create full Youth Leagues (with 23-man squads, BIG/SMALL Youth stadiums, and unique league scoreboards) for all 9 `STARTING_CITIES`—expanding beyond the original 5 to include **Roma, Berlin, Lisboa, and Riyadh**.
> - **Street 7v7 Kits & Goalkeepers:** Per **HOTFIX PHASE A9**, Street teams wear **randomized regular Streetwear outfits** on existing player models (**Home: white or bright colors** like sky blue, light yellow, light pink; **Away: dark colors** like black, dark purple, brown — t-shirts, hoodies, jeans, shorts, caps, sneakers), and every 7v7 `1-2-2-2` side strictly fields **1 GK, 2 DEF, 2 MID, 2 ATT** (discounting captain/user position from the remaining 6 draws).
> - **Unique Career Street Tackle Injury Flow:** On a user injury in Career Street mode, **lock in the user's current match rating at the moment of injury**, **simulate the remainder of the match**, award **0 Street Development Points**, and **roll a specific injury type from the player/tackle injury `%` (`staminaInjurySystem.ts`)** so the player enters real `injured` career status for that injury's duration.
> - **Street 2D Camera Framing:** Apply a **tighter arcade zoom** framing the compact `46m × 28m` court alongside its perimeter bounce walls and adjacent street alleys.
> - **Rollout & Hotfix Cadence:** Implement **one phase per turn with user review** between phases. Any pre-Phase-9 adjustments inserted after Phase 8 are tracked sequentially as **`HOTFIX PHASE A9`**, **`HOTFIX PHASE B9`**, etc.

---

## Global Architecture & Dependency Map

```text
[Phase 1: League Contamination Forensics, Diagnostic Repair & Isolation Test Harness]
   └──► [Phase 2: Authoritative League/Federation Isolation & Transfer Ecosystem Hardening]
           └──► [Phase 3: Core Type Contracts, Pitch/Goal Metrics, Turfs & Stadium Constraints]
                   ├──► [Phase 4: Dedicated Editor Studio Portal & 3-Mode Stadium Creator/Selector]
                   │       └──► [Phase 5: Renderers, Sand < Poor, Rain "Muddy" (5-10%), Casual Crowd & City/Year Boards]
                   ├──► [Phase 6: Youth 23-Man Squads, OVR Scaling, U17 DB Call-Ups & Youth Stadiums]
                   │       └──► [Phase 7: Pro-Parity Youth Sim, Int'l Youth Cup Final (Pro Venue/45m) & U17 45m]
                   └──► [Phase 8: Street Stadiums (1/City), Dynamic Per-Play 13-Man Pool & 7v7 Adapter]
                           └──► [HOTFIX PHASE A9: Street Captain Card-Draw Cinematic, Positional 1-2-2-2 & Light/Dark Streetwear]
                                   └──► [Phase 9: MatchEngine Mechanics (Youth 35m, Street 7v7, Muddy) & Unique Scoreboards]
                                           └──► [Phase 10: Kickoff 3-Mode, Youth/Cup/U17 PLAY Buttons, Career Street & QA]
```

### Ground Truth Snapshot from `/src` (Verified Before Planning)
- **Root Causes of League Contamination Bug (Confirmed in `/src`):**
  1. `src/utils/youthMatchSimulator.ts` (L60, L64): `const isPro = isProfessionalPlayer(player) || (player.age || 10) >= 16;` forces non-pro age-16 Youth players (e.g., São Paulo / Buenos Aires) into `resolveAuthoritativeClubContext` -> misses Youth clubs in Pro DB -> silently defaults to `'ENG' / 'england_d1'` -> populates Youth League schedule with `getSanitizedTeamsForLeague('england_d1')`! Also L64 (`youthMatchSimulator.ts`), L34 (`youthLeagueSimulation.ts`), and L899 (`earlyCareerSystem.ts`) silently fall back to `YOUTH_LEAGUES_DATABASE.london` when `getYouthLeagueByCity(city)` returns `null`.
  2. `src/utils/clubContextRebuilder.ts` (L247–281): `resolveAuthoritativeClubContext` and `rebuildPlayerCompetitiveContextOnTransfer` silently fall back to `countryCode: 'ENG'`, `countryName: 'England'`, `leagueId: 'england_d1'` on any lookup miss.
  3. `src/App.tsx` (L2085–2150) & `src/components/ChangeAcademyModal.tsx` (L102–110) & `src/utils/transferRequestSystem.ts` (L588–599): Youth join / academy switch leaves stale `leagueId`, `countryCode`, `youthLeagueName`, or `qualifiedContinental*` fields unsynced.
  4. `src/utils/worldSimulationEngine.ts` (L214, L470–485, L540, L773–785): `activeWorldStateCache` & `WORLD_SIMULATION_STATE_ACTIVE_V3_${seasonYear}` cache stale season leagues/fixtures across mid-season Pro transfers (`isPlayerTeam` never moves on cache; L540 hardcodes `countryCode: 'ENG'`).
  5. `src/utils/transferRequestSystem.ts` (L296, L562, L656): Mutates global `getLeagueDatabase()` / `saveLeagueDatabase()` instead of `getCareerLeagueDatabase()`, and uses fuzzy name matching (`cleanTeamName(c.leagueName) === cleanTeamName(player.league)`) instead of canonical `leagueId`.
  6. `src/utils/seasonStatisticsTracker.ts` (L67–81), `src/utils/yearlyStatisticsDatabase.ts` (L416–423), `src/utils/professionalLeagueEngine.ts` (L335–337): Additional silent `'england_d1'` fallbacks.
  7. `src/utils/leagueDatabaseSystem.ts` (L229–262): Merges `DEFAULT_LEAGUE_DATABASE` `teamIds` with saved Option File leagues without cross-country deduplication (forcing bandaid lists in `leagueSanitizer.ts:23-33`).
- **Gameplay, Editor & UI Anchors (Confirmed in `/src`):**
  - `src/components/MainMenu.tsx` (L774–884) & `src/App.tsx` (L1368): Editor Studio has `character`, `team`, `competitions`, `card` — no Stadium Editor button.
  - `src/components/YouthSeasonDashboardModal.tsx` (L610, L7832, L8018, L8376): `isProCareerGameplayEnabled = isProfessionalPlayer(player) && !player.isYouthCareerActive;` blocks `PLAY` on Youth League matches, International Youth Cup, and `tier === 'U17'` matches.
  - `src/utils/nationalTeamDatabaseManager.ts` (L369–483): Builds `NationalTeam['u17Squad']` (35 players), seeded from club `u17` rosters + procedural fill.
  - `src/utils/u17NationalTeamEngine.ts` (L98–180): `checkU17QualifiersEligibility` & `checkU17WorldCupEligibility` use static `70 / 68` OVR thresholds rather than real DB squad competition.
  - `src/gameplay/game/pitchDimensions.ts`, `engine.ts`, `turfPhysics.ts`, `weatherEngine.ts`, `stadiumRenderer.ts`, and `src/gameplay/components/MatchHUD.tsx` (L74 hardcodes `minutes >= 45`).

---

## Phase 1: League Contamination Deep-Dive Forensics & Automated Isolation Test Harness
**Estimated Token Budget:** ~1 Day

### Objective
Build a deterministic reproduction & invariant test harness first—before touching production simulation logic—so we can reliably reproduce every reported intertwining failure (São Paulo/Argentina Youth -> English League rivals, academy switch corruption, Pro South America ↔ Europe transfer leakage) and automatically verify every fix in Phase 2.

### Files to CHECK (Read-Only Context)
- `src/data/youthLeaguesDatabase.ts` (L1–199)
- `src/data/defaultLeagues.ts`
- `src/utils/clubContextRebuilder.ts` (L1–506)
- `src/utils/leagueSanitizer.ts` (L1–254)
- `src/utils/youthMatchSimulator.ts` (L1–250)
- `src/utils/youthLeagueSimulation.ts` (L1–201)
- `src/utils/worldSimulationEngine.ts` (L190–790)
- `src/utils/transferRequestSystem.ts` (L250–760)
- `src/utils/continentalScheduleIntegration.ts` (L1–250)
- `src/utils/careerSaveSystem.ts` (save/load normalization paths)

### Files to CREATE / ALTER
1. **CREATE `src/utils/leagueIntegrityDiagnostics.ts`**:
   - Pure diagnostic & integrity-audit module:
     - `auditPlayerCompetitiveContext(player: PlayerConfig, careerDb: LeagueDatabase)`:
       - Verifies Youth invariant: if `!player.isProfessional || player.isYouthCareerActive`, asserts `player.youthLeagueName` / `player.club` / `player.startingCity` / `player.clubCountry` belong strictly to the **same city & youth league** (never `'england_d1'` or cross-city opponents) and `qualifiedContinental*` flags are clear.
       - Verifies Pro invariant: if `isProfessionalPlayer(player)`, resolves canonical `club -> league -> countryCode` from `careerDb` and flags any mismatch between `player.leagueId`, `player.league`, `player.clubCountry`, `player.countryCode`, `player.leagueTier`, and `continentalCompId` (e.g., `BRA`/`ARG` club holding `UEFA_CL` or `england_d1` rivals).
     - `auditLeagueDatabaseContamination(db: LeagueDatabase)`:
       - Scans every league in `db.leagues` to detect duplicate `teamIds` across leagues, foreign-country clubs sitting inside domestic leagues (excluding intentional MLS/regional rules), and stale `isPlayerTeam` flags across multiple clubs.
     - `repairCorruptedCareerContext(player: PlayerConfig, careerDb: LeagueDatabase)` (non-destructive fixer invoked on legacy save load).
2. **CREATE `src/utils/__tests__/leagueIsolation.test.ts`** (or verification runner script callable via `npx tsx` / Vitest depending on `package.json` test setup — inspect `package.json` first):
   - Automated scenarios reproducing all user-reported bugs:
     - **Scenario A (São Paulo Youth Age 10 -> 16):** Start in `sao_paulo` Youth League, advance to age 16 without signing Pro contract -> assert opponents in `generateYouthBlockMatches` & `simulateFullYouthLeagueStandings` are 100% São Paulo Youth clubs, **0 English clubs**.
     - **Scenario B (Buenos Aires / Argentina Start + Roma/Berlin/Lisboa/Riyadh city check):** Start in `buenos_aires` (and test city string normalization `'Buenos Aires'`, `'buenos_aires'`, `'São Paulo'`) -> assert Youth opponents come strictly from that city's Youth League, never fallback `'london'` or `'england_d1'`.
     - **Scenario C (Youth Team / Academy Switch):** Switch academy inside/across `ChangeAcademyModal` & `transferRequestSystem` -> assert `league`, `leagueId`, `clubCountry`, `countryCode`, `youthLeagueName`, `youthTeamName`, and season fixtures all transition atomically.
     - **Scenario D (Age 16 Pro Graduation & Mid-Season Pro Transfers South America ↔ Europe):** Transfer from `BRA`/`ARG` club to `ENG`/`ESP` club (via Age 16 offer, Betrayal/Transfer Request, Arabian Mega Offer, and Free Agent) -> assert `worldSimulationEngine` `activeWorldStateCache`, domestic league table, domestic cup, and continental competition belong 100% to the destination country/confederation with zero merged South America vs Europe clubs.
3. **CHECK `package.json`**: Verify whether Vitest/Jest is installed or execute scenarios directly via `tsx`.

### Phase 1 Acceptance Criteria
- Running the diagnostic suite **reproduces and catches all 4 contamination bugs** on the current unmodified engine (proving our reproducers hit exact root causes).
- `auditLeagueDatabaseContamination` cleanly reports any cross-country `teamId` overlap in saved Option File / Career DBs.

---

## Phase 2: Authoritative League/Federation Isolation & Transfer Ecosystem Hardening
**Estimated Token Budget:** ~1.5 Days (Critical deep fix + full career playtest verification)

### Objective
Eliminate every silent England/London fallback, uncouple Career DB from global Option File DB during transfers, synchronize `worldSimulationEngine` caches atomically on club switches/transfers, and verify all Phase 1 isolation tests pass 100% plus interactive save/load regression testing.

### Files to CHECK (Read-Only Context)
- `src/utils/leagueIntegrityDiagnostics.ts` (from Phase 1)
- `src/utils/earlyCareerSystem.ts` (L880–934)
- `src/utils/age16TransferSystem.ts`
- `src/utils/continentalDatabaseSystem.ts`
- `src/utils/continentalQualificationSystem.ts`
- `src/utils/continentalScheduleIntegration.ts`

### Files to ALTER
1. **ALTER `src/utils/clubContextRebuilder.ts`**:
   - **Remove silent `'ENG'` / `'england_d1'` fallback** inside `resolveAuthoritativeClubContext` and `rebuildPlayerCompetitiveContextOnTransfer`.
   - When `player.isYouthCareerActive || !isProfessionalPlayer(player)` (or club exists in `YOUTH_LEAGUES_DATABASE`), resolve strictly as a **Youth Academy** via `getYouthLeagueByCity` / `findYouthTeamByName` (never falling into Pro `'england_d1'`).
   - On Pro transfers: atomically overwrite `club`, `clubId`, `league`, `leagueId`, `leagueTier`, `clubCountry`, `countryCode`, `continentalCompId` (and **explicitly wipe stale `qualifiedContinental*`, `youthTeamName`, `youthLeagueName`, `isYouthCareerActive`**). If a club lookup unexpectedly fails, match via `team.countryCode` + `leagueTier` or throw/log explicit diagnostic instead of defaulting to England.
2. **ALTER `src/utils/playerIdentitySystem.ts`, `src/utils/youthMatchSimulator.ts`, `src/utils/youthLeagueSimulation.ts`, & `src/utils/earlyCareerSystem.ts`**:
   - **Fix `playerIdentitySystem.ts:332-360` (`isProfessionalPlayer`) & `youthMatchSimulator.ts:60` & `youthLeagueSimulation.ts:20`:** Never classify `isYouthCareerActive === true` (and `isProPlayer !== true` / `isProfessional !== true` / `careerStage !== 'PROFESSIONAL'`) as Professional merely because `(player.age || 10) >= 16` and the academy name lacks `'youth academy'`/`'deportivo'`. Ensure an age-16 Youth player still in an Academy **stays strictly in their Youth League** until they sign a Pro contract!
   - **Remove `|| YOUTH_LEAGUES_DATABASE.london` fallbacks** (`youthMatchSimulator.ts:64`, `youthLeagueSimulation.ts:34`, `earlyCareerSystem.ts:899`): normalize city IDs/diacritics (`'São Paulo'` <-> `'sao_paulo'`, `'Buenos Aires'` <-> `'buenos_aires'`, plus clean Youth League mappings for `roma`, `berlin`, `lisboa`, `riyadh`) and resolve strictly from `(player.youthLeagueName || player.startingCity || player.clubCountry)`.
3. **ALTER `src/data/youthLeaguesDatabase.ts`**:
   - Add normalized lookup helper `resolvePlayerYouthLeagueStrict(player)` matching by: (1) `player.youthTeamName` / `player.club` exact club lookup across all Youth Leagues -> (2) `player.youthLeagueName` -> (3) normalized `player.startingCity` / `player.city` -> (4) `player.clubCountry` / `player.countryCode`. Zero accidental London fallback for South American or continental European cities!
4. **ALTER `src/App.tsx`, `src/components/ChangeAcademyModal.tsx`, `src/utils/transferRequestSystem.ts`, & `src/utils/careerSaveSystem.ts`**:
   - **`src/App.tsx` (L2085–2150):** When joining a big/local Youth club, explicitly populate `club`, `youthTeamName`, `youthLeagueName`, `league`, `leagueId` (youth scoped), `clubCountry`, `countryCode`, `isYouthCareerActive: true`, `isProfessional: false`.
   - **`src/components/ChangeAcademyModal.tsx` (L102–110):** Invoke `rebuildPlayerYouthContextOnSwitch` so switching academies updates `league`, `leagueId`, `clubCountry`, `countryCode`, `youthLeagueName`, `youthTeamName`, and clears cached season fixtures cleanly.
   - **`src/utils/transferRequestSystem.ts` (L296, L562, L656):**
     - Replace `getLeagueDatabase()` / `saveLeagueDatabase()` with `getCareerLeagueDatabase()` / `saveCareerLeagueDatabase()` so career transfers never mutate the global Editor DB.
     - Match leagues strictly by canonical **`team.leagueId`** (never text-matching `player.league`).
     - Update ALL transfer completion paths (`executeTransferAfterBetrayalCheck`, `handleAcceptArabianMegaOffer`, `executeCanonicalTransfer`, Youth Switch) to run `rebuildPlayerCompetitiveContextOnTransfer` + invalidate world simulation cache.
   - **`src/utils/careerSaveSystem.ts`:** Invoke `repairCorruptedCareerContext` + `auditLeagueDatabaseContamination` on save load to heal any previously saved Career with cross-league leakage.
5. **ALTER `src/utils/worldSimulationEngine.ts` (L214, L470–540, L773–785)**:
   - Export `invalidateWorldSimulationCache(seasonYear?)` and `rebindWorldSimulationPlayerClub(player, seasonYear, careerDb)`:
     - Must be called automatically whenever `player` changes clubs, leagues, or Youth academies.
     - Removes stale `isPlayerTeam` flags from old club, updates fixtures/standings binding for the new club's canonical `leagueId`, and removes hardcoded `countryCode: 'ENG'` (`L540`).
     - Never inject `playerClubName` into a league whose `countryCode` or `leagueId` does not own that club (`L470–485`).
6. **ALTER `src/utils/leagueDatabaseSystem.ts`, `src/utils/seasonStatisticsTracker.ts`, `src/utils/yearlyStatisticsDatabase.ts`, `src/utils/professionalLeagueEngine.ts`, `src/utils/leagueSanitizer.ts`**:
   - **`leagueDatabaseSystem.ts`:** During Option File / DB merge, deduplicate `teamIds` across leagues by authoritative `team.countryCode` + `team.leagueId` so an English team can never remain in a Spanish/Argentine league array (and vice versa).
   - Remove remaining silent `'england_d1'` fallbacks in `seasonStatisticsTracker.ts:67-81`, `yearlyStatisticsDatabase.ts:416-423`, and `professionalLeagueEngine.ts:335-337`; resolve strictly from club ownership via `leagueSanitizer.ts`.

### Phase 2 Acceptance Criteria
- Phase 1 automated test suite (`leagueIsolation.test.ts`) passes **100%** across São Paulo, Buenos Aires, Madrid, London, Paris, academy switching, Age 16 graduation, and Pro South America ↔ Europe mid-season transfers.
- Manual interactive playthrough confirms:
  1. Starting in São Paulo or Buenos Aires Youth League faces ONLY local city Youth rivals from age 10 through age 16.
  2. Switching Youth clubs never pulls English clubs.
  3. Transferring from Brazil/Argentina to Europe (or Europe to South America / Arabia) immediately swaps domestic league, national cup, and continental competition with zero mixed-continent league tables.

---

## Phase 3: Core Type Contracts, Match Mode Specs & Stadium Constraint Validators
**Estimated Token Budget:** ~1 Day

### Objective
Establish all TypeScript interfaces, enums, stadium category locks, pitch/goal scale presets, `'muddy'` weather surface states, and match-mode rule objects so Phases 4–10 compile against a single shared contract.

### Files to CHECK (Read-Only Context)
- `src/gameplay/types.ts`
- `src/gameplay/types/stadium.ts` (L1–320, L1840–1913, L2050–2130, L3240–3385, L4390–4420)
- `src/gameplay/game/constants.ts` (L1–47)
- `src/gameplay/game/pitchDimensions.ts`

### Files to ALTER / CREATE
1. **ALTER `src/gameplay/types.ts`**:
   - Add `export type FootballMatchMode = 'pro' | 'youth' | 'street';`
   - Extend `TurfQuality`: `'pristine' | 'normal' | 'poor' | 'synthetic' | 'concrete' | 'sand'`.
   - Add `export type PitchSurfaceStatus = 'normal' | 'wet' | 'muddy' | 'snowy';` (explicitly tracks `'muddy'` when `'sand'` turf experiences `'rain'` or `'torrential'`).
   - Add `StreetFormationName = '1-2-2-2';` to formation types.
   - Add `MatchModeRules` interface:
     - `mode: FootballMatchMode`
     - `competitionTag?: 'youth_league' | 'intl_youth_cup' | 'intl_youth_cup_final' | 'u17_world_cup' | 'street' | 'pro'`
     - `displayedHalfMinutes: 45 | 35 | 30` (Pro = `45`, Regular Youth League & Int'l Youth Cup pre-final = `35`, **Int'l Youth Cup Final = `45`**, **U17 World Championship = `45`**, Street = `30`)
     - `maxPlayersPerTeam: 11 | 7`
     - `speedMultiplier: number` (Pro/Youth = `1.0`, Street = `1.10`)
     - `sidelineWallsBounce: boolean` (`true` in Street)
     - `cornersAsThrowIns: boolean` (`true` in Street)
     - `foulsMode: 'ifab' | 'street_hit_only'` (`street_hit_only`: only double-tap `E` intentional hit triggers a foul; tackles still roll injuries)
     - `offsidesEnabled: boolean` (`false` in Street)
     - `disableSurroundingsAndIntro: boolean` (`true` in regular Youth; `false` when Int'l Youth Cup Final or U17 World Championship plays in a Pro stadium!)
     - `syntheticInjuryBonusPct: number` (`+10` when `turfQuality === 'synthetic'`)
   - Add optional `matchMode?: FootballMatchMode`, `displayedHalfMinutes?: 45 | 35 | 30`, `isStreetMatch?: boolean`, `streetCityId?: string`, `scoreboardThemeId?: string`, `crowdAttendancePctOverride?: number`, `isCasualCrowd?: boolean`, `finalBoardCity?: string`, `finalBoardYear?: number` to `PreMatchConfig`.
2. **ALTER `src/gameplay/types/stadium.ts`**:
   - Add `export type StadiumCategory = 'pro' | 'youth' | 'street';`
   - Add `'none'` to `LightingModel['type']` (`'corner_pylons' | 'roof_banks' | 'light_poles' | 'none'`).
   - **Add dedicated `StreetArenaConfig` interface** (completely separate from Pro/Youth grandstand schemas so Street Venues feel wildly different instead of stripped-down stadiums):
     - `archetype: 'tarmac_cage' | 'favela_quadra' | 'potrero_dirt' | 'courtyard_paving' | 'rooftop_mesh' | 'coastal_boardwalk' | 'desert_sand_lot'`
     - `surface: 'concrete' | 'sand' | 'synthetic' | 'poor'`
     - `perimeterWallStyle: 'chainlink_cage' | 'graffiti_brick' | 'corrugated_iron' | 'timber_seawall' | 'concrete_curb_wall'`
     - `courtMarkings: 'spray_paint' | 'chalk_dust' | 'multisport_crossover' | 'faded_tarmac'`
     - `goalStyle: 'futsal_tubular' | 'chain_net_park' | 'painted_wall_posts' | 'crates_and_pipes'`
     - `streetLighting: 'sodium_streetlamps' | 'festoon_string_lights' | 'single_flood_pole' | 'daylight_only'`
     - `fenceCrowdMode: 'none' | 'sparse_locals' | 'block_party_fence'` (people leaning against fences, sitting on curbs/car hoods — zero seated stadium stands)
     - `urbanProps: Array<'parked_cars' | 'laundry_lines' | 'graffiti_murals' | 'milk_crates' | 'scooters' | 'corner_kiosk'>`
   - Extend `StadiumDefinition`:
     - `category?: StadiumCategory;` (defaults to `'pro'`)
     - `youthSpecialUnlocked?: boolean;` (true only for Int'l Youth Cup country/bundled section stadiums with 2+ teams; unlocks `'pristine'`, `roof`, and up to `'modern'` stands)
     - `streetSurface?: 'concrete' | 'sand' | 'synthetic' | 'poor';`
     - `streetCityId?: string;`
     - `streetConfig?: StreetArenaConfig;` (active whenever `category === 'street'`)
     - `isCasualYouthCrowd?: boolean;` (casual everyday clothes, lower color uniformity for Youth)
     - `disableEntryCinematic?: boolean;`
3. **CREATE `src/gameplay/game/stadiumConstraints.ts`**:
   - Pure validator/filter functions contrasting **Youth Stadiums** (constrained Pro stadiums) vs **Street Fields** (wildly different non-stadium playgrounds):
     - `getAllowedShapesForCategory(cat)`: Pro = all; Youth = `['rectangular']`; Street = `['rectangular']`.
     - `getAllowedGradesForCategory(cat, def)`: Youth default cap = **`'brutalist'`** (`['municipal', 'brutalist']`); English/Spanish Youth clubs unlock `'industrial'`; English Youth clubs unlock `'victorian'`; `def.youthSpecialUnlocked` unlocks up to `'modern'`. Street does **not** use stadium grades (`stands = 'none'`).
     - `getAllowedStandTypesForCategory(cat, pos)`:
       - Youth sides/ends: `['tiered', 'wall', 'none']` (disables `'stacked_wall'`, `'vip_building'`). Max tiers = `2`. Wall size = `['small']` only.
       - Youth corners: `['round', 'square', 'none']` (disables `'tower'`, `'giant'`). `'round'` capped at `1 tier`; `'square'` capped at `'small'`. All `no_stand` backdrops remain enabled.
       - Street fields: all stand/corner/roof/dugout/tunnel/adboard fields forced off; governed strictly by `streetConfig`!
     - `getAllowedTunnelsForCategory(cat)`: Youth = `['inflatable_accordion', 'subterranean_staircase']`; Street = none.
     - `getAllowedDugoutsForCategory(cat)`: Youth = `['folding_chairs', 'utilitarian_concrete', 'classic_timber']`; Street = none (sideline wait bench/crates rendered by Street prop layer).
     - `getAllowedTurfQualitiesForCategory(cat, def)`: Youth default = `['normal', 'poor', 'synthetic']` (`'pristine'` disabled & replaced by `'synthetic'`; unlocked if `youthSpecialUnlocked`); Street = `['concrete', 'sand', 'synthetic', 'poor']`.
     - `getAllowedTimesOfDay(stadium)`: if `stadium.lighting.type === 'none'` or `stadium.streetConfig?.streetLighting === 'daylight_only'`, restrict to `['dawn', 'noon']` (disables `'sunset'`/afternoon and `'night'`).
     - `sanitizeStadiumForCategory(stadium)`: clamps Youth locks OR strips all Pro stadium elements when `category === 'street'` and populates safe `streetConfig` defaults.
4. **ALTER `src/gameplay/game/pitchDimensions.ts`**:
   - Parameterize `resolvePitchMetrics(config, matchMode)` and `syncPitchConfigWithMetrics(config, matchMode)`:
     - `'pro'` (also used by Int'l Youth Cup Final & U17 World Championship on Pro stadiums): 100–110m × 64–74m, `goalWidthPx = 220`, `crossbarHeightPx = 65`, `goalDepthPx = 60`.
     - `'youth'`: smaller rectangular bounds (**84–94m × 52–60m**, default **90m × 58m**), slightly smaller net (`goalWidthPx = 192`, `crossbarHeightPx = 56`, `goalDepthPx = 52`), proportionally scaled boxes.
     - `'street'`: compact 7v7 futsal/cage bounds (**42–52m × 24–32m**, default **46m × 28m**), smaller goalposts (`goalWidthPx = 148`, `crossbarHeightPx = 46`, `goalDepthPx = 40`).

### Phase 3 Acceptance Criteria
- `npm run build` / `tsc` passes cleanly; Pro matches behave identically when new optional fields are omitted.
- Unit checks verify all Youth stadium lock rules, `no_lights` time blocking, `synthetic` replacing `pristine`, and `'muddy'` contract types.

---

## Phase 4: Dedicated Editor Studio Portal & 3-Mode Stadium Creator/Selector UI
**Estimated Token Budget:** ~1 Day

### Objective
Add a dedicated **Stadium Editor** button in Editor Studio alongside Player/Team/Competitions, wire standalone routing in `App.tsx`, and refactor `StadiumCreatorModal.tsx` & `StadiumSelectorModal.tsx` with the **`Professional Stadiums` | `Youth Stadiums` | `Street Fields`** first pick, stadium picker/create-new flow, and enforced constraints.

### Files to CHECK (Read-Only Context)
- `src/components/MainMenu.tsx` (L770–886)
- `src/App.tsx` (L1368–1390 & `liveUiTab` render switch)
- `src/gameplay/components/StadiumCreatorModal.tsx`
- `src/gameplay/components/StadiumSelectorModal.tsx`
- `src/gameplay/game/stadiumRegistry.ts`
- `src/gameplay/game/stadiumConstraints.ts` (from Phase 3)

### Files to ALTER
1. **ALTER `src/components/MainMenu.tsx`**:
   - Add dedicated **Stadium Editor** button (`'stadium'`) in Editor Studio grid alongside `Player Editor`, `Team & Kits`, `Competitions`, `Card Deck Studio`, and `Option File Database`.
   - Extend `onStartEditor` prop union to include `'stadium'`.
2. **ALTER `src/App.tsx`**:
   - Extend `handleStartEditor` and `liveUiTab` to handle `'stadium_editor'`.
   - Render `StadiumCreatorModal` standalone from Main Menu (browse/edit existing stadium or Create New, clean return to Main Menu).
3. **ALTER `src/gameplay/game/stadiumRegistry.ts`**:
   - Default-tag existing Pro `STADIUM_REGISTRY`, `CURATED_STADIUMS`, and `GENERATED_COUNTRY_STADIUMS` with `category: 'pro'`.
   - Add `getRegisteredStadiumsByCategory(category: StadiumCategory)` and `createDefaultStadium(slot?, category?: StadiumCategory)`.
   - Run `sanitizeStadiumForCategory` inside `saveCustomStadium`.
4. **ALTER `src/gameplay/components/StadiumCreatorModal.tsx`**:
   - **Step 0 First-Pick Gateway (`showGateway`):** Choose **`Professional Stadiums`** (existing Pro modal & all current stadiums), **`Youth Stadiums`**, or **`Street Fields`**, then select an existing stadium from that category list to edit/clone or click **Create New**.
   - **Youth Mode Editor Locks (`stadiumConstraints.ts`):**
     - Step 1: Lock shape to `'rectangular'`; disable `surroundings`; replace `'pristine'` turf with `'synthetic'` (`+10% Injury Risk`; Int'l Youth Cup `youthSpecialUnlocked` badge unlocks `'pristine'`).
     - Step 2: Disable `'stacked_wall'`, `'vip_building'`, `'tower'`, `'giant'`; max 2 tiers; `wall` size `'small'` only; corners `round` (1 tier), `square` (`small`), or `none` (all `no_stand` backdrops kept); grade capped at `brutalist` (with ESP/ENG `industrial`, ENG `victorian`, `youthSpecialUnlocked` `modern` hooks).
     - Step 3: Limit tunnels (`inflatable_accordion`, `subterranean_staircase`) and dugouts (`folding_chairs`, `utilitarian_concrete`, `classic_timber`).
     - Step 4 & 5: Casual Youth Crowd toggle (`isCasualYouthCrowd`) & club color controls.
     - Step 6: Disable Roof completely (unless `youthSpecialUnlocked`); add `"No Lights"` (`lighting.type = 'none'`) blocking afternoon/sunset & night schedules.
   - **Dedicated Street Field Composer UI (Wildly Distinct Non-Stadium Editor):**
     - Instead of showing stripped-down Pro Stand/Roof/Dugout/Tunnel tabs when **`Street Fields`** is active, switch to a clean 3-tab Street Playground Composer:
       1. **Court & Surface:** Name, Linked Starting City, Archetype (`tarmac_cage`, `favela_quadra`, `potrero_dirt`, `courtyard_paving`, `rooftop_mesh`, `coastal_boardwalk`, `desert_sand_lot`), Surface (`concrete` | `sand` | `synthetic` | `poor`), and Court Markings (`spray_paint` | `chalk_dust` | `multisport_crossover` | `faded_tarmac`).
       2. **Walls & Goals:** Perimeter Rebound Wall (`chainlink_cage` | `graffiti_brick` | `corrugated_iron` | `timber_seawall` | `concrete_curb_wall`) & Street Goal Style (`futsal_tubular` | `chain_net_park` | `painted_wall_posts` | `crates_and_pipes`).
       3. **Neighborhood & Lighting:** Street Lighting (`sodium_streetlamps` | `festoon_string_lights` | `single_flood_pole` | `daylight_only`), Urban Props checkboxes (`parked_cars`, `laundry_lines`, `graffiti_murals`, `milk_crates`, `scooters`, `corner_kiosk`), and Street Onlookers (`none` | `sparse_locals` | `block_party_fence`).
5. **ALTER `src/gameplay/components/StadiumSelectorModal.tsx`**:
   - Filter venues by active `matchMode` (`'pro' | 'youth' | 'street'`), disable `sunset` & `night` time-of-day buttons when `lighting.type === 'none'`, and lock category-disallowed turf overrides.

### Phase 4 Acceptance Criteria
- Main Menu -> Editor Studio -> Stadium Editor opens the 3-category selector cleanly, lets users edit any existing stadium or add new venues in Pro/Youth/Street modes, and persists them.
- All Youth editor locks match spec in UI and on save.

---

## Phase 5: Renderers, Turf (`Synthetic`, `Sand` < `Poor`), Rain `'Muddy'` Physics (5–10% Tuning) & Dynamic Final Boards
**Estimated Token Budget:** ~1 Day

### Objective
Implement visual & physical fidelity for Youth stadiums (smaller pitch & net, casual crowd, no lights, no roof/surroundings/intro swoop), Street fields (walls, street surroundings, 4 surfaces), **`'sand'` slower/worse than `'poor'`, Rain `'muddy'` special status (5–10% max tuning)**, and **Int'l Youth Cup Final 60–80% casual crowd + `[CITY NAME] [YEAR]` dynamic perimeter boards**.

### Files to CHECK (Read-Only Context)
- `src/gameplay/game/turfPhysics.ts` (L1–203)
- `src/gameplay/game/weatherEngine.ts` (L1–160)
- `src/gameplay/game/goalNetPhysics.ts`
- `src/gameplay/game/ballPhysics.ts` (L1–320)
- `src/gameplay/game/playerActions.ts` (L1–350)
- `src/gameplay/game/pitchRenderer.ts` (L530–1065, L1525–2200)
- `src/gameplay/game/stadiumRenderer.ts` (L22780–22960 `drawStadiumAdHoardings`, L23570–24500)
- `src/gameplay/game/crowdRenderer.ts` (L650–1500)
- `src/gameplay/game/environmentRenderer.ts`
- `src/gameplay/game/skyCamRenderer.ts` (L90–450)
- `src/gameplay/components/PitchCanvas.tsx`
- `src/utils/competitionVenueSystem.ts` (L250–593)

### Files to ALTER
1. **ALTER `src/gameplay/game/turfPhysics.ts`**:
   - Add `'synthetic'`, `'concrete'`, and `'sand'` to `getTurfRollingModifiers`, `applyPoorTurfMicroHops`, and export `getTurfInjuryMultiplier(quality)`:
     - `'synthetic'`: identical rolling/bounce/micro-hop physics to `'poor'`, plus **`getTurfInjuryMultiplier('synthetic') === 1.10`** (+10% injury risk).
     - `'concrete'`: fast roll (`friction = 0.991`), crisp bounce (`0.78`), zero mud/micro-hops.
     - `'sand'`: **strictly slower and worse than `'poor'`** (compare `'poor'` `friction ~ 0.960–0.971` -> set `'sand'` heavier drag `friction = 0.948`, deadened bounce `0.40`, higher player movement drag `playerRunSpeedMultiplier = 0.93`, higher stamina drain `staminaMultiplier = 1.15`, heavier micro-hop deflection `microBounceChance = 0.055`, sandy divots/footprints).
2. **ALTER `src/gameplay/game/weatherEngine.ts` & `src/gameplay/game/ballPhysics.ts` & `src/gameplay/game/playerActions.ts`**:
   - **Rain `'muddy'` Special Surface Status:** Add `resolvePitchSurfaceStatus(weather, turfQuality): PitchSurfaceStatus` in `weatherEngine.ts`:
     - Returns `'muddy'` whenever `turfQuality === 'sand'` (or `'poor'` if toggled, specifically mandated for **`sand` + `rain`/`torrential`**!).
     - Export `getMuddyConditionModifiers(surfaceStatus)` with **strictly subtle 5–10% max deltas**:
       - `playerSpeedMultiplier: 0.93` (**-7%** slower running)
       - `staminaDrainMultiplier: 1.09` (**+9%** faster stamina spend)
       - `groundBallSpeedMultiplier: 0.92` (**-8%** slower ball speed/roll on ground)
       - `airBallSpeedMultiplier: 1.08` (**+8%** faster ball velocity / lower air drag when airborne -> makes **long shots, long passes, and crosses more effective**)
       - `shortPassSpeedMultiplier: 0.93` (**-7%** slower short pass release)
       - `shortPassErrorRadMax: ~0.07` (~**6–8%** slight accuracy penalty on short ground passes in `playerActions.ts`)
   - Hook `'muddy'` air/ground multipliers cleanly inside `ballPhysics.ts` & short-pass dispatch inside `playerActions.ts`.
3. **ALTER `src/gameplay/game/goalNetPhysics.ts`**:
   - Read live `PITCH_CONFIG.GOAL_WIDTH`, `PITCH_CONFIG.GOAL_DEPTH`, `PITCH_CONFIG.GOAL_CROSSBAR_HEIGHT` so Youth & Street goal frames collide at their exact scaled dimensions.
4. **CREATE `src/gameplay/game/streetRenderer.ts` & ALTER `src/gameplay/game/pitchRenderer.ts`:**
   - **Complete Visual Departure for Street Mode (`streetRenderer.ts`):** When `stadium.category === 'street'`, bypass standard stadium stands, perimeter tracks, corner towers, luxury tiers, broadcast TV boxes, Pro dugouts, and stadium ad-hoardings completely. Keep the **exact same 2D player models** on court while rendering a radically different street world:
     - **Street Court Surface (`pitchRenderer.ts`):** No mowed grass stripes! Renders cracked/poured `'concrete'` tarmac slabs, coarse `'sand'` beach/alley pits, dusty `'poor'` *potrero* earth, or patched `'synthetic'` astro mats, layered with spray-painted/chalked center circles, optional faded basketball/handball **multisport crossover court markings**, and `'muddy'` bog puddles when `'sand'` receives `'rain'`/`'torrential'`.
     - **Tight Perimeter Bounce Walls:** Drawn directly flush with the 7v7 touchlines (`chainlink_cage` mesh + posts, `graffiti_brick` alley wall with street art tags, `corrugated_iron` sheets, `timber_seawall`, or painted concrete barrier) so wall-rebound physics read unmistakably at a glance.
     - **Street Goal Frames:** Custom canvas routines for tubular futsal metal cages, chain-link park nets, painted brick-wall post outlines, or improvised crate/pipe goals sized cleanly to `148px` Street width.
     - **Zero-Stadium Neighborhood Props:** Parked compact cars & mopeds along the curb outside the cage, overhead washing lines across narrow courtyards, milk crates & backpacks stacked as sideline waits, graffiti murals, streetlamps casting warm sodium amber pools / strung festoon bulbs at dusk/night, and city-matched rooftops/alleys/coastlines hugging the perimeter.
   - **Youth Surface & Net Upgrades (`pitchRenderer.ts`):** Dark rubber-crumb `'synthetic'` turf texture + slightly smaller Youth nets (`192px`).
5. **ALTER `src/gameplay/game/crowdRenderer.ts`**:
   - **Youth Crowds (`isCasualYouthCrowd`):** 20–25% club jerseys, mostly everyday hoodies/jackets/jeans; supports **`crowdAttendancePctOverride`** for **Int'l Youth Cup Final (60%–80% mostly casual crowd)** on a Pro stadium.
   - **Street Fence Onlookers:** Zero grandstands; when `streetConfig.fenceCrowdMode !== 'none'`, renders organic small clusters of casual neighborhood spectators **leaning against the cage mesh, perched on courtyard steps, or sitting on parked car hoods** around the perimeter walls.
6. **ALTER `src/gameplay/game/stadiumRenderer.ts`, `src/gameplay/game/environmentRenderer.ts`, `src/gameplay/game/skyCamRenderer.ts`, `src/gameplay/components/PitchCanvas.tsx`, & `src/utils/competitionVenueSystem.ts`**:
   - Branch top-level arena rendering in `PitchCanvas.tsx` / `stadiumRenderer.ts`:
     - `'pro'` & `'youth'` -> run Pro/Youth stadium pipeline (`youth` enforces `lighting.type === 'none'` no-pylon/daytime lock, suppresses exterior surroundings, and skips `createPreMatchSwoop`).
     - `'street'` -> delegate arena frame, rebound walls, street props, and lighting pools directly to **`streetRenderer.ts`**, skip `createPreMatchSwoop` broadcast swoop, and render close-cropped urban alley/courtyard/beach surroundings in `environmentRenderer.ts`.
   - **Int'l Youth Cup Final Adboards:** Update `competitionVenueSystem.ts` + `drawStadiumAdHoardings` (`stadiumRenderer.ts:22780`) so when an International Youth Cup Final is hosted at an existing Pro stadium, adboards dynamically display **`FINAL • [STADIUM CITY] • [CURRENT SIM YEAR]`** (matching the chosen Pro stadium's `city` and the current simulation `year`).

### Phase 5 Acceptance Criteria
- Visual check confirms `'sand'` moves/rolls worse than `'poor'`, `'rain'` on `'sand'` triggers visible `'muddy'` patches and 5–10% tuned physics (slower runs, +stamina burn, slower ground roll, zippier airborne long shots/passes/crosses, slightly looser short passes).
- Int'l Youth Cup Final on a Pro stadium renders 60–80% mostly casual crowd and `[CITY NAME] [YEAR]` perimeter boards.

---

## Phase 6: Youth 23-Player Squads, OVR Escalation, Int'l Cup Grouping, U17 DB Call-Ups & Youth Stadiums
**Estimated Token Budget:** ~1 Day

### Objective
Populate all Youth Leagues and International Youth Cup clubs with **23-player squads (11 starters + 7 subs + 5 reserves)** scaling by age (10→16, Kickoff default = 16), bundle single-team Int'l Youth Cup countries (e.g., Greek & Balkan), generate BIG/SMALL & Special Youth stadiums, and **wire U17 World Championship squads directly to the existing National Teams DB + merit-based U17 call-ups**.

### Files to CHECK (Read-Only Context)
- `src/constants.ts` (`STARTING_CITIES` L393–586)
- `src/data/youthLeaguesDatabase.ts`
- `src/data/internationalYouthPool.ts`
- `src/utils/internationalYouthCupEngine.ts`
- `src/utils/nationalTeamDatabaseManager.ts` (L366–622)
- `src/utils/u17NationalTeamEngine.ts` (L95–260)
- `src/utils/squadSaveFileSystem.ts`
- `src/gameplay/game/stadiumRegistry.ts`

### Files to CREATE / ALTER
1. **CREATE `src/utils/youthSquadGenerator.ts`**:
   - Seeded builder outputting a complete **23-player `EditorTeamData` squad** (11 Starting XI `slots 1-11`, 7 Subs `slots 12-18`, 5 Reserves `slots 19-23`, compatible with `squadSaveFileSystem.ts`).
   - **`getYouthScaledTeamAndPlayers(club, age = 16, mode = 'league' | 'intl_cup')`**:
     - Clamps `age` (`10..16`; defaults to **`16`** in Kickoff).
     - Scales team OVR and every individual player's OVR/canonical attributes up yearly through age 16.
     - Assigns higher OVR tiering to **International Youth Cup** clubs over domestic Youth League clubs at the same age.
2. **ALTER `src/data/youthLeaguesDatabase.ts`**:
   - Expand Youth League definitions to provide **full, dedicated Youth Leagues for all 9 `STARTING_CITIES`**: Buenos Aires, São Paulo, Madrid, London, Paris, **Roma (Italy), Berlin (Germany), Lisboa (Portugal), and Riyadh (Saudi Arabia)** (zero cross-city fallback/redirects).
   - Tag top 2–3 clubs per all 9 Youth Leagues as `tierClass: 'big'` and the remaining clubs as `'small'`; assign authentic club kits, casual crowd palette colors, and 23-player seeded rosters (`11 + 7 + 5`).
3. **CREATE `src/utils/internationalYouthGrouping.ts` & ALTER `src/data/internationalYouthPool.ts`**:
   - Upgrade all 48 Int'l Youth Cup pool clubs to 23-player squads (keeping `representativePlayers` synced).
   - Group teams by country; automatically bundle countries with only 1 team into regional sections (e.g. **Greek & Balkan**, **Nordic**, **Benelux / Alpine**, **North & West Africa**, etc.) with `sectionId`, `sectionLabel`, and `teamCountInSection`.
4. **CREATE `src/gameplay/game/youthStadiumGenerator.ts` & ALTER `src/gameplay/game/stadiumRegistry.ts`**:
   - **2 Youth Stadiums per Youth League:**
     - `BIG` Club Youth Stadium (2–3 big clubs): `'poor'` turf, more stands (up to full 4 stands), more `'brutalist'` stands; **ESP/ENG** allow `'industrial'`; **ENG** can also use `'victorian'`; casual youth crowd; no roof/surroundings/entry cinematic.
     - `SMALL` Club Youth Stadium: only 1–2 stands (rest `'none'`/`no_stand`), `'synthetic'` turf (+10% injury risk), mostly `'municipal'` stands (max 1 `'brutalist'`); casual youth crowd; no roof/surroundings/entry cinematic.
   - **1 Special Unlocked Youth Stadium per Int'l Youth Cup Country/Bundled Section with 2+ teams:**
     - Tagged `youthSpecialUnlocked: true`, unlocks `'pristine'` turf, `roof`, and up to `'modern'` stands.
5. **ALTER `src/utils/nationalTeamDatabaseManager.ts` & `src/utils/u17NationalTeamEngine.ts`**:
   - **Populate U17 National Teams from Existing DB:** Ensure `buildFull35SquadForTier(..., 'U17')` draws real `age <= 17` / U17 players from club `u17` rosters AND generated U17/Youth club pools in `leagueDb` first before procedural backfill, keeping each nation's `u17Squad` sorted by **highest OVR** so the U17 manager genuinely picks the best available U17 talents.
   - **Merit-Based U17 Call-Up (`checkU17QualifiersEligibility` & `checkU17WorldCupEligibility`):** In addition to age `<= 16` (qualifiers) / `<= 17` (U17 World Cup), query the nation's populated `nationalTeam.u17Squad` in `getNationalTeamsDatabase()` — if the Unique Career user's OVR meets or beats the weakest incumbent starter/23-man cutoff at their position line (`userOvr >= incumbentPositionCutoff || userOvr >= minThreshold`), the national manager calls up the user (`isEligible = true`, awarding `'Key Starter'` if beating top-11 positional incumbent, `'Squad Player'` if beating top-23 squad cutoff)!

### Phase 6 Acceptance Criteria
- Every Youth League & Int'l Youth Cup club returns 23 real players (`11 + 7 + 5`) defaulting to age 16 in Kickoff and scaling from age 10→16 in Career.
- `getRegisteredStadiumsByCategory('youth')` holds `2 * numYouthLeagues` BIG/SMALL stadiums + 1 special stadium per 2+ team country/section.
- Every nation's `u17Squad` is populated from DB U17 players, and Unique Career U17 call-ups dynamically evaluate whether the user is better than incumbent U17 DB players.

---

## Phase 7: Pro-Parity Youth Sim, Int'l Youth Cup Final (Pro Venue/45m) & U17 World Championship Pro Rules
**Estimated Token Budget:** ~1 Day

### Objective
Upgrade domestic Youth Leagues, Career season-blocks, and the International Youth Cup to run full 23-player match simulations mirroring `professionalLeagueEngine.ts`, and configure **Pro-stadium 45-minute half rules** for both the **International Youth Cup Final** and **U17 World Championship**.

### Files to CHECK (Read-Only Context)
- `src/utils/professionalLeagueEngine.ts`
- `src/utils/databaseMatchSimulationEngine.ts`
- `src/utils/youthLeagueSimulation.ts`
- `src/utils/youthMatchSimulator.ts`
- `src/utils/youthLeagueSystem.ts`
- `src/utils/internationalYouthCupEngine.ts`
- `src/utils/u17NationalTeamEngine.ts`

### Files to ALTER
1. **ALTER `src/utils/youthLeagueSimulation.ts`**:
   - Replace aggregate random OVR simulation with real **23-player squad fixture simulation** via `simulateDatabaseMatch` (full Starting XI / 7 subs / 5 reserves participation, goal/assist/card/rating logs, age-scaled `age <= 16` builds from `youthSquadGenerator.ts`).
2. **ALTER `src/utils/youthMatchSimulator.ts` & `src/utils/youthLeagueSystem.ts`**:
   - Resolve each Youth fixture's 23-player squads, BIG/SMALL club stadium, and synthetic-pitch **+10% injury risk**.
3. **ALTER `src/utils/internationalYouthCupEngine.ts`**:
   - Run group & knockout stages on 23-player squads from `youthSquadGenerator.ts` (Int'l Youth Cup boosted OVRs) hosted at country/section Special Unlocked Youth Stadiums (35-min halves).
   - **Configure International Youth Cup Final Showcase Match (`resolveIntlYouthCupFinalVenueConfig`):**
     - Selects an **existing Professional Stadium** from `stadiumRegistry.ts` (`category === 'pro'`, deterministic per tournament year).
     - Marks rules as **45-min halves** (`displayedHalfMinutes: 45`), **Pro dimensions**, **60%–80% crowd attendance** (`crowdAttendancePctOverride: 0.60..0.80`), **mostly casual crowd** (`isCasualCrowd: true`), and passes `finalBoardCity: stadium.city` + `finalBoardYear: seasonYear` for dynamic stadium adboards — while still fielding the two finalists' **Youth squads**.
4. **ALTER `src/utils/u17NationalTeamEngine.ts`**:
   - Expose `resolveU17WorldCupMatchConfig(fixture, nationA, nationB, seasonYear)` using **existing Pro stadiums** (from Pro stadium pools), **45-min halves** (`displayedHalfMinutes: 45`), Pro dimensions, and calling up the populated 23-player `u17Squad` (plus Unique Career user if selected!).

### Phase 7 Acceptance Criteria
- Domestic Youth Leagues & Int'l Youth Cup simulate realistic 23-player box scores, scorers, assisters, MVPs, and standings mirroring Pro simulation.
- Int'l Youth Cup Final config resolves an existing Pro stadium, 45m halves, Youth squads, 60–80% casual crowd, and `[CITY NAME] [YEAR]` boards.
- U17 World Championship fixtures resolve populated DB `u17Squad`s, Pro stadiums, and 45m halves.

---

## Phase 8: Street Stadiums (1/City), Dynamic Per-Play 13-Player Pool & 7v7 Adapter
**Estimated Token Budget:** ~1 Day

### Objective
Generate **one distinct 32-bit Street Stadium for every Starting City** (`STARTING_CITIES`), build the **un-cached dynamic 13-player Street pool builder** that draws a fresh 13-player roster from the user's current city each time Street play starts, and adapt `gameplayAdapter.ts` / `teams.ts` for native **7v7 (`1-2-2-2`)** teams.

### Files to CHECK (Read-Only Context)
- `src/constants.ts` (`STARTING_CITIES`)
- `src/data/youthLeaguesDatabase.ts`
- `src/data/defaultLeagues.ts`
- `src/utils/leagueDatabaseSystem.ts`
- `src/utils/gameplayAdapter.ts` (L890–1184)
- `src/gameplay/game/teamDatabase.ts`
- `src/gameplay/game/teams.ts`

### Files to CREATE / ALTER
1. **CREATE `src/gameplay/game/streetStadiumGenerator.ts`**:
   - Build **1 bespoke 32-bit Street Venue per `STARTING_CITIES` entry** populated with rich `StreetArenaConfig` presets (so each feels genuinely street-based and completely different from Pro/Youth stadiums while using the same player models):
     - **Buenos Aires** (*Potrero de Villa*): `potrero_dirt` / `poor` soil, `corrugated_iron` & `graffiti_brick` walls, `chalk_dust` lines, `crates_and_pipes` goals, `sodium_streetlamps`, `parked_cars` + `laundry_lines` + `murals`.
     - **São Paulo** (*Quadra da Várzea*): `favela_quadra` / `concrete`, `graffiti_brick` + `chainlink_cage`, `multisport_crossover` yellow/white lines, `futsal_tubular` goals, `festoon_string_lights`, `block_party_fence`.
     - **London** (*South London Tarmac Cage*): `tarmac_cage` / `synthetic`, high `chainlink_cage` mesh, `spray_paint` court lines, `chain_net_park` goals, `sodium_streetlamps`, London brick tenements + `parked_cars`.
     - **Madrid** (*Pista del Barrio*): `courtyard_paving` / `concrete`, `concrete_curb_wall`, `multisport_crossover` lines, `futsal_tubular` goals, enclosed apartment courtyard + `laundry_lines`.
     - **Paris** (*Banlieue City Stade*): `tarmac_cage` / `synthetic`, black steel `chainlink_cage`, `spray_paint` markings, `futsal_tubular` goals, `single_flood_pole`, metro overpass backdrop.
     - **Roma** (*Campetto di Quartiere*): `courtyard_paving` / `concrete`, weathered `graffiti_brick` walls, `painted_wall_posts`, `festoon_string_lights`, `scooters` + `corner_kiosk`.
     - **Berlin** (*Hinterhof Betonkäfig*): `rooftop_mesh` / `concrete`, `chainlink_cage` + heavy graffiti murals, `faded_tarmac` lines, `chain_net_park` goals, `sodium_streetlamps`.
     - **Lisboa** (*Recinto Ribeirinho*): `coastal_boardwalk` / `sand`, `timber_seawall`, `chalk_dust` lines, `futsal_tubular` goals, tiled seaside alley & `laundry_lines`.
     - **Riyadh** (*Al-Malaz Sand Lot*): `desert_sand_lot` / `sand`, low sandstone/`concrete_curb_wall`, `chalk_dust` lines, `crates_and_pipes` goals, `sodium_streetlamps`, parked sedans at court edge.
   - Register all generated Street venues in `stadiumRegistry.ts` under `category: 'street'`.
2. **CREATE `src/utils/streetTeamBuilder.ts`**:
   - `buildStreetMatchTeams(cityId, leagueDb, userPlayer?)`:
     - **Fresh Per-Play Generation Rule:** Uses non-sticky / fresh random sampling (`crypto` or fresh timestamp nonce when `seed` is omitted) **every single time** the user chooses Street Kickoff or `"PLAY ON THE STREETS"` so the 13-player pool **always changes based on current city**.
     - **City-Scoped Player Pool:** Resolves `currentCity` -> City Youth League clubs (all 9 cities covered) + Country D1 clubs + Country D2 clubs (from `careerLeagueDb` / `defaultLeagues`), pools all eligible players, and randomly draws **13 players**, guaranteeing **1 GK per side** (`2` GKs across the 14-player match sheet; assigns/swaps a keeper automatically if the random draw pulls `< 2` natural GKs).
     - **Unique Career (1 user + 13 drawn = 14):** Splits into Home 7 (User + 6 drawn) vs Away 7 (7 drawn).
     - **Kick Off (13 drawn + 1 city-captain/bonus = 14):** Splits into two balanced 7-man teams.
     - **Streetwear Bibs:** Applies contrasting casual **Streetwear bibs/jerseys** per side (reusing the same player sprites/models) and maps each squad strictly to **`1-2-2-2`** roles (`GK, DEF1, DEF2, MID1, MID2, ATT1, ATT2`).
3. **ALTER `src/utils/gameplayAdapter.ts` & `src/gameplay/game/teams.ts`**:
   - Add 7v7 conversion path in `editorTeamToGameplayTeam` / `buildStreetGameplayTeams` when `teamSize === 7` (never pads to 11!).
   - Expose `buildYouthAndIntlCupGameplayTeams` (defaulting Kickoff Youth to `age = 16`) and `buildU17NationalGameplayTeams` (pulling populated DB `u17Squad` + Unique Career user).

### Phase 8 Acceptance Criteria
- Every Starting City has its own registered Street stadium with unique visuals & surface.
- Entering Street Mode twice in a row in the same city yields **different fresh 13-player random pulls** from `[City Youth + Country D1 + Country D2]`; switching city changes the entire source player pool immediately.

---

## HOTFIX PHASE A9: Street Captain Card-Draw Cinematic, Positional 1-2-2-2 Balancing, Career OVR Captaincy & Light/Dark Streetwear Outfits
**Estimated Token Budget:** ~0.75 Day *(Naming Convention: future pre-Phase-9 hotfixes increment alphabetically: `HOTFIX PHASE B9`, `HOTFIX PHASE C9`, etc.)*

### Objective
Upgrade Phase 8's Street 7v7 team generation and character styling before Phase 9/10 UI integration: expand the city player pool to include **D1 & D2 `reserves`, `u20`, and `u17` squads**, introduce an interactive **3-card Top-15 Captain Draft Cinematic** for human Kick Off sides (Home then Away if both human; CPU auto-drafts silently), enforce strict **positional `1-2-2-2` slot accounting** that discounts the chosen captain (or Unique Career player) so each side gets **exact `[1 GK, 2 DEF, 2 MID, 2 ATT]`** without duplicate GKs, assign Unique Career captaincy by **highest team OVR** rather than forcing the user as captain, and render **randomized Light vs Dark regular Streetwear clothing** cleanly on our existing player models.

### Files to CHECK (Read-Only Context)
- `src/utils/streetTeamBuilder.ts`
- `src/utils/gameplayAdapter.ts`
- `src/gameplay/types/team.ts` & `src/gameplay/types/player.ts`
- `src/gameplay/game/sprites.ts`, `src/gameplay/game/spriteRig.ts`, `src/gameplay/game/arcadeSprites.ts`, & `src/gameplay/game/appearanceV2.ts`
- `src/components/BigPackOpeningExperience.tsx`, `src/components/PixelPackOpeningExperience.tsx`, `src/components/StreetCardModal.tsx`, & `src/components/PlayerCard.tsx`
- `src/components/GameplayModeShell.tsx`, `src/gameplay/components/SideSelectModal.tsx`, & `src/gameplay/components/PreMatchModal.tsx`

### Files to CREATE / ALTER
1. **ALTER `src/utils/streetTeamBuilder.ts`**:
   - **Full City Pool Including Reserves, U20 & U17:** When collecting players from Country D1 and D2 clubs for the current Starting City, gather eligible players across **`squad` + `reserves` + `u20` + `u17`** alongside the City Youth League squads.
   - **Top-15 Captain Candidate Pool & Positional Draw Budgeting (`1 GK, 2 DEF, 2 MID, 2 ATT`):**
     - Sort the city pool by OVR (`ovr` / `overallRating`) descending and slice the **top 15 highest-ranked players**.
     - **Human Side (Kick Off):** Present **3 randomly sampled players from that Top-15 pool**; user picks **1 as Captain**.
     - **CPU Side (Kick Off, or Away CPU in Unique Career):** Automatically draw **1 captain at random from the Top-15 pool** + remaining 6 teammates without playing any cinematic.
     - **Strict Positional Accounting (Discounting Captain / Unique Player):**
       - Resolve the anchored player's bucket (`'GK' | 'DEF' | 'MID' | 'ATT'`) and subtract `1` from `[GK: 1, DEF: 2, MID: 2, ATT: 2]`:
         - Anchor is `GK` -> draw `0 GK, 2 DEF, 2 MID, 2 ATT` (**never** draw an extra GK!)
         - Anchor is `DEF` -> draw `1 GK, 1 DEF, 2 MID, 2 ATT`
         - Anchor is `MID` -> draw `1 GK, 2 DEF, 1 MID, 2 ATT`
         - Anchor is `ATT` -> draw `1 GK, 2 DEF, 2 MID, 1 ATT`
       - Draw each remaining bucket randomly from the remaining city pool (ensuring both sides remain disjoint across the 14-player sheet and never pulling a 2nd player from a filled bucket unless a bucket pool fallback is exhausted).
   - **Unique Career Adjustment:**
     - Replace the Captain Card-Draw step with the **user's Unique Career player** occupying 1 slot (discounting the user's position from the remaining 6 positional draws — e.g., if user is `ATT`, draw only `1` additional `ATT`, plus `1 GK, 2 DEF, 2 MID`; if user is `MID`, draw `1` additional `MID`, plus `1 GK, 2 DEF, 2 ATT`; etc.).
     - **OVR-Based Captaincy:** Do **not** force the Unique Career player to be captain; assign captaincy (`isCaptain: true` / armband) automatically to the **highest-OVR player** on the Home 7 (and highest-OVR on the Away 7).
   - **Randomized Light vs Dark Streetwear Outfit Generator:**
     - Generate per-player `StreetwearOutfit` metadata compatible with the in-match model:
       - **Home Side (White / Bright Palette):** White (`#f8fafc`), Sky Blue (`#7dd3fc` / `#38bdf8`), Light Yellow (`#fef08a`), Light Pink (`#fbcfe8` / `#f9a8d4`), Cream, etc.
       - **Away Side (Dark Palette):** Black (`#111827`), Dark Purple (`#3b0764` / `#4c1d95`), Dark Brown (`#451a03` / `#5c3317`), Charcoal, Deep Navy-Black — guaranteeing immediate on-court separation with zero color overlap.
       - **Varied Garment Items:** Randomly mix casual tops (`tshirt`, `hoodie`, `tank_top`, `windbreaker`), bottoms (`shorts`, `jeans`, `joggers`), casual sneakers, and optional headwear (`cap`, `beanie`, `none`) per player so teams look like real neighborhood pickup squads rather than uniformed kits.
2. **CREATE `src/gameplay/components/StreetCaptainDrawModal.tsx` (Reusing 32-Bit Card Reveal Language):**
   - Renders the interactive **3-Card Captain Selection Cinematic** for human Street Kick Off sides using our 32-bit card reveal/pack-opening aesthetic:
     - Shows the **3 Top-15 city star cards** (OVR, position badge, club/tier origin, key stats, animated card flip/glow) and prompts `"PICK YOUR STREET CAPTAIN"`.
     - **Control-Aware Sequencing:** Trigger **only when a side is human-controlled** (`Home === player`, `Away === player`, or both):
       - **Player (Home) vs CPU (Away):** Plays Home captain card-draw cinematic -> CPU Away auto-draws captain & 6 teammates -> triggers remaining 6 Home positional draws -> Kick-off.
       - **CPU (Home) vs Player (Away):** CPU Home auto-draws silently -> Plays Away captain card-draw cinematic -> Kick-off.
       - **Player (Home) vs Player (Away):** **Home side draws first**, confirms captain -> **Away side draws second**, confirms captain -> remaining 6+6 positional draws -> Kick-off.
     - **Unique Career Street (`"PLAY ON THE STREETS"`):** Skips captain cinematic entirely (user enters directly into slot, remaining 6 positional teammates drawn automatically, highest-OVR player wears captain armband).
3. **ALTER `src/gameplay/types/team.ts`, `src/gameplay/game/sprites.ts`, `src/gameplay/game/spriteRig.ts`, & `src/gameplay/game/arcadeSprites.ts`**:
   - Add optional `streetOutfit?: StreetwearOutfit` (`topStyle`, `topColor`, `topAccentColor`, `bottomStyle: 'shorts' | 'jeans' | 'joggers'`, `bottomColor`, `shoeColor`, `hatStyle?: 'cap' | 'beanie' | 'none'`, `hatColor?`) on `TeamRosterPlayer` / player sprite render payload.
   - Extend the existing 2D/32-bit player model renderer cleanly so when `streetOutfit` is present:
     - Renders **regular street clothes** (jeans/long legs or casual shorts, streetwear t-shirt/hoodie top, casual sneakers, optional baseball cap or beanie) cleanly scaled to body height/pose on our existing animated player rigs without clipping or breaking Pro/Youth football kits.
4. **ALTER `src/utils/gameplayAdapter.ts` & `src/components/GameplayModeShell.tsx` / `src/gameplay/components/SideSelectModal.tsx`**:
   - Thread `streetOutfit`, Side Select (`player` vs `cpu`) awareness, and `StreetCaptainDrawModal` sequence into Street Kick Off & Unique Career launch hooks cleanly.

### HOTFIX PHASE A9 Acceptance Criteria
- City Street pools include Youth League + D1 + D2 (`squad`, `reserves`, `u20`, and `u17`).
- On Kick Off, every human side plays the 3-card Top-15 Captain Draw Cinematic (Home first, then Away if P1 vs P2); every CPU side auto-drafts silently with zero cinematic.
- Remaining 6 teammates are drawn strictly by positional deficit from `[1 GK, 2 DEF, 2 MID, 2 ATT]`; drafting a GK captain guarantees zero additional GK draws.
- In Unique Career Street, no captain cinematic plays; the Unique Career player takes 1 slot (discounting their position from the 6 draws), and the highest-OVR player on the 7-man squad is assigned captain.
- On the pitch, Home players wear varied randomized **white/bright streetwear** (white, sky blue, light yellow, light pink) and Away players wear varied randomized **dark streetwear** (black, dark purple, brown) with t-shirts, shorts, jeans, caps, etc., rendered cleanly on our existing player models.

---

## Phase 9: MatchEngine Mechanics (Youth 35m, Street 7v7, Muddy Physics) & Mode-Specific HUD Scoreboards
**Estimated Token Budget:** ~1.5 Days (Sub-checkpoints: [A] Clock, Speed, 7v7 AI, Walls/Corners, Muddy Integration; [B] Street Fouls/Injuries & Custom Broadcast Scoreboards)

### Objective
Implement Youth rules (`35m` halves, synthetic `+10%` injury), Street 7v7 futsal rules (`30m` halves, `+10%` speed, wall rebounds, throw-in corners, no offsides, fouls off except double-tap `E` hit, tackle injuries), `'sand'` < `'poor'` & Rain `'muddy'` 5–10% runtime modifiers, and **custom HUD scoreboards in `MatchHUD.tsx`** (Street, each Youth League, and Int'l Youth Cup).

### Files to CHECK (Read-Only Context)
- `src/gameplay/game/engine.ts` (L820–970, L1119–1145, L1860–1980, L2830–2875, L3650–3930, L4470–4950, L7020–7078)
- `src/gameplay/game/pitchBoundary.ts`
- `src/gameplay/game/matchRules.ts`
- `src/gameplay/game/setPieces.ts`
- `src/gameplay/game/formations.ts`
- `src/gameplay/game/tactics.ts`
- `src/gameplay/game/ai.ts`
- `src/gameplay/components/MatchHUD.tsx` (L1–422)

### Files to ALTER
1. **ALTER `src/gameplay/game/formations.ts` & `src/gameplay/game/tactics.ts`**:
   - Add `'1-2-2-2'` formation coordinates sized for compact Street pitches.
   - Add `getMatchModeRules(mode, options?)` returning Youth League (`35m`), **Int'l Youth Cup Final (`45m`, Pro pitch)**, **U17 World Cup (`45m`, Pro pitch)**, and Street (`30m`, `1.10x` speed, `7v7`, walls, throw-in corners, `offsidesEnabled: false`, `foulsMode: 'street_hit_only'`).
2. **ALTER `src/gameplay/game/pitchBoundary.ts`, `src/gameplay/game/matchRules.ts`, & `src/gameplay/game/setPieces.ts`**:
   - **Street Sideline Wall Rebound:** When `matchMode === 'street'` and ball hits `touchline_left` / `touchline_right`, reflect `ball.vx = -ball.vx * 0.78`, keep play live (**zero throw-ins**).
   - **Street Throw-In Corners:** Endline exits outside goalpost trigger `'throw_in'` corner delivery when awarding corners (goal kicks normal).
   - Disable offsides in Street mode.
3. **ALTER `src/gameplay/game/ai.ts`**:
   - Dynamic `teamPlayers.length` indexing (supports both `7` and `11`) and tight Street 7v7 spacing without phantom wingbacks.
4. **ALTER `src/gameplay/game/engine.ts`**:
   - Store `matchMode`, `displayedHalfMinutes` (`45` / `35` / `30`), and live `surfaceStatus` (`'muddy'` when `'sand'` + `'rain'/'torrential'`).
   - Multiply `getTimeScale()` by **`1.10`** in Street mode; drive half-time & full-time whistles from `displayedHalfMinutes` (`35`/`70` for Youth, `30`/`60` for Street, **`45`/`90` for Pro, Int'l Youth Cup Final, and U17 World Championship**).
   - Apply `'muddy'` player run-speed (`-7%`) & stamina-drain (`+9%`) modifiers in player movement/stamina ticks.
   - **Street Fouls (`DOUBLE_TAP_E_WINDOW_MS = 280`):** Suppress standard tackle fouls & cards in Street mode; **ONLY double-tap `E` hit** near an opponent triggers `street_hit` -> foul restart (`awardFoul`).
   - **Tackle Injuries & Career Street Remainder Sim (`injuredPlayerIds`, `userWasInjuredInMatch`, `lockedUserRatingAtInjury`, `userInjuryRiskPct`):**
     - Active in both Youth (`+10%` on `'synthetic'`) and Street (tackles can still injure despite zero fouls!).
     - When `userWasInjuredInMatch` triggers in Career Street mode: **snapshot & lock the user's current match rating**, fast-forward / simulate remaining match minutes to full time, flag `userInjured = true` + compute final injury roll probability, and return `{ finalScore, lockedUserRating, userInjured: true, userInjuryRiskPct }` cleanly in match completion payload.
5. **ALTER `src/gameplay/components/MatchHUD.tsx` & `src/gameplay/components/PitchCanvas.tsx`**:
   - **Tighter Street Camera Zoom (`PitchCanvas.tsx`):** Increase effective camera zoom multiplier for `matchMode === 'street'` so the compact `46m × 28m` court, players, perimeter bounce walls, and immediate surrounding urban alleys fill the viewport tightly (no wide empty stadium margins).
   - **Fix Hardcoded Half Check (`MatchHUD.tsx:74`):** Replace `minutes >= 45` with `minutes >= (displayedHalfMinutes || 45)` so Street (`30`) and Youth (`35`) switch to `2ND HALF` accurately.
   - **Generate Mode- & League-Specific Broadcast Scoreboard Themes (`getScoreboardTheme(scoreboardThemeId)`):**
     - **Unique Street Scoreboard:** Urban neon/graffiti streetball broadcast bar (`STREET 7v7` / spray tag + concrete/cage border, no TV satellite badge).
     - **Unique Scoreboard per Youth League:** Dedicated distinct accent/frame/broadcast tag for **all 9 Youth Leagues** (Buenos Aires celeste-gold, São Paulo verde-amarelo, Madrid crimson-amber, London slate-cyan, Paris tricolor steel, **Roma** burgundy-gold, **Berlin** charcoal-amber industrial, **Lisboa** sea-teal-white, **Riyadh** emerald-sand gold).
     - **Special International Youth Cup Scoreboard:** Gold/emerald crest prestige broadcast header (`INT'L YOUTH CUP` / `FINAL • [CITY] [YEAR]` badge on Finals).
     - **U17 World Championship Scoreboard:** Clean international FIFA-style U17 badge (`U17 WORLD CUP`).

### Phase 9 Acceptance Criteria
- Street renders 7v7 `1-2-2-2`, runs 30m halves at 1.10x speed, bounces off sidelines, takes corners as throw-ins, whistles fouls **only** on double-tap `E` hits, and still rolls tackle injuries.
- Youth runs 35m halves (with 45m for Int'l Youth Cup Final & U17 World Cup), +10% synthetic injury risk, and displays distinct scoreboards per Street, each Youth League, and Int'l Youth Cup.

---

## Phase 10: Kickoff 3-Mode Selector, Youth/Cup/U17 `PLAY` Buttons, Unique Career Street & E2E QA
**Estimated Token Budget:** ~1 Day

### Objective
Wire all playable modes into Kick Off and Unique Career: **3-mode Kick Off (`PROFESSIONAL | YOUTH LEAGUES | STREET`)**, playable **`PLAY` buttons for Youth League, International Youth Cup (including Pro-stadium Final), and U17 World Championship**, and playable **"PLAY ON THE STREETS"** in Unique Career (with Kickoff Street giving 0 dev points and Career Street scaling dev points by match rating, 0 on injury).

### Files to CHECK (Read-Only Context)
- `src/components/GameplayModeShell.tsx`
- `src/gameplay/components/TeamSelectorModal.tsx`
- `src/gameplay/components/PreMatchModal.tsx`
- `src/gameplay/components/PreMatchPresentationModal.tsx`
- `src/gameplay/components/PauseModal.tsx`
- `src/gameplay/components/EndGameModal.tsx`
- `src/components/YouthSeasonDashboardModal.tsx` (L610, L7830–8060, L8374–8430)
- `src/components/EarlyCareerDecisionModal.tsx`
- `src/components/FreeAgentHubModal.tsx`
- `src/App.tsx` (L2154–2272, L3270–3290, L4020–4045, L4535–4575)
- `src/utils/developmentSystem.ts` (`rollStreetFootballDevelopment`)
- `src/utils/staminaInjurySystem.ts` (`InjuryDetails`, `generateRandomInjury`, `processInjuryForPlayer`)

### Files to ALTER
1. **ALTER `src/components/GameplayModeShell.tsx`**:
   - Add Kick Off **Match Mode Selector** (`PROFESSIONAL` | `YOUTH LEAGUES` | `STREET`) on entry before Side/Team selection:
     - `PROFESSIONAL`: existing Pro selector, 11v11, 45m halves, Pro stadiums.
     - `YOUTH LEAGUES`: shows all **9 city Youth Leagues** (**defaulting to age-16 OVRs** & unique Youth League scoreboard themes) + **"International Youth Cup"** accordion sorted by country & bundled single-team sections (35m regular / **Final toggle -> Pro stadium, 45m halves, 60–80% casual crowd, `[CITY] [YEAR]` adboards, special Int'l Youth Cup scoreboard**).
     - `STREET`: picks Starting City -> runs **HOTFIX PHASE A9** human-only Top-15 Captain 3-card draw cinematic (Home first, then Away; CPU silent) + positional 6-man draw (`[1 GK, 2 DEF, 2 MID, 2 ATT]`, discounting captain) from Youth + D1/D2 (`squad` + `reserves` + `u20` + `u17`) with **Light vs Dark Streetwear clothes**, locks `1-2-2-2`, sets tighter Street camera zoom & `matchMode = 'street'` (30m halves, +10% speed, Street scoreboard). **Zero development points** in Kickoff — displays match ratings & Street scoreboard only (`EndGameModal` shows Street Rating & MVP).
   - Extend `GameplayMatchResult` to expose `userRating`, `userInjured`, and `userInjuryRiskPct`.
2. **ALTER `src/gameplay/components/TeamSelectorModal.tsx`, `PreMatchModal.tsx`, `PreMatchPresentationModal.tsx`, `PauseModal.tsx`, & `EndGameModal.tsx`**:
   - Add all 9 Youth Leagues + Int'l Youth Cup country-section accordions to `TeamSelectorModal`.
   - Hide complex formation/tactic controls in Street matches (`1-2-2-2` fixed) and show accurate half-duration badges (`45 MIN` Pro / Int'l Final / U17 WC, `35 MIN` Youth, `30 MIN` Street).
   - Hide Street Dev Point banners in Kickoff `EndGameModal`.
3. **ALTER `src/components/YouthSeasonDashboardModal.tsx`**:
   - **Unlock `PLAY` for Youth League & Int'l Youth Cup (`L610`, `L7832`):** Enable the **`▶ PLAY`** flow for Youth League fixtures (all 9 leagues, 35m halves, BIG/SMALL Youth Stadium, age-scaled 23-man squads, Youth League scoreboard) AND **International Youth Cup** matches (`35m` halves + Special Unlocked Section Stadium pre-final; **Final switches automatically to an existing Pro Stadium, `45m` halves, `60–80%` mostly casual crowd, `[STADIUM CITY] [YEAR]` perimeter boards, Youth squads, special Int'l Cup scoreboard!**).
   - **Unlock `PLAY` for U17 World Championship (`L8376`):** Remove the `&& youthIntHubState?.tier === 'Senior'` gate so **`tier === 'U17'`** (when user was called up!) renders **`▶ PLAY`** in `ConsoleModalShell`, resolving populated DB `u17Squad`s, existing Pro stadiums, and **`45m` halves**!
   - Write live playable goals, assists, clean sheets, ratings, and synthetic-turf injuries directly into match logs & season state.
4. **ALTER `src/utils/developmentSystem.ts`, `src/utils/staminaInjurySystem.ts`, `src/components/EarlyCareerDecisionModal.tsx`, `src/components/FreeAgentHubModal.tsx`, & `src/App.tsx`**:
   - Add `calculateStreetPointsFromMatchRating(age, matchRating, wasInjured)`:
     - **`wasInjured === true` -> `0` dev points**.
     - Otherwise scales earned Street Development Points proportionally by `matchRating` (`<=5.5` min, `7.5` strong, `>=9.0` max inside `STREET_BALANCE` age caps).
   - Wire `"PLAY ON THE STREETS"` in Unique Career (`handleSelectEarlyCareerChoice('play_streets')` + Free Agent hook) to launch playable 7v7 Street mode in `player.startingCity` with a **fresh 13-player city/D1/D2 pool every single play**:
     - If `userInjured === true`: engine locks the user's rating at the moment of injury and simulates the rest of the match; `App.tsx` applies that locked rating, awards **0 Street Development Points**, rolls a concrete `InjuryDetails` type weighted by `userInjuryRiskPct` via `staminaInjurySystem.ts` (`generateRandomInjury` / `processInjuryForPlayer`), and places the player into active **`injured` status for that injury's full recovery duration**.

### Phase 10 Acceptance Criteria
- **Kick Off:** All 3 modes launch cleanly (`PROFESSIONAL`, all 9 `YOUTH LEAGUES` + Int'l Youth Cup at age 16, `STREET` with tighter zoom, Streetwear bibs, 1 GK/side, fresh per-play 13-man city pool, ratings & scoreboard only with 0 dev points).
- **Unique Career:** `PLAY` works in Domestic Youth League (all 9 cities, 35m, league scoreboard), Int'l Youth Cup (35m group/KO + **45m Pro-stadium Final with 60–80% casual crowd & `[CITY] [YEAR]` boards**), **U17 World Championship** (45m Pro stadiums, DB U17 squads, user called up when outperforming incumbents), and **Play on the Streets** (30m 7v7, fresh 13-man city pool each time, rating-scaled points; tackle injury locks rating -> sims remainder -> `0` points -> enters real injured status for rolled injury duration).

---

## Final Cross-Mode Regression & Testing Checklist
Run after completing all 10 phases (`compile_applet` + `lint_applet` + interactive playthrough):
1. **League & Transfer Isolation (Phases 1–2):**
   - Start Youth Career in São Paulo and Buenos Aires -> verify zero English clubs appear through age 16.
   - Switch Youth academies -> verify fixtures & rivals switch cleanly.
   - Graduate/transfer South America ↔ Europe ↔ Arabia -> verify `careerLeagueDb`, `worldSimulationEngine` cache, domestic league/cup, and continental cup stay 100% region-pure.
2. **Stadium Editor & Youth Locks (Phases 3–5):**
   - Main Menu -> Editor Studio -> Stadium Editor -> switch `Professional Stadiums | Youth Stadiums | Street Fields`, edit & save custom stadiums.
   - Verify Youth rectangular lock, `brutalist` cap (ESP/ENG `industrial`, ENG `victorian`, Int'l Cup 2+ team sections `modern`+roof+`pristine`), max 2 tiers, small walls only, no stacked wall / VIP building / VIP tower, corner caps, `"No Lights"` blocking night/sunset, no roof/surroundings/entry cinematic, and `synthetic` (+10% injury risk).
3. **Turf & Rain `'Muddy'` Tuning (Phases 5 & 9):**
   - Verify `'sand'` plays slower/worse than `'poor'`.
   - Set Rain/Torrential on `'sand'` -> confirm `'muddy'` active with 5–10% slower running, +5–10% stamina spend, slower ground ball, faster airborne ball (stronger long shots, long passes & crosses), and slightly slower/less accurate short passes.
4. **Youth, Int'l Cup Final & U17 WC (Phases 6, 7, 9, 10):**
   - Verify all 9 city Youth Leagues have 23-player Youth squads (`11+7+5`), age 10→16 growth (Kickoff = 16), U17 DB squad population + merit-based call-up, playable Youth League (`35m`, unique scoreboard per all 9 leagues), playable Int'l Youth Cup (`35m` + Final on Pro stadium with `45m`, 60–80% casual crowd, `[CITY] [YEAR]` boards, special cup scoreboard), and playable U17 WC (`45m` on Pro stadiums).
5. **Street 7v7 & Pro Preservation (Phases 8, HOTFIX A9, 9, 10):**
   - Play Street Kickoff twice -> confirm different fresh positional pull from chosen city (`Youth + D1/D2 squad/reserves/u20/u17`), Top-15 Captain 3-card cinematic for human side(s) (Home then Away; CPU auto-draft silent), 7v7 `1-2-2-2` (1 GK/side, GK captain = no extra GK), **Light/Bright Home vs Dark Away varied Streetwear clothes** (jeans, shorts, t-shirts, caps), Career user skips captain draw & highest-OVR teammate gets captaincy, **tighter zoom framing bounce walls & alleys**, **wildly distinct non-stadium street visuals** (same player models, bounce cage/walls, urban props, street-fence onlookers, zero Pro stands/dugouts/tunnels/adboards), +10% speed, 30m halves, sideline wall rebounds, throw-in corners, double-tap `E` only fouls; Career tackle injury -> locks current rating, sims rest of match, awards 0 points, rolls injury type & applies real injured duration (`Kickoff = 0 points` always); unique Street scoreboard.
   - Launch Pro 11v11 Kickoff & Pro Career -> confirm zero regressions to 45m Pro rules, entry swoop, and stadiums.
