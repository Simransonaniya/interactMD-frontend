import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  Award, 
  Clock,
  CheckCircle2,
  X,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Download
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';
import { fetchCases } from '../services/apiClient';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  casesCompleted: number;
  avgScore: number;
  status: 'High Honors' | 'Honors' | 'Pass' | 'Needs Remediation';
  lastActive: string;
  weakArea: string;
  recentCases: { title: string; score: number; date: string }[];
}

interface EducatorAnalyticsProps {
  onStartCase?: (c: ClinicalCase) => void;
  onExploreLibrary?: () => void;
}

export const EducatorAnalytics: React.FC<EducatorAnalyticsProps> = ({ onStartCase, onExploreLibrary }) => {
  const [selectedCohort, setSelectedCohort] = useState('MS3 Internal Medicine Clerkship - Block 2');
  const [availableCases, setAvailableCases] = useState<ClinicalCase[]>([]);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Assignment form state
  const [selectedCaseToAssign, setSelectedCaseToAssign] = useState<string>('');
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>('Next Monday (7 Days)');
  const [assignmentNote, setAssignmentNote] = useState<string>('Required OSCE preparation scenario. Focus on systematic history taking.');

  useEffect(() => {
    fetchCases()
      .then(cases => {
        setAvailableCases(cases);
        if (cases.length > 0) {
          setSelectedCaseToAssign(cases[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const students: StudentRecord[] = [
    {
      id: 'std-1',
      name: 'Sarah Jenkins',
      email: 'sjenkins@med.jh.edu',
      casesCompleted: 18,
      avgScore: 89,
      status: 'High Honors',
      lastActive: 'Today at 09:42 AM',
      weakArea: 'Pulsus paradoxus check in dyspnea',
      recentCases: [
        { title: 'Acute Crushing Retrosternal Chest Pain', score: 94, date: 'Today' },
        { title: 'Acute Progressive Dyspnea & Stridor', score: 88, date: '2 days ago' },
        { title: 'Severe Acute Lower Quadrant Pain', score: 85, date: 'Last week' }
      ]
    },
    {
      id: 'std-2',
      name: 'Michael Chang',
      email: 'mchang@med.jh.edu',
      casesCompleted: 16,
      avgScore: 86,
      status: 'Honors',
      lastActive: 'Yesterday',
      weakArea: 'Sepsis Hour-1 bundle fluids',
      recentCases: [
        { title: 'Acute Progressive Dyspnea & Stridor', score: 90, date: 'Yesterday' },
        { title: 'Acute Crushing Retrosternal Chest Pain', score: 82, date: '3 days ago' }
      ]
    },
    {
      id: 'std-3',
      name: 'Amina Patel',
      email: 'apatel@med.jh.edu',
      casesCompleted: 19,
      avgScore: 93,
      status: 'High Honors',
      lastActive: 'Today at 11:15 AM',
      weakArea: 'None (Top Decile)',
      recentCases: [
        { title: 'Severe Acute Lower Quadrant Pain', score: 96, date: 'Today' },
        { title: 'Acute Crushing Retrosternal Chest Pain', score: 91, date: 'Yesterday' }
      ]
    },
    {
      id: 'std-4',
      name: 'David Kowalski',
      email: 'dkowalski@med.jh.edu',
      casesCompleted: 8,
      avgScore: 68,
      status: 'Needs Remediation',
      lastActive: '4 days ago',
      weakArea: 'Aortic dissection screening & pulse check',
      recentCases: [
        { title: 'Acute Crushing Retrosternal Chest Pain', score: 65, date: '4 days ago' },
        { title: 'Severe Acute Lower Quadrant Pain', score: 71, date: '10 days ago' }
      ]
    },
    {
      id: 'std-5',
      name: 'Rachel Torres',
      email: 'rtorres@med.jh.edu',
      casesCompleted: 14,
      avgScore: 82,
      status: 'Pass',
      lastActive: '2 days ago',
      weakArea: 'Pediatric vitals interpretation',
      recentCases: [
        { title: 'Acute Progressive Dyspnea & Stridor', score: 84, date: '2 days ago' },
        { title: 'Acute Crushing Retrosternal Chest Pain', score: 80, date: '5 days ago' }
      ]
    }
  ];

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Cases Completed", "Average Score", "Status", "Identified Weak Area", "Last Active"];
    const rows = students.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.email}"`,
      s.casesCompleted,
      `${s.avgScore}%`,
      `"${s.status}"`,
      `"${s.weakArea}"`,
      `"${s.lastActive}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `InteractMD_Cohort_Analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Cohort OSCE analytics exported successfully to CSV!");
  };

  const handleConfirmAssignment = () => {
    const matched = availableCases.find(c => c.id === selectedCaseToAssign);
    const caseTitle = matched ? matched.title : 'Selected OSCE Case';
    setIsAssignModalOpen(false);
    showToast(`Successfully assigned "${caseTitle}" to all 48 learners in ${selectedCohort}!`);
  };

  const handleConfirmRemediation = () => {
    setIsRemediationModalOpen(false);
    showToast(`Targeted remediation module 'Aortic Dissection Screening' assigned to flagged learners.`);
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-9 relative">
      
      {/* Interactive Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-[#102528] text-[#F7F4EE] border border-[#F2D7B8]/40 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-[#14302F] text-[#F2D7B8] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <span className="font-bold text-[#F2D7B8] block">Faculty Action Completed</span>
            <span className="text-[#F7F4EE]/90">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-[#39605B]" />
            <span>Institutional Educator Portal • Class Analytics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2928] tracking-tight">
            Cohort Performance & Blind Spots
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#1A2928]/70 max-w-2xl font-normal">
            Monitor real-time learner OSCE competencies, assign simulation scenarios, and remediate curriculum blind spots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="py-2.5 px-4 rounded-full border border-[#39605B]/20 text-xs font-semibold bg-white text-[#1A2928] focus:ring-2 focus:ring-[#39605B] cursor-pointer shadow-xs"
          >
            <option>MS3 Internal Medicine Clerkship - Block 2</option>
            <option>Emergency Medicine PGY-1 Residency Cohort</option>
            <option>Advanced Clinical Skills Transition Course</option>
          </select>

          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#1A2928]" />
            <span>Assign Case</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full border border-[#39605B]/30 text-xs font-semibold text-[#1A2928] hover:bg-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            title="Export full class metrics to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-[#39605B]" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          {onExploreLibrary && (
            <button
              onClick={onExploreLibrary}
              className="px-4 py-2.5 rounded-full border border-[#39605B]/30 text-xs font-semibold text-[#1A2928] hover:bg-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#39605B]" />
              <span>Library</span>
            </button>
          )}
        </div>
      </div>

      {/* Cohort Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Cohort Learners</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">48</div>
            <span className="text-[11px] text-[#39605B] font-semibold mt-1 block">
              96% Participation rate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Users className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Class OSCE Avg</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">84.6%</div>
            <span className="text-[11px] text-[#39605B] font-semibold flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-[#39605B]" />
              +5.1% vs Block 1
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Award className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Total Encounters</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">412</div>
            <span className="text-[11px] text-[#1A2928]/60 font-medium mt-1 block">
              8.6 cases/student avg
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#426C62] uppercase tracking-wider">Flagged Learners</span>
            <div className="font-serif text-3xl font-bold text-[#14302F] mt-1.5">3</div>
            <span className="text-[11px] text-[#426C62] font-semibold mt-1 block">
              Remediation recommended
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

      </div>

      {/* Cohort High-Yield Blind Spot Alert Banner */}
      <div className="p-7 rounded-3xl bg-[#14302F] border border-[#39605B]/40 text-[#F7F4EE] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-start space-x-3.5">
          <AlertTriangle className="w-5 h-5 text-[#F2D7B8] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-serif font-bold text-base text-[#F7F4EE]">
              Curriculum Blind Spot Detected: Aortic Dissection Screening in Acute Chest Pain
            </h3>
            <p className="text-xs text-[#F7F4EE]/80 mt-1 leading-relaxed max-w-2xl font-normal">
              38% of learners in this cohort omitted checking for pulse differentials or asking about tearing back pain prior to initiating antiplatelet therapy for acute myocardial infarction.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsRemediationModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shrink-0 transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1A2928]" />
          <span>Assign Remediation Module</span>
        </button>
      </div>

      {/* Learner Roster Table */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#39605B]/15 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-normal text-[#1A2928]">Student Roster & OSCE Readiness</h2>
            <p className="text-xs text-[#1A2928]/60 mt-0.5">Click any learner row to inspect simulation telemetry & assign targeted practice.</p>
          </div>
          <span className="text-xs text-[#1A2928]/60 font-medium">{students.length} of 48 active learners</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F4EE] text-[#39605B] font-semibold border-b border-[#39605B]/15 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Learner Name & Email</th>
                <th className="px-5 py-3.5">Cases Completed</th>
                <th className="px-5 py-3.5">Avg OSCE Score</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Identified Weak Area</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#39605B]/10 text-[#1A2928]">
              {students.map((s) => (
                <tr 
                  key={s.id} 
                  onClick={() => setSelectedStudent(s)}
                  className="hover:bg-[#F7F4EE]/80 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#1A2928] group-hover:text-[#39605B] block text-xs transition-colors">{s.name}</span>
                    <span className="text-[10px] text-[#1A2928]/50 font-mono">{s.email}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-medium">{s.casesCompleted} cases</td>
                  <td className="px-5 py-4 font-bold font-mono text-[#1A2928]">{s.avgScore}%</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      s.status === 'High Honors'
                        ? 'bg-[#F2D7B8] text-[#1A2928]'
                        : s.status === 'Honors'
                        ? 'bg-[#14302F] text-[#F2D7B8]'
                        : s.status === 'Pass'
                        ? 'bg-[#39605B]/15 text-[#39605B]'
                        : 'bg-[#102528] text-[#F7F4EE]'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#1A2928]/70 font-medium">{s.weakArea}</td>
                  <td className="px-5 py-4 text-[#1A2928]/50">{s.lastActive}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-xs font-semibold text-[#39605B] group-hover:underline inline-flex items-center space-x-1">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Assign Case to Cohort */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102528]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#39605B]/30 shadow-2xl overflow-hidden animate-slide-up text-[#1A2928]">
            <div className="px-6 py-4 bg-[#102528] text-[#F7F4EE] flex items-center justify-between border-b border-[#39605B]/30">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-[#F2D7B8]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7F4EE]">Assign Case to Cohort</h3>
                  <p className="text-[10px] text-[#F7F4EE]/60">{selectedCohort}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#39605B] uppercase tracking-wider mb-1.5">
                  Select Clinical Case Scenario
                </label>
                <select
                  value={selectedCaseToAssign}
                  onChange={(e) => setSelectedCaseToAssign(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#39605B]/20 bg-[#F7F4EE]/50 text-[#1A2928] font-medium focus:ring-2 focus:ring-[#39605B]"
                >
                  {availableCases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.specialty} • {c.difficulty})
                    </option>
                  ))}
                  {availableCases.length === 0 && (
                    <option value="">Acute Crushing Retrosternal Chest Pain (David Miller)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#39605B] uppercase tracking-wider mb-1.5">
                  Completion Due Window
                </label>
                <select
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#39605B]/20 bg-[#F7F4EE]/50 text-[#1A2928] font-medium focus:ring-2 focus:ring-[#39605B]"
                >
                  <option>Next 48 Hours (Urgent)</option>
                  <option>Next Monday (7 Days)</option>
                  <option>End of Clerkship Block (14 Days)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#39605B] uppercase tracking-wider mb-1.5">
                  Educator Instructions for Students
                </label>
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-2xl border border-[#39605B]/20 bg-[#F7F4EE]/50 text-[#1A2928] focus:ring-2 focus:ring-[#39605B]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F7F4EE] border-t border-[#39605B]/15 flex items-center justify-between">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-white border border-[#39605B]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Targeted Remediation */}
      {isRemediationModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102528]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#39605B]/30 shadow-2xl overflow-hidden animate-slide-up text-[#1A2928]">
            <div className="px-6 py-4 bg-[#14302F] text-[#F7F4EE] flex items-center justify-between border-b border-[#39605B]/30">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-[#F2D7B8]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7F4EE]">Assign Targeted Remediation</h3>
                  <p className="text-[10px] text-[#F7F4EE]/70">Targeting 3 flagged students with screening blind spots</p>
                </div>
              </div>
              <button
                onClick={() => setIsRemediationModalOpen(false)}
                className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">Identified Curriculum Deficit:</span>
                Learners failed to auscultate for aortic regurgitation murmur or check bilateral upper extremity blood pressures before ordering acute antiplatelet agents.
              </div>

              <div>
                <label className="block font-bold text-[#39605B] uppercase tracking-wider mb-1.5">
                  Select Remediation Focus
                </label>
                <div className="space-y-2">
                  <label className="p-3 rounded-2xl border border-[#39605B]/30 bg-[#F7F4EE] flex items-start space-x-2.5 cursor-pointer">
                    <input type="radio" name="remed" defaultChecked className="mt-0.5 text-[#39605B]" />
                    <div>
                      <span className="font-bold block">Aortic Dissection vs ACS Differential Protocol</span>
                      <span className="text-[11px] text-[#1A2928]/60">Interactive mini-OSCE with pulse differential verification</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F7F4EE] border-t border-[#39605B]/15 flex items-center justify-between">
              <button
                onClick={() => setIsRemediationModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-white border border-[#39605B]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemediation}
                className="px-6 py-2.5 rounded-full bg-[#14302F] hover:bg-[#102528] text-[#F2D7B8] font-bold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2D7B8]" />
                <span>Deploy Remediation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Student Clinical Record Detail */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#102528]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#39605B]/30 shadow-2xl overflow-hidden animate-slide-up text-[#1A2928]">
            <div className="px-6 py-4 bg-[#102528] text-[#F7F4EE] flex items-center justify-between border-b border-[#39605B]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#14302F] border border-[#39605B] flex items-center justify-center text-[#F2D7B8] font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7F4EE]">{selectedStudent.name}</h3>
                  <p className="text-[10px] text-[#F7F4EE]/60 font-mono">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-[#F7F4EE]/60 hover:text-[#F7F4EE] p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Stats pill */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15">
                  <span className="text-[10px] text-[#1A2928]/60 uppercase font-semibold">OSCE Score</span>
                  <div className="font-serif text-xl font-bold text-[#1A2928] mt-1">{selectedStudent.avgScore}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15">
                  <span className="text-[10px] text-[#1A2928]/60 uppercase font-semibold">Cases Completed</span>
                  <div className="font-serif text-xl font-bold text-[#1A2928] mt-1">{selectedStudent.casesCompleted}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15">
                  <span className="text-[10px] text-[#1A2928]/60 uppercase font-semibold">Standing</span>
                  <div className="text-xs font-bold text-[#39605B] mt-1.5">{selectedStudent.status}</div>
                </div>
              </div>

              {/* Identified Weak Spot */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Target Competency Gap:</span>
                <p>{selectedStudent.weakArea}</p>
              </div>

              {/* Recent Encounters */}
              <div>
                <span className="font-bold text-[#39605B] uppercase tracking-wider block mb-2">
                  Recent Simulated Patient Encounters
                </span>
                <div className="space-y-2">
                  {selectedStudent.recentCases.map((rc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F7F4EE]/80 border border-[#39605B]/15 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#1A2928] block">{rc.title}</span>
                        <span className="text-[10px] text-[#1A2928]/60">Completed: {rc.date}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-mono font-bold bg-[#14302F] text-[#F2D7B8] text-[11px]">
                        {rc.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-[#F7F4EE] border-t border-[#39605B]/15 flex items-center justify-between">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-white border border-[#39605B]/20 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const studentName = selectedStudent.name;
                  setSelectedStudent(null);
                  showToast(`Custom practice case sent directly to ${studentName}!`);
                }}
                className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign Targeted Practice</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
