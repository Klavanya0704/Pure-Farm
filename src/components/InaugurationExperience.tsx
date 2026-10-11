import { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  ArrowRight,
  Scissors,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export type InaugurationStage =
  | "opening"
  | "open_ceremony_prompt"
  | "ribbon_cutting"
  | "completed";

interface InaugurationExperienceProps {
  onEnter: () => void;
  standalone?: boolean;
}

export function InaugurationExperience({
  onEnter,
  standalone = false,
}: InaugurationExperienceProps) {
  const [stage, setStage] = useState<InaugurationStage>("opening");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const openingVideoRef = useRef<HTMLVideoElement>(null);
  const ribbonVideoRef = useRef<HTMLVideoElement>(null);

  // Attempt initial playback for opening video
  useEffect(() => {
    const video = openingVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setIsLoading(true);
    setVideoError(null);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAutoplayBlocked(false);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Autoplay with sound was blocked by the browser:", err);
          setIsAutoplayBlocked(true);
          setIsLoading(false);
        });
    }
  }, []);

  // Update muted state on active video element
  useEffect(() => {
    if (openingVideoRef.current) {
      openingVideoRef.current.muted = isMuted;
    }
    if (ribbonVideoRef.current) {
      ribbonVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle manual play if autoplay was blocked
  const handleManualPlayOpening = () => {
    const video = openingVideoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video
      .play()
      .then(() => {
        setIsAutoplayBlocked(false);
      })
      .catch((err) => {
        console.error("Failed to play opening video:", err);
        setVideoError("Unable to play video. Please try again.");
      });
  };

  // Sound toggle handler
  const toggleSound = () => {
    setIsMuted((prev) => !prev);
  };

  // Stage 1: Opening video ends -> prompt Open Ceremony button
  const handleOpeningEnded = () => {
    setStage("open_ceremony_prompt");
    setCurrentTime(duration);
  };

  // Stage 2: User clicks "Open Ceremony" -> start Ribbon-Cutting video
  const handleStartRibbonCutting = () => {
    setStage("ribbon_cutting");
    setVideoError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);

    const ribbonVideo = ribbonVideoRef.current;
    if (ribbonVideo) {
      ribbonVideo.currentTime = 0;
      ribbonVideo.muted = isMuted;
      ribbonVideo
        .play()
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to play ribbon cutting video:", err);
          setIsLoading(false);
          setVideoError("Unable to start the ribbon-cutting video. Please click retry.");
        });
    }
  };

  // Stage 3: Ribbon-cutting ends -> reveal Enter PureFarm
  const handleRibbonEnded = () => {
    setStage("completed");
    setCurrentTime(duration);
  };

  // Replay Ceremony from the very beginning
  const handleReplay = () => {
    setStage("opening");
    setCurrentTime(0);
    setDuration(0);
    setVideoError(null);
    setIsAutoplayBlocked(false);

    if (ribbonVideoRef.current) {
      ribbonVideoRef.current.pause();
      ribbonVideoRef.current.currentTime = 0;
    }

    if (openingVideoRef.current) {
      openingVideoRef.current.currentTime = 0;
      openingVideoRef.current.muted = isMuted;
      openingVideoRef.current
        .play()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsAutoplayBlocked(true);
        });
    }
  };

  // Retry active video playback
  const handleRetry = () => {
    setVideoError(null);
    setIsLoading(true);
    if (stage === "opening" && openingVideoRef.current) {
      openingVideoRef.current.load();
      openingVideoRef.current
        .play()
        .then(() => setIsLoading(false))
        .catch((e) => {
          setIsLoading(false);
          setVideoError("Playback retry failed. Please check connection.");
        });
    } else if (stage === "ribbon_cutting" && ribbonVideoRef.current) {
      ribbonVideoRef.current.load();
      ribbonVideoRef.current
        .play()
        .then(() => setIsLoading(false))
        .catch((e) => {
          setIsLoading(false);
          setVideoError("Playback retry failed. Please check connection.");
        });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#07130c] text-white select-none overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(45, 106, 79, 0.25) 0%, rgba(7, 19, 12, 0.98) 70%)",
      }}
    >
      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-emerald-950/60 bg-[#07130c]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-emerald-500/30 shadow-sm flex items-center justify-center">
            <img
              src="/images/pure-farm-logo.png"
              alt="PureFarm"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-emerald-100">
                PureFarm
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" />
                Inauguration
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/70 hidden sm:block font-medium">
              Official Platform Launch & Ribbon-Cutting Ceremony
            </p>
          </div>
        </div>

        {/* Top Controls: Sound Toggle & Stage Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-200">
            {stage === "opening" && <span>Part 1: Inauguration Opening</span>}
            {stage === "open_ceremony_prompt" && (
              <span className="text-amber-300 font-bold">Ready for Ribbon-Cutting</span>
            )}
            {stage === "ribbon_cutting" && (
              <span className="text-amber-300 font-bold">Part 2: Ribbon-Cutting Ceremony</span>
            )}
            {stage === "completed" && (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Ceremony Complete
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition border border-white/20 px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer"
            title={isMuted ? "Unmute audio" : "Mute audio"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-300" />
                <span className="hidden sm:inline">Mute</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="relative flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        <div className="relative w-full max-w-5xl aspect-video max-h-[75vh] sm:max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/90 shadow-2xl border border-emerald-900/40">
          {/* Video 1: Opening Video */}
          <video
            ref={openingVideoRef}
            src="/videos/purefarm-inauguration-opening.mp4"
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              if (stage === "opening") {
                setCurrentTime(e.currentTarget.currentTime);
              }
            }}
            onLoadedMetadata={(e) => {
              if (stage === "opening") {
                setDuration(e.currentTarget.duration);
                setIsLoading(false);
              }
            }}
            onEnded={handleOpeningEnded}
            onError={() => {
              if (stage === "opening") {
                setIsLoading(false);
                setVideoError("Unable to load the opening video. Please click retry.");
              }
            }}
            className={`w-full h-full object-contain transition-opacity duration-500 ${
              stage === "opening" || stage === "open_ceremony_prompt"
                ? "opacity-100"
                : "opacity-0 absolute pointer-events-none"
            }`}
          />

          {/* Video 2: Ribbon-Cutting Ceremony Video */}
          <video
            ref={ribbonVideoRef}
            src="/videos/purefarm-ribbon-cutting.mp4"
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              if (stage === "ribbon_cutting") {
                setCurrentTime(e.currentTarget.currentTime);
              }
            }}
            onLoadedMetadata={(e) => {
              if (stage === "ribbon_cutting") {
                setDuration(e.currentTarget.duration);
                setIsLoading(false);
              }
            }}
            onEnded={handleRibbonEnded}
            onError={() => {
              if (stage === "ribbon_cutting") {
                setIsLoading(false);
                setVideoError("Unable to load the ribbon-cutting video. Please click retry.");
              }
            }}
            className={`w-full h-full object-contain transition-opacity duration-500 ${
              stage === "ribbon_cutting" || stage === "completed"
                ? "opacity-100"
                : "opacity-0 absolute pointer-events-none"
            }`}
          />

          {/* Loading Indicator */}
          {isLoading && !videoError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs text-center p-4">
              <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mb-3" />
              <p className="text-sm font-bold text-emerald-200">Preparing Inauguration Video...</p>
            </div>
          )}

          {/* Error & Retry Fallback */}
          {videoError && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm text-center p-6 space-y-4">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-black text-white">Video Playback Notice</h3>
                <p className="text-xs text-red-200/90 leading-relaxed">{videoError}</p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition px-5 py-2.5 text-xs font-black text-slate-950 shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Playback
              </button>
            </div>
          )}

          {/* Fallback Play Button when Autoplay was blocked */}
          {stage === "opening" && isAutoplayBlocked && !isLoading && !videoError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-2xl animate-pulse">
                <Play className="h-8 w-8 ml-1" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-xl font-black text-white">PureFarm Inauguration</h2>
                <p className="text-xs text-emerald-200/90">
                  Click below to begin the official opening ceremony with sound.
                </p>
              </div>
              <button
                type="button"
                onClick={handleManualPlayOpening}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-95 transition px-6 py-3 text-sm font-black text-slate-950 shadow-xl cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                Play Opening Video
              </button>
            </div>
          )}

          {/* Stage 2 Overlay: Open Ceremony Button */}
          {stage === "open_ceremony_prompt" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md text-center p-6 space-y-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 flex items-center justify-center shadow-xl ring-4 ring-amber-400/30">
                <Scissors className="h-8 w-8" />
              </div>

              <div className="max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Stage 2: Official Inauguration
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Opening Ceremony Concluded
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  The stage is set. Click below to inaugurate PureFarm with the official
                  ribbon-cutting ceremony.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartRibbonCutting}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-500 active:scale-95 transition px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-black text-slate-950 shadow-2xl ring-2 ring-amber-300/60 cursor-pointer"
              >
                <Scissors className="h-5 w-5" />
                Open Ceremony
              </button>
            </div>
          )}

          {/* Stage 3 Overlay: Enter PureFarm Celebration */}
          {stage === "completed" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#07130c]/90 backdrop-blur-md text-center p-6 space-y-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/10 p-2 border-2 border-emerald-400/50 shadow-2xl mx-auto flex items-center justify-center">
                  <img
                    src="/images/pure-farm-logo.png"
                    alt="PureFarm"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Inauguration Complete
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Welcome to PureFarm!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  Connecting farmers, fresh produce, fair mandi prices, and sustainable agriculture
                  across India.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onEnter}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-[#1b4332] hover:from-emerald-400 hover:to-emerald-700 active:scale-95 transition px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-black text-white shadow-2xl border border-emerald-300/40 cursor-pointer"
                >
                  Enter PureFarm
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300/80 hover:text-emerald-200 transition py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer mt-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Replay Ceremony
                </button>
              </div>
            </div>
          )}

          {/* Slim Playback Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-200/90 px-1">
              <span>
                {stage === "opening" && "Part 1: Inauguration Opening"}
                {stage === "open_ceremony_prompt" && "Part 1 Complete"}
                {stage === "ribbon_cutting" && "Part 2: Ribbon-Cutting"}
                {stage === "completed" && "Ceremony Complete"}
              </span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Details */}
      <footer className="relative z-20 px-4 sm:px-8 py-3 text-center text-[11px] text-emerald-400/60 border-t border-emerald-950/60 bg-[#07130c]/90">
        <p>© 2026 PureFarm • Agriculture, Farm Marketplace & Direct Sourcing</p>
      </footer>
    </div>
  );
}
