import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AlternativeGoals = () => {
  const navigate = useNavigate();
  const { saveActivity } = useAuth();

  const [goal, setGoal] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFind = async () => {
    if (!goal.trim()) {
      setError('Please type your goal.');
      return;
    }
    if (!reason.trim()) {
      setError('Please add reason for finding alternative goals.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/alternative-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim(), reason: reason.trim() })
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

      if (!response.ok || !data?.alternative_goals_result) {
        throw new Error(data?.error || 'Failed to generate alternatives');
      }

      const finalResult = data.alternative_goals_result;

      await saveActivity({
        type: 'alternative_goals_search',
        goal: goal.trim(),
        reason: reason.trim(),
        aiData: finalResult,
        timestamp: new Date().toISOString()
      });

      navigate('/alternative-goals-result', {
        state: {
          goal: goal.trim(),
          reason: reason.trim(),
          result: finalResult
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate alternatives');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/start')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            I want to find similar or backup goals
          </h1>
          <p className="text-slate-600">Find alternative paths and similar goals based on your current target.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="rounded-2xl border border-white/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Type your goal</label>
              <textarea
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="E.g., Become an Engineer in DRDO"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Reason for finding alternative goals</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Very high competition, location constraints, financial issues, timeline mismatch, etc."
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleFind} disabled={loading} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {loading ? 'Finding...' : 'Find Alternative goals'}
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AlternativeGoals;
