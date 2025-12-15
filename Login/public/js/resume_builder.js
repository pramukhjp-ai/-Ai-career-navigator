/**
 * Resume Builder JavaScript
 * Handles dynamic form sections, validation, and live preview
 */

// ============================================
// GLOBAL VARIABLES
// ============================================

let experienceCount = 0;
let educationCount = 0;
let certificationCount = 0;
let projectCount = 0;
let languageCount = 0;
let skills = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addInitialExperienceForm();
    addInitialEducationForm();
    updatePreview();
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Form submission
    document.getElementById('resumeForm').addEventListener('submit', handleFormSubmit);

    // Professional Summary character count
    document.getElementById('professionalSummary').addEventListener('input', updateCharCount);

    // Job Description character count
    document.getElementById('jobDescription').addEventListener('input', updateJobDescCount);

    // Skills
    document.getElementById('addSkillBtn').addEventListener('click', addSkill);
    document.getElementById('skillInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    // Initialize skill autocomplete
    initializeSkillAutocomplete();

    // Add section buttons
    document.getElementById('addExperienceBtn').addEventListener('click', addExperienceForm);
    document.getElementById('addEducationBtn').addEventListener('click', addEducationForm);
    document.getElementById('addCertificationBtn').addEventListener('click', addCertificationForm);
    document.getElementById('addProjectBtn').addEventListener('click', addProjectForm);
    document.getElementById('addLanguageBtn').addEventListener('click', addLanguageForm);

    // Preview toggle
    document.getElementById('previewToggle').addEventListener('click', togglePreview);

    // Live preview on input
    document.getElementById('resumeForm').addEventListener('input', updatePreview);
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Saving...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = {
            resumeTitle: document.getElementById('resumeTitle').value,
            personalInfo: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                linkedIn: document.getElementById('linkedIn').value || null,
                portfolio: document.getElementById('portfolio').value || null
            },
            professionalSummary: document.getElementById('professionalSummary').value,
            experience: collectDynamicData('experience'),
            education: collectDynamicData('education'),
            skills: skills,
            certifications: collectDynamicData('certification'),
            projects: collectDynamicData('project'),
            languages: collectDynamicData('language'),
            jobDescription: document.getElementById('jobDescription').value || null
        };

        // Validate required fields
        if (!formData.resumeTitle.trim()) {
            showAlert('Please enter a resume title', 'error');
            return;
        }

        if (!formData.personalInfo.firstName.trim() || !formData.personalInfo.lastName.trim()) {
            showAlert('Please enter your first and last name', 'error');
            return;
        }

        // Send to server
        const response = await fetch('/resume/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Resume saved successfully!', 'success');
            setTimeout(() => {
                window.location.href = `/resume/${result.data.resumeId}`;
            }, 1500);
        } else {
            showAlert(result.message || 'Error saving resume', 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showAlert('Error saving resume: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// SKILLS MANAGEMENT
// ============================================

function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skillValue = skillInput.value.trim();

    if (!skillValue) {
        showAlert('Please enter a skill', 'error');
        return;
    }

    if (skills.length >= 50) {
        showAlert('Maximum 50 skills allowed', 'error');
        return;
    }

    if (skills.includes(skillValue)) {
        showAlert('This skill is already added', 'warning');
        return;
    }

    skills.push(skillValue);
    skillInput.value = '';
    renderSkills();
    updatePreview();
    skillInput.focus();
}

function removeSkill(index) {
    skills.splice(index, 1);
    renderSkills();
    updatePreview();
}

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';

    skills.forEach((skill, index) => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            ${skill}
            <button type="button" class="btn-remove" onclick="removeSkill(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(skillTag);
    });
}

// ============================================
// DYNAMIC SECTIONS - EXPERIENCE
// ============================================

function addInitialExperienceForm() {
    if (experienceCount === 0) {
        addExperienceForm();
    }
}

