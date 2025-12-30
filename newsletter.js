(function () {
    const NEWSLETTER_ACCESS_KEY = '7539aac3-897b-42ce-b5be-c013578fb25e';
    let modalElement = null;

    function createModal() {
        if (modalElement) return modalElement;

        const modal = document.createElement('div');
        modal.id = 'newsletterModal';
        modal.className = 'newsletter-modal';
        modal.innerHTML = `
            <div class="newsletter-modal-backdrop"></div>
            <div class="newsletter-modal-content">
                <button class="newsletter-modal-close" aria-label="Close">&times;</button>
                <div class="newsletter-modal-icon">
                    <span class="material-symbols-outlined">mail</span>
                </div>
                <h3 class="newsletter-modal-title">Subscribe to Newsletter</h3>
                <p class="newsletter-modal-subtitle">Get notified about new posts on frontend architecture and engineering insights. No spam, ever.</p>
                <form class="newsletter-modal-form" id="newsletterModalForm">
                    <input type="email" class="newsletter-modal-input" id="newsletterModalEmail" placeholder="you@email.com" required />
                    <button type="submit" class="btn btn-primary newsletter-modal-btn" id="newsletterModalSubmit">Subscribe</button>
                </form>
                <p class="newsletter-modal-note">Unsubscribe anytime.</p>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .newsletter-modal {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 9999;
                align-items: center;
                justify-content: center;
            }
            .newsletter-modal.active {
                display: flex;
            }
            .newsletter-modal-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
            }
            .newsletter-modal-content {
                position: relative;
                background: var(--bg-card, #1e1e2e);
                border: 1px solid var(--border-color, #2a2a3e);
                border-radius: 1rem;
                padding: 2.5rem;
                max-width: 420px;
                width: 90%;
                text-align: center;
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
                animation: modalSlideIn 0.25s ease;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .newsletter-modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-secondary, #a0a0b0);
                cursor: pointer;
                line-height: 1;
                padding: 0.25rem;
            }
            .newsletter-modal-close:hover {
                color: var(--text-primary, #fff);
            }
            .newsletter-modal-icon {
                width: 60px;
                height: 60px;
                border-radius: 16px;
                display: grid;
                place-items: center;
                margin: 0 auto 1rem;
                background: rgba(139, 92, 246, 0.14);
                border: 1px solid rgba(139, 92, 246, 0.26);
            }
            .newsletter-modal-icon .material-symbols-outlined {
                font-size: 28px;
                color: var(--accent-primary, #8b5cf6);
            }
            .newsletter-modal-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: var(--text-primary, #fff);
            }
            .newsletter-modal-subtitle {
                color: var(--text-secondary, #a0a0b0);
                font-size: 0.95rem;
                margin-bottom: 1.5rem;
                line-height: 1.5;
            }
            .newsletter-modal-form {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                justify-content: center;
            }
            .newsletter-modal-input {
                flex: 1;
                min-width: 200px;
                padding: 0.85rem 1rem;
                border-radius: 0.5rem;
                border: 1px solid var(--border-color, #2a2a3e);
                background: var(--bg-primary, #0f0f1e);
                color: var(--text-primary, #fff);
                font-size: 1rem;
                outline: none;
            }
            .newsletter-modal-input:focus {
                border-color: rgba(139, 92, 246, 0.6);
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
            }
            .newsletter-modal-btn {
                white-space: nowrap;
            }
            .newsletter-modal-note {
                margin-top: 1rem;
                font-size: 0.8rem;
                color: var(--text-muted, #6b7280);
            }
            html[data-theme="light"] .newsletter-modal-content {
                background: #fff;
                border-color: rgba(15, 23, 42, 0.1);
            }
            html[data-theme="light"] .newsletter-modal-input {
                background: #f8fafc;
                border-color: rgba(15, 23, 42, 0.15);
                color: #0f172a;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);
        modalElement = modal;

        // Event listeners
        modal.querySelector('.newsletter-modal-backdrop').addEventListener('click', closeModal);
        modal.querySelector('.newsletter-modal-close').addEventListener('click', closeModal);
        modal.querySelector('#newsletterModalForm').addEventListener('submit', handleModalSubmit);

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        return modal;
    }

    function showNewsletterModal(source) {
        const modal = createModal();
        modal.dataset.source = source;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.querySelector('#newsletterModalEmail').focus();
        }, 100);
    }

    function closeModal() {
        if (modalElement) {
            modalElement.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function handleModalSubmit(e) {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterModalEmail');
        const email = emailInput.value.trim();
        const source = modalElement.dataset.source || 'Website';

        if (!isValidEmail(email)) {
            emailInput.focus();
            return;
        }

        subscribeToNewsletter(email, source, emailInput, true);
    }

    function initNewsletterForms() {
        // Blog page newsletter button
        const blogNewsletterBtn = document.getElementById('newsletterBtn');
        if (blogNewsletterBtn) {
            blogNewsletterBtn.addEventListener('click', () => {
                showNewsletterModal('Blog Page');
            });
        }

        // Article page newsletter form
        const articleSubscribe = document.getElementById('articleSubscribe');
        if (articleSubscribe) {
            articleSubscribe.addEventListener('click', () => {
                handleInlineSubscribe('.article-input[type="email"]', 'Article Page');
            });
        }

        // Generic newsletter forms (works on any page)
        const genericNewsletterBtns = document.querySelectorAll('[data-newsletter-btn]');
        genericNewsletterBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const inputSelector = btn.getAttribute('data-newsletter-input') || `#${btn.id}-input`;
                const source = btn.getAttribute('data-newsletter-source') || 'Website';
                handleInlineSubscribe(inputSelector, source);
            });
        });

        // Any element with data-newsletter-prompt triggers the prompt modal
        const promptBtns = document.querySelectorAll('[data-newsletter-prompt]');
        promptBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const source = btn.getAttribute('data-newsletter-source') || 'Website';
                showNewsletterModal(source);
            });
        });
    }

    function handleInlineSubscribe(inputSelector, source) {
        const emailInput = document.querySelector(inputSelector);
        if (!emailInput) {
            showNewsletterModal(source);
            return;
        }

        const email = emailInput.value.trim();
        if (!email) {
            emailInput.focus();
            showNewsletterModal(source);
            return;
        }

        if (!isValidEmail(email)) {
            emailInput.focus();
            return;
        }

        subscribeToNewsletter(email, source, emailInput);
    }

    async function subscribeToNewsletter(email, source, inputElement, isModal = false) {
        const modalBtn = document.getElementById('newsletterModalSubmit');
        const subscribeBtn = isModal ? modalBtn : (document.getElementById('articleSubscribe') || document.getElementById('newsletterBtn'));
        const originalText = subscribeBtn ? subscribeBtn.textContent : '';

        if (subscribeBtn) {
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Subscribing...';
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    access_key: NEWSLETTER_ACCESS_KEY,
                    subject: 'New Newsletter Subscription',
                    from_name: 'Portfolio Newsletter',
                    email: email,
                    message: `New newsletter subscription from ${source}`,
                    source: source,
                }),
            });

            const data = await response.json();

            if (data.success) {
                if (inputElement) {
                    inputElement.value = '';
                }
                if (isModal) {
                    closeModal();
                }
                // Show success with a nicer message
                setTimeout(() => {
                    alert('🎉 Thanks for subscribing! You\'ll hear from me soon.');
                }, 100);
            } else {
                throw new Error(data.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            alert('Something went wrong. Please try again or contact me directly.');
        } finally {
            if (subscribeBtn) {
                subscribeBtn.disabled = false;
                subscribeBtn.textContent = originalText;
            }
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNewsletterForms);
    } else {
        initNewsletterForms();
    }
})();
