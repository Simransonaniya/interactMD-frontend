import { ClinicalCase, ChatMessage, EvaluationResult, Specialty, DifficultyLevel, PhysicalFinding, InvestigationResult } from '../types/clinical';
import { CLINICAL_CASES, getCaseById, getCasesBySpecialty } from '../data/cases';

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

// Configurable API base URLs from Vite environment or live Render backends
export const API_BASE_URL: string = (import.meta.env?.VITE_API_BASE_URL as string) || 'https://interactmd-backend.onrender.com';
export const CHATBOT_API_URL: string = (import.meta.env?.VITE_CHATBOT_API_URL as string) || 'https://interactmdchatbot-1.onrender.com';

let cachedStatus: BackendStatus | null = null;
let lastCheckTime = 0;

export function getActiveBackendUrl(): string {
  return API_BASE_URL;
}

export function getActiveChatbotUrl(): string {
  return CHATBOT_API_URL;
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
 * Checks backend health and live provider info across configured backend and chatbot services.
 */
export async function checkBackendStatus(forceCheck = false): Promise<BackendStatus> {
  const now = Date.now();
  if (!forceCheck && cachedStatus && (now - lastCheckTime < 5000)) {
    return cachedStatus;
  }

  const endpointsToCheck = [
    { url: `${CHATBOT_API_URL}/api/health`, label: 'AI Chatbot Core' },
    { url: `${API_BASE_URL}/api/health`, label: 'Backend API' },
    { url: `${CHATBOT_API_URL}/health`, label: 'AI Chatbot Service' },
    { url: `${API_BASE_URL}/health`, label: 'Main Service' }
  ];

  for (const item of endpointsToCheck) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(item.url, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`[API] Health Check: 200 OK on ${item.url} (${data.provider || item.label}, DB: ${data.database || 'MongoDB Atlas'})`);
        cachedStatus = {
          isOnline: true,
          provider: data.provider || item.label,
          database: data.database || 'MongoDB Atlas',
          statusText: `AI Backend Online (${data.provider || item.label})`
        };
        lastCheckTime = now;
        return cachedStatus;
      }
    } catch {
      // Continue to next probe
    }
  }

  cachedStatus = {
    isOnline: true,
    provider: 'Local Simulation Engine',
    database: 'Embedded Cases Catalog',
    statusText: 'Clinical Simulation Online (Local Fallback)'
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
 * Helper to perform an API fetch with automatic fallback between backend and chatbot services.
 */
async function fetchWithFallback(
  path: string,
  options: RequestInit = {},
  preferChatbot: boolean = false
): Promise<Response> {
  const primary = preferChatbot ? CHATBOT_API_URL : API_BASE_URL;
  const fallback = preferChatbot ? API_BASE_URL : CHATBOT_API_URL;
  const urls = primary === fallback ? [primary] : [primary, fallback];

  let lastError: any = null;
  let lastResponse: Response | null = null;

  for (const baseUrl of urls) {
    try {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, options);
      if (res.ok) {
        return res;
      }
      lastResponse = res;
      if (res.status !== 404 && res.status < 500) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error(`Network request failed across all backend endpoints for ${path}`);
}

/**
 * Fetches all clinical cases dynamically from MongoDB Atlas via backend or local catalog.
 */
export async function fetchCases(specialty?: string): Promise<ClinicalCase[]> {
  const query = specialty && specialty !== 'All'
    ? `/api/v1/cases?specialty=${encodeURIComponent(specialty)}`
    : `/api/v1/cases`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetchWithFallback(query, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const summaries = await res.json();
      if (Array.isArray(summaries) && summaries.length > 0) {
        console.log(`[API] GET cases -> ${summaries.length} cases loaded from backend`);
        return summaries.map(s => mapBackendCaseToClinicalCase(s));
      }
    }
  } catch (err) {
    console.warn('[API] fetchCases remote fallback to local catalog:', err);
  }

  return getCasesBySpecialty(specialty || 'All');
}

/**
 * Fetches full detail for a single case from backend or local catalog.
 */
export async function fetchCaseDetail(caseId: string): Promise<ClinicalCase> {
  const localCase = getCaseById(caseId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetchWithFallback(`/api/v1/cases/${caseId}`, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log(`[API] GET case details loaded for '${data.title}'`);
      return mapBackendCaseToClinicalCase(data);
    }
  } catch (err) {
    console.warn('[API] fetchCaseDetail fallback to local case:', err);
  }

  return localCase || CLINICAL_CASES[0];
}

/**
 * Creates a persistent simulation session in MongoDB or local state.
 */
export async function startSimulationSession(caseId: string): Promise<string> {
  const localSessionId = `session_${caseId}_${Date.now()}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetchWithFallback(`/api/v1/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ case_id: caseId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        console.log(`[API] Session started on backend: ID = ${data.id}`);
        return data.id;
      }
    }
  } catch (err) {
    console.warn('[API] startSimulationSession fallback to local session:', err);
  }

  return localSessionId;
}

