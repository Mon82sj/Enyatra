
// // === FRONTEND (App.js) ===
// import React, { useState } from 'react';
// import axios from 'axios';
// import { Container, Form, Button, Spinner, Card, ListGroup } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

// function App() {
//   const [formData, setFormData] = useState({
//     subject: '',
//     difficulty: 'Medium',
//     type: 'Multiple Choice',
//     numQuestions: 5,
//     bloom: 'Understand'
//   });

//   const [quiz, setQuiz] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const handleChange = e => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const generateQuiz = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:5000/api/generate-quiz', formData);
//       setQuiz(res.data.questions);
//       setCurrentIndex(0);
//       setAnswers([]);
//       setSubmitted(false);
//     } catch (err) {
//       console.error('Error:', err);
//     }
//     setLoading(false);
//   };

//   const handleAnswer = (option) => {
//     const updatedAnswers = [...answers];
//     updatedAnswers[currentIndex] = option;
//     setAnswers(updatedAnswers);
//     if (currentIndex + 1 < quiz.length) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handleSubmitQuiz = () => {
//     setSubmitted(true);
//   };

//   const score = quiz.reduce((acc, q, idx) => acc + (q.correct === answers[idx] ? 1 : 0), 0);

//   return (
//     <Container className="p-4">
//       <h2 className="mb-4">AI Quiz Generator (Bloom's Taxonomy)</h2>

//       <Form>
//         <Form.Group className="mb-3">
//           <Form.Label>Subject</Form.Label>
//           <Form.Control name="subject" onChange={handleChange} value={formData.subject} />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Difficulty</Form.Label>
//           <Form.Select name="difficulty" onChange={handleChange} value={formData.difficulty}>
//             <option>Easy</option>
//             <option>Medium</option>
//             <option>Hard</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Question Type</Form.Label>
//           <Form.Select name="type" onChange={handleChange} value={formData.type}>
//             <option>Multiple Choice</option>
//             <option>True/False</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Bloom’s Taxonomy Level</Form.Label>
//           <Form.Select name="bloom" onChange={handleChange} value={formData.bloom}>
//             <option>Remember</option>
//             <option>Understand</option>
//             <option>Apply</option>
//             <option>Analyze</option>
//             <option>Evaluate</option>
//             <option>Create</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Number of Questions</Form.Label>
//           <Form.Control type="number" name="numQuestions" onChange={handleChange} value={formData.numQuestions} />
//         </Form.Group>

//         <Button onClick={generateQuiz} disabled={loading} className="mb-4">
//           {loading ? <Spinner size="sm" animation="border" /> : 'Generate Quiz'}
//         </Button>
//       </Form>

//       {quiz.length > 0 && currentIndex < quiz.length && !submitted && (
//         <Card className="p-3 mt-4">
//           <h5>Question {currentIndex + 1} of {quiz.length}</h5>
//           <p>{quiz[currentIndex].question}</p>
//           {quiz[currentIndex].options.map((opt, i) => (
//             <Button
//               key={i}
//               className="m-1"
//               variant={answers[currentIndex] === ['A','B','C','D'][i] ? 'primary' : 'outline-primary'}
//               onClick={() => handleAnswer(['A','B','C','D'][i])}
//             >
//               {['A','B','C','D'][i]}. {opt}
//             </Button>
//           ))}

//           {currentIndex === quiz.length - 1 && (
//             <div className="mt-3">
//               <Button variant="success" onClick={handleSubmitQuiz}>Submit Quiz</Button>
//             </div>
//           )}
//         </Card>
//       )}

//       {submitted && (
//         <Card className="p-3 mt-4">
//           <h4>Quiz Completed</h4>
//           <p>You scored {score} out of {quiz.length}</p>
//           <ListGroup className="mt-3">
//             {quiz.map((q, idx) => (
//               <ListGroup.Item key={idx} variant={answers[idx] === q.correct ? 'success' : 'danger'}>
//                 <strong>Q{idx + 1}:</strong> {q.question}
//                 <br />
//                 <strong>Your Answer:</strong> {answers[idx] || 'Not Answered'}
//                 <br />
//                 <strong>Correct Answer:</strong> {q.correct}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default App;


// === FRONTEND (App.js) ===
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Spinner, Card, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    difficulty: 'Medium',
    type: 'Multiple Choice',
    numQuestions: 5,
    bloom: 'Understand'
  });

  const [quiz, setQuiz] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate=useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/generate-quiz', formData);
      setQuiz(res.data.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setSubmitted(false);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleAnswer = (option) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);
    if (currentIndex + 1 < quiz.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  const handleDownloadReport = async () => {
    const payload = {
      name: formData.name,
      email: formData.email,
      score: score,
      total: quiz.length,
      questions: quiz,
      answers: answers
    };
    const res = await axios.post('http://localhost:5000/api/generate-report', payload, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'quiz-report.pdf');
    document.body.appendChild(link);
    link.click();
  };

 
  const score = quiz.reduce((acc, q, idx) => acc + (q.correct === answers[idx] ? 1 : 0), 0);
  const handleGoBack = () => {
    navigate("/student-dashboard"); // Go to the previous page
  };
  return (
    <Container className="p-4">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                    ⬅️ Back
                  </Button><br/>
      <center><h2 className="m-0 text-info">AI Quiz Generator (Bloom's Taxonomy)</h2><br/></center>
     <Card className="shadow-sm rounded p-4 border-0">
     <Form>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" onChange={handleChange} value={formData.name} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control name="email" type="email" onChange={handleChange} value={formData.email} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control name="subject" onChange={handleChange} value={formData.subject} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Difficulty</Form.Label>
          <Form.Select name="difficulty" onChange={handleChange} value={formData.difficulty}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Question Type</Form.Label>
          <Form.Select name="type" onChange={handleChange} value={formData.type}>
            <option>Multiple Choice</option>
            <option>True/False</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Bloom’s Taxonomy Level</Form.Label>
          <Form.Select name="bloom" onChange={handleChange} value={formData.bloom}>
            <option>Remember</option>
            <option>Understand</option>
            <option>Apply</option>
            <option>Analyze</option>
            <option>Evaluate</option>
            <option>Create</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Number of Questions</Form.Label>
          <Form.Control type="number" name="numQuestions" onChange={handleChange} value={formData.numQuestions} />
        </Form.Group>

        <Button onClick={generateQuiz} disabled={loading} className="mb-4">
          {loading ? <Spinner size="sm" animation="border" /> : 'Generate Quiz'}
        </Button>
      </Form>

      {quiz.length > 0 && currentIndex < quiz.length && !submitted && (
        <Card className="p-3 mt-4">
          <h5>Question {currentIndex + 1} of {quiz.length}</h5>
          <p>{quiz[currentIndex].question}</p>
          {quiz[currentIndex].options.map((opt, i) => (
            <Button
              key={i}
              className="m-1"
              variant={answers[currentIndex] === ['A','B','C','D'][i] ? 'primary' : 'outline-primary'}
              onClick={() => handleAnswer(['A','B','C','D'][i])}
            >
              {['A','B','C','D'][i]}. {opt}
            </Button>
          ))}

          {currentIndex === quiz.length - 1 && (
            <div className="mt-3">
              <Button variant="success" onClick={handleSubmitQuiz}>Submit Quiz</Button>
            </div>
          )}
        </Card>
      )}

      {submitted && (
        <Card className="p-3 mt-4">
          <h4>Quiz Completed</h4>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p>You scored {score} out of {quiz.length}</p>

          <ListGroup className="mt-3">
            {quiz.map((q, idx) => (
              <ListGroup.Item key={idx} variant={answers[idx] === q.correct ? 'success' : 'danger'}>
                <strong>Q{idx + 1}:</strong> {q.question}
                <br />
                <strong>Your Answer:</strong> {answers[idx] || 'Not Answered'}
                <br />
                <strong>Correct Answer:</strong> {q.correct}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Button className="mt-4" onClick={handleDownloadReport}>Download PDF Report</Button>
        </Card>
      )}
     </Card>
    </Container>
  );
}

export default App;
