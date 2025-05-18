import React, { useState, useEffect } from "react";
import { Button, Form, Card, Tooltip, OverlayTrigger, Container, Row, Col } from "react-bootstrap";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherMeetingDashboard = () => {
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    link: "",
    date: "",
    time: "",
    type: "online",
    speakerName: "",
    speakerBio: "",
    speakerEmail: "",
    organization: "",
    audience: "students",
    maxParticipants: 50,
    venue: "",
    language: "English",
    tags: [],
    topics: [],
    description: "",
    thumbnail: null,
    attachments: [],
  });

  const [teacherDetails, setTeacherDetails] = useState(null);
  const [isDetailsFilled, setIsDetailsFilled] = useState(false);
  const [teacherMeetings, setTeacherMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setMeetingDetails((prev) => ({ ...prev, teacherId: userData.id }));
      fetchUserDetails(userData.id);
    }
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setTeacherDetails({
          fullName: data.user.full_name,
          email: data.user.email,
          phoneNumber: data.details.phone_number,
          education: data.details.highest_education,
          subjects: data.details.subjects?.join(', '),
        });
        setIsDetailsFilled(data.is_detailsfilled);
        if (data.is_detailsfilled) {
          fetchTeacherMeetings(userId);
        }
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
    }
  };

  const fetchTeacherMeetings = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${teacherId}`);
      const data = await response.json();
      setTeacherMeetings(data.meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags" || name === "topics") {
      setMeetingDetails({ ...meetingDetails, [name]: value.split(',').map(tag => tag.trim()) });
    } else {
      setMeetingDetails({ ...meetingDetails, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "attachments") {
      setMeetingDetails({ ...meetingDetails, attachments: files });
    } else {
      setMeetingDetails({ ...meetingDetails, [name]: files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(meetingDetails).forEach((key) => {
      if (key === "attachments") {
        for (let i = 0; i < meetingDetails.attachments.length; i++) {
          formData.append("attachments", meetingDetails.attachments[i]);
        }
      } else if (Array.isArray(meetingDetails[key])) {
        formData.append(key, JSON.stringify(meetingDetails[key]));
      } else {
        formData.append(key, meetingDetails[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/meetings", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Meeting created successfully!");
        fetchTeacherMeetings(meetingDetails.teacherId);
      } else {
        alert("Error creating meeting");
      }
    } catch (error) {
      console.error("Error saving meeting:", error);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="tooltip-disabled" {...props}>
      Complete your registration to create a meeting
    </Tooltip>
  );

  const getCardColorClass = (dateStr) => {
    const meetingDate = new Date(dateStr);
    const today = new Date();
    const daysLeft = Math.ceil((meetingDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysLeft <= 3) return "highlight-card";  // Urgent meetings
    if (daysLeft <= 7) return "warning-card";    // Moderate priority meetings
    return "success-card";                       // Successful (no urgent or warning)
  };
  const getCountdown = (dateStr) => {
    const meetingDate = new Date(dateStr);
    const now = new Date();
    const timeRemaining = meetingDate - now;
  
    if (timeRemaining <= 0) {
      return "The meeting has started!";
    }
  
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
    return `${hours}H ${minutes}M ${seconds}S`;
  };
  

  return (
    <Container className="py-4" style={{width:"490vw"}}>
      <h2 className="mb-4">Teacher Meeting Dashboard</h2>
      {teacherDetails && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Teacher Details</h5>
            <p><strong>Name:</strong> {teacherDetails.fullName}</p>
            <p><strong>Email:</strong> {teacherDetails.email}</p>
            <p><strong>Phone:</strong> {teacherDetails.phoneNumber}</p>
            <p><strong>Education:</strong> {teacherDetails.education}</p>
            <p><strong>Subjects:</strong> {teacherDetails.subjects}</p>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4">
        <Card.Body>
          <h4>Create Meeting</h4>
          {isDetailsFilled ? (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control name="title" value={meetingDetails.title} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Link</Form.Label>
                    <Form.Control name="link" value={meetingDetails.link} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" name="date" value={meetingDetails.date} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <Form.Control type="time" name="time" value={meetingDetails.time} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Tags (comma-separated)</Form.Label>
                    <Form.Control name="tags" value={meetingDetails.tags.join(', ')} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Topics (comma-separated)</Form.Label>
                    <Form.Control name="topics" value={meetingDetails.topics.join(', ')} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Speaker Name</Form.Label>
                    <Form.Control name="speakerName" value={meetingDetails.speakerName} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Speaker Bio</Form.Label>
                    <Form.Control as="textarea" rows={2} name="speakerBio" value={meetingDetails.speakerBio} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Speaker Email</Form.Label>
                    <Form.Control type="email" name="speakerEmail" value={meetingDetails.speakerEmail} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization</Form.Label>
                    <Form.Control name="organization" value={meetingDetails.organization} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={2} name="description" value={meetingDetails.description} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Thumbnail</Form.Label>
                <Form.Control type="file" name="thumbnail" onChange={handleFileChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Attachments</Form.Label>
                <Form.Control type="file" name="attachments" onChange={handleFileChange} multiple />
              </Form.Group>
              <Button variant="primary" type="submit">Create Meeting</Button>
            </Form>
          ) : (
            <OverlayTrigger placement="top" overlay={renderTooltip}>
              <div className="d-flex align-items-center text-muted">
                <AlertCircle className="me-2" />
                <span>You must complete your profile to create a meeting.</span>
              </div>
            </OverlayTrigger>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h4>Your Meetings</h4><br/><br/>
          {teacherMeetings.length === 0 ? (
            <p>No meetings found.</p>
          ) : (
            teacherMeetings.map((m) => (
              <Card className={`mb-4 ${getCardColorClass(m.date)}`} key={m.id} style={{
      
                borderRadius: "12px", 
                boxShadow: getCardColorClass(m.date) === 'highlight-card' ? "0 0 15px red" :
                           getCardColorClass(m.date) === 'warning-card' ? "0 0 15px orange" : 
                           getCardColorClass(m.date) === 'success-card' ? "0 0 15px #28a745" : "0 4px 12px rgba(0,0,0,0.2)", 
                backgroundColor: getCardColorClass(m.date) === 'highlight-card' ? "#ffe6e6" : 
                                 getCardColorClass(m.date) === 'warning-card' ? "#fff3cd" :
                                 "#d4edda", 
                color: "black",
                overflow: "hidden", // Ensure content doesn't overflow
              }}>
                <Row className="g-0">
                  <Col md={4}>
                    {/* Countdown Timer */}
                    <div className="countdown" style={{
                      marginTop:"100px",
                      marginLeft:"50px",
                      fontSize: "2rem", 
                      fontWeight: "bold", 
                      color: getCardColorClass(m.date) === 'highlight-card' ? "red" : 
                             getCardColorClass(m.date) === 'warning-card' ? "orange" : 
                             getCardColorClass(m.date) === 'success-card' ? "#28a745" : "black"
                    }}>
                      {getCountdown(m.date)}
                    </div>
                  </Col>
                  <Col md={8}>
                    <Card.Body>
                      <Card.Title>{m.title}</Card.Title>
                      <Card.Text><strong>Date:</strong> {m.date} at {m.time}</Card.Text>
                      <Card.Text><strong>Speaker:</strong> {m.speaker_name}</Card.Text>
                      <Card.Text><strong>Host:</strong> {m.organization}</Card.Text>
                      <Card.Text>{m.description?.substring(0, 100)}...</Card.Text>
                      <a href={m.link} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
                        Join Link
                      </a>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeacherMeetingDashboard;
