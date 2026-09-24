import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  Play, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { ClinicalCase, DifficultyLevel } from '../types/clinical';
import { fetchCases } from '../services/apiClient';

interface CaseLibraryProps {
  onSelectCase: (c: ClinicalCase) => void;
  onPreviewCase: (c: ClinicalCase) => void;
}

export const CaseLibrary: React.FC<CaseLibraryProps> = ({ onSelectCase, onPreviewCase }) => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const specialties = ['All', 'Cardiology', 'Pulmonology', 'Gastroenterology', 'Emergency Medicine'];
  const difficulties = ['All', 'Novice', 'Intermediate', 'Advanced'];

  const loadCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCases(selectedSpecialty !== 'All' ? selectedSpecialty : undefined);
      setCases(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load clinical cases. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [selectedSpecialty]);

  const filteredCases = cases.filter(c => {
    const title = c.title || '';
    const desc = c.shortDescription || '';
    const ptName = c.patient?.name || '';
    const tags = c.tags || [];
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      title.toLowerCase().includes(search) ||
      desc.toLowerCase().includes(search) ||
      ptName.toLowerCase().includes(search) ||
      tags.some(t => (t || '').toLowerCase().includes(search));
    
    const matchesSpecialty = selectedSpecialty === 'All' || c.specialty === selectedSpecialty;
    const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;

    return matchesSearch && matchesSpecialty && matchesDifficulty;
  });

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-[#39605B]" />
            <span>Interactive OSCE Case Catalog</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2928] tracking-tight">
            Clinical Case Catalog
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#1A2928]/70 max-w-2xl font-normal">
            Select an evidence-based clinical presentation from the database to begin your virtual patient interview.
          </p>
        </div>

        <button
          onClick={loadCases}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 rounded-full border border-[#39605B]/30 text-xs font-semibold text-[#1A2928] hover:bg-[#F7F4EE] flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#39605B] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#39605B]/15 shadow-xs mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#39605B]/60 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by symptom, chief complaint, diagnosis, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#39605B]/20 text-xs sm:text-sm text-[#1A2928] focus:outline-none focus:ring-2 focus:ring-[#39605B] focus:border-[#39605B] transition-all placeholder:text-[#1A2928]/40 bg-[#F7F4EE]/50"
            />
          </div>

          {/* Specialty Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-4 rounded-full border border-[#39605B]/20 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#39605B] bg-[#F7F4EE]/50 text-[#1A2928] cursor-pointer"
            >
              {specialties.map(spec => (
                <option key={spec} value={spec}>Specialty: {spec}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full py-2.5 px-4 rounded-full border border-[#39605B]/20 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#39605B] bg-[#F7F4EE]/50 text-[#1A2928] cursor-pointer"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>Difficulty: {diff}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#39605B]/10 text-xs">
          <span className="text-[#1A2928]/60 font-medium">Quick Filters:</span>
          {['Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Fever', 'Cardiology', 'Emergency'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag === searchTerm ? '' : tag)}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                searchTerm === tag
                  ? 'bg-[#14302F] text-[#F2D7B8] border-[#14302F] font-semibold'
                  : 'bg-[#F7F4EE] hover:bg-[#F2D7B8]/40 text-[#1A2928] border-[#39605B]/20'
              }`}
            >
              #{tag}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedSpecialty('All'); setSelectedDifficulty('All'); }}
              className="text-xs text-[#39605B] hover:underline font-semibold ml-2 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#39605B]/20">
          <RefreshCw className="w-8 h-8 text-[#39605B] mx-auto mb-3 animate-spin" />
          <h4 className="text-sm font-semibold text-[#1A2928]">Loading clinical cases from database...</h4>
        </div>
      )}

      {/* Error Alert */}
      {!isLoading && error && (
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-red-900">Unable to load clinical cases</h4>
          <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={loadCases}
            className="mt-4 px-5 py-2 rounded-full bg-red-800 text-white text-xs font-semibold hover:bg-red-900 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty Database State */}
      {!isLoading && !error && cases.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#39605B]/20 max-w-2xl mx-auto p-8">
          <FolderOpen className="w-12 h-12 text-[#39605B]/60 mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-normal text-[#1A2928] mb-2">No clinical cases available</h3>
          <p className="text-xs sm:text-sm text-[#1A2928]/70 max-w-md mx-auto leading-relaxed mb-6">
            The database currently has 0 clinical cases. You can create a new case using the Admin CMS or explicitly run the database seed command (<code className="bg-[#F7F4EE] px-2 py-0.5 rounded text-[11px] font-mono border border-[#39605B]/20">python seed.py</code>) to load development cases.
          </p>
          <button
            onClick={loadCases}
            className="px-6 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Check for New Cases
          </button>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isLoading && !error && cases.length > 0 && filteredCases.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#39605B]/20">
          <AlertTriangle className="w-10 h-10 text-[#39605B] mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#1A2928]">No matching clinical cases found</h4>
          <p className="text-xs text-[#1A2928]/60 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing active filters to see all available cases.
          </p>
        </div>
      )}

      {/* Case Grid */}
      {!isLoading && !error && filteredCases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {filteredCases.map(c => {
            const getDifficultyBadge = (d: DifficultyLevel) => {
              switch(d) {
                case 'Novice': return 'bg-[#39605B]/15 text-[#39605B] border-[#39605B]/30';
                case 'Intermediate': return 'bg-[#14302F] text-[#F2D7B8] border-[#39605B]/40';
                case 'Advanced': return 'bg-[#102528] text-[#F7F4EE] border-[#39605B]/60';
              }
            };

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#39605B]/15 shadow-xs hover:shadow-md hover:border-[#39605B]/40 transition-all p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#14302F] text-[#F2D7B8]">
                        {c.specialty}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getDifficultyBadge(c.difficulty)}`}>
                        {c.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-[#1A2928]/60 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#39605B]" />
                      <span>{c.estimatedMinutes} mins OSCE</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1A2928] mb-2 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1A2928]/70 leading-relaxed mb-5 font-normal">
                    {c.shortDescription}
                  </p>

                  {/* Patient Vignette Snippet */}
                  <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#39605B]/15 mb-5 flex items-center space-x-4">
                    <img
                      src={c.patient.avatarUrl}
                      alt={c.patient.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#39605B]/30 shadow-xs"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A2928] text-sm">{c.patient.name}</span>
                        <span className="text-[11px] text-[#1A2928]/60">{c.patient.age}y {c.patient.gender} • {c.patient.occupation}</span>
                      </div>
                      <p className="text-[#1A2928]/80 mt-1 italic line-clamp-1 font-normal">
                        "{c.patient.initialStatement}"
                      </p>
                    </div>
                  </div>

                  {/* Learning Objectives Preview */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[11px] font-bold text-[#39605B] uppercase tracking-wider">Key Objectives:</span>
                    {c.learningObjectives.slice(0, 2).map((obj, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-[#1A2928]/80">
                        <CheckCircle className="w-3.5 h-3.5 text-[#39605B] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-[#39605B]/15 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onPreviewCase(c)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A2928] hover:bg-[#F7F4EE] border border-[#39605B]/25 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#39605B]" />
                    <span>Clinical Brief</span>
                  </button>

                  <button
                    onClick={() => onSelectCase(c)}
                    className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#1A2928]" />
                    <span>Enter Simulation</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
