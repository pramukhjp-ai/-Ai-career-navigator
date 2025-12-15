# ATS Resume Builder - API Documentation

**Version:** 1.0.0  
**Last Updated:** December 13, 2025  
**Base URL:** `http://localhost:8080`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Resume Endpoints](#resume-endpoints)
4. [Skill Endpoints](#skill-endpoints)
5. [ATS Analysis Endpoints](#ats-analysis-endpoints)
6. [Error Handling](#error-handling)
7. [Response Format](#response-format)
8. [Rate Limiting](#rate-limiting)
9. [Examples](#examples)

---

## Overview

The ATS Resume Builder API provides endpoints for creating, managing, and analyzing resumes with ATS (Applicant Tracking System) compatibility scoring. The API uses REST principles and returns JSON responses.

**Key Features:**
- Resume CRUD operations with user authentication
- Real-time ATS compatibility scoring
- Skill suggestions and autocomplete
- Job description matching
- PDF export capability

---

## Authentication

All endpoints (except public health checks) require user authentication via session.

### Authentication Method: Session-Based

Requests must include valid session authentication. Users are authenticated on login through the main application.

**Headers:**
```
Cookie: itnav.sid=<session_id>
```

**Error Response (Unauthorized):**
```json
{
  "success": false,
  "data": null,
  "message": "Unauthorized: Please login first",
  "error": "NOT_AUTHENTICATED",
  "timestamp": "2025-12-13T10:30:00Z"
}
```

---

## Resume Endpoints

### 1. Create Resume

**Endpoint:** `POST /resume/create`

**Description:** Create a new resume for the authenticated user

**Request Body:**
```json
{
  "resumeTitle": "Senior Developer Resume 2025",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "New York, NY",
    "linkedIn": "https://linkedin.com/in/johndoe",
    "portfolio": "https://johndoe.com"
  },
  "professionalSummary": "Experienced full-stack developer with 8 years in the industry",
  "experience": [
    {
      "jobTitle": "Senior Developer",
      "companyName": "Tech Corp",
      "startDate": "2020-01-15",
      "endDate": "2023-12-31",
      "currentlyWorking": false,
      "description": "Led development of microservices architecture"
    }
  ],
  "education": [
    {
      "school": "MIT",
      "degree": "Bachelor",
      "fieldOfStudy": "Computer Science",
      "startDate": "2012-09-01",
      "endDate": "2016-05-31",
      "grade": "A"
    }
  ],
  "skills": [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "MongoDB",
    "AWS"
  ],
  "certifications": [
    {
      "name": "AWS Solutions Architect",
      "issuer": "Amazon Web Services",
      "issueDate": "2023-06-15"
    }
  ],
  "projects": [
    {
      "projectName": "E-Commerce Platform",
      "description": "Built scalable e-commerce solution",
      "technologies": "React, Node.js, MongoDB"
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiency": "Native"
    },
    {
      "language": "Spanish",
      "proficiency": "Fluent"
    }
  ],
  "jobDescription": "Optional: Paste job description here for keyword matching"
}
```

**Required Fields:**
- `resumeTitle` (string, max 100 chars)
- `personalInfo.firstName` (string)
- `personalInfo.lastName` (string)
- `personalInfo.email` (string, valid email)
- `personalInfo.phone` (string, valid phone)
- `personalInfo.location` (string)

**Optional Fields:**
- `professionalSummary` (string, max 1000 chars)
- `linkedIn` (string, URL)
- `portfolio` (string, URL)
- `experience` (array, max 20 items)
- `education` (array, max 10 items)
- `skills` (array, max 50 items)
- `certifications`, `projects`, `languages` (arrays)
- `jobDescription` (string, max 2000 chars)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "resumeId": "507f1f77bcf86cd799439011"
  },
  "message": "Resume created successfully",
  "error": null,
  "timestamp": "2025-12-13T10:30:00Z"
}
```

**Errors:**
- `400` - Missing required fields or validation error
- `401` - Not authenticated
- `500` - Server error

---

### 2. Read Resume

**Endpoint:** `GET /resume/:id`

**Description:** Retrieve a specific resume by ID

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "resumeTitle": "Senior Developer Resume 2025",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "location": "New York, NY"
    },
    "atsScore": 85,
    "formattingScore": 24,
    "keywordScore": 36,
    "structureScore": 25,
    "createdAt": "2025-12-13T10:30:00Z",
    "updatedAt": "2025-12-13T10:30:00Z"
  },
  "message": "Resume retrieved successfully",
  "error": null,
  "timestamp": "2025-12-13T10:30:00Z"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Unauthorized (trying to access other user's resume)
- `404` - Resume not found
- `400` - Invalid resume ID format

---

### 3. Update Resume

**Endpoint:** `PUT /resume/:id`

**Description:** Update an existing resume

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Request Body:** Same structure as Create Resume (partial update supported)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "resumeTitle": "Updated Resume Title",
    "updatedAt": "2025-12-13T10:35:00Z"
  },
  "message": "Resume updated successfully",
  "error": null,
  "timestamp": "2025-12-13T10:35:00Z"
}
```

**Errors:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Unauthorized
- `404` - Resume not found

---

### 4. Delete Resume

**Endpoint:** `DELETE /resume/:id`

**Description:** Delete a resume

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deletedId": "507f1f77bcf86cd799439011"
  },
  "message": "Resume deleted successfully",
  "error": null,
  "timestamp": "2025-12-13T10:40:00Z"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Unauthorized
- `404` - Resume not found

---

### 5. List Resumes

**Endpoint:** `GET /resume/list`

**Description:** Get all resumes for the authenticated user

**Query Parameters:**
- `sort` (optional): `-createdAt` (default), `atsScore`, `resumeTitle`
- `limit` (optional): 10 (default), max 100

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "resumeTitle": "Senior Developer Resume",
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "atsScore": 85,
      "createdAt": "2025-12-13T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "resumeTitle": "Junior Developer Resume",
      "atsScore": 72,
      "createdAt": "2025-12-12T15:20:00Z"
    }
  ],
  "message": "Resumes retrieved successfully",
  "error": null,
  "timestamp": "2025-12-13T10:45:00Z"
}
```

---

## Skill Endpoints

### 1. Get Skill Suggestions

**Endpoint:** `GET /resume/skills/suggestions`

**Description:** Get recommended skills based on job title or career path

**Query Parameters:**
- `jobTitle` (optional): Filter suggestions by job title (e.g., "software engineer")
- `experience` (optional): Years of experience

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes"
    ],
    "count": 8,
    "categories": [
      "software_engineer",
      "frontend_developer",
      "backend_developer"
    ]
  },
  "message": "Skill suggestions retrieved successfully",
  "error": null,
  "timestamp": "2025-12-13T10:50:00Z"
}
```

---

### 2. Search Skills (Autocomplete)

**Endpoint:** `POST /resume/skills/search`

**Description:** Search for skills with autocomplete functionality

**Request Body:**
```json
{
  "query": "react"
}
```

**Query Requirements:**
- Minimum 2 characters
- Case-insensitive
- Returns up to 15 results

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      "React",
      "React Native",
      "React Router",
      "Redux"
    ],
    "query": "react",
    "count": 4
  },
  "message": "Skills search completed successfully",
  "error": null,
  "timestamp": "2025-12-13T10:55:00Z"
}
```

**Errors:**
- `400` - Missing or empty query parameter
- `401` - Not authenticated

---

## ATS Analysis Endpoints

### 1. Analyze Resume

**Endpoint:** `POST /api/analyze-ats` (Python Flask backend)

**Base URL:** `http://localhost:5000`

