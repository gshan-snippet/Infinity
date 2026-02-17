import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

type IssueInput = {
  issue_type: string;
  intensity: number;
  context: string;
};

type SolutionRow = {
  issue_type: string;
  solution: string;
  links?: Array<{ label: string; url: string }>;
};

type SolutionPack = {
  quick_summary?: string[];
  solutions?: SolutionRow[];
};

const StuckGoalSolutions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveActivity } = useAuth();
  const state = (location as any).state;

  const goalAim = (state?.goalAim || '').trim();
  const issues = (state?.issues || []) as IssueInput[];
  const preloadedPack = (state?.solutionPack || null) as SolutionPack | null;

  const [loading, setLoading] = useState(!preloadedPack);
  const [error, setError] = useState<string | null>(null);
  const [solutionPack, setSolutionPack] = useState<SolutionPack | null>(preloadedPack);
  const activitySavedRef = useRef(false);

  const displaySolutions = useMemo(() => {
    const rawSolutions = Array.isArray(solutionPack?.solutions) ? solutionPack.solutions : [];
    if (!Array.isArray(issues) || issues.length === 0) return rawSolutions;

    const findMatch = (issueType: string) => {
      const normalized = issueType.toLowerCase().trim();
      return rawSolutions.find((row) => {
        const rowType = String(row?.issue_type || '').toLowerCase().trim();
        return rowType === normalized || rowType.includes(normalized) || normalized.includes(rowType);
      });
    };

    return issues.map((issue) => {
      const issueType = issue.issue_type || 'Issue';
      const matched = findMatch(issueType);
      return {
        issue_type: issueType,
        solution: matched?.solution || 'Start with one small measurable action for this blocker today, then review and improve every 2 days.',
        links: matched?.links || []
      };
    });
  }, [issues, solutionPack]);

  useEffect(() => {
    const run = async () => {
      if (preloadedPack) {
        setLoading(false);
        return;
      }

      if (!goalAim || !Array.isArray(issues) || issues.length === 0) {
        setError('Missing goal or issue data. Please go back and fill the form.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/stuck-goal-solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: goalAim, issues })
        });
        const contentType = response.headers.get('content-type') || '';
        let data: any = null;

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const raw = await response.text();
          const shortRaw = raw.slice(0, 180).replace(/\s+/g, ' ').trim();
          throw new Error(`Server returned non-JSON response. ${shortRaw}`);
        }

        if (!response.ok || !data?.stuck_solution_pack) {
          throw new Error(data?.error || 'Failed to generate solutions');
        }
        const generatedPack = data.stuck_solution_pack as SolutionPack;
        setSolutionPack(generatedPack);

        if (!activitySavedRef.current) {
          activitySavedRef.current = true;
          await saveActivity({
            type: 'stuck_goal_solutions',
            goalAim,
            issues,
            aiData: generatedPack,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate solutions');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [goalAim, issues, preloadedPack, saveActivity]);

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/stuck-goal')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-600" />
            Your Stuck-Point Solutions
          </h1>
          <p className="text-slate-600">
            Goal/Aim: <span className="font-semibold text-slate-800">{goalAim || '-'}</span>
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
            <p className="text-slate-700">Generating direct, practical solutions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && solutionPack && (
          <>
            {solutionPack.quick_summary && solutionPack.quick_summary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-cyan-900 mb-3">In Short</h2>
                <ul className="space-y-2">
                  {solutionPack.quick_summary.map((line, idx) => (
                    <li key={idx} className="text-sm text-cyan-800 flex gap-2">
                      <span className="font-bold">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden hidden md:block"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="text-left text-white font-semibold px-6 py-4">Type of Issue</th>
                      <th className="text-left text-white font-semibold px-6 py-4">Specific Solution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySolutions.map((row, idx) => (
                      <tr key={`${row.issue_type}-${idx}`} className="border-b border-slate-200/70 last:border-b-0">
                        <td className="px-6 py-5 align-top">
                          <p className="font-bold text-slate-900">{row.issue_type}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <p className="text-sm text-slate-700 leading-relaxed">{row.solution}</p>
                          {row.links && row.links.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {row.links.map((link, linkIdx) => (
                                <a
                                  key={`${link.url}-${linkIdx}`}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <div className="space-y-3 md:hidden">
              {displaySolutions.map((row, idx) => (
                <div key={`${row.issue_type}-${idx}`} className="rounded-2xl border border-white/50 bg-white/90 p-4">
                  <p className="font-bold text-slate-900">{row.issue_type}</p>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{row.solution}</p>
                  {row.links && row.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.links.map((link, linkIdx) => (
                        <a
                          key={`${link.url}-${linkIdx}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={() => navigate('/clarify-goal', { state: { prefillGoal: goalAim } })}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
              >
                Continue to Complete Roadmap
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StuckGoalSolutions;