function addExperienceForm() {
    const container = document.getElementById('experienceContainer');
    const id = experienceCount++;

    const section = document.createElement('div');
    section.className = 'dynamic-section';
    section.id = `experience-${id}`;
    section.innerHTML = `
        <div class="dynamic-section-header">
            <h4>Experience #${id + 1}</h4>
            <button type="button" class="btn-remove-section" onclick="removeSection('experience', ${id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label>Company Name *</label>
            <input type="text" class="experience-company" placeholder="Tech Corporation" required />
        </div>

        <div class="form-group">
            <label>Job Title *</label>
            <input type="text" class="experience-title" placeholder="Senior Software Engineer" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Start Date *</label>
                <input type="date" class="experience-startDate" required />
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" class="experience-endDate" />
            </div>
        </div>

        <div class="form-group">
            <label>
                <input type="checkbox" class="experience-current" /> Currently Working Here
            </label>
        </div>

        <div class="form-group">
            <label>Description *</label>
            <textarea class="experience-description" placeholder="Describe your responsibilities and achievements..." rows="4" maxlength="1000" required></textarea>
            <div class="char-count">
                <span class="experience-count">0</span>/1000
            </div>
        </div>
    `;

    container.appendChild(section);

    // Add character count listener
    section.querySelector('.experience-description').addEventListener('input', function() {
        section.querySelector('.experience-count').textContent = this.value.length;
    });
}

// ============================================
// DYNAMIC SECTIONS - EDUCATION
// ============================================

function addInitialEducationForm() {
    if (educationCount === 0) {
        addEducationForm();
    }
}

function addEducationForm() {
    const container = document.getElementById('educationContainer');
    const id = educationCount++;

    const section = document.createElement('div');
    section.className = 'dynamic-section';
    section.id = `education-${id}`;
    section.innerHTML = `
        <div class="dynamic-section-header">
            <h4>Education #${id + 1}</h4>
            <button type="button" class="btn-remove-section" onclick="removeSection('education', ${id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label>School/University *</label>
            <input type="text" class="education-school" placeholder="State University" required />
        </div>

        <div class="form-group">
            <label>Degree *</label>
            <select class="education-degree" required>
                <option value="">Select Degree</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div class="form-group">
            <label>Field of Study *</label>
            <input type="text" class="education-field" placeholder="Computer Science" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Start Date *</label>
                <input type="date" class="education-startDate" required />
            </div>
            <div class="form-group">
                <label>End Date *</label>
                <input type="date" class="education-endDate" required />
            </div>
        </div>

        <div class="form-group">
            <label>GPA (Optional)</label>
            <input type="number" class="education-gpa" placeholder="3.8" min="0" max="4.0" step="0.1" />
        </div>

        <div class="form-group">
            <label>Activities/Societies</label>
            <input type="text" class="education-activities" placeholder="e.g., President of Tech Club, Debate Team Captain" maxlength="500" />
        </div>
    `;

    container.appendChild(section);
}

// ============================================
// DYNAMIC SECTIONS - CERTIFICATIONS
// ============================================

function addCertificationForm() {
    const container = document.getElementById('certificationsContainer');
    const id = certificationCount++;

    const section = document.createElement('div');
    section.className = 'dynamic-section';
    section.id = `certification-${id}`;
    section.innerHTML = `
        <div class="dynamic-section-header">
            <h4>Certification #${id + 1}</h4>
            <button type="button" class="btn-remove-section" onclick="removeSection('certification', ${id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label>Certification Name *</label>
            <input type="text" class="certification-name" placeholder="AWS Certified Solutions Architect" required />
        </div>

        <div class="form-group">
            <label>Issuing Organization *</label>
            <input type="text" class="certification-org" placeholder="Amazon Web Services" required />
        </div>

        <div class="form-group">
            <label>Issue Date *</label>
            <input type="date" class="certification-issueDate" required />
        </div>

        <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" class="certification-expiryDate" />
        </div>

        <div class="form-group">
            <label>Credential ID</label>
            <input type="text" class="certification-credId" placeholder="ABC123XYZ" />
        </div>

        <div class="form-group">
            <label>Credential URL</label>
            <input type="url" class="certification-credUrl" placeholder="https://..." />
        </div>
    `;

    container.appendChild(section);
}

// ============================================
// DYNAMIC SECTIONS - PROJECTS
// ============================================

