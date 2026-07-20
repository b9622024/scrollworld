"use strict";

document.documentElement.classList.add("js");
document.documentElement.dataset.build = "scroll-world-scenes-01-10-v2";

const SCROLL_WORLD_ASSETS = {
  images: {
    scene01: "./assets/scroll-world/images/scene-01-exterior.webp",
    scene02: "./assets/scroll-world/images/scene-02-foyer.webp",
    scene03: "./assets/scroll-world/images/scene-03-hallway.webp",
    scene04: "./assets/scroll-world/images/scene-04-analysis-entrance.webp",
    scene05: "./assets/scroll-world/images/scene-05-analysis-room.webp",
    scene06: "./assets/scroll-world/images/scene-06-energy-report.webp",
    scene08: "./assets/scroll-world/images/scene-08-coach-reveal.webp",
    scene09: "./assets/scroll-world/images/scene-09-action-path.webp",
    scene10: "./assets/scroll-world/images/scene-10-courtyard.webp"
  },
  videos: {
    scene01To02: "./assets/scroll-world/videos/scene-01-to-02.mp4",
    scene02To03: "./assets/scroll-world/videos/scene-02-to-03.mp4",
    scene03To04: "./assets/scroll-world/videos/scene-03-to-04.mp4",
    scene04To05: "./assets/scroll-world/videos/scene-04-to-05.mp4",
    scene08To09: "./assets/scroll-world/videos/scene-08-to-09.mp4",
    scene10Ambient: "./assets/scroll-world/videos/scene-10-courtyard-ambient.mp4"
  }
};
const VIDEO_MANIFEST = {
  scene1To2: SCROLL_WORLD_ASSETS.videos.scene01To02,
  scene2To3: SCROLL_WORLD_ASSETS.videos.scene02To03,
  scene3To4: SCROLL_WORLD_ASSETS.videos.scene03To04,
  scene4To5: SCROLL_WORLD_ASSETS.videos.scene04To05,
  scene8To9: SCROLL_WORLD_ASSETS.videos.scene08To09,
  scene10Ambient: SCROLL_WORLD_ASSETS.videos.scene10Ambient
};

// The official Scene 2 -> 3 clip has a non-picture tail at the final frame.
// Stop at the last clean portion and let the matching still take over.
const VIDEO_SCRUB_RANGE = {
  scene1To2: [0, 1],
  scene2To3: [0, 0.94],
  scene3To4: [0, 1],
  scene4To5: [0, 1],
  scene8To9: [0, 1],
  scene10Ambient: [0, 0.12]
};

const entryTimeline = {
  scene1Hold: [0.00, 0.058],
  scene1CopyOut: [0.058, 0.108],
  scene1To2Video: [0.072, 0.266],
  scene2Settle: [0.266, 0.324],
  scene2CopyIn: [0.280, 0.331],
  scene2Hold: [0.324, 0.389],
  scene2CopyOut: [0.374, 0.425],
  scene2To3Video: [0.403, 0.634],
  scene3Settle: [0.634, 0.670],
  scene3CopyIn: [0.650, 0.700],
  scene3CopyOut: [0.690, 0.730],
  scene3To4Video: [0.700, 0.820],
  scene4Settle: [0.820, 0.840],
  scene4CopyIn: [0.830, 0.855],
  scene4CopyOut: [0.840, 0.855],
  scene4To5Video: [0.840, 0.910],
  scene5Settle: [0.910, 0.930],
  scene5CopyIn: [0.920, 0.950],
  scene5CopyOut: [0.950, 0.965],
  scene5To6: [0.910, 1.000],
  scene6CopyIn: [0.975, 1.000]
};

const scene34Config = {
  scrollSegments: [
    { scroll: [0.00, 0.70], video: [0.00, 0.60] },
    { scroll: [0.70, 0.84], video: [0.60, 0.86] },
    { scroll: [0.84, 1.00], video: [0.86, 1.00] }
  ]
};

const motionParam = new URLSearchParams(window.location.search).get("motion");
const forceMotion = motionParam === "on" || (motionParam !== "off" && document.documentElement.dataset.motionTest === "true");
let booted = false;

function mapRange(value, fromStart, fromEnd, toStart, toEnd) {
  const span = fromEnd - fromStart || 1;
  const progress = Math.min(1, Math.max(0, (value - fromStart) / span));
  return toStart + (toEnd - toStart) * progress;
}

function mapScene34Progress(scrollProgress) {
  const segments = scene34Config.scrollSegments;
  for (const segment of segments) {
    if (scrollProgress <= segment.scroll[1]) {
      return mapRange(scrollProgress, segment.scroll[0], segment.scroll[1], segment.video[0], segment.video[1]);
    }
  }
  return segments[segments.length - 1].video[1];
}

const scene45Config = { videoRange: [0, 1], scrubThreshold: 0.012 };
const scene56Config = {
  scene5Scale: [1, 1.16],
  scene5TranslateY: [0, -2.5],
  scene5Origin: "58% 48%",
  scene6Scale: [1.03, 1],
  reportMask: { start: 13, end: 100, origin: "53% 45%" },
  handRevealStart: 48
};

