/**
 * Single source of truth for "which end does this team attack".
 * The engine mirrors its `homeAttacksUp` flag in here every time it changes (1st half true, 2nd half false, ET1 true, ET2 false),
 * so code that has no engine reference can still ask the right question instead of assuming "home attacks up".
 */
import type { TeamSide } from '../types';
let homeUp = true;
export function setHomeAttacksUp(v: boolean): void { homeUp = v; }
export function getHomeAttacksUp(): boolean { return homeUp; }
/** true when the team attacks the TOP goal (so it defends the BOTTOM goal) */
export function teamAttacksUp(team: TeamSide): boolean { return team === 'home' ? homeUp : !homeUp; }
