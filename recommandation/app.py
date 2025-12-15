from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import csv
import json
import os
import pickle
from ats_analyzer import analyze_ats, get_ats_score_color, get_ats_score_label

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from Node.js backend

# Cache directory for trained models
CACHE_DIR = '__pycache__'
MODEL_CACHE = os.path.join(CACHE_DIR, 'model_cache.pkl')
VECTORIZER_CACHE = os.path.join(CACHE_DIR, 'vectorizer_cache.pkl')

# Load your career data from a CSV file (adjust the file path and column names)
print("[APP] Loading career data...")
df = pd.read_csv('skills.csv')

# Load aptitude test questions from a CSV file
def load_aptitude_questions(file_path):
    print(f"[APP] Loading aptitude questions from {file_path}...")
    questions = []
    with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            options = [row[f'option{i}'] for i in range(1, 5)]
            question = {
                'id': row['id'],
                'question': row['question'],
                'options': options,
                'answer': row['answer']
            }
            questions.append(question)
    print(f"[APP] Loaded {len(questions)} questions")
    return questions

print("[APP] Loading aptitude questions...")
aptitude_questions = load_aptitude_questions('aptitude_questions.csv')

# Load or train the model
print("[APP] Initializing ML model...")
if os.path.exists(MODEL_CACHE) and os.path.exists(VECTORIZER_CACHE):
    print("[APP] Loading cached model...")
    with open(VECTORIZER_CACHE, 'rb') as f:
        tfidf_vectorizer = pickle.load(f)
    with open(MODEL_CACHE, 'rb') as f:
        rf_classifier = pickle.load(f)
    print("[APP] Model loaded from cache ✓")
else:
    print("[APP] Training new model (this may take a moment)...")
    # Tokenize the text data using TF-IDF vectorization
    tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X = tfidf_vectorizer.fit_transform(df['Skills'])
    y = df['Recommended Career']

    # Train a Random Forest classifier
    rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_classifier.fit(X, y)
    
    # Cache the model
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(VECTORIZER_CACHE, 'wb') as f:
        pickle.dump(tfidf_vectorizer, f)
    with open(MODEL_CACHE, 'wb') as f:
        pickle.dump(rf_classifier, f)
    print("[APP] Model trained and cached ✓")

# Serve static files (CSS)
app.static_folder = 'static'

print("[APP] Flask app initialized ✓")

# Define the root route to render the HTML form
@app.route('/', methods=['GET'])
def index():
    print("[ROUTE] GET / - Loading index page")
    return render_template('index.html')

# Define an API endpoint for career recommendations
@app.route('/recommend', methods=['POST'])
def recommend_career():
    user_input = request.form  # Receive user input from the HTML form
    user_profile_text = create_user_profile(user_input)
    user_profile_vector = tfidf_vectorizer.transform([user_profile_text])
    predicted_probs = rf_classifier.predict_proba(user_profile_vector)
    
    # Get the top N predicted career paths
    num_paths = 3  # Adjust the number of desired career paths
    top_careers = [rf_classifier.classes_[i] for i in predicted_probs.argsort()[0][-num_paths:]][::-1]
    
    # Build detailed career objects with descriptions and metadata
    recommendations = []
    for career in top_careers:
        career_data = df[df['Recommended Career'] == career].iloc[0]
        recommendations.append({
            'name': career,
            'salary': int(career_data['Salary']),
            'job_security': career_data['Job Security'],
            'job_description': career_data['Job Description'][:150] + '...' if len(str(career_data['Job Description'])) > 150 else career_data['Job Description'],
            'description': f"Career in {career}. A promising role with strong growth potential and competitive compensation."
        })
    
    # Render the recommendations selection page
    return render_template('recommendations.html', recommendations=recommendations)

# Create a user profile text from user input
def create_user_profile(user_input):
    return f"Class/Grade: {user_input['Class/Grade']} " \
           f"Skills: {user_input['Skills']} " \
           f"Interests: {user_input['Interests']} " \
           f"Hobbies: {user_input['Hobbies']} " \
           f"Passion: {user_input['Passion']} " \
           f"Favourite Subject: {user_input['Favourite Subject']}"

# Route to display career details including topics to be covered
@app.route('/career', methods=['GET'])
def display_career_details():
    try:
        # Get career name from query parameter
        career_name = request.args.get('name', '')
        
        if not career_name:
            return render_template('error.html', error="Career name is required"), 400
        
        print(f"[ROUTE] Fetching career details for: {career_name}")
        
        # Retrieve career details from the dataset
        career_data = df[df['Recommended Career'] == career_name]
        
        if career_data.empty:
            print(f"[ERROR] Career '{career_name}' not found in dataset")
            # Try case-insensitive match
            career_data = df[df['Recommended Career'].str.lower() == career_name.lower()]
            
        if career_data.empty:
            print(f"[ERROR] Career not found even with case-insensitive search")
            return render_template('error.html', error="Career not found"), 404
        
        career_details = career_data.iloc[0]
        
        # Add topics to be covered to the template context
        topics_string = str(career_details['Topics to Be Covered']).strip()
        if topics_string:
            topics_covered = [topic.strip() for topic in topics_string.split('-') if topic.strip()]
        else:
            topics_covered = []
        
        print(f"[ROUTE] Found {len(topics_covered)} topics for {career_name}")
        
        # Render the career details template with the data
        return render_template('career_template.html',
                               career=career_name,
                               salary=int(career_details['Salary']),
                               job_description=career_details['Job Description'],
                               job_security=career_details['Job Security'],
                               topics_covered=topics_covered)
    
    except Exception as e:
        print(f"[ERROR] Exception in display_career_details: {str(e)}")
        import traceback
        traceback.print_exc()
        return render_template('error.html', error=f"Error loading career details: {str(e)}"), 500

