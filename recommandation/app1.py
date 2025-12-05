from flask import Flask, request, render_template
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import csv
import os
import subprocess
import time
import socket
import webbrowser
from threading import Thread

# ----------------------------------------------------
# 1) FLASK APP
# ----------------------------------------------------
app = Flask(__name__)

# Load recommendation CSV
df = pd.read_csv('skills.csv')

# Load aptitude questions CSV
def load_aptitude_questions(file_path):
    questions = []
    with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            options = [row[f'option{i}'] for i in range(1, 5)]
            questions.append({
                'id': row['id'],
                'question': row['question'],
                'options': options,
                'answer': row['answer']
            })
    return questions

aptitude_questions = load_aptitude_questions('aptitude_questions.csv')

# TF-IDF + RandomForest
tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
X = tfidf_vectorizer.fit_transform(df['Skills'])
y = df['Recommended Career']

rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
rf_classifier.fit(X, y)

app.static_folder = 'static'

# ---------------------- ROUTES ----------------------

@app.route('/', methods=['GET'])
def index():
    return "<h2>Flask Running. Go to: http://localhost:8080/login</h2>"

@app.route('/recommend', methods=['POST'])
def recommend_career():
    user_input = request.form
    user_profile_text = create_user_profile(user_input)
    user_profile_vector = tfidf_vectorizer.transform([user_profile_text])
    predicted_probs = rf_classifier.predict_proba(user_profile_vector)
    top_careers = [rf_classifier.classes_[i] for i in predicted_probs.argsort()[0][-3:]][::-1]
    return render_template('results.html', recommendations=top_careers)

def create_user_profile(user_input):
    return f"Class/Grade: {user_input['Class/Grade']} Skills: {user_input['Skills']} Interests: {user_input['Interests']} Hobbies: {user_input['Hobbies']} Passion: {user_input['Passion']} Favourite Subject: {user_input['Favourite Subject']}"

@app.route('/career/<career_name>')
def career_details(career_name):
    item = df[df['Recommended Career'] == career_name].iloc[0]
    topics = item['Topics to Be Covered'].split(', ')
    return render_template('career_template.html',
                           career=career_name,
                           salary=item['Salary'],
                           job_description=item['Job Description'],
                           job_security=item['Job Security'],
                           topics_covered=topics)

@app.route('/aptitude_test', methods=['GET', 'POST'])
def aptitude_test():
    if request.method == 'GET':
        return render_template('aptitude_test.html', questions=aptitude_questions)
    score = 0
    for q in aptitude_questions:
        if request.form.get(f'question_{q["id"]}') == q['answer']:
            score += 1
    return render_template('aptitude_result.html', score=score, total=len(aptitude_questions))

# ----------------------------------------------------
# 2) AUTO-START NODE SERVER
# ----------------------------------------------------
def wait_for_port(host, port, timeout=10):
    end = time.time() + timeout
    while time.time() < end:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except:
            time.sleep(0.3)
    return False

def start_node():
    login_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Login'))
    print("Starting Node server in:", login_dir)

    p = subprocess.Popen(["npm", "run", "dev"], cwd=login_dir)
    if wait_for_port("127.0.0.1", 8080, timeout=15):
        print("Node server running on http://localhost:8080")
    else:
        print("Node server did NOT start in 15 seconds.")

    return p

# ----------------------------------------------------
# 3) MAIN START BLOCK
# ----------------------------------------------------
if __name__ == '__main__':
    # Start Node server in background
    Thread(target=start_node, daemon=True).start()

    # Open Login page automatically
    Thread(target=lambda: (time.sleep(2), webbrowser.open("http://localhost:8080/login")), daemon=True).start()

    # Start Flask
    app.run(host='127.0.0.1', port=5000, debug=True)
