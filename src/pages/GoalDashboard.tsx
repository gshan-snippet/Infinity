import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Lightbulb, BookOpen, Users,
  Award, TrendingUp, AlertTriangle, Zap, Calendar,
  Play, Clock, ChevronRight, Globe, ChevronDown, ExternalLink, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { id: 'eligibility', label: 'Eligibility & Success Rate', icon: CheckCircle },
  { id: 'roadmap', label: 'Possible Path & Roadmap', icon: Lightbulb },
  { id: 'knowledge', label: 'Domain Knowledge', icon: BookOpen },
  { id: 'inspiration', label: 'Real Inspiration', icon: Users },
  { id: 'resources', label: 'Coaching & Resources', icon: BookOpen },
  { id: 'outcomes', label: 'Career Outcomes', icon: Award },
  { id: 'hardships', label: 'Realistic Hardships', icon: AlertTriangle },
  { id: 'alternatives', label: 'Alternative Goals', icon: Zap },
  { id: 'daily', label: 'Daily Guidance', icon: Calendar },
];

// Utility function to generate URLs based on content type
const generateURL = (text: string, category: 'youtube' | 'website' | 'book' | 'practice'): string => {
  const cleanText = text.trim();

  // Check if text already contains a URL
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const existingUrl = cleanText.match(urlPattern);
  if (existingUrl && existingUrl[0]) {
    return existingUrl[0];
  }

  if (category === 'youtube') {
    // Extract channel name from parentheses: "Mrunal Patel (for economy and current affairs)" -> "Mrunal Patel"
    // Or extract the part before parentheses if it exists
    let channelName = cleanText;

    // Remove everything in parentheses and after
    channelName = channelName.replace(/\s*\([^)]*\).*/g, '').trim();

    // If there's a dash or similar separator, take the first part
    channelName = channelName.split(/\s*[-–—]\s*/)[0].trim();

    // Search only the channel/resource name on YouTube
    return `https://www.youtube.com/search?q=${encodeURIComponent(channelName)}`;
  } else if (category === 'website') {
    // Extract domain from parentheses: "UPSC official website (upsc.gov.in - for syllabus...)" -> "upsc.gov.in"
    let domainText = cleanText;

    // First, try to extract domain from parentheses
    const parenthesesMatch = cleanText.match(/\(([^)]*)\)/);
    if (parenthesesMatch) {
      // Extract just the domain part: "upsc.gov.in - for syllabus" -> "upsc.gov.in"
      const parenthesesContent = parenthesesMatch[1];
      const domainMatch = parenthesesContent.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (domainMatch) {
        domainText = domainMatch[1];
      }
    } else {
      // No parentheses, extract domain from main text
      const domainMatch = cleanText.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (domainMatch) {
        domainText = domainMatch[1];
      } else {
        // Fallback: remove text in parentheses and take first part
        domainText = cleanText.replace(/\s*\([^)]*\)/g, '').trim();
        domainText = domainText.split(/[\s-–—]/)[0];
      }
    }

    // Ensure it's a valid domain format and add protocol
    if (domainText.startsWith('http://') || domainText.startsWith('https://')) {
      return domainText;
    }
    if (domainText.startsWith('www.')) {
      return `https://${domainText}`;
    }
    return `https://www.${domainText}`;
  } else if (category === 'book') {
    // Extract book name from parentheses: "Rich Dad Poor Dad (personal finance)" -> "Rich Dad Poor Dad"
    let bookName = cleanText;
    bookName = bookName.replace(/\s*\([^)]*\).*/g, '').trim();
    bookName = bookName.split(/\s*[-–—]\s*/)[0].trim();

    // Search on Google Books
    return `https://www.google.com/search?q=${encodeURIComponent(bookName + ' book')}&tbm=bks`;
  } else if (category === 'practice') {
    // Extract practice resource name from parentheses: "LeetCode (coding practice platform)" -> "LeetCode"
    let resourceName = cleanText;

    // First try to extract domain if it exists in parentheses
    const parenthesesMatch = cleanText.match(/\(([^)]*)\)/);
    if (parenthesesMatch) {
      const parenthesesContent = parenthesesMatch[1];
      // Check if it contains a domain
      const domainMatch = parenthesesContent.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (domainMatch) {
        return `https://www.${domainMatch[1]}`;
      }
      // Otherwise use the resource name before parentheses
      resourceName = cleanText.replace(/\s*\([^)]*\).*/g, '').trim();
    } else {
      resourceName = cleanText.split(/\s*[-–—]\s*/)[0].trim();
    }

    // Search for the practice resource
    return `https://www.google.com/search?q=${encodeURIComponent(resourceName)}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(cleanText)}`;
};

