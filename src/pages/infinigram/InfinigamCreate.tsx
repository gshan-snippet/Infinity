import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Upload, ArrowLeft } from 'lucide-react';

const InfinigamCreate = () => {
  const navigate = useNavigate();
  const [infinigram_user, setInfinigram_user] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    setInfinigram_user(JSON.parse(storedUser));
  }, [navigate]);

  if (!infinigram_user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <button
              onClick={() => navigate('/infinigram/home')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Create New Post
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Share your knowledge and experiences with the community
            </p>
          </div>

          {/* Choose Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Record Option */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate('/infinigram/create/record')}>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
                      <Video className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Record Video
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Record directly from your camera to share live content
                  </p>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/infinigram/create/record');
                    }}
                  >
                    Start Recording
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upload Option */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate('/infinigram/create/upload')}>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all">
                      <Upload className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Upload File
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Upload documents, images, or videos from your device
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/infinigram/create/upload');
                    }}
                  >
                    Choose Files
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Section */}
          <Card className="border-0 shadow-lg bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                📌 Tips for great posts:
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• Keep your content clear and engaging</li>
                <li>• Add detailed descriptions to help others understand</li>
                <li>• Use relevant hashtags to reach more people</li>
                <li>• Respect community guidelines</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InfinigamCreate;