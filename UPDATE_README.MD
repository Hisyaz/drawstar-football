# DrawStar Update Notes — Google AI Studio Handoff

**Package:** Current DrawStar project (`remake-nov-19`)  
**Handoff date:** 2026-11-19

This note summarizes the gameplay and manager/editor changes carried into this package. Use the source in this archive as the implementation to merge into the Google AI Studio project. Preserve the existing project structure, local data, and unrelated features while integrating the changes below.

## Updates in this handoff

### Gameplay C3–C5: passing, shooting, and control review

The gameplay implementation includes the requested Assisted, Semi, and Manual behavior, with an optional Custom setting that can choose a mode per action (short pass, long pass, cross, shot, tackle, and interception). The defensive actions are intentionally left open for a later design pass.

- Assisted short passes favor the nearest teammate in the aimed direction and correct power when the execution is within the valid range. Underpowered and overpowered executions can still produce poor outcomes.
- Semi keeps the intended direction assist while retaining the player’s chosen power.
- Manual retains direct direction and power, with digital keyboard aim rotation and a double-tap direction shortcut for immediate aiming.
- Assisted long passes target leading space for a teammate to run into; pass execution and intention still affect the result.
- A selected teammate is held as the target until the aim changes, to prevent jitter from players moving slightly.
- The aim indicator can be toggled independently of the selected assist level; changing player resets the current aim.
- Directional shot assistance aims within the goal according to the chosen direction, with reduced assistance when aiming too far away from goal.
- CPU behavior currently uses Assisted rules across difficulties. A distinct Legendary CPU mode remains deferred for later testing.

The available self-checks passed for execution-probability anchors and the Assisted/Semi/Manual passing rules, including nearest-target selection, long-pass lead space, power preservation, and under/overpowered thresholds. These checks did not constitute a complete in-match visual or controls QA pass; see **Validation status** below.

### Manager editor and team data

- Manager Studio is connected to team data and supports selecting a team and its manager.
- Managers have unique IDs, and team association uses the manager ID rather than the manager’s name.
- Teams receive manager profiles; managers without a team can be browsed in **Free Manager**. Players without a team can be browsed in **Free Player**.
- Manager settings include preferred tactical playstyle/preset and formation, using the project’s existing team/tactics options.
- Manager customization follows the player creator’s appearance approach while using distinct manager clothing. It supports appearance details including tattoos, headwear, and glasses. Managers use portrait/body/in-game presentation rather than player card views.
- Team and manager data are synchronized so manager appearance, attire, colors, and identity are carried into gameplay. The pre-match team headers display manager names.

### Live manager rendering and animation (C12/C13)

Manager profiles are passed from the match teams through the pitch renderer into the stadium technical areas. The dugout manager sprite uses the manager’s appearance and clothing colors when available, with sensible fallback appearance/clothing for teams without a customized profile. The manager has a four-beat idle cycle with pacing, arm movement, and a tactical pointing gesture.

### Sprite cache instrumentation (C9)

Player sprites now use a bounded cache with a 1,200-entry limit and FIFO eviction. Runtime diagnostics expose entry count, capacity, hit/miss/eviction counts, an estimated canvas-memory footprint, cache hit rate, and cumulative sprite-generation time. The cache persists for the module lifetime unless explicitly cleared, and the explicit clear operation also resets its counters.

## Validation status and follow-up

- **Production build:** `npm run build` completed successfully after the source updates. Vite reported existing mixed static/dynamic import and large-chunk warnings.
- **Gameplay self-checks:** Execution-model and passing/assist checks passed. Appearance serialization checks also passed in the same run.
- **Typecheck:** `npm run lint` (`tsc --noEmit`) did not return a result; it stalled without diagnostics and was stopped. Treat the full-project typecheck as unverified.
- **C9 performance:** Diagnostics are in place, but no representative full-match cache/performance benchmark has been recorded yet.
- **C12/C13 visual QA:** Manager appearance and animation are wired into the live render path, but a full visual in-game, bench, cinematic, and device-size QA pass remains to be done. The pre-match header currently displays manager identity by name.
- **Tactics:** Team tactics/formation integration is present in the editor data path; verify kickoff roster loading and the tactical-menu keeper validation in a live match before treating that separate issue as closed.

## Files most relevant to these changes

- `src/components/editor/ManagerStudio.tsx`
- `src/components/CardControls.tsx`
- `src/gameplay/game/teamDatabase.ts`
- `src/gameplay/types/team.ts`
- `src/types/leagueEditor.ts`
- `src/utils/gameplayAdapter.ts`
- `src/gameplay/game/sprites.ts`
- `src/gameplay/game/pitchRenderer.ts`
- `src/gameplay/game/stadiumRenderer.ts`
- `src/gameplay/components/PitchCanvas.tsx`
- `src/gameplay/components/PreMatchPresentationModal.tsx`
- `src/gameplay/game/devSim.ts`

## Project setup

The ZIP omits `node_modules/` and generated `dist/` files. From the project directory, install dependencies with `npm install`, then run `npm run dev` or `npm run build`. No dependency lockfile was regenerated during this work.
