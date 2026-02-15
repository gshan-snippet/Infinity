import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CareerRow = {
  career_cluster: string;
  why_it_fits_you: string;
  sample_roles: string[];
  match_score: string;
};

const DiscoverGoalMatches = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state;
  const [selectedClusterIndex, setSelectedClusterIndex] = useState<number | null>(null);

  const rows: CareerRow[] = useMemo(() => {
    if (!Array.isArray(state?.careerTable)) return [];
    return state.careerTable;
  }, [state?.careerTable]);

  const summaryPoints: string[] = useMemo(() => {
    if (!Array.isArray(state?.summary?.summary_points)) return [];
    return state.summary.summary_points;
  }, [state?.summary?.summary_points]);

  const handleContinue = () => {
    if (selectedClusterIndex === null) return;
    navigate('/discover-goal-deep-dive', {
      state: {
        selectedCluster: rows[selectedClusterIndex],
        initialAnswers: state?.initialAnswers || {},
        summary: state?.summary || null
      }
    });
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-[linear-gradient(135deg,#f2f8ff_0%,#ecfff6_45%,#fff8ef_100%)]">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/discover-goal')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-sm p-6 shadow-xl mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-600" />
            Your Career Matches
          </h1>
          <p className="text-slate-600">Choose any one career cluster to continue with Q4, Q5 and Q6.</p>
          {summaryPoints.length > 0 && (
            <ul className="mt-4 space-y-1">
              {summaryPoints.slice(0, 3).map((point, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="font-bold text-cyan-600">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/50 bg-white/85 backdrop-blur-sm shadow-xl overflow-hidden mb-6 hidden md:block"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-900">
                <tr>
                  <th className="text-left text-white font-semibold px-6 py-4">Career Cluster</th>
                  <th className="text-left text-white font-semibold px-6 py-4">Why It Fits You</th>
                  <th className="text-left text-white font-semibold px-6 py-4">Sample Roles</th>
                  <th className="text-left text-white font-semibold px-6 py-4">Match Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const selected = selectedClusterIndex === index;
                  return (
                    <tr
                      key={`${row.career_cluster}-${index}`}
                      onClick={() => setSelectedClusterIndex(index)}
                      className={`border-b border-slate-200/70 last:border-b-0 cursor-pointer transition-colors ${selected ? 'bg-cyan-50/70' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-5 align-top">
                        <p className="font-bold text-slate-900">{row.career_cluster}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm text-slate-700 leading-relaxed">{row.why_it_fits_you}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {Array.isArray(row.sample_roles) ? row.sample_roles.join(', ') : ''}
                        </p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex rounded-full px-3 py-1 text-sm font-semibold bg-cyan-100 text-cyan-700">
                          {row.match_score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-600">
                      No matches available yet. Please go back and generate again.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="space-y-3 mb-6 md:hidden">
          {rows.map((row, index) => {
            const selected = selectedClusterIndex === index;
            return (
              <button
                key={`${row.career_cluster}-${index}`}
                onClick={() => setSelectedClusterIndex(index)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  selected ? 'border-cyan-300 bg-cyan-50/80' : 'border-white/50 bg-white/85'
                }`}
              >
                <p className="font-bold text-slate-900">{row.career_cluster}</p>
                <p className="mt-2 text-sm text-slate-700">{row.why_it_fits_you}</p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">Sample roles:</span>{' '}
                  {Array.isArray(row.sample_roles) ? row.sample_roles.join(', ') : ''}
                </p>
                <p className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700">
                  Match: {row.match_score}
                </p>
              </button>
            );
          })}
          {rows.length === 0 && (
            <div className="rounded-2xl border border-white/50 bg-white/85 p-4 text-sm text-slate-600 text-center">
              No matches available yet. Please go back and generate again.
            </div>
          )}
        </div>

        <Button
          onClick={handleContinue}
          disabled={selectedClusterIndex === null}
          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
        >
          Continue to Q4
        </Button>
      </div>
    </div>
  );
};

export default DiscoverGoalMatches;
