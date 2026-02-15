import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  period: 'weekly' | 'monthly' | 'yearly';
}

const scheduleOptions: ScheduleOption[] = [
  {
    id: 'weekly',
    label: 'Weekly Basis',
    icon: <Calendar className="h-8 w-8" />,
    description: 'Plan and track tasks for one week',
    period: 'weekly'
  },
  {
    id: 'monthly',
    label: 'Monthly Basis',
    icon: <Clock className="h-8 w-8" />,
    description: 'Plan and track tasks for one month',
    period: 'monthly'
  },
  {
    id: 'yearly',
    label: 'Yearly Basis',
    icon: <TrendingUp className="h-8 w-8" />,
    description: 'Plan and track tasks for one year',
    period: 'yearly'
  }
];

const TaskScheduleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  const handleProceed = () => {
    if (!selectedSchedule) {
      alert('Please select a schedule option');
      return;
    }

    const selected = scheduleOptions.find(opt => opt.id === selectedSchedule);
    
    navigate('/task-achievement-goal', {
      state: {
        schedulePeriod: selected?.period,
        goalId: new URLSearchParams(window.location.search).get('goalId')
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Schedule Your Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose how you want to organize your daily tasks
          </p>
        </motion.div>

        {/* Schedule Options */}
        <div className="space-y-4 mb-8">
          {scheduleOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedSchedule(option.id)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedSchedule === option.id
                  ? 'border-primary bg-primary/10 dark:bg-primary/5'
                  : 'border-slate-200/30 dark:border-slate-700/30 bg-white/50 dark:bg-slate-800/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl transition-colors ${
                  selectedSchedule === option.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {option.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
                {selectedSchedule === option.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/goals')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleProceed}
            disabled={!selectedSchedule}
            className="flex-1"
          >
            Continue →
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskScheduleSelection;