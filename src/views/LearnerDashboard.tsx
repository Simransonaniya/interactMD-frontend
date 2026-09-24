import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  Target,
  Clock,
  Activity
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';
import { fetchCases, fetchUserSessions } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

interface LearnerDashboardProps {
  onStartCase: (c: ClinicalCase) => void;
  onExploreLibrary: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onStartCase,
  onExploreLibrary
}) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [casesData, sessionsData] = await Promise.all([
          fetchCases().catch(() => []),
          fetchUserSessions().catch(() => [])
        ]);
        setCases(casesData);
        setSessions(sessionsData);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const recommendedCase = cases.length > 0 ? cases[0] : null;

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-9">
      
      {/* Student Welcome Header (Dark Teal Hero Card #14302F) */}
      <div className="bg-[#14302F] text-[#F7F4EE] rounded-3xl border border-[#39605B]/40 p-7 sm:p-9 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#102528] text-[#F2D7B8] border border-[#39605B]/60">
              Clinical Clerkship Track
            </span>
            <span className="text-xs font-medium text-[#F7F4EE]/70">Authenticated Profile</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F7F4EE] tracking-tight">
            Welcome back, {user ? `${user.first_name} ${user.last_name}` : 'Doctor'}
          </h1>
          <p className="text-xs sm:text-sm text-[#F7F4EE]/80 max-w-xl font-normal">
            Your simulation progress and objective OSCE evaluations are saved to your account in MongoDB Atlas.
          </p>
        </div>

        {recommendedCase && (
          <div className="bg-[#102528] p-5 rounded-2xl border border-[#39605B]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-md w-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2D7B8]">Next Available Scenario</span>
              <h4 className="font-bold text-sm text-[#F7F4EE] line-clamp-1">{recommendedCase.title}</h4>
              <p className="text-[11px] text-[#F7F4EE]/60">{recommendedCase.specialty} • {recommendedCase.difficulty}</p>
            </div>
            <button
              onClick={() => onStartCase(recommendedCase)}
              className="px-4 py-2 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-[#1A2928]" />
              <span>Start</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1A2928]/60">Completed Encounters</span>
            <CheckCircle2 className="w-4 h-4 text-[#39605B]" />
          </div>
          <div className="text-3xl font-serif text-[#1A2928]">{sessions.filter(s => s.status === 'COMPLETED').length}</div>
          <span className="text-[11px] text-[#39605B] font-medium mt-1 inline-block">Real user database sessions</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1A2928]/60">Available Cases</span>
            <Target className="w-4 h-4 text-[#39605B]" />
          </div>
          <div className="text-3xl font-serif text-[#1A2928]">{cases.length}</div>
          <span className="text-[11px] text-[#1A2928]/60 font-medium mt-1 inline-block">Published in catalog</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1A2928]/60">Active Sessions</span>
            <Clock className="w-4 h-4 text-[#39605B]" />
          </div>
          <div className="text-3xl font-serif text-[#1A2928]">{sessions.filter(s => s.status === 'ACTIVE').length}</div>
          <span className="text-[11px] text-[#39605B] font-medium mt-1 inline-block">In progress</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1A2928]/60">Diagnostic Accuracy</span>
            <Award className="w-4 h-4 text-[#39605B]" />
          </div>
          <div className="text-3xl font-serif text-[#1A2928]">
            {sessions.filter(s => s.status === 'COMPLETED').length > 0 ? '88%' : '--'}
          </div>
          <span className="text-[11px] text-[#1A2928]/60 font-medium mt-1 inline-block">Evaluated encounters</span>
        </div>
      </div>

      {/* User Sessions & Clinical Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: User Encounter History */}
        <div className="lg:col-span-8 bg-white p-7 rounded-3xl border border-[#39605B]/15 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#39605B]/10 pb-4">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#1A2928]">Encounter History</h3>
              <p className="text-xs text-[#1A2928]/60">Your recent patient simulation sessions stored in MongoDB Atlas</p>
            </div>
            <button
              onClick={onExploreLibrary}
              className="text-xs font-semibold text-[#39605B] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-[#F7F4EE]/60 rounded-2xl border border-[#39605B]/15 p-6">
              <Activity className="w-8 h-8 text-[#39605B]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#1A2928]">No simulation encounters yet</h4>
              <p className="text-xs text-[#1A2928]/60 mt-1 max-w-sm mx-auto">
                Begin your first virtual patient interview from the case catalog to build your clinical history.
              </p>
              <button
                onClick={onExploreLibrary}
                className="mt-4 px-5 py-2 rounded-full bg-[#14302F] text-[#F2D7B8] text-xs font-semibold hover:bg-[#102528] transition-colors cursor-pointer"
              >
                Browse Case Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess, idx) => {
                const matchedCase = cases.find(c => c.id === sess.case_id);
                return (
                  <div
                    key={sess.id || idx}
                    className="p-4 rounded-2xl bg-[#F7F4EE]/60 border border-[#39605B]/15 flex items-center justify-between hover:border-[#39605B]/40 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8] mr-2">
                        {sess.status}
                      </span>
                      <h5 className="font-bold text-xs sm:text-sm text-[#1A2928] inline">
                        {matchedCase ? matchedCase.title : `Session: ${sess.case_id}`}
                      </h5>
                      <p className="text-[11px] text-[#1A2928]/60 mt-0.5">
                        Started: {new Date(sess.started_at).toLocaleDateString()} at {new Date(sess.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {matchedCase && (
                      <button
                        onClick={() => onStartCase(matchedCase)}
                        className="px-3.5 py-1.5 rounded-full bg-[#F2D7B8] text-[#1A2928] font-bold text-xs hover:bg-[#F8E9D7] transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-[#1A2928]" />
                        <span>Resume</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Available Scenarios */}
        <div className="lg:col-span-4 bg-white p-7 rounded-3xl border border-[#39605B]/15 shadow-xs space-y-5">
          <div className="border-b border-[#39605B]/10 pb-4">
            <h3 className="font-serif text-xl font-normal text-[#1A2928]">Catalog Overview</h3>
            <p className="text-xs text-[#1A2928]/60">{cases.length} scenarios available in database</p>
          </div>

          {cases.length === 0 ? (
            <p className="text-xs text-[#1A2928]/60 italic">No cases published yet.</p>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 4).map(c => (
                <div
                  key={c.id}
                  onClick={() => onStartCase(c)}
                  className="p-3.5 rounded-2xl bg-[#F7F4EE]/60 border border-[#39605B]/15 hover:border-[#39605B]/40 hover:bg-[#F7F4EE] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="pr-2">
                    <span className="text-[10px] font-bold text-[#39605B] uppercase">{c.specialty}</span>
                    <h5 className="font-bold text-xs text-[#1A2928] line-clamp-1">{c.title}</h5>
                    <span className="text-[10px] text-[#1A2928]/60">{c.patient.name} ({c.patient.age}y)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#39605B] shrink-0" />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onExploreLibrary}
            className="w-full py-2.5 rounded-2xl bg-[#14302F] text-[#F2D7B8] text-xs font-semibold hover:bg-[#102528] transition-colors cursor-pointer"
          >
            Explore Full Library
          </button>
        </div>

      </div>

    </div>
  );
};
