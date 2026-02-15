import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Target, BookOpen, Briefcase, X, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const History = () => {
  const navigate = useNavigate();
  const { user, getActivities } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all activities and filter for resource_click type
    const allActivities = getActivities();
    console.log('📚 All activities:', allActivities);
    
    const resourceClicks = allActivities
      .filter((activity: any) => activity.type === 'resource_click')
      .map((activity: any) => {
        console.log('🔗 Found resource click:', activity);
        return {
          id: Math.random(),
          type: 'resource',
          query: activity.resourceName,
          resourceType: activity.resourceType,
          time: formatTime(new Date(activity.timestamp)),
          timestamp: new Date(activity.timestamp),
          icon: LinkIcon,
          color: 'text-blue-500'
        };
      })
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log('✅ Processed resource clicks:', resourceClicks);
    setItems(resourceClicks);
  }, [user]); // Added user as dependency to reload when activities change

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredItems = items.filter(item =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const getResourceTypeColor = (resourceType: string) => {
    const typeColors: { [key: string]: string } = {
      youtube: 'text-red-500',
      website: 'text-blue-500',
      book: 'text-purple-500',
      practice: 'text-green-500'
    };
    return typeColors[resourceType] || 'text-blue-500';
  };

  const getResourceTypeLabel = (resourceType: string) => {
    const labels: { [key: string]: string } = {
      youtube: 'YouTube',
      website: 'Website',
      book: 'Book',
      practice: 'Practice'
    };
    return labels[resourceType] || 'Resource';
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

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold">History</h1>
              <p className="text-muted-foreground">Your resource clicks and browsing history</p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" onClick={clearAll} className="text-destructive">
                Clear All
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* History List */}
        {filteredItems.length > 0 ? (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="default" className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <LinkIcon className={`h-5 w-5 ${getResourceTypeColor(item.resourceType)}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.query}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 ${getResourceTypeColor(item.resourceType)}`}>
                              {getResourceTypeLabel(item.resourceType)}
                            </span>
                          </div>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">No History</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No results found for your search' : 'Your resource clicks will appear here'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;