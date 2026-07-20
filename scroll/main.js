"use strict";

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stickyBar = document.getElementById("sticky-bar");
  const footer = document.getElementById("footer");

  document.querySelectorAll("[data-event='cta_click']").forEach((link) => {
    link.addEventListener("click", handleCtaClick);
  });

  setupFaq();
  setupStickyCta(stickyBar, footer);
  const canUseGsap = !reduceMotion && window.gsap && window.ScrollTrigger;
  setupSimpleReveal(reduceMotion || !canUseGsap);

  if (!canUseGsap) {
    document.documentElement.classList.add("no-gsap");
    showStaticWorld();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  setupScrollWorld(gsap, ScrollTrigger);

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
  }, { passive: true });
});

function handleCtaClick(event) {
  const data = {
    platform: event.currentTarget.dataset.platform,
    position: event.currentTarget.dataset.position
  };
  console.debug("CTA click", data);
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
        const otherButton = other.querySelector(".faq-q");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });

      if (shouldOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        panel.style.setProperty("--faq-height", `${panel.scrollHeight}px`);
      }
    });
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".faq-a").forEach((panel) => {
      panel.style.setProperty("--faq-height", `${panel.scrollHeight}px`);
    });
  }, { passive: true });
}

function setupStickyCta(stickyBar, footer) {
  if (!stickyBar) return;
  document.body.classList.add("has-sticky");

  let canShow = false;
  const updateSticky = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const midCta = document.querySelector(".mid-cta");
    const pastStory = midCta ? window.scrollY + window.innerHeight * 0.72 > midCta.offsetTop : true;
    canShow = window.scrollY / scrollable > 0.15 && pastStory;
    stickyBar.classList.toggle("show", canShow);
  };

  updateSticky();
  window.addEventListener("scroll", updateSticky, { passive: true });

  if (footer && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        stickyBar.classList.toggle("hide-near-footer", entry.isIntersecting);
      });
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.01 });
    footerObserver.observe(footer);
  }
}

function setupSimpleReveal(reduceMotion) {
  const revealItems = [
    ...document.querySelectorAll(".coach-story > *, .testi-card, .faq-item, .scarcity-box, .final-world .cta-row, .small-note")
  ];
  revealItems.forEach((item) => item.classList.add("reveal-item"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => {
      item.style.opacity = "";
      item.style.transform = "";
      item.style.transition = "";
    });
    return;
  }

  revealItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(24px)";
    item.style.transition = "opacity .65s ease, transform .65s ease";
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      io.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => io.observe(item));
}

function setupScrollWorld(gsap, ScrollTrigger) {
  const mm = gsap.matchMedia();

  gsap.from(".ability-ring li", {
    opacity: 0,
    y: 16,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out"
  });

  mm.add("(min-width: 760px)", () => {
    gsap.timeline({
      scrollTrigger: {
        id: "sw-hero-gap",
        trigger: ".sw-hero",
        start: "top top",
        end: "+=85%",
        pin: true,
        scrub: true
      }
    })
      .to(".ability-ring li", { opacity: 1, scale: 1, stagger: 0.03, duration: 0.22 })
      .from(".result-drop", { opacity: 0, scale: 0.72, y: 24, duration: 0.32 })
      .to(".ability-dashboard", { "--result-glow": 1, duration: 0.3 });

    gsap.timeline({
      scrollTrigger: {
        id: "sw-effort-system",
        trigger: ".system-scene",
        start: "top top",
        end: "+=90%",
        pin: true,
        scrub: true
      }
    })
      .from(".machine-node", { opacity: 0, y: 22, stagger: 0.06, duration: 0.35 })
      .from(".interference", { opacity: 0, y: -26, stagger: 0.1, duration: 0.35 }, 0.35)
      .to(".machine-output", { x: -34, opacity: 0.58, duration: 0.35 }, 0.54)
      .from(".system-lines p, .sw-emphasis", { opacity: 0, y: 18, stagger: 0.12, duration: 0.48 }, 0.12);

    gsap.timeline({
      scrollTrigger: {
        id: "sw-drive-axis",
        trigger: ".axis-scene",
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: true
      }
    })
      .from(".axis-row", { opacity: 0, y: 18, stagger: 0.08, duration: 0.38 })
      .from(".axis-row i", { left: "50%", stagger: 0.08, duration: 0.55 }, 0.28)
      .from(".axis-translation", { opacity: 0, y: 14, duration: 0.28 }, 0.62);

    gsap.timeline({
      scrollTrigger: {
        id: "sw-energy-layers",
        trigger: ".energy-scene",
        start: "top top",
        end: "+=115%",
        pin: true,
        scrub: true
      }
    })
      .from(".energy-layers li", { opacity: 0, x: 36, stagger: 0.08, duration: 0.5 });

    gsap.timeline({
      scrollTrigger: {
        id: "sw-personal-map",
        trigger: ".report-map-scene",
        start: "top top",
        end: "+=130%",
        pin: true,
        scrub: true
      }
    })
      .from(".personal-map section", { opacity: 0, y: 28, stagger: 0.12, duration: 0.52 })
      .from(".report-preview span", { opacity: 0, scale: 0.86, stagger: 0.08, duration: 0.38 }, 0.34);

    gsap.timeline({
      scrollTrigger: {
        id: "sw-report-handoff",
        trigger: ".handoff-scene",
        start: "top top",
        end: "+=95%",
        pin: true,
        scrub: true
      }
    })
      .from(".report-sheet", { opacity: 0, y: -34, rotate: -5, stagger: 0.12, duration: 0.52 })
      .to(".report-sheet", { x: 0, y: 0, rotate: 0, stagger: 0.05, duration: 0.34 }, 0.54)
      .from(".hands-shape", { opacity: 0, y: 24, duration: 0.3 }, 0.62);

    gsap.from(".coach-photo-card", {
      x: 70,
      opacity: 0,
      scrollTrigger: {
        trigger: ".coach-world",
        start: "top 72%",
        end: "top 34%",
        scrub: true
      }
    });

    gsap.to(".coach-photo-card img", {
      scale: 1.045,
      scrollTrigger: {
        trigger: ".coach-world",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".space-bg", {
      scale: 1.08,
      scrollTrigger: {
        trigger: ".space-world",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  mm.add("(max-width: 759px)", () => {
    gsap.set(".sw-scene *", { clearProps: "opacity,transform,visibility" });

    gsap.from(".coach-photo-card", {
      y: 34,
      opacity: 0,
      scrollTrigger: {
        trigger: ".coach-world",
        start: "top 76%",
        end: "top 44%",
        scrub: true
      }
    });
  });
}

function showStaticWorld() {
  document.querySelectorAll(".sw-scene *, .reveal-item, .coach-photo-card, .coach-photo-card img").forEach((element) => {
    element.style.opacity = "";
    element.style.transform = "";
    element.style.transition = "";
  });
}
