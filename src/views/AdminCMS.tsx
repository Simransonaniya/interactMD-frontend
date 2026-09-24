import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { fetchCases, getAuthHeaders, API_BASE_URL } from '../services/apiClient';
import { ClinicalCase } from '../types/clinical';

interface AdminCMSProps {
  onStartCase?: (c: ClinicalCase) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({ onStartCase }) => {
  const [selectedWorkflowStage, setSelectedWorkflowStage] = useState<string>('All');
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(52);
  const [patientGender, setPatientGender] = useState('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCases = async () => {
    try {
      const data = await fetchCases();
      setCases(data);
    } catch {
      // Backend may be offline
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const stages = [
    { id: 'All', label: 'All Cases', desc: 'All database scenarios' },
    { id: 'Published', label: 'Published', desc: 'Live in library' },
    { id: 'Draft', label: 'Drafts', desc: 'In development' }
  ];

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/cases`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          specialty,
          description: chiefComplaint,
          difficulty,
          is_published: true,
          patient_name: patientName,
          patient_age: Number(patientAge),
          patient_gender: patientGender,
          chief_complaint: chiefComplaint,
          history: clinicalHistory,
          onset: 'Started 1 hour ago',
          timing: 'Continuous',
          location: 'Central area',
          character: 'Severe discomfort',
          severity: '8/10',
          diagnosis
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create case' }));
        throw new Error(err.detail || 'Failed to create case in MongoDB Atlas.');
      }

      setStatusMessage(`Case '${title}' successfully created in MongoDB Atlas database!`);
      setIsCreatingDraft(false);
      setTitle('');
      setPatientName('');
      setChiefComplaint('');
      setClinicalHistory('');
      setDiagnosis('');
      loadCases();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-9">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-[#39605B]" />
            <span>Admin & Case Authoring CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2928] tracking-tight">
            Clinical Content Management
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#1A2928]/70 max-w-2xl font-normal">
            Author, clinically review, simulate test runs, and publish dynamic clinical encounter scenarios directly into MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingDraft(!isCreatingDraft)}
          className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#1A2928]" />
          <span>{isCreatingDraft ? 'Close Case Form' : 'Create New Clinical Case'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case Authoring Workflow Stages Pipeline */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 p-6 shadow-xs">
        <span className="text-xs font-bold text-[#39605B] uppercase tracking-wider block mb-3.5">
          Case Pipeline & Filtering:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stages.map((stage) => {
            const isSelected = selectedWorkflowStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedWorkflowStage(stage.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#14302F] border-[#39605B] text-[#F7F4EE] shadow-xs'
                    : 'bg-[#F7F4EE] hover:bg-[#F2D7B8]/30 border-[#39605B]/20 text-[#1A2928]'
                }`}
              >
                <div className={`font-bold text-xs ${isSelected ? 'text-[#F2D7B8]' : 'text-[#1A2928]'}`}>{stage.label}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#F7F4EE]/70' : 'text-[#1A2928]/60'}`}>{stage.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Case Form Drawer */}
      {isCreatingDraft && (
        <form onSubmit={handleCreateCase} className="bg-white rounded-3xl border border-[#39605B]/40 p-7 sm:p-8 shadow-xl space-y-5 animate-slide-up">
          <div className="flex items-center justify-between border-b border-[#39605B]/15 pb-4">
            <h2 className="font-serif font-bold text-[#1A2928] text-lg flex items-center space-x-2">
              <FileEdit className="w-5 h-5 text-[#39605B]" />
              <span>Create New Clinical Simulation Case in Database</span>
            </h2>
            <span className="text-xs font-semibold bg-[#14302F] text-[#F2D7B8] px-3 py-1 rounded-full">
              MongoDB Atlas Schema
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Case Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Acute Epigastric Pain Radiating to Back"
                className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs focus:ring-2 focus:ring-[#39605B] bg-[#F7F4EE]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40 text-[#1A2928]"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Patient Name & Demographics</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="col-span-1 p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40"
                />
                <input
                  type="number"
                  required
                  placeholder="Age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40"
                />
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40 text-[#1A2928]"
              >
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#39605B] mb-1">Chief Complaint & Opening Presentation</label>
            <input
              type="text"
              required
              placeholder="e.g. 'Severe stabbing epigastric pain that started after eating dinner...'"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs bg-[#F7F4EE]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Clinical History / Fact Summary</label>
              <textarea
                rows={3}
                placeholder="Pain onset, character, past medical history, medications..."
                value={clinicalHistory}
                onChange={(e) => setClinicalHistory(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs font-mono bg-[#F7F4EE]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#39605B] mb-1">Ground Truth Diagnosis (Hidden from Learner)</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Acute Pancreatitis secondary to Gallstones"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#39605B]/20 text-xs font-mono bg-[#F7F4EE]/40"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreatingDraft(false)}
              className="px-5 py-2.5 rounded-full border border-[#39605B]/30 text-xs font-semibold text-[#1A2928] hover:bg-[#F7F4EE] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Database...' : 'Save & Publish Case to MongoDB Atlas'}
            </button>
          </div>
        </form>
      )}

      {/* Case Management Table */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#39605B]/15 flex items-center justify-between">
          <h2 className="font-serif text-xl font-normal text-[#1A2928]">Registered Clinical Cases ({cases.length})</h2>
          <span className="text-xs text-[#1A2928]/60">MongoDB Atlas Live Store</span>
        </div>

        {cases.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#1A2928]/60">
            No clinical cases registered in database yet. Click <strong>Create New Clinical Case</strong> above or run <code className="bg-[#F7F4EE] px-1.5 py-0.5 rounded font-mono">python seed.py</code> to insert cases.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F4EE] text-[#39605B] font-semibold border-b border-[#39605B]/15 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Case Title & ID</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Specialty</th>
                  <th className="px-5 py-3.5">Difficulty</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#39605B]/10 text-[#1A2928]">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F4EE]/60 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#1A2928] block text-xs">{c.title}</span>
                      <span className="text-[10px] text-[#1A2928]/50 font-mono">{c.id}</span>
                    </td>
                    <td className="px-5 py-4">{c.patient?.name || 'Patient'} ({c.patient?.age || 45}y {c.patient?.gender || 'Unknown'})</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8] font-semibold text-[10px]">{c.specialty}</span>
                    </td>
                    <td className="px-5 py-4 font-mono">{c.difficulty}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Published
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {onStartCase && (
                        <button
                          onClick={() => onStartCase(c)}
                          className="px-3 py-1.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-[11px] inline-flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <Play className="w-3 h-3 fill-[#1A2928]" />
                          <span>Test Case</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
