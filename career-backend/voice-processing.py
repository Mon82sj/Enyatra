# from flask import Flask, jsonify
# from flask_cors import CORS
# import speech_recognition as sr

# app = Flask(__name__)
# CORS(app)  # Allow all origins

# @app.route('/capture-speech', methods=['POST'])
# def capture_speech():
#     recognizer = sr.Recognizer()
#     recognizer.energy_threshold = 300  # Manually setting a low threshold
#     recognizer.dynamic_energy_threshold = True

#     with sr.Microphone() as source:
#         print("Adjusting for ambient noise... Please stay silent...")
#         recognizer.adjust_for_ambient_noise(source, duration=1)
#         print("Listening now... Speak clearly.")
#         audio = recognizer.listen(source, phrase_time_limit=20)

#     try:
#         text = recognizer.recognize_google(audio)
#         print(f"You said: {text}")
#         return jsonify({"text": text})
#     except sr.UnknownValueError:
#         print("Sorry, could not understand audio.")
#         return jsonify({"text": "Sorry, could not understand audio."})
#     except sr.RequestError:
#         print("API unavailable.")
#         return jsonify({"text": "Speech Recognition API unavailable."}), 503

# if __name__ == "__main__":
#     app.run(port=5001, debug=True)


# from flask import Flask, jsonify
# from flask_cors import CORS
# import speech_recognition as sr
# import requests
# import json

# app = Flask(__name__)
# CORS(app)  # Allow all origins

# # Configure Together AI API (Assuming you have the necessary credentials)
# TOGETHER_AI_API_URL = "https://api.together.ai/evaluate"  # Replace with the actual API URL
# TOGETHER_API_KEY = "tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM"  # Replace with your API key

# # Function to send text to Together AI API for evaluation
# def evaluate_with_together_ai(text):
#     headers = {
#         "Authorization": f"Bearer {TOGETHER_API_KEY}",
#         "Content-Type": "application/json"
#     }
#     data = {
#         "text": text
#     }
    
#     try:
#         response = requests.post(TOGETHER_AI_API_URL, headers=headers, json=data)
#         if response.status_code == 200:
#             return response.json()  # Return the evaluation response
#         else:
#             return {"error": "Failed to evaluate with Together AI."}
#     except Exception as e:
#         return {"error": str(e)}


# @app.route('/capture-speech', methods=['POST'])
# def capture_speech():
#     recognizer = sr.Recognizer()
#     recognizer.energy_threshold = 300  # Manually setting a low threshold
#     recognizer.dynamic_energy_threshold = True

#     with sr.Microphone() as source:
#         print("Adjusting for ambient noise... Please stay silent...")
#         recognizer.adjust_for_ambient_noise(source, duration=1)
#         print("Listening now... Speak clearly.")
#         audio = recognizer.listen(source, phrase_time_limit=20)

#     try:
#         text = recognizer.recognize_google(audio)
#         print(f"You said: {text}")

#         # Now send the captured text to Together AI for evaluation
#         evaluation = evaluate_speech(text)

#         return jsonify({"text": text, "evaluation": evaluation})
#     except sr.UnknownValueError:
#         print("Sorry, could not understand audio.")
#         return jsonify({"text": "Sorry, could not understand audio.", "evaluation": None})
#     except sr.RequestError:
#         print("API unavailable.")
#         return jsonify({"text": "Speech Recognition API unavailable.", "evaluation": None}), 503

# def evaluate_speech(speech_text):
#     # Here we use the Together AI API to evaluate the speech text
#     prompt = f"Please evaluate the following text and provide a detailed feedback analysis: '{speech_text}'"

#     headers = {
#         "Authorization": f"Bearer tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM",
#         "Content-Type": "application/json"
#     }

#     payload = {
#         "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
#         "messages": [{"role": "user", "content": prompt}],
#         "max_tokens": 1024,
#         "temperature": 0.7
#     }

#     try:
#         response = requests.post("https://api.together.xyz/v1/chat/completions", json=payload, headers=headers)
#         response.raise_for_status()
#         data = response.json()

