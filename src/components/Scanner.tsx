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
      // Use more flexible constraints to avoid issues on some devices
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      console.error("Camera access error:", err);
      
      let errorMessage = t("Camera access denied. Please ensure you have granted permission in your browser settings.");
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = t("Camera permission was denied. Please click the camera icon in your browser address bar to allow access, then click Retry.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = t("No camera found on this device.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = t("Camera is already in use by another application.");
      }

      const isIframe = window.self !== window.top;
      if (isIframe && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        errorMessage = t("Camera access is restricted in the preview iframe. Please click 'Open in New Tab' below to use your camera, or upload a photo manually.");
      }

      setError(errorMessage);
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

              // Draw Key Features (Eyes, Nose, Mouth) with different styles
              const drawPath = (indices: number[], color: string, lineWidth: number = 2, close: boolean = true) => {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                
                indices.forEach((index, i) => {
                  const pt = landmarks[index];
                  if (pt) {
                    if (i === 0) ctx.moveTo(pt.x * width, pt.y * height);
                    else ctx.lineTo(pt.x * width, pt.y * height);
                  }
                });
                
                if (close) ctx.closePath();
                ctx.stroke();
                
                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;
                ctx.stroke();
                ctx.shadowBlur = 0; // reset
              };

              // Left Eye
              drawPath([33, 160, 158, 133, 153, 144], '#2dd4bf', 2);
              // Right Eye
              drawPath([362, 385, 387, 263, 373, 380], '#2dd4bf', 2);
              // Lips Outer
              drawPath([61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146], '#f43f5e', 2.5);
              // Nose Bridge
              drawPath([168, 6, 197, 195, 5], '#fbbf24', 2, false);
              // Nose Bottom
              drawPath([98, 2, 327], '#fbbf24', 2, false);

              // Draw Key Landmark Points (Corners)
              const keyPoints = [
                33, 133, // left eye corners
                362, 263, // right eye corners
                1, // nose tip
                61, 291, // mouth corners
              ];

              keyPoints.forEach(index => {
                const pt = landmarks[index];
                if (pt) {
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(pt.x * width, pt.y * height, 2.5, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  // Add extra glow for corners
                  ctx.beginPath();
                  ctx.arc(pt.x * width, pt.y * height, 8, 0, 2 * Math.PI);
                  ctx.fillStyle = index === 61 || index === 291 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(45, 212, 191, 0.3)';
                  ctx.fill();
                }
              });

              // Draw data labels near landmarks
              ctx.font = '10px JetBrains Mono';
              ctx.fillStyle = '#2dd4bf';
              const nose = landmarks[1];
              if (nose) {
                ctx.fillText(`BIOMETRIC_ID: ${Math.floor(nose.x * 10000)}`, nose.x * width + 15, nose.y * height - 15);
                ctx.fillText(`CONFIDENCE: ${(results.faceLandmarks[0][0].visibility || 0.99).toFixed(2)}`, nose.x * width + 15, nose.y * height - 5);
              }

              // Draw subtle mesh points (background)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
              landmarks.forEach((pt, i) => {
                if (i % 8 === 0) { // draw every 8th point for a cleaner look
                  ctx.beginPath();
                  ctx.arc(pt.x * width, pt.y * height, 0.5, 0, 2 * Math.PI);
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
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden border-4 sm:border-[8px] border-[var(--bg-card)] shadow-[0_0_60px_rgba(0,0,0,0.6)] group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          isAnalyzing ? "opacity-30 grayscale scale-110" : "opacity-100 scale-100"
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

      {/* Scanning Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] sm:opacity-10">
        <div className="w-full h-full bg-[linear-gradient(rgba(45,212,191,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* Face Guide Oval */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full aspect-[4/5] sm:aspect-[3/4] rounded-[100%] border-2 border-dashed transition-all duration-500",
              faceStatus === 'optimal' ? "border-[var(--accent-teal)] bg-[var(--accent-teal-soft)] shadow-[0_0_50px_rgba(45,212,191,0.25)] scale-105" : 
              faceStatus === 'none' ? "border-white/20" : "border-[var(--accent-pink)] bg-[var(--accent-pink-soft)] scale-95"
            )} 
          />
        </div>
      )}

      {/* Status Overlay */}
      {!isAnalyzing && !error && isModelLoaded && (
        <div className="absolute top-8 sm:top-12 left-0 right-0 flex flex-col items-center gap-3 z-30 px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "px-5 py-2.5 rounded-2xl backdrop-blur-2xl border text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-3 transition-colors",
              brightness < 70 || faceStatus !== 'optimal'
                ? "bg-[var(--accent-pink-soft)] border-[var(--accent-pink-border)] text-[var(--accent-pink)] shadow-[0_0_20px_rgba(244,114,182,0.4)]" 
                : "bg-[var(--accent-teal-soft)] border-[var(--accent-teal-border)] text-[var(--accent-teal)] shadow-[0_0_20px_rgba(45,212,191,0.4)]"
            )}
          >
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              brightness < 70 || faceStatus !== 'optimal' ? "bg-[var(--accent-pink)]" : "bg-[var(--accent-teal)]"
            )} />
            {brightness < 70 ? t("Environment too dark") : 
             faceStatus === 'none' ? t("Position face in guide") :
             faceStatus === 'too_far' ? t("Move closer") :
             faceStatus === 'too_close' ? t("Move back") :
             t("Optimal position")}
          </motion.div>

          {/* Ambient Light Meter */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-2 text-[9px] font-mono text-white/70 uppercase tracking-widest">
              <Sun className={cn("w-3.5 h-3.5 transition-colors", brightness < 70 ? "text-rose-400" : "text-[var(--accent-teal)]")} />
              {t('LUMINANCE_LEVEL')}
            </div>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                animate={{ 
                  width: `${Math.min(100, (brightness / 255) * 100)}%`,
                  backgroundColor: brightness < 70 ? '#f43f5e' : brightness < 150 ? '#fbbf24' : '#2dd4bf'
                }}
                className="h-full shadow-[0_0_10px_rgba(45,212,191,0.6)]"
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
          
          {error.includes("Free Quota Finish") && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 text-[10px] text-teal-400/80 leading-relaxed font-mono"
            >
              {t('TIP: If this is a new window, ensure your API key in Settings is not restricted to specific domains.')}
            </motion.div>
          )}

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
              className="w-full px-4 py-2.5 bg-[var(--accent-teal)] hover:opacity-90 text-white dark:text-black rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
              className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all active:scale-90"
              title={t('Switch Camera')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={captureFrame}
              className={cn(
                "group relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all",
                brightness < 70 || faceStatus !== 'optimal' ? "bg-[var(--bg-card-hover)] cursor-not-allowed" : "bg-[var(--text-primary)] hover:scale-110 active:scale-95"
              )}
              disabled={brightness < 70 || faceStatus !== 'optimal'}
            >
              <div className={cn(
                "absolute inset-0 rounded-full border-4 animate-ping",
                brightness < 70 || faceStatus !== 'optimal' ? "border-[var(--accent-pink-border)]" : "border-[var(--accent-teal-border)] group-hover:border-[var(--accent-teal)]"
              )} />
              <Camera className={cn("w-8 h-8", brightness < 70 || faceStatus !== 'optimal' ? "text-[var(--text-secondary)]" : "text-[var(--bg-card)]")} />
            </button>

            <div className="w-12" /> {/* Spacer to balance the switch button */}
          </div>
        </div>
      )}
    </div>
  );
};
