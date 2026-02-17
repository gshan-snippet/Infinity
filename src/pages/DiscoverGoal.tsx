import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Dumbbell,
  Wrench,
  Repeat,
  Palette,
  BarChart3,
  Users,
  Flame,
  Brain,
  Handshake,
  Medal,
  Camera,
  Hammer,
  Binary,
  Target,
  HeartHandshake,
  Theater,
  Compass,
  Crown,
  Building2,
  Star,
  ShieldCheck,
  Landmark,
  GraduationCap,
  MicVocal,
  FlaskConical,
  Lightbulb,
  Plane,
  Loader2,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type QuizOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  border: string;
  hoverShadow: string;
};

type QuizQuestion = {
  id: string;
  title: string;
  subtitle: string;
  minSelect: number;
  maxSelect: number;
  buttonLabel: string;
  options: QuizOption[];
};

type SummaryData = {
  title?: string;
  identity_archetype?: string;
  summary_points?: string[];
  strength_breakdown?: Record<string, string>;
  career_family?: {
    primary?: string;
    secondary?: string;
    parallel?: string;
  };
  risk_stability_meter?: {
    risk_score?: string;
    stability_score?: string;
    note?: string;
  };
  week_1_challenge?: string[];
};

const questions: QuizQuestion[] = [
  {
    id: 'avoid-work',
    title: 'Which of these activities would you actively avoid in your daily work?',
    subtitle: 'Select as many as you want, but leave at least 1 unselected',
    minSelect: 1,
    maxSelect: 8,
    buttonLabel: '✨ Continue',
    options: [
      { id: 'physical', title: 'Physical/Sports', description: 'Playing sports, physical labor, or being on my feet all day.', icon: Dumbbell, iconBg: 'from-orange-400/30 to-orange-500/10', border: 'border-orange-300/60', hoverShadow: 'hover:shadow-orange-500/20' },
      { id: 'technical', title: 'Technical/Building', description: 'Learning technical skills like coding, engineering, or building hardware.', icon: Wrench, iconBg: 'from-cyan-400/30 to-cyan-500/10', border: 'border-cyan-300/60', hoverShadow: 'hover:shadow-cyan-500/20' },
      { id: 'repetitive', title: 'Repetitive Processes', description: 'Doing the same administrative or operational task repeatedly.', icon: Repeat, iconBg: 'from-emerald-400/30 to-emerald-500/10', border: 'border-emerald-300/60', hoverShadow: 'hover:shadow-emerald-500/20' },
      { id: 'creative', title: 'Creative Output', description: 'Having to come up with new ideas, design things, or create content.', icon: Palette, iconBg: 'from-rose-400/30 to-rose-500/10', border: 'border-rose-300/60', hoverShadow: 'hover:shadow-rose-500/20' },
      { id: 'data', title: 'Data & Analysis', description: 'Staring at spreadsheets, analyzing numbers, or finding patterns in data.', icon: BarChart3, iconBg: 'from-indigo-400/30 to-indigo-500/10', border: 'border-indigo-300/60', hoverShadow: 'hover:shadow-indigo-500/20' },
      { id: 'social', title: 'Social/Teamwork', description: 'Working closely with lots of people, managing teams, or constant meetings.', icon: Users, iconBg: 'from-sky-400/30 to-sky-500/10', border: 'border-sky-300/60', hoverShadow: 'hover:shadow-sky-500/20' },
      { id: 'pressure', title: 'High Pressure', description: 'High-stakes environments with tight deadlines and big responsibilities.', icon: Flame, iconBg: 'from-red-400/30 to-red-500/10', border: 'border-red-300/60', hoverShadow: 'hover:shadow-red-500/20' },
      { id: 'theoretical', title: 'Theoretical/Abstract', description: 'Reading long research papers, deep thinking, or academic discussions.', icon: Brain, iconBg: 'from-blue-400/30 to-blue-500/10', border: 'border-blue-300/60', hoverShadow: 'hover:shadow-blue-500/20' },
      { id: 'sales', title: 'Sales/Persuasion', description: 'Convincing people to buy something, negotiating, or self-promotion.', icon: Handshake, iconBg: 'from-amber-400/30 to-amber-500/10', border: 'border-amber-300/60', hoverShadow: 'hover:shadow-amber-500/20' }
    ]
  },
  {
    id: 'natural-gravity',
    title: "If money and judgment didn't exist, what would you naturally gravitate towards?",
    subtitle: 'Select one',
    minSelect: 1,
    maxSelect: 1,
    buttonLabel: '⚡ Almost There!',
    options: [
      { id: 'athlete', title: 'The Athlete', description: 'Playing sports, physical competition, mastering my body.', icon: Medal, iconBg: 'from-orange-400/30 to-orange-500/10', border: 'border-orange-300/60', hoverShadow: 'hover:shadow-orange-500/20' },
      { id: 'creator', title: 'The Creator', description: 'Editing videos, designing graphics, making music, writing stories.', icon: Camera, iconBg: 'from-rose-400/30 to-rose-500/10', border: 'border-rose-300/60', hoverShadow: 'hover:shadow-rose-500/20' },
      { id: 'builder', title: 'The Builder', description: 'Building things with my hands (woodwork, electronics) or coding software/apps.', icon: Hammer, iconBg: 'from-cyan-400/30 to-cyan-500/10', border: 'border-cyan-300/60', hoverShadow: 'hover:shadow-cyan-500/20' },
      { id: 'analyst', title: 'The Analyst', description: 'Solving puzzles, working with data, optimizing systems, finding patterns.', icon: Binary, iconBg: 'from-indigo-400/30 to-indigo-500/10', border: 'border-indigo-300/60', hoverShadow: 'hover:shadow-indigo-500/20' },
      { id: 'strategist', title: 'The Strategist', description: 'Planning businesses, competitive games (chess), thinking 5 steps ahead.', icon: Target, iconBg: 'from-blue-400/30 to-blue-500/10', border: 'border-blue-300/60', hoverShadow: 'hover:shadow-blue-500/20' },
      { id: 'helper', title: 'The Helper', description: 'Teaching, mentoring, coaching, volunteering, helping society grow.', icon: HeartHandshake, iconBg: 'from-emerald-400/30 to-emerald-500/10', border: 'border-emerald-300/60', hoverShadow: 'hover:shadow-emerald-500/20' },
      { id: 'performer', title: 'The Performer', description: 'Dancing, acting, playing music, being on stage.', icon: Theater, iconBg: 'from-yellow-400/30 to-yellow-500/10', border: 'border-yellow-300/60', hoverShadow: 'hover:shadow-yellow-500/20' },
      { id: 'explorer', title: 'The Explorer', description: 'Researching deep topics, reading, learning just for the joy of knowing.', icon: Compass, iconBg: 'from-teal-400/30 to-teal-500/10', border: 'border-teal-300/60', hoverShadow: 'hover:shadow-teal-500/20' },
      { id: 'leader', title: 'The Leader', description: 'Organizing people, leading teams, being in charge of projects.', icon: Crown, iconBg: 'from-amber-400/30 to-amber-500/10', border: 'border-amber-300/60', hoverShadow: 'hover:shadow-amber-500/20' },
      { id: 'balanced-lifestyle', title: 'Balanced Lifestyle', description: 'I just want a decent job with enough salary, so that I can spend time on me and my family.', icon: Home, iconBg: 'from-lime-400/30 to-lime-500/10', border: 'border-lime-300/60', hoverShadow: 'hover:shadow-lime-500/20' }
    ]
  },
  {
    id: 'success-definition',
    title: 'If you could snap your fingers and achieve one of these outcomes, which feels most like "success" to you?',
    subtitle: 'Select one',
    minSelect: 1,
    maxSelect: 1,
    buttonLabel: '✨ Reveal My Matches',
    options: [
      { id: 'entrepreneur', title: 'The Entrepreneur', description: 'Build a successful business, be my own boss, create wealth and jobs.', icon: Building2, iconBg: 'from-cyan-400/30 to-cyan-500/10', border: 'border-cyan-300/60', hoverShadow: 'hover:shadow-cyan-500/20' },
      { id: 'celebrity', title: 'The Athlete/Celebrity', description: 'Become a recognized name in sports or entertainment, with fame and glory.', icon: Star, iconBg: 'from-yellow-400/30 to-yellow-500/10', border: 'border-yellow-300/60', hoverShadow: 'hover:shadow-yellow-500/20' },
      { id: 'civil-servant', title: 'The Civil Servant', description: 'A secure government job with good benefits, work-life balance, and stability.', icon: ShieldCheck, iconBg: 'from-emerald-400/30 to-emerald-500/10', border: 'border-emerald-300/60', hoverShadow: 'hover:shadow-emerald-500/20' },
      { id: 'power-broker', title: 'The Power Broker', description: 'Rise to power and influence within a large organization or government.', icon: Landmark, iconBg: 'from-orange-400/30 to-orange-500/10', border: 'border-orange-300/60', hoverShadow: 'hover:shadow-orange-500/20' },
      { id: 'mentor', title: 'The Mentor/Coach', description: 'Directly impact lives by teaching, guiding, and helping others grow.', icon: GraduationCap, iconBg: 'from-sky-400/30 to-sky-500/10', border: 'border-sky-300/60', hoverShadow: 'hover:shadow-sky-500/20' },
      { id: 'artist', title: 'The Artist/Creator', description: 'Create work (art, music, content) that resonates with people, even if behind the scenes.', icon: MicVocal, iconBg: 'from-rose-400/30 to-rose-500/10', border: 'border-rose-300/60', hoverShadow: 'hover:shadow-rose-500/20' },
      { id: 'expert', title: 'The Expert/Scientist', description: "Become the world's leading expert in a fascinating subject, pushing the boundaries of knowledge.", icon: FlaskConical, iconBg: 'from-indigo-400/30 to-indigo-500/10', border: 'border-indigo-300/60', hoverShadow: 'hover:shadow-indigo-500/20' },
      { id: 'innovator', title: 'The Innovator', description: "Invent something new (product, technology) that changes how people live, even if you're not famous.", icon: Lightbulb, iconBg: 'from-blue-400/30 to-blue-500/10', border: 'border-blue-300/60', hoverShadow: 'hover:shadow-blue-500/20' },
      { id: 'freedom', title: 'The Freedom Seeker', description: 'A location-independent, flexible career that allows maximum personal freedom (e.g., freelancing, digital nomad).', icon: Plane, iconBg: 'from-teal-400/30 to-teal-500/10', border: 'border-teal-300/60', hoverShadow: 'hover:shadow-teal-500/20' }
    ]
  }
];

