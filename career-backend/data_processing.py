from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os



app = Flask(__name__)
CORS(app)


NEWS_API_KEY = os.getenv("NEWS_API_KEY") or "690764396475444bae8afc33aa613479"

@app.route('/api/education-news', methods=['GET'])
def get_education_news():
    news_url = "https://newsapi.org/v2/everything"
    params = {
        "q": "career job education college school india",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 10,
        "apiKey": NEWS_API_KEY
    }

    try:
        response = requests.get(news_url, params=params)
        response.raise_for_status()
        news_data = response.json()
        return jsonify(news_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/aicte-colleges', methods=['GET'])
def get_colleges():
    base_url = "https://facilities.aicte-india.org/dashboard/pages/php/approvedinstituteserver.php"

    def normalize_param(param_name):
        val = request.args.get(param_name, "").strip()
        # If it's "--All--", empty, or missing, return "1"
        if val == "--All--" or val == "":
            return "1"
        return val

    # Apply normalization
    params = {
        "method": "fetchdata",
        "year": "2024-2025",
        "program": normalize_param("program"),
        "level": normalize_param("level"),
        "institutiontype": normalize_param("institutiontype"),
        "Women": "1",
        "Minority": "1",
        "state": normalize_param("state"),
        "course": "1"
    }

    try:
        print("Sending request to AICTE with params:", params)  # 🪵 Debug log
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()

        if not data:
            return jsonify({"message": "No colleges found for the selected filters"}), 200

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/aicte-course-details', methods=['GET'])
def get_course_details():
    aicteid = request.args.get("aicteid", "")
    url = f"https://facilities.aicte-india.org/dashboard/pages/php/approvedcourse.php?method=fetchdata&aicteid=/{aicteid}/&course=/1/&year=/2024-2025/"
    try:
        response = requests.get(url)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/faculty-details', methods=['GET'])
def get_faculty_details():
    aicteid = request.args.get('aicteid')
    pid = request.args.get('pid')
    year = request.args.get('year')

    api_url = f'https://facilities.aicte-india.org/dashboard/pages/php/faculty.php?method=fetchdata&aicteid={aicteid}&pid={pid}&year={year}'

    try:
        response = requests.get(api_url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Failed to fetch data', 'details': str(e)}), 500


@app.route('/api/college-summary', methods=['POST'])
def college_summary():
    data = request.get_json()
    college_name = data.get("college_name", "")
    address = data.get("address", "")

    if not college_name or not address:
        return jsonify({"error": "Missing college name or address"}), 400

    prompt = f"Give a detailed summary for about 100 words in points with subheadings about the college named '{college_name}' located at '{address}'. Include insights on academic programs, reputation, Available streams, Ranks and College Requirements,Hostel facilities,Transport Facilities, Rank priorities,Detailed Fees Structure,Link to the college website and campus environment.Advantages based on the reviews on the sites like shiksha, collegedunia, google reviews about the college"

    headers = {
        "Authorization": f"Bearer tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.8
    }

    try:
        response = requests.post("https://api.together.xyz/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(port=5001, debug=True)




# # backend/app.py
# from flask import Flask, jsonify, request, send_file
# from flask_cors import CORS
# import json
# import requests
# from io import BytesIO

# app = Flask(__name__)
# CORS(app)

# # Load questions from JSON file
# with open("pattern_recognition_questions_full.json", "r") as f:
#     questions = json.load(f)

# # Proxy Image Endpoint
# @app.route("/proxy-image", methods=["GET"])
# def proxy_image():
#     url = request.args.get("url")
#     if not url:
#         return jsonify({"error": "Missing URL parameter"}), 400

#     try:
#         response = requests.get(url)
#         response.raise_for_status()
#         return send_file(BytesIO(response.content), mimetype="image/png")
#     except requests.RequestException as e:
#         return jsonify({"error": f"Failed to fetch image: {str(e)}"}), 500

# # Get questions
# @app.route("/api/questions", methods=["GET"])
# def get_questions():
#     return jsonify(questions)

# # Check answer
# @app.route("/api/check-answer", methods=["POST"])
# def check_answer():
#     data = request.get_json()
#     question_id = data.get("id")
#     selected = data.get("selected")

#     for q in questions:
#         if q["question_id"] == question_id:
#             is_correct = q["answer"] == selected
#             return jsonify({
#                 "correct": is_correct,
#                 "correctAnswer": q["answer"],
#                 "answerImage": q["answer_image"],
#                 "completedImage": q["completed_pattern_image"]
#             })

#     return jsonify({"error": "Invalid question ID"}), 404

# if __name__ == "__main__":
#     app.run(debug=True, port=500)
