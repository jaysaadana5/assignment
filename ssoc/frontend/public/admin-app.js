// ===== ADMIN CREDENTIALS =====
// Your login credentials
const ADMIN_EMAIL = 'jaysaadana@gmail.com';
const ADMIN_PASSWORD = 'sadanajai12@';

// ===== DOM ELEMENTS =====
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const pageTitle = document.getElementById('pageTitle');

// ===== CHECK LOGIN STATUS =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('ssoc_admin_logged_in');
    if (isLoggedIn === 'true') {
        loginScreen.classList.add('hidden');
        dashboard.classList.add('active');
        loadAllData();
    }
}

// ===== LOGIN =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('ssoc_admin_logged_in', 'true');
        loginScreen.classList.add('hidden');
        dashboard.classList.add('active');
        loginError.style.display = 'none';
        loadAllData();
    } else {
        loginError.style.display = 'block';
    }
});

// ===== LOGOUT =====
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('ssoc_admin_logged_in');
    location.reload();
});

// ===== NAVIGATION =====
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const panelId = link.getAttribute('data-panel');
        
        // Update active states
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show panel
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(panelId + 'Panel').classList.add('active');
        
        // Update title
        const titles = {
            'hero': 'Hero Section',
            'timeline': 'Timeline',
            'stats': 'Statistics',
            'links': 'Apply Links',
            'formbuilder': 'Form Builder',
            'projects': 'Projects',
            'mentors': 'Mentors',
            'testimonials': 'Testimonials',
            'faq': 'FAQ',
            'registrations': 'Registrations',
            'footer': 'Footer',
            'pages': 'Content Pages',
            'organizers': 'Team Organizers',
            'advocates': 'Campus Advocates',
            'advocate-apps': 'Advocate Applications',
            'leaderboard': 'Advocate Leaderboard',
            'sponsors': 'Sponsors',
            'referral-links': 'Referral Links',
            'onboarding': 'Contributor Onboarding',
            'raids': 'Raids & Tasks'
        };
        pageTitle.textContent = titles[panelId];
    });
});

// ===== API BASE URL =====
const API_URL = window.location.origin + '/api';

// ===== LOAD ALL DATA =====
async function loadAllData() {
    try {
        // Try combined endpoint first (1 request instead of 17)
        const initRes = await fetch(`${API_URL}/admin/init`);
        if (initRes.ok) {
            const data = await initRes.json();
            if (!data.error) {
                // Apply all data from combined response
                if (data.siteData) applySiteData(data.siteData);
                if (data.applyLinks) {
                    if (data.applyLinks.contributorLink) document.getElementById('contributorLink').value = data.applyLinks.contributorLink;
                    if (data.applyLinks.mentorLink) document.getElementById('mentorLink').value = data.applyLinks.mentorLink;
                    if (data.applyLinks.projectAdminLink) document.getElementById('projectAdminLink').value = data.applyLinks.projectAdminLink;
                }
                if (data.formStatus) applyFormStatus(data.formStatus);
                if (data.customFields) applyCustomFieldsData(data.customFields);
                if (data.projects) { projectsData = data.projects; allProjects = data.projects; renderProjects(); }
                if (data.mentors) { mentorsData = data.mentors; allMentors = data.mentors; renderMentors(); }
                if (data.organizers) { organizersData = data.organizers; allOrganizers = data.organizers; renderOrganizers(); }
                if (data.advocates) { advocatesData = data.advocates; allAdvocates = data.advocates; filteredAdvocates = [...allAdvocates]; renderAdvocates(advocatesData); }
                if (data.applications) { applicationsData = data.applications; allApplications = data.applications; filteredApplications = [...allApplications]; renderApplications(); }
                if (data.testimonials) { testimonialsData = data.testimonials; allTestimonials = data.testimonials; renderTestimonials(); }
                if (data.sponsors) { sponsorsData = data.sponsors; allSponsors = data.sponsors; filteredSponsors = [...allSponsors]; renderSponsors(); }
                if (data.faqs) { faqsData = data.faqs; allFAQs = data.faqs; renderFAQs(); }
                if (data.registrations) {
                    registrationsData = data.registrations;
                    allRegistrations = data.registrations;
                    filteredRegistrations = [...allRegistrations];
                    const fieldSet = new Set();
                    registrationsData.forEach(r => {
                        Object.keys(r).forEach(key => {
                            if (!excludedFields.includes(key)) fieldSet.add(key);
                        });
                    });
                    allRegistrationFields = Array.from(fieldSet).sort((a, b) => {
                        const aIndex = priorityFields.indexOf(a);
                        const bIndex = priorityFields.indexOf(b);
                        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;
                        return a.localeCompare(b);
                    });
                    renderRegistrations();
                    updateRegistrationCount();
                }
                if (data.pages) { allPages = data.pages; renderContentPages(); }
                if (data.footer) applyFooterData(data.footer);
                if (data.referralLinks) { referralLinksData = data.referralLinks; allReferralLinks = data.referralLinks; filteredReferralLinks = [...allReferralLinks]; renderReferralLinks(); updateReferralStats(); }
                
                // Leaderboard data
                allTasks = data.tasks || [];
                allCompletions = data.completions || [];
                allAdvocatesForLB = (data.advocates || []).filter(a => a.isActive);
                renderTasks();
                renderScoringGrid();
                
                // Section timestamps
                if (data.sectionTimestamps) renderSectionTimestamps(data.sectionTimestamps);

                // Onboarding submissions (combined-init path)
                if (data.onboardingSubmissions) {
                    onboardingData = data.onboardingSubmissions;
                    renderOnboardingSubmissions();
                }

                // Raids (combined-init path)
                if (data.raids) { raidsData = data.raids; renderRaidsAdmin(); }
                if (data.raidCompletions) { raidCompletionsData = data.raidCompletions; renderRaidCompletions(); }

                console.log('Admin data loaded via combined endpoint');
                return;
            }
        }
    } catch (e) {
        console.warn('Combined admin endpoint unavailable, falling back:', e);
    }
    
    // Fallback: individual calls
    try {
        await Promise.allSettled([
            loadSiteData(),
            loadLinks(),
            loadFormStatus(),
            loadCustomFields(),
            loadProjects(),
            loadMentors(),
            loadOrganizers(),
            loadAdvocates(),
            loadAdvocateApplications(),
            loadTestimonials(),
            loadSponsors(),
            loadReferralLinks(),
            loadFAQs(),
            loadLeaderboardData(),
            loadRegistrations(),
            loadOnboardingSubmissions(),
            loadRaidsAdmin(),
            loadFooterData(),
            loadContentPages()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }
    // Load timestamps separately in fallback mode
    try {
        const tsRes = await fetch(`${API_URL}/section-timestamps`);
        const timestamps = await tsRes.json();
        renderSectionTimestamps(timestamps);
    } catch (e) { console.warn('Could not load timestamps:', e); }
}

// ===== APPLY FUNCTIONS (for combined endpoint) =====
function applySiteData(siteData) {
    if (siteData.heroBadge) document.getElementById('heroBadge').value = siteData.heroBadge;
    if (siteData.heroDuration) document.getElementById('heroDuration').value = siteData.heroDuration;
    if (siteData.heroDescription) document.getElementById('heroDescription').value = siteData.heroDescription;
    if (siteData.heroContributors) document.getElementById('heroContributors').value = siteData.heroContributors;
    if (siteData.heroProjects) document.getElementById('heroProjects').value = siteData.heroProjects;
    if (siteData.heroPRs) document.getElementById('heroPRs').value = siteData.heroPRs;
    if (siteData.timelineRegStart) document.getElementById('timelineRegStart').value = siteData.timelineRegStart;
    if (siteData.timelineRegEnd) document.getElementById('timelineRegEnd').value = siteData.timelineRegEnd;
    if (siteData.timelineCodingStart) document.getElementById('timelineCodingStart').value = siteData.timelineCodingStart;
    if (siteData.timelineCodingEnd) document.getElementById('timelineCodingEnd').value = siteData.timelineCodingEnd;
    if (siteData.timelineResult) document.getElementById('timelineResult').value = siteData.timelineResult;
    if (siteData.statContributors) document.getElementById('statContributors').value = siteData.statContributors;
    if (siteData.statPRs) document.getElementById('statPRs').value = siteData.statPRs;
    if (siteData.statProjects) document.getElementById('statProjects').value = siteData.statProjects;
    if (siteData.statCountries) document.getElementById('statCountries').value = siteData.statCountries;
    if (siteData.statOrgs) document.getElementById('statOrgs').value = siteData.statOrgs;
    if (siteData.aboutMonths) document.getElementById('aboutMonths').value = siteData.aboutMonths;
}

function applyFormStatus(status) {
    document.getElementById('formStatusContributor').checked = status.contributor !== false;
    document.getElementById('formStatusMentor').checked = status.mentor !== false;
    document.getElementById('formStatusProjectAdmin').checked = status.projectAdmin !== false;
}

function applyCustomFieldsData(fieldsByRole) {
    allRoleFields = fieldsByRole;
    customFieldsData = allRoleFields[currentFormRole] || [];
    renderCustomFields(customFieldsData);
    renderFormPreview();
}

function applyFooterData(data) {
    footerData = data;
    document.getElementById('footerBrandDescription').value = data.brandDescription || '';
    document.getElementById('footerCopyrightText').value = data.copyrightText || '';
    const social = data.socialLinks || {};
    document.getElementById('socialGithub').value = social.github || '';
    document.getElementById('socialTwitter').value = social.twitter || '';
    document.getElementById('socialLinkedin').value = social.linkedin || '';
    document.getElementById('socialInstagram').value = social.instagram || '';
    document.getElementById('socialDiscord').value = social.discord || '';
    document.getElementById('socialYoutube').value = social.youtube || '';
    renderLinksList('communityLinksList', data.communityLinks || [], 'community');
    renderLinksList('resourceLinksList', data.resourceLinks || [], 'resource');
    renderLinksList('legalLinksList', data.legalLinks || [], 'legal');
    updateFooterPreview();
}

// ===== SECTION TIMESTAMPS =====
const sectionTimestampMap = {
    siteData: ['heroPanel', 'timelinePanel', 'statsPanel'],
    applyLinks: ['linksPanel'],
    formStatus: ['linksPanel'],
    formBuilder: ['formbuilderPanel'],
    projects: ['projectsPanel'],
    mentors: ['mentorsPanel'],
    organizers: ['organizersPanel'],
    advocates: ['advocatesPanel'],
    testimonials: ['testimonialsPanel'],
    sponsors: ['sponsorsPanel'],
    faqs: ['faqPanel'],
    footer: ['footerPanel'],
    pages: ['pagesPanel'],
    leaderboard: ['leaderboardPanel'],
};

function renderSectionTimestamps(timestamps) {
    for (const [section, isoStr] of Object.entries(timestamps)) {
        const panelIds = sectionTimestampMap[section];
        if (!panelIds || !isoStr) continue;
        const date = new Date(isoStr);
        const relative = getRelativeTime(date);
        panelIds.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const firstHeader = panel.querySelector('.card-header');
            if (!firstHeader) return;
            // Remove existing timestamp in this header
            const existing = firstHeader.querySelector('.section-timestamp');
            if (existing) existing.remove();
            const badge = document.createElement('span');
            badge.className = 'section-timestamp';
            badge.setAttribute('data-testid', `timestamp-${section}`);
            badge.innerHTML = `<i class="fas fa-clock"></i> ${relative}`;
            badge.title = date.toLocaleString();
            firstHeader.appendChild(badge);
        });
    }
}

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
}

