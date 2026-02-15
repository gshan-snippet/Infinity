import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, UserCheck } from 'lucide-react';

const InfinigramSignup = ({ onBackClick }: { onBackClick: () => void }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('userType'); // 'userType' | 'details'
  const [userType, setUserType] = useState<'producer' | 'consumer' | null>(null);
  const [formData, setFormData] = useState({
    dob: '',
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserTypeSelect = (type: 'producer' | 'consumer') => {
    setUserType(type);
    setStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.dob || !formData.username || !formData.password || !formData.email) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // TASK 1: First verify main account exists with this email
      console.log('🔍 Verifying main account for email:', formData.email);
      const profileCheckResponse = await fetch(
        `http://localhost:5000/api/user/profile/${encodeURIComponent(formData.email)}`,
        { method: 'GET' }
      );

      if (!profileCheckResponse.ok) {
        setError('Main account not found. Please create a main account first or use the same email.');
        setLoading(false);
        return;
      }

      const profileCheckData = await profileCheckResponse.json();
      if (!profileCheckData.success) {
        setError('Main account not found. Please create a main account first or use the same email.');
        setLoading(false);
        return;
      }

      console.log('✅ Main account verified, proceeding with Infinigram signup');

      // Now create Infinigram account
      const response = await fetch('http://localhost:5000/api/infinigram/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          dob: formData.dob,
          userType: userType
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Save to localStorage
      const infinigram_user = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        dob: data.user.dob,
        profilePhoto: '',
        followers: 0,
        following: 0,
        userType: userType
      };

      localStorage.setItem('infinigram_user', JSON.stringify(infinigram_user));
      navigate('/infinigram/home');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Step 1: User Type Selection
  if (step === 'userType') {
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                  <span className="text-2xl font-bold text-white">∞</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Infinigram</h1>
                <p className="text-slate-600 dark:text-slate-400">Your hub for goals and opportunities — learn, connect, achieve</p>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-6">
                  What type of user are you?
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => handleUserTypeSelect('producer')}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Producer</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Create content & share knowledge</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUserTypeSelect('consumer')}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Consumer</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Learn & grow from community</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                You can change this later in settings
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Step 2: Consumer Details Form
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
              onClick={() => setStep('userType')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Your Profile</h1>
              <p className="text-slate-600 dark:text-slate-400">Complete your Infinigram profile as a Consumer</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
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
                <UserCheck className="h-5 w-5" />
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By signing up, you agree to our Terms of Service
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InfinigramSignup;