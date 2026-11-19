import React, { useState, useEffect, useRef } from 'react';
import { InternationalCallUp } from '../types/nationalTeam';
import { PlayerCardData } from '../types';
import {
  Globe,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  FileText,
} from 'lucide-react';
import { getEligibleNationalities } from '../utils/nationalTeamSystem';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface InternationalCallUpModalProps {
  isOpen: boolean;
  callUp: InternationalCallUp | null;
  player: PlayerCardData;
  onAccept: (callUp: InternationalCallUp) => void;
  onDecline: (callUp: InternationalCallUp) => void;
  onChooseOtherNation?: (callUp: InternationalCallUp) => void;
  hasAlternativeNationalities?: boolean;
  onClose: () => void;
}

export const InternationalCallUpModal: React.FC<InternationalCallUpModalProps> = ({
  isOpen,
  callUp,
  player,
  onAccept,
  onDecline,
  onChooseOtherNation,
  onClose,
}) => {
  // All hooks must live unconditionally at the top
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'details'>('ringing');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [pledgeAccepted, setPledgeAccepted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  const playRingtoneBeep = () => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio autoplay gracefully handled
    }
  };

  const playAnthemChime = () => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
      });
    } catch {
      // Audio fallback
    }
  };

  // Reset call state cleanly when reopening with a new call-up
  useEffect(() => {
    if (isOpen && callUp) {
      setCallState('ringing');
      setCallSeconds(0);
      setPledgeAccepted(false);
    }
  }, [isOpen, callUp]);

  // Ringing loop
  useEffect(() => {
    if (!isOpen || !callUp || callState !== 'ringing') return;
    playRingtoneBeep();
    const interval = window.setInterval(() => {
      playRingtoneBeep();
    }, 2200);
    ringIntervalRef.current = interval;
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [isOpen, callUp, callState, isAudioMuted]);

  // Call timer when connected
  useEffect(() => {
    if (!isOpen || !callUp || callState !== 'connected') return;
    const timer = window.setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, callUp, callState]);

  if (!isOpen || !callUp) return null;

  const currentActiveNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };
  const targetNat = callUp.nation;
  const isSenior = callUp.tier === 'Senior';

  const allEligibleNats = getEligibleNationalities(player);
  const hasMultipleNats = allEligibleNats.length > 1;
  const otherNats = allEligibleNats.filter((n) => n.code.toUpperCase() !== targetNat.code.toUpperCase());

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleAnswerCall = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    setCallState('connected');
  };

  const handleAcceptPledge = () => {
    setPledgeAccepted(true);
    playAnthemChime();
    setTimeout(() => {
      onAccept(callUp);
    }, 900);
  };

  const dialogueParagraphs = [
    `"Hello, ${player.name}. I am calling you personally because the coaching staff and our federation have watched your recent matches. You represent the caliber and spirit we need."`,
    ...(hasMultipleNats
      ? [
          `Multiple Nationalities Notice: "We know you are also eligible to represent ${otherNats.map((n) => n.name).join(', ')}. Before I register our official tournament squad list, you must decide where your heart lies."`,
        ]
      : []),
    `"We want you in the squad for ${callUp.competitionName} as a ${callUp.role}. Are you ready to take the pledge and represent ${targetNat.name}?"`,
  ];

  return (
    <ConsoleModalShell
      id="international-call-up-modal"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={`${targetNat.name.toUpperCase()} ${callUp.tier.toUpperCase()} CALL-UP`}
      subtitle={`${callUp.managerName} · ${callUp.competitionName}`}
      icon={<Globe className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-xl"
      headerRight={
        <button
          type="button"
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
        </button>
      }
      tabs={
        callState !== 'ringing'
          ? [
              { id: 'connected', label: 'Coach Call', icon: <PhoneCall className="w-3.5 h-3.5" /> },
              { id: 'details', label: 'Selection Dossier', icon: <FileText className="w-3.5 h-3.5" /> },
            ]
          : undefined
      }
      activeTabId={callState}
      onTabChange={(id) => setCallState(id as 'connected' | 'details')}
      bodyClassName="p-3.5 sm:p-5 space-y-4 bg-slate-950/95"
      footer={
        callState === 'ringing' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onDecline(callUp)}
              className="min-h-[52px] py-2.5 px-3 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-200 text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4 shrink-0" />
              <span>DECLINE</span>
            </button>
            <button
              type="button"
              onClick={handleAnswerCall}
              className="min-h-[52px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>ANSWER CALL</span>
            </button>
          </div>
        ) : callState === 'details' ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setCallState('connected')}
              className="min-h-[46px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              ← Return to Manager Call
            </button>
            <button
              type="button"
              onClick={handleAcceptPledge}
              disabled={pledgeAccepted}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              Accept Selection ⚽
            </button>
          </div>
        ) : undefined
      }
    >
      {/* VIEW 1: INCOMING CALL */}
      {callState === 'ringing' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-emerald-400/80 shadow-2xl shadow-emerald-500/30 overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={`https://flagcdn.com/w160/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                alt={targetNat.code}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full border-2 border-slate-950 shadow-lg">
              <Phone className="w-4 h-4 text-slate-950 animate-bounce" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 animate-pulse flex items-center justify-center gap-1.5">
              <PhoneCall className="w-4 h-4" />
              Incoming Priority Call...
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">{callUp.managerName}</h3>
            <p className="text-sm text-slate-300">
              Head Coach · <strong className="text-amber-300">{targetNat.name} National Team</strong>
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Tournament: <span className="text-white font-semibold">{callUp.competitionName}</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CONNECTED CALL DIALOGUE & RESPONSES */}
      {callState === 'connected' && (
        <div className="space-y-4">
          {/* Live Call Status Header */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-400/60 shrink-0">
                <img
                  src={`https://flagcdn.com/w80/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                  alt={targetNat.code}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-white truncate">{callUp.managerName}</h4>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                  Call Connected ({formatCallTime(callSeconds)})
                </span>
              </div>
            </div>
          </div>

          {/* Full-width Readable Head Coach Dialogue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wide">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Head Coach Dialogue</span>
            </div>

            <ConsolePagedText
              paragraphs={dialogueParagraphs}
              maxCharsPerPage={360}
              resetKey={`${targetNat.code}-${callUp.competitionName}`}
            />

            {isSenior && (
              <div className="bg-rose-950/50 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Senior Call-Up Lock: Committing here locks your Senior International allegiance permanently.
                </span>
              </div>
            )}
          </div>

          {/* Interactive Responses */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Select Your Response to Head Coach:
            </span>

            <button
              type="button"
              onClick={handleAcceptPledge}
              disabled={pledgeAccepted}
              className="w-full min-h-[54px] p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-[0.99] flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
                <div className="text-left min-w-0">
                  <div className="leading-snug">&ldquo;I pledge my allegiance to {targetNat.name}. I am ready!&rdquo; ⚽</div>
                  <div className="text-xs font-semibold text-slate-900/80">
                    +{callUp.bonusFame} Fame · Joins National Team Camp
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>

            {hasMultipleNats && onChooseOtherNation && (
              <button
                type="button"
                onClick={() => onChooseOtherNation(callUp)}
                className="w-full min-h-[54px] p-3.5 rounded-2xl bg-sky-950/90 hover:bg-sky-900 border border-sky-500/50 text-sky-100 font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.99] flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-5 h-5 text-sky-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="leading-snug">&ldquo;With respect Coach, I want to play for another country.&rdquo; 🌍</div>
                    <div className="text-xs text-sky-300 font-normal">
                      Polite declination · <strong>Zero penalties / No fame lost</strong>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDecline(callUp)}
              className="w-full min-h-[52px] p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-200 text-xs sm:text-sm font-bold transition active:scale-[0.99] flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PhoneOff className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-left min-w-0">
                  <div className="leading-snug">&ldquo;I don&apos;t want to play for the national team right now.&rdquo;</div>
                  <div className="text-xs text-rose-400 font-normal">
                    Declines call-up · <strong>-20 Fame &amp; +15 Bad Reputation</strong>
                  </div>
                </div>
              </div>
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL CALL-UP DOSSIER */}
      {callState === 'details' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" /> Federation Selection Brief
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                +{callUp.bonusFame} Fame
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              National manager <strong className="text-white">{callUp.managerName}</strong> has reserved a spot for{' '}
              <strong className="text-amber-300">{player.name}</strong> as a{' '}
              <strong className="text-sky-300">{callUp.role}</strong> in{' '}
              <strong className="text-white">{callUp.competitionName}</strong>.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between gap-2 flex-wrap">
              <span>Active Nationality Impact</span>
              <span className="text-xs text-sky-400 font-normal">International Statutes Compliance</span>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Current:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <img
                    src={`https://flagcdn.com/w40/${(currentActiveNat.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={currentActiveNat.code}
                    className="w-4 h-3 object-cover rounded-[2px]"
                  />
                  <span>{currentActiveNat.name}</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />

              <div className="flex items-center gap-2">
                <span className="text-slate-400">New Active:</span>
                <div className="flex items-center gap-1.5 font-black text-amber-300">
                  <img
                    src={`https://flagcdn.com/w40/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={targetNat.code}
                    className="w-4 h-3 object-cover rounded-[2px]"
                  />
                  <span>{targetNat.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