const DiscoverGoal = () => {
  const navigate = useNavigate();
  const { saveActivity } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelections = answers[currentQuestion.id] || [];
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const validationMessage = useMemo(() => {
    if (currentSelections.length < currentQuestion.minSelect) {
      return `Select at least ${currentQuestion.minSelect} option${currentQuestion.minSelect > 1 ? 's' : ''}.`;
    }
    if (currentSelections.length > currentQuestion.maxSelect) {
      return `You can select up to ${currentQuestion.maxSelect} options.`;
    }
    return null;
  }, [currentQuestion, currentSelections.length]);

  const toggleOption = (optionId: string) => {
    setAnswers((prev) => {
      const selected = prev[currentQuestion.id] || [];
      const isSelected = selected.includes(optionId);

      if (isSelected) {
        return {
          ...prev,
          [currentQuestion.id]: selected.filter((id) => id !== optionId)
        };
      }

      if (selected.length >= currentQuestion.maxSelect) {
        if (currentQuestion.maxSelect === 1) {
          return { ...prev, [currentQuestion.id]: [optionId] };
        }
        return prev;
      }

      return {
        ...prev,
        [currentQuestion.id]: [...selected, optionId]
      };
    });
  };

  const getQuestionById = (questionId: string) => questions.find((q) => q.id === questionId);

  const mapAnswerIdsToTitles = (questionId: string, selectedIds: string[]) => {
    const question = getQuestionById(questionId);
    if (!question) return [];
    return selectedIds
      .map((id) => question.options.find((opt) => opt.id === id)?.title)
      .filter(Boolean) as string[];
  };

  const buildPayload = () => ({
    question1: mapAnswerIdsToTitles('avoid-work', answers['avoid-work'] || []),
    question2: mapAnswerIdsToTitles('natural-gravity', answers['natural-gravity'] || []),
    question3: mapAnswerIdsToTitles('success-definition', answers['success-definition'] || [])
  });

  const fetchSummary = async () => {
    const response = await fetch('http://localhost:5000/api/no-goal-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload())
    });
    const data = await response.json();
    if (!response.ok || !data?.personalized_summary) {
      throw new Error(data?.error || 'Could not generate summary');
    }
    return data.personalized_summary;
  };

  const fetchCareerTable = async () => {
    const payload = buildPayload();
    const response = await fetch('http://localhost:5000/api/no-goal-career-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data?.career_match_table)) {
      throw new Error(data?.error || 'Could not generate career table');
    }
    return { payload, data };
  };

  const handleNext = async () => {
    if (validationMessage) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    setFlowError(null);
    setSummaryLoading(true);
    try {
      const personalizedSummary = await fetchSummary();
      setSummaryData(personalizedSummary);
      setSummaryOpen(true);
    } catch (err) {
      console.error('Error generating summary:', err);
      setFlowError(err instanceof Error ? err.message : 'Failed to generate your summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRefineAnswers = () => {
    setSummaryOpen(false);
    setCurrentQuestionIndex(0);
  };

  const handleContinueWithSummary = async () => {
    setFlowError(null);
    setMatchesLoading(true);
    try {
      const { payload, data } = await fetchCareerTable();

      await saveActivity({
        type: 'goal_discovery_quiz',
        option: 'no-goal',
        answers: payload,
        summary: summaryData,
        aiData: data,
        timestamp: new Date().toISOString()
      });

      navigate('/discover-goal-matches', {
        state: {
          careerTable: data.career_match_table,
          summary: summaryData,
          initialAnswers: payload
        }
      });
    } catch (err) {
      console.error('Error generating career table:', err);
      setFlowError(err instanceof Error ? err.message : 'Failed to generate career matches');
    } finally {
      setMatchesLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="rounded-2xl border border-white/40 bg-white/55 backdrop-blur-lg p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <p className="text-sm font-bold text-slate-900">{progress}%</p>
            </div>
            <div className="h-3 rounded-full bg-slate-200/80 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{currentQuestion.title}</h1>
              <p className="text-slate-600 font-medium">{currentQuestion.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {currentQuestion.options.map((option) => {
                const selected = currentSelections.includes(option.id);
                return (
                  <motion.div key={option.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }}>
                    <Card
                      onClick={() => toggleOption(option.id)}
                      className={`h-full cursor-pointer rounded-2xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm ${option.border} ${option.hoverShadow} ${selected ? 'ring-2 ring-cyan-500 shadow-xl scale-[1.01]' : 'shadow-md hover:shadow-xl'}`}
                    >
                      <div className="p-5">
                        <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${option.iconBg} border border-white/60 flex items-center justify-center`}>
                          <option.icon className="h-6 w-6 text-slate-800" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{option.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{option.description}</p>
                        <div className="mt-4 flex justify-end">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-300'}`}>
                            {selected && <Check className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-3">
          {flowError && (
            <p className="text-sm font-medium text-red-600">{flowError}</p>
          )}
          {validationMessage && (
            <p className="text-sm font-medium text-red-600">{validationMessage}</p>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleNext}
              disabled={!!validationMessage || summaryLoading}
              className="w-full sm:w-auto sm:min-w-[240px] h-12 text-base font-semibold rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110 shadow-lg shadow-cyan-500/30"
            >
              {summaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {summaryLoading ? 'Creating Summary...' : currentQuestion.buttonLabel}
            </Button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {summaryOpen && summaryData && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="w-full max-w-2xl rounded-2xl border border-white/40 bg-white/95 shadow-2xl p-6 max-h-[92vh] overflow-y-auto my-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {summaryData.title || "Based on your answers, here's what we understand about you"}
              </h2>
              {summaryData.identity_archetype && (
                <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700 mb-3">
                  Archetype: {summaryData.identity_archetype}
                </div>
              )}
              <p className="text-slate-600 mb-4">Based on your answers, here's what we understand about you:</p>
              <ul className="space-y-2 mb-6">
                {summaryData.summary_points?.map((point, idx) => (
                  <li key={idx} className="text-slate-700 text-sm leading-relaxed flex gap-2">
                    <span className="text-cyan-600 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {(summaryData.career_family?.primary || summaryData.career_family?.secondary || summaryData.career_family?.parallel) && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900 mb-2">Career Family</p>
                  <div className="space-y-1 text-sm text-slate-700">
                    {summaryData.career_family?.primary && <p><span className="font-semibold">Primary:</span> {summaryData.career_family.primary}</p>}
                    {summaryData.career_family?.secondary && <p><span className="font-semibold">Secondary:</span> {summaryData.career_family.secondary}</p>}
                    {summaryData.career_family?.parallel && <p><span className="font-semibold">Parallel:</span> {summaryData.career_family.parallel}</p>}
                  </div>
                </div>
              )}

              {(summaryData.risk_stability_meter?.risk_score || summaryData.risk_stability_meter?.stability_score || summaryData.risk_stability_meter?.note) && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-900 mb-2">Risk & Stability Meter</p>
                  <div className="space-y-1 text-sm text-amber-800">
                    {summaryData.risk_stability_meter?.risk_score && <p><span className="font-semibold">Risk:</span> {summaryData.risk_stability_meter.risk_score}</p>}
                    {summaryData.risk_stability_meter?.stability_score && <p><span className="font-semibold">Stability:</span> {summaryData.risk_stability_meter.stability_score}</p>}
                    {summaryData.risk_stability_meter?.note && <p>{summaryData.risk_stability_meter.note}</p>}
                  </div>
                </div>
              )}

              {summaryData.week_1_challenge && summaryData.week_1_challenge.length > 0 && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-900 mb-2">Week 1 Challenge</p>
                  <ul className="space-y-1">
                    {summaryData.week_1_challenge.map((task, idx) => (
                      <li key={idx} className="text-sm text-emerald-800 flex gap-2">
                        <span className="font-bold">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl bg-slate-100 p-4 mb-5">
                <p className="text-sm font-semibold text-slate-800">Does this feel like you?</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleContinueWithSummary}
                  disabled={matchesLoading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
                >
                  {matchesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, continue
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefineAnswers}
                  disabled={matchesLoading}
                  className="flex-1 rounded-xl"
                >
                  No, refine answers
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoverGoal;