// ===== FOOTER LIVE PREVIEW =====
function updateFooterPreview() {
    const social = footerData.socialLinks || {};
    const socialIcons = { github: 'fab fa-github', twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin', instagram: 'fab fa-instagram', discord: 'fab fa-discord', youtube: 'fab fa-youtube' };
    
    document.getElementById('fpBrandDesc').textContent = footerData.brandDescription || 'No description set';
    document.getElementById('fpCopyright').textContent = footerData.copyrightText || '';
    
    const socialsEl = document.getElementById('fpSocials');
    socialsEl.innerHTML = Object.entries(social)
        .filter(([k, v]) => v && v !== '#')
        .map(([k, v]) => `<a href="${v}" target="_blank" title="${k}"><i class="${socialIcons[k] || 'fas fa-link'}"></i></a>`)
        .join('');
    
    const renderLinks = (id, links) => {
        const el = document.getElementById(id);
        if (!el) return;
        const heading = el.querySelector('h4');
        const title = heading ? heading.textContent : '';
        el.innerHTML = `<h4>${title}</h4>` + (links || []).map(l => `<a href="${l.url}" title="${l.url}">${l.label}</a>`).join('');
        if (!links || links.length === 0) el.innerHTML += '<span style="color:#555;font-size:12px;">No links added</span>';
    };
    
    renderLinks('fpCommunity', footerData.communityLinks);
    renderLinks('fpResources', footerData.resourceLinks);
    renderLinks('fpLegal', footerData.legalLinks);
}

function refreshTimestamp(section) {
    const now = new Date().toISOString();
    renderSectionTimestamps({ [section]: now });
}

// ===== SITE DATA =====
async function loadSiteData() {
    try {
        const response = await fetch(`${API_URL}/site-data`);
        const siteData = await response.json();
        
        // Hero
        if (siteData.heroBadge) document.getElementById('heroBadge').value = siteData.heroBadge;
        if (siteData.heroDuration) document.getElementById('heroDuration').value = siteData.heroDuration;
        if (siteData.heroDescription) document.getElementById('heroDescription').value = siteData.heroDescription;
        if (siteData.heroContributors) document.getElementById('heroContributors').value = siteData.heroContributors;
        if (siteData.heroProjects) document.getElementById('heroProjects').value = siteData.heroProjects;
        if (siteData.heroPRs) document.getElementById('heroPRs').value = siteData.heroPRs;
        
        // Timeline
        if (siteData.timelineRegStart) document.getElementById('timelineRegStart').value = siteData.timelineRegStart;
        if (siteData.timelineRegEnd) document.getElementById('timelineRegEnd').value = siteData.timelineRegEnd;
        if (siteData.timelineCodingStart) document.getElementById('timelineCodingStart').value = siteData.timelineCodingStart;
        if (siteData.timelineCodingEnd) document.getElementById('timelineCodingEnd').value = siteData.timelineCodingEnd;
        if (siteData.timelineResult) document.getElementById('timelineResult').value = siteData.timelineResult;
        
        // Stats
        if (siteData.statContributors) document.getElementById('statContributors').value = siteData.statContributors;
        if (siteData.statPRs) document.getElementById('statPRs').value = siteData.statPRs;
        if (siteData.statProjects) document.getElementById('statProjects').value = siteData.statProjects;
        if (siteData.statCountries) document.getElementById('statCountries').value = siteData.statCountries;
        if (siteData.statOrgs) document.getElementById('statOrgs').value = siteData.statOrgs;
        if (siteData.aboutMonths) document.getElementById('aboutMonths').value = siteData.aboutMonths;
    } catch (error) {
        console.error('Error loading site data:', error);
    }
}

async function saveHeroSection() {
    try {
        const response = await fetch(`${API_URL}/site-data`);
        const siteData = await response.json() || {};
        
        siteData.heroBadge = document.getElementById('heroBadge').value;
        siteData.heroDuration = document.getElementById('heroDuration').value;
        siteData.heroDescription = document.getElementById('heroDescription').value;
        siteData.heroContributors = document.getElementById('heroContributors').value;
        siteData.heroProjects = document.getElementById('heroProjects').value;
        siteData.heroPRs = document.getElementById('heroPRs').value;
        
        await fetch(`${API_URL}/site-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        showToast('Hero section saved successfully!');
        refreshTimestamp('siteData');
    } catch (error) {
        console.error('Error saving hero:', error);
        showToast('Error saving hero section');
    }
}

async function saveTimeline() {
    try {
        const response = await fetch(`${API_URL}/site-data`);
        const siteData = await response.json() || {};
        
        siteData.timelineRegStart = document.getElementById('timelineRegStart').value;
        siteData.timelineRegEnd = document.getElementById('timelineRegEnd').value;
        siteData.timelineCodingStart = document.getElementById('timelineCodingStart').value;
        siteData.timelineCodingEnd = document.getElementById('timelineCodingEnd').value;
        siteData.timelineResult = document.getElementById('timelineResult').value;
        
        await fetch(`${API_URL}/site-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        showToast('Timeline saved successfully!');
        refreshTimestamp('siteData');
    } catch (error) {
        console.error('Error saving timeline:', error);
        showToast('Error saving timeline');
    }
}

async function saveStats() {
    try {
        const response = await fetch(`${API_URL}/site-data`);
        const siteData = await response.json() || {};
        
        siteData.statContributors = document.getElementById('statContributors').value;
        siteData.statPRs = document.getElementById('statPRs').value;
        siteData.statProjects = document.getElementById('statProjects').value;
        siteData.statCountries = document.getElementById('statCountries').value;
        siteData.statOrgs = document.getElementById('statOrgs').value;
        siteData.aboutMonths = document.getElementById('aboutMonths').value;
        
        await fetch(`${API_URL}/site-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        showToast('Statistics saved successfully!');
        refreshTimestamp('siteData');
    } catch (error) {
        console.error('Error saving stats:', error);
        showToast('Error saving statistics');
    }
}

// ===== APPLY LINKS =====
async function loadLinks() {
    try {
        const response = await fetch(`${API_URL}/apply-links`);
        const links = await response.json();
        console.log('Loaded apply links:', links);
        
        const contributorInput = document.getElementById('contributorLink');
        const mentorInput = document.getElementById('mentorLink');
        const projectAdminInput = document.getElementById('projectAdminLink');
        
        if (contributorInput && links.contributorLink) contributorInput.value = links.contributorLink;
        if (mentorInput && links.mentorLink) mentorInput.value = links.mentorLink;
        if (projectAdminInput && links.projectAdminLink) projectAdminInput.value = links.projectAdminLink;
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

async function saveLinks() {
    try {
        const links = {
            contributorLink: document.getElementById('contributorLink').value.trim(),
            mentorLink: document.getElementById('mentorLink').value.trim(),
            projectAdminLink: document.getElementById('projectAdminLink').value.trim()
        };
        
        await fetch(`${API_URL}/apply-links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(links)
        });
        showToast('Apply links saved successfully!');
        refreshTimestamp('applyLinks');
    } catch (error) {
        console.error('Error saving links:', error);
        showToast('Error saving links');
    }
}

function clearAllLinks() {
    document.getElementById('contributorLink').value = '';
    document.getElementById('mentorLink').value = '';
    document.getElementById('projectAdminLink').value = '';
    saveLinks();
}

// ===== FORM STATUS =====
async function loadFormStatus() {
    try {
        const response = await fetch(`${API_URL}/form-status`);
        const status = await response.json();
        
        document.getElementById('formStatusContributor').checked = status.contributor !== false;
        document.getElementById('formStatusMentor').checked = status.mentor !== false;
        document.getElementById('formStatusProjectAdmin').checked = status.projectAdmin !== false;
    } catch (error) {
        console.error('Error loading form status:', error);
    }
}

async function saveFormStatus() {
    try {
        const status = {
            contributor: document.getElementById('formStatusContributor').checked,
            mentor: document.getElementById('formStatusMentor').checked,
            projectAdmin: document.getElementById('formStatusProjectAdmin').checked
        };
        
        await fetch(`${API_URL}/form-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
        });
        
        const openCount = Object.values(status).filter(v => v).length;
        showToast(`Form status updated! ${openCount} form(s) open for registration.`);
        refreshTimestamp('formStatus');
    } catch (error) {
        console.error('Error saving form status:', error);
        showToast('Error saving form status');
    }
}

// ===== FORM BUILDER =====
let customFieldsData = [];
let currentFormRole = 'contributor';
let allRoleFields = {
    contributor: [],
    mentor: [],
    projectadmin: []
};

const roleNames = {
    contributor: 'Contributor',
    mentor: 'Mentor',
    projectadmin: 'Project Admin'
};

async function loadCustomFields() {
    try {
        // Load fields for all roles
        const response = await fetch(`${API_URL}/all-custom-fields`);
        allRoleFields = await response.json();
        customFieldsData = allRoleFields[currentFormRole] || [];
        renderCustomFields(customFieldsData);
        renderFormPreview();
    } catch (error) {
        console.error('Error loading custom fields:', error);
        // Fallback to legacy endpoint
        try {
            const legacyResponse = await fetch(`${API_URL}/custom-fields`);
            customFieldsData = await legacyResponse.json();
            allRoleFields.contributor = customFieldsData;
            renderCustomFields(customFieldsData);
            renderFormPreview();
        } catch (e) {
            console.error('Fallback also failed:', e);
        }
    }
}

function switchFormRole(role) {
    currentFormRole = role;
    customFieldsData = allRoleFields[role] || [];
    
    // Update UI
    document.querySelectorAll('.role-tab').forEach(tab => {
        if (tab.dataset.role === role) {
            tab.style.background = 'var(--primary)';
            tab.style.borderColor = 'var(--primary)';
            tab.style.color = 'white';
            tab.classList.add('active');
        } else {
            tab.style.background = 'white';
            tab.style.borderColor = 'var(--border)';
            tab.style.color = 'var(--text-secondary)';
            tab.classList.remove('active');
        }
    });
    
    document.getElementById('currentRoleName').textContent = roleNames[role];
    document.getElementById('customFieldsRoleLabel').textContent = roleNames[role];
    
    renderCustomFields(customFieldsData);
    renderFormPreview();
}

function renderCustomFields(fields) {
    const container = document.getElementById('customFieldsList');
    if (!container) return;
    
    if (fields.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px; font-size: 14px;">No custom fields added for ${roleNames[currentFormRole]}. Click "Add Custom Field" to create one.</p>`;
        renderFormPreview();
        return;
    }
    
    const iconMap = {
        'text': 'fa-font',
        'email': 'fa-envelope',
        'url': 'fa-link',
        'phone': 'fa-phone',
        'number': 'fa-hashtag',
        'textarea': 'fa-align-left',
        'select': 'fa-list'
    };
    
    container.innerHTML = fields.map((f, i) => `
        <div class="field-item">
            <i class="fas ${iconMap[f.type] || 'fa-font'}"></i>
            <span>${f.label}</span>
            <span class="field-type">${f.type}</span>
            ${f.required ? '<span class="field-badge">Required</span>' : ''}
            <div class="field-actions">
                <button class="edit-btn" onclick="editCustomField(${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteCustomField(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    // Update the live preview
    renderFormPreview();
}

async function addCustomField() {
    const label = prompt('Enter field label (e.g., "Phone Number", "GitHub Profile"):');
    if (!label) return;
    
    const typeOptions = 'Select field type:\\n1. text\\n2. email\\n3. url\\n4. phone\\n5. number\\n6. textarea\\n7. select (dropdown)';
    const typeInput = prompt(typeOptions, 'text');
    const typeMap = {'1': 'text', '2': 'email', '3': 'url', '4': 'phone', '5': 'number', '6': 'textarea', '7': 'select'};
    const type = typeMap[typeInput] || typeInput || 'text';
    
    const placeholder = prompt('Enter placeholder text:', 'Enter ' + label.toLowerCase());
    const required = confirm('Is this field required?');
    
    let options = [];
    if (type === 'select') {
        const optionsStr = prompt('Enter dropdown options (comma separated):', 'Option 1, Option 2, Option 3');
        if (optionsStr) {
            options = optionsStr.split(',').map(o => o.trim());
        }
    }
    
    customFieldsData.push({
        id: 'custom_' + Date.now(),
        label,
        type,
        placeholder,
        required,
        options
    });
    
    // Update the role fields cache
    allRoleFields[currentFormRole] = customFieldsData;
    
    try {
        await fetch(`${API_URL}/custom-fields/${currentFormRole}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customFieldsData)
        });
        renderCustomFields(customFieldsData);
        showToast(`Custom field added to ${roleNames[currentFormRole]} form!`);
    } catch (error) {
        console.error('Error adding field:', error);
    }
}

async function editCustomField(index) {
    const f = customFieldsData[index];
    
    const label = prompt('Enter field label:', f.label);
    if (!label) return;
    
    const typeOptions = 'Select field type:\\n1. text\\n2. email\\n3. url\\n4. phone\\n5. number\\n6. textarea\\n7. select (dropdown)';
    const typeInput = prompt(typeOptions, f.type);
    const typeMap = {'1': 'text', '2': 'email', '3': 'url', '4': 'phone', '5': 'number', '6': 'textarea', '7': 'select'};
    const type = typeMap[typeInput] || typeInput || f.type;
    
    const placeholder = prompt('Enter placeholder:', f.placeholder);
    const required = confirm('Is this field required?');
    
    let options = f.options || [];
    if (type === 'select') {
        const optionsStr = prompt('Enter dropdown options (comma separated):', options.join(', '));
        if (optionsStr) {
            options = optionsStr.split(',').map(o => o.trim());
        }
    }
    
    customFieldsData[index] = { ...f, label, type, placeholder, required, options };
    allRoleFields[currentFormRole] = customFieldsData;
    
    try {
        await fetch(`${API_URL}/custom-fields/${currentFormRole}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customFieldsData)
        });
        renderCustomFields(customFieldsData);
        showToast('Custom field updated!');
    } catch (error) {
        console.error('Error updating field:', error);
    }
}

async function deleteCustomField(index) {
    if (!confirm('Are you sure you want to delete this field?')) return;
    
    customFieldsData.splice(index, 1);
    allRoleFields[currentFormRole] = customFieldsData;
    
    try {
        await fetch(`${API_URL}/custom-fields/${currentFormRole}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customFieldsData)
        });
        renderCustomFields(customFieldsData);
        showToast('Custom field deleted!');
    } catch (error) {
        console.error('Error deleting field:', error);
    }
}

// ===== FORM PREVIEW =====
function refreshFormPreview() {
    renderFormPreview();
    showToast('Preview refreshed!');
}

function renderFormPreview() {
    const container = document.getElementById('formPreviewFields');
    if (!container) return;
    
    // Update preview labels
    const previewRoleName = document.getElementById('previewRoleName');
    const previewFormTitle = document.getElementById('previewFormTitle');
    if (previewRoleName) previewRoleName.textContent = roleNames[currentFormRole];
    if (previewFormTitle) previewFormTitle.textContent = `Apply as ${roleNames[currentFormRole]}`;

    // Default fields
    let fieldsHtml = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 14px; font-weight: 500; color: #2d1f3d;">
                Full Name <span style="color: #d35dab;">*</span>
            </label>
            <input type="text" placeholder="Enter your full name" style="padding: 12px 16px; border: 2px solid #e9e0f0; border-radius: 10px; font-size: 14px; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#d35dab'" onblur="this.style.borderColor='#e9e0f0'">
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 14px; font-weight: 500; color: #2d1f3d;">
                Email Address <span style="color: #d35dab;">*</span>
            </label>
            <input type="email" placeholder="Enter your email address" style="padding: 12px 16px; border: 2px solid #e9e0f0; border-radius: 10px; font-size: 14px; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#d35dab'" onblur="this.style.borderColor='#e9e0f0'">
        </div>
    `;

    // Custom fields
    if (customFieldsData && customFieldsData.length > 0) {
        customFieldsData.forEach(field => {
            const requiredMark = field.required ? '<span style="color: #d35dab;">*</span>' : '';
            
            if (field.type === 'textarea') {
                fieldsHtml += `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 14px; font-weight: 500; color: #2d1f3d;">
                            ${field.label} ${requiredMark}
                        </label>
                        <textarea placeholder="${field.placeholder || ''}" style="padding: 12px 16px; border: 2px solid #e9e0f0; border-radius: 10px; font-size: 14px; outline: none; min-height: 80px; resize: vertical; transition: border 0.2s;" onfocus="this.style.borderColor='#d35dab'" onblur="this.style.borderColor='#e9e0f0'"></textarea>
                    </div>
                `;
            } else if (field.type === 'select') {
                const optionsHtml = (field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('');
                fieldsHtml += `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 14px; font-weight: 500; color: #2d1f3d;">
                            ${field.label} ${requiredMark}
                        </label>
                        <select style="padding: 12px 16px; border: 2px solid #e9e0f0; border-radius: 10px; font-size: 14px; outline: none; background: white; cursor: pointer; transition: border 0.2s;" onfocus="this.style.borderColor='#d35dab'" onblur="this.style.borderColor='#e9e0f0'">
                            <option value="">Select an option</option>
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 14px; font-weight: 500; color: #2d1f3d;">
                            ${field.label} ${requiredMark}
                        </label>
                        <input type="${field.type}" placeholder="${field.placeholder || ''}" style="padding: 12px 16px; border: 2px solid #e9e0f0; border-radius: 10px; font-size: 14px; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#d35dab'" onblur="this.style.borderColor='#e9e0f0'">
                    </div>
                `;
            }
        });
    }

    container.innerHTML = fieldsHtml;
}

// ===== PROJECTS =====
let projectsData = [];

async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        projectsData = await response.json();
        renderProjects(projectsData);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects(projects = allProjects) {
    const container = document.getElementById('projectsList');
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No projects added yet. Add your first project!</p>';
        return;
    }
    container.innerHTML = projects.map((p, i) => `
        <div class="testimonial-item">
            <img src="${p.logo || 'https://via.placeholder.com/48'}" alt="${p.name}" style="border-radius: 8px;">
            <div class="testimonial-item-content">
                <h4>${p.name}</h4>
                <p>${p.organization || 'Open Source'}</p>
                <div class="quote" style="font-style: normal;">${(p.description || '').substring(0, 100)}...</div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="openProjectModal(${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteProject(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Modal-based add/edit (replaces the chain of prompt() dialogs)
function openProjectModal(index) {
    const modal = document.getElementById('projectModal');
    if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    const title = document.getElementById('projectModalTitle');
    const err = document.getElementById('pf_error');
    err.classList.remove('show'); err.textContent = '';

    if (typeof index === 'number') {
        const p = projectsData[index] || {};
        title.textContent = 'Edit Project';
        document.getElementById('pf_id').value = p.id || '';
        document.getElementById('pf_name').value = p.name || '';
        document.getElementById('pf_organization').value = p.organization || '';
        document.getElementById('pf_description').value = p.description || '';
        document.getElementById('pf_tags').value = (p.tags || []).join(', ');
        document.getElementById('pf_github').value = p.github || '';
        document.getElementById('pf_website').value = p.website || '';
    } else {
        title.textContent = 'Add New Project';
        document.getElementById('projectForm').reset();
        document.getElementById('pf_id').value = '';
    }
    modal.classList.add('active');
    setTimeout(() => document.getElementById('pf_name').focus(), 80);
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const m = document.getElementById('projectModal');
        if (m && m.classList.contains('active')) closeProjectModal();
    }
});

