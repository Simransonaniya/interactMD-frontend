import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  BrainCircuit, 
  Clock, 
  MessageSquare, 
  FileText, 
  ShieldCheck,
  Stethoscope,
  Printer,
  LayoutDashboard
} from 'lucide-react';
import { ClinicalCase, EvaluationResult, ChatMessage } from '../types/clinical';

interface EvaluationViewProps {
  clinicalCase: ClinicalCase;
  evaluation: EvaluationResult;
  chatMessages: ChatMessage[];
  onRetry: () => void;
  onNextCase: (caseId: string) => void;
  onBackToDashboard: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  clinicalCase,
  evaluation,
  chatMessages,
  onRetry,
  onNextCase,
  onBackToDashboard,
}) => {
  useEffect(() => {
    if (evaluation.overallScore >= 75) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [evaluation.overallScore]);

  const getBadgeColor = (grade: EvaluationResult['overallGrade']) => {
    switch (grade) {
      case 'High Honors': return 'bg-[#F2D7B8] text-[#1A2928] border border-[#F2D7B8]';
      case 'Honors': return 'bg-[#14302F] text-[#F2D7B8] border border-[#39605B]/50';
      case 'Pass': return 'bg-[#39605B]/15 text-[#39605B] border border-[#39605B]/30';
      case 'Remediate': return 'bg-[#102528] text-[#F7F4EE] border border-[#39605B]/60';
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const dims = evaluation.dimensions;

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-9">
      
      {/* Top Banner: Score & Grade Header */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 shadow-xs p-7 sm:p-9 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#14302F] text-[#F2D7B8]">
                OSCE Performance Evaluation
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getBadgeColor(evaluation.overallGrade)}`}>
                {evaluation.overallGrade}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1A2928] tracking-tight">
              Clinical Assessment: {clinicalCase.patient.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#1A2928]/70">
              {clinicalCase.title} • {clinicalCase.specialty}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-[#1A2928]/60 font-medium pt-2">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#39605B]" />
                <span>Encounter Duration: <strong className="text-[#1A2928]">{formatSeconds(evaluation.durationSeconds)}</strong></span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#39605B]" />
                <span>Questions Asked: <strong className="text-[#1A2928]">{evaluation.questionsAskedCount}</strong></span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#39605B]" />
                <span>Exams Performed: <strong className="text-[#1A2928]">{evaluation.examsPerformedCount}</strong></span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-full border border-[#39605B]/30 hover:border-[#39605B] text-[#1A2928] text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer bg-white hover:bg-[#F7F4EE]"
              >
                <Printer className="w-3.5 h-3.5 text-[#39605B]" />
                <span>Print / Save OSCE Report</span>
              </button>

              <button
                onClick={onBackToDashboard}
                className="px-3.5 py-1.5 rounded-full border border-[#39605B]/30 hover:border-[#39605B] text-[#1A2928] text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer bg-white hover:bg-[#F7F4EE]"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#39605B]" />
                <span>Learner Dashboard</span>
              </button>
            </div>
          </div>

          {/* Big Score Ring in brand colors */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[#F7F4EE] rounded-3xl border border-[#39605B]/15">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#39605B]/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#39605B]"
                  strokeDasharray={`${evaluation.overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-[#1A2928]">{evaluation.overallScore}</span>
                <span className="text-[10px] font-bold text-[#1A2928]/60 uppercase">out of 100</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#1A2928] mt-2.5">Overall OSCE Score</span>
          </div>

        </div>
      </div>

      {/* Attending Physician's Clinical Summary in Deep Teal #14302F */}
      <div className="p-7 rounded-3xl bg-[#14302F] border border-[#39605B]/40 text-xs text-[#F7F4EE] space-y-2 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-[#F2D7B8] uppercase tracking-wider text-[11px]">
          <BrainCircuit className="w-4 h-4 text-[#F2D7B8]" />
          <span>Faculty Attending Physician Evaluation Summary</span>
        </div>
        <p className="leading-relaxed text-[#F7F4EE]/90 text-xs sm:text-sm font-normal">
          {evaluation.aiAttendingSummary}
        </p>
      </div>

      {/* 5 Core Blueprint Dimensions Breakdown */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 p-7 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2928]">5-Dimension Competency Breakdown</h2>
          <p className="text-xs text-[#1A2928]/60 mt-0.5">
            Validated against standard medical school OSCE rubrics and clinical communication scales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            dims.interviewCompleteness,
            dims.clinicalReasoning,
            dims.communication,
            dims.empathy,
            dims.management
          ].map((dim, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs sm:text-sm text-[#1A2928]">{dim.name}</span>
                  <span className="text-[10px] text-[#1A2928]/50 font-mono">({dim.weight}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#1A2928]">{dim.score}%</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                    {dim.grade}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#39605B]/10">
                <div
                  className="h-full rounded-full bg-[#39605B]"
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-xs text-[#1A2928]/70 leading-relaxed pt-1">
                {dim.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Missed Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="bg-white rounded-3xl border border-[#39605B]/15 p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#39605B]">
            <CheckCircle2 className="w-5 h-5 text-[#39605B]" />
            <h3 className="font-bold text-sm text-[#1A2928]">Demonstrated Strengths</h3>
          </div>
          <div className="space-y-2.5">
            {evaluation.strengths.map((str, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-[#1A2928]/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39605B] shrink-0 mt-1.5" />
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missed Opportunities */}
        <div className="bg-white rounded-3xl border border-[#39605B]/15 p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#426C62]">
            <AlertTriangle className="w-5 h-5 text-[#426C62]" />
            <h3 className="font-bold text-sm text-[#1A2928]">Key Missed Opportunities</h3>
          </div>
          <div className="space-y-2.5">
            {evaluation.missedOpportunities.map((miss, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-[#1A2928]/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#426C62] shrink-0 mt-1.5" />
                <span className="leading-relaxed">{miss}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Red Flags Audited */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 p-7 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#39605B]" />
          <h3 className="font-bold text-sm text-[#1A2928]">Critical Red Flags & Differential Screening</h3>
        </div>

        <div className="space-y-2.5">
          {evaluation.criticalRedFlagsAddressed.map((flag, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-4 bg-[#F7F4EE] border-[#39605B]/15 text-[#1A2928]"
            >
              <div className="flex items-center space-x-3">
                {flag.addressed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#39605B] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#426C62] shrink-0" />
                )}
                <div>
                  <span className="font-bold block">{flag.item}</span>
                  <span className="text-[11px] opacity-80">{flag.comment}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                flag.addressed ? 'bg-[#39605B]/15 text-[#39605B]' : 'bg-[#14302F] text-[#F2D7B8]'
              }`}>
                {flag.addressed ? 'Addressed' : 'Omitted'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Transcript Review */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#39605B]" />
            <h3 className="font-bold text-sm text-[#1A2928]">Encounter Transcript & Interaction Log</h3>
          </div>
          <span className="text-xs text-[#1A2928]/60 font-mono">{chatMessages.length} total events</span>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-2xl ${
                msg.sender === 'student'
                  ? 'bg-[#14302F] text-[#F7F4EE] border border-[#39605B]/30'
                  : msg.sender === 'patient'
                  ? 'bg-[#F7F4EE] border border-[#39605B]/15 text-[#1A2928]'
                  : 'bg-white border border-[#39605B]/20 text-[#1A2928]/70 font-mono text-[11px]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className={msg.sender === 'student' ? 'text-[#F2D7B8]' : 'text-[#39605B]'}>
                  {msg.sender === 'student' ? 'Student Doctor' : msg.sender === 'patient' ? clinicalCase.patient.name : 'Clinical Action'}
                </span>
                <span className="opacity-70">{msg.timestamp}</span>
              </div>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions & Recommendation Footer in Dark Green #102528 */}
      <div className="bg-[#102528] text-[#F7F4EE] rounded-3xl p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#39605B]/30">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-xs font-bold text-[#F2D7B8] uppercase tracking-widest">Recommended Next Practice</span>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F7F4EE]">Ready to cement your clinical skills?</h2>
          <p className="text-xs text-[#F7F4EE]/70 font-normal">
            Practice another clinical case or repeat this scenario to target identified blind spots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-full bg-[#14302F] hover:bg-[#14302F]/80 text-[#F7F4EE] text-xs font-semibold border border-[#39605B]/50 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F2D7B8]" />
            <span>Practice Case Again</span>
          </button>

          <button
            onClick={() => onNextCase(evaluation.nextRecommendedCaseId)}
            className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-bold shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>Next Recommended Case</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1A2928]" />
          </button>
        </div>
      </div>

    </div>
  );
};