function addProjectForm() {
    const container = document.getElementById('projectsContainer');
    const id = projectCount++;

    const section = document.createElement('div');
    section.className = 'dynamic-section';
    section.id = `project-${id}`;
    section.innerHTML = `
        <div class="dynamic-section-header">
            <h4>Project #${id + 1}</h4>
            <button type="button" class="btn-remove-section" onclick="removeSection('project', ${id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label>Project Name *</label>
            <input type="text" class="project-name" placeholder="E-Commerce Platform" required />
        </div>

        <div class="form-group">
            <label>Description *</label>
            <textarea class="project-description" placeholder="Describe the project..." rows="3" maxlength="1000" required></textarea>
            <div class="char-count">
                <span class="project-count">0</span>/1000
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Start Date *</label>
                <input type="date" class="project-startDate" required />
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" class="project-endDate" />
            </div>
        </div>

        <div class="form-group">
            <label>Technologies Used</label>
            <input type="text" class="project-tech" placeholder="React, Node.js, MongoDB, AWS" />
        </div>

        <div class="form-group">
            <label>Role</label>
            <input type="text" class="project-role" placeholder="Lead Developer" />
        </div>

        <div class="form-group">
            <label>Project URL</label>
            <input type="url" class="project-url" placeholder="https://..." />
        </div>
    `;

    container.appendChild(section);

    // Add character count listener
    section.querySelector('.project-description').addEventListener('input', function() {
        section.querySelector('.project-count').textContent = this.value.length;
    });
}

// ============================================
// DYNAMIC SECTIONS - LANGUAGES
// ============================================

function addLanguageForm() {
    const container = document.getElementById('languagesContainer');
    const id = languageCount++;

    const section = document.createElement('div');
    section.className = 'dynamic-section';
    section.id = `language-${id}`;
    section.innerHTML = `
        <div class="dynamic-section-header">
            <h4>Language #${id + 1}</h4>
            <button type="button" class="btn-remove-section" onclick="removeSection('language', ${id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label>Language *</label>
            <input type="text" class="language-name" placeholder="English, Spanish, Mandarin, etc." required />
        </div>

        <div class="form-group">
            <label>Proficiency *</label>
            <select class="language-proficiency" required>
                <option value="">Select Proficiency</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
            </select>
        </div>
    `;

    container.appendChild(section);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function removeSection(type, id) {
    const section = document.getElementById(`${type}-${id}`);
    if (section) {
        section.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            section.remove();
            updatePreview();
        }, 300);
    }
}

function collectDynamicData(type) {
    const containers = {
        'experience': '#experienceContainer',
        'education': '#educationContainer',
        'certification': '#certificationsContainer',
        'project': '#projectsContainer',
        'language': '#languagesContainer'
    };

    const container = document.querySelector(containers[type]);
    if (!container) return [];

    const sections = container.querySelectorAll('.dynamic-section');
    const data = [];

    sections.forEach(section => {
        let item = {};

        if (type === 'experience') {
            item = {
                companyName: section.querySelector('.experience-company').value,
                jobTitle: section.querySelector('.experience-title').value,
                startDate: section.querySelector('.experience-startDate').value,
                endDate: section.querySelector('.experience-endDate').value,
                currentlyWorking: section.querySelector('.experience-current').checked,
                description: section.querySelector('.experience-description').value,
                achievements: []
            };
        } else if (type === 'education') {
            item = {
                schoolName: section.querySelector('.education-school').value,
                degree: section.querySelector('.education-degree').value,
                fieldOfStudy: section.querySelector('.education-field').value,
                startDate: section.querySelector('.education-startDate').value,
                endDate: section.querySelector('.education-endDate').value,
                gpa: section.querySelector('.education-gpa').value || null,
                activities: section.querySelector('.education-activities').value
            };
        } else if (type === 'certification') {
            item = {
                certificationName: section.querySelector('.certification-name').value,
                issuingOrganization: section.querySelector('.certification-org').value,
                issueDate: section.querySelector('.certification-issueDate').value,
                expiryDate: section.querySelector('.certification-expiryDate').value || null,
                credentialId: section.querySelector('.certification-credId').value || null,
                credentialUrl: section.querySelector('.certification-credUrl').value || null
            };
        } else if (type === 'project') {
            item = {
                projectName: section.querySelector('.project-name').value,
                description: section.querySelector('.project-description').value,
                startDate: section.querySelector('.project-startDate').value,
                endDate: section.querySelector('.project-endDate').value || null,
                technologies: section.querySelector('.project-tech').value.split(',').map(t => t.trim()).filter(t => t),
                role: section.querySelector('.project-role').value || null,
                projectUrl: section.querySelector('.project-url').value || null
            };
        } else if (type === 'language') {
            item = {
                language: section.querySelector('.language-name').value,
                proficiency: section.querySelector('.language-proficiency').value
            };
        }

        // Only add if has required fields
        if (Object.values(item).some(v => v)) {
            data.push(item);
        }
    });

    return data;
}

// ============================================
// LIVE PREVIEW
// ============================================