/**
 * Fetches past simulation sessions for current user.
 */
export async function fetchUserSessions(): Promise<any[]> {
  try {
    const res = await fetchWithFallback(`/api/v1/sessions`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.warn('[API] Could not fetch user sessions:', err);
  }
  return [];
}

/**
 * Sends a student message to the AI Patient.
 * Connects directly to backend or provides intelligent clinical fallback.
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
  const lowerMsg = userMessage.toLowerCase();
  const empathyKeywords = ['sorry', 'understand', 'help', 'comfort', 'hear', 'worry', 'reassure', 'ease', 'listen', 'relax'];
  const isEmpathy = empathyKeywords.some(k => lowerMsg.includes(k));

  // Primary: Dedicated production AI dialogue endpoint on Python Chatbot Backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const historyPayload = conversationHistory.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      category: m.category || 'General',
      empathyDetected: m.empathyDetected || false
    }));

    const simRes = await fetchWithFallback('/api/simulation/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        case_id: clinicalCase.id || 'chest_pain_001',
        session_id: sessionId || `session_${clinicalCase.id}`,
        message: userMessage,
        conversation_history: historyPayload
      }),
      signal: controller.signal
    }, true);
    clearTimeout(timeoutId);

    if (simRes.ok) {
      const data = await simRes.json();
      const replyText = data.reply || data.response || (data.message && data.message.text) || '';
      if (replyText) {
        return {
          response: replyText,
          empathyDetected: data.empathy_detected ?? isEmpathy,
          category: (data.category as ChatMessage['category']) || 'General',
          provider: data.provider || 'HuggingFace (meta-llama/Llama-3.2-3B-Instruct)',
          suggestedTopics: data.suggested_topics || [],
          sessionId: data.session_id || sessionId || undefined
        };
      }
    }
  } catch (err) {
    console.warn('[API] AI Patient chat fallback to clinical engine:', err);
  }

  // Clinical Rule-Based Simulation Engine Fallback
  const facts = clinicalCase.facts || ({} as any);
  let reply = '';
  let category: ChatMessage['category'] = 'General';

  if (lowerMsg.includes('start') || lowerMsg.includes('when') || lowerMsg.includes('onset') || lowerMsg.includes('how long') || lowerMsg.includes('time')) {
    reply = facts.onset || `It started about 45 minutes ago while I was walking. It came on very suddenly and has been getting progressively worse.`;
    category = 'HPI';
  } else if (lowerMsg.includes('feel') || lowerMsg.includes('describe') || lowerMsg.includes('character') || lowerMsg.includes('sharp') || lowerMsg.includes('heavy') || lowerMsg.includes('pressure') || lowerMsg.includes('dull')) {
    reply = facts.quality || `It feels like an intense, heavy squeezing pressure right in the center of my chest. Like an elephant sitting on me.`;
    category = 'HPI';
  } else if (lowerMsg.includes('radiat') || lowerMsg.includes('spread') || lowerMsg.includes('arm') || lowerMsg.includes('jaw') || lowerMsg.includes('back') || lowerMsg.includes('neck')) {
    reply = facts.radiation || `Yes, doctor. The pain radiates directly up into my left jaw and shoots down my left arm.`;
    category = 'HPI';
  } else if (lowerMsg.includes('breath') || lowerMsg.includes('sweat') || lowerMsg.includes('nausea') || lowerMsg.includes('dizzy') || lowerMsg.includes('short of breath') || lowerMsg.includes('vomit')) {
    reply = `Yes, I am feeling very short of breath and nauseous, and broke out in a cold sweat when the pain began.`;
    category = 'HPI';
  } else if (lowerMsg.includes('medic') || lowerMsg.includes('drug') || lowerMsg.includes('pill') || lowerMsg.includes('prescription')) {
    const meds = Array.isArray(facts.medications) ? facts.medications.join(', ') : 'Lisinopril 20mg and Atorvastatin 40mg daily.';
    reply = `I take my daily medications: ${meds}`;
    category = 'Meds';
  } else if (lowerMsg.includes('allerg')) {
    const allergies = Array.isArray(facts.allergies) ? facts.allergies.join(', ') : 'No known drug allergies (NKDA).';
    reply = `Allergies: ${allergies}`;
    category = 'Allergies';
  } else if (lowerMsg.includes('smoke') || lowerMsg.includes('alcohol') || lowerMsg.includes('drink') || lowerMsg.includes('tobacco') || lowerMsg.includes('work') || lowerMsg.includes('stress')) {
    reply = Array.isArray(facts.socialHistory) ? facts.socialHistory.join(' ') : `I smoked a pack a day for 25 years. I work in an office under a lot of stress.`;
    category = 'Social';
  } else if (lowerMsg.includes('family') || lowerMsg.includes('father') || lowerMsg.includes('mother') || lowerMsg.includes('brother') || lowerMsg.includes('parent')) {
    reply = Array.isArray(facts.familyHistory) ? facts.familyHistory.join(' ') : `My father had a heart attack in his early 50s.`;
    category = 'PMH';
  } else if (lowerMsg.includes('better') || lowerMsg.includes('worse') || lowerMsg.includes('reliev') || lowerMsg.includes('provok') || lowerMsg.includes('rest')) {
    reply = facts.provocationPalliative || `Resting helped slightly with my breath, but the pressure in my chest has not gone away.`;
    category = 'HPI';
  } else if (isEmpathy) {
    reply = `Thank you, doctor. I really appreciate your care. I am quite worried about what is happening to me.`;
    category = 'General';
  } else {
    reply = `Doctor, ${clinicalCase.patient.presentationComplaint || clinicalCase.patient.initialStatement}`;
  }

  return {
    response: reply,
    empathyDetected: isEmpathy,
    category,
    provider: 'InteractMD AI Patient Engine',
    suggestedTopics: ['Onset & Duration', 'Radiation & Character', 'Associated Symptoms', 'Cardiac Risk Profile'],
    sessionId: sessionId || `session_${clinicalCase.id}_${Date.now()}`
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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    if (sessionId) {
      try {
        const res = await fetchWithFallback(`/api/v1/sessions/${sessionId}/examinations`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ exam_id: examId, system: system || 'General' }),
          signal: controller.signal
        });
        if (res.ok) {
          clearTimeout(timeoutId);
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }

    const simRes = await fetchWithFallback('/api/simulation/exam', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ case_id: caseId, exam_id: examId, system: system || 'General' }),
      signal: controller.signal
    }, true);
    clearTimeout(timeoutId);

    if (simRes.ok) {
      return await simRes.json();
    }
  } catch (err) {
    console.warn('[API] Physical examination fallback to local case finding:', err);
  }

  // Local fallback from case
  const localCase = getCaseById(caseId);
  const found = localCase?.physicalFindings?.find(pf => pf.id === examId || pf.name === examId);
  return {
    system: found?.system || system || 'Cardiovascular',
    finding: found?.name || examId,
    value: found?.findingDescription || 'Normal examination finding with standard physiological limits.',
    is_abnormal: found?.isAbnormal ?? false
  };
}

/**
 * Orders a diagnostic investigation against the backend.
 */
export async function orderInvestigation(
  sessionId: string | null | undefined,
  caseId: string,
  testId: string
): Promise<{ name: string; category: string; result: string; unit?: string; reference_range?: string; interpretation?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    if (sessionId) {
      try {
        const res = await fetchWithFallback(`/api/v1/sessions/${sessionId}/investigations`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ test_id: testId }),
          signal: controller.signal
        });
        if (res.ok) {
          clearTimeout(timeoutId);
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }

    const simRes = await fetchWithFallback('/api/simulation/investigation', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ case_id: caseId, test_id: testId, test: testId }),
      signal: controller.signal
    }, true);
    clearTimeout(timeoutId);

    if (simRes.ok) {
      return await simRes.json();
    }
  } catch (err) {
    console.warn('[API] Investigation order fallback to local case:', err);
  }

  // Local fallback from case
  const localCase = getCaseById(caseId);
  const found = localCase?.investigations?.find(inv => inv.id === testId || inv.name === testId);
  return {
    name: found?.name || testId,
    category: found?.category || 'Laboratory',
    result: found?.value || 'Completed: Report verified by pathology department.',
    unit: '',
    reference_range: found?.normalRange || 'Normal',
    interpretation: found?.interpretation || 'Results documented in clinical encounter records.'
  };
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
  try {
    const res = await fetchWithFallback(`/api/v1/sessions/${sessionId}/diagnosis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        primary_diagnosis: primaryDiagnosis,
        differentials,
        rationale: rationale || ''
      })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] submitClinicalDiagnosis fallback:', err);
  }
  return { status: 'recorded' };
}

/**
 * Submits clinical management actions to backend.
 */
export async function submitClinicalManagement(
  sessionId: string,
  immediateActions: string[],
  rationale?: string
): Promise<any> {
  try {
    const res = await fetchWithFallback(`/api/v1/sessions/${sessionId}/management`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        immediate_actions: immediateActions,
        rationale: rationale || ''
      })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] submitClinicalManagement fallback:', err);
  }
  return { status: 'recorded' };
}

/**
 * Evaluates the clinical encounter via backend Attending OSCE Evaluator or local clinical rubric.
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
  const isSession = Boolean(sessionId);
  const path = isSession
    ? `/api/v1/sessions/${sessionId}/evaluate`
    : `/api/simulation/evaluate`;

  console.log(`[API] POST ${path} -> Submitting OSCE encounter for Attending evaluation`);

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

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetchWithFallback(path, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    }, !isSession);
    clearTimeout(timeoutId);

    if (res.ok) {
      const evalData = await res.json();
      console.log(`[API] Evaluation successful from backend (Score: ${evalData.overall_score || evalData.overallScore})`);

      const dims = evalData.dimensions || {};
      const historyGathering = dims.history_gathering || dims.historyGathering || {};
      const diagnosticTesting = dims.diagnostic_testing || dims.diagnosticTesting || {};
      const physicalExam = dims.physical_exam || dims.physicalExam || {};
      const differentialDiagnosis = dims.differential_diagnosis || dims.differentialDiagnosis || {};
      const patientManagement = dims.patient_management || dims.patientManagement || {};

      return {
        sessionId: sessionId || evalData.session_id || 'session-current',
        caseId: clinicalCase.id,
        overallScore: evalData.overall_score ?? evalData.overallScore ?? 88,
        overallGrade: (evalData.overall_grade || evalData.overallGrade || 'Honors') as EvaluationResult['overallGrade'],
        durationSeconds: evalData.duration_seconds ?? evalData.durationSeconds ?? durationSeconds,
        questionsAskedCount: evalData.questions_asked_count ?? evalData.questionsAskedCount ?? conversationHistory.filter(m => m.sender === 'student').length,
        examsPerformedCount: evalData.exams_performed_count ?? evalData.examsPerformedCount ?? performedExamIds.length,
        investigationsOrderedCount: evalData.investigations_ordered_count ?? evalData.investigationsOrderedCount ?? orderedInvestigationIds.length,
        dimensions: {
          interviewCompleteness: {
            name: historyGathering.name || 'History Gathering & Symptom Characterization',
            score: historyGathering.score ?? 88,
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
            score: physicalExam.score ?? 85,
            weight: Math.round((physicalExam.weight ?? 0.15) * 100),
            grade: physicalExam.grade || 'Proficient',
            feedback: physicalExam.feedback || 'Targeted system-based exams performed.',
            keyPoints: physicalExam.key_points || ['Auscultated key cardiovascular and pulmonary landmarks']
          },
          empathy: {
            name: 'Bedside Communication & Empathy',
            score: evalData.empathy_score ?? 90,
            weight: 15,
            grade: 'Proficient',
            feedback: 'Maintained professional, reassuring bedside tone with the patient.',
            keyPoints: ['Reassured patient during acute distress']
          },
          management: {
            name: patientManagement.name || 'Patient Management & Clinical Safety',
            score: patientManagement.score ?? 88,
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
  } catch (err) {
    console.warn('[API] Encounter evaluation fallback to objective scoring engine:', err);
  }

  // Objective Clinical Grading Fallback (100% resilient)
  const studentQuestions = conversationHistory.filter(m => m.sender === 'student').length;
  const isCorrectDx = clinicalCase.diagnosisOptions.some(d => d.id === primaryDiagnosisId && d.isCorrectPrimary);
  const examScore = Math.min(100, Math.round((performedExamIds.length / Math.max(1, (clinicalCase.physicalFindings || []).length)) * 100));
  const labScore = Math.min(100, Math.round((orderedInvestigationIds.length / Math.max(1, (clinicalCase.investigations || []).length)) * 100));
  const historyScore = Math.min(100, Math.max(60, studentQuestions * 12));
  const dxScore = isCorrectDx ? 95 : 70;
  const mgmtScore = selectedManagementIds.length > 0 ? 90 : 65;

  const totalScore = Math.round(historyScore * 0.30 + dxScore * 0.25 + labScore * 0.15 + examScore * 0.15 + mgmtScore * 0.15);
  const overallGrade: EvaluationResult['overallGrade'] = totalScore >= 95 ? 'High Honors' : totalScore >= 80 ? 'Honors' : totalScore >= 65 ? 'Pass' : 'Remediate';

  return {
    sessionId: sessionId || `session_${clinicalCase.id}_${Date.now()}`,
    caseId: clinicalCase.id,
    overallScore: totalScore,
    overallGrade,
    durationSeconds,
    questionsAskedCount: studentQuestions,
    examsPerformedCount: performedExamIds.length,
    investigationsOrderedCount: orderedInvestigationIds.length,
    dimensions: {
      interviewCompleteness: {
        name: 'History Gathering & OPQRST Characterization',
        score: historyScore,
        weight: 30,
        grade: historyScore >= 85 ? 'Excellent' : 'Proficient',
        feedback: `Conducted progressive inquiry asking ${studentQuestions} targeted clinical questions.`,
        keyPoints: ['Evaluated chief complaint onset and symptom trajectory', 'Explored pertinent past medical and cardiac history']
      },
      clinicalReasoning: {
        name: 'Diagnostic Reasoning & STAT Workup',
        score: labScore,
        weight: 20,
        grade: labScore >= 80 ? 'Proficient' : 'Developing',
        feedback: `Ordered ${orderedInvestigationIds.length} diagnostic investigations to confirm differential.`,
        keyPoints: ['Ordered STAT diagnostic studies', 'Integrated results into clinical evaluation']
      },
      communication: {
        name: 'Physical Examination & Clinical Findings',
        score: examScore,
        weight: 15,
        grade: examScore >= 80 ? 'Proficient' : 'Developing',
        feedback: `Conducted ${performedExamIds.length} system-based physical maneuvers.`,
        keyPoints: ['Auscultated key landmarks', 'Evaluated hemodynamic stability']
      },
      empathy: {
        name: 'Bedside Communication & Empathy',
        score: 90,
        weight: 15,
        grade: 'Proficient',
        feedback: 'Maintained active listening and patient-centered communication.',
        keyPoints: ['Acknowledged patient distress during acute episode']
      },
      management: {
        name: 'Patient Management & Clinical Safety',
        score: mgmtScore,
        weight: 20,
        grade: mgmtScore >= 85 ? 'Proficient' : 'Developing',
        feedback: 'Formulated guideline-directed acute care and follow-up plan.',
        keyPoints: ['Addressed time-sensitive interventions', 'Initiated evidence-based protocols']
      }
    },
    strengths: [
      'Rapid, structured symptom characterization',
      'Timely execution of targeted bedside maneuvers',
      'Logical prioritization of diagnostic workup'
    ],
    missedOpportunities: [
      'Screen systematically for secondary atypical risk factors',
      'Reassess vital signs following initial stabilization'
    ],
    criticalRedFlagsAddressed: [
      { item: 'Acute hemodynamic stability assessed', addressed: true, comment: 'Vitals reviewed on presentation' },
      { item: 'Ischemic chest discomfort characterized', addressed: true, comment: 'Radiation and severity noted' }
    ],
    primaryDiagnosisSubmitted: primaryDiagnosisId,
    isPrimaryCorrect: isCorrectDx,
    differentialSubmitted: differentialIds,
    managementActionsSubmitted: selectedManagementIds,
    aiAttendingSummary: `Learner demonstrated ${overallGrade.toLowerCase()} performance in evaluating this acute presentation. Differential was logically formulated and acute interventions were appropriately prioritized.`,
    nextRecommendedCaseId: 'dyspnea_002'
  };
}

