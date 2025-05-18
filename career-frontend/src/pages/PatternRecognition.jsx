// Sample React component for displaying question and options with images
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Proxy URL for image fetching
const proxyImageUrl = "http://localhost:5000/proxy-image?url=";

const QuestionComponent = () => {
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    // Fetch the question from the backend API
    axios.get("http://localhost:5000/api/questions")
      .then((response) => {
        setQuestionData(response.data[0]);  // Assuming we use the first question as an example
      })
      .catch((error) => {
        console.error("There was an error fetching the questions!", error);
      });
  }, []);

  // Function to get the image URL using the proxy
  const getImageUrl = (imageUrl) => {
    return proxyImageUrl + encodeURIComponent(imageUrl);
  };

  // Handle answer checking
  const handleAnswer = (selectedAnswer) => {
    axios.post("http://localhost:5000/api/check-answer", {
      id: questionData.question_id,
      selected: selectedAnswer
    })
    .then(response => {
      alert(`Correct: ${response.data.correct}`);
    })
    .catch(error => {
      console.error("Error checking answer:", error);
    });
  };

  if (!questionData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <img src={getImageUrl(questionData.question_image)} alt="Question" />
        <p>{questionData.question_text}</p>
      </div>

      <div>
        {Object.entries(questionData.options).map(([key, optionImage]) => (
          <div key={key}>
            <img src={getImageUrl(optionImage)} alt={`Option ${key}`} />
            <button onClick={() => handleAnswer(key)}>{key}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionComponent;