function updatePreview() {
    // Personal Info
    const firstName = document.getElementById('firstName').value || 'John';
    const lastName = document.getElementById('lastName').value || 'Doe';
    const email = document.getElementById('email').value || 'john@example.com';
    const phone = document.getElementById('phone').value || '+1-9876543210';
    const location = document.getElementById('location').value || 'San Francisco, CA';

    document.getElementById('previewFirstName').textContent = firstName;
    document.getElementById('previewLastName').textContent = lastName;
    document.getElementById('previewEmail').textContent = email;
    document.getElementById('previewPhone').textContent = phone;
    document.getElementById('previewLocation').textContent = location;

    // Professional Summary
    const summary = document.getElementById('professionalSummary').value;
    const summarySection = document.getElementById('previewSummarySection');
    if (summary) {
        document.getElementById('previewSummary').textContent = summary;
        summarySection.classList.remove('hidden');
    } else {
        summarySection.classList.add('hidden');
    }

    // Experience
    updateExperiencePreview();

    // Education
    updateEducationPreview();

    // Skills
    updateSkillsPreview();

    // Certifications
    updateCertificationsPreview();

    // Projects
    updateProjectsPreview();

    // Languages
    updateLanguagesPreview();
}

function updateExperiencePreview() {
    const container = document.getElementById('experienceContainer');
    const previewSection = document.getElementById('previewExperienceSection');
    const previewContent = document.getElementById('previewExperienceContent');

    const sections = container.querySelectorAll('.dynamic-section');
    if (sections.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    sections.forEach(section => {
        const company = section.querySelector('.experience-company').value;
        const title = section.querySelector('.experience-title').value;
        const startDate = section.querySelector('.experience-startDate').value;
        const endDate = section.querySelector('.experience-endDate').value;
        const current = section.querySelector('.experience-current').checked;
        const description = section.querySelector('.experience-description').value;

        if (company || title) {
            const dateRange = startDate ? `${formatDate(startDate)} - ${current ? 'Present' : (endDate ? formatDate(endDate) : '')}` : '';
            html += `
                <div class="preview-item">
                    <div class="preview-item-title">${title || 'Job Title'}</div>
                    <div class="preview-item-subtitle">${company || 'Company'}</div>
                    ${dateRange ? `<div class="preview-item-date">${dateRange}</div>` : ''}
                    ${description ? `<div class="preview-item-description">${description}</div>` : ''}
                </div>
            `;
        }
    });

    if (html) {
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    } else {
        previewSection.classList.add('hidden');
    }
}

function updateEducationPreview() {
    const container = document.getElementById('educationContainer');
    const previewSection = document.getElementById('previewEducationSection');
    const previewContent = document.getElementById('previewEducationContent');

    const sections = container.querySelectorAll('.dynamic-section');
    if (sections.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    sections.forEach(section => {
        const school = section.querySelector('.education-school').value;
        const degree = section.querySelector('.education-degree').value;
        const field = section.querySelector('.education-field').value;
        const endDate = section.querySelector('.education-endDate').value;
        const gpa = section.querySelector('.education-gpa').value;

        if (school || degree || field) {
            html += `
                <div class="preview-item">
                    <div class="preview-item-title">${degree || 'Degree'} in ${field || 'Field of Study'}</div>
                    <div class="preview-item-subtitle">${school || 'School'}</div>
                    ${endDate ? `<div class="preview-item-date">Graduated: ${formatDate(endDate)}</div>` : ''}
                    ${gpa ? `<div class="preview-item-description">GPA: ${gpa}</div>` : ''}
                </div>
            `;
        }
    });

    if (html) {
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    } else {
        previewSection.classList.add('hidden');
    }
}

function updateSkillsPreview() {
    const previewSection = document.getElementById('previewSkillsSection');
    const previewContent = document.getElementById('previewSkillsContent');

    if (skills.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    skills.forEach(skill => {
        html += `<span class="skill-badge">${skill}</span>`;
    });

    previewContent.innerHTML = html;
    previewSection.classList.remove('hidden');
}

function updateCertificationsPreview() {
    const container = document.getElementById('certificationsContainer');
    const previewSection = document.getElementById('previewCertificationsSection');
    const previewContent = document.getElementById('previewCertificationsContent');

    const sections = container.querySelectorAll('.dynamic-section');
    if (sections.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    sections.forEach(section => {
        const name = section.querySelector('.certification-name').value;
        const org = section.querySelector('.certification-org').value;
        const issueDate = section.querySelector('.certification-issueDate').value;

        if (name || org) {
            html += `
                <div class="preview-item">
                    <div class="preview-item-title">${name || 'Certification'}</div>
                    <div class="preview-item-subtitle">${org || 'Organization'}</div>
                    ${issueDate ? `<div class="preview-item-date">Issued: ${formatDate(issueDate)}</div>` : ''}
                </div>
            `;
        }
    });

    if (html) {
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    } else {
        previewSection.classList.add('hidden');
    }
}

function updateProjectsPreview() {
    const container = document.getElementById('projectsContainer');
    const previewSection = document.getElementById('previewProjectsSection');
    const previewContent = document.getElementById('previewProjectsContent');

    const sections = container.querySelectorAll('.dynamic-section');
    if (sections.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    sections.forEach(section => {
        const name = section.querySelector('.project-name').value;
        const description = section.querySelector('.project-description').value;
        const tech = section.querySelector('.project-tech').value;

        if (name) {
            html += `
                <div class="preview-item">
                    <div class="preview-item-title">${name}</div>
                    ${description ? `<div class="preview-item-description">${description}</div>` : ''}
                    ${tech ? `<div class="preview-item-description"><strong>Technologies:</strong> ${tech}</div>` : ''}
                </div>
            `;
        }
    });

    if (html) {
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    } else {
        previewSection.classList.add('hidden');
    }
}

function updateLanguagesPreview() {
    const container = document.getElementById('languagesContainer');
    const previewSection = document.getElementById('previewLanguagesSection');
    const previewContent = document.getElementById('previewLanguagesContent');

    const sections = container.querySelectorAll('.dynamic-section');
    if (sections.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    let html = '';
    sections.forEach(section => {
        const lang = section.querySelector('.language-name').value;
        const prof = section.querySelector('.language-proficiency').value;

        if (lang) {
            html += `
                <div class="preview-item">
                    <div class="preview-item-title">${lang} <span class="preview-item-date">(${prof})</span></div>
                </div>
            `;
        }
    });

    if (html) {
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    } else {
        previewSection.classList.add('hidden');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function updateCharCount() {
    const textarea = document.getElementById('professionalSummary');
    const count = document.getElementById('summaryCount');
    count.textContent = textarea.value.length;
}

function updateJobDescCount() {
    const textarea = document.getElementById('jobDescription');
    const count = document.getElementById('jobDescCount');
    count.textContent = textarea.value.length;
}

// ============================================
// SKILL AUTOCOMPLETE
// ============================================

function initializeSkillAutocomplete() {
    const skillInput = document.getElementById('skillInput');
    let autocompleteContainer = null;

    skillInput.addEventListener('input', async function() {
        const query = this.value.trim();

        // Remove existing autocomplete container
        if (autocompleteContainer) {
            autocompleteContainer.remove();
            autocompleteContainer = null;
        }

        if (query.length < 2) {
            return;
        }

        try {
            // Fetch skill suggestions from server
            const response = await fetch('/resume/skills/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const result = await response.json();

            if (result.success && result.data.results.length > 0) {
                // Create autocomplete container
                autocompleteContainer = document.createElement('div');
                autocompleteContainer.className = 'autocomplete-suggestions';

                result.data.results.forEach(suggestion => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'autocomplete-item';
                    suggestionItem.textContent = suggestion;
                    suggestionItem.addEventListener('click', function() {
                        skillInput.value = suggestion;
                        if (autocompleteContainer) {
                            autocompleteContainer.remove();
                            autocompleteContainer = null;
                        }
                        addSkill();
                        skillInput.focus();
                    });
                    autocompleteContainer.appendChild(suggestionItem);
                });

                // Insert autocomplete container after the skill input
                skillInput.parentElement.appendChild(autocompleteContainer);
            }
        } catch (error) {
            console.error('Error fetching skill suggestions:', error);
        }
    });

    // Hide autocomplete when input loses focus
    skillInput.addEventListener('blur', function() {
        setTimeout(() => {
            if (autocompleteContainer) {
                autocompleteContainer.remove();
                autocompleteContainer = null;
            }
        }, 200);
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function togglePreview() {
    const preview = document.getElementById('resumePreview');
    const btn = document.getElementById('previewToggle');

    if (preview.style.display === 'none') {
        preview.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye"></i> Hide Preview';
    } else {
        preview.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Show Preview';
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#4dabf7'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

    document.body.appendChild(alert);

    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add keyframe animations to head
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);
