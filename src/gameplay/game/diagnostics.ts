/**
 * Bug / freeze diagnostics: collects recent errors, state-change breadcrumbs and a full engine snapshot so a
 * single tap on the bug button produces a text report that can be pasted to the developer.
 */
import { execLog } from './execution';
const BUILD_TAG = 'GameplayTest OCT20 diag-1';
const errors: { t: number; where: string; msg: string; stack: string }[] = [];
const crumbs: string[] = [];
const t0 = Date.now();
let lastFrameTs = Date.now();
let installed = false;
let errCounts: Record<string, number> = {};

const stamp = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
export function breadcrumb(msg: string) { crumbs.push(`[${stamp()}] ${msg}`); if (crumbs.length > 160) crumbs.shift(); }
export function recordError(where: string, err: any) {
  const msg = String(err && err.message ? err.message : err);
  const key = where + '|' + msg;
  errCounts[key] = (errCounts[key] || 0) + 1;
  if (errCounts[key] > 3) return; // do not flood: only the first 3 of each distinct error
  errors.push({ t: Date.now() - t0, where, msg, stack: String(err && err.stack ? err.stack : '').split('\n').slice(0, 7).join('\n') });
  if (errors.length > 25) errors.shift();
  breadcrumb(`ERROR in ${where}: ${msg}`);
}
export function diagTick() { lastFrameTs = Date.now(); }
export function msSinceFrame() { return Date.now() - lastFrameTs; }
export function installDiagnostics() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => recordError('window.error', e.error || e.message));
  window.addEventListener('unhandledrejection', (e: any) => recordError('unhandledrejection', e.reason));
  const ce = console.error.bind(console);
  console.error = (...args: any[]) => { try { recordError('console.error', args.map((a) => (a && a.message) || String(a)).join(' ')); } catch (_) {} ce(...args); };
  breadcrumb('diagnostics installed');
}

const r = (n: any) => (typeof n === 'number' && isFinite(n) ? Math.round(n * 100) / 100 : String(n));
export function collectDiagnostics(engine: any, ui: Record<string, any> = {}): string {
  const L: string[] = [];
  const add = (s: string) => L.push(s);
  try {
    add(`=== BUG REPORT (${BUILD_TAG}) ===`);
    add(`time: ${new Date().toISOString()}  uptime: ${stamp()}`);
    add(`ua: ${navigator.userAgent}`);
    add(`viewport: ${window.innerWidth}x${window.innerHeight} dpr=${window.devicePixelRatio} cores=${(navigator as any).hardwareConcurrency} mem=${(navigator as any).deviceMemory}`);
    add(`render loop: last frame ${msSinceFrame()} ms ago ${msSinceFrame() > 1500 ? '<<< RENDER LOOP IS NOT RUNNING' : '(alive)'}`);
    const e = engine;
    add('--- match ---');
    add(`clock=${r(e.matchTimeSeconds)}s (${r(e.matchTimeSeconds / 60)} min) half=${e.currentHalf} period=${e.currentPeriod} phase=${e.matchPhase} phaseTimer=${r(e.phaseTimer)} paused=${e.isPaused} frame=${e.frameCount}`);
    add(`direction: homeAttacksUp=${e.homeAttacksUp} (home attacks ${e.homeAttacksUp ? 'TOP' : 'BOTTOM'} goal)`);
    add(`score home ${e.score?.home} - ${e.score?.away} away  gameSpeed=${e.gameSpeed} powerBarSpeed=${e.powerBarSpeedPct}% difficulty=${e.difficulty} homeAttacksUp=${e.homeAttacksUp}`);
    add(`stall flag from UI: ${ui.stalled ? 'YES (clock stopped while not paused)' : 'no'}`);
    const sp = e.setPiece;
    add('--- set piece ---');
    add(sp ? `type=${sp.type} team=${sp.team} taker=${sp.takerId} (${((e.players || []).find((q: any) => q.id === sp.takerId) || {}).role || '?'}) spot=(${r(sp.spotX)},${r(sp.spotY)}) penalty=${sp.isPenalty} timer=${r(sp.timer)} ${Object.keys(sp).slice(0, 16).join(',')}` : 'none');
    add(`gkGoUpPrompt=${JSON.stringify(e.gkGoUpPrompt)} gkGoUpTeams=${JSON.stringify(e.gkGoUpTeams)}`);
    add('--- ball ---');
    const b = e.ball || {};
    add(`pos=(${r(b.x)},${r(b.y)},z=${r(b.z)}) vel=(${r(b.vx)},${r(b.vy)},${r(b.vz)}) owner=${b.ownerId} lastTouchTeam=${b.lastTouchTeam} lastKick=${b.lastKickAction} power=${r(b.lastKickPower)}`);
    add('--- camera ---');
    const c = e.camera || {};
    add(`x=${r(c.x)} y=${r(c.y)} zoom=${r(c.zoom)} tilt=${r(c.pitchTilt)} focus=${JSON.stringify(e.cameraFocus || null)}`);
    add('--- controls / flags ---');
    const cp = e.getControlledPlayer && e.getControlledPlayer();
    add(`controlled: ${cp ? `${cp.team} #${cp.number} ${cp.role} action=${cp.action} pos=(${r(cp.x)},${r(cp.y)}) v=(${r(cp.vx)},${r(cp.vy)})` : 'NONE'}`);
    add(`powerBar=${JSON.stringify(e.powerBar)} heldAction=${e.heldAction}`);
    add(`feintLock=${e.feintLock} qeBoth=${e.qeBoth} sDefHold=${e.sDefHold} pendingTackle=${e.pendingTackle} superCancelGrace=${e.superCancelGrace} priorityBannerTimer=${e.priorityBannerTimer}`);
    add(`banner="${e.bannerMessage}" bannerTimer=${e.bannerTimer}`);
    const bad: string[] = [];
    for (const p of e.players || []) if (![p.x, p.y, p.vx, p.vy].every(isFinite)) bad.push(`${p.team}#${p.number}:${p.action}`);
    add(`players=${(e.players || []).length} non-finite positions: ${bad.length ? bad.join(', ') : 'none'}`);
    const away = (e.players || []).filter((p: any) => p.role === 'GK').map((p: any) => `${p.team}GK action=${p.action} advanced=${p.gkAdvanced} owner=${b.ownerId === p.id}`);
    add(`keepers: ${away.join(' | ')}`);
    if (ui && Object.keys(ui).length) add(`ui: ${JSON.stringify(ui)}`);
  } catch (err: any) { add(`!! collecting engine state failed: ${err && err.message}`); }
  if (execLog.length) { add('--- last executions ---'); execLog.slice(-8).forEach((x: string) => add(x)); }
  add(`--- errors (${errors.length}) ---`);
  if (!errors.length) add('none recorded');
  errors.forEach((x) => { add(`[${(x.t / 1000).toFixed(1)}s] ${x.where}: ${x.msg}`); if (x.stack) add(x.stack); });
  add(`--- last ${Math.min(crumbs.length, 80)} events ---`);
  crumbs.slice(-80).forEach((x) => add(x));
  return L.join('\n');
}
