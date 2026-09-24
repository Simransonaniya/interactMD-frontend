export type Specialty = 'Cardiology' | 'Pulmonology' | 'Gastroenterology' | 'Emergency Medicine' | 'Neurology' | 'Infectious Disease';

export type DifficultyLevel = 'Novice' | 'Intermediate' | 'Advanced';

export interface Vitals {
  heartRate: number;
  bloodPressure: string; // e.g. "148/92"
  respiratoryRate: number;
  oxygenSaturation: number; // e.g. 96
  temperature: number; // e.g. 37.2 in C
  painScore?: number; // 0-10
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  occupation: string;
  presentationComplaint: string; // Initial Chief Complaint
  initialStatement: string; // First thing patient says when interview opens
  mood: string; // e.g. "Anxious, clutching chest", "Diaphoretic, breathy", "Grimacing with pain"
  appearance: string;
}

export interface PhysicalFinding {
  id: string;
  system: 'Cardiovascular' | 'Respiratory' | 'Abdominal' | 'Neurological' | 'General / HEENT' | 'Musculoskeletal / Skin';
  name: string;
  actionLabel: string; // e.g. "Auscultate Heart Sounds (Mitral, Tricuspid, Aortic)"
  findingDescription: string;
  isAbnormal: boolean;
  audioKey?: string;
  clinicalSignificance?: string;
}

export interface InvestigationResult {
  id: string;
  category: 'Laboratory' | 'Imaging' | 'Cardiology / Point-of-Care' | 'Bedside Procedures';
  name: string;
  turnaroundMinutes: number;
  normalRange?: string;
  value?: string;
  interpretation: string;
  isAbnormal: boolean;
  imageUrl?: string; // Visual imaging or ECG lead strip
  findingsDetail: string[];
}

export interface DiagnosisOption {
  id: string;
  name: string;
  icdCode?: string;
  category: string;
  isCorrectPrimary: boolean;
  isHighDifferential: boolean;
  rationale: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  shortDescription: string;
  specialty: Specialty;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  tags: string[];
  learningObjectives: string[];
  triageNurseNote: string;
  patient: PatientProfile;
  initialVitals: Vitals;
  physicalFindings: PhysicalFinding[];
  investigations: InvestigationResult[];
  diagnosisOptions: DiagnosisOption[];
  managementProtocols: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  // Internal clinical facts for the orchestrator
  facts: {
    onset: string;
    provocationPalliative: string;
    quality: string;
    radiation: string;
    severity: string;
    timing: string;
    associatedSymptoms: string[];
    pertinentNegatives: string[];
    pastMedicalHistory: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
    socialHistory: string[];
    reviewOfSystems: Record<string, string>;
  };
  scoringRubric: {
    criticalActions: string[];
    highValueQuestions: string[];
    redFlagsToScreen: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'patient' | 'system' | 'attending';
  text: string;
  timestamp: string;
  category?: 'HPI' | 'PMH' | 'Meds' | 'Allergies' | 'Social' | 'Exam' | 'Investigation' | 'General';
  empathyDetected?: boolean;
}

export interface DimensionScore {
  name: string;
  score: number; // 0 - 100
  weight: number;
  grade: 'Excellent' | 'Proficient' | 'Developing' | 'Needs Practice';
  feedback: string;
  keyPoints: string[];
}

export interface EvaluationResult {
  sessionId: string;
  caseId: string;
  overallScore: number; // 0 - 100
  overallGrade: 'High Honors' | 'Honors' | 'Pass' | 'Remediate';
  durationSeconds: number;
  questionsAskedCount: number;
  examsPerformedCount: number;
  investigationsOrderedCount: number;
  dimensions: {
    interviewCompleteness: DimensionScore;
    clinicalReasoning: DimensionScore;
    communication: DimensionScore;
    empathy: DimensionScore;
    management: DimensionScore;
  };
  strengths: string[];
  missedOpportunities: string[];
  criticalRedFlagsAddressed: { item: string; addressed: boolean; comment: string }[];
  primaryDiagnosisSubmitted: string;
  isPrimaryCorrect: boolean;
  differentialSubmitted: string[];
  managementActionsSubmitted: string[];
  aiAttendingSummary: string;
  nextRecommendedCaseId: string;
}
