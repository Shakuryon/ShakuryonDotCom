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