async function saveProjectFromModal() {
    const err = document.getElementById('pf_error');
    const submit = document.getElementById('pf_submit');
    err.classList.remove('show'); err.textContent = '';

    const existingId = document.getElementById('pf_id').value.trim();
    const name = document.getElementById('pf_name').value.trim();
    const description = document.getElementById('pf_description').value.trim();

    if (!name) { err.textContent = 'Project name is required.'; err.classList.add('show'); return; }
    if (!description) { err.textContent = 'Project description is required.'; err.classList.add('show'); return; }

    const tagsRaw = document.getElementById('pf_tags').value.trim();
    const payload = {
        id: existingId || ('proj_' + Date.now()),
        name,
        organization: document.getElementById('pf_organization').value.trim(),
        description,
        tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
        github: document.getElementById('pf_github').value.trim(),
        website: document.getElementById('pf_website').value.trim(),
        logo: '',
        stars: 0, forks: 0, contributors: 0
    };

    submit.disabled = true;
    const originalHTML = submit.innerHTML;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const url = existingId
            ? `${API_URL}/projects/${encodeURIComponent(existingId)}`
            : `${API_URL}/projects/add`;
        const method = existingId ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
            throw new Error(data.detail || data.message || ('HTTP ' + res.status));
        }
        closeProjectModal();
        await loadProjects();
        showToast(existingId ? 'Project updated successfully!' : 'Project added successfully!');
    } catch (e) {
        console.error('Save project failed:', e);
        err.textContent = 'Could not save: ' + (e.message || 'unknown error');
        err.classList.add('show');
    } finally {
        submit.disabled = false;
        submit.innerHTML = originalHTML;
    }
}

// Old prompt-based add kept as fallback alias (in case any cached UI calls it)
async function addProject() { openProjectModal(); }
async function editProject(index) { openProjectModal(index); }

async function deleteProject(index) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const proj = projectsData[index];
    if (!proj || !proj.id) return;

    try {
        const res = await fetch(`${API_URL}/projects/${encodeURIComponent(proj.id)}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await loadProjects();
        showToast('Project deleted!');
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Failed to delete project.');
    }
}

// ===== MENTORS =====
let mentorsData = [];

async function loadMentors() {
    try {
        const response = await fetch(`${API_URL}/mentors`);
        mentorsData = await response.json();
        renderMentors(mentorsData);
    } catch (error) {
        console.error('Error loading mentors:', error);
    }
}

function renderMentors(mentors = allMentors) {
    const container = document.getElementById('mentorsList');
    if (!mentors || mentors.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No mentors added yet. Add your first mentor!</p>';
        return;
    }
    container.innerHTML = mentors.map((m, i) => `
        <div class="testimonial-item">
            <img src="${m.avatar || 'https://via.placeholder.com/48'}" alt="${m.name}" style="border-radius: 50%;">
            <div class="testimonial-item-content">
                <h4>${m.name}</h4>
                <p>${m.role || 'Mentor'} ${m.company ? '• ' + m.company : ''}</p>
                <div class="quote" style="font-style: normal;">${(m.bio || 'No bio').substring(0, 80)}...</div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editMentor(${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteMentor(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function addMentor() {
    const name = prompt('Enter mentor name:');
    if (!name) return;
    const role = prompt('Enter role (e.g., Senior Developer, Tech Lead):');
    const company = prompt('Enter company name:');
    const bio = prompt('Enter short bio:');
    const skills = prompt('Enter skills (comma separated, e.g., React, Node.js, Python):');
    const avatar = prompt('Enter avatar URL:', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop');
    const github = prompt('Enter GitHub URL (optional):');
    const linkedin = prompt('Enter LinkedIn URL (optional):');
    const twitter = prompt('Enter Twitter URL (optional):');
    
    const mentor = { 
        id: 'mentor_' + Date.now(),
        name, 
        role, 
        company, 
        bio,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        avatar,
        github,
        linkedin,
        twitter
    };
    
    mentorsData.push(mentor);
    
    try {
        await fetch(`${API_URL}/mentors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mentorsData)
        });
        renderMentors(mentorsData);
        showToast('Mentor added successfully!');
    } catch (error) {
        console.error('Error adding mentor:', error);
    }
}

async function editMentor(index) {
    const m = mentorsData[index];
    
    const name = prompt('Enter mentor name:', m.name);
    if (!name) return;
    const role = prompt('Enter role:', m.role);
    const company = prompt('Enter company:', m.company);
    const bio = prompt('Enter bio:', m.bio);
    const skills = prompt('Enter skills (comma separated):', (m.skills || []).join(', '));
    const avatar = prompt('Enter avatar URL:', m.avatar);
    const github = prompt('Enter GitHub URL:', m.github);
    const linkedin = prompt('Enter LinkedIn URL:', m.linkedin);
    const twitter = prompt('Enter Twitter URL:', m.twitter);
    
    mentorsData[index] = { 
        ...m,
        name, 
        role, 
        company, 
        bio,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        avatar,
        github,
        linkedin,
        twitter
    };
    
    try {
        await fetch(`${API_URL}/mentors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mentorsData)
        });
        renderMentors(mentorsData);
        showToast('Mentor updated successfully!');
    } catch (error) {
        console.error('Error updating mentor:', error);
    }
}

async function deleteMentor(index) {
    if (!confirm('Are you sure you want to delete this mentor?')) return;
    
    mentorsData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/mentors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mentorsData)
        });
        renderMentors(mentorsData);
        showToast('Mentor deleted!');
    } catch (error) {
        console.error('Error deleting mentor:', error);
    }
}

// ===== ORGANIZERS =====
let organizersData = [];

async function loadOrganizers() {
    try {
        const response = await fetch(`${API_URL}/organizers`);
        organizersData = await response.json();
        renderOrganizers(organizersData);
    } catch (error) {
        console.error('Error loading organizers:', error);
    }
}

function renderOrganizers(organizers = allOrganizers) {
    const container = document.getElementById('organizersList');
    if (!container) return;
    if (!organizers || organizers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No organizers added yet. Add your first organizer!</p>';
        return;
    }
    container.innerHTML = organizers.map((o, i) => `
        <div class="testimonial-item" data-testid="organizer-item">
            <img src="${o.photo || 'https://via.placeholder.com/48?text=' + encodeURIComponent(o.name.charAt(0))}" alt="${o.name}" style="border-radius: 50%;" onerror="this.src='https://via.placeholder.com/48?text=${encodeURIComponent(o.name.charAt(0))}'">
            <div class="testimonial-item-content">
                <h4>${o.name} ${o.isActive === false ? '<span style="color: #ef4444; font-size: 12px;">(Inactive)</span>' : ''}</h4>
                <p>${o.role}</p>
                <div class="quote" style="font-style: normal;">${(o.bio || 'No bio provided').substring(0, 60)}...</div>
                <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                    ${o.linkedin ? `<a href="${o.linkedin}" target="_blank" style="color: #0077b5; font-size: 12px;"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                    ${o.github ? `<a href="${o.github}" target="_blank" style="color: #333; font-size: 12px;"><i class="fab fa-github"></i> GitHub</a>` : ''}
                    ${o.topmateLink ? `<a href="${o.topmateLink}" target="_blank" style="color: var(--primary); font-size: 12px;"><i class="fas fa-calendar"></i> Topmate</a>` : ''}
                </div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editOrganizer(${i})" data-testid="edit-organizer-${i}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteOrganizer(${i})" data-testid="delete-organizer-${i}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function addOrganizer() {
    const name = prompt('Enter organizer name:');
    if (!name) return;
    const role = prompt('Enter role (e.g., Lead Organizer, Community Manager):');
    if (!role) return;
    const bio = prompt('Enter a short bio (max 200 chars):');
    const photo = prompt('Enter photo URL:', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=140&h=140&fit=crop');
    const linkedin = prompt('Enter LinkedIn URL (optional):');
    const github = prompt('Enter GitHub URL (optional):');
    const twitter = prompt('Enter Twitter URL (optional):');
    const portfolio = prompt('Enter Portfolio URL (optional):');
    const topmateLink = prompt('Enter Topmate link (optional - for scheduling calls):');
    
    const organizer = { 
        id: 'org_' + Date.now(),
        name, 
        role, 
        bio,
        photo,
        linkedin: linkedin || '',
        github: github || '',
        twitter: twitter || '',
        portfolio: portfolio || '',
        topmateLink: topmateLink || '',
        isActive: true
    };
    
    organizersData.push(organizer);
    
    try {
        await fetch(`${API_URL}/organizers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(organizersData)
        });
        renderOrganizers(organizersData);
        showToast('Organizer added successfully!');
    } catch (error) {
        console.error('Error adding organizer:', error);
        showToast('Error adding organizer');
    }
}

async function editOrganizer(index) {
    const o = organizersData[index];
    
    const name = prompt('Enter organizer name:', o.name);
    if (!name) return;
    const role = prompt('Enter role:', o.role);
    const bio = prompt('Enter bio:', o.bio);
    const photo = prompt('Enter photo URL:', o.photo);
    const linkedin = prompt('Enter LinkedIn URL:', o.linkedin);
    const github = prompt('Enter GitHub URL:', o.github);
    const twitter = prompt('Enter Twitter URL:', o.twitter);
    const portfolio = prompt('Enter Portfolio URL:', o.portfolio);
    const topmateLink = prompt('Enter Topmate link:', o.topmateLink);
    const isActiveStr = prompt('Is active? (yes/no):', o.isActive !== false ? 'yes' : 'no');
    
    organizersData[index] = { 
        ...o,
        name, 
        role, 
        bio,
        photo,
        linkedin,
        github,
        twitter,
        portfolio,
        topmateLink,
        isActive: isActiveStr.toLowerCase() === 'yes'
    };
    
    try {
        await fetch(`${API_URL}/organizers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(organizersData)
        });
        renderOrganizers(organizersData);
        showToast('Organizer updated successfully!');
    } catch (error) {
        console.error('Error updating organizer:', error);
        showToast('Error updating organizer');
    }
}

async function deleteOrganizer(index) {
    if (!confirm('Are you sure you want to delete this organizer?')) return;
    
    organizersData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/organizers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(organizersData)
        });
        renderOrganizers(organizersData);
        showToast('Organizer deleted!');
    } catch (error) {
        console.error('Error deleting organizer:', error);
        showToast('Error deleting organizer');
    }
}

// ===== CAMPUS ADVOCATES =====
let advocatesData = [];

// Show loading skeleton for advocates
function showAdvocatesLoading() {
    const container = document.getElementById('advocatesList');
    if (!container) return;
    container.innerHTML = `
        <div style="display: flex; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 12px; animation: pulse 1.5s infinite;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--bg-primary);"></div>
            <div style="flex: 1;">
                <div style="height: 16px; width: 60%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="height: 12px; width: 40%; background: var(--bg-primary); border-radius: 4px;"></div>
            </div>
        </div>
        <div style="display: flex; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 12px; animation: pulse 1.5s infinite;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--bg-primary);"></div>
            <div style="flex: 1;">
                <div style="height: 16px; width: 50%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="height: 12px; width: 35%; background: var(--bg-primary); border-radius: 4px;"></div>
            </div>
        </div>
    `;
}

async function loadAdvocates() {
    showAdvocatesLoading();
    try {
        console.log('Loading advocates...');
        const response = await fetch(`${API_URL}/campus-advocates`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        advocatesData = await response.json();
        console.log('Advocates loaded:', advocatesData.length, 'items');
        
        // Ensure it's an array
        if (!Array.isArray(advocatesData)) {
            console.error('Advocates data is not an array:', advocatesData);
            advocatesData = [];
        }
        
        renderAdvocates(advocatesData);
    } catch (error) {
        console.error('Error loading advocates:', error);
        advocatesData = [];
        renderAdvocates([]);
    }
}

function renderAdvocates(advocates = filteredAdvocates) {
    const container = document.getElementById('advocatesList');
    if (!container) {
        console.error('advocatesList container not found!');
        return;
    }
    
    if (!advocates || advocates.length === 0) {
        console.log('Rendering advocates: 0');
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No campus advocates added yet. Add your first advocate!</p>';
        return;
    }
    
    console.log('Rendering advocates:', advocates.length);
    
    container.innerHTML = advocates.map((a, i) => {
        const initial = (a.name || 'A').charAt(0).toUpperCase();
        const placeholderBg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect fill='%238b5cf6' width='48' height='48'/><text x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.35em'>${initial}</text></svg>`;
        
        return `
        <div class="testimonial-item" data-testid="advocate-item">
            <img src="${a.photo || placeholderBg}" alt="${a.name}" style="border-radius: 50%; width: 48px; height: 48px; object-fit: cover;" onerror="this.src='${placeholderBg}'">
            <div class="testimonial-item-content">
                <h4>${a.name} ${a.isActive === false ? '<span style="color: #ef4444; font-size: 12px;">(Inactive)</span>' : ''}</h4>
                <p style="color: var(--primary); font-weight: 500;">${a.college}</p>
                <div class="quote" style="font-style: normal; color: var(--text-muted);">
                    <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${a.city}
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                    ${a.linkedin ? `<a href="${a.linkedin}" target="_blank" style="color: #0077b5; font-size: 12px;"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                    ${a.instagram ? `<a href="${a.instagram}" target="_blank" style="color: #e4405f; font-size: 12px;"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
                    ${a.twitter ? `<a href="${a.twitter}" target="_blank" style="color: #1da1f2; font-size: 12px;"><i class="fab fa-twitter"></i> Twitter</a>` : ''}
                </div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editAdvocate(${i})" data-testid="edit-advocate-${i}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteAdvocate(${i})" data-testid="delete-advocate-${i}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join('');
}

async function addAdvocate() {
    const name = prompt('Enter advocate name:');
    if (!name) return;
    const college = prompt('Enter college/university name:');
    if (!college) return;
    const city = prompt('Enter city:');
    if (!city) return;
    const photo = prompt('Enter photo URL (optional):', '');
    const bio = prompt('Enter a short bio (optional):');
    const linkedin = prompt('Enter LinkedIn URL (optional):');
    const instagram = prompt('Enter Instagram URL (optional):');
    const twitter = prompt('Enter Twitter URL (optional):');
    
    const advocate = { 
        id: 'adv_' + Date.now(),
        name, 
        college,
        city,
        photo: photo || '',
        bio: bio || '',
        linkedin: linkedin || '',
        instagram: instagram || '',
        twitter: twitter || '',
        isActive: true
    };
    
    try {
        await fetch(`${API_URL}/campus-advocates/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advocate)
        });
        advocatesData.push(advocate);
        renderAdvocates(advocatesData);
        showToast('Campus advocate added successfully!');
    } catch (error) {
        console.error('Error adding advocate:', error);
        showToast('Error adding advocate');
    }
}

async function editAdvocate(index) {
    const a = advocatesData[index];
    
    const name = prompt('Enter advocate name:', a.name);
    if (!name) return;
    const college = prompt('Enter college/university name:', a.college);
    const city = prompt('Enter city:', a.city);
    const photo = prompt('Enter photo URL:', a.photo);
    const bio = prompt('Enter bio:', a.bio);
    const linkedin = prompt('Enter LinkedIn URL:', a.linkedin);
    const instagram = prompt('Enter Instagram URL:', a.instagram);
    const twitter = prompt('Enter Twitter URL:', a.twitter);
    const isActiveStr = prompt('Is active? (yes/no):', a.isActive !== false ? 'yes' : 'no');
    
    const updatedAdvocate = { 
        ...a,
        name, 
        college,
        city,
        photo: photo || '',
        bio: bio || '',
        linkedin: linkedin || '',
        instagram: instagram || '',
        twitter: twitter || '',
        isActive: isActiveStr.toLowerCase() === 'yes'
    };
    
    try {
        // Use PUT endpoint to update single advocate instead of replacing all
        await fetch(`${API_URL}/campus-advocates/${a.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAdvocate)
        });
        
        // Update local data and re-render
        advocatesData[index] = updatedAdvocate;
        renderAdvocates(advocatesData);
        showToast('Campus advocate updated successfully!');
    } catch (error) {
        console.error('Error updating advocate:', error);
        showToast('Error updating advocate');
    }
}

async function deleteAdvocate(index) {
    if (!confirm('Are you sure you want to delete this campus advocate?')) return;
    
    const advocateId = advocatesData[index].id;
    advocatesData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/campus-advocates/${advocateId}`, {
            method: 'DELETE'
        });
        renderAdvocates(advocatesData);
        showToast('Campus advocate deleted!');
    } catch (error) {
        console.error('Error deleting advocate:', error);
        showToast('Error deleting advocate');
    }
}

