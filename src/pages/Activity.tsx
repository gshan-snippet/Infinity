import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Lightbulb, Clock, User, Table, AlertTriangle, Target, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Activity = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const activities = user?.activities || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view activities</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Your Activity History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track all your career planning activities
          </p>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/30 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center"
        >
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Logged in as</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {user.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
          >
            Logout
          </Button>
        </motion.div>

        {/* Activities List */}
        {activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Lightbulb className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No activities yet</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-all"
              >
                {(() => {
                  const getMeta = () => {
                    if (activity.type === 'goal_selection') return { title: 'Goal Selection', Icon: Lightbulb };
                    if (activity.type === 'goal_clarification') return { title: 'Goal Clarification', Icon: Target };
                    if (activity.type === 'goal_discovery_quiz') return { title: 'Option 2: Career Match Table', Icon: Table };
                    if (activity.type === 'stuck_goal_solutions') return { title: 'Option 3: Stuck-Point Solutions', Icon: AlertTriangle };
                    if (activity.type === 'stuck_goal_diagnosis') return { title: 'Option 3: Stuck Diagnosis', Icon: AlertTriangle };
                    if (activity.type === 'alternative_goals_search') return { title: 'Option 4: Alternative Goals', Icon: GitBranch };
                    return { title: activity.type || 'Activity', Icon: Lightbulb };
                  };

                  const { title, Icon } = getMeta();

                  return (
                    <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {activity.goal && (
                  <p className="text-slate-700 dark:text-slate-300 pl-0 sm:pl-11">
                    <span className="font-semibold">Goal:</span> {activity.goal}
                  </p>
                )}

                {activity.type === 'goal_discovery_quiz' && activity.aiData?.career_match_table?.length > 0 && (
                  <p className="text-slate-700 dark:text-slate-300 pl-0 sm:pl-11">
                    <span className="font-semibold">Generated Matches:</span> {activity.aiData.career_match_table.length}
                  </p>
                )}

                {activity.type === 'stuck_goal_solutions' && activity.goalAim && (
                  <p className="text-slate-700 dark:text-slate-300 pl-0 sm:pl-11">
                    <span className="font-semibold">Goal/Aim:</span> {activity.goalAim}
                  </p>
                )}

                {activity.type === 'alternative_goals_search' && activity.goal && (
                  <p className="text-slate-700 dark:text-slate-300 pl-0 sm:pl-11">
                    <span className="font-semibold">Goal:</span> {activity.goal}
                  </p>
                )}

                {activity.type === 'goal_clarification' && activity.formData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/goal-dashboard', { state: { aiData: activity.aiData, formData: activity.formData } })}
                    className="mt-4 sm:ml-11"
                  >
                    View Details
                  </Button>
                )}

                {activity.type === 'goal_discovery_quiz' && activity.aiData?.career_match_table?.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/discover-goal-matches', {
                      state: {
                        careerTable: activity.aiData.career_match_table,
                        summary: activity.summary || null,
                        initialAnswers: activity.answers || {}
                      }
                    })}
                    className="mt-4 sm:ml-11"
                  >
                    View Match Table
                  </Button>
                )}

                {activity.type === 'stuck_goal_solutions' && activity.aiData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/stuck-goal-solutions', {
                      state: {
                        goalAim: activity.goalAim,
                        issues: activity.issues || [],
                        solutionPack: activity.aiData
                      }
                    })}
                    className="mt-4 sm:ml-11"
                  >
                    View Solutions
                  </Button>
                )}

                {activity.type === 'alternative_goals_search' && activity.aiData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/alternative-goals-result', {
                      state: {
                        goal: activity.goal,
                        reason: activity.reason,
                        result: activity.aiData
                      }
                    })}
                    className="mt-4 sm:ml-11"
                  >
                    View Alternatives
                  </Button>
                )}
                    </>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
