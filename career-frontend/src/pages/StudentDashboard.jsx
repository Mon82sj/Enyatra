import React, { useEffect, useState,loading } from "react";
import { Container, Table, Form, Button, Alert, Card,Row,Col,Badge,Tab,Tabs } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [formCompleted, setFormCompleted] = useState(false);
  const [verifiedParent, setVerifiedParent] = useState(null);
  const [verifiedChild, setVerifiedChild] = useState(null);
  const navigate=useNavigate();
  // Form Fields
  const [dob, setDob] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolBoard, setSchoolBoard] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [selectedCareer, setSelectedCareer] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]);

  // Dropdown Options from PostgreSQL
  const [careerInterests, setCareerInterests] = useState([]);
  const [subjectInterests, setSubjectInterests] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      checkDetailsFilled(userData.id);
      fetchDropdownData();
    }
  }, []);

  // Fetch Student Details if already filled
  const checkDetailsFilled = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${user_id}`);
      const data = await response.json();
  
      console.log("Fetched details:", data); // Debugging
  
      if (response.ok && data.details) {
        setStudentDetails(data);
        setVerifiedParent(data.verifiedParent);
        setVerifiedChild(data.verifiedChild);
  
        // Check if all required fields exist
        // if (data.details.dob && data.details.grade && data.details.school_board && 
        //     data.details.school_name && data.details.career_interest?.length > 0 &&
        //     data.details.subject_interest?.length > 0) {
        //   setFormCompleted(true);
        // } 
        if (response.ok && data.is_detailsfilled) {
          setStudentDetails(data);
          setVerifiedParent(data.verifiedParent);
          setFormCompleted(true);
        }
        else {
          setFormCompleted(false);
        }
      } else {
        setFormCompleted(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setFormCompleted(false);
    }
  };
  

  // Fetch Career & Subject Interests from PostgreSQL
  const fetchDropdownData = async () => {
    try {
      const careerRes = await fetch("http://localhost:5000/api/career_interests");
      const subjectRes = await fetch("http://localhost:5000/api/subject_interests");

      const careerData = await careerRes.json();
      const subjectData = await subjectRes.json();

      setCareerInterests(careerData);
      setSubjectInterests(subjectData);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  // Save Student Details
  const handleSaveDetails = async () => {
    if (!dob || !grade || !schoolBoard || !schoolName || selectedCareer.length === 0 || selectedSubject.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    const newDetails = {
      userId: user?.id,
      dob,
      grade,
      school_board: schoolBoard,
      school_name: schoolName,
      career_interest: selectedCareer,
      subject_interest: selectedSubject,
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-user-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDetails),
      });

      if (response.ok) {
        setFormCompleted(true);
        alert("Details saved successfully!");
        checkDetailsFilled(user?.id);
      } else {
        alert("Error saving details.");
      }
    } catch (error) {
      console.error("Error saving details:", error);
    }
  };
  const handleGoBack = () => {
    navigate(-1); // Navigate back to previous page
  };

  const handleAssessmentClick = () => {
    navigate('/self-discovery');
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid className="bg-light py-5 px-4">
      <Row className="justify-content-between align-items-center mb-4" style={{marginLeft:"75%"}}>
                <Col md="auto">
          <Button variant="outline-danger px-4" onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>
            Logout
          </Button>
        </Col>
        <Col>
        <Button variant="secondary" onClick={handleGoBack}>
      ⬅️ Back
    </Button>
        </Col>
      </Row>
      <Row>
      <Col>
          <Alert variant="info" className="shadow-sm">
          <h2 className="fw-bold mb-1">Welcome, {user?.fullName}</h2>
          <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
          <p className="mb-0"><strong>Role:</strong> {user?.role}</p>
          </Alert>
        </Col>
      <Col>
      {/* Parent Info */}
      {user?.role === "student" && verifiedParent && (
        <Alert variant="info" className="shadow-sm">
          <h2 className="fw-bold mb-1">Verified Parent</h2>
          Name: {verifiedParent.full_name}<br />
          Email: {verifiedParent.email}
        </Alert>
      )}
      </Col>
      </Row>
      <h6>Click here to view/attend the Self Discovery Assessment</h6>
      <center>
          <Button
            variant="outline-success"
            className="mt-3"
            onClick={handleAssessmentClick}
          >
            Start Self Discovery Assessment
      </Button></center>
      <br/>
      <Card className="shadow-lg p-3 rounded-4">
        <Tabs defaultActiveKey={formCompleted ? "edit" : "profile"} className="mb-3">
        <Tab eventKey="profile" title="Profile">
  {formCompleted ? (
    <Card className="shadow-sm p-4 rounded-4 border-0 bg-white">
      <Card.Title className="mb-4 text-primary fs-4">Student Profile Summary</Card.Title>
      <Row className="g-3">
        <Col md={6}>
          <Card className="border-0 bg-primary-subtle p-3 rounded-3 shadow-sm">
            <strong>Date of Birth</strong>
            <div>{studentDetails?.details?.dob.split("T")[0]}</div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-info-subtle p-3 rounded-3 shadow-sm">
            <strong>Grade</strong>
            <div>{studentDetails?.details?.grade}</div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-info-subtle p-3 rounded-3 shadow-sm">
            <strong>School Board</strong>
            <div>{studentDetails?.details?.school_board}</div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-primary-subtle p-3 rounded-3 shadow-sm">
            <strong>School Name</strong>
            <div>{studentDetails?.details?.school_name}</div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-primary-subtle p-3 rounded-3 shadow-sm">
            <strong>Career Interests</strong>
            <ul className="mb-0 ps-3">
              {studentDetails?.details?.career_interest?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-info-subtle p-3 rounded-3 shadow-sm">
            <strong>Subject Interests</strong>
            <ul className="mb-0 ps-3">
              {studentDetails?.details?.subject_interest?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
      
    </Card>
  ) : (
    <Alert variant="warning">Please complete your details in the "Edit Details" tab.</Alert>
  )}
</Tab>


          <Tab eventKey="edit" title="Edit Details">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Grade</Form.Label>
                    <Form.Control type="text" value={grade} onChange={(e) => setGrade(e.target.value)} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>School Board</Form.Label>
                    <Form.Control type="text" value={schoolBoard} onChange={(e) => setSchoolBoard(e.target.value)} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>School Name</Form.Label>
                    <Form.Control type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Career Interests</Form.Label>
                    <Form.Select multiple onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedCareer([...new Set([...selectedCareer, ...values])]);
                    }}>
                      {careerInterests.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex flex-wrap">
                    {selectedCareer.map((item, idx) => (
                      <Card key={idx} className="m-1 px-2 py-1 d-flex flex-row align-items-center shadow-sm">
                        <span className="me-2">{item}</span>
                        <Button variant="danger" size="sm" onClick={() => setSelectedCareer(selectedCareer.filter(c => c !== item))}>×</Button>
                      </Card>
                    ))}
                  </div>

                  <Form.Group className="mb-3 mt-3">
                    <Form.Label>Subject Interests</Form.Label>
                    <Form.Select multiple onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedSubject([...new Set([...selectedSubject, ...values])]);
                    }}>
                      {subjectInterests.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex flex-wrap">
                    {selectedSubject.map((item, idx) => (
                      <Card key={idx} className="m-1 px-2 py-1 d-flex flex-row align-items-center shadow-sm">
                        <span className="me-2">{item}</span>
                        <Button variant="danger" size="sm" onClick={() => setSelectedSubject(selectedSubject.filter(s => s !== item))}>×</Button>
                      </Card>
                    ))}
                  </div>
                </Col>
              </Row>

              <div className="text-end">
                <Button variant="primary" className="mt-4 px-4" onClick={handleSaveDetails}>
                  Save Details
                </Button>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
};

export default StudentDashboard;


