"""
Unit Tests for ATS Analyzer
Tests for formatting, keyword, and structure analysis accuracy
"""

import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from ats_analyzer import ATSAnalyzer


class TestATSAnalyzer(unittest.TestCase):
    """Test suite for ATS Analyzer"""

    def setUp(self):
        """Set up test fixtures"""
        self.analyzer = ATSAnalyzer()

    # ============================================
    # FORMATTING SCORE TESTS
    # ============================================

    def test_formatting_score_perfect_resume(self):
        """Test formatting score on well-formatted resume"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced software engineer',
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_formatting_score(resume)
        self.assertGreater(score, 15)  # Should be good
        self.assertLessEqual(score, 25)  # Max is 25

    def test_formatting_score_penalizes_missing_email(self):
        """Test formatting score without email"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': '',  # Missing email
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced software engineer',
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_formatting_score(resume)
        self.assertLess(score, 15)

    def test_formatting_score_penalizes_missing_phone(self):
        """Test formatting score without phone"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '',  # Missing phone
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced software engineer',
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_formatting_score(resume)
        self.assertLess(score, 15)

    def test_formatting_score_handles_special_characters(self):
        """Test formatting with special characters in text"""
        resume = {
            'personalInfo': {
                'firstName': 'John-Paul',
                'lastName': 'O\'Donnell',
                'email': 'john.paul@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced developer (10+ years)',
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_formatting_score(resume)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 25)

    # ============================================
    # KEYWORD SCORE TESTS
    # ============================================

    def test_keyword_score_with_technical_skills(self):
        """Test keyword detection for technical skills"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Python and JavaScript developer',
            'experience': [],
            'education': [],
            'skills': ['Python', 'JavaScript', 'React', 'MongoDB']
        }

        score = self.analyzer.get_keyword_score(resume)
        self.assertGreater(score, 20)  # Should have good keyword score
        self.assertLessEqual(score, 40)  # Max is 40

    def test_keyword_score_no_skills(self):
        """Test keyword score with no skills"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'A professional person',
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_keyword_score(resume)
        self.assertLess(score, 10)

    def test_keyword_score_detects_frameworks(self):
        """Test detection of popular frameworks"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Worked with Django and React',
            'experience': [{
                'jobTitle': 'Developer',
                'companyName': 'Tech Co',
                'description': 'Built Angular applications'
            }],
            'education': [],
            'skills': ['Django', 'React', 'Angular']
        }

        score = self.analyzer.get_keyword_score(resume)
        self.assertGreater(score, 15)

    def test_keyword_score_detects_databases(self):
        """Test detection of database keywords"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Database expert',
            'experience': [],
            'education': [],
            'skills': ['MySQL', 'PostgreSQL', 'MongoDB']
        }

        score = self.analyzer.get_keyword_score(resume)
        self.assertGreater(score, 15)

    # ============================================
    # STRUCTURE SCORE TESTS
    # ============================================

    def test_structure_score_complete_resume(self):
        """Test structure score on complete resume"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced software engineer',
            'experience': [{
                'jobTitle': 'Senior Developer',
                'companyName': 'Tech Co',
                'description': 'Led development team'
            }],
            'education': [{
                'school': 'MIT',
                'degree': 'Bachelor',
                'fieldOfStudy': 'Computer Science'
            }],
            'skills': ['Python', 'JavaScript']
        }

        score = self.analyzer.get_structure_score(resume)
        self.assertGreater(score, 25)  # Should be good
        self.assertLessEqual(score, 35)  # Max is 35

    def test_structure_score_missing_education(self):
        """Test structure score without education"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced software engineer',
            'experience': [{
                'jobTitle': 'Developer',
                'companyName': 'Tech Co'
            }],
            'education': [],  # Missing
            'skills': []
        }

        score = self.analyzer.get_structure_score(resume)
        self.assertLess(score, 20)

    def test_structure_score_missing_experience(self):
        """Test structure score without experience"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Entry level developer',
            'experience': [],  # Missing
            'education': [{
                'school': 'MIT',
                'degree': 'Bachelor',
                'fieldOfStudy': 'Computer Science'
            }],
            'skills': []
        }

        score = self.analyzer.get_structure_score(resume)
        self.assertGreater(score, 10)  # Should still have some points

    def test_structure_score_missing_summary(self):
        """Test structure score without professional summary"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': '',  # Missing
            'experience': [],
            'education': [],
            'skills': []
        }

        score = self.analyzer.get_structure_score(resume)
        self.assertLess(score, 15)

    # ============================================
    # OVERALL ATS SCORE TESTS
    # ============================================

    def test_overall_ats_score_calculation(self):
        """Test overall ATS score calculation"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Python developer with 5 years experience',
            'experience': [{
                'jobTitle': 'Senior Developer',
                'companyName': 'Tech Co',
                'description': 'Developed Python applications'
            }],
            'education': [{
                'school': 'MIT',
                'degree': 'Bachelor',
                'fieldOfStudy': 'Computer Science'
            }],
            'skills': ['Python', 'JavaScript', 'React']
        }

        analysis = self.analyzer.analyze_resume(resume)
        
        self.assertIn('ats_score', analysis)
        self.assertIn('formatting_score', analysis)
        self.assertIn('keyword_score', analysis)
        self.assertIn('structure_score', analysis)
        self.assertEqual(
            analysis['ats_score'],
            analysis['formatting_score'] +
            analysis['keyword_score'] +
            analysis['structure_score']
        )
        self.assertGreaterEqual(analysis['ats_score'], 0)
        self.assertLessEqual(analysis['ats_score'], 100)

    def test_ats_score_range(self):
        """Test that ATS score stays within 0-100 range"""
        resumes = [
            {  # Minimal resume
                'personalInfo': {
                    'firstName': 'John',
                    'lastName': 'Doe',
                    'email': 'john@example.com',
                    'phone': '1234567890',
                    'location': 'NY'
                },
                'professionalSummary': '',
                'experience': [],
                'education': [],
                'skills': []
            },
            {  # Complete resume
                'personalInfo': {
                    'firstName': 'Jane',
                    'lastName': 'Smith',
                    'email': 'jane@example.com',
                    'phone': '+1-234-567-8900',
                    'location': 'Boston, MA'
                },
                'professionalSummary': 'Experienced Python and JavaScript developer',
                'experience': [{
                    'jobTitle': 'Lead Developer',
                    'companyName': 'Big Tech Corp',
                    'description': 'Led team developing cloud applications'
                }],
                'education': [{
                    'school': 'Harvard',
                    'degree': 'Master',
                    'fieldOfStudy': 'Computer Science'
                }],
                'skills': ['Python', 'JavaScript', 'React', 'Django', 'AWS']
            }
        ]

        for resume in resumes:
            analysis = self.analyzer.analyze_resume(resume)
            self.assertGreaterEqual(analysis['ats_score'], 0)
            self.assertLessEqual(analysis['ats_score'], 100)

    # ============================================
    # SUGGESTIONS GENERATION TESTS
    # ============================================

    def test_suggestions_generated(self):
        """Test that suggestions are generated"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': '',
            'experience': [],
            'education': [],
            'skills': []
        }

        analysis = self.analyzer.analyze_resume(resume)
        self.assertIn('suggestions', analysis)
        self.assertIsInstance(analysis['suggestions'], list)

    def test_suggestions_for_low_score(self):
        """Test that more suggestions are given for low scores"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': '',
            'experience': [],
            'education': [],
            'skills': []
        }

        analysis = self.analyzer.analyze_resume(resume)
        # Low scoring resume should have suggestions
        if analysis['ats_score'] < 50:
            self.assertGreater(len(analysis['suggestions']), 0)

    def test_suggestions_for_high_score(self):
        """Test that few suggestions are given for high scores"""
        resume = {
            'personalInfo': {
                'firstName': 'Jane',
                'lastName': 'Smith',
                'email': 'jane@example.com',
                'phone': '+1-234-567-8900',
                'location': 'Boston, MA'
            },
            'professionalSummary': 'Experienced Python and JavaScript developer with 10 years',
            'experience': [{
                'jobTitle': 'Lead Developer',
                'companyName': 'Big Tech',
                'description': 'Led development of cloud applications'
            }],
            'education': [{
                'school': 'MIT',
                'degree': 'Master',
                'fieldOfStudy': 'Computer Science'
            }],
            'skills': ['Python', 'JavaScript', 'React', 'Django', 'AWS', 'Docker']
        }

        analysis = self.analyzer.analyze_resume(resume)
        # High scoring should have fewer suggestions
        if analysis['ats_score'] > 80:
            self.assertLess(len(analysis['suggestions']), 5)

    # ============================================
    # MISSING KEYWORDS DETECTION
    # ============================================

    def test_missing_keywords_detected(self):
        """Test that missing keywords are identified"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': 'Developer',
            'experience': [],
            'education': [],
            'skills': []  # No technical skills
        }

        analysis = self.analyzer.analyze_resume(resume)
        self.assertIn('missing_keywords', analysis)
        self.assertIsInstance(analysis['missing_keywords'], list)
        # Should have missing keywords since no technical skills
        if analysis['keyword_score'] < 20:
            self.assertGreater(len(analysis['missing_keywords']), 0)

    # ============================================
    # JOB MATCHING TESTS
    # ============================================

    def test_job_matching_with_description(self):
        """Test job description matching"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': 'Python developer',
            'experience': [],
            'education': [],
            'skills': ['Python', 'JavaScript']
        }

        job_description = 'Looking for Python and JavaScript developer with 5 years experience'

        job_match = self.analyzer.analyze_job_description_match(
            resume, job_description
        )

        self.assertIn('matched_keywords', job_match)
        self.assertIn('job_keywords', job_match)
        self.assertIn('match_percentage', job_match)
        self.assertGreaterEqual(job_match['match_percentage'], 0)
        self.assertLessEqual(job_match['match_percentage'], 100)

    def test_job_matching_empty_description(self):
        """Test handling of empty job description"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': '',
            'experience': [],
            'education': [],
            'skills': []
        }

        job_match = self.analyzer.analyze_job_description_match(resume, '')

        self.assertEqual(len(job_match['job_keywords']), 0)
        self.assertEqual(job_match['match_percentage'], 0)

    def test_job_matching_perfect_match(self):
        """Test perfect job description match"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'location': 'NY'
            },
            'professionalSummary': 'Python and JavaScript developer',
            'experience': [],
            'education': [],
            'skills': ['Python', 'JavaScript', 'React']
        }

        job_description = 'Python JavaScript React developer needed'

        job_match = self.analyzer.analyze_job_description_match(
            resume, job_description
        )

        # Should have high match percentage
        self.assertGreater(job_match['match_percentage'], 50)

    # ============================================
    # EDGE CASES
    # ============================================

    def test_empty_resume(self):
        """Test analysis of minimal resume"""
        resume = {
            'personalInfo': {
                'firstName': '',
                'lastName': '',
                'email': '',
                'phone': '',
                'location': ''
            },
            'professionalSummary': '',
            'experience': [],
            'education': [],
            'skills': []
        }

        analysis = self.analyzer.analyze_resume(resume)
        self.assertGreaterEqual(analysis['ats_score'], 0)
        self.assertLessEqual(analysis['ats_score'], 100)

    def test_very_long_resume(self):
        """Test analysis of resume with lots of content"""
        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'a' * 500,  # Long summary
            'experience': [
                {
                    'jobTitle': f'Job {i}',
                    'companyName': f'Company {i}',
                    'description': 'a' * 200
                }
                for i in range(15)
            ],
            'education': [
                {
                    'school': f'School {i}',
                    'degree': 'Bachelor',
                    'fieldOfStudy': 'Computer Science'
                }
                for i in range(10)
            ],
            'skills': [f'Skill{i}' for i in range(30)]
        }

        analysis = self.analyzer.analyze_resume(resume)
        self.assertGreaterEqual(analysis['ats_score'], 0)
        self.assertLessEqual(analysis['ats_score'], 100)

    def test_special_characters_in_resume(self):
        """Test handling of special characters"""
        resume = {
            'personalInfo': {
                'firstName': 'Jean-Paul',
                'lastName': "O'Donnell-Smith",
                'email': 'jean-paul.odonnell@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York-Manhattan, NY'
            },
            'professionalSummary': 'C++ developer (10+ years) & Python expert',
            'experience': [{
                'jobTitle': 'Senior Developer (Tech Lead)',
                'companyName': 'Tech & Innovation Corp.',
                'description': 'Led C++ & Python development'
            }],
            'education': [{
                'school': 'MIT (Massachusetts Institute of Technology)',
                'degree': 'Bachelor',
                'fieldOfStudy': 'Computer Science & Engineering'
            }],
            'skills': ['C++', 'C#', 'Python', 'Node.js']
        }

        analysis = self.analyzer.analyze_resume(resume)
        self.assertGreaterEqual(analysis['ats_score'], 0)
        self.assertLessEqual(analysis['ats_score'], 100)


class TestATSAnalyzerPerformance(unittest.TestCase):
    """Performance tests for ATS Analyzer"""

    def setUp(self):
        """Set up test fixtures"""
        self.analyzer = ATSAnalyzer()

    def test_analysis_completes_in_reasonable_time(self):
        """Test that analysis completes quickly"""
        import time

        resume = {
            'personalInfo': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'phone': '+1-234-567-8900',
                'location': 'New York, NY'
            },
            'professionalSummary': 'Experienced Python developer',
            'experience': [
                {
                    'jobTitle': 'Developer',
                    'companyName': 'Tech Co',
                    'description': 'Developed applications'
                }
                for _ in range(10)
            ],
            'education': [{
                'school': 'MIT',
                'degree': 'Bachelor',
                'fieldOfStudy': 'Computer Science'
            }],
            'skills': ['Python', 'JavaScript']
        }

        start = time.time()
        analysis = self.analyzer.analyze_resume(resume)
        duration = time.time() - start

        # Should complete in less than 1 second
        self.assertLess(duration, 1.0)


if __name__ == '__main__':
    unittest.main()