// ===== ADVOCATE APPLICATIONS =====
let applicationsData = [];
let filteredApplications = [];

// Show loading skeleton for applications
function showApplicationsLoading() {
    const container = document.getElementById('applicationsList');
    if (!container) return;
    container.innerHTML = `
        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #f59e0b; animation: pulse 1.5s infinite;">
            <div style="display: flex; justify-content: space-between; gap: 12px;">
                <div style="flex: 1;">
                    <div style="height: 20px; width: 40%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 12px;"></div>
                    <div style="height: 14px; width: 60%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 8px;"></div>
                    <div style="height: 12px; width: 50%; background: var(--bg-primary); border-radius: 4px;"></div>
                </div>
            </div>
        </div>
        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #f59e0b; animation: pulse 1.5s infinite;">
            <div style="display: flex; justify-content: space-between; gap: 12px;">
                <div style="flex: 1;">
                    <div style="height: 20px; width: 35%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 12px;"></div>
                    <div style="height: 14px; width: 55%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 8px;"></div>
                    <div style="height: 12px; width: 45%; background: var(--bg-primary); border-radius: 4px;"></div>
                </div>
            </div>
        </div>
    `;
}

async function loadAdvocateApplications() {
    showApplicationsLoading();
    try {
        const response = await fetch(`${API_URL}/advocate-applications`);
        applicationsData = await response.json();
        filterApplications();
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

function filterApplications() {
    const statusFilter = document.getElementById('appStatusFilter')?.value || 'all';
    
    if (statusFilter === 'all') {
        filteredApplications = [...applicationsData];
    } else {
        filteredApplications = applicationsData.filter(a => a.status === statusFilter);
    }
    
    renderApplications();
    updateAppCount();
}

function updateAppCount() {
    const countEl = document.getElementById('appCount');
    if (countEl) {
        const pending = applicationsData.filter(a => a.status === 'pending').length;
        countEl.textContent = `${filteredApplications.length} shown (${pending} pending)`;
    }
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;
    
    if (filteredApplications.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No applications found.</p>';
        return;
    }
    
    container.innerHTML = filteredApplications.map((app, i) => `
        <div class="application-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
                        <h4 style="margin: 0; color: var(--text-primary);">${app.name}</h4>
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${app.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; color: ${app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'};">
                            ${app.status.toUpperCase()}
                        </span>
                        ${app.status === 'approved' && app.published ? `
                            <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
                                <i class="fas fa-globe" style="margin-right: 4px;"></i>PUBLISHED
                            </span>
                        ` : ''}
                    </div>
                    <p style="color: var(--primary); font-weight: 500; margin: 0 0 4px 0;">${app.college}</p>
                    <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                        <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${app.city} • ${app.year} ${app.branch ? '• ' + app.branch : ''}
                    </p>
                    <p style="color: var(--text-secondary); font-size: 13px; margin: 8px 0 0 0;">
                        <i class="fas fa-envelope" style="margin-right: 4px;"></i>${app.email}
                        ${app.phone ? ` • <i class="fas fa-phone" style="margin-left: 8px; margin-right: 4px;"></i>${app.phone}` : ''}
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="viewApplication(${i})" class="edit-btn" title="View Details"><i class="fas fa-eye"></i></button>
                    ${app.status === 'pending' ? `
                        <button onclick="updateAppStatus('${app.id}', 'approved')" style="background: #22c55e; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;" title="Approve"><i class="fas fa-check"></i></button>
                        <button onclick="updateAppStatus('${app.id}', 'rejected')" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;" title="Reject"><i class="fas fa-times"></i></button>
                    ` : ''}
                    ${app.status === 'approved' && !app.published ? `
                        <button onclick="publishToSite('${app.id}')" style="background: linear-gradient(135deg, #8b5cf6, #d35dab); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 500;" title="Publish to Site">
                            <i class="fas fa-globe" style="margin-right: 4px;"></i>Publish
                        </button>
                    ` : ''}
                    ${app.status === 'approved' && app.published ? `
                        <button onclick="republishToSite('${app.id}')" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 500;" title="Republish to Site (if deleted)">
                            <i class="fas fa-redo" style="margin-right: 4px;"></i>Republish
                        </button>
                    ` : ''}
                    <button onclick="deleteApplication('${app.id}')" class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
                <p style="font-size: 13px; color: var(--text-secondary); margin: 0;"><strong>Why advocate:</strong> ${(app.why_advocate || '').substring(0, 150)}${app.why_advocate?.length > 150 ? '...' : ''}</p>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin: 8px 0 0 0;">
                Applied: ${app.timestamp ? new Date(app.timestamp).toLocaleDateString() : 'N/A'}
            </p>
        </div>
    `).join('');
}

function viewApplication(index) {
    const app = filteredApplications[index];
    alert(`📋 APPLICATION DETAILS\n\n` +
        `Name: ${app.name}\n` +
        `Email: ${app.email}\n` +
        `Phone: ${app.phone || 'N/A'}\n` +
        `College: ${app.college}\n` +
        `City: ${app.city}\n` +
        `Year: ${app.year}\n` +
        `Branch: ${app.branch || 'N/A'}\n` +
        `LinkedIn: ${app.linkedin || 'N/A'}\n\n` +
        `--- WHY ADVOCATE ---\n${app.why_advocate}\n\n` +
        `--- EXPERIENCE ---\n${app.experience || 'N/A'}\n\n` +
        `--- IDEAS ---\n${app.ideas || 'N/A'}`
    );
}

async function updateAppStatus(appId, status) {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;
    
    try {
        await fetch(`${API_URL}/advocate-applications/${appId}/status?status=${status}`, {
            method: 'PUT'
        });
        
        // Update local data
        const app = applicationsData.find(a => a.id === appId);
        if (app) app.status = status;
        
        filterApplications();
        showToast(`Application ${status}!`);
        
        // If approved, offer to publish to site immediately
        if (status === 'approved' && app) {
            if (confirm(`Would you like to publish ${app.name} to the Campus Advocates section on the website now?\n\nYou can also do this later using the "Publish" button.`)) {
                await publishToSite(appId);
            }
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error updating status');
    }
}

async function publishToSite(appId) {
    if (!confirm('Publish this advocate to the website?')) return;
    
    try {
        const response = await fetch(`${API_URL}/advocate-applications/${appId}/publish`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update local data to reflect published status
            const app = applicationsData.find(a => a.id === appId);
            if (app) app.published = true;
            
            filterApplications();
            await loadAdvocates(); // Refresh advocates list
            showToast(result.message);
        } else {
            showToast(result.message || 'Error publishing advocate');
        }
    } catch (error) {
        console.error('Error publishing advocate:', error);
        showToast('Error publishing advocate');
    }
}

async function republishToSite(appId) {
    if (!confirm('Republish this advocate to the website?\n\nThis will create a new entry in Campus Advocates (useful if the previous entry was deleted).')) return;
    
    try {
        const response = await fetch(`${API_URL}/advocate-applications/${appId}/publish?force=true`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadAdvocates(); // Refresh advocates list
            showToast(result.message);
        } else {
            showToast(result.message || 'Error republishing advocate');
        }
    } catch (error) {
        console.error('Error republishing advocate:', error);
        showToast('Error republishing advocate');
    }
}

async function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
        await fetch(`${API_URL}/advocate-applications/${appId}`, {
            method: 'DELETE'
        });
        
        applicationsData = applicationsData.filter(a => a.id !== appId);
        filterApplications();
        showToast('Application deleted!');
    } catch (error) {
        console.error('Error deleting application:', error);
        showToast('Error deleting application');
    }
}


async function republishAllAdvocates() {
    if (!confirm('This will recreate all campus advocates from approved applications. Existing advocates with the same name+college will be skipped. Continue?')) return;
    try {
        const response = await fetch(`${API_URL}/advocate-applications/republish-all`, { method: 'POST' });
        if (!response.ok) {
            showToast('Error', `Republish failed (${response.status})`);
            return;
        }
        const result = await response.json();
        if (result.success) {
            showToast('Success!', result.message);
            await loadAdvocates();
            await loadAdvocateApplications();
            await loadLeaderboardData();
        } else {
            showToast('Error', result.message);
        }
    } catch (err) {
        console.error('Republish error:', err);
        showToast('Error', 'Failed to republish: ' + err.message);
    }
}


function downloadApplicationsCSV() {
    if (filteredApplications.length === 0) {
        showToast('No applications to download!');
        return;
    }
    
    const headers = ['name', 'email', 'phone', 'college', 'city', 'year', 'branch', 'linkedin', 'why_advocate', 'experience', 'ideas', 'status', 'timestamp'];
    const filename = `ssoc_advocate_applications_${new Date().toISOString().split('T')[0]}.csv`;
    
    const csvRows = [];
    csvRows.push(headers.map(h => h.replace(/_/g, ' ').toUpperCase()).join(','));
    
    filteredApplications.forEach(app => {
        const row = headers.map(h => {
            let val = app[h] || '';
            if (h === 'timestamp' && val) val = new Date(val).toLocaleString();
            return escapeCSV(val);
        });
        csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV downloaded!');
}

// ===== TESTIMONIALS =====
let testimonialsData = [];

async function loadTestimonials() {
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        testimonialsData = await response.json();
        renderTestimonials(testimonialsData);
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

function renderTestimonials(testimonials = allTestimonials) {
    const container = document.getElementById('testimonialList');
    if (!container) return;
    if (!testimonials || testimonials.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No testimonials added yet.</p>';
        return;
    }
    container.innerHTML = testimonials.map((t, i) => `
        <div class="testimonial-item">
            <img src="${t.image || 'https://via.placeholder.com/48'}" alt="${t.name}">
            <div class="testimonial-item-content">
                <h4>${t.name}</h4>
                <p>${t.role}</p>
                <div class="quote">"${(t.quote || '').substring(0, 100)}..."</div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editTestimonial(${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteTestimonial(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function addTestimonial() {
    const name = prompt('Enter name:');
    if (!name) return;
    const role = prompt('Enter role (e.g., Contributor • Season 4):');
    const quote = prompt('Enter testimonial quote:');
    if (!quote) return;
    const image = prompt('Enter image URL:', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop');
    const achievement = prompt('Enter achievement badge (optional):');
    
    const testimonial = {
        id: 'test_' + Date.now(),
        name,
        role,
        quote,
        image,
        achievement
    };
    
    testimonialsData.push(testimonial);
    
    try {
        await fetch(`${API_URL}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testimonialsData)
        });
        renderTestimonials(testimonialsData);
        showToast('Testimonial added successfully!');
    } catch (error) {
        console.error('Error adding testimonial:', error);
    }
}

async function editTestimonial(index) {
    const t = testimonialsData[index];
    
    const name = prompt('Enter name:', t.name);
    if (!name) return;
    const role = prompt('Enter role:', t.role);
    const quote = prompt('Enter quote:', t.quote);
    const image = prompt('Enter image URL:', t.image);
    const achievement = prompt('Enter achievement badge:', t.achievement);
    
    testimonialsData[index] = { ...t, name, role, quote, image, achievement };
    
    try {
        await fetch(`${API_URL}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testimonialsData)
        });
        renderTestimonials(testimonialsData);
        showToast('Testimonial updated successfully!');
    } catch (error) {
        console.error('Error updating testimonial:', error);
    }
}

async function deleteTestimonial(index) {
    if (!confirm('Delete this testimonial?')) return;
    
    testimonialsData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testimonialsData)
        });
        renderTestimonials(testimonialsData);
        showToast('Testimonial deleted!');
    } catch (error) {
        console.error('Error deleting testimonial:', error);
    }
}

// ===== SPONSORS =====
let sponsorsData = [];
let currentSponsorFilter = 'all';

const categoryColors = {
    'platinum': '#a855f7',
    'gold': '#f59e0b',
    'silver': '#94a3b8',
    'bronze': '#d97706',
    'community': '#22c55e'
};

// Show loading skeleton for sponsors
function showSponsorsLoading() {
    const container = document.getElementById('sponsorsList');
    if (!container) return;
    container.innerHTML = `
        <div style="display: flex; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 12px; animation: pulse 1.5s infinite;">
            <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--bg-primary);"></div>
            <div style="flex: 1;">
                <div style="height: 16px; width: 50%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="height: 12px; width: 70%; background: var(--bg-primary); border-radius: 4px;"></div>
            </div>
        </div>
    `;
}

async function loadSponsors() {
    showSponsorsLoading();
    try {
        const response = await fetch(`${API_URL}/sponsors`);
        sponsorsData = await response.json();
        renderSponsors();
    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

function filterSponsors(category) {
    currentSponsorFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    renderSponsors();
}

function renderSponsors() {
    const container = document.getElementById('sponsorsList');
    if (!container) return;
    
    let filtered = sponsorsData;
    if (currentSponsorFilter !== 'all') {
        filtered = sponsorsData.filter(s => s.category === currentSponsorFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No sponsors found. Add your first sponsor!</p>';
        return;
    }
    
    container.innerHTML = filtered.map((s, i) => `
        <div class="sponsor-item" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${categoryColors[s.category] || '#d35dab'};">
            <img src="${s.logo}" alt="${s.name}" style="width: 80px; height: 50px; object-fit: contain; background: white; border-radius: 8px; padding: 4px;" onerror="this.src='https://via.placeholder.com/80x50?text=${encodeURIComponent(s.name.charAt(0))}'">
            <div style="flex: 1;">
                <h4 style="margin: 0; color: var(--text-primary);">${s.name}</h4>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: ${categoryColors[s.category]}20; color: ${categoryColors[s.category]}; font-weight: 600; text-transform: uppercase;">${s.category}</span>
                <a href="${s.website}" target="_blank" style="display: block; font-size: 12px; color: var(--primary); margin-top: 4px;">${s.website}</a>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="edit-btn" onclick="editSponsor(${sponsorsData.indexOf(s)})" data-testid="edit-sponsor-${i}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteSponsor(${sponsorsData.indexOf(s)})" data-testid="delete-sponsor-${i}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function addSponsor() {
    const name = prompt('Enter sponsor/partner name:');
    if (!name) return;
    
    const category = prompt('Enter category (platinum, gold, silver, bronze, community):')?.toLowerCase();
    if (!['platinum', 'gold', 'silver', 'bronze', 'community'].includes(category)) {
        alert('Invalid category! Please use: platinum, gold, silver, bronze, or community');
        return;
    }
    
    const logo = prompt('Enter logo URL:');
    if (!logo) {
        alert('Logo URL is required!');
        return;
    }
    
    const website = prompt('Enter website URL:');
    if (!website) {
        alert('Website URL is required!');
        return;
    }
    
    const sponsor = {
        id: 'sponsor_' + Date.now(),
        name,
        logo,
        website,
        category,
        isActive: true
    };
    
    try {
        await fetch(`${API_URL}/sponsors/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sponsor)
        });
        sponsorsData.push(sponsor);
        renderSponsors();
        showToast('Sponsor added successfully!');
    } catch (error) {
        console.error('Error adding sponsor:', error);
        showToast('Error adding sponsor');
    }
}

async function editSponsor(index) {
    const s = sponsorsData[index];
    
    const name = prompt('Enter sponsor name:', s.name);
    if (!name) return;
    
    const category = prompt('Enter category (platinum, gold, silver, bronze, community):', s.category)?.toLowerCase();
    if (!['platinum', 'gold', 'silver', 'bronze', 'community'].includes(category)) {
        alert('Invalid category!');
        return;
    }
    
    const logo = prompt('Enter logo URL:', s.logo);
    const website = prompt('Enter website URL:', s.website);
    const isActiveStr = prompt('Is active? (yes/no):', s.isActive !== false ? 'yes' : 'no');
    
    sponsorsData[index] = {
        ...s,
        name,
        logo,
        website,
        category,
        isActive: isActiveStr.toLowerCase() === 'yes'
    };
    
    try {
        await fetch(`${API_URL}/sponsors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sponsorsData)
        });
        renderSponsors();
        showToast('Sponsor updated successfully!');
    } catch (error) {
        console.error('Error updating sponsor:', error);
        showToast('Error updating sponsor');
    }
}