#         # Assuming the API returns evaluation feedback in 'choices' or similar structure
#         feedback = data.get('choices', [{}])[0].get('message', {}).get('content', 'No feedback available')

#         return {
#             "feedback": feedback
#         }
#     except Exception as e:
#         print(f"Error during API call: {e}")
#         return {"feedback": "Error in evaluation"}

# if __name__ == "__main__":
#     app.run(port=5001, debug=True)



from flask import Flask, jsonify
from flask_cors import CORS
import speech_recognition as sr
import requests
import json
import os

app = Flask(__name__)
CORS(app)

TOGETHER_API_KEY = "tgp_v1_MrVHMsGei0vf52T9v0JfZ9Q7s5hg6UGT_nflZSKs0QU"  # Replace with your API key

@app.route('/capture-speech', methods=['POST'])
def capture_speech():
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300  # Manually setting a low threshold
    recognizer.dynamic_energy_threshold = True

    with sr.Microphone() as source:
        print("Adjusting for ambient noise... Please stay silent...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        print("Listening now... Speak clearly.")
        audio = recognizer.listen(source, phrase_time_limit=120)  # 2-minute time limit

    try:
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")

        # Now send the captured text to Together AI for evaluation
        evaluation = evaluate_speech(text)

        return jsonify({"text": text, "evaluation": evaluation})
    except sr.UnknownValueError:
        print("Sorry, could not understand audio.")
        return jsonify({"text": "Sorry, could not understand audio.", "evaluation": None})
    except sr.RequestError:
        print("API unavailable.")
        return jsonify({"text": "Speech Recognition API unavailable.", "evaluation": None}), 503

def evaluate_speech(speech_text):
    # Here we use the Together AI API to evaluate the speech text
    prompt = f"Please evaluate the following text and provide a detailed feedback analysis in the following categories: 'repeated words', 'improvements', 'areas where the speaker lagged', 'accuracy', and 'reliability': '{speech_text}'"

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.7
    }

    try:
        response = requests.post("https://api.together.xyz/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

        # Parse the response correctly and ensure it's a string before attempting to access categories
        feedback = data.get('choices', [{}])[0].get('message', {}).get('content', 'No feedback available')

        # Check if the feedback is raw text or structured
        if isinstance(feedback, str):
            # Feedback is raw text, we need to extract categories manually
            evaluation = {
                "repeatedWords": "Not available",
                "improvements": "Not available",
                "laggingAreas": "Not available",
                "accuracy": "Not available",
                "reliability": "Not available",
                "rawFeedback": feedback  # Return the full raw feedback here
            }

            # Attempt to parse the raw text into categories
            if "repeated words" in feedback.lower():
                evaluation["repeatedWords"] = extract_info_from_feedback(feedback, "repeated words")
            if "improvements" in feedback.lower():
                evaluation["improvements"] = extract_info_from_feedback(feedback, "improvements")
            if "lagging areas" in feedback.lower():
                evaluation["laggingAreas"] = extract_info_from_feedback(feedback, "lagging areas")
            if "accuracy" in feedback.lower():
                evaluation["accuracy"] = extract_info_from_feedback(feedback, "accuracy")
            if "reliability" in feedback.lower():
                evaluation["reliability"] = extract_info_from_feedback(feedback, "reliability")

        return evaluation

    except Exception as e:
        print(f"Error during API call: {e}")
        return {
            "repeatedWords": "Error retrieving repeated words.",
            "improvements": "Error retrieving improvements.",
            "laggingAreas": "Error retrieving lagging areas.",
            "accuracy": "Error retrieving accuracy.",
            "reliability": "Error retrieving reliability.",
            "rawFeedback": "Error in feedback processing."
        }

def extract_info_from_feedback(feedback_text, category):
    """
    Extract relevant feedback information for a specific category from the raw feedback text.
    """
    import re
    pattern = r"(?i)" + re.escape(category) + r":\s*(.*?)(?=\n|$)"
    match = re.search(pattern, feedback_text)
    if match:
        return match.group(1).strip()
    return "Not available"

if __name__ == "__main__":
    app.run(port=5001, debug=True)
