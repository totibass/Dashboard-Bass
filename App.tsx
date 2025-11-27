import React, { useState, useEffect, useMemo } from 'react';
import { generateSchedule } from './utils/scheduler';
import { DayPlan, UserSettings, Task, TaskType } from './types';
import Metronome from './components/Metronome';
import CoachChat from './components/CoachChat';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  ChevronLeft,
  ChevronRight, 
  Music, 
  BookOpen, 
  Zap, 
  Headphones, 
  Mic2,
  ArrowRight,
  RefreshCw,
  Grid,
  Settings,
  ArrowLeft,
  X,
  Edit3
} from 'lucide-react';

// --- Helper Components ---

const TaskIcon = ({ type }: { type: TaskType }) => {
  switch (type) {
    case TaskType.TECHNIQUE: return <Zap size={16} className="text-yellow-500" />;
    case TaskType.THEORY: return <BookOpen size={16} className="text-blue-400" />;
    case TaskType.REPERTOIRE: return <Music size={16} className="text-green-500" />;
    case TaskType.EAR_TRAINING: return <Headphones size={16} className="text-purple-400" />;
    case TaskType.IMPROVISATION: return <Mic2 size={16} className="text-pink-500" />;
    case TaskType.RHYTHM: return <Clock size={16} className="text-red-400" />;
    default: return <CheckCircle size={16} />;
  }
};

const ProgressBar = ({ dayIndex, totalDays }: { dayIndex: number, totalDays: number }) => {
  const percentage = Math.min(100, Math.max(0, (dayIndex / totalDays) * 100));
  return (
    <div className="w-full bg-surfaceHighlight rounded-full h-4 mb-6 relative overflow-hidden">
      <div 
        className="bg-gradient-to-r from-primary to-orange-400 h-4 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
        JOUR {dayIndex} / {totalDays}
      </div>
    </div>
  );
};

