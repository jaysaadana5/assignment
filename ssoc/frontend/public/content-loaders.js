// ===== CONTENT LOADERS =====
// FOMO Counter, Testimonials, FAQ, Advocates, Sponsors, Footer, Site Data Application

// Load and animate FOMO counter
async function loadFomoCounter() {
    try {
        console.log('Loading FOMO counter from:', `${API_URL}/registrations/count`);
        const response = await fetch(`${API_URL}/registrations/count`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const counts = await response.json();
        console.log('FOMO counts received:', counts);
        
        // Get the actual counts with fallback to 0
        const contributorCount = parseInt(counts.contributor) || 0;
        const mentorCount = parseInt(counts.mentor) || 0;
        const projectCount = parseInt(counts['project-admin']) || 0;
        
        // Animate the numbers
        animateCounter('fomoContributorCount', contributorCount);
        animateCounter('fomoMentorCount', mentorCount);
        animateCounter('fomoProjectCount', projectCount);
        
        console.log('FOMO counts loaded successfully:', { contributorCount, mentorCount, projectCount });
    } catch (error) {
        console.error('Error loading FOMO counts:', error);
        // Set to 0 on error to show the counter is working
        updateCounterValue('fomoContributorCount', 0);
        updateCounterValue('fomoMentorCount', 0);
        updateCounterValue('fomoProjectCount', 0);
    }
}

// Update FOMO counters from combined data (no extra API call needed)
function updateFomoFromData(counts) {
    animateCounter('fomoContributorCount', counts.contributor || 0);
    animateCounter('fomoMentorCount', counts.mentor || 0);
    animateCounter('fomoProjectCount', counts.projectAdmin || 0);
}

// Auto-update FOMO counter every 30 seconds
let fomoInterval = null;

function startFomoAutoUpdate() {
    // Clear any existing interval
    if (fomoInterval) clearInterval(fomoInterval);
    
    // Update every 30 seconds
    fomoInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/registrations/count`);
            const counts = await response.json();
            
            // Update counts without animation for subtle refresh
            updateCounterValue('fomoContributorCount', counts.contributor || 0);
            updateCounterValue('fomoMentorCount', counts.mentor || 0);
            updateCounterValue('fomoProjectCount', counts['project-admin'] || 0);
            
            console.log('FOMO counts auto-updated:', counts);
        } catch (error) {
            console.error('Error auto-updating FOMO counts:', error);
        }
    }, 30000); // 30 seconds
}

// Update counter value without animation
function updateCounterValue(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`FOMO counter element not found: ${elementId}`);
        return;
    }
    const targetNum = parseInt(target) || 0;
    element.textContent = targetNum === 0 ? '0' : targetNum.toLocaleString() + '+';
}

// Animate counter from 0 to target
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`FOMO counter element not found: ${elementId}`);
        return;
    }
    
    // Ensure target is a valid number
    const targetNum = parseInt(target) || 0;
    
    // If target is 0, just set it immediately
    if (targetNum === 0) {
        element.textContent = '0';
        return;
    }
    
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (targetNum - start) * easeOut);
        
        element.textContent = current.toLocaleString() + '+';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Ensure final value is set correctly
            element.textContent = targetNum.toLocaleString() + '+';
        }
    }
    
    requestAnimationFrame(update);
}

// Update registration buttons to show closed status
function updateRegistrationButtons() {
    const formStatus = window.ssocFormStatus || { contributor: true, mentor: true, projectAdmin: true };
    
    const buttons = [
        { selector: '[onclick*="contributor"]', status: formStatus.contributor, label: 'Contributor' },
        { selector: '[onclick*="mentor"]', status: formStatus.mentor, label: 'Mentor' },
        { selector: '[onclick*="project-admin"]', status: formStatus.projectAdmin, label: 'Project Admin' }
    ];
    
    buttons.forEach(({ selector, status, label }) => {
        const btn = document.querySelector(selector);
        if (btn && status === false) {
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            btn.title = `${label} registration is currently closed`;
        }
    });
}

// ===== APPLY SITE DATA TO DOM =====
function applySiteData(siteData) {
    if (!siteData || Object.keys(siteData).length === 0) {
        console.log('No site data found in localStorage');
        return;
    }
    
    // Hero Badge
    if (siteData.heroBadge) {
        const el = document.querySelector('[data-field="hero-badge"]');
        if (el) el.textContent = siteData.heroBadge;
    }
    
    // Hero Duration
    if (siteData.heroDuration) {
        const el = document.querySelector('[data-field="hero-duration"]');
        if (el) el.textContent = siteData.heroDuration;
    }
    
    // Hero Stats
    if (siteData.heroContributors) {
        const el = document.querySelector('[data-field="hero-contributors"]');
        if (el) el.textContent = siteData.heroContributors;
    }
    if (siteData.heroProjects) {
        const el = document.querySelector('[data-field="hero-projects"]');
        if (el) el.textContent = siteData.heroProjects;
    }
    if (siteData.heroPRs) {
        const el = document.querySelector('[data-field="hero-prs"]');
        if (el) el.textContent = siteData.heroPRs;
    }
    
    // Hero Description (preserve inner span)
    if (siteData.heroDescription) {
        const el = document.querySelector('[data-field="hero-description"]');
        if (el) {
            const durationText = siteData.heroDuration || el.querySelector('[data-field="hero-duration"]')?.textContent || '';
            el.innerHTML = siteData.heroDescription + ' <span class="highlight" data-field="hero-duration">' + durationText + '</span>';
        }
    }
    
    // About Section
    if (siteData.aboutMonths) {
        const aboutMonthsEl = document.querySelector('[data-field="about-months"]');
        if (aboutMonthsEl) aboutMonthsEl.textContent = siteData.aboutMonths;
        
        const aboutDurationEl = document.querySelector('[data-field="about-duration"]');
        if (aboutDurationEl) aboutDurationEl.textContent = siteData.aboutMonths + '-month long open source program';
    }
    
    // Timeline
    const timelineFields = ['timeline-reg-start', 'timeline-reg-end', 'timeline-coding-start', 'timeline-coding-end', 'timeline-result'];
    const timelineKeys = ['timelineRegStart', 'timelineRegEnd', 'timelineCodingStart', 'timelineCodingEnd', 'timelineResult'];
    
    timelineFields.forEach((field, index) => {
        if (siteData[timelineKeys[index]]) {
            const el = document.querySelector(`[data-field="${field}"]`);
            if (el) el.textContent = siteData[timelineKeys[index]];
        }
    });
    
    // Stats Counter Targets
    const statFields = ['stat-contributors', 'stat-prs', 'stat-projects', 'stat-countries', 'stat-orgs'];
    const statKeys = ['statContributors', 'statPRs', 'statProjects', 'statCountries', 'statOrgs'];
    
    statFields.forEach((field, index) => {
        if (siteData[statKeys[index]]) {
            const el = document.querySelector(`[data-field="${field}"]`);
            if (el) el.setAttribute('data-target', siteData[statKeys[index]]);
        }
    });
    
    console.log('Site data applied to DOM');
}

// ===== LOAD TESTIMONIALS FROM API =====
async function loadTestimonialsData() {
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();
        console.log('Testimonials:', testimonials.length, 'items');
        
        if (testimonials.length > 0 && testimonialCarousel) {
            testimonialCarousel.innerHTML = testimonials.map(t => `
                <div class="testimonial-card">
                    <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                    <div class="stars">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <p>"${t.quote}"</p>
                    <div class="testimonial-author">
                        <img src="${t.image}" alt="${t.name}" onerror="this.src='https://via.placeholder.com/100'">
                        <div class="author-info">
                            <span class="author-name">${t.name}</span>
                            <span class="author-role">${t.role}</span>
                        </div>
                    </div>
                    ${t.achievement ? `<span class="achievement-badge">${t.achievement}</span>` : ''}
                </div>
            `).join('');
            
            // Reinitialize carousel after loading
            setTimeout(() => {
                initTestimonialsCarousel();
            }, 100);
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// ===== LOAD FAQ FROM API =====
async function loadFAQData() {
    try {
        const response = await fetch(`${API_URL}/faqs`);
        const faqs = await response.json();
        console.log('FAQs:', faqs.length, 'items');
        
        const faqContainer = document.querySelector('.faq-container');
        
        if (faqs.length > 0 && faqContainer) {
        faqContainer.innerHTML = faqs.map(f => `
            <div class="faq-item">
                <button class="faq-question">
                    <div class="faq-icon"><i class="fas fa-circle-question"></i></div>
                    <span>${f.question}</span>
                    <i class="fas fa-chevron-down faq-arrow"></i>
                </button>
                <div class="faq-answer">
                    <p>${f.answer}</p>
                </div>
            </div>
        `).join('');
        
            // Reinitialize FAQ accordion
            initFAQAccordion();
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

// ===== LOAD CAMPUS ADVOCATES FROM API =====
let advocatesCache = null;
const ADVOCATES_PER_BATCH = 8; // Show 8 advocates initially
let displayedAdvocatesCount = 0;

async function loadCampusAdvocates() {
    const grid = document.getElementById('advocatesGrid');
    const cta = document.getElementById('advocatesCta');
    
    if (!grid) return;
    
    // Use cache if available
    if (advocatesCache) {
        console.log('Using cached advocates data');
        renderAdvocatesProgressive(grid, advocatesCache, cta);
        return;
    }
    
    // Show loading skeleton immediately
    grid.innerHTML = `
        <div class="advocate-card skeleton" style="opacity: 0.6;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: #2a2a2a;"></div>
            <div style="width: 80%; height: 20px; margin: 12px auto 8px; background: #2a2a2a; border-radius: 4px;"></div>
            <div style="width: 60%; height: 16px; margin: 0 auto; background: #2a2a2a; border-radius: 4px;"></div>
        </div>
        <div class="advocate-card skeleton" style="opacity: 0.6;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: #2a2a2a;"></div>
            <div style="width: 80%; height: 20px; margin: 12px auto 8px; background: #2a2a2a; border-radius: 4px;"></div>
            <div style="width: 60%; height: 16px; margin: 0 auto; background: #2a2a2a; border-radius: 4px;"></div>
        </div>
    `;
    
    try {
        // Try the optimized /active endpoint first, fallback to regular endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        let response;
        try {
            response = await fetch(`${API_URL}/campus-advocates/active`, {
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Active endpoint failed');
        } catch (e) {
            // Fallback to regular endpoint
            console.log('Falling back to regular endpoint');
            clearTimeout(timeoutId);
            response = await fetch(`${API_URL}/campus-advocates`);
        }
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let advocates = await response.json();
        
        // Filter active only if we used the regular endpoint
        advocates = advocates.filter(a => a.isActive !== false);
        
        console.log('Campus Advocates loaded:', advocates.length, 'items');
        
        // Cache the data
        advocatesCache = advocates;
        
        renderAdvocatesProgressive(grid, advocates, cta);
        
    } catch (error) {
        console.error('Error loading campus advocates:', error);
        grid.innerHTML = `
            <div class="advocates-empty" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load advocates. Please refresh.</p>
            </div>
        `;
    }
}

function renderAdvocatesProgressive(grid, advocates, cta) {
    if (!advocates || advocates.length === 0) {
        grid.innerHTML = `
            <div class="advocates-empty" style="grid-column: 1 / -1;">
                <i class="fas fa-graduation-cap"></i>
                <p>Campus Advocates coming soon!</p>
            </div>
        `;
        if (cta) cta.style.display = 'block';
        return;
    }
    
    // Reset counter
    displayedAdvocatesCount = 0;
    grid.innerHTML = '';
    
    // Render first batch immediately
    const firstBatch = advocates.slice(0, ADVOCATES_PER_BATCH);
    grid.innerHTML = renderAdvocateCards(firstBatch);
    displayedAdvocatesCount = firstBatch.length;
    
    // If there are more advocates, add "Show More" button
    if (advocates.length > ADVOCATES_PER_BATCH) {
        const showMoreContainer = document.createElement('div');
        showMoreContainer.id = 'showMoreAdvocates';
        showMoreContainer.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px;';
        showMoreContainer.innerHTML = `
            <button onclick="loadMoreAdvocates()" style="
                background: linear-gradient(135deg, #8b5cf6, #d35dab);
                color: white;
                border: none;
                padding: 12px 32px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-plus" style="margin-right: 8px;"></i>
                Show More Advocates (${advocates.length - displayedAdvocatesCount} remaining)
            </button>
        `;
        grid.appendChild(showMoreContainer);
    }
    
    // Show CTA
    if (cta) cta.style.display = 'block';
}

function loadMoreAdvocates() {
    const grid = document.getElementById('advocatesGrid');
    const showMoreBtn = document.getElementById('showMoreAdvocates');
    
    if (!advocatesCache || !grid) return;
    
    // Get next batch
    const nextBatch = advocatesCache.slice(displayedAdvocatesCount, displayedAdvocatesCount + ADVOCATES_PER_BATCH);
    
    // Remove the "Show More" button temporarily
    if (showMoreBtn) showMoreBtn.remove();
    
    // Append new cards
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderAdvocateCards(nextBatch);
    while (tempDiv.firstChild) {
        grid.appendChild(tempDiv.firstChild);
    }
    
    displayedAdvocatesCount += nextBatch.length;
    
    // If there are still more, add the button back
    if (displayedAdvocatesCount < advocatesCache.length) {
        const showMoreContainer = document.createElement('div');
        showMoreContainer.id = 'showMoreAdvocates';
        showMoreContainer.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px;';
        showMoreContainer.innerHTML = `
            <button onclick="loadMoreAdvocates()" style="
                background: linear-gradient(135deg, #8b5cf6, #d35dab);
                color: white;
                border: none;
                padding: 12px 32px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-plus" style="margin-right: 8px;"></i>
                Show More Advocates (${advocatesCache.length - displayedAdvocatesCount} remaining)
            </button>
        `;
        grid.appendChild(showMoreContainer);
    }
}

function renderAdvocateCards(advocates) {
    const getPlaceholder = (name) => {
        const initial = (name || 'A').charAt(0).toUpperCase();
        return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='%238b5cf6' width='100' height='100' rx='50'/><text x='50%25' y='50%25' font-size='36' font-family='Arial' fill='white' text-anchor='middle' dy='.35em'>${initial}</text></svg>`;
    };
    
    return advocates.map(a => {
        const placeholder = getPlaceholder(a.name);
        return `
        <div class="advocate-card" data-testid="advocate-card">
            <img src="${a.photo || placeholder}" 
                 alt="${a.name}" 
                 class="advocate-photo"
                 loading="lazy"
                 onerror="this.src='${placeholder}'">
            <h3 class="advocate-name">${a.name}</h3>
            <p class="advocate-college">${a.college}</p>
            <p class="advocate-city"><i class="fas fa-map-marker-alt"></i>${a.city}</p>
            ${a.bio ? `<p class="advocate-bio">${a.bio}</p>` : ''}
            <div class="advocate-socials">
                ${a.linkedin ? `<a href="${a.linkedin}" target="_blank" rel="noopener" class="linkedin" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
                ${a.instagram ? `<a href="${a.instagram}" target="_blank" rel="noopener" class="instagram" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                ${a.twitter ? `<a href="${a.twitter}" target="_blank" rel="noopener" class="twitter" title="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
            </div>
        </div>
    `}).join('');
}

// ===== LOAD SPONSORS FROM API =====
async function loadSponsors() {
    try {
        const response = await fetch(`${API_URL}/sponsors`);
        const sponsors = await response.json();
        console.log('Sponsors:', sponsors.length, 'items');
        
        const container = document.getElementById('sponsorsContainer');
        if (!container) return;
        
        // Filter active sponsors only
        const activeSponsors = sponsors.filter(s => s.isActive !== false);
        
        if (activeSponsors.length === 0) {
            container.innerHTML = `
                <div class="sponsors-empty">
                    <i class="fas fa-handshake"></i>
                    <p>Sponsors coming soon!</p>
                </div>
                <div class="become-sponsor">
                    <h3>Become a Sponsor</h3>
                    <p>Partner with SSoC and reach thousands of developers</p>
                    <a href="mailto:sponsors@ssoc.io" class="btn btn-primary">
                        <i class="fas fa-envelope"></i>
                        Contact Us
                    </a>
                </div>
            `;
            return;
        }
        
        // Group sponsors by category
        const categories = ['platinum', 'gold', 'silver', 'bronze', 'community'];
        const categoryNames = {
            'platinum': 'Platinum Partners',
            'gold': 'Gold Partners',
            'silver': 'Silver Partners',
            'bronze': 'Bronze Partners',
            'community': 'Community Partners'
        };
        
        let html = '';
        
        categories.forEach(category => {
            const categorySponsors = activeSponsors.filter(s => s.category === category);
            if (categorySponsors.length > 0) {
                html += `
                    <div class="sponsor-tier ${category}">
                        <h3 class="sponsor-tier-title">${categoryNames[category]}</h3>
                        <div class="sponsor-logos">
                            ${categorySponsors.map(s => `
                                <a href="${s.website}" target="_blank" rel="noopener sponsored" class="sponsor-logo" title="${s.name}">
                                    <img src="${s.logo}" alt="${s.name}" onerror="this.parentElement.innerHTML='<span style=\\'font-weight:600;color:#666;\\'>${s.name}</span>'">
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += `
            <div class="become-sponsor">
                <h3>Become a Sponsor</h3>
                <p>Partner with SSoC and reach thousands of developers</p>
                <a href="mailto:sponsors@ssoc.io" class="btn btn-primary">
                    <i class="fas fa-envelope"></i>
                    Contact Us
                </a>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

// ===== LOAD FOOTER FROM API =====
async function loadFooterData() {
    try {
        // Fetch footer data and content pages in parallel
        const [footerResponse, pagesResponse] = await Promise.all([
            fetch(`${API_URL}/footer`),
            fetch(`${API_URL}/pages`)
        ]);
        
        const footerData = await footerResponse.json();
        const contentPages = await pagesResponse.json();
        console.log('Footer data:', footerData);
        console.log('Content pages:', contentPages);
        
        // Filter published pages by category
        const publishedPages = contentPages.filter(p => p.isPublished);
        const legalPages = publishedPages.filter(p => p.category === 'legal');
        const resourcePages = publishedPages.filter(p => p.category === 'resource');
        const communityPages = publishedPages.filter(p => p.category === 'community');
        
        // Update brand description
        const brandDesc = document.querySelector('.footer-brand p');
        if (brandDesc && footerData.brandDescription) {
            brandDesc.textContent = footerData.brandDescription;
        }
        
        // Update social links
        const socialContainer = document.querySelector('.social-links');
        if (socialContainer && footerData.socialLinks) {
            const social = footerData.socialLinks;
            const socialIcons = {
                github: 'fab fa-github',
                twitter: 'fab fa-twitter',
                linkedin: 'fab fa-linkedin',
                instagram: 'fab fa-instagram',
                discord: 'fab fa-discord',
                youtube: 'fab fa-youtube'
            };
            
            socialContainer.innerHTML = Object.entries(social)
                .filter(([key, url]) => url && url !== '#')
                .map(([key, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer"><i class="${socialIcons[key] || 'fas fa-link'}"></i></a>`)
                .join('');
        }
        
        // Update footer link sections
        const footerGrid = document.querySelector('.footer-grid');
        if (footerGrid) {
            const linkSections = footerGrid.querySelectorAll('.footer-links');
            
            // Program Links (first section after brand)
            if (linkSections[0]) {
                const programLinks = footerData.programLinks || [];
                if (programLinks.length > 0) {
                    const programHtml = programLinks.map(link => 
                        `<a href="${link.url}">${link.label}</a>`
                    ).join('');
                    linkSections[0].innerHTML = `<h4>Program</h4>${programHtml}`;
                }
            }
            
            // Resource Links - combine manual links with resource content pages (avoid duplicates)
            if (linkSections[1]) {
                const manualResources = (footerData.resourceLinks || []);
                const existingLabels = new Set(manualResources.map(l => l.label.toLowerCase()));
                
                const manualHtml = manualResources.map(link => 
                    `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${link.label}</a>`
                );
                const pageHtml = resourcePages
                    .filter(page => !existingLabels.has(page.title.toLowerCase()))
                    .map(page => `<a href="page.html?slug=${page.slug}">${page.title}</a>`);
                
                const allResources = [...manualHtml, ...pageHtml];
                if (allResources.length > 0) {
                    linkSections[1].innerHTML = `<h4>Resources</h4>${allResources.join('')}`;
                } else {
                    linkSections[1].innerHTML = `<h4>Resources</h4><a href="projects.html">Projects</a><a href="mentors.html">Mentors</a>`;
                }
            }
            
            // Community Links - combine manual links with community content pages (avoid duplicates)
            if (linkSections[2]) {
                const manualCommunity = (footerData.communityLinks || []);
                const existingLabels = new Set(manualCommunity.map(l => l.label.toLowerCase()));
                
                const manualHtml = manualCommunity.map(link => 
                    `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${link.label}</a>`
                );
                const pageHtml = communityPages
                    .filter(page => !existingLabels.has(page.title.toLowerCase()))
                    .map(page => `<a href="page.html?slug=${page.slug}">${page.title}</a>`);
                
                const allCommunity = [...manualHtml, ...pageHtml];
                if (allCommunity.length > 0) {
                    linkSections[2].innerHTML = `<h4>Community</h4>${allCommunity.join('')}`;
                } else {
                    linkSections[2].innerHTML = `<h4>Community</h4><a href="#">Discord</a><a href="#">Twitter</a>`;
                }
            }
            
            // Legal Links - combine manual links with legal content pages (avoid duplicates)
            if (linkSections[3]) {
                const manualLegal = (footerData.legalLinks || []);
                const existingLabels = new Set(manualLegal.map(l => l.label.toLowerCase()));
                
                const manualHtml = manualLegal.map(link => 
                    `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${link.label}</a>`
                );
                const pageHtml = legalPages
                    .filter(page => !existingLabels.has(page.title.toLowerCase()))
                    .map(page => `<a href="page.html?slug=${page.slug}">${page.title}</a>`);
                
                const allLegal = [...manualHtml, ...pageHtml];
                if (allLegal.length > 0) {
                    linkSections[3].innerHTML = `<h4>Legal</h4>${allLegal.join('')}`;
                }
            }
        }
        
        // Update copyright text
        const copyright = document.querySelector('.footer-bottom p:first-child');
        if (copyright && footerData.copyrightText) {
            copyright.textContent = footerData.copyrightText;
        }
        
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

