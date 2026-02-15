import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Infinigram = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [infinigram_user, setInfinigram_user] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged into Infinigram
    const storedInfinigram_user = localStorage.getItem('infinigram_user');
    
    if (storedInfinigram_user) {
      try {
        const parsedUser = JSON.parse(storedInfinigram_user);
        setInfinigram_user(parsedUser);
        // User is logged in, navigate to home
        navigate('/infinigram/home');
      } catch (err) {
        console.error('Error parsing infinigram user:', err);
        setLoading(false);
      }
    } else {
      // User not logged in, navigate to auth
      setLoading(false);
      navigate('/infinigram/auth');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Loading Infinigram...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Infinigram;