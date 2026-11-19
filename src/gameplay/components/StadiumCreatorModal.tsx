/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Building2,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan,
  Video,
  Eye,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Save,
  Play,
  X,
  Layers,
  Palette,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Shield,
  Trophy,
  Sliders,
  Maximize2,
  Compass,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Move,
  Plane,
  Anchor,
  Trees,
  Train,
  Car,
  Armchair,
  DoorOpen,
  Users,
} from 'lucide-react';
import {
  StadiumDefinition,
  StadiumShape,
  StandGrade,
  SurroundingsType,
  ApronMaterial,
  ApronSetback,
  BenchType,
  BenchQualityTier,
  TunnelType,
  TunnelSiting,
  FifaQualification,
  StandPosition,
  StandConfig,
  TierSize,
  WallTierSize,
  SeatPattern,
  SeatStyle,
  NoStandBackdrop,
  WallSize,
  WallMaterial,
  PerimeterFinishType,
  calculateStadiumTotalCapacity,
  calculateStandCapacity,
  calculateFifaQualification,
  getBackdropsForSurroundings,
  getTierChairRows,
  getWallTierChairRows,
  StandDensity,
  STAND_DENSITY_OPTIONS,
  StadiumGroundsType,
  GroundsOption,
  getGroundsForSurroundings,
  getDefaultGroundsForSurroundings,
  TierBalustradeStyle,
  StandDeckMaterial,
  RearWallMaterial,
  PitchsideBarrierType,
  PitchsideBarrierOption,
  PITCHSIDE_BARRIER_OPTIONS,
  resolvePitchsideBarrier,
  RoofCutawayMode,
  RoofStyle,
  RoofMaterial,
  RoofBorder,
  RoofConfig,
  ROOF_CUTAWAY_OPTIONS,
  ROOF_STYLE_OPTIONS,
  ROOF_MATERIAL_OPTIONS,
  ROOF_BORDER_OPTIONS,
  ROUND_OVAL_ROOF_STYLE_OPTIONS,
  ROUND_OVAL_ROOF_MATERIAL_OPTIONS,
  ROUND_OVAL_ROOF_BORDER_OPTIONS,
  isRoundOrOvalShape,
  getRoofStylesForShape,
  getRoofMaterialsForShape,
  getRoofBordersForShape,
  getDefaultRoofConfig,
  getContextualPerimeters,
  getDefaultPerimeterForContext,
  PerimeterOption,
  SeatArchetype,
  SEAT_ARCHETYPE_OPTIONS,
  ZOOM_SNAP_PRESETS,
  ZoomPreset,
  GrandstandMaterial,
  CANONICAL_B3_MATERIALS,
  resolveGrandstandMaterial,
  CardinalDirection,
  CARDINAL_GROUND_ROLES,
  B4_GROUND_FLAVORS,
  getCardinalGroundRole,
  getGroundFlavorDetail,
  B5_HORIZON_FEATURES,
  resolveMarineGroundArchetype,
  ArchitecturalGrade,
  PaletteColor,
  PALETTE_COLORS,
  ARCHITECTURAL_GRADE_OPTIONS,
  GradeElementColors,
  resolveStandArchitecturalGrade,
  resolveStandSeatArchetype,
  getSeatLevelRank,
  getStandSeatLevel,
  hasMunicipalPenalty,
  getStadiumCertificationRating,
  resolveGradeElementColor,
  getVipBuildingFloors,
  VipFloorCount,
  LowerStandSize,
  LowerStandMaterial,
  LowerStandBarrier,
  LowerStandSeat,
  LOWER_STAND_SIZE_OPTIONS,
  LOWER_STAND_MATERIAL_OPTIONS,
  LOWER_STAND_BARRIER_OPTIONS,
  LOWER_STAND_SEAT_OPTIONS,
  getVipLowerStandRows,
  getVipLowerStandCapacity,
  isStackedWallStand,
  getStackedWallRows,
  getStackedWallLowerRows,
  getStackedWallUpperRows,
  calculateStackedWallCapacity,
  STACKED_WALL_SIZE_OPTIONS,
  isGradeVipEligible,
  isStandVipEligible,
  hasStandVipSeats,
  getEffectiveVipTierIndex,
  hasStandVipZone,
  hasStandTransmissionArea,
  hasVipSeatsInStadium,
  hasTransmissionAreaInStadium,
  hasVipZoneInStadium,
  isFifaWorldCertified,
  VipSeatType,
  VIP_SEAT_OPTIONS,
  getStandVipCapacity,
  getStadiumTotalVipCapacity,
  CornerStandType,
  CORNER_STAND_OPTIONS,
  resolveCornerArchitectureType,
  isCornerRound,
  isCornerGiant,
  isCornerTower,
  isCornerNoStand,
  VomitoryArchitecture,
  VomitoryOption,
  VOMITORY_ARCHITECTURE_OPTIONS,
  resolveVomitoryArchitecture,
  getTierStairRatios,
  CornerFloodlightPlacement,
  CORNER_FLOODLIGHT_PLACEMENT_OPTIONS,
  resolveCornerFloodlightPlacement,
  StadiumCategory,
  StreetArenaConfig,
  StreetArenaArchetype,
  StreetSurfaceType,
  StreetPerimeterWallStyle,
  StreetCourtMarkings,
  StreetGoalStyle,
  StreetLightingType,
  StreetFenceCrowdMode,
  StreetUrbanProp,
} from '../types/stadium';
import {
  StadiumCameraPerspective,
  StandInspectionPosition,
  getStadiumCameraTarget,
  lerpCamera,
  CameraTarget,
} from '../game/stadiumCamera';
import {
  drawPerimeterHorizon,
  drawStadiumArchitecture,
  drawArchitecturalRoofShadows,
  drawTimeOfDayAtmosphere,
} from '../game/stadiumRenderer';
import { drawAerialSkyCam } from '../game/skyCamRenderer';
import {
  createDefaultStadium,
  saveCustomStadium,
  getStadiumById,
  getRegisteredStadiumsByCategory,
  STADIUM_REGISTRY,
} from '../game/stadiumRegistry';
import {
  DEFAULT_STREET_ARENA_CONFIG,
  getAllowedShapesForCategory,
  getAllowedGradesForCategory,
  getAllowedWallSizesForCategory,
  getAllowedTunnelsForCategory,
  getAllowedDugoutsForCategory,
  getAllowedTurfQualitiesForCategory,
  getAllowedTimesOfDay,
  getMaxTiersForCategory,
  sanitizeStadiumForCategory,
} from '../game/stadiumConstraints';
import { STARTING_CITIES } from '../../constants';
import { audio } from '../game/audio';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../game/constants';
import { LawnMowingPattern, TurfQuality, TimeOfDay, PitchDimensionPreset } from '../types';
import { resolvePitchMetrics } from '../game/pitchDimensions';

export const CLOCKWISE_STANDS: {
  id: StandPosition;
  shortLabel: string;
  badge: string;
  name: string;
  desc: string;
}[] = [
  { id: 'corner_ne', shortLabel: 'C1 (NE)', badge: 'NE', name: 'Corner 1 (NE)', desc: 'Top-Right Corner Stand uniting East and North stands' },
  { id: 'east', shortLabel: 'EAST', badge: 'E', name: 'East Stand', desc: 'Right Touchline Main/Visitor Stand' },
  { id: 'corner_se', shortLabel: 'C2 (SE)', badge: 'SE', name: 'Corner 2 (SE)', desc: 'Bottom-Right Corner Stand uniting East and South stands' },
  { id: 'south', shortLabel: 'SOUTH', badge: 'S', name: 'South Stand', desc: 'Bottom Goal Stand (behind South goal)' },
  { id: 'corner_sw', shortLabel: 'C3 (SW)', badge: 'SW', name: 'Corner 3 (SW)', desc: 'Bottom-Left Corner Stand uniting West and South stands' },
  { id: 'west', shortLabel: 'WEST', badge: 'W', name: 'West Stand', desc: 'Left Touchline Main Stand (dugout benches and tunnel walkout)' },
  { id: 'corner_nw', shortLabel: 'C4 (NW)', badge: 'NW', name: 'Corner 4 (NW)', desc: 'Top-Left Corner Stand uniting West and North stands' },
  { id: 'north', shortLabel: 'NORTH', badge: 'N', name: 'North Stand', desc: 'Top Goal Stand (behind North goal)' },
];

export const CARDINAL_STANDS: {
  id: StandPosition;
  shortLabel: string;
  badge: string;
  name: string;
  desc: string;
}[] = [
  { id: 'west', shortLabel: 'WEST', badge: 'W', name: 'West Stand', desc: 'West Coliseum Sector (touchline benches and main tunnel)' },
  { id: 'north', shortLabel: 'NORTH', badge: 'N', name: 'North Stand', desc: 'North Coliseum Sector (curved goal end terrace)' },
  { id: 'east', shortLabel: 'EAST', badge: 'E', name: 'East Stand', desc: 'East Coliseum Sector (opposite touchline stand)' },
  { id: 'south', shortLabel: 'SOUTH', badge: 'S', name: 'South Stand', desc: 'South Coliseum Sector (curved goal end terrace)' },
];

interface StadiumCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStadium?: (stadium: StadiumDefinition) => void;
  onTestMatchday?: (stadium: StadiumDefinition) => void;
  initialStadium?: StadiumDefinition;
}

