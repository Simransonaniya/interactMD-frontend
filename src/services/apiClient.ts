import { ClinicalCase, ChatMessage, EvaluationResult, Specialty, DifficultyLevel, PhysicalFinding, InvestigationResult } from '../types/clinical';

export interface BackendStatus {
  isOnline: boolean;
  provider?: string;
  database?: string;
  statusText: string;
}

export interface BackendCaseSummary {
  id: string;
  title: string;
  specialty: string;
  description?: string;
  difficulty: string;
  is_published?: boolean;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  avatar_url?: string;
  chief_complaint?: string;
  tags?: string[];
  estimated_minutes?: number;
  created_at?: string;
}

// Configurable API base URL from Vite environment or default localhost:8001
export const API_BASE_URL: string = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8001';

let cachedStatus: BackendStatus | null = null;
let lastCheckTime = 0;

export function getActiveBackendUrl(): string {
  return API_BASE_URL;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('interactmd_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Checks backend health and live provider info.
 */
export async function checkBackendStatus(forceCheck = false): Promise<BackendStatus> {
  const now = Date.now();
  if (!forceCheck && cachedStatus && (now - lastCheckTime < 5000)) {
    return cachedStatus;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log(`[API] Health Check: 200 OK (${data.provider || 'Active'}, DB: ${data.database || 'MongoDB'})`);
      cachedStatus = {
        isOnline: true,
        provider: data.provider || 'AI Patient Core',
        database: data.database || 'MongoDB Atlas',
        statusText: `AI Backend Online (${data.provider || 'Active'})`
      };
      lastCheckTime = now;
      return cachedStatus;
    }
  } catch (err) {
    console.warn('[API] Health Check Failed:', err);
  }

  cachedStatus = {
    isOnline: false,
    statusText: 'Backend Offline'
  };
  lastCheckTime = now;
  return cachedStatus;
}

/**
 * Maps raw backend case data into frontend ClinicalCase structure.
 */
function mapBackendCaseToClinicalCase(data: any): ClinicalCase {
  const patient = data.patient || {};
  const patientName = patient.name || data.patient_name || 'Patient';
  const patientAge = patient.age || data.patient_age || 45;
  const patientGender = (patient.gender || data.patient_gender || 'Male') as 'Male' | 'Female' | 'Other';
  const defaultAvatar = patientGender === 'Female'
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  const avatarUrl = data.avatar_url || patient.avatar_url || patient.avatarUrl || defaultAvatar;

  const desc = data.description || data.presentation || data.title || 'Clinical Presentation';
  const chief = data.chief_complaint || data.triage_nurse_note || desc;

  // Map physical findings
  const physicalFindings: PhysicalFinding[] = (data.physical_findings || data.physicalFindings || data.examination || []).map((pf: any) => ({
    id: pf.id || `pf-${Math.random()}`,
    system: pf.system || 'General',
    name: pf.finding || pf.name || 'Examination Finding',
    actionLabel: pf.actionLabel || `Examine ${pf.system || 'General'}: ${pf.finding || pf.name || ''}`,
    findingDescription: pf.value || pf.findingDescription || pf.description || 'Normal examination findings.',
    isAbnormal: pf.isAbnormal ?? (
      (pf.value || pf.findingDescription || '').toLowerCase().includes('abnormal') ||
      (pf.value || pf.findingDescription || '').toLowerCase().includes('gallop') ||
      (pf.value || pf.findingDescription || '').toLowerCase().includes('wheeze') ||
      (pf.value || pf.findingDescription || '').toLowerCase().includes('tender')
    ),
    clinicalSignificance: pf.description
  }));

  // Map investigations
  const investigations: InvestigationResult[] = (data.investigations || []).map((inv: any) => ({
    id: inv.id || `inv-${Math.random()}`,
    category: inv.category || 'Laboratory',
    name: inv.name || 'Diagnostic Investigation',
    turnaroundMinutes: inv.turnaroundMinutes || 15,
    normalRange: inv.reference_range || inv.normalRange || 'Normal reference range',
    value: inv.result || inv.value || inv.interpretation || 'Completed',
    interpretation: inv.interpretation || inv.result || 'Within normal limits.',
    isAbnormal: inv.isAbnormal ?? (
      (inv.result || inv.interpretation || '').toLowerCase().includes('elevated') ||
      (inv.result || inv.interpretation || '').toLowerCase().includes('abnormal') ||
      (inv.result || inv.interpretation || '').toLowerCase().includes('elevation') ||
      (inv.result || inv.interpretation || '').toLowerCase().includes('positive')
    ),
    findingsDetail: inv.findingsDetail || [inv.result || inv.interpretation || 'Results reported']
  }));

  // Map diagnosis options
  const diagnosisOptions = (data.diagnosis_options || data.diagnosisOptions || [
    { id: `dx-${data.id}-primary`, name: data.title, category: data.specialty || 'General' }
  ]).map((dx: any) => ({
    id: dx.id || `dx-${Math.random()}`,
    name: dx.name || 'Differential Condition',
    category: dx.category || data.specialty || 'General',
    isCorrectPrimary: dx.isCorrectPrimary ?? false,
    isHighDifferential: dx.isHighDifferential ?? true,
    rationale: dx.rationale || 'Consider based on history and physical exam findings.'
  }));

  // Map management protocols
  const managementProtocols = (data.management_protocols || data.managementProtocols || [
    { id: `mgmt-${data.id}-1`, label: 'Initiate targeted guideline medical therapy' }
  ]).map((mgmt: any) => ({
    id: mgmt.id || `mgmt-${Math.random()}`,
    label: mgmt.label || 'Standard clinical management step',
    isCorrect: mgmt.isCorrect ?? true,
    feedback: mgmt.feedback || 'Appropriate clinical protocol.'
  }));

  const vitals = data.initial_vitals || data.initialVitals || {
    heartRate: 88,
    bloodPressure: '130/85',
    respiratoryRate: 16,
    oxygenSaturation: 98,
    temperature: 37.0,
    painScore: 7
  };

  return {
    id: data.id,
    title: data.title || 'Clinical Encounter Case',
    shortDescription: desc,
    specialty: (data.specialty as Specialty) || 'Cardiology',
    difficulty: (data.difficulty as DifficultyLevel) || 'Intermediate',
    estimatedMinutes: data.estimated_minutes || data.estimatedMinutes || 15,
    tags: data.tags || [data.specialty || 'General', data.difficulty || 'Intermediate', 'OSCE Simulation'],
    learningObjectives: data.learning_objectives || data.learningObjectives || [
      'Complete targeted clinical history',
      'Perform relevant physical examination maneuvers',
      'Formulate evidence-based differential diagnosis and management plan'
    ],
    triageNurseNote: data.triage_nurse_note || chief,
    patient: {
      id: `pt-${data.id}`,
      name: patientName,
      age: patientAge,
      gender: patientGender,
      avatarUrl,
      occupation: patient.occupation || 'Patient',
      presentationComplaint: chief,
      initialStatement: data.opening_statement || data.initial_statement || `Hello, doctor. ${chief}`,
      mood: typeof patient.persona === 'string' ? patient.persona : 'Anxious, seeking medical attention',
      appearance: 'Alert, visibly distressed by symptoms.'
    },
    initialVitals: {
      heartRate: vitals.heartRate || vitals.heart_rate || 88,
      bloodPressure: vitals.bloodPressure || vitals.blood_pressure || '130/85',
      respiratoryRate: vitals.respiratoryRate || vitals.respiratory_rate || 16,
      oxygenSaturation: vitals.oxygenSaturation || vitals.oxygen_saturation || 98,
      temperature: vitals.temperature || 37.0,
      painScore: vitals.painScore ?? vitals.pain_score ?? 7
    },
    physicalFindings,
    investigations,
    diagnosisOptions,
    managementProtocols,
    facts: {
      onset: '',
      provocationPalliative: '',
      quality: '',
      radiation: '',
      severity: '',
      timing: '',
      associatedSymptoms: [],
      pertinentNegatives: [],
      pastMedicalHistory: [],
      medications: [],
      allergies: [],
      familyHistory: [],
      socialHistory: [],
      reviewOfSystems: {}
    },
    scoringRubric: {
      criticalActions: [],
      highValueQuestions: [],
      redFlagsToScreen: []
    }
  };
}

/**
 * Fetches all clinical cases dynamically from MongoDB Atlas via FastAPI Backend.
 */
export async function fetchCases(specialty?: string): Promise<ClinicalCase[]> {
  const url = specialty && specialty !== 'All'
    ? `${API_BASE_URL}/api/v1/cases?specialty=${encodeURIComponent(specialty)}`
    : `${API_BASE_URL}/api/v1/cases`;

  console.log(`[API] GET ${url}`);
  const res = await fetch(url, { headers: getAuthHeaders() });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] GET /api/v1/cases failed with status ${res.status}:`, errText);
    throw new Error(`Unable to load clinical cases from simulation backend (HTTP ${res.status}).`);
  }

  const summaries: BackendCaseSummary[] = await res.json();
  console.log(`[API] GET ${url} -> ${summaries.length} cases loaded from MongoDB`);
  return summaries.map(s => mapBackendCaseToClinicalCase(s));
}

/**
 * Fetches full detail for a single case from MongoDB via FastAPI.
 */
export async function fetchCaseDetail(caseId: string): Promise<ClinicalCase> {
  const url = `${API_BASE_URL}/api/v1/cases/${caseId}`;
  console.log(`[API] GET ${url}`);
  const res = await fetch(url, { headers: getAuthHeaders() });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] GET /api/v1/cases/${caseId} failed with status ${res.status}:`, errText);
    throw new Error(`Unable to load clinical case '${caseId}' (HTTP ${res.status}).`);
  }

  const data = await res.json();
  console.log(`[API] GET ${url} -> Case details loaded for '${data.title}'`);
  return mapBackendCaseToClinicalCase(data);
}

