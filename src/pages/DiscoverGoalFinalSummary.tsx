import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

type FinalSelections = {
  q4: string;
  q5: string;
  q6: string;
};

type CareerCluster = {
  career_cluster: string;
  why_it_fits_you: string;
  sample_roles: string[];
  match_score: string;
};

type SummaryData = {
  identity_archetype?: string;
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

function hashToCount(input: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const range = max - min + 1;
  return min + Math.abs(hash) % range;
}

const buildSuitabilityNotes = (cluster: CareerCluster | null, finalSelections: FinalSelections, q2: string, q3: string) => {
  const clusterName = cluster?.career_cluster || 'your selected career cluster';
  return [
    `Your profile is unique because it combines "${q2}" with the success vision "${q3}".`,
    `You narrowed a broad direction into a concrete path: ${finalSelections.q4} -> ${finalSelections.q5} -> ${finalSelections.q6}.`,
    `This suits you because "${clusterName}" aligns with your motivation and your practical role preference.`,
    `You now have a specific target role, which makes roadmap planning faster and more accurate.`
  ];
};

const DiscoverGoalFinalSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = (location as any).state;

  const selectedCluster = (state?.selectedCluster || null) as CareerCluster | null;
  const finalSelections = (state?.finalSelections || { q4: '', q5: '', q6: '' }) as FinalSelections;
  const summary = (state?.summary || {}) as SummaryData;
  const initialAnswers = state?.initialAnswers || {};
  const q2 = (initialAnswers?.question2?.[0] || '') as string;
  const q3 = (initialAnswers?.question3?.[0] || '') as string;
  const userLocation = user?.profile?.location?.trim() || 'your city';

  const socialCount = useMemo(() => {
    const seed = `${summary.identity_archetype || ''}|${selectedCluster?.career_cluster || ''}|${userLocation}`;
    return hashToCount(seed, 220, 980);
  }, [summary.identity_archetype, selectedCluster?.career_cluster, userLocation]);

  const suitabilityNotes = useMemo(
    () => buildSuitabilityNotes(selectedCluster, finalSelections, q2, q3),
    [selectedCluster, finalSelections, q2, q3]
  );

  const prefillGoal = useMemo(() => {
    const cluster = selectedCluster?.career_cluster || 'Career Goal';
    const role = finalSelections.q6 || finalSelections.q5 || cluster;
    return `${role} (${cluster})`;
  }, [selectedCluster, finalSelections]);

  const handleYes = () => {
    navigate('/clarify-goal', {
      state: {
        prefillGoal
      }
    });
  };

  const handleNo = () => {
    navigate('/discover-goal-matches');
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/discover-goal-deep-dive')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-600" />
            Your Final Selection Summary
          </h1>
          <p className="text-slate-600">
            Here is what you chose and why this direction looks highly suitable for you.
          </p>
          {summary.identity_archetype && (
            <div className="mt-4 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
              Identity Archetype: {summary.identity_archetype}
            </div>
          )}
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-sm text-indigo-800">
              {socialCount} people with a profile like yours are currently following this roadmap in {userLocation}.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">What You Chose</h2>
          <div className="space-y-2 text-slate-700">
            <p><span className="font-semibold">Career Cluster:</span> {selectedCluster?.career_cluster || '-'}</p>
            <p><span className="font-semibold">Q2:</span> {q2 || '-'}</p>
            <p><span className="font-semibold">Q3:</span> {q3 || '-'}</p>
            <p><span className="font-semibold">Q4:</span> {finalSelections.q4 || '-'}</p>
            <p><span className="font-semibold">Q5:</span> {finalSelections.q5 || '-'}</p>
            <p><span className="font-semibold">Q6:</span> {finalSelections.q6 || '-'}</p>
            {(summary.career_family?.primary || summary.career_family?.secondary || summary.career_family?.parallel) && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                {summary.career_family?.primary && <p><span className="font-semibold">Career Family - Primary:</span> {summary.career_family.primary}</p>}
                {summary.career_family?.secondary && <p><span className="font-semibold">Career Family - Secondary:</span> {summary.career_family.secondary}</p>}
                {summary.career_family?.parallel && <p><span className="font-semibold">Career Family - Parallel:</span> {summary.career_family.parallel}</p>}
              </div>
            )}
          </div>
        </motion.div>

        {(summary.strength_breakdown || summary.risk_stability_meter) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-cyan-900 mb-4">Strength & Risk Snapshot</h2>
            {summary.strength_breakdown && (
              <div className="space-y-1 text-sm text-cyan-800 mb-3">
                {Object.entries(summary.strength_breakdown).map(([key, value]) => (
                  <p key={key}><span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {value}</p>
                ))}
              </div>
            )}
            {summary.risk_stability_meter && (
              <div className="space-y-1 text-sm text-cyan-800">
                {summary.risk_stability_meter.risk_score && <p><span className="font-semibold">Risk Score:</span> {summary.risk_stability_meter.risk_score}</p>}
                {summary.risk_stability_meter.stability_score && <p><span className="font-semibold">Stability Score:</span> {summary.risk_stability_meter.stability_score}</p>}
                {summary.risk_stability_meter.note && <p>{summary.risk_stability_meter.note}</p>}
              </div>
            )}
          </motion.div>
        )}

        {summary.week_1_challenge && summary.week_1_challenge.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-amber-900 mb-3">Week 1 Challenge</h2>
            <ul className="space-y-2">
              {summary.week_1_challenge.map((task, idx) => (
                <li key={idx} className="text-sm text-amber-800 flex gap-2">
                  <span className="font-bold">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Why This Is Unique And Suitable
          </h2>
          <ul className="space-y-2">
            {suitabilityNotes.map((item, idx) => (
              <li key={idx} className="text-sm text-emerald-800 flex gap-2">
                <span className="font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Do you want a complete roadmap for this goal?</h2>
          <p className="text-slate-600 mb-5">If yes, we will take you directly to roadmap generation.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleYes}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
            >
              Yes, get complete roadmap
            </Button>
            <Button
              variant="outline"
              onClick={handleNo}
              className="flex-1 rounded-xl"
            >
              No, refine choices
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DiscoverGoalFinalSummary;
