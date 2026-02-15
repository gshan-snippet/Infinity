import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  PackageSearch,
  BriefcaseBusiness,
  Users,
  BookOpen,
  BatteryWarning,
  BarChart3,
  ShieldAlert,
  Wallet,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type StuckOption = {
  id: string;
  title: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  border: string;
  iconBg: string;
};

type IssueState = {
  intensity: number;
  context: string;
};

const options: StuckOption[] = [
  {
    id: 'lack-resources',
    title: 'Lack of resources',
    description: "I don't have enough tools, materials, or access to what I need to move forward.",
    lowLabel: '1: Need a few basic materials',
    highLabel: '10: Missing core resources completely',
    icon: PackageSearch,
    border: 'border-cyan-300/70',
    iconBg: 'from-cyan-400/30 to-cyan-500/10'
  },
  {
    id: 'lack-opportunity',
    title: 'Lack of opportunity',
    description: "I feel ready, but I don't see the right opportunities to prove myself.",
    lowLabel: '1: Opportunities are limited',
    highLabel: '10: No opportunity in sight',
    icon: BriefcaseBusiness,
    border: 'border-indigo-300/70',
    iconBg: 'from-indigo-400/30 to-indigo-500/10'
  },
  {
    id: 'lack-support',
    title: 'Lack of support',
    description: "I feel like I'm fighting this battle alone; nobody around me understands.",
    lowLabel: '1: Some guidance is missing',
    highLabel: '10: Completely unsupported',
    icon: Users,
    border: 'border-emerald-300/70',
    iconBg: 'from-emerald-400/30 to-emerald-500/10'
  },
  {
    id: 'lack-knowledge',
    title: 'Lack of knowledge',
    description: "I'm not fully clear on what to learn next or how to execute the right strategy.",
    lowLabel: '1: Need clarity in some topics',
    highLabel: '10: Direction is fully unclear',
    icon: BookOpen,
    border: 'border-blue-300/70',
    iconBg: 'from-blue-400/30 to-blue-500/10'
  },
  {
    id: 'lack-motivation',
    title: 'Lack of motivation',
    description: "I know what to do, but I'm struggling to stay consistent and energized.",
    lowLabel: '1: Minor motivation dips',
    highLabel: '10: Motivation almost gone',
    icon: BatteryWarning,
    border: 'border-amber-300/70',
    iconBg: 'from-amber-400/30 to-amber-500/10'
  },
  {
    id: 'lack-results',
    title: 'Lack of results',
    description: "I'm putting in effort, but I don't see visible progress or outcomes yet.",
    lowLabel: '1: Progress feels slow',
    highLabel: '10: No visible results at all',
    icon: BarChart3,
    border: 'border-violet-300/70',
    iconBg: 'from-violet-400/30 to-violet-500/10'
  },
  {
    id: 'competition-anxiety',
    title: 'Competition anxiety',
    description: "Strong competition makes me doubt my path and confidence.",
    lowLabel: '1: Mild comparison pressure',
    highLabel: '10: Competition feels overwhelming',
    icon: ShieldAlert,
    border: 'border-rose-300/70',
    iconBg: 'from-rose-400/30 to-rose-500/10'
  },
  {
    id: 'lack-money',
    title: 'Lack of money',
    description: "Financial limits are blocking my ability to invest in growth and execution.",
    lowLabel: '1: need money to buy resources',
    highLabel: '10: Need bigger captial money',
    icon: Wallet,
    border: 'border-orange-300/70',
    iconBg: 'from-orange-400/30 to-orange-500/10'
  }
];

const createInitialState = () => {
  const state: Record<string, IssueState> = {};
  for (const option of options) {
    state[option.id] = { intensity: 1, context: '' };
  }
  return state;
};

const StuckGoal = () => {
  const navigate = useNavigate();
  const { saveActivity } = useAuth();
  const [goalAim, setGoalAim] = useState('');
  const [optionState, setOptionState] = useState<Record<string, IssueState>>(createInitialState);
  const [saving, setSaving] = useState(false);

  const updateIntensity = (id: string, value: number) => {
    setOptionState((prev) => ({
      ...prev,
      [id]: { ...prev[id], intensity: value }
    }));
  };

  const updateContext = (id: string, value: string) => {
    setOptionState((prev) => ({
      ...prev,
      [id]: { ...prev[id], context: value }
    }));
  };

  const handleContinue = async () => {
    const selectedIssues = options
      .map((option) => ({
        issue_type: option.title,
        intensity: optionState[option.id].intensity,
        context: optionState[option.id].context.trim()
      }))
      .filter((item) => item.intensity > 1 || item.context.length > 0);

    if (!goalAim.trim()) {
      alert('Please provide your goal/aim before generating solutions.');
      return;
    }
    if (selectedIssues.length === 0) {
      alert('Please mark at least one blocker using intensity or context.');
      return;
    }

    setSaving(true);
    try {
      await saveActivity({
        type: 'stuck_goal_diagnosis',
        option: 'stuck',
        goalAim: goalAim.trim(),
        details: selectedIssues,
        timestamp: new Date().toISOString()
      });
      navigate('/stuck-goal-solutions', {
        state: {
          goalAim: goalAim.trim(),
          issues: selectedIssues
        }
      });
    } catch (err) {
      console.error('Error saving stuck diagnosis:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/start')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            I'm currently working towards a goal but stuck
          </h1>
          <p className="text-slate-600">
            Select only the blockers that matter to you right now, and add details wherever you want.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-cyan-200 bg-white/85 backdrop-blur-sm p-5 shadow-md">
          <label className="block text-sm font-semibold text-slate-800 mb-2">Provide your goal/aim</label>
          <textarea
            rows={2}
            value={goalAim}
            onChange={(e) => setGoalAim(e.target.value)}
            placeholder="E.g., Crack SSC CGL, Become a Data Analyst, Build my acting career, etc."
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {options.map((option) => (
            <motion.div key={option.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className={`h-full rounded-2xl border-2 ${option.border} bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all`}>
                <div className="p-5">
                  <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${option.iconBg} border border-white/70 flex items-center justify-center`}>
                    <option.icon className="h-6 w-6 text-slate-900" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{option.description}</p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-4">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Intensity Scale</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={optionState[option.id].intensity}
                      onChange={(e) => updateIntensity(option.id, Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                    <div className="mt-2 flex items-start justify-between gap-4 text-xs text-slate-600">
                      <p className="max-w-[48%]">{option.lowLabel}</p>
                      <p className="max-w-[48%] text-right">{option.highLabel}</p>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-cyan-700">
                      Selected Intensity: {optionState[option.id].intensity}/10
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(34,211,238,0.1),0_0_24px_rgba(34,211,238,0.12)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-cyan-700" />
                      <label className="text-sm font-semibold text-slate-800">The Fine Details.</label>
                    </div>
                    <textarea
                      rows={3}
                      value={optionState[option.id].context}
                      onChange={(e) => updateContext(option.id, e.target.value)}
                      placeholder="Share anything specific about your situation... (e.g., 'I have a degree in X but want to do Y,' 'I can only work at night,' or 'I feel like I'm losing interest because of [Reason]')."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <Button
            onClick={handleContinue}
            disabled={saving}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Generate Your Solutions'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StuckGoal;
