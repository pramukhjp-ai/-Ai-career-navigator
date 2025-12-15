# ATS Resume Builder Feature - Implementation Plan

**Project:** AI Career Navigator  
**Feature:** ATS Resume Builder  
**Start Date:** 10 December 2025  
**Target Completion:** 12 December 2025

---

## Table of Contents
1. [Epic Overview](#epic-overview)
2. [Jira Stories & Tasks](#jira-stories--tasks)
3. [Dependencies & Timeline](#dependencies--timeline)
4. [Technical Specifications](#technical-specifications)

---

## Epic Overview

**Epic Title:** ATS Resume Builder Integration  
**Epic Description:** Add a comprehensive ATS-optimized resume builder to the AI Career Navigator platform, enabling users to create, manage, and analyze resumes for Applicant Tracking System compatibility.

**Business Goals:**
- Enable users to build professional resumes within the platform
- Provide real-time ATS compatibility scoring
- Integrate with existing career recommendation engine
- Improve user engagement and retention

**Success Criteria:**
- Users can create, edit, and save multiple resume versions
- ATS analysis provides actionable feedback (score 0-100)
- Resume exports to PDF
- Seamless integration with dashboard

---

## Jira Stories & Tasks

### **STORY-1: Database Schema & Data Model Setup**

**Type:** Story  
**Priority:** P0 (Highest)  
**Story Points:** 5  
**Status:** Not Started  

**Description:**  
Create MongoDB schema for resume storage and management. Establish data model that links resumes to user accounts and supports version control.

**Acceptance Criteria:**
- [ ] Resume schema created with all required fields
- [ ] Schema supports multiple resume versions per user
- [ ] Schema links to existing User model
- [ ] All fields validated and indexed appropriately
- [ ] Tests pass for schema validation

**Tasks:**

#### TASK-1.1: Create Resume Schema File
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/models/resumeSchema.js` with following fields:
  - userId (ref to User)
  - resumeTitle (string)
  - personalInfo (object with name, email, phone, location, linkedIn)
  - professionalSummary (string)
  - experience (array of objects)
  - education (array of objects)
  - skills (array of strings)
  - certifications (array of objects)
  - projects (array of objects)
  - languages (array of objects)
  - atsScore (number 0-100)
  - lastAnalyzed (date)
  - createdAt (date)
  - updatedAt (date)
  - isActive (boolean)
- **Acceptance Criteria:**
  - [ ] Schema file created
  - [ ] All fields have proper types and validation
  - [ ] Timestamps auto-update
  - [ ] User reference is indexed

#### TASK-1.2: Add Resume Schema Relationships
- **Subtask Type:** Task
- **Assignee:** Pramukh J Padmashali
- **Points:** 1
- **Description:** Update `homeSchema.js` to establish relationship with Resume model
- **Acceptance Criteria:**
  - [ ] User schema can reference multiple resumes
  - [ ] Relationship is properly indexed

---

### **STORY-2: Backend API Routes & Controllers**

**Type:** Story  
**Priority:** P0 (Highest)  
**Story Points:** 8  
**Status:** Not Started  

**Description:**  
Create Express.js routes and controller functions for resume CRUD operations and ATS analysis endpoints.

**Acceptance Criteria:**
- [ ] All CRUD endpoints implemented
- [ ] Authentication middleware protects routes
- [ ] Input validation on all endpoints
- [ ] Error handling is comprehensive
- [ ] API returns proper HTTP status codes

**Tasks:**

#### TASK-2.1: Create Resume Router File
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/routers/resumeRouter.js` with routing structure
- **Acceptance Criteria:**
  - [ ] Router file created with Express
  - [ ] All route definitions added
  - [ ] Middleware for authentication added
  - [ ] Error handling middleware configured

#### TASK-2.2: Implement POST /resume/create Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create endpoint to save new resume to database
- **Method:** POST
- **Route:** `/resume/create`
- **Payload:** Resume object with all sections
- **Response:** { success: true, resumeId: "xxx", message: "Resume created" }
- **Acceptance Criteria:**
  - [ ] Validates all required fields
  - [ ] Saves to MongoDB
  - [ ] Returns resumeId for later reference
  - [ ] Links resume to authenticated user
  - [ ] Handles errors gracefully

#### TASK-2.3: Implement GET /resume/list Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Fetch all resumes for logged-in user
- **Method:** GET
- **Route:** `/resume/list`
- **Response:** Array of resume objects with metadata
- **Acceptance Criteria:**
  - [ ] Returns only user's resumes
  - [ ] Includes ATS score in response
  - [ ] Sorted by lastUpdated descending
  - [ ] Returns empty array if no resumes

#### TASK-2.4: Implement GET /resume/:id Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Fetch single resume by ID
- **Method:** GET
- **Route:** `/resume/:id`
- **Response:** Complete resume object
- **Acceptance Criteria:**
  - [ ] Returns full resume details
  - [ ] Verifies user ownership
  - [ ] Returns 404 if not found
  - [ ] Returns 403 if not authorized

#### TASK-2.5: Implement PUT /resume/:id Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Update existing resume
- **Method:** PUT
- **Route:** `/resume/:id`
- **Payload:** Updated resume fields
- **Response:** { success: true, message: "Resume updated" }
- **Acceptance Criteria:**
  - [ ] Updates only specified fields
  - [ ] Updates lastUpdated timestamp
  - [ ] Validates before saving
  - [ ] Checks user authorization
  - [ ] Returns updated resume

#### TASK-2.6: Implement DELETE /resume/:id Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Delete resume by ID
- **Method:** DELETE
- **Route:** `/resume/:id`
- **Response:** { success: true, message: "Resume deleted" }
- **Acceptance Criteria:**
  - [ ] Deletes from database
  - [ ] Checks authorization
  - [ ] Returns 404 if not found
  - [ ] Confirms deletion in response

---

### **STORY-3: ATS Analysis Engine - Python Backend**

**Type:** Story  
**Priority:** P0 (Highest)  
**Story Points:** 8  
**Status:** Not Started  

**Description:**  
Build ATS analysis algorithm in Python Flask to score resumes and provide improvement suggestions.

**Acceptance Criteria:**
- [ ] ATS scoring algorithm implemented (0-100 scale)
- [ ] Provides specific improvement suggestions
- [ ] Analyzes formatting, keywords, and structure
- [ ] Returns results in JSON format
- [ ] Performance acceptable (<2 sec analysis time)

**Tasks:**

#### TASK-3.1: Create ATS Analyzer Module
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 3
- **Description:** Create `recommandation/ats_analyzer.py` with core analysis functions
- **Functions to Implement:**
  - `analyze_formatting(resume_text)` - Check for ATS-unfriendly elements
  - `analyze_keywords(resume_text)` - Extract and score keywords
  - `analyze_structure(resume_data)` - Check resume organization
  - `calculate_ats_score(formatting_score, keyword_score, structure_score)` - Overall score
  - `generate_suggestions(resume_data, scores)` - Return improvement tips
- **Acceptance Criteria:**
  - [ ] All functions implemented
  - [ ] Returns proper data structures
  - [ ] Error handling for edge cases
  - [ ] Unit tests written and passing

#### TASK-3.2: Implement Formatting Analysis
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Analyze resume for ATS-unfriendly formatting
- **Checks to Include:**
  - No tables or complex formatting
  - No unusual characters or symbols
  - Standard fonts and sizes
  - Proper section breaks
  - No images or logos
- **Scoring:** 0-25 points
- **Acceptance Criteria:**
  - [ ] Detects all ATS-unfriendly elements
  - [ ] Provides specific feedback
  - [ ] Returns formatting score
  - [ ] Suggests corrections

#### TASK-3.3: Implement Keyword Analysis
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Analyze keywords and their density
- **Features:**
  - Extract keywords from resume
  - Compare against job description keywords (if provided)
  - Analyze keyword density
  - Identify missing industry keywords
- **Scoring:** 0-40 points
- **Acceptance Criteria:**
  - [ ] Extracts relevant keywords
  - [ ] Identifies important missing skills
  - [ ] Provides keyword suggestions
  - [ ] Returns keyword score

#### TASK-3.4: Implement Structure Analysis
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Analyze resume structure and organization
- **Checks to Include:**
  - All required sections present
  - Proper section order
  - Content length validation
  - Contact info format
  - Date format consistency
- **Scoring:** 0-35 points
- **Acceptance Criteria:**
  - [ ] Validates all sections
  - [ ] Checks section order
  - [ ] Verifies date formats
  - [ ] Returns structure score

#### TASK-3.5: Create ATS Analysis Flask Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create Flask route for ATS analysis
- **Method:** POST
- **Route:** `/api/analyze-ats`
- **Payload:** { resume_data: {...}, job_description: "optional" }
- **Response:**
  ```json
  {
    "ats_score": 75,
    "formatting_score": 20,
    "keyword_score": 35,
    "structure_score": 20,
    "suggestions": [
      "Remove tables from experience section",
      "Add more technical keywords",
      "Use standard section headers"
    ],
    "missing_keywords": ["Python", "AWS", "REST API"],
    "strengths": ["Good structure", "Clear formatting"]
  }
  ```
- **Acceptance Criteria:**
  - [ ] Endpoint created
  - [ ] Accepts resume data
  - [ ] Returns proper JSON response
  - [ ] Error handling implemented

---

### **STORY-4: Frontend - Resume Builder Form & UI**

**Type:** Story  
**Priority:** P1 (High)  
**Story Points:** 13  
**Status:** Not Started  

**Description:**  
Create responsive EJS template and JavaScript for resume builder form with live preview functionality.

**Acceptance Criteria:**
- [ ] Form has all required sections
- [ ] Dynamic add/remove for experience, education, skills
- [ ] Live preview updates in real-time
- [ ] Mobile responsive design
- [ ] Form validation on client-side
- [ ] Follows existing dashboard design

**Tasks:**

#### TASK-4.1: Create Resume Builder Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 4
- **Description:** Create `Login/views/resume_builder.ejs`
- **Form Sections:**
  - Personal Information
    - Full Name
    - Email
    - Phone Number
    - Location
    - LinkedIn URL (optional)
  - Professional Summary (textarea)
  - Experience Section (dynamic)
    - Company Name
    - Job Title
    - Duration (Start & End dates)
    - Description
    - Add/Remove buttons
  - Education Section (dynamic)
    - School/University
    - Degree
    - Field of Study
    - Graduation Date
    - GPA (optional)
    - Add/Remove buttons
  - Skills (dynamic tags)
    - Skill name input
    - Add/Remove skill buttons
  - Certifications (dynamic, optional)
  - Projects (dynamic, optional)
  - Languages (dynamic, optional)
- **Acceptance Criteria:**
  - [ ] Template created with all sections
  - [ ] Form uses POST method
  - [ ] Dynamic sections working
  - [ ] Styling matches dashboard
  - [ ] Mobile responsive

#### TASK-4.2: Create Resume Builder CSS
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 3
- **Description:** Create `Login/public/css/resume.css`
- **Styling Requirements:**
  - Match existing purple/dark theme from dashboard
  - Form input styling
  - Dynamic section styling
  - Add/Remove buttons styling
  - Responsive grid layout
  - Button hover effects
- **Acceptance Criteria:**
  - [ ] CSS file created
  - [ ] All elements styled
  - [ ] Consistent with dashboard theme
  - [ ] Mobile responsive (breakpoints: 768px, 1024px)
  - [ ] Accessibility considerations

#### TASK-4.3: Create Resume Builder JavaScript
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 3
- **Description:** Create `Login/public/js/resume_builder.js`
- **Functionality:**
  - Dynamic add/remove section handlers
  - Form validation
  - Live preview updates
  - Character counters for textarea fields
  - Date picker integration
  - Skill tag autocomplete (from career recommendations)
- **Acceptance Criteria:**
  - [ ] Dynamic sections work properly
  - [ ] Form validation working
  - [ ] No console errors
  - [ ] Accessibility keyboard support

#### TASK-4.4: Create Resume Live Preview Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 3
- **Description:** Create `Login/views/resume_preview.ejs`
- **Features:**
  - Real-time preview of formatted resume
  - Two-column layout (form + preview)
  - Professional resume styling
  - Print-friendly formatting
  - PDF export button
- **Acceptance Criteria:**
  - [ ] Preview updates as user types
  - [ ] Proper resume formatting
  - [ ] Print preview works
  - [ ] Mobile layout stacks vertically

---

### **STORY-5: Frontend - Resume Display & Management**

**Type:** Story  
**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Not Started  

**Description:**  
Create templates for displaying saved resumes, managing multiple versions, and viewing ATS analysis results.

**Acceptance Criteria:**
- [ ] Users can view list of saved resumes
- [ ] Users can select and view specific resume
- [ ] Users can see ATS score and suggestions
- [ ] Users can manage multiple versions
- [ ] Smooth navigation between pages

**Tasks:**

#### TASK-5.1: Create Resume List Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/views/resume_list.ejs`
- **Display Elements:**
  - Table/Card grid of all user resumes
  - Resume title
  - Last updated date
  - ATS score (color-coded: red <50, yellow 50-75, green >75)
  - Action buttons (View, Edit, Delete, Analyze, Download)
  - Create New Resume button
- **Acceptance Criteria:**
  - [ ] Lists all user resumes
  - [ ] Displays ATS scores
  - [ ] Action buttons functional
  - [ ] Responsive design
  - [ ] Delete with confirmation

#### TASK-5.2: Create Resume View Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/views/resume_view.ejs` for single resume display
- **Features:**
  - Full resume formatted for viewing
  - Edit button
  - Back to list button
  - Download PDF button
  - Share/Export options
  - Timestamp information
- **Acceptance Criteria:**
  - [ ] Displays resume data properly
  - [ ] Professional formatting
  - [ ] Responsive layout
  - [ ] Navigation working

#### TASK-5.3: Create ATS Analysis Results Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/views/resume_analysis.ejs`
- **Display Elements:**
  - Large ATS score (0-100) with visual gauge/progress bar
  - Score breakdown:
    - Formatting score
    - Keyword score
    - Structure score
  - Improvement suggestions (prioritized list)
  - Identified missing keywords
  - Strengths/Highlights
  - Action items (clickable to edit specific sections)
- **Acceptance Criteria:**
  - [ ] Score displayed prominently
  - [ ] Visual feedback (color coding)
  - [ ] Suggestions organized by priority
  - [ ] Links to edit sections
  - [ ] Mobile responsive

#### TASK-5.4: Create Resume Edit Template
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create `Login/views/resume_edit.ejs` - extended resume builder for editing
- **Features:**
  - Pre-populated form fields
  - Save changes button
  - Cancel/Back button
  - Show previous ATS score
  - Option to create as new version
- **Acceptance Criteria:**
  - [ ] Form pre-populated with existing data
  - [ ] Save updates database
  - [ ] Can create new version
  - [ ] Validation working

---

### **STORY-6: Resume PDF Export**

**Type:** Story  
**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Not Started  

**Description:**  
Implement PDF export functionality for resumes with professional formatting.

**Acceptance Criteria:**
- [ ] Resumes export to PDF without issues
- [ ] PDF formatting matches web preview
- [ ] File names are descriptive
- [ ] File size is reasonable
- [ ] Download works on all browsers

**Tasks:**

#### TASK-6.1: Setup PDF Export Library
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Install and configure PDF library (pdfkit or html2pdf)
- **Acceptance Criteria:**
  - [ ] Library installed via npm
  - [ ] Properly configured in Express
  - [ ] No dependency conflicts

#### TASK-6.2: Implement PDF Generation Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create endpoint to generate PDF from resume
- **Method:** GET
- **Route:** `/resume/:id/download-pdf`
- **Response:** PDF file
- **Acceptance Criteria:**
  - [ ] Endpoint created
  - [ ] Converts resume to PDF
  - [ ] File downloads properly
  - [ ] Checks user authorization

#### TASK-6.3: Create PDF Styling
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Style PDF output for professional appearance
- **Styling Includes:**
  - Proper margins and spacing
  - Font sizing for readability
  - Color scheme (if desired)
  - Page breaks handling
- **Acceptance Criteria:**
  - [ ] PDF looks professional
  - [ ] All content readable
  - [ ] Proper page breaks
  - [ ] ATS-friendly PDF (no images)

---

### **STORY-7: Dashboard Integration**

**Type:** Story  
**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Not Started  

**Description:**  
Integrate ATS Resume Builder into main dashboard with navigation and quick access features.

**Acceptance Criteria:**
- [ ] New card added to dashboard
- [ ] Navigation menu updated
- [ ] Links properly configured
- [ ] Consistent styling with dashboard
- [ ] Session authentication working

**Tasks:**

#### TASK-7.1: Add Resume Builder to Dashboard Navigation
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Update `Login/views/dashboard.ejs`
- **Changes:**
  - Add "ATS Resume Builder" to sidebar navigation menu
  - Add card/section for ATS Resume Builder on main dashboard
  - Use consistent icon and styling
  - Link to resume list/builder
- **Acceptance Criteria:**
  - [ ] Navigation item added
  - [ ] Dashboard card added
  - [ ] Icons consistent
  - [ ] Links working
  - [ ] Styling matches dashboard

#### TASK-7.2: Update Dashboard CSS
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Ensure resume builder card styling in `Login/public/css/dashboard.css`
- **Acceptance Criteria:**
  - [ ] Card styled properly
  - [ ] Hover effects working
  - [ ] Mobile responsive
  - [ ] Consistent with other cards

#### TASK-7.3: Mount Resume Router in Main App
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Register resume router in `Login/app.js`
- **Changes:**
  - Require resumeRouter
  - Mount with `app.use('/resume', resumeRouter)`
- **Acceptance Criteria:**
  - [ ] Router mounted correctly
  - [ ] All routes accessible
  - [ ] No route conflicts
  - [ ] Authentication working

---

### **STORY-8: Integration with Career Recommendations**

**Type:** Story  
**Priority:** P2 (Medium)  
**Story Points:** 5  
**Status:** Not Started  

**Description:**  
Connect ATS Resume Builder with existing career recommendation engine for intelligent skill suggestions and integration.

**Acceptance Criteria:**
- [ ] Skills auto-populated from user's career recommendations
- [ ] Suggested keywords displayed during resume creation
- [ ] Job description analysis integrated
- [ ] Career data used for ATS analysis

**Tasks:**

#### TASK-8.1: Create Skill Suggestions Endpoint
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Create endpoint to fetch recommended skills for user
- **Method:** GET
- **Route:** `/resume/skills/suggestions`
- **Response:** Array of suggested skills from user's career path
- **Acceptance Criteria:**
  - [ ] Endpoint created
  - [ ] Returns relevant skills
  - [ ] Based on user's recommendations
  - [ ] Cached for performance

#### TASK-8.2: Implement Skill Autocomplete
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Add autocomplete to skills input in resume builder
- **Features:**
  - Fetch suggestions as user types
  - Suggest from recommended career skills
  - Show industry-standard keywords
  - Allow custom skills
- **Acceptance Criteria:**
  - [ ] Autocomplete working
  - [ ] Shows skill suggestions
  - [ ] Allows custom input
  - [ ] Performance acceptable

#### TASK-8.3: Create Job Description Input Optional Feature
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Add optional job description field for better ATS analysis
- **Features:**
  - Optional textarea for job description
  - Use for keyword matching in ATS analysis
  - Show match percentage
- **Acceptance Criteria:**
  - [ ] Input field added
  - [ ] Optional (not required)
  - [ ] Used in ATS analysis
  - [ ] Results improved with job description

---

### **STORY-9: Testing & Quality Assurance**

**Type:** Story  
**Priority:** P0 (Highest)  
**Story Points:** 8  
**Status:** Not Started  

**Description:**  
Comprehensive testing of all resume builder features including unit tests, integration tests, and user acceptance testing.

**Acceptance Criteria:**
- [ ] All unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security validated

**Tasks:**

#### TASK-9.1: Write Unit Tests for Resume Schema
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Write unit tests for `resumeSchema.js`
- **Test Coverage:**
  - Valid data acceptance
  - Invalid data rejection
  - Required field validation
  - Index verification
- **Acceptance Criteria:**
  - [ ] Test file created
  - [ ] >80% code coverage
  - [ ] All tests passing
  - [ ] Edge cases covered

#### TASK-9.2: Write Unit Tests for API Routes
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Write unit tests for `resumeRouter.js`
- **Test Coverage:**
  - Authentication checks
  - CRUD operations
  - Error handling
  - Authorization
- **Acceptance Criteria:**
  - [ ] Test file created
  - [ ] >80% code coverage
  - [ ] All tests passing
  - [ ] Mocked database calls

#### TASK-9.3: Write Tests for ATS Analyzer
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Write unit tests for `ats_analyzer.py`
- **Test Coverage:**
  - Formatting analysis accuracy
  - Keyword extraction correctness
  - Score calculation validation
  - Suggestion generation
- **Acceptance Criteria:**
  - [ ] Test file created
  - [ ] >80% code coverage
  - [ ] All tests passing
  - [ ] Edge cases handled

#### TASK-9.4: Integration Testing
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Test complete user workflows
- **Workflows to Test:**
  - Create resume → Save → View → Analyze → Download
  - Edit existing resume → Re-analyze
  - Multiple resume versions
  - Navigation between pages
- **Acceptance Criteria:**
  - [ ] All workflows tested
  - [ ] No broken links
  - [ ] Data persists correctly
  - [ ] UI responsive

#### TASK-9.5: Performance Testing
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Test performance and optimization
- **Tests:**
  - Page load time < 3 seconds
  - ATS analysis < 2 seconds
  - Form submission handling
  - Large resume handling
- **Acceptance Criteria:**
  - [ ] Performance benchmarked
  - [ ] Targets met
  - [ ] Database queries optimized
  - [ ] No memory leaks

---

### **STORY-10: Documentation & Deployment**

**Type:** Story  
**Priority:** P2 (Medium)  
**Story Points:** 5  
**Status:** Not Started  

**Description:**  
Create comprehensive documentation and prepare feature for production deployment.

**Acceptance Criteria:**
- [ ] README updated with feature info
- [ ] API documentation created
- [ ] Deployment checklist completed
- [ ] Environment variables documented
- [ ] Rollback plan documented

**Tasks:**

#### TASK-10.1: Create API Documentation
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Document all resume API endpoints
- **Documentation Includes:**
  - Endpoint descriptions
  - Request/response examples
  - Authentication requirements
  - Error codes and messages
  - Rate limiting (if applicable)
- **Acceptance Criteria:**
  - [ ] Documentation file created (API.md)
  - [ ] All endpoints documented
  - [ ] Examples provided
  - [ ] Markdown formatted

#### TASK-10.2: Update Project README
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 1
- **Description:** Add ATS Resume Builder section to main README.md
- **Sections:**
  - Feature overview
  - User guide
  - Installation instructions
  - Configuration requirements
- **Acceptance Criteria:**
  - [ ] README updated
  - [ ] Feature documented
  - [ ] Instructions clear
  - [ ] Screenshots/examples added

#### TASK-10.3: Create Deployment Guide
- **Subtask Type:** Task
- **Assignee:** [Your Name]
- **Points:** 2
- **Description:** Document deployment steps for production
- **Includes:**
  - Environment variable setup
  - Database migrations
  - Dependencies installation
  - Testing before deployment
  - Rollback procedure
- **Acceptance Criteria:**
  - [ ] Deployment guide created
  - [ ] All steps documented
  - [ ] Tested on staging
  - [ ] Rollback plan documented

---

## Dependencies & Timeline

### **Dependency Graph:**
```
STORY-1 (Schema)
    ↓
STORY-2 (Backend Routes) → STORY-3 (ATS Engine)
    ↓
STORY-4 (Form UI) → STORY-5 (Display UI) → STORY-6 (PDF Export)
    ↓
STORY-7 (Dashboard Integration) → STORY-8 (Career Integration)
    ↓
STORY-9 (Testing) → STORY-10 (Documentation)
```

### **Critical Path:**
STORY-1 → STORY-2 → STORY-3 → STORY-4 → STORY-9 (Deploy)

### **Estimated Timeline:**

| Phase | Stories | Points | Est. Duration | End Date |
|-------|---------|--------|---|---|
| Phase 1: Backend | STORY-1, 2, 3 | 21 | 2 weeks | Dec 24 |
| Phase 2: Frontend | STORY-4, 5, 6 | 23 | 2.5 weeks | Jan 7 |
| Phase 3: Integration | STORY-7, 8 | 10 | 1 week | Jan 14 |
| Phase 4: QA & Docs | STORY-9, 10 | 13 | 1.5 weeks | Jan 21 |
| **TOTAL** | **10** | **67** | **~7 weeks** | **Jan 21** |

**Assumptions:**
- 1 developer working full-time
- 8 hours/day, 5 days/week
- Average velocity: 10 points/week
- 2-3 blockers expected during development

---

## Technical Specifications

### **Tech Stack:**
- **Frontend:** EJS, HTML, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **ATS Engine:** Python, Flask, NLTK/Scikit-learn
- **PDF Generation:** pdfkit or html2pdf
- **Testing:** Jest (Node.js), Pytest (Python)
- **Deployment:** Docker (recommended), PM2

### **Environment Variables Needed:**

```bash
# Node.js / Express
MONGODB_URI=mongodb://127.0.0.1:27017/studentsdata
SESSION_SECRET=your_secret_key_here
NODE_ENV=development

# Flask / Python
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=true

# Resume Builder
MAX_RESUME_SIZE_MB=10
PDF_EXPORT_ENABLED=true
ATS_ANALYSIS_TIMEOUT_SECONDS=30
```

### **Database Indexes:**
```javascript
// resumeSchema indexes
resumeSchema.index({ userId: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ atsScore: 1 });
```

### **API Response Format:**
```json
{
  "success": boolean,
  "data": {},
  "message": "string",
  "error": null | "error_message",
  "timestamp": "ISO-8601 datetime"
}
```

### **Error Codes:**
```
400: Bad Request (validation failed)
401: Unauthorized (not authenticated)
403: Forbidden (not authorized to resource)
404: Not Found
409: Conflict (resume already exists)
422: Unprocessable Entity (validation error details)
500: Internal Server Error
503: Service Unavailable (ATS analysis service down)
```

---

## Additional Notes

- **Security:** Implement rate limiting on ATS analysis endpoint
- **Scalability:** Consider caching ATS analysis results
- **Accessibility:** Ensure WCAG 2.1 Level AA compliance
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Fully responsive design required

---

**Document Version:** 1.0  
**Last Updated:** 10 December 2025  
**Created By:** GitHub Copilot  

---

### Quick Reference: Jira Story IDs

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-1 | Database Schema Setup | 5 | P0 |
| STORY-2 | Backend API Routes | 8 | P0 |
| STORY-3 | ATS Analysis Engine | 8 | P0 |
| STORY-4 | Resume Builder Form & UI | 13 | P1 |
| STORY-5 | Resume Display & Management | 8 | P1 |
| STORY-6 | PDF Export | 5 | P1 |
| STORY-7 | Dashboard Integration | 5 | P1 |
| STORY-8 | Career Integration | 5 | P2 |
| STORY-9 | Testing & QA | 8 | P0 |
| STORY-10 | Documentation & Deployment | 5 | P2 |