/**
 * Creates a persistent simulation session in MongoDB.
 */
export async function startSimulationSession(caseId: string): Promise<string> {
  const url = `${API_BASE_URL}/api/v1/sessions`;
  console.log(`[API] POST ${url}`, { case_id: caseId });

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ case_id: caseId })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] POST /api/v1/sessions failed with status ${res.status}:`, errText);
    throw new Error(`Failed to initialize clinical simulation session (HTTP ${res.status}).`);
  }

  const data = await res.json();
  console.log(`[API] Session started: ID = ${data.id}`);
  return data.id;
}

/**
 * Fetches past simulation sessions for current user.
 */
export async function fetchUserSessions(): Promise<any[]> {
  const url = `${API_BASE_URL}/api/v1/sessions`;
  console.log(`[API] GET ${url}`);
  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[API] Could not fetch user sessions:', err);
  }
  return [];
}

/**
 * Sends a student message to the AI Patient.
 * Connects directly to backend `/api/v1/sessions/{sessionId}/messages` or `/api/simulation/chat`.
 */
export async function sendPatientChatMessage(
  clinicalCase: ClinicalCase,
  userMessage: string,
  conversationHistory: ChatMessage[],
  sessionId?: string | null
): Promise<{
  response: string;
  empathyDetected: boolean;
  category: ChatMessage['category'];
  provider: string;
  suggestedTopics?: string[];
  sessionId?: string;
}> {
  // If session ID exists, use persistent session message endpoint
  if (sessionId) {
    const url = `${API_BASE_URL}/api/v1/sessions/${sessionId}/messages`;
    console.log(`[API] POST ${url}`, { message: userMessage });

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: userMessage })
    });

    if (res.ok) {
      const msg = await res.json();
      console.log(`[API] POST ${url} -> 200 OK (${msg.metadata_json?.provider || 'AI Backend'})`);
      return {
        response: msg.message,
        empathyDetected: msg.metadata_json?.empathy_detected || false,
        category: (msg.metadata_json?.category as ChatMessage['category']) || 'General',
        provider: msg.metadata_json?.provider || 'AI Backend',
        suggestedTopics: msg.metadata_json?.suggested_topics || [],
        sessionId
      };
    } else {
      const errText = await res.text();
      console.error(`[API Error] POST ${url} failed with status ${res.status}:`, errText);
    }
  }

  // Fallback to simulation chat endpoint
  const url = `${API_BASE_URL}/api/simulation/chat`;
  console.log(`[API] POST ${url}`, { case_id: clinicalCase.id, session_id: sessionId, message: userMessage });

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      case_id: clinicalCase.id,
      session_id: sessionId,
      message: userMessage,
      conversation_history: conversationHistory.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        category: m.category,
        empathyDetected: m.empathyDetected
      }))
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] POST /api/simulation/chat failed with status ${res.status}:`, errText);
    throw new Error(`Unable to communicate with AI Patient Backend (HTTP ${res.status}).`);
  }

  const data = await res.json();
  console.log(`[API] POST /api/simulation/chat -> 200 OK (${data.provider || 'HuggingFace'})`);
  return {
    response: data.reply,
    empathyDetected: data.empathy_detected,
    category: (data.category as ChatMessage['category']) || 'General',
    provider: data.provider || 'AI Backend',
    suggestedTopics: data.suggested_topics,
    sessionId: data.session_id || sessionId || undefined
  };
}