async function deleteSponsor(index) {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;
    
    const sponsorId = sponsorsData[index].id;
    sponsorsData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/sponsors/${sponsorId}`, {
            method: 'DELETE'
        });
        renderSponsors();
        showToast('Sponsor deleted!');
    } catch (error) {
        console.error('Error deleting sponsor:', error);
        showToast('Error deleting sponsor');
    }
}

// ===== REFERRAL LINKS =====
let referralLinksData = [];
let filteredReferralLinks = [];
let currentRefFilter = 'all';

// Show loading skeleton for referral links
function showReferralLinksLoading() {
    const container = document.getElementById('referralLinksList');
    if (!container) return;
    container.innerHTML = `
        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #8b5cf6; animation: pulse 1.5s infinite;">
            <div style="height: 20px; width: 50%; background: var(--bg-primary); border-radius: 4px; margin-bottom: 12px;"></div>
            <div style="height: 40px; width: 100%; background: var(--bg-primary); border-radius: 8px; margin-bottom: 12px;"></div>
            <div style="display: flex; gap: 24px;">
                <div style="height: 14px; width: 60px; background: var(--bg-primary); border-radius: 4px;"></div>
                <div style="height: 14px; width: 80px; background: var(--bg-primary); border-radius: 4px;"></div>
            </div>
        </div>
    `;
}

async function loadReferralLinks() {
    showReferralLinksLoading();
    try {
        const response = await fetch(`${API_URL}/referral-links`);
        referralLinksData = await response.json();
        filterReferralLinks(currentRefFilter);
        updateReferralStats();
    } catch (error) {
        console.error('Error loading referral links:', error);
    }
}

function updateReferralStats() {
    const totalLinks = referralLinksData.length;
    const totalClicks = referralLinksData.reduce((sum, l) => sum + (l.clicks || 0), 0);
    const totalRegs = referralLinksData.reduce((sum, l) => sum + (l.registrations || 0), 0);
    
    document.getElementById('totalLinksCount').textContent = totalLinks;
    document.getElementById('totalClicksCount').textContent = totalClicks;
    document.getElementById('totalRegsCount').textContent = totalRegs;
}

function filterReferralLinks(type) {
    currentRefFilter = type;
    
    // Update filter buttons
    document.querySelectorAll('[data-ref-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.refFilter === type);
    });
    
    if (type === 'all') {
        filteredReferralLinks = referralLinksData;
    } else {
        filteredReferralLinks = referralLinksData.filter(l => l.type === type);
    }
    
    renderReferralLinks();
}

function renderReferralLinks() {
    const container = document.getElementById('referralLinksList');
    if (!container) return;
    
    if (filteredReferralLinks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No referral links found. Generate one for a campus advocate or create a custom link.</p>';
        return;
    }
    
    const baseUrl = window.location.origin;
    
    container.innerHTML = filteredReferralLinks.map(link => {
        const hasClicks = (link.clicks || 0) > 0;
        const clickStatusBadge = hasClicks 
            ? `<span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(34, 197, 94, 0.15); color: #22c55e; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fas fa-check-circle"></i>OPENED (${link.clicks})
               </span>`
            : `<span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(156, 163, 175, 0.15); color: #9ca3af; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fas fa-clock"></i>NOT OPENED
               </span>`;
        
        return `
        <div class="referral-link-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${link.type === 'advocate' ? '#8b5cf6' : '#22c55e'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <h4 style="margin: 0; color: var(--text-primary);">${link.name}</h4>
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${link.type === 'advocate' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)'}; color: ${link.type === 'advocate' ? '#8b5cf6' : '#22c55e'};">
                            ${link.type === 'advocate' ? '<i class="fas fa-graduation-cap" style="margin-right: 4px;"></i>ADVOCATE' : '<i class="fas fa-tag" style="margin-right: 4px;"></i>CUSTOM'}
                        </span>
                        ${clickStatusBadge}
                        ${!link.isActive ? '<span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: #ef4444;"><i class="fas fa-ban" style="margin-right: 4px;"></i>INACTIVE</span>' : ''}
                    </div>
                    <div style="background: var(--bg-primary); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; margin: 12px 0;">
                        <code style="flex: 1; color: var(--primary); font-size: 13px; word-break: break-all;">${baseUrl}/?ref=${link.code}</code>
                        <button onclick="copyReferralLink('${link.code}')" style="background: var(--primary); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-mouse-pointer" style="color: ${hasClicks ? '#22c55e' : 'var(--text-muted)'};"></i>
                            <span style="font-weight: 600; color: ${hasClicks ? '#22c55e' : 'var(--text-primary)'};">${link.clicks || 0}</span>
                            <span style="color: var(--text-muted); font-size: 13px;">Clicks</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user-plus" style="color: ${(link.registrations || 0) > 0 ? '#f59e0b' : 'var(--text-muted)'};"></i>
                            <span style="font-weight: 600; color: ${(link.registrations || 0) > 0 ? '#f59e0b' : 'var(--text-primary)'};">${link.registrations || 0}</span>
                            <span style="color: var(--text-muted); font-size: 13px;">Registrations</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-percentage" style="color: var(--text-muted);"></i>
                            <span style="font-weight: 600; color: var(--text-primary);">${link.clicks > 0 ? ((link.registrations / link.clicks) * 100).toFixed(1) : 0}%</span>
                            <span style="color: var(--text-muted); font-size: 13px;">Conv. Rate</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="toggleReferralLinkStatus('${link.id}', ${!link.isActive})" class="edit-btn" title="${link.isActive ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${link.isActive ? 'pause' : 'play'}"></i>
                    </button>
                    <button onclick="deleteReferralLink('${link.id}')" class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin: 12px 0 0 0;">
                Created: ${link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'N/A'}
                ${link.advocateName ? ` • Advocate: ${link.advocateName}` : ''}
            </p>
        </div>
    `}).join('');
}

function copyReferralLink(code) {
    const url = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Link copied to clipboard!');
    });
}

async function generateAdvocateReferralLink() {
    // Show modal with advocate selection
    const advocates = advocatesData.filter(a => a.isActive !== false);
    
    if (advocates.length === 0) {
        alert('No active campus advocates found. Add some advocates first.');
        return;
    }
    
    // Check which advocates already have referral links
    const existingAdvocateIds = referralLinksData
        .filter(l => l.type === 'advocate' && l.advocateId)
        .map(l => l.advocateId);
    
    const availableAdvocates = advocates.filter(a => !existingAdvocateIds.includes(a.id));
    
    if (availableAdvocates.length === 0) {
        alert('All campus advocates already have referral links!');
        return;
    }
    
    // Create selection dialog
    const advocateOptions = availableAdvocates.map((a, i) => `${i + 1}. ${a.name} (${a.college})`).join('\n');
    const selection = prompt(`Select an advocate to generate a referral link for:\n\n${advocateOptions}\n\nEnter the number:`);
    
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (isNaN(index) || index < 0 || index >= availableAdvocates.length) {
        alert('Invalid selection');
        return;
    }
    
    const selectedAdvocate = availableAdvocates[index];
    
    try {
        const response = await fetch(`${API_URL}/referral-links/generate-for-advocate/${selectedAdvocate.id}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadReferralLinks();
            showToast(result.message);
            
            // Copy the link
            copyReferralLink(result.code);
        } else {
            showToast(result.message || 'Error generating referral link');
        }
    } catch (error) {
        console.error('Error generating referral link:', error);
        showToast('Error generating referral link');
    }
}

async function createCustomReferralLink() {
    const name = prompt('Enter a name for this referral link (e.g., "Tech Fest 2025", "LinkedIn Campaign"):');
    if (!name) return;
    
    // Generate code from name
    let code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existingCode = prompt(`Enter a custom code (URL-friendly) or press OK to use:\n\n${code}`);
    
    if (existingCode !== null && existingCode.trim() !== '') {
        code = existingCode.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    }
    
    if (!code) {
        alert('Invalid code');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/referral-links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                name,
                type: 'custom',
                isActive: true
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadReferralLinks();
            showToast('Custom referral link created!');
            copyReferralLink(result.code);
        } else {
            showToast(result.message || 'Error creating referral link');
        }
    } catch (error) {
        console.error('Error creating referral link:', error);
        showToast('Error creating referral link');
    }
}

async function toggleReferralLinkStatus(linkId, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} this referral link?`)) return;
    
    const link = referralLinksData.find(l => l.id === linkId);
    if (!link) return;
    
    try {
        await fetch(`${API_URL}/referral-links/${linkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...link, isActive: newStatus })
        });
        
        await loadReferralLinks();
        showToast(`Referral link ${action}d!`);
    } catch (error) {
        console.error('Error updating referral link:', error);
        showToast('Error updating referral link');
    }
}

async function deleteReferralLink(linkId) {
    if (!confirm('Are you sure you want to delete this referral link? This action cannot be undone.')) return;
    
    try {
        await fetch(`${API_URL}/referral-links/${linkId}`, {
            method: 'DELETE'
        });
        
        await loadReferralLinks();
        showToast('Referral link deleted!');
    } catch (error) {
        console.error('Error deleting referral link:', error);
        showToast('Error deleting referral link');
    }
}