**Description:** Analyze resume for ATS compatibility

**Request Body:**
```json
{
  "resume_data": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900"
    },
    "skills": ["Python", "JavaScript", "React"],
    "experience": [
      {
        "jobTitle": "Developer",
        "companyName": "Tech Co"
      }
    ],
    "education": [
      {
        "school": "MIT",
        "degree": "Bachelor"
      }
    ]
  },
  "job_description": "Looking for Python developer with React experience"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ats_score": 85,
    "formatting_score": 24,
    "keyword_score": 36,
    "structure_score": 25,
    "suggestions": [
      "Add more technical skills to your skills section",
      "Include specific metrics and achievements in experience"
    ],
    "missing_keywords": [
      "AWS",
      "Docker",
      "CI/CD"
    ],
    "strengths": [
      "Good formatting and contact information",
      "Multiple years of relevant experience"
    ],
    "job_match": {
      "matched_keywords": ["python", "react", "javascript"],
      "job_keywords": ["python", "react", "javascript", "django", "rest"],
      "match_percentage": 60.0
    }
  },
  "message": "Resume analyzed successfully",
  "error": null,
  "timestamp": "2025-12-13T11:00:00Z"
}
```

**Scoring Breakdown:**
- **Formatting Score (0-25):** Email/phone format, special characters, spacing
- **Keyword Score (0-40):** Technical skills, frameworks, tools mentioned
- **Structure Score (0-35):** Completeness of sections, organization
- **Total ATS Score (0-100):** Sum of above components