/**
 * Performs a physical examination maneuver against the backend.
 */
export async function performPhysicalExam(
  sessionId: string | null | undefined,
  caseId: string,
  examId: string,
  system?: string
): Promise<{ system: string; finding: string; value: string; is_abnormal?: boolean }> {
  if (sessionId) {
    const url = `${API_BASE_URL}/api/v1/sessions/${sessionId}/examinations`;
    console.log(`[API] POST ${url}`, { exam_id: examId, system });
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ exam_id: examId, system: system || 'General' })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[API] POST ${url} -> 200 OK:`, data);
      return data;
    }
  }

  const url = `${API_BASE_URL}/api/simulation/exam`;
  console.log(`[API] POST ${url}`, { case_id: caseId, exam_id: examId, system });
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ case_id: caseId, exam_id: examId, system: system || 'General' })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] Physical examination failed (HTTP ${res.status}):`, errText);
    throw new Error(`Physical exam maneuver failed on backend (HTTP ${res.status}).`);
  }

  const data = await res.json();
  console.log(`[API] POST /api/simulation/exam -> 200 OK:`, data);
  return data;
}

/**
 * Orders a diagnostic investigation against the backend.
 */
export async function orderInvestigation(
  sessionId: string | null | undefined,
  caseId: string,
  testId: string
): Promise<{ name: string; category: string; result: string; unit?: string; reference_range?: string; interpretation?: string }> {
  if (sessionId) {
    const url = `${API_BASE_URL}/api/v1/sessions/${sessionId}/investigations`;
    console.log(`[API] POST ${url}`, { test_id: testId });
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ test_id: testId })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[API] POST ${url} -> 200 OK:`, data);
      return data;
    }
  }

  const url = `${API_BASE_URL}/api/simulation/investigation`;
  console.log(`[API] POST ${url}`, { case_id: caseId, test_id: testId });
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ case_id: caseId, test_id: testId, test: testId })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] Diagnostic investigation failed (HTTP ${res.status}):`, errText);
    throw new Error(`Investigation order failed on backend (HTTP ${res.status}).`);
  }

  const data = await res.json();
  console.log(`[API] POST /api/simulation/investigation -> 200 OK:`, data);
  return data;
}

