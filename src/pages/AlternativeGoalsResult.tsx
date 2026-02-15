import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AlternativeResult = {
  alternative_paths?: string[];
  similar_goals?: string[];
};

const AlternativeGoalsResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state;

  const goal = (state?.goal || '') as string;
  const reason = (state?.reason || '') as string;
  const result = (state?.result || null) as AlternativeResult | null;

  const hasData = useMemo(
    () => !!result && ((result.alternative_paths?.length || 0) > 0 || (result.similar_goals?.length || 0) > 0),
    [result]
  );

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/alternative-goals')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-600" />
            Alternative Goals Output
          </h1>
          <p className="text-slate-700 break-words"><span className="font-semibold">Goal:</span> {goal || '-'}</p>
          <p className="text-slate-700 mt-1 break-words"><span className="font-semibold">Reason:</span> {reason || '-'}</p>
        </motion.div>

        {!hasData && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              No generated output available in this session. Open this from My Activity using "View Alternatives".
            </p>
          </div>
        )}

        {hasData && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
              <h2 className="text-xl font-bold text-cyan-900 mb-3">Alternative Path</h2>
              <ul className="space-y-2">
                {(result?.alternative_paths || []).map((item, idx) => (
                  <li key={idx} className="text-sm text-cyan-800 flex gap-2">
                    <span className="font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-xl font-bold text-emerald-900 mb-3">Different but Similar Goals</h2>
              <ul className="space-y-2">
                {(result?.similar_goals || []).map((item, idx) => (
                  <li key={idx} className="text-sm text-emerald-800 flex gap-2">
                    <span className="font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlternativeGoalsResult;