---

### 2. Get ATS Score Info

**Endpoint:** `GET /api/ats-score-info` (Python Flask backend)

**Description:** Get information about ATS scoring system

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score_scale": {
      "min": 0,
      "max": 100,
      "breakpoints": {
        "85-100": "Excellent",
        "75-84": "Good",
        "50-74": "Fair",
        "0-49": "Poor"
      }
    },
    "component_scores": {
      "formatting": {
        "max": 25,
        "description": "ATS-friendly formatting, proper spacing, no special characters"
      },
      "keywords": {
        "max": 40,
        "description": "Presence of relevant technical and soft skill keywords"
      },
      "structure": {
        "max": 35,
        "description": "Proper resume structure with required sections and details"
      }
    },
    "important_keywords": {
      "programming_languages": ["Python", "JavaScript", "Java", "C++"],
      "frameworks": ["React", "Angular", "Django", "Flask"],
      "databases": ["MySQL", "PostgreSQL", "MongoDB"]
    }
  },
  "message": "ATS scoring information retrieved successfully",
  "error": null,
  "timestamp": "2025-12-13T11:05:00Z"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Descriptive error message",
  "error": "ERROR_CODE",
  "timestamp": "2025-12-13T11:10:00Z"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| NOT_AUTHENTICATED | 401 | User not logged in |
| UNAUTHORIZED | 403 | User lacks permission |
| RESUME_NOT_FOUND | 404 | Resume doesn't exist |
| VALIDATION_ERROR | 400 | Invalid input data |
| INVALID_ID | 400 | Malformed ObjectId |
| SERVER_ERROR | 500 | Internal server error |
| NOT_FOUND | 404 | Resource not found |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "error": null,
  "timestamp": "2025-12-13T11:15:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2025-12-13T11:20:00Z"
}
```

### Response Headers

```
Content-Type: application/json
Cache-Control: no-cache
```

---

## Rate Limiting

- **Skill Suggestions:** 60 requests/minute
- **Resume Operations:** 30 requests/minute
- **ATS Analysis:** 20 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1702484400
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Create a resume
curl -X POST http://localhost:8080/resume/create \
  -H "Content-Type: application/json" \
  -d '{
    "resumeTitle": "Senior Developer",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "location": "New York, NY"
    },
    "skills": ["Python", "JavaScript", "React"]
  }'

# Response: { "data": { "resumeId": "507f1f77bcf86cd799439011" } }

# 2. Get skill suggestions
curl http://localhost:8080/resume/skills/suggestions?jobTitle=software%20engineer

# 3. Search for skills
curl -X POST http://localhost:8080/resume/skills/search \
  -H "Content-Type: application/json" \
  -d '{"query": "react"}'

# 4. Analyze for ATS compatibility
curl -X POST http://localhost:5000/api/analyze-ats \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {...},
    "job_description": "Looking for Python developer..."
  }'

# 5. Retrieve the resume
curl http://localhost:8080/resume/507f1f77bcf86cd799439011

# 6. Export as PDF
curl http://localhost:8080/resume/507f1f77bcf86cd799439011/download-pdf \
  -o resume.pdf
```

---

## Support

For issues or questions:
- GitHub Issues: [AI-Career-Navigator/issues](https://github.com/pramukhjp-ai/AI-Career-Navigator/issues)
- Email: support@aicareNavigator.com
- Documentation: [GitHub Wiki](https://github.com/pramukhjp-ai/AI-Career-Navigator/wiki)

---

**Last Updated:** December 13, 2025  
**API Version:** 1.0.0
