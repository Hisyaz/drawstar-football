import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Trophy,
  Star,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  User,
  Check,
  Plus,
  Monitor,
  Layers,
  Lock,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/localizationSystem';
import { useAudio } from '../context/AudioContext';
import { LanguageFlagCarousel } from './LanguageFlagCarousel';
import { hasTutorialPreference, setTutorialEnabled } from '../utils/tutorialSystem';
import { AnimatedDrawStarLogo } from './AnimatedDrawStarLogo';
import { ProfileAvatarColor, PROFILE_COLORS } from '../types/profile';
import { ProfileAvatar } from './ProfileAvatar';
import {
  runProfileRead,
  createProfile,
  setActiveProfile,
} from '../utils/profileSystem';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  useGraphicSettings,
  hasConfiguredInitialQuality,
  setGraphicSettings,
  GraphicQuality,
} from '../utils/graphicSettingsSystem';
import { detectDeviceHardware, DeviceHardwareProfile } from '../utils/hardwareTierDetector';

interface StartupIntroFlowProps {
  onComplete: () => void;
}

const COLOR_OPTIONS: ProfileAvatarColor[] = ['red', 'blue', 'yellow', 'white', 'black'];

export const StartupIntroFlow: React.FC<StartupIntroFlowProps> = ({ onComplete }) => {
  const { t, setLanguage } = useLanguage();
  const { isMuted, toggleMute, startIntroMusic, startMenuMusic, stopMusic } = useAudio();
  const { graphicSettings } = useGraphicSettings();

  const [step, setStep] = useState<
    'dev_message' | 'language_picker' | 'create_profile' | 'graphic_preset_prompt' | 'tutorial_prompt'
  >('dev_message');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [selectedFlagCode, setSelectedFlagCode] = useState<string | null>(null);

  // Profile creation state
  const [newProfileName, setNewProfileName] = useState<string>('Striker');
  const [newProfileColor, setNewProfileColor] = useState<ProfileAvatarColor>('blue');

  // Graphic preset onboarding state
  const [hardwareProfile] = useState<DeviceHardwareProfile>(() => detectDeviceHardware());
  const [selectedQuality, setSelectedQuality] = useState<GraphicQuality>('balanced');
  const [presetPageIdx, setPresetPageIdx] = useState<number>(1);
  const [tutorialPageChoice, setTutorialPageChoice] = useState<boolean>(true);

  // Start intro soundtrack automatically once on mount
  const hasStartedMusicRef = useRef(false);
  useEffect(() => {
    if (!hasStartedMusicRef.current) {
      hasStartedMusicRef.current = true;
      startIntroMusic();
    }
  }, [startIntroMusic]);

  const handleAdvanceFromLogo = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      setStep('language_picker');
      setIsFadingOut(false);
    }, 450);
  }, [isFadingOut]);

  const finishFlow = useCallback(() => {
    // 1. Immediately silence the epic intro music
    stopMusic();

    // 2. Smoothly complete the intro screen transition
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);

    // 3. Exactly 3 seconds of dramatic silence, then start regular menu/game soundtrack
    setTimeout(() => {
      startMenuMusic();
    }, 3000);
  }, [stopMusic, onComplete, startMenuMusic]);

  const proceedAfterProfileOrPreset = useCallback(() => {
    if (!hasConfiguredInitialQuality()) {
      setStep('graphic_preset_prompt');
      setIsFadingOut(false);
    } else if (!hasTutorialPreference()) {
      setStep('tutorial_prompt');
      setIsFadingOut(false);
    } else {
      finishFlow();
    }
  }, [finishFlow]);

  // Step 2 -> Step 3: Automatically read profile upon selecting language
  const handleConfirmLanguage = useCallback(
    (code: LanguageCode) => {
      if (selectedFlagCode) return; // Prevent duplicate clicks
      setSelectedFlagCode(code);
      setLanguage(code);

      setIsFadingOut(true);
      setTimeout(() => {
        // Read if there is an existing profile: if found, load it immediately. If not, prompt to create one!
        const readResult = runProfileRead();
        if (readResult.hasProfiles) {
          const profileToActivate = readResult.activeProfile || readResult.profiles[0];
          if (profileToActivate) {
            setActiveProfile(profileToActivate.id);
          }
          proceedAfterProfileOrPreset();
        } else {
          // No profile found: prompt user to create one
          setStep('create_profile');
          setIsFadingOut(false);
        }
      }, 350);
    },
    [selectedFlagCode, setLanguage, proceedAfterProfileOrPreset]
  );

  // Submit new profile creation
  const handleConfirmCreateProfile = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newProfileName.trim();
      if (!trimmed) return;

      const lang = selectedFlagCode || 'en-GB';
      createProfile(trimmed, newProfileColor, lang);
      audioManager.playSfx('ui_confirm');
      haptics.success();

      // Proceed to Graphic Preset selection (first time for this profile) or tutorial selection
      setIsFadingOut(true);
      setTimeout(() => {
        proceedAfterProfileOrPreset();
      }, 350);
    },
    [newProfileName, newProfileColor, selectedFlagCode, proceedAfterProfileOrPreset]
  );

  // Confirm Graphic Preset (saved to profile settings and never asked again)
  const handleConfirmGraphicPreset = useCallback(() => {
    setGraphicSettings({
      quality: selectedQuality,
      hasChosenInitialQuality: true,
    });
    audioManager.playSfx('ui_confirm');
    haptics.success();

    setIsFadingOut(true);
    setTimeout(() => {
      if (!hasTutorialPreference()) {
        setStep('tutorial_prompt');
        setIsFadingOut(false);
      } else {
        finishFlow();
      }
    }, 350);
  }, [selectedQuality, finishFlow]);

  const handleSelectTutorial = useCallback((enabled: boolean) => {
    setTutorialEnabled(enabled);
    finishFlow();
  }, [finishFlow]);

  const qualityCardOptions: {
    id: GraphicQuality;
    title: string;
    badge: string;
    description: string;
    isLocked: boolean;
  }[] = [
    {
      id: 'performance',
      title: t('QUALITY_PERFORMANCE_TITLE') || 'Performance Mode (Low-Spec & Mobile)',
      badge: t('QUALITY_PERFORMANCE_BADGE') || '60+ FPS • Ultra-Fast',
      description:
        t('QUALITY_PERFORMANCE_DESC') ||
        'Optimized flat barebones styling for maximum responsiveness. Strips expensive blurs, scanlines, drop shadows, confetti cascades, and heavy GPU animation loops.',
      isLocked: false,
    },
    {
      id: 'balanced',
      title: t('QUALITY_BALANCED_TITLE') || 'Balanced Mode (32-Bit Arcade)',
      badge: t('QUALITY_BALANCED_BADGE') || 'Active Standard (60 FPS)',
      description:
        t('QUALITY_BALANCED_DESC') ||
        'Original 32-bit retro arcade aesthetic with stepped pixel bevels, CRT scanlines, and authentic audio-visual pacing.',
      isLocked: false,
    },
    {
      id: 'high',
      title: t('QUALITY_HIGH_QUALITY_TITLE') || 'High Quality Mode (Cyber-Arcade Glass)',
      badge: t('QUALITY_HIGH_QUALITY_BADGE') || '120 FPS • Max Fidelity',
      description:
        t('QUALITY_HIGH_QUALITY_DESC') ||
        'Deluxe visual overhaul with volumetric neon ambient glow, holographic foil card shimmer, interactive 3D tilt, and high-density celebration particle cascades.',
      isLocked: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 select-none overflow-y-auto overflow-x-hidden font-sans flex flex-col items-center justify-center p-0 sm:p-4 h-[100dvh] w-full">
      {/* Top right quick audio toggle */}
      <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-40">
        <button
          type="button"
          onClick={() => toggleMute()}
          className="min-w-[44px] min-h-[44px] p-2 rounded-full bg-slate-900/85 border border-slate-700/80 text-slate-200 hover:text-white backdrop-blur-md cursor-pointer transition-all shadow-md flex items-center justify-center"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* 🏟️ AUTHENTIC STADIUM BACKDROP: DEEP MIDNIGHT ARCADE STADIUM FOR INTRO LOGO, SILVER HEXAGONAL FOR CAROUSEL */}
      <div
        className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000 ${
          step === 'dev_message' ? 'bg-[#060c1c]' : 'bg-[#e3e7ec]'
        }`}
      >
        {step === 'dev_message' ? (
          <>
            {/* Retro Stadium Night Sky & Floodlight Beams */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-slate-950 to-black" />
            <div className="absolute -top-24 left-1/4 w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -top-24 right-1/4 w-[550px] h-[550px] bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            {/* Pixel Star Field */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 80px, #fef08a, rgba(0,0,0,0)), radial-gradient(2px 2px at 110px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(3px 3px at 180px 140px, #facc15, rgba(0,0,0,0)), radial-gradient(2px 2px at 270px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 360px 210px, #fef08a, rgba(0,0,0,0))',
                backgroundSize: '360px 260px',
              }}
            />
            {/* Center Stadium Floodlight Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-t from-emerald-950/40 via-sky-950/20 to-transparent blur-3xl" />
          </>
        ) : (
          <>
            {/* Hexagon Pattern Grid */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-multiply"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 0%, rgba(220, 226, 235, 0.4) 60%, rgba(185, 195, 210, 0.8) 100%),
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='138.56' viewBox='0 0 80 138.56'%3E%3Cpath d='M40 0 L80 23.09 L80 69.28 L40 92.37 L0 69.28 L0 23.09 Z M40 138.56 L80 115.47 L80 69.28 L40 46.19 L0 69.28 L0 115.47 Z' fill='none' stroke='%23b0bac8' stroke-width='1.2' stroke-opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover, 90px 156px',
                backgroundPosition: 'center center',
              }}
            />

            {/* Ambient Stadium Spotlights & Dust Particles */}
            <div className="absolute -top-32 left-1/4 w-96 h-96 bg-white/70 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-300/40 via-transparent to-white/60 pointer-events-none" />
          </>
        )}
      </div>

      {/* STEP 1: 32-BIT ANIMATED PIXEL DRAWSTAR LOGO & DEVELOPED BY HISYAZ */}
      {step === 'dev_message' && (
        <div
          className={`relative z-10 max-w-2xl w-full text-center flex flex-col items-center justify-center p-2 sm:p-4 my-auto transition-all duration-500 transform ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <AnimatedDrawStarLogo onAdvance={handleAdvanceFromLogo} />
        </div>
      )}

      {/* STEP 2: 32-BIT RETRO LANGUAGE SELECTION FLAG CAROUSEL */}
      {step === 'language_picker' && (
        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center justify-center p-2 sm:p-4 my-auto animate-in fade-in duration-500">
          <LanguageFlagCarousel onConfirm={handleConfirmLanguage} />
        </div>
      )}

      {/* STEP 2.5: CREATE PROFILE (NAME & 5 COLOR CIRCLE PROFILE PICS) */}
      {step === 'create_profile' && (
        <div
          className={`relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-md bg-slate-900/95 border-0 sm:border-2 sm:border-amber-500/80 pixel-bevel-gold shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white flex flex-col justify-between overflow-hidden transition-all duration-400 transform ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          <div className="px-4 pt-4 pb-3 pr-14 sm:px-6 sm:pt-5 border-b border-slate-800 bg-slate-950 shrink-0 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border-2 border-amber-400/80 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black font-arcade uppercase tracking-wide text-amber-300 truncate">
                  {t('STARTUP_PROFILE_CREATE_TITLE') || 'Create Your Profile'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-snug">
                  {t('STARTUP_PROFILE_CREATE_SUBTITLE') || 'Enter your profile name and pick an avatar color to begin.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleConfirmCreateProfile} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4 text-left">
              {/* Live Avatar Preview */}
              <div className="flex items-center gap-3.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <ProfileAvatar color={newProfileColor} size="lg" name={newProfileName} showGlow />
                <div className="min-w-0">
                  <span className="font-arcade font-black text-base sm:text-lg text-white block truncate">
                    {newProfileName.trim() || 'Player'}
                  </span>
                  <span className="text-xs font-pixel text-amber-400/90 capitalize">
                    {t(`PROFILE_COLOR_${newProfileColor.toUpperCase()}`) || PROFILE_COLORS[newProfileColor]?.label}
                  </span>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-arcade uppercase tracking-wider text-amber-300 font-bold">
                  {t('STARTUP_PROFILE_NAME_LABEL') || 'Profile Name'}
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value.slice(0, 16))}
                  placeholder={t('STARTUP_PROFILE_NAME_PLACEHOLDER') || 'Enter player name...'}
                  maxLength={16}
                  required
                  className="w-full min-h-[44px] px-3 py-2.5 bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 rounded-lg text-white font-arcade text-base outline-none transition"
                />
              </div>

              {/* Avatar Color Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-arcade uppercase tracking-wider text-amber-300 font-bold">
                  {t('STARTUP_PROFILE_COLOR_LABEL') || 'Avatar Color'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((col) => {
                    const config = PROFILE_COLORS[col];
                    const isSelected = newProfileColor === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewProfileColor(col)}
                        className={`min-h-[60px] p-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/70 border-2 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-slate-950 border border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="relative">
                          <ProfileAvatar color={col} size="sm" showGlow={isSelected} />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-sans font-bold uppercase text-slate-200 truncate max-w-full">
                          {t(`PROFILE_COLOR_${col.toUpperCase()}`) || config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirm Button Pinned Bottom */}
            <div className="px-4 py-3 sm:px-6 bg-slate-950 border-t border-slate-800 shrink-0 safe-bottom">
              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-sm uppercase tracking-wider rounded-lg pixel-bevel-gold cursor-pointer shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{t('STARTUP_PROFILE_CONFIRM_BTN') || 'Confirm Profile & Continue'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2.75: INITIAL GRAPHIC PRESET ONBOARDING (CONSOLE PAGED ON MOBILE, 3-CARD ON DESKTOP) */}
      {step === 'graphic_preset_prompt' && (
        <div
          className={`relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-3xl bg-slate-900/95 border-0 sm:border-2 sm:border-amber-500/80 pixel-bevel-gold shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white flex flex-col overflow-hidden transition-all duration-500 transform ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          {/* Compact Top Header */}
          <div className="px-4 pt-3.5 pb-3 pr-14 sm:px-6 bg-slate-950 border-b border-slate-800 shrink-0 text-left space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-400/80 flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl font-black font-arcade uppercase tracking-wide text-amber-300 truncate">
                  {t('ONBOARDING_GRAPHIC_TITLE') || 'DISPLAY & PERFORMANCE PRESET'}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-cyan-300 truncate">
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{hardwareProfile.hardwareSummary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Console Page Switcher Bar (< md) */}
          <div className="md:hidden px-3 py-2 bg-slate-950/90 border-b border-slate-800 shrink-0 grid grid-cols-3 gap-1.5">
            {qualityCardOptions.map((opt, idx) => {
              const active = presetPageIdx === idx;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPresetPageIdx(idx);
                    setSelectedQuality(opt.id);
                    haptics.buttonPress();
                  }}
                  className={`min-h-[44px] px-2 py-1.5 rounded-lg border text-xs font-arcade font-bold uppercase transition-all cursor-pointer truncate ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {idx === 0 ? 'PERF' : idx === 1 ? 'BALANCED' : 'HIGH'}
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:p-6 flex flex-col justify-between gap-4">
            <p className="text-sm text-slate-200 font-sans leading-relaxed text-left">
              {t('ONBOARDING_GRAPHIC_SUBTITLE') ||
                'Choose the visual preset that best fits your device. You can change this anytime in Settings.'}
            </p>

            {/* Mobile Single-Card Console View (< md): Uses Full Screen Width at Easy-to-Read Size */}
            {(() => {
              const opt = qualityCardOptions[presetPageIdx] || qualityCardOptions[1];
              const isSelected = selectedQuality === opt.id;
              const isRecommended = hardwareProfile.recommendedQuality === opt.id;
              return (
                <div className="md:hidden flex-1 flex flex-col justify-between gap-4 text-left">
                  <div
                    onClick={() => {
                      setSelectedQuality(opt.id);
                      haptics.buttonPress();
                    }}
                    className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
                      isSelected ? 'bg-amber-950/60 border-amber-400' : 'bg-slate-950 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-300">{opt.badge}</span>
                      {isRecommended && (
                        <span className="text-xs font-mono font-black text-cyan-300">★ RECOMMENDED</span>
                      )}
                    </div>
                    <h3 className="font-arcade font-black text-lg text-white leading-snug">{opt.title}</h3>
                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
                      {opt.description}
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-amber-300 font-bold">
                      <span>PRESET {presetPageIdx + 1} / {qualityCardOptions.length}</span>
                      <span>{isSelected ? '✓ SELECTED' : 'TAP TO SELECT'}</span>
                    </div>
                  </div>

                  {/* Console Prev / Next Preset Pager */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const prev = (presetPageIdx - 1 + qualityCardOptions.length) % qualityCardOptions.length;
                        setPresetPageIdx(prev);
                        setSelectedQuality(qualityCardOptions[prev].id);
                        haptics.buttonPress();
                      }}
                      className="min-h-[46px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade text-xs uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>PREV PRESET</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (presetPageIdx + 1) % qualityCardOptions.length;
                        setPresetPageIdx(next);
                        setSelectedQuality(qualityCardOptions[next].id);
                        haptics.buttonPress();
                      }}
                      className="min-h-[46px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade text-xs uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>NEXT PRESET</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Desktop 3-Column Grid (md+) */}
            <div className="hidden md:grid md:grid-cols-3 gap-3.5 w-full text-left">
              {qualityCardOptions.map((opt, idx) => {
                const isSelected = selectedQuality === opt.id;
                const isRecommended = hardwareProfile.recommendedQuality === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!opt.isLocked) {
                        setSelectedQuality(opt.id);
                        setPresetPageIdx(idx);
                        haptics.buttonPress();
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                      opt.isLocked
                        ? 'bg-slate-950/70 border-slate-800 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-950/80 border-amber-400 cursor-pointer shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950/90 hover:bg-slate-800/80 border-slate-700 hover:border-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1 text-xs font-mono">
                        <span className="text-emerald-300 font-bold">{opt.badge}</span>
                        {isRecommended && <span className="text-cyan-300 font-black">★ REC</span>}
                      </div>
                      <h3 className="font-arcade font-bold text-base text-white leading-tight">{opt.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{opt.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 text-amber-300 font-black">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>SELECTED</span>
                        </div>
                      ) : opt.isLocked ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                          <span>DISABLED</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">CLICK TO CHOOSE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Confirm Bar */}
          <div className="px-4 py-3 sm:px-6 bg-slate-950 border-t border-slate-800 shrink-0 safe-bottom">
            <button
              type="button"
              onClick={handleConfirmGraphicPreset}
              className="w-full min-h-[48px] py-3 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-arcade font-black text-sm uppercase tracking-wider rounded-lg border-2 border-amber-300 pixel-bevel-gold shadow-lg cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{t('ONBOARDING_CONFIRM_BTN') || 'Confirm Preset & Continue'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TUTORIAL ON / OFF SELECTION (CONSOLE PAGED ON PHONE, 2-COL ON TABLET/DESKTOP) */}
      {step === 'tutorial_prompt' && (
        <div
          className={`relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl bg-slate-900/95 border-0 sm:border-2 sm:border-amber-500/80 pixel-bevel-gold shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white flex flex-col overflow-hidden transition-all duration-500 transform ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          {/* Header */}
          <div className="px-4 pt-3.5 pb-3 pr-14 sm:px-6 bg-slate-950 border-b border-slate-800 shrink-0 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-400/70 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-2xl font-black font-arcade uppercase tracking-wide text-amber-300 truncate">
                  {t('TUTORIAL_SELECTION_TITLE') || 'Guided Tutorial System'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-snug">
                  {t('TUTORIAL_SELECTION_SUBTITLE') || 'Would you like interactive explanations to appear the first time you discover each game system?'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Option Pager Switcher (< sm) */}
          <div className="sm:hidden px-3 py-2 bg-slate-950/90 border-b border-slate-800 grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setTutorialPageChoice(true)}
              className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-arcade uppercase font-bold cursor-pointer ${
                tutorialPageChoice
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {t('TUTORIAL_ON_TITLE') || 'TUTORIAL ON'}
            </button>
            <button
              type="button"
              onClick={() => setTutorialPageChoice(false)}
              className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-arcade uppercase font-bold cursor-pointer ${
                !tutorialPageChoice
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {t('TUTORIAL_OFF_TITLE') || 'TUTORIAL OFF'}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:p-6 flex flex-col justify-between gap-4">
            {/* Mobile Single-Page Readable Card (< sm) */}
            <div className="sm:hidden flex-1 flex flex-col justify-center text-left space-y-4">
              {tutorialPageChoice ? (
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-emerald-300">
                    {t('TUTORIAL_ON_BADGE') || 'FIRST-TIME PLAYERS'}
                  </div>
                  <h3 className="text-xl font-black font-arcade uppercase text-emerald-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{t('TUTORIAL_ON_TITLE') || 'TUTORIAL ON'}</span>
                  </h3>
                  <p className="text-base text-slate-100 leading-relaxed font-sans">
                    {t('TUTORIAL_ON_DESC') || 'Explanations show the first time you see something (Card Store, Development, Matchdays). Can be toggled anytime.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-slate-400">
                    {t('TUTORIAL_OFF_BADGE') || 'VETERAN MODE'}
                  </div>
                  <h3 className="text-xl font-black font-arcade uppercase text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-300" />
                    <span>{t('TUTORIAL_OFF_TITLE') || 'TUTORIAL OFF'}</span>
                  </h3>
                  <p className="text-base text-slate-100 leading-relaxed font-sans">
                    {t('TUTORIAL_OFF_DESC') || 'Play freely without introductory popups. All guides remain accessible anytime in the Game Wiki.'}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop/Tablet 2-Col Grid (sm+) */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 w-full text-left my-auto">
              <button
                id="tutorial-choice-on-btn"
                type="button"
                onClick={() => handleSelectTutorial(true)}
                className="group p-5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border-2 border-emerald-500/70 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-300">
                      {t('TUTORIAL_ON_BADGE') || 'FIRST-TIME PLAYERS'}
                    </span>
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black font-arcade uppercase tracking-wide text-emerald-300">
                    {t('TUTORIAL_ON_TITLE') || 'TUTORIAL ON'}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                    {t('TUTORIAL_ON_DESC') || 'Explanations show the first time you see something (Card Store, Development, Matchdays). Can be toggled anytime.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span>{t('TUTORIAL_CONFIRM_BTN') || 'Start Career'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                id="tutorial-choice-off-btn"
                type="button"
                onClick={() => handleSelectTutorial(false)}
                className="group p-5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border-2 border-slate-700 hover:border-slate-500 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">
                      {t('TUTORIAL_OFF_BADGE') || 'VETERAN MODE'}
                    </span>
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-lg font-black font-arcade uppercase tracking-wide text-slate-200 group-hover:text-white">
                    {t('TUTORIAL_OFF_TITLE') || 'TUTORIAL OFF'}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {t('TUTORIAL_OFF_DESC') || 'Play freely without introductory popups. All guides remain accessible anytime in the Game Wiki.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span>{t('TUTORIAL_CONFIRM_BTN') || 'Start Career'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Sticky Bottom Confirm Bar (< sm) */}
          <div className="sm:hidden px-4 py-3 bg-slate-950 border-t border-slate-800 shrink-0 safe-bottom">
            <button
              id={tutorialPageChoice ? 'tutorial-choice-on-btn' : 'tutorial-choice-off-btn'}
              type="button"
              onClick={() => handleSelectTutorial(tutorialPageChoice)}
              className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-arcade font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition ${
                tutorialPageChoice
                  ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-300'
                  : 'bg-amber-500 text-slate-950 border-2 border-amber-300'
              }`}
            >
              <span>{tutorialPageChoice ? `${t('TUTORIAL_ON_TITLE') || 'TUTORIAL ON'} · ${t('TUTORIAL_CONFIRM_BTN') || 'Start'}` : `${t('TUTORIAL_OFF_TITLE') || 'TUTORIAL OFF'} · ${t('TUTORIAL_CONFIRM_BTN') || 'Start'}`}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
