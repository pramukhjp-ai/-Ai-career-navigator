const mongoose = require('mongoose');

const schema = mongoose.Schema;
const userSchema = new schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    number:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase: true,
        trim: true
    },
    password:{
        type:String,
        required:true
    },
    
    // Resume relationship - reference multiple resumes
    resumes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Resume',
        default: []
    },
    
    // Default resume for quick access
    defaultResume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
    },
    
    // Track resume creation activity
    totalResumesCreated: {
        type: Number,
        default: 0
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'users'
});

// Index on email for faster lookups
userSchema.index({ email: 1 });

// Middleware to auto-update updatedAt
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Instance method to add a resume to user's resumes array
userSchema.methods.addResume = function(resumeId) {
    if (!this.resumes.includes(resumeId)) {
        this.resumes.push(resumeId);
    }
    this.totalResumesCreated += 1;
    return this.save();
};

// Instance method to remove a resume from user's resumes array
userSchema.methods.removeResume = function(resumeId) {
    this.resumes = this.resumes.filter(id => id.toString() !== resumeId.toString());
    if (this.defaultResume && this.defaultResume.toString() === resumeId.toString()) {
        this.defaultResume = null;
    }
    return this.save();
};

// Instance method to set default resume
userSchema.methods.setDefaultResume = function(resumeId) {
    if (this.resumes.some(id => id.toString() === resumeId.toString())) {
        this.defaultResume = resumeId;
        return this.save();
    }
    throw new Error('Resume not found in user\'s resumes');
};

// Instance method to get user with populated resumes
userSchema.methods.populateResumes = function() {
    return this.populate('resumes');
};

module.exports = mongoose.model('Registeruser', userSchema);