// Scene 1 -> 6 keeps its established physical scroll distance. The added
// tail is a separate camera move: Scene 6 stays in place while its report is
// read, then Scene 8 opens the same tabletop to the coach.
const legacyEntryHeightVh = 720;
const scene678Timeline = {
  scene6Hold: [0.00, 0.04],
  scene6ToVirtual7: [0.04, 0.18],
  virtualScene7ZoomMid: [0.18, 0.55],
  virtualScene7ZoomWide: [0.55, 0.78],
  virtualScene7CopyIn: [0.02, 0.08],
  virtualScene7CopyOut: [0.20, 0.35],
  scene8Settle: [0.78, 0.88],
  scene8CopyIn: [0.88, 1.00]
};
const scene678Config = {
  // Scene 8's report sits slightly lower than Scene 6's. The small upward
  // correction is only used during the short report-only handoff.
  closeScale: 3.25,
  closeTranslateX: -1.5,
  closeTranslateY: -17,
  reportOrigin: "53% 68%",
  reportMask: { start: 16, end: 100, origin: "51% 66%" },
  midScale: 1.68,
  midTranslateX: -0.5,
  midTranslateY: -3,
  fullScale: [1.05, 1]
};
const scene89Config = {
  scrollSegments: [
    { scroll: [0.00, 0.55], video: [0.00, 0.48] },
    { scroll: [0.55, 0.70], video: [0.48, 0.72] },
    { scroll: [0.70, 1.00], video: [0.72, 1.00] }
  ],
  videoRange: [0, 1],
  scrubThreshold: 0.012
};
const tailTimeline = {
  scene6To8: [0.00, 0.36],
  scene8To9: [0.36, 0.66],
  scene9To10: [0.66, 1.00]
};

function mapScene89Progress(scrollProgress) {
  const segments = scene89Config.scrollSegments;
  for (const segment of segments) {
    if (scrollProgress <= segment.scroll[1]) {
      return mapRange(scrollProgress, segment.scroll[0], segment.scroll[1], segment.video[0], segment.video[1]);
    }
  }
  return segments[segments.length - 1].video[1];
}

async function boot() {
  if (booted) return;
  booted = true;
  document.documentElement.dataset.bootStep = "entered";
  const reduceMotion = !forceMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  document.documentElement.dataset.motionMode = reduceMotion ? "reduced" : (forceMotion ? "forced" : "normal");
  if (reduceMotion) {
    document.documentElement.dataset.bootStep = "reduced";
    revealStaticFallback();
    return;
  }

  // Start the deterministic native renderer first. The GSAP files are still
  // loaded for production enhancement, but a CDN race must never remove the
  // interactive entry flow from a phone preview.
  try {
    document.documentElement.dataset.bootStep = "before-load";
    // Do not create the scrub renderer before metadata is available. On
    // mobile Safari that race leaves a video at its poster/first frame even
    // though the element later reports a valid duration.
    const mediaReady = await loadManifestVideos();
    document.documentElement.dataset.bootStep = "before-start";
    document.documentElement.dataset.scrollFallback = hasGsap ? "native-first" : "native";
    setupNativeScrollWorld(mediaReady);
    document.documentElement.dataset.bootStep = "started";
  } catch (error) {
    document.documentElement.dataset.bootStep = "caught";
    document.documentElement.dataset.scrollError = error?.message || "initialization-failed";
    document.documentElement.dataset.scrollFallback = "native";
    try {
      setupNativeScrollWorld([false, false, false, false, false, false]);
    } catch (fallbackError) {
      document.documentElement.dataset.scrollError = fallbackError?.message || "native-fallback-failed";
    }
  }
}

function loadManifestVideos() {
  const jobs = [
    ["[data-layer='scene1-to-2'] video", VIDEO_MANIFEST.scene1To2],
    ["[data-layer='scene2-to-3'] video", VIDEO_MANIFEST.scene2To3],
    ["[data-layer='scene3-to-4'] video", VIDEO_MANIFEST.scene3To4],
    ["[data-layer='scene4-to-5'] video", VIDEO_MANIFEST.scene4To5],
    ["[data-layer='scene8-to-9'] video", VIDEO_MANIFEST.scene8To9],
    ["[data-layer='scene10-ambient'] video", VIDEO_MANIFEST.scene10Ambient]
  ];
  return Promise.all(jobs.map(([selector, source]) => new Promise((resolve) => {
    const video = document.querySelector(selector);
    if (!video) return resolve(false);
    video.src = source;
    video.muted = true;
    video.playsInline = true;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const ready = Number.isFinite(video.duration) && video.duration > 0;
      video.dataset.ready = String(ready);
      if (!ready) video.dataset.failed = "true";
      if (ready) {
        // Prime the decoder before the renderer starts. Waiting for this
        // promise is important on iOS: resolving first lets the cleanup
        // pause/reset race with the first scroll seek.
        const attempt = video.play();
        if (attempt && typeof attempt.then === "function") {
          attempt.then(() => {
            video.pause();
            if (Math.abs(video.currentTime) > 0.001) video.currentTime = 0;
          }).catch(() => {}).finally(() => resolve(true));
          return;
        }
      }
      resolve(ready);
    };
    video.addEventListener("loadedmetadata", finish, { once: true });
    video.addEventListener("error", () => {
      video.dataset.failed = "true";
      if (!settled) { settled = true; resolve(false); }
    }, { once: true });
    video.load();
    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      finish();
    }
    window.setTimeout(() => {
      if (settled) return;
      settled = true;
      const ready = Number.isFinite(video.duration) && video.duration > 0;
      video.dataset.ready = String(ready);
      if (!ready) video.dataset.failed = "true";
      resolve(ready);
    }, 2500);
  })));
}

