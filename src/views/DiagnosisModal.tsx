import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  ClipboardCheck
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';

interface DiagnosisModalProps {
  clinicalCase: ClinicalCase;
  onClose: () => void;
  onSubmit: (submission: {
    primaryDiagnosisId: string;
    differentialIds: string[];
    selectedManagementIds: string[];
    clinicalRationale: string;
  }) => void;
}

export const DiagnosisModal: React.FC<DiagnosisModalProps> = ({
  clinicalCase,
  onClose,
  onSubmit
}) => {
  const [primaryDiagnosisId, setPrimaryDiagnosisId] = useState<string>('');
  const [differentialIds, setDifferentialIds] = useState<string[]>([]);
  const [selectedManagementIds, setSelectedManagementIds] = useState<string[]>([]);
  const [clinicalRationale, setClinicalRationale] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleDifferential = (id: string) => {
    if (differentialIds.includes(id)) {
      setDifferentialIds(differentialIds.filter(item => item !== id));
    } else {
      setDifferentialIds([...differentialIds, id]);
    }
  };

  const toggleManagement = (id: string) => {
    if (selectedManagementIds.includes(id)) {
      setSelectedManagementIds(selectedManagementIds.filter(item => item !== id));
    } else {
      setSelectedManagementIds([...selectedManagementIds, id]);
    }
  };

  const handleSubmit = () => {
    if (!primaryDiagnosisId) {
      setValidationError("Please select a primary working diagnosis to continue.");
      return;
    }
    setValidationError(null);
    onSubmit({
      primaryDiagnosisId,
      differentialIds,
      selectedManagementIds,
      clinicalRationale
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102528]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-[#39605B]/30 shadow-2xl overflow-hidden animate-slide-up text-[#1A2928] my-4 sm:my-8">
        
        {/* Header (#102528 Dark Header) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#102528] text-[#F7F4EE] flex items-center justify-between border-b border-[#39605B]/30">
          <div className="flex items-center space-x-2.5">
            <Brain className="w-5 h-5 text-[#F2D7B8] shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F7F4EE]">Clinical Reasoning & Management</h3>
              <p className="text-[10px] text-[#F7F4EE]/60">Final step before AI Attending evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 rounded-full hover:bg-[#14302F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-7 space-y-5 sm:space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* 1. Primary Working Diagnosis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#39605B] mb-2.5">
              1. Primary Working Diagnosis <span className="text-[#39605B]">*</span>
            </label>
            <div className="space-y-2">
              {clinicalCase.diagnosisOptions.map((dx) => (
                <label
                  key={dx.id}
                  className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    primaryDiagnosisId === dx.id
                      ? 'bg-[#14302F] border-[#39605B] text-[#F7F4EE] shadow-xs'
                      : 'bg-[#F7F4EE] border-[#39605B]/20 hover:border-[#39605B]/40 text-[#1A2928]'
                  }`}
                >
                  <input
                    type="radio"
                    name="primaryDiagnosis"
                    checked={primaryDiagnosisId === dx.id}
                    onChange={() => setPrimaryDiagnosisId(dx.id)}
                    className="mt-1 text-[#39605B] focus:ring-[#39605B]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">{dx.name}</span>
                    <span className={`text-[11px] ${primaryDiagnosisId === dx.id ? 'text-[#F2D7B8]' : 'text-[#1A2928]/60'}`}>
                      {dx.category} {dx.icdCode ? `(ICD-10: ${dx.icdCode})` : ''}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Top Differential Diagnoses */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#39605B] mb-2.5">
              2. Additional Differential Diagnoses Considered (Check all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clinicalCase.diagnosisOptions
                .filter(dx => dx.id !== primaryDiagnosisId)
                .map((dx) => {
                  const isChecked = differentialIds.includes(dx.id);
                  return (
                    <label
                      key={dx.id}
                      className={`flex items-center space-x-2.5 p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                        isChecked
                          ? 'bg-[#39605B]/15 border-[#39605B] text-[#1A2928] font-semibold'
                          : 'bg-[#F7F4EE] border-[#39605B]/20 hover:bg-white text-[#1A2928]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDifferential(dx.id)}
                        className="rounded text-[#39605B] focus:ring-[#39605B]"
                      />
                      <span className="truncate">{dx.name}</span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* 3. Immediate Management & Interventions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#39605B] mb-2.5">
              3. Immediate Acute Management Actions (Select appropriate guideline steps)
            </label>
            <div className="space-y-2">
              {clinicalCase.managementProtocols.map((protocol) => {
                const isChecked = selectedManagementIds.includes(protocol.id);
                return (
                  <label
                    key={protocol.id}
                    className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                      isChecked
                        ? 'bg-[#39605B]/15 border-[#39605B] text-[#1A2928] font-semibold'
                        : 'bg-[#F7F4EE] border-[#39605B]/20 hover:border-[#39605B]/40 text-[#1A2928]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleManagement(protocol.id)}
                      className="mt-0.5 rounded text-[#39605B] focus:ring-[#39605B]"
                    />
                    <span>{protocol.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Clinical Rationale & Justification */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#39605B] mb-2">
              4. Clinical Rationale & Synthesis
            </label>
            <textarea
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              placeholder="Explain how the history, physical findings, and diagnostics led to your working diagnosis and ruled out other emergencies..."
              rows={3}
              className="w-full p-3.5 rounded-2xl border border-[#39605B]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#39605B] bg-[#F7F4EE]/40 text-[#1A2928]"
            />
          </div>

        </div>

        {validationError && (
          <div className="mx-4 sm:mx-7 mb-2 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2">
            <span className="font-bold">Notice:</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-7 py-4 bg-[#F7F4EE] border-t border-[#39605B]/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-white border border-[#39605B]/25 transition-colors cursor-pointer"
          >
            Back to Patient
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-[#1A2928]" />
            <span>Submit for AI Evaluation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
