import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const WordMatchGame = ({ difficulty, onGameEnd }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  
  useEffect(() => {
    axios.post('/api/generate-verbal-voyage', { gameType: 'Word Match', difficulty })
      .then(res => {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(''));
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, [difficulty]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAnswers = () => {
    onGameEnd(questions, answers);
  };

  return (
    <Container>
      <h3>Word Match Game</h3>
      <Form>
        {questions.map((question, index) => (
          <div key={index} className="mb-3">
            <h5>{question.word1}</h5>
            <Form.Control as="select" value={answers[index]} onChange={(e) => handleAnswerChange(index, e.target.value)}>
              {question.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </Form.Control>
          </div>
        ))}
        <Button onClick={submitAnswers}>Submit</Button>
      </Form>
    </Container>
  );
};

export default WordMatchGame;
