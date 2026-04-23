/* ===== Theme, navigation, reveals, and cursor ===== */
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleIcon = document.getElementById("themeToggleIcon");
    const themeToggleLabel = document.getElementById("themeToggleLabel");
    const themeColorMeta = document.getElementById("themeColorMeta");
    const menuToggle = document.getElementById("menuToggle");
    const menuPanel = document.getElementById("siteMenu");
    const header = document.querySelector(".site-header");
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const revealItems = document.querySelectorAll(".reveal");
    const sections = document.querySelectorAll(".section-observed");
    const cursor = document.querySelector(".cursor");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsCursor = window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion.matches;
    const themeModes = ["auto", "light", "dark"];
    const themeKey = "rjx7-theme-mode";

    const themeIcons = {
        auto: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="11.5" rx="1.8"></rect>
                <path d="M9.5 20h5M12 16.5V20"></path>
            </svg>
        `,
        light: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5"></circle>
                <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"></path>
            </svg>
        `,
        dark: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.5 14.8A7.5 7.5 0 0 1 9.2 5.5a8.5 8.5 0 1 0 9.3 9.3z"></path>
            </svg>
        `
    };

    function getStoredThemeMode() {
        try {
            return localStorage.getItem(themeKey) || "auto";
        } catch (error) {
            return "auto";
        }
    }

    function resolveTheme(mode) {
        return mode === "auto" ? (prefersDark.matches ? "dark" : "light") : mode;
    }

    function updateThemeToggle(mode) {
        if (!themeToggle || !themeToggleIcon || !themeToggleLabel) {
            return;
        }

        themeToggleIcon.innerHTML = themeIcons[mode];
        themeToggleLabel.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        themeToggle.setAttribute(
            "aria-label",
            `Theme setting: ${themeToggleLabel.textContent}. Activate to cycle through Light, Dark, and Auto.`
        );
    }

    function updateThemeColor(resolvedTheme) {
        if (!themeColorMeta) {
            return;
        }

        themeColorMeta.setAttribute("content", resolvedTheme === "dark" ? "#141210" : "#f6f0e8");
    }

    function applyTheme(mode, persist = true) {
        const resolvedTheme = resolveTheme(mode);

        root.dataset.mode = mode;
        root.dataset.theme = resolvedTheme;
        updateThemeToggle(mode);
        updateThemeColor(resolvedTheme);

        if (!persist) {
            return;
        }

        try {
            localStorage.setItem(themeKey, mode);
        } catch (error) {
            /* Ignore storage access issues */
        }
    }

    function cycleTheme() {
        const currentMode = root.dataset.mode || "auto";
        const nextMode = themeModes[(themeModes.indexOf(currentMode) + 1) % themeModes.length];
        applyTheme(nextMode);
    }

    /* ===== Mobile navigation ===== */
    function setMenuState(open) {
        if (!menuToggle || !menuPanel) {
            return;
        }

        menuToggle.classList.toggle("is-open", open);
        menuPanel.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        menuPanel.setAttribute("aria-hidden", String(!open && window.innerWidth < 768));
        body.classList.toggle("menu-open", open);
        header.classList.remove("is-hidden");
    }

    /* ===== Scroll-based header state ===== */
    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    function updateHeaderState() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        header.classList.toggle("is-condensed", currentScrollY > 32);

        if (!body.classList.contains("menu-open")) {
            if (currentScrollY <= 16 || scrollDelta < -8) {
                header.classList.remove("is-hidden");
            } else if (currentScrollY > 120 && scrollDelta > 8) {
                header.classList.add("is-hidden");
            }
        }

        lastScrollY = currentScrollY;
        scrollTicking = false;
    }

    /* ===== Section reveals ===== */
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -10% 0px"
        }
    );

    /* ===== Active section highlighting ===== */
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const activeId = `#${entry.target.id}`;
                navLinks.forEach((link) => {
                    const isActive = link.getAttribute("href") === activeId;
                    link.classList.toggle("is-active", isActive);
                    if (isActive) {
                        link.setAttribute("aria-current", "page");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        },
        {
            threshold: 0.45,
            rootMargin: "-35% 0px -45% 0px"
        }
    );

    /* ===== Custom cursor ===== */
    function enableCursor() {
        if (!supportsCursor || !cursor) {
            return;
        }

        body.classList.add("has-custom-cursor");
        cursor.classList.add("is-hidden");

        const pointer = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
        const current = {
            x: pointer.x,
            y: pointer.y
        };

        function renderCursor() {
            current.x += (pointer.x - current.x) * 0.2;
            current.y += (pointer.y - current.y) * 0.2;
            cursor.style.transform = `translate(${current.x}px, ${current.y}px)`;
            window.requestAnimationFrame(renderCursor);
        }

        document.addEventListener("pointermove", (event) => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            cursor.classList.remove("is-hidden");
            cursor.classList.toggle("is-hovering", Boolean(event.target.closest("a, button")));
        });

        document.addEventListener("pointerleave", () => {
            cursor.classList.add("is-hidden");
        });

        document.addEventListener("pointerdown", () => {
            cursor.classList.add("is-hovering");
        });

        document.addEventListener("pointerup", (event) => {
            cursor.classList.toggle("is-hovering", Boolean(event.target.closest("a, button")));
        });

        window.requestAnimationFrame(renderCursor);
    }

    /* ===== Boot ===== */
    applyTheme(getStoredThemeMode(), false);
    updateHeaderState();

    if (themeToggle) {
        themeToggle.addEventListener("click", cycleTheme);
    }

    prefersDark.addEventListener("change", () => {
        if ((root.dataset.mode || "auto") === "auto") {
            applyTheme("auto", false);
        }
    });

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const nextState = !menuToggle.classList.contains("is-open");
            setMenuState(nextState);
        });
    }

    if (menuPanel) {
        menuPanel.setAttribute("aria-hidden", String(window.innerWidth < 768));
        menuPanel.addEventListener("click", (event) => {
            if (event.target === menuPanel) {
                setMenuState(false);
            }
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => setMenuState(false));
    });

    document.querySelectorAll(".nav-link--external").forEach((link) => {
        link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });

    window.addEventListener(
        "scroll",
        () => {
            if (scrollTicking) {
                return;
            }

            scrollTicking = true;
            window.requestAnimationFrame(updateHeaderState);
        },
        { passive: true }
    );

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) {
            setMenuState(false);
        }
    });

    revealItems.forEach((item) => revealObserver.observe(item));
    sections.forEach((section) => sectionObserver.observe(section));
    enableCursor();
});
