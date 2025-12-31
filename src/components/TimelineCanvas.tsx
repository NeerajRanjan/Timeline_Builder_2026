import React, { useRef, useState, useEffect } from 'react';
import { MONTHS } from '../types/types';
import type { PlacedGoal, GoalItem } from '../types/types';
import { Calendar, Trash2, Edit2, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineCanvasProps {
  placedGoals: PlacedGoal[];
  setPlacedGoals: React.Dispatch<React.SetStateAction<PlacedGoal[]>>;
  draggedItem: GoalItem | null;
  viewportCenterCallback?: (monthIndex: number) => void;
}

const MONTH_WIDTH = 320; // Width of one month column

// Seasonal colors for light mode to reduce glare and add visual interest
const MONTH_THEMES = [
  'bg-blue-50/60 border-blue-100/50',      // Jan (Winter)
  'bg-blue-50/60 border-blue-100/50',      // Feb
  'bg-emerald-50/60 border-emerald-100/50',    // Mar (Spring)
  'bg-emerald-50/60 border-emerald-100/50',    // Apr
  'bg-yellow-50/60 border-yellow-100/50',  // May (Late Spring/Summer)
  'bg-yellow-50/60 border-yellow-100/50',  // Jun
  'bg-orange-50/60 border-orange-100/50',  // Jul (Summer)
  'bg-orange-50/60 border-orange-100/50',  // Aug
  'bg-rose-50/60 border-rose-100/50',        // Sep (Autumn)
  'bg-rose-50/60 border-rose-100/50',        // Oct
  'bg-indigo-50/60 border-indigo-100/50',  // Nov (Winter approaching)
  'bg-indigo-50/60 border-indigo-100/50',  // Dec
];

const TimelineCanvas: React.FC<TimelineCanvasProps> = ({ 
  placedGoals, 
  setPlacedGoals, 
  draggedItem,
  viewportCenterCallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Update viewport callback for parent
  useEffect(() => {
    if (viewportCenterCallback && !isMobile) {
        const centerOffset = window.innerWidth / 2;
        const currentX = -pan.x + centerOffset;
        const index = Math.floor(currentX / MONTH_WIDTH);
        const clampedIndex = Math.max(0, Math.min(11, index));
        viewportCenterCallback(clampedIndex);
    }
  }, [pan, viewportCenterCallback, isMobile]);

  // Handle Space key for panning mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) setIsSpacePressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Panning (Desktop Only)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    if (isSpacePressed || e.button === 1 || e.button === 0) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isMobile) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (containerRef.current && !isMobile) {
        containerRef.current.style.cursor = isSpacePressed ? 'grab' : 'default';
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isMobile) return;
    let dx = e.deltaX;
    let dy = e.deltaY;
    if (!e.shiftKey && Math.abs(dy) > Math.abs(dx)) {
        dx = dy;
        dy = 0;
    }
    setPan(prev => ({ x: prev.x - dx, y: prev.y - dy }));
  };

  // Drop Logic (Desktop Only)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || isMobile) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x; 
    const monthIndex = Math.floor(x / MONTH_WIDTH);

    if (monthIndex >= 0 && monthIndex < 12) {
      const newGoal: PlacedGoal = {
        ...draggedItem,
        id: `${draggedItem.id}-${Date.now()}`,
        monthIndex
      };
      setPlacedGoals(prev => [...prev, newGoal]);
    }
  };

  const handleGridDrop = (e: React.DragEvent, monthIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;
    
    const newGoal: PlacedGoal = {
        ...draggedItem,
        id: `${draggedItem.id}-${Date.now()}`,
        monthIndex
    };
    setPlacedGoals(prev => [...prev, newGoal]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeGoal = (id: string) => {
    setPlacedGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleStartEdit = (e: React.MouseEvent, goal: PlacedGoal) => {
    e.stopPropagation();
    setEditingId(goal.id);
    setEditValue(goal.title);
  };

  const handleSaveEdit = () => {
    if (editingId) {
        setPlacedGoals(prev => prev.map(g => g.id === editingId ? { ...g, title: editValue } : g));
        setEditingId(null);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setExpandedGoalId(prev => prev === id ? null : id);
  };

  const jumpToMonth = (index: number) => {
    if (isMobile) {
        const el = document.getElementById(`month-${index}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        const centerOffset = window.innerWidth / 2 - (MONTH_WIDTH / 2);
        setPan({ x: -index * MONTH_WIDTH + centerOffset, y: pan.y });
    }
  };

  // ------------------------------------
  // Render Desktop View (Infinite Canvas)
  // ------------------------------------
  if (!isMobile) {
    return (
        <div 
          className="absolute inset-0 bg-zinc-100 dark:bg-zinc-950 overflow-hidden touch-none transition-colors"
          style={{ overscrollBehavior: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Background Dots */}
          <div 
            className="absolute inset-0 dots-pattern opacity-20 pointer-events-none" 
            style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}
          />
    
          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="relative w-full h-full origin-top-left transition-transform duration-75 ease-out touch-none"
            style={{ cursor: isSpacePressed ? 'grab' : 'default' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div 
                className="absolute top-1/2 -translate-y-1/2 flex"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
            >
              {MONTHS.map((month, index) => (
                <div 
                  key={month} 
                  className={`
                    relative border-l flex flex-col justify-start pt-10 group select-none transition-colors
                    ${MONTH_THEMES[index]} dark:bg-transparent dark:border-zinc-800/50
                  `}
                  style={{ width: MONTH_WIDTH, height: '600px' }}
                >
                  <div className="absolute -top-12 left-4 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase group-hover:border-blue-500/50 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                    {month}
                  </div>
    
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent dark:group-hover:via-zinc-800/5 group-hover:via-zinc-100/30 pointer-events-none transition-all" />
    
                  <div className="p-4 space-y-3 mt-4">
                    {placedGoals.filter(g => g.monthIndex === index).map((goal, idx) => (
                      <GoalCard 
                        key={goal.id}
                        goal={goal}
                        index={idx}
                        isEditing={editingId === goal.id}
                        isExpanded={expandedGoalId === goal.id}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        onSaveEdit={handleSaveEdit}
                        onStartEdit={handleStartEdit}
                        onToggleExpand={handleToggleExpand}
                        onRemove={removeGoal}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="w-96 h-full border-l border-zinc-200 dark:border-zinc-800/50" />
            </div>
          </div>
    
          {/* Quick Jump */}
          <MonthQuickJump jumpToMonth={jumpToMonth} />

          {/* Empty State Hint */}
          {!isSpacePressed && placedGoals.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 dark:text-zinc-800 text-2xl md:text-4xl font-black tracking-tighter opacity-50 select-none whitespace-nowrap">
              DRAG OR TAP GOALS
            </div>
          )}
        </div>
      );
  }

  // ------------------------------------
  // Render Mobile View (Grid)
  // ------------------------------------
  return (
    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden transition-colors pb-32" ref={containerRef}>
        <div className="p-2 pt-20 grid grid-cols-2 gap-2">
            {MONTHS.map((month, index) => {
                const monthGoals = placedGoals.filter(g => g.monthIndex === index);
                const hasGoals = monthGoals.length > 0;
                
                return (
                    <div 
                        key={month} 
                        id={`month-${index}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleGridDrop(e, index)}
                        className={`
                            relative min-h-[120px] rounded-lg p-2 border transition-all duration-200
                            ${hasGoals 
                                ? `${MONTH_THEMES[index]} dark:bg-zinc-900 dark:border-zinc-800` 
                                : 'bg-white/50 dark:bg-zinc-900/30 border-dashed border-zinc-300 dark:border-zinc-800'
                            }
                        `}
                    >
                         <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{month.substring(0, 3)}</h3>
                             <span className="text-[10px] text-zinc-400 dark:text-zinc-700 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                         </div>
                         
                         <div className="space-y-2">
                            {monthGoals.length === 0 ? (
                                 <div className="h-full flex items-center justify-center py-4">
                                     <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Drop here</span>
                                 </div>
                            ) : (
                                monthGoals.map((goal, idx) => (
                                    <GoalCard 
                                        key={goal.id}
                                        goal={goal}
                                        index={idx}
                                        isEditing={editingId === goal.id}
                                        isExpanded={expandedGoalId === goal.id}
                                        editValue={editValue}
                                        setEditValue={setEditValue}
                                        onSaveEdit={handleSaveEdit}
                                        onStartEdit={handleStartEdit}
                                        onToggleExpand={handleToggleExpand}
                                        onRemove={removeGoal}
                                    />
                                ))
                            )}
                         </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

// Subcomponent for the Goal Card
const GoalCard = ({ 
    goal, isEditing, isExpanded, editValue, setEditValue, onSaveEdit, onStartEdit, onToggleExpand, onRemove, index = 0
}: any) => {
    return (
        <div 
            onClick={(e) => onToggleExpand(e, goal.id)}
            style={{ 
                animationDelay: `${index * 75}ms` 
            }}
            className={`
                relative bg-white dark:bg-zinc-800/50 backdrop-blur 
                border ${isExpanded ? 'border-blue-500/50' : 'border-zinc-200 dark:border-zinc-700/50'} 
                p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                cursor-pointer group select-none overflow-hidden
                animate-pop-in
            `}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${goal.color}`} />
            
            {isEditing ? (
                <div className="flex gap-1 pl-2">
                    <input 
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onSaveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white text-xs rounded px-1 py-1 w-full outline-none border border-blue-500"
                    />
                    <button onClick={(e) => { e.stopPropagation(); onSaveEdit(); }} className="text-green-500 hover:text-green-600">
                        <Check size={14} />
                    </button>
                </div>
            ) : (
                <div className="pl-2">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs leading-tight line-clamp-2">{goal.title}</h4>
                        {/* Only show expand chevron on larger cards or expanded state, keep it clean for grid */}
                        {isExpanded && (
                             <div className="text-zinc-400 dark:text-zinc-500 ml-1">
                                <ChevronUp size={12} />
                            </div>
                        )}
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                         <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/50 animate-in slide-in-from-top-1 duration-200">
                             <div className="flex flex-wrap gap-1 mb-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400`}>
                                    {goal.category}
                                </span>
                             </div>
                             
                             <div className="flex gap-1 justify-end">
                                <button 
                                    onClick={(e) => onStartEdit(e, goal)}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-blue-500 transition-colors"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemove(goal.id); }}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Subcomponent for Month Jump
const MonthQuickJump = ({ jumpToMonth }: { jumpToMonth: (i: number) => void }) => (
    <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 flex items-center gap-1 shadow-2xl z-20 pointer-events-auto max-w-[90vw] overflow-x-auto no-scrollbar hidden md:flex">
        {MONTHS.map((m, idx) => (
            <button
                key={m}
                onClick={() => jumpToMonth(idx)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors flex-shrink-0"
                title={`Jump to ${m}`}
            >
                {m.substring(0, 3)}
            </button>
        ))}
    </div>
);

export default TimelineCanvas;