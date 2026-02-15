import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Heart, MessageCircle, Share2, Bookmark, MoreVertical,
    User, Search
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

const InfinigamHome = () => {
    const navigate = useNavigate();
    const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingList, setFollowingList] = useState<string[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const storedUser = localStorage.getItem('infinigram_user');
                if (!storedUser) {
                    navigate('/infinigram/auth');
                    return;
                }
                const user = JSON.parse(storedUser);
                setInfinigram_user(user);

                // Fetch following list first
                try {
                    const followingResponse = await fetch(
                        `http://localhost:5000/api/infinigram/following/${encodeURIComponent(user.email)}`,
                        { method: 'GET' }
                    );

                    if (followingResponse.ok) {
                        const followingData = await followingResponse.json();
                        if (followingData.success) {
                            const followingEmails = followingData.following.map((u: any) => u.email);
                            setFollowingList(followingEmails);

                            // Fetch posts from all following users
                            const allPosts: Post[] = [];
                            for (const followingEmail of followingEmails) {
                                try {
                                    const postsResponse = await fetch(
                                        `http://localhost:5000/api/infinigram/posts/${encodeURIComponent(followingEmail)}`,
                                        { method: 'GET' }
                                    );

                                    if (postsResponse.ok) {
                                        const postsData = await postsResponse.json();
                                        if (postsData.posts && Array.isArray(postsData.posts)) {
                                            allPosts.push(...postsData.posts);
                                        }
                                    }
                                } catch (err) {
                                    console.error(`Error fetching posts from ${followingEmail}:`, err);
                                }
                            }

                            // Sort posts by timestamp (newest first)
                            allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                            setPosts(allPosts);

                            console.log('📝 Posts from following users loaded:', allPosts.length);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching following list:', err);
                }

                setLoading(false);
            } catch (error) {
                console.error('❌ Error in useEffect:', error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, [navigate]);

    const handleLike = (postId: string) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
                : post
        ));
    };

    const handleSave = (postId: string) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, saved: !post.saved }
                : post
        ));
    };

    if (!infinigram_user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header with CareerVerse Logo */}
            <div className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
                <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between gap-4">
                    {/* CareerVerse Logo */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">∞</span>
                        </div>
                        <span className="font-display font-bold text-xl text-slate-900 dark:text-white hidden sm:inline">
                            CareerVerse
                        </span>
                    </button>

                    {/* Search Bar */}
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 flex-1 max-w-md">
                        <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users, topics..."
                            className="bg-transparent flex-1 outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Welcome Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Welcome back, {infinigram_user?.username || 'User'}! 👋
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Discover posts from amazing learners and achievers in your community.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Posts Feed */}
                    {posts && posts.length > 0 ? (
                        posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="p-0">
                                        {/* Post Header */}
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                                                    {post.author?.profilePhoto || post.userPhoto ? (
                                                        <img
                                                            src={post.author?.profilePhoto || post.userPhoto || ''}
                                                            alt="User"
                                                            className="w-full h-full rounded-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <User className="h-6 w-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {post.author?.username || post.username || 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {post.timestamp || 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-5 w-5 text-slate-500" />
                                            </Button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-4">
                                            {/* Display caption if available */}
                                            {post.caption && (
                                                <p className="text-slate-900 dark:text-white font-semibold mb-2">
                                                    {post.caption}
                                                </p>
                                            )}

                                            {/* Display description if available */}
                                            {post.description && (
                                                <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                                                    {post.description}
                                                </p>
                                            )}

                                            {/* Fallback to content for demo posts */}
                                            {!post.caption && !post.description && post.content && (
                                                <p className="text-slate-900 dark:text-white mb-4 leading-relaxed">
                                                    {post.content}
                                                </p>
                                            )}

                                            {/* Media Display - New Posts with Media */}
                                            {post.media && post.mediaType && (
                                                <div className="w-full rounded-lg mb-4 overflow-hidden bg-black">
                                                    {post.mediaType === 'image' && (
                                                        <img
                                                            src={post.media}
                                                            alt="Post"
                                                            className="w-full h-80 object-cover"
                                                        />
                                                    )}
                                                    {post.mediaType === 'video' && (
                                                        <video
                                                            src={post.media}
                                                            controls
                                                            className="w-full h-80 object-cover"
                                                        />
                                                    )}
                                                    {post.mediaType === 'document' && (
                                                        <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center">
                                                            <div className="text-6xl mb-4">📄</div>
                                                            <p className="text-sm font-semibold text-slate-200 text-center break-all px-4">
                                                                {post.fileName || 'Document'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Fallback image for demo posts */}
                                            {!post.media && post.image && (
                                                <div className="w-full h-80 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                                                    <img
                                                        src={post.image}
                                                        alt="Post"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Post Stats */}
                                        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                                <span>{post.likes} likes</span>
                                                <span>{post.comments} comments</span>
                                            </div>
                                        </div>

                                        {/* Post Actions */}
                                        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
                                            >
                                                <Heart
                                                    className={`h-5 w-5 transition-colors ${post.liked
                                                        ? 'fill-red-500 text-red-500'
                                                        : 'text-slate-500 group-hover:text-red-500'
                                                        }`}
                                                />
                                                <span className={`text-sm font-medium ${post.liked ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    Like
                                                </span>
                                            </button>

                                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 group">
                                                <MessageCircle className="h-5 w-5 text-slate-500 group-hover:text-blue-500" />
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    Comment
                                                </span>
                                            </button>

                                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 group">
                                                <Share2 className="h-5 w-5 text-slate-500 group-hover:text-green-500" />
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    Share
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleSave(post.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                            >
                                                <Bookmark
                                                    className={`h-5 w-5 transition-colors ${post.saved
                                                        ? 'fill-amber-500 text-amber-500'
                                                        : 'text-slate-500 hover:text-amber-500'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                                {followingList.length === 0
                                    ? "You're not following anyone yet. Explore to find amazing people! 🔍"
                                    : "No posts from your followers yet. Check back soon! 📝"}
                            </p>
                            {followingList.length === 0 && (
                                <Button
                                    onClick={() => navigate('/infinigram/explore')}
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                                >
                                    Explore People
                                </Button>
                            )}
                        </div>
                    )}

                    {/* End of Feed */}
                    {posts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-600 dark:text-slate-400">
                                You've reached the end of the feed. More features coming soon! 🚀
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InfinigamHome;
