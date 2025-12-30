(function () {
    const STORAGE_KEY = 'portfolio-theme';

    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;

        // Default stays dark (as requested). If user OS prefers light, we can start light.
        // Keeping it subtle: only pick light automatically when explicitly preferred.
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        return prefersLight ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }

        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === 'light' ? 'light_mode' : 'dark_mode';
        }

        // Mermaid (article diagrams): try to re-render on theme change.
        if (window.mermaid && typeof window.mermaid.initialize === 'function') {
            try {
                const mermaidTheme = theme === 'light' ? 'default' : 'dark';
                window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
                if (typeof window.mermaid.run === 'function') {
                    window.mermaid.run({ querySelector: '.mermaid' });
                }
            } catch {
                // ignore
            }
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    function boot() {
        const theme = getPreferredTheme();
        applyTheme(theme);

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }
    }

    // Ensure DOM is ready for icon lookup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
