"""
ATS Resume Analyzer Module
Analyzes resumes for Applicant Tracking System compatibility
"""

import re
import string
from typing import Dict, List, Tuple
from collections import Counter
import json

class ATSAnalyzer:
    """
    Analyzes resumes for ATS (Applicant Tracking System) compatibility
    Provides scoring and suggestions for improvement
    """

    # Common ATS-unfriendly words and characters
    UNFRIENDLY_CHARACTERS = set(['•', '◦', '◆', '★', '✓', '®', '™', '©', '†', '‡', '§'])
    
    # Standard section headers that ATS systems recognize
    STANDARD_HEADERS = {
        'experience', 'work experience', 'professional experience', 'employment',
        'education', 'academic background', 'technical skills', 'skills', 'core competencies',
        'certifications', 'certifications and licenses', 'licenses', 'awards',
        'projects', 'publications', 'languages', 'volunteer', 'volunteer experience',
        'professional summary', 'summary', 'objective', 'professional objective',
        'contact', 'personal info', 'header', 'about'
    }

    # Important technical keywords to look for
    IMPORTANT_KEYWORDS = {
        'programming_languages': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust'],
        'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'fastapi', 'laravel', 'rails'],
        'databases': ['mysql', 'postgresql', 'mongodb', 'dynamodb', 'cassandra', 'redis', 'elasticsearch'],
        'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github'],
        'soft_skills': ['leadership', 'communication', 'teamwork', 'problem-solving', 'project management', 'analytical', 'creative']
    }

    # ATS-unfriendly elements
    ATS_UNFRIENDLY_ELEMENTS = {
        'images': ['image', 'picture', 'photo', 'graphic', 'logo'],
        'tables': ['table', 'tabular', 'layout table'],
        'special_formatting': ['columns', 'text box', 'shape', 'callout', 'smart art'],
        'headers_footers': ['header', 'footer', 'page number', 'page break']
    }

    def __init__(self):
        """Initialize the ATS Analyzer"""
        self.formatting_score = 0
        self.keyword_score = 0
        self.structure_score = 0
        self.ats_score = 0
        self.suggestions = []
        self.missing_keywords = []
        self.strengths = []

    def analyze_resume(self, resume_data: Dict) -> Dict:
        """
        Main method to analyze a complete resume
        
        Args:
            resume_data (Dict): Complete resume object with all sections
            
        Returns:
            Dict: Comprehensive ATS analysis results
        """
        # Reset scores
        self.suggestions = []
        self.missing_keywords = []
        self.strengths = []

        # Get plain text version of resume
        resume_text = self._get_resume_text(resume_data)
        
        # Run all analyses
        self.formatting_score = self.analyze_formatting(resume_text)
        self.keyword_score = self.analyze_keywords(resume_text, resume_data)
        self.structure_score = self.analyze_structure(resume_data)
        
        # Calculate overall ATS score
        self.ats_score = self._calculate_ats_score()
        
        # Generate suggestions
        self._generate_suggestions(resume_data, resume_text)
        
        # Identify strengths
        self._identify_strengths(resume_data)

        return {
            'ats_score': self.ats_score,
            'formatting_score': self.formatting_score,
            'keyword_score': self.keyword_score,
            'structure_score': self.structure_score,
            'suggestions': self.suggestions,
            'missing_keywords': self.missing_keywords,
            'strengths': self.strengths,
            'timestamp': str(__import__('datetime').datetime.now())
        }

    def analyze_formatting(self, resume_text: str) -> int:
        """
        Analyze resume for ATS-unfriendly formatting
        
        Args:
            resume_text (str): Plain text version of resume
            
        Returns:
            int: Formatting score (0-25 points)
        """
        score = 25  # Start with full points
        
        # Check for special characters
        special_char_count = sum(1 for char in resume_text if char in self.UNFRIENDLY_CHARACTERS)
        if special_char_count > 0:
            score -= min(5, special_char_count)
            self.suggestions.append(f"Remove {special_char_count} special characters - ATS systems may not parse them correctly")

        # Check for multiple spaces (indicates formatting)
        multiple_spaces = len(re.findall(r'  {2,}', resume_text))
        if multiple_spaces > 10:
            score -= 5
            self.suggestions.append("Reduce excessive spacing - Use single spaces between words")

        # Check for unusual characters that might indicate images/graphics
        unusual_chars = re.findall(r'[^\x00-\x7F]', resume_text)
        if len(unusual_chars) > 5:
            score -= 5
            self.suggestions.append("Remove non-ASCII characters - ATS systems work best with standard characters")

        # Check for email format validity
        email_matches = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text)
        if not email_matches:
            score -= 3
            self.suggestions.append("Add a valid email address in standard format")

        # Check for phone number validity
        phone_matches = re.findall(r'[\d\-\+\(\) ]{10,}', resume_text)
        if not phone_matches:
            score -= 2
            self.suggestions.append("Add a phone number in a standard format")

        # Ensure score doesn't go below 0
        return max(0, score)

    def analyze_keywords(self, resume_text: str, resume_data: Dict) -> int:
        """
        Analyze keywords and their density in resume
        
        Args:
            resume_text (str): Plain text version of resume
            resume_data (Dict): Complete resume object
            
        Returns:
            int: Keyword score (0-40 points)
        """
        score = 0
        text_lower = resume_text.lower()
        
        # Count keywords found
        keywords_found = 0
        keywords_total = sum(len(v) for v in self.IMPORTANT_KEYWORDS.values())
        
        # Check for programming languages
        for lang in self.IMPORTANT_KEYWORDS['programming_languages']:
            if lang.lower() in text_lower:
                keywords_found += 1
            else:
                self.missing_keywords.append(lang.capitalize())
        
        # Check for frameworks
        for framework in self.IMPORTANT_KEYWORDS['frameworks']:
            if framework.lower() in text_lower:
                keywords_found += 1
            else:
                self.missing_keywords.append(framework.capitalize())
        
        # Check for databases
        for db in self.IMPORTANT_KEYWORDS['databases']:
            if db.lower() in text_lower:
                keywords_found += 1
            else:
                self.missing_keywords.append(db.capitalize())
        
        # Check for cloud/DevOps
        for cloud in self.IMPORTANT_KEYWORDS['cloud']:
            if cloud.lower() in text_lower:
                keywords_found += 1
            else:
                self.missing_keywords.append(cloud.capitalize())
        
        # Check for soft skills
        soft_skills_found = 0
        for skill in self.IMPORTANT_KEYWORDS['soft_skills']:
            if skill.lower() in text_lower:
                soft_skills_found += 1
        
        # Calculate score
        keyword_percentage = (keywords_found / keywords_total * 100) if keywords_total > 0 else 0
        score += int(keyword_percentage * 0.25)  # 25 points for technical keywords
        score += min(15, soft_skills_found * 3)  # 15 points for soft skills
        
        # Bonus points for having custom skills listed
        if 'skills' in resume_data and len(resume_data['skills']) > 0:
            score += min(5, len(resume_data['skills']) // 2)
        
        # Limit missing keywords to top 5
        self.missing_keywords = list(set(self.missing_keywords))[:5]
        
        return min(40, score)

    def analyze_structure(self, resume_data: Dict) -> int:
        """
        Analyze resume structure and organization
        
        Args:
            resume_data (Dict): Complete resume object
            
        Returns:
            int: Structure score (0-35 points)
        """
        score = 0
        
        # Check for required sections
        required_sections = {
            'personalInfo': 8,
            'experience': 10,
            'education': 8,
            'skills': 9
        }
        
        for section, points in required_sections.items():
            if section in resume_data and resume_data[section]:
                score += points
            else:
                self.suggestions.append(f"Add {section.replace('personalInfo', 'Personal Information')} section")
        
        # Check experience details
        if 'experience' in resume_data and resume_data['experience']:
            for exp in resume_data['experience']:
                if not isinstance(exp, dict):
                    continue
                # Check for required experience fields
                missing_fields = []
                required_exp_fields = ['companyName', 'jobTitle', 'startDate', 'description']
                for field in required_exp_fields:
                    if field not in exp or not exp[field]:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.suggestions.append(f"Complete experience entry: add {', '.join(missing_fields)}")
        
        # Check education details
        if 'education' in resume_data and resume_data['education']:
            for edu in resume_data['education']:
                if not isinstance(edu, dict):
                    continue
                missing_fields = []
                required_edu_fields = ['schoolName', 'degree', 'fieldOfStudy', 'endDate']
                for field in required_edu_fields:
                    if field not in edu or not edu[field]:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.suggestions.append(f"Complete education entry: add {', '.join(missing_fields)}")
        
        # Check for proper contact info
        if 'personalInfo' in resume_data:
            pi = resume_data['personalInfo']
            contact_fields = ['firstName', 'lastName', 'email', 'phone', 'location']
            missing_contact = [f for f in contact_fields if f not in pi or not pi[f]]
            if missing_contact:
                self.suggestions.append(f"Add missing contact info: {', '.join(missing_contact)}")
        
        return min(35, score)

    def _calculate_ats_score(self) -> int:
        """
        Calculate overall ATS score from component scores
        
        Returns:
            int: Overall ATS score (0-100)
        """
        total = self.formatting_score + self.keyword_score + self.structure_score
        return min(100, max(0, total))

    def _get_resume_text(self, resume_data: Dict) -> str:
        """
        Convert resume object to plain text for analysis
        
        Args:
            resume_data (Dict): Resume object
            
        Returns:
            str: Plain text version of resume
        """
        text_parts = []
        
        # Personal Info
        if 'personalInfo' in resume_data:
            pi = resume_data['personalInfo']
            text_parts.append(f"{pi.get('firstName', '')} {pi.get('lastName', '')}")
            text_parts.append(pi.get('email', ''))
            text_parts.append(pi.get('phone', ''))
            text_parts.append(pi.get('location', ''))
        
        # Professional Summary
        if 'professionalSummary' in resume_data:
            text_parts.append(resume_data['professionalSummary'])
        
        # Experience
        if 'experience' in resume_data:
            for exp in resume_data['experience']:
                if isinstance(exp, dict):
                    text_parts.append(f"{exp.get('jobTitle', '')} at {exp.get('companyName', '')}")
                    text_parts.append(exp.get('description', ''))
        
        # Education
        if 'education' in resume_data:
            for edu in resume_data['education']:
                if isinstance(edu, dict):
                    text_parts.append(f"{edu.get('degree', '')} in {edu.get('fieldOfStudy', '')}")
                    text_parts.append(edu.get('schoolName', ''))
        
        # Skills
        if 'skills' in resume_data:
            text_parts.append(' '.join(resume_data['skills']))
        
        # Certifications
        if 'certifications' in resume_data:
            for cert in resume_data['certifications']:
                if isinstance(cert, dict):
                    text_parts.append(cert.get('certificationName', ''))
        
        # Projects
        if 'projects' in resume_data:
            for proj in resume_data['projects']:
                if isinstance(proj, dict):
                    text_parts.append(proj.get('projectName', ''))
                    text_parts.append(proj.get('description', ''))
        
        # Languages
        if 'languages' in resume_data:
            for lang in resume_data['languages']:
                if isinstance(lang, dict):
                    text_parts.append(lang.get('language', ''))
        
        return ' '.join(text_parts)

    def _generate_suggestions(self, resume_data: Dict, resume_text: str) -> None:
        """
        Generate specific improvement suggestions based on analysis
        
        Args:
            resume_data (Dict): Resume object
            resume_text (str): Plain text resume
        """
        # Formatting suggestions (already added during analysis)
        
        # Structure suggestions (already added during analysis)
        
        # Content suggestions
        if 'professionalSummary' not in resume_data or not resume_data['professionalSummary']:
            self.suggestions.append("Add a professional summary at the top of your resume")
        
        if not resume_data.get('experience') or len(resume_data['experience']) == 0:
            self.suggestions.append("Add your professional experience")
        
        if not resume_data.get('education') or len(resume_data['education']) == 0:
            self.suggestions.append("Add your educational background")
        
        # Skills suggestions
        if not resume_data.get('skills') or len(resume_data['skills']) < 5:
            self.suggestions.append("Add more skills (recommended: 5-15 relevant skills)")
        
        # Length check
        if len(resume_text) < 200:
            self.suggestions.append("Your resume seems too short - add more details about your experience and achievements")
        elif len(resume_text) > 3000:
            self.suggestions.append("Your resume is quite long - consider removing less relevant information")
        
        # Limit suggestions to top 8
        self.suggestions = self.suggestions[:8]

    def _identify_strengths(self, resume_data: Dict) -> None:
        """
        Identify strengths in the resume
        
        Args:
            resume_data (Dict): Resume object
        """
        if 'personalInfo' in resume_data:
            pi = resume_data['personalInfo']
            if all([pi.get('firstName'), pi.get('lastName'), pi.get('email'), pi.get('phone')]):
                self.strengths.append("Complete contact information provided")
        
        if resume_data.get('experience') and len(resume_data['experience']) >= 2:
            self.strengths.append("Good work experience history")
        
        if resume_data.get('education') and len(resume_data['education']) > 0:
            self.strengths.append("Educational background included")
        
        if resume_data.get('skills') and len(resume_data['skills']) >= 5:
            self.strengths.append("Good number of relevant skills listed")
        
        if resume_data.get('certifications') and len(resume_data['certifications']) > 0:
            self.strengths.append("Professional certifications included")
        
        if resume_data.get('projects') and len(resume_data['projects']) > 0:
            self.strengths.append("Project portfolio included - great for ATS and recruiters")
        
        if resume_data.get('languages') and len(resume_data['languages']) > 0:
            self.strengths.append("Multiple languages listed")
        
        if resume_data.get('professionalSummary') and len(resume_data['professionalSummary']) > 50:
            self.strengths.append("Strong professional summary")

    def get_score_breakdown(self) -> Dict:
        """
        Get detailed score breakdown
        
        Returns:
            Dict: Score breakdown with percentages
        """
        return {
            'overall': self.ats_score,
            'formatting': {
                'score': self.formatting_score,
                'max': 25,
                'percentage': (self.formatting_score / 25 * 100) if self.formatting_score > 0 else 0
            },
            'keywords': {
                'score': self.keyword_score,
                'max': 40,
                'percentage': (self.keyword_score / 40 * 100) if self.keyword_score > 0 else 0
            },
            'structure': {
                'score': self.structure_score,
                'max': 35,
                'percentage': (self.structure_score / 35 * 100) if self.structure_score > 0 else 0
            }
        }

    def analyze_job_match(self, resume_text: str, job_description: str) -> Dict:
        """
        Analyze resume against a specific job description
        
        Args:
            resume_text (str): Plain text version of resume
            job_description (str): Job description text
            
        Returns:
            Dict: Job matching analysis results
        """
        if not job_description or len(job_description.strip()) == 0:
            return {
                'match_score': 0,
                'matched_keywords': [],
                'missing_keywords': [],
                'job_keywords': [],
                'match_percentage': 0
            }
        
        # Convert to lowercase for comparison
        resume_lower = resume_text.lower()
        job_desc_lower = job_description.lower()
        
        # Extract keywords from job description
        job_keywords = self._extract_keywords(job_description)
        
        # Find which job keywords are in the resume
        matched_keywords = []
        for keyword in job_keywords:
            if keyword.lower() in resume_lower:
                matched_keywords.append(keyword)
        
        # Find missing keywords
        missing_keywords = [kw for kw in job_keywords if kw not in matched_keywords]
        
        # Calculate match percentage
        match_percentage = (len(matched_keywords) / len(job_keywords) * 100) if job_keywords else 0
        
        # Determine match score (0-100)
        if match_percentage >= 80:
            match_score = 100
        elif match_percentage >= 60:
            match_score = 80
        elif match_percentage >= 40:
            match_score = 60
        elif match_percentage >= 20:
            match_score = 40
        else:
            match_score = 20
        
        return {
            'match_score': match_score,
            'matched_keywords': matched_keywords[:20],  # Limit to top 20
            'missing_keywords': missing_keywords[:10],  # Show top 10 missing
            'job_keywords': job_keywords[:30],
            'match_percentage': round(match_percentage, 2),
            'keywords_matched_count': len(matched_keywords),
            'keywords_missing_count': len(missing_keywords),
            'total_job_keywords': len(job_keywords)
        }

    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extract meaningful keywords from text
        
        Args:
            text (str): Text to extract keywords from
            
        Returns:
            List[str]: List of extracted keywords
        """
        # Remove special characters and convert to lowercase
        text = re.sub(r'[^a-zA-Z0-9\s\-\+]', '', text)
        
        # Split into words
        words = text.lower().split()
        
        # Filter out common words and short words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'be', 'are', 'was', 'were',
            'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
            'each', 'every', 'both', 'few', 'more', 'some', 'such', 'no', 'not'
        }
        
        keywords = []
        for word in words:
            # Keep words that are:
            # 1. Not stop words
            # 2. At least 4 characters long (unless hyphenated)
            # 3. Not pure numbers
            if (word not in stop_words and 
                (len(word) > 3 or '-' in word) and 
                not word.isdigit()):
                keywords.append(word)
        
        # Return unique keywords, preserving order
        return list(dict.fromkeys(keywords))


# Helper functions for external use

def analyze_ats(resume_data: Dict) -> Dict:
    """
    Convenience function to analyze a resume
    
    Args:
        resume_data (Dict): Resume object
        
    Returns:
        Dict: ATS analysis results
    """
    analyzer = ATSAnalyzer()
    return analyzer.analyze_resume(resume_data)


def get_ats_score_color(score: int) -> str:
    """
    Get color coding for ATS score
    
    Args:
        score (int): ATS score (0-100)
        
    Returns:
        str: Color name (red, yellow, green)
    """
    if score >= 75:
        return 'green'
    elif score >= 50:
        return 'yellow'
    else:
        return 'red'


def get_ats_score_label(score: int) -> str:
    """
    Get label for ATS score
    
    Args:
        score (int): ATS score (0-100)
        
    Returns:
        str: Label (Poor, Fair, Good, Excellent)
    """
    if score >= 85:
        return 'Excellent'
    elif score >= 75:
        return 'Good'
    elif score >= 50:
        return 'Fair'
    else:
        return 'Poor'
