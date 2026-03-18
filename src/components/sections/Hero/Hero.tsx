"use client";

import { ChevronRight, Lock, Maximize2, Minimize2, Play } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import HeroAuraBackground from "./HeroAuraBackground";
import HeroOfferingShowcase from "./HeroOfferingShowcase";
import HeroPartnerLinesBackground from "./HeroPartnerLinesBackground";
import HeroParticleGlobe from "./HeroParticleGlobe";
import styles from "./Hero.module.scss";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const HERO_DEMO_PREVIEW_PRIMARY = "/videos/demo-video-hero.mp4";
const HERO_DEMO_PREVIEW_LEGACY = "/videos/mincfo-demo-video-preview.m4v";
const HERO_DEMO_PREVIEW_POSTER = "/videos/demo-video-hero-poster.png";
const HERO_DEMO_VIDEO_PRIMARY = "/videos/demo-video-hero.mp4";
const HERO_DEMO_VIDEO_FALLBACK_MP4 = "/videos/mincfo-demo-video-full.mp4";
const HERO_DEMO_VIDEO_FALLBACK_MOV = "/videos/mincfo-demo-video.mov";
const HERO_LOGO_PROGRESS_DURATION_MS = 1720;
const HERO_LOGO_HOLD_AFTER_FULL_MS = 120;
const HERO_VIDEO_REVEAL_DURATION_MS = 820;
const HERO_VIDEO_REVEAL_PLAYBACK_DELAY_MS = 60;
const HERO_END_BRAND_START_S = 111;
const HERO_END_BRAND_AUDIO_BARS = 52;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function Hero() {
  const { content, offering } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardWrapRef = useRef<HTMLDivElement | null>(null);
  const cardBodyRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playRequestedRef = useRef(false);
  const introTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const revealPlaybackTimeoutRef = useRef<number | null>(null);
  const introActiveRef = useRef(false);
  const useFullVideoRef = useRef(false);
  const isPlayingRef = useRef(false);
  const endBrandVisibleRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const mediaElementRef = useRef<HTMLVideoElement | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const introProgressFrameRef = useRef<number | null>(null);
  const fullscreenRedirectRef = useRef(false);
  const audioReactiveReadyRef = useRef(false);
  const audioLevelsRef = useRef<number[]>(
    Array.from({ length: HERO_END_BRAND_AUDIO_BARS }, () => 0),
  );
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLogoIntro, setShowLogoIntro] = useState(false);
  const [isVideoRevealing, setIsVideoRevealing] = useState(false);
  const [showEndBrand, setShowEndBrand] = useState(false);
  const [introRingProgress, setIntroRingProgress] = useState(0);
  const [isCardFullscreen, setIsCardFullscreen] = useState(false);
  const [endAudioLevels, setEndAudioLevels] = useState<number[]>(
    Array.from({ length: HERO_END_BRAND_AUDIO_BARS }, () => 0),
  );
  const [isAudioReactiveReady, setIsAudioReactiveReady] = useState(false);
  const [useFullVideo, setUseFullVideo] = useState(false);
  const stateRef = useRef({
    progress: 0,
    mouseX: 0,
    mouseY: 0,
    hovering: false,
    reduceMotion: false,
    allowPointer: false,
  });

  useLayoutEffect(() => {
    const sectionNode = sectionRef.current;
    const introNode = introRef.current;
    const state = stateRef.current;
    state.reduceMotion = isReducedMotion;
    state.allowPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const update = () => {
      const intro = introRef.current;
      const card = cardRef.current;
      const cardWrap = cardWrapRef.current;
      if (!card || !cardWrap) return;

      const introProgress = clamp(state.progress / 0.5, 0, 1);
      const cardProgress = clamp((state.progress - 0.08) / 0.84, 0, 1);

      const baseRotateX = 16 - state.progress * 9;
      const baseScale = 1 - state.progress * 0.03;
      const mouseRotateX = state.hovering ? -state.mouseY * 1.25 : 0;
      const mouseRotateY = state.hovering ? state.mouseX * 0.65 : 0;
      const travelY = state.reduceMotion ? 0 : cardProgress * 400;

      if (intro) {
        const introLift = state.reduceMotion ? 0 : introProgress * 280;
        intro.style.transform = `translate3d(0, -${introLift}px, 0)`;
        intro.style.opacity = `${Math.pow(1 - introProgress, 1.8)}`;
      }

      cardWrap.style.transform = `translate3d(0, -${travelY}px, 0)`;

      card.style.transform = `perspective(2000px) rotateX(${baseRotateX + mouseRotateX}deg) rotateY(${mouseRotateY}deg) scale(${baseScale})`;
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    const handleScroll = () => {
      const section = sectionRef.current ?? sectionNode;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const maxScroll = Math.max(rect.height - window.innerHeight, 1);
      const progress = clamp(-rect.top / (maxScroll * 1.15), 0, 1);
      state.progress = progress;
      scheduleUpdate();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    const card = cardRef.current;
    if (card && state.allowPointer && !state.reduceMotion) {
      const handleMove = (event: globalThis.MouseEvent) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        state.mouseX = clamp(x * 2 - 1, -1, 1);
        state.mouseY = clamp(y * 2 - 1, -1, 1);
        state.hovering = true;
        scheduleUpdate();
      };

      const handleLeave = () => {
        state.mouseX = 0;
        state.mouseY = 0;
        state.hovering = false;
        scheduleUpdate();
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
        if (introNode) {
          introNode.style.transform = "";
          introNode.style.opacity = "";
        }
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      };
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (introNode) {
        introNode.style.transform = "";
        introNode.style.opacity = "";
      }
    };
  }, [isReducedMotion]);

  useEffect(() => {
    return () => {
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
      }
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      if (revealPlaybackTimeoutRef.current) {
        window.clearTimeout(revealPlaybackTimeoutRef.current);
      }
      if (audioFrameRef.current) {
        window.cancelAnimationFrame(audioFrameRef.current);
      }
      if (introProgressFrameRef.current) {
        window.cancelAnimationFrame(introProgressFrameRef.current);
      }
      if (mediaSourceRef.current) {
        mediaSourceRef.current.disconnect();
        mediaSourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    useFullVideoRef.current = useFullVideo;
  }, [useFullVideo]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      const cardBody = cardBodyRef.current;
      const video = videoRef.current;
      if (fullscreenElement === video && cardBody && !fullscreenRedirectRef.current) {
        fullscreenRedirectRef.current = true;
        void document.exitFullscreen()
          .then(async () => {
            try {
              await cardBody.requestFullscreen();
            } catch {
              // Ignore if browser blocks immediate fullscreen handoff.
            }
          })
          .finally(() => {
            fullscreenRedirectRef.current = false;
          });
        return;
      }
      setIsCardFullscreen(fullscreenElement === cardBody);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const tryStartPlayback = async () => {
    const video = videoRef.current;
    if (
      !video ||
      !useFullVideoRef.current ||
      !playRequestedRef.current ||
      isPlayingRef.current ||
      introActiveRef.current
    ) {
      return;
    }

    try {
      await video.play();
      isPlayingRef.current = true;
      endBrandVisibleRef.current = false;
      setShowEndBrand(false);
      setIsPlaying(true);
      playRequestedRef.current = false;
    } catch {
      isPlayingRef.current = false;
      endBrandVisibleRef.current = false;
      setShowEndBrand(false);
      setIsPlaying(false);
    }
  };

  const ensureAudioAnalyzer = async (video: HTMLVideoElement) => {
    if (typeof window === "undefined") return;

    const AudioContextCtor = window.AudioContext || (window as Window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }
    const context = audioContextRef.current;
    if (!context) return;

    if (!analyserRef.current) {
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(
        new ArrayBuffer(analyser.frequencyBinCount),
      );
    }

    if (analyserRef.current && mediaElementRef.current !== video) {
      if (mediaSourceRef.current) {
        mediaSourceRef.current.disconnect();
      }
      const source = context.createMediaElementSource(video);
      source.connect(analyserRef.current);
      analyserRef.current.connect(context.destination);
      mediaSourceRef.current = source;
      mediaElementRef.current = video;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    audioReactiveReadyRef.current = true;
    setIsAudioReactiveReady(true);
  };

  useEffect(() => {
    if (!showEndBrand || !isPlaying || !useFullVideo) return;
    if (isReducedMotion) {
      const staticLevels = Array.from(
        { length: HERO_END_BRAND_AUDIO_BARS },
        () => 0.34,
      );
      audioLevelsRef.current = staticLevels;
      const staticFrame = window.requestAnimationFrame(() => {
        setEndAudioLevels(staticLevels);
      });
      return () => {
        window.cancelAnimationFrame(staticFrame);
      };
    }

    const analyser = analyserRef.current;
    const data = audioDataRef.current;

    const tick = () => {
      const hasAnalyzer = !!analyser && !!data && audioReactiveReadyRef.current;
      const now = window.performance.now() * 0.001;
      if (hasAnalyzer && analyser && data) {
        analyser.getByteFrequencyData(data);
      }

      const nextLevels = audioLevelsRef.current.map((prev, index) => {
        if (hasAnalyzer && analyser && data) {
          const ratio = index / Math.max(HERO_END_BRAND_AUDIO_BARS - 1, 1);
          const curved = Math.pow(ratio, 1.35);
          const binIndex = Math.min(
            data.length - 1,
            Math.max(0, Math.floor(curved * (data.length - 1))),
          );
          const raw = data[binIndex] / 255;
          const shaped = Math.pow(raw, 0.78);
          const target = Math.min(1, shaped * 1.28);
          const transientBoost = Math.max(0, target - prev) * 0.68;
          const boostedTarget = Math.min(1, target + transientBoost);

          if (boostedTarget > prev) {
            return prev * 0.3 + boostedTarget * 0.7;
          }
          return prev * 0.85 + boostedTarget * 0.15;
        }

        const ratio = index / Math.max(HERO_END_BRAND_AUDIO_BARS - 1, 1);
        const sweep = (Math.sin(now * 3.1 + ratio * 11.8) + 1) * 0.5;
        const pulse = (Math.sin(now * 1.9) + 1) * 0.5;
        const target = 0.16 + sweep * 0.3 + pulse * 0.14;
        return prev * 0.72 + target * 0.28;
      });

      audioLevelsRef.current = nextLevels;
      setEndAudioLevels(nextLevels);
      audioFrameRef.current = window.requestAnimationFrame(tick);
    };

    audioFrameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (audioFrameRef.current) {
        window.cancelAnimationFrame(audioFrameRef.current);
        audioFrameRef.current = null;
      }
    };
  }, [isAudioReactiveReady, isPlaying, isReducedMotion, showEndBrand, useFullVideo]);

  useEffect(() => {
    const target = cardWrapRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) return;
        const video = videoRef.current;
        if (!video || video.paused) return;

        video.pause();
        playRequestedRef.current = false;
        isPlayingRef.current = false;
        endBrandVisibleRef.current = false;
        setShowEndBrand(false);
        setIsPlaying(false);
      },
      { threshold: [0, 0.2, 0.35, 0.6] },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !useFullVideoRef.current || !isPlayingRef.current || showLogoIntro) {
      if (endBrandVisibleRef.current) {
        endBrandVisibleRef.current = false;
        setShowEndBrand(false);
      }
      return;
    }

    const shouldShow = video.currentTime >= HERO_END_BRAND_START_S;
    if (shouldShow !== endBrandVisibleRef.current) {
      endBrandVisibleRef.current = shouldShow;
      setShowEndBrand(shouldShow);
    }
  };

  const handlePlayDemo = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await ensureAudioAnalyzer(video);
    } catch {
      audioReactiveReadyRef.current = false;
      setIsAudioReactiveReady(false);
      // Fail silently and keep normal playback if analyzer setup is blocked.
    }

    playRequestedRef.current = true;

    if (!useFullVideo) {
      introActiveRef.current = true;
      setShowLogoIntro(true);
      setIsVideoRevealing(false);
      setIntroRingProgress(0);
      endBrandVisibleRef.current = false;
      setShowEndBrand(false);
      setUseFullVideo(true);
      if (introProgressFrameRef.current) {
        window.cancelAnimationFrame(introProgressFrameRef.current);
      }
      if (isReducedMotion) {
        setIntroRingProgress(1);
      } else {
        const introStart = window.performance.now();
        const animateIntroProgress = (now: number) => {
          const elapsed = now - introStart;
          const linearProgress = clamp(elapsed / HERO_LOGO_PROGRESS_DURATION_MS, 0, 1);
          const easedBase = 1 - Math.pow(1 - linearProgress, 1.2);
          const linearBlend = smoothstep(0.72, 1, linearProgress);
          const easedProgress = easedBase * (1 - linearBlend) + linearProgress * linearBlend;
          setIntroRingProgress(easedProgress);
          if (linearProgress < 1) {
            introProgressFrameRef.current = window.requestAnimationFrame(animateIntroProgress);
          } else {
            introProgressFrameRef.current = null;
          }
        };
        introProgressFrameRef.current = window.requestAnimationFrame(animateIntroProgress);
      }
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
      }
      introTimeoutRef.current = window.setTimeout(() => {
        introActiveRef.current = false;
        setShowLogoIntro(false);
        if (introProgressFrameRef.current) {
          window.cancelAnimationFrame(introProgressFrameRef.current);
          introProgressFrameRef.current = null;
        }
        if (isReducedMotion) {
          void tryStartPlayback();
          return;
        }
        setIsVideoRevealing(true);
        if (revealTimeoutRef.current) {
          window.clearTimeout(revealTimeoutRef.current);
        }
        if (revealPlaybackTimeoutRef.current) {
          window.clearTimeout(revealPlaybackTimeoutRef.current);
        }
        revealPlaybackTimeoutRef.current = window.setTimeout(() => {
          void tryStartPlayback();
        }, HERO_VIDEO_REVEAL_PLAYBACK_DELAY_MS);
        revealTimeoutRef.current = window.setTimeout(() => {
          setIsVideoRevealing(false);
        }, HERO_VIDEO_REVEAL_DURATION_MS);
      }, HERO_LOGO_PROGRESS_DURATION_MS + HERO_LOGO_HOLD_AFTER_FULL_MS);
      return;
    }

    if (introActiveRef.current || isVideoRevealing) return;

    await tryStartPlayback();
  };

  const handleVideoCanPlay = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        await ensureAudioAnalyzer(video);
      } catch {
        audioReactiveReadyRef.current = false;
        setIsAudioReactiveReady(false);
        // Keep playback behavior even if analyzer setup fails.
      }
    }
    if (introActiveRef.current) return;
    await tryStartPlayback();
  };

  const handleToggleFullscreen = async () => {
    const cardBody = cardBodyRef.current;
    if (!cardBody) return;
    try {
      if (document.fullscreenElement === cardBody) {
        await document.exitFullscreen();
        return;
      }
      if (!document.fullscreenElement) {
        await cardBody.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen API errors (e.g. unsupported context/browser restrictions).
    }
  };

  const handleVideoDoubleClick = (event: ReactMouseEvent<HTMLVideoElement>) => {
    event.preventDefault();
    void handleToggleFullscreen();
  };

  return (
    <section ref={sectionRef} id="hero" className={styles.hero}>
      <div className={styles.topBackground} aria-hidden="true">
        {offering === "full-service" ? (
          <HeroAuraBackground />
        ) : offering === "partner" ? (
          <HeroPartnerLinesBackground />
        ) : (
          <HeroParticleGlobe />
        )}
      </div>

      <div className={styles.container}>
        <div className={styles.intro} ref={introRef}>
          <div className={styles.tag}>
            <span className={styles.ping} />
            {content.hero.tagline}
          </div>

          <h1 className={styles.title}>
            {content.hero.titleLine1} <br />– {content.hero.titleLine2}
          </h1>

          <p className={styles.subtitle}>
            {content.hero.body}
          </p>

          <div className={styles.ctaRow}>
            <a className={styles.primaryCta} href="#">
              {content.hero.primaryCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </a>
          </div>
        </div>

        <div className={styles.cardWrap} ref={cardWrapRef}>
          <div className={`${styles.card} ${styles.glass}`} ref={cardRef}>
            <div className={styles.cardHeader}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <div className={styles.address}>
                <Lock aria-hidden="true" size={12} />
                {content.hero.address}
              </div>
            </div>

            <div ref={cardBodyRef} className={`${styles.cardBody} ${styles.gridBg}`}>
              <div className={styles.centerGlow} />
              {!isPlaying && !showLogoIntro && !isVideoRevealing && <div className={styles.previewTopMask} aria-hidden="true" />}
              {isVideoRevealing && <div className={styles.videoRevealOverlay} aria-hidden="true" />}
              {showLogoIntro && (
                <div className={`${styles.videoEndBrandOverlay} ${styles.videoEndBrandOverlayIntro}`} aria-hidden="true">
                  <div className={styles.videoEndBrandRingWrap}>
                    <span className={styles.videoEndBrandGridFade} />
                    <svg
                      className={`${styles.videoEndAudioRing} ${styles.videoEndAudioRingIntro}`}
                      viewBox="0 0 400 400"
                      role="presentation"
                    >
                      {Array.from({ length: HERO_END_BRAND_AUDIO_BARS }, (_, index) => {
                        const t = index / HERO_END_BRAND_AUDIO_BARS;
                        const angle = t * Math.PI * 2;
                        const progressHead = introRingProgress * HERO_END_BRAND_AUDIO_BARS;
                        const reveal = smoothstep(0, 1, clamp((progressHead - index + 0.35) / 1.25, 0, 1));
                        const innerRadius = 138;
                        const baseLength = 5 + Math.abs(Math.sin(angle * 2.2)) * 6;
                        const barLength = baseLength + reveal * 18;
                        const outerRadius = innerRadius + barLength;
                        const cx = 200;
                        const cy = 200;
                        const x1 = cx + Math.cos(angle) * innerRadius;
                        const y1 = cy + Math.sin(angle) * innerRadius;
                        const x2 = cx + Math.cos(angle) * outerRadius;
                        const y2 = cy + Math.sin(angle) * outerRadius;
                        const hue = 224 + t * 46;
                        const alpha = 0.12 + reveal * 0.74;

                        return (
                          <line
                            key={`intro-progress-bar-${index}`}
                            className={styles.videoEndAudioBar}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={`hsla(${hue} 98% 72% / ${alpha})`}
                          />
                        );
                      })}
                    </svg>
                    <div className={styles.videoEndBrandLockup}>
                      <svg className={styles.videoEndBrandMark} viewBox="0 0 50 50" role="presentation">
                        <g fill="currentColor">
                          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                        </g>
                      </svg>
                      <span className={styles.videoEndBrandWord}>{content.footer.brandWord}</span>
                    </div>
                  </div>
                </div>
              )}
              {!showLogoIntro && showEndBrand && (
                <div className={styles.videoEndBrandOverlay} aria-hidden="true">
                  <div className={styles.videoEndBrandRingWrap}>
                    <span className={styles.videoEndBrandGridFade} />
                    <svg
                      className={styles.videoEndAudioRing}
                      viewBox="0 0 400 400"
                      role="presentation"
                    >
                      {Array.from({ length: HERO_END_BRAND_AUDIO_BARS }, (_, index) => {
                        const t = index / HERO_END_BRAND_AUDIO_BARS;
                        const angle = t * Math.PI * 2;
                        const audioLevel = endAudioLevels[index] ?? 0;
                        const innerRadius = 138;
                        const baseLength = 5 + Math.abs(Math.sin(angle * 2.2)) * 6;
                        const barLength = baseLength + audioLevel * 54;
                        const outerRadius = innerRadius + barLength;
                        const cx = 200;
                        const cy = 200;
                        const x1 = cx + Math.cos(angle) * innerRadius;
                        const y1 = cy + Math.sin(angle) * innerRadius;
                        const x2 = cx + Math.cos(angle) * outerRadius;
                        const y2 = cy + Math.sin(angle) * outerRadius;
                        const hue = 224 + t * 46;
                        const alpha = 0.54 + audioLevel * 0.3;

                        return (
                          <line
                            key={`end-audio-bar-${index}`}
                            className={styles.videoEndAudioBar}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={`hsla(${hue} 98% 72% / ${alpha})`}
                          />
                        );
                      })}
                    </svg>
                    <div className={styles.videoEndBrandLockup}>
                      <svg className={styles.videoEndBrandMark} viewBox="0 0 50 50" role="presentation">
                        <g fill="currentColor">
                          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                        </g>
                      </svg>
                      <span className={styles.videoEndBrandWord}>{content.footer.brandWord}</span>
                    </div>
                  </div>
                </div>
              )}
              {!isPlaying && !showLogoIntro && !isVideoRevealing && (
                <button
                  className={styles.playButton}
                  type="button"
                  onClick={handlePlayDemo}
                  aria-label={content.hero.playAriaLabel}
                >
                  <span className={styles.playPulse} />
                  <Play aria-hidden="true" size={30} />
                </button>
              )}
              {useFullVideo && (
                <button
                  type="button"
                  className={styles.fullscreenButton}
                  onClick={handleToggleFullscreen}
                  aria-label={
                    isCardFullscreen
                      ? content.hero.exitFullscreenAriaLabel
                      : content.hero.enterFullscreenAriaLabel
                  }
                >
                  {isCardFullscreen ? <Minimize2 aria-hidden="true" size={18} /> : <Maximize2 aria-hidden="true" size={18} />}
                </button>
              )}
              <video
                key={useFullVideo ? "full-video" : "preview-video"}
                ref={videoRef}
                className={`${styles.demoVideo} ${!isPlaying ? styles.previewVideo : ""} ${useFullVideo ? styles.fullVideoMode : ""} ${showLogoIntro ? styles.videoUnderIntro : ""} ${isVideoRevealing ? styles.videoRevealStage : ""}`}
                loop={useFullVideo}
                controls={isPlaying}
                controlsList="nofullscreen"
                playsInline
                preload={useFullVideo ? "metadata" : "none"}
                poster={HERO_DEMO_PREVIEW_POSTER}
                aria-label={content.hero.videoAriaLabel}
                onCanPlay={handleVideoCanPlay}
                onTimeUpdate={handleVideoTimeUpdate}
                onDoubleClick={handleVideoDoubleClick}
              >
                {useFullVideo ? (
                  <>
                    <source src={HERO_DEMO_VIDEO_PRIMARY} type="video/mp4" />
                    <source src={HERO_DEMO_VIDEO_FALLBACK_MP4} type="video/mp4" />
                    <source src={HERO_DEMO_VIDEO_FALLBACK_MOV} type="video/quicktime" />
                  </>
                ) : (
                  <>
                    <source src={HERO_DEMO_PREVIEW_PRIMARY} type="video/mp4" />
                    <source src={HERO_DEMO_PREVIEW_LEGACY} type="video/mp4" />
                  </>
                )}
                {content.hero.videoFallback}
              </video>
            </div>
          </div>
        </div>

        <HeroOfferingShowcase />
      </div>
    </section>
  );
}
