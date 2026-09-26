import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { CaseLibrary } from './views/CaseLibrary';
import { LearnerDashboard } from './views/LearnerDashboard';
import { SimulationRoom } from './views/SimulationRoom';
import { EvaluationView } from './views/EvaluationView';
import { AdminCMS } from './views/AdminCMS';
import { EducatorAnalytics } from './views/EducatorAnalytics';
import { CaseDetailModal } from './views/CaseDetailModal';
import { DiagnosisModal } from './views/DiagnosisModal';
import { LoginPage } from './views/LoginPage';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';

import { ClinicalCase, ChatMessage, EvaluationResult } from './types/clinical';
import { CLINICAL_CASES } from './data/cases';
import { submitEncounterEvaluation, startSimulationSession, fetchCaseDetail } from './services/apiClient';

const MainContent: React.FC = () => {
  // Navigation View
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard' | 'library' | 'simulation' | 'evaluation' | 'admin' | 'educator'>('landing');

  // Selected Case & Session
  const [activeCase, setActiveCase] = useState<ClinicalCase | null>(null);
  const [previewModalCase, setPreviewModalCase] = useState<ClinicalCase | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Encounter State
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState<{
    messages: ChatMessage[];
    performedExamIds: string[];
    orderedInvestigationIds: string[];
    durationSeconds: number;
  } | null>(null);

  // Evaluation Result
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // Handlers - Instant view switch, background session initialization
  const handleStartCase = (c?: ClinicalCase | null) => {
    const targetCase = c || activeCase || CLINICAL_CASES[0];
    setActiveCase(targetCase);
    setPreviewModalCase(null);
    setHasActiveSession(true);
    setEvaluationResult(null);
    setCurrentView('simulation');

    (async () => {
      try {
        const detailed = await fetchCaseDetail(targetCase.id);
        if (detailed) {
          setActiveCase(detailed);
        }
      } catch (err) {
        console.warn('[App] Could not fetch detailed case:', err);
      }

      try {
        const sessionId = await startSimulationSession(targetCase.id);
        setActiveSessionId(sessionId);
      } catch (err) {
        setActiveSessionId(`session_${targetCase.id}_${Date.now()}`);
      }
    })();
  };

  const handleOpenCaseBrief = (c: ClinicalCase) => {
    setPreviewModalCase(c);
  };

  const handleFinishEncounterFromRoom = (data: {
    messages: ChatMessage[];
    performedExamIds: string[];
    orderedInvestigationIds: string[];
    durationSeconds: number;
  }) => {
    setActiveSessionData(data);
    setIsDiagnosisModalOpen(true);
  };

  const handleSubmitDiagnosis = async (submission: {
    primaryDiagnosisId: string;
    differentialIds: string[];
    selectedManagementIds: string[];
    clinicalRationale: string;
  }) => {
    if (!activeCase || !activeSessionData) return;

    const evalResult = await submitEncounterEvaluation(
      activeCase,
      activeSessionData.messages,
      activeSessionData.performedExamIds,
      activeSessionData.orderedInvestigationIds,
      submission.primaryDiagnosisId,
      submission.differentialIds,
      submission.selectedManagementIds,
      submission.clinicalRationale,
      activeSessionData.durationSeconds,
      activeSessionId
    );

    setEvaluationResult(evalResult);
    setIsDiagnosisModalOpen(false);
    setHasActiveSession(false);
    setCurrentView('evaluation');
  };

  const handleRetryCase = () => {
    if (activeCase) {
      handleStartCase(activeCase);
    } else {
      handleStartCase(CLINICAL_CASES[0]);
    }
  };

  const handleNextCase = (c: ClinicalCase) => {
    handleStartCase(c);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1A2928] flex flex-col font-sans selection:bg-[#F2D7B8] selection:text-[#1A2928]">
      
      {/* Top Navigation - Hidden when in active patient simulation room */}
      {currentView !== 'simulation' && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          activeCase={activeCase}
          hasActiveSession={hasActiveSession}
          onStartOSCECase={() => handleStartCase(activeCase || CLINICAL_CASES[0])}
          onOpenAuthModal={() => setCurrentView('login')}
        />
      )}

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartCase={handleStartCase}
            onExploreLibrary={() => setCurrentView('library')}
          />
        )}


        {currentView === 'login' && (
          <LoginPage
            onSuccess={() => setCurrentView('dashboard')}
            onExploreLibrary={() => setCurrentView('library')}
          />
        )}

        {currentView === 'library' && (
          <CaseLibrary
            onSelectCase={handleStartCase}
            onPreviewCase={handleOpenCaseBrief}
          />
        )}

        {currentView === 'dashboard' && (
          <LearnerDashboard
            onStartCase={handleStartCase}
            onExploreLibrary={() => setCurrentView('library')}
          />
        )}

        {currentView === 'simulation' && activeCase && (
          <SimulationRoom
            clinicalCase={activeCase}
            onFinishEncounter={handleFinishEncounterFromRoom}
            onExit={() => setCurrentView('dashboard')}
            sessionId={activeSessionId}
          />
        )}

        {currentView === 'evaluation' && activeCase && evaluationResult && activeSessionData && (
          <EvaluationView
            clinicalCase={activeCase}
            evaluation={evaluationResult}
            chatMessages={activeSessionData.messages}
            onRetry={handleRetryCase}
            onNextCase={() => setCurrentView('library')}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'admin' && (
          <AdminCMS onStartCase={handleStartCase} />
        )}

        {currentView === 'educator' && (
          <EducatorAnalytics
            onStartCase={handleStartCase}
            onExploreLibrary={() => setCurrentView('library')}
          />
        )}
      </main>

      {/* Pre-Encounter Briefing Modal */}
      {previewModalCase && (
        <CaseDetailModal
          clinicalCase={previewModalCase}
          onClose={() => setPreviewModalCase(null)}
          onStart={() => handleStartCase(previewModalCase)}
        />
      )}

      {/* Final Diagnosis & Management Submission Modal */}
      {isDiagnosisModalOpen && activeCase && (
        <DiagnosisModal
          clinicalCase={activeCase}
          onClose={() => setIsDiagnosisModalOpen(false)}
          onSubmit={handleSubmitDiagnosis}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
