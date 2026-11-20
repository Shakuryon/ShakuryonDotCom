document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('navbarCont');
    const scrollThres = 30; // N of pixels before transformin'

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThres) {
            mainNav.classList.add('scrolled');
            
        }

        else {
            mainNav.classList.remove('scrolled');
        }
    })

    const title = document.title;
    let i = 0;

    function typeTitle() {
        document.title = title.slice(0, i++);
        if (i <= title.length) {
            setTimeout(typeTitle, 95);
        }
    }

    typeTitle();
})

/* ==== Accessible industry dropdown: hover on desktop, tap/click on touch ==== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    const menu = dropdown.querySelector(".industry-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      const isTouch = window.matchMedia("(hover: none)").matches;
      if (!isTouch) return; // Desktop follows the link; hover/focus opens the menu.
      if (!dropdown.classList.contains("is-open")) {
        event.preventDefault();
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.blur();
      }
    });
  });
});

/* ==== ShakurWebsites Garden (Portfolio page only) ==== */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("garden-page")) return;

  /* ---- Saved choices (wrapped, since storage can be blocked) ---- */
  const MUSIC_KEY = "shakGardenMusic"; // "on" | "off"
  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (error) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (error) { /* no-op */ }
    },
  };

  /* ---- Industry filter chips ---- */
  const chips = document.querySelectorAll("[data-garden-filter]");
  const zones = document.querySelectorAll("[data-garden-zone]");

  function showGarden(key) {
    chips.forEach((chip) => {
      const isActive = chip.dataset.gardenFilter === key;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });
    zones.forEach((zone) => {
      zone.hidden = key !== "all" && zone.dataset.gardenZone !== key;
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.gardenFilter;
      showGarden(key);
      if (key !== "all") {
        const target = document.querySelector(`[data-garden-zone="${key}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---- Deep links like /portfolio/#site-heningburg open that site's notes ---- */
  if (window.location.hash.startsWith("#site-")) {
    const card = document.querySelector(window.location.hash);
    const notes = card && card.querySelector(".garden-notes");
    if (notes) notes.open = true;
  }

  /* ---- Music + welcome pop-up ---- */
  const music = document.getElementById("gardenMusic");
  const toggle = document.getElementById("gardenMusicToggle");
  const welcome = document.getElementById("gardenWelcome");
  if (!music || !toggle || !welcome) return;

  const toggleLabel = toggle.querySelector(".garden-music-label");
  let musicBroken = false;
  music.volume = 0.45;

  function setToggle(isPlaying) {
    toggle.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggleLabel.textContent = isPlaying ? "Music: On" : "Music: Off";
  }

  function hideMusic() {
    // No track in assets/audio yet (or it failed to load): keep the page quiet and tidy.
    musicBroken = true;
    music.pause();
    toggle.hidden = true;
  }

  function playMusic() {
    if (musicBroken) return;
    const attempt = music.play();
    if (attempt && attempt.then) {
      attempt.then(() => setToggle(true)).catch(() => setToggle(false));
    } else {
      setToggle(true);
    }
  }

  function pauseMusic() {
    music.pause();
    setToggle(false);
  }

  music.addEventListener("error", hideMusic);

  toggle.addEventListener("click", () => {
    if (music.paused) {
      storage.set(MUSIC_KEY, "on");
      playMusic();
    } else {
      storage.set(MUSIC_KEY, "off");
      pauseMusic();
    }
  });

  /* Pause while the tab is in the background, pick back up when it returns */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      music.pause();
    } else if (storage.get(MUSIC_KEY) === "on" && toggle.classList.contains("is-playing")) {
      playMusic();
    }
  });

  /* Pop-up: first visit only. After that, the toggle remembers the choice. */
  let lastFocus = null;

  function closeWelcome() {
    welcome.hidden = true;
    document.removeEventListener("keydown", welcomeKeys);
    if (lastFocus) lastFocus.focus();
  }

  function welcomeKeys(event) {
    if (event.key === "Escape") {
      storage.set(MUSIC_KEY, "off");
      closeWelcome();
    }
    if (event.key === "Tab") {
      const buttons = welcome.querySelectorAll("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  welcome.querySelectorAll("[data-garden-music]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.gardenMusic;
      storage.set(MUSIC_KEY, choice);
      closeWelcome();
      if (choice === "on") playMusic();
    });
  });

  welcome.addEventListener("click", (event) => {
    if (event.target === welcome) {
      storage.set(MUSIC_KEY, "off");
      closeWelcome();
    }
  });

  toggle.hidden = false;
  setToggle(false);

  if (storage.get(MUSIC_KEY) === null) {
    lastFocus = document.activeElement;
    welcome.hidden = false;
    document.addEventListener("keydown", welcomeKeys);
    const firstButton = welcome.querySelector("button");
    if (firstButton) firstButton.focus();
  }
});

/* ==== Garden extras: AI background swap + navbar color that follows each garden ==== */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("garden-page")) return;

  /* ---- Use assets/garden-bg.webp when it exists, otherwise keep the CSS garden ---- */
  const backdrop = document.getElementById("gardenBackdrop");
  if (backdrop) {
    const gardenImage = new Image();
    gardenImage.onload = () => backdrop.classList.add("has-garden-image");
    gardenImage.src = "../assets/garden-bg.webp";
  }

    /* ---- Garden video: only load it when motion makes sense ---- */
  const gardenVideo = document.getElementById("gardenVideo");
  if (gardenVideo) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;

    if (reduceMotion || saveData) {
      gardenVideo.remove(); // the still image stays
    } else {
      gardenVideo.muted = true; // required for autoplay on phones
      gardenVideo.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
      });
      gardenVideo.load();

      const playGardenVideo = () => {
        const attempt = gardenVideo.play();
        if (attempt && attempt.catch) attempt.catch(() => {});
      };

      gardenVideo.addEventListener("playing", () => gardenVideo.classList.add("is-playing"), { once: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) gardenVideo.pause();
        else playGardenVideo();
      });
      playGardenVideo();
    }
  }

  /* ---- Navbar color blending ---- */
  const nav = document.getElementById("navbarCont");
  const footer = document.getElementById("footerSection");
  const intro = document.querySelector(".garden-intro");
  const zones = [...document.querySelectorAll("[data-garden-zone]")];
  if (!nav || !footer || !zones.length) return;

  function toRgb(value) {
    const hex = value.trim().replace("#", "");
    if (hex.length === 3) {
      return [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16));
    }
    if (hex.length === 6) {
      return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    }
    const match = value.match(/\d+(\.\d+)?/g); // rgb()/rgba()
    return match ? match.slice(0, 3).map(Number) : [6, 25, 99];
  }

  function readColors(element) {
    const style = getComputedStyle(element);
    return {
      start: toRgb(style.getPropertyValue("--portfolio-bg-start")),
      end: toRgb(style.getPropertyValue("--portfolio-bg-end")),
      accent: toRgb(style.getPropertyValue("--portfolio-accent")),
    };
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const homeColors = {
    start: toRgb(rootStyle.getPropertyValue("--dark-theme-color")),
    end: toRgb(rootStyle.getPropertyValue("--dark-theme-color")),
    accent: toRgb(rootStyle.getPropertyValue("--accent-color")),
  };
  const zoneColors = new Map(zones.map((zone) => [zone, readColors(zone)]));

  /* Blend through the color wheel (HSL) so in-between colors stay vibrant instead of muddy */
  function toHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h * 60, s, l];
  }

  function fromHsl([h, s, l]) {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
  }

  function mix(a, b, t) {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const [h1, s1, l1] = toHsl(a);
    const [h2, s2, l2] = toHsl(b);
    let dh = h2 - h1;
    if (dh > 180) dh -= 360; // take the short way around the wheel
    if (dh < -180) dh += 360;
    return fromHsl([(h1 + dh * t + 360) % 360, s1 + (s2 - s1) * t, l1 + (l2 - l1) * t]);
  }
  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep

  const HOLD = 0.4; // stay on a garden's color for the first 40% of it, then blend toward the next

  function paintNav() {
    const line = nav.getBoundingClientRect().bottom + 40; // where the navbar "looks"

    // Stops: intro (home colors) → each visible garden → footer (home colors)
    const stops = [];
    if (intro) stops.push({ top: intro.getBoundingClientRect().top, colors: homeColors });
    zones.forEach((zone) => {
      if (!zone.hidden) stops.push({ top: zone.getBoundingClientRect().top, colors: zoneColors.get(zone) });
    });
    stops.push({ top: footer.getBoundingClientRect().top, colors: homeColors });

    let colors = homeColors;
    for (let i = 0; i < stops.length - 1; i += 1) {
      const here = stops[i];
      const next = stops[i + 1];
      if (line >= here.top && line < next.top) {
        const progress = (line - here.top) / Math.max(next.top - here.top, 1);
        const t = progress <= HOLD ? 0 : ease((progress - HOLD) / (1 - HOLD));
        colors = {
          start: mix(here.colors.start, next.colors.start, t),
          end: mix(here.colors.end, next.colors.end, t),
          accent: mix(here.colors.accent, next.colors.accent, t),
        };
        break;
      }
    }

    nav.style.setProperty("--nav-garden-start", rgb(colors.start));
    nav.style.setProperty("--nav-garden-end", rgb(colors.end));
    nav.style.setProperty("--nav-garden-accent", rgb(colors.accent));
    nav.style.setProperty("--nav-garden-glow", `rgba(${colors.accent.join(", ")}, 0.35)`);
  }

  let queued = false;
  function queuePaint() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      paintNav();
    });
  }

  window.addEventListener("scroll", queuePaint, { passive: true });
  window.addEventListener("resize", queuePaint);
  document.addEventListener("click", queuePaint); // filters and Shak's Notes change the layout
  paintNav();
});