# Route to take the aptitude test
@app.route('/aptitude_test', methods=['GET', 'POST'])
def aptitude_test():
    if request.method == 'GET':
        return render_template('aptitude_test.html', questions=aptitude_questions)
    elif request.method == 'POST':
        # Calculate the score based on selected options
        score = 0
        for question in aptitude_questions:
            user_answer = request.form.get(f'question_{question["id"]}')
            if user_answer == question['answer']:
                score += 1
        return render_template('aptitude_result.html', score=score, total=len(aptitude_questions))

# ============================================
# ATS RESUME ANALYSIS ENDPOINTS
# ============================================

@app.route('/api/analyze-ats', methods=['POST'])
def analyze_ats_endpoint():
    """
    Analyze resume for ATS compatibility
    
    Request JSON:
    {
        "resume_data": { complete resume object },
        "job_description": "optional job description for keyword matching"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'resume_data' not in data:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'Missing resume_data in request body',
                'error': 'MISSING_RESUME_DATA',
                'timestamp': str(__import__('datetime').datetime.now())
            }), 400
        
        resume_data = data.get('resume_data')
        job_description = data.get('job_description', '')
        
        # Validate resume_data structure
        if not isinstance(resume_data, dict):
            return jsonify({
                'success': False,
                'data': None,
                'message': 'resume_data must be a JSON object',
                'error': 'INVALID_RESUME_FORMAT',
                'timestamp': str(__import__('datetime').datetime.now())
            }), 400
        
        # Run ATS analysis
        analysis_result = analyze_ats(resume_data)
        
        # If job description provided, add detailed match analysis
        if job_description and len(job_description.strip()) > 0:
            from ats_analyzer import ATSAnalyzer
            
            analyzer = ATSAnalyzer()
            resume_text = get_resume_text(resume_data)
            job_match_result = analyzer.analyze_job_match(resume_text, job_description)
            
            analysis_result['job_match'] = job_match_result
        else:
            analysis_result['job_match'] = {
                'match_score': 0,
                'matched_keywords': [],
                'missing_keywords': [],
                'job_keywords': [],
                'match_percentage': 0
            }
        
        return jsonify({
            'success': True,
            'data': analysis_result,
            'message': 'Resume analyzed successfully',
            'error': None,
            'timestamp': str(__import__('datetime').datetime.now())
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': 'Error analyzing resume',
            'error': str(e),
            'timestamp': str(__import__('datetime').datetime.now())
        }), 500


@app.route('/api/ats-score-info', methods=['GET'])
def ats_score_info():
    """
    Get information about ATS scoring system
    """
    return jsonify({
        'success': True,
        'data': {
            'score_scale': {
                'min': 0,
                'max': 100,
                'breakpoints': {
                    '85-100': 'Excellent',
                    '75-84': 'Good',
                    '50-74': 'Fair',
                    '0-49': 'Poor'
                }
            },
            'component_scores': {
                'formatting': {
                    'max': 25,
                    'description': 'ATS-friendly formatting, proper spacing, no special characters'
                },
                'keywords': {
                    'max': 40,
                    'description': 'Presence of relevant technical and soft skill keywords'
                },
                'structure': {
                    'max': 35,
                    'description': 'Proper resume structure with required sections and details'
                }
            },
            'important_keywords': {
                'programming_languages': ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby'],
                'frameworks': ['React', 'Angular', 'Django', 'Flask', 'Spring'],
                'databases': ['MySQL', 'PostgreSQL', 'MongoDB'],
                'cloud_platforms': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes']
            }
        },
        'message': 'ATS scoring information retrieved successfully',
        'error': None,
        'timestamp': str(__import__('datetime').datetime.now())
    }), 200


# ============================================
# HELPER FUNCTIONS FOR ATS ANALYSIS
# ============================================

def get_resume_text(resume_data):
    """
    Convert resume object to plain text for analysis
    """
    text_parts = []
    
    if 'personalInfo' in resume_data:
        pi = resume_data['personalInfo']
        text_parts.append(f"{pi.get('firstName', '')} {pi.get('lastName', '')}")
        text_parts.append(pi.get('email', ''))
        text_parts.append(pi.get('phone', ''))
    
    if 'professionalSummary' in resume_data:
        text_parts.append(resume_data['professionalSummary'])
    
    if 'experience' in resume_data:
        for exp in resume_data['experience']:
            if isinstance(exp, dict):
                text_parts.append(f"{exp.get('jobTitle', '')} at {exp.get('companyName', '')}")
                text_parts.append(exp.get('description', ''))
    
    if 'education' in resume_data:
        for edu in resume_data['education']:
            if isinstance(edu, dict):
                text_parts.append(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}")
    
    if 'skills' in resume_data:
        text_parts.append(' '.join(resume_data['skills']))
    
    return ' '.join(text_parts)


def extract_job_keywords(job_description):
    """
    Extract keywords from job description
    """
    import re
    # Remove special characters and split into words
    words = re.findall(r'\w+', job_description.lower())
    # Filter out common words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'}
    keywords = [w for w in words if len(w) > 3 and w not in stop_words]
    # Return unique keywords
    return list(set(keywords))


if __name__ == '__main__':
    app.run(debug=True, port=5001)
