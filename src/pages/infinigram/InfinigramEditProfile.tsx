import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

interface InfinigamUser {
  id: string;
  email: string;
  username: string;
  dob: string;
  profilePhoto: string;
  posts: number;
  followers: number;
  following: number;
  userType: string;
}

const InfinigamEditProfile = () => {
  const navigate = useNavigate();
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    setInfinigram_user(JSON.parse(storedUser));
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (infinigram_user) {
      setInfinigram_user(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!infinigram_user) {
      setError('User data not found');
      setLoading(false);
      return;
    }

    try {
      // Update localStorage
      localStorage.setItem('infinigram_user', JSON.stringify(infinigram_user));
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        navigate('/infinigram/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  if (!infinigram_user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <button
            onClick={() => navigate('/infinigram/profile')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Profile</span>
          </button>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Edit Profile</h1>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    name="username"
                    value={infinigram_user.username}
                    onChange={handleInputChange}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={infinigram_user.email}
                    onChange={handleInputChange}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    name="dob"
                    value={infinigram_user.dob}
                    onChange={handleInputChange}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Date of birth cannot be changed</p>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    More profile customization options coming soon! (Bio, Profile Photo, etc.)
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  >
                    <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/infinigram/profile')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InfinigamEditProfile;