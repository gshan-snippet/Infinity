import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, Mail, Calendar, Edit2, Grid3X3, Users, UserCheck, 
  LogOut, Settings, MessageCircle, MoreVertical, Heart, Bookmark
} from 'lucide-react';

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

interface Post {
  id: string;
  userId?: string;
  username?: string;
  userPhoto?: string;
  author?: {
    id: string;
    username: string;
    profilePhoto: string;
  };
  caption?: string;
  description?: string;
  content?: string;
  media?: string;
  mediaType?: 'image' | 'video' | 'document';
  image?: string;
  fileName?: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  likedBy?: string[];
  savedBy?: string[];
}

const InfinigamProfile = () => {
  const navigate = useNavigate();
  const { email: otherUserEmail } = useParams();
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [currentUser, setCurrentUser] = useState<InfinigamUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('infinigram_user');
        if (!storedUser) {
          navigate('/infinigram/auth');
          return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        // Determine which user profile to show
        const profileEmail = otherUserEmail ? decodeURIComponent(otherUserEmail) : user.email;
        const isOwn = profileEmail === user.email;
        setIsOwnProfile(isOwn);

        // Fetch user profile from backend
        try {
          const profileResponse = await fetch(
            `http://localhost:5000/api/infinigram/profile/${encodeURIComponent(profileEmail)}`,
            { method: 'GET' }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success) {
              setInfinigram_user(profileData.profile);
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }

        // Check if current user is following this user
        if (!isOwn) {
          try {
            const followingResponse = await fetch(
              `http://localhost:5000/api/infinigram/following/${encodeURIComponent(user.email)}`,
              { method: 'GET' }
            );
            if (followingResponse.ok) {
              const followingData = await followingResponse.json();
              if (followingData.success) {
                const isFollowingUser = followingData.following.some(
                  (f: any) => f.email === profileEmail
                );
                setIsFollowing(isFollowingUser);
              }
            }
          } catch (err) {
            console.error('Error checking follow status:', err);
          }
        }

        // Fetch user posts from backend
        try {
          const response = await fetch(
            `http://localhost:5000/api/infinigram/posts/${encodeURIComponent(profileEmail)}`,
            { method: 'GET' }
          );

          let userPosts: Post[] = [];
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.posts) {
              userPosts = data.posts;
              console.log('✅ User posts fetched from backend:', userPosts.length);
            }
          } else {
            console.log('ℹ️ No posts found on backend yet');
          }

          setUserPosts(userPosts);
          setLoading(false);
        } catch (err) {
          console.error('⚠️ Error fetching posts from backend:', err);
          setUserPosts([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in useEffect:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, otherUserEmail]);

  const handleEditProfile = () => {
    navigate('/infinigram/edit-profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('infinigram_user');
    navigate('/infinigram/auth');
  };

  const handleFollowRequest = async () => {
    if (!currentUser || !infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: currentUser.email,
          toEmail: infinigram_user.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsFollowing(true);
      } else {
        console.error('Follow request failed:', data.error);
      }
    } catch (err) {
      console.error('Follow request error:', err);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: currentUser.email,
          toEmail: infinigram_user.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsFollowing(false);
      } else {
        console.error('Unfollow failed:', data.error);
      }
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  if (!infinigram_user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(infinigram_user.dob);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header with Actions */}
      <div className="bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/20 dark:border-slate-700/20 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {infinigram_user.username}
          </h1>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/infinigram/home')}
                  title="Go to Home"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/infinigram/settings')}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Info Section */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 flex-shrink-0">
                    {infinigram_user.profilePhoto ? (
                      <img
                        src={infinigram_user.profilePhoto}
                        alt={infinigram_user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                      className="w-full md:w-auto flex items-center justify-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 space-y-6">
                  {/* Username and Bio */}
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {infinigram_user.username}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Consumer • {age} years old
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {userPosts.length}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {infinigram_user.followers}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {infinigram_user.following}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Following</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {isOwnProfile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 flex-1"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={isFollowing ? 'outline' : 'hero'}
                          size="sm"
                          onClick={() => isFollowing ? handleUnfollow() : handleFollowRequest()}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Following
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details Info */}
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Username</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{infinigram_user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{infinigram_user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Date of Birth</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(infinigram_user.dob).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">User Type</p>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">
                        {infinigram_user.userType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Posts ({userPosts.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-600 dark:text-slate-400">Loading posts...</p>
                </div>
              ) : userPosts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {userPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group rounded-lg overflow-hidden cursor-pointer"
                    >
                      {/* Post Media */}
                      <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                        {post.mediaType === 'image' && post.media ? (
                          <img
                            src={post.media}
                            alt={post.caption || 'Post'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : post.mediaType === 'video' && post.media ? (
                          <div className="w-full h-full bg-black relative flex items-center justify-center">
                            <video
                              src={post.media}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all">
                              <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full group-hover:bg-white transition-all">
                                <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : post.mediaType === 'document' ? (
                          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📄</div>
                              <p className="text-xs text-slate-300 text-center break-all px-2">
                                {post.fileName || 'Document'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-300 dark:bg-slate-700" />
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Heart className="h-6 w-6" />
                          <span className="text-sm font-semibold">{post.likes}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-white">
                          <MessageCircle className="h-6 w-6" />
                          <span className="text-sm font-semibold">{post.comments}</span>
                        </div>
                      </div>

                      {/* Post Caption */}
                      <div className="mt-3 px-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {post.caption || 'Untitled Post'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {post.likes} likes
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No posts yet</p>
                    {isOwnProfile && (
                      <Button 
                        variant="hero"
                        size="sm"
                        onClick={() => navigate('/infinigram/create')}
                      >
                        Create your first post
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InfinigamProfile;
