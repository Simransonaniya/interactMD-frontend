/**
 * InteractMD — Production Release and Build Metadata
 * Tracks the latest NLU message role classification update & AI Patient deployment.
 */

export const RELEASE_METADATA = {
  version: '2.1.0',
  buildTimestamp: '2026-09-29T15:26:00+05:30',
  engine: 'InteractMD Multi-Role Clinical Dialogue Core',
  features: [
    'Message-role classification before patient-state retrieval',
    'Dedicated handlers for MANAGEMENT_INSTRUCTION, LIFESTYLE_MANAGEMENT, MEDICATION_STATEMENT, and CLINICAL_CLAIM',
    'Contextual multi-slot question handling (medication + meals + temporal relations)',
    'Zero unrelated patient-state leakage on clinician advice/statements',
    'Guaranteed elimination of false generic fallback responses'
  ]
};
