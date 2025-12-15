/**
 * Unit Tests for Resume Schema
 * Tests for validation, required fields, and data integrity
 */

const mongoose = require('mongoose');
const Resume = require('../models/resumeSchema');

// Mock MongoDB connection
beforeAll(async () => {
  // Connection handled by test environment
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/resume_test');
  }
});

afterAll(async () => {
  // Clean up database
  await Resume.deleteMany({});
  await mongoose.connection.close();
});

describe('Resume Schema Tests', () => {
  
  // ============================================
  // PERSONAL INFO VALIDATION
  // ============================================
  
  describe('Personal Information Validation', () => {
    test('should create resume with valid personal info', async () => {
      const validResume = {
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY',
          linkedIn: 'https://linkedin.com/in/johndoe',
          portfolio: 'https://johndoe.com'
        }
      };

      const resume = new Resume(validResume);
      await expect(resume.save()).resolves.toBeDefined();
      expect(resume._id).toBeDefined();
    });

    test('should require firstName in personal info', async () => {
      const invalidResume = {
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      };

      const resume = new Resume(invalidResume);
      await expect(resume.save()).rejects.toThrow();
    });

    test('should require lastName in personal info', async () => {
      const invalidResume = {
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      };

      const resume = new Resume(invalidResume);
      await expect(resume.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidResume = {
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '1234567890',
          location: 'New York, NY'
        }
      };

      const resume = new Resume(invalidResume);
      await expect(resume.save()).rejects.toThrow();
    });

    test('should accept valid phone formats', async () => {
      const validPhones = [
        '1234567890',
        '+1 (123) 456-7890',
        '123-456-7890'
      ];

      for (const phone of validPhones) {
        const resume = new Resume({
          userId: new mongoose.Types.ObjectId(),
          resumeTitle: `Resume with phone ${phone}`,
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: phone,
            location: 'New York, NY'
          }
        });

        await expect(resume.save()).resolves.toBeDefined();
      }
    });
  });

  // ============================================
  // PROFESSIONAL SUMMARY VALIDATION
  // ============================================
  
  describe('Professional Summary Validation', () => {
    test('should accept optional professional summary', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
        // professionalSummary is optional
      });

      await expect(resume.save()).resolves.toBeDefined();
    });

    test('should enforce max length on professional summary', async () => {
      const longSummary = 'a'.repeat(1001); // Exceeds max of 1000

      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        professionalSummary: longSummary
      });

      await expect(resume.save()).rejects.toThrow();
    });
  });

  // ============================================
  // SKILLS VALIDATION
  // ============================================
  
  describe('Skills Validation', () => {
    test('should accept array of skills', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        skills: ['JavaScript', 'Python', 'React', 'MongoDB']
      });

      await expect(resume.save()).resolves.toBeDefined();
      const saved = await resume.save();
      expect(saved.skills).toEqual(['JavaScript', 'Python', 'React', 'MongoDB']);
    });

    test('should enforce max 50 skills', async () => {
      const manySkills = Array.from({length: 51}, (_, i) => `Skill${i}`);

      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        skills: manySkills
      });

      await expect(resume.save()).rejects.toThrow();
    });

    test('should allow empty skills array', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        skills: []
      });

      await expect(resume.save()).resolves.toBeDefined();
    });
  });

  // ============================================
  // EXPERIENCE VALIDATION
  // ============================================
  
  describe('Experience Section Validation', () => {
    test('should accept valid experience entries', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        experience: [{
          jobTitle: 'Senior Developer',
          companyName: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          currentlyWorking: false,
          description: 'Led development of key features'
        }]
      });

      await expect(resume.save()).resolves.toBeDefined();
    });

    test('should validate experience date format', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        experience: [{
          jobTitle: 'Senior Developer',
          companyName: 'Tech Corp',
          startDate: 'invalid-date',
          endDate: '2023-12-31',
          currentlyWorking: false
        }]
      });

      await expect(resume.save()).rejects.toThrow();
    });

    test('should enforce max 20 experience entries', async () => {
      const manyExperiences = Array.from({length: 21}, (_, i) => ({
        jobTitle: `Job${i}`,
        companyName: `Company${i}`,
        startDate: '2020-01-01',
        endDate: '2021-12-31',
        currentlyWorking: false
      }));

      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        experience: manyExperiences
      });

      await expect(resume.save()).rejects.toThrow();
    });
  });

  // ============================================
  // EDUCATION VALIDATION
  // ============================================
  
  describe('Education Section Validation', () => {
    test('should accept valid education entries', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        education: [{
          school: 'MIT',
          degree: 'Bachelor',
          fieldOfStudy: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2020-05-31',
          grade: 'A'
        }]
      });

      await expect(resume.save()).resolves.toBeDefined();
    });

    test('should enforce max 10 education entries', async () => {
      const manyEducations = Array.from({length: 11}, (_, i) => ({
        school: `School${i}`,
        degree: 'Bachelor',
        fieldOfStudy: 'Computer Science',
        startDate: '2016-09-01',
        endDate: '2020-05-31'
      }));

      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        education: manyEducations
      });

      await expect(resume.save()).rejects.toThrow();
    });
  });

  // ============================================
  // ATS FIELDS VALIDATION
  // ============================================
  
  describe('ATS Fields Validation', () => {
    test('should initialize with default ATS scores', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      await resume.save();
      expect(resume.atsScore).toBeDefined();
      expect(resume.formattingScore).toBeDefined();
      expect(resume.keywordScore).toBeDefined();
      expect(resume.structureScore).toBeDefined();
    });

    test('should accept job description', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        jobDescription: 'Looking for experienced developer with Python skills'
      });

      await expect(resume.save()).resolves.toBeDefined();
      const saved = await resume.save();
      expect(saved.jobDescription).toBe('Looking for experienced developer with Python skills');
    });

    test('should enforce max length on job description', async () => {
      const longDesc = 'a'.repeat(2001); // Exceeds max of 2000

      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        },
        jobDescription: longDesc
      });

      await expect(resume.save()).rejects.toThrow();
    });
  });

  // ============================================
  // TIMESTAMPS VALIDATION
  // ============================================
  
  describe('Timestamps Validation', () => {
    test('should set createdAt and updatedAt automatically', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      const saved = await resume.save();
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
      expect(saved.createdAt).toBeInstanceOf(Date);
      expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on modification', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      const saved = await resume.save();
      const originalUpdatedAt = saved.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      saved.resumeTitle = 'Updated Resume';
      const updated = await saved.save();

      expect(updated.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });
  });

  // ============================================
  // INDEXES VALIDATION
  // ============================================
  
  describe('Indexes Validation', () => {
    test('should have index on userId', async () => {
      const indexes = await Resume.collection.getIndexes();
      const userIdIndex = Object.values(indexes).some(index => 
        index.key && index.key.userId === 1
      );
      expect(userIdIndex).toBe(true);
    });

    test('should have compound index on userId and createdAt', async () => {
      const indexes = await Resume.collection.getIndexes();
      const compoundIndex = Object.values(indexes).some(index => 
        index.key && index.key.userId === 1 && index.key.createdAt === -1
      );
      expect(compoundIndex).toBe(true);
    });

    test('should have index on atsScore', async () => {
      const indexes = await Resume.collection.getIndexes();
      const atsIndex = Object.values(indexes).some(index => 
        index.key && index.key.atsScore === 1
      );
      expect(atsIndex).toBe(true);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  
  describe('Edge Cases and Special Scenarios', () => {
    test('should handle resume with all optional fields empty', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Minimal Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      await expect(resume.save()).resolves.toBeDefined();
    });

    test('should handle resume title with special characters', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: 'Resume 2024 - Senior Developer (Python/JS)',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      await expect(resume.save()).resolves.toBeDefined();
    });

    test('should trim whitespace from string fields', async () => {
      const resume = new Resume({
        userId: new mongoose.Types.ObjectId(),
        resumeTitle: '  Resume with spaces  ',
        personalInfo: {
          firstName: '  John  ',
          lastName: '  Doe  ',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });

      const saved = await resume.save();
      expect(saved.resumeTitle).toBe('Resume with spaces');
      expect(saved.personalInfo.firstName).toBe('John');
    });
  });
});
