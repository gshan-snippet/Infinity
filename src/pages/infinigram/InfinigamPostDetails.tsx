import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, X, Image as ImageIcon, Video as VideoIcon, File as FileIcon } from 'lucide-react';

const InfinigamPostDetails = () => {
    const navigate = useNavigate();

    const [infinigram_user, setInfinigram_user] = useState<any>(null);
    const [caption, setCaption] = useState('');
    const [description, setDescription] = useState('');
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'video' | 'image' | 'document' | null>(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('infinigram_user');
        if (!storedUser) {
          navigate('/infinigram/auth');
          return;
        }
        
        try {
          setInfinigram_user(JSON.parse(storedUser));
        } catch (err) {
          console.error('Error parsing user data:', err);
          navigate('/infinigram/auth');
          return;
        }

        // Get media from sessionStorage (from Task 7 or Task 8)
        const recordedVideoBlob = sessionStorage.getItem('recordedVideoBlob');
        const uploadedFile = sessionStorage.getItem('uploadedFile');
        const uploadedFileUrl = sessionStorage.getItem('uploadedFileUrl');
        const mediaTypeFromSession = sessionStorage.getItem('mediaType');
        const mediaSourceFromSession = sessionStorage.getItem('mediaSource');
        const fileNameFromSession = sessionStorage.getItem('fileName');

        let foundMediaType: 'video' | 'image' | 'document' | null = null;
        let foundMedia: string | null = null;

        console.log('🔍 Checking sessionStorage for media...');

        // Determine which media to use based on source indicator
        if ((uploadedFileUrl || uploadedFile) && mediaSourceFromSession === 'upload') {
          console.log('📁 Found uploaded file');
          // Use the file URL from server if available, otherwise use the uploadedFile
          foundMedia = uploadedFileUrl || uploadedFile;
          foundMediaType = (mediaTypeFromSession as any) || 'image';
          setDebugInfo(`File uploaded: type: ${foundMediaType}, url: ${uploadedFileUrl ? 'server' : 'base64'}`);

          if (fileNameFromSession) {
            setFileName(fileNameFromSession);
          }
        } else if ((uploadedFileUrl || recordedVideoBlob) && mediaSourceFromSession === 'record') {
          console.log('📹 Found recorded video');
          foundMedia = uploadedFileUrl || recordedVideoBlob;
          foundMediaType = 'video';
          setDebugInfo(`Video recorded: ${uploadedFileUrl ? 'server' : 'base64'} format`);
        } else if (uploadedFile || recordedVideoBlob) {
          console.log('📁 Found media (fallback)');
          foundMedia = uploadedFile || recordedVideoBlob;
          foundMediaType = (mediaTypeFromSession as any) || 'video';
          setDebugInfo(`Media found: ${foundMediaType}`);

          if (fileNameFromSession) {
            setFileName(fileNameFromSession);
          }
        } else {
          console.error('❌ No media found in sessionStorage');
          setError('No media found. Please record or upload a file first.');
          setDebugInfo('No media in sessionStorage');
          return;
        }

        // Set the preview
        if (foundMedia) {
          console.log('✅ Setting media preview, type:', foundMediaType);
          setMediaPreview(foundMedia);
          setMediaType(foundMediaType);
        }
      }, [navigate]);

    // Validate form
    const validateForm = () => {
        if (!caption.trim()) {
            setError('Caption is required');
            return false;
        }
        if (caption.trim().length < 3) {
            setError('Caption must be at least 3 characters');
            return false;
        }
        if (!mediaPreview) {
            setError('No media found. Please go back and record/upload a file.');
            return false;
        }
        return true;
    };

    // Handle post creation
    const handleCreatePost = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Creating post with mediaType:', mediaType);

            // Store post data in sessionStorage to be retrieved by Task 10
            const postData = {
                id: Date.now().toString(),
                userId: infinigram_user?.id,
                username: infinigram_user?.username,
                userPhoto: infinigram_user?.profilePhoto || '',
                caption: caption.trim(),
                description: description.trim(),
                media: mediaPreview,
                mediaType: mediaType,
                fileName: fileName,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: 0,
                likedBy: [],
                savedBy: []
            };

            console.log('✅ Post data prepared, mediaType:', postData.mediaType);
            sessionStorage.setItem('newPost', JSON.stringify(postData));

            // Clear previous media data
            sessionStorage.removeItem('recordedVideo');
            sessionStorage.removeItem('uploadedFile');
            sessionStorage.removeItem('mediaType');
            sessionStorage.removeItem('fileName');

            // Navigate to Task 10 (Share/Publish page)
            navigate('/infinigram/create/share');
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post. Please try again.');
            setLoading(false);
        }
    };

    if (!infinigram_user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        );
    }

    // Show loading/error state if no media
    if (!mediaPreview || !mediaType) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        No Media Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Please record a video or upload a file first.
                    </p>
                    {debugInfo && (
                        <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded text-xs text-slate-700 dark:text-slate-300 break-all">
                            {debugInfo}
                        </div>
                    )}
                    <Button variant="hero" onClick={() => navigate('/infinigram/create')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
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
                            Post Details
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Add caption and description to your post
                        </p>
                    </div>

                    {/* Media Preview */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="space-y-4 p-6">
                                {/* Media Display */}
                                <div className="relative rounded-lg overflow-hidden bg-black">
                                    {mediaType === 'image' && mediaPreview ? (
                                        <img
                                            key="image-preview"
                                            src={mediaPreview}
                                            alt="Post preview"
                                            className="w-full h-80 object-cover"
                                            onError={() => {
                                                console.error('❌ Image failed to load');
                                                console.error('Image src starts with:', mediaPreview.substring(0, 50));
                                            }}
                                            onLoad={() => {
                                                console.log('✅ Image loaded successfully');
                                            }}
                                        />
                                    ) : mediaType === 'video' && mediaPreview ? (
                                        <div key="video-preview" className="w-full h-80 bg-black">
                                            <video
                                                src={mediaPreview}
                                                controls
                                                controlsList="nodownload"
                                                className="w-full h-full object-cover"
                                                onLoadedMetadata={() => {
                                                    console.log('✅ Video metadata loaded');
                                                }}
                                                onCanPlay={() => {
                                                    console.log('✅ Video can play');
                                                }}
                                                onError={(e: any) => {
                                                    console.error('❌ Video failed to load:', e);
                                                    console.error('Video src starts with:', mediaPreview.substring(0, 50));
                                                }}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    ) : mediaType === 'document' ? (
                                        <div key="doc-preview" className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center">
                                            <FileIcon className="h-16 w-16 text-slate-400 mb-4" />
                                            <p className="text-sm font-semibold text-slate-200 text-center break-all px-4">
                                                {fileName || 'Document'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                Document preview not available
                                            </p>
                                        </div>
                                    ) : (
                                        <div key="unknown-preview" className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                            <p className="text-slate-400">Unknown media type: {mediaType}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Media Info */}
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    {mediaType === 'image' && <ImageIcon className="h-4 w-4 text-blue-500" />}
                                    {mediaType === 'video' && <VideoIcon className="h-4 w-4 text-purple-500" />}
                                    {mediaType === 'document' && <FileIcon className="h-4 w-4 text-amber-500" />}
                                    <span className="capitalize font-semibold">{mediaType || 'Unknown'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Form */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Caption */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Caption <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => {
                                            setCaption(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Add a catchy caption for your post..."
                                        maxLength={150}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-500">
                                            Make it catchy and descriptive
                                        </p>
                                        <span className="text-xs text-slate-500 dark:text-slate-500">
                                            {caption.length}/150
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Description <span className="text-slate-500">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Add more details about your post... You can share your thoughts, tips, or insights here."
                                        maxLength={500}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-500">
                                            Share more context and details
                                        </p>
                                        <span className="text-xs text-slate-500 dark:text-slate-500">
                                            {description.length}/500
                                        </span>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm flex items-start gap-3"
                                    >
                                        <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
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
                                        onClick={handleCreatePost}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Continue to Share
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips Box */}
                    <Card className="border-0 shadow-lg bg-blue-50/50 dark:bg-blue-900/20">
                        <CardContent className="p-6">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                                ✍️ Writing Tips:
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                <li>• <span className="font-semibold">Caption:</span> Keep it short and catchy (aim for 20-150 characters)</li>
                                <li>• <span className="font-semibold">Description:</span> Share your insights, tips, or the story behind the post</li>
                                <li>• Be clear and engaging to attract more views and comments</li>
                                <li>• You can add hashtags or mentions in your caption</li>
                                <li>• Double-check spelling before posting</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default InfinigamPostDetails;