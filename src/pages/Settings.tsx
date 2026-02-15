import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, MapPin, Bell, Palette, 
  ChevronRight, Globe, Shield, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile Details', description: 'Name, email, and photo', icon: User },
      { id: 'location', label: 'Location Preferences', description: 'Set your preferred locations', icon: MapPin },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', label: 'Notification Settings', description: 'Manage your alerts', icon: Bell },
      { id: 'theme', label: 'Theme', description: 'Light or dark mode', icon: Palette },
      { id: 'language', label: 'Language', description: 'Choose your language', icon: Globe },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'privacy', label: 'Privacy & Security', description: 'Manage your data', icon: Shield },
      { id: 'help', label: 'Help & Support', description: 'Get assistance', icon: HelpCircle },
    ]
  }
];

const Settings = () => {
  const navigate = useNavigate();

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

          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-muted-foreground">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
