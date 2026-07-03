// ===== REGISTRATION & FORMS =====
// Registration Modal, Custom Fields, Advocate Application, Form Submissions

// ===== REGISTRATION MODAL =====
function initModalEvents() {
    if (!modal) return;
    
    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

async function openModal(role) {
    // Check form status first
    const formStatus = window.ssocFormStatus || { contributor: true, mentor: true, projectAdmin: true };
    const statusMap = {
        'contributor': formStatus.contributor,
        'mentor': formStatus.mentor,
        'project-admin': formStatus.projectAdmin
    };
    
    // If form is closed, show message and return
    if (statusMap[role] === false) {
        const roleNames = {
            'contributor': 'Contributor',
            'mentor': 'Mentor',
            'project-admin': 'Project Admin'
        };
        alert(`${roleNames[role]} registration is currently closed. Please check back later!`);
        return;
    }
    
    // Get apply links (only from API, no stale localStorage fallback)
    const links = window.ssocApplyLinks || {};
    
    // Check if external link exists for this role
    const linkMap = {
        'contributor': links.contributorLink,
        'mentor': links.mentorLink,
        'project-admin': links.projectAdminLink
    };
    
    const externalLink = linkMap[role];
    
    // If external link exists, redirect to it
    if (externalLink && externalLink.trim() !== '') {
        window.open(externalLink, '_blank');
        return;
    }
    
    // Otherwise show built-in modal
    currentRole = role;
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load and render custom fields (await the async function)
    await loadCustomFieldsInForm();
    
    const roleConfig = {
        'contributor': {
            icon: '<i class="fas fa-code"></i>',
            iconClass: 'pink',
            title: 'Apply as Contributor',
            showExperience: false
        },
        'mentor': {
            icon: '<i class="fas fa-users"></i>',
            iconClass: 'orange',
            title: 'Apply as Mentor',
            showExperience: true,
            experiencePlaceholder: 'Years of experience'
        },
        'project-admin': {
            icon: '<i class="fas fa-briefcase"></i>',
            iconClass: 'green',
            title: 'Apply as Project Admin',
            showExperience: true,
            experiencePlaceholder: 'Project name & description'
        }
    };
    
    const config = roleConfig[role];
    if (!config) return;
    
    if (modalIcon) {
        modalIcon.innerHTML = config.icon;
        modalIcon.className = 'modal-icon';
        modalIcon.style.background = config.iconClass === 'pink' ? 'rgba(211, 93, 171, 0.1)' : config.iconClass === 'orange' ? 'rgba(240, 126, 79, 0.1)' : 'rgba(34, 197, 94, 0.1)';
        modalIcon.style.color = config.iconClass === 'pink' ? '#d35dab' : config.iconClass === 'orange' ? '#f07e4f' : '#22c55e';
    }
    
    if (modalTitle) modalTitle.textContent = config.title;
    
    if (experienceGroup) {
        const expInput = document.getElementById('experience');
        if (config.showExperience) {
            experienceGroup.style.display = 'block';
            if (expInput) {
                expInput.placeholder = config.experiencePlaceholder;
                expInput.required = true;
            }
        } else {
            experienceGroup.style.display = 'none';
            if (expInput) expInput.required = false;
        }
    }
}

function closeModal() {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    if (registrationForm) registrationForm.reset();
}

// ===== CUSTOM FORM FIELDS =====
async function loadCustomFieldsInForm() {
    const container = document.getElementById('customFieldsContainer');
    if (!container) return;
    
    // Map role names to API role keys
    const roleMap = {
        'contributor': 'contributor',
        'mentor': 'mentor',
        'project-admin': 'projectadmin'
    };
    const apiRole = roleMap[currentRole] || 'contributor';
    
    // Show loading state
    container.innerHTML = '<div class="form-group" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="color: #d35dab;"></i> Loading form fields...</div>';
    
    try {
        // Fetch role-specific custom fields from API
        const response = await fetch(`${API_URL}/custom-fields/${apiRole}`);
        const customFields = await response.json();
        console.log(`Custom fields for ${apiRole}:`, customFields);
        
        if (!customFields || customFields.length === 0) {
            // Default fields if no custom fields are set for this role
            container.innerHTML = `
                <div class="form-group">
                    <label for="cf_github">GitHub Profile <span class="required">*</span></label>
                    <input type="url" id="cf_github" placeholder="https://github.com/username" required>
                </div>
                <div class="form-group">
                    <label for="cf_linkedin">LinkedIn Profile</label>
                    <input type="url" id="cf_linkedin" placeholder="https://linkedin.com/in/username">
                </div>
            `;
            // Store default field info for submission
            window.currentRoleFields = [
                { id: 'github', label: 'GitHub Profile', domId: 'cf_github' },
                { id: 'linkedin', label: 'LinkedIn Profile', domId: 'cf_linkedin' }
            ];
            return;
        }
        
        // Render custom fields with cf_ prefix to avoid ID collisions
        container.innerHTML = customFields.map(field => {
            const domId = `cf_${field.id}`;
            const requiredMark = field.required ? '<span class="required">*</span>' : '';
            const requiredAttr = field.required ? 'required' : '';
            
            if (field.type === 'textarea') {
                return `
                    <div class="form-group">
                        <label for="${domId}">${field.label} ${requiredMark}</label>
                        <textarea id="${domId}" placeholder="${field.placeholder || ''}" ${requiredAttr} rows="3"></textarea>
                    </div>
                `;
            } else if (field.type === 'select') {
                const options = (field.options || []).map(opt => 
                    `<option value="${opt}">${opt}</option>`
                ).join('');
                return `
                    <div class="form-group">
                        <label for="${domId}">${field.label} ${requiredMark}</label>
                        <select id="${domId}" ${requiredAttr}>
                            <option value="">Select an option</option>
                            ${options}
                        </select>
                    </div>
                `;
            } else {
                return `
                    <div class="form-group">
                        <label for="${domId}">${field.label} ${requiredMark}</label>
                        <input type="${field.type}" id="${domId}" placeholder="${field.placeholder || ''}" ${requiredAttr}>
                    </div>
                `;
            }
        }).join('');
        
        // Store fields with domId for form submission
        window.currentRoleFields = customFields.map(field => ({
            ...field,
            domId: `cf_${field.id}`
        }));
        
    } catch (error) {
        console.error('Error loading custom fields:', error);
        // Fallback to default fields
        container.innerHTML = `
            <div class="form-group">
                <label for="cf_github">GitHub Profile <span class="required">*</span></label>
                <input type="url" id="cf_github" placeholder="https://github.com/username" required>
            </div>
            <div class="form-group">
                <label for="cf_linkedin">LinkedIn Profile</label>
                <input type="url" id="cf_linkedin" placeholder="https://linkedin.com/in/username">
            </div>
        `;
        window.currentRoleFields = [
            { id: 'github', label: 'GitHub Profile', domId: 'cf_github' },
            { id: 'linkedin', label: 'LinkedIn Profile', domId: 'cf_linkedin' }
        ];
    }
}

// ===== ADVOCATE APPLICATION MODAL =====
const advocateModal = document.getElementById('advocateModal');

function openAdvocateModal() {
    if (advocateModal) {
        advocateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAdvocateModal() {
    if (advocateModal) {
        advocateModal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form
        const form = document.getElementById('advocateForm');
        if (form) form.reset();
    }
}

// Close modal on backdrop click
if (advocateModal) {
    advocateModal.addEventListener('click', (e) => {
        if (e.target === advocateModal) {
            closeAdvocateModal();
        }
    });
}

// Handle advocate form submission
const advocateForm = document.getElementById('advocateForm');
if (advocateForm) {
    advocateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('advName')?.value || '',
            email: document.getElementById('advEmail')?.value || '',
            phone: document.getElementById('advPhone')?.value || '',
            college: document.getElementById('advCollege')?.value || '',
            city: document.getElementById('advCity')?.value || '',
            year: document.getElementById('advYear')?.value || '',
            branch: document.getElementById('advBranch')?.value || '',
            linkedin: document.getElementById('advLinkedin')?.value || '',
            why_advocate: document.getElementById('advWhy')?.value || '',
            experience: document.getElementById('advExperience')?.value || '',
            ideas: document.getElementById('advIdeas')?.value || ''
        };
        
        try {
            const response = await fetch(`${API_URL}/advocate-applications/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeAdvocateModal();
                showToast('Application Submitted!', 'We\'ll review your application and get back to you soon.');
            } else {
                alert(`⚠️ ${result.message}`);
            }
        } catch (err) {
            console.error('Advocate application error:', err);
            alert('Failed to submit application. Please try again.');
        }
    });
}

// ===== FORM SUBMISSIONS =====
function initFormSubmissions() {
    // Add email validation on blur to check for existing registrations
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', async function() {
            const email = this.value.trim();
            if (!email || !email.includes('@')) return;
            
            try {
                const response = await fetch(`${API_URL}/registrations/check/${encodeURIComponent(email)}`);
                const result = await response.json();
                
                if (result.exists && result.roles.length > 0) {
                    const existingRoles = result.roles.map(r => r.replace('-', ' ')).join(', ');
                    
                    // Check for role conflicts
                    if (result.roles.includes(currentRole)) {
                        alert(`⚠️ You have already registered as ${currentRole.replace('-', ' ')} with this email.\n\nDuplicate registrations are not allowed.`);
                    } else if (result.roles.includes('contributor') && (currentRole === 'mentor' || currentRole === 'project-admin')) {
                        alert(`🚫 This email is registered as a Contributor.\n\nContributors cannot apply as Mentors or Project Admins. Please use a different email.`);
                    } else if (currentRole === 'contributor' && (result.roles.includes('mentor') || result.roles.includes('project-admin'))) {
                        alert(`🚫 This email is registered as ${existingRoles}.\n\nMentors and Project Admins cannot apply as Contributors. Please use a different email.`);
                    } else {
                        // Valid cross-registration (mentor <-> project-admin)
                        console.log(`Email already registered as: ${existingRoles}. Cross-registration allowed.`);
                    }
                }
            } catch (err) {
                console.error('Error checking registration:', err);
            }
        });
    }
    
    // Registration form
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect default fields
            const formData = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '',
                experience: document.getElementById('experience')?.value || '',
                role: currentRole,
                timestamp: new Date().toISOString()
            };
            
            // Collect custom fields from the current form (use domId to avoid ID collisions)
            const customFields = window.currentRoleFields || [];
            if (customFields.length === 0) {
                // Default fields with cf_ prefix
                formData.github = document.getElementById('cf_github')?.value || '';
                formData.linkedin = document.getElementById('cf_linkedin')?.value || '';
            } else {
                // Custom fields - use domId (cf_ prefixed) to get correct DOM elements
                customFields.forEach(field => {
                    const domId = field.domId || `cf_${field.id}`;
                    const el = document.getElementById(domId);
                    if (el) {
                        formData[field.label.toLowerCase().replace(/\s+/g, '_')] = el.value || '';
                    }
                });
            }
            
            // Send registration to API
            try {
                const response = await fetch(`${API_URL}/registrations/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errText = await response.text();
                    console.error('Registration API error:', response.status, errText);
                    showToast('Error', `Registration failed (${response.status}). Please try again.`);
                    return;
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Track registration if came from referral link
                    const refCode = sessionStorage.getItem('ssoc_ref');
                    if (refCode) {
                        fetch(`${API_URL}/referral-links/${refCode}/register`, {
                            method: 'POST'
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log('Referral registration tracked:', data);
                            // Clear the ref code after successful registration
                            sessionStorage.removeItem('ssoc_ref');
                        })
                        .catch(err => console.error('Error tracking referral registration:', err));
                    }
                    
                    closeModal();
                    showToast('Success!', `Successfully applied as ${currentRole.replace('-', ' ')}!`);
                } else {
                    // Show error alert based on error type
                    if (result.error_type === 'duplicate_role') {
                        alert(`⚠️ Duplicate Registration\n\n${result.message}`);
                    } else if (result.error_type === 'role_restriction') {
                        alert(`🚫 Role Restriction\n\n${result.message}`);
                    } else {
                        alert(`Registration Failed\n\n${result.message}`);
                    }
                }
            } catch (err) {
                console.error('Registration error:', err);
                showToast('Error', 'Registration failed. Please try again.');
            }
        });
    }
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            const email = emailInput?.value || '';
            
            // Store locally for now (no API endpoint for newsletter)
            const subscribers = JSON.parse(localStorage.getItem('ssoc_subscribers') || '[]');
            subscribers.push({ email, timestamp: new Date().toISOString() });
            localStorage.setItem('ssoc_subscribers', JSON.stringify(subscribers));
            
            newsletterForm.reset();
            showToast('Subscribed!', "You'll receive updates about SSoC Season 5.");
        });
    }
}

