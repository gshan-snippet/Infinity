import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedGoals = [
  { name: 'Software Engineer', category: 'Tech', icon: Briefcase },
  { name: 'UPSC Civil Services', category: 'Government', icon: GraduationCap },
  { name: 'Medical Doctor', category: 'Healthcare', icon: Users },
  { name: 'CA (Chartered Accountant)', category: 'Finance', icon: TrendingUp },
];

const recentSearches = [
  'Junior Engineer - HESCOM',
  'IAS Preparation Guide',
  'NEET 2024 Syllabus',
];

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-background rounded-2xl shadow-elevated border border-border z-50 overflow-hidden"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search careers, exams, coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={search}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                      >
                        {search}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Goals */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Goals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedGoals.map((goal, index) => (
                    <motion.button
                      key={goal.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <goal.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
