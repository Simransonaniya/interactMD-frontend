import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Stethoscope, 
  BrainCircuit, 
  Clock, 
  Play,
  ShieldCheck,
  FileText,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  HeartPulse,
  Microscope,
  Stethoscope as StethoscopeIcon,
  BadgeCheck,
  BookOpen
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';
import { CLINICAL_CASES } from '../data/cases';
import { fetchCases } from '../services/apiClient';

interface LandingPageProps {
  onStartCase: (c: ClinicalCase) => void;
  onExploreLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCase, onExploreLibrary }) => {
  const [cases, setCases] = useState<ClinicalCase[]>(CLINICAL_CASES);
  const [previewChat, setPreviewChat] = useState<{ sender: 'student' | 'patient'; text: string }[]>([
    { sender: 'patient', text: CLINICAL_CASES[0]?.patient.initialStatement || "Doctor, please... It feels like an elephant is sitting on my chest. The pain started 45 minutes ago and radiates to my jaw." }
  ]);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchCases()
      .then(data => {
        if (data && data.length > 0) {
          setCases(data);
          setPreviewChat([
            { sender: 'patient', text: data[0].patient.initialStatement || "Doctor, please... It feels like an elephant is sitting on my chest." }
          ]);
        }
      })
      .catch(() => {});
  }, []);


  const previewCase = cases.length > 0 ? cases[0] : null;

  const samplePrompts = [
    {
      q: "Can you describe the character of the pain and any radiation?",
      a: "It's a heavy, crushing pressure right behind my breastbone. It spreads up to my left jaw and shoulder."
    },
    {
      q: "Are you having any shortness of breath, nausea, or sweating?",
      a: "Yes, I feel short of breath and broke out into a cold sweat when the pain started while walking to the office."
    },
    {
      q: "Have you ever experienced pain like this before or had heart issues?",
      a: "Never this severe. I take Lisinopril for high blood pressure, but I have no previous history of heart attacks."
    }
  ];

  const handleTestPrompt = (idx: number) => {
    setSelectedPromptIndex(idx);
    setIsTyping(true);
    const item = samplePrompts[idx];
    const initialText = previewCase ? previewCase.patient.initialStatement : "Doctor, please... It feels like an elephant is sitting on my chest.";
    
    // Set student question immediately
    setPreviewChat([
      { sender: 'patient', text: initialText },
      { sender: 'student', text: item.q }
    ]);

    // Simulate natural AI patient response timing
    setTimeout(() => {
      setPreviewChat([
        { sender: 'patient', text: initialText },
        { sender: 'student', text: item.q },
        { sender: 'patient', text: item.a }
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1A2928] selection:bg-[#F2D7B8] selection:text-[#1A2928] flex flex-col">
      
      {/* Top Compact Live Banner */}
      <div className="bg-[#102528] border-b border-[#39605B]/30 text-[#F7F4EE] text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-[#F2D7B8] text-[#1A2928] text-[9px] font-bold uppercase tracking-wider shrink-0">
          CLINICAL SIMULATION ONLINE
        </span>
        <span className="text-[#F7F4EE]/90 truncate">
          Dynamic AI Patient Encounters, Bedside Physical Exam & Objective OSCE Scoring
        </span>
        <ArrowRight className="w-3 h-3 text-[#F2D7B8] shrink-0 hidden sm:inline" />
      </div>

      {/* Hero Section: Engineered to fit comfortably in 1 screen frame */}
      <section 
        className="relative overflow-hidden flex-1 flex flex-col justify-center py-6 sm:py-8 lg:py-10 text-[#F7F4EE]"
        style={{
          background: 'linear-gradient(180deg, #102528 0%, #14302F 35%, #39605B 75%, #426C62 100%)'
        }}
      >
        {/* Subtle organic light accent and radial mesh */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#39605B]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#14302F]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#102528]/80 border border-[#39605B]/70 text-[#F2D7B8] text-[11px] font-semibold backdrop-blur-md shadow-xs">
                <BrainCircuit className="w-3.5 h-3.5 text-[#F2D7B8] animate-pulse" />
                <span>Next-Gen Medical Simulation & OSCE Trainer</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-normal tracking-tight text-[#F7F4EE] leading-[1.12]">
                Master Bedside <br className="hidden sm:block" />
                <span className="italic font-light text-[#F2D7B8]">Clinical Encounters</span> Before Your Next OSCE
              </h1>

              <p className="text-xs sm:text-sm lg:text-[15px] text-[#F7F4EE]/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                InteractMD empowers medical students and residents with realistic, repeatable virtual patient clinics. Practice natural history taking, order physical exams and STAT labs, and receive instant 5-dimension objective grading.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2 relative z-20">
                <button
                  onClick={() => onStartCase(previewCase || CLINICAL_CASES[0])}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] active:scale-95 text-[#1A2928] font-bold text-xs sm:text-sm shadow-md hover:shadow-xl flex items-center justify-center space-x-2 transition-all group cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-[#1A2928] text-[#1A2928] transition-transform group-hover:scale-110" />
                  <span>Start Case: {previewCase ? previewCase.title : 'Acute Crushing Retrosternal Chest Pain'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onExploreLibrary}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-[#102528]/60 hover:bg-[#14302F] active:scale-95 text-[#F7F4EE] font-semibold text-xs sm:text-sm border border-[#39605B]/80 hover:border-[#F2D7B8]/70 flex items-center justify-center space-x-2 transition-all cursor-pointer backdrop-blur-md shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#F2D7B8]" />
                  <span>Browse {cases.length > 0 ? cases.length : 6} Benchmark Cases</span>
                </button>
              </div>

              {/* Clickable Trust Badges & Highlights */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs text-[#F7F4EE]/90 font-medium relative z-20">
                <button
                  onClick={onExploreLibrary}
                  className="flex items-center space-x-1.5 bg-[#14302F]/80 hover:bg-[#1E4543] active:scale-95 px-3 py-1.5 rounded-full border border-[#39605B]/60 hover:border-[#F2D7B8]/60 text-[#F7F4EE] cursor-pointer transition-all shadow-xs group"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-[#F2D7B8] group-hover:scale-110 transition-transform" />
                  <span>OSCE & USMLE Aligned</span>
                </button>

                <button
                  onClick={onExploreLibrary}
                  className="flex items-center space-x-1.5 bg-[#14302F]/80 hover:bg-[#1E4543] active:scale-95 px-3 py-1.5 rounded-full border border-[#39605B]/60 hover:border-[#F2D7B8]/60 text-[#F7F4EE] cursor-pointer transition-all shadow-xs group"
                >
                  <Award className="w-3.5 h-3.5 text-[#F2D7B8] group-hover:scale-110 transition-transform" />
                  <span>5-Dimension AI Rubric</span>
                </button>

                <button
                  onClick={onExploreLibrary}
                  className="flex items-center space-x-1.5 bg-[#14302F]/80 hover:bg-[#1E4543] active:scale-95 px-3 py-1.5 rounded-full border border-[#39605B]/60 hover:border-[#F2D7B8]/60 text-[#F7F4EE] cursor-pointer transition-all shadow-xs group"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-[#F2D7B8] group-hover:scale-110 transition-transform" />
                  <span>STAT Labs & ECGs</span>
                </button>
              </div>

            </div>

            {/* Right Column: Interactive Live Patient Simulation Teaser */}
            <div className="lg:col-span-5">
              
              <div className="bg-[#102528]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#39605B]/50 p-4 sm:p-5 text-[#F7F4EE] relative overflow-hidden transition-all hover:border-[#F2D7B8]/40">
                
                {/* Header with Patient Telemetry Readout */}
                <div className="flex items-center justify-between pb-3 border-b border-[#39605B]/40">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-2xl bg-[#14302F] border border-[#39605B] flex items-center justify-center text-[#F2D7B8] shadow-inner">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#102528] rounded-full animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#F7F4EE]">
                          {previewCase ? previewCase.patient.name : 'Robert Chen'}
                        </span>
                        <span className="text-[9px] bg-[#14302F] text-[#F2D7B8] font-semibold px-2 py-0.5 rounded-full border border-[#39605B]/60">
                          {previewCase ? previewCase.specialty : 'Cardiology'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#F7F4EE]/70 font-mono mt-0.5">
                        {previewCase 
                          ? `HR: ${previewCase.initialVitals.heartRate} bpm | BP: ${previewCase.initialVitals.bloodPressure} | SpO2: ${previewCase.initialVitals.oxygenSaturation}%` 
                          : 'HR: 88 bpm | BP: 130/85 | SpO2: 98%'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-[#F7F4EE]/60 uppercase tracking-widest font-mono">OSCE TIMER</span>
                    <div className="text-xs sm:text-sm font-mono font-bold text-[#F2D7B8]">15:00</div>
                  </div>
                </div>

                {/* Animated ECG Pulse Waveform Strip */}
                <div className="my-2.5 py-1.5 px-3 rounded-xl bg-[#14302F]/90 border border-[#39605B]/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartPulse className="w-3.5 h-3.5 text-[#F2D7B8] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#F7F4EE] font-semibold truncate max-w-[200px]">
                      {previewCase ? previewCase.title : 'Acute Retrosternal Chest Pain'}
                    </span>
                  </div>
                  {/* Subtle SVG ECG trace line */}
                  <div className="hidden sm:flex items-center space-x-1">
                    <svg className="w-16 h-4 text-[#F2D7B8]/80" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M0,12.5 L20,12.5 L25,3 L30,22 L35,8 L40,15 L45,12.5 L100,12.5" />
                    </svg>
                    <span className="text-[9px] font-mono text-[#1A2928] bg-[#F2D7B8] px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                  </div>
                </div>

                {/* Live Dialog Feed */}
                <div className="space-y-2 my-2.5 min-h-[90px] max-h-[120px] overflow-y-auto pr-1 text-xs">
                  {previewChat.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`max-w-[88%] rounded-2xl px-3 py-2 leading-relaxed ${
                        msg.sender === 'student' 
                          ? 'bg-[#39605B] text-[#F7F4EE] rounded-br-xs border border-[#426C62]' 
                          : 'bg-[#14302F] text-[#F7F4EE]/90 border border-[#39605B]/50 rounded-bl-xs'
                      }`}>
                        <div className="text-[9px] text-[#F2D7B8] font-semibold mb-0.5">
                          {msg.sender === 'student' ? 'Student Doctor' : (previewCase ? `${previewCase.patient.name} (Patient)` : 'Patient')}
                        </div>
                        <p className="text-[11px] leading-snug">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#14302F] px-3 py-1.5 rounded-2xl border border-[#39605B]/50 flex items-center space-x-1.5 text-[10px] text-[#F2D7B8]">
                        <span className="w-1.5 h-1.5 bg-[#F2D7B8] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#F2D7B8] rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#F2D7B8] rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="ml-1 text-[#F7F4EE]/70 font-mono">Patient is responding...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Question Prompts & Trigger */}
                <div className="pt-2.5 border-t border-[#39605B]/40">
                  <div className="text-[10px] text-[#F7F4EE]/70 mb-1.5 font-medium flex items-center justify-between">
                    <span>Try asking a clinical history question:</span>
                    <span className="text-[9px] text-[#F2D7B8] font-bold">CLICK TO TEST</span>
                  </div>
                  <div className="space-y-1">
                    {samplePrompts.slice(0, 2).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestPrompt(idx)}
                        className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          selectedPromptIndex === idx
                            ? 'bg-[#39605B]/70 border-[#F2D7B8] text-[#F7F4EE]'
                            : 'bg-[#14302F]/80 hover:bg-[#14302F] border-[#39605B]/50 text-[#F7F4EE]/80'
                        }`}
                      >
                        <span className="truncate pr-2">{item.q}</span>
                        <ChevronRight className="w-3 h-3 shrink-0 text-[#F2D7B8]" />
                      </button>
                    ))}
                  </div>

                  {previewCase && (
                    <button
                      onClick={() => onStartCase(previewCase)}
                      className="w-full mt-2.5 py-2 px-3 rounded-xl bg-[#F2D7B8] text-[#1A2928] text-xs font-bold hover:bg-[#F8E9D7] transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-[#1A2928]" />
                      <span>Launch Full Encounter ({previewCase.title})</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4 Pillars Clinical Capability Bento Grid */}
      <section className="py-12 sm:py-16 bg-[#F7F4EE] border-b border-[#39605B]/15">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#39605B]" />
              <span>Full-Spectrum Virtual Clinic</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1A2928] tracking-tight">
              Bridging Theory to Bedside Competency
            </h2>
            <p className="text-xs sm:text-sm text-[#1A2928]/70 mt-2">
              Every encounter mirrors authentic hospital workflow: subjective history, objective maneuvers, diagnostic labs, and evidence-based AI attending feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl p-5 border border-[#39605B]/20 shadow-xs hover:shadow-md hover:border-[#39605B]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1A2928] mb-1.5">Dynamic AI Patient Dialogue</h3>
                <p className="text-xs text-[#1A2928]/70 leading-relaxed font-normal">
                  Engage in spontaneous, unscripted clinical conversations. The AI patient faithfully portrays symptoms, emotional stress, and medical history.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#39605B]/10 text-[11px] font-semibold text-[#39605B] flex items-center">
                <span>Natural OPQRST History</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl p-5 border border-[#39605B]/20 shadow-xs hover:shadow-md hover:border-[#39605B]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                  <StethoscopeIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1A2928] mb-1.5">Bedside Physical Examination</h3>
                <p className="text-xs text-[#1A2928]/70 leading-relaxed font-normal">
                  Perform targeted cardiovascular auscultation, pulmonary tests, abdominal palpation, and neurological exams with clinically accurate findings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#39605B]/10 text-[11px] font-semibold text-[#39605B] flex items-center">
                <span>System-by-System Maneuvers</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl p-5 border border-[#39605B]/20 shadow-xs hover:shadow-md hover:border-[#39605B]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1A2928] mb-1.5">STAT Diagnostic Labs & Imaging</h3>
                <p className="text-xs text-[#1A2928]/70 leading-relaxed font-normal">
                  Order 12-Lead ECGs, Troponin-I, CT Angiography, Chest X-Rays, and Arterial Blood Gases with immediate results and reference intervals.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#39605B]/10 text-[11px] font-semibold text-[#39605B] flex items-center">
                <span>Real Diagnostic Telemetry</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white rounded-2xl p-5 border border-[#39605B]/20 shadow-xs hover:shadow-md hover:border-[#39605B]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1A2928] mb-1.5">Objective 5-Dimension Rubric</h3>
                <p className="text-xs text-[#1A2928]/70 leading-relaxed font-normal">
                  Get granular scoring on History Thoroughness, Exam Selection, Diagnostic Reasoning, Management Precision, and Bedside Empathy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#39605B]/10 text-[11px] font-semibold text-[#39605B] flex items-center">
                <span>OSCE & Attending Insights</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Benchmark Scenarios Showcase */}
      <section className="py-12 sm:py-16 bg-[#F7F4EE]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-2">
                <span>Core Benchmark Scenarios</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1A2928] tracking-tight">
                High-Yield Emergency & Outpatient Cases
              </h2>
            </div>
            
            <button
              onClick={onExploreLibrary}
              className="mt-3 md:mt-0 inline-flex items-center text-xs font-bold text-[#39605B] hover:text-[#102528] transition-colors cursor-pointer"
            >
              <span>Explore All {cases.length} Cases</span>
              <ArrowRight className="w-4 h-4 ml-1.5 text-[#39605B]" />
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#39605B]/20 p-6">
              <Activity className="w-8 h-8 text-[#39605B] mx-auto mb-2 animate-spin" />
              <h4 className="text-sm font-bold text-[#1A2928]">Connecting to Database...</h4>
              <p className="text-xs text-[#1A2928]/60 mt-1 max-w-sm mx-auto">
                Loading validated OSCE clinical simulation cases from the platform database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cases.slice(0, 4).map((c) => (
                <div 
                  key={c.id}
                  className="bg-white border border-[#39605B]/15 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#39605B]/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                        {c.specialty}
                      </span>
                      <span className="text-[10px] text-[#1A2928]/60 font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-[#39605B]" />
                        {c.estimatedMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1A2928] text-sm mb-1.5 group-hover:text-[#39605B] transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-[#1A2928]/70 line-clamp-2 mb-3 leading-relaxed font-normal">
                      {c.shortDescription}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 pt-3 border-t border-[#39605B]/15 mb-3">
                      <img src={c.patient.avatarUrl} alt={c.patient.name} className="w-7 h-7 rounded-full object-cover border border-[#39605B]/30 shrink-0" />
                      <div className="text-[11px] truncate">
                        <span className="font-bold text-[#1A2928]">{c.patient.name}</span>
                        <span className="text-[#1A2928]/60"> ({c.patient.age}y, {c.patient.gender})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartCase(c)}
                      className="w-full py-2 px-3 rounded-full bg-[#F7F4EE] border border-[#39605B]/25 group-hover:bg-[#F2D7B8] group-hover:border-[#F2D7B8] group-hover:text-[#1A2928] text-[#1A2928] text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Simulation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#102528] text-[#F7F4EE] border-t border-[#39605B]/30 py-6 px-4 sm:px-6 lg:px-10 text-center text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#F2D7B8]" />
            <span className="font-bold tracking-tight">INTERACT<span className="text-[#F2D7B8]">MD</span></span>
            <span className="text-[#F7F4EE]/50">| Next-Generation Clinical Medical Simulation Platform</span>
          </div>
          <div className="text-[#F7F4EE]/60 text-[11px]">
            Designed for Medical Schools, Residency Programs & Clinical Skills Centers
          </div>
        </div>
      </footer>

    </div>
  );
};
