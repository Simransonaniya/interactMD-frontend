import React from 'react';
import { 
  X, 
  Clock, 
  Activity, 
  AlertCircle, 
  Play, 
  Target, 
  CheckCircle2
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';

interface CaseDetailModalProps {
  clinicalCase: ClinicalCase;
  onClose: () => void;
  onStart: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  clinicalCase,
  onClose,
  onStart
}) => {
  const p = clinicalCase.patient;
  const v = clinicalCase.initialVitals;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102528]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-[#39605B]/30 shadow-2xl overflow-hidden animate-slide-up text-[#1A2928] my-4 sm:my-8">
        
        {/* Header Bar (#102528 Dark Header) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#102528] text-[#F7F4EE] flex items-center justify-between border-b border-[#39605B]/30">
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F2D7B8] animate-ping" />
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#F7F4EE]">Pre-Encounter Briefing</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 rounded-full hover:bg-[#14302F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-7 space-y-5 sm:space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Patient Header & Chief Complaint */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center space-x-3.5 sm:space-x-4">
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-[#39605B]/40 shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A2928]">{p.name}</h2>
                  <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                    {clinicalCase.specialty}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#1A2928]/60 mt-0.5 font-medium">
                  {p.age} years old • {p.gender} • {p.occupation}
                </p>
                <p className="text-xs text-[#14302F] font-semibold mt-1 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#39605B] shrink-0" />
                  <span>Chief Complaint: "{p.presentationComplaint}"</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-[#F7F4EE] sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#1A2928]/50 block">OSCE Allotted Time</span>
              <div className="text-sm sm:text-base font-bold text-[#1A2928] flex items-center sm:justify-end font-mono">
                <Clock className="w-4 h-4 mr-1 text-[#39605B]" />
                {clinicalCase.estimatedMinutes}:00 mins
              </div>
            </div>
          </div>

          {/* Triage Vitals Readout in Deep Teal #14302F */}
          <div className="bg-[#14302F] rounded-2xl p-5 text-[#F7F4EE] border border-[#39605B]/40">
            <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#F7F4EE]/70 uppercase tracking-wider">
              <span>Emergency Triage Baseline Telemetry</span>
              <span className="text-[#F2D7B8] flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-[#F2D7B8] animate-pulse" />
                Vitals Logged
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
              <div className="bg-[#102528] p-2.5 rounded-xl border border-[#39605B]/30">
                <div className="text-[10px] text-[#F7F4EE]/60 uppercase">Heart Rate</div>
                <div className="text-xl font-bold text-[#F2D7B8]">{v.heartRate} <span className="text-xs">bpm</span></div>
              </div>
              <div className="bg-[#102528] p-2.5 rounded-xl border border-[#39605B]/30">
                <div className="text-[10px] text-[#F7F4EE]/60 uppercase">Blood Pressure</div>
                <div className="text-xl font-bold text-[#F7F4EE]">{v.bloodPressure}</div>
              </div>
              <div className="bg-[#102528] p-2.5 rounded-xl border border-[#39605B]/30">
                <div className="text-[10px] text-[#F7F4EE]/60 uppercase">Resp. Rate</div>
                <div className="text-xl font-bold text-[#F7F4EE]">{v.respiratoryRate} <span className="text-xs">/min</span></div>
              </div>
              <div className="bg-[#102528] p-2.5 rounded-xl border border-[#39605B]/30">
                <div className="text-[10px] text-[#F7F4EE]/60 uppercase">Oxygen Sat</div>
                <div className="text-xl font-bold text-[#F7F4EE]">{v.oxygenSaturation}%</div>
              </div>
              <div className="bg-[#102528] p-2.5 rounded-xl border border-[#39605B]/30 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-[#F7F4EE]/60 uppercase">Temp</div>
                <div className="text-xl font-bold text-[#F7F4EE]">{v.temperature}°C</div>
              </div>
            </div>
          </div>

          {/* Triage Nurse's Hand-off Note */}
          <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/20 text-xs">
            <span className="font-bold text-[#14302F] uppercase tracking-wider text-[10px] block mb-1">
              Triage Nurse Clinical Hand-off Note:
            </span>
            <p className="text-[#1A2928]/80 leading-relaxed font-normal">
              {clinicalCase.triageNurseNote}
            </p>
          </div>

          {/* Case Learning Objectives */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#39605B] mb-2.5 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5 text-[#39605B]" />
              Clinical Objectives for this Encounter:
            </h3>
            <div className="space-y-2">
              {clinicalCase.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-[#1A2928]/80">
                  <CheckCircle2 className="w-4 h-4 text-[#39605B] shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Instructions */}
          <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/20 text-xs text-[#1A2928]/70 space-y-1">
            <span className="font-bold text-[#1A2928] block">Encounter Instructions:</span>
            <p>1. Converse naturally with the virtual patient using history-taking principles (OPQRST, risk factors).</p>
            <p>2. Select physical examination maneuvers and order targeted STAT diagnostic labs/imaging.</p>
            <p>3. Submit your final working diagnosis and acute management plan to trigger AI attending evaluation.</p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-7 py-4 bg-[#F7F4EE] border-t border-[#39605B]/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-white border border-[#39605B]/25 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onStart}
            className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#1A2928]" />
            <span>Enter Patient Room</span>
          </button>
        </div>

      </div>
    </div>
  );
};
