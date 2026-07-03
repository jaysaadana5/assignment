// ===== SSOC WEBSITE SCRIPT =====
// This script handles all dynamic functionality including loading data from API

// ===== API BASE URL =====
const API_URL = window.location.origin + '/api';

// ===== GLOBAL VARIABLES =====
let navbar, mobileMenuBtn, mobileMenu, modal, modalIcon, modalTitle;
let experienceGroup, registrationForm, newsletterForm, toast;
let testimonialCarousel, prevBtn, nextBtn, carouselDots;
let currentSlide = 0;
let cards, totalCards, cardsPerView, maxSlide;
let currentRole = '';
let statsAnimated = false;

// ===== WAIT FOR DOM TO BE READY =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing SSoC website...');
    
    // Track referral link clicks
    trackReferralClick();
    
    // Initialize DOM element references
    initDOMElements();
    
    // Load data from API (synced across all devices)
    loadAllSiteData();
    
    // Initialize all interactive features (wrapped to prevent cascade failure)
    const safeInit = (fn, name) => { try { if (typeof fn === 'function') fn(); } catch(e) { console.error(`Init ${name} failed:`, e); } };
    safeInit(initNavbarScroll, 'NavbarScroll');
    safeInit(initMobileMenu, 'MobileMenu');
    safeInit(initModalEvents, 'ModalEvents');
    safeInit(initFormSubmissions, 'FormSubmissions');
    safeInit(initTestimonialsCarousel, 'Carousel');
    safeInit(initFAQAccordion, 'FAQAccordion');
    safeInit(initStatsAnimation, 'StatsAnimation');
    safeInit(initSmoothScroll, 'SmoothScroll');
    
    console.log('SSoC website initialized successfully');
});

// ===== TRACK REFERRAL LINK CLICKS =====
function trackReferralClick() {
    // Check for ref parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        console.log('Referral code detected:', refCode);
        
        // Store ref code for later use during registration
        sessionStorage.setItem('ssoc_ref', refCode);
        
        // Track the click
        fetch(`${API_URL}/referral-links/${refCode}/click`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Referral click tracked:', data);
        })
        .catch(error => {
            console.error('Error tracking referral click:', error);
        });
    }
}

// ===== INITIALIZE DOM ELEMENTS =====
function initDOMElements() {
    navbar = document.getElementById('navbar');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileMenu = document.getElementById('mobileMenu');
    modal = document.getElementById('registrationModal');
    modalIcon = document.getElementById('modalIcon');
    modalTitle = document.getElementById('modalTitle');
    experienceGroup = document.getElementById('experienceGroup');
    registrationForm = document.getElementById('registrationForm');
    newsletterForm = document.getElementById('newsletterForm');
    toast = document.getElementById('toast');
    testimonialCarousel = document.getElementById('testimonialCarousel');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    carouselDots = document.getElementById('carouselDots');
}

