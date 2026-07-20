"use strict";

document.documentElement.classList.add("js");

let scrollWorldBooted = false;

function bootScrollWorld() {
  if (scrollWorldBooted) return;
  scrollWorldBooted = true;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const stickyBar = document.getElementById("sticky-bar");
  const footer = document.getElementById("footer");

  document.querySelectorAll("[data-event='cta_click']").forEach((link) => {
    link.addEventListener("click", handleCtaClick);
  });

  setupFaq();
  setupStickyCta(stickyBar, footer);
  setupSimpleReveal(reduceMotion || !hasGsap);

  if (!hasGsap || reduceMotion) {
    document.documentElement.classList.add("no-gsap");
    revealStatic();
    return;
  }

  document.documentElement.classList.remove("sw-static");
  window.gsap.registerPlugin(window.ScrollTrigger);
  setupScrollWorld(window.gsap, window.ScrollTrigger);
  window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => window.ScrollTrigger.refresh(), 180);
  }, { passive: true });
}

function handleCtaClick(event) {
  console.debug("CTA click", {
    platform: event.currentTarget.dataset.platform,
    position: event.currentTarget.dataset.position
  });
}

function setupFaq() {
  const items = Array.from(document.querySelectorAll(".faq-item"));
  items.forEach((item) => {
    const button = item.querySelector(".faq-q");
    const panel = item.querySelector(".faq-a");
    if (!button || !panel) return;
    panel.style.setProperty("--faq-height", `${panel.scrollHeight}px`);
    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("open");
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
      });
      if (shouldOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        panel.style.setProperty("--faq-height", `${panel.scrollHeight}px`);
      }
    });
  });
}

function setupStickyCta(stickyBar, footer) {
  if (!stickyBar) return;
  document.body.classList.add("has-sticky");
  const update = () => {
    const mid = document.querySelector(".mid-cta");
    const scene09 = document.getElementById("scene-09");
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pastWorld = mid ? scrollY + innerHeight * .8 > mid.offsetTop : scrollY / scrollable > .2;
    const nearExit = scene09 ? scene09.getBoundingClientRect().top < innerHeight * .82 : false;
    stickyBar.classList.toggle("show", scrollY / scrollable > .15 && (nearExit || pastWorld));
  };
  update();
  addEventListener("scroll", update, { passive: true });
  if (footer && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => stickyBar.classList.toggle("hide-near-footer", entry.isIntersecting));
    }, { rootMargin: "0px 0px -18% 0px", threshold: .01 });
    observer.observe(footer);
  }
}

function setupSimpleReveal(staticMode) {
  const items = [...document.querySelectorAll(".coach-story > *, .testi-card, .faq-item, .scarcity-box, .final-world .cta-row, .small-note")];
  items.forEach((item) => item.classList.add("reveal-item"));
  if (staticMode || !("IntersectionObserver" in window)) {
    items.forEach(clearInlineState);
    return;
  }
  items.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(24px)";
    item.style.transition = "opacity .65s ease, transform .65s ease";
  });
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.opacity = "1";
    entry.target.style.transform = "translateY(0)";
    observer.unobserve(entry.target);
  }), { threshold: .14 });
  items.forEach((item) => observer.observe(item));
}

const SCENE_LENGTHS = {
  "01": 160, "02": 130, "03": 180, "04": 150, "05": 170,
  "06": 160, "07": 130, "08": 130, "09": 130, "10": 190
};

