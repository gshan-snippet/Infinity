import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Send, Info, AlertCircle, CheckCircle2,
  User, Trophy, Briefcase, Clock, MapPin, GraduationCap,
  Loader, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Section descriptions for progress tracking
const SECTION_LABELS = {
  1: 'Checking Eligibility',
  2: 'Analyzing Success Rate',
  3: 'Planning Your Path',
  4: 'Exploring Domain Knowledge',
  5: 'Finding Inspirations',
  6: 'Gathering Resources',
  7: 'Calculating Career Outcomes',
  8: 'Understanding Challenges',
  9: 'Finding Alternatives'
};

// Progress Modal Component
const ProgressModal = ({ completedSections, currentSection, isGenerating }) => {
  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Generating Your Roadmap
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Building your personalized career guidance...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progress
                </span>
                <span className="text-sm font-bold text-primary">
                  {completedSections}/10
                </span>
              </div>
              <motion.div
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
              >
                <motion.div
                  animate={{ width: `${(completedSections / 9) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </motion.div>
            </div>

            {/* Section List */}
            <div className="space-y-3 mb-8 max-h-80 overflow-y-auto">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((section) => {
                const isCompleted = section <= completedSections;
                const isCurrent = section === currentSection;

                return (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: section * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCompleted
                      ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-200/40 dark:border-green-700/40'
                      : isCurrent
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/40 dark:border-blue-700/40'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/20 dark:border-slate-700/20'
                      }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Check className="h-5 w-5 text-green-500" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="flex-shrink-0"
                      >
                        <Loader className="h-5 w-5 text-blue-500" />
                      </motion.div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                    )}

                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${isCompleted
                          ? 'text-green-700 dark:text-green-300'
                          : isCurrent
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {SECTION_LABELS[section] || `Section ${section}`}
                      </p>
                    </div>

                    {isCompleted && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                        Done
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Message */}
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This usually takes 1-2 minutes. Please don't close this window.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ClarifyGoal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveActivity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const prefillGoal = (location as any).state?.prefillGoal || '';

  // Form state
  const [formData, setFormData] = useState({
    goal: prefillGoal,
    goalSpecialization: '',
    age: '',
    gender: '',
    country: 'India',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    currentStatus: '',
    hoursPerDay: '',
    targetYear: '',
    education: {
      highestLevel: '',
      degreeName: '',
      field: '',
      specialization: '',
      year: ''
    },
    constraints: '',
    programmingExposure: '',
    preparationLevel: ''
  });

  const detectLocation = () => {
    setDetectingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Location detected: ${latitude}, ${longitude}`);

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const locationName = data.address?.city || data.address?.town || data.address?.county || 'Unknown Location';

          setFormData(prev => ({
            ...prev,
            location: locationName,
            latitude,
            longitude
          }));

          console.log(`✅ Location resolved: ${locationName}`);
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        }

        setDetectingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to detect location. Please enable location access or enter it manually.');
        setDetectingLocation(false);
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    if (!formData.goal.trim()) {
      setError('Please describe your goal');
      return false;
    }
    if (!formData.age.trim()) {
      setError('Please enter your age');
      return false;
    }
    if (!formData.gender.trim()) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.currentStatus.trim()) {
      setError('Please select your current status');
      return false;
    }
    if (!formData.hoursPerDay.trim()) {
      setError('Please enter hours available per day');
      return false;
    }
    if (!formData.education.highestLevel.trim()) {
      setError('Please select your education level');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    setCompletedSections(0);
    setCurrentSection(1);

    let requestId: string = '';
    let pollInterval: NodeJS.Timeout | null = null;
    let isComplete = false;

    try {
      console.log('📤 Sending roadmap generation request...');

      const payload = {
        goal: formData.goal,
        goalSpecialization: formData.goalSpecialization,
        age: parseInt(formData.age),
        gender: formData.gender,
        country: formData.country,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        current_status: formData.currentStatus,
        hours_per_day: parseInt(formData.hoursPerDay),
        aimed_year_of_achievement: formData.targetYear ? parseInt(formData.targetYear) : new Date().getFullYear() + 2,
        constraints: formData.constraints,
        education: {
          highest_level: formData.education.highestLevel,
          degree_name: formData.education.degreeName,
          field: formData.education.field,
          specialization: formData.education.specialization,
          year: formData.education.year
        },
        is_clarification_response: true,
        clarification_answers: {
          programming_exposure: formData.programmingExposure,
          preparation_level: formData.preparationLevel
        }
      };

      console.log('📋 Payload prepared, calling API...');

      // Call backend API to get requestId
      const initialResponse = await fetch('http://localhost:5000/api/know-goal-dont-know-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const initialData = await initialResponse.json();
      requestId = initialData.requestId;

      console.log('📌 Received requestId from server:', requestId);

      if (!requestId) {
        throw new Error('Failed to get request ID from server');
      }

      // Now start polling for progress
      let finalData = null;
      let pollCount = 0;

      pollInterval = setInterval(async () => {
        pollCount++;

        try {
          const progressResponse = await fetch(
            `http://localhost:5000/api/know-goal-progress/${requestId}`
          );
          const progressData = await progressResponse.json();

          console.log(`📊 [Poll ${pollCount}] Progress:`, progressData);

          setCompletedSections(progressData.completedSections || 0);
          setCurrentSection(progressData.currentSection || 0);

          // Check if generation is complete
          if (progressData.status === 'complete' && progressData.data) {
            isComplete = true;
            finalData = progressData.data;
            console.log('✅ Generation complete!');
          }
        } catch (pollErr) {
          console.log('Poll error:', pollErr);
        }
      }, 300); // Poll every 300ms for smooth updates

      // Wait for completion (check every second)
      let waitCount = 0;
      const maxWait = 300000; // 5 minutes max
      const startTime = Date.now();

      while (!isComplete && Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitCount++;
      }

      if (pollInterval) {
        clearInterval(pollInterval);
      }

      if (!isComplete || !finalData) {
        throw new Error('Roadmap generation timed out or failed');
      }

      console.log('✅ Roadmap data received');

      // Update UI to show all sections complete
      setCompletedSections(9);
      setCurrentSection(9);

      // Small delay for visual feedback before navigation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save activity
      try {
        await saveActivity({
          type: 'goal_clarification',
          goal: formData.goal,
          formData: payload,
          aiData: finalData,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Activity saved');
      } catch (err) {
        console.error('⚠️ Error saving activity:', err);
      }

      // Navigate to goal dashboard with the generated data
      console.log('🚀 Navigating to dashboard...');
      navigate('/goal-dashboard', {
        state: { aiData: finalData, formData: payload }
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setLoading(false);

      if (pollInterval) {
        clearInterval(pollInterval);
      }

      setError(err instanceof Error ? err.message : 'An error occurred while generating your roadmap');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      {/* Progress Modal */}
      <ProgressModal
        completedSections={completedSections}
        currentSection={currentSection}
        isGenerating={loading}
      />

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
            className="mb-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Tell us about your goal
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              The more specific you are, the better guidance we can provide
            </p>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/40 dark:border-blue-700/40 flex gap-3"
        >
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">Be as specific as possible</p>
            <p>Share details about your goal, constraints, and current level. This helps our AI generate a personalized roadmap for you.</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/40 dark:border-red-700/40 flex gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Main Goal Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Goal</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What's your main goal? *
                </label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="E.g., Become a Software Engineer at Google, or Get admission to IIT for Computer Science"
                  className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Specialization or Domain (Optional)
                </label>
                <Input
                  type="text"
                  name="goalSpecialization"
                  value={formData.goalSpecialization}
                  onChange={handleInputChange}
                  placeholder="E.g., Machine Learning, Web Development, Robotics"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Personal Information Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Age *
                </label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Your age"
                  min="15"
                  max="80"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Country *
                </label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Your country"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Current Status *
              </label>
              <select
                name="currentStatus"
                value={formData.currentStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Select your current status</option>
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Location Section */}
            <div className="mt-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-700/30">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                📍 Your Location (for nearby coaching hubs)
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your city/location"
                  className="flex-1 rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading || detectingLocation}
                />
                <Button
                  type="button"
                  onClick={detectLocation}
                  disabled={loading || detectingLocation}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  {detectingLocation ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Detect
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Click "Detect" to automatically detect your location, or type it manually.
              </p>
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Education</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Highest Education Level *
                </label>
                <select
                  name="highestLevel"
                  value={formData.education.highestLevel}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Degree Name
                  </label>
                  <Input
                    type="text"
                    name="degreeName"
                    value={formData.education.degreeName}
                    onChange={handleEducationChange}
                    placeholder="E.g., B.Tech, BA, MBA"
                    className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Field
                  </label>
                  <Input
                    type="text"
                    name="field"
                    value={formData.education.field}
                    onChange={handleEducationChange}
                    placeholder="E.g., Engineering, Commerce"
                    className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Specialization
                  </label>
                  <Input
                    type="text"
                    name="specialization"
                    value={formData.education.specialization}
                    onChange={handleEducationChange}
                    placeholder="E.g., Computer Science, ECE"
                    className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current Year/Semester
                  </label>
                  <Input
                    type="text"
                    name="year"
                    value={formData.education.year}
                    onChange={handleEducationChange}
                    placeholder="E.g., 3rd year, Completed"
                    className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Availability & Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Time & Availability</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Hours Available Per Day *
                </label>
                <Input
                  type="number"
                  name="hoursPerDay"
                  value={formData.hoursPerDay}
                  onChange={handleInputChange}
                  placeholder="E.g., 2, 3, 4"
                  min="0.5"
                  step="0.5"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Target Year of Achievement
                </label>
                <Input
                  type="number"
                  name="targetYear"
                  value={formData.targetYear}
                  onChange={handleInputChange}
                  placeholder={(new Date().getFullYear() + 2).toString()}
                  min={new Date().getFullYear()}
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Constraints & Experience */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Experience & Constraints</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What's holding you back? (Optional)
                </label>
                <textarea
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleInputChange}
                  placeholder="E.g., Don't know where to start, Lack of resources, Financial constraints, Family commitments"
                  className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Programming/Technical Experience (Optional)
                </label>
                <Input
                  type="text"
                  name="programmingExposure"
                  value={formData.programmingExposure}
                  onChange={handleInputChange}
                  placeholder="E.g., Java, Python, C++, or No experience"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Current Preparation Level (Optional)
                </label>
                <Input
                  type="text"
                  name="preparationLevel"
                  value={formData.preparationLevel}
                  onChange={handleInputChange}
                  placeholder="E.g., Just started, Intermediate, Advanced"
                  className="rounded-xl bg-white/70 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate My Roadmap
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default ClarifyGoal;
