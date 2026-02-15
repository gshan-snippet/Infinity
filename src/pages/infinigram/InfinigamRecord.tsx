import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Square, Pause, RotateCcw, Check } from 'lucide-react';

const InfinigamRecord = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const [infinigram_user, setInfinigram_user] = useState<any>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('infinigram_user');
        if (!storedUser) {
            navigate('/infinigram/auth');
            return;
        }
        setInfinigram_user(JSON.parse(storedUser));
    }, [navigate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // Initialize camera
    const initializeCamera = async () => {
        console.log('📌 initializeCamera called');
        setLoading(true);
        setError('');

        try {
            console.log('🎥 Requesting camera access...');

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            console.log('✅ Stream received:', stream);
            streamRef.current = stream;

            // Check if videoRef exists
            if (!videoRef.current) {
                console.error('❌ videoRef.current is null');
                setError('Video element not found');
                setLoading(false);
                return;
            }

            console.log('✅ videoRef.current exists');
            videoRef.current.srcObject = stream;
            console.log('✅ Stream assigned to video element');

            // Give it a moment to attach
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to play
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ Video playing successfully');
                    })
                    .catch(err => {
                        console.error('❌ Play error:', err);
                    });
            }

            // Set camera active immediately after assigning stream
            setCameraActive(true);
            setLoading(false);
            console.log('✅ Camera active state set to true, loading set to false');

        } catch (err) {
            console.error('❌ Camera error:', err);
            setLoading(false);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to access camera. Please check permissions.'
            );
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setCameraActive(false);
        }
    };

    // Start recording
    const startRecording = async () => {
        try {
            if (!streamRef.current) {
                setError('Camera stream not available');
                return;
            }

            chunksRef.current = [];

            // Check supported mime types
            const mimeTypes = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm',
                'video/mp4'
            ];

            let selectedMimeType = '';
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }

            if (!selectedMimeType) {
                setError('Your browser does not support video recording');
                return;
            }

            console.log('📹 Using mime type:', selectedMimeType);

            const mediaRecorder = new MediaRecorder(streamRef.current, {
                mimeType: selectedMimeType
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: selectedMimeType });
                setRecordedBlob(blob);
                setIsRecording(false);
                console.log('✅ Recording stopped, blob size:', blob.size);
            };

            mediaRecorder.onerror = (event) => {
                console.error('Recording error:', event.error);
                setError(`Recording failed: ${event.error}`);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(0);

            console.log('🔴 Recording started');

            // Timer
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Start recording error:', err);
            setError('Failed to start recording');
        }
    };

    // Pause recording
    const pauseRecording = () => {
        if (mediaRecorderRef.current) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
            } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
    };

    // Reset recording
    const resetRecording = () => {
        setRecordedBlob(null);
        setRecordingTime(0);
        setIsRecording(false);
        setIsPaused(false);
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle proceed to details
    const handleProceedToDetails = async () => {
        if (recordedBlob) {
            stopCamera();

            // Clear any previous upload data to avoid stale sessionStorage
            sessionStorage.removeItem('uploadedFile');
            sessionStorage.removeItem('fileName');

            // Convert blob to base64 and upload to backend
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const fileBase64 = reader.result as string;
                    console.log('📹 Video blob type:', recordedBlob.type);
                    console.log('📹 Base64 string length:', fileBase64.length);
                    console.log('📹 Base64 preview:', fileBase64.substring(0, 100) + '...');
                    
                    // Generate filename for the video
                    const timestamp = Date.now();
                    const videoFileName = `recorded_${timestamp}.webm`;
                    
                    // Upload file to backend
                    console.log('📤 Uploading recorded video to backend...');
                    const uploadResponse = await fetch(
                        'http://localhost:5000/api/infinigram/upload',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileData: fileBase64,
                                fileName: videoFileName,
                                mediaType: recordedBlob.type || 'video/webm',
                                email: infinigram_user.email
                            })
                        }
                    );

                    const uploadData = await uploadResponse.json();

                    if (!uploadData.success) {
                        console.error('Upload failed:', uploadData.error);
                        // Fallback to blob URL if upload fails
                        const blobUrl = URL.createObjectURL(recordedBlob);
                        sessionStorage.setItem('recordedVideoBlob', blobUrl);
                        sessionStorage.setItem('recordedVideoMimeType', recordedBlob.type);
                        sessionStorage.setItem('mediaType', 'video');
                        sessionStorage.setItem('mediaSource', 'record');
                        navigate('/infinigram/create/details');
                        return;
                    }

                    console.log('✅ Video uploaded to backend:', uploadData.fileUrl);

                    // Store file URL in sessionStorage
                    sessionStorage.setItem('uploadedFile', uploadData.fileUrl);
                    sessionStorage.setItem('mediaType', 'video');
                    sessionStorage.setItem('mediaSource', 'record');
                    sessionStorage.setItem('fileName', videoFileName);
                    sessionStorage.setItem('uploadedFileUrl', uploadData.fileUrl);

                    navigate('/infinigram/create/details');
                } catch (err) {
                    console.error('Error uploading video:', err);
                    // Fallback to blob URL if upload fails
                    const blobUrl = URL.createObjectURL(recordedBlob);
                    sessionStorage.setItem('recordedVideoBlob', blobUrl);
                    sessionStorage.setItem('recordedVideoMimeType', recordedBlob.type);
                    sessionStorage.setItem('mediaType', 'video');
                    sessionStorage.setItem('mediaSource', 'record');
                    navigate('/infinigram/create/details');
                }
            };
            reader.readAsDataURL(recordedBlob);
        }
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
                            onClick={() => {
                                stopCamera();
                                navigate('/infinigram/create');
                            }}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Record Video
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Record directly from your camera
                        </p>
                    </div>

                    {/* Video Preview or Start */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                        <CardContent className="p-0">
                            {recordedBlob ? (
                                // Show recorded video preview
                                <div className="space-y-4 p-6">
                                    <div className="bg-black rounded-lg overflow-hidden">
                                        <video
                                            src={URL.createObjectURL(recordedBlob)}
                                            controls
                                            className="w-full h-96 object-cover"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Recording duration: <span className="font-semibold">{formatTime(recordingTime)}</span>
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={resetRecording}
                                                className="flex-1"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Record Again
                                            </Button>
                                            <Button
                                                variant="hero"
                                                onClick={handleProceedToDetails}
                                                className="flex-1"
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Continue
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Always render video element - keeps ref available
                                <div className="space-y-4 p-6">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-96 bg-black rounded-lg object-cover ${!cameraActive ? 'opacity-0 pointer-events-none absolute' : ''
                                            }`}
                                    />

                                    {!cameraActive && !isRecording && (
                                        <div className="p-12 text-center space-y-4">
                                            <div className="text-slate-400 dark:text-slate-600">
                                                <svg className="h-24 w-24 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h10a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Ready to Record?
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                                Click below to request camera access and start recording your video
                                            </p>
                                            {error && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm">
                                                    {error}
                                                </div>
                                            )}
                                            <Button
                                                variant="hero"
                                                size="lg"
                                                onClick={initializeCamera}
                                                disabled={loading}
                                                className="w-full"
                                            >
                                                {loading ? 'Requesting Access...' : 'Enable Camera'}
                                            </Button>
                                        </div>
                                    )}

                                    {cameraActive && !isRecording && (
                                        <Button
                                            variant="hero"
                                            size="lg"
                                            onClick={startRecording}
                                            className="w-full"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Recording
                                        </Button>
                                    )}

                                    {isRecording && (
                                        <>
                                            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                                                    <span className="font-semibold text-red-600 dark:text-red-400">
                                                        Recording: {formatTime(recordingTime)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={pauseRecording}
                                                    className="flex-1"
                                                >
                                                    {isPaused ? (
                                                        <>
                                                            <Play className="h-4 w-4 mr-2" />
                                                            Resume
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pause className="h-4 w-4 mr-2" />
                                                            Pause
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={stopRecording}
                                                    className="flex-1"
                                                >
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Stop Recording
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Box */}
                    <Card className="border-0 shadow-lg bg-blue-50/50 dark:bg-blue-900/20">
                        <CardContent className="p-6">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                                💡 Recording Tips:
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                <li>• Ensure good lighting for better video quality</li>
                                <li>• Check your microphone is working</li>
                                <li>• Keep the video under 60 seconds for better performance</li>
                                <li>• You can pause, resume, and stop at any time</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default InfinigamRecord;