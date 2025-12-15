const express = require("express");
const Router = express.Router();
const Resume = require("../models/resumeSchema");
const homeSchema = require("../models/homeSchema");
const mongoose = require("mongoose");

// ============================================
// MIDDLEWARE
// ============================================

// Authentication middleware - check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Unauthorized: Please login first",
      error: "NOT_AUTHENTICATED",
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Input validation middleware - validate resume data
const validateResumeInput = (req, res, next) => {
  const { resumeTitle, personalInfo } = req.body;

  // Check required fields
  if (!resumeTitle || !personalInfo) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Missing required fields: resumeTitle and personalInfo",
      error: "VALIDATION_ERROR",
      timestamp: new Date().toISOString()
    });
  }

  // Validate personalInfo structure
  const { firstName, lastName, email, phone, location } = personalInfo;
  if (!firstName || !lastName || !email || !phone || !location) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Missing required personal info fields",
      error: "VALIDATION_ERROR",
      timestamp: new Date().toISOString()
    });
  }

  // Email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Invalid email format",
      error: "VALIDATION_ERROR",
      timestamp: new Date().toISOString()
    });
  }

  // Phone validation
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Invalid phone number format",
      error: "VALIDATION_ERROR",
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Error handling middleware
const handleErrors = (err, req, res, next) => {
  console.error("[ERROR]:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      data: null,
      message: "Validation failed",
      error: Object.values(err.errors).map(e => e.message),
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      data: null,
      message: "Resume with this title already exists",
      error: "DUPLICATE_ERROR",
      timestamp: new Date().toISOString()
    });
  }

  // MongoDB ObjectId cast error
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Invalid resume ID format",
      error: "INVALID_ID",
      timestamp: new Date().toISOString()
    });
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    data: null,
    message: "Internal server error",
    error: err.message || "SERVER_ERROR",
    timestamp: new Date().toISOString()
  });
};

// ============================================
// ROUTES
// ============================================

// Apply authentication middleware to all routes
Router.use(isAuthenticated);