// --- Modals ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surfaceHighlight rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center p-4 border-b border-surfaceHighlight">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-subtext hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  // --- State ---
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    startDate: new Date().toISOString().split('T')[0],
    weeklyAvailability: {
      'Monday': true, 'Tuesday': true, 'Wednesday': true, 
      'Thursday': true, 'Friday': true, 'Saturday': true, 'Sunday': false
    },
    dailyMinutes: 60,
    userName: '',
    bassType: '4',
    knownSkills: {
      holding_posture: false,
      tuning: false,
      alternate_plucking: false,
      raking: false,
      floating_thumb: false,
      shifting: false,
      hammer_pull: false,
      notes_first_5_frets: false,
      major_scale_shape: false,
      intervals_basic: false,
      slap_basic: false,
      tapping: false,
      chords: false
    }
  });

  const [schedule, setSchedule] = useState<DayPlan[]>([]);
  const [currentDateString, setCurrentDateString] = useState(new Date().toISOString().split('T')[0]);
  const [showMetronome, setShowMetronome] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  
  // Modals State
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TaskType | null>(null);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('bassmaster-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure data integrity if model changes
      if (!parsed.knownSkills) parsed.knownSkills = settings.knownSkills;
      
      setSettings(parsed);
      setIsOnboarded(true);
      setSchedule(generateSchedule(parsed));
      
      const savedTasks = localStorage.getItem('bassmaster-tasks');
      if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Re-generate schedule if settings change (mostly for availability/duration updates)
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bassmaster-settings', JSON.stringify(newSettings));
    setSchedule(generateSchedule(newSettings));
  };

  const handleStartProgram = () => {
    updateSettings(settings);
    setIsOnboarded(true);
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newState = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('bassmaster-tasks', JSON.stringify(newState));
      return newState;
    });
  };

  // --- Derived Data ---

  const todayPlan = useMemo(() => {
    return schedule.find(d => d.date === currentDateString) || null;
  }, [schedule, currentDateString]);

  const currentDayIndex = todayPlan ? todayPlan.dayIndex : 1;

  // Current Week Data
  const currentWeekDays = useMemo(() => {
    if (!todayPlan) return [];
    return schedule.filter(d => d.weekNumber === todayPlan.weekNumber);
  }, [schedule, todayPlan]);

  // Type Stats
  const statsByType = useMemo(() => {
    const stats: Record<string, { total: number, done: number, tasks: Task[] }> = {};
    Object.values(TaskType).forEach(type => stats[type] = { total: 0, done: 0, tasks: [] });
    
    schedule.forEach(day => {
      day.tasks.forEach(task => {
        if (stats[task.type]) {
          stats[task.type].total++;
          stats[task.type].tasks.push({ ...task, date: day.date } as any); // Add date for display
          if (completedTasks[task.id]) {
            stats[task.type].done++;
          }
        }
      });
    });
    return stats;
  }, [schedule, completedTasks]);

  // --- Calendar Helpers ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty placeholders for previous month days
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthDays = useMemo(() => getDaysInMonth(calendarMonth), [calendarMonth]);

  // --- Render Onboarding ---
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-surfaceHighlight animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">BassMaster 90</h1>
            <div className="text-subtext text-sm">Étape {onboardingStep}/3</div>
          </div>
          
          {/* Step 1: Basics */}
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl text-white font-medium mb-4">Configuration du Programme</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Votre Prénom</label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-surfaceHighlight rounded p-3 text-white focus:border-primary outline-none"
                  value={settings.userName}
                  onChange={e => setSettings({...settings, userName: e.target.value})}
                  placeholder="Ex: Marcus"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date de début</label>
                  <input 
                    type="date" 
                    className="w-full bg-background border border-surfaceHighlight rounded p-3 text-white focus:border-primary outline-none"
                    value={settings.startDate}
                    onChange={e => setSettings({...settings, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Temps / session (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-background border border-surfaceHighlight rounded p-3 text-white focus:border-primary outline-none"
                    value={settings.dailyMinutes}
                    onChange={e => setSettings({...settings, dailyMinutes: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jours d'entraînement</label>
                <div className="grid grid-cols-7 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => setSettings({
                        ...settings, 
                        weeklyAvailability: {
                          ...settings.weeklyAvailability,
                          [day]: !settings.weeklyAvailability[day]
                        }
                      })}
                      className={`text-xs py-2 rounded border transition-colors ${
                        settings.weeklyAvailability[day] 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-transparent border-surfaceHighlight text-subtext hover:border-gray-500'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setOnboardingStep(2)}
                  disabled={!settings.userName}
                  className="bg-surfaceHighlight hover:bg-white/10 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Instrument */}
          {onboardingStep === 2 && (
            <div className="space-y-6">
               <h2 className="text-xl text-white font-medium">Votre Instrument</h2>
               <p className="text-subtext">Le programme s'adapte au nombre de cordes de votre basse.</p>
               
               <div className="grid grid-cols-3 gap-4">
                  {['4', '5', '6'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings({...settings, bassType: type as any})}
                      className={`h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                        settings.bassType === type 
                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(217,119,6,0.3)]' 
                        : 'border-surfaceHighlight hover:border-gray-500 text-subtext'
                      }`}
                    >
                      <span className="text-4xl font-bold">{type}</span>
                      <span className="text-sm">Cordes</span>
                    </button>
                  ))}
               </div>

               <div className="flex justify-between mt-6">
                <button 
                  onClick={() => setOnboardingStep(1)}
                  className="text-subtext hover:text-white px-4 py-2 flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Retour
                </button>
                <button 
                  onClick={() => setOnboardingStep(3)}
                  className="bg-surfaceHighlight hover:bg-white/10 text-white px-6 py-2 rounded-lg transition"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Assessment */}
          {onboardingStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl text-white font-medium">Auto-Évaluation (Niveau Actuel)</h2>
              <p className="text-subtext text-sm">Cochez ce que vous maîtrisez DÉJÀ.</p>

              <div className="h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {/* Categories of skills */}
                 <div>
                    <h3 className="text-primary text-xs font-bold uppercase mb-2">Bases & Main Droite</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'holding_posture', label: "Posture / Tenue de l'instrument" },
                            { id: 'tuning', label: "Accorder à l'oreille" },
                            { id: 'alternate_plucking', label: "Jeu aux doigts alterné strict" },
                            { id: 'raking', label: "Raking (Ratisser les cordes)" },
                            { id: 'floating_thumb', label: "Floating Thumb (Muting main droite)" }
                        ].map(skill => (
                            <div key={skill.id} className="flex items-center gap-3 p-2 rounded border border-surfaceHighlight hover:bg-surfaceHighlight/50 cursor-pointer"
                                onClick={() => setSettings({
                                    ...settings,
                                    knownSkills: { ...settings.knownSkills, [skill.id]: !settings.knownSkills[skill.id as keyof typeof settings.knownSkills] }
                                })}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${settings.knownSkills[skill.id as keyof typeof settings.knownSkills] ? 'bg-primary border-primary' : 'border-subtext'}`}>
                                    {settings.knownSkills[skill.id as keyof typeof settings.knownSkills] && <CheckCircle size={10} className="text-white" />}
                                </div>
                                <span className="text-sm text-gray-300">{skill.label}</span>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-primary text-xs font-bold uppercase mb-2">Théorie & Manche</h3>
                    <div className="space-y-2">
                        {[
                             { id: 'notes_first_5_frets', label: "Notes cases 0-5 (par cœur)" },
                             { id: 'major_scale_shape', label: "Gamme Majeure (Doigté 1)" },
                             { id: 'intervals_basic', label: "Compréhension des Intervalles" },
                             { id: 'chords', label: "Construction des accords (Triades/7ème)" }
                        ].map(skill => (
                            <div key={skill.id} className="flex items-center gap-3 p-2 rounded border border-surfaceHighlight hover:bg-surfaceHighlight/50 cursor-pointer"
                                onClick={() => setSettings({
                                    ...settings,
                                    knownSkills: { ...settings.knownSkills, [skill.id]: !settings.knownSkills[skill.id as keyof typeof settings.knownSkills] }
                                })}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${settings.knownSkills[skill.id as keyof typeof settings.knownSkills] ? 'bg-primary border-primary' : 'border-subtext'}`}>
                                    {settings.knownSkills[skill.id as keyof typeof settings.knownSkills] && <CheckCircle size={10} className="text-white" />}
                                </div>
                                <span className="text-sm text-gray-300">{skill.label}</span>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-primary text-xs font-bold uppercase mb-2">Techniques Avancées</h3>
                    <div className="space-y-2">
                        {[
                             { id: 'hammer_pull', label: "Hammer-on / Pull-off" },
                             { id: 'slap_basic', label: "Slap (Thumb & Pop basique)" },
                             { id: 'tapping', label: "Tapping" }
                        ].map(skill => (
                            <div key={skill.id} className="flex items-center gap-3 p-2 rounded border border-surfaceHighlight hover:bg-surfaceHighlight/50 cursor-pointer"
                                onClick={() => setSettings({
                                    ...settings,
                                    knownSkills: { ...settings.knownSkills, [skill.id]: !settings.knownSkills[skill.id as keyof typeof settings.knownSkills] }
                                })}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${settings.knownSkills[skill.id as keyof typeof settings.knownSkills] ? 'bg-primary border-primary' : 'border-subtext'}`}>
                                    {settings.knownSkills[skill.id as keyof typeof settings.knownSkills] && <CheckCircle size={10} className="text-white" />}
                                </div>
                                <span className="text-sm text-gray-300">{skill.label}</span>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>

              <div className="flex justify-between mt-8">
                <button 
                  onClick={() => setOnboardingStep(2)}
                  className="text-subtext hover:text-white px-4 py-2 flex items-center gap-2"
                >
                   <ArrowLeft size={16} /> Retour
                </button>
                <button 
                  onClick={handleStartProgram}
                  className="bg-primary hover:bg-primaryHover text-white font-bold px-8 py-3 rounded-lg transition shadow-lg flex items-center gap-2"
                >
                  Générer mon programme <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Main Dashboard Render ---

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary selection:text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-surfaceHighlight px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">BM</div>
             <div>
               <h1 className="font-bold text-sm sm:text-lg leading-tight">Dashboard — Basse {settings.bassType} cordes</h1>
               <p className="text-xs text-subtext">de {settings.userName}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-subtext hover:text-white hover:bg-surfaceHighlight p-2 rounded-full transition"
                title="Paramètres"
             >
                <Settings size={20} />
             </button>
             <button 
                onClick={() => setShowMetronome(!showMetronome)}
                className={`p-2 rounded-full transition ${showMetronome ? 'bg-primary text-white' : 'text-subtext hover:bg-surfaceHighlight'}`}
                title="Métronome"
             >
                <Clock size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        
        {/* Progress Section */}
        <section>
          <div className="flex justify-between items-end mb-2">
             <h2 className="text-subtext text-sm">Progression globale</h2>
            <span className="text-primary text-sm font-bold">{Math.round((currentDayIndex / 90) * 100)}% Objectif</span>
          </div>
          <ProgressBar dayIndex={currentDayIndex} totalDays={90} />
        </section>

        {/* Metronome Widget (Conditional) */}
        {showMetronome && (
            <div className="mb-6 animate-fade-in-down">
                <Metronome onClose={() => setShowMetronome(false)} />
            </div>
        )}

        {/* 1. Today's Plan */}
        <section className="bg-surface rounded-xl border border-surfaceHighlight overflow-hidden shadow-lg">
          <div className="p-4 bg-surfaceHighlight/50 border-b border-surfaceHighlight flex justify-between items-center">
             <h3 className="font-bold text-lg flex items-center gap-2">
               <CalendarIcon className="text-primary" size={20} />
               Programme du jour
             </h3>
             <div className="text-right">
                <div className="text-xs text-subtext font-mono capitalize">
                  {new Date(currentDateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
             </div>
          </div>

          <div className="divide-y divide-surfaceHighlight">
            {!todayPlan || todayPlan.isRestDay ? (
               <div className="p-8 text-center text-subtext flex flex-col items-center gap-3">
                 <Headphones size={40} className="text-surfaceHighlight" />
                 <p>Journée de repos. L'intégration neuronale se fait aussi pendant le sommeil !</p>
               </div>
            ) : (
                todayPlan.tasks.map((task, idx) => (
                    <div key={task.id} className={`p-4 transition-colors ${completedTasks[task.id] ? 'bg-surfaceHighlight/20' : 'hover:bg-surfaceHighlight/30'}`}>
                        <div className="flex items-start gap-4">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    completedTasks[task.id] 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'border-subtext hover:border-primary'
                                }`}
                            >
                                {completedTasks[task.id] && <CheckCircle size={14} />}
                            </button>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {task.isReview && (
                                                <span className="text-[10px] uppercase font-bold bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <RefreshCw size={8} /> Rappel
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-subtext border border-surfaceHighlight px-1.5 rounded flex items-center gap-1">
                                                <TaskIcon type={task.type} />
                                                {task.type}
                                            </span>
                                        </div>
                                        <h4 className={`font-medium text-lg ${completedTasks[task.id] ? 'text-subtext line-through' : 'text-white'}`}>
                                            {task.title}
                                        </h4>
                                    </div>
                                    <span className="text-xs font-mono text-subtext bg-background px-2 py-1 rounded">
                                        {task.durationMinutes} min
                                    </span>
                                </div>
                                <p className="text-sm text-subtext mt-1">{task.description}</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </section>

        {/* 2. Current Week Calendar */}
        <section className="space-y-3">
          <h3 className="text-white font-bold text-lg pl-1 flex items-center gap-2">
            <Grid size={18} className="text-subtext" /> Semaine en cours (Semaine {todayPlan?.weekNumber || 1})
          </h3>
          <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
             {/* Header Row */}
             <div className="grid grid-cols-7 border-b border-surfaceHighlight bg-surfaceHighlight/30">
                {currentWeekDays.map(day => (
                   <div key={day.date} className="p-2 text-center text-xs text-subtext font-bold uppercase">
                      {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)}
                   </div>
                ))}
             </div>
             {/* Days Row */}
             <div className="grid grid-cols-7">
                {currentWeekDays.map(day => {
                    const isToday = day.date === currentDateString;
                    const isDone = !day.isRestDay && day.tasks.length > 0 && day.tasks.every(t => completedTasks[t.id]);
                    const hasTasks = day.tasks.length > 0;
                    
                    return (
                       <button 
                          key={day.date} 
                          onClick={() => setSelectedDay(day)}
                          className={`h-24 p-2 border-r border-surfaceHighlight last:border-r-0 flex flex-col justify-between relative text-left transition hover:bg-surfaceHighlight/30 ${isToday ? 'bg-primary/10' : ''}`}
                       >
                          <div className="flex justify-between w-full">
                             <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                                {new Date(day.date).getDate()}
                             </span>
                             {isDone && <div className="bg-green-500 rounded-full p-0.5"><CheckCircle size={10} className="text-white" /></div>}
                          </div>
                          
                          <div className="text-xs text-subtext mt-1 w-full">
                             {day.isRestDay ? (
                                <span className="opacity-50">Repos</span>
                             ) : (
                                <>
                                   {hasTasks ? (
                                     <div className="space-y-1">
                                        {day.tasks.slice(0, 2).map((t, i) => (
                                          <div key={i} className="truncate text-[10px] border-l-2 border-primary pl-1 opacity-80">{t.title}</div>
                                        ))}
                                        {day.tasks.length > 2 && <div className="text-[10px] pl-1">+{day.tasks.length - 2} autres</div>}
                                     </div>
                                   ) : <span className="text-[10px]">Libre</span>}
                                </>
                             )}
                          </div>
                       </button>
                    )
                })}
             </div>
          </div>
        </section>

        {/* 3. Full Calendar Month View */}
        <section className="bg-surface rounded-xl border border-surfaceHighlight p-4">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                  <CalendarIcon className="text-subtext" size={18} /> Calendrier Complet
              </h3>
              <div className="flex items-center gap-4 bg-background rounded-lg p-1 border border-surfaceHighlight">
                 <button 
                    onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                    className="p-1 hover:text-white text-subtext transition"
                 >
                    <ChevronLeft size={20} />
                 </button>
                 <span className="text-sm font-bold min-w-[100px] text-center capitalize">
                    {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                 </span>
                 <button 
                    onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                    className="p-1 hover:text-white text-subtext transition"
                 >
                    <ChevronRight size={20} />
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-7 gap-px bg-surfaceHighlight rounded-lg overflow-hidden border border-surfaceHighlight">
              {/* Weekday Headers */}
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                 <div key={d} className="bg-surface p-2 text-center text-xs font-bold text-subtext uppercase">
                    {d}
                 </div>
              ))}
              
              {/* Days */}
              {monthDays.map((date, i) => {
                 if (!date) return <div key={`empty-${i}`} className="bg-surface/50 h-24" />;
                 
                 const dateStr = date.toISOString().split('T')[0];
                 const plan = schedule.find(s => s.date === dateStr);
                 const isToday = dateStr === currentDateString;
                 const isPast = dateStr < currentDateString;
                 const allDone = plan && !plan.isRestDay && plan.tasks.every(t => completedTasks[t.id]);

                 return (
                    <button 
                      key={dateStr}
                      onClick={() => plan && setSelectedDay(plan)} 
                      disabled={!plan}
                      className={`bg-surface h-24 p-2 flex flex-col justify-between transition hover:bg-surfaceHighlight/20 text-left ${isToday ? 'ring-inset ring-2 ring-primary' : ''}`}
                    >
                       <div className="flex justify-between items-start w-full">
                          <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-subtext'}`}>
                             {date.getDate()}
                          </span>
                          {allDone && <CheckCircle size={12} className="text-green-500" />}
                       </div>
                       
                       {plan && (
                          <div className="text-[10px] mt-1 w-full">
                             {plan.isRestDay ? (
                                <span className="text-subtext/40 block mt-4 text-center">Repos</span>
                             ) : (
                                <div className="space-y-1">
                                   <div className={`h-1.5 rounded-full w-full ${isPast ? (allDone ? 'bg-green-900' : 'bg-red-900') : 'bg-surfaceHighlight'}`}>
                                      <div 
                                         className={`h-full rounded-full ${isPast ? (allDone ? 'bg-green-500' : 'bg-red-500') : 'bg-primary'}`} 
                                         style={{ width: `${plan.tasks.length > 0 ? (plan.tasks.filter(t => completedTasks[t.id]).length / plan.tasks.length) * 100 : 0}%` }}
                                      />
                                   </div>
                                   <span className="text-subtext block text-center">{plan.tasks.length} exos</span>
                                </div>
                             )}
                          </div>
                       )}
                    </button>
                 );
              })}
           </div>
        </section>

        {/* 4. Program By Type */}
        <section className="space-y-4">
           <h3 className="font-bold text-lg pl-1">Répartition de l'entraînement</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statsByType).map(([type, stat]: [string, { total: number, done: number, tasks: Task[] }]) => (
                <button 
                    key={type} 
                    onClick={() => setSelectedCategory(type as TaskType)}
                    className="bg-surface border border-surfaceHighlight p-4 rounded-lg flex items-center gap-4 transition hover:border-primary hover:bg-surfaceHighlight/20 text-left"
                >
                   <div className="p-3 bg-background rounded-full">
                      <TaskIcon type={type as TaskType} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">{type}</span>
                        <span className="text-subtext text-xs">{stat.done} / {stat.total}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5">
                        <div 
                          className="bg-surfaceHighlight h-1.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${stat.total > 0 ? (stat.done / stat.total) * 100 : 0}%`, backgroundColor: 'currentColor' }} 
                        /> 
                      </div>
                   </div>
                </button>
              ))}
           </div>
        </section>

      </main>

      {/* --- Modals --- */}
      
      {/* Settings Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="Paramètres de l'entraînement"
      >
        <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Temps par session (minutes)</label>
              <input 
                type="number" 
                className="w-full bg-background border border-surfaceHighlight rounded p-3 text-white focus:border-primary outline-none"
                value={settings.dailyMinutes}
                onChange={e => updateSettings({...settings, dailyMinutes: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Jours d'entraînement</label>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    onClick={() => updateSettings({
                      ...settings, 
                      weeklyAvailability: {
                        ...settings.weeklyAvailability,
                        [day]: !settings.weeklyAvailability[day]
                      }
                    })}
                    className={`text-sm py-2 px-3 rounded border transition-colors flex justify-between items-center ${
                      settings.weeklyAvailability[day] 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-transparent border-surfaceHighlight text-subtext hover:border-gray-500'
                    }`}
                  >
                    <span>{day === 'Monday' ? 'Lundi' : day === 'Tuesday' ? 'Mardi' : day === 'Wednesday' ? 'Mercredi' : day === 'Thursday' ? 'Jeudi' : day === 'Friday' ? 'Vendredi' : day === 'Saturday' ? 'Samedi' : 'Dimanche'}</span>
                    {settings.weeklyAvailability[day] && <CheckCircle size={14} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-surfaceHighlight">
                <p className="text-xs text-subtext">La modification de ces paramètres régénérera votre calendrier futur, mais conservera votre historique.</p>
            </div>
        </div>
      </Modal>

      {/* Day Detail Modal */}
      <Modal 
        isOpen={!!selectedDay} 
        onClose={() => setSelectedDay(null)} 
        title={selectedDay ? `Programme du ${new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}
      >
         {selectedDay && (
            <div className="space-y-4">
               {selectedDay.isRestDay ? (
                  <div className="text-center py-8 text-subtext">
                     <Headphones size={48} className="mx-auto mb-4 opacity-50" />
                     <p className="text-lg">Journée de repos</p>
                  </div>
               ) : (
                  selectedDay.tasks.length === 0 ? (
                      <p className="text-center text-subtext">Aucune tâche planifiée.</p>
                  ) : (
                      selectedDay.tasks.map((task) => (
                        <div key={task.id} className="bg-surfaceHighlight/20 p-3 rounded-lg border border-surfaceHighlight">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-white text-sm">{task.title}</h4>
                              <span className="text-xs font-mono text-subtext bg-surfaceHighlight px-1.5 py-0.5 rounded">{task.durationMinutes} min</span>
                           </div>
                           <p className="text-xs text-subtext mb-2">{task.description}</p>
                           <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${task.isReview ? 'bg-purple-900/50 text-purple-300' : 'bg-primary/20 text-primary'}`}>
                                 {task.isReview ? <RefreshCw size={10} /> : <Zap size={10} />}
                                 {task.isReview ? 'Rappel' : 'Nouvelle leçon'}
                              </span>
                              {completedTasks[task.id] && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10} /> Terminé</span>}
                           </div>
                        </div>
                      ))
                  )
               )}
            </div>
         )}
      </Modal>

      {/* Category Detail Modal */}
      <Modal 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)} 
        title={`Sessions : ${selectedCategory}`}
      >
         <div className="space-y-2">
            {statsByType[selectedCategory as string]?.tasks.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((task: any, idx: number) => (
               <div key={`${task.id}-${idx}`} className="flex items-center justify-between p-2 border-b border-surfaceHighlight last:border-0">
                  <div className="flex-1">
                     <p className="text-sm font-medium text-white">{task.title}</p>
                     <p className="text-xs text-subtext">
                        {new Date(task.date).toLocaleDateString('fr-FR')} • {task.durationMinutes} min
                     </p>
                  </div>
                  {completedTasks[task.id] ? (
                     <CheckCircle size={16} className="text-green-500" />
                  ) : (
                     <div className="w-4 h-4 rounded-full border border-subtext" />
                  )}
               </div>
            ))}
            {statsByType[selectedCategory as string]?.tasks.length === 0 && (
                <p className="text-center text-subtext py-4">Aucune session de ce type pour le moment.</p>
            )}
         </div>
      </Modal>

      <CoachChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default App;