export const StadiumCreatorModal: React.FC<StadiumCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaveStadium,
  onTestMatchday,
  initialStadium,
}) => {
  // Active wizard step: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  // Dedicated 3-tab Street Playground Composer active tab
  const [streetTab, setStreetTab] = useState<'court_surface' | 'walls_goals' | 'neighborhood_lighting'>('court_surface');
  // Mobile 2-pane console switcher (Wizard Controls vs Live 3D View)
  const [mobilePane, setMobilePane] = useState<'wizard' | 'preview'>('wizard');

  // Stadium definition state being edited
  const [stadium, setStadium] = useState<StadiumDefinition>(() => {
    return initialStadium ? JSON.parse(JSON.stringify(initialStadium)) : createDefaultStadium();
  });

  // Phase D1.4 + Phase 4: Pre-Creator Gateway Modal (3 Categories + Edit Existing / Create New)
  const [showGateway, setShowGateway] = useState<boolean>(true);
  const [gatewayCategory, setGatewayCategory] = useState<StadiumCategory>(
    initialStadium?.category || 'pro'
  );
  const [selectedRegisteredStadiumId, setSelectedRegisteredStadiumId] = useState<string>(
    initialStadium?.id || 'estadio_monumental'
  );

  // Stand-by-stand inspector sub-navigation
  const [activeStandPos, setActiveStandPos] = useState<StandInspectionPosition>('west');

  // Step 1 Sub-focus (Shape vs Surroundings vs Grounds)
  const [step1SubFocus, setStep1SubFocus] = useState<'shape' | 'surroundings' | 'grounds'>('shape');

  // Step 3 Sub-tab (Dugouts vs Tunnel vs Lighting & Floodlights)
  const [step3SubTab, setStep3SubTab] = useState<'dugouts' | 'tunnel' | 'lighting'>('dugouts');

  // Step 4 Satisfaction Lock
  const [isArchitectureLocked, setIsArchitectureLocked] = useState(false);

  // Top-Right Camera Director State (Phase 14.1)
  const [cameraPerspective, setCameraPerspective] = useState<StadiumCameraPerspective>('relevant');
  const [isCameraPopoverOpen, setIsCameraPopoverOpen] = useState(false);

  // Free Camera manual target reference
  const freeCamTargetRef = useRef<CameraTarget>({
    x: PITCH_CONFIG.CENTER_X,
    y: PITCH_CONFIG.CENTER_Y,
    zoom: 0.38,
    pitchTilt: 0.5,
    label: 'FREE CAMERA',
    description: 'Freely moveable manual camera. Drag to pan, scroll/pinch/stick to zoom.',
  });

  // Aerial Free Camera manual target reference (High-Altitude Vista Navigation)
  const aerialFreeCamTargetRef = useRef<CameraTarget>({
    x: PITCH_CONFIG.CENTER_X,
    y: PITCH_CONFIG.CENTER_Y - 140,
    zoom: 0.26,
    pitchTilt: 0.35,
    label: 'AERIAL FREE CAM',
    description: 'Freely moveable aerial camera. Drag to pan, scroll/pinch/stick to zoom in sky view.',
  });

  // Synchronous ref to prevent stale closures during rapid drag/scroll gestures
  const cameraPerspectiveRef = useRef<StadiumCameraPerspective>(cameraPerspective);
  cameraPerspectiveRef.current = cameraPerspective;

  // Touch & Drag interaction tracker
  const touchStateRef = useRef<{
    lastDistance: number | null;
    lastX: number;
    lastY: number;
    isDragging: boolean;
  }>({
    lastDistance: null,
    lastX: 0,
    lastY: 0,
    isDragging: false,
  });

  // Helper to switch to free camera seamlessly from current animated position
  // When in Aerial Sky-Cam, transitions to aerial_free so the user stays in aerial view
  const switchToFreeCam = useCallback(() => {
    setCameraPerspective((prev) => {
      if (prev === 'aerial_sky' || prev === 'aerial_free') {
        if (prev !== 'aerial_free') {
          aerialFreeCamTargetRef.current = {
            x: cameraStateRef.current.x,
            y: cameraStateRef.current.y,
            zoom: cameraStateRef.current.zoom,
            pitchTilt: cameraStateRef.current.pitchTilt ?? 0.35,
            label: 'AERIAL FREE CAM',
            description: 'Freely moveable aerial camera. Drag to pan, scroll/pinch/stick to zoom.',
          };
          return 'aerial_free';
        }
        return prev;
      }
      if (prev !== 'free') {
        freeCamTargetRef.current = {
          x: cameraStateRef.current.x,
          y: cameraStateRef.current.y,
          zoom: cameraStateRef.current.zoom,
          pitchTilt: cameraStateRef.current.pitchTilt ?? 0.5,
          label: 'FREE CAMERA',
          description: 'Freely moveable manual camera. Drag to pan, scroll/pinch/stick to zoom.',
        };
        return 'free';
      }
      return prev;
    });
  }, []);

  // Interactive Canvas Camera tracking state
  const cameraStateRef = useRef<{ x: number; y: number; zoom: number; pitchTilt: number }>({
    x: PITCH_CONFIG.CENTER_X,
    y: PITCH_CONFIG.CENTER_Y,
    zoom: 0.38,
    pitchTilt: 0.5,
  });

  // User manual pan/drag offset
  const manualPanRef = useRef<{ x: number; y: number; isDragging: boolean; lastX: number; lastY: number }>({
    x: 0,
    y: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Canvas element ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dedicated Vertical Interactive Zoom Bar Engine (Phase B1.3)
  const zoomTrackRef = useRef<HTMLDivElement | null>(null);
  const zoomThumbRef = useRef<HTMLDivElement | null>(null);
  const zoomReadoutRef = useRef<HTMLDivElement | null>(null);

  const applyZoomValue = useCallback((targetZoom: number) => {
    audio.playKick(0.15);
    switchToFreeCam();
    const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
    const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
    const clamped = Math.max(0.05, Math.min(2.50, targetZoom));
    targetRef.current.zoom = clamped;
  }, [switchToFreeCam]);

  const handleZoomTrackPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const track = zoomTrackRef.current;
    if (!track) return;

    const updateFromPointer = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      if (rect.height <= 0) return;
      // 0 at bottom, 1 at top
      const t = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
      const minZ = 0.05;
      const maxZ = 2.50;
      const targetZ = minZ * Math.pow(maxZ / minZ, t);
      applyZoomValue(targetZ);
    };

    updateFromPointer(e.clientY);

    const onPointerMove = (ev: PointerEvent) => {
      updateFromPointer(ev.clientY);
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [applyZoomValue]);

  // Re-sync stadium when opened with a new initialStadium
  useEffect(() => {
    if (isOpen) {
      if (initialStadium) {
        const cloned: StadiumDefinition = JSON.parse(JSON.stringify(initialStadium));
        setStadium(cloned);
        setGatewayCategory(cloned.category || 'pro');
        setSelectedRegisteredStadiumId(cloned.id);
      } else {
        setStadium(createDefaultStadium());
        setGatewayCategory('pro');
        setSelectedRegisteredStadiumId('estadio_monumental');
      }
      setCurrentStep(1);
      setStreetTab('court_surface');
      setIsArchitectureLocked(false);
      setCameraPerspective('relevant');
      setShowGateway(true);
    }
  }, [isOpen, initialStadium]);

  const stadiumCategory: StadiumCategory = stadium.category || 'pro';
  const isYouthVenue = stadiumCategory === 'youth';
  const isStreetVenue = stadiumCategory === 'street';
  const allowedTimesForActiveStadium = getAllowedTimesOfDay(stadium);

  // Dynamically recompute capacity & FIFA category on any architectural change
  const totalCapacity = calculateStadiumTotalCapacity(stadium.stands, stadium.shape);
  const activeEffectivePos = (activeStandPos === 'corners' ? 'corner_nw' : activeStandPos) as StandPosition;
  const currentFifa = calculateFifaQualification(
    totalCapacity,
    stadium.stands[activeEffectivePos]?.grade || 'grade1_municipal',
    stadium.lighting?.powerKw,
    stadium.turfQuality || 'normal'
  );
  const certRating = getStadiumCertificationRating(stadium);
  const penaltyActive = hasMunicipalPenalty(stadium.stands);

  // Round and oval coliseum bowls are seamless 360° monolithic structures without corner stands
  const isRoundOval = isRoundOrOvalShape(stadium.shape);
  const displayedStands = isRoundOval ? CARDINAL_STANDS : CLOCKWISE_STANDS;

  // Auto-reset active stand selection to 'west' if in round/oval shape and corner stand is selected
  useEffect(() => {
    if (isRoundOrOvalShape(stadium.shape) && activeStandPos.startsWith('corner_')) {
      setActiveStandPos('west');
    }
  }, [stadium.shape, activeStandPos]);

  // Real-time Canvas Rendering Loop (WYSIWYG Procedural Canvas 2D)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      // 1. Resolve Target Camera View (with dynamic viewport fitting for stadium_view and full_pitch)
      const target = getStadiumCameraTarget(cameraPerspective, {
        activeStep: currentStep,
        activeStand: activeStandPos,
        stadiumDef: stadium,
        focusSubTarget:
          currentStep === 3
            ? (step3SubTab === 'lighting' ? 'floodlights' : step3SubTab)
            : currentStep === 1
            ? (step1SubFocus === 'grounds' ? 'grounds' : step1SubFocus === 'surroundings' ? 'surroundings' : undefined)
            : undefined,
        viewportWidth: width,
        viewportHeight: height,
        freeCameraTarget: freeCamTargetRef.current,
        aerialCameraTarget: aerialFreeCamTargetRef.current,
      });

      // Gamepad Controller Polling (Left stick/D-pad pan, Right stick/triggers zoom)
      if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
        if (gp) {
          const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
          const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
          const lx = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : (gp.buttons[14]?.pressed ? -1 : gp.buttons[15]?.pressed ? 1 : 0);
          const ly = Math.abs(gp.axes[1]) > 0.15 ? gp.axes[1] : (gp.buttons[12]?.pressed ? -1 : gp.buttons[13]?.pressed ? 1 : 0);
          const rx = Math.abs(gp.axes[2]) > 0.15 ? gp.axes[2] : 0;
          const ry = Math.abs(gp.axes[3]) > 0.15 ? gp.axes[3] : 0;
          const l2 = gp.buttons[6]?.value || (gp.buttons[6]?.pressed ? 1 : 0);
          const r2 = gp.buttons[7]?.value || (gp.buttons[7]?.pressed ? 1 : 0);

          const panSpeed = 22 / Math.max(0.05, cameraStateRef.current.zoom);
          if (Math.abs(lx) > 0.15 || Math.abs(ly) > 0.15 || Math.abs(rx) > 0.15) {
            switchToFreeCam();
            targetRef.current.x += (lx + rx * 0.4) * panSpeed;
            targetRef.current.y += ly * panSpeed;
          }
          const zoomDelta = -ry * 0.035 + (r2 - l2) * 0.035;
          if (Math.abs(zoomDelta) > 0.005) {
            switchToFreeCam();
            const minZ = 0.05;
            const maxZ = 2.50;
            targetRef.current.zoom = Math.max(minZ, Math.min(maxZ, targetRef.current.zoom * (1 + zoomDelta)));
          }
        }
      }

      // Smooth camera interpolation towards target
      const isFreeMoving = cameraPerspective === 'free' || cameraPerspective === 'aerial_free';
      const lerped = lerpCamera(cameraStateRef.current, target, isFreeMoving ? 0.35 : 0.08);
      cameraStateRef.current = lerped;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      // Fill background sky/void
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, width, height);

      // Apply Camera View Transform
      const isAerial = cameraPerspective === 'aerial_sky' || cameraPerspective === 'aerial_free';
      const minZoom = 0.05; // Phase B1.3: Continuous extreme zoom-out down to 5% scale
      const maxZoom = 2.50;
      const effectiveZoom = Math.max(minZoom, Math.min(maxZoom, lerped.zoom));
      const effectiveTilt = lerped.pitchTilt ?? (isAerial ? 0.35 : 0.5);
      const scaleY = effectiveZoom * (isAerial ? (0.90 + effectiveTilt * 0.10) : (0.94 + effectiveTilt * 0.10));

      const screenCenterX = width / 2;
      const screenCenterY = height / 2;

      // Phase B1.3: Update dedicated vertical zoom bar thumb position & live readout at 60fps
      if (zoomThumbRef.current) {
        const t = Math.max(0, Math.min(1, (Math.log(effectiveZoom) - Math.log(0.05)) / (Math.log(2.50) - Math.log(0.05))));
        zoomThumbRef.current.style.bottom = `${t * 100}%`;
      }
      if (zoomReadoutRef.current) {
        zoomReadoutRef.current.textContent = `${Math.round(effectiveZoom * 100)}%`;
      }

      ctx.translate(screenCenterX, screenCenterY);
      ctx.scale(effectiveZoom, scaleY);
      ctx.translate(-lerped.x, -lerped.y);

      const timeOfDay = stadium.lighting?.timeOfDay || 'night';

      if (isAerial) {
        // Phase 15.2: High-Altitude 32-Bit Aerial Sky-Cam Renderer
        drawAerialSkyCam(ctx, stadium as StadiumDefinition, {
          roofOpacity: 1.0,
          showBroadcastHUD: false,
          timeOfDay,
          cameraX: lerped.x,
          cameraY: lerped.y,
        });
      } else {
        // 2. Draw Procedural Skybox & Living North Horizon
        drawPerimeterHorizon(
          ctx,
          lerped.x,
          lerped.y,
          stadium.capacity > 50000 ? 'monumental' : stadium.capacity > 20000 ? 'craven' : 'ascenso',
          timeOfDay,
          undefined,
          stadium.surroundings,
          stadium.grounds,
          stadium
        );

        // 3. Draw Procedural Stadium Architecture (360 Surroundings, Apron, Running Track, Stands, Benches, Tunnels, Floodlights)
        drawStadiumArchitecture(
          ctx,
          lerped.x,
          lerped.y,
          stadium.capacity > 50000 ? 'monumental' : stadium.capacity > 20000 ? 'craven' : 'ascenso',
          timeOfDay,
          HOME_KIT,
          AWAY_KIT,
          undefined,
          stadium
        );

        // 4. Draw Infill Area & Pitch Turf & Markings (Strict Containment Engine)
        const metrics = resolvePitchMetrics(
          {
            matchMode: stadiumCategory,
            preset: stadium.pitchPreset || 'standard',
            lengthMeters: stadium.pitchLengthMeters,
            widthMeters: stadium.pitchWidthMeters,
          },
          stadiumCategory
        );

        // A. Draw the fixed Infill Area Substrate
        const apronMat = stadium.apronMaterial || 'grass';
        ctx.save();
        if (isStreetVenue) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        } else if (apronMat === 'concrete') {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          for (let x = metrics.infillLeft; x <= metrics.infillRight; x += 90) {
            ctx.beginPath();
            ctx.moveTo(x, metrics.infillTop);
            ctx.lineTo(x, metrics.infillBottom);
            ctx.stroke();
          }
          for (let y = metrics.infillTop; y <= metrics.infillBottom; y += 90) {
            ctx.beginPath();
            ctx.moveTo(metrics.infillLeft, y);
            ctx.lineTo(metrics.infillRight, y);
            ctx.stroke();
          }
        } else if (apronMat === 'rubber_tartan') {
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        } else if (apronMat === 'artificial_turf') {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        } else if (apronMat === 'gravel_ballast') {
          ctx.fillStyle = '#57534e';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        } else if (apronMat === 'asphalt_paved') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        } else {
          // natural turf infill
          ctx.fillStyle = '#166534';
          ctx.fillRect(metrics.infillLeft, metrics.infillTop, metrics.infillWidth, metrics.infillHeight);
        }
        ctx.restore();

        // B. Draw Pitch Turf strictly centered inside and ABOVE the infill zone
        const pLeft = metrics.pitchLeft;
        const pTop = metrics.pitchTop;
        const fWidth = metrics.fieldWidth;
        const fHeight = metrics.fieldHeight;

        const pitchColor =
          stadium.turfQuality === 'concrete'
            ? '#475569'
            : stadium.turfQuality === 'sand'
            ? '#d9b36c'
            : stadium.turfQuality === 'synthetic'
            ? '#16a34a'
            : stadium.turfQuality === 'pristine'
            ? '#1eb842'
            : stadium.turfQuality === 'poor'
            ? isStreetVenue
              ? '#8c6239'
              : '#5f6f25'
            : '#338317';

        ctx.fillStyle = pitchColor;
        ctx.fillRect(pLeft, pTop, fWidth, fHeight);

        if (!isStreetVenue) {
          // Mowing stripes for turf stadiums
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          const stripeH = 90;
          for (let y = pTop; y < pTop + fHeight; y += stripeH * 2) {
            const h = Math.min(stripeH, pTop + fHeight - y);
            ctx.fillRect(pLeft, y, fWidth, h);
          }
        } else {
          // Street perimeter wall border preview
          const wallStyle = stadium.streetConfig?.perimeterWallStyle || 'chainlink_cage';
          ctx.strokeStyle =
            wallStyle === 'graffiti_brick'
              ? '#b45309'
              : wallStyle === 'corrugated_iron'
              ? '#64748b'
              : wallStyle === 'timber_seawall'
              ? '#92400e'
              : '#94a3b8';
          ctx.lineWidth = 10;
          ctx.strokeRect(pLeft - 14, pTop - 14, fWidth + 28, fHeight + 28);
        }

        // Pitch regulation / street markings
        ctx.strokeStyle =
          isStreetVenue && stadium.streetConfig?.courtMarkings === 'chalk_dust'
            ? 'rgba(241, 245, 249, 0.7)'
            : '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(pLeft, pTop, fWidth, fHeight);

        // Halfway line & center circle
        ctx.beginPath();
        ctx.moveTo(pLeft, metrics.centerY);
        ctx.lineTo(pLeft + fWidth, metrics.centerY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(metrics.centerX, metrics.centerY, metrics.centerCircleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Penalty boxes
        ctx.strokeRect(
          metrics.centerX - metrics.penaltyBoxWidth / 2,
          pTop,
          metrics.penaltyBoxWidth,
          metrics.penaltyBoxHeight
        );
        ctx.strokeRect(
          metrics.centerX - metrics.penaltyBoxWidth / 2,
          pTop + fHeight - metrics.penaltyBoxHeight,
          metrics.penaltyBoxWidth,
          metrics.penaltyBoxHeight
        );

        // Six-yard boxes
        ctx.strokeRect(
          metrics.centerX - metrics.sixYardBoxWidth / 2,
          pTop,
          metrics.sixYardBoxWidth,
          metrics.sixYardBoxHeight
        );
        ctx.strokeRect(
          metrics.centerX - metrics.sixYardBoxWidth / 2,
          pTop + fHeight - metrics.sixYardBoxHeight,
          metrics.sixYardBoxWidth,
          metrics.sixYardBoxHeight
        );

        // Phase S3: Architectural Roof Shadows & Time-of-day atmospheric grading
        drawArchitecturalRoofShadows(ctx, stadium as StadiumDefinition, timeOfDay);
        drawTimeOfDayAtmosphere(ctx, timeOfDay, {
          left: pLeft - 250,
          top: pTop - 250,
          width: fWidth + 500,
          height: fHeight + 500,
        });
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, cameraPerspective, currentStep, activeStandPos, step3SubTab, stadium]);

  if (!isOpen) return null;

  // Stand-by-stand mutation helper (independent per-stand updates)
  const updateCurrentStand = (patch: Partial<StandConfig>) => {
    audio.playKick(0.18);
    const posList: StandPosition[] =
      activeStandPos === 'corners'
        ? ['corner_ne', 'corner_nw', 'corner_se', 'corner_sw']
        : [activeStandPos as StandPosition];

    setStadium((prev) => {
      const nextStands = { ...prev.stands };
      for (const p of posList) {
        nextStands[p] = {
          ...nextStands[p],
          ...patch,
          position: p,
        };
      }
      return {
        ...prev,
        stands: nextStands,
      };
    });
  };

  // Replicate active corner architecture to all 4 corners helper
  const copyCornerToAllCorners = () => {
    audio.playKick(0.25);
    const sourcePos = (activeStandPos.startsWith('corner_') ? activeStandPos : 'corner_nw') as StandPosition;
    const source = stadium.stands[sourcePos];
    if (!source) return;
    setStadium((prev) => {
      const nextStands = { ...prev.stands };
      const allCorners: StandPosition[] = ['corner_ne', 'corner_se', 'corner_sw', 'corner_nw'];
      for (const c of allCorners) {
        nextStands[c] = {
          ...source,
          position: c,
        };
      }
      return { ...prev, stands: nextStands };
    });
  };

  const activeStandConfig = stadium.stands[(activeStandPos === 'corners' ? 'corner_nw' : activeStandPos) as StandPosition];
  const isCorner = !isRoundOval && (activeStandPos.startsWith('corner_') || activeStandPos === 'corners');
  const activeCornerArch = resolveCornerArchitectureType(activeStandConfig?.cornerType || activeStandConfig?.type);

  // Save handler (enforces category constraints before persisting)
  const handleSave = () => {
    audio.playKick(0.35);
    const updatedStadium = sanitizeStadiumForCategory({
      ...stadium,
      category: stadiumCategory,
      capacity: totalCapacity,
      fifaCategory: currentFifa,
    });
    setStadium(updatedStadium);
    saveCustomStadium(updatedStadium);
    if (onSaveStadium) onSaveStadium(updatedStadium);
  };

  // Test matchday handler (enforces category constraints before launch)
  const handleTestMatchday = () => {
    audio.playKick(0.4);
    const updatedStadium = sanitizeStadiumForCategory({
      ...stadium,
      category: stadiumCategory,
      capacity: totalCapacity,
      fifaCategory: currentFifa,
    });
    setStadium(updatedStadium);
    saveCustomStadium(updatedStadium);
    if (onTestMatchday) {
      onTestMatchday(updatedStadium);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-3 select-none animate-fadeIn">
      {/* 32-Bit Metallic Console Shell */}
      <div className="relative w-full max-w-6xl h-[100dvh] md:h-[96dvh] md:max-h-[820px] flex flex-col rounded-none md:rounded-2xl border-0 md:border-4 border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-black shadow-2xl overflow-hidden text-slate-100 font-sans">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: Console Marquee & Multi-View Camera Switcher Suite (14.1)      */}
        {/* ========================================================================= */}
        <div className="relative flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-2 border-slate-800 flex items-center justify-between gap-2 z-20 min-w-0">
          
          {/* Left Title & Status */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/70 text-cyan-300 font-mono text-[10px] tracking-widest font-black uppercase shadow-inner shrink-0">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">STADIUM</span>
              <span>ARCHITECT</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-black uppercase border shrink-0 ${
              isStreetVenue
                ? 'bg-orange-950/70 text-orange-300 border-orange-500/50'
                : isYouthVenue
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                : 'bg-blue-950/70 text-blue-300 border-blue-500/50'
            }`}>
              {stadiumCategory}
            </span>
            <span className="truncate text-xs font-mono text-slate-300 tracking-wider font-bold min-w-0">
              {stadium.name.toUpperCase()}
            </span>
            {!isStreetVenue && isFifaWorldCertified(stadium) && (
              <span className="hidden sm:flex px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] font-mono shadow-sm items-center gap-1 shrink-0">
                <span>⭐</span>
                <span>WORLD</span>
              </span>
            )}
          </div>

          {/* Center Step / Street Composer LED Indicator */}
          {isStreetVenue ? (
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {(
                [
                  { id: 'court_surface', label: '1. COURT & SURFACE' },
                  { id: 'walls_goals', label: '2. WALLS & GOALS' },
                  { id: 'neighborhood_lighting', label: '3. NEIGHBORHOOD & LIGHTS' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    audio.playKick(0.2);
                    setStreetTab(tab.id);
                  }}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                    streetTab === tab.id
                      ? 'bg-orange-500 border-orange-300 text-slate-950 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {[1, 2, 3, 4, 5, 6].map((step) => {
                const labels = ['SHAPE', 'STANDS', 'BENCH/TUNNEL', 'LOCK', 'SEATS', 'LIGHTS'];
                const isActive = currentStep === step;
                const isPassed = currentStep > step;
                return (
                  <button
                    key={step}
                    onClick={() => {
                      audio.playKick(0.2);
                      setCurrentStep(step);
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all flex items-center gap-1 border ${
                      isActive
                        ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-md ring-1 ring-amber-400'
                        : isPassed
                        ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{step}.</span>
                    <span>{labels[step - 1]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Desktop camera tools + always-accessible Switch Venue & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5">
            {/* Phase 15.6: Time-of-Day Sky & Lighting Switcher (Respects No-Lights lock) */}
            {(() => {
              const currentTod = stadium.lighting?.timeOfDay || 'noon';
              const cycleCandidates: TimeOfDay[] = (['noon', 'sunset', 'night', 'dawn'] as TimeOfDay[]).filter((tod) =>
                allowedTimesForActiveStadium.includes(tod)
              );
              return (
                <button
                  onClick={() => {
                    audio.playKick(0.2);
                    const idx = cycleCandidates.indexOf(currentTod);
                    const next: TimeOfDay = cycleCandidates[(idx + 1) % Math.max(1, cycleCandidates.length)] || 'noon';
                    setStadium((prev) => ({
                      ...prev,
                      lighting: {
                        ...(prev.lighting || { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: next }),
                        timeOfDay: next,
                      },
                    }));
                  }}
                  className={`px-2.5 py-1 rounded border-2 text-[10px] font-mono font-black tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    currentTod === 'noon'
                      ? 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-400 text-amber-300 shadow-amber-500/20'
                      : currentTod === 'sunset'
                      ? 'bg-orange-950/60 hover:bg-orange-900/70 border-orange-500 text-orange-300 shadow-orange-500/20'
                      : currentTod === 'dawn'
                      ? 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-400 text-rose-300 shadow-rose-500/20'
                      : 'bg-indigo-950/60 hover:bg-indigo-900/70 border-indigo-500 text-cyan-300 shadow-indigo-500/20'
                  }`}
                  title={
                    allowedTimesForActiveStadium.length <= 2
                      ? 'No floodlights installed: Daylight/Dawn only'
                      : 'Toggle Matchday Lighting (Noon / Sunset / Night / Dawn)'
                  }
                >
                  {currentTod === 'noon' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  {currentTod === 'sunset' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
                  {currentTod === 'dawn' && <Sunrise className="w-3.5 h-3.5 text-rose-300" />}
                  {currentTod === 'night' && <Moon className="w-3.5 h-3.5 text-cyan-300" />}
                  <span className="hidden xs:inline">SKY:</span>
                  <span className="text-white font-bold uppercase">{currentTod}</span>
                </button>
              );
            })()}

            {/* ST4.1 Sims-Style 3-State Roof Cutaway Toggler (Hidden for Street / standard Youth without roof) */}
            {!isStreetVenue && (!isYouthVenue || stadium.youthSpecialUnlocked) && (() => {
              const currentCutaway: RoofCutawayMode = stadium.roofCutaway || stadium.roof?.cutawayMode || 'partial';
              const nextCutaway: RoofCutawayMode =
                currentCutaway === 'hidden' ? 'partial' : currentCutaway === 'partial' ? 'full' : 'hidden';

              return (
                <button
                  onClick={() => {
                    audio.playKick(0.22);
                    const updatedRoof = { ...(stadium.roof || getDefaultRoofConfig()), cutawayMode: nextCutaway };
                    setStadium({
                      ...stadium,
                      roofCutaway: nextCutaway,
                      roof: updatedRoof,
                    });
                  }}
                  className={`px-2.5 py-1 rounded border-2 text-[10px] font-mono font-black tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    currentCutaway === 'full'
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                      : currentCutaway === 'partial'
                      ? 'bg-amber-950/70 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Sims-Style Roof Cutaway: ${
                    currentCutaway === 'hidden'
                      ? 'Hidden (0% Canopy) — Unobstructed View into Tiers & Pitch. Tap for Edge-Only (50%)'
                      : currentCutaway === 'partial'
                      ? 'Edge-Only (50% Canopy) — Default framing upper rows without blocking action. Tap for Full (100%)'
                      : 'Full Canopy (100%) — Covered grandstand with trusses & floodlights. Tap to Hide (0%)'
                  }`}
                >
                  <span>🏛️</span>
                  <span className="hidden sm:inline">ROOF:</span>
                  <span className="font-bold uppercase">
                    {currentCutaway === 'hidden' ? '0% [HIDE]' : currentCutaway === 'partial' ? '50% [EDGE]' : '100% [FULL]'}
                  </span>
                </button>
              );
            })()}

            {/* Phase B1.3: Dedicated Sky View / Aerial Free Toggle Button */}
            <button
              onClick={() => {
                audio.playKick(0.24);
                if (cameraPerspective === 'aerial_free') {
                  setCameraPerspective('relevant');
                } else {
                  aerialFreeCamTargetRef.current = {
                    x: PITCH_CONFIG.CENTER_X,
                    y: PITCH_CONFIG.CENTER_Y - 140,
                    zoom: 0.22,
                    pitchTilt: 0.35,
                    label: 'AERIAL FREE CAM',
                    description: 'Unrestricted 360° pan and zoom across grounds, concourse, and horizon skyline.',
                  };
                  setCameraPerspective('aerial_free');
                }
              }}
              className={`px-2.5 py-1 rounded border-2 text-[10px] font-mono font-black tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                cameraPerspective === 'aerial_free'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/50 shadow-cyan-400/30 font-black'
                  : cameraPerspective === 'aerial_sky'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-400/30 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Toggle Unrestricted 360° Sky View / Aerial Free Mode (Drag to Pan anywhere, Zoom from 5% to 250%)"
            >
              <span>🦅</span>
              <span className="hidden xs:inline">SKY VIEW / AERIAL FREE</span>
              <span className="xs:hidden">SKY VIEW</span>
              {cameraPerspective === 'aerial_free' && <span className="text-[9px]">●</span>}
            </button>

            {/* Camera Switcher Button */}
            <div className="relative">
              <button
                onClick={() => {
                  audio.playKick(0.25);
                  setIsCameraPopoverOpen(!isCameraPopoverOpen);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-2 border-cyan-500/60 text-cyan-300 text-[10px] font-mono font-black tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                title="Top-Right Multi-View Camera Switcher Suite (7 Perspectives)"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="hidden xs:inline">CAM:</span>
                <span className="text-white font-bold">{cameraPerspective.toUpperCase()}</span>
                <span className="text-cyan-400 text-[8px]">▼</span>
              </button>

              {/* Camera Popover (7 Specialized Perspectives) */}
              {isCameraPopoverOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border-2 border-cyan-500/80 bg-slate-950 p-2 shadow-2xl z-50 text-[10px] font-mono space-y-1 animate-fadeIn">
                  <div className="px-2 py-1 text-cyan-400 font-bold border-b border-slate-800 flex items-center justify-between">
                    <span>📹 CAMERA DIRECTOR</span>
                    <span className="text-[9px] text-slate-500">7 VIEWS</span>
                  </div>

                  {/* 1. Relevant View */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setCameraPerspective('relevant');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'relevant' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>🎯 Relevant View (Auto-Focus)</span>
                    {cameraPerspective === 'relevant' && <Check className="w-3 h-3" />}
                  </button>

                  {/* 2. Full Pitch View */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setCameraPerspective('full_pitch');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'full_pitch' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>🏟️ Full Pitch Overview</span>
                    {cameraPerspective === 'full_pitch' && <Check className="w-3 h-3" />}
                  </button>

                  {/* 3. Stands View with stand selector */}
                  <div className={`p-1.5 rounded border ${cameraPerspective === 'stands' ? 'border-cyan-400 bg-cyan-950/40' : 'border-slate-800'}`}>
                    <button
                      onClick={() => {
                        audio.playKick(0.2);
                        setCameraPerspective('stands');
                      }}
                      className="w-full text-left font-bold text-slate-200 flex items-center justify-between"
                    >
                      <span>👥 Stands View (Spectator Rows)</span>
                      {cameraPerspective === 'stands' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                    <div className="grid grid-cols-4 gap-1 mt-1 text-[8px]">
                      {displayedStands.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            audio.playKick(0.18);
                            setCameraPerspective('stands');
                            setActiveStandPos(s.id);
                            setIsCameraPopoverOpen(false);
                          }}
                          className={`py-0.5 rounded text-center uppercase font-bold border truncate ${
                            activeStandPos === s.id && cameraPerspective === 'stands'
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          {s.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Playing Field Focus */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setCameraPerspective('field_focus');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'field_focus' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>⚽ Field Turf & Goals Focus</span>
                    {cameraPerspective === 'field_focus' && <Check className="w-3 h-3" />}
                  </button>

                  {/* 5. Aerial Sky-Cam */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      aerialFreeCamTargetRef.current = {
                        x: PITCH_CONFIG.CENTER_X,
                        y: PITCH_CONFIG.CENTER_Y - 140,
                        zoom: 0.26,
                        pitchTilt: 0.35,
                        label: 'AERIAL SKY-CAM (FAR)',
                        description: 'High-altitude bird’s-eye perspective showing outer architecture and horizon.',
                      };
                      setCameraPerspective('aerial_sky');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'aerial_sky' || cameraPerspective === 'aerial_free' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>🦅 Aerial Sky-Cam (Birds-Eye Vista)</span>
                      {cameraPerspective === 'aerial_free' && (
                        <span className="text-[7.5px] opacity-80">Free Navigation Active</span>
                      )}
                    </div>
                    {(cameraPerspective === 'aerial_sky' || cameraPerspective === 'aerial_free') && <Check className="w-3 h-3" />}
                  </button>

                  {/* 6. Tunnel Camera */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setCameraPerspective('tunnel');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'tunnel' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>🚪 Tunnel Walkout Cam</span>
                    {cameraPerspective === 'tunnel' && <Check className="w-3 h-3" />}
                  </button>

                  {/* 7. Bench Camera */}
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setCameraPerspective('bench');
                      setIsCameraPopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors ${
                      cameraPerspective === 'bench' ? 'bg-cyan-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>💺 Dugout Benches Cam</span>
                    {cameraPerspective === 'bench' && <Check className="w-3 h-3" />}
                  </button>

                  <div className="pt-1 border-t border-slate-800 text-[8px] text-slate-500 text-center">
                    Dual-purpose: Used in Pre-Match Walkouts
                  </div>
                </div>
              )}
            </div>

            </div>

            {/* Phase D1.4: Workflow Gateway Switcher Button */}
            <button
              onClick={() => {
                audio.playKick(0.2);
                setShowGateway(true);
              }}
              className="min-h-[44px] px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Open Stadium Architect Gateway (Switch registered stadium or create new from scratch)"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">SWITCH VENUE</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                audio.playKick(0.2);
                onClose();
              }}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-slate-200 hover:text-red-400 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE CONSOLE PANE SWITCHER (WIZARD vs LIVE 3D VIEW) */}
        <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 md:hidden shrink-0">
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.15);
              setMobilePane('wizard');
            }}
            className={`min-h-[44px] rounded-lg border font-arcade text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobilePane === 'wizard'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isStreetVenue ? 'STREET COMPOSER' : `WIZARD (${currentStep}/6)`}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.15);
              setMobilePane('preview');
            }}
            className={`min-h-[44px] rounded-lg border font-arcade text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobilePane === 'preview'
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D VIEW</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: SPLIT VIEW (Inspector on Left, Real-Time Preview on Right)     */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-0 overflow-hidden relative">
          {/* PHASE D1.4: STADIUM CREATOR GATEWAY MODAL ("EDIT CURRENT" vs "CREATE NEW") */}
          {showGateway && (
            <div className="fixed md:absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-6 safe-top safe-bottom animate-fadeIn">
              <div className="max-w-2xl w-full bg-slate-900 border-0 sm:border-2 border-amber-500/70 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92dvh]">
                {/* Gateway Header */}
                <div className="px-4 py-3 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-['Outfit'] font-black text-sm sm:text-lg text-white uppercase tracking-wider truncate">
                        Stadium Architect Gateway
                      </h2>
                      <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                        Step 0: Choose venue category, then edit existing or create new.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setShowGateway(false);
                    }}
                    aria-label="Close Gateway"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Step 0 Category Selector Bar */}
                {(() => {
                  const categoryVenues = getRegisteredStadiumsByCategory(gatewayCategory);
                  const categories: { id: StadiumCategory; label: string; sub: string; badgeClass: string }[] = [
                    {
                      id: 'pro',
                      label: 'Professional Stadiums',
                      sub: '6-Step Full Architect · 4 Shapes · Up to 4 Tiers',
                      badgeClass: 'border-blue-400 bg-blue-950/60 text-blue-200',
                    },
                    {
                      id: 'youth',
                      label: 'Youth Stadiums',
                      sub: 'Academy Compounds · Rectangular · Up to 2 Tiers',
                      badgeClass: 'border-emerald-400 bg-emerald-950/60 text-emerald-200',
                    },
                    {
                      id: 'street',
                      label: 'Street Fields',
                      sub: '3-Tab Playground Composer · 42–52m Urban Courts',
                      badgeClass: 'border-orange-400 bg-orange-950/60 text-orange-200',
                    },
                  ];

                  return (
                    <>
                      <div className="px-4 sm:px-6 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
                        {categories.map((cat) => {
                          const count = getRegisteredStadiumsByCategory(cat.id).length;
                          const isSelected = gatewayCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                audio.playKick(0.2);
                                setGatewayCategory(cat.id);
                                const nextList = getRegisteredStadiumsByCategory(cat.id);
                                if (nextList.length > 0) {
                                  setSelectedRegisteredStadiumId(nextList[0].id);
                                } else {
                                  setSelectedRegisteredStadiumId('');
                                }
                              }}
                              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? `${cat.badgeClass} ring-2 ring-amber-400/50 shadow-lg`
                                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-['Outfit'] font-black uppercase tracking-wide truncate">
                                  {cat.label}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                                  {count}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-1 leading-snug">
                                {cat.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Gateway Cards Grid */}
                      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                        {/* WORKFLOW 1: EDIT REGISTERED / CURRENT STADIUM */}
                        <div className="bg-slate-950/80 border-2 border-slate-700 hover:border-amber-400/80 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                                  Edit Existing {gatewayCategory} Venue
                                </span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                                {categoryVenues.length} Venues
                              </span>
                            </div>

                            {categoryVenues.length > 0 ? (
                              <>
                                <p className="text-[10.5px] text-slate-400 leading-relaxed">
                                  Select a registered {gatewayCategory} venue to inspect, modify architecture, and save updates.
                                </p>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
                                    Choose {gatewayCategory.toUpperCase()} Venue:
                                  </label>
                                  <select
                                    value={
                                      categoryVenues.some((v) => v.id === selectedRegisteredStadiumId)
                                        ? selectedRegisteredStadiumId
                                        : categoryVenues[0].id
                                    }
                                    onChange={(e) => {
                                      const id = e.target.value;
                                      setSelectedRegisteredStadiumId(id);
                                      const chosen = getStadiumById(id) || STADIUM_REGISTRY[id];
                                      if (chosen) {
                                        setStadium(JSON.parse(JSON.stringify(chosen)));
                                      }
                                    }}
                                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
                                  >
                                    {categoryVenues.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.name} ({s.shape.toUpperCase()} • {s.city})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            ) : (
                              <div className="p-3 rounded-lg bg-slate-900/70 border border-dashed border-slate-700 text-[10.5px] font-mono text-slate-400">
                                No custom {gatewayCategory} venues saved yet. Use "Create New" on the right to draft your first {gatewayCategory} ground!
                              </div>
                            )}
                          </div>

                          <button
                            disabled={categoryVenues.length === 0}
                            onClick={() => {
                              audio.playKick(0.2);
                              const targetId = categoryVenues.some((v) => v.id === selectedRegisteredStadiumId)
                                ? selectedRegisteredStadiumId
                                : categoryVenues[0]?.id;
                              const chosen = targetId ? (STADIUM_REGISTRY[targetId] || getStadiumById(targetId)) : null;
                              if (chosen) {
                                setStadium(sanitizeStadiumForCategory(JSON.parse(JSON.stringify(chosen))));
                              }
                              setCurrentStep(1);
                              setStreetTab('court_surface');
                              setShowGateway(false);
                            }}
                            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <Sliders className="w-4 h-4" />
                            <span>Edit Selected {gatewayCategory} Venue</span>
                          </button>
                        </div>

                        {/* WORKFLOW 2: CREATE NEW VENUE IN SELECTED CATEGORY */}
                        <div className="bg-slate-950/80 border-2 border-slate-700 hover:border-emerald-400/80 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                                  Create New {gatewayCategory} Venue
                                </span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                                Clean Template
                              </span>
                            </div>

                            <p className="text-[10.5px] text-slate-400 leading-relaxed">
                              {gatewayCategory === 'street'
                                ? 'Launch the 3-Tab Street Playground Composer for 42–52m × 24–32m cages, sand lots, potrero pitches, and rooftop turfs.'
                                : gatewayCategory === 'youth'
                                ? 'Draft an academy training pitch with Youth rectangular stand limits, community turf options, and Brutalist concrete finishes.'
                                : 'Start with a clean 105m × 68m Pro baseline template with 6-step full grandstand, roof & broadcast architecture.'}
                            </p>

                            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-[10px] font-mono text-slate-400">
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                  {gatewayCategory === 'street'
                                    ? 'Compact 42–52m × 24–32m Street Court'
                                    : gatewayCategory === 'youth'
                                    ? 'Youth Scale 84–94m × 52–60m Pitch'
                                    : 'Standard 105m × 68m Pro Pitch'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                  {gatewayCategory === 'street'
                                    ? 'Rebound Walls, Urban Props & Street Lighting'
                                    : gatewayCategory === 'youth'
                                    ? 'Max 2 Tiers · Youth Dugouts & Tunnels'
                                    : 'Unrestricted 4 Shapes · Up to 4 Tiers'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              audio.playKick(0.2);
                              const def = createDefaultStadium(undefined, gatewayCategory);
                              setStadium(def);
                              setCurrentStep(1);
                              setStreetTab('court_surface');
                              setShowGateway(false);
                            }}
                            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Create New {gatewayCategory} Venue</span>
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Gateway Footer */}
                <div className="px-4 sm:px-5 py-2.5 safe-bottom bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500 shrink-0">
                  <span className="truncate">Category Mode: {stadiumCategory.toUpperCase()}</span>
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setShowGateway(false);
                    }}
                    className="min-h-[44px] px-2 text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
                  >
                    Continue with Current Stadium &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: 6-STEP WIZARD OR 3-TAB STREET COMPOSER (Cols 1-5)          */}
          {/* ----------------------------------------------------------------------- */}
          <div className={`${mobilePane === 'preview' ? 'hidden md:flex' : 'flex'} flex-1 min-h-0 md:col-span-5 h-full flex-col bg-slate-900/90 md:border-r-2 border-slate-800 overflow-hidden z-10`}>
            {isStreetVenue ? (
              /* ===================================================================== */
              /* DEDICATED 3-TAB STREET PLAYGROUND COMPOSER UI                         */
              /* ===================================================================== */
              <>
                {/* Street Composer Header + Mobile Tabs */}
                <div className="flex-none px-3 py-2 bg-slate-950/85 border-b border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-widest">
                        STREET PLAYGROUND COMPOSER
                      </span>
                      <h3 className="font-['Outfit'] font-black text-sm text-white uppercase tracking-wide truncate">
                        {streetTab === 'court_surface' && '1. Court, City & Surface'}
                        {streetTab === 'walls_goals' && '2. Rebound Walls & Street Goals'}
                        {streetTab === 'neighborhood_lighting' && '3. Neighborhood, Props & Lighting'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-500/40 text-orange-300 text-[9px] font-mono font-bold uppercase shrink-0">
                      7v7 URBAN CAGE
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'court_surface', label: '1. Court & Surface' },
                        { id: 'walls_goals', label: '2. Walls & Goals' },
                        { id: 'neighborhood_lighting', label: '3. Neighborhood' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          audio.playKick(0.18);
                          setStreetTab(t.id);
                        }}
                        className={`py-1.5 px-1.5 rounded text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer truncate ${
                          streetTab === t.id
                            ? 'bg-orange-500 text-slate-950 border-orange-300 shadow'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Tab Body */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 font-mono text-[11px]">
                  {(() => {
                    const sc: StreetArenaConfig = {
                      ...DEFAULT_STREET_ARENA_CONFIG,
                      ...(stadium.streetConfig || {}),
                      surface: (stadium.streetConfig?.surface || stadium.streetSurface || 'concrete') as StreetSurfaceType,
                      urbanProps: stadium.streetConfig?.urbanProps || DEFAULT_STREET_ARENA_CONFIG.urbanProps,
                    };
                    const updateStreetConfig = (patch: Partial<StreetArenaConfig>, extraTop?: Partial<StadiumDefinition>) => {
                      const nextStreet: StreetArenaConfig = { ...sc, ...patch };
                      const nextStadium = sanitizeStadiumForCategory({
                        ...stadium,
                        ...(extraTop || {}),
                        category: 'street',
                        streetConfig: nextStreet,
                        streetSurface: nextStreet.surface,
                        turfQuality: nextStreet.surface,
                      });
                      setStadium(nextStadium);
                    };

                    if (streetTab === 'court_surface') {
                      return (
                        <div className="space-y-3 animate-fadeIn">
                          {/* Court Identity */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              STREET VENUE IDENTITY
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] text-slate-500">COURT NAME:</span>
                                <input
                                  type="text"
                                  value={stadium.name}
                                  onChange={(e) => setStadium({ ...stadium, name: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-orange-300 font-bold focus:border-orange-400 outline-none text-xs"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500">SHORT CODE:</span>
                                <input
                                  type="text"
                                  maxLength={8}
                                  value={stadium.shortName}
                                  onChange={(e) => setStadium({ ...stadium, shortName: e.target.value.toUpperCase() })}
                                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white focus:border-orange-400 outline-none text-xs uppercase"
                                />
                              </div>
                            </div>

                            {/* Linked Starting City */}
                            <div>
                              <span className="text-[9px] text-slate-500 block mb-1">LINKED STARTING CITY / NEIGHBORHOOD:</span>
                              <select
                                value={stadium.streetCityId || ''}
                                onChange={(e) => {
                                  const cityId = e.target.value || undefined;
                                  const cityObj = STARTING_CITIES.find((c) => c.id === cityId);
                                  updateStreetConfig(
                                    {},
                                    {
                                      streetCityId: cityId,
                                      city: cityObj ? cityObj.cityName : stadium.city,
                                      country: cityObj ? cityObj.countryName : stadium.country,
                                    }
                                  );
                                }}
                                className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-orange-400 outline-none"
                              >
                                <option value="">Custom Neighborhood ({stadium.city || 'Any City'})</option>
                                {STARTING_CITIES.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.cityName}, {city.countryName} — {city.landmark}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Archetype Selector */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              STREET ARCHETYPE (7 ENVIRONMENTS)
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'tarmac_cage', label: 'Tarmac Cage', desc: 'Urban fenced concrete court' },
                                  { id: 'favela_quadra', label: 'Favela Quadra', desc: 'Hillside concrete court' },
                                  { id: 'potrero_dirt', label: 'Potrero Dirt', desc: 'Hard-packed street earth' },
                                  { id: 'courtyard_paving', label: 'Courtyard Paving', desc: 'Cobble & brick tenement court' },
                                  { id: 'rooftop_mesh', label: 'Rooftop Mesh', desc: 'High-rise netted astro turf' },
                                  { id: 'coastal_boardwalk', label: 'Coastal Boardwalk', desc: 'Harbor seawall sand lot' },
                                  { id: 'desert_sand_lot', label: 'Desert Sand Lot', desc: 'Sun-baked deep sand court' },
                                ] as { id: StreetArenaArchetype; label: string; desc: string }[]
                              ).map((arch) => (
                                <button
                                  key={arch.id}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateStreetConfig({ archetype: arch.id });
                                  }}
                                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                                    sc.archetype === arch.id
                                      ? 'border-orange-400 bg-orange-950/50 text-orange-200 ring-1 ring-orange-400'
                                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-bold text-[10px]">{arch.label}</div>
                                  <div className="text-[8px] text-slate-500 truncate">{arch.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Surface Selector */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              STREET SURFACE MATERIAL
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'concrete', label: 'Concrete / Tarmac', desc: 'Fast zipping roll & high bounce' },
                                  { id: 'sand', label: 'Deep Sand Lot', desc: 'Heavy drag, deadened bounce, muddy in rain' },
                                  { id: 'synthetic', label: 'Patched Astro', desc: 'Fast street turf (+10% injury hazard)' },
                                  { id: 'poor', label: 'Potrero Dirt', desc: 'Dusty rutted earth & random hops' },
                                ] as { id: StreetSurfaceType; label: string; desc: string }[]
                              ).map((surf) => (
                                <button
                                  key={surf.id}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateStreetConfig({ surface: surf.id });
                                  }}
                                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                                    sc.surface === surf.id
                                      ? 'border-orange-400 bg-orange-950/50 text-orange-200 ring-1 ring-orange-400'
                                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-bold text-[10px] uppercase">{surf.label}</div>
                                  <div className="text-[8px] text-slate-500">{surf.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Court Markings */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              COURT LINE MARKINGS
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'spray_paint', label: 'Spray Paint' },
                                  { id: 'chalk_dust', label: 'Chalk Dust' },
                                  { id: 'multisport_crossover', label: 'Multisport Crossover' },
                                  { id: 'faded_tarmac', label: 'Faded Tarmac' },
                                ] as { id: StreetCourtMarkings; label: string }[]
                              ).map((cm) => (
                                <button
                                  key={cm.id}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateStreetConfig({ courtMarkings: cm.id });
                                  }}
                                  className={`p-2 rounded border text-left text-[10px] font-bold transition-all cursor-pointer ${
                                    sc.courtMarkings === cm.id
                                      ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {cm.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (streetTab === 'walls_goals') {
                      return (
                        <div className="space-y-3 animate-fadeIn">
                          {/* Perimeter Rebound Wall */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              PERIMETER REBOUND WALL (FLUSH WITH TOUCHLINES)
                            </label>
                            <div className="space-y-1.5">
                              {(
                                [
                                  { id: 'chainlink_cage', label: 'Chainlink Mesh Cage', desc: 'Diamond wire enclosure & galvanized posts' },
                                  { id: 'graffiti_brick', label: 'Graffiti Brick Alley', desc: 'Aged red-brick tenement bounce wall' },
                                  { id: 'corrugated_iron', label: 'Corrugated Iron Sheets', desc: 'Ribbed metal shack fencing' },
                                  { id: 'timber_seawall', label: 'Timber Seawall Planks', desc: 'Weathered coastal boardwalk retaining wall' },
                                  { id: 'concrete_curb_wall', label: 'Concrete Curb Wall', desc: 'Painted street barrier jersey wall' },
                                ] as { id: StreetPerimeterWallStyle; label: string; desc: string }[]
                              ).map((pw) => (
                                <button
                                  key={pw.id}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateStreetConfig({ perimeterWallStyle: pw.id });
                                  }}
                                  className={`w-full p-2 rounded border text-left transition-all cursor-pointer ${
                                    sc.perimeterWallStyle === pw.id
                                      ? 'border-orange-400 bg-orange-950/50 text-orange-200 ring-1 ring-orange-400'
                                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-bold text-[10px]">{pw.label}</div>
                                  <div className="text-[8px] text-slate-500">{pw.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Street Goal Style */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                              STREET GOAL STYLE (3.0m × 2.0m FUTSAL SCALE)
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'futsal_tubular', label: 'Futsal Tubular Frame', desc: 'Red/white striped 5-a-side posts' },
                                  { id: 'chain_net_park', label: 'Chain-Link Park Goal', desc: 'Heavy iron pipe & rattle chain net' },
                                  { id: 'painted_wall_posts', label: 'Painted Wall Posts', desc: 'Chalk/paint goal outline on brick wall' },
                                  { id: 'crates_and_pipes', label: 'Crates & Pipes', desc: 'Improvised milk-crate street goals' },
                                ] as { id: StreetGoalStyle; label: string; desc: string }[]
                              ).map((gs) => (
                                <button
                                  key={gs.id}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateStreetConfig({ goalStyle: gs.id });
                                  }}
                                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                                    sc.goalStyle === gs.id
                                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 ring-1 ring-cyan-400'
                                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-bold text-[10px]">{gs.label}</div>
                                  <div className="text-[8px] text-slate-500">{gs.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Court Dimensions */}
                          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-300 font-bold uppercase">STREET COURT FOOTPRINT</span>
                              <span className="text-[10px] text-orange-300 font-bold">
                                {stadium.pitchLengthMeters ?? 48}m × {stadium.pitchWidthMeters ?? 28}m
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              <label className="flex items-center justify-between text-[9px] text-slate-400">
                                <span>Length (42–52m)</span>
                                <input
                                  type="range"
                                  min={42}
                                  max={52}
                                  value={stadium.pitchLengthMeters ?? 48}
                                  onChange={(e) => updateStreetConfig({}, { pitchLengthMeters: Number(e.target.value) })}
                                  className="w-40 accent-orange-400"
                                />
                              </label>
                              <label className="flex items-center justify-between text-[9px] text-slate-400">
                                <span>Width (24–32m)</span>
                                <input
                                  type="range"
                                  min={24}
                                  max={32}
                                  value={stadium.pitchWidthMeters ?? 28}
                                  onChange={(e) => updateStreetConfig({}, { pitchWidthMeters: Number(e.target.value) })}
                                  className="w-40 accent-orange-400"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Tab 3: neighborhood_lighting
                    return (
                      <div className="space-y-3 animate-fadeIn">
                        {/* Street Lighting */}
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                          <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                            STREET LIGHTING INFRASTRUCTURE
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(
                              [
                                { id: 'sodium_streetlamps', label: 'Sodium Streetlamps', desc: 'Warm amber overhead pole lamps' },
                                { id: 'festoon_string_lights', label: 'Festoon String Lights', desc: 'Crisscrossed neighborhood bulbs' },
                                { id: 'single_flood_pole', label: 'Single Work Flood Pole', desc: 'Halogen utility light mast' },
                                { id: 'daylight_only', label: 'Daylight Only (No Lights)', desc: 'Unlit lot; blocks dusk/night kickoffs' },
                              ] as { id: StreetLightingType; label: string; desc: string }[]
                            ).map((lt) => (
                              <button
                                key={lt.id}
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateStreetConfig(
                                    { streetLighting: lt.id },
                                    {
                                      lighting: {
                                        ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 2, powerKw: 400, timeOfDay: 'sunset' }),
                                        type: lt.id === 'daylight_only' ? 'none' : 'corner_pylons',
                                      },
                                    }
                                  );
                                }}
                                className={`p-2 rounded border text-left transition-all cursor-pointer ${
                                  sc.streetLighting === lt.id
                                    ? 'border-yellow-400 bg-yellow-950/40 text-yellow-200 ring-1 ring-yellow-400'
                                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <div className="font-bold text-[10px]">{lt.label}</div>
                                <div className="text-[8px] text-slate-500">{lt.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time of Day */}
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                            TIME OF DAY PREVIEW
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(['noon', 'sunset', 'night', 'dawn'] as TimeOfDay[]).map((tod) => {
                              const allowed = allowedTimesForActiveStadium.includes(tod);
                              return (
                                <button
                                  key={tod}
                                  type="button"
                                  disabled={!allowed}
                                  onClick={() => {
                                    audio.playKick(0.18);
                                    updateStreetConfig({}, {
                                      timeOfDay: tod,
                                      lighting: { ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 2, powerKw: 400, timeOfDay: tod }), timeOfDay: tod },
                                    });
                                  }}
                                  className={`py-1.5 rounded border text-center font-bold text-[9px] uppercase transition-all ${
                                    !allowed
                                      ? 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed opacity-40'
                                      : (stadium.lighting?.timeOfDay || 'noon') === tod
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black cursor-pointer'
                                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white cursor-pointer'
                                  }`}
                                >
                                  {tod}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Urban Props Checkboxes */}
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                          <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                            URBAN PROPS AROUND PERIMETER
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(
                              [
                                { id: 'parked_cars', label: 'Parked Cars' },
                                { id: 'laundry_lines', label: 'Laundry Lines' },
                                { id: 'graffiti_murals', label: 'Graffiti Murals' },
                                { id: 'milk_crates', label: 'Milk Crates & Bags' },
                                { id: 'scooters', label: 'Parked Mopeds/Scooters' },
                                { id: 'corner_kiosk', label: 'Corner Kiosk Stand' },
                              ] as { id: StreetUrbanProp; label: string }[]
                            ).map((prop) => {
                              const checked = sc.urbanProps.includes(prop.id);
                              return (
                                <label
                                  key={prop.id}
                                  className={`p-2 rounded border flex items-center gap-2 cursor-pointer transition-all ${
                                    checked
                                      ? 'border-orange-400/70 bg-orange-950/40 text-orange-200'
                                      : 'border-slate-800 bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      audio.playKick(0.15);
                                      const nextProps = checked
                                        ? sc.urbanProps.filter((p) => p !== prop.id)
                                        : [...sc.urbanProps, prop.id];
                                      updateStreetConfig({ urbanProps: nextProps });
                                    }}
                                    className="accent-orange-400"
                                  />
                                  <span className="font-bold text-[9.5px]">{prop.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Street Onlookers */}
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                          <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                            STREET ONLOOKERS BY FENCE
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(
                              [
                                { id: 'none', label: 'Empty Court' },
                                { id: 'sparse_locals', label: 'Sparse Locals' },
                                { id: 'block_party_fence', label: 'Block Party Fence' },
                              ] as { id: StreetFenceCrowdMode; label: string }[]
                            ).map((fc) => (
                              <button
                                key={fc.id}
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateStreetConfig({ fenceCrowdMode: fc.id });
                                }}
                                className={`p-2 rounded border text-center font-bold text-[9px] uppercase cursor-pointer transition-all ${
                                  sc.fenceCrowdMode === fc.id
                                    ? 'border-emerald-400 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-400'
                                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {fc.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Save & Test Street Venue */}
                        <div className="pt-1 space-y-2">
                          <button
                            type="button"
                            onClick={handleSave}
                            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 border border-cyan-400 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>SAVE STREET ARENA TO REGISTRY</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleTestMatchday}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>⚽ TEST MATCH ON THIS STREET COURT</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Street Composer Footer */}
                <div className="flex-none px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={streetTab === 'court_surface'}
                    onClick={() => {
                      audio.playKick(0.18);
                      setStreetTab(streetTab === 'neighborhood_lighting' ? 'walls_goals' : 'court_surface');
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    ◀ PREV TAB
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] uppercase border border-cyan-400 cursor-pointer"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    disabled={streetTab === 'neighborhood_lighting'}
                    onClick={() => {
                      audio.playKick(0.18);
                      setStreetTab(streetTab === 'court_surface' ? 'walls_goals' : 'neighborhood_lighting');
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-orange-500 disabled:opacity-30 text-slate-950 font-black text-xs shadow cursor-pointer"
                  >
                    NEXT TAB ▶
                  </button>
                </div>
              </>
            ) : (
            <>
            {/* Step Header Marquee */}
            <div className="flex-none px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                  STEP {currentStep} OF 6 {isYouthVenue ? '· YOUTH ACADEMY MODE' : ''}
                </span>
                <h3 className="font-['Outfit'] font-black text-sm text-white uppercase tracking-wide truncate">
                  {currentStep === 1 && '1. Structure, Shape & Surroundings'}
                  {currentStep === 2 && '2. Stand-by-Stand Architecture'}
                  {currentStep === 3 && '3. Dugouts & Entrance Tunnel'}
                  {currentStep === 4 && '4. Structural Review & Lock'}
                  {currentStep === 5 && '5. Stadium Bowl Seats & Colors'}
                  {currentStep === 6 && '6. Floodlights & Registry Save'}
                </h3>
              </div>

              {/* Step Navigation Arrows */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  disabled={currentStep <= 1}
                  onClick={() => {
                    audio.playKick(0.18);
                    setCurrentStep((p) => Math.max(1, p - 1));
                  }}
                  aria-label="Previous Step"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 disabled:opacity-30 border border-slate-700 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={currentStep >= 6}
                  onClick={() => {
                    audio.playKick(0.18);
                    setCurrentStep((p) => Math.min(6, p + 1));
                  }}
                  aria-label="Next Step"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 disabled:opacity-30 border border-slate-700 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step Content Container (Scrollable internally without page scroll) */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 font-mono text-[11px]">
              
              {/* ------------------------------------------------------------------- */}
              {/* STEP 1: STRUCTURE, SHAPE & SURROUNDINGS (14.4.1)                   */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Venue Identity & Country / Youth Cup Hook */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      VENUE IDENTITY
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500">FULL NAME:</span>
                        <input
                          type="text"
                          value={stadium.name}
                          onChange={(e) => setStadium({ ...stadium, name: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:border-amber-400 outline-none text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">CITY / REGION:</span>
                        <input
                          type="text"
                          value={stadium.city}
                          onChange={(e) => setStadium({ ...stadium, city: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 outline-none text-xs"
                        />
                      </div>
                    </div>
                    {isYouthVenue && (
                      <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-emerald-300 font-bold uppercase">YOUTH COUNTRY / REGION:</span>
                          <select
                            value={stadium.country || 'International'}
                            onChange={(e) =>
                              setStadium(
                                sanitizeStadiumForCategory({
                                  ...stadium,
                                  country: e.target.value,
                                })
                              )
                            }
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-200 text-[10px] outline-none focus:border-emerald-400"
                          >
                            {['International', 'Spain', 'England', 'Argentina', 'Brazil', 'Italy', 'Germany', 'France'].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                          <div>
                            <div className="text-[9.5px] font-bold text-emerald-300 uppercase">
                              Int'l Youth Cup Host Unlock
                            </div>
                            <div className="text-[8px] text-slate-400">
                              Unlocks pristine turf, canopy roofs & modern stands
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              audio.playKick(0.2);
                              setStadium(
                                sanitizeStadiumForCategory({
                                  ...stadium,
                                  youthSpecialUnlocked: !stadium.youthSpecialUnlocked,
                                })
                              );
                            }}
                            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border cursor-pointer ${
                              stadium.youthSpecialUnlocked
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {stadium.youthSpecialUnlocked ? 'UNLOCKED' : 'STANDARD'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Architectural Shape Selection */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>ARCHITECTURAL SHAPE ({isYouthVenue ? 'RECTANGULAR LOCKED' : '4 FORMATS'})</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['round', 'oval', 'square', 'rectangular'] as StadiumShape[]).map((shp) => {
                        const isShapeAllowed = getAllowedShapesForCategory(stadiumCategory).includes(shp);
                        return (
                        <button
                          key={shp}
                          disabled={!isShapeAllowed}
                          onClick={() => {
                            if (!isShapeAllowed) return;
                            audio.playKick(0.2);
                            setStep1SubFocus('shape');
                            const nextIsRoundOval = isRoundOrOvalShape(shp);
                            const currIsRoundOval = isRoundOrOvalShape(stadium.shape);
                            let nextRoof = stadium.roof;
                            if (nextIsRoundOval && !currIsRoundOval) {
                              nextRoof = {
                                ...(stadium.roof || getDefaultRoofConfig(shp)),
                                style: shp === 'round' ? 'spoke_wheel_tension' : 'continuous_cantilever_ring',
                                material: 'ptfe_fabric',
                                border: 'video_halo_board',
                              };
                            } else if (!nextIsRoundOval && currIsRoundOval) {
                              nextRoof = {
                                ...(stadium.roof || getDefaultRoofConfig(shp)),
                                style: 'cantilever_truss',
                                material: 'corrugated_steel',
                                border: 'painted_club_fascia',
                              };
                            }
                            if (nextIsRoundOval && activeStandPos.startsWith('corner_')) {
                              setActiveStandPos('west');
                            }
                            // Phase T8.1: On Round & Oval stadiums, flat VIP Buildings are converted to Stacked Wall coliseums
                            let nextStands = stadium.stands;
                            if (nextIsRoundOval && nextStands) {
                              let hasVip = false;
                              const migrated: Record<string, StandConfig> = { ...nextStands };
                              for (const pos of Object.keys(migrated)) {
                                if (migrated[pos]?.type === 'vip_building') {
                                  migrated[pos] = {
                                    ...migrated[pos],
                                    type: 'stacked_wall',
                                    stackedWallLowerSize: 'medium',
                                    stackedWallLowerDensity: 'normal',
                                    stackedWallUpperSize: 'medium',
                                    stackedWallUpperDensity: 'normal',
                                    stackedWallArchedCrown: true,
                                  };
                                  hasVip = true;
                                }
                              }
                              if (hasVip) {
                                nextStands = migrated as any;
                              }
                            }
                            setStadium({
                              ...stadium,
                              shape: shp,
                              roof: nextRoof,
                              stands: nextStands,
                              // Running track strictly exclusive to round & oval
                              hasTrack: shp === 'round' || shp === 'oval' ? stadium.hasTrack : false,
                            });
                          }}
                          className={`p-2 rounded border text-left transition-all ${
                            !isShapeAllowed
                              ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-40 cursor-not-allowed'
                              : stadium.shape === shp
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <div className="font-bold uppercase text-[10px]">
                            {shp} {!isShapeAllowed && '🔒'}
                          </div>
                          <div className="text-[8px] text-slate-500">
                            {shp === 'round' && 'Continuous Coliseum Circular Bowl'}
                            {shp === 'oval' && 'Olympic Curved Horseshoe Endzones'}
                            {shp === 'square' && 'Rectilinear with 45° Corner Pavilions'}
                            {shp === 'rectangular' && 'Classic English 4-Stand Box Ground'}
                          </div>
                        </button>
                      );})}
                    </div>
                  </div>



                  {/* Athletics Running Track (Exclusive to Round & Oval; strictly outside pitch perimeter) */}
                  {(stadium.shape === 'round' || stadium.shape === 'oval') && (
                    <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-700/50 flex items-center justify-between animate-fadeIn">
                      <div>
                        <div className="font-bold text-cyan-300 text-[10px] uppercase">
                          🏃 ATHLETICS RUNNING TRACK (8-LANE CURVED)
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {stadium.shape === 'round'
                            ? 'Continuous circular track encircling pitch and apron with zero pitch overlap'
                            : 'Olympic straight touchlines & semicircular curved endzones clearing pitch'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          audio.playKick(0.2);
                          setStadium({ ...stadium, hasTrack: !stadium.hasTrack });
                        }}
                        className={`px-3 py-1 rounded font-bold text-[10px] uppercase border transition-all ${
                          stadium.hasTrack
                            ? 'bg-cyan-500 border-cyan-300 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {stadium.hasTrack ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  )}

                  {/* Eleven Outside Surroundings (Locked in Youth Mode) */}
                  {isYouthVenue ? (
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-400 text-[9.5px] space-y-1">
                      <div className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>OUTSIDE SURROUNDINGS & HORIZONS LOCKED</span>
                      </div>
                      <p className="text-[8.5px] text-slate-500">
                        Youth grounds omit expansive stadium horizon panoramas and use lightweight academy perimeter grounds.
                      </p>
                    </div>
                  ) : (
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>OUTSIDE SURROUNDINGS (360° PANORAMIC)</span>
                      <span className="text-cyan-400 text-[9px]">3 TIME VARIANTS</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                      {(
                        [
                          { id: 'mountains', label: 'Mountains', icon: '⛰️' },
                          { id: 'forest', label: 'Forest', icon: '🌲' },
                          { id: 'savannah', label: 'Savannah', icon: '🦒' },
                          { id: 'highway', label: 'Highway', icon: '🛣️' },
                          { id: 'small_city', label: 'Small City', icon: '🏘️' },
                          { id: 'big_city', label: 'Big City', icon: '🌆' },
                          { id: 'beach', label: 'Beach', icon: '🏖️' },
                          { id: 'airport', label: 'Airport', icon: '✈️' },
                          { id: 'railroad', label: 'Railroad', icon: '🚂' },
                          { id: 'parking_lot', label: 'Parking Lot', icon: '🚌' },
                          { id: 'marine_floating', label: 'Marine Floating', icon: '🌊' },
                        ] as { id: SurroundingsType; label: string; icon: string }[]
                      ).map((sur) => (
                        <button
                          key={sur.id}
                          onClick={() => {
                            audio.playKick(0.2);
                            setStep1SubFocus('surroundings');
                            const newSur = sur.id;
                            const newOptions = getGroundsForSurroundings(newSur);
                            const isValid = stadium.grounds && newOptions.some((g) => g.id === stadium.grounds);
                            const nextGrounds = isValid ? stadium.grounds : getDefaultGroundsForSurroundings(newSur);
                            const validPerimeters = getContextualPerimeters(newSur, nextGrounds).map((p) => p.id);
                            const updatedStands = { ...stadium.stands };
                            let standsChanged = false;
                            for (const pos of (['east', 'west', 'north', 'south', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw'] as StandPosition[])) {
                              const st = updatedStands[pos];
                              if (st && (st.type === 'none' || st.type === 'no_stand')) {
                                if (st.perimeterFinish && !validPerimeters.includes(st.perimeterFinish)) {
                                  st.perimeterFinish = getDefaultPerimeterForContext(newSur, nextGrounds);
                                  standsChanged = true;
                                }
                              }
                            }
                            setStadium({
                              ...stadium,
                              surroundings: newSur,
                              grounds: nextGrounds,
                              ...(standsChanged ? { stands: updatedStands } : {}),
                            });
                          }}
                          className={`p-1.5 rounded border text-left flex items-center gap-1.5 transition-all ${
                            stadium.surroundings === sur.id
                              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                              : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-base">{sur.icon}</span>
                          <span className="font-bold text-[10px]">{sur.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* PHASE B5: SURROUNDING HORIZONS OVERHAUL (Deep Marine Ocean, Gibraltar Airport & Mountain Chains) */}
                    {(() => {
                      const sur = stadium.surroundings;
                      const isMarine = sur === 'marine_floating';
                      const isAirport = sur === 'airport';
                      const isMountains = sur === 'mountains' || sur === 'nature';

                      if (!isMarine && !isAirport && !isMountains) {
                        return null;
                      }

                      let horizonTitle = '360° PANORAMIC HORIZON SKYLINE';
                      let horizonDesc = 'Curved panoramic horizon with contextual atmospheric lighting';
                      let horizonKeyElements: string[] = [];
                      let activeArchetypeBadge = '';

                      if (isMarine) {
                        const arch = resolveMarineGroundArchetype(stadium.grounds);
                        horizonTitle = 'PHASE B5: DEEP MARINE OCEAN HORIZON';
                        horizonDesc = B5_HORIZON_FEATURES.marine.description;
                        activeArchetypeBadge = arch === 'aircraft_carrier' ? 'AIRCRAFT CARRIER DECK' :
                          arch === 'oil_rig' ? 'OFFSHORE OIL/GAS PLATFORM' :
                          arch === 'coral_atoll' ? 'TROPICAL CORAL ATOLL' : 'MODULAR HEX-PONTOON';
                        horizonKeyElements = B5_HORIZON_FEATURES.marine.keyElements;
                      } else if (isAirport) {
                        horizonTitle = 'PHASE B5: GIBRALTAR RUNWAY & ROCK';
                        horizonDesc = B5_HORIZON_FEATURES.airport.description;
                        activeArchetypeBadge = 'GIBRALTAR VICTORIA RUNWAY';
                        horizonKeyElements = B5_HORIZON_FEATURES.airport.keyElements;
                      } else if (isMountains) {
                        horizonTitle = 'PHASE B5: ALPINE MOUNTAIN CHAIN HORIZON';
                        horizonDesc = B5_HORIZON_FEATURES.mountains.description;
                        activeArchetypeBadge = 'PARALLAX ALPINE PEAKS & ALPENGLOW';
                        horizonKeyElements = B5_HORIZON_FEATURES.mountains.keyElements;
                      }

                      return (
                        <div className="p-2 rounded bg-slate-900/90 border border-cyan-500/30 space-y-1.5 mt-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                            <span className="text-[9px] font-bold text-cyan-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>{horizonTitle}</span>
                            </span>
                            {activeArchetypeBadge && (
                              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                                {activeArchetypeBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[8px] text-slate-400 leading-tight">
                            {horizonDesc}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {horizonKeyElements.map((elem, idx) => (
                              <span
                                key={idx}
                                className="text-[7px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300"
                              >
                                ✓ {elem}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  )}

                  {/* PHASE ST3: Immediate Stadium Grounds & Forecourt Concourse (Step 1) */}
                  {!isYouthVenue && (() => {
                    const groundsList = getGroundsForSurroundings(stadium.surroundings);
                    const currentGroundsId = stadium.grounds || groundsList[0]?.id || 'parking_lots';
                    const currentGrounds = groundsList.find((g) => g.id === currentGroundsId) || groundsList[0];
                    const isSpecializedSurroundings =
                      stadium.surroundings === 'marine_floating' ||
                      stadium.surroundings === 'airport' ||
                      stadium.surroundings === 'railroad' ||
                      stadium.surroundings === 'highway' ||
                      stadium.surroundings === 'beach' ||
                      stadium.surroundings === 'mountains' ||
                      stadium.surroundings === 'nature' ||
                      stadium.surroundings === 'forest' ||
                      stadium.surroundings === 'savannah';

                    return (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>IMMEDIATE GROUNDS & FORECOURT (STEP 1)</span>
                            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                              {groundsList.length} OPTIONS
                            </span>
                          </label>
                          <span className="text-[9px] text-cyan-300 font-bold font-mono">
                            {currentGrounds?.icon} {currentGrounds?.label}
                          </span>
                        </div>

                        <div className="text-[8px] text-slate-400 leading-tight">
                          Spatial Layer 4: Immediate perimeter plaza & concourse outside grandstand exterior walls before distant horizon.
                          {isSpecializedSurroundings && (
                            <span className="text-emerald-400 ml-1">
                              ✓ Homogeneity filter active for {stadium.surroundings.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
                          {groundsList.map((g) => {
                            const isSelected = currentGroundsId === g.id;
                            return (
                              <button
                                key={g.id}
                                onClick={() => {
                                  audio.playKick(0.2);
                                  setStep1SubFocus('grounds');
                                  setStadium({ ...stadium, grounds: g.id });
                                }}
                                className={`p-1.5 rounded border text-left transition-all ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-950/50 text-amber-200 ring-1 ring-amber-400 shadow'
                                    : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 font-bold text-[9px] truncate">
                                    <span className="text-xs">{g.icon}</span>
                                    <span className="truncate">{g.label}</span>
                                  </div>
                                  {g.isSpecialized && (
                                    <span className="text-[7px] px-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
                                      SPECIAL
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="text-[8px] text-amber-400 font-black">✓</span>
                                  )}
                                </div>
                                <div className="text-[7.5px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                                  {g.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* PHASE B4: Asymmetric Cardinal Directionality & Rich Ground Flavor Engine */}
                        {(() => {
                          const flavor = getGroundFlavorDetail(currentGroundsId);
                          return (
                            <div className="p-2 rounded bg-slate-900/90 border border-amber-500/30 space-y-2 mt-2">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                                  <Compass className="w-3 h-3 text-amber-400" />
                                  <span>PHASE B4: CARDINAL ASYMMETRIC GROUND FLAVOR</span>
                                </span>
                                <span className="text-[8px] text-cyan-400 font-mono font-bold">
                                  {flavor.name.toUpperCase()}
                                </span>
                              </div>

                              {/* 4 Cardinal Profiles Grid */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                                  <div className="flex items-center justify-between text-[8px] font-bold text-cyan-300">
                                    <span>🧭 NORTH (HORIZON SHELF)</span>
                                    <span className="text-[7px] text-slate-500">COMPACT</span>
                                  </div>
                                  <div className="text-[7.5px] text-slate-400 line-clamp-2">
                                    {flavor.northFlavor}
                                  </div>
                                </div>
                                <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                                  <div className="flex items-center justify-between text-[8px] font-bold text-amber-300">
                                    <span>🏛️ SOUTH (MAIN FACADE)</span>
                                    <span className="text-[7px] text-slate-500">PUBLIC HUB</span>
                                  </div>
                                  <div className="text-[7.5px] text-slate-400 line-clamp-2">
                                    {flavor.southFlavor}
                                  </div>
                                </div>
                                <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                                  <div className="flex items-center justify-between text-[8px] font-bold text-emerald-300">
                                    <span>🍔 EAST (FAN FANFARE)</span>
                                    <span className="text-[7px] text-slate-500">PROMENADE</span>
                                  </div>
                                  <div className="text-[7.5px] text-slate-400 line-clamp-2">
                                    {flavor.eastFlavor}
                                  </div>
                                </div>
                                <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                                  <div className="flex items-center justify-between text-[8px] font-bold text-purple-300">
                                    <span>📡 WEST (MEDIA & BROADCAST)</span>
                                    <span className="text-[7px] text-slate-500">TECHNICAL</span>
                                  </div>
                                  <div className="text-[7.5px] text-slate-400 line-clamp-2">
                                    {flavor.westFlavor}
                                  </div>
                                </div>
                              </div>

                              {/* Bespoke 32-Bit Ground Props List */}
                              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                                <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                                  Bespoke 32-Bit Ground Props & Textures:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {flavor.groundProps.map((prop, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[7px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300"
                                    >
                                      ✓ {prop}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}

                  {/* PHASE D1.2: Apron Perimeter Infill Material (Relocated to Final / Last Position on Step 1) */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>APRON INFILL MATERIAL (PITCH-TO-STANDS)</span>
                      <span className="text-[9px] text-slate-500">6 MATERIALS</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'grass', label: 'Natural Turf', icon: '🌱', desc: 'Lush green lawn & chalk line' },
                          { id: 'concrete', label: 'Concrete Slabs', icon: '🧱', desc: 'Pre-cast pavers & joint grid' },
                          { id: 'rubber_tartan', label: 'Tartan Rubber', icon: '🏃', desc: 'High-grip non-slip tartan' },
                          { id: 'artificial_turf', label: 'AstroTurf', icon: '🌿', desc: 'Lime synthetic turf & seam tape' },
                          { id: 'gravel_ballast', label: 'Crushed Gravel', icon: '🪨', desc: 'Ballast river gravel & stone' },
                          { id: 'asphalt_paved', label: 'Paved Asphalt', icon: '🛣️', desc: 'Charcoal tarmac & hazard curb' },
                        ] as { id: ApronMaterial; label: string; icon: string; desc: string }[]
                      ).map((mat) => (
                        <button
                          key={mat.id}
                          onClick={() => {
                            audio.playKick(0.2);
                            setStadium({ ...stadium, apronMaterial: mat.id });
                          }}
                          className={`p-1.5 rounded border text-left transition-all ${
                            (stadium.apronMaterial || 'grass') === mat.id
                              ? 'border-amber-400 bg-amber-950/50 text-amber-200 ring-1 ring-amber-400'
                              : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold text-[9px]">
                            <span>{mat.icon}</span>
                            <span className="truncate">{mat.label}</span>
                          </div>
                          <div className="text-[7px] text-slate-500 truncate mt-0.5">{mat.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* STEP 2: STAND-BY-STAND FOCUS CAMERA & CHISELED INSPECTOR (14.4.2)   */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Stand Selector Tabs Header (8 Discrete Clockwise Stands) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1 text-[9px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 font-bold text-amber-300">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isRoundOval ? 'CONTINUOUS COLISEUM 4-SECTOR INSPECTOR:' : 'CLOCKWISE 8-STAND INSPECTOR:'}</span>
                      </span>
                      <span className="text-cyan-400 font-black">
                        {displayedStands.find((s) => s.id === activeStandPos)?.name.toUpperCase() || String(activeStandPos).toUpperCase()}
                      </span>
                    </div>

                    <div className={`p-1 bg-slate-950 rounded-lg border border-slate-800 grid gap-1 ${isRoundOval ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-8'}`}>
                      {displayedStands.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            audio.playKick(0.2);
                            setActiveStandPos(s.id);
                            setCameraPerspective('stands');
                          }}
                          title={s.desc}
                          className={`py-1.5 px-0.5 rounded text-center uppercase font-bold text-[9px] transition-all border ${
                            activeStandPos === s.id
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black ring-1 ring-amber-300'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate">{s.shortLabel}</div>
                        </button>
                      ))}
                    </div>

                    {/* Active Stand Role & Description Strip */}
                    <div className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[9px]">
                      <span className="text-slate-300 font-bold truncate">
                        {displayedStands.find((s) => s.id === activeStandPos)?.desc || CLOCKWISE_STANDS.find((s) => s.id === activeStandPos)?.desc}
                      </span>
                      {!isRoundOval && activeStandPos.startsWith('corner_') && (
                        <button
                          onClick={copyCornerToAllCorners}
                          className="flex-none ml-2 px-1.5 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 font-black text-[8px] tracking-wide active:scale-95 transition-all"
                          title="Replicate this corner's architecture to all 4 corners"
                        >
                          ⚡ UNIFY ALL 4 CORNERS
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stand Structural Type: Tiered vs Wall Tier vs No Stand OR 4-Corner Architecture Taxonomy */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {isCorner ? '4-CORNER ARCHITECTURE TAXONOMY (PHASE T10)' : 'STAND STRUCTURAL TYPE'}
                    </label>

                    {isCorner ? (
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() =>
                            updateCurrentStand({
                              type: 'round',
                              cornerType: 'round',
                              tierCount: isYouthVenue ? 1 : (activeStandConfig?.tierCount || 2),
                              tiers: isYouthVenue
                                ? [{ size: activeStandConfig?.tiers?.[0]?.size === 'large' ? 'medium' : (activeStandConfig?.tiers?.[0]?.size || 'small') }]
                                : (activeStandConfig?.tiers || [{ size: 'medium' }, { size: 'medium' }]),
                            })
                          }
                          className={`p-2 rounded border text-left font-bold transition-all ${
                            activeCornerArch === 'round'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>🔄</span>
                            <span>ROUND</span>
                          </div>
                          <div className="text-[8px] text-slate-500">
                            {isYouthVenue ? 'Youth Arc (1 Deck)' : 'Sweeping Arc (1-4 Decks)'}
                          </div>
                        </button>

                        <button
                          onClick={() =>
                            updateCurrentStand({
                              type: 'square',
                              cornerType: 'square',
                              wallSize: isYouthVenue ? 'small' : (activeStandConfig?.wallSize || 'large'),
                              wallDensity: activeStandConfig?.wallDensity || 'normal',
                            })
                          }
                          className={`p-2 rounded border text-left font-bold transition-all ${
                            activeCornerArch === 'giant'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>🏛️</span>
                            <span>{isYouthVenue ? 'SQUARE 🔒' : 'SQUARE / GIANT'}</span>
                          </div>
                          <div className="text-[8px] text-slate-500">
                            {isYouthVenue ? 'Small Corner Bench' : 'Monumental Rake'}
                          </div>
                        </button>

                        <button
                          disabled={isYouthVenue}
                          onClick={() => {
                            if (isYouthVenue) return;
                            updateCurrentStand({
                              type: 'tower',
                              cornerType: 'tower',
                              vipFloors: activeStandConfig?.vipFloors ?? 3,
                            });
                          }}
                          className={`p-2 rounded border text-left font-bold transition-all ${
                            isYouthVenue
                              ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-40 cursor-not-allowed'
                              : activeCornerArch === 'tower'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>🏢</span>
                            <span>VIP TOWER {isYouthVenue && '🔒'}</span>
                          </div>
                          <div className="text-[8px] text-slate-500">Luxury Palcos</div>
                        </button>

                        <button
                          onClick={() =>
                            updateCurrentStand({
                              type: 'none',
                              cornerType: 'none',
                            })
                          }
                          className={`p-2 rounded border text-left font-bold transition-all ${
                            activeCornerArch === 'none'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>🌳</span>
                            <span>NO STAND</span>
                          </div>
                          <div className="text-[8px] text-slate-500">Open & Landmark</div>
                        </button>
                      </div>
                    ) : (
                      <div className={`grid ${isRoundOval ? 'grid-cols-4' : 'grid-cols-5'} gap-1.5`}>
                        <button
                          onClick={() => updateCurrentStand({ type: 'tiered' })}
                          className={`p-2 rounded border text-left font-bold ${
                            activeStandConfig?.type === 'tiered'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <div>TIERED</div>
                          <div className="text-[8px] text-slate-500">{isYouthVenue ? '1 to 2 Decks' : '1 to 4 Decks'}</div>
                        </button>

                        <button
                          onClick={() => updateCurrentStand({ type: 'wall', ...(isYouthVenue ? { wallSize: 'small' } : {}) })}
                          className={`p-2 rounded border text-left font-bold ${
                            activeStandConfig?.type === 'wall'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <div>WALL TIER</div>
                          <div className="text-[8px] text-slate-500">{isYouthVenue ? 'Small Terrace' : 'Single Terrace'}</div>
                        </button>

                        <button
                          disabled={isYouthVenue}
                          onClick={() => {
                            if (isYouthVenue) return;
                            updateCurrentStand({
                              type: 'stacked_wall',
                              stackedWallLowerSize: activeStandConfig?.stackedWallLowerSize || 'medium',
                              stackedWallLowerDensity: activeStandConfig?.stackedWallLowerDensity || activeStandConfig?.wallDensity || activeStandConfig?.density || 'normal',
                              stackedWallUpperSize: activeStandConfig?.stackedWallUpperSize || 'medium',
                              stackedWallUpperDensity: activeStandConfig?.stackedWallUpperDensity || activeStandConfig?.wallDensity || activeStandConfig?.density || 'normal',
                              stackedWallArchedCrown: activeStandConfig?.stackedWallArchedCrown !== undefined ? activeStandConfig.stackedWallArchedCrown : true,
                            });
                          }}
                          className={`p-2 rounded border text-left font-bold ${
                            isYouthVenue
                              ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-40 cursor-not-allowed'
                              : activeStandConfig?.type === 'stacked_wall'
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/50'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className={isYouthVenue ? 'text-slate-600' : 'text-cyan-300'}>STACKED WALL {isYouthVenue && '🔒'}</div>
                          <div className="text-[8px] text-slate-500">Double-Decker</div>
                        </button>

                        {!isRoundOval && (
                          <button
                            disabled={isYouthVenue}
                            onClick={() => {
                              if (isYouthVenue) return;
                              updateCurrentStand({
                                type: 'vip_building',
                                vipFloors: activeStandConfig?.vipFloors ?? 4,
                                hasLowerStand: activeStandConfig?.hasLowerStand !== undefined ? activeStandConfig.hasLowerStand : true,
                                lowerStandSize: activeStandConfig?.lowerStandSize || 'medium',
                                lowerStandMaterial: activeStandConfig?.lowerStandMaterial || 'concrete',
                                lowerStandBarrier: activeStandConfig?.lowerStandBarrier || 'glass_balustrade',
                                lowerStandSeat: activeStandConfig?.lowerStandSeat || 'leather_armchair',
                              });
                            }}
                            className={`p-2 rounded border text-left font-bold ${
                              isYouthVenue
                                ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-40 cursor-not-allowed'
                                : activeStandConfig?.type === 'vip_building'
                                ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            <div>VIP BUILDING {isYouthVenue && '🔒'}</div>
                            <div className="text-[8px] text-slate-500">Luxury Suites</div>
                          </button>
                        )}

                        <button
                          onClick={() => updateCurrentStand({ type: 'none' })}
                          className={`p-2 rounded border text-left font-bold ${
                            activeStandConfig?.type === 'none' || activeStandConfig?.type === 'no_stand'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <div>NO STAND</div>
                          <div className="text-[8px] text-slate-500">{isRoundOval ? 'Open Radial' : 'Open End'}</div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* If Tiered / Round: Tier Count (1 to 4, clamped in Youth) & Tier Size */}
                  {(activeStandConfig?.type === 'tiered' || (isCorner && activeCornerArch === 'round')) && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">TIER DECKS COUNT:</span>
                        <div className="flex items-center gap-1">
                          {([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).map((tc) => {
                            const maxCategoryTiers = getMaxTiersForCategory(
                              stadiumCategory,
                              activeStandPos as StandPosition,
                              isCorner ? 'round' : activeStandConfig?.type
                            );
                            const isVipClamped = Boolean(activeStandConfig.hasVipSeats && tc === 4);
                            const isLockedTier = isVipClamped || tc > maxCategoryTiers;
                            return (
                              <button
                                key={tc}
                                disabled={isLockedTier}
                                onClick={() => {
                                  if (isLockedTier) return;
                                  const currentTiers = activeStandConfig.tiers || [];
                                  const newTiers = Array.from({ length: tc }, (_, i) => currentTiers[i] || { size: 'medium' as TierSize });
                                  updateCurrentStand({ tierCount: tc, tiers: newTiers });
                                }}
                                title={
                                  tc > maxCategoryTiers
                                    ? `Youth mode limits this stand to ${maxCategoryTiers} tier(s) max`
                                    : isVipClamped
                                    ? 'VIP Hospitality stands are limited to 3 tiers maximum'
                                    : undefined
                                }
                                className={`w-7 h-6 rounded font-bold border text-xs ${
                                  isLockedTier
                                    ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                                    : activeStandConfig.tierCount === tc
                                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {tc}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tier size & density per deck (Phase T3) */}
                      <div className="space-y-1.5">
                        {(activeStandConfig.tiers || [{ size: 'medium' }]).map((t, idx) => {
                          const deckDensity = t.density || activeStandConfig.density || 'normal';
                          const deckRows = getTierChairRows(t.size, deckDensity);
                          return (
                            <div key={idx} className="space-y-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-amber-400 font-bold">DECK {idx + 1} TIER:</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                                  {deckRows} SEAT ROWS
                                </span>
                              </div>
                              {/* Deck Size Selector (Decoupled from Density) */}
                              <div className="grid grid-cols-3 gap-1">
                                {(['small', 'medium', 'large'] as TierSize[]).map((sz) => {
                                  const isSizeLocked = isYouthVenue && sz === 'large';
                                  return (
                                  <button
                                    key={sz}
                                    disabled={isSizeLocked}
                                    onClick={() => {
                                      if (isSizeLocked) return;
                                      audio.playKick(0.2);
                                      const nextTiers = [...(activeStandConfig.tiers || [])];
                                      nextTiers[idx] = { ...nextTiers[idx], size: sz };
                                      updateCurrentStand({ tiers: nextTiers });
                                    }}
                                    className={`py-1 px-1 rounded text-[9px] uppercase font-bold border text-center transition-all ${
                                      isSizeLocked
                                        ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                                        : t.size === sz
                                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black shadow-sm'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    <div>{sz === 'small' ? 'Small' : sz === 'medium' ? 'Medium' : isSizeLocked ? 'Big 🔒' : 'Big'}</div>
                                    <div className="text-[7px] text-slate-500">
                                      {getTierChairRows(sz, deckDensity)} Rows
                                    </div>
                                  </button>
                                );})}
                              </div>
                              {/* Phase T3.3: 3-Segment Density Selector */}
                              <div className="pt-1 border-t border-slate-800/80">
                                <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold mb-1">
                                  <span className="uppercase">Deck {idx + 1} Packing:</span>
                                  <span className="text-amber-300">
                                    {deckDensity === 'reduced' && 'Reduced (-1 Row, -15% Cap)'}
                                    {deckDensity === 'normal' && 'Normal (Baseline Spacing)'}
                                    {deckDensity === 'high_density' && 'High Density (+1 to +4 Rows, +25% Cap)'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  {(['reduced', 'normal', 'high_density'] as StandDensity[]).map((dns) => (
                                    <button
                                      key={dns}
                                      onClick={() => {
                                        audio.playKick(0.2);
                                        const nextTiers = [...(activeStandConfig.tiers || [])];
                                        nextTiers[idx] = { ...nextTiers[idx], density: dns };
                                        updateCurrentStand({ tiers: nextTiers });
                                      }}
                                      className={`py-0.5 px-1 rounded text-[8px] font-bold uppercase transition-all ${
                                        deckDensity === dns
                                          ? dns === 'reduced'
                                            ? 'bg-sky-400 text-slate-950 border-sky-300 font-black shadow-sm'
                                            : dns === 'high_density'
                                            ? 'bg-rose-500 text-slate-950 border-rose-300 font-black shadow-sm'
                                            : 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                      }`}
                                    >
                                      {dns === 'reduced' ? 'Reduced' : dns === 'high_density' ? 'High' : 'Normal'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* If Wall Tier / Giant: Wall size & Phase T3 Wall Density */}
                  {(activeStandConfig?.type === 'wall' || (isCorner && activeCornerArch === 'giant')) && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {isCorner
                            ? isYouthVenue ? 'CORNER BENCH SCALE (SMALL ONLY IN YOUTH)' : "GIANT CORNER SCALE (ST. JAMES' MONUMENTAL WALL ~180px–240px)"
                            : 'WALL TIER SCALE (DORTMUND-STYLE CONTINUOUS TERRACE)'}
                        </label>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                          {getWallTierChairRows(activeStandConfig.wallSize, activeStandConfig.wallDensity || activeStandConfig.density || 'normal')} ROWS
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['small', 'medium', 'large'] as WallTierSize[]).map((wsz) => {
                          const wDensity = activeStandConfig.wallDensity || activeStandConfig.density || 'normal';
                          const rows = getWallTierChairRows(wsz, wDensity);
                          const isWallSizeAllowed = getAllowedWallSizesForCategory(stadiumCategory).includes(wsz);
                          const label =
                            wsz === 'small'
                              ? isCorner
                                ? 'Small (120px)'
                                : 'Small'
                              : wsz === 'medium'
                              ? isCorner
                                ? 'Medium (180px)'
                                : 'Medium'
                              : isCorner
                              ? 'Big (240px)'
                              : 'Big';
                          return (
                            <button
                              key={wsz}
                              disabled={!isWallSizeAllowed}
                              onClick={() => {
                                if (!isWallSizeAllowed) return;
                                updateCurrentStand({ wallSize: wsz });
                              }}
                              className={`p-2 rounded border text-center font-bold uppercase ${
                                !isWallSizeAllowed
                                  ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-40 cursor-not-allowed'
                                  : activeStandConfig.wallSize === wsz
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div>{label} {!isWallSizeAllowed && '🔒'}</div>
                              <div className="text-[8px] text-slate-500">
                                {rows} Terrace Rows
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Phase T3.3: 3-Segment Wall Density Selector */}
                      <div className="pt-1.5 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold mb-1">
                          <span className="uppercase">Wall Stand Density:</span>
                          <span className="text-amber-300">
                            {(activeStandConfig.wallDensity || activeStandConfig.density || 'normal') === 'reduced' && 'Reduced (5/10/15 Rows, -15% Cap)'}
                            {(activeStandConfig.wallDensity || activeStandConfig.density || 'normal') === 'normal' && 'Normal (6/11/16 Rows)'}
                            {(activeStandConfig.wallDensity || activeStandConfig.density || 'normal') === 'high_density' && 'High Density (7/13/20 Rows, +25% Cap)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['reduced', 'normal', 'high_density'] as StandDensity[]).map((dns) => (
                            <button
                              key={dns}
                              onClick={() => {
                                audio.playKick(0.2);
                                updateCurrentStand({ wallDensity: dns, density: dns });
                              }}
                              className={`p-1.5 rounded border text-center font-bold uppercase text-[9px] transition-all ${
                                (activeStandConfig.wallDensity || activeStandConfig.density || 'normal') === dns
                                  ? dns === 'reduced'
                                    ? 'bg-sky-400 text-slate-950 border-sky-300 font-black shadow-sm'
                                    : dns === 'high_density'
                                    ? 'bg-rose-500 text-slate-950 border-rose-300 font-black shadow-sm'
                                    : 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div>{dns === 'reduced' ? 'Reduced' : dns === 'high_density' ? 'High Density' : 'Normal'}</div>
                              <div className="text-[7px] text-slate-500">
                                {dns === 'reduced' ? '-1 Row' : dns === 'high_density' ? '+1 to +4 Rows' : 'Standard'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Phase T8.3: Tottenham Arched Domed Crown Profile (North & South Ends or Round/Oval Bowl) */}
                      {(isRoundOval || activeStandPos === 'north' || activeStandPos === 'south') && (
                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] font-bold text-cyan-300 flex items-center gap-1">
                              <span>🏛️</span>
                              <span>TOTTENHAM ARCHED CROWN PROFILE</span>
                            </div>
                            <div className="text-[7px] text-slate-400">
                              Arched roof rim, daylight window wall & twin angled LED scoreboards
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              audio.playKick(0.2);
                              updateCurrentStand({
                                stackedWallArchedCrown: activeStandConfig.stackedWallArchedCrown === false ? true : false,
                              });
                            }}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                              activeStandConfig.stackedWallArchedCrown !== false
                                ? 'bg-cyan-500 text-slate-950 border border-cyan-300 font-black shadow-sm'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {activeStandConfig.stackedWallArchedCrown !== false ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phase T8: "Stacked Wall" Modern Coliseum Double-Decker Architecture */}
                  {activeStandConfig?.type === 'stacked_wall' && (() => {
                    const lowerSize = activeStandConfig.stackedWallLowerSize || 'medium';
                    const upperSize = activeStandConfig.stackedWallUpperSize || 'medium';
                    const lowerDensity = activeStandConfig.stackedWallLowerDensity || activeStandConfig.wallDensity || activeStandConfig.density || 'normal';
                    const upperDensity = activeStandConfig.stackedWallUpperDensity || activeStandConfig.wallDensity || activeStandConfig.density || 'normal';
                    const lowerRows = getWallTierChairRows(lowerSize, lowerDensity);
                    const upperRows = getWallTierChairRows(upperSize, upperDensity);
                    const totalRows = lowerRows + upperRows;
                    const standPos = activeStandConfig.position || (activeStandPos === 'corners' ? 'corner_ne' : activeStandPos as any);
                    const totalCap = calculateStandCapacity(activeStandConfig, stadium.shape, standPos);
                    const hasArchedCrown = activeStandConfig.stackedWallArchedCrown !== false;

                    return (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-700/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span>🏟️</span>
                              <span>STACKED WALL (DOUBLE-DECKER COLISEUM)</span>
                            </div>
                            <div className="text-[8px] text-slate-400">
                              Metropolitano & Tottenham-style monster terrace with cantilever mezzanine
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                              {totalCap.toLocaleString()} CAP
                            </span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700 font-bold">
                              MAX CAPACITY
                            </span>
                          </div>
                        </div>

                        {/* 1. LOWER WALL TERRACE (Deck 1) */}
                        <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <div className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1">
                              <span>🔻</span>
                              <span>LOWER WALL TERRACE:</span>
                            </div>
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                              {lowerRows} ROWS ({lowerDensity.toUpperCase()})
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            {(['small', 'medium', 'large'] as WallTierSize[]).map((sz) => {
                              const rCount = getWallTierChairRows(sz, lowerDensity);
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateCurrentStand({ stackedWallLowerSize: sz });
                                  }}
                                  className={`p-1.5 rounded border text-center font-bold uppercase transition-all ${
                                    lowerSize === sz
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-sm'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                >
                                  <div className="text-[9px]">{sz === 'small' ? 'Small Lower' : sz === 'medium' ? 'Medium Lower' : 'Big Monumental'}</div>
                                  <div className="text-[7px] text-slate-500">{rCount} Rows</div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Lower Density Selector */}
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            {(['reduced', 'normal', 'high_density'] as StandDensity[]).map((dns) => (
                              <button
                                key={dns}
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateCurrentStand({ stackedWallLowerDensity: dns });
                                }}
                                className={`py-1 px-1 rounded border text-center text-[8px] font-bold uppercase transition-all ${
                                  lowerDensity === dns
                                    ? dns === 'reduced'
                                      ? 'bg-sky-400 text-slate-950 border-sky-300 font-black'
                                      : dns === 'high_density'
                                      ? 'bg-rose-500 text-slate-950 border-rose-300 font-black'
                                      : 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {dns === 'reduced' ? 'Reduced (-1)' : dns === 'high_density' ? 'High Density (+4)' : 'Normal'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. MEZZANINE CANTILEVER BALCONY BADGE */}
                        <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between text-[8px]">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <span>⚡</span>
                            <span>MEZZANINE CANTILEVER CONCOURSE</span>
                          </span>
                          <span className="text-slate-400 text-[7px]">
                            Illuminated Safety Glass Ribbon • Vomitory Portals • Drop Shadows
                          </span>
                        </div>

                        {/* 3. UPPER WALL DECK (Deck 2) */}
                        <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <div className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1">
                              <span>🔺</span>
                              <span>UPPER WALL DECK:</span>
                            </div>
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                              {upperRows} ROWS ({upperDensity.toUpperCase()})
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            {(['small', 'medium', 'large'] as WallTierSize[]).map((sz) => {
                              const rCount = getWallTierChairRows(sz, upperDensity);
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateCurrentStand({ stackedWallUpperSize: sz });
                                  }}
                                  className={`p-1.5 rounded border text-center font-bold uppercase transition-all ${
                                    upperSize === sz
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-sm'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                >
                                  <div className="text-[9px]">{sz === 'small' ? 'Small Upper' : sz === 'medium' ? 'Medium Upper' : 'Big Monumental'}</div>
                                  <div className="text-[7px] text-slate-500">{rCount} Rows</div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Upper Density Selector */}
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            {(['reduced', 'normal', 'high_density'] as StandDensity[]).map((dns) => (
                              <button
                                key={dns}
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateCurrentStand({ stackedWallUpperDensity: dns });
                                }}
                                className={`py-1 px-1 rounded border text-center text-[8px] font-bold uppercase transition-all ${
                                  upperDensity === dns
                                    ? dns === 'reduced'
                                      ? 'bg-sky-400 text-slate-950 border-sky-300 font-black'
                                      : dns === 'high_density'
                                      ? 'bg-rose-500 text-slate-950 border-rose-300 font-black'
                                      : 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {dns === 'reduced' ? 'Reduced (-1)' : dns === 'high_density' ? 'High Density (+4)' : 'Normal'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. TOTTENHAM ARCHED CROWN PROFILE (North & South Ends or Bowls) */}
                        {(isRoundOval || activeStandPos === 'north' || activeStandPos === 'south') && (
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-bold text-cyan-300 flex items-center gap-1">
                                <span>🏛️</span>
                                <span>TOTTENHAM ARCHED CROWN PROFILE</span>
                              </div>
                              <div className="text-[7px] text-slate-400">
                                Soaring arched parapet, clerestory window wall & twin angled LED scoreboards
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                audio.playKick(0.2);
                                updateCurrentStand({
                                  stackedWallArchedCrown: !hasArchedCrown,
                                });
                              }}
                              className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                hasArchedCrown
                                  ? 'bg-cyan-500 text-slate-950 border border-cyan-300 font-black shadow-sm'
                                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {hasArchedCrown ? 'ENABLED' : 'DISABLED'}
                            </button>
                          </div>
                        )}

                        {/* 5. Summary Breakdown */}
                        <div className="text-[8px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span>Lower: <strong className="text-cyan-300">{lowerRows} rows</strong></span>
                          <span>Upper: <strong className="text-cyan-300">{upperRows} rows</strong></span>
                          <span>Total Stehplatz: <strong className="text-amber-300">{totalRows} rows</strong></span>
                          <span>Max Capacity: <strong className="text-emerald-300">~{totalCap.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phase T7: VIP Building Multi-Floor Elevator (1-5 Floors) & Pitchside Stand Panel */}
                  {activeStandConfig?.type === 'vip_building' && (() => {
                    const vipFloors = getVipBuildingFloors(activeStandConfig);
                    const hasLowerStand = activeStandConfig.hasLowerStand !== false;
                    const lowerSize = activeStandConfig.lowerStandSize || 'medium';
                    const lowerMaterial = activeStandConfig.lowerStandMaterial || 'concrete';
                    const lowerBarrier = activeStandConfig.lowerStandBarrier || 'glass_balustrade';
                    const lowerSeat = activeStandConfig.lowerStandSeat || 'leather_armchair';
                    const standPos = activeStandConfig.position || (activeStandPos === 'corners' ? 'corner_ne' : activeStandPos as any);
                    const totalCap = calculateStandCapacity(activeStandConfig, stadium.shape, standPos);
                    const suiteCap = vipFloors * 1100;
                    const terraceCap = hasLowerStand ? getVipLowerStandCapacity(lowerSize) : 0;

                    return (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                            VIP BUILDING & SUITE ELEVATOR (PHASE T7)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                              {totalCap.toLocaleString()} CAP
                            </span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800 font-bold">
                              PRESTIGE VIP
                            </span>
                          </div>
                        </div>

                        {/* 1. Multi-Floor Suite Elevator Stepper (1-5 Floors) */}
                        <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                                <span>🏢</span>
                                <span>{vipFloors} {vipFloors === 1 ? 'FLOOR' : 'FLOORS'} ELEVATOR</span>
                              </div>
                              <div className="text-[8px] text-slate-400">
                                {vipFloors === 1 ? 'Executive Ground Directors Suite' :
                                 vipFloors === 2 ? 'Dual-Level Hospitality & Suites' :
                                 vipFloors === 3 ? 'Classic 3-Floor Palcos Tower' :
                                 vipFloors === 4 ? 'Grand 4-Floor Penthouse Suites' :
                                 'Ultra 5-Floor Master Skybox Spire'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={vipFloors <= 1}
                                onClick={() => {
                                  const next = Math.max(1, vipFloors - 1) as VipFloorCount;
                                  updateCurrentStand({ vipFloors: next, tierCount: Math.min(4, next) as (1 | 2 | 3 | 4) });
                                }}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-300 font-black text-sm flex items-center justify-center border border-slate-700"
                              >
                                -
                              </button>
                              <div className="px-2 py-0.5 bg-slate-950 rounded border border-amber-500/40 text-amber-300 font-mono text-xs font-black min-w-[54px] text-center">
                                {vipFloors} / 5
                              </div>
                              <button
                                type="button"
                                disabled={vipFloors >= 5}
                                onClick={() => {
                                  const next = Math.min(5, vipFloors + 1) as VipFloorCount;
                                  updateCurrentStand({ vipFloors: next, tierCount: Math.min(4, next) as (1 | 2 | 3 | 4) });
                                }}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-300 font-black text-sm flex items-center justify-center border border-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Quick 1 to 5 Floors selector buttons */}
                          <div className="grid grid-cols-5 gap-1 pt-1">
                            {([1, 2, 3, 4, 5] as VipFloorCount[]).map((fl) => (
                              <button
                                key={fl}
                                type="button"
                                onClick={() => updateCurrentStand({ vipFloors: fl, tierCount: Math.min(4, fl) as (1 | 2 | 3 | 4) })}
                                className={`py-1 px-1 rounded border text-center font-bold text-[9px] transition-colors ${
                                  vipFloors === fl
                                    ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-sm'
                                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div>{fl} F</div>
                                <div className="text-[7px] text-slate-500 font-normal">+{fl * 1100}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. STAND Pitchside Terrace Toggle & Customization */}
                        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                                PITCHSIDE STAND TERRACE
                              </span>
                              <span className="text-[8px] text-slate-400">
                                Integrated lower spectator rows situated below VIP suites
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateCurrentStand({ hasLowerStand: !hasLowerStand })}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                hasLowerStand
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
                              }`}
                            >
                              STAND {hasLowerStand ? 'ON' : 'OFF'}
                            </button>
                          </div>

                          {hasLowerStand ? (
                            <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                              {/* Lower Stand Size / Rows */}
                              <div>
                                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                  TERRACE ROWS & DEPTH
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {LOWER_STAND_SIZE_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => updateCurrentStand({ lowerStandSize: opt.id })}
                                      className={`p-1.5 rounded border text-left transition-colors ${
                                        lowerSize === opt.id
                                          ? 'border-amber-400 bg-amber-950/50 text-amber-300'
                                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <div className="text-[9px] font-bold">{opt.label}</div>
                                      <div className="text-[7px] text-slate-500 line-clamp-1">{opt.desc}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Lower Stand Material */}
                              <div>
                                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                  TERRACE SLAB MATERIAL
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {LOWER_STAND_MATERIAL_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => updateCurrentStand({ lowerStandMaterial: opt.id })}
                                      className={`p-1.5 rounded border text-center transition-colors ${
                                        lowerMaterial === opt.id
                                          ? 'border-amber-400 bg-amber-950/50 text-amber-300'
                                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <div className="text-[9px] font-bold">{opt.label}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Lower Stand Pitchside Barrier */}
                              <div>
                                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                  PITCHSIDE BARRIER
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {LOWER_STAND_BARRIER_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => updateCurrentStand({ lowerStandBarrier: opt.id })}
                                      className={`p-1.5 rounded border text-center transition-colors ${
                                        lowerBarrier === opt.id
                                          ? 'border-amber-400 bg-amber-950/50 text-amber-300'
                                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <div className="text-[9px] font-bold">{opt.label}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Lower Stand Seats */}
                              <div>
                                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                  PITCHSIDE SEAT STYLE
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {LOWER_STAND_SEAT_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => updateCurrentStand({ lowerStandSeat: opt.id })}
                                      className={`p-1.5 rounded border text-center transition-colors ${
                                        lowerSeat === opt.id
                                          ? 'border-amber-400 bg-amber-950/50 text-amber-300'
                                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <div className="text-[9px] font-bold">{opt.label}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[8px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 flex items-center gap-1.5">
                              <span className="text-amber-400">ℹ️</span>
                              <span>Stand terrace disabled. VIP glass suites rise directly from pitch level with flush player entrance tunnel and dugout portals.</span>
                            </div>
                          )}
                        </div>

                        {/* Capacity Summary Breakdown */}
                        <div className="text-[8px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span>Suites: <strong className="text-amber-300">+{suiteCap.toLocaleString()}</strong></span>
                          <span>Terrace: <strong className="text-emerald-300">+{terraceCap.toLocaleString()}</strong></span>
                          <span>Total VIP Stand: <strong className="text-slate-100">{totalCap.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phase T10: Dedicated VIP Hospitality Corner Tower Panel */}
                  {isCorner && activeCornerArch === 'tower' && (() => {
                    const towerFloors = getVipBuildingFloors(activeStandConfig);
                    const standPos = activeStandConfig.position || (activeStandPos === 'corners' ? 'corner_ne' : activeStandPos as any);
                    const totalCap = calculateStandCapacity(activeStandConfig, stadium.shape, standPos);

                    return (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-amber-600/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                            <span>🏢</span>
                            <span>VIP HOSPITALITY TOWER (PHASE T10)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                              {totalCap.toLocaleString()} CAP
                            </span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800 font-bold">
                              EXECUTIVE VIP
                            </span>
                          </div>
                        </div>

                        {/* 1. Multi-Floor Suite Elevator Stepper (1-5 Floors) */}
                        <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                                <span>🏢</span>
                                <span>{towerFloors} {towerFloors === 1 ? 'FLOOR' : 'FLOORS'} VIP SUITES</span>
                              </div>
                              <div className="text-[8px] text-slate-400">
                                {towerFloors === 1 ? 'Ground VIP Executive Directors Suite' :
                                 towerFloors === 2 ? 'Dual-Level Hospitality & Suites' :
                                 towerFloors === 3 ? 'Triple-Deck Panoramic Observation Palcos' :
                                 towerFloors === 4 ? 'Quad-Tier Monumental Luxury Suite Tower' :
                                 'Quintessential 5-Star Executive Skyscraper'}
                              </div>
                            </div>

                            {/* Stepper Controls [-] [count] [+] */}
                            <div className="flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded border border-slate-700">
                              <button
                                disabled={towerFloors <= 1}
                                onClick={() => updateCurrentStand({ vipFloors: Math.max(1, towerFloors - 1) as VipFloorCount })}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-black text-xs flex items-center justify-center transition-colors"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs text-amber-300">
                                {towerFloors}
                              </span>
                              <button
                                disabled={towerFloors >= 5}
                                onClick={() => updateCurrentStand({ vipFloors: Math.min(5, towerFloors + 1) as VipFloorCount })}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-black text-xs flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Amenities Info */}
                        <div className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-[8px] text-amber-200/80 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-amber-300">
                            <span>✨</span>
                            <span>BOMBONERA-STYLE CORNER VIP TOWER FEATURES</span>
                          </div>
                          <p>
                            Tinted panoramic observation windows with amber interior illumination, executive silhouettes, rooftop telecommunications mast with flashing red safety beacon, and ground-level red carpet entrance.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phase T10: Open Corner Landmark & Backdrop Panel */}
                  {isCorner && activeCornerArch === 'none' && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                          <span>🌳</span>
                          <span>OPEN CORNER & BESPOKE LANDMARK</span>
                        </label>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-bold">
                          GROUND-MATCHED FILL
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[8px] text-slate-300 space-y-1">
                        <div className="font-bold text-amber-300 flex items-center gap-1">
                          <span>📍</span>
                          <span>BESPOKE CORNER ARCHITECTURE</span>
                        </div>
                        <p className="text-slate-400">
                          {activeStandPos === 'corner_nw' ? 'Iconic high-mast vintage floodlight pylon with crisscross steel lattice and security fence.' :
                           activeStandPos === 'corner_ne' ? 'Historic red-brick corner clock tower with illuminated four-sided dial and flagpole.' :
                           activeStandPos === 'corner_sw' ? 'Grassroots fan culture outdoor terrace and biergarten with striped canvas parasols.' :
                           'Authentic turnstile gatehouse kiosk with ticket queues and security gates.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phase S2, S5 & T3: Grandstand Substance & Density Panel */}
                  {activeStandConfig?.type !== 'none' && activeStandConfig?.type !== 'no_stand' && activeStandConfig?.type !== 'vip_building' && !(isCorner && activeCornerArch === 'tower') && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          TIER DENSITY & CAPACITY (PHASE T3)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                            {calculateStandCapacity(activeStandConfig, stadium.shape, activeStandConfig.position || (activeStandPos === 'corners' ? 'corner_ne' : activeStandPos as any)).toLocaleString()} CAPACITY
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                            {activeStandConfig.type === 'wall'
                              ? `${getWallTierChairRows(activeStandConfig.wallSize, activeStandConfig.wallDensity || activeStandConfig.density || 'normal')} TERRACE ROWS`
                              : `${(activeStandConfig.tiers || [{ size: 'medium' }]).reduce((acc, cur) => acc + getTierChairRows(cur.size, cur.density || activeStandConfig.density || 'normal'), 0)} TOTAL ROWS`}
                          </span>
                        </div>
                      </div>

                      {/* S2.2 Tier Safety Balustrade Style */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">TIER SAFETY FENCE / BALUSTRADE:</span>
                        <div className="grid grid-cols-2 gap-1">
                          {([
                            { id: 'metal_railing', label: 'Tubular Pipe Railing' },
                            { id: 'leitch_lattice', label: 'Archibald Leitch Lattice' },
                            { id: 'industrial_mesh', label: 'Steel Wire Mesh' },
                            { id: 'glass_balustrade', label: 'Tempered Glass Balustrade' },
                            { id: 'illuminated_glass', label: 'Illuminated LED Glass' },
                          ] as { id: TierBalustradeStyle; label: string }[]).map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                audio.playKick(0.2);
                                updateCurrentStand({ balustradeStyle: b.id });
                              }}
                              className={`px-1.5 py-1 rounded text-left text-[9px] font-bold border truncate ${
                                (activeStandConfig.balustradeStyle ||
                                  (activeStandConfig.grade === 'grade2_classic'
                                    ? 'leitch_lattice'
                                    : activeStandConfig.grade === 'grade3_industrial'
                                    ? 'industrial_mesh'
                                    : activeStandConfig.grade === 'grade4_modern'
                                    ? 'glass_balustrade'
                                    : activeStandConfig.grade === 'grade5_futuristic'
                                    ? 'illuminated_glass'
                                    : 'metal_railing')) === b.id
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE T6: ARCHITECTURAL GRADE (GRADES 1 TO 5) & 3-ELEMENT COLOR ENGINE */}
                      {/* ----------------------------------------------------------- */}
                      {(() => {
                        const currentArchGrade = resolveStandArchitecturalGrade(activeStandConfig, stadium);
                        const currentGradeOpt = ARCHITECTURAL_GRADE_OPTIONS.find((o) => o.id === currentArchGrade) || ARCHITECTURAL_GRADE_OPTIONS[0];
                        const standColors: GradeElementColors = activeStandConfig.gradeColors || stadium.gradeColors || {};
                        const isMunicipalActive = currentArchGrade === 'municipal';

                        return (
                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🏛️</span>
                                <span>ARCHITECTURAL GRADE & TYPOLOGY</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                  GRADE {currentGradeOpt.tierLevel} • LEVEL {currentGradeOpt.seatLevel}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {currentGradeOpt.seatStyleName}
                                </span>
                              </div>
                            </div>

                            {/* 5-Grade Cards (Respects Youth Grade Locks) */}
                            <div className="grid grid-cols-5 gap-1">
                              {ARCHITECTURAL_GRADE_OPTIONS.map((opt) => {
                                const isSelected = currentArchGrade === opt.id;
                                const isGradeAllowed = getAllowedGradesForCategory(stadiumCategory, stadium).includes(opt.id);
                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!isGradeAllowed}
                                    onClick={() => {
                                      if (!isGradeAllowed) return;
                                      audio.playKick(0.2);
                                      updateCurrentStand({
                                        architecturalGrade: opt.id,
                                        grade: opt.id === 'municipal' ? 'grade1_municipal'
                                          : opt.id === 'brutalist' ? 'grade2_classic'
                                          : opt.id === 'industrial' ? 'grade3_industrial'
                                          : opt.id === 'victorian' ? 'grade4_modern'
                                          : 'grade5_futuristic',
                                        seatArchetype: opt.inherentSeatArchetype,
                                      });
                                    }}
                                    className={`p-1.5 rounded-md border text-center transition-all ${
                                      !isGradeAllowed
                                        ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-35 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md ring-1 ring-amber-300'
                                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                                    }`}
                                    title={isGradeAllowed ? `${opt.label}: ${opt.desc}` : `Locked in standard ${stadiumCategory} mode`}
                                  >
                                    <div className="text-sm">{opt.icon}</div>
                                    <div className="text-[8px] font-bold truncate mt-0.5">{opt.shortLabel}</div>
                                    <div className={`text-[7px] font-semibold mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                      {isGradeAllowed ? `Lvl ${opt.tierLevel}` : '🔒'}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Grade Details Summary */}
                            <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800/80 text-[8px] space-y-1">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="text-slate-300 font-bold">{currentGradeOpt.label}</span>
                                <span className="text-amber-400 font-mono">Inherent Seat: {currentGradeOpt.seatStyleName}</span>
                              </div>
                              <div className="text-slate-400 line-clamp-2">
                                {currentGradeOpt.desc}
                              </div>
                              <div className="text-[7.5px] text-slate-500 font-mono">
                                Under-Seat: {currentGradeOpt.underSeatStructure}
                              </div>
                            </div>

                            {/* Municipal Rating Drop Penalty Live Alert */}
                            {isMunicipalActive ? (
                              <div className="p-2 rounded bg-amber-950/60 border border-amber-500/50 text-[8.5px] text-amber-200 flex items-start gap-1.5 leading-snug">
                                <span className="text-amber-400 text-xs">⚠️</span>
                                <div>
                                  <span className="font-bold text-amber-300 uppercase tracking-wide">Municipal Penalty Gate Active:</span>
                                  <span> Temporary scaffolding and rustic timber stands cap overall stadium certification at Municipal Level until all stands reach Brutalist (Grade 2) or higher.</span>
                                </div>
                              </div>
                            ) : (
                              <div className="px-2 py-1 rounded bg-slate-900/60 border border-slate-800/70 text-[8px] text-emerald-400 flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1">
                                  <span>✅</span>
                                  <span>Permitted for Professional League Certification</span>
                                </span>
                                <span className="text-slate-400 font-mono">Rank: Level {currentGradeOpt.seatLevel}</span>
                              </div>
                            )}

                            {/* 3-Element Color Customization Engine */}
                            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                                <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">
                                  🎨 3-ELEMENT COLOR ENGINE ({currentGradeOpt.shortLabel.toUpperCase()})
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono">8 Prescribed Palette Choices</span>
                              </div>

                              {([
                                { key: 'element1' as const, name: currentGradeOpt.element1Name, desc: currentGradeOpt.element1Desc },
                                { key: 'element2' as const, name: currentGradeOpt.element2Name, desc: currentGradeOpt.element2Desc },
                                { key: 'element3' as const, name: currentGradeOpt.element3Name, desc: currentGradeOpt.element3Desc },
                              ]).map(({ key, name, desc }) => {
                                const activeColor: PaletteColor = standColors[key] || 'raw';
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-[8px]">
                                      <span className="font-bold text-slate-300">{name}:</span>
                                      <span className="text-slate-500 truncate max-w-[180px]">{desc}</span>
                                    </div>
                                    <div className="grid grid-cols-8 gap-1">
                                      {PALETTE_COLORS.map((pc) => {
                                        const isColorSelected = activeColor === pc.id;
                                        return (
                                          <button
                                            key={pc.id}
                                            onClick={() => {
                                              audio.playKick(0.15);
                                              updateCurrentStand({
                                                gradeColors: {
                                                  ...(activeStandConfig.gradeColors || {}),
                                                  [key]: pc.id,
                                                },
                                              });
                                            }}
                                            title={`${name}: ${pc.label}`}
                                            className={`h-5 rounded flex items-center justify-center border transition-all ${
                                              isColorSelected
                                                ? 'border-amber-400 ring-2 ring-amber-400 scale-105 z-10 font-bold shadow-sm'
                                                : 'border-slate-700 hover:border-slate-500'
                                            }`}
                                            style={{
                                              backgroundColor: pc.id === 'raw' ? '#334155' : pc.hex,
                                            }}
                                          >
                                            {pc.id === 'raw' && (
                                              <span className="text-[7px] text-white font-black uppercase">RAW</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE T9: VIP HOSPITALITY SUITE, EXECUTIVE AMENITIES & FIFA WORLD GATE */}
                      {/* ----------------------------------------------------------- */}
                      {(!isYouthVenue || stadium.youthSpecialUnlocked) && (() => {
                        const isEligible = isStandVipEligible(activeStandConfig, stadium);
                        const hasVip = hasStandVipSeats(activeStandConfig, stadium);
                        const currentGrade = resolveStandArchitecturalGrade(activeStandConfig, stadium);
                        const isStacked = isStackedWallStand(activeStandConfig);
                        const isTiered = activeStandConfig.type === 'tiered';
                        const vipIdx = getEffectiveVipTierIndex(activeStandConfig);
                        const currentVipSeat = activeStandConfig.vipSeatType || 'plush_armchair';

                        if (!isEligible) {
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-red-900/40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🔒</span>
                                  <span>VIP HOSPITALITY & EXECUTIVE SUITE (T9)</span>
                                </label>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-950/60 text-red-300 border border-red-800/40">
                                  LOCKED (GRADE 3+ REQUIRED)
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                                VIP Seats and executive hospitality amenities require <strong className="text-amber-300">Grade 3+ (Industrial, Victorian, or Modern)</strong>. Current grade is <span className="text-red-400 font-bold uppercase">{currentGrade}</span> (Municipal/Brutalist are strictly prohibited from executive VIP tiers).
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/40 space-y-2.5 shadow-lg shadow-amber-950/20">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🥂</span>
                                <span>VIP HOSPITALITY & EXECUTIVE SUITE (T9)</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                                  hasVip
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {hasVip ? 'LEVEL 6 • VIP' : 'STANDARD TIER'}
                                </span>
                              </div>
                            </div>

                            {/* 1. VIP Seats Toggle */}
                            <div className="p-2 rounded-md bg-slate-900/90 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-200">
                                    {isStacked ? 'EXECUTIVE VIEWING MEZZANINE' : 'VIP SEATS & BALUSTRADE'}
                                  </div>
                                  <div className="text-[8.5px] text-slate-400">
                                    {isStacked
                                      ? 'Converts upper coliseum wall deck to Level 6 executive mezzanine balcony'
                                      : 'Converts selected deck to Level 6 luxury armchairs & gold-stanchion glass'}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    audio.playKick(0.25);
                                    const nextVip = !activeStandConfig.hasVipSeats;
                                    let updateObj: any = { hasVipSeats: nextVip };
                                    if (nextVip && isTiered && (activeStandConfig.tierCount || 0) > 3) {
                                      // Phase T9.1: Clamped to 3 tiers maximum when VIP is active
                                      updateObj.tierCount = 3;
                                      if (activeStandConfig.tiers && activeStandConfig.tiers.length > 3) {
                                        updateObj.tiers = activeStandConfig.tiers.slice(0, 3);
                                      }
                                    }
                                    updateCurrentStand(updateObj);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[9px] font-black border transition-all ${
                                    activeStandConfig.hasVipSeats
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                  }`}
                                >
                                  {activeStandConfig.hasVipSeats ? 'VIP SEATS ON' : 'DISABLED'}
                                </button>
                              </div>

                              {/* If VIP Seats active: Tier placement and seat style selector */}
                              {activeStandConfig.hasVipSeats && (
                                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                                  {/* Tier Level Placement (only for tiered stands) */}
                                  {isTiered && (
                                    <div className="flex items-center justify-between text-[9px]">
                                      <span className="text-slate-400 font-bold uppercase">VIP TIER PLACEMENT:</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            audio.playKick(0.18);
                                            updateCurrentStand({ vipTierIndex: 1 });
                                          }}
                                          className={`px-2 py-0.5 rounded font-bold border ${
                                            vipIdx === 1
                                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                                              : 'bg-slate-800 text-slate-300 border-slate-700'
                                          }`}
                                        >
                                          Deck 2 (Level 2)
                                        </button>
                                        {(activeStandConfig.tierCount || 2) >= 3 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              audio.playKick(0.18);
                                              updateCurrentStand({ vipTierIndex: 2 });
                                            }}
                                            className={`px-2 py-0.5 rounded font-bold border ${
                                              vipIdx === 2
                                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                                : 'bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                          >
                                            Deck 3 (Level 3)
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* VIP Seat Archetype (3 Exclusive Styles) */}
                                  <div className="space-y-1">
                                    <div className="text-[9px] text-slate-400 font-bold uppercase">VIP SEAT TYPOLOGY:</div>
                                    <div className="grid grid-cols-3 gap-1">
                                      {VIP_SEAT_OPTIONS.map((opt) => {
                                        const isSelected = currentVipSeat === opt.id;
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                              audio.playKick(0.2);
                                              updateCurrentStand({ vipSeatType: opt.id });
                                            }}
                                            className={`p-1.5 rounded border text-left text-[8.5px] transition-all ${
                                              isSelected
                                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                                            }`}
                                          >
                                            <div className="font-bold flex items-center gap-1">
                                              <span>{opt.icon}</span>
                                              <span className="truncate">{opt.label}</span>
                                            </div>
                                            <div className={`text-[7.5px] truncate mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                              {opt.desc}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2. Executive Concourse Buffet Lounge ("VIP Zone") */}
                            <div className="p-2 rounded-md bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-slate-200 flex items-center gap-1">
                                  <span>🍽️</span>
                                  <span>EXECUTIVE VIP ZONE (BUFFET LOUNGE)</span>
                                </div>
                                <div className="text-[8.5px] text-slate-400">
                                  Embedded middle concourse buffet pavilion (-5% raw capacity, warm amber glow & silhouettes)
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.22);
                                  updateCurrentStand({ hasVipZone: !activeStandConfig.hasVipZone });
                                }}
                                className={`px-2.5 py-1 rounded text-[9px] font-black border transition-all ${
                                  activeStandConfig.hasVipZone
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                              >
                                {activeStandConfig.hasVipZone ? 'VIP ZONE ON' : 'DISABLED'}
                              </button>
                            </div>

                            {/* 3. Transmission Area Media & TV Broadcast Box */}
                            <div className="p-2 rounded-md bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-slate-200 flex items-center gap-1">
                                  <span>📡</span>
                                  <span>TRANSMISSION AREA (TV BROADCAST BOX)</span>
                                </div>
                                <div className="text-[8.5px] text-slate-400">
                                  Centerline commentary box with observation windows, TV camera mounts, and rooftop antenna mast
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.22);
                                  updateCurrentStand({ hasTransmissionArea: !activeStandConfig.hasTransmissionArea });
                                }}
                                className={`px-2.5 py-1 rounded text-[9px] font-black border transition-all ${
                                  activeStandConfig.hasTransmissionArea
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                              >
                                {activeStandConfig.hasTransmissionArea ? 'MEDIA ON' : 'DISABLED'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE T5: PITCHSIDE TIER SAFETY FENCE & BARRIERS (7 TYPOLOGIES) */}
                      {/* ----------------------------------------------------------- */}
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>🛡️ PITCHSIDE SAFETY FENCE / BARRIER (T5)</span>
                          </label>
                          <button
                            onClick={() => {
                              audio.playKick(0.25);
                              const currentBarrier = resolvePitchsideBarrier(activeStandConfig, stadium);
                              setStadium((prev) => {
                                const newStands = { ...prev.stands };
                                (Object.keys(newStands) as StandPosition[]).forEach((pos) => {
                                  if (newStands[pos]) {
                                    newStands[pos] = { ...newStands[pos], pitchsideBarrier: currentBarrier };
                                  }
                                });
                                return { ...prev, pitchsideBarrier: currentBarrier, stands: newStands };
                              });
                            }}
                            className="px-2 py-0.5 rounded text-[8px] font-bold border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                            title="Apply active barrier style to all stands and entire stadium"
                          >
                            ⚡ APPLY TO ALL
                          </button>
                        </div>

                        {/* Resolved barrier badge & description */}
                        {(() => {
                          const activeBarrier = resolvePitchsideBarrier(activeStandConfig, stadium);
                          const activeOpt = PITCHSIDE_BARRIER_OPTIONS.find((o) => o.id === activeBarrier) || PITCHSIDE_BARRIER_OPTIONS[1];
                          return (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/90 rounded border border-slate-800 text-[9px]">
                              <span className="text-base">{activeOpt.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-white truncate">{activeOpt.label}</span>
                                  <span className="text-[8px] px-1 py-0.2 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                    {activeOpt.heightCategory}
                                  </span>
                                </div>
                                <p className="text-[8px] text-slate-400 truncate">{activeOpt.desc}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 7 Barrier Chips */}
                        <div className="grid grid-cols-2 gap-1">
                          {PITCHSIDE_BARRIER_OPTIONS.map((opt) => {
                            const activeBarrier = resolvePitchsideBarrier(activeStandConfig, stadium);
                            const isSelected = (activeStandConfig.pitchsideBarrier || activeBarrier) === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateCurrentStand({ pitchsideBarrier: opt.id });
                                }}
                                className={`p-1.5 rounded border text-left text-[9px] transition-all ${
                                  isSelected
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-sm'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                                title={opt.desc}
                              >
                                <div className="font-bold truncate flex items-center justify-between gap-1">
                                  <span className="flex items-center gap-1 truncate">
                                    <span>{opt.icon}</span>
                                    <span className="truncate">{opt.label}</span>
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE T11: UNIFIED GRANDSTAND STAIRS & 3-VOMITORY TUNNEL ARCHITECTURES */}
                      {/* ----------------------------------------------------------- */}
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>🚪</span>
                            <span>VOMITORY & CIRCULATION ARCHITECTURE (T11)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              audio.playKick(0.25);
                              const currentVom = resolveVomitoryArchitecture(activeStandConfig, stadium);
                              setStadium((prev) => {
                                const newStands = { ...prev.stands };
                                (Object.keys(newStands) as StandPosition[]).forEach((pos) => {
                                  if (newStands[pos]) {
                                    newStands[pos] = { ...newStands[pos], vomitoryArchitecture: currentVom };
                                  }
                                });
                                return { ...prev, vomitoryArchitecture: currentVom, stands: newStands };
                              });
                            }}
                            className="px-2 py-0.5 rounded text-[8px] font-bold border border-amber-500/40 bg-amber-950/60 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all"
                            title="Apply active vomitory architecture to all stands across the stadium"
                          >
                            ⚡ APPLY TO ALL
                          </button>
                        </div>

                        {/* Active Vomitory Preview Banner */}
                        {(() => {
                          const activeVom = resolveVomitoryArchitecture(activeStandConfig, stadium);
                          const activeOpt = VOMITORY_ARCHITECTURE_OPTIONS.find((o) => o.id === activeVom) || VOMITORY_ARCHITECTURE_OPTIONS[0];
                          return (
                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 rounded border border-slate-800 text-[9px]">
                              <span className="text-xl">{activeOpt.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-white truncate">{activeOpt.label}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase border font-bold ${
                                    activeOpt.accessFlow === 'descending'
                                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                                      : activeOpt.accessFlow === 'ascending'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : 'bg-purple-950 text-purple-300 border-purple-800'
                                  }`}>
                                    {activeOpt.accessFlow} flow
                                  </span>
                                </div>
                                <p className="text-[8.5px] text-slate-400 leading-snug truncate">{activeOpt.desc}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 3 Vomitory Architecture Buttons */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {VOMITORY_ARCHITECTURE_OPTIONS.map((opt) => {
                            const activeVom = resolveVomitoryArchitecture(activeStandConfig, stadium);
                            const isSelected = (activeStandConfig.vomitoryArchitecture || activeVom) === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateCurrentStand({ vomitoryArchitecture: opt.id });
                                }}
                                className={`p-1.5 rounded border text-left text-[9px] transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                                title={opt.desc}
                              >
                                <div className="flex items-center gap-1 font-bold truncate">
                                  <span>{opt.icon}</span>
                                  <span className="truncate">{opt.shortLabel}</span>
                                </div>
                                <span className={`text-[7.5px] mt-1 font-mono uppercase truncate ${
                                  isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
                                }`}>
                                  {opt.accessFlow}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Unified Grandstand Stairs & Inter-Tier Staggering Indicator */}
                        <div className="px-2 py-1.5 bg-slate-900/60 rounded border border-slate-800/80 text-[8.5px] text-slate-400 flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-yellow-400">⚡</span>
                            <span className="font-semibold text-slate-300 truncate">UNIFIED STAIR CIRCULATION:</span>
                            <span className="text-yellow-300/90 font-mono">2 STAIRS / TIER</span>
                          </div>
                          <span className="text-[7.5px] px-1 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/40 uppercase font-black shrink-0">
                            STAGGERED
                          </span>
                        </div>
                      </div>

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE ST4: ROOF CANOPY, EAVE OVERHANG & 3-LEVEL CUSTOMIZER */}
                      {/* ----------------------------------------------------------- */}
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>🏛️ ROOF CANOPY & EAVE OVERHANG (ST4)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isYouthVenue && !stadium.youthSpecialUnlocked}
                              onClick={() => {
                                if (isYouthVenue && !stadium.youthSpecialUnlocked) return;
                                audio.playKick(0.2);
                                updateCurrentStand({ hasRoof: activeStandConfig.hasRoof === false ? true : false });
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                isYouthVenue && !stadium.youthSpecialUnlocked
                                  ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-50 cursor-not-allowed'
                                  : activeStandConfig.hasRoof !== false
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {isYouthVenue && !stadium.youthSpecialUnlocked
                                ? 'NO ROOF 🔒'
                                : activeStandConfig.hasRoof !== false ? 'ROOF ON' : 'NO ROOF'}
                            </button>
                          </div>
                        </div>

                        {activeStandConfig.hasRoof !== false && (!isYouthVenue || stadium.youthSpecialUnlocked) && (
                          <div className="space-y-2">
                            {/* 1. Style */}
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">
                                {isRoundOrOvalShape(stadium.shape) ? 'CONTINUOUS ROOF STYLE:' : 'ROOF ARCHITECTURE STYLE:'}
                              </span>
                              <div className="grid grid-cols-2 gap-1">
                                {getRoofStylesForShape(stadium.shape).map((st) => (
                                  <button
                                    key={st.id}
                                    onClick={() => {
                                      audio.playKick(0.2);
                                      updateCurrentStand({ roofStyle: st.id });
                                    }}
                                    className={`p-1.5 rounded border text-left text-[9px] transition-all ${
                                      (activeStandConfig.roofStyle || stadium.roof?.style || (isRoundOrOvalShape(stadium.shape) ? 'spoke_wheel_tension' : 'cantilever_truss')) === st.id
                                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                                    }`}
                                  >
                                    <div className="font-bold truncate">{st.label}</div>
                                    <div className="text-[7px] text-slate-500 truncate">{st.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 2. Material */}
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">CANOPY DECK MATERIAL:</span>
                              <div className="grid grid-cols-4 gap-1">
                                {getRoofMaterialsForShape(stadium.shape).map((mat) => (
                                  <button
                                    key={mat.id}
                                    onClick={() => {
                                      audio.playKick(0.2);
                                      updateCurrentStand({ roofMaterial: mat.id });
                                    }}
                                    className={`px-1 py-1 rounded text-center text-[8px] font-bold border truncate ${
                                      (activeStandConfig.roofMaterial || stadium.roof?.material || (isRoundOrOvalShape(stadium.shape) ? 'ptfe_fabric' : 'corrugated_steel')) === mat.id
                                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                    }`}
                                    title={mat.desc}
                                  >
                                    {mat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 3. Fascia Border / Inner Halo Ribbon */}
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">
                                {isRoundOrOvalShape(stadium.shape) ? 'INNER OCULAR RIM & HALO BOARD:' : 'FASCIA BORDER & TRIM:'}
                              </span>
                              <div className="grid grid-cols-2 gap-1">
                                {getRoofBordersForShape(stadium.shape).map((b) => (
                                  <button
                                    key={b.id}
                                    onClick={() => {
                                      audio.playKick(0.2);
                                      updateCurrentStand({ roofBorder: b.id });
                                    }}
                                    className={`px-1.5 py-1 rounded text-left text-[8px] font-bold border truncate ${
                                      (activeStandConfig.roofBorder || stadium.roof?.border || (isRoundOrOvalShape(stadium.shape) ? 'video_halo_board' : 'painted_club_fascia')) === b.id
                                        ? 'bg-indigo-500 text-white border-indigo-300 font-black'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                    }`}
                                    title={b.desc}
                                  >
                                    {b.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 4. Stand Cutaway Override */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase">
                                <span>STAND CUTAWAY OVERRIDE:</span>
                                <span className="text-cyan-300">
                                  {activeStandConfig.roofCutaway || `GLOBAL (${stadium.roofCutaway || 'PARTIAL'})`}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {[
                                  { id: undefined, label: 'Global' },
                                  { id: 'hidden', label: 'Hidden (0%)' },
                                  { id: 'partial', label: 'Edge (50%)' },
                                  { id: 'full', label: 'Full (100%)' },
                                ].map((c) => (
                                  <button
                                    key={c.label}
                                    onClick={() => {
                                      audio.playKick(0.2);
                                      updateCurrentStand({ roofCutaway: c.id as RoofCutawayMode | undefined });
                                    }}
                                    className={`py-0.5 rounded text-center text-[8px] font-bold border truncate ${
                                      activeStandConfig.roofCutaway === c.id
                                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                        : 'bg-slate-900 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 5. APPLY TO ALL 8 STANDS */}
                            <button
                              onClick={() => {
                                audio.playKick(0.25);
                                const roofStyle = activeStandConfig.roofStyle || stadium.roof?.style || 'cantilever_truss';
                                const roofMaterial = activeStandConfig.roofMaterial || stadium.roof?.material || 'corrugated_steel';
                                const roofBorder = activeStandConfig.roofBorder || stadium.roof?.border || 'painted_club_fascia';
                                const hasRoof = activeStandConfig.hasRoof !== false;
                                const standKeys = ['west', 'east', 'north', 'south', 'corner_nw', 'corner_ne', 'corner_se', 'corner_sw'] as const;
                                const updatedStands = { ...stadium.stands };
                                standKeys.forEach((key) => {
                                  const existing = updatedStands[key];
                                  if (existing && existing.type !== 'none' && existing.type !== 'no_stand') {
                                    updatedStands[key] = {
                                      ...existing,
                                      hasRoof,
                                      roofStyle,
                                      roofMaterial,
                                      roofBorder,
                                    };
                                  }
                                });
                                setStadium({
                                  ...stadium,
                                  roof: {
                                    ...(stadium.roof || getDefaultRoofConfig()),
                                    style: roofStyle,
                                    material: roofMaterial,
                                    border: roofBorder,
                                  },
                                  stands: updatedStands,
                                });
                              }}
                              className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 text-[9px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>⚡</span>
                              <span>APPLY ROOF ARCHITECTURE TO ALL 8 STANDS</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* If No Stand: 15.7.1 Contextual Backdrop, Universal Wall, 15.7.2 Perimeter Finish & 15.7.3 Grassroots Fans */}
                  {(activeStandConfig?.type === 'none' || activeStandConfig?.type === 'no_stand') ? (
                    <div className="space-y-3">
                      {/* 15.7.1 Contextual Backdrop */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          NO-STAND CONTEXTUAL BACKDROP (PHASE 15.7.1)
                        </label>
                        <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto">
                          {getBackdropsForSurroundings(stadium.surroundings).map((bd) => (
                            <button
                              key={bd.id}
                              onClick={() => {
                                audio.playKick(0.2);
                                updateCurrentStand({ backdrop: bd.id, noStandBackdrop: bd.id });
                              }}
                              className={`w-full p-1.5 rounded border text-left text-[10px] font-bold flex items-center justify-between transition-all ${
                                (activeStandConfig.backdrop === bd.id || activeStandConfig.noStandBackdrop === bd.id)
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-md'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                              }`}
                            >
                              <span>{bd.label}</span>
                              {(activeStandConfig.backdrop === bd.id || activeStandConfig.noStandBackdrop === bd.id) && (
                                <Check className="w-3.5 h-3.5 text-slate-950" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* If Backdrop is Wall: Wall Height & Material */}
                      {(activeStandConfig.backdrop === 'wall' || activeStandConfig.noStandBackdrop === 'wall') && (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-500/50 space-y-2">
                          <label className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                            🧱 UNIVERSAL PERIMETER WALL OPTIONS
                          </label>
                          {/* Wall Size */}
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">WALL HEIGHT:</span>
                            <div className="grid grid-cols-3 gap-1">
                              {(['low', 'medium', 'tall'] as WallSize[]).map((sz) => (
                                <button
                                  key={sz}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateCurrentStand({
                                      wallPerimeter: {
                                        size: sz,
                                        material: activeStandConfig.wallPerimeter?.material || 'brick',
                                      },
                                    });
                                  }}
                                  className={`py-1 rounded text-center text-[9px] font-bold uppercase border ${
                                    (activeStandConfig.wallPerimeter?.size || 'medium') === sz
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                      : 'bg-slate-900 text-slate-400 border-slate-800'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Wall Material */}
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">WALL FINISH MATERIAL:</span>
                            <div className="grid grid-cols-3 gap-1">
                              {(
                                [
                                  { id: 'brick', label: 'Brick' },
                                  { id: 'concrete', label: 'Concrete' },
                                  { id: 'stone', label: 'Stone' },
                                  { id: 'timber', label: 'Timber' },
                                  { id: 'metal_cladding', label: 'Metal' },
                                ] as { id: WallMaterial; label: string }[]
                              ).map((mat) => (
                                <button
                                  key={mat.id}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    updateCurrentStand({
                                      wallPerimeter: {
                                        size: activeStandConfig.wallPerimeter?.size || 'medium',
                                        material: mat.id,
                                      },
                                    });
                                  }}
                                  className={`py-1 rounded text-center text-[9px] font-bold uppercase border ${
                                    (activeStandConfig.wallPerimeter?.material || 'brick') === mat.id
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                      : 'bg-slate-900 text-slate-400 border-slate-800'
                                  }`}
                                >
                                  {mat.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PHASE A2 Contextual Perimeter Enclosure Suite */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                            CONTEXTUAL PERIMETER ENCLOSURE (PHASE A2)
                          </label>
                          <span className="text-[9px] text-slate-500 uppercase font-mono">
                            {stadium.surroundings.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {getContextualPerimeters(stadium.surroundings, stadium.grounds).map((p) => {
                            const isSelected = (activeStandConfig.perimeterFinish || getDefaultPerimeterForContext(stadium.surroundings, stadium.grounds)) === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  audio.playKick(0.2);
                                  updateCurrentStand({ perimeterFinish: p.id });
                                }}
                                className={`w-full p-2 rounded border text-left text-[10px] font-bold transition-all ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-sm">{p.icon}</span>
                                    <span>{p.label}</span>
                                  </span>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
                                  )}
                                </div>
                                <div className={`text-[8.5px] mt-0.5 line-clamp-1 ${
                                  isSelected ? 'text-slate-900/80 font-medium' : 'text-slate-500 font-normal'
                                }`}>
                                  {p.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 15.7.3 Grassroots Fan Presence */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200 text-[10px] uppercase flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>GRASSROOTS SUPPORTERS (15.7.3)</span>
                          </div>
                          <div className="text-[9px] text-slate-500">
                            Casual fans leaning on barrier with caps, scarves & beers
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            audio.playKick(0.2);
                            updateCurrentStand({ hasGrassrootsFans: activeStandConfig.hasGrassrootsFans === false ? true : false });
                          }}
                          className={`px-3 py-1 rounded font-bold text-[10px] border transition-all ${
                            activeStandConfig.hasGrassrootsFans !== false
                              ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {activeStandConfig.hasGrassrootsFans !== false ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stand Architectural Grade (5 Grades) */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          ARCHITECTURAL GRADE & FINISH
                        </label>
                        <div className="space-y-1">
                          {(
                            [
                              { id: 'grade1_municipal', arch: 'municipal', label: 'Grade 1: Municipal (Weathered Cinder Block / Timber)' },
                              { id: 'grade2_classic', arch: 'brutalist', label: 'Grade 2: Classic / Brutalist (Red-Brick or Concrete)' },
                              { id: 'grade3_industrial', arch: 'industrial', label: 'Grade 3: Industrial (Corrugated Heavy Steel)' },
                              { id: 'grade4_modern', arch: 'victorian', label: 'Grade 4: Victorian / Modern (Cast Iron & Pre-Cast)' },
                              { id: 'grade5_futuristic', arch: 'modern', label: 'Grade 5: Modern Elite (Aero-Aluminum & LED)' },
                            ] as { id: StandGrade; arch: ArchitecturalGrade; label: string }[]
                          ).map((g) => {
                            const isAllowed = getAllowedGradesForCategory(stadiumCategory, stadium).includes(g.arch);
                            return (
                            <button
                              key={g.id}
                              disabled={!isAllowed}
                              onClick={() => isAllowed && updateCurrentStand({ grade: g.id, architecturalGrade: g.arch })}
                              className={`w-full p-1.5 rounded border text-left text-[10px] font-bold transition-all ${
                                !isAllowed
                                  ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-35 cursor-not-allowed'
                                  : activeStandConfig?.grade === g.id
                                  ? 'border-amber-400 bg-amber-950/50 text-amber-200'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {g.label} {!isAllowed && '🔒'}
                            </button>
                          );})}
                        </div>
                      </div>

                      {/* Roof Inspector */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200 text-[10px] uppercase">
                            ROOF CANOPY
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {isYouthVenue && !stadium.youthSpecialUnlocked
                              ? 'Disabled in standard Youth venues'
                              : `Coverage: ${Math.round((activeStandConfig?.roofCoverage || 0.8) * 100)}%`}
                          </div>
                        </div>
                        <button
                          disabled={isYouthVenue && !stadium.youthSpecialUnlocked}
                          onClick={() => {
                            if (isYouthVenue && !stadium.youthSpecialUnlocked) return;
                            updateCurrentStand({ hasRoof: !activeStandConfig?.hasRoof });
                          }}
                          className={`px-3 py-1 rounded font-bold text-[10px] border ${
                            isYouthVenue && !stadium.youthSpecialUnlocked
                              ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                              : activeStandConfig?.hasRoof
                              ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {isYouthVenue && !stadium.youthSpecialUnlocked
                            ? 'NO ROOF 🔒'
                            : activeStandConfig?.hasRoof ? 'ROOF COVERED' : 'OPEN SKY'}
                        </button>
                      </div>

                      {/* Stand Primary & Secondary Seat Colors (Independent) */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          STAND SEAT COLORS (INDEPENDENT)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold">PRIMARY COLOR:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={activeStandConfig?.primaryColor || HOME_KIT.primaryColor}
                                onChange={(e) => updateCurrentStand({ primaryColor: e.target.value })}
                                className="w-7 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
                              />
                              <input
                                type="text"
                                value={activeStandConfig?.primaryColor || HOME_KIT.primaryColor}
                                onChange={(e) => updateCurrentStand({ primaryColor: e.target.value })}
                                className="w-full px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono uppercase text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold">SECONDARY COLOR:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={activeStandConfig?.secondaryColor || HOME_KIT.secondaryColor}
                                onChange={(e) => updateCurrentStand({ secondaryColor: e.target.value })}
                                className="w-7 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
                              />
                              <input
                                type="text"
                                value={activeStandConfig?.secondaryColor || HOME_KIT.secondaryColor}
                                onChange={(e) => updateCurrentStand({ secondaryColor: e.target.value })}
                                className="w-full px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono uppercase text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ----------------------------------------------------------- */}
                      {/* PHASE T6: ROUND / OVAL ARCHITECTURAL GRADE & 3-ELEMENT COLORS */}
                      {/* ----------------------------------------------------------- */}
                      {(() => {
                        const currentArchGrade = resolveStandArchitecturalGrade(activeStandConfig, stadium);
                        const currentGradeOpt = ARCHITECTURAL_GRADE_OPTIONS.find((o) => o.id === currentArchGrade) || ARCHITECTURAL_GRADE_OPTIONS[0];
                        const standColors: GradeElementColors = activeStandConfig.gradeColors || stadium.gradeColors || {};
                        const isMunicipalActive = currentArchGrade === 'municipal';

                        return (
                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🏛️</span>
                                <span>COLISEUM ARCHITECTURAL GRADE</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                  GRADE {currentGradeOpt.tierLevel} • LEVEL {currentGradeOpt.seatLevel}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {currentGradeOpt.seatStyleName}
                                </span>
                              </div>
                            </div>

                            {/* 5-Grade Cards */}
                            <div className="grid grid-cols-5 gap-1">
                              {ARCHITECTURAL_GRADE_OPTIONS.map((opt) => {
                                const isSelected = currentArchGrade === opt.id;
                                const isGradeAllowed = getAllowedGradesForCategory(stadiumCategory, stadium).includes(opt.id);
                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!isGradeAllowed}
                                    onClick={() => {
                                      if (!isGradeAllowed) return;
                                      audio.playKick(0.2);
                                      updateCurrentStand({
                                        architecturalGrade: opt.id,
                                        grade: opt.id === 'municipal' ? 'grade1_municipal'
                                          : opt.id === 'brutalist' ? 'grade2_classic'
                                          : opt.id === 'industrial' ? 'grade3_industrial'
                                          : opt.id === 'victorian' ? 'grade4_modern'
                                          : 'grade5_futuristic',
                                        seatArchetype: opt.inherentSeatArchetype,
                                      });
                                    }}
                                    className={`p-1.5 rounded-md border text-center transition-all ${
                                      !isGradeAllowed
                                        ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-35 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md ring-1 ring-amber-300'
                                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                                    }`}
                                    title={isGradeAllowed ? `${opt.label}: ${opt.desc}` : `Locked in ${stadiumCategory} mode`}
                                  >
                                    <div className="text-sm">{opt.icon}</div>
                                    <div className="text-[8px] font-bold truncate mt-0.5">{opt.shortLabel}</div>
                                    <div className={`text-[7px] font-semibold mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                      {isGradeAllowed ? `Lvl ${opt.tierLevel}` : '🔒'}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Municipal Rating Drop Penalty Live Alert */}
                            {isMunicipalActive && (
                              <div className="p-2 rounded bg-amber-950/60 border border-amber-500/50 text-[8.5px] text-amber-200 flex items-start gap-1.5 leading-snug">
                                <span className="text-amber-400 text-xs">⚠️</span>
                                <div>
                                  <span className="font-bold text-amber-300 uppercase tracking-wide">Municipal Penalty Active:</span>
                                  <span> Scaffolding bowl caps overall stadium certification at Municipal Level until upgraded to Brutalist (Grade 2)+.</span>
                                </div>
                              </div>
                            )}

                            {/* 3-Element Color Customization Engine */}
                            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                                <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">
                                  🎨 3-ELEMENT COLOR ENGINE ({currentGradeOpt.shortLabel.toUpperCase()})
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono">8 Prescribed Palette Choices</span>
                              </div>

                              {([
                                { key: 'element1' as const, name: currentGradeOpt.element1Name, desc: currentGradeOpt.element1Desc },
                                { key: 'element2' as const, name: currentGradeOpt.element2Name, desc: currentGradeOpt.element2Desc },
                                { key: 'element3' as const, name: currentGradeOpt.element3Name, desc: currentGradeOpt.element3Desc },
                              ]).map(({ key, name, desc }) => {
                                const activeColor: PaletteColor = standColors[key] || 'raw';
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-[8px]">
                                      <span className="font-bold text-slate-300">{name}:</span>
                                      <span className="text-slate-500 truncate max-w-[180px]">{desc}</span>
                                    </div>
                                    <div className="grid grid-cols-8 gap-1">
                                      {PALETTE_COLORS.map((pc) => {
                                        const isColorSelected = activeColor === pc.id;
                                        return (
                                          <button
                                            key={pc.id}
                                            onClick={() => {
                                              audio.playKick(0.15);
                                              updateCurrentStand({
                                                gradeColors: {
                                                  ...(activeStandConfig.gradeColors || {}),
                                                  [key]: pc.id,
                                                },
                                              });
                                            }}
                                            title={`${name}: ${pc.label}`}
                                            className={`h-5 rounded flex items-center justify-center border transition-all ${
                                              isColorSelected
                                                ? 'border-amber-400 ring-2 ring-amber-400 scale-105 z-10 font-bold shadow-sm'
                                                : 'border-slate-700 hover:border-slate-500'
                                            }`}
                                            style={{
                                              backgroundColor: pc.id === 'raw' ? '#334155' : pc.hex,
                                            }}
                                          >
                                            {pc.id === 'raw' && (
                                              <span className="text-[7px] text-white font-black uppercase">RAW</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* STEP 3: DUGOUTS & ENTRANCE TUNNEL INSPECTOR (14.4.3)                */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 3 && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Dugout vs Tunnel vs Floodlights Sub-Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        audio.playKick(0.2);
                        setStep3SubTab('dugouts');
                      }}
                      className={`py-2 rounded text-center font-bold text-xs uppercase border transition-all flex items-center justify-center gap-1.5 ${
                        step3SubTab === 'dugouts'
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      <span className="truncate">DUGOUTS</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playKick(0.2);
                        setStep3SubTab('tunnel');
                      }}
                      className={`py-2 rounded text-center font-bold text-xs uppercase border transition-all flex items-center justify-center gap-1.5 ${
                        step3SubTab === 'tunnel'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span className="truncate">TUNNEL</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playKick(0.2);
                        setStep3SubTab('lighting');
                      }}
                      className={`py-2 rounded text-center font-bold text-xs uppercase border transition-all flex items-center justify-center gap-1.5 ${
                        step3SubTab === 'lighting'
                          ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="truncate">FLOODLIGHTS</span>
                    </button>
                  </div>

                  {/* DUGOUT BENCHES INSPECTOR */}
                  {step3SubTab === 'dugouts' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          BENCH TYPE (5 CANONICAL STYLES)
                        </label>
                        <div className="space-y-1">
                          {(
                            [
                              { id: 'recaro_racing', label: 'Recaro Racing Bucket Seats (English League / EWL Luxury)' },
                              { id: 'covered_sunken', label: 'Covered Sunken Dugout Trench (Acrylic Canopy Shield)' },
                              { id: 'classic_timber', label: 'Classic Timber Bench (Grassroots Slatted Wood)' },
                              { id: 'utilitarian_concrete', label: 'Utilitarian Concrete Bunker (Heavy Cast Cinder Block)' },
                              { id: 'folding_chairs', label: 'Pitch-Level Folding Chairs (Community Ground)' },
                            ] as { id: BenchType; label: string }[]
                          ).map((b) => {
                            const isDugoutAllowed = getAllowedDugoutsForCategory(stadiumCategory).includes(b.id);
                            return (
                            <button
                              key={b.id}
                              disabled={!isDugoutAllowed}
                              onClick={() => {
                                if (!isDugoutAllowed) return;
                                audio.playKick(0.2);
                                setStadium({
                                  ...stadium,
                                  dugouts: {
                                    ...(stadium.dugouts || {
                                      type: b.id,
                                      quality: 'modern',
                                      frameColor: '#0f172a',
                                      cushionColor: '#dc2626',
                                      shelterTint: 'rgba(15,23,42,0.9)',
                                      setbackDistance: 12,
                                    }),
                                    type: b.id,
                                  },
                                });
                              }}
                              className={`w-full p-2 rounded border text-left text-[10px] font-bold ${
                                !isDugoutAllowed
                                  ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-35 cursor-not-allowed'
                                  : stadium.dugouts?.type === b.id
                                  ? 'border-amber-400 bg-amber-950/50 text-amber-200'
                                  : 'border-slate-800 bg-slate-900 text-slate-400'
                              }`}
                            >
                              {b.label} {!isDugoutAllowed && '🔒'}
                            </button>
                          );})}
                        </div>
                      </div>

                      {/* Bench Quality Tier */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          BENCH QUALITY TIER
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['municipal', 'classic', 'modern', 'elite_vip'] as BenchQualityTier[]).map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                audio.playKick(0.2);
                                if (stadium.dugouts) {
                                  setStadium({
                                    ...stadium,
                                    dugouts: { ...stadium.dugouts, quality: q },
                                  });
                                }
                              }}
                              className={`py-1.5 rounded border text-center text-[9px] uppercase font-bold ${
                                stadium.dugouts?.quality === q
                                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {q.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PLAYER ENTRANCE TUNNEL INSPECTOR */}
                  {step3SubTab === 'tunnel' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          TUNNEL TYPE (5 CANONICAL PORTALS)
                        </label>
                        <div className="space-y-1">
                          {(
                            [
                              { id: 'inflatable_accordion', label: 'Inflatable Accordion Bellows (South American Style)' },
                              { id: 'modern_architectural', label: 'Modern Architectural Backlit LED Ribbon Tunnel' },
                              { id: 'subterranean_staircase', label: 'Subterranean Concrete Staircase (English Ground)' },
                              { id: 'direct_portal', label: 'Direct Pitch-Level Portal with Security Grille' },
                              { id: 'telescopic_canopy', label: 'Covered Telescopic Canopy on Sliding Tracks' },
                            ] as { id: TunnelType; label: string }[]
                          ).map((t) => {
                            const isTunnelAllowed = getAllowedTunnelsForCategory(stadiumCategory).includes(t.id);
                            return (
                            <button
                              key={t.id}
                              disabled={!isTunnelAllowed}
                              onClick={() => {
                                if (!isTunnelAllowed) return;
                                audio.playKick(0.2);
                                setStadium({
                                  ...stadium,
                                  tunnel: {
                                    ...(stadium.tunnel || {
                                      type: t.id,
                                      siting: 'center_main',
                                      primaryColor: '#2563eb',
                                      secondaryColor: '#ffffff',
                                    }),
                                    type: t.id,
                                  },
                                });
                              }}
                              className={`w-full p-2 rounded border text-left text-[10px] font-bold ${
                                !isTunnelAllowed
                                  ? 'border-slate-900 bg-slate-950 text-slate-600 opacity-35 cursor-not-allowed'
                                  : stadium.tunnel?.type === t.id
                                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                                  : 'border-slate-800 bg-slate-900 text-slate-400'
                              }`}
                            >
                              {t.label} {!isTunnelAllowed && '🔒'}
                            </button>
                          );})}
                        </div>
                      </div>

                      {/* Tunnel Siting */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          TUNNEL SITING & LOCATION
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { id: 'center_main', label: 'Center Main' },
                              { id: 'corner', label: 'Pitch Corner' },
                              { id: 'behind_goal', label: 'Behind Goal' },
                            ] as { id: TunnelSiting; label: string }[]
                          ).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                audio.playKick(0.2);
                                if (stadium.tunnel) {
                                  setStadium({
                                    ...stadium,
                                    tunnel: { ...stadium.tunnel, siting: s.id },
                                  });
                                }
                              }}
                              className={`py-1.5 rounded border text-center text-[10px] uppercase font-bold ${
                                stadium.tunnel?.siting === s.id
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CORNER FLOODLIGHT PLACEMENT & POWER MODE SUBSYSTEM (HOTFIX T14K) */}
                  {step3SubTab === 'lighting' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      {/* Floodlight Power Toggle (Supports No Lights in Youth/Community grounds) */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider block">
                          FLOODLIGHT INFRASTRUCTURE STATUS
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              audio.playKick(0.2);
                              setStadium(
                                sanitizeStadiumForCategory({
                                  ...stadium,
                                  lighting: {
                                    ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: 'noon' }),
                                    type: 'corner_pylons',
                                    pylonCount: 4,
                                    powerKw: 2000,
                                  },
                                })
                              );
                            }}
                            className={`p-2 rounded border text-left text-[10px] font-bold cursor-pointer ${
                              stadium.lighting?.type !== 'none'
                                ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <div>⚡ FLOODLIGHTS ON</div>
                            <div className="text-[8px] opacity-75">Allows Sunset & Night fixtures</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              audio.playKick(0.2);
                              setStadium(
                                sanitizeStadiumForCategory({
                                  ...stadium,
                                  lighting: {
                                    ...(stadium.lighting || { type: 'none', pylonCount: 0, powerKw: 0, timeOfDay: 'noon' }),
                                    type: 'none',
                                    pylonCount: 0,
                                    powerKw: 0,
                                  },
                                })
                              );
                            }}
                            className={`p-2 rounded border text-left text-[10px] font-bold cursor-pointer ${
                              stadium.lighting?.type === 'none'
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <div>☀️ NO LIGHTS (DAY ONLY)</div>
                            <div className="text-[8px] opacity-75">Dawn / Noon only; disables dusk/night</div>
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <label className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>CORNER FLOODLIGHT PLACEMENT (HOTFIX T14K)</span>
                          </label>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 font-bold uppercase font-mono">
                            {resolveCornerFloodlightPlacement(stadium).replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-[8.5px] text-slate-400 leading-relaxed">
                          Choose the structural anchoring and foundation typology for the 4-quadrant high-mast floodlight towers across all four corners.
                        </p>

                        <div className="space-y-1.5">
                          {CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.map((opt) => {
                            const currentPlacement = resolveCornerFloodlightPlacement(stadium);
                            const isSelected = currentPlacement === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  audio.playKick(0.2);
                                  setStadium({
                                    ...stadium,
                                    lighting: {
                                      ...(stadium.lighting || {
                                        type: 'corner_pylons',
                                        pylonCount: 4,
                                        powerKw: 2000,
                                        timeOfDay: 'night',
                                      }),
                                      cornerFloodlightPlacement: opt.id,
                                    },
                                  });
                                }}
                                className={`w-full p-2.5 rounded border text-left transition-all ${
                                  isSelected
                                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black shadow-md ring-1 ring-yellow-400'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{opt.icon}</span>
                                    <div>
                                      <div className="font-bold text-[10px]">{opt.label}</div>
                                      <div className={`text-[8px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                                        {opt.desc}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-slate-950 flex-shrink-0" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Technical Specs Callout */}
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1 text-[8px] text-slate-400">
                        <div className="flex items-center justify-between text-slate-300 font-bold">
                          <span>FLOODLIGHT TYPOLOGY FEATURES:</span>
                          <span className="text-amber-400 font-mono">18 High-Intensity Lamps / Bank</span>
                        </div>
                        <div>• <strong>Exterior Towers:</strong> 64px structural lattice steel on outer concourse plaza with heavy concrete footing plinths & safety ladder cages.</div>
                        <div>• <strong>Parapet Clusters:</strong> 36px compact coping-integrated light banks bolted into the corner roof / rim coping.</div>
                        <div>• <strong>Corner Ground Infill:</strong> 44px ground-level pylon inside open corner void, complete with electrical equipment shed & transformer box.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* STEP 4: STAND COMPLETION & SATISFACTION CONFIRMATION (14.4.4)      */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 4 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase border-b border-slate-800 pb-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>STRUCTURAL ARCHITECTURE SUMMARY</span>
                    </div>

                    {/* Phase T9.4: FIFA World Category Certification Banner */}
                    {isFifaWorldCertified(stadium) ? (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border-2 border-amber-400/80 flex items-center justify-between shadow-lg shadow-amber-500/10 animate-pulse">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md ring-2 ring-amber-300">
                            ⭐
                          </div>
                          <div>
                            <div className="font-['Outfit'] font-black text-xs sm:text-sm text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                              <span>WORLD TIER CERTIFIED</span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">WFA 5-STAR</span>
                            </div>
                            <div className="text-[9px] text-amber-200/80 font-mono">
                              Elite global venue qualification achieved: VIP Hospitality + Broadcast Center + VIP Concourse Lounge.
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono text-amber-300 uppercase font-bold tracking-widest block">STATUS</span>
                          <span className="text-xs font-black text-amber-400 font-mono">WORLD CLASS</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400">WFA World Tier Requirements:</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className={hasVipSeatsInStadium(stadium) ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasVipSeatsInStadium(stadium) ? '✓' : '✗'} VIP Seats
                          </span>
                          <span className={hasTransmissionAreaInStadium(stadium) ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasTransmissionAreaInStadium(stadium) ? '✓' : '✗'} Broadcast Box
                          </span>
                          <span className={hasVipZoneInStadium(stadium) ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasVipZoneInStadium(stadium) ? '✓' : '✗'} VIP Lounge
                          </span>
                          <span className={totalCapacity >= 45000 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {totalCapacity >= 45000 ? '✓' : '✗'} 45K+ Cap
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">SHAPE & SURROUNDINGS:</div>
                        <div className="font-bold text-white uppercase mt-0.5">{stadium.shape} • {stadium.surroundings}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">CALCULATED CAPACITY:</div>
                        <div className="font-bold text-amber-300 text-sm mt-0.5">{totalCapacity.toLocaleString()} SEATS</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">VIP HOSPITALITY SUITES:</div>
                        <div className="font-bold text-amber-300 uppercase mt-0.5">
                          {getStadiumTotalVipCapacity(stadium) > 0 ? (
                            <span>{getStadiumTotalVipCapacity(stadium).toLocaleString()} VIP SEATS</span>
                          ) : (
                            <span className="text-slate-400">NONE CONFIGURED</span>
                          )}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-500">CERTIFICATION RATING:</div>
                        <div className={`font-bold text-sm uppercase mt-0.5 flex items-center gap-1.5 ${
                          isFifaWorldCertified(stadium)
                            ? 'text-amber-400'
                            : penaltyActive
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}>
                          <span>{certRating.replace('_', ' ')}</span>
                          {isFifaWorldCertified(stadium) && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">WORLD</span>}
                          {penaltyActive && <span className="ml-1 text-[8px] text-amber-300 font-mono font-bold">(MUNICIPAL PENALTY)</span>}
                        </div>
                      </div>
                    </div>

                    {/* Lock Button */}
                    <button
                      onClick={() => {
                        audio.playKick(0.35);
                        setIsArchitectureLocked(true);
                        setCurrentStep(5);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>LOCK ARCHITECTURE & ADVANCE TO AESTHETICS ⏩</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* STEP 5: FULL-STADIUM PAN - SEAT COLOR, PATTERN & STYLES (14.4.5)   */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 5 && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Seat Pattern Selection */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      GRANDSTAND SEAT PATTERN
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'solid', label: 'Solid Color' },
                          { id: 'horizontalBands', label: 'Horizontal Bands' },
                          { id: 'verticalStripes', label: 'Vertical Stripes' },
                          { id: 'lowerUpper', label: 'Lower / Upper Decks' },
                          { id: 'perStand', label: 'Per Stand Division' },
                        ] as { id: SeatPattern; label: string }[]
                      ).map((pat) => (
                        <button
                          key={pat.id}
                          onClick={() => {
                            audio.playKick(0.2);
                            setStadium({
                              ...stadium,
                              seats: { ...stadium.seats, pattern: pat.id },
                            });
                          }}
                          className={`p-2 rounded border text-left font-bold text-[10px] ${
                            stadium.seats.pattern === pat.id
                              ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          {pat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phase T6: Inherent Seat Architecture Info (Hardware Pickers Removed) */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span>🪑</span>
                        <span>INHERENT SEAT HARDWARE ARCHITECTURE</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-400 uppercase font-black bg-cyan-950/50 border border-cyan-800">
                        LEVEL {getSeatLevelRank(resolveStandSeatArchetype(resolveStandArchitecturalGrade(stadium.stands?.west, stadium)))}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed">
                      Seat hardware is intrinsically coupled to each grandstand's Architectural Grade (Tablones for Municipal, Concrete Ledges for Brutalist, Industrial Flip-Seats for Industrial, Classical Theater for Victorian, and Ergonomic Modern Buckets for Modern).
                    </p>
                  </div>

                  {/* Primary & Accent Seat Colors */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      CLUB SEAT PALETTE
                    </label>
                    <div className="flex items-center gap-2">
                      {['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#7c3aed', '#ffffff', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            audio.playKick(0.2);
                            setStadium({
                              ...stadium,
                              seats: { ...stadium.seats, colors: [c, stadium.seats.colors[1] || '#ffffff'] },
                            });
                          }}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            stadium.seats.colors[0] === c ? 'scale-125 border-amber-400 ring-2 ring-amber-400' : 'border-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Casual Youth / Grassroots Spectator Mode Toggle */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-300 uppercase">
                        CASUAL YOUTH / GRASSROOTS SPECTATORS
                      </div>
                      <div className="text-[8.5px] text-slate-400">
                        Everyday hoodies, jackets & casual parent/academy attendance styling
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        audio.playKick(0.2);
                        setStadium({ ...stadium, isCasualYouthCrowd: !stadium.isCasualYouthCrowd });
                      }}
                      className={`px-3 py-1 rounded text-[9px] font-black uppercase border cursor-pointer shrink-0 ${
                        stadium.isCasualYouthCrowd
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {stadium.isCasualYouthCrowd ? 'CASUAL ON' : 'CLUB JERSEYS'}
                    </button>
                  </div>

                  {/* Phase A5.3: Pitch Apron Material & Infill */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      🏟️ PITCH APRON MATERIAL & INFILL (PHASE A5.3)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'artificial_turf' as ApronMaterial, label: 'Synthetic Turf', desc: 'Dual-tone emerald stripes & infill' },
                        { id: 'rubber_tartan' as ApronMaterial, label: 'Olympic Tartan Track', desc: '8-lane Olympic red running track' },
                        { id: 'heritage_red_brick' as ApronMaterial, label: 'Heritage Brick', desc: 'English Flemish-bond brick pavers' },
                        { id: 'concrete' as ApronMaterial, label: 'Brushed Concrete', desc: 'Precast pavers with expansion joints' },
                        { id: 'natural_grass' as ApronMaterial, label: 'Natural Grass', desc: 'Continuation of pitch grass' },
                        { id: 'asphalt' as ApronMaterial, label: 'Dark Asphalt', desc: 'Coarse aggregate perimeter tarmac' },
                      ].map((ap) => {
                        const isSelected = (stadium.apronMaterial || 'artificial_turf') === ap.id;
                        return (
                          <button
                            key={ap.id}
                            onClick={() => {
                              audio.playKick(0.2);
                              setStadium({ ...stadium, apronMaterial: ap.id });
                            }}
                            className={`p-1.5 rounded border text-left font-bold text-[10px] transition-all ${
                              isSelected
                                ? 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-sm'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-bold text-[9px]">{ap.label}</div>
                            <div className="text-[7.5px] text-slate-500 line-clamp-1">{ap.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* STEP 6: FLOODLIGHTS & FINAL REGISTRY SAVE (14.4.6)                  */}
              {/* ------------------------------------------------------------------- */}
              {/* ------------------------------------------------------------------- */}
              {/* STEP 6: FLOODLIGHTS & FINAL REGISTRY SAVE (14.4.6 & S5 WYSIWYG)     */}
              {/* ------------------------------------------------------------------- */}
              {currentStep === 6 && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Phase S5 Time of Day Lighting Director */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                        TIME-OF-DAY ILLUMINATION DIRECTOR (PHASE S5)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          audio.playKick(0.2);
                          const nextNone = stadium.lighting?.type !== 'none';
                          setStadium(
                            sanitizeStadiumForCategory({
                              ...stadium,
                              lighting: {
                                ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: 'noon' }),
                                type: nextNone ? 'none' : 'corner_pylons',
                                pylonCount: nextNone ? 0 : 4,
                                powerKw: nextNone ? 0 : 2000,
                              },
                            })
                          );
                        }}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border cursor-pointer ${
                          stadium.lighting?.type === 'none'
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:text-white'
                        }`}
                      >
                        {stadium.lighting?.type === 'none' ? 'NO LIGHTS (DAY ONLY)' : 'FLOODLIGHTS: ON'}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {(
                        [
                          { id: 'noon', label: '☀️ Noon', sub: 'Zenith Sun' },
                          { id: 'sunset', label: '🌅 Afternoon', sub: 'Golden Hour' },
                          { id: 'night', label: '🌙 Night', sub: 'Floodlights' },
                          { id: 'dawn', label: '🌄 Dawn', sub: 'Low East Sun' },
                        ] as { id: TimeOfDay; label: string; sub: string }[]
                      ).map((tod) => {
                        const isTodAllowed = allowedTimesForActiveStadium.includes(tod.id);
                        return (
                        <button
                          key={tod.id}
                          disabled={!isTodAllowed}
                          onClick={() => {
                            if (!isTodAllowed) return;
                            audio.playKick(0.2);
                            setStadium({
                              ...stadium,
                              lighting: {
                                ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: tod.id }),
                                timeOfDay: tod.id,
                              },
                            });
                          }}
                          title={!isTodAllowed ? 'Unavailable when No Lights mode is enabled' : tod.sub}
                          className={`p-2 rounded border text-left transition-all ${
                            !isTodAllowed
                              ? 'bg-slate-950 text-slate-700 border-slate-900 opacity-40 cursor-not-allowed'
                              : (stadium.lighting?.timeOfDay || 'noon') === tod.id
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[10px] font-bold">{tod.label} {!isTodAllowed && '🔒'}</div>
                          <div className="text-[7px] text-slate-500 mt-0.5">{tod.sub}</div>
                        </button>
                      );})}
                    </div>

                    {/* Dynamic Illumination & Architectural Roof Shadow Status (Phase S3 & S5) */}
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1.5 text-[9px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>ATMOSPHERIC COLOR GRADE:</span>
                        <span className="font-bold text-amber-300">
                          {(stadium.lighting?.timeOfDay || 'noon') === 'noon' && '☀️ Crisp High-Contrast Zenith Daylight'}
                          {(stadium.lighting?.timeOfDay || 'noon') === 'sunset' && '🌅 Warm Amber / Golden-Orange Horizon Wash'}
                          {(stadium.lighting?.timeOfDay || 'noon') === 'night' && '🌙 Indigo Nocturnal Tint + 4 Corner Floodlight Cones'}
                          {(stadium.lighting?.timeOfDay || 'noon') === 'dawn' && '🌄 Soft Lavender-Pink Low Morning Sun'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>ROOF PITCH SHADOW GEOMETRY:</span>
                        <span className="font-bold text-cyan-300">
                          {stadium.shape === 'round' && '⭕ Annular Circular Aperture with Radial Spokes'}
                          {stadium.shape === 'oval' && '🏟️ Elliptical Contour with Semicircular Endzones'}
                          {stadium.shape === 'square' && '🔲 90° Rectilinear Box with Cantilever Overhang'}
                          {stadium.shape === 'rectangular' && '📐 Linear Touchline & Goal-Line Roof Eaves'}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-500 italic">
                        {(stadium.lighting?.timeOfDay || 'noon') === 'night'
                          ? 'Zero direct sun shadows; 4-corner parabolic floodlights illuminate pitch and grandstands.'
                          : 'Architectural cast shadows calculate live sun azimuth & elevation across pitch grass and turf.'}
                      </div>
                    </div>
                  </div>

                  {/* Corner Floodlight Placement Typology Selector (Phase T14K) */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                        <span>🗼</span>
                        <span>CORNER FLOODLIGHT PLACEMENT (HOTFIX T14K)</span>
                      </label>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 font-bold uppercase font-mono">
                        {resolveCornerFloodlightPlacement(stadium).replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.map((opt) => {
                        const currentPlacement = resolveCornerFloodlightPlacement(stadium);
                        const isSelected = currentPlacement === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              audio.playKick(0.2);
                              setStadium({
                                ...stadium,
                                lighting: {
                                  ...(stadium.lighting || {
                                    type: 'corner_pylons',
                                    pylonCount: 4,
                                    powerKw: 2000,
                                    timeOfDay: 'night',
                                  }),
                                  cornerFloodlightPlacement: opt.id,
                                },
                              });
                            }}
                            className={`p-2 rounded border text-left transition-all ${
                              isSelected
                                ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black shadow-md ring-1 ring-yellow-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{opt.icon}</span>
                              <span className="font-bold text-[9px] truncate">{opt.label}</span>
                            </div>
                            <div className={`text-[7px] mt-0.5 truncate ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                              {opt.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PHASE ST4: GLOBAL ROOF ARCHITECTURE & 3-LEVEL SPECIFICATION */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">🏛️</span>
                        <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                          {isRoundOrOvalShape(stadium.shape)
                            ? 'CONTINUOUS COLISEUM ROOF SPECIFICATION (PHASE ST5)'
                            : 'ROOF ARCHITECTURE SPECIFICATION (PHASE ST4)'}
                        </label>
                      </div>
                      <button
                        disabled={isYouthVenue && !stadium.youthSpecialUnlocked}
                        onClick={() => {
                          if (isYouthVenue && !stadium.youthSpecialUnlocked) return;
                          audio.playKick(0.2);
                          const currentEnabled = stadium.roof?.enabled !== false;
                          const nextRoof = { ...(stadium.roof || getDefaultRoofConfig(stadium.shape)), enabled: !currentEnabled };
                          setStadium({
                            ...stadium,
                            roof: nextRoof,
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                          isYouthVenue && !stadium.youthSpecialUnlocked
                            ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-50 cursor-not-allowed'
                            : stadium.roof?.enabled !== false
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {isYouthVenue && !stadium.youthSpecialUnlocked
                          ? 'NO ROOF 🔒'
                          : stadium.roof?.enabled !== false ? 'ROOF ON' : 'NO ROOF'}
                      </button>
                    </div>

                    {stadium.roof?.enabled !== false && (!isYouthVenue || stadium.youthSpecialUnlocked) && (
                      <div className="space-y-2.5">
                        {/* Sims-Style Cutaway Toggler */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase">
                            <span>SIMS-STYLE CUTAWAY MODE:</span>
                            <span className="text-cyan-300">
                              {(stadium.roofCutaway || stadium.roof?.cutawayMode || 'partial').toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {ROOF_CUTAWAY_OPTIONS.map((c) => {
                              const isSelected = (stadium.roofCutaway || stadium.roof?.cutawayMode || 'partial') === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    const updatedRoof = { ...(stadium.roof || getDefaultRoofConfig(stadium.shape)), cutawayMode: c.id };
                                    setStadium({
                                      ...stadium,
                                      roofCutaway: c.id,
                                      roof: updatedRoof,
                                    });
                                  }}
                                  className={`p-1 rounded text-center text-[8px] font-bold border transition-all ${
                                    isSelected
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                  title={c.desc}
                                >
                                  <div>{c.label}</div>
                                  <div className="text-[7px] text-slate-500 truncate">{c.pct} canopy</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Level 1: Roof Style (Shape-Aware: 4 Rectangular/Square or 4 Round/Oval) */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {isRoundOrOvalShape(stadium.shape) ? '1. CONTINUOUS ROOF STYLE:' : '1. ROOF STYLE:'}
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            {getRoofStylesForShape(stadium.shape).map((st) => {
                              const defaultStyle = isRoundOrOvalShape(stadium.shape) ? 'spoke_wheel_tension' : 'cantilever_truss';
                              const isSelected = (stadium.roof?.style || defaultStyle) === st.id;
                              return (
                                <button
                                  key={st.id}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    setStadium({
                                      ...stadium,
                                      roof: {
                                        ...(stadium.roof || getDefaultRoofConfig(stadium.shape)),
                                        style: st.id,
                                      },
                                    });
                                  }}
                                  className={`p-1.5 rounded border text-left text-[9px] transition-all ${
                                    isSelected
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-sm'
                                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  <div className="font-bold truncate">{st.label}</div>
                                  <div className="text-[7px] text-slate-500 truncate">{st.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Level 2: Roof Deck Material */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">2. CANOPY MATERIAL:</span>
                          <div className="grid grid-cols-4 gap-1">
                            {getRoofMaterialsForShape(stadium.shape).map((mat) => {
                              const defaultMat = isRoundOrOvalShape(stadium.shape) ? 'ptfe_fabric' : 'corrugated_steel';
                              const isSelected = (stadium.roof?.material || defaultMat) === mat.id;
                              return (
                                <button
                                  key={mat.id}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    setStadium({
                                      ...stadium,
                                      roof: {
                                        ...(stadium.roof || getDefaultRoofConfig(stadium.shape)),
                                        material: mat.id,
                                      },
                                    });
                                  }}
                                  className={`px-1 py-1 rounded text-center text-[8px] font-bold border truncate ${
                                    isSelected
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                  title={mat.desc}
                                >
                                  {mat.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Level 3: Fascia Border / Inner Ocular Rim & 360° Halo Board */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {isRoundOrOvalShape(stadium.shape) ? '3. INNER OCULAR RIM & 360° HALO BOARD:' : '3. FASCIA BORDER & TRIM:'}
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            {getRoofBordersForShape(stadium.shape).map((b) => {
                              const defaultBorder = isRoundOrOvalShape(stadium.shape) ? 'video_halo_board' : 'painted_club_fascia';
                              const isSelected = (stadium.roof?.border || defaultBorder) === b.id;
                              return (
                                <button
                                  key={b.id}
                                  onClick={() => {
                                    audio.playKick(0.2);
                                    setStadium({
                                      ...stadium,
                                      roof: {
                                        ...(stadium.roof || getDefaultRoofConfig(stadium.shape)),
                                        border: b.id,
                                      },
                                    });
                                  }}
                                  className={`px-1.5 py-1 rounded text-left text-[8px] font-bold border truncate ${
                                    isSelected
                                      ? 'bg-indigo-500 text-white border-indigo-300 font-black'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                  title={b.desc}
                                >
                                  {b.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Propagate to all stands */}
                        <button
                          onClick={() => {
                            audio.playKick(0.25);
                            const rStyle = stadium.roof?.style || (isRoundOrOvalShape(stadium.shape) ? 'spoke_wheel_tension' : 'cantilever_truss');
                            const rMaterial = stadium.roof?.material || (isRoundOrOvalShape(stadium.shape) ? 'ptfe_fabric' : 'corrugated_steel');
                            const rBorder = stadium.roof?.border || (isRoundOrOvalShape(stadium.shape) ? 'video_halo_board' : 'painted_club_fascia');
                            const rEnabled = stadium.roof?.enabled !== false;
                            const standKeys = ['west', 'east', 'north', 'south', 'corner_nw', 'corner_ne', 'corner_se', 'corner_sw'] as const;
                            const updatedStands = { ...stadium.stands };
                            standKeys.forEach((key) => {
                              const existing = updatedStands[key];
                              if (existing && existing.type !== 'none' && existing.type !== 'no_stand') {
                                updatedStands[key] = {
                                  ...existing,
                                  hasRoof: rEnabled,
                                  roofStyle: rStyle,
                                  roofMaterial: rMaterial,
                                  roofBorder: rBorder,
                                };
                              }
                            });
                            setStadium({
                              ...stadium,
                              stands: updatedStands,
                            });
                          }}
                          className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 text-[9px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>⚡</span>
                          <span>SYNC GLOBAL ROOF SPECIFICATION TO ALL 8 STANDS</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Turf Quality & Mowing Pattern (Respects Youth locks & synthetic option) */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      TURF QUALITY GRADE
                    </label>
                    <div className={`grid ${isYouthVenue ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5`}>
                      {(isYouthVenue
                        ? (['pristine', 'normal', 'poor', 'synthetic'] as TurfQuality[])
                        : (['pristine', 'normal', 'poor'] as TurfQuality[])
                      ).map((tq) => {
                        const allowedTurfs = getAllowedTurfQualitiesForCategory(stadiumCategory, stadium);
                        const isTurfAllowed = allowedTurfs.includes(tq);
                        return (
                          <button
                            key={tq}
                            disabled={!isTurfAllowed}
                            onClick={() => {
                              if (!isTurfAllowed) return;
                              audio.playKick(0.2);
                              setStadium({ ...stadium, turfQuality: tq });
                            }}
                            title={!isTurfAllowed ? 'Pristine grass requires Int\'l Youth Cup Host Unlock in Step 1' : undefined}
                            className={`py-1.5 px-1 rounded border text-center font-bold text-[10px] uppercase ${
                              !isTurfAllowed
                                ? 'bg-slate-950 text-slate-600 border-slate-900 opacity-35 cursor-not-allowed'
                                : stadium.turfQuality === tq
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <div>{tq} {!isTurfAllowed && '🔒'}</div>
                            {tq === 'synthetic' && (
                              <div className="text-[7px] font-normal text-amber-200">+10% Injury</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons: Save & Test Matchday */}
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleSave}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 border border-cyan-400"
                    >
                      <Save className="w-4 h-4" />
                      <span>SAVE STADIUM TO REGISTRY</span>
                    </button>

                    <button
                      onClick={handleTestMatchday}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>⚽ TEST LIVE MATCHDAY WITH THIS VENUE</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Wizard Navigation Footer */}
            <div className="flex-none px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                disabled={currentStep <= 1}
                onClick={() => {
                  audio.playKick(0.18);
                  setCurrentStep((p) => Math.max(1, p - 1));
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                ◀ PREVIOUS
              </button>

              <div className="text-xs text-slate-300 font-mono font-bold tabular-nums">
                {currentStep} / 6
              </div>

              <button
                disabled={currentStep >= 6}
                onClick={() => {
                  audio.playKick(0.18);
                  setCurrentStep((p) => Math.min(6, p + 1));
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-amber-400 disabled:opacity-30 text-slate-950 font-black text-xs shadow cursor-pointer"
              >
                NEXT ▶
              </button>
            </div>
            </>
            )}

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: WYSIWYG CANVAS 2D REAL-TIME MATCHDAY PREVIEW (Cols 6-12)  */}
          {/* ----------------------------------------------------------------------- */}
          <div className={`${mobilePane === 'wizard' ? 'hidden md:block' : 'block'} flex-1 min-h-0 md:col-span-7 h-full relative overflow-hidden bg-black select-none`}>
            
            {/* The Real-Time Procedural Matchday Canvas with Free Camera & Full Zoom Engine */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing touch-none select-none"
              onMouseDown={(e) => {
                touchStateRef.current.isDragging = true;
                touchStateRef.current.lastX = e.clientX;
                touchStateRef.current.lastY = e.clientY;
              }}
              onMouseMove={(e) => {
                if (touchStateRef.current.isDragging) {
                  const dx = e.clientX - touchStateRef.current.lastX;
                  const dy = e.clientY - touchStateRef.current.lastY;
                  touchStateRef.current.lastX = e.clientX;
                  touchStateRef.current.lastY = e.clientY;
                  switchToFreeCam();
                  const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
                  const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
                  const currentZoom = Math.max(0.05, cameraStateRef.current.zoom);
                  targetRef.current.x -= dx / currentZoom;
                  targetRef.current.y -= dy / currentZoom;
                }
              }}
              onMouseUp={() => {
                touchStateRef.current.isDragging = false;
              }}
              onMouseLeave={() => {
                touchStateRef.current.isDragging = false;
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  touchStateRef.current.isDragging = true;
                  touchStateRef.current.lastX = e.touches[0].clientX;
                  touchStateRef.current.lastY = e.touches[0].clientY;
                  touchStateRef.current.lastDistance = null;
                } else if (e.touches.length >= 2) {
                  touchStateRef.current.isDragging = false;
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  touchStateRef.current.lastDistance = Math.hypot(dx, dy);
                }
              }}
              onTouchMove={(e) => {
                const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
                const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
                if (e.touches.length === 1 && touchStateRef.current.isDragging) {
                  const dx = e.touches[0].clientX - touchStateRef.current.lastX;
                  const dy = e.touches[0].clientY - touchStateRef.current.lastY;
                  touchStateRef.current.lastX = e.touches[0].clientX;
                  touchStateRef.current.lastY = e.touches[0].clientY;
                  switchToFreeCam();
                  const currentZoom = Math.max(0.05, cameraStateRef.current.zoom);
                  targetRef.current.x -= dx / currentZoom;
                  targetRef.current.y -= dy / currentZoom;
                } else if (e.touches.length >= 2 && touchStateRef.current.lastDistance !== null) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const dist = Math.hypot(dx, dy);
                  if (dist > 5 && touchStateRef.current.lastDistance > 5) {
                    const zoomFactor = dist / touchStateRef.current.lastDistance;
                    touchStateRef.current.lastDistance = dist;
                    switchToFreeCam();
                    const minZ = 0.05;
                    const maxZ = 2.50;
                    targetRef.current.zoom = Math.max(minZ, Math.min(maxZ, targetRef.current.zoom * zoomFactor));
                  }
                }
              }}
              onTouchEnd={() => {
                touchStateRef.current.isDragging = false;
                touchStateRef.current.lastDistance = null;
              }}
              onWheel={(e) => {
                e.preventDefault();
                switchToFreeCam();
                const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
                const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
                const minZ = 0.05;
                const maxZ = 2.50;
                const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
                targetRef.current.zoom = Math.max(minZ, Math.min(maxZ, targetRef.current.zoom * zoomFactor));
              }}
            />

            {/* Phase B1.3: Dedicated 32-Bit Vertical Interactive Zoom Bar Engine */}
            <div className="absolute right-3 top-20 bottom-24 z-30 flex flex-col items-center justify-between w-11 bg-slate-950/90 backdrop-blur-md border-2 border-slate-700/80 rounded-xl p-1.5 shadow-2xl pointer-events-auto select-none">
              {/* Zoom In Button */}
              <button
                type="button"
                title="Zoom In (+)"
                onClick={() => {
                  applyZoomValue(cameraStateRef.current.zoom * 1.25);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 active:scale-90 transition-all font-black"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Quick Snap Presets */}
              <div className="flex flex-col gap-1 w-full my-1">
                {ZOOM_SNAP_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.description}
                    onClick={() => {
                      applyZoomValue(preset.zoom);
                    }}
                    className="w-full py-0.5 rounded text-[8px] font-mono font-black text-center border transition-all truncate bg-slate-900/90 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/60 active:scale-95"
                  >
                    {preset.id === 'pitch' ? '100%' : preset.id === 'concourse' ? '50%' : preset.id === 'arena' ? '15%' : '5%'}
                  </button>
                ))}
              </div>

              {/* Draggable Vertical Slider Track with Tick Marks */}
              <div
                ref={zoomTrackRef}
                onPointerDown={handleZoomTrackPointerDown}
                className="relative flex-1 w-3 bg-slate-900 rounded-full border border-slate-700 my-1 cursor-pointer flex flex-col justify-between items-center py-1 group"
                title="Interactive Zoom Bar: Click or Drag to Zoom (5% to 250%)"
              >
                {/* Visual Tick marks */}
                <div className="w-2 h-0.5 bg-slate-600 rounded-full pointer-events-none" />
                <div className="w-2 h-0.5 bg-slate-600 rounded-full pointer-events-none" />
                <div className="w-2 h-0.5 bg-slate-600 rounded-full pointer-events-none" />
                <div className="w-2 h-0.5 bg-slate-600 rounded-full pointer-events-none" />

                {/* Draggable Metallic Thumb */}
                <div
                  ref={zoomThumbRef}
                  style={{ bottom: '30%' }}
                  className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-4.5 rounded bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-none"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="w-2.5 h-[1px] bg-slate-950/70" />
                    <span className="w-2.5 h-[1px] bg-slate-950/70" />
                  </div>
                </div>
              </div>

              {/* Live Zoom Readout */}
              <div
                ref={zoomReadoutRef}
                className="text-[8px] font-mono font-black text-amber-300 text-center tracking-tighter w-full py-0.5"
              >
                {Math.round(cameraStateRef.current.zoom * 100)}%
              </div>

              {/* Zoom Out Button */}
              <button
                type="button"
                title="Zoom Out (-)"
                onClick={() => {
                  applyZoomValue(cameraStateRef.current.zoom * 0.80);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 active:scale-90 transition-all font-black"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Floating Camera & Zoom Controls HUD */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 pointer-events-auto">
              <div className="flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-2xl text-[9px] font-mono">
                <button
                  type="button"
                  title="Zoom Out (Mouse Wheel Down • Touch Pinch • Controller Stick)"
                  onClick={() => {
                    audio.playKick(0.15);
                    switchToFreeCam();
                    const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
                    const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
                    const minZ = isAerial ? 0.04 : 0.10;
                    targetRef.current.zoom = Math.max(minZ, targetRef.current.zoom * 0.84);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-90 transition-all font-bold"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="px-2 text-center min-w-[42px] font-bold text-amber-300">
                  {Math.round(cameraStateRef.current.zoom * 100)}%
                </div>
                <button
                  type="button"
                  title="Zoom In (Mouse Wheel Up • Touch Spread • Controller Stick)"
                  onClick={() => {
                    audio.playKick(0.15);
                    switchToFreeCam();
                    const isAerial = cameraPerspectiveRef.current === 'aerial_sky' || cameraPerspectiveRef.current === 'aerial_free';
                    const targetRef = isAerial ? aerialFreeCamTargetRef : freeCamTargetRef;
                    const maxZ = isAerial ? 1.60 : 2.50;
                    targetRef.current.zoom = Math.min(maxZ, targetRef.current.zoom * 1.18);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-90 transition-all font-bold"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instant Fit Preset Shortcuts */}
              <button
                type="button"
                onClick={() => {
                  audio.playKick(0.2);
                  setCameraPerspective('stadium_view');
                }}
                title="Fit Entire Stadium & All Stands onto Screen"
                className={`px-2 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all ${
                  cameraPerspective === 'stadium_view'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/50'
                    : 'bg-slate-950/85 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>🏟️</span>
                <span className="hidden sm:inline">ALL STANDS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playKick(0.2);
                  setCameraPerspective('full_pitch');
                }}
                title="Fit Entire Pitch onto Screen"
                className={`px-2 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all ${
                  cameraPerspective === 'full_pitch'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/50'
                    : 'bg-slate-950/85 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>📐</span>
                <span className="hidden sm:inline">FULL PITCH</span>
              </button>

              {(cameraPerspective === 'free' || cameraPerspective === 'aerial_free') && (
                <button
                  type="button"
                  onClick={() => {
                    audio.playKick(0.2);
                    if (cameraPerspective === 'aerial_free') {
                      aerialFreeCamTargetRef.current = {
                        x: PITCH_CONFIG.CENTER_X,
                        y: PITCH_CONFIG.CENTER_Y - 140,
                        zoom: 0.26,
                        pitchTilt: 0.35,
                        label: 'AERIAL SKY-CAM (FAR)',
                        description: 'High-altitude bird’s-eye perspective showing outer architecture and horizon.',
                      };
                      setCameraPerspective('aerial_sky');
                    } else {
                      setCameraPerspective('relevant');
                    }
                  }}
                  title={cameraPerspective === 'aerial_free' ? 'Reset Aerial Sky Camera View' : 'Reset to Relevant Step View'}
                  className="px-2 py-1.5 rounded-lg border border-amber-500/80 bg-amber-950/80 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-all shadow-md animate-pulse"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>RESET</span>
                </button>
              )}
            </div>

            {/* Free Camera Active Indicator Pill */}
            {(cameraPerspective === 'free' || cameraPerspective === 'aerial_free') && (
              <div className="absolute top-12 left-3 z-10 animate-fadeIn pointer-events-none">
                <div className={`px-2 py-0.5 rounded-full border text-[8px] font-mono font-bold flex items-center gap-1 shadow-lg ${
                  cameraPerspective === 'aerial_free'
                    ? 'bg-cyan-950/90 border-cyan-400/80 text-cyan-300'
                    : 'bg-amber-950/90 border-amber-400/80 text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                    cameraPerspective === 'aerial_free' ? 'bg-cyan-400' : 'bg-amber-400'
                  }`}></span>
                  <span>
                    {cameraPerspective === 'aerial_free'
                      ? 'AERIAL FREE CAM • DRAG TO PAN • SCROLL/PINCH TO ZOOM'
                      : 'FREE CAM • DRAG TO PAN • SCROLL/PINCH TO ZOOM'}
                  </span>
                </div>
              </div>
            )}

            {/* Top-Left Floating WYSIWYG Badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 max-w-[calc(100%-90px)] flex-wrap">
              <div className="hidden sm:flex px-2 py-1 rounded bg-black/80 backdrop-blur border border-slate-700 text-[10px] font-mono font-bold text-slate-300 items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>60 FPS WYSIWYG</span>
              </div>

              {/* Sky-Cam Diorama Active Indicator & Dedicated Aerial Free Toggle */}
              {(cameraPerspective === 'aerial_sky' || cameraPerspective === 'aerial_free') ? (
                <button
                  onClick={() => {
                    audio.playKick(0.2);
                    setCameraPerspective('full_pitch');
                  }}
                  title="Return to Ground Pitch View"
                  className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 border border-cyan-300 text-[10px] font-mono font-black text-white flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>🦅 SKY VIEW</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    audio.playKick(0.2);
                    aerialFreeCamTargetRef.current = {
                      x: PITCH_CONFIG.CENTER_X,
                      y: PITCH_CONFIG.CENTER_Y - 140,
                      zoom: 0.15,
                      pitchTilt: 0.35,
                      label: 'AERIAL FREE CAM',
                      description: 'High-altitude bird’s-eye perspective showing outer architecture and horizon.',
                    };
                    setCameraPerspective('aerial_free');
                  }}
                  title="Switch to Sky View / Aerial Free (Unrestricted 360° Pan & Zoom)"
                  className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 text-[10px] font-mono font-black text-cyan-300 flex items-center gap-1.5 shadow-md hover:border-cyan-400 active:scale-95 transition-all"
                >
                  <span>🦅 SKY VIEW</span>
                </button>
              )}
            </div>

            {/* Top-Center Floating Quick Time-of-Day Director (Desktop; on mobile stays clean inside top bar/step) */}
            <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 items-center p-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-slate-700 shadow-xl z-10 text-[9px] font-mono font-bold">
              {(
                [
                  { id: 'noon', label: '☀️ NOON' },
                  { id: 'sunset', label: '🌅 AFTERNOON' },
                  { id: 'night', label: '🌙 NIGHT' },
                ] as { id: TimeOfDay; label: string }[]
              ).map((tod) => (
                <button
                  key={tod.id}
                  onClick={() => {
                    audio.playKick(0.18);
                    setStadium({
                      ...stadium,
                      lighting: {
                        ...(stadium.lighting || { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: tod.id }),
                        timeOfDay: tod.id,
                      },
                    });
                  }}
                  className={`px-2 py-1 rounded transition-all ${
                    (stadium.lighting?.timeOfDay || 'noon') === tod.id
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tod.label}
                </button>
              ))}
            </div>

            {/* Top-Right Manual Pan Reset Button */}
            <button
              onClick={() => {
                audio.playKick(0.18);
                manualPanRef.current.x = 0;
                manualPanRef.current.y = 0;
                if (cameraPerspective === 'aerial_free' || cameraPerspective === 'aerial_sky') {
                  aerialFreeCamTargetRef.current.x = PITCH_CONFIG.CENTER_X;
                  aerialFreeCamTargetRef.current.y = PITCH_CONFIG.CENTER_Y - 140;
                } else if (cameraPerspective === 'free') {
                  freeCamTargetRef.current.x = PITCH_CONFIG.CENTER_X;
                  freeCamTargetRef.current.y = PITCH_CONFIG.CENTER_Y;
                }
              }}
              title="Reset View Centering"
              className="min-h-[40px] absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono flex items-center gap-1 shadow-md z-10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET PAN</span>
            </button>

            {/* ===================================================================== */}
            {/* PERSISTENT BOTTOM-LEFT 32-BIT HUD BOX (Hidden on narrow mobile so zoom bar never collides) */}
            {/* ===================================================================== */}
            <div className="hidden sm:block absolute bottom-3 left-3 pointer-events-auto z-20">
              <div className="p-3 rounded-xl border-2 border-slate-700 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 backdrop-blur-md shadow-2xl text-[10px] font-mono min-w-[210px] space-y-2">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    WFA HUD
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase">
                    OFFICIAL
                  </span>
                </div>

                {/* FIFA Category / Certification */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CERTIFICATION:</span>
                  <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] tracking-wider border shadow-sm ${
                    certRating === 'world'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30'
                      : certRating === 'continental'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                      : certRating === 'first_division'
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : certRating === 'national'
                      ? 'bg-slate-700 text-white border-slate-500'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  }`}>
                    {certRating.replace('_', ' ')} {penaltyActive ? '⚠️' : ''}
                  </span>
                </div>

                {/* Numerical Capacity Meter */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TOTAL CAPACITY:</span>
                  <span className="text-amber-300 font-bold text-sm tracking-wider">
                    {totalCapacity.toLocaleString()}
                  </span>
                </div>

                {/* Mini Stand Contributions Breakdown */}
                <div className="pt-1 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-[8px] text-center text-slate-400">
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[7px] text-slate-500">EAST</div>
                    <div className="font-bold text-slate-200">
                      {(stadium.stands.east?.type === 'none' ? 0 : calculateStadiumTotalCapacity({ east: stadium.stands.east } as any, stadium.shape)).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[7px] text-slate-500">WEST</div>
                    <div className="font-bold text-slate-200">
                      {(stadium.stands.west?.type === 'none' ? 0 : calculateStadiumTotalCapacity({ west: stadium.stands.west } as any, stadium.shape)).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[7px] text-slate-500">NORTH</div>
                    <div className="font-bold text-slate-200">
                      {(stadium.stands.north?.type === 'none' ? 0 : calculateStadiumTotalCapacity({ north: stadium.stands.north } as any, stadium.shape)).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[7px] text-slate-500">SOUTH</div>
                    <div className="font-bold text-slate-200">
                      {(stadium.stands.south?.type === 'none' ? 0 : calculateStadiumTotalCapacity({ south: stadium.stands.south } as any, stadium.shape)).toLocaleString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