function setupScrollWorld(gsap, ScrollTrigger) {
  const mm = gsap.matchMedia();
  const scenes = Array.from(document.querySelectorAll(".scrollworld .sw-scene"));

  const buildScene = (scene, compact) => {
    const number = scene.dataset.scene;
    const length = SCENE_LENGTHS[number] || 140;
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: scene.dataset.scrolltriggerId || `sw-scene-${number}`,
        trigger: scene,
        start: "top top",
        end: `+=${compact ? Math.round(length * .72) : length}%`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    const media = scene.querySelector(".sw-scene__media");
    const copy = scene.querySelector(".sw-scene__copy");
    const title = scene.querySelector(".sw-scene__title");
    timeline.fromTo(media, { scale: 1 }, { scale: compact ? 1.045 : 1.1, ease: "none", duration: 1 }, 0);
    timeline.fromTo(copy, { y: compact ? 12 : 22, opacity: .72 }, { y: 0, opacity: 1, duration: .24, ease: "power2.out" }, .08);
    timeline.to(title, { letterSpacing: ".01em", duration: .28, ease: "none" }, .26);
    timeline.to(media, { scale: compact ? 1.08 : 1.14, ease: "none", duration: .44 }, .5);
    return timeline;
  };

  mm.add("(min-width: 760px)", () => {
    setupEntryTransition(gsap, ScrollTrigger, false);
    scenes.forEach((scene) => buildScene(scene, false));
    gsap.fromTo(".coach-photo-card", { x: 70, opacity: 0 }, { x: 0, opacity: 1, scrollTrigger: { trigger: ".coach-world", start: "top 72%", end: "top 34%", scrub: true } });
    gsap.to(".space-bg", { scale: 1.08, scrollTrigger: { trigger: ".space-world", start: "top bottom", end: "bottom top", scrub: true } });
  });

  mm.add("(max-width: 759px)", () => {
    setupEntryTransition(gsap, ScrollTrigger, true);
    scenes.forEach((scene) => buildScene(scene, true));
    gsap.set(".scrollworld .sw-scene__copy", { clearProps: "opacity,transform" });
    gsap.fromTo(".coach-photo-card", { y: 28, opacity: 0 }, { y: 0, opacity: 1, scrollTrigger: { trigger: ".coach-world", start: "top 78%", end: "top 46%", scrub: true } });
  });
}

function setupEntryTransition(gsap, ScrollTrigger, compact) {
  const section = document.getElementById("sw-entry-transition");
  const scene1 = document.querySelector(".sw-entry-layer--scene1");
  const scene2 = document.querySelector(".sw-entry-layer--scene2");
  const copy1 = document.querySelector(".sw-entry-copy--scene1");
  const copy2 = document.querySelector(".sw-entry-copy--scene2");
  const doorMask = document.querySelector(".sw-entry-door-mask");
  const thresholdShadow = document.querySelector(".sw-entry-shadow");
  if (!section || !scene1 || !scene2 || !copy1 || !copy2 || !doorMask || !thresholdShadow) return;

  gsap.set(copy2, { opacity: 0, y: 18 });
  gsap.set(scene2, { clipPath: "inset(31% 14% 27% 35% round 14px)", scale: 1.1 });
  gsap.set(doorMask, { inset: "31% 14% 27% 35%", opacity: .8 });
  gsap.set(thresholdShadow, { opacity: 0 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "sw-entry-transition",
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      anticipatePin: 1
    }
  });

  // Approach: keep the exterior fixed while the entrance grows toward the camera.
  timeline.to(copy1, { opacity: 0, y: -8, duration: .25, ease: "power1.out" }, .02);
  timeline.to(scene1, { scale: compact ? 1.3 : 1.36, x: compact ? "0.7vw" : "1vw", y: compact ? "-0.5vh" : "-1vh", duration: .62, ease: "none" }, .04);

  // Threshold: reveal the interior inside the measured doorway, then open the mask.
  timeline.to(scene2, { scale: compact ? 1.025 : 1, duration: .38, ease: "power1.inOut" }, .42);
  timeline.to(scene2, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: .38, ease: "power2.inOut" }, .5);
  timeline.to(doorMask, { inset: "0% 0% 0% 0%", borderRadius: 0, opacity: 0, duration: .32, ease: "power2.inOut" }, .52);
  timeline.to(thresholdShadow, { opacity: compact ? .2 : .24, duration: .08, ease: "power1.out" }, .43);
  timeline.to(thresholdShadow, { opacity: 0, duration: .13, ease: "power1.in" }, .51);

  // Arrival: wait until the interior owns the frame before introducing its copy.
  timeline.to(copy2, { opacity: 1, y: 0, duration: .2, ease: "power2.out" }, .78);
  timeline.to(scene2, { scale: compact ? 1.018 : 1.025, duration: .2, ease: "none" }, .84);
}

function revealStatic() {
  document.querySelectorAll(".scrollworld .sw-scene, .scrollworld .sw-scene__media, .scrollworld .sw-scene__copy, .sw-entry-transition, .sw-entry-stage, .sw-entry-layer, .sw-entry-copy, .sw-entry-door-mask, .sw-entry-shadow, .reveal-item, .coach-photo-card, .coach-photo-card img").forEach(clearInlineState);
}

function clearInlineState(element) {
  element.style.opacity = "";
  element.style.transform = "";
  element.style.transition = "";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootScrollWorld, { once: true });
  window.addEventListener("load", bootScrollWorld, { once: true });
} else {
  bootScrollWorld();
}

window.setTimeout(bootScrollWorld, 0);
