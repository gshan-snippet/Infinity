import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb, HelpCircle, RefreshCw, GitBranch,
  ArrowLeft, ArrowRight, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const options = [
  {
    id: 'know-goal',
    icon: Lightbulb,
    title: "I know my goal, but don't know how to start",
    description: "You have a clear career in mind but need guidance on the path",
    color: "text-amber-500",
    bg: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30 hover:border-amber-500"
  },
  {
    id: 'no-goal',
    icon: HelpCircle,
    title: "I don't know my goal",
    description: "Help me discover what career suits me best",
    color: "text-blue-500",
    bg: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30 hover:border-blue-500"
  },
  {
    id: 'stuck',
    icon: RefreshCw,
    title: "I'm currently working towards a goal but stuck",
    description: "I need help getting back on track with my preparation",
    color: "text-green-500",
    bg: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30 hover:border-green-500"
  },
  {
    id: 'alternatives',
    icon: GitBranch,
    title: "I want to find similar or backup goals",
    description: "Explore alternative paths and parallel options",
    color: "text-purple-500",
    bg: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30 hover:border-purple-500"
  }
];

const Start = () => {
  const navigate = useNavigate();
  const { saveActivity } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = async () => {
    if (!selectedOption) return;
    setIsAnimating(true);

    // Save activity
    try {
      await saveActivity({
        type: 'goal_selection',
        option: selectedOption,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving activity:', err);
    }

    setTimeout(() => {
      if (selectedOption === 'know-goal') {
        navigate('/clarify-goal');
      } else if (selectedOption === 'no-goal') {
        navigate('/discover-goal');
      } else if (selectedOption === 'stuck') {
        navigate('/stuck-goal');
      } else if (selectedOption === 'alternatives') {
        navigate('/alternative-goals');
      } else {
        console.log('Option not implemented yet:', selectedOption);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-3xl">
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

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
            >
              <Compass className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              What best describes you right now?
            </h1>
            <p className="text-muted-foreground">
              Select one option to get started with your personalized journey
            </p>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all duration-300 border-2 ${option.border} ${selectedOption === option.id
                  ? `bg-gradient-to-r ${option.bg} shadow-elevated scale-[1.02]`
                  : 'hover:shadow-card'
                  }`}
                onClick={() => handleSelect(option.id)}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={selectedOption === option.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-xl ${selectedOption === option.id
                      ? 'bg-background shadow-soft'
                      : 'bg-muted'
                      }`}
                  >
                    <option.icon className={`h-6 w-6 ${option.color}`} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === option.id
                    ? `${option.border.replace('hover:', '')} bg-background`
                    : 'border-border'
                    }`}>
                    <AnimatePresence>
                      {selectedOption === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={`w-3 h-3 rounded-full ${option.color.replace('text-', 'bg-')}`}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            variant="hero"
            size="xl"
            disabled={!selectedOption}
            onClick={handleContinue}
            className={`w-full sm:w-auto ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Start;
