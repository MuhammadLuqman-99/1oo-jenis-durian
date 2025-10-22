'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw, Image as ImageIcon, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  maxPhotos?: number;
  currentPhotoCount?: number;
}

export default function CameraCapture({
  onCapture,
  onClose,
  maxPhotos = 5,
  currentPhotoCount = 0
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);

      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Unable to access camera. Please try again.');
      }
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const canTakeMore = currentPhotoCount < maxPhotos;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
        <button
          onClick={handleClose}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-white font-semibold">
          Take Photo ({currentPhotoCount}/{maxPhotos})
        </h2>
        {hasPermission && !capturedImage && (
          <button
            onClick={switchCamera}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <RotateCw size={24} />
          </button>
        )}
        {capturedImage && <div className="w-10" />}
      </div>

      {/* Camera View / Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-center p-8 max-w-md">
            <Camera size={64} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Camera Error</h3>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={startCamera}
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="bg-black/50 backdrop-blur-sm p-6">
          {capturedImage ? (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={retakePhoto}
                className="flex-1 max-w-xs bg-white/10 text-white px-6 py-4 rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={confirmCapture}
                disabled={!canTakeMore}
                className={`flex-1 max-w-xs px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                  canTakeMore
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                <Check size={20} />
                <span>{canTakeMore ? 'Use Photo' : 'Max Photos Reached'}</span>
              </button>
            </div>
          ) : hasPermission && (
            <div className="flex flex-col items-center">
              <button
                onClick={capturePhoto}
                disabled={!canTakeMore}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  canTakeMore
                    ? 'border-white bg-white hover:bg-gray-200 hover:scale-110'
                    : 'border-gray-600 bg-gray-600 cursor-not-allowed'
                }`}
              >
                <div className={`w-16 h-16 rounded-full ${canTakeMore ? 'bg-white' : 'bg-gray-500'}`} />
              </button>
              <p className="text-white/60 text-sm mt-4">
                Tap to capture
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {!error && !capturedImage && hasPermission && (
        <div className="absolute bottom-32 left-0 right-0 px-6">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
            <p className="text-white text-sm text-center">
              💡 Tip: Hold phone steady and ensure good lighting for best results
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
