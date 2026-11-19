import type { Ball, CameraFocusMode, MatchPhase, Player, SetPieceState } from '../types';
import { PITCH_CONFIG } from './constants';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  pitchTilt: number;
}

export class CameraManager {
  public state: CameraState = {
    x: PITCH_CONFIG.CENTER_X,
    y: PITCH_CONFIG.CENTER_Y,
    zoom: 1.05,
    pitchTilt: 0.5,
  };
  private shakeAmount = 0;
  private shakeDecay = 0.9;

  addShake(amount: number): void {
    this.shakeAmount = Math.min(18, this.shakeAmount + amount);
  }

  resetToCenter(zoom = 1.05): void {
    this.state.x = PITCH_CONFIG.CENTER_X;
    this.state.y = PITCH_CONFIG.CENTER_Y;
    this.state.zoom = zoom;
    this.state.pitchTilt = 0.5;
    this.shakeAmount = 0;
  }

  update(
    ball: Ball,
    players: Player[],
    userControlledPlayerId: string | null,
    matchPhase: MatchPhase,
    setPiece: SetPieceState | null,
    postSetPieceFollowTimer: number,
    lastSetPieceType: string,
    lastSetPieceAimAngle: number,
    cameraFocus: CameraFocusMode = 'pitch',
    timeScale = 1,
  ): CameraState {
    const isSetPiecePhase =
      !!setPiece &&
      (matchPhase === 'free_kick' ||
        matchPhase === 'penalty' ||
        matchPhase === 'corner_kick' ||
        matchPhase === 'goal_kick' ||
        matchPhase === 'throw_in');
    const isPostFollow = postSetPieceFollowTimer > 0;

    let targetX = ball.x;
    let targetY = ball.y;
    let targetZoom = 1.05;
    let targetTilt = 0.5;
    let lerpPos = 0.08 * timeScale;
    let lerpTilt = 0.08 * timeScale;
    let lerpZoom = 0.06 * timeScale;

    if (isSetPiecePhase || isPostFollow) {
      const spType = setPiece ? setPiece.type : lastSetPieceType;
      const aimAngle = setPiece ? setPiece.aimAngle : lastSetPieceAimAngle;
      const isPen = spType === 'penalty';
      const isCorner = spType === 'corner_kick';
      const isThrow = spType === 'throw_in';
      const isGoalKick = spType === 'goal_kick';
      const lookAhead = isPen ? 65 : isCorner ? 115 : isThrow ? 75 : isGoalKick ? 100 : 105;
      const spotX = setPiece ? setPiece.spotX : ball.x;
      const spotY = setPiece ? setPiece.spotY : ball.y;

      let focusX = spotX + Math.cos(aimAngle) * lookAhead;
      let focusY = spotY + Math.sin(aimAngle) * lookAhead;

      if (isPen) {
        focusX = PITCH_CONFIG.CENTER_X * 0.85 + spotX * 0.15;
        focusY = (spotY + PITCH_CONFIG.PITCH_TOP) * 0.52;
        targetTilt = 0.04;
        targetZoom = 1.54;
      } else if (isCorner) {
        const boxY = spotY < PITCH_CONFIG.CENTER_Y ? PITCH_CONFIG.PITCH_TOP + 120 : PITCH_CONFIG.PITCH_BOTTOM - 120;
        focusX = spotX * 0.35 + PITCH_CONFIG.CENTER_X * 0.65;
        focusY = spotY * 0.35 + boxY * 0.65;
        targetTilt = 0.12;
        targetZoom = 1.28;
      } else if (isThrow) {
        focusX = spotX + Math.cos(aimAngle) * 60;
        focusY = spotY + Math.sin(aimAngle) * 30;
        targetTilt = 0.18;
        targetZoom = 1.26;
      } else if (isGoalKick) {
        focusX = PITCH_CONFIG.CENTER_X;
        focusY = spotY + Math.sin(aimAngle) * 90;
        targetTilt = 0.16;
        targetZoom = 1.22;
      } else {
        const goalY = spotY > PITCH_CONFIG.CENTER_Y ? PITCH_CONFIG.PITCH_BOTTOM : PITCH_CONFIG.PITCH_TOP;
        if (Math.hypot(PITCH_CONFIG.CENTER_X - spotX, goalY - spotY) < 420) {
          focusX = spotX * 0.45 + PITCH_CONFIG.CENTER_X * 0.55;
          focusY = spotY * 0.45 + goalY * 0.55;
          targetTilt = 0.06;
          targetZoom = 1.42;
        } else {
          focusX = spotX + Math.cos(aimAngle) * 90;
          focusY = spotY + Math.sin(aimAngle) * 90;
          targetTilt = 0.12;
          targetZoom = 1.3;
        }
      }

      if (isPostFollow) {
        targetX = ball.x * 0.68 + focusX * 0.32;
        targetY = ball.y * 0.68 + focusY * 0.32;
        targetTilt = Math.min(0.35, targetTilt + (1 - postSetPieceFollowTimer / 55) * 0.2);
        targetZoom = Math.max(1.15, targetZoom - (1 - postSetPieceFollowTimer / 55) * 0.22);
        lerpPos = 0.14 * timeScale;
      } else {
        targetX = focusX;
        targetY = focusY;
        lerpPos = 0.1 * timeScale;
        lerpTilt = 0.09 * timeScale;
        lerpZoom = 0.08 * timeScale;
      }
    } else {
      const controlled = players.find((p) => p.id === userControlledPlayerId && !p.isRedCarded);
      const normY = Math.max(0, Math.min(1, (this.state.y - PITCH_CONFIG.PITCH_TOP) / PITCH_CONFIG.FIELD_HEIGHT));
      if (cameraFocus === 'player' && controlled) {
        targetX = controlled.x;
        targetY = controlled.y;
        targetZoom = 1.15;
        targetTilt = normY;
      } else if (cameraFocus === 'pitch' && controlled) {
        targetX = ball.x * 0.55 + controlled.x * 0.45;
        targetY = ball.y * 0.55 + controlled.y * 0.45;
        const spread = Math.hypot(ball.x - controlled.x, ball.y - controlled.y);
        targetZoom = Math.min(1.08, Math.max(0.42, 720 / (spread + 440))) - normY * 0.08;
        targetTilt = normY;
      } else {
        targetX = ball.x;
        targetY = ball.y;
        targetZoom = 1.18 - normY * 0.26;
        targetTilt = normY;
      }
    }

    this.state.x += (targetX - this.state.x) * lerpPos;
    this.state.y += (targetY - this.state.y) * lerpPos;
    this.state.pitchTilt += (targetTilt - this.state.pitchTilt) * lerpTilt;
    this.state.zoom += (targetZoom - this.state.zoom) * lerpZoom;

    if (this.shakeAmount > 0.05) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      this.state.x += sx;
      this.state.y += sy;
      this.shakeAmount *= Math.pow(this.shakeDecay, timeScale);
      if (this.shakeAmount <= 0.05) this.shakeAmount = 0;
    }

    return this.state;
  }
}
