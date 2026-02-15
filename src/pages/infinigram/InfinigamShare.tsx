import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Share2, Copy, CheckCircle, Heart, MessageCircle, Bookmark } from 'lucide-react';

interface NewPost {
  id: string;
  userId: string;
  username: string;
  userPhoto: string;
  caption: string;
  description: string;
  media: string;
  mediaType: 'image' | 'video' | 'document';
  fileName: string;
  timestamp: string;
  likes: number;
  comments: number;
  likedBy: string[];
  savedBy: string[];
}

const InfinigamShare = () => {
  const navigate = useNavigate();
  const [infinigram_user, setInfinigram_user] = useState<any>(null);
  const [newPost, setNewPost] = useState<NewPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copyLink, setCopyLink] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    setInfinigram_user(JSON.parse(storedUser));

    // Get the post data from sessionStorage (created in Task 9)
    const postDataStr = sessionStorage.getItem('newPost');
    if (!postDataStr) {
      setError('No post data found. Please fill in the details first.');
      return;
    }

    try {
      const postData = JSON.parse(postDataStr);
      setNewPost(postData);
      console.log('✅ Post loaded:', postData);
    } catch (err) {
      console.error('Error parsing post data:', err);
      setError('Failed to load post data. Please try again.');
    }
  }, [navigate]);

  const handleShare = async () => {
    if (!newPost || !infinigram_user) {
      setError('Post or user data missing');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Saving post to backend...', newPost);

      // Save post to backend
      const response = await fetch(
        `http://localhost:5000/api/infinigram/posts/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: infinigram_user.email,
            caption: newPost.caption,
            description: newPost.description,
            content: newPost.media,
            media: newPost.media,
            mediaType: newPost.mediaType,
            mediaPath: newPost.media,
            fileName: newPost.fileName
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to share post');
        setLoading(false);
        return;
      }

      console.log('✅ Post saved to backend:', data.post);

      // Update user's post count in localStorage for UI consistency
      const updatedUser = {
        ...infinigram_user
      };
      localStorage.setItem('infinigram_user', JSON.stringify(updatedUser));

      setShareSuccess(true);

      // Clear sessionStorage data
      sessionStorage.removeItem('newPost');
      sessionStorage.removeItem('recordedVideoBlob');
      sessionStorage.removeItem('uploadedFile');
      sessionStorage.removeItem('mediaType');
      sessionStorage.removeItem('fileName');
      sessionStorage.removeItem('mediaSource');

      // Navigate to home after 2 seconds
      setTimeout(() => {
        navigate('/infinigram/home');
      }, 2000);
    } catch (err) {
      console.error('Error sharing post:', err);
      setError('Failed to share post. Please try again.');
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/infinigram/post/${newPost?.id}`;
    navigator.clipboard.writeText(postUrl);
    setCopyLink(true);
    setTimeout(() => setCopyLink(false), 2000);
  };

  if (!infinigram_user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!newPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {error || 'No Post Data'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please go back and fill in the post details.
          </p>
          <Button variant="hero" onClick={() => navigate('/infinigram/create')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (shareSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="flex justify-center"
          >
            <CheckCircle className="h-24 w-24 text-green-500" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Post Shared! 🎉
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your post has been successfully published to your profile and the home feed.
            </p>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-500 dark:text-slate-500"
          >
            Redirecting to home...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Review & Share
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Preview your post before sharing to your followers
            </p>
          </div>

          {/* Post Preview */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {newPost.userPhoto ? (
                      <img
                        src={newPost.userPhoto}
                        alt={newPost.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {newPost.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {newPost.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Just now
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {/* Caption */}
                <p className="text-slate-900 dark:text-white font-semibold mb-2 text-lg">
                  {newPost.caption}
                </p>

                {/* Description */}
                {newPost.description && (
                  <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap">
                    {newPost.description}
                  </p>
                )}

                {/* Media Preview */}
                <div className="relative rounded-lg overflow-hidden bg-black mb-4">
                  {newPost.mediaType === 'image' && newPost.media ? (
                    <img
                      src={newPost.media}
                      alt="Post"
                      className="w-full h-80 object-cover"
                    />
                  ) : newPost.mediaType === 'video' && newPost.media ? (
                    <video
                      src={newPost.media}
                      controls
                      className="w-full h-80 object-cover"
                    />
                  ) : newPost.mediaType === 'document' ? (
                    <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-sm font-semibold text-slate-200 text-center break-all px-4">
                        {newPost.fileName || 'Document'}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Post Stats */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>0 likes</span>
                  <span>0 comments</span>
                </div>
              </div>

              {/* Post Actions (Preview) */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-60">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  <Heart className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Like
                  </span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  <MessageCircle className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Comment
                  </span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  <Bookmark className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Share Options */}
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Share Options
              </h3>
              <div className="space-y-3">
                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-left"
                >
                  <Copy className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">Copy Link</p>
                    <p className="text-xs text-slate-500">Share via link</p>
                  </div>
                  {copyLink && <CheckCircle className="h-5 w-5 text-green-500" />}
                </button>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="hero"
              onClick={handleShare}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Publishing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Post
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <Card className="border-0 shadow-lg bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                📢 What happens next:
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• Your post will appear on your profile</li>
                <li>• Your post will show in the home feed for your followers</li>
                <li>• Others can like, comment, and share your post</li>
                <li>• You'll earn engagement points for likes and comments</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InfinigamShare;