// ============================================
// POST /resume/create - Create a new resume (TASK-2.2)
// ============================================
Router.post("/create", validateResumeInput, async (req, res, next) => {
  try {
    const { resumeTitle, personalInfo, professionalSummary, experience, education, skills, certifications, projects, languages } = req.body;
    const userId = req.session.user.id;

    // Create new resume object
    const newResume = new Resume({
      userId: userId,
      resumeTitle: resumeTitle.trim(),
      personalInfo: {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        email: personalInfo.email.toLowerCase().trim(),
        phone: personalInfo.phone.trim(),
        location: personalInfo.location.trim(),
        linkedIn: personalInfo.linkedIn || null,
        portfolio: personalInfo.portfolio || null
      },
      professionalSummary: professionalSummary || "",
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      certifications: certifications || [],
      projects: projects || [],
      languages: languages || [],
      isActive: true,
      isDefault: false
    });

    // Save to database
    const savedResume = await newResume.save();

    // Add resume to user's resumes array
    await homeSchema.findByIdAndUpdate(
      userId,
      { $push: { resumes: savedResume._id } }
    );

    return res.status(201).json({
      success: true,
      data: {
        resumeId: savedResume._id,
        resumeTitle: savedResume.resumeTitle,
        createdAt: savedResume.createdAt
      },
      message: "Resume created successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /resume/list - Get all resumes for user (TASK-2.3)
// ============================================
Router.get("/list", async (req, res, next) => {
  try {
    const userId = req.session.user.id;

    // Find all active resumes for user, sorted by latest
    const resumes = await Resume.find({
      userId: userId,
      isActive: true
    })
      .select("_id resumeTitle personalInfo atsScore version isDefault createdAt updatedAt lastAnalyzed")
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance on read-only queries

    // Transform data for response
    const resumeList = resumes.map(resume => ({
      id: resume._id,
      resumeTitle: resume.resumeTitle,
      fullName: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      atsScore: resume.atsScore,
      version: resume.version,
      isDefault: resume.isDefault,
      lastAnalyzed: resume.lastAnalyzed,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        count: resumeList.length,
        resumes: resumeList
      },
      message: resumeList.length === 0 ? "No resumes found" : `Found ${resumeList.length} resume(s)`,
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// Alias for API calls
Router.get("/api/list", async (req, res, next) => {
  try {
    const userId = req.session.user.id;

    // Find all active resumes for user, sorted by latest
    const resumes = await Resume.find({
      userId: userId,
      isActive: true
    })
      .select("_id resumeTitle personalInfo atsScore version isDefault createdAt updatedAt lastAnalyzed")
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for response
    const resumeList = resumes.map(resume => ({
      id: resume._id,
      resumeTitle: resume.resumeTitle,
      fullName: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      atsScore: resume.atsScore,
      version: resume.version,
      isDefault: resume.isDefault,
      lastAnalyzed: resume.lastAnalyzed,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        count: resumeList.length,
        resumes: resumeList
      },
      message: resumeList.length === 0 ? "No resumes found" : `Found ${resumeList.length} resume(s)`,
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /resume/:id - Get single resume by ID (TASK-2.4)
// ============================================
Router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid resume ID format",
        error: "INVALID_ID",
        timestamp: new Date().toISOString()
      });
    }

    // Find resume and verify ownership
    const resume = await Resume.findOne({
      _id: id,
      userId: userId,
      isActive: true
    });

    // Check if resume exists
    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Resume not found",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString()
      });
    }

    // Return complete resume data
    return res.status(200).json({
      success: true,
      data: resume.toObject(),
      message: "Resume retrieved successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// PUT /resume/:id - Update existing resume (TASK-2.5)
// ============================================
Router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid resume ID format",
        error: "INVALID_ID",
        timestamp: new Date().toISOString()
      });
    }

    // Find resume and verify ownership
    const resume = await Resume.findOne({
      _id: id,
      userId: userId,
      isActive: true
    });

    // Check if resume exists
    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Resume not found",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString()
      });
    }

    // Extract fields to update
    const { resumeTitle, personalInfo, professionalSummary, experience, education, skills, certifications, projects, languages } = req.body;

    // Update only provided fields
    if (resumeTitle) resume.resumeTitle = resumeTitle.trim();
    
    if (personalInfo) {
      if (personalInfo.firstName) resume.personalInfo.firstName = personalInfo.firstName.trim();
      if (personalInfo.lastName) resume.personalInfo.lastName = personalInfo.lastName.trim();
      if (personalInfo.email) resume.personalInfo.email = personalInfo.email.toLowerCase().trim();
      if (personalInfo.phone) resume.personalInfo.phone = personalInfo.phone.trim();
      if (personalInfo.location) resume.personalInfo.location = personalInfo.location.trim();
      if (personalInfo.linkedIn !== undefined) resume.personalInfo.linkedIn = personalInfo.linkedIn;
      if (personalInfo.portfolio !== undefined) resume.personalInfo.portfolio = personalInfo.portfolio;
    }

    if (professionalSummary !== undefined) resume.professionalSummary = professionalSummary;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;
    if (certifications !== undefined) resume.certifications = certifications;
    if (projects !== undefined) resume.projects = projects;
    if (languages !== undefined) resume.languages = languages;

    // Save updated resume
    const updatedResume = await resume.save();

    return res.status(200).json({
      success: true,
      data: {
        resumeId: updatedResume._id,
        resumeTitle: updatedResume.resumeTitle,
        updatedAt: updatedResume.updatedAt
      },
      message: "Resume updated successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// DELETE /resume/:id - Delete resume by ID (TASK-2.6)
// ============================================
Router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid resume ID format",
        error: "INVALID_ID",
        timestamp: new Date().toISOString()
      });
    }

    // Find resume and verify ownership
    const resume = await Resume.findOne({
      _id: id,
      userId: userId
    });

    // Check if resume exists
    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Resume not found",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete by marking isActive as false
    resume.isActive = false;
    await resume.save();

    // Remove from user's resumes array
    await homeSchema.findByIdAndUpdate(
      userId,
      { 
        $pull: { resumes: id },
        $cond: { if: { $eq: ["$defaultResume", id] }, then: { defaultResume: null }, else: "$defaultResume" }
      }
    );

    // If deleted resume was default, unset it
    if (resume.isDefault) {
      await homeSchema.findByIdAndUpdate(userId, { defaultResume: null });
    }

    return res.status(200).json({
      success: true,
      data: {
        resumeId: resume._id,
        message: "Resume deleted"
      },
      message: "Resume deleted successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /resume/:id/analyze - Analyze resume for ATS compatibility (TASK-3.5)
// ============================================
Router.post("/:id/analyze", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;
    const { jobDescription } = req.body;

    // Validate resume ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid resume ID format",
        error: "INVALID_ID",
        timestamp: new Date().toISOString()
      });
    }

    // Find resume and verify ownership
    const resume = await Resume.findOne({
      _id: id,
      userId: userId,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Resume not found",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString()
      });
    }

    // Call Python Flask ATS analyzer
    const axios = require('axios');
    const atsAnalysisURL = process.env.ATS_ANALYZER_URL || 'http://localhost:5001/api/analyze-ats';
    
    const atsPayload = {
      resume_data: resume.toObject(),
      job_description: jobDescription || ''
    };

    try {
      const atsResponse = await axios.post(atsAnalysisURL, atsPayload);
      
      if (atsResponse.data && atsResponse.data.data) {
        const atsData = atsResponse.data.data;
        
        // Update resume with ATS analysis results
        resume.atsScore = atsData.ats_score;
        resume.formattingScore = atsData.formatting_score;
        resume.keywordScore = atsData.keyword_score;
        resume.structureScore = atsData.structure_score;
        resume.atsSuggestions = atsData.suggestions;
        resume.missingKeywords = atsData.missing_keywords;
        resume.strengths = atsData.strengths;
        resume.lastAnalyzed = new Date();
        
        await resume.save();
        
        return res.status(200).json({
          success: true,
          data: {
            resumeId: resume._id,
            resumeTitle: resume.resumeTitle,
            atsScore: resume.atsScore,
            formattingScore: resume.formattingScore,
            keywordScore: resume.keywordScore,
            structureScore: resume.structureScore,
            suggestions: resume.atsSuggestions,
            missingKeywords: resume.missingKeywords,
            strengths: resume.strengths,
            lastAnalyzed: resume.lastAnalyzed,
            jobMatch: atsResponse.data.data.job_match || null
          },
          message: "Resume analyzed successfully",
          error: null,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Invalid response from ATS analyzer');
      }
      
    } catch (atsError) {
      console.error("[ATS Analysis Error]:", atsError.message);
      return res.status(503).json({
        success: false,
        data: null,
        message: "ATS analysis service unavailable",
        error: "ATS_SERVICE_ERROR",
        timestamp: new Date().toISOString()
      });
    }

  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /resume/:id/ats-score - Get ATS score for resume
// ============================================
Router.get("/:id/ats-score", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    // Validate resume ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid resume ID format",
        error: "INVALID_ID",
        timestamp: new Date().toISOString()
      });
    }

    // Find resume
    const resume = await Resume.findOne({
      _id: id,
      userId: userId,
      isActive: true
    }).select("_id resumeTitle atsScore formattingScore keywordScore structureScore atsSuggestions missingKeywords strengths lastAnalyzed");

    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Resume not found",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString()
      });
    }

    // Return ATS score if already analyzed
    if (resume.atsScore === null) {
      return res.status(200).json({
        success: true,
        data: {
          resumeId: resume._id,
          atsScore: null,
          message: "Resume has not been analyzed yet"
        },
        message: "Resume not yet analyzed",
        error: null,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        resumeId: resume._id,
        resumeTitle: resume.resumeTitle,
        atsScore: resume.atsScore,
        formattingScore: resume.formattingScore,
        keywordScore: resume.keywordScore,
        structureScore: resume.structureScore,
        suggestions: resume.atsSuggestions,
        missingKeywords: resume.missingKeywords,
        strengths: resume.strengths,
        lastAnalyzed: resume.lastAnalyzed
      },
      message: "ATS score retrieved successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// SKILL SUGGESTIONS ENDPOINT
// ============================================

// GET /resume/skills/suggestions - Get recommended skills
Router.get("/skills/suggestions", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const { jobTitle, experience } = req.query;

    // Common skill suggestions based on job roles
    const skillSuggestions = {
      'software engineer': [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
        'Django', 'Flask', 'Git', 'REST API', 'SQL', 'MongoDB', 'Docker',
        'Kubernetes', 'AWS', 'Azure', 'CI/CD', 'Agile', 'Scrum'
      ],
      'data scientist': [
        'Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Scikit-learn',
        'Pandas', 'NumPy', 'Data Analysis', 'Statistics', 'Tableau', 'Power BI',
        'Apache Spark', 'Hadoop', 'Deep Learning', 'Neural Networks', 'NLP'
      ],
      'frontend developer': [
        'JavaScript', 'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'TypeScript',
        'CSS Grid', 'Flexbox', 'SASS', 'Bootstrap', 'Material Design', 'Webpack',
        'REST API', 'Git', 'Responsive Design', 'UX/UI Principles'
      ],
      'backend developer': [
        'JavaScript', 'Python', 'Java', 'Node.js', 'Express.js', 'Django',
        'Flask', 'Spring Boot', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
        'REST API', 'GraphQL', 'Docker', 'AWS', 'Microservices', 'Git'
      ],
      'devops engineer': [
        'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'AWS', 'Azure',
        'GCP', 'Linux', 'Bash', 'Python', 'Infrastructure as Code', 'Terraform',
        'Ansible', 'Monitoring', 'CI/CD', 'Container Registry', 'Networking'
      ],
      'project manager': [
        'Agile', 'Scrum', 'Jira', 'Asana', 'Monday.com', 'Leadership', 'Communication',
        'Risk Management', 'Budget Planning', 'Stakeholder Management', 'Excel',
        'PowerPoint', 'Team Building', 'Problem Solving', 'PRINCE2'
      ],
      'data analyst': [
        'SQL', 'Python', 'R', 'Excel', 'Tableau', 'Power BI', 'Statistics',
        'Data Visualization', 'Pandas', 'NumPy', 'Google Analytics', 'Looker',
        'Data Cleaning', 'ETL', 'Reporting', 'Business Intelligence'
      ],
      'ux designer': [
        'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Wireframing', 'Prototyping',
        'User Research', 'Usability Testing', 'Information Architecture',
        'UI Design', 'Design Systems', 'HTML', 'CSS', 'User Psychology'
      ]
    };

    // Get user's current resume to extract job titles
    const userResumes = await Resume.find({ userId }).select('personalInfo jobTitle');

    // Build a comprehensive list of suggested skills
    let allSuggestions = new Set();

    // Add suggestions based on provided job title
    if (jobTitle) {
      const jobTitleLower = jobTitle.toLowerCase();
      for (const [role, skills] of Object.entries(skillSuggestions)) {
        if (jobTitleLower.includes(role) || role.includes(jobTitleLower)) {
          skills.forEach(skill => allSuggestions.add(skill));
        }
      }
    }

    // Add suggestions based on resumes
    if (userResumes && userResumes.length > 0) {
      userResumes.forEach(resume => {
        if (resume.personalInfo && resume.personalInfo.jobTitle) {
          const jobTitleLower = resume.personalInfo.jobTitle.toLowerCase();
          for (const [role, skills] of Object.entries(skillSuggestions)) {
            if (jobTitleLower.includes(role) || role.includes(jobTitleLower)) {
              skills.forEach(skill => allSuggestions.add(skill));
            }
          }
        }
      });
    }

    // If no specific role found, provide general professional skills
    if (allSuggestions.size === 0) {
      const generalSkills = [
        'Communication', 'Leadership', 'Problem Solving', 'Time Management',
        'Teamwork', 'Critical Thinking', 'Adaptability', 'Project Management',
        'Microsoft Office', 'Google Suite', 'Git', 'Agile'
      ];
      generalSkills.forEach(skill => allSuggestions.add(skill));
    }

    const suggestedSkills = Array.from(allSuggestions).sort();

    return res.status(200).json({
      success: true,
      data: {
        suggestions: suggestedSkills,
        count: suggestedSkills.length,
        categories: Object.keys(skillSuggestions)
      },
      message: "Skill suggestions retrieved successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// POST /resume/skills/search - Search for skills (autocomplete)
Router.post("/skills/search", isAuthenticated, async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Search query is required",
        error: "EMPTY_QUERY",
        timestamp: new Date().toISOString()
      });
    }

    const queryLower = query.toLowerCase();

    // All available skills
    const allSkills = [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'TypeScript', 'Kotlin', 'Swift', 'Objective-C', 'R', 'MATLAB', 'Scala',
      
      // Frontend
      'React', 'Vue.js', 'Angular', 'Ember.js', 'Svelte', 'Next.js', 'Nuxt.js',
      'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel', 'ESLint', 'Prettier',
      'Bootstrap', 'Tailwind CSS', 'Material Design', 'Flexbox', 'CSS Grid',
      
      // Backend
      'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
      'Spring Framework', 'ASP.NET', 'Laravel', 'Rails', 'Gin', 'Echo',
      'GraphQL', 'REST API', 'WebSocket', 'Socket.io',
      
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Elasticsearch',
      'Cassandra', 'DynamoDB', 'Oracle', 'SQL Server', 'Neo4j', 'CouchDB',
      
      // DevOps & Cloud
      'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
      'AWS', 'Azure', 'Google Cloud', 'Heroku', 'DigitalOcean', 'Terraform',
      'Ansible', 'CloudFormation', 'Prometheus', 'Grafana', 'ELK Stack',
      
      // Tools & Platforms
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Asana', 'Monday.com',
      'Slack', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Postman',
      
      // Data & Analytics
      'Machine Learning', 'Data Analysis', 'Tableau', 'Power BI', 'Looker',
      'Google Analytics', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
      'NumPy', 'Spark', 'Hadoop', 'ETL', 'Data Visualization',
      
      // Soft Skills
      'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Agile',
      'Scrum', 'Kanban', 'Project Management', 'Critical Thinking',
      'Adaptability', 'Time Management', 'Negotiation', 'Public Speaking'
    ];

    // Filter skills based on query
    const matchedSkills = allSkills.filter(skill => 
      skill.toLowerCase().includes(queryLower)
    ).slice(0, 15); // Limit to 15 results

    return res.status(200).json({
      success: true,
      data: {
        results: matchedSkills,
        query: query,
        count: matchedSkills.length
      },
      message: "Skills search completed successfully",
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
Router.use(handleErrors);

module.exports = Router;
