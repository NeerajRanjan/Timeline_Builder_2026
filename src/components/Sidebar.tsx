import React, { useState } from 'react';
import type { GoalItem } from '../types/types';
import { GripVertical, Plus, X } from 'lucide-react';

interface SidebarProps {
  availableGoals: GoalItem[];
  onAddCustomGoal: (goal: GoalItem) => void;
  onDragStart: (e: React.DragEvent, goal: GoalItem) => void;
  onGoalClick: (goal: GoalItem) => void;
}

const CATEGORIES = ['health', 'career', 'skill', 'finance', 'personal', 'relationship'] as const;
const COLORS = [
  'bg-orange-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-rose-500'
];

const Sidebar: React.FC<SidebarProps> = ({ availableGoals, onAddCustomGoal, onDragStart, onGoalClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('personal');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleSave = () => {
    if (!newTitle.trim()) return;
    
    const newGoal: GoalItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      color: newColor
    };
    
    onAddCustomGoal(newGoal);
    setIsModalOpen(false);
    setNewTitle('');
    setNewCategory('personal');
    setNewColor(COLORS[0]);
  };

  return (
    <>
      <div className="
        fixed z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl
        flex animate-in slide-in-from-bottom duration-500
        transition-colors
        
        /* Mobile Styles: Bottom Bar */
        bottom-0 left-0 right-0 border-t flex-row overflow-x-auto p-4 gap-3
        
        /* Desktop Styles: Left Sidebar */
        md:top-4 md:left-4 md:bottom-4 md:w-64 md:flex-col md:border md:rounded-2xl md:overflow-hidden md:gap-0
      ">
        <div className="mb-0 md:mb-6 flex-shrink-0 flex items-center justify-between md:block mr-4 md:mr-0">
          <div>
            <h2 className="text-sm md:text-xl font-bold text-zinc-900 dark:text-white whitespace-nowrap">Goals</h2>
            <p className="hidden md:block text-xs text-zinc-500 dark:text-zinc-400">Drag or tap to add</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-1 mt-3 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <Plus size={12} /> Custom Goal
          </button>
        </div>

        {/* Mobile Create Button (First Item) */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="md:hidden flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 active:scale-95 transition-all"
        >
            <Plus size={20} />
        </button>

        <div className="flex md:flex-col gap-3 md:overflow-y-auto md:pr-2 w-full no-scrollbar">
          {availableGoals.map((goal) => (
            <div
              key={goal.id}
              draggable
              onDragStart={(e) => onDragStart(e, goal)}
              onClick={() => onGoalClick(goal)}
              className={`
                group relative p-3 md:p-4 rounded-xl cursor-grab active:cursor-grabbing
                bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200
                border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600
                shadow-md hover:shadow-lg hover:-translate-y-1
                min-w-[140px] md:min-w-0 flex-shrink-0
              `}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${goal.color}`} />
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm md:text-base truncate mr-2">{goal.title}</span>
                <div className="hidden md:block">
                   <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="block md:hidden">
                   <Plus className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold truncate">
                {goal.category}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 text-center">
            Hold <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Space</kbd> to Pan
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Create New Goal</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g., Run a Marathon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`
                        text-xs px-2 py-2 rounded-lg border capitalize transition-all
                        ${newCategory === cat 
                          ? 'bg-zinc-200 dark:bg-zinc-100 text-black dark:text-zinc-900 border-zinc-300 dark:border-white font-bold' 
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Color Tag</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`
                        w-6 h-6 rounded-full ${c} transition-transform
                        ${newColor === c ? 'ring-2 ring-zinc-900 dark:ring-white scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}
                      `}
                    />
                  ))}
                </div>
              </div>
              
              <button 
                onClick={handleSave}
                disabled={!newTitle.trim()}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;