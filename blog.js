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

    function renderPosts() {
        const postsRoot = document.getElementById('blogPosts');
        const countEl = document.getElementById('blogArticlesCount');

        if (countEl) countEl.textContent = String(posts.length);
        if (!postsRoot) return;

        postsRoot.innerHTML = posts
            .map((p) => {
                const tag = p.category || 'Article';
                const tags = (p.tags || []).slice(0, 2).map((t) => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('');

                return `
                <article class="blog-card">
                    <div class="blog-card-meta">
                        <div class="blog-date">
                            <span class="blog-date-text">${escapeHtml(p.date || '')}</span>
                            <span class="blog-readtime">${escapeHtml(p.readTime || '')}</span>
                        </div>
                        <span class="blog-chip">${escapeHtml(tag)}</span>
                    </div>

                    <h2 class="blog-card-title">${escapeHtml(p.title)}</h2>
                    <p class="blog-card-excerpt">${escapeHtml(p.excerpt)}</p>

                    <div class="blog-card-footer">
                        <div class="blog-tags">${tags}</div>
                        <a class="blog-read" href="article.html?slug=${encodeURIComponent(p.slug)}">
                            Read Article <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </article>`;
            })
            .join('');
    }

    // Newsletter is handled by newsletter.js

    renderPosts();
})();
