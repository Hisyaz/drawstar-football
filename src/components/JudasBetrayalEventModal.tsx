import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { ShieldAlert, Flame, DollarSign, Trophy, ArrowRight, Skull } from 'lucide-react';
import { RivalBetrayalCheckResult } from '../utils/perksSystem';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface JudasBetrayalEventModalProps {
  player: PlayerCardData;
  betrayalData: RivalBetrayalCheckResult;
  transferFeeFormatted?: string;
  weeklyWageFormatted?: string;
  onAcceptTransfer: () => void;
  onRejectTransfer: () => void;
}

export const JudasBetrayalEventModal: React.FC<JudasBetrayalEventModalProps> = ({
  betrayalData,
  weeklyWageFormatted = '€350,000 / week',
  onAcceptTransfer,
  onRejectTransfer,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [pillarPage, setPillarPage] = useState(1);
  const lang = currentLanguage || 'en-GB';

  const isSpanish = lang.startsWith('es');
  const isPortuguese = lang.startsWith('pt');
  const isFrench = lang.startsWith('fr');
  const isGerman = lang.startsWith('de');
  const isItalian = lang.startsWith('it');

  let title = t('THE FORBIDDEN CROSSING');
  let subtitle = t('DIRECT TRANSFER TO ARCH-RIVAL • THE JUDAS SUMMIT');
  const bannerText = betrayalData.rivalryName ? `${betrayalData.rivalryName.toUpperCase()} DIVIDE` : t('BITTER RIVALRY CROSSING');
  let acceptText = t('🔥 Cross the Divide (Embrace Judas Destiny)');
  let rejectText = t('🛡️ Reject the Treachery (Remain Loyal)');
  let warningText = t('ACCEPTING THIS MOVE FORCIBLY ASSIGNS THE JUDAS PERK & DOUBLES ALL FUTURE BAD REPUTATION (×2)');

  if (isSpanish) {
    title = 'EL CRUCE PROHIBIDO';
    subtitle = 'TRASPASO DIRECTO AL MÁXIMO RIVAL • LA CUMBRE DE JUDAS';
    acceptText = '🔥 Cruzar de Vereda (Aceptar el Destino de Judas)';
    rejectText = '🛡️ Rechazar la Traición (Permanecer Leal)';
    warningText = 'ACEPTAR ESTE TRASPASO ASIGNA OBLIGATORIAMENTE EL PERK JUDAS Y DUPLICA TODA REPUTACIÓN NEGATIVA (x2)';
  } else if (isPortuguese) {
    title = 'A TRAVESSIA PROIBIDA';
    subtitle = 'TRANSFERÊNCIA DIRETA PARA O ARQUIRRIVAL • O ENCONTRO DE JUDAS';
    acceptText = '🔥 Fazer a Travessia (Abraçar o Destino de Judas)';
    rejectText = '🛡️ Rejeitar a Traição (Manter Lealdade)';
    warningText = 'ACEITAR ESTA TRANSFERÊNCIA ATRIBUI OBRIGATORIAMENTE O PERK JUDAS E DOBRA A REPUTAÇÃO NEGATIVA (x2)';
  } else if (isFrench) {
    title = 'LE PASSAGE INTERDIT';
    subtitle = 'TRANSFERT DIRECT CHEZ LE RIVAL HISTORIQUE • LE SOMMET JUDAS';
    acceptText = '🔥 Franchir la Ligne (Embrasser le Destin de Judas)';
    rejectText = '🛡️ Rejeter la Trahison (Rester Fidèle)';
    warningText = 'ACCEPTER CE TRANSFERT ASSIGNE DE FORCE LE PERK JUDAS ET DOUBLE TOUTE MAUVAISE RÉPUTATION (x2)';
  } else if (isGerman) {
    title = 'DER VERBOTENE WECHSEL';
    subtitle = 'DIREKTTRANSFER ZUM ERZRIVALEN • DER JUDAS-GIPFEL';
    acceptText = '🔥 Die Grenze überschreiten (Judas-Schicksal annehmen)';
    rejectText = '🛡️ Den Verrat ablehnen (Loyal bleiben)';
    warningText = 'DIESER TRANSFER VERGIBT ZWINGEND DEN JUDAS-PERK UND VERDOPPELT NEGATIVE REPUTATION (x2)';
  } else if (isItalian) {
    title = 'IL PASSAGGIO PROIBITO';
    subtitle = 'TRASFERIMENTO DIRETTO AI RIVALI STORICI • IL VERTICE DI GIUDA';
    acceptText = '🔥 Attraversare il Divario (Accetta il Destino di Giuda)';
    rejectText = '🛡️ Rifiuta il Tradimento (Rimani Fedele)';
    warningText = 'ACCETTARE QUESTO TRASFERIMENTO ASSEGNA IL PERK GIUDA E RADDOPPIA TUTTA LA CATTIVA REPUTAZIONE (x2)';
  }

  return (
    <ConsoleModalShell
      isOpen={true}
      showCloseButton={false}
      maxWidthClass="sm:max-w-3xl"
      accentColor="rose"
      title={title}
      subtitle={subtitle}
      badge={bannerText}
      icon={<Skull className="w-6 h-6 text-rose-400 animate-pulse" />}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={onRejectTransfer}
            className="w-full sm:flex-1 min-h-[48px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-center"
          >
            {rejectText}
          </button>

          <button
            type="button"
            onClick={onAcceptTransfer}
            className="w-full sm:flex-1 min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-900/50 active:scale-95 flex items-center justify-center gap-2 text-center"
          >
            <span>{acceptText}</span>
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Club Confrontation Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950/50 to-slate-950 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-around gap-3 shadow-inner">
          <div className="text-center flex-1 min-w-0 w-full">
            <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Betrayed Club</div>
            <div className="text-base sm:text-xl font-black text-rose-300 truncate mt-0.5">
              {betrayalData.betrayedClub}
            </div>
            <div className="text-xs text-rose-400 font-bold mt-0.5">💔 Former Home</div>
          </div>

          <div className="flex flex-col items-center justify-center px-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-rose-600/30 border border-rose-500/60 flex items-center justify-center text-rose-300">
              <ArrowRight className="w-5 h-5 text-rose-400 rotate-90 sm:rotate-0" />
            </div>
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">CROSSING</span>
          </div>

          <div className="text-center flex-1 min-w-0 w-full">
            <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Bitter Arch-Rival</div>
            <div className="text-base sm:text-xl font-black text-amber-300 truncate mt-0.5">
              {betrayalData.destinationClub}
            </div>
            <div className="text-xs text-amber-400 font-bold mt-0.5">👑 New Empire</div>
          </div>
        </div>

        {/* Mobile Pager for the 4 Stakes Pillars */}
        <div className="sm:hidden">
          <ConsolePaginationBar
            currentPage={pillarPage}
            totalPages={2}
            onPageChange={setPillarPage}
            label="STAKES PAGE"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className={`${pillarPage === 1 ? 'block' : 'hidden sm:block'} p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-1.5`}>
            <div className="flex items-center gap-2 text-rose-400 font-black uppercase">
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Rivalry & Betrayal</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              Direct transfers between these two clubs are forbidden taboos. Fans will burn jerseys, orchestrate deafening whistles, and label you a mercenary traitor for eternity.
            </p>
          </div>

          <div className={`${pillarPage === 1 ? 'block' : 'hidden sm:block'} p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-1.5`}>
            <div className="flex items-center gap-2 text-amber-400 font-black uppercase">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Trophies & Glory</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {betrayalData.destinationClub} offers an elite tactical setup and immediate championship contention to cement your legacy at the highest tier of world football.
            </p>
          </div>

          <div className={`${pillarPage === 2 ? 'block' : 'hidden sm:block'} p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-1.5`}>
            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase">
              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Financial Windfall</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              Package: <strong className="text-emerald-300">{weeklyWageFormatted}</strong> plus a massive signing bonus and world-record transfer visibility.
            </p>
          </div>

          <div className={`${pillarPage === 2 ? 'block' : 'hidden sm:block'} p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-1.5`}>
            <div className="flex items-center gap-2 text-rose-300 font-black uppercase">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Consequences: Judas Perk</span>
            </div>
            <p className="text-rose-100 leading-relaxed">
              Forcibly awards the <strong className="text-white font-bold">🐍 Judas Perk</strong>. All Bad Reputation gains from any source are permanently doubled (×2).
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 border border-rose-500/60">
          <div className="text-xs sm:text-sm font-black text-rose-300 uppercase tracking-wide flex items-center justify-center gap-2 text-center">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{warningText}</span>
          </div>
        </div>
      </div>
    </ConsoleModalShell>
  );
};

