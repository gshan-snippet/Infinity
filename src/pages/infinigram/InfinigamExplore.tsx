import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User, UserPlus, UserCheck } from 'lucide-react';

interface SearchResult {
  id: string;
  email: string;
  username: string;
  profilePhoto: string;
  bio: string;
  followers: number;
  following: number;
  userType: string;
}

interface InfinigamUser {
  id: string;
  email: string;
  username: string;
  profilePhoto: string;
}

const InfinigamExplore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    const user = JSON.parse(storedUser);
    setInfinigram_user(user);
    fetchFollowingList(user.email);
    fetchPendingRequests(user.email);
  }, [navigate]);

  const fetchFollowingList = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/infinigram/following/${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success) {
        setFollowingList(data.following.map((user: any) => user.email));
      }
    } catch (err) {
      console.error('Error fetching following list:', err);
    }
  };

  const fetchPendingRequests = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/infinigram/follow/pending/${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success) {
        // Get list of users that current user sent requests to
        // This is different - we need pending requests FROM us to others
        // For now, we'll track it differently
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError('');

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5000/api/infinigram/search/users/${encodeURIComponent(query)}`;
      console.log('🔍 Searching for:', query, 'URL:', url);
      
      const response = await fetch(url);
      
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Search results:', data);

      if (data.success && data.results) {
        // Filter out current user from results
        const filtered = data.results.filter((user: SearchResult) => user.email !== infinigram_user?.email);
        setSearchResults(filtered);
        if (filtered.length === 0) {
          setError(`No users found matching "${query}"`);
        }
      } else {
        setError(data.error || `No users found matching "${query}"`);
      }
    } catch (err: any) {
      console.error('❌ Search error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Provide helpful error messages
      if (err.message.includes('Failed to fetch')) {
        setError('⚠️ Cannot connect to backend server. Is localhost:5000 running?');
      } else if (err.message.includes('HTTP error')) {
        setError('⚠️ Backend server returned an error. Check server logs');
      } else {
        setError('❌ Search failed. Please check browser console for details');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowRequest = async (toEmail: string) => {
    if (!infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: infinigram_user.email,
          toEmail: toEmail
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPendingRequests([...pendingRequests, toEmail]);
      } else {
        setError(data.error || 'Failed to send follow request');
      }
    } catch (err) {
      console.error('Follow request error:', err);
      setError('Backend server may not be running. Ensure localhost:5000 is accessible');
    }
  };

  const handleUnfollow = async (toEmail: string) => {
    if (!infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: infinigram_user.email,
          toEmail: toEmail
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setFollowingList(followingList.filter(email => email !== toEmail));
      } else {
        setError(data.error || 'Failed to unfollow');
      }
    } catch (err) {
      console.error('Unfollow error:', err);
      setError('Backend server may not be running. Ensure localhost:5000 is accessible');
    }
  };

  const getButtonState = (userEmail: string) => {
    if (followingList.includes(userEmail)) {
      return 'following';
    } else if (pendingRequests.includes(userEmail)) {
      return 'pending';
    } else {
      return 'follow';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Explore</h1>
          <p className="text-slate-600 dark:text-slate-400">Discover and connect with people who share your interests</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for usernames..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 py-3 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">Searching...</p>
            </div>
          ) : searchResults.length === 0 && searchQuery.trim() ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">No users found matching "{searchQuery}"</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => {
              const buttonState = getButtonState(user.email);
              return (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* User Info */}
                        <button
                          onClick={() => navigate(`/infinigram/profile/${user.email}`)}
                          className="flex items-center gap-4 flex-1 text-left hover:opacity-80 transition-opacity"
                        >
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user.username}
                              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.username}</h3>
                            {user.bio && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">{user.bio}</p>
                            )}
                            <div className="flex gap-6 mt-2 text-sm text-slate-600 dark:text-slate-400">
                              <span><strong>{user.followers}</strong> followers</span>
                              <span><strong>{user.following}</strong> following</span>
                            </div>
                          </div>
                        </button>

                        {/* Follow Button */}
                        <div className="flex gap-2 ml-4">
                          {buttonState === 'follow' && (
                            <Button
                              onClick={() => handleFollowRequest(user.email)}
                              className="gap-2"
                              variant="hero"
                            >
                              <UserPlus className="w-4 h-4" />
                              Follow
                            </Button>
                          )}
                          {buttonState === 'pending' && (
                            <Button
                              disabled
                              variant="outline"
                              className="gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Pending
                            </Button>
                          )}
                          {buttonState === 'following' && (
                            <Button
                              onClick={() => handleUnfollow(user.email)}
                              variant="outline"
                              className="gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Following
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Search for people to get started</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InfinigamExplore;
