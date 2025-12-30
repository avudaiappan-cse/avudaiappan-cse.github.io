(function () {
    const posts = window.__BLOG_POSTS__ || [];

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    function findPost(slug) {
        if (!slug) return posts[0] || null;
        return posts.find((p) => p.slug === slug) || null;
    }

    function renderKickers(kickers) {
        const el = document.getElementById('articleKickers');
        if (!el) return;
        const items = (kickers || []).slice(0, 3);
        el.innerHTML = items.map((k) => `<span class="article-pill">${escapeHtml(k)}</span>`).join('');
    }

    function renderBody(post) {
        const bodyEl = document.getElementById('articleBody');
        if (!bodyEl) return;

        const sections = post?.content?.sections || [];

        bodyEl.innerHTML = sections
            .map((s) => {
                if (s.quote) {
                    return `<blockquote class="article-quote">${escapeHtml(s.quote)}</blockquote>`;
                }

                const heading = s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : '';
                const paragraphs = (s.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');

                let diagram = '';
                if (s.diagram?.kind === 'mermaid' && s.diagram?.value) {
                    const title = s.diagram.title ? `<div class="article-diagram-title">${escapeHtml(s.diagram.title)}</div>` : '';
                    // Mermaid renders from the diagram text inside .mermaid
                    diagram = `
                        <div class="article-diagram">
                            ${title}
                            <div class="mermaid">${escapeHtml(s.diagram.value)}</div>
                        </div>`;
                }

                let code = '';
                if (s.code?.value) {
                    const file = s.code.fileName ? `<div class="code-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="code-title">${escapeHtml(s.code.fileName)}</div>` : '';
                    code = `
                        <div class="article-code">
                            <div class="article-code-header">${file}</div>
                            <pre><code>${escapeHtml(s.code.value)}</code></pre>
                        </div>`;
                }

                return `<section class="article-section">${heading}${paragraphs}${diagram}${code}</section>`;
            })
            .join('');

        // Mermaid: initialize after the HTML is in the DOM
        if (window.mermaid && bodyEl.querySelector('.mermaid')) {
            try {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                window.mermaid.initialize({ startOnLoad: false, theme: isLight ? 'default' : 'dark' });
                // Mermaid v10/v11:
                if (typeof window.mermaid.run === 'function') {
                    window.mermaid.run({ querySelector: '.mermaid' });
                }
            } catch (e) {
                // If Mermaid isn't available (offline), the raw diagram text remains visible.
                console.warn('Mermaid render failed:', e);
            }
        }
    }

    function setMeta(post) {
        document.title = `${post.title} • Avudaiappan S`;

        const title = document.getElementById('articleTitle');
        const intro = document.getElementById('articleIntro');
        const date = document.getElementById('articleDate');
        const rt = document.getElementById('articleReadTime');
        const author = document.getElementById('articleAuthor');
        const role = document.getElementById('articleRole');

        if (title) title.textContent = post.title;
        if (intro) intro.textContent = post.content?.intro || '';
        if (date) date.textContent = post.date || '';
        if (rt) rt.textContent = post.readTime || '';
        if (author) author.textContent = post.author?.name || 'Avudaiappan S';
        if (role) role.textContent = post.author?.role || 'Senior Frontend Developer';

        renderKickers(post.heroKicker || post.tags || []);
        renderBody(post);
    }

    function wirePrevNext(activeSlug) {
        const idx = posts.findIndex((p) => p.slug === activeSlug);
        const prev = idx > 0 ? posts[idx - 1] : null;
        const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

        const navEl = document.querySelector('.article-nav');
        const prevEl = document.getElementById('prevArticle');
        const nextEl = document.getElementById('nextArticle');

        // Single-post (or missing neighbors): only show cards that exist.
        if (navEl) {
            navEl.style.display = prev || next ? '' : 'none';
        }

        if (prevEl) {
            if (prev) {
                prevEl.style.display = '';
                prevEl.href = `article.html?slug=${encodeURIComponent(prev.slug)}`;
                prevEl.setAttribute('aria-disabled', 'false');
                prevEl.querySelector('.article-nav-title').textContent = prev.title;
            } else {
                prevEl.style.display = 'none';
            }
        }

        if (nextEl) {
            if (next) {
                nextEl.style.display = '';
                nextEl.href = `article.html?slug=${encodeURIComponent(next.slug)}`;
                nextEl.setAttribute('aria-disabled', 'false');
                nextEl.querySelector('.article-nav-title').textContent = next.title;
            } else {
                nextEl.style.display = 'none';
            }
        }
    }

    function wireShare(post) {
        const url = `${window.location.origin}${window.location.pathname}?slug=${encodeURIComponent(post.slug)}`;
        const text = `${post.title} — ${url}`;

        document.querySelectorAll('[data-share]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-share');
                if (target === 'twitter') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }
                if (target === 'linkedin') {
                    window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                        '_blank'
                    );
                }
            });
        });

    }

    function boot() {
        const slug = getSlug();
        const post = findPost(slug);

        if (!post) {
            document.getElementById('articleTitle').textContent = 'Article not found';
            return;
        }

        setMeta(post);
        wirePrevNext(post.slug);
        wireShare(post);
    }

    boot();
})();