// Collapsible Section Component - Plain Text (No Links)
const CollapsibleSection = ({ title, items, variant = 'default', icon: Icon = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  try {
    if (!items || items.length === 0) return null;

    const variantStyles = {
      default: 'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 border-l-4 border-primary/40',
      accent: 'bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/20 border-l-4 border-blue-400/60',
      warning: 'bg-gradient-to-br from-orange-50 to-orange-100/40 dark:from-orange-900/30 dark:to-orange-800/20 border-l-4 border-orange-400/60',
      success: 'bg-gradient-to-br from-green-50 to-green-100/40 dark:from-green-900/30 dark:to-green-800/20 border-l-4 border-green-400/60',
    };

    // Check if items are objects (like career paths) or strings
    const isObjectArray = items.length > 0 && typeof items[0] === 'object';

    return (
      <motion.div
        layout
        className={`rounded-lg overflow-hidden ${variantStyles[variant]}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 text-primary flex-shrink-0" />}
            <span className="text-sm font-semibold text-slate-900 dark:text-white text-left">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-200/30 dark:border-slate-700/30"
            >
              <div className="p-4 space-y-4">
                {isObjectArray ? (
                  // Render objects with path_name and description
                  items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="space-y-2"
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.path_name}</h4>
                      <div className="space-y-1 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
                        {Array.isArray(item.description) ? (
                          item.description.map((desc, dIdx) => (
                            <p key={dIdx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">• {desc}</p>
                          ))
                        ) : (
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Render strings
                  items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-3"
                    >
                      <span className="text-primary font-black flex-shrink-0 mt-0.5">•</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{item}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  } catch (err) {
    console.error('CollapsibleSection error:', err);
    return null;
  }
};

// Collapsible Section Component with Hyperlinks (For Resources Tab Only)
const CollapsibleSectionWithLinks = ({ title, items, variant = 'default', icon: Icon = null, linkCategory = 'youtube' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { saveResourceClick } = useAuth();

  if (!items || items.length === 0) return null;

  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 border-l-4 border-primary/40',
    accent: 'bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/20 border-l-4 border-blue-400/60',
    warning: 'bg-gradient-to-br from-orange-50 to-orange-100/40 dark:from-orange-900/30 dark:to-orange-800/20 border-l-4 border-orange-400/60',
    success: 'bg-gradient-to-br from-green-50 to-green-100/40 dark:from-green-900/30 dark:to-green-800/20 border-l-4 border-green-400/60',
  };

  const handleLinkClick = async (item: string) => {
    try {
      // Extract clean name for history (remove parentheses content)
      let cleanName = item.replace(/\s*\([^)]*\).*/g, '').trim();
      console.log(`🔗 Saving resource click: ${cleanName} (${linkCategory})`);
      await saveResourceClick(cleanName, linkCategory);
      console.log(`✅ Resource click saved: ${cleanName}`);
    } catch (err) {
      console.error('❌ Error tracking resource click:', err);
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-lg overflow-hidden ${variantStyles[variant]}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-primary flex-shrink-0" />}
          <span className="text-sm font-semibold text-slate-900 dark:text-white text-left">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200/30 dark:border-slate-700/30"
          >
            <div className="p-4 space-y-3">
              {items.map((item, idx) => {
                const url = generateURL(item, linkCategory as 'youtube' | 'website' | 'book' | 'practice');

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-3"
                  >
                    <span className="text-primary font-black flex-shrink-0 mt-0.5">•</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(item)}
                      className="text-sm text-primary hover:text-accent font-semibold leading-relaxed hover:underline decoration-2 decoration-primary/50 transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="text-slate-700 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-accent transition-colors">{item}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Styled Section Title Component
const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200/30 dark:border-slate-700/30">
    {Icon && <Icon className="h-6 w-6 text-primary flex-shrink-0" />}
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{children}</h3>
  </div>
);

// Styled Bullet Point Component
const BulletPoint = ({ children, icon: Icon = null, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 border-l-4 border-primary/40 hover:border-primary/60',
    accent: 'bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/20 border-l-4 border-blue-400/60 hover:border-blue-500',
    warning: 'bg-gradient-to-br from-orange-50 to-orange-100/40 dark:from-orange-900/30 dark:to-orange-800/20 border-l-4 border-orange-400/60 hover:border-orange-500',
    success: 'bg-gradient-to-br from-green-50 to-green-100/40 dark:from-green-900/30 dark:to-green-800/20 border-l-4 border-green-400/60 hover:border-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`flex gap-3 p-4 rounded-lg ${variantStyles[variant]} hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-default`}
    >
      <span className="text-xl text-primary font-black flex-shrink-0 mt-0.5">•</span>
      {Icon && <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
      <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{children}</span>
    </motion.div>
  );
};

// Styled Info Box Component
const InfoBox = ({ title, children, variant = 'default' }) => {
  const boxVariants = {
    default: 'bg-gradient-to-br from-blue-50 to-cyan-50/30 dark:from-blue-900/30 dark:to-cyan-900/20 border border-blue-200/40 dark:border-blue-700/40',
    warning: 'bg-gradient-to-br from-orange-50 to-amber-50/30 dark:from-orange-900/30 dark:to-amber-900/20 border border-orange-200/40 dark:border-orange-700/40',
  };

  return (
    <div className={`p-5 rounded-lg ${boxVariants[variant]}`}>
      {title && <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</p>}
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>
    </div>
  );
};

// Helper function to generate default nearby coaching hubs
const generateDefaultNearbyHubs = (userLocation: string = 'India', goal: string = '') => {
  const hubsByLocation = {
    delhi: [
      { name: 'Delhi Institute of Advanced Studies', type: 'Coaching Center', location: 'New Delhi, India', review_rating: '4.5', specialization: goal || 'Career Development', distance: '2.5 km' },
      { name: 'Career Point Institute Delhi', type: 'Training Hub', location: 'Central Delhi, India', review_rating: '4.3', specialization: goal || 'Professional Skills', distance: '3.1 km' },
      { name: 'Delhi Professional Academy', type: 'Coaching Center', location: 'Delhi, India', review_rating: '4.2', specialization: goal || 'Goal Planning', distance: '1.8 km' },
      { name: 'Elite Learning Center Delhi', type: 'Training Center', location: 'Delhi, India', review_rating: '4.4', specialization: goal || 'Career Guidance', distance: '2.2 km' }
    ],
    mumbai: [
      { name: 'Elite Academy Mumbai', type: 'Coaching Center', location: 'Mumbai, India', review_rating: '4.6', specialization: goal || 'Career Development', distance: '2.0 km' },
      { name: 'Mumbai Training Center', type: 'Training Hub', location: 'Mumbai, India', review_rating: '4.4', specialization: goal || 'Professional Skills', distance: '2.8 km' },
      { name: 'Bombay Career Hub', type: 'Coaching Center', location: 'Mumbai, India', review_rating: '4.3', specialization: goal || 'Goal Achievement', distance: '1.9 km' },
      { name: 'Professional Development Institute', type: 'Training Center', location: 'Mumbai, India', review_rating: '4.5', specialization: goal || 'Career Guidance', distance: '3.2 km' }
    ],
    bangalore: [
      { name: 'Bangalore Institute of Excellence', type: 'Coaching Center', location: 'Bangalore, India', review_rating: '4.7', specialization: goal || 'Career Development', distance: '2.3 km' },
      { name: 'South India Coaching Center', type: 'Training Hub', location: 'Bangalore, India', review_rating: '4.5', specialization: goal || 'Professional Skills', distance: '2.1 km' },
      { name: 'Tech Academy Bangalore', type: 'Coaching Center', location: 'Bangalore, India', review_rating: '4.4', specialization: goal || 'Career Guidance', distance: '1.7 km' },
      { name: 'Wellness & Career Hub', type: 'Training Center', location: 'Bangalore, India', review_rating: '4.6', specialization: goal || 'Holistic Development', distance: '2.9 km' }
    ]
  };

  const normalizedLocation = (userLocation || 'india').toLowerCase();
  let selectedHubs = hubsByLocation.bangalore;

  if (normalizedLocation.includes('delhi')) selectedHubs = hubsByLocation.delhi;
  else if (normalizedLocation.includes('mumbai') || normalizedLocation.includes('bombay')) selectedHubs = hubsByLocation.mumbai;
  else if (normalizedLocation.includes('bangalore') || normalizedLocation.includes('bengaluru')) selectedHubs = hubsByLocation.bangalore;

  return selectedHubs;
};

const GoalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, saveGoal } = useAuth();
  const [activeTab, setActiveTab] = useState('eligibility');
  const [aiData, setAiData] = useState(null);
  const [latestActivity, setLatestActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGoalConfirmed, setIsGoalConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const state = (location as any).state;

        if (state?.aiData) {
          console.log('✅ Using data from state');
          setAiData(state.aiData);
          setLatestActivity(state.formData);
          setLoading(false);
          return;
        }

        if (user?.email) {
          try {
            console.log(`Fetching activities for ${user.email}...`);
            const response = await fetch(`http://localhost:5000/api/user/activities/${user.email}`);

            if (response.ok) {
              const data = await response.json();
              const activitiesArray = data.activities || [];

              const clarificationActivities = activitiesArray.filter(
                (activity: any) => activity.type === 'goal_clarification' && activity.aiData
              );

              if (clarificationActivities.length > 0) {
                const latest = clarificationActivities.sort(
                  (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];

                if (latest?.aiData) {
                  console.log('✅ Using data from latest activity:', latest.goal);
                  setAiData(latest.aiData);
                  setLatestActivity(latest);
                  setLoading(false);
                  return;
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not fetch latest activity:', err);
          }
        }

        console.log('❌ No data found, redirecting to start');
        setError('Please fill your goal details first');
        setTimeout(() => {
          navigate('/start', { replace: true });
        }, 2000);
        setLoading(false);

      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [location, navigate, user?.email]);

  // Check if goal is already confirmed
  useEffect(() => {
    if (user?.email && latestActivity?.goal) {
      const goalName = latestActivity.goal;
      
      // Check if this goal is already confirmed in user's activities
      const confirmedGoals = user.activities?.filter(
        (activity: any) => activity.type === 'goal_confirmed'
      ) || [];
      
      const isDuplicate = confirmedGoals.some(
        (activity: any) => activity.goal === goalName
      );
      
      setIsGoalConfirmed(isDuplicate);
      console.log(`✅ Goal "${goalName}" already confirmed:`, isDuplicate);
    }
  }, [user?.activities, latestActivity?.goal, user?.email]);

  const handleConfirmGoal = async () => {
    try {
      if (isGoalConfirmed) {
        alert('⚠️ This goal is already confirmed! Check "My Goals" to view it.');
        return;
      }

      setIsConfirming(true);
      const goalName = latestActivity?.goal || (location as any).state?.formData?.goal || 'Goal';
      const targetYear = latestActivity?.targetYear || (location as any).state?.formData?.targetYear;

      console.log('📝 Confirming goal:', goalName);

      await saveGoal({
        name: goalName,
        createdDate: new Date(),
        targetYear: targetYear
      });

      console.log('✅ Goal confirmed and saved!');
      alert('✅ Goal confirmed and added to "My Goals"!');
      setIsGoalConfirmed(true);
      navigate('/goals');
    } catch (err) {
      console.error('Error confirming goal:', err);
      alert('❌ Failed to confirm goal. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  if (error) return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
      <p className="text-red-600 font-bold">Error: {error}</p>
      <p className="text-slate-600 text-sm">Make sure backend server is running on port 5000</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );
  if (!aiData) return <div className="flex items-center justify-center h-screen"><p>No data available</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {latestActivity?.goal || (location as any).state?.formData?.goal || 'Become an Engineer at ISRO'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Your personalized roadmap to achieving your goal</p>
            </div>

            <div className="flex gap-3 items-start">
              {/* Confirm Goal Button */}
              <Button
                variant={isGoalConfirmed ? "outline" : "hero"}
                onClick={handleConfirmGoal}
                disabled={isGoalConfirmed || isConfirming}
                className="px-6 py-2 h-fit"
              >
                {isGoalConfirmed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Goal Confirmed
                  </>
                ) : isConfirming ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Goal
                  </>
                )}
              </Button>

              {aiData?.['1_eligibility_check'] && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-end gap-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                >
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Success Rate</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {aiData?.['2_success_rate_and_possible_paths']?.success_rate_percentage || 'N/A'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[73px] z-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full py-4 shadow-lg">
          <div className="container mx-auto px-4 max-h-fit">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
              <TabsList className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200/20 dark:border-slate-700/20 shadow-lg gap-4 flex-nowrap w-fit">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary dark:data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-xl px-3 py-1 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 flex-shrink-0"
                  >
                    <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* 1. Eligibility Tab */}
          <TabsContent value="eligibility">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['1_eligibility_check'] ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200/40 dark:border-green-700/40"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-900 dark:text-green-100">{aiData['1_eligibility_check'].status}</p>
                      <p className="text-xs text-green-700 dark:text-green-300">You meet the basic requirements</p>
                    </div>
                  </motion.div>

                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm">
                    <SectionTitle icon={CheckCircle}>Eligibility Criteria Met</SectionTitle>
                    <div className="space-y-3">
                      {aiData['1_eligibility_check'].bullet_points?.map((point, idx) => (
                        <BulletPoint key={idx} variant="success">{point}</BulletPoint>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No eligibility data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 2. Roadmap Tab - WITH COLLAPSIBLES */}
          <TabsContent value="roadmap">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['2_success_rate_and_possible_paths'] || aiData?.['3_how_to_achieve_this_goal'] ? (
                <>
                  <CollapsibleSection
                    title="Possible Career Paths"
                    items={aiData?.['2_success_rate_and_possible_paths']?.possible_paths}
                    variant="accent"
                  />

                  <CollapsibleSection
                    title="Action Steps"
                    items={aiData?.['3_how_to_achieve_this_goal']?.action_steps}
                    variant="default"
                  />

                  <CollapsibleSection
                    title="Practical Tips & Shortcuts"
                    items={aiData?.['3_how_to_achieve_this_goal']?.practical_tips_and_shortcuts}
                    variant="accent"
                  />
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No roadmap data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 3. Knowledge Tab - WITH COLLAPSIBLES */}
          <TabsContent value="knowledge">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['4_detailed_domain_knowledge'] ? (
                <>
                  <CollapsibleSection
                    title="Important Topics & Skills"
                    items={aiData['4_detailed_domain_knowledge'].important_topics_or_skills}
                    variant="default"
                  />

                  <CollapsibleSection
                    title="Domain Variations & Categories"
                    items={aiData['4_detailed_domain_knowledge'].important_variations_or_categories}
                    variant="accent"
                  />

                  <CollapsibleSection
                    title="What Beginners Should Start With"
                    items={aiData['4_detailed_domain_knowledge'].what_beginners_should_start_with}
                    variant="success"
                  />
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No domain knowledge data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 4. Inspiration Tab - WITH COLLAPSIBLES */}
          <TabsContent value="inspiration">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['5_real_inspirational_examples']?.real_people_or_cases?.length > 0 ? (
                aiData['5_real_inspirational_examples'].real_people_or_cases.map((person, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                        {person.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{person}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Inspiring Professional</p>
                      </div>
                    </div>
                    {aiData['5_real_inspirational_examples'].why_they_matter?.[idx] && (
                      <div className="space-y-2 border-t border-slate-200/30 dark:border-slate-700/30 pt-4">
                        {Array.isArray(aiData['5_real_inspirational_examples'].why_they_matter[idx]) ? (
                          aiData['5_real_inspirational_examples'].why_they_matter[idx].map((reason, ridx) => (
                            <div key={ridx} className="flex gap-3">
                              <span className="text-primary font-black mt-0.5 text-lg">•</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{reason}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {aiData['5_real_inspirational_examples'].why_they_matter[idx]}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No inspiration data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 5. Resources Tab - WITH HYPERLINKS */}
          <TabsContent value="resources">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['6_learning_and_preparation_resources'] ? (
                <>
                  <CollapsibleSectionWithLinks
                    title="YouTube Channels & Videos"
                    items={aiData['6_learning_and_preparation_resources'].youtube_channels_or_videos}
                    variant="accent"
                    linkCategory="youtube"
                  />

                  <CollapsibleSectionWithLinks
                    title="Websites & Platforms"
                    items={aiData['6_learning_and_preparation_resources'].websites_or_platforms}
                    variant="accent"
                    linkCategory="website"
                  />

                  <CollapsibleSectionWithLinks
                    title="Books & Documents"
                    items={aiData['6_learning_and_preparation_resources'].books_or_documents}
                    variant="success"
                    linkCategory="book"
                  />

                  <CollapsibleSectionWithLinks
                    title="Practice Resources"
                    items={aiData['6_learning_and_preparation_resources'].question_papers_or_practice_links}
                    variant="warning"
                    linkCategory="practice"
                  />

                  {/* Nearby Coaching Hubs Subsection - ALWAYS SHOW */}
                  {(() => {
                    const hubs = aiData?.['6_learning_and_preparation_resources']?.nearby_coaching_hubs ||
                      generateDefaultNearbyHubs(
                        latestActivity?.location || (location as any).state?.formData?.location || 'India',
                        latestActivity?.goal || (location as any).state?.formData?.goal || ''
                      );

                    return (
                      <div className="mt-8 pt-8 border-t border-slate-200/30 dark:border-slate-700/30">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Nearby Coaching Hubs
                        </h4>
                        <div className="space-y-4">
                          {hubs && hubs.length > 0 ? (
                            hubs.map((hub, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 rounded-lg p-5 border border-slate-200/40 dark:border-slate-700/40 hover:shadow-lg transition-all"
                              >
                                <a
                                  href={`https://www.google.com/maps/search/${encodeURIComponent(hub.name + ' ' + hub.location)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lg font-bold text-primary hover:underline flex items-center gap-2 mb-3"
                                >
                                  {hub.name}
                                  <ExternalLink className="h-4 w-4" />
                                </a>

                                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                  <p><span className="font-semibold">Type:</span> {hub.type}</p>
                                  <p><span className="font-semibold">📍 Location:</span> {hub.location}</p>
                                  <p><span className="font-semibold">⭐ Rating:</span> <span className="text-amber-500 font-bold">{hub.review_rating}/5</span></p>
                                  <p><span className="font-semibold">📚 Specialization:</span> {hub.specialization}</p>
                                  <p><span className="font-semibold">📏 Distance:</span> {hub.distance}</p>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-slate-500 dark:text-slate-400">No nearby hubs data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No resources data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 6. Career Outcomes Tab - WITH COLLAPSIBLES */}
          <TabsContent value="outcomes">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['7_rewards_after_achieving_goal'] ? (
                <>
                  <CollapsibleSection
                    title="Career Outcomes"
                    items={aiData['7_rewards_after_achieving_goal'].career_outcomes}
                    variant="success"
                    icon={Award}
                  />

                  <CollapsibleSection
                    title="Money, Power & Lifestyle"
                    items={aiData['7_rewards_after_achieving_goal'].money_power_fame_or_lifestyle}
                    variant="accent"
                    icon={TrendingUp}
                  />
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No career outcomes data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 7. Hardships Tab - WITH COLLAPSIBLES */}
          <TabsContent value="hardships">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['8_realistic_hardships_and_sacrifices'] ? (
                <>
                  <CollapsibleSection
                    title="Financial Challenges"
                    items={aiData['8_realistic_hardships_and_sacrifices'].financial_challenges}
                    variant="warning"
                    icon={AlertTriangle}
                  />

                  <CollapsibleSection
                    title="Competition & Selection Rates"
                    items={aiData['8_realistic_hardships_and_sacrifices'].competition_and_selection}
                    variant="warning"
                    icon={Users}
                  />
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No hardships data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 8. Alternatives Tab - WITH COLLAPSIBLES */}
          <TabsContent value="alternatives">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {aiData?.['9_alternative_or_similar_goals_if_applicable'] ? (
                <>
                  {aiData['9_alternative_or_similar_goals_if_applicable'].when_to_suggest_alternatives && (
                    <InfoBox title="When to Consider Alternatives" variant="default">
                      {aiData['9_alternative_or_similar_goals_if_applicable'].when_to_suggest_alternatives}
                    </InfoBox>
                  )}

                  {aiData['9_alternative_or_similar_goals_if_applicable'].recommended_alternative_goals && (
                    <CollapsibleSection
                      title="Recommended Alternative Goals"
                      items={aiData['9_alternative_or_similar_goals_if_applicable'].recommended_alternative_goals}
                      variant="accent"
                      icon={Zap}
                    />
                  )}
                </>
              ) : (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30">
                  <p className="text-slate-500 dark:text-slate-400">No alternative goals data available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* 9. Daily Guidance Tab */}
          <TabsContent value="daily">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/20 dark:border-slate-700/30 shadow-sm">
                <SectionTitle icon={Calendar}>Daily Learning Tasks</SectionTitle>
                <InfoBox title="Recommended Daily Activities" variant="default">
                  Based on your available hours, focus on high-impact learning activities.
                </InfoBox>
                <div className="mt-6 space-y-3">
                  {[
                    { task: 'Review core subject fundamentals', time: '30 min', icon: BookOpen },
                    { task: 'Solve practice problems & previous papers', time: '45 min', icon: Play },
                    { task: 'Take mock tests or quizzes', time: '30 min', icon: Award },
                    { task: 'Quick revision & concept clarity', time: '15 min', icon: Lightbulb },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/70 to-cyan-50/40 dark:from-blue-900/30 dark:to-cyan-900/20 border border-blue-200/30 dark:border-blue-700/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group cursor-pointer"
                    >
                      <item.icon className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-125 transition-transform font-bold" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.task}</p>
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-primary/25 text-primary dark:bg-primary/30 dark:text-accent whitespace-nowrap">
                        {item.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>


        </div>
      </Tabs>
    </div>
  );
};

export default GoalDashboard;