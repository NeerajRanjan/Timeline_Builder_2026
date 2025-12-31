import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TimelineCanvas from './components/TimelineCanvas';
import Summary from './components/Summary';
import type { AppState, PlacedGoal, GoalItem } from "./types/types";
import { PREDEFINED_GOALS } from "./types/types";
import { ArrowRight, Wand2, Loader2, Undo2, Redo2, Moon, Sun } from 'lucide-react';
import { generateGoalSchedule } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    screen: 'onboarding',
    userName: '',
    placedGoals: [],
  });
  
  const [availableGoals, setAvailableGoals] = useState<GoalItem[]>(PREDEFINED_GOALS);
  const [draggedItem, setDraggedItem] = useState<GoalItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentViewportMonth, setCurrentViewportMonth] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  // Undo/Redo State
  const [history, setHistory] = useState<PlacedGoal[][]>([]);
  const [redoStack, setRedoStack] = useState<PlacedGoal[][]>([]);

  // Load session from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('2026_timeline_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userName) {
            setAppState(prev => ({
                ...prev,
                userName: parsed.userName,
                placedGoals: parsed.placedGoals || [],
                screen: parsed.placedGoals.length > 0 ? 'builder' : 'onboarding'
            }));
        }
      } catch (e) {
        console.error("Failed to load session", e);
      }
    }
  }, []);

  // Save session on change
  useEffect(() => {
    if (appState.userName) {
        localStorage.setItem('2026_timeline_session', JSON.stringify({
            userName: appState.userName,
            placedGoals: appState.placedGoals
        }));
    }
  }, [appState.userName, appState.placedGoals]);

  const handleDragStart = (e: React.DragEvent, goal: GoalItem) => {
    setDraggedItem(goal);
    e.dataTransfer.setData('text/plain', goal.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const setPlacedGoals = (updater: React.SetStateAction<PlacedGoal[]>) => {
    const currentGoals = appState.placedGoals;
    const newGoals = typeof updater === 'function' ? updater(currentGoals) : updater;

    if (currentGoals === newGoals) return;

    setHistory(prev => [...prev, currentGoals]);
    setRedoStack([]);
    
    setAppState(prev => ({ ...prev, placedGoals: newGoals }));
  };

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousGoals = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setRedoStack(prev => [appState.placedGoals, ...prev]);
    setHistory(newHistory);
    setAppState(prev => ({ ...prev, placedGoals: previousGoals }));
  }, [history, appState.placedGoals]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextGoals = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    setHistory(prev => [...prev, appState.placedGoals]);
    setRedoStack(newRedoStack);
    setAppState(prev => ({ ...prev, placedGoals: nextGoals }));
  }, [redoStack, appState.placedGoals]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            e.shiftKey ? handleRedo() : handleUndo();
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            handleRedo();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleGoalTap = (goal: GoalItem) => {
    const newGoal: PlacedGoal = {
        ...goal,
        id: `${goal.id}-${Date.now()}`,
        monthIndex: currentViewportMonth
    };
    setPlacedGoals(prev => [...prev, newGoal]);
  };
  
  const handleAddCustomGoal = (goal: GoalItem) => {
    setAvailableGoals(prev => [goal, ...prev]);
  };

  const handleStart = () => {
    if (appState.userName.trim()) {
      setAppState(prev => ({ ...prev, screen: 'builder' }));
    }
  };

  const handleFinish = async () => {
    if (appState.placedGoals.length === 0) return;
    setIsGenerating(true);
    const enrichedGoals = await generateGoalSchedule(appState.placedGoals, appState.userName);
    setAppState(prev => ({
        ...prev,
        placedGoals: enrichedGoals,
        screen: 'summary'
    }));
    setIsGenerating(false);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen w-full transition-colors duration-300`}>
      {/* Onboarding Screen */}
      {appState.screen === 'onboarding' && (
        <div className="h-full w-full flex items-center justify-center bg-zinc-250 dark:bg-zinc-950 relative overflow-hidden transition-colors">
          <div className="absolute inset-0 dots-pattern opacity-10" />
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 transition-all z-20 shadow-lg"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="z-10 max-w-md w-full px-6 text-center animate-in zoom-in duration-500">
            <div className="mb-8 relative inline-block">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50 animate-pulse"></div>
               <div className="relative bg-white dark:bg-zinc-900 rounded-full px-4 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  2026 Timeline Builder
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white mb-4">
              Make time visible.
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg mb-8">
              Build your perfect 2026. Drag, drop, and let AI structure your success.
            </p>
            
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="What's your name?"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
                value={appState.userName}
                onChange={(e) => setAppState(prev => ({ ...prev, userName: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <button 
                onClick={handleStart}
                disabled={!appState.userName.trim()}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg"
              >
                Start Building <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Builder Screen */}
      {appState.screen === 'builder' && (
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden transition-colors">
          <TimelineCanvas 
            placedGoals={appState.placedGoals}
            setPlacedGoals={setPlacedGoals}
            draggedItem={draggedItem}
            viewportCenterCallback={setCurrentViewportMonth}
          />
          
          <Sidebar 
            availableGoals={availableGoals}
            onAddCustomGoal={handleAddCustomGoal}
            onDragStart={handleDragStart} 
            onGoalClick={handleGoalTap} 
          />

          {/* Top Bar - Improved Mobile Layout */}
          <div className="fixed top-0 left-0 right-0 p-3 md:p-4 flex justify-between items-start pointer-events-none z-30">
              <div className="pointer-events-auto md:ml-72 flex gap-2">
                 {/* Theme Toggle in Builder */}
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 md:p-2.5 rounded-full md:rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-all shadow-xl"
                 >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                 </button>
              </div>
              
              <div className="pointer-events-auto flex gap-2">
                   {/* Undo/Redo Group */}
                   <div className="flex items-center gap-0.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full md:rounded-lg p-1 shadow-xl h-10 md:h-auto">
                      <button 
                          onClick={handleUndo} 
                          disabled={history.length === 0}
                          className="p-1.5 md:p-2 rounded-full md:rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Undo"
                      >
                          <Undo2 size={18} />
                      </button>
                      <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                      <button 
                          onClick={handleRedo} 
                          disabled={redoStack.length === 0}
                          className="p-1.5 md:p-2 rounded-full md:rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Redo"
                      >
                          <Redo2 size={18} />
                      </button>
                   </div>

                   {/* Goal Counter - Hidden on very small screens, visible on others */}
                   <div className="hidden sm:flex bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs md:text-sm text-zinc-700 dark:text-zinc-300 shadow-xl font-medium items-center h-10 md:h-auto">
                      {appState.placedGoals.length} goals
                   </div>

                   {/* Expandable Finish Button */}
                   {appState.placedGoals.length > 0 && (
                       <button 
                          onClick={handleFinish}
                          disabled={isGenerating}
                          className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold h-10 md:h-auto rounded-full md:rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all duration-300 ease-in-out w-10 md:w-auto md:px-6 hover:w-32 md:hover:scale-105 active:scale-95 overflow-hidden"
                          title="Finish & Generate"
                       >
                          <div className="flex items-center gap-2 px-3">
                              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Wand2 className="w-4 h-4 shrink-0" />}
                              <span className="max-w-0 md:max-w-none group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-300 opacity-0 md:opacity-100 group-hover:opacity-100 text-sm">
                                  {isGenerating ? '...' : 'Finish'}
                              </span>
                          </div>
                       </button>
                   )}
              </div>
          </div>
        </div>
      )}

      {/* Summary Screen */}
      {appState.screen === 'summary' && (
        <Summary 
          userName={appState.userName} 
          goals={appState.placedGoals}
          onBack={() => setAppState(prev => ({ ...prev, screen: 'builder' }))}
        />
      )}
    </div>
  );
};

export default App;