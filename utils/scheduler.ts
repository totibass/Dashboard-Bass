
import { DayPlan, Task, TaskType, UserSettings } from '../types';

// Inspired by Nate Navarro's Bass Book structure & general bass pedagogy
const FULL_CURRICULUM: Partial<Task>[] = [
  // --- PHASE 1: FUNDAMENTALS (Days 1-15) ---
  { title: "Posture & Main Droite", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Position assise/debout, sangle. Alternance index/majeur stricte.", requiredSkill: 'holding_posture' },
  { title: "Muting Main Gauche", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Utiliser les doigts inactifs pour étouffer les cordes." },
  { title: "Le Métronome : Temps 1 & 3", type: TaskType.RHYTHM, durationMinutes: 20, description: "Jouer des noires. Sentir le click sur 1 et 3.", requiredSkill: 'rhythm' },
  { title: "Notes: Cordes à vide & Case 5", type: TaskType.THEORY, durationMinutes: 10, description: "Relation entre la 5ème case et la corde suivante." },
  { title: "Technique de l'Araignée (Chromatique)", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "1 doigt par case. Focus sur l'indépendance." },
  { title: "Notes: Cases 0 à 5 (E & A)", type: TaskType.THEORY, durationMinutes: 15, description: "Nommer et jouer les notes naturelles.", requiredSkill: 'notes_first_5_frets' },
  { title: "Raking (Main Droite)", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Glisser le doigt d'une corde aiguë vers une grave.", requiredSkill: 'raking' },
  { title: "Groove: La note noire", type: TaskType.REPERTOIRE, durationMinutes: 20, description: "Créer un groove simple en utilisant uniquement des noires." },
  { title: "Gamme Majeure (Doigté 1)", type: TaskType.THEORY, durationMinutes: 20, description: "Pattern 1 (Majeur doigt 2).", requiredSkill: 'major_scale_shape' },
  { title: "Octaves", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Forme géométrique de l'octave. Application disco/funk." },
  
  // --- PHASE 2: INTERMEDIATE TECHNIQUES (Days 16-45) ---
  { title: "Hammer-on & Pull-off", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "Legato pour fluidifier le jeu.", requiredSkill: 'hammer_pull' },
  { title: "Subdivisions: Croches", type: TaskType.RHYTHM, durationMinutes: 15, description: "Straight vs Shuffle feel." },
  { title: "Triades Majeures", type: TaskType.THEORY, durationMinutes: 20, description: "R-3-5. Arpèges sur tout le manche." },
  { title: "Triades Mineures", type: TaskType.THEORY, durationMinutes: 20, description: "R-b3-5. Comparaison avec Majeur." },
  { title: "Floating Thumb (5+ cordes)", type: TaskType.TECHNIQUE, durationMinutes: 25, description: "Le pouce suit la main pour muter les graves.", minStrings: 5, requiredSkill: 'floating_thumb' },
  { title: "Notes: Corde de Si Grave", type: TaskType.THEORY, durationMinutes: 15, description: "Identifier les notes sous la 5ème case.", minStrings: 5 },
  { title: "Ghost Notes (Notes mortes)", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "Percussion main gauche. Le son 'Tchick'." },
  { title: "Gamme Pentatonique Mineure", type: TaskType.THEORY, durationMinutes: 20, description: "La caisse à outils du rock et de la pop." },
  { title: "Slap: Le Thumb (Pouce)", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "Technique de rebond contre la frette.", requiredSkill: 'slap_basic' },
  { title: "Slap: Le Pop (Tir)", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "Tirer la corde (octaves) avec l'index.", requiredSkill: 'slap_basic' },
  { title: "Groove: Syncopes", type: TaskType.RHYTHM, durationMinutes: 20, description: "Accentuer les 'et' (contre-temps)." },
  { title: "Slides (Glissés)", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Glissés précis vers une note cible." },
  
  // --- PHASE 3: ADVANCED & MUSICALITY (Days 46-70) ---
  { title: "Modes: Dorien", type: TaskType.THEORY, durationMinutes: 20, description: "La couleur mineure 'funky'. (R 2 b3 4 5 6 b7)" },
  { title: "Modes: Mixolydien", type: TaskType.THEORY, durationMinutes: 20, description: "La couleur Dominante (Blues/Rock). (R 2 3 4 5 6 b7)" },
  { title: "Doublettes (16ème de notes)", type: TaskType.RHYTHM, durationMinutes: 20, description: "Rocco Prestia style mute." },
  { title: "Accords: Shell Voicings", type: TaskType.THEORY, durationMinutes: 25, description: "Jouer R-3-7 pour accompagner.", requiredSkill: 'chords' },
  { title: "Accords: Power Chords", type: TaskType.THEORY, durationMinutes: 15, description: "R-5-R. Utilisation rock/metal." },
  { title: "Walking Bass: Approche Chromatique", type: TaskType.IMPROVISATION, durationMinutes: 25, description: "Cibler les notes de l'accord par demi-ton." },
  { title: "Accords 6 cordes (Voicings C aiguë)", type: TaskType.THEORY, durationMinutes: 25, description: "Accords riches avec la corde de Do.", minStrings: 6 },
  { title: "Tapping: Une main", type: TaskType.TECHNIQUE, durationMinutes: 20, description: "Hammer-on depuis le néant.", requiredSkill: 'tapping' },
  { title: "Ear Training: 4te et 5te", type: TaskType.EAR_TRAINING, durationMinutes: 15, description: "Reconnaître les mouvements I-IV et I-V." },

  // --- PHASE 4: VIRTUOSITY & INTEGRATION (Days 71-90) ---
  { title: "Double Thumping (Victor Wooten)", type: TaskType.TECHNIQUE, durationMinutes: 30, description: "Pouce aller-retour comme un médiator." },
  { title: "Sweeping Bass", type: TaskType.TECHNIQUE, durationMinutes: 25, description: "Arpèges rapides sur plusieurs cordes." },
  { title: "Harmoniques Naturelles", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Cases 5, 7, 12. Jaco style." },
  { title: "Soloing: Phrasé", type: TaskType.IMPROVISATION, durationMinutes: 30, description: "Questions / Réponses. Laisser de l'espace." },
  { title: "Étude de Style: Motown", type: TaskType.REPERTOIRE, durationMinutes: 30, description: "Analyse James Jamerson. Chromatisme." },
  { title: "Étude de Style: Reggae", type: TaskType.REPERTOIRE, durationMinutes: 30, description: "Le 'One Drop'. Son lourd, peu de notes." },
  { title: "Palm Mute", type: TaskType.TECHNIQUE, durationMinutes: 15, description: "Étouffer au chevalet pour un son vintage." },
  { title: "Analyse: Donna Lee (Intro)", type: TaskType.REPERTOIRE, durationMinutes: 30, description: "Bebop head. Défi technique." },
];

// Helper to check availability
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const generateSchedule = (settings: UserSettings): DayPlan[] => {
  const schedule: DayPlan[] = [];
  const start = new Date(settings.startDate);
  
  // Filter curriculum based on settings
  const userStrings = parseInt(settings.bassType);
  
  // 1. ADAPT CURRICULUM
  // We remove tasks that don't fit the instrument OR that are too basic if the user marked them as known
  let activeCurriculum = FULL_CURRICULUM.filter(task => {
    // String constraint
    if (task.minStrings && task.minStrings > userStrings) return false;

    // Skill constraint (Adaptive)
    // If a user knows a skill, we typically skip the "Introduction" to it.
    // In a full app, we would replace it with "Intermediate X". 
    // Here, we simply skip to accelerate progress to advanced topics.
    if (task.requiredSkill && settings.knownSkills[task.requiredSkill as keyof typeof settings.knownSkills]) {
      return false; // Skip known stuff
    }
    return true;
  });

  // If curriculum is too short after filtering (unlikely given the list), we might repeat advanced stuff
  // But strictly we just follow the list.
  
  const totalDays = 90;
  // Standard Spaced Repetition Intervals (Fibonacci-ish)
  const reviewIntervals = [1, 3, 7, 14, 30, 60]; 
  
  // Queue for reviews: { task, dueDayIndex }
  let reviewQueue: { task: Task; dueDayIndex: number }[] = [];
  
  let lessonCursor = 0;
  let currentDate = new Date(start);

  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    const dayName = daysOfWeek[currentDate.getDay()];
    const isAvailable = settings.weeklyAvailability[dayName];
    
    // Calculate week number
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / msPerDay);
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;

    const dayPlan: DayPlan = {
      date: currentDate.toISOString().split('T')[0],
      dayIndex,
      tasks: [],
      isRestDay: !isAvailable,
      weekNumber
    };

    if (isAvailable) {
      let timeRemaining = settings.dailyMinutes;
      const daysTasks: Task[] = [];

      // --- 1. SCHEDULE REVIEWS (PRIORITY) ---
      // Find reviews due today or overdue
      const reviewsDue = reviewQueue.filter(r => r.dueDayIndex <= dayIndex);
      
      // Remove duplicates for the same day (e.g., if multiple reviews of same topic stack up)
      const uniqueReviews = new Map<string, Task>();
      reviewsDue.forEach(r => uniqueReviews.set(r.task.title, r.task));

      // Limit reviews to 50% of session time unless there's nothing new
      const maxReviewTime = Math.floor(settings.dailyMinutes * 0.6);
      let reviewTimeUsed = 0;

      for (const [title, originalTask] of uniqueReviews.entries()) {
        const reviewDuration = Math.ceil(originalTask.durationMinutes * 0.5); // Reviews are shorter
        
        if (reviewTimeUsed + reviewDuration <= maxReviewTime || lessonCursor >= activeCurriculum.length) {
           daysTasks.push({
             ...originalTask,
             id: `review-${dayIndex}-${title.replace(/\s/g, '')}`,
             durationMinutes: reviewDuration,
             isReview: true,
             completed: false
           });
           reviewTimeUsed += reviewDuration;
           timeRemaining -= reviewDuration;
           
           // Remove from queue
           reviewQueue = reviewQueue.filter(r => r.task.title !== title);
        }
      }

      // --- 2. SCHEDULE NEW LESSONS ---
      while (timeRemaining > 10 && lessonCursor < activeCurriculum.length) {
        const template = activeCurriculum[lessonCursor];
        if (!template) break;

        // Don't schedule a new lesson if we are already reviewing it today (rare, but possible)
        const alreadyInDay = daysTasks.some(t => t.title === template.title);
        
        if (!alreadyInDay) {
           const actualDuration = Math.min(template.durationMinutes || 20, timeRemaining);
           
           const newTask: Task = {
             id: `lesson-${dayIndex}-${lessonCursor}`,
             title: template.title!,
             description: template.description!,
             type: template.type || TaskType.TECHNIQUE,
             durationMinutes: actualDuration,
             completed: false,
             isReview: false
           };

           daysTasks.push(newTask);
           timeRemaining -= actualDuration;

           // Add future reviews for this new lesson
           reviewIntervals.forEach(interval => {
             reviewQueue.push({
               task: newTask,
               dueDayIndex: dayIndex + interval
             });
           });
        }
        
        lessonCursor++;
      }

      // If we still have time and ran out of content (improvisation time)
      if (timeRemaining > 15 && lessonCursor >= activeCurriculum.length) {
         daysTasks.push({
           id: `free-${dayIndex}`,
           title: "Pratique Libre / Improvisation",
           description: "Appliquez les concepts appris sur un backing track.",
           type: TaskType.IMPROVISATION,
           durationMinutes: timeRemaining,
           completed: false,
           isReview: false
         });
      }
      
      dayPlan.tasks = daysTasks;
    }

    schedule.push(dayPlan);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
};
