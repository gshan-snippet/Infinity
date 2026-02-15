import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Calendar, BookOpen, Briefcase, 
  AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const notifications = [
  {
    id: 1,
    type: 'exam',
    title: 'UPSC Prelims Date Announced',
    message: 'UPSC CSE Prelims 2025 scheduled for June 1st',
    time: '2 hours ago',
    icon: Calendar,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    unread: true
  },
  {
    id: 2,
    type: 'coaching',
    title: 'New Batch Starting',
    message: 'Vision IAS new batch for Mains starting next week',
    time: '1 day ago',
    icon: BookOpen,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    unread: true
  },
  {
    id: 3,
    type: 'opportunity',
    title: 'Scholarship Available',
    message: 'Apply for 50% scholarship on Pro subscription',
    time: '2 days ago',
    icon: Briefcase,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    unread: false
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Daily Task Reminder',
    message: 'You have 3 incomplete tasks for today',
    time: '3 days ago',
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    unread: false
  },
];

const notificationSettings = [
  { id: 'exams', label: 'Exam Alerts', description: 'Important exam dates and updates' },
  { id: 'coaching', label: 'Coaching Updates', description: 'New batches and course updates' },
  { id: 'opportunities', label: 'Opportunity Alerts', description: 'Jobs, scholarships, and offers' },
  { id: 'daily', label: 'Daily Reminders', description: 'Task reminders and progress updates' },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    exams: true,
    coaching: true,
    opportunities: true,
    daily: false,
  });

  const toggleSetting = (id: string) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

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

          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with alerts and reminders</p>
        </motion.div>

        {/* Notification List */}
        <div className="space-y-4 mb-8">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant={notification.unread ? 'elevated' : 'default'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${notification.bg}`}>
                      <notification.icon className={`h-5 w-5 ${notification.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {notification.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting) => (
              <div 
                key={setting.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className="text-primary"
                >
                  {settings[setting.id as keyof typeof settings] ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
