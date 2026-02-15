import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, File, Image, Video, X } from 'lucide-react';

const InfinigamUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [infinigram_user, setInfinigram_user] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        }
    }, [navigate]);

    // Allowed file types
    const ALLOWED_TYPES = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    // Determine file type category
    const getFileTypeCategory = (type: string) => {
        if (ALLOWED_TYPES.image.includes(type)) return 'image';
        if (ALLOWED_TYPES.video.includes(type)) return 'video';
        if (ALLOWED_TYPES.document.includes(type)) return 'document';
        return null;
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        console.log('📁 File selected:', file.name, file.type, file.size);

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large. Maximum size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        // Validate file type
        const category = getFileTypeCategory(file.type);
        if (!category) {
            setError('File type not supported. Please upload an image, video, or document.');
            return;
        }

        console.log('✅ File validated:', category);
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            console.log('✅ Preview created');
        };
        reader.readAsDataURL(file);
    };

    // Open file picker
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    // Remove selected file
    const removeFile = () => {
        setSelectedFile(null);
        setPreview('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle proceed to details
    const handleProceedToDetails = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const category = getFileTypeCategory(selectedFile.type);

            // Clear any previous recording data to avoid stale sessionStorage
            sessionStorage.removeItem('recordedVideo');
            sessionStorage.removeItem('recordedVideoBlob');

            // Read file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const fileBase64 = reader.result as string;
                    
                    // Upload file to backend
                    console.log('📤 Uploading file to backend...');
                    const uploadResponse = await fetch(
                        'http://localhost:5000/api/infinigram/upload',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileData: fileBase64,
                                fileName: selectedFile.name,
                                mediaType: selectedFile.type,
                                email: infinigram_user.email
                            })
                        }
                    );

                    const uploadData = await uploadResponse.json();

                    if (!uploadData.success) {
                        setError(uploadData.error || 'Failed to upload file');
                        setLoading(false);
                        return;
                    }

                    console.log('✅ File uploaded to backend:', uploadData.fileUrl);

                    // Save file info to sessionStorage for the create page
                    sessionStorage.setItem('uploadedFile', uploadData.fileUrl); // Store URL, not base64
                    sessionStorage.setItem('mediaType', category || 'image');
                    sessionStorage.setItem('fileName', selectedFile.name);
                    sessionStorage.setItem('mediaSource', 'upload');
                    sessionStorage.setItem('uploadedFileUrl', uploadData.fileUrl); // For reference
                    
                    console.log('✅ File info saved to sessionStorage');
                    setLoading(false);
                    navigate('/infinigram/create/details');
                } catch (storageErr) {
                    console.error('Error uploading file:', storageErr);
                    setError('Failed to upload file. Please try again.');
                    setLoading(false);
                }
            };
            reader.onerror = () => {
                console.error('FileReader error:', reader.error);
                setError('Failed to read file. Please try again.');
                setLoading(false);
            };
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    console.log(`📊 Reading file: ${percentComplete.toFixed(0)}%`);
                }
            };
            reader.readAsDataURL(selectedFile);
        } catch (err) {
            console.error('Error processing file:', err);
            setError('Failed to process file');
            setLoading(false);
        }
    };

    // Get file icon based on type
    const getFileIcon = () => {
        if (!selectedFile) return null;
        const category = getFileTypeCategory(selectedFile.type);

        if (category === 'image') {
            return <Image className="h-12 w-12 text-blue-600" />;
        }
        if (category === 'video') {
            return <Video className="h-12 w-12 text-purple-600" />;
        }
        return <File className="h-12 w-12 text-amber-600" />;
    };

    if (!infinigram_user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
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
                    className="space-y-6"
                >
                    {/* Header */}
                    <div>
                        <button
                            onClick={() => navigate('/infinigram/create')}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Upload File
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Upload images, videos, or documents to share
                        </p>
                    </div>

                    {/* Upload Area or Preview */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                        <CardContent className="p-0">
                            {selectedFile && preview ? (
                                // Show file preview
                                <div className="space-y-4 p-6">
                                    <div className="space-y-4">
                                        {getFileTypeCategory(selectedFile.type) === 'image' ? (
                                            <div className="bg-black rounded-lg overflow-hidden">
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="w-full h-96 object-cover"
                                                />
                                            </div>
                                        ) : getFileTypeCategory(selectedFile.type) === 'video' ? (
                                            <div className="bg-black rounded-lg overflow-hidden">
                                                <video
                                                    src={preview}
                                                    controls
                                                    className="w-full h-96 object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-12 flex flex-col items-center justify-center h-96">
                                                <File className="h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white text-center break-all">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                <span className="font-semibold">File:</span> {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                <span className="font-semibold">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                <span className="font-semibold">Type:</span> {getFileTypeCategory(selectedFile.type)?.charAt(0).toUpperCase() + getFileTypeCategory(selectedFile.type)?.slice(1)}
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={removeFile}
                                                className="flex-1"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Choose Different
                                            </Button>
                                            <Button
                                                variant="hero"
                                                onClick={handleProceedToDetails}
                                                disabled={loading}
                                                className="flex-1"
                                            >
                                                {loading ? 'Processing...' : 'Continue'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Upload prompt
                                <div className="p-12">
                                    <div
                                        onClick={openFilePicker}
                                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                            Drag and drop your file here
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            or click to browse
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">
                                            Supported: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM, MOV), Documents (PDF, DOC, DOCX)
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                            Maximum file size: 100 MB
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Box */}
                    <Card className="border-0 shadow-lg bg-blue-50/50 dark:bg-blue-900/20">
                        <CardContent className="p-6">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                                📋 File Guidelines:
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                <li>• <span className="font-semibold">Images:</span> JPG, PNG, GIF, WebP (max 100MB)</li>
                                <li>• <span className="font-semibold">Videos:</span> MP4, WebM, MOV (max 100MB)</li>
                                <li>• <span className="font-semibold">Documents:</span> PDF, DOC, DOCX (max 100MB)</li>
                                <li>• Keep file sizes reasonable for better performance</li>
                                <li>• You'll be able to add captions before posting</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default InfinigamUpload;