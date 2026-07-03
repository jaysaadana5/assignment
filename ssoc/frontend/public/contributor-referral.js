// Contributor Referral & Leaderboard widget on homepage
(function() {
    const API_URL = window.location.origin + '/api';

    function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    function buildShareText(name, fullUrl) {
        const lines = [
            `🚀 I'm contributing to Social Summer of Code Season 5${name ? ' as ' + name : ''}!`,
            ``,
            `Join me — register through my link and get into amazing open-source projects:`,
            fullUrl,
            ``,
            `#SSoC #SSoCSeason5 #OpenSource #SocialSummerOfCode`,
        ];
        return lines.join('\n');
    }

    function showError(msg) {
        const el = document.getElementById('referError');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
    }
    function clearError() {
        const el = document.getElementById('referError');
        if (el) el.classList.remove('show');
    }

    function renderResult(link) {
        const result = document.getElementById('referResult');
        if (!result) return;
        const fullUrl = `${window.location.origin}/?ref=${encodeURIComponent(link.code)}`;
        document.getElementById('referUrl').textContent = fullUrl;
        document.getElementById('referStatClicks').textContent = link.clicks || 0;
        document.getElementById('referStatRegs').textContent = link.registrations || 0;
        const text = buildShareText(link.contributorName || '', fullUrl);
        document.getElementById('referShareX').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        document.getElementById('referShareLi').href = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
        document.getElementById('referShareWa').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

        // Wire copy button (idempotent — replace listener)
        const copyBtn = document.getElementById('referCopy');
        const newCopy = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopy, copyBtn);
        newCopy.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(fullUrl); }
            catch(e) {
                const ta = document.createElement('textarea');
                ta.value = fullUrl; document.body.appendChild(ta);
                ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            }
            newCopy.classList.add('copied');
            newCopy.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { newCopy.classList.remove('copied'); newCopy.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
        });

        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function generateLink(email) {
        clearError();
        const res = await fetch(`${API_URL}/contributor-referral/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
            const msg = (data && typeof data.detail === 'string') ? data.detail : 'Could not generate link';
            throw new Error(msg);
        }
        return data.link;
    }

    async function loadLeaderboard() {
        const lb = document.getElementById('referLeaderboard');
        if (!lb) return;
        try {
            const res = await fetch(`${API_URL}/contributor-leaderboard?limit=100`);
            const data = await res.json();
            // Backwards-compatible: old API returned an array, new API returns {leaderboard, total}
            const rows = Array.isArray(data) ? data : (data.leaderboard || []);
            const total = Array.isArray(data) ? rows.length : (data.total || rows.length);
            if (!rows || rows.length === 0) {
                lb.innerHTML = `
                    <div class="refer-lb-empty">
                        <i class="fas fa-trophy"></i>
                        <p>Be the first one on the leaderboard! Generate your link and start sharing.</p>
                    </div>
                `;
                return;
            }
            const note = total > rows.length
                ? `<div class="refer-lb-note">Top ${rows.length} of ${total} referrers</div>`
                : `<div class="refer-lb-note">${total} active referrer${total === 1 ? '' : 's'}</div>`;
            lb.innerHTML = note + rows.map((r, i) => {
                const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                const display = r.name && r.name !== r.email_masked ? esc(r.name) : esc(r.email_masked);
                return `
                    <div class="refer-lb-row ${rankClass}" data-testid="refer-lb-row">
                        <div class="rank">${i + 1}</div>
                        <div class="name">${display}<small>${esc(r.email_masked)}</small></div>
                        <div class="stat-c" title="Clicks">${r.clicks}</div>
                        <div class="stat-r" title="Sign-ups">${r.registrations}</div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            lb.innerHTML = `
                <div class="refer-lb-empty">
                    <i class="fas fa-triangle-exclamation"></i>
                    <p>Couldn't load the leaderboard right now.</p>
                </div>
            `;
        }
    }

    function init() {
        const form = document.getElementById('referForm');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const email = document.getElementById('referEmail').value.trim();
            if (!email) return;
            btn.disabled = true;
            try {
                const link = await generateLink(email);
                renderResult(link);
                // Refresh leaderboard
                loadLeaderboard();
            } catch (err) {
                showError(err.message);
            } finally {
                btn.disabled = false;
            }
        });
        loadLeaderboard();
        // Refresh leaderboard every 30 seconds for live updates
        setInterval(loadLeaderboard, 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
