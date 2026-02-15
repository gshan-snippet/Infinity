import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, LogIn } from 'lucide-react';

const InfinigamLogin = ({ onBackClick }: { onBackClick: () => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // TASK 1: First verify main account exists with this email
      console.log('🔍 Verifying main account for email:', email);
      const profileCheckResponse = await fetch(
        `http://localhost:5000/api/user/profile/${encodeURIComponent(email)}`,
        { method: 'GET' }
      );

      if (!profileCheckResponse.ok) {
        setError('Main account not found. Please create a main account first or use the correct email.');
        setLoading(false);
        return;
      }

      const profileCheckData = await profileCheckResponse.json();
      if (!profileCheckData.success) {
        setError('Main account not found. Please create a main account first or use the correct email.');
        setLoading(false);
        return;
      }

      console.log('✅ Main account verified, proceeding with Infinigram login');

      // Now attempt Infinigram login
      const response = await fetch('http://localhost:5000/api/infinigram/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save to localStorage
      const infinigram_user = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        dob: data.user.dob,
        profilePhoto: data.user.profilePhoto,
        followers: data.user.followers || 0,
        following: data.user.following || 0,
        userType: data.user.userType
      };

      localStorage.setItem('infinigram_user', JSON.stringify(infinigram_user));
      navigate('/infinigram/home');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <button
              onClick={onBackClick}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back!</h1>
              <p className="text-slate-600 dark:text-slate-400">Log in to your Infinigram account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email or Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By logging in, you agree to our Terms of Service
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InfinigamLogin;