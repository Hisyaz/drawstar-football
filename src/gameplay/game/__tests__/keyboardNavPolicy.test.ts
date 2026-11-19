/**
 * Keyboard Navigation Default Policy & Gameplay Suspension Tests
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/keyboardNavPolicy.test.ts
 */

import assert from 'node:assert/strict';
import {
  detectNavEnvironment,
  isGameNavActiveNow,
  isGameNavEnabled,
  isNavSuspendedForGameplay,
  setGameNavEnabled,
  shouldEnableKeyboardNavByDefault,
  suspendGameNavForGameplay,
  toggleGameNav,
} from '../../../utils/gameNavigation';

function runTests() {
  // 1. Default policy across input hardware setups
  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: false,
      hasMouse: true,
      hasKeyboard: false,
      hasGamepad: false,
    }),
    false,
    'Desktop with mouse must default Keyboard Navigation to OFF'
  );

  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: false,
      hasMouse: true,
      hasKeyboard: true,
      hasGamepad: true,
    }),
    false,
    'System with mouse must default Keyboard Navigation to OFF even if keyboard & gamepad connected'
  );

  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: true,
      hasMouse: false,
      hasKeyboard: false,
      hasGamepad: false,
    }),
    false,
    'Phone / touch device with touchpad must default Keyboard Navigation to OFF'
  );

  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: true,
      hasMouse: false,
      hasKeyboard: false,
      hasGamepad: true,
    }),
    false,
    'Phone must default Keyboard Navigation to OFF even with controller attached'
  );

  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: false,
      hasMouse: false,
      hasKeyboard: true,
      hasGamepad: false,
    }),
    true,
    'Keyboard with NO mouse (and not a phone) must start ON'
  );

  assert.equal(
    shouldEnableKeyboardNavByDefault({
      isPhoneOrTouch: false,
      hasMouse: false,
      hasKeyboard: false,
      hasGamepad: true,
    }),
    true,
    'Joystick/gamepad with NO mouse or keyboard (and not a phone) must start ON'
  );

  // Check environment detector helper directly on mocked window/matchMedia payloads
  const phoneEnv = detectNavEnvironment({
    navigator: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 5,
    },
    matchMedia: ((q: string) => ({ matches: q === '(pointer: coarse)' })) as any,
  });
  assert.equal(phoneEnv.isPhoneOrTouch, true);
  assert.equal(shouldEnableKeyboardNavByDefault(phoneEnv), false);

  const mouseDesktopEnv = detectNavEnvironment({
    navigator: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 0 },
    matchMedia: ((q: string) => ({ matches: q.includes('fine') })) as any,
  });
  assert.equal(mouseDesktopEnv.hasMouse, true);
  assert.equal(shouldEnableKeyboardNavByDefault(mouseDesktopEnv), false);

  const keyboardOnlyEnv = detectNavEnvironment({
    navigator: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 0 },
    matchMedia: (() => ({ matches: false })) as any,
  });
  assert.equal(keyboardOnlyEnv.hasKeyboard, true);
  assert.equal(keyboardOnlyEnv.hasMouse, false);
  assert.equal(shouldEnableKeyboardNavByDefault(keyboardOnlyEnv), true);

  // 2. Toggle state + Gameplay suspension lock priority
  setGameNavEnabled(true);
  assert.equal(isGameNavEnabled(), true);
  assert.equal(isGameNavActiveNow(), true);

  suspendGameNavForGameplay(true, 'gameplay_shell');
  assert.equal(isNavSuspendedForGameplay(), true);
  assert.equal(isGameNavActiveNow(), false, 'Keyboard Navigation must be disabled during gameplay even if user toggled ON');
  assert.equal(isGameNavEnabled(), true, 'User preference must remain preserved for menus after gameplay ends');

  suspendGameNavForGameplay(true, 'penalty_qte');
  suspendGameNavForGameplay(false, 'gameplay_shell');
  assert.equal(isGameNavActiveNow(), false, 'Still suspended while second gameplay lock is active');

  suspendGameNavForGameplay(false, 'penalty_qte');
  assert.equal(isNavSuspendedForGameplay(), false);
  assert.equal(isGameNavActiveNow(), true, 'Restored cleanly once all gameplay locks exit');

  assert.equal(toggleGameNav(), false);
  assert.equal(isGameNavEnabled(), false);
  assert.equal(isGameNavActiveNow(), false);

  console.log('ALL KEYBOARD NAV POLICY & GAMEPLAY SUSPENSION CHECKS PASSED');
}

runTests();