// ===== LOAD ALL DATA FROM API =====
async function loadAllSiteData() {
    console.log('Loading all site data...');
    
    try {
        // SINGLE API call for ALL data
        const initRes = await fetch(`${API_URL}/public/init`);
        if (!initRes.ok) throw new Error(`Init failed: ${initRes.status}`);
        const data = await initRes.json();
        if (data.error) throw new Error(data.error);
        
        // Apply site data (hero, timeline, stats)
        if (data.siteData) applySiteData(data.siteData);
        
        // Set form status and apply links
        window.ssocApplyLinks = data.applyLinks || {};
        window.ssocFormStatus = data.formStatus || { contributor: true, mentor: true, projectAdmin: true };
        
        // FOMO counter from combined data
        if (data.registrationCounts) updateFomoFromData(data.registrationCounts);
        
        // Render testimonials inline
        if (data.testimonials && data.testimonials.length > 0 && testimonialCarousel) {
            testimonialCarousel.innerHTML = data.testimonials.map(t => `
                <div class="testimonial-card">
                    <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p>"${t.quote}"</p>
                    <div class="testimonial-author">
                        <img src="${t.image}" alt="${t.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/></svg>'">
                        <div class="author-info">
                            <span class="author-name">${t.name}</span>
                            <span class="author-role">${t.role}</span>
                        </div>
                    </div>
                    ${t.achievement ? `<span class="achievement-badge">${t.achievement}</span>` : ''}
                </div>
            `).join('');
            setTimeout(() => initTestimonialsCarousel(), 100);
        }
        
        // Render FAQs inline
        const faqContainer = document.querySelector('.faq-container');
        if (data.faqs && data.faqs.length > 0 && faqContainer) {
            faqContainer.innerHTML = data.faqs.map(f => `
                <div class="faq-item">
                    <button class="faq-question">
                        <div class="faq-icon"><i class="fas fa-circle-question"></i></div>
                        <span>${f.question}</span>
                        <i class="fas fa-chevron-down faq-arrow"></i>
                    </button>
                    <div class="faq-answer"><p>${f.answer}</p></div>
                </div>
            `).join('');
            initFAQAccordion();
        }
        
        // Render sponsors inline
        const sponsorsContainer = document.getElementById('sponsorsContainer');
        if (sponsorsContainer) {
            const activeSponsors = (data.sponsors || []).filter(s => s.isActive !== false);
            if (activeSponsors.length === 0) {
                sponsorsContainer.innerHTML = `
                    <div class="sponsors-empty"><i class="fas fa-handshake"></i><p>Sponsors coming soon!</p></div>
                    <div class="become-sponsor"><h3>Become a Sponsor</h3><p>Partner with SSoC and reach thousands of developers</p>
                        <a href="mailto:sponsors@ssoc.io" class="btn btn-primary"><i class="fas fa-envelope"></i> Contact Us</a>
                    </div>`;
            } else {
                const categories = ['platinum', 'gold', 'silver', 'bronze', 'community'];
                const categoryNames = { platinum: 'Platinum Partners', gold: 'Gold Partners', silver: 'Silver Partners', bronze: 'Bronze Partners', community: 'Community Partners' };
                let html = '';
                categories.forEach(cat => {
                    const catSponsors = activeSponsors.filter(s => s.category === cat);
                    if (catSponsors.length > 0) {
                        html += `<div class="sponsor-tier ${cat}"><h3 class="sponsor-tier-title">${categoryNames[cat]}</h3>
                            <div class="sponsor-logos">${catSponsors.map(s => `<a href="${s.website}" target="_blank" rel="noopener sponsored" class="sponsor-logo" title="${s.name}"><img src="${s.logo}" alt="${s.name}" onerror="this.parentElement.innerHTML='<span style=\\'font-weight:600;color:#666;\\'>${s.name}</span>'"></a>`).join('')}</div></div>`;
                    }
                });
                html += `<div class="become-sponsor"><h3>Become a Sponsor</h3><p>Partner with SSoC and reach thousands of developers</p><a href="mailto:sponsors@ssoc.io" class="btn btn-primary"><i class="fas fa-envelope"></i> Contact Us</a></div>`;
                sponsorsContainer.innerHTML = html;
            }
        }
        
        // Render campus advocates inline
        const grid = document.getElementById('advocatesGrid');
        const cta = document.getElementById('advocatesCta');
        if (grid) {
            const advocates = (data.advocates || []).filter(a => a.isActive !== false);
            advocatesCache = advocates;
            renderAdvocatesProgressive(grid, advocates, cta);
        }
        
        // Render footer inline  
        if (data.footer) {
            const footerData = data.footer;
            const contentPages = data.pages || [];
            const legalPages = contentPages.filter(p => p.category === 'legal');
            const resourcePages = contentPages.filter(p => p.category === 'resource');
            const communityPages = contentPages.filter(p => p.category === 'community');
            
            const brandDesc = document.querySelector('.footer-brand p');
            if (brandDesc && footerData.brandDescription) brandDesc.textContent = footerData.brandDescription;
            
            const socialContainer = document.querySelector('.social-links');
            if (socialContainer && footerData.socialLinks) {
                const socialIcons = { github: 'fab fa-github', twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin', instagram: 'fab fa-instagram', discord: 'fab fa-discord', youtube: 'fab fa-youtube' };
                socialContainer.innerHTML = Object.entries(footerData.socialLinks)
                    .filter(([key, url]) => url && url !== '#')
                    .map(([key, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer"><i class="${socialIcons[key] || 'fas fa-link'}"></i></a>`)
                    .join('');
            }
            
            const footerGrid = document.querySelector('.footer-grid');
            if (footerGrid) {
                const linkSections = footerGrid.querySelectorAll('.footer-links');
                if (linkSections[0]) {
                    const programLinks = footerData.programLinks || [];
                    if (programLinks.length > 0) linkSections[0].innerHTML = `<h4>Program</h4>${programLinks.map(l => `<a href="${l.url}">${l.label}</a>`).join('')}`;
                }
                if (linkSections[1]) {
                    const manualResources = footerData.resourceLinks || [];
                    const existingLabels = new Set(manualResources.map(l => l.label.toLowerCase()));
                    const allRes = [...manualResources.map(l => `<a href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank"' : ''}>${l.label}</a>`),
                        ...resourcePages.filter(p => !existingLabels.has(p.title.toLowerCase())).map(p => `<a href="page.html?slug=${p.slug}">${p.title}</a>`)];
                    linkSections[1].innerHTML = allRes.length > 0 ? `<h4>Resources</h4>${allRes.join('')}` : `<h4>Resources</h4><a href="projects.html">Projects</a><a href="mentors.html">Mentors</a>`;
                }
                if (linkSections[2]) {
                    const manualCommunity = footerData.communityLinks || [];
                    const existingLabels = new Set(manualCommunity.map(l => l.label.toLowerCase()));
                    const allCom = [...manualCommunity.map(l => `<a href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank"' : ''}>${l.label}</a>`),
                        ...communityPages.filter(p => !existingLabels.has(p.title.toLowerCase())).map(p => `<a href="page.html?slug=${p.slug}">${p.title}</a>`)];
                    linkSections[2].innerHTML = allCom.length > 0 ? `<h4>Community</h4>${allCom.join('')}` : `<h4>Community</h4><a href="#">Blog</a>`;
                }
                if (linkSections[3]) {
                    const manualLegal = footerData.legalLinks || [];
                    const existingLabels = new Set(manualLegal.map(l => l.label.toLowerCase()));
                    const allLegal = [...manualLegal.map(l => `<a href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank"' : ''}>${l.label}</a>`),
                        ...legalPages.filter(p => !existingLabels.has(p.title.toLowerCase())).map(p => `<a href="page.html?slug=${p.slug}">${p.title}</a>`)];
                    linkSections[3].innerHTML = allLegal.length > 0 ? `<h4>Legal</h4>${allLegal.join('')}` : `<h4>Legal</h4><a href="#">Privacy Policy</a>`;
                }
            }
        }
        
        updateRegistrationButtons();
        startFomoAutoUpdate();
        console.log('All site data loaded via single combined endpoint');
        
    } catch (e) {
        console.warn('Combined endpoint failed, falling back to individual calls:', e);
        // Fallback: individual API calls
        const advocatesPromise = loadCampusAdvocates();
        const sponsorsPromise = loadSponsors();
        try {
            const siteDataRes = await fetch(`${API_URL}/site-data`);
            applySiteData(await siteDataRes.json());
        } catch (err) { console.error('Site data error:', err); }
        await Promise.allSettled([loadTestimonialsData(), loadFAQData(), advocatesPromise, sponsorsPromise, loadFooterData()]);
        try {
            const [linksRes, formStatusRes] = await Promise.all([fetch(`${API_URL}/apply-links`), fetch(`${API_URL}/form-status`)]);
            window.ssocApplyLinks = await linksRes.json();
            window.ssocFormStatus = await formStatusRes.json();
        } catch (err) {
            window.ssocApplyLinks = {};
            window.ssocFormStatus = { contributor: true, mentor: true, projectAdmin: true };
        }
        updateRegistrationButtons();
        loadFomoCounter();
        startFomoAutoUpdate();
    }
}

