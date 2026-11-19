import type {
  AssistMode,
  AssistProfile,
  ActionAssistModes,
  ControlMode,
  ControllerCustomization,
  CustomKeyBindings,
  GamepadBindings,
  PlayerSlotConfig,
  TeamSide,
} from '../types';

export const DEFAULT_CONTROLLER_CUSTOMIZATION: ControllerCustomization = {
  stickSide: 'left',
  stickScale: 1,
  stickOffsetX: 0,
  stickOffsetY: 0,
  buttonsLayout: 'diamond',
  buttonsSpacing: 1,
  buttonsOffsetX: 0,
  buttonsOffsetY: 0,
  deckHeight: 145,
  deckScale: 1,
  deckOpacity: 1,
};

export const DEFAULT_KEY_BINDINGS: CustomKeyBindings = {
  longPass: 'KeyW',
  shoot: 'KeyA',
  shortPass: 'KeyS',
  cross: 'KeyD',
  sprint: 'ShiftLeft',
  gingaSwitch: 'Space',
  skillQ: 'KeyQ',
  skillE: 'KeyE',
  moveUp: 'ArrowUp',
  moveDown: 'ArrowDown',
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  cameraFocus: 'KeyC',
};

export const DEFAULT_GAMEPAD_BINDINGS: GamepadBindings = {
  shortPass: 0,
  cross: 1,
  shoot: 2,
  longPass: 3,
  gingaSwitch: 4,
  sprint: 5,
  skillQ: 6,
  skillE: 7,
  cameraFocus: 8,
  pause: 9,
};

export function loadControllerCustomization(): ControllerCustomization {
  try {
    const raw = localStorage.getItem('swos_controller_customization');
    if (raw) return { ...DEFAULT_CONTROLLER_CUSTOMIZATION, ...JSON.parse(raw) };
  } catch {
    // ignore storage errors
  }
  return DEFAULT_CONTROLLER_CUSTOMIZATION;
}

export function saveControllerCustomization(cfg: ControllerCustomization): void {
  try {
    localStorage.setItem('swos_controller_customization', JSON.stringify(cfg));
  } catch {
    // ignore storage errors
  }
}

export function loadKeyBindings(): CustomKeyBindings {
  try {
    const raw = localStorage.getItem('swos_custom_key_bindings');
    if (raw) return { ...DEFAULT_KEY_BINDINGS, ...JSON.parse(raw) };
  } catch {
    // ignore storage errors
  }
  return DEFAULT_KEY_BINDINGS;
}

export function saveKeyBindings(bindings: CustomKeyBindings): void {
  try {
    localStorage.setItem('swos_custom_key_bindings', JSON.stringify(bindings));
  } catch {
    // ignore storage errors
  }
}

export function loadGamepadBindings(): GamepadBindings {
  try {
    const raw = localStorage.getItem('swos_gamepad_bindings');
    if (raw) return { ...DEFAULT_GAMEPAD_BINDINGS, ...JSON.parse(raw) };
  } catch {
    // ignore storage errors
  }
  return DEFAULT_GAMEPAD_BINDINGS;
}

export function saveGamepadBindings(bindings: GamepadBindings): void {
  try {
    localStorage.setItem('swos_gamepad_bindings', JSON.stringify(bindings));
  } catch {
    // ignore storage errors
  }
}

export function loadControlMode(): ControlMode {
  try {
    const raw = localStorage.getItem('swos_control_mode');
    if (raw === 'full_team' || raw === 'one_player') return raw;
  } catch {
    // ignore storage errors
  }
  return 'full_team';
}

export function saveControlMode(mode: ControlMode): void {
  try {
    localStorage.setItem('swos_control_mode', mode);
  } catch {
    // ignore storage errors
  }
}

export interface StoredAssistModes {
  slots: Record<number, AssistProfile>;
  sides: Record<TeamSide, AssistProfile>;
  actions: Record<number, ActionAssistModes>;
  arrows: Record<number, boolean>;
}

const VALID_ASSIST_MODES: AssistMode[] = ['assisted', 'semi', 'manual'];
const VALID_ASSIST_PROFILES: AssistProfile[] = [...VALID_ASSIST_MODES, 'custom'];

function sanitizeAssistMode(v: unknown): AssistMode {
  return typeof v === 'string' && (VALID_ASSIST_MODES as string[]).includes(v) ? (v as AssistMode) : 'assisted';
}

function sanitizeAssistProfile(v: unknown): AssistProfile {
  return typeof v === 'string' && (VALID_ASSIST_PROFILES as string[]).includes(v) ? (v as AssistProfile) : 'assisted';
}

const DEFAULT_ACTION_ASSISTS: Required<ActionAssistModes> = {
  shortPass: 'assisted', longPass: 'assisted', cross: 'assisted', shoot: 'assisted', tackling: 'assisted', interception: 'assisted',
};