function getNodes() {
  return {
    section: document.querySelector("#sw-entry-flow"),
    stage: document.querySelector(".sw-stage"),
    scene1: document.querySelector("[data-layer='scene1']"),
    scene1To2: document.querySelector("[data-layer='scene1-to-2']"),
    scene2: document.querySelector("[data-layer='scene2']"),
    scene2To3: document.querySelector("[data-layer='scene2-to-3']"),
    scene3: document.querySelector("[data-layer='scene3']"),
    scene3To4: document.querySelector("[data-layer='scene3-to-4']"),
    scene4: document.querySelector("[data-layer='scene4']"),
    scene4To5: document.querySelector("[data-layer='scene4-to-5']"),
    scene5: document.querySelector("[data-layer='scene5']"),
    scene6: document.querySelector("[data-layer='scene6']"),
    scene8: document.querySelector("[data-layer='scene8']"),
    scene8To9: document.querySelector("[data-layer='scene8-to-9']"),
    scene9: document.querySelector("[data-layer='scene9']"),
    scene10: document.querySelector("[data-layer='scene10']"),
    scene10Ambient: document.querySelector("[data-layer='scene10-ambient']"),
    virtual7Mask: document.querySelector(".sw-virtual7-mask"),
    warmMask: document.querySelector(".sw-warm-mask"),
    copy1: document.querySelector(".sw-copy--scene1"),
    copy2: document.querySelector(".sw-copy--scene2"),
    copy3: document.querySelector(".sw-copy--scene3"),
    copy4: document.querySelector(".sw-copy--scene4"),
    copy5: document.querySelector(".sw-copy--scene5"),
    copy6: document.querySelector(".sw-copy--scene6"),
    copy7: document.querySelector(".sw-copy--scene7"),
    copy8: document.querySelector(".sw-copy--scene8"),
    copy9: document.querySelector(".sw-copy--scene9"),
    copy10: document.querySelector(".sw-copy--scene10")
  };
}

function setupGsapScrollWorld(gsap, ScrollTrigger, mediaReady) {
  const n = getNodes();
  if (Object.values(n).some((node) => !node)) return;
  const videos = [n.scene1To2.querySelector("video"), n.scene2To3.querySelector("video")];
  const ranges = entryTimeline;
  gsap.set([n.scene1To2, n.scene2, n.scene2To3, n.scene3], { autoAlpha: 0 });
  gsap.set([n.copy2, n.copy3], { autoAlpha: 0, y: 8 });
  gsap.set(n.scene1, { scale: 1 });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      id: "sw-entry-flow",
      trigger: n.section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true
    }
  });

  timeline.to(n.copy1, { autoAlpha: 0, y: -8, duration: ranges.scene1CopyOut[1] - ranges.scene1CopyOut[0] }, ranges.scene1CopyOut[0]);
  timeline.to(n.scene1, { scale: 1.12, duration: ranges.scene1To2Video[1] - ranges.scene1Hold[1] }, ranges.scene1Hold[1]);
  if (mediaReady[0]) {
    timeline.to(n.scene1To2, { autoAlpha: 1, duration: .02 }, ranges.scene1To2Video[0]);
    timeline.to(n.scene1, { autoAlpha: 0, duration: .03 }, ranges.scene1To2Video[0] + .02);
    addVideoScrub(timeline, videos[0], ranges.scene1To2Video, ...VIDEO_SCRUB_RANGE.scene1To2);
  }
  timeline.to(n.scene2, { autoAlpha: 1, duration: .01 }, ranges.scene2Settle[0]);
  timeline.to(n.copy2, { autoAlpha: 1, y: 0, duration: ranges.scene2CopyIn[1] - ranges.scene2CopyIn[0] }, ranges.scene2CopyIn[0]);
  timeline.to(n.copy2, { autoAlpha: 0, y: -8, duration: ranges.scene2CopyOut[1] - ranges.scene2CopyOut[0] }, ranges.scene2CopyOut[0]);
  if (mediaReady[1]) {
    timeline.to(n.scene2To3, { autoAlpha: 1, duration: .02 }, ranges.scene2To3Video[0]);
    // The transition video is already a matched continuation of the foyer.
    // Keep it fully present while the static foyer leaves underneath it.
    timeline.to(n.scene2, { autoAlpha: 0, duration: .03 }, ranges.scene2To3Video[1] - .03);
    addVideoScrub(timeline, videos[1], ranges.scene2To3Video, ...VIDEO_SCRUB_RANGE.scene2To3);
  } else {
    // If the transition cannot decode, keep the static route readable and continue to Scene 3.
    timeline.to(n.scene2, { autoAlpha: 0, duration: .06 }, ranges.scene2To3Video[0] + .02);
  }
  timeline.to(n.scene3, { autoAlpha: 1, duration: .015 }, ranges.scene3Settle[0]);
  timeline.to(n.scene2To3, { autoAlpha: 0, duration: .015 }, ranges.scene3Settle[0]);
  timeline.to(n.copy3, { autoAlpha: 1, y: 0, duration: ranges.scene3CopyIn[1] - ranges.scene3CopyIn[0] }, ranges.scene3CopyIn[0]);
  videos.forEach((video) => video?.pause());
  window.addEventListener("resize", () => ScrollTrigger.refresh(), { passive: true });
}

