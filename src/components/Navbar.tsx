import React, { useState } from 'react';
import { 
  Activity, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Users, 
  PlayCircle,
  Stethoscope,
  Menu,
  X
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';

interface NavbarProps {
  currentView: 'landing' | 'login' | 'dashboard' | 'library' | 'simulation' | 'evaluation' | 'admin' | 'educator';
  setCurrentView: (view: 'landing' | 'login' | 'dashboard' | 'library' | 'simulation' | 'evaluation' | 'admin' | 'educator') => void;
  activeCase: ClinicalCase | null;
  hasActiveSession: boolean;
  onStartOSCECase?: () => void;
  onOpenAuthModal?: () => void;
}

import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LogIn } from 'lucide-react';

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeCase,
  hasActiveSession,
  onStartOSCECase,
  onOpenAuthModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleNavClick = (view: 'landing' | 'login' | 'dashboard' | 'library' | 'simulation' | 'evaluation' | 'admin' | 'educator') => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleStartAction = () => {
    if (onStartOSCECase) {
      onStartOSCECase();
    } else {
      handleNavClick('library');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#102528]/95 backdrop-blur-md border-b border-[#39605B]/30 transition-all text-[#F7F4EE]">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => handleNavClick('landing')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#14302F] border border-[#39605B]/50 flex items-center justify-center text-[#F2D7B8] shadow-inner transition-transform group-hover:scale-105 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2D7B8]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-[#F7F4EE]">INTERACT<span className="text-[#F2D7B8]">MD</span></span>
                <span className="text-[8px] sm:text-[10px] uppercase font-semibold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#14302F] text-[#F2D7B8] border border-[#39605B]/60">Clinical AI</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#F7F4EE]/60 font-medium hidden sm:block">Virtual Patient Simulation Platform</p>
            </div>
          </div>

          {/* Primary Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'landing'
                  ? 'text-[#1A2928] bg-[#F2D7B8] shadow-sm'
                  : 'text-[#F7F4EE]/80 hover:text-[#F7F4EE] hover:bg-[#14302F]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => handleNavClick('library')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                currentView === 'library'
                  ? 'text-[#1A2928] bg-[#F2D7B8] shadow-sm'
                  : 'text-[#F7F4EE]/80 hover:text-[#F7F4EE] hover:bg-[#14302F]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Case Library</span>
            </button>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-[#1A2928] bg-[#F2D7B8] shadow-sm'
                  : 'text-[#F7F4EE]/80 hover:text-[#F7F4EE] hover:bg-[#14302F]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Learner Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick('educator')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                currentView === 'educator'
                  ? 'text-[#1A2928] bg-[#F2D7B8] shadow-sm'
                  : 'text-[#F7F4EE]/80 hover:text-[#F7F4EE] hover:bg-[#14302F]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Educator Cohort</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'text-[#1A2928] bg-[#F2D7B8] shadow-sm'
                  : 'text-[#F7F4EE]/80 hover:text-[#F7F4EE] hover:bg-[#14302F]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Case CMS</span>
            </button>
          </nav>

          {/* Right Actions: Active Encounter Pill & Learner Profile & CTA & Mobile Toggle */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {hasActiveSession && activeCase && (
              <button
                onClick={() => handleNavClick('simulation')}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#14302F] border border-[#39605B] text-[#F2D7B8] text-[11px] sm:text-xs font-semibold hover:bg-[#14302F]/80 transition-all shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#F2D7B8] animate-ping"></span>
                <span className="hidden xs:inline">Active:</span>
                <span className="font-bold truncate max-w-[70px] sm:max-w-[120px]">{activeCase.patient.name}</span>
                <PlayCircle className="w-3.5 h-3.5 ml-0.5 text-[#F2D7B8]" />
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-[#39605B]/40 space-x-1.5 sm:space-x-2.5">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#F7F4EE]">{user.first_name} {user.last_name}</span>
                  <span className="text-[10px] text-[#F7F4EE]/60 uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#14302F] border border-[#39605B]/60 flex items-center justify-center text-[#F2D7B8] text-xs relative cursor-pointer hover:border-red-400/70 hover:text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#39605B]/50 hover:border-[#F2D7B8] text-[#F7F4EE] text-xs font-semibold transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#F2D7B8]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Primary Action Button - Always Accessible and Responsive */}
            <button
              onClick={handleStartAction}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[#1A2928]" />
              <span className="hidden xs:inline">Start OSCE Case</span>
              <span className="xs:hidden">Start</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#14302F] border border-[#39605B]/40 text-[#F2D7B8] hover:text-[#F7F4EE] transition-colors cursor-pointer ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile Drawer Navigation (Expandable) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#39605B]/30 bg-[#102528] px-4 py-4 space-y-3 animate-slide-up shadow-2xl">
          <div className="space-y-1.5">
            <button 
              onClick={() => handleNavClick('landing')} 
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${currentView === 'landing' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80 hover:bg-[#14302F]'}`}>
              <span>Platform Overview</span>
              <Activity className="w-4 h-4 opacity-70" />
            </button>
            <button 
              onClick={() => handleNavClick('library')} 
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${currentView === 'library' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80 hover:bg-[#14302F]'}`}>
              <span>Clinical Case Library</span>
              <BookOpen className="w-4 h-4 opacity-70" />
            </button>
            <button 
              onClick={() => handleNavClick('dashboard')} 
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${currentView === 'dashboard' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80 hover:bg-[#14302F]'}`}>
              <span>Learner Dashboard</span>
              <LayoutDashboard className="w-4 h-4 opacity-70" />
            </button>
            <button 
              onClick={() => handleNavClick('educator')} 
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${currentView === 'educator' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80 hover:bg-[#14302F]'}`}>
              <span>Educator Cohort</span>
              <Users className="w-4 h-4 opacity-70" />
            </button>
            <button 
              onClick={() => handleNavClick('admin')} 
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${currentView === 'admin' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80 hover:bg-[#14302F]'}`}>
              <span>Case CMS</span>
              <Settings className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <div className="pt-2 border-t border-[#39605B]/30 flex flex-col space-y-2">
            <button
              onClick={handleStartAction}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F2D7B8] text-[#1A2928] font-bold text-xs flex items-center justify-center space-x-2 shadow-sm"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Simulation Case</span>
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#14302F] text-[#F7F4EE] font-semibold text-xs border border-[#39605B]/50 flex items-center justify-center space-x-2"
              >
                <UserIcon className="w-4 h-4 text-[#F2D7B8]" />
                <span>Sign In to Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Horizontal pill navigation bar for quick mobile switching */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-[#39605B]/30 bg-[#14302F]/90 space-x-2 scrollbar-none text-xs">
        <button 
          onClick={() => handleNavClick('landing')} 
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'landing' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
          Overview
        </button>
        <button 
          onClick={() => handleNavClick('library')} 
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'library' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
          Cases
        </button>
        <button 
          onClick={() => handleNavClick('dashboard')} 
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'dashboard' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
          Dashboard
        </button>
        <button 
          onClick={() => handleNavClick('educator')} 
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'educator' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
          Educator
        </button>
        <button 
          onClick={() => handleNavClick('admin')} 
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'admin' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
          Admin CMS
        </button>
        {!isAuthenticated && (
          <button 
            onClick={() => handleNavClick('login')} 
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium cursor-pointer ${currentView === 'login' ? 'bg-[#F2D7B8] text-[#1A2928] font-bold' : 'text-[#F7F4EE]/80'}`}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
