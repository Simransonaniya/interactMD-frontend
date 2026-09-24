/**
 * InteractMD — Clinical Cases Store.
 * All case data is cleanly loaded from external JSON specification (cases.json).
 */

import { ClinicalCase } from '../types/clinical';
import casesJson from './cases.json';

export const CLINICAL_CASES: ClinicalCase[] = casesJson as unknown as ClinicalCase[];

export const getCaseById = (id: string): ClinicalCase | undefined => {
  return CLINICAL_CASES.find(c => c.id === id);
};

export const getCasesBySpecialty = (specialty: string): ClinicalCase[] => {
  if (!specialty || specialty === 'All') return CLINICAL_CASES;
  return CLINICAL_CASES.filter(c => c.specialty.toLowerCase() === specialty.toLowerCase());
};