function downloadAdvocateLinksExcel() {
    // Filter only advocate links
    const advocateLinks = referralLinksData.filter(l => l.type === 'advocate');
    
    if (advocateLinks.length === 0) {
        showToast('No advocate referral links found. Generate some first!');
        return;
    }
    
    const baseUrl = window.location.origin;
    
    // Create CSV content with BOM for Excel compatibility
    const BOM = '\uFEFF';
    const headers = ['Name', 'College', 'Referral Code', 'Referral Link', 'Clicks', 'Registrations', 'Created Date'];
    
    const rows = advocateLinks.map(link => {
        const fullUrl = `${baseUrl}/?ref=${link.code}`;
        const createdDate = link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'N/A';
        
        // Get advocate details if available
        const advocate = advocatesData.find(a => a.id === link.advocateId);
        const college = advocate ? advocate.college : (link.advocateName || 'N/A');
        
        return [
            link.advocateName || link.name.replace(' - Campus Advocate', ''),
            college,
            link.code,
            fullUrl,
            link.clicks || 0,
            link.registrations || 0,
            createdDate
        ];
    });
    
    // Build CSV
    const csvContent = BOM + [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SSoC_Campus_Advocate_Referral_Links_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${advocateLinks.length} advocate referral links!`);
}

// ===== FAQ =====
let faqsData = [];

async function loadFAQs() {
    try {
        const response = await fetch(`${API_URL}/faqs`);
        faqsData = await response.json();
        renderFAQs(faqsData);
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

function renderFAQs(faqs = allFAQs) {
    const container = document.getElementById('faqsList');
    if (!container) return;
    if (!faqs || faqs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No FAQs added yet.</p>';
        return;
    }
    container.innerHTML = faqs.map((f, i) => `
        <div class="testimonial-item">
            <i class="fas fa-question-circle" style="font-size: 24px; color: var(--primary);"></i>
            <div class="testimonial-item-content">
                <h4>${f.question}</h4>
                <div class="quote" style="font-style: normal;">${(f.answer || '').substring(0, 100)}...</div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editFAQ(${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteFAQ(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function addFAQ() {
    const question = prompt('Enter question:');
    if (!question) return;
    const answer = prompt('Enter answer:');
    if (!answer) return;
    
    const faq = {
        id: 'faq_' + Date.now(),
        question,
        answer
    };
    
    faqsData.push(faq);
    
    try {
        await fetch(`${API_URL}/faqs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faqsData)
        });
        renderFAQs(faqsData);
        showToast('FAQ added successfully!');
    } catch (error) {
        console.error('Error adding FAQ:', error);
    }
}

async function editFAQ(index) {
    const f = faqsData[index];
    
    const question = prompt('Enter question:', f.question);
    if (!question) return;
    const answer = prompt('Enter answer:', f.answer);
    
    faqsData[index] = { ...f, question, answer };
    
    try {
        await fetch(`${API_URL}/faqs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faqsData)
        });
        renderFAQs(faqsData);
        showToast('FAQ updated successfully!');
    } catch (error) {
        console.error('Error updating FAQ:', error);
    }
}

async function deleteFAQ(index) {
    if (!confirm('Delete this FAQ?')) return;
    
    faqsData.splice(index, 1);
    
    try {
        await fetch(`${API_URL}/faqs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faqsData)
        });
        renderFAQs(faqsData);
        showToast('FAQ deleted!');
    } catch (error) {
        console.error('Error deleting FAQ:', error);
    }
}

// ===== REGISTRATIONS =====
let registrationsData = [];
let filteredRegistrations = [];
let allRegistrationFields = [];

// Fields to exclude from display (internal fields)
const excludedFields = ['id', '_id'];

// Priority order for common fields (these appear first)
const priorityFields = ['name', 'email', 'role', 'timestamp'];

async function loadRegistrations() {
    try {
        const response = await fetch(`${API_URL}/registrations`);
        registrationsData = await response.json();
        
        // Collect all unique fields from all registrations
        const fieldSet = new Set();
        registrationsData.forEach(r => {
            Object.keys(r).forEach(key => {
                if (!excludedFields.includes(key)) {
                    fieldSet.add(key);
                }
            });
        });
        
        // Sort fields: priority fields first, then alphabetically
        allRegistrationFields = Array.from(fieldSet).sort((a, b) => {
            const aIndex = priorityFields.indexOf(a);
            const bIndex = priorityFields.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });
        
        filterRegistrations(); // Apply current filter
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
}

function filterRegistrations() {
    const roleFilter = document.getElementById('roleFilter').value;
    
    if (roleFilter === 'all') {
        filteredRegistrations = [...registrationsData];
    } else {
        filteredRegistrations = registrationsData.filter(r => r.role === roleFilter);
    }
    
    renderRegistrations();
    updateRegistrationCount();
}

function updateRegistrationCount() {
    const countEl = document.getElementById('registrationCount');
    const total = registrationsData.length;
    const filtered = filteredRegistrations.length;
    
    if (filteredRegistrations.length === registrationsData.length) {
        countEl.textContent = `${total} total`;
    } else {
        countEl.textContent = `${filtered} of ${total}`;
    }
}

function formatFieldName(field) {
    // Convert field names to readable format
    return field
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

function formatCellValue(value, field) {
    if (value === null || value === undefined || value === '') return '-';
    
    // Format timestamp
    if (field === 'timestamp') {
        return new Date(value).toLocaleDateString();
    }
    
    // Format role
    if (field === 'role') {
        return `<span class="role-badge ${value}">${(value || '').replace('-', ' ')}</span>`;
    }
    
    // Format URLs (github, linkedin, etc.)
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        return `<a href="${value}" target="_blank" style="color: var(--primary);">View</a>`;
    }
    
    // Truncate long text
    if (typeof value === 'string' && value.length > 50) {
        return `<span title="${value}">${value.substring(0, 50)}...</span>`;
    }
    
    return value;
}

function getDisplayFields() {
    // Mirror the CSV logic: when a specific role is filtered, hide columns
    // that have no values for that role (eliminates clutter from other roles'
    // custom fields). When "All", show every column.
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    if (roleFilter === 'all' || filteredRegistrations.length === 0) {
        return allRegistrationFields;
    }
    const usedFields = new Set();
    filteredRegistrations.forEach(r => {
        Object.keys(r).forEach(key => {
            if (excludedFields.includes(key)) return;
            const v = r[key];
            if (v !== null && v !== undefined && v !== '') {
                usedFields.add(key);
            }
        });
    });
    priorityFields.forEach(f => usedFields.add(f));
    return Array.from(usedFields).sort((a, b) => {
        const aIndex = priorityFields.indexOf(a);
        const bIndex = priorityFields.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });
}

function renderRegistrations() {
    const thead = document.getElementById('registrationsHead');
    const tbody = document.getElementById('registrationsBody');
    const displayFields = getDisplayFields();
    
    // Generate table headers
    thead.innerHTML = `
        <tr>
            ${displayFields.map(field => `<th style="white-space: nowrap;">${formatFieldName(field)}</th>`).join('')}
        </tr>
    `;
    
    if (filteredRegistrations.length === 0) {
        const roleFilter = document.getElementById('roleFilter').value;
        const message = roleFilter === 'all' ? 'No registrations yet' : `No ${roleFilter.replace('-', ' ')} registrations`;
        tbody.innerHTML = `
            <tr>
                <td colspan="${displayFields.length || 5}">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>${message}</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filteredRegistrations.map(r => `
            <tr>
                ${displayFields.map(field => `<td style="white-space: nowrap;">${formatCellValue(r[field], field)}</td>`).join('')}
            </tr>
        `).join('');
    }
}

// ===== CSV DOWNLOAD FUNCTIONS =====
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function downloadCSV(data, filename, headers) {
    if (data.length === 0) {
        showToast('No data to download!');
        return;
    }

    const csvRows = [];
    csvRows.push(headers.join(','));

    data.forEach(item => {
        const row = headers.map(header => escapeCSV(item[header]));
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('CSV downloaded successfully!');
}

function downloadRegistrationsCSV() {
    const roleFilter = document.getElementById('roleFilter').value;
    const dataToDownload = filteredRegistrations;
    
    if (dataToDownload.length === 0) {
        showToast('No registrations to download!');
        return;
    }
    
    // Build role-aware headers:
    // - When filtering by a specific role, only include columns that are actually
    //   present (have at least one non-empty value) in the filtered rows. This
    //   removes empty columns from other roles' custom fields and makes
    //   role-specific custom questions stand out clearly.
    // - When "All" is selected, keep showing every column for full export.
    let headers;
    if (roleFilter === 'all') {
        headers = allRegistrationFields.length > 0 ? allRegistrationFields : ['name', 'email', 'role', 'timestamp'];
    } else {
        const usedFields = new Set();
        dataToDownload.forEach(r => {
            Object.keys(r).forEach(key => {
                if (excludedFields.includes(key)) return;
                const v = r[key];
                if (v !== null && v !== undefined && v !== '') {
                    usedFields.add(key);
                }
            });
        });
        // Always keep priority/base fields even if empty
        priorityFields.forEach(f => usedFields.add(f));
        // Sort: priority fields first, then alphabetical (matches table order)
        headers = Array.from(usedFields).sort((a, b) => {
            const aIndex = priorityFields.indexOf(a);
            const bIndex = priorityFields.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });
    }
    const roleSuffix = roleFilter === 'all' ? 'all' : roleFilter;
    const filename = `ssoc_registrations_${roleSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Create CSV with readable headers
    const csvRows = [];
    csvRows.push(headers.map(h => formatFieldName(h)).join(','));
    
    dataToDownload.forEach(item => {
        const row = headers.map(header => {
            let value = item[header];
            if (value === null || value === undefined) return '';
            // Format timestamp for CSV
            if (header === 'timestamp' && value) {
                value = new Date(value).toLocaleString();
            }
            return escapeCSV(value);
        });
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`CSV downloaded with ${headers.length} columns!`);
}

function downloadProjectsCSV() {
    const processedProjects = projectsData.map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags.join('; ') : p.tags
    }));
    const headers = ['name', 'organization', 'description', 'tags', 'github', 'website', 'logo', 'stars', 'forks', 'contributors'];
    const filename = 'ssoc_projects_' + new Date().toISOString().split('T')[0] + '.csv';
    downloadCSV(processedProjects, filename, headers);
}

function downloadMentorsCSV() {
    const processedMentors = mentorsData.map(m => ({
        ...m,
        skills: Array.isArray(m.skills) ? m.skills.join('; ') : m.skills
    }));
    const headers = ['name', 'role', 'company', 'bio', 'skills', 'avatar', 'github', 'linkedin', 'twitter'];
    const filename = 'ssoc_mentors_' + new Date().toISOString().split('T')[0] + '.csv';
    downloadCSV(processedMentors, filename, headers);
}

// ===== TOAST =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 4000);
}

// ===== FOOTER MANAGEMENT =====
let footerData = {
    brandDescription: '',
    copyrightText: '',
    socialLinks: {},
    communityLinks: [],
    resourceLinks: [],
    legalLinks: []
};

async function loadFooterData() {
    try {
        const response = await fetch(`${API_URL}/footer`);
        footerData = await response.json();
        
        // Populate form fields
        document.getElementById('footerBrandDescription').value = footerData.brandDescription || '';
        document.getElementById('footerCopyrightText').value = footerData.copyrightText || '';
        
        // Social links
        const social = footerData.socialLinks || {};
        document.getElementById('socialGithub').value = social.github || '';
        document.getElementById('socialTwitter').value = social.twitter || '';
        document.getElementById('socialLinkedin').value = social.linkedin || '';
        document.getElementById('socialInstagram').value = social.instagram || '';
        document.getElementById('socialDiscord').value = social.discord || '';
        document.getElementById('socialYoutube').value = social.youtube || '';
        
        // Render link lists
        renderLinksList('communityLinksList', footerData.communityLinks || [], 'community');
        renderLinksList('resourceLinksList', footerData.resourceLinks || [], 'resource');
        renderLinksList('legalLinksList', footerData.legalLinks || [], 'legal');
        updateFooterPreview();
    } catch (error) {
        console.error('Error loading footer data:', error);
    }
}

function renderLinksList(containerId, links, type) {
    const container = document.getElementById(containerId);
    if (links.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No links added yet.</p>';
        return;
    }
    container.innerHTML = links.map((link, i) => `
        <div class="testimonial-item">
            <i class="fas fa-link" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(211, 93, 171, 0.1); border-radius: 8px; color: var(--primary);"></i>
            <div class="testimonial-item-content">
                <h4>${link.label}</h4>
                <p style="font-size: 13px; color: var(--text-muted);">${link.url}</p>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="editLink('${type}', ${i})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteLink('${type}', ${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function saveFooterSettings() {
    footerData.brandDescription = document.getElementById('footerBrandDescription').value;
    footerData.copyrightText = document.getElementById('footerCopyrightText').value;
    await saveFooter();
}

async function saveSocialLinks() {
    footerData.socialLinks = {
        github: document.getElementById('socialGithub').value,
        twitter: document.getElementById('socialTwitter').value,
        linkedin: document.getElementById('socialLinkedin').value,
        instagram: document.getElementById('socialInstagram').value,
        discord: document.getElementById('socialDiscord').value,
        youtube: document.getElementById('socialYoutube').value
    };
    await saveFooter();
}

async function saveFooter() {
    try {
        await fetch(`${API_URL}/footer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(footerData)
        });
        showToast('Footer settings saved successfully!');
        updateFooterPreview();
        refreshTimestamp('footer');
    } catch (error) {
        console.error('Error saving footer:', error);
        showToast('Error saving footer settings');
    }
}

async function addCommunityLink() {
    const label = prompt('Enter link label (e.g., "Discord"):');
    if (!label) return;
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    
    if (!footerData.communityLinks) footerData.communityLinks = [];
    footerData.communityLinks.push({ label, url });
    await saveFooter();
    renderLinksList('communityLinksList', footerData.communityLinks, 'community');
}

async function addResourceLink() {
    const label = prompt('Enter link label (e.g., "Documentation"):');
    if (!label) return;
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    
    if (!footerData.resourceLinks) footerData.resourceLinks = [];
    footerData.resourceLinks.push({ label, url });
    await saveFooter();
    renderLinksList('resourceLinksList', footerData.resourceLinks, 'resource');
}

async function addLegalLink() {
    const label = prompt('Enter link label (e.g., "Privacy Policy"):');
    if (!label) return;
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    
    if (!footerData.legalLinks) footerData.legalLinks = [];
    footerData.legalLinks.push({ label, url });
    await saveFooter();
    renderLinksList('legalLinksList', footerData.legalLinks, 'legal');
}

async function editLink(type, index) {
    const linksKey = type + 'Links';
    const containerId = type + 'LinksList';
    const link = footerData[linksKey][index];
    
    const label = prompt('Enter link label:', link.label);
    if (!label) return;
    const url = prompt('Enter URL:', link.url);
    if (!url) return;
    
    footerData[linksKey][index] = { label, url };
    await saveFooter();
    renderLinksList(containerId, footerData[linksKey], type);
}

async function deleteLink(type, index) {
    if (!confirm('Delete this link?')) return;
    
    const linksKey = type + 'Links';
    const containerId = type + 'LinksList';
    
    footerData[linksKey].splice(index, 1);
    await saveFooter();
    renderLinksList(containerId, footerData[linksKey], type);
}

// ===== CONTENT PAGES MANAGEMENT =====
let contentPages = [];
let editingPageId = null;

async function loadContentPages() {
    try {
        const response = await fetch(`${API_URL}/pages`);
        contentPages = await response.json();
        renderContentPages();
    } catch (error) {
        console.error('Error loading content pages:', error);
    }
}

function renderContentPages() {
    const container = document.getElementById('pagesList');
    if (!container) return;
    
    if (contentPages.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">No content pages created yet. Click "Create New Page" to get started!</p>';
        return;
    }
    
    container.innerHTML = contentPages.map(page => `
        <div class="testimonial-item" style="border-left: 4px solid ${page.isPublished ? 'var(--success)' : 'var(--text-muted)'};">
            <i class="fas fa-file-alt" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(211, 93, 171, 0.1); border-radius: 8px; color: var(--primary); font-size: 20px;"></i>
            <div class="testimonial-item-content" style="flex: 1;">
                <h4 style="display: flex; align-items: center; gap: 8px;">
                    ${page.title}
                    <span style="font-size: 10px; padding: 2px 8px; background: ${page.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 90, 125, 0.1)'}; color: ${page.isPublished ? 'var(--success)' : 'var(--text-muted)'}; border-radius: 4px;">
                        ${page.isPublished ? 'Published' : 'Draft'}
                    </span>
                </h4>
                <p style="font-size: 13px; color: var(--text-muted);">
                    <i class="fas fa-link"></i> /page.html?slug=${page.slug} &nbsp;|&nbsp; 
                    <i class="fas fa-folder"></i> ${getCategoryLabel(page.category)}
                </p>
            </div>
            <div class="testimonial-item-actions" style="display: flex; gap: 8px;">
                <button class="edit-btn" onclick="viewPageLive('${page.slug}')" title="View Page">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="edit-btn" onclick="editPage('${page.id}')" title="Edit Page">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deletePage('${page.id}')" title="Delete Page">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'legal': 'Legal & Policies',
        'resource': 'Resources',
        'community': 'Community'
    };
    return labels[category] || 'General';
}

function openPageEditor(pageId = null) {
    editingPageId = pageId;
    document.getElementById('pageEditorCard').style.display = 'block';
    document.getElementById('pageEditorTitle').textContent = pageId ? 'Edit Page' : 'Create New Page';
    
    if (pageId) {
        const page = contentPages.find(p => p.id === pageId);
        if (page) {
            document.getElementById('contentPageTitle').value = page.title;
            document.getElementById('pageSlug').value = page.slug;
            document.getElementById('pageCategory').value = page.category;
            document.getElementById('pageContent').value = page.content;
            document.getElementById('pagePublished').checked = page.isPublished;
        }
    } else {
        document.getElementById('contentPageTitle').value = '';
        document.getElementById('pageSlug').value = '';
        document.getElementById('pageCategory').value = 'legal';
        document.getElementById('pageContent').value = '';
        document.getElementById('pagePublished').checked = true;
    }
    
    document.getElementById('pageEditorCard').scrollIntoView({ behavior: 'smooth' });
}

function cancelPageEditor() {
    editingPageId = null;
    document.getElementById('pageEditorCard').style.display = 'none';
}

async function savePage() {
    const title = document.getElementById('contentPageTitle').value.trim();
    const slug = document.getElementById('pageSlug').value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = document.getElementById('pageCategory').value;
    const content = document.getElementById('pageContent').value;
    const isPublished = document.getElementById('pagePublished').checked;

    if (!title || !slug || !content) {
        showToast('Please fill in all required fields');
        return;
    }

    const pageData = {
        title,
        slug,
        category,
        content,
        isPublished
    };

    try {
        if (editingPageId) {
            // Update existing page
            await fetch(`${API_URL}/pages/${editingPageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pageData, id: editingPageId })
            });
            showToast('Page updated successfully!');
        } else {
            // Create new page
            const response = await fetch(`${API_URL}/pages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pageData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                showToast(error.detail || 'Error creating page');
                return;
            }
            showToast('Page created successfully!');
        }
        
        cancelPageEditor();
        await loadContentPages();
    } catch (error) {
        console.error('Error saving page:', error);
        showToast('Error saving page');
    }
}

function editPage(pageId) {
    openPageEditor(pageId);
}

async function deletePage(pageId) {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    
    try {
        await fetch(`${API_URL}/pages/${pageId}`, { method: 'DELETE' });
        showToast('Page deleted!');
        await loadContentPages();
    } catch (error) {
        console.error('Error deleting page:', error);
        showToast('Error deleting page');
    }
}

function viewPageLive(slug) {
    window.open(`page.html?slug=${slug}`, '_blank');
}

function previewPage() {
    const content = document.getElementById('pageContent').value;
    const title = document.getElementById('contentPageTitle').value || 'Preview';
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - Preview</title>
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #2d1f3d; }
                h1, h2, h3 { font-family: 'Fredoka', sans-serif; color: #2d1f3d; }
                h1 { font-size: 36px; border-bottom: 3px solid #d35dab; padding-bottom: 16px; }
                h2 { font-size: 24px; margin-top: 32px; }
                a { color: #d35dab; }
                blockquote { border-left: 4px solid #d35dab; padding-left: 20px; margin: 20px 0; font-style: italic; color: #6b5a7d; }
                code { background: #f5f0fa; padding: 2px 8px; border-radius: 4px; }
                pre { background: #2d1f3d; color: #f5f0fa; padding: 20px; border-radius: 12px; overflow-x: auto; }
                ul, ol { padding-left: 24px; }
                li { margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            ${content}
        </body>
        </html>
    `);
    previewWindow.document.close();
}

function useTemplate(templateName) {
    const templates = {
        'code-of-conduct': {
            title: 'Code of Conduct',
            slug: 'code-of-conduct',
            category: 'community',
            content: `<h2>Our Pledge</h2>
<p>We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.</p>

<h2>Our Standards</h2>
<p>Examples of behavior that contributes to a positive environment for our community include:</p>
<ul>
    <li>Demonstrating empathy and kindness toward other people</li>
    <li>Being respectful of differing opinions, viewpoints, and experiences</li>
    <li>Giving and gracefully accepting constructive feedback</li>
    <li>Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience</li>
    <li>Focusing on what is best not just for us as individuals, but for the overall community</li>
</ul>

<h2>Enforcement</h2>
<p>Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.</p>

<h2>Reporting</h2>
<p>Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at <a href="mailto:conduct@ssoc.org">conduct@ssoc.org</a>. All complaints will be reviewed and investigated promptly and fairly.</p>`
        },
        'privacy-policy': {
            title: 'Privacy Policy',
            slug: 'privacy-policy',
            category: 'legal',
            content: `<h2>Introduction</h2>
<p>This Privacy Policy describes how Social Summer of Code ("we", "us", or "our") collects, uses, and shares information about you when you use our website and services.</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you:</p>
<ul>
    <li>Create an account or register for our program</li>
    <li>Fill out forms or participate in surveys</li>
    <li>Communicate with us via email or other channels</li>
    <li>Submit projects or contributions</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
    <li>Provide, maintain, and improve our services</li>
    <li>Process registrations and manage your participation</li>
    <li>Send you technical notices and support messages</li>
    <li>Respond to your comments and questions</li>
    <li>Send promotional communications (with your consent)</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell your personal information. We may share your information with:</p>
<ul>
    <li>Mentors and project administrators (as needed for program participation)</li>
    <li>Service providers who assist in our operations</li>
    <li>Legal authorities when required by law</li>
</ul>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@ssoc.org">privacy@ssoc.org</a>.</p>`
        },
        'terms-of-service': {
            title: 'Terms of Service',
            slug: 'terms-of-service',
            category: 'legal',
            content: `<h2>Acceptance of Terms</h2>
<p>By accessing or using the Social Summer of Code website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>Eligibility</h2>
<p>To participate in Social Summer of Code, you must:</p>
<ul>
    <li>Be at least 18 years old (or have parental consent if younger)</li>
    <li>Have a valid email address</li>
    <li>Agree to abide by our Code of Conduct</li>
</ul>

<h2>Program Participation</h2>
<p>As a participant, you agree to:</p>
<ul>
    <li>Submit original work that does not infringe on others' intellectual property</li>
    <li>Communicate respectfully with mentors and other participants</li>
    <li>Complete assigned tasks within specified timelines</li>
    <li>Follow the guidelines set by your project maintainers</li>
</ul>

<h2>Intellectual Property</h2>
<p>All contributions made during the program shall be licensed under the respective project's open-source license. You retain ownership of your original contributions while granting necessary rights for the open-source project.</p>

<h2>Limitation of Liability</h2>
<p>Social Summer of Code is provided "as is" without warranties of any kind. We are not liable for any damages arising from your participation in the program.</p>

<h2>Contact</h2>
<p>For questions about these terms, contact us at <a href="mailto:legal@ssoc.org">legal@ssoc.org</a>.</p>`
        },
        'documentation': {
            title: 'Documentation',
            slug: 'documentation',
            category: 'resource',
            content: `<h2>Getting Started</h2>
<p>Welcome to Social Summer of Code! This guide will help you get started with the program.</p>

<h2>For Contributors</h2>
<h3>1. Registration</h3>
<p>Register on our website by filling out the contributor registration form. You'll need to provide:</p>
<ul>
    <li>Your basic information (name, email, etc.)</li>
    <li>Your GitHub profile</li>
    <li>Your areas of interest</li>
</ul>

<h3>2. Finding a Project</h3>
<p>Browse our projects page to find projects that match your interests and skills. Each project lists:</p>
<ul>
    <li>Project description and goals</li>
    <li>Required technologies</li>
    <li>Difficulty level</li>
    <li>Available issues</li>
</ul>

<h3>3. Making Contributions</h3>
<p>Once you've selected a project:</p>
<ul>
    <li>Fork the repository</li>
    <li>Pick an issue to work on</li>
    <li>Submit a pull request</li>
    <li>Work with mentors on feedback</li>
</ul>

<h2>For Mentors</h2>
<p>Mentors guide contributors and review their work. Key responsibilities include:</p>
<ul>
    <li>Reviewing pull requests</li>
    <li>Providing constructive feedback</li>
    <li>Answering questions</li>
    <li>Helping contributors grow</li>
</ul>

<h2>Resources</h2>
<ul>
    <li><a href="#">Git & GitHub Guide</a></li>
    <li><a href="#">Open Source Best Practices</a></li>
    <li><a href="#">Communication Guidelines</a></li>
</ul>`
        },
        'faq-page': {
            title: 'Frequently Asked Questions',
            slug: 'faq',
            category: 'resource',
            content: `<h2>General Questions</h2>

<h3>What is Social Summer of Code?</h3>
<p>Social Summer of Code (SSoC) is India's largest open-source program that connects students, mentors, and organizations to collaborate on meaningful open-source projects.</p>

<h3>When does the program run?</h3>
<p>SSoC typically runs for 3 months during the summer. Check our homepage for the exact dates of the current season.</p>

<h3>Is there any fee to participate?</h3>
<p>No, Social Summer of Code is completely free for all participants.</p>

<h2>For Contributors</h2>

<h3>Who can apply as a contributor?</h3>
<p>Anyone with basic programming knowledge can apply! We welcome students, professionals, and enthusiasts from all backgrounds.</p>

<h3>Do I need prior open-source experience?</h3>
<p>No prior experience is required. SSoC is designed to help beginners get started with open-source contributions.</p>

<h3>How are contributions evaluated?</h3>
<p>Contributions are evaluated based on code quality, documentation, consistency, and collaboration with mentors.</p>

<h2>For Mentors</h2>

<h3>What are the requirements to become a mentor?</h3>
<p>Mentors should have experience in open-source development and be willing to dedicate time to guide contributors.</p>

<h3>How much time commitment is expected?</h3>
<p>Mentors typically spend 5-10 hours per week reviewing contributions and providing guidance.</p>

<h2>Contact</h2>
<p>Still have questions? Reach out to us at <a href="mailto:support@ssoc.org">support@ssoc.org</a>.</p>`
        }
    };

    const template = templates[templateName];
    if (template) {
        document.getElementById('contentPageTitle').value = template.title;
        document.getElementById('pageSlug').value = template.slug;
        document.getElementById('pageCategory').value = template.category;
        document.getElementById('pageContent').value = template.content;
        document.getElementById('pagePublished').checked = true;
        editingPageId = null;
        document.getElementById('pageEditorCard').style.display = 'block';
        document.getElementById('pageEditorTitle').textContent = 'Create New Page';
        document.getElementById('pageEditorCard').scrollIntoView({ behavior: 'smooth' });
        showToast(`Template "${template.title}" loaded! Customize and save.`);
    }
}

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// Close sidebar when clicking a nav link (mobile)
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    });
});


// ===== LEADERBOARD / TASK MANAGEMENT =====
let allTasks = [];
let allCompletions = [];
let allAdvocatesForLB = [];
let editingTaskId = null;

async function loadLeaderboardData() {
    try {
        // Load each independently so one failure doesn't break all
        let tasksRes, completionsRes, advocatesRes;
        try {
            tasksRes = await fetch(`${API_URL}/advocate-tasks`);
            allTasks = tasksRes.ok ? await tasksRes.json() : [];
        } catch (e) {
            console.error('Error loading tasks:', e);
            allTasks = [];
        }
        
        try {
            completionsRes = await fetch(`${API_URL}/task-completions`);
            allCompletions = completionsRes.ok ? await completionsRes.json() : [];
        } catch (e) {
            console.error('Error loading completions:', e);
            allCompletions = [];
        }
        
        try {
            advocatesRes = await fetch(`${API_URL}/campus-advocates`);
            allAdvocatesForLB = (advocatesRes.ok ? await advocatesRes.json() : []).filter(a => a.isActive);
        } catch (e) {
            console.error('Error loading advocates for LB:', e);
            allAdvocatesForLB = [];
        }
        
        renderTasks();
        renderScoringGrid();
    } catch (err) {
        console.error('Error loading leaderboard data:', err);
        allTasks = [];
        allCompletions = [];
        allAdvocatesForLB = [];
        renderTasks();
        renderScoringGrid();
    }
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    if (!allTasks.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px;">No tasks created yet. Click "Add Task" to get started.</p>';
        return;
    }
    container.innerHTML = allTasks.map(t => {
        const completionCount = allCompletions.filter(c => c.task_id === t.id).length;
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;background:var(--bg-secondary);" data-testid="task-item-${t.id}">
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <span style="font-weight:600;font-size:15px;color:var(--text-primary);">${t.name}</span>
                    <span style="background:linear-gradient(135deg,#d35dab,#8b5cf6);color:#fff;font-size:11px;font-weight:600;padding:2px 10px;border-radius:99px;">${t.points} pts</span>
                </div>
                ${t.description ? `<div style="font-size:13px;color:var(--text-muted);margin-bottom:2px;">${t.description}</div>` : ''}
                <div style="font-size:12px;color:var(--text-muted);">${completionCount} advocate${completionCount!==1?'s':''} completed</div>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;margin-left:12px;">
                <button onclick="editTask('${t.id}')" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:13px;color:var(--text-secondary);" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTask('${t.id}')" style="padding:6px 12px;border-radius:8px;border:1px solid #fecaca;background:#fff;cursor:pointer;font-size:13px;color:#ef4444;" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

function renderScoringGrid() {
    const head = document.getElementById('scoringGridHead');
    const body = document.getElementById('scoringGridBody');
    const info = document.getElementById('scoringInfo');

    if (!allTasks.length || !allAdvocatesForLB.length) {
        head.innerHTML = '';
        body.innerHTML = '<tr><td style="text-align:center;padding:32px;color:var(--text-muted);">Add tasks and advocates to start scoring.</td></tr>';
        info.textContent = '';
        return;
    }

    info.textContent = `${allAdvocatesForLB.length} advocates × ${allTasks.length} tasks`;

    // Build completion lookup: { "advId_taskId": true }
    const completionMap = {};
    allCompletions.forEach(c => {
        completionMap[`${c.advocate_id}_${c.task_id}`] = true;
    });

    // Header
    head.innerHTML = `<tr>
        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);font-size:13px;color:var(--text-secondary);min-width:180px;">Advocate</th>
        ${allTasks.map(t => `<th style="padding:10px 8px;text-align:center;border-bottom:2px solid var(--border);font-size:12px;color:var(--text-secondary);min-width:90px;max-width:120px;" title="${t.name} (${t.points} pts)">${t.name}<br><span style="font-size:11px;color:var(--text-muted);">${t.points}pts</span></th>`).join('')}
        <th style="padding:10px 12px;text-align:center;border-bottom:2px solid var(--border);font-size:13px;color:var(--primary);font-weight:700;">Total</th>
    </tr>`;

    // Rows
    // Compute scores per advocate first so we can sort
    const advScores = allAdvocatesForLB.map(adv => {
        let total = 0;
        allTasks.forEach(t => {
            if (completionMap[`${adv.id}_${t.id}`]) total += t.points;
        });
        return { adv, total };
    });
    advScores.sort((a, b) => b.total - a.total || a.adv.name.localeCompare(b.adv.name));

    body.innerHTML = advScores.map(({ adv, total }) => {
        const initials = adv.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
        return `<tr style="border-bottom:1px solid var(--border-light);">
            <td style="padding:10px 12px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#d35dab,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${initials}</div>
                    <div style="min-width:0;">
                        <div style="font-weight:600;font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${adv.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${adv.college || ''}</div>
                    </div>
                </div>
            </td>
            ${allTasks.map(t => {
                const checked = completionMap[`${adv.id}_${t.id}`] ? 'checked' : '';
                return `<td style="text-align:center;padding:8px;">
                    <input type="checkbox" ${checked} onchange="toggleCompletion('${t.id}','${adv.id}', this.checked)" 
                        style="width:18px;height:18px;cursor:pointer;accent-color:#d35dab;" 
                        data-testid="check-${adv.id}-${t.id}">
                </td>`;
            }).join('')}
            <td style="text-align:center;padding:10px 12px;">
                <span style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:16px;color:${total > 0 ? 'var(--primary)' : 'var(--text-muted)'};">${total}</span>
            </td>
        </tr>`;
    }).join('');
}

function openTaskModal(taskId) {
    editingTaskId = taskId || null;
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    if (taskId) {
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDesc').value = task.description || '';
            document.getElementById('taskPoints').value = task.points;
            title.textContent = 'Edit Task';
        }
    } else {
        document.getElementById('taskName').value = '';
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskPoints').value = '10';
        title.textContent = 'Add Task';
    }
    modal.style.display = 'flex';
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    editingTaskId = null;
}

function editTask(taskId) { openTaskModal(taskId); }

async function saveTask() {
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const points = parseInt(document.getElementById('taskPoints').value) || 10;
    if (!name) { alert('Task name is required'); return; }

    try {
        let response;
        if (editingTaskId) {
            response = await fetch(`${API_URL}/advocate-tasks/${editingTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, points })
            });
        } else {
            response = await fetch(`${API_URL}/advocate-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, points })
            });
        }
        
        if (!response.ok) {
            const errText = await response.text();
            console.error('Task save error:', response.status, errText);
            alert(`Failed to save task (${response.status}). Check console for details.`);
            return;
        }
        
        const result = await response.json();
        console.log('Task saved:', result);
        closeTaskModal();
        showToast('Task saved successfully!');
        await loadLeaderboardData();
    } catch (err) {
        console.error('Error saving task:', err);
        alert('Failed to save task: ' + err.message);
    }
}

async function deleteTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!confirm(`Delete task "${task?.name}"? This will also remove all completions for this task.`)) return;
    try {
        await fetch(`${API_URL}/advocate-tasks/${taskId}`, { method: 'DELETE' });
        await loadLeaderboardData();
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

async function toggleCompletion(taskId, advocateId, isChecked) {
    try {
        if (isChecked) {
            await fetch(`${API_URL}/task-completions/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, advocate_id: advocateId })
            });
        } else {
            await fetch(`${API_URL}/task-completions/unassign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, advocate_id: advocateId })
            });
        }
        // Refresh completions to update totals
        const completionsRes = await fetch(`${API_URL}/task-completions`);
        allCompletions = await completionsRes.json();
        renderScoringGrid();
    } catch (err) {
        console.error('Error toggling completion:', err);
    }
}


// ===== CONTRIBUTOR ONBOARDING =====
let onboardingData = [];

async function loadOnboardingSubmissions() {
    try {
        const res = await fetch(`${API_URL}/onboarding/list`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        onboardingData = await res.json();
        renderOnboardingSubmissions();
    } catch (err) {
        console.error('Error loading onboarding submissions:', err);
    }
}

function _obEscape(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _obYesNo(v) {
    return v
        ? '<span style="color:#16a34a; font-weight:700;"><i class="fas fa-check-circle"></i> Yes</span>'
        : '<span style="color:#94a3b8;"><i class="fas fa-times-circle"></i> No</span>';
}

function _obFormatDate(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleString();
    } catch { return iso; }
}

function renderOnboardingSubmissions() {
    const body = document.getElementById('onboardingBody');
    const countEl = document.getElementById('onboardingCount');
    if (!body) return;

    countEl.textContent = onboardingData.length
        ? `${onboardingData.length} submission${onboardingData.length === 1 ? '' : 's'}`
        : '';

    if (!onboardingData.length) {
        body.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color: var(--text-muted);">
            No onboarding submissions yet. Share the
            <a href="/onboarding.html" target="_blank" style="color: var(--primary); font-weight:600;">private onboarding link</a>
            with your contributors.
        </td></tr>`;
        return;
    }

    body.innerHTML = onboardingData.map(s => `
        <tr data-testid="onboarding-row" style="border-bottom: 1px solid var(--bg-secondary);">
            <td style="padding: 12px 10px; white-space: nowrap; font-size: 13px; color: var(--text-secondary);">${_obFormatDate(s.submittedAt)}</td>
            <td style="padding: 12px 10px; font-weight: 600;">${_obEscape(s.name)}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${_obEscape(s.email)}</td>
            <td style="padding: 12px 10px; white-space: nowrap; font-family: monospace; font-size: 13px;">${_obEscape(s.countryCode || '')} ${_obEscape(s.phone || '')}</td>
            <td style="padding: 12px 10px; text-align: center;">${_obYesNo(s.badgeGenerated)}</td>
            <td style="padding: 12px 10px; text-align: center;">${_obYesNo(s.productHuntDone)}</td>
            <td style="padding: 12px 10px; text-align: center;">${_obYesNo(s.discordJoined)}</td>
            <td style="padding: 12px 10px; max-width: 220px; color: var(--text-secondary); font-size: 13px;">${_obEscape((s.notes || '').slice(0, 120))}${(s.notes || '').length > 120 ? '…' : ''}</td>
            <td style="padding: 12px 10px;">
                <button class="delete-btn" onclick="deleteOnboardingSubmission('${_obEscape(s.id)}')" data-testid="delete-onboarding-${_obEscape(s.id)}" title="Delete submission">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteOnboardingSubmission(id) {
    if (!confirm('Delete this onboarding submission? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_URL}/onboarding/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await loadOnboardingSubmissions();
        showToast('Submission deleted');
    } catch (err) {
        console.error('Delete onboarding failed:', err);
        showToast('Could not delete submission');
    }
}

function downloadOnboardingCSV() {
    if (!onboardingData.length) {
        showToast('No submissions to download yet.');
        return;
    }
    const headers = ['Submitted At', 'Name', 'Email', 'Country Code', 'Phone', 'Badge Generated', 'Product Hunt Done', 'Discord Joined', 'Notes'];
    const escape = (v) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = onboardingData.map(s => [
        s.submittedAt || '',
        s.name || '',
        s.email || '',
        s.countryCode || '',
        s.phone || '',
        s.badgeGenerated ? 'Yes' : 'No',
        s.productHuntDone ? 'Yes' : 'No',
        s.discordJoined ? 'Yes' : 'No',
        s.notes || ''
    ].map(escape).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssoc_raid_completions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${raidCompletionsData.length} completion${raidCompletionsData.length === 1 ? '' : 's'}`);
}

// ===== RAIDS / TASKS =====
let raidsData = [];
let raidCompletionsData = [];

async function loadRaidsAdmin() {
    try {
        const [rRes, cRes] = await Promise.all([
            fetch(`${API_URL}/raids`).then(r => r.json()),
            fetch(`${API_URL}/raids/completions`).then(r => r.json())
        ]);
        raidsData = Array.isArray(rRes) ? rRes : [];
        raidCompletionsData = Array.isArray(cRes) ? cRes : [];
        renderRaidsAdmin();
        renderRaidCompletions();
    } catch (err) {
        console.error('Error loading raids:', err);
    }
}

function _raidEscape(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _raidCountFor(raidId) {
    return raidCompletionsData.filter(c => c.raidId === raidId).length;
}

function renderRaidsAdmin() {
    const list = document.getElementById('raidsList');
    const count = document.getElementById('raidsCount');
    if (!list) return;
    const active = raidsData.filter(r => r.isActive).length;
    count.textContent = raidsData.length
        ? `${raidsData.length} total · ${active} active · ${raidCompletionsData.length} completions`
        : '';
    if (!raidsData.length) {
        list.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 24px;">
            No raids yet. Click <strong>Add Raid</strong> to create the first community task.</p>`;
        return;
    }
    list.innerHTML = raidsData.map((r, i) => {
        const completions = _raidCountFor(r.id);
        const deadline = r.deadline ? new Date(r.deadline) : null;
        const expired = deadline && deadline < new Date();
        return `<div class="testimonial-item" data-testid="raid-admin-row" style="align-items: flex-start;">
            <div style="flex-shrink:0; width: 44px; height: 44px; border-radius: 12px;
                background: ${r.isActive ? 'linear-gradient(135deg, #E86FBB, #D946A0)' : '#cbd5e1'};
                color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                <i class="fas fa-bolt"></i>
            </div>
            <div class="testimonial-item-content" style="flex: 1;">
                <h4 style="margin: 0 0 4px;">${_raidEscape(r.title)}
                    ${r.isDaily ? '<span style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:white;font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;margin-left:6px;letter-spacing:0.05em;">DAILY</span>' : ''}
                    ${!r.isActive ? '<span style="background:#e2e8f0;color:#64748b;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;margin-left:6px;letter-spacing:0.05em;">INACTIVE</span>' : ''}
                </h4>
                <p style="margin: 0 0 6px; font-size: 13px; color: var(--text-secondary);">${_raidEscape((r.description || '').slice(0, 140))}${(r.description || '').length > 140 ? '…' : ''}</p>
                <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:12px; color:var(--text-muted);">
                    <span><i class="fas fa-star" style="color:#D946A0;"></i> ${r.points || 0} pts</span>
                    <span><i class="fas fa-check-circle" style="color:#16a34a;"></i> ${completions} completion${completions === 1 ? '' : 's'}</span>
                    ${r.link ? `<a href="${_raidEscape(r.link)}" target="_blank" style="color:var(--primary); text-decoration:none;"><i class="fas fa-external-link-alt"></i> Task link</a>` : ''}
                    ${r.deadline ? `<span style="${expired ? 'color:#b45309;' : ''}"><i class="fas fa-clock"></i> ${_raidEscape(r.deadline)}${expired ? ' (expired)' : ''}</span>` : ''}
                </div>
            </div>
            <div class="testimonial-item-actions">
                <button class="edit-btn" onclick="filterCompletionsByRaid('${_raidEscape(r.id)}')" data-testid="filter-completions-${i}" title="View this raid's submissions">
                    <i class="fas fa-filter"></i>
                </button>
                <button class="edit-btn" onclick="openRaidModal(${i})" data-testid="edit-raid-${i}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteRaid('${_raidEscape(r.id)}')" data-testid="delete-raid-${i}" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

function filterCompletionsByRaid(raidId) {
    const sel = document.getElementById('completionRaidFilter');
    if (!sel) return;
    sel.value = raidId;
    renderRaidCompletions();
    // Scroll the completions table into view
    const heading = document.querySelector('#raidsPanel .table-container');
    if (heading) heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function _populateCompletionRaidFilter() {
    const sel = document.getElementById('completionRaidFilter');
    if (!sel) return;
    const currentValue = sel.value;
    // Build options: All + each raid (with counts)
    const countsByRaid = {};
    raidCompletionsData.forEach(c => {
        countsByRaid[c.raidId] = (countsByRaid[c.raidId] || 0) + 1;
    });
    const opts = ['<option value="">All raids</option>'];
    raidsData.forEach(r => {
        const n = countsByRaid[r.id] || 0;
        const label = `${r.title}${r.isDaily ? ' [DAILY]' : ''} — ${n}`;
        opts.push(`<option value="${_raidEscape(r.id)}">${_raidEscape(label)}</option>`);
    });
    sel.innerHTML = opts.join('');
    // Restore selection if it still exists
    if (currentValue && raidsData.some(r => r.id === currentValue)) {
        sel.value = currentValue;
    }
}

function _getFilteredCompletions() {
    const raidFilter = (document.getElementById('completionRaidFilter') || {}).value || '';
    const statusFilter = (document.getElementById('completionStatusFilter') || {}).value || 'all';
    const search = ((document.getElementById('completionSearch') || {}).value || '').trim().toLowerCase();

    return raidCompletionsData.filter(c => {
        if (raidFilter && c.raidId !== raidFilter) return false;
        if (statusFilter === 'valid' && c.disqualified) return false;
        if (statusFilter === 'disqualified' && !c.disqualified) return false;
        if (search) {
            const hay = `${c.name || ''} ${c.email || ''} ${c.proofUrl || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });
}

function renderRaidCompletions() {
    const body = document.getElementById('raidCompletionsBody');
    const countEl = document.getElementById('completionResultCount');
    if (!body) return;
    _populateCompletionRaidFilter();

    const filtered = _getFilteredCompletions();
    const total = raidCompletionsData.length;
    if (countEl) {
        countEl.textContent = filtered.length === total
            ? `${total} submission${total === 1 ? '' : 's'}`
            : `${filtered.length} of ${total}`;
    }

    if (!filtered.length) {
        const msg = total === 0
            ? 'No completion submissions yet.'
            : 'No submissions match the current filters.';
        body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">${msg}</td></tr>`;
        return;
    }
    const titleById = Object.fromEntries(raidsData.map(r => [r.id, r.title]));
    body.innerHTML = filtered.map(c => {
        const when = c.completedAt ? new Date(c.completedAt).toLocaleString() : '—';
        const dq = !!c.disqualified;
        const rowStyle = dq ? 'background:#fef2f2;opacity:0.85;' : '';
        return `<tr data-testid="raid-completion-row" data-completion-id="${_raidEscape(c.id)}" style="border-bottom: 1px solid var(--bg-secondary); ${rowStyle}">
            <td style="padding:10px; font-size:12.5px; color:var(--text-secondary); white-space:nowrap;">${_raidEscape(when)}</td>
            <td style="padding:10px; font-weight:600; ${dq ? 'text-decoration: line-through; color:#94a3b8;' : ''}">${_raidEscape(titleById[c.raidId] || '(deleted raid)')}</td>
            <td style="padding:10px; ${dq ? 'color:#94a3b8;' : ''}">${_raidEscape(c.name)}
                ${dq ? '<span style="background:#dc2626;color:white;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;margin-left:6px;letter-spacing:0.05em;">FAKE</span>' : ''}
            </td>
            <td style="padding:10px; color:var(--text-secondary);">${_raidEscape(c.email)}</td>
            <td style="padding:10px;"><a href="${_raidEscape(c.proofUrl)}" target="_blank" rel="noopener" style="color:var(--primary); text-decoration:none;"><i class="fas fa-external-link-alt"></i> View proof</a></td>
            <td style="padding:10px; text-align:right; white-space:nowrap;">
                ${dq
                    ? `<button class="edit-btn" onclick="toggleDisqualify('${_raidEscape(c.id)}', false)" data-testid="restore-completion-${_raidEscape(c.id)}" title="Restore points" style="background:#16a34a;color:white;">
                          <i class="fas fa-undo"></i> Restore
                       </button>`
                    : `<button class="delete-btn" onclick="toggleDisqualify('${_raidEscape(c.id)}', true)" data-testid="disqualify-completion-${_raidEscape(c.id)}" title="Mark as fake & revoke points">
                          <i class="fas fa-ban"></i> Mark fake
                       </button>`
                }
            </td>
        </tr>`;
    }).join('');
}

async function toggleDisqualify(completionId, disqualified) {
    let reason = '';
    if (disqualified) {
        reason = prompt('Reason for marking this as fake / disqualifying? (optional, kept for audit)') || '';
        if (!confirm('Disqualify this completion and revoke its points from the leaderboard?')) return;
    }
    try {
        const res = await fetch(`${API_URL}/raids/completions/${encodeURIComponent(completionId)}/disqualify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disqualified, reason })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await loadRaidsAdmin();
        showToast(disqualified ? 'Marked as fake — points revoked' : 'Restored — points credited');
    } catch (e) {
        console.error('Disqualify toggle failed:', e);
        showToast('Could not update: ' + (e.message || 'unknown error'));
    }
}

// --- Modal open/close + save ---
function openRaidModal(index) {
    const modal = document.getElementById('raidModal');
    // Move modal to <body> (out of <main>) to avoid stacking-context capture
    if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    const title = document.getElementById('raidModalTitle');
    document.getElementById('rf_error').classList.remove('show');
    if (typeof index === 'number') {
        const r = raidsData[index] || {};
        title.textContent = 'Edit Raid';
        document.getElementById('rf_id').value = r.id || '';
        document.getElementById('rf_title').value = r.title || '';
        document.getElementById('rf_description').value = r.description || '';
        document.getElementById('rf_link').value = r.link || '';
        document.getElementById('rf_deadline').value = r.deadline || '';
        document.getElementById('rf_points').value = r.points || 10;
        document.getElementById('rf_active').checked = r.isActive !== false;
        document.getElementById('rf_daily').checked = !!r.isDaily;
    } else {
        title.textContent = 'Add New Raid';
        document.getElementById('raidForm').reset();
        document.getElementById('rf_id').value = '';
        document.getElementById('rf_points').value = 10;
        document.getElementById('rf_active').checked = true;
        document.getElementById('rf_daily').checked = false;
    }
    modal.classList.add('active');
    setTimeout(() => document.getElementById('rf_title').focus(), 80);
}

function closeRaidModal() {
    document.getElementById('raidModal').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const m = document.getElementById('raidModal');
        if (m && m.classList.contains('active')) closeRaidModal();
    }
});

async function saveRaidFromModal() {
    const err = document.getElementById('rf_error');
    const submit = document.getElementById('rf_submit');
    err.classList.remove('show'); err.textContent = '';

    const existingId = document.getElementById('rf_id').value.trim();
    const title = document.getElementById('rf_title').value.trim();
    if (!title) { err.textContent = 'Title is required.'; err.classList.add('show'); return; }

    const payload = {
        id: existingId || ('raid_' + Date.now()),
        title,
        description: document.getElementById('rf_description').value.trim(),
        link: document.getElementById('rf_link').value.trim(),
        deadline: document.getElementById('rf_deadline').value || '',
        points: parseInt(document.getElementById('rf_points').value, 10) || 0,
        isActive: document.getElementById('rf_active').checked,
        isDaily: document.getElementById('rf_daily').checked
    };

    submit.disabled = true;
    const originalHTML = submit.innerHTML;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const url = existingId
            ? `${API_URL}/raids/${encodeURIComponent(existingId)}`
            : `${API_URL}/raids`;
        const method = existingId ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.detail || data.message || ('HTTP ' + res.status));
        closeRaidModal();
        await loadRaidsAdmin();
        showToast(existingId ? 'Raid updated!' : 'Raid created!');
    } catch (e) {
        err.textContent = 'Could not save: ' + (e.message || 'unknown error');
        err.classList.add('show');
    } finally {
        submit.disabled = false;
        submit.innerHTML = originalHTML;
    }
}

async function deleteRaid(raidId) {
    if (!confirm('Delete this raid and all its completion submissions? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_URL}/raids/${encodeURIComponent(raidId)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await loadRaidsAdmin();
        showToast('Raid deleted');
    } catch (e) {
        console.error('Delete raid failed:', e);
        showToast('Could not delete raid');
    }
}

function downloadRaidCompletionsCSV() {
    const filtered = _getFilteredCompletions();
    if (!filtered.length) {
        showToast('No submissions match the current filter.');
        return;
    }
    const titleById = Object.fromEntries(raidsData.map(r => [r.id, r.title]));
    const pointsById = Object.fromEntries(raidsData.map(r => [r.id, r.points || 0]));
    const isDailyById = Object.fromEntries(raidsData.map(r => [r.id, !!r.isDaily]));

    // Aggregate points per (email) so we can also emit a per-user total
    const totalsByEmail = {};
    filtered.forEach(c => {
        const em = (c.email || '').toLowerCase();
        if (!em) return;
        const pts = c.disqualified ? 0 : (pointsById[c.raidId] || 0);
        if (!totalsByEmail[em]) totalsByEmail[em] = { name: c.name || '', total: 0, count: 0 };
        totalsByEmail[em].total += pts;
        totalsByEmail[em].count += 1;
        if (c.name) totalsByEmail[em].name = c.name;
    });

    const headers = [
        'Submitted At', 'Raid Title', 'Raid Type', 'Raid ID',
        'Points (this raid)', 'Points Awarded', 'User Total Points',
        'Name', 'Email', 'Proof URL', 'Disqualified', 'Disqualified Reason'
    ];
    const escape = (v) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map(c => {
        const em = (c.email || '').toLowerCase();
        const raidPts = pointsById[c.raidId] || 0;
        const awarded = c.disqualified ? 0 : raidPts;
        const userTotal = totalsByEmail[em] ? totalsByEmail[em].total : 0;
        return [
            c.completedAt || '',
            titleById[c.raidId] || '(deleted)',
            isDailyById[c.raidId] ? 'Daily' : 'One-time',
            c.raidId || '',
            raidPts,
            awarded,
            userTotal,
            c.name || '',
            c.email || '',
            c.proofUrl || '',
            c.disqualified ? 'Yes' : 'No',
            c.disqualifiedReason || ''
        ].map(escape).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const raidFilter = (document.getElementById('completionRaidFilter') || {}).value || '';
    const suffix = raidFilter ? `_${(titleById[raidFilter] || raidFilter).replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}` : '_all';
    a.download = `ssoc_raid_completions${suffix}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filtered.length} submission${filtered.length === 1 ? '' : 's'}`);
}

// ===== INIT =====
checkAuth();
