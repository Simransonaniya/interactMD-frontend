import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Clock, 
  Stethoscope, 
  FlaskConical, 
  FileEdit, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  MessageSquare,
  Activity
} from 'lucide-react';
import { ClinicalCase, ChatMessage, PhysicalFinding, InvestigationResult } from '../types/clinical';
import { checkBackendStatus, sendPatientChatMessage, performPhysicalExam, orderInvestigation, fetchCaseDetail, BackendStatus } from '../services/apiClient';

interface SimulationRoomProps {
  clinicalCase: ClinicalCase;
  onFinishEncounter: (data: {
    messages: ChatMessage[];
    performedExamIds: string[];
    orderedInvestigationIds: string[];
    durationSeconds: number;
  }) => void;
  onExit: () => void;
  sessionId?: string | null;
}

export const SimulationRoom: React.FC<SimulationRoomProps> = ({
  clinicalCase,
  onFinishEncounter,
  onExit,
  sessionId
}) => {
  const [caseData, setCaseData] = useState<ClinicalCase>(clinicalCase);

  // Auto-fetch full case details from MongoDB if physical findings or investigations are empty
  useEffect(() => {
    if (!caseData.physicalFindings || caseData.physicalFindings.length === 0 || !caseData.investigations || caseData.investigations.length === 0) {
      fetchCaseDetail(clinicalCase.id)
        .then(detailed => {
          if (detailed) {
            setCaseData(detailed);
            setMessages(prev => {
              if (prev.length === 1 && prev[0].id === 'msg-init-patient') {
                return [{
                  id: 'msg-init-patient',
                  sender: 'patient',
                  text: detailed.patient.initialStatement,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  category: 'General'
                }];
              }
              return prev;
            });
          }
        })
        .catch(err => console.warn('[SimulationRoom] fetchCaseDetail error:', err));
    }
  }, [clinicalCase.id]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-patient',
      sender: 'patient',
      text: clinicalCase.patient.initialStatement,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'General'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active right-panel tab for exams/labs/notes
  const [activeTab, setActiveTab] = useState<'exam' | 'investigations' | 'notes'>('exam');

  // Mobile active workspace switcher (Chat vs Clinical Suite) for < lg screens
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'chat' | 'clinical'>('chat');

  // Clinical actions state
  const [performedExamIds, setPerformedExamIds] = useState<string[]>([]);
  const [orderedInvestigationIds, setOrderedInvestigationIds] = useState<string[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Timer state (15:00 countdown)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerPaused] = useState(false);
  const totalMinutes = clinicalCase.estimatedMinutes || 15;
  const remainingSeconds = Math.max(0, totalMinutes * 60 - elapsedSeconds);

  // Check backend health on mount
  useEffect(() => {
    checkBackendStatus().then(status => {
      setBackendStatus(status);
    });
  }, []);

  useEffect(() => {
    if (isTimerPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mobileWorkspaceView, isTyping]);

  // Synchronous submission lock to prevent duplicate/concatenated requests
  const isSubmittingRef = useRef(false);

  // Voice toggle & real browser SpeechRecognition integration
  const recognitionRef = useRef<any>(null);

  const toggleVoiceMode = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsVoiceActive(!isVoiceActive);
      return;
    }

    if (isVoiceActive) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsVoiceActive(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onstart = () => setIsVoiceActive(true);
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText('');
            handleSendMessage(transcript);
          }
        };
        rec.onerror = () => setIsVoiceActive(false);
        rec.onend = () => setIsVoiceActive(false);
        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.warn('[Voice Recognition]', err);
        setIsVoiceActive(!isVoiceActive);
      }
    }
  };

  // Send message handler with async AI patient backend
  const handleSendMessage = async (textToSend?: string) => {
    if (isSubmittingRef.current) return;

    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    // Immediately acquire lock and clear input state to prevent any concatenation
    isSubmittingRef.current = true;
    setInputText('');
    setErrorMessage(null);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const studentMessage: ChatMessage = {
      id: `msg-${Date.now()}-std`,
      sender: 'student',
      text,
      timestamp: timeString,
      category: 'General'
    };

    const newHistory = [...messages, studentMessage];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const responseData = await sendPatientChatMessage(caseData, text, newHistory, sessionId);
      const patientMessage: ChatMessage = {
        id: `msg-${Date.now()}-pt`,
        sender: 'patient',
        text: responseData.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: responseData.category,
        empathyDetected: responseData.empathyDetected
      };
      setMessages(prev => [...prev, patientMessage]);
      if (responseData.suggestedTopics && responseData.suggestedTopics.length > 0) {
        setSuggestedFollowUps(responseData.suggestedTopics);
      }
    } catch (err: any) {
      console.error('[Simulation Error]', err);
      const errAlert = err.message || 'Unable to connect to the simulation server. Please check that the backend is running.';
      setErrorMessage(errAlert);
      
      const errorSystemMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'system',
        text: `⚠️ [Simulation Server Error]: ${errAlert}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'General'
      };
      setMessages(prev => [...prev, errorSystemMessage]);
    } finally {
      setIsTyping(false);
      isSubmittingRef.current = false;
    }
  };

  // Quick Prompt Chips
  const quickPrompts = [
    { label: "Describe Pain", query: "Can you describe what the pain feels like?" },
    { label: "Onset & Timing", query: "When did this start and how long has it lasted?" },
    { label: "Radiation", query: "Does the pain radiate to your jaw, back, or arms?" },
    { label: "Severity (1-10)", query: "On a scale of 1 to 10, how severe is your discomfort right now?" },
    { label: "Sweating / Nausea", query: "Have you experienced any cold sweats, nausea, or vomiting?" },
    { label: "Shortness of Breath", query: "Are you feeling short of breath or wheezing?" },
    { label: "Past Medical History", query: "Do you have any chronic medical conditions or past surgeries?" },
    { label: "Current Medications", query: "What prescription medications or inhalers do you take daily?" },
    { label: "Allergies", query: "Do you have any drug or environmental allergies?" },
    { label: "Smoking / Alcohol", query: "Do you smoke, drink alcohol, or use any recreational substances?" },
    { label: "Bedside Reassurance", query: "We are going to take good care of you. Try to rest and take a slow breath." }
  ];

  // Perform Physical Exam via backend
  const handlePerformExam = async (exam: PhysicalFinding) => {
    if (performedExamIds.includes(exam.id)) return;
    
    try {
      const finding = await performPhysicalExam(sessionId, caseData.id, exam.id, exam.system);
      setPerformedExamIds(prev => [...prev, exam.id]);
      const examMsg: ChatMessage = {
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        text: `[Physical Examination] ${finding.system || exam.system} — ${finding.finding || exam.name}: ${finding.value || 'Normal findings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Exam'
      };
      setMessages(prev => [...prev, examMsg]);
    } catch (err: any) {
      console.error('[Exam Error]', err);
      const errText = err.message || 'Unable to connect to the simulation server to perform physical examination.';
      setErrorMessage(errText);
      const examMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'system',
        text: `⚠️ [Simulation Server Error]: ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Exam'
      };
      setMessages(prev => [...prev, examMsg]);
    }
  };

  // Order Investigation via backend
  const handleOrderInvestigation = async (inv: InvestigationResult) => {
    if (orderedInvestigationIds.includes(inv.id)) return;

    try {
      const result = await orderInvestigation(sessionId, caseData.id, inv.id);
      setOrderedInvestigationIds(prev => [...prev, inv.id]);
      const invMsg: ChatMessage = {
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        text: `[STAT Diagnostic Ordered] ${result.name || inv.name} returned: ${result.result || result.interpretation || 'Completed'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Investigation'
      };
      setMessages(prev => [...prev, invMsg]);
    } catch (err: any) {
      console.error('[Investigation Error]', err);
      const errText = err.message || 'Unable to connect to the simulation server to order diagnostic test.';
      setErrorMessage(errText);
      const invMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'system',
        text: `⚠️ [Simulation Server Error]: ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Investigation'
      };
      setMessages(prev => [...prev, invMsg]);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const v = caseData.initialVitals;
  const p = caseData.patient;

  return (
    <div className="flex flex-col h-screen bg-[#F7F4EE] text-[#1A2928] overflow-hidden">
      
      {/* Top Telemetry & Patient Monitor Bar (#102528 Dark Header) */}
      <div className="bg-[#102528] text-[#F7F4EE] px-3 sm:px-6 py-2.5 border-b border-[#39605B]/40 shadow-sm shrink-0">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Exit / Back button + Patient Badge & State */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <button
              onClick={onExit}
              title="Exit simulation session and return to dashboard"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#14302F] hover:bg-[#1A3F3D] text-[#F7F4EE]/90 hover:text-[#F2D7B8] border border-[#39605B]/50 text-xs font-semibold transition-all cursor-pointer mr-0.5 sm:mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#F2D7B8]" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className="relative">
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#39605B]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F2D7B8] border-2 border-[#102528] rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-xs sm:text-sm text-[#F7F4EE]">{p.name}</span>
                <span className="text-[10px] text-[#F7F4EE]/60 hidden xs:inline">({p.age}y {p.gender})</span>
                <span className="text-[9px] sm:text-[10px] bg-[#14302F] text-[#F2D7B8] font-semibold px-2 py-0.5 rounded-full border border-[#39605B]/50">
                  {clinicalCase.specialty}
                </span>
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#14302F] text-[#F7F4EE] border border-[#39605B]/50">
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {backendStatus?.isOnline ? 'AI Backend: Live' : 'Simulation Engine'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#F7F4EE]/70 italic truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                Mood: {p.mood}
              </p>
            </div>
          </div>

          {/* Vitals Telemetry (Visible on md+ screens) */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 font-mono text-xs bg-[#14302F] px-3 lg:px-4 py-1.5 rounded-full border border-[#39605B]/40 shrink-0">
            <div className="flex items-center space-x-1.5 text-[#F2D7B8]">
              <Heart className="w-3.5 h-3.5 text-[#F2D7B8] animate-pulse" />
              <span>HR: <strong className="text-white">{v.heartRate}</strong></span>
            </div>
            <span className="text-[#39605B]">|</span>
            <div className="text-[#F7F4EE]">
              BP: <strong className="text-white">{v.bloodPressure}</strong>
            </div>
            <span className="text-[#39605B]">|</span>
            <div className="text-[#F7F4EE]">
              RR: <strong className="text-white">{v.respiratoryRate}</strong>
            </div>
            <span className="text-[#39605B]">|</span>
            <div className="text-[#F7F4EE]">
              SpO2: <strong className="text-white">{v.oxygenSaturation}%</strong>
            </div>
            <span className="text-[#39605B]">|</span>
            <div className="text-[#F7F4EE]">
              Temp: <strong className="text-white">{v.temperature}°C</strong>
            </div>
          </div>

          {/* Timer & Finish Encounter CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#14302F] px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#39605B]/40">
              <Clock className="w-3.5 h-3.5 text-[#F2D7B8]" />
              <div className="font-mono text-xs font-bold text-[#F2D7B8]">
                {formatTimer(remainingSeconds)}
              </div>
            </div>

            <button
              onClick={() => onFinishEncounter({
                messages,
                performedExamIds,
                orderedInvestigationIds,
                durationSeconds: elapsedSeconds
              })}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Finish & </span>Diagnose
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Telemetry Quick Strip (Visible on mobile/tablet when md vitals bar is hidden) */}
      <div className="md:hidden bg-[#14302F] text-[#F7F4EE] px-4 py-1.5 border-b border-[#39605B]/30 flex items-center justify-between text-[11px] font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center space-x-3">
          <span className="text-[#F2D7B8] font-bold flex items-center space-x-1">
            <Heart className="w-3 h-3 text-[#F2D7B8] animate-pulse" />
            <span>HR {v.heartRate}</span>
          </span>
          <span className="text-[#39605B]">|</span>
          <span>BP {v.bloodPressure}</span>
          <span className="text-[#39605B]">|</span>
          <span>RR {v.respiratoryRate}</span>
          <span className="text-[#39605B]">|</span>
          <span>SpO2 {v.oxygenSaturation}%</span>
          <span className="text-[#39605B]">|</span>
          <span>{v.temperature}°C</span>
        </div>
      </div>

      {/* Mobile Workspace Mode Switcher (Visible ONLY on < lg screens) */}
      <div className="lg:hidden bg-white border-b border-[#39605B]/15 px-3 py-2 flex items-center justify-center space-x-2 shrink-0">
        <button
          onClick={() => setMobileWorkspaceView('chat')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileWorkspaceView === 'chat'
              ? 'bg-[#14302F] text-[#F2D7B8] shadow-xs'
              : 'text-[#1A2928]/70 bg-[#F7F4EE] hover:bg-[#39605B]/10'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Patient Dialogue ({messages.length})</span>
        </button>

        <button
          onClick={() => setMobileWorkspaceView('clinical')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileWorkspaceView === 'clinical'
              ? 'bg-[#14302F] text-[#F2D7B8] shadow-xs'
              : 'text-[#1A2928]/70 bg-[#F7F4EE] hover:bg-[#39605B]/10'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Clinical Suite ({performedExamIds.length + orderedInvestigationIds.length})</span>
        </button>
      </div>

      {/* Main Clinical Workspace (Split on lg+, Tab-switched on mobile) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left: AI Patient Conversation Area (Shown always on lg+, and on mobile when mobileWorkspaceView === 'chat') */}
        <div className={`lg:col-span-7 flex flex-col bg-white border-r border-[#39605B]/15 overflow-hidden ${
          mobileWorkspaceView === 'chat' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Active dialogue header note */}
          <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#F7F4EE] border-b border-[#39605B]/15 flex items-center justify-between text-xs text-[#1A2928]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#39605B] shrink-0" />
              <span className="font-medium text-[#1A2928]/80 text-[11px] sm:text-xs truncate">
                Ask focused history questions or click guided OPQRST prompts below.
              </span>
            </div>
            {isVoiceActive && (
              <span className="flex items-center space-x-1 text-[#39605B] font-semibold animate-pulse text-[11px] shrink-0 ml-2">
                <span className="w-2 h-2 rounded-full bg-[#39605B]"></span>
                <span className="hidden sm:inline">Voice Listening</span>
              </span>
            )}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-[#FAF9F5]">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/20 text-xs text-[#1A2928] font-mono flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-[#39605B] shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      {msg.text}
                      <span className="text-[10px] text-[#1A2928]/50 ml-2">({msg.timestamp})</span>
                    </div>
                  </div>
                );
              }

              const isStudent = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStudent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isStudent
                      ? 'bg-[#14302F] text-[#F7F4EE] rounded-br-xs shadow-xs border border-[#39605B]/40'
                      : 'bg-white text-[#1A2928] border border-[#39605B]/20 rounded-bl-xs shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold mb-1">
                      <span className={isStudent ? 'text-[#F2D7B8]' : 'text-[#39605B]'}>
                        {isStudent ? 'Dr. Sarah (You)' : p.name}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="break-words">{msg.text}</div>
                    {msg.empathyDetected && (
                      <div className="mt-2 pt-1.5 border-t border-[#39605B]/30 text-[10px] text-[#F2D7B8] font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#F2D7B8]" />
                        <span>Bedside Empathy Recognized</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Realtime Patient Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="rounded-2xl rounded-bl-xs p-3 sm:p-4 bg-white border border-[#39605B]/20 text-xs text-[#39605B] shadow-2xs flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39605B] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39605B] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39605B] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-[#1A2928]/60 font-medium pl-1">{p.name} is responding...</span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* AI Attending Dynamic Follow-up Suggestions */}
          {suggestedFollowUps.length > 0 && (
            <div className="px-3 py-1.5 bg-[#F2D7B8]/20 border-t border-[#39605B]/15 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
              <span className="font-bold flex items-center gap-1 text-[#39605B] shrink-0">
                <Sparkles className="w-3 h-3 text-[#39605B]" /> Follow-up:
              </span>
              {suggestedFollowUps.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(tip)}
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#F2D7B8] border border-[#39605B]/30 text-[10.5px] font-medium transition-all shrink-0 cursor-pointer text-[#1A2928]"
                >
                  {tip}
                </button>
              ))}
            </div>
          )}

          {/* Quick Guided Prompt Chips */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-[#39605B]/15 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#39605B] uppercase tracking-wider pl-1 pr-1.5 shrink-0">History:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-[#F7F4EE] hover:bg-[#F2D7B8]/50 text-[#1A2928] border border-[#39605B]/20 text-[11px] sm:text-xs font-medium transition-all shrink-0 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Area (text-base on mobile prevents iOS auto-zoom, sm:text-sm for desktop) */}
          <div className="p-2.5 sm:p-3.5 bg-white border-t border-[#39605B]/15 flex items-center space-x-2">
            <button
              onClick={toggleVoiceMode}
              title={isVoiceActive ? "Turn off voice input" : "Turn on simulated voice dictation"}
              className={`p-2.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                isVoiceActive 
                  ? 'bg-[#14302F] text-[#F2D7B8] border-[#39605B]' 
                  : 'bg-[#F7F4EE] text-[#1A2928] border-[#39605B]/20 hover:bg-[#F2D7B8]/30'
              }`}
            >
              {isVoiceActive ? <Mic className="w-4 h-4 text-[#F2D7B8]" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask a clinical question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-full border border-[#39605B]/20 text-base sm:text-xs md:text-sm text-[#1A2928] focus:outline-none focus:ring-2 focus:ring-[#39605B] bg-[#F7F4EE]/40"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#14302F] hover:bg-[#102528] disabled:opacity-40 text-[#F2D7B8] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right: Progressive Clinical Action Suite (Shown always on lg+, and on mobile when mobileWorkspaceView === 'clinical') */}
        <div className={`lg:col-span-5 flex flex-col bg-[#F7F4EE] overflow-hidden ${
          mobileWorkspaceView === 'clinical' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Tab Selection */}
          <div className="flex border-b border-[#39605B]/15 bg-white p-2 space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'exam'
                  ? 'bg-[#14302F] text-[#F2D7B8] shadow-xs'
                  : 'text-[#1A2928]/70 hover:bg-[#F7F4EE]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Exam ({performedExamIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('investigations')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'investigations'
                  ? 'bg-[#14302F] text-[#F2D7B8] shadow-xs'
                  : 'text-[#1A2928]/70 hover:bg-[#F7F4EE]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Labs ({orderedInvestigationIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-[#14302F] text-[#F2D7B8] shadow-xs'
                  : 'text-[#1A2928]/70 hover:bg-[#F7F4EE]'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          </div>

          {/* Tab 1: Physical Examination */}
          {activeTab === 'exam' && (
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
              <div className="text-xs text-[#1A2928]/70">
                Select targeted bedside physical exam maneuvers to uncover objective clinical signs:
              </div>

              <div className="space-y-3">
                {(caseData.physicalFindings || []).map((exam) => {
                  const isDone = performedExamIds.includes(exam.id);

                  return (
                    <div
                      key={exam.id}
                      className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all ${
                        isDone
                          ? 'bg-white border-[#39605B]/40 shadow-xs'
                          : 'bg-white border-[#39605B]/15 hover:border-[#39605B]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                            {exam.system}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1A2928] mt-1.5">
                            {exam.name}
                          </h4>
                          <p className="text-[11px] text-[#1A2928]/60 mt-0.5">{exam.actionLabel}</p>
                        </div>

                        <button
                          onClick={() => handlePerformExam(exam)}
                          disabled={isDone}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            isDone
                              ? 'bg-[#39605B]/15 text-[#39605B] border border-[#39605B]/30 cursor-default'
                              : 'bg-[#14302F] hover:bg-[#102528] text-[#F2D7B8] shadow-xs'
                          }`}
                        >
                          {isDone ? (
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#39605B]" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <span>Perform</span>
                          )}
                        </button>
                      </div>

                      {/* Revealed Findings */}
                      {isDone && (
                        <div className="mt-3 pt-3 border-t border-[#39605B]/15 space-y-2 animate-fade-in">
                          <div className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15 text-xs text-[#1A2928] leading-relaxed">
                            <span className="font-bold text-[#1A2928]">Findings: </span>
                            {exam.findingDescription}
                          </div>

                          {exam.clinicalSignificance && (
                            <div className="text-[11px] text-[#14302F] bg-[#14302F]/10 p-2.5 rounded-2xl border border-[#39605B]/20 flex items-start space-x-1.5">
                              <Info className="w-3.5 h-3.5 text-[#39605B] shrink-0 mt-0.5" />
                              <span>{exam.clinicalSignificance}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Investigations & Diagnostics */}
          {activeTab === 'investigations' && (
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
              <div className="text-xs text-[#1A2928]/70">
                Order STAT diagnostic lab tests, point-of-care telemetry, and imaging:
              </div>

              <div className="space-y-3">
                {(caseData.investigations || []).map((inv) => {
                  const isOrdered = orderedInvestigationIds.includes(inv.id);

                  return (
                    <div
                      key={inv.id}
                      className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all ${
                        isOrdered
                          ? 'bg-white border-[#39605B]/40 shadow-xs'
                          : 'bg-white border-[#39605B]/15 hover:border-[#39605B]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                              {inv.category}
                            </span>
                            <span className="text-[10px] text-[#1A2928]/60">
                              TAT: ~{inv.turnaroundMinutes}m
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1A2928] mt-1.5">
                            {inv.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleOrderInvestigation(inv)}
                          disabled={isOrdered}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            isOrdered
                              ? 'bg-[#39605B]/15 text-[#39605B] border border-[#39605B]/30 cursor-default'
                              : 'bg-[#14302F] hover:bg-[#102528] text-[#F2D7B8] shadow-xs'
                          }`}
                        >
                          {isOrdered ? (
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#39605B]" />
                              <span>Ready</span>
                            </span>
                          ) : (
                            <span>Order</span>
                          )}
                        </button>
                      </div>

                      {/* Revealed Results */}
                      {isOrdered && (
                        <div className="mt-3 pt-3 border-t border-[#39605B]/15 space-y-2.5 animate-fade-in">
                          {inv.value && (
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="text-[#1A2928]/60">Readout:</span>
                              <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8]">
                                {inv.value}
                              </span>
                              {inv.normalRange && (
                                <span className="text-[11px] text-[#1A2928]/60">Normal: {inv.normalRange}</span>
                              )}
                            </div>
                          )}

                          <div className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15 text-xs text-[#1A2928] leading-relaxed">
                            <span className="font-bold text-[#1A2928]">Interpretation: </span>
                            {inv.interpretation}
                          </div>

                          {/* Specific Visual Mockups (e.g. ECG Strip) */}
                          {inv.imageUrl === 'ecg_inferior_stemi' && (
                            <div className="bg-[#102528] rounded-2xl p-3 sm:p-3.5 border border-[#39605B]/40 text-[#F7F4EE] space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#F2D7B8]">
                                <span>12-LEAD STAT ECG STRIP</span>
                                <span>25mm/s • 10mm/mV</span>
                              </div>
                              <div className="h-16 w-full rounded-xl bg-[#14302F] border border-[#39605B]/30 flex items-center justify-center relative overflow-hidden ecg-grid-dark">
                                <svg className="w-full h-12" viewBox="0 0 500 60" preserveAspectRatio="none">
                                  <path
                                    d="M0 30 L50 30 L60 30 L65 24 L70 30 L80 30 L85 36 L90 2 L95 48 L100 24 L110 24 L130 15 L145 30 L200 30 L210 30 L215 24 L220 30 L230 30 L235 36 L240 2 L245 48 L250 24 L260 24 L280 15 L295 30 L350 30 L360 30 L365 24 L370 30 L380 30 L385 36 L390 2 L395 48 L400 24 L410 24 L430 15 L445 30 L500 30"
                                    fill="none"
                                    stroke="#F2D7B8"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                              <p className="text-[10px] font-mono text-[#F2D7B8]">
                                MARKED ST-ELEVATION IN LEADS II, III, aVF. RECIPROCAL DEPRESSION IN I, aVL.
                              </p>
                            </div>
                          )}

                          <ul className="text-[11px] text-[#1A2928]/70 space-y-1 list-disc list-inside">
                            {inv.findingsDetail.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Clinical Notes & Differential Scratchpad */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-3.5 sm:p-5 flex flex-col space-y-3">
              <div className="text-xs text-[#1A2928]/70">
                Jot down your Pertinent Positives, Negatives, and Working Hypotheses:
              </div>

              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Example:
- Pertinent Positives: Retrosternal crushing pain, diaphoresis, radiating to jaw, ST elevations II/III/aVF.
- Pertinent Negatives: No tearing back pain, no wheezing, normal mediastinum.
- Working Differential: 1. Inferior STEMI  2. Aortic Dissection  3. Pulmonary Embolism..."
                className="flex-1 p-3.5 sm:p-4 rounded-2xl border border-[#39605B]/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#39605B] bg-white text-[#1A2928] resize-none"
              />

              <div className="text-[11px] text-[#1A2928]/60 flex items-center justify-between">
                <span>Notes auto-save during encounter</span>
                <span>{clinicalNotes.length} characters</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