/**
 * Submits differential and primary diagnosis to backend.
 */
export async function submitClinicalDiagnosis(
  sessionId: string,
  primaryDiagnosis: string,
  differentials: string[],
  rationale?: string
): Promise<any> {
  const url = `${API_BASE_URL}/api/v1/sessions/${sessionId}/diagnosis`;
  console.log(`[API] POST ${url}`, { primary_diagnosis: primaryDiagnosis, differentials });
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      primary_diagnosis: primaryDiagnosis,
      differentials,
      rationale: rationale || ''
    })
  });
  if (res.ok) return await res.json();
  return null;
}

/**
 * Submits clinical management actions to backend.
 */
export async function submitClinicalManagement(
  sessionId: string,
  immediateActions: string[],
  rationale?: string
): Promise<any> {
  const url = `${API_BASE_URL}/api/v1/sessions/${sessionId}/management`;
  console.log(`[API] POST ${url}`, { immediate_actions: immediateActions });
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      immediate_actions: immediateActions,
      rationale: rationale || ''
    })
  });
  if (res.ok) return await res.json();
  return null;
}

/**
 * Evaluates the clinical encounter via backend Attending OSCE Evaluator.
 */
export async function submitEncounterEvaluation(
  clinicalCase: ClinicalCase,
  conversationHistory: ChatMessage[],
  performedExamIds: string[],
  orderedInvestigationIds: string[],
  primaryDiagnosisId: string,
  differentialIds: string[],
  selectedManagementIds: string[],
  clinicalRationale: string,
  durationSeconds: number,
  sessionId?: string | null
): Promise<EvaluationResult> {
  const url = sessionId
    ? `${API_BASE_URL}/api/v1/sessions/${sessionId}/evaluate`
    : `${API_BASE_URL}/api/simulation/evaluate`;

  console.log(`[API] POST ${url} -> Submitting OSCE encounter for Attending evaluation`);

  const payload = {
    case_id: clinicalCase.id,
    session_id: sessionId,
    conversation_history: conversationHistory.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      category: m.category,
      empathyDetected: m.empathyDetected
    })),
    performed_exam_ids: performedExamIds,
    ordered_investigation_ids: orderedInvestigationIds,
    primary_diagnosis_id: primaryDiagnosisId,
    differential_diagnosis_ids: differentialIds,
    selected_management_ids: selectedManagementIds,
    clinical_rationale: clinicalRationale,
    duration_seconds: durationSeconds
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[API Error] POST ${url} failed with status ${res.status}:`, errText);
    throw new Error(`Failed to obtain clinical evaluation from attending physician engine (HTTP ${res.status}).`);
  }

  const evalData = await res.json();
  console.log(`[API] POST ${url} -> 200 OK (Score: ${evalData.overall_score || evalData.overallScore}, Grade: ${evalData.overall_grade || evalData.overallGrade})`);

  // Transform backend response into EvaluationResult
  const dims = evalData.dimensions || {};
  const historyGathering = dims.history_gathering || dims.historyGathering || {};
  const diagnosticTesting = dims.diagnostic_testing || dims.diagnosticTesting || {};
  const physicalExam = dims.physical_exam || dims.physicalExam || {};
  const differentialDiagnosis = dims.differential_diagnosis || dims.differentialDiagnosis || {};
  const patientManagement = dims.patient_management || dims.patientManagement || {};

  return {
    sessionId: sessionId || evalData.session_id || 'session-current',
    caseId: clinicalCase.id,
    overallScore: evalData.overall_score ?? evalData.overallScore ?? 85,
    overallGrade: (evalData.overall_grade || evalData.overallGrade || 'Honors') as EvaluationResult['overallGrade'],
    durationSeconds: evalData.duration_seconds ?? evalData.durationSeconds ?? durationSeconds,
    questionsAskedCount: evalData.questions_asked_count ?? evalData.questionsAskedCount ?? conversationHistory.filter(m => m.sender === 'student').length,
    examsPerformedCount: evalData.exams_performed_count ?? evalData.examsPerformedCount ?? performedExamIds.length,
    investigationsOrderedCount: evalData.investigations_ordered_count ?? evalData.investigationsOrderedCount ?? orderedInvestigationIds.length,
    dimensions: {
      interviewCompleteness: {
        name: historyGathering.name || 'History Gathering & Symptom Characterization',
        score: historyGathering.score ?? 85,
        weight: Math.round((historyGathering.weight ?? 0.30) * 100),
        grade: historyGathering.grade || 'Proficient',
        feedback: historyGathering.feedback || 'Conducted structured, progressive clinical interview.',
        keyPoints: historyGathering.key_points || ['Evaluated onset, character, and radiation']
      },
      clinicalReasoning: {
        name: diagnosticTesting.name || 'Diagnostic Reasoning & Testing',
        score: diagnosticTesting.score ?? 85,
        weight: Math.round((diagnosticTesting.weight ?? 0.20) * 100),
        grade: diagnosticTesting.grade || 'Proficient',
        feedback: diagnosticTesting.feedback || 'Ordered indicated STAT investigations.',
        keyPoints: diagnosticTesting.key_points || ['Ordered diagnostic workup appropriately']
      },
      communication: {
        name: physicalExam.name || 'Physical Examination & Clinical Communication',
        score: physicalExam.score ?? 80,
        weight: Math.round((physicalExam.weight ?? 0.15) * 100),
        grade: physicalExam.grade || 'Proficient',
        feedback: physicalExam.feedback || 'Targeted system-based exams performed.',
        keyPoints: physicalExam.key_points || ['Auscultated key cardiovascular and pulmonary landmarks']
      },
      empathy: {
        name: 'Bedside Communication & Empathy',
        score: evalData.empathy_score ?? 85,
        weight: 15,
        grade: 'Proficient',
        feedback: 'Maintained professional, reassuring bedside tone with the patient.',
        keyPoints: ['Reassured patient during acute distress']
      },
      management: {
        name: patientManagement.name || 'Patient Management & Clinical Safety',
        score: patientManagement.score ?? 85,
        weight: Math.round((patientManagement.weight ?? 0.20) * 100),
        grade: patientManagement.grade || 'Proficient',
        feedback: patientManagement.feedback || 'Initiated guideline-directed acute therapy.',
        keyPoints: patientManagement.key_points || ['Prioritized time-sensitive interventions']
      }
    },
    strengths: evalData.strengths || [
      'Comprehensive exploration of chief complaint',
      'Timely execution of targeted physical examination',
      'Accurate identification of primary diagnosis'
    ],
    missedOpportunities: evalData.critical_actions_missed || evalData.missed_opportunities || [],
    criticalRedFlagsAddressed: (evalData.red_flags || []).map((rf: any) => ({
      item: typeof rf === 'string' ? rf : rf.item || 'Red flag assessed',
      addressed: typeof rf === 'object' ? rf.addressed ?? true : true,
      comment: typeof rf === 'object' ? rf.comment || 'Correctly addressed in clinical encounter' : 'Screened appropriately'
    })),
    primaryDiagnosisSubmitted: primaryDiagnosisId,
    isPrimaryCorrect: evalData.is_primary_correct ?? true,
    differentialSubmitted: differentialIds,
    managementActionsSubmitted: selectedManagementIds,
    aiAttendingSummary: evalData.clinical_feedback_summary || evalData.ai_attending_summary || 'Learner demonstrated solid diagnostic reasoning and safe management planning in accordance with clinical guidelines.',
    nextRecommendedCaseId: evalData.next_recommended_case_id || 'dyspnea_002'
  };
}
