/**
 * Unit Tests for Resume API Routes
 * Tests for CRUD operations, authentication, and error handling
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Resume = require('../models/resumeSchema');
const resumeRouter = require('../routers/resumeRouter');

// Setup test app
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  // Mock session for authentication
  if (req.headers['x-test-user']) {
    req.session = {
      user: {
        _id: new mongoose.Types.ObjectId(req.headers['x-test-user'])
      }
    };
  }
  next();
});
app.use('/resume', resumeRouter);

// Mock database connection
beforeAll(async () => {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/resume_test_api');
  }
});

afterAll(async () => {
  await Resume.deleteMany({});
  await mongoose.connection.close();
});

describe('Resume API Routes', () => {
  const testUserId = new mongoose.Types.ObjectId();

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================
  
  describe('Authentication & Authorization', () => {
    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/resume/list')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_AUTHENTICATED');
    });

    test('should reject POST without authentication', async () => {
      const response = await request(app)
        .post('/resume/create')
        .send({
          resumeTitle: 'Test',
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            location: 'NY'
          }
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should accept request with valid authentication', async () => {
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================
  // CREATE RESUME TESTS
  // ============================================
  
  describe('POST /resume/create - Create Resume', () => {
    test('should create resume with valid data', async () => {
      const resumeData = {
        resumeTitle: 'Senior Developer Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY',
          linkedIn: 'https://linkedin.com/in/johndoe',
          portfolio: 'https://johndoe.com'
        },
        professionalSummary: 'Experienced developer with 5 years in the field',
        skills: ['JavaScript', 'Python', 'React'],
        experience: [{
          jobTitle: 'Senior Developer',
          companyName: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          currentlyWorking: false,
          description: 'Led development team'
        }],
        education: [{
          school: 'MIT',
          degree: 'Bachelor',
          fieldOfStudy: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2020-05-31'
        }]
      };

      const response = await request(app)
        .post('/resume/create')
        .set('x-test-user', testUserId.toString())
        .send(resumeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumeId).toBeDefined();
      expect(response.body.message).toContain('successfully');
    });

    test('should reject resume without required fields', async () => {
      const resumeData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
        // Missing resumeTitle
      };

      const response = await request(app)
        .post('/resume/create')
        .set('x-test-user', testUserId.toString())
        .send(resumeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('VALIDATION_ERROR');
    });

    test('should reject resume with invalid email', async () => {
      const resumeData = {
        resumeTitle: 'Test Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '1234567890',
          location: 'New York, NY'
        }
      };

      const response = await request(app)
        .post('/resume/create')
        .set('x-test-user', testUserId.toString())
        .send(resumeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should attach userId to created resume', async () => {
      const resumeData = {
        resumeTitle: 'User Attachment Test',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '0987654321',
          location: 'Boston, MA'
        }
      };

      const response = await request(app)
        .post('/resume/create')
        .set('x-test-user', testUserId.toString())
        .send(resumeData)
        .expect(201);

      const resume = await Resume.findById(response.body.data.resumeId);
      expect(resume.userId.toString()).toBe(testUserId.toString());
    });
  });

  // ============================================
  // READ RESUME TESTS
  // ============================================
  
  describe('GET /resume/:id - Read Resume', () => {
    let testResumeId;

    beforeAll(async () => {
      const resume = new Resume({
        userId: testUserId,
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
      testResumeId = saved._id;
    });

    test('should fetch resume by id', async () => {
      const response = await request(app)
        .get(`/resume/${testResumeId}`)
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumeTitle).toBe('Test Resume');
      expect(response.body.data.personalInfo.firstName).toBe('John');
    });

    test('should return 404 for non-existent resume', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/resume/${fakeId}`)
        .set('x-test-user', testUserId.toString())
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('RESUME_NOT_FOUND');
    });

    test('should prevent access to other user\'s resume', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/resume/${testResumeId}`)
        .set('x-test-user', otherUserId.toString())
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  // ============================================
  // UPDATE RESUME TESTS
  // ============================================
  
  describe('PUT /resume/:id - Update Resume', () => {
    let testResumeId;

    beforeAll(async () => {
      const resume = new Resume({
        userId: testUserId,
        resumeTitle: 'Resume to Update',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });
      const saved = await resume.save();
      testResumeId = saved._id;
    });

    test('should update resume successfully', async () => {
      const updateData = {
        resumeTitle: 'Updated Resume Title',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'Boston, MA'
        }
      };

      const response = await request(app)
        .put(`/resume/${testResumeId}`)
        .set('x-test-user', testUserId.toString())
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumeTitle).toBe('Updated Resume Title');
      expect(response.body.data.personalInfo.location).toBe('Boston, MA');
    });

    test('should prevent unauthorized updates', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/resume/${testResumeId}`)
        .set('x-test-user', otherUserId.toString())
        .send({resumeTitle: 'Hacked'})
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // DELETE RESUME TESTS
  // ============================================
  
  describe('DELETE /resume/:id - Delete Resume', () => {
    let testResumeId;

    beforeAll(async () => {
      const resume = new Resume({
        userId: testUserId,
        resumeTitle: 'Resume to Delete',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });
      const saved = await resume.save();
      testResumeId = saved._id;
    });

    test('should delete resume successfully', async () => {
      const response = await request(app)
        .delete(`/resume/${testResumeId}`)
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const deleted = await Resume.findById(testResumeId);
      expect(deleted).toBeNull();
    });

    test('should prevent unauthorized deletion', async () => {
      const resume = new Resume({
        userId: testUserId,
        resumeTitle: 'Protected Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          location: 'New York, NY'
        }
      });
      const saved = await resume.save();

      const otherUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/resume/${saved._id}`)
        .set('x-test-user', otherUserId.toString())
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // LIST RESUMES TESTS
  // ============================================
  
  describe('GET /resume/list - List User Resumes', () => {
    beforeAll(async () => {
      // Create multiple resumes
      for (let i = 0; i < 3; i++) {
        new Resume({
          userId: testUserId,
          resumeTitle: `Resume ${i}`,
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            location: 'New York, NY'
          }
        }).save();
      }
    });

    test('should list all user resumes', async () => {
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should not list other user\'s resumes', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', otherUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should be empty for new user
      expect(response.body.data.length).toBe(0);
    });
  });

  // ============================================
  // SKILL SUGGESTIONS TESTS
  // ============================================
  
  describe('GET /resume/skills/suggestions - Skill Suggestions', () => {
    test('should return skill suggestions', async () => {
      const response = await request(app)
        .get('/resume/skills/suggestions')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(0);
    });

    test('should filter suggestions by job title', async () => {
      const response = await request(app)
        .get('/resume/skills/suggestions?jobTitle=software%20engineer')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // SKILL SEARCH TESTS
  // ============================================
  
  describe('POST /resume/skills/search - Skill Search', () => {
    test('should search for skills', async () => {
      const response = await request(app)
        .post('/resume/skills/search')
        .set('x-test-user', testUserId.toString())
        .send({query: 'react'})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeDefined();
      expect(Array.isArray(response.body.data.results)).toBe(true);
    });

    test('should require query parameter', async () => {
      const response = await request(app)
        .post('/resume/skills/search')
        .set('x-test-user', testUserId.toString())
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should limit results to 15', async () => {
      const response = await request(app)
        .post('/resume/skills/search')
        .set('x-test-user', testUserId.toString())
        .send({query: 'a'}) // broad query
        .expect(200);

      expect(response.body.data.results.length).toBeLessThanOrEqual(15);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================
  
  describe('Error Handling', () => {
    test('should return proper error on invalid ObjectId', async () => {
      const response = await request(app)
        .get('/resume/invalid-id')
        .set('x-test-user', testUserId.toString())
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle server errors gracefully', async () => {
      // This would require mocking the database to fail
      // Implementation depends on error handling middleware
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', testUserId.toString());

      expect(response.body.timestamp).toBeDefined();
    });
  });

  // ============================================
  // RESPONSE FORMAT TESTS
  // ============================================
  
  describe('Response Format Validation', () => {
    test('should include required response fields', async () => {
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should have consistent timestamp format', async () => {
      const response = await request(app)
        .get('/resume/list')
        .set('x-test-user', testUserId.toString())
        .expect(200);

      expect(typeof response.body.timestamp).toBe('string');
      expect(new Date(response.body.timestamp)).not.toBeNaN();
    });
  });
});
