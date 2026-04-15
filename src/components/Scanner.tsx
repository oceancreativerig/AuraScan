import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, ShieldAlert, Loader2, Upload, ExternalLink, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { getFaceLandmarker } from '../services/visionService';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [brightness, setBrightness] = useState<number>(255);
  const [faceStatus, setFaceStatus] = useState<'none' | 'too_far' | 'too_close' | 'optimal'>('none');
  const { t } = useLanguage();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    let isMounted = true;
    const initModel = async () => {
      try {
        const landmarker = await getFaceLandmarker();
        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load face landmarker", err);
        if (isMounted) setError(t("Failed to load AI models. Please refresh."));
      }
    };
    initModel();
    return () => {
      isMounted = false;
      // We don't close the landmarker here because it's managed by the singleton service
      // This allows faster re-mounting of the Scanner component
    };
  }, [t]);

  const startCamera = async () => {
    // Stop existing stream before starting a new one
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      const isIframe = window.self !== window.top;
      setError(isIframe 
        ? t("Camera access is restricted in this preview. Please try opening the app in a new tab or uploading a photo manually.")
        : t("Camera access denied. Please ensure you have granted permission in your browser settings."));
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t, facingMode]);

  // Animation Loop for Face Tracking and Brightness Check
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let brightnessCheckCounter = 0;

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

          // Periodic Brightness Check (every 30 frames)
          brightnessCheckCounter++;
          if (brightnessCheckCounter >= 30) {
            brightnessCheckCounter = 0;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 40;
            tempCanvas.height = 40;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(video, 0, 0, 40, 40);
              const imageData = tempCtx.getImageData(0, 0, 40, 40).data;
              let totalLuminance = 0;
              for (let i = 0; i < imageData.length; i += 4) {
                // Standard luminance formula
                totalLuminance += (0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
              }
              setBrightness(totalLuminance / (40 * 40));
            }
          }

          try {
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

              // Face Distance/Position Validation
              const faceArea = (maxX - minX) * (maxY - minY);
              if (faceArea < 0.15) {
                setFaceStatus('too_far');
              } else if (faceArea > 0.6) {
                setFaceStatus('too_close');
              } else {
                setFaceStatus('optimal');
              }

              // Draw Semi-transparent Bounding Box
              ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)'; // teal-400
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(boxX, boxY, boxW, boxH);
              ctx.setLineDash([]);
              
              // Draw corners of bounding box
              ctx.strokeStyle = '#2dd4bf';
              ctx.lineWidth = 4;
              const cornerSize = 20;
              // Top Left
              ctx.beginPath(); ctx.moveTo(boxX, boxY + cornerSize); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerSize, boxY); ctx.stroke();
              // Top Right
              ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerSize, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerSize); ctx.stroke();
              // Bottom Left
              ctx.beginPath(); ctx.moveTo(boxX, boxY + boxH - cornerSize); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerSize, boxY + boxH); ctx.stroke();
              // Bottom Right
              ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerSize, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerSize); ctx.stroke();

              ctx.fillStyle = 'rgba(45, 212, 191, 0.05)';
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
                  ctx.arc(pt.x * width, pt.y * height, 2, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  // Add subtle glow
                  ctx.beginPath();
                  ctx.arc(pt.x * width, pt.y * height, 6, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
                  ctx.fill();
                  ctx.fillStyle = '#ffffff'; // reset
                }
              });

              // Draw data labels near landmarks
              ctx.font = '10px JetBrains Mono';
              ctx.fillStyle = '#2dd4bf';
              const nose = landmarks[1];
              if (nose) {
                ctx.fillText(`X: ${nose.x.toFixed(3)}`, nose.x * width + 10, nose.y * height - 10);
                ctx.fillText(`Y: ${nose.y.toFixed(3)}`, nose.x * width + 10, nose.y * height);
              }

              // Draw subtle mesh points
              ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
              landmarks.forEach((pt, i) => {
                if (!keyPoints.includes(i) && i % 4 === 0) { // draw every 4th point
                  ctx.beginPath();
                  ctx.arc(pt.x * width, pt.y * height, 0.8, 0, 2 * Math.PI);
                  ctx.fill();
                }
              });
            }
          } catch (e) {
            console.error("Face detection error:", e);
          }
        }
      } else if (!isAnalyzing) {
        setFaceStatus('none');
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
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] sm:aspect-[9/16] bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-4 sm:border-[8px] border-[var(--border-color)] shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isAnalyzing ? "opacity-40 grayscale" : "opacity-100"
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

      {/* Face Guide Oval */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className={cn(
            "w-[70%] aspect-[3/4] rounded-[100%] border-2 border-dashed transition-all duration-500",
            faceStatus === 'optimal' ? "border-teal-400/80 bg-teal-400/5 shadow-[0_0_30px_rgba(45,212,191,0.2)]" : 
            faceStatus === 'none' ? "border-slate-500/30" : "border-rose-400/50 bg-rose-400/5"
          )} />
        </div>
      )}

      {/* Status Overlay */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-2 z-30 px-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "px-4 py-2 rounded-full backdrop-blur-md border text-[10px] font-mono uppercase tracking-widest flex items-center gap-2",
              brightness < 70 || faceStatus !== 'optimal'
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                : "bg-[var(--accent-teal-soft)] border-[var(--accent-teal-border)] text-[var(--accent-teal)]"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              brightness < 70 || faceStatus !== 'optimal' ? "bg-rose-500" : "bg-[var(--accent-teal)]"
            )} />
            {brightness < 70 ? t("Warning: Environment too dark") : 
             faceStatus === 'none' ? t("Position face in guide") :
             faceStatus === 'too_far' ? t("Move closer") :
             faceStatus === 'too_close' ? t("Move further back") :
             t("Optimal position & lighting")}
          </motion.div>

          {/* Ambient Light Meter */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-2 text-[9px] font-mono text-white uppercase tracking-widest drop-shadow-md">
              <Sun className={cn("w-3 h-3", brightness < 70 ? "text-rose-400" : "text-teal-400")} />
              {t('Ambient Light')}
            </div>
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                animate={{ 
                  width: `${Math.min(100, (brightness / 255) * 100)}%`,
                  backgroundColor: brightness < 70 ? '#f43f5e' : brightness < 150 ? '#fbbf24' : '#2dd4bf'
                }}
                className="h-full shadow-[0_0_8px_rgba(45,212,191,0.5)]"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading Model State */}
      {!isModelLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-main)]/80 backdrop-blur-sm z-20">
          <Loader2 className="w-10 h-10 text-[var(--accent-teal)] animate-spin mb-4" />
          <p className="text-[var(--accent-teal)] font-mono text-sm tracking-widest animate-pulse">{t('INITIALIZING BIOMETRIC ENGINE...')}</p>
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
              className="absolute left-0 right-0 h-0.5 bg-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.8)] z-10"
            />
            
            {/* Corners */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t border-l border-teal-400/40 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-10 h-10 border-t border-r border-teal-400/40 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b border-l border-teal-400/40 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b border-r border-teal-400/40 rounded-br-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-main)]/80 backdrop-blur-md z-20"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-[var(--accent-teal)]/20 rounded-full animate-ping" />
              <div className="absolute inset-2 border-4 border-t-[var(--accent-teal)] border-r-transparent border-b-sky-500 border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[var(--text-primary)] animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[var(--accent-teal)] font-mono text-lg tracking-widest animate-pulse">{t('DECODING BIOMETRICS')}</p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["8px", "24px", "8px"] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-[var(--accent-teal)] rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-card)] p-8 text-center z-30">
          <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
          <p className="text-[var(--text-primary)] font-medium mb-2 text-sm">{error}</p>
          <p className="text-[var(--text-secondary)] text-xs mb-6 leading-relaxed">
            {t('If you are in a private browser or iframe, you may need to upload a photo manually.')}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[220px]">
            {window.self !== window.top && (
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                {t('Open in New Tab')}
              </button>
            )}

            <button
              onClick={startCamera}
              className="w-full px-4 py-2.5 bg-[var(--accent-teal)] hover:opacity-90 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {t('Retry Camera')}
            </button>
            
            <div className="relative w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <button className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl transition-colors flex items-center justify-center gap-2 border border-[var(--border-color)] text-sm font-medium">
                <Upload className="w-4 h-4" />
                {t('Upload Photo Instead')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-30">
          {brightness < 70 && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-400 text-[10px] font-mono uppercase tracking-widest bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-rose-500/30"
            >
              {t('Too dark for accurate scan')}
            </motion.p>
          )}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleCamera}
              className="w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-all active:scale-90"
              title={t('Switch Camera')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={captureFrame}
              className={cn(
                "group relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all",
                brightness < 70 || faceStatus !== 'optimal' ? "bg-slate-800 cursor-not-allowed" : "bg-white hover:scale-110 active:scale-95"
              )}
              disabled={brightness < 70 || faceStatus !== 'optimal'}
            >
              <div className={cn(
                "absolute inset-0 rounded-full border-4 animate-ping",
                brightness < 70 || faceStatus !== 'optimal' ? "border-rose-500/10" : "border-teal-400/30 group-hover:border-teal-400/60"
              )} />
              <Camera className={cn("w-8 h-8", brightness < 70 || faceStatus !== 'optimal' ? "text-slate-600" : "text-slate-900")} />
            </button>

            <div className="w-12" /> {/* Spacer to balance the switch button */}
          </div>
        </div>
      )}
    </div>
  );
};