function setupNativeScrollWorld(mediaReady) {
  const n = getNodes();
  if (Object.values(n).some((node) => !node)) return;
  document.documentElement.dataset.nativeReady = String(mediaReady);
  const videos = [
    n.scene1To2.querySelector("video"),
    n.scene2To3.querySelector("video"),
    n.scene3To4.querySelector("video"),
    n.scene4To5.querySelector("video"),
    n.scene8To9.querySelector("video"),
    n.scene10Ambient.querySelector("video")
  ];
  const compact = window.matchMedia("(max-width: 759px)").matches;
  let frame = 0;
  let lastProgress = -1;
  const seekState = new WeakMap();
  const displayState = new WeakMap();
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const rangeProgress = (progress, range) => clamp((progress - range[0]) / (range[1] - range[0]));
  const mix = (a, b, progress) => a + (b - a) * clamp(progress);
  const setLayer = (layer, opacity, scale = 1) => {
    layer.style.opacity = opacity.toFixed(3);
    layer.style.visibility = opacity > .001 ? "visible" : "hidden";
    layer.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
  };
  const setMediaLayer = (layer, opacity, transform, clipPath = "none", origin = "") => {
    layer.style.opacity = opacity.toFixed(3);
    layer.style.visibility = opacity > .001 ? "visible" : "hidden";
    layer.style.transform = transform;
    layer.style.clipPath = clipPath;
    if (origin) layer.style.transformOrigin = origin;
  };
  const getDisplayState = (video) => {
    let state = displayState.get(video);
    if (!state) {
      state = { active: false, frameReady: false, waiting: false, token: 0 };
      displayState.set(video, state);
    }
    return state;
  };
  const armVideoFrame = (video, state, requestRender) => {
    const token = ++state.token;
    state.frameReady = false;
    const reveal = () => {
      if (token !== state.token || !state.active) return;
      state.frameReady = true;
      state.waiting = false;
      // The scroll position may be unchanged while the decoder finishes a
      // seek. Force one render so the layer does not stay hidden until the
      // next finger movement.
      lastProgress = -1;
      requestRender();
    };
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(() => reveal());
      // Some iOS WebKit builds do not fire requestVideoFrameCallback for a
      // paused, seeked video. Reveal after a short bounded wait as a fallback
      // so the scene cannot remain hidden once metadata/data are ready.
      window.setTimeout(() => reveal(), 280);
    } else if (video.readyState >= 2) {
      window.requestAnimationFrame(reveal);
    } else {
      video.addEventListener("canplay", reveal, { once: true });
    }
  };
  const scrub = (video, ready, progress, range, active) => {
    if (!video || !ready || video.dataset.failed === "true" || !Number.isFinite(video.duration)) return;
    const target = video.duration * mix(range[0], range[1], progress);
    const seekThreshold = scene45Config.scrubThreshold;
    const state = seekState.get(video) || { target: 0, raf: 0, active: false, lastSeekAt: 0, forceSeek: true };
    const display = getDisplayState(video);
    seekState.set(video, state);
    if (!active) {
      video.pause();
      state.active = false;
      state.target = target;
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      display.active = false;
      // Keep the decoded frame cached. Clearing it here makes a scene
      // disappear when the user reverses back into it before WebKit has
      // delivered another requestVideoFrameCallback.
      display.frameReady = video.readyState >= 2;
      display.waiting = false;
      state.forceSeek = true;
      return;
    }
    const wasInactive = !state.active;
    state.active = true;
    state.target = target;
    if (!display.active) {
      display.active = true;
      display.frameReady = video.readyState >= 2;
      display.waiting = !display.frameReady;
      if (!display.frameReady) armVideoFrame(video, display, requestRender);
    }
    if (wasInactive) {
      state.forceSeek = true;
      state.lastSeekAt = 0;
    }
    if (state.raf) return;
    const seekLatestFrame = (now) => {
      state.raf = 0;
      if (!state.active) return;
      const difference = Math.abs(video.currentTime - state.target);
      if ((state.forceSeek || difference > seekThreshold) && now - state.lastSeekAt >= 28) {
        state.lastSeekAt = now;
        state.forceSeek = false;
        video.currentTime = state.target;
      }
      if (Math.abs(video.currentTime - state.target) > seekThreshold) {
        state.raf = requestAnimationFrame(seekLatestFrame);
      }
    };
    state.raf = requestAnimationFrame(seekLatestFrame);
  };
  const render = () => {
    frame = 0;
    const sectionScroll = Math.max(0, window.scrollY - n.section.offsetTop);
    const maxScroll = Math.max(1, n.section.offsetHeight - window.innerHeight);
    const legacyMaxScroll = Math.max(1, window.innerHeight * (legacyEntryHeightVh / 100) - window.innerHeight);
    const tailMaxScroll = Math.max(1, maxScroll - legacyMaxScroll);
    const progress = clamp(Math.min(sectionScroll, legacyMaxScroll) / legacyMaxScroll);
    const tailProgress = clamp((sectionScroll - legacyMaxScroll) / tailMaxScroll);
    const progressKey = progress + tailProgress * 2;
    if (Math.abs(progressKey - lastProgress) < .001) return;
    lastProgress = progressKey;
    document.documentElement.dataset.nativeProgress = progress.toFixed(3);
    document.documentElement.dataset.nativeTailProgress = tailProgress.toFixed(3);
    const r = entryTimeline;
    const scene1To2Available = mediaReady[0] && videos[0]?.dataset.failed !== "true";

    const scene1Scale = mix(1, compact ? 1.12 : 1.16, rangeProgress(progress, [r.scene1Hold[0], r.scene1To2Video[1]]));
    const entryVideoDisplay = getDisplayState(videos[0]);
    const scene1ProgressOpacity = 1 - rangeProgress(progress, [r.scene1To2Video[0] + .028, r.scene1To2Video[1] - .025]);
    const scene1HoldForDecode = progress >= r.scene1To2Video[0] && progress < r.scene1To2Video[1] && !entryVideoDisplay.frameReady ? 1 : scene1ProgressOpacity;
    setLayer(n.scene1, scene1HoldForDecode, scene1Scale);
    const entryIn = rangeProgress(progress, [r.scene1To2Video[0], r.scene1To2Video[0] + .02]);
    const entryOut = rangeProgress(progress, [r.scene1To2Video[1] - .02, r.scene1To2Video[1]]);
    setLayer(n.scene1To2, scene1To2Available ? entryIn * (1 - entryOut) * (entryVideoDisplay.frameReady ? 1 : 0) : 0, 1);
    n.scene1To2.style.filter = scene1To2Available ? "brightness(1.035)" : "none";
    scrub(videos[0], scene1To2Available, rangeProgress(progress, r.scene1To2Video), VIDEO_SCRUB_RANGE.scene1To2, progress >= r.scene1To2Video[0] && progress <= r.scene1To2Video[1]);

    const scene2To3Available = mediaReady[1] && videos[1]?.dataset.failed !== "true";
    // Keep the foyer at full brightness until the next video has visibly
    // arrived. This avoids a dark dip when the Scene 2 copy leaves the frame.
    const scene2Out = scene2To3Available ? rangeProgress(progress, [r.scene2To3Video[1] - .03, r.scene2To3Video[1]]) : 0;
    const scene2EarlyIn = rangeProgress(progress, [r.scene2Settle[0] - .025, r.scene2Settle[0]]);
    setLayer(n.scene2, progress < r.scene2Settle[0] - .025 ? 0 : (progress < r.scene2Settle[0] ? scene2EarlyIn : 1 - scene2Out), 1);
    const copy1 = 1 - rangeProgress(progress, r.scene1CopyOut);
    const copy2 = rangeProgress(progress, r.scene2CopyIn) * (1 - rangeProgress(progress, r.scene2CopyOut));
    const copy3 = rangeProgress(progress, r.scene3CopyIn) * (1 - rangeProgress(progress, r.scene3CopyOut));
    const copy4 = rangeProgress(progress, r.scene4CopyIn) * (1 - rangeProgress(progress, r.scene4CopyOut));
    const copy5 = rangeProgress(progress, r.scene5CopyIn) * (1 - rangeProgress(progress, r.scene5CopyOut));
    const copy6 = rangeProgress(progress, r.scene6CopyIn);
    [n.copy1, n.copy2, n.copy3, n.copy4, n.copy5, n.copy6, n.copy7, n.copy8, n.copy9, n.copy10].forEach((copy) => { copy.style.visibility = "hidden"; copy.style.opacity = "0"; });
    n.copy1.style.opacity = copy1.toFixed(3); n.copy1.style.visibility = copy1 > .001 ? "visible" : "hidden";
    n.copy2.style.opacity = copy2.toFixed(3); n.copy2.style.visibility = copy2 > .001 ? "visible" : "hidden";
    n.copy3.style.opacity = copy3.toFixed(3); n.copy3.style.visibility = copy3 > .001 ? "visible" : "hidden";
    n.copy4.style.opacity = copy4.toFixed(3); n.copy4.style.visibility = copy4 > .001 ? "visible" : "hidden";
    n.copy5.style.opacity = copy5.toFixed(3); n.copy5.style.visibility = copy5 > .001 ? "visible" : "hidden";
    n.copy6.style.opacity = copy6.toFixed(3); n.copy6.style.visibility = copy6 > .001 ? "visible" : "hidden";

    const scene2To3Progress = rangeProgress(progress, r.scene2To3Video);
    // Once the matched video begins, it stays at full opacity. This prevents
    // a dark gap while the foyer copy fades and the camera keeps moving.
    const scene2To3Display = getDisplayState(videos[1]);
    const scene2To3Media = scene2To3Available && progress >= r.scene2To3Video[0] && progress < r.scene3Settle[0] && scene2To3Display.frameReady ? 1 : 0;
    const scene3In = rangeProgress(progress, [r.scene3Settle[0], r.scene3Settle[0] + .015]);
    setLayer(n.scene2To3, scene2To3Available ? (progress >= r.scene3Settle[0] ? 1 - scene3In : scene2To3Media) : 0, 1);
    scrub(videos[1], scene2To3Available, scene2To3Progress, VIDEO_SCRUB_RANGE.scene2To3, progress >= r.scene2To3Video[0] && progress <= r.scene2To3Video[1]);

    const scene3To4Available = mediaReady[2] && videos[2]?.dataset.failed !== "true";
    const scene3To4Display = getDisplayState(videos[2]);
    const scene3To4Local = rangeProgress(progress, r.scene3To4Video);
    const scene3To4Media = scene3To4Available && progress >= r.scene3To4Video[0] && progress < r.scene4Settle[0] && scene3To4Display.frameReady ? 1 : 0;
    const scene3Out = scene3To4Available
      ? rangeProgress(progress, [r.scene3To4Video[1] - .025, r.scene3To4Video[1]])
      : rangeProgress(progress, [r.scene3To4Video[0] + .02, r.scene4Settle[0]]);
    const scene4In = rangeProgress(progress, [r.scene4Settle[0], r.scene4Settle[0] + .015]);
    setLayer(n.scene3, progress < r.scene3Settle[0] ? scene3In : 1 - scene3Out, 1);
    setLayer(n.scene3To4, scene3To4Available ? (progress >= r.scene4Settle[0] ? 1 - scene4In : scene3To4Media) : 0, 1);
    scrub(videos[2], scene3To4Available, mapScene34Progress(scene3To4Local), VIDEO_SCRUB_RANGE.scene3To4, progress >= r.scene3To4Video[0] && progress <= r.scene3To4Video[1]);

    const scene4To5Available = mediaReady[3] && videos[3]?.dataset.failed !== "true";
    const scene4To5Display = getDisplayState(videos[3]);
    const scene4To5Local = rangeProgress(progress, r.scene4To5Video);
    const scene4To5Media = scene4To5Available && progress >= r.scene4To5Video[0] && progress < r.scene5Settle[0] && scene4To5Display.frameReady ? 1 : 0;
    const scene4HoldForDecode = !scene4To5Available
      ? (progress < r.scene5Settle[0] ? 1 : 0)
      : (progress >= r.scene4To5Video[0] && progress < r.scene4To5Video[1] && !scene4To5Display.frameReady ? 1 : 1 - rangeProgress(progress, [r.scene4To5Video[0], r.scene4To5Video[0] + .025]));
    setLayer(n.scene4, progress < r.scene4To5Video[0] ? scene4In : scene4HoldForDecode, 1);
    setLayer(n.scene4To5, scene4To5Available ? (progress >= r.scene5Settle[0] ? 1 - rangeProgress(progress, [r.scene5Settle[0], r.scene5Settle[0] + .02]) : scene4To5Media) : 0, 1);
    scrub(videos[3], scene4To5Available, scene4To5Local, VIDEO_SCRUB_RANGE.scene4To5, progress >= r.scene4To5Video[0] && progress <= r.scene4To5Video[1]);

    const scene56Local = rangeProgress(progress, r.scene5To6);
    const reportPush = rangeProgress(scene56Local, [0, .42]);
    const reportReveal = rangeProgress(scene56Local, [.42, .72]);
    const reportFade = rangeProgress(scene56Local, [.72, .88]);
    const scene5In = rangeProgress(progress, [scene4To5Available ? r.scene5Settle[0] - .005 : r.scene4To5Video[0], r.scene5Settle[1]]);
    const scene5Opacity = scene5In * (1 - Math.min(1, reportReveal * 1.25 + reportFade));
    const scene5Transform = `translate3d(0, ${mix(scene56Config.scene5TranslateY[0], scene56Config.scene5TranslateY[1], reportPush)}%, 0) scale(${mix(scene56Config.scene5Scale[0], scene56Config.scene5Scale[1], reportPush)})`;
    const scene6Transform = `translate3d(0, 0, 0) scale(${mix(scene56Config.scene6Scale[0], scene56Config.scene6Scale[1], reportReveal)})`;
    const maskRadius = mix(scene56Config.reportMask.start, scene56Config.reportMask.end, reportReveal);
    setMediaLayer(n.scene5, scene5Opacity, scene5Transform, "none");
    setMediaLayer(n.scene6, reportReveal, scene6Transform, `circle(${maskRadius}% at ${scene56Config.reportMask.origin})`);

    // Virtual Scene 7 is a report-only handoff. Scene 8 enters through a
    // small mask around its report, then remains the only media layer while
    // the camera pulls back to reveal the coach and the room.
    const scene678Progress = rangeProgress(tailProgress, tailTimeline.scene6To8);
    const scene6ToVirtual7 = rangeProgress(scene678Progress, scene678Timeline.scene6ToVirtual7);
    const reportMask = mix(scene678Config.reportMask.start, scene678Config.reportMask.end, scene6ToVirtual7);
    const closeTransform = `translate3d(${scene678Config.closeTranslateX}%, ${scene678Config.closeTranslateY}%, 0) scale(${scene678Config.closeScale})`;
    const scene6TailOpacity = 1 - scene6ToVirtual7;
    const scene8CloseOpacity = scene6ToVirtual7;
    if (tailProgress > 0) {
      setMediaLayer(n.scene6, scene6TailOpacity, "translate3d(0, 0, 0) scale(1)", "none");
      setMediaLayer(n.scene8, scene8CloseOpacity, closeTransform, `ellipse(${reportMask}% ${Math.min(100, reportMask * 1.12)}% at ${scene678Config.reportMask.origin})`, scene678Config.reportOrigin);
    }

    const zoomMid = rangeProgress(scene678Progress, scene678Timeline.virtualScene7ZoomMid);
    const zoomWide = rangeProgress(scene678Progress, scene678Timeline.virtualScene7ZoomWide);
    const fullReveal = rangeProgress(scene678Progress, scene678Timeline.scene8Settle);
    const reportScale = scene678Progress < scene678Timeline.virtualScene7ZoomMid[1]
      ? mix(scene678Config.closeScale, scene678Config.midScale, zoomMid)
      : mix(scene678Config.midScale, scene678Config.fullScale[0], zoomWide);
    const reportTranslateX = scene678Progress < scene678Timeline.virtualScene7ZoomMid[1]
      ? mix(scene678Config.closeTranslateX, scene678Config.midTranslateX, zoomMid)
      : mix(scene678Config.midTranslateX, 0, zoomWide);
    const reportTranslateY = scene678Progress < scene678Timeline.virtualScene7ZoomMid[1]
      ? mix(scene678Config.closeTranslateY, scene678Config.midTranslateY, zoomMid)
      : mix(scene678Config.midTranslateY, 0, zoomWide);
    const settledScale = mix(reportScale, scene678Config.fullScale[1], fullReveal);
    const reportTailTransform = `translate3d(${reportTranslateX}%, ${reportTranslateY}%, 0) scale(${settledScale})`;
    if (scene678Progress >= scene678Timeline.scene6ToVirtual7[1]) {
      setMediaLayer(n.scene8, 1, reportTailTransform, "none", scene678Config.reportOrigin);
    }

    const scene6TailCopy = 1 - rangeProgress(scene678Progress, [0.02, 0.14]);
    const scene7Copy = rangeProgress(scene678Progress, scene678Timeline.virtualScene7CopyIn) * (1 - rangeProgress(scene678Progress, scene678Timeline.virtualScene7CopyOut));
    const scene8Copy = rangeProgress(scene678Progress, scene678Timeline.scene8CopyIn) * (1 - rangeProgress(tailProgress, [tailTimeline.scene8To9[0], tailTimeline.scene8To9[0] + .06]));
    const handMaskIn = rangeProgress(scene678Progress, [0.04, 0.10]);
    const handMaskOut = 1 - rangeProgress(scene678Progress, [0.20, 0.40]);
    const virtual7MaskOpacity = 0.22 * handMaskIn * handMaskOut;
    if (n.virtual7Mask) {
      n.virtual7Mask.style.opacity = virtual7MaskOpacity.toFixed(3);
      n.virtual7Mask.style.visibility = virtual7MaskOpacity > .001 ? "visible" : "hidden";
    }
    n.copy6.style.opacity = (tailProgress > 0 ? scene6TailCopy : copy6).toFixed(3);
    n.copy6.style.visibility = Number(n.copy6.style.opacity) > .001 ? "visible" : "hidden";
    n.copy7.style.opacity = scene7Copy.toFixed(3);
    n.copy7.style.visibility = scene7Copy > .001 ? "visible" : "hidden";
    n.copy8.style.opacity = scene8Copy.toFixed(3);
    n.copy8.style.visibility = scene8Copy > .001 ? "visible" : "hidden";

    // Scene 08 -> 09 uses the stable 02 Luma clip. Its paper-turn section is
    // compressed by mapScene89Progress so the clean final composition gets
    // more reading time without inventing a Scene 08.5.
    const scene89Progress = rangeProgress(tailProgress, tailTimeline.scene8To9);
    const scene89Available = mediaReady[4] && videos[4]?.dataset.failed !== "true";
    const scene89Display = getDisplayState(videos[4]);
    const scene89VideoProgress = rangeProgress(scene89Progress, [0.08, 0.88]);
    const scene89VideoOpacity = scene89Available && scene89Display.frameReady
      ? rangeProgress(scene89Progress, [0.08, 0.10]) * (1 - rangeProgress(scene89Progress, [0.88, 0.96]))
      : 0;
    const scene9StaticIn = rangeProgress(scene89Progress, [0.88, 0.96]);
    setLayer(n.scene8To9, scene89VideoOpacity, 1);
    setLayer(n.scene9, scene89Available ? scene9StaticIn : (scene89Progress >= .76 ? 1 : 0), 1);
    scrub(videos[4], scene89Available, mapScene89Progress(scene89VideoProgress), VIDEO_SCRUB_RANGE.scene8To9, scene89Progress >= .08 && scene89Progress <= .96);
    if (tailProgress >= tailTimeline.scene8To9[0]) {
      const scene8Exit = 1 - rangeProgress(scene89Progress, [0.88, 0.96]);
      setMediaLayer(n.scene8, scene8Exit, "translate3d(0, 0, 0) scale(1)", "none", scene678Config.reportOrigin);
    }

    const scene910Progress = rangeProgress(tailProgress, tailTimeline.scene9To10);
    const scene9WarmPush = rangeProgress(scene910Progress, [0, .48]);
    const scene10Reveal = rangeProgress(scene910Progress, [.48, .72]);
    const scene9Exit = scene910Progress < .48 ? 1 : 1 - scene10Reveal;
    const scene9Transform = `translate3d(0, 0, 0) scale(${mix(1, compact ? 1.012 : 1.02, scene9WarmPush)})`;
    const scene10Transform = `translate3d(0, 0, 0) scale(${mix(1.015, 1, rangeProgress(scene910Progress, [.72, .86]))})`;
    const warmIn = rangeProgress(scene910Progress, [.18, .48]);
    const warmOut = 1 - rangeProgress(scene910Progress, [.48, .72]);
    const warmOpacity = .52 * Math.max(warmIn * warmOut, 0);
    if (tailProgress >= tailTimeline.scene9To10[0]) {
      setLayer(n.scene9, scene9Exit, 1 + (scene9WarmPush * (compact ? .012 : .02)));
    }
    if (n.warmMask) {
      n.warmMask.style.opacity = warmOpacity.toFixed(3);
      n.warmMask.style.visibility = warmOpacity > .001 ? "visible" : "hidden";
    }

    const ambientAvailable = mediaReady[5] && videos[5]?.dataset.failed !== "true";
    const ambientDisplay = getDisplayState(videos[5]);
    const ambientProgress = rangeProgress(scene910Progress, [.72, 1]);
    scrub(videos[5], ambientAvailable, ambientProgress, VIDEO_SCRUB_RANGE.scene10Ambient, scene910Progress >= .72);
    const ambientOpacity = ambientAvailable && ambientDisplay.frameReady ? rangeProgress(scene910Progress, [.76, .82]) : 0;
    const staticScene10Opacity = scene10Reveal * (1 - ambientOpacity);
    setMediaLayer(n.scene10, staticScene10Opacity, scene10Transform, `circle(${mix(0, 100, scene10Reveal)}% at 78% 16%)`);
    setLayer(n.scene10Ambient, ambientOpacity, 1);
    const scene9Copy = rangeProgress(tailProgress, [.60, .66]) * (1 - rangeProgress(tailProgress, tailTimeline.scene9To10));
    const scene10Copy = rangeProgress(scene910Progress, [.86, 1]);
    n.copy8.style.opacity = Math.min(Number(n.copy8.style.opacity), scene8Copy).toFixed(3);
    n.copy8.style.visibility = Number(n.copy8.style.opacity) > .001 ? "visible" : "hidden";
    n.copy9.style.opacity = scene9Copy.toFixed(3);
    n.copy9.style.visibility = scene9Copy > .001 ? "visible" : "hidden";
    n.copy10.style.opacity = scene10Copy.toFixed(3);
    n.copy10.style.visibility = scene10Copy > .001 ? "visible" : "hidden";

  };
  const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
  videos.forEach((video) => video?.pause());
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  render();
}

function addVideoScrub(timeline, video, range, startTime, endTime) {
  if (!video) return;
  const state = { progress: 0 };
  let frame = 0;
  let ready = Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 1;
  if (!ready) {
    video.addEventListener("loadedmetadata", () => {
      ready = Number.isFinite(video.duration) && video.duration > 0;
    }, { once: true });
  }
  timeline.to(state, {
    progress: 1,
    duration: range[1] - range[0],
    onUpdate: () => {
      if (!ready) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = video.duration * (startTime + (endTime - startTime) * state.progress);
        if (Math.abs(video.currentTime - target) > .012) video.currentTime = target;
      });
    }
  }, range[0]);
}

function revealStaticFallback() {
  document.documentElement.classList.add("no-gsap");
  document.querySelectorAll(".sw-layer, .sw-copy").forEach((element) => {
    element.style.opacity = "";
    element.style.visibility = "";
    element.style.transform = "";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", boot, { once: true });
} else {
  boot();
}
window.setTimeout(boot, 0);
