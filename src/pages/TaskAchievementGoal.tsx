import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface Task {
    id: string;
    title: string;
    description: string;
}

const TaskAchievementGoal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, saveActivity } = useAuth();
    const state = (location as any).state;

    const schedulePeriod = state?.schedulePeriod || 'weekly';
    const periodLabel = schedulePeriod === 'weekly' ? 'one week' : schedulePeriod === 'monthly' ? 'one month' : 'one year';
    const periodCapitalized = schedulePeriod.charAt(0).toUpperCase() + schedulePeriod.slice(1);

    const [achievementGoal, setAchievementGoal] = useState('');
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: '', description: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addTask = () => {
        const newId = (Math.max(...tasks.map(t => parseInt(t.id) || 0), 0) + 1).toString();
        setTasks([...tasks, { id: newId, title: '', description: '' }]);
    };

    const removeTask = (id: string) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter(task => task.id !== id));
        }
    };

    const updateTask = (id: string, field: 'title' | 'description', value: string) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, [field]: value } : task
        ));
    };

    const handleSubmit = async () => {
        // Validation
        if (!achievementGoal.trim()) {
            alert('Please enter what you want to achieve');
            return;
        }

        const filledTasks = tasks.filter(t => t.title.trim());
        if (filledTasks.length === 0) {
            alert('Please add at least one task');
            return;
        }

        setIsSubmitting(true);

        try {
            // Save to user activities
            await saveActivity({
                type: 'daily_goal_plan',
                schedulePeriod: schedulePeriod,
                achievementGoal: achievementGoal,
                tasks: filledTasks,
                createdAt: new Date().toISOString()
            });

            console.log('✅ Daily goal plan saved!');

            // Navigate to daily tracker
            navigate('/daily-goal-tracker', {
                state: {
                    schedulePeriod: schedulePeriod,
                    achievementGoal: achievementGoal,
                    tasks: filledTasks
                }
            });
        } catch (err) {
            console.error('Error saving daily goal plan:', err);
            alert('❌ Failed to save daily goal plan. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        What do you want to achieve?
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Define your goal for {periodLabel} and create actionable tasks
                    </p>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Achievement Goal Section */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm">
                        <label className="block mb-3">
                            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                                Your {periodCapitalized} Goal
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                What specific achievement or milestone do you want to reach in {periodLabel}?
                            </p>
                        </label>
                        <textarea
                            value={achievementGoal}
                            onChange={(e) => setAchievementGoal(e.target.value)}
                            placeholder="e.g., Complete 5 JavaScript projects, Learn React fundamentals, Read 2 books on data structures..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-200/30 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Tasks Section */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block">
                                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                                    Daily Tasks
                                </span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Break down your goal into specific daily tasks
                                </p>
                            </label>
                        </div>

                        <div className="space-y-4">
                            {tasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-700/30"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Task {index + 1}
                                        </h4>
                                        {tasks.length > 1 && (
                                            <button
                                                onClick={() => removeTask(task.id)}
                                                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                        placeholder="e.g., Complete JavaScript array methods tutorial"
                                        className="w-full p-3 rounded-lg border border-slate-200/30 dark:border-slate-700/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
                                    />

                                    <textarea
                                        value={task.description}
                                        onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                                        placeholder="Optional: Add more details about this task..."
                                        className="w-full p-3 rounded-lg border border-slate-200/30 dark:border-slate-700/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20 resize-none"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Add Task Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={addTask}
                            className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/70 text-primary hover:bg-primary/5 transition-all font-semibold flex items-center justify-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Add Another Task
                        </motion.button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="hero"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Daily Plan →'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TaskAchievementGoal;