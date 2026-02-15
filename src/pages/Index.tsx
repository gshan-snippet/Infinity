import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Target, Map, Rocket, ArrowRight,
  Lightbulb, HelpCircle, RefreshCw, GitBranch,
  Sparkles, Users, BookOpen, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const useCases = [
  {
    icon: Lightbulb,
    title: "Know your goal, but don't know how to start",
    description: "Get a clear roadmap from where you are to where you want to be",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    icon: HelpCircle,
    title: "Don't know your goal",
    description: "Discover careers that match your interests and strengths",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: RefreshCw,
    title: "Stuck midway in preparation",
    description: "Get unstuck with personalized guidance and resources",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: GitBranch,
    title: "Want similar or backup goals",
    description: "Explore alternative paths and backup options",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
];

const features = [
  { icon: Sparkles, title: "AI-Powered Guidance", description: "Personalized recommendations based on your profile" },
  { icon: Users, title: "Real Stories", description: "Learn from people who've achieved your dream goals" },
  { icon: BookOpen, title: "Complete Resources", description: "Syllabus, coaching, exams - everything in one place" },
  { icon: Trophy, title: "Track Progress", description: "Monitor your journey with daily tasks and milestones" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkAuth } = useAuthModal();
  const [isHeroAnimated, setIsHeroAnimated] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden gradient-hero">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Compass className="h-4 w-4" />
              Your Career Navigation System
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              One App.{' '}
              <span className="text-gradient">Every Career Path.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              From confusion to clarity — step by step. Discover your perfect career path with personalized roadmaps, real guidance, and daily support.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                variant="hero"
                size="xl"
                onClick={() => checkAuth(() => navigate('/start'))}
                className="group"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => checkAuth(() => navigate('/subscription'))}
              >
                View Plans
              </Button>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-3xl">
                {/* Journey Visualization */}
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted flex items-center justify-center shadow-card">
                      <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground mt-2">Confused</span>
                  </motion.div>

                  <motion.div
                    animate={{ scaleX: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-1 w-12 sm:w-24 rounded-full gradient-primary"
                  />

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
                      <Map className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm text-primary mt-2">Roadmap</span>
                  </motion.div>

                  <motion.div
                    animate={{ scaleX: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="h-1 w-12 sm:w-24 rounded-full gradient-primary"
                  />

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                      <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                    </div>
                    <span className="text-xs sm:text-sm text-gradient font-semibold mt-2">Success</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CareerVerse combines AI-powered guidance, real success stories, and comprehensive resources to help you achieve your career goals.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={index}
              >
                <Card variant="elevated" className="h-full text-center p-6">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Where Are You Right Now?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No matter where you are in your career journey, CareerVerse has the right path for you.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                variants={fadeInUp}
                custom={index}
              >
                <Card
                  variant="interactive"
                  className="p-6 cursor-pointer"
                  onClick={() => checkAuth(() => navigate('/start'))}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${useCase.bg}`}>
                      <useCase.icon className={`h-6 w-6 ${useCase.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg mb-2">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl gradient-primary p-8 sm:p-12 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-foreground/20 flex items-center justify-center"
              >
                <Rocket className="h-8 w-8 text-primary-foreground" />
              </motion.div>

              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of students and professionals who have transformed their careers with CareerVerse.
              </p>

              <Button
                size="xl"
                onClick={() => navigate('/start')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-elevated"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-gradient">CareerVerse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 CareerVerse. Navigate your future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
