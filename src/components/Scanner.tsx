import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { cn } from '../lib/utils';

interface ScannerProps {
  onCapture: (image: string) => void;
  isAnalyzing: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    let isMounted = true;
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load face landmarker", err);
        if (isMounted) setError("Failed to load AI models. Please refresh.");
      }
    };
    initModel();
    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Animation Loop for Face Tracking
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;

    const renderLoop = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        faceLandmarkerRef.current &&
        overlayCanvasRef.current &&
        !isAnalyzing
      ) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          // Match canvas internal resolution to video intrinsic resolution
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const width = canvas.width;
            const height = canvas.height;

            // Calculate bounding box
            let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
            landmarks.forEach((point) => {
              if (point.x < minX) minX = point.x;
              if (point.y < minY) minY = point.y;
              if (point.x > maxX) maxX = point.x;
              if (point.y > maxY) maxY = point.y;
            });

            // Add padding to bounding box
            const padding = 0.05;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            maxX = Math.min(1, maxX + padding);
            maxY = Math.min(1, maxY + padding);

            const boxX = minX * width;
            const boxY = minY * height;
            const boxW = (maxX - minX) * width;
            const boxH = (maxY - minY) * height;

            // Draw Semi-transparent Bounding Box
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)'; // cyan-400
            ctx.lineWidth = 3;
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
            ctx.fillRect(boxX, boxY, boxW, boxH);

            // Draw Key Landmarks (Eyes, Nose, Mouth Corners)
            const keyPoints = [
              33, 133, // left eye corners
              362, 263, // right eye corners
              1, // nose tip
              61, 291, // mouth corners
            ];

            ctx.fillStyle = '#ffffff';
            keyPoints.forEach(index => {
              const pt = landmarks[index];
              if (pt) {
                ctx.beginPath();
                ctx.arc(pt.x * width, pt.y * height, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add glow
                ctx.beginPath();
                ctx.arc(pt.x * width, pt.y * height, 8, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
                ctx.fill();
                ctx.fillStyle = '#ffffff'; // reset
              }
            });

            // Draw subtle mesh points
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            landmarks.forEach((pt, i) => {
              if (!keyPoints.includes(i) && i % 3 === 0) { // draw every 3rd point to avoid clutter
                ctx.beginPath();
                ctx.arc(pt.x * width, pt.y * height, 1, 0, 2 * Math.PI);
                ctx.fill();
              }
            });
          }
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    if (isModelLoaded && stream && !isAnalyzing) {
      renderLoop();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isModelLoaded, stream, isAnalyzing]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden border-[6px] border-zinc-800 shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isAnalyzing ? "opacity-50 grayscale" : "opacity-100"
        )}
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay Canvas for Face Tracking */}
      <canvas
        ref={overlayCanvasRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-500",
          isAnalyzing ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Loading Model State */}
      {!isModelLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
          <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">LOADING AI MODELS...</p>
        </div>
      )}

      {/* Scanning Overlay */}
      <AnimatePresence>
        {!isAnalyzing && !error && isModelLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
            />
            
            {/* Corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-20"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
              <div className="absolute inset-2 border-4 border-t-cyan-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-cyan-400 font-mono text-lg tracking-widest animate-pulse">DECODING BIOMETRICS</p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["8px", "24px", "8px"] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 p-8 text-center z-30">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white font-medium mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Camera
          </button>
        </div>
      )}

      {/* Controls */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30">
          <button
            onClick={captureFrame}
            className="group relative flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 group-hover:border-cyan-400/60 animate-ping" />
            <Camera className="w-8 h-8 text-black" />
          </button>
        </div>
      )}
    </div>
  );
};