export function loadAssistModes(): StoredAssistModes {
  const defaults: StoredAssistModes = {
    slots: { 1: 'assisted', 2: 'assisted', 3: 'assisted', 4: 'assisted' },
    sides: { home: 'assisted', away: 'assisted' },
    actions: { 1: { ...DEFAULT_ACTION_ASSISTS }, 2: { ...DEFAULT_ACTION_ASSISTS }, 3: { ...DEFAULT_ACTION_ASSISTS }, 4: { ...DEFAULT_ACTION_ASSISTS } },
    arrows: { 1: false, 2: false, 3: false, 4: false },
  };
  try {
    const raw = localStorage.getItem('swos_assist_modes');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const slots: Record<number, AssistProfile> = { ...defaults.slots };
      if (parsed.slots && typeof parsed.slots === 'object') {
        for (const k of Object.keys(parsed.slots)) {
          const id = Number(k);
          if (!Number.isNaN(id)) slots[id] = sanitizeAssistProfile(parsed.slots[k]);
        }
      }
      const sides: Record<TeamSide, AssistProfile> = {
        home: sanitizeAssistProfile(parsed.sides?.home),
        away: sanitizeAssistProfile(parsed.sides?.away),
      };
      const actions = { ...defaults.actions };
      if (parsed.actions && typeof parsed.actions === 'object') {
        for (const k of Object.keys(parsed.actions)) {
          const id = Number(k);
          if (Number.isNaN(id) || !parsed.actions[k] || typeof parsed.actions[k] !== 'object') continue;
          const cfg: ActionAssistModes = { ...DEFAULT_ACTION_ASSISTS };
          for (const action of Object.keys(DEFAULT_ACTION_ASSISTS) as (keyof ActionAssistModes)[]) cfg[action] = sanitizeAssistMode(parsed.actions[k][action]);
          actions[id] = cfg;
        }
      }
      const arrows = { ...defaults.arrows };
      if (parsed.arrows && typeof parsed.arrows === 'object') {
        Object.assign(arrows, parsed.arrows);
      } else {
        // Migrate existing manual profiles: the visible aim arrow is on by default.
        for (const k of Object.keys(slots)) {
          const actionModes = parsed.actions?.[k];
          const hasManualAction = !!actionModes && Object.keys(actionModes).some(action => actionModes[action] === 'manual');
          arrows[Number(k)] = slots[Number(k)] === 'manual' || hasManualAction;
        }
      }
      return { slots, sides, actions, arrows };
    }
  } catch {
    // ignore storage errors
  }
  return defaults;
}

export function saveAssistModes(slots: PlayerSlotConfig[], sides?: Partial<Record<TeamSide, AssistProfile>>): void {
  try {
    const existing = loadAssistModes();
    const nextSlots: Record<number, AssistProfile> = { ...existing.slots };
    const nextActions = { ...existing.actions };
    const nextArrows = { ...existing.arrows };
    const nextSides: Record<TeamSide, AssistProfile> = {
      home: sides?.home ? sanitizeAssistProfile(sides.home) : existing.sides.home,
      away: sides?.away ? sanitizeAssistProfile(sides.away) : existing.sides.away,
    };
    for (const s of slots) {
      const mode = sanitizeAssistProfile(s.assistMode);
      nextSlots[s.id] = mode;
      nextActions[s.id] = { ...DEFAULT_ACTION_ASSISTS, ...(s.actionAssistModes || {}) };
      nextArrows[s.id] = s.manualAimArrow ?? (mode === 'manual');
      if (s.side === 'home' || s.side === 'away') {
        nextSides[s.side] = mode;
      }
    }
    localStorage.setItem('swos_assist_modes', JSON.stringify({ slots: nextSlots, sides: nextSides, actions: nextActions, arrows: nextArrows }));
  } catch {
    // ignore storage errors
  }
}

export function loadDebugExecutionOverlay(): boolean {
  try {
    if (typeof window !== 'undefined' && /[?&]debug=1/.test(window.location.search)) return true;
    return localStorage.getItem('swos_debug_overlay') === '1';
  } catch {
    return false;
  }
}

export function saveDebugExecutionOverlay(enabled: boolean): void {
  try {
    localStorage.setItem('swos_debug_overlay', enabled ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}

export function formatKeyDisplay(code: string): string {
  if (!code) return 'None';
  if (code.startsWith('Key')) return code.substring(3);
  if (code.startsWith('Digit')) return code.substring(5);
  if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Shift') return 'Shift';
  if (code === 'Space') return 'Spacebar';
  if (code === 'ArrowUp') return '↑ Up';
  if (code === 'ArrowDown') return '↓ Down';
  if (code === 'ArrowLeft') return '← Left';
  if (code === 'ArrowRight') return '→ Right';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
  if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
  return code;
}

export function formatGamepadButtonDisplay(btn: number): string {
  switch (btn) {
    case 0: return 'Button 0 (A / ✕)';
    case 1: return 'Button 1 (B / ○)';
    case 2: return 'Button 2 (X / □)';
    case 3: return 'Button 3 (Y / △)';
    case 4: return 'Button 4 (LB / L1)';
    case 5: return 'Button 5 (RB / R1)';
    case 6: return 'Button 6 (LT / L2)';
    case 7: return 'Button 7 (RT / R2)';
    case 8: return 'Button 8 (Back / Select)';
    case 9: return 'Button 9 (Start / Options)';
    case 10: return 'Button 10 (L-Stick Click)';
    case 11: return 'Button 11 (R-Stick Click)';
    case 12: return 'D-Pad Up';
    case 13: return 'D-Pad Down';
    case 14: return 'D-Pad Left';
    case 15: return 'D-Pad Right';
    default: return `Button ${btn}`;
  }
}
