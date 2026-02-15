import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmedGoals, setConfirmedGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Color palette for goals
  const goalColors = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-emerald-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-cyan-500',
  ];

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (!user?.email) {
          setLoading(false);
          return;
        }

        console.log('📊 Fetching goals for:', user.email);
        const response = await fetch(`http://localhost:5000/api/user/activities/${user.email}`);

        if (response.ok) {
          const data = await response.json();
          const activitiesArray = data.activities || [];

          // Filter for goal_confirmed activities
          const goals = activitiesArray.filter(
            (activity: any) => activity.type === 'goal_confirmed'
          );

          console.log('✅ Found confirmed goals:', goals);
          setConfirmedGoals(goals);
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user?.email]);

  const getStatusIcon = () => {
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    return 'bg-green-500/10 text-green-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your goals</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">My Goals</h1>
              <p className="text-muted-foreground">Track and manage your career goals</p>
            </div>
            <Button variant="hero" onClick={() => navigate('/start')} className="w-full sm:w-auto">
              <Target className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </motion.div>

        {/* Goals List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading goals...</p>
            </div>
          ) : confirmedGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center"
            >
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No confirmed goals yet</p>
              <Button variant="hero" onClick={() => navigate('/start')}>
                <Target className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </motion.div>
          ) : (
            confirmedGoals.map((goal, index) => (
              <motion.div
                key={goal.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="interactive"
                  onClick={() => navigate('/task-schedule-selection', {
                    state: { goalId: goal.id || index, goalName: goal.goal }
                  })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Goal Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${goalColors[index % goalColors.length]} flex items-center justify-center text-primary-foreground flex-shrink-0`}>
                        <Target className="h-7 w-7" />
                      </div>

                      {/* Goal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-display font-semibold text-lg truncate">
                            {goal.goal || 'Untitled Goal'}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                            {getStatusIcon()}
                            Confirmed
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            🎯 Target Year: {goal.targetYear || new Date().getFullYear() + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📅 Confirmed: {new Date(goal.goalDate || goal.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;
