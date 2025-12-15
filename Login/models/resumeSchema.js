const mongoose = require('mongoose');

const schema = mongoose.Schema;

// Define nested schema for personal info
const personalInfoSchema = new schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number'],
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  linkedIn: {
    type: String,
    trim: true,
    default: null
  },
  portfolio: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

// Define nested schema for experience
const experienceSchema = new schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  achievements: {
    type: [String],
    default: []
  }
}, { _id: false });

// Define nested schema for education
const educationSchema = new schema({
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Other'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    default: null
  },
  activities: {
    type: String,
    maxlength: 500,
    default: null
  }
}, { _id: false });

// Define nested schema for certifications
const certificationSchema = new schema({
  certificationName: {
    type: String,
    required: true,
    trim: true
  },
  issuingOrganization: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  credentialId: {
    type: String,
    trim: true,
    default: null
  },
  credentialUrl: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

// Define nested schema for projects
const projectSchema = new schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  technologies: {
    type: [String],
    default: []
  },
  projectUrl: {
    type: String,
    trim: true,
    default: null
  },
  role: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

// Define nested schema for languages
const languageSchema = new schema({
  language: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'],
    default: 'Intermediate'
  }
}, { _id: false });

// Main Resume Schema
const resumeSchema = new schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registeruser',
    required: true,
    index: true
  },
  resumeTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  personalInfo: {
    type: personalInfoSchema,
    required: true
  },
  professionalSummary: {
    type: String,
    required: false,
    maxlength: 500,
    default: ''
  },
  experience: {
    type: [experienceSchema],
    default: []
  },
  education: {
    type: [educationSchema],
    default: []
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 50;
      },
      message: 'Maximum 50 skills allowed'
    }
  },
  certifications: {
    type: [certificationSchema],
    default: []
  },
  projects: {
    type: [projectSchema],
    default: []
  },
  languages: {
    type: [languageSchema],
    default: []
  },
  jobDescription: {
    type: String,
    required: false,
    maxlength: 2000,
    default: null
  },
  
  // ATS & Analysis Fields
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  formattingScore: {
    type: Number,
    min: 0,
    max: 25,
    default: null
  },
  keywordScore: {
    type: Number,
    min: 0,
    max: 40,
    default: null
  },
  structureScore: {
    type: Number,
    min: 0,
    max: 35,
    default: null
  },
  atsSuggestions: {
    type: [String],
    default: []
  },
  missingKeywords: {
    type: [String],
    default: []
  },
  strengths: {
    type: [String],
    default: []
  },
  lastAnalyzed: {
    type: Date,
    default: null
  },
  
  // Version & Management
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  collection: 'resumes'
});

// Compound index for user + createdAt for better query performance
resumeSchema.index({ userId: 1, createdAt: -1 });
// Index for quick lookup by atsScore
resumeSchema.index({ userId: 1, atsScore: -1 });
// Index for finding active resumes
resumeSchema.index({ userId: 1, isActive: 1 });

// Middleware to auto-update updatedAt
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to get formatted resume text for ATS analysis
resumeSchema.methods.getPlainText = function() {
  let text = '';
  
  // Personal Info
  text += `${this.personalInfo.firstName} ${this.personalInfo.lastName}\n`;
  text += `${this.personalInfo.email} | ${this.personalInfo.phone} | ${this.personalInfo.location}\n\n`;
  
  // Professional Summary
  if (this.professionalSummary) {
    text += `PROFESSIONAL SUMMARY\n${this.professionalSummary}\n\n`;
  }
  
  // Experience
  if (this.experience && this.experience.length > 0) {
    text += 'EXPERIENCE\n';
    this.experience.forEach(exp => {
      text += `${exp.jobTitle} at ${exp.companyName}\n${exp.description}\n`;
    });
    text += '\n';
  }
  
  // Education
  if (this.education && this.education.length > 0) {
    text += 'EDUCATION\n';
    this.education.forEach(edu => {
      text += `${edu.degree} in ${edu.fieldOfStudy} from ${edu.schoolName}\n`;
    });
    text += '\n';
  }
  
  // Skills
  if (this.skills && this.skills.length > 0) {
    text += `SKILLS\n${this.skills.join(', ')}\n\n`;
  }
  
  // Certifications
  if (this.certifications && this.certifications.length > 0) {
    text += 'CERTIFICATIONS\n';
    this.certifications.forEach(cert => {
      text += `${cert.certificationName} from ${cert.issuingOrganization}\n`;
    });
    text += '\n';
  }
  
  // Projects
  if (this.projects && this.projects.length > 0) {
    text += 'PROJECTS\n';
    this.projects.forEach(proj => {
      text += `${proj.projectName}: ${proj.description}\n`;
    });
    text += '\n';
  }
  
  // Languages
  if (this.languages && this.languages.length > 0) {
    text += 'LANGUAGES\n';
    this.languages.forEach(lang => {
      text += `${lang.language} (${lang.proficiency})\n`;
    });
  }
  
  return text;
};

// Instance method to get resume summary for list view
resumeSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    userId: this.userId,
    resumeTitle: this.resumeTitle,
    fullName: `${this.personalInfo.firstName} ${this.personalInfo.lastName}`,
    email: this.personalInfo.email,
    atsScore: this.atsScore,
    version: this.version,
    isActive: this.isActive,
    isDefault: this.isDefault,
    lastAnalyzed: this.lastAnalyzed,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find by userId and check authorization
resumeSchema.statics.findByUserIdAndResumeId = function(userId, resumeId) {
  return this.findOne({ _id: resumeId, userId: userId });
};

// Static method to find all active resumes for a user
resumeSchema.statics.findUserResumes = function(userId) {
  return this.find({ userId: userId, isActive: true })
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Resume', resumeSchema);