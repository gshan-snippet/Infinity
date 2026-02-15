import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Flame, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Task {
    id: string;
    title: string;
    description: string;
}

interface DailyRecord {
    date: string;
    completedTaskIds: string[];
}

const DailyGoalTracker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, saveActivity } = useAuth();
    const state = (location as any).state;

    const [schedulePeriod, setSchedulePeriod] = useState(state?.schedulePeriod || 'weekly');
    const [achievementGoal, setAchievementGoal] = useState(state?.achievementGoal || '');
    const [tasks, setTasks] = useState<Task[]>(state?.tasks || []);
    const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [streak, setStreak] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);
    const [chartXAxis, setChartXAxis] = useState<'week' | 'month' | 'year'>('week');

    // Calculate total days in period
    const getTotalDays = () => {
        if (schedulePeriod === 'weekly') return 7;
        if (schedulePeriod === 'monthly') return 30;
        return 365;
    };

    const totalDays = getTotalDays();

    // Get today's completed tasks
    const getTodayCompletedTasks = (): string[] => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = dailyRecords.find(r => r.date === today);
        return todayRecord?.completedTaskIds || [];
    };

    const todayCompletedTasks = getTodayCompletedTasks();

    // Calculate progress based on days
    const completedDays = dailyRecords.filter(
        record => record.completedTaskIds.length === tasks.length
    ).length;

    const daysLeft = totalDays - completedDays;
    const dailyProgressPercentage = (completedDays / totalDays) * 100;

    // Check if today is fully completed (all tasks)
    const isTodayFullyCompleted = () => {
        const todayTasks = getTodayCompletedTasks();
        const allTasksCompleted = todayTasks.length === tasks.length && tasks.length > 0;
        return allTasksCompleted;
    };

    // Calculate streak - consecutive days with all tasks complete
    useEffect(() => {
        let currentStreak = 0;
        const today = new Date();

        for (let i = 0; i < totalDays; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];

            const record = dailyRecords.find(r => r.date === dateString);
            const tasksComplete = record && record.completedTaskIds.length === tasks.length;

            if (tasksComplete) {
                currentStreak++;
            } else if (i === 0 && !tasksComplete) {
                break;
            } else if (i > 0) {
                break;
            }
        }

        setStreak(currentStreak);
    }, [dailyRecords, tasks.length, totalDays]);

    // Auto-reset at midnight AND unlock button
    useEffect(() => {
        const checkMidnight = () => {
            const newDate = new Date().toISOString().split('T')[0];
            if (newDate !== currentDate) {
                console.log('🌙 Midnight! New day unlocked.');
                setCurrentDate(newDate);
                setIsSaved(false);
            }
        };

        const interval = setInterval(checkMidnight, 60000);
        return () => clearInterval(interval);
    }, [currentDate]);

    // Load saved data from activities
    // Load saved data from activities
    useEffect(() => {
        const loadTrackerData = async () => {
            if (!user?.activities) return;

            const trackerActivity = user.activities.find(
                (activity: any) => activity.type === 'daily_goal_tracker_data'
            );

            if (trackerActivity) {
                console.log('📊 Loading existing tracker data...', trackerActivity);
                // Restore ALL saved data
                setSchedulePeriod(trackerActivity.schedulePeriod || 'weekly');
                setAchievementGoal(trackerActivity.achievementGoal || '');
                setTasks(trackerActivity.tasks || []);
                setDailyRecords(trackerActivity.dailyRecords || []);
                setStreak(trackerActivity.currentStreak || 0);

                const today = new Date().toISOString().split('T')[0];
                const wasSavedToday = trackerActivity.lastSavedDate === today;
                setIsSaved(wasSavedToday);
                console.log(`🔒 Was saved today? ${wasSavedToday}`, trackerActivity.lastSavedDate, today);
            } else {
                const planActivity = user.activities.find(
                    (activity: any) => activity.type === 'daily_goal_plan'
                );

                if (planActivity) {
                    console.log('✅ Loading fresh plan...');
                    setSchedulePeriod(planActivity.schedulePeriod || 'weekly');
                    setAchievementGoal(planActivity.achievementGoal || '');
                    setTasks(planActivity.tasks || []);
                    setDailyRecords([]);
                    setStreak(0);
                    setIsSaved(false);
                }
            }
        };

        loadTrackerData();
    }, [user?.activities]);

    const toggleTaskCompletion = (taskId: string) => {
        if (isSaved) return;

        const today = new Date().toISOString().split('T')[0];
        setDailyRecords(prev => {
            const existingRecord = prev.find(r => r.date === today);

            if (existingRecord) {
                return prev.map(record =>
                    record.date === today
                        ? {
                            ...record,
                            completedTaskIds: record.completedTaskIds.includes(taskId)
                                ? record.completedTaskIds.filter(id => id !== taskId)
                                : [...record.completedTaskIds, taskId]
                        }
                        : record
                );
            } else {
                return [
                    ...prev,
                    {
                        date: today,
                        completedTaskIds: [taskId]
                    }
                ];
            }
        });
    };

    const handleSaveProgress = async () => {
        if (!isTodayFullyCompleted()) {
            alert('⚠️ Complete all tasks for today first!');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            await saveActivity({
                type: 'daily_goal_tracker_data',
                schedulePeriod,
                achievementGoal,
                tasks,
                dailyRecords,
                currentStreak: streak,
                lastSavedDate: today,
                lastUpdated: new Date().toISOString()
            });

            setIsSaved(true);
            alert('✅ Progress saved! Button locked until tomorrow 12 AM.');
            console.log('💾 Saved for:', today);
        } catch (err) {
            console.error('Error:', err);
            alert('Failed to save progress.');
        }
    };

    // Generate chart data
    const generateChartData = () => {
        const today = new Date();
        let daysToShow = chartXAxis === 'week' ? 7 : chartXAxis === 'month' ? 30 : 365;

        const data = [];
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            const taskRecord = dailyRecords.find(r => r.date === dateString);

            data.push({
                date: dateString,
                dayLabel: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completed: (taskRecord?.completedTaskIds.length === tasks.length) ? 1 : 0
            });
        }
        return data;
    };

    const chartData = generateChartData();
    const periodLabel = schedulePeriod === 'weekly' ? 'This Week' : schedulePeriod === 'monthly' ? 'This Month' : 'This Year';
    const periodName = schedulePeriod.charAt(0).toUpperCase() + schedulePeriod.slice(1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-12">
            {/* Header */}
            <div className="bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/20 dark:border-slate-700/20 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-6">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <Button variant="ghost" onClick={() => navigate('/goals')} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to My Goals
                        </Button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Daily Goal Tracker
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {periodLabel} • {tasks.length} tasks per day
                            </p>
                            {achievementGoal && (
                                <p className="text-sm text-primary font-medium mt-2">
                                    Goal: {achievementGoal.substring(0, 60)}...
                                </p>
                            )}
                        </div>

                        {/* Daily Progress Bar */}
                        {tasks.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Progress</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-primary">{completedDays}/{totalDays}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">({daysLeft} days left)</span>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dailyProgressPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-primary to-accent"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                    {!achievementGoal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                            <p className="text-amber-800 dark:text-amber-300 font-semibold mb-3">No active tracker found</p>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">Create a new daily goal by clicking on a goal in "My Goals"</p>
                            <Button variant="outline" onClick={() => navigate('/goals')} className="mx-auto">
                                Go to My Goals
                            </Button>
                        </motion.div>
                    )}

                    {achievementGoal && (
                        <>
                            {/* Achievement Goal Card */}
                            <Card variant="interactive" className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/20">
                                            <AlertCircle className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                                Your {periodName} Goal
                                            </h3>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {achievementGoal}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Today's Date */}
                            <div className="text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    📅 Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            {/* Tasks List */}
                            <div className="space-y-3">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Today's Tasks
                                </h2>

                                {tasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card
                                            variant="interactive"
                                            className={`cursor-pointer transition-all ${todayCompletedTasks.includes(task.id)
                                                ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50'
                                                : 'bg-white/50 dark:bg-slate-800/50 hover:border-primary/50'
                                                } ${isSaved ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            onClick={() => !isSaved && toggleTaskCompletion(task.id)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            !isSaved && toggleTaskCompletion(task.id);
                                                        }}
                                                        disabled={isSaved}
                                                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todayCompletedTasks.includes(task.id)
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-slate-300 dark:border-slate-600 hover:border-primary'
                                                            } ${isSaved ? 'opacity-60' : ''}`}
                                                    >
                                                        {todayCompletedTasks.includes(task.id) && (
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-semibold text-base transition-all ${todayCompletedTasks.includes(task.id)
                                                            ? 'text-slate-500 dark:text-slate-400 line-through'
                                                            : 'text-slate-900 dark:text-white'
                                                            }`}>
                                                            {task.title}
                                                        </h4>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {todayCompletedTasks.includes(task.id) && (
                                                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Summary Stats */}
                            <Card variant="interactive" className="bg-white/50 dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Daily Tasks</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{todayCompletedTasks.length}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Completed Today</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-accent">{completedDays}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Days Done</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Flame className="h-5 w-5 text-orange-500" />
                                                <p className="text-2xl font-bold text-orange-600">{streak}</p>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Streak</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Locked Message when saved */}
                            {isSaved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center"
                                >
                                    <p className="text-blue-700 dark:text-blue-300 font-semibold">
                                        🔒 Today's progress is saved and locked. Come back tomorrow at 12 AM to continue!
                                    </p>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/goals')}
                                    className="flex-1"
                                >
                                    Back to Goals
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowChartModal(true)}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Track Chart
                                </Button>
                                <Button
                                    variant="hero"
                                    onClick={handleSaveProgress}
                                    disabled={isSaved || !isTodayFullyCompleted()}
                                    className="flex-1"
                                >
                                    {isSaved ? (
                                        <>
                                            ✅ Saved Progress
                                        </>
                                    ) : !isTodayFullyCompleted() ? (
                                        <>
                                            🔒 Complete Tasks
                                        </>
                                    ) : (
                                        <>
                                            💾 Save Progress
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Chart Modal */}
            <AnimatePresence>
                {showChartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowChartModal(false)}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/20 dark:border-slate-700/20 p-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    Progress Chart
                                </h2>
                                <button
                                    onClick={() => setShowChartModal(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Chart Controls */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                        Time Period
                                    </label>
                                    <div className="space-y-2">
                                        {(['week', 'month', 'year'] as const).map((period) => (
                                            <label key={period} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="xAxis"
                                                    value={period}
                                                    checked={chartXAxis === period}
                                                    onChange={(e) => setChartXAxis(e.target.value as any)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                                                    This {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Year'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Chart Container */}
                                <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200/20 dark:border-slate-700/20">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                            <XAxis dataKey="dayLabel" stroke="rgba(148, 163, 184, 0.8)" />
                                            <YAxis stroke="rgba(148, 163, 184, 0.8)" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                                    borderRadius: '8px',
                                                    padding: '12px'
                                                }}
                                                labelStyle={{ color: '#fff' }}
                                                formatter={(value: any) => [value === 1 ? '✅ Completed' : '❌ Incomplete', 'Status']}
                                            />
                                            <Legend />
                                            <Bar dataKey="completed" fill="#f97316" name="Task Completion" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Card variant="interactive" className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10">
                                        <CardContent className="p-4">
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak}</p>
                                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Current Streak 🔥</p>
                                        </CardContent>
                                    </Card>
                                    <Card variant="interactive" className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10">
                                        <CardContent className="p-4">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedDays}/{totalDays}</p>
                                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Days Completed</p>
                                        </CardContent>
                                    </Card>
                                    <Card variant="interactive" className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
                                        <CardContent className="p-4">
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{((completedDays / totalDays) * 100).toFixed(1)}%</p>
                                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Overall Progress</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-slate-200/20 dark:border-slate-700/20 p-6 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowChartModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyGoalTracker;