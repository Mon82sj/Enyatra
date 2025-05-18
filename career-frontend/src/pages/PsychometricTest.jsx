// File: PsychometricTest.jsx
import React, { useEffect, useState } from "react";
import { Treebeard } from 'react-treebeard';
import Tree from "react-d3-tree";
import {
  Button,
  Spinner,
  Alert,
  Container,
  Card,
  Row,
  Col,
  ProgressBar,
  ListGroup,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "rc-slider";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import "rc-slider/assets/index.css";
import "../styles/hover.css";
const modules = [
  "Personality",
  "Cognitive",
  "Interests",
  "Emotional Intelligence",
  "Problem Solving",
  "Decision Making",
  "Leadership",
  "Stress Management",
  "Risk Taking",
  "Adaptability",
  "Subject Interest 1",
  "Subject Interest 2",
  "Career Interest 1",
  "Career Interest 2",
  "Soft Skills",
];

const colorScale = [
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#e67e22",
  "#e74c3c",
  "#1abc9c",
];

const PsychometricTest = () => {
  const [student, setStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formCompleted, setFormCompleted] = useState(false);
  const [error, setError] = useState("");
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [timer, setTimer] = useState(60 * 60);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [moduleScores, setModuleScores] = useState([]);
  const [moduleAnalysis, setModuleAnalysis] = useState([]);
  const [questionType, setQuestionType] = useState("");
  const [careerTreeData, setCareerTreeData] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [existingResult, setExistingResult] = useState(null);
  const [careerData, setCareerData] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  
  const navigate = useNavigate();

  useEffect(() => {
    if (assessmentComplete) {
      setShowSidebar(false); // Disable sidebar when assessment is complete
    } else {
      setShowSidebar(true); // Show sidebar when assessment is not complete
    }
  }, [assessmentComplete]);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setStudent(userData);
    } else {
      console.error("User not found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (student) {
      fetchStudentData();
    }
  }, [student]);
  
  const fetchStudentData = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${userData.id}`);
      const data = await response.json();
  
      if (
        data.details?.dob &&
        data.details.grade &&
        data.details.school_board &&
        data.details.school_name &&
        data.details.career_interest?.length &&
        data.details.subject_interest?.length
      ) {
        setStudentDetails(data);
        setFormCompleted(true);
  
        const resultRes = await axios.get(`http://localhost:5000/api/psychometric-result/${userData.id}`);
        if (resultRes.data && resultRes.data.module_analysis) {
          const scores = resultRes.data.module_analysis.map((item, idx) => ({
            module: item.module || `Module ${idx + 1}`,
            score: item.score ?? 0,
            color: colorScale[idx % colorScale.length],
            analysis: item.analysis || "No analysis available",
          }));
          setModuleScores(scores);
          setModuleAnalysis(scores);
          setAssessmentComplete(true);
          setExistingResult(true);
  
          if (resultRes.data.career_predictions) {
            const treeData = transformCareerPredictions(resultRes.data.career_predictions);
            console.log('Career Tree Data:', treeData);
            setCareerTreeData(treeData);
            setCareerData(resultRes.data.career_predictions); // <-- Add this line
          }
          
        }
      }
    } catch (error) {
      console.error("Error fetching student details or test results:", error);
      setError("Failed to load user details or test result");
    } finally {
      setLoading(false);
    }
  };
  
  const transformCareerPredictions = (predictions) => {
    return predictions.map(prediction => ({
      name: prediction.career,
      score: prediction.score,
      children: prediction.recommended_courses.map(course => ({
        name: course.course,
        score: course.score,
        description: course.description
      }))
    }));
  };
  
  

  useEffect(() => {
    if (assessmentStarted && timer > 0 && !assessmentComplete) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, assessmentStarted]);

  const generateQuestions = async (module, studentDetails, interestType) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/generate-psychometric-new",
        {
          module,
          userId: studentDetails?.details?.user_id,
          interestType,
        }
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err.response?.data || err.message);
      setError("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };
  const analyzeResults = async (studentName, userId, moduleScores) => {
    try {
      const response = await axios.post("http://localhost:5000/api/analyze-psychometric-results", {
        moduleScores,
        studentName,
        userId,
      });
  
      const data = response.data;
      console.log("Analysis response:", data); // Log the full response for debugging
  
      // Check if predictions exist and transform them
      if (data.predictions) {
        const treeData = transformPredictionsToTree(data.predictions);
        setCareerTreeData(treeData);
        setCareerData(data.predictions); // <-- This populates the cards!
      }
      
    } catch (err) {
      console.error("Error analyzing results:", err);
      alert("Something went wrong while generating the analysis. Please try again.");
    }
  };
  
  
  const handleAnswer = async (answer) => {
    const currentQ = questions[currentQuestionIndex];
    const module = modules[currentModuleIndex];
    const updated = {
      ...responses,
      [module]: [
        ...(responses[module] || []),
        { question: currentQ.question, answer },
      ],
    };
    setResponses(updated);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await axios.post("http://localhost:5000/api/save-module", {
        module,
        responses: updated[module],
      });

      if (currentModuleIndex + 1 < modules.length) {
        const nextIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextIndex);
        setCurrentQuestionIndex(0);
        generateQuestions(modules[nextIndex], studentDetails, questionType);
      } else {
        const moduleScoresArray = Object.entries(updated).map(([mod, res]) => ({
          module: mod,
          score: Math.floor((res.length / 10) * 100),
        }));

        analyzeResults(
          studentDetails?.user?.full_name,
          studentDetails?.details?.user_id,
          moduleScoresArray
        );
      }
    }
  };

  const handleStartAssessment = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/batch-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: studentDetails?.user?.id,
          interestType: questionType,
          module: modules[currentModuleIndex],
        }),
      });

      const data = await response.json();
      setQuestions(data.questions);
      setAssessmentStarted(true);

      generateQuestions(modules[currentModuleIndex], studentDetails, questionType);
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100
  );

  if (loading) return <Spinner animation="border" />;

  const onToggle = (node, toggled) => {
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setCareerTreeData({ ...careerTreeData });
  };
  
// Example of transforming your flat data into a hierarchical structure
const transformPredictionsToTree = (data) => {
  return data.map((career) => ({
    name: career.career,
    children: career.recommended_courses.map((course) => ({
      name: course.course,
      description: course.description,
      score: course.score,
    })),
  }));
};
const handleGoBack = () => {
  navigate("/self-discovery");
};
  
return (
  <Container fluid className="mt-4">
    <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                    ⬅ Back
                  </Button><br/><br/>
    <Card className="mt-3 shadow-sm">
      <Card.Body>
        <h6>User Details:</h6>
        <Row>
          <Col md={6}>
            <p><strong>Name:</strong> {studentDetails?.user?.full_name}</p>
            <p><strong>Email:</strong> {studentDetails?.user?.email}</p>
            <p><strong>Role:</strong> {studentDetails?.user?.role}</p>
            <p><strong>Grade:</strong> {studentDetails?.details?.grade}</p>
          </Col>
          <Col md={6}>
            <p><strong>School:</strong> {studentDetails?.details?.school_name}</p>
            <p><strong>Career Interests:</strong> {studentDetails?.details?.career_interest?.join(", ")}</p>
            <p><strong>Subject Interests:</strong> {studentDetails?.details?.subject_interest?.join(", ")}</p>
          </Col>
        </Row>
      </Card.Body>
    </Card>

    <Row className="mt-4">
      {/* Sidebar is hidden when assessment is complete */}
      {!assessmentComplete && (
        <Col md={3}>
        <Card className="shadow-sm">
          <Card.Header className="bg-info text-white">Module Progress</Card.Header>
          <ListGroup variant="flush">
            {modules.map((mod, idx) => {
              let icon = "🔒";
              if (idx < currentModuleIndex) icon = "✅";
              else if (idx === currentModuleIndex) icon = "🟢";
      
              return (
                <ListGroup.Item
                  key={mod}
                  className={idx === currentModuleIndex ? "fw-bold text-info" : ""}
                >
                  {icon} {mod}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      </Col>
      
      )}

      <Col md={assessmentComplete ? 12 : 9}>
        {!formCompleted && (
          <Alert variant="warning">
            Please complete your profile to begin the assessment.
          </Alert>
        )}

        {!assessmentStarted && formCompleted && !existingResult && (
          <Card className="p-4 shadow-sm mb-3">
            <h5 className="mb-3 text-info">Choose Question Type</h5>
            <Form>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  label="Subject Interest Only"
                  value="subject"
                  checked={questionType === "subject"}
                  onChange={(e) => setQuestionType(e.target.value)}
                  inline
                />
                <Form.Check
                  type="radio"
                  label="Both Subject and Career Interest"
                  value="both"
                  checked={questionType === "both"}
                  onChange={(e) => setQuestionType(e.target.value)}
                  inline
                />
              </div>
              <Button
                variant="primary"
                disabled={!questionType}
                onClick={handleStartAssessment}
              >
                Start Assessment
              </Button>
            </Form>
          </Card>
        )}

        {assessmentStarted && !assessmentComplete && questions.length > 0 && (
          <Card className="p-4 shadow-lg">
            <h5 className="text-muted text-end">Time Left: {formatTime(timer)}</h5>
            <h4 className="mb-3 text-info">
              Module: {modules[currentModuleIndex]}
            </h4>
            <h5>
              <strong>Q{currentQuestionIndex + 1}:</strong>{" "}
              {questions[currentQuestionIndex]?.question}
            </h5>
            <div className="mt-4">
              {questions[currentQuestionIndex]?.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline-info"
                  className="mb-3 d-block w-100"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            <ProgressBar now={progressPercent} className="mt-3" />
          </Card>
        )}

        {assessmentComplete && (
          <Card className="p-4 shadow-lg">
            <h3 className="mb-4 text-success text-center">
              Assessment Complete!
            </h3>
            <h5 className="text-info text-center">
              AI-Based Psychometric Summary
            </h5>

            {moduleAnalysis.map((item, idx) => (
              <div key={idx} className="mb-4">
                <h6 className="mb-2">{item.module}</h6>
                <Slider
                  value={item.score}
                  disabled
                  trackStyle={{ backgroundColor: item.color, height: 10 }}
                  handleStyle={{
                    borderColor: item.color,
                    height: 24,
                    width: 24,
                  }}
                  railStyle={{ height: 10 }}
                />
                <p className="text-muted mt-1">
                  <strong>Score:</strong> {item.score}%
                </p>
                <p className="text-secondary">
                  <strong>Analysis:</strong> {item.analysis}
                </p>
              </div>
            ))}

            <h5 className="text-center mt-4 mb-3">
              Overall Personality Profile
            </h5>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={moduleScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="module" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Student"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>

            {careerData?.length > 0 && (
              <Row xs={1} md={2} className="g-4 mt-4">
                {careerData.map((career, index) => {
                  const score = career.score;
                  let variant = "danger";
                  let badge = "Low Match";

                  if (score >= 80) {
                    variant = "success";
                    badge = "High Match";
                  } else if (score >= 60) {
                    variant = "warning";
                    badge = "Moderate Match";
                  }

                  return (
                    <Col key={index}>
                      <Card className="h-100 shadow border-0">
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between align-items-center">
                            <span>🎯 {career.career}</span>
                            <span className={`badge bg-${variant}`}>{badge}</span>
                          </Card.Title>
                          <Card.Text className="mb-2 text-muted">
                            Match Score: {score}%
                          </Card.Text>
                          <ProgressBar now={score} variant={variant} className="mb-3" />

                          <Card.Text>📘 Recommended Courses:</Card.Text>
                          <ListGroup variant="flush">
                            {career.recommended_courses.map((course, i) => (
                              <ListGroup.Item key={i}>
                                <strong>{course.course}</strong> ({course.score}%):{" "}
                                <span className="text-muted">{course.description}</span>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}

            <div className="text-center mt-4">
              <Button variant="success" onClick={() => navigate("/student-dashboard")}>
                Go Back to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </Col>
    </Row>
  </Container>
);

};

export default PsychometricTest;