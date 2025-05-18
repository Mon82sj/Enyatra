// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Card, Button, Alert, Form, Offcanvas } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../styles/hover.css"


// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [verifiedChild, setVerifiedChild] = useState(null);
//   const [verifiedParent, setVerifiedParent] = useState(null);
//   const [childEmail, setChildEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const [showOffcanvas, setShowOffcanvas] = useState(false);
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem("user"));
//     if (userData) {
//       setUser(userData);
//       if (userData.role === "student") {
//         fetchVerifiedParent(userData.id);
//       } else if (userData.role === "parent") {
//         fetchVerifiedChild(userData.id);
//       }
//     }
//   }, []);

//   const fetchVerifiedParent = async (childId) => {
//     try {
//       const response = await axios.get(`https://enyatra.onrender.com/api/get-parent/${childId}`);
//       setVerifiedParent(response.data);
//     } catch (error) {
//       console.error("Error fetching verified parent details:", error);
//     }
//   };

//   const fetchVerifiedChild = async (parentId) => {
//     try {
//       const response = await axios.get(`https://enyatra.onrender.com/api/get-verified-child/${parentId}`);
//       setVerifiedChild(response.data);
//     } catch (error) {
//       console.error("Error fetching verified child details:", error);
//     }
//   };

//   const handleRequestApproval = async () => {
//     try {
//       const res = await axios.post("https://enyatra.onrender.com/api/verify-parent", {
//         parentEmail: user.email,
//         childEmail,
//       });
//       setMessage(res.data.message);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Error sending request");
//       setMessage("");
//     }
//   };

//     const handleLogout = () => {
//       localStorage.removeItem("token");
//       navigate("/");
//     };
//     const [teacherMeetings, setTeacherMeetings] = useState([]); // State to store teacher meetings
//     const [loading, setLoading] = useState(true); // State to handle loading state
  
//     // Function to fetch meetings from the database
//     useEffect(() => {
//       async function fetchMeetings() {
//         try {
//           const response = await fetch('https://enyatra.onrender.com/api/get-all-meetings'); // Replace with your actual API endpoint
  
//           if (!response.ok) {
//             throw new Error(`Error: ${response.status} ${response.statusText}`);
//           }
  
//           const data = await response.json(); // Parse the JSON data
//           setTeacherMeetings(data.meetings); // Store meetings in state
//           setLoading(false); // Stop loading once data is fetched
//         } catch (error) {
//           console.error('Error fetching meetings:', error);
//           setLoading(false); // Stop loading on error
//         }
//       }
  
//       fetchMeetings(); // Fetch meetings on component mount
//     }, []);
  
//     // Helper function to get the card color class based on date
//     const getCardColorClass = (meetingDate) => {
//       const meetingDateObj = new Date(meetingDate);
//       const currentDate = new Date();
//       const diffTime = meetingDateObj - currentDate;
//       const diffDays = diffTime / (1000 * 3600 * 24); // Convert milliseconds to days
  
//       if (diffDays <= 3) return 'highlight-card'; // Red for meetings within 3 days
//       if (diffDays <= 7) return 'warning-card'; // Orange for meetings within 1 week
//       return 'success-card'; // Green for others
//     };
  
//     // Helper function for countdown
//     const getCountdown = (meetingDate) => {
//       const meetingDateObj = new Date(meetingDate);
//       const currentDate = new Date();
//       const diffTime = meetingDateObj - currentDate;
//       const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
//       const diffHours = Math.floor((diffTime % (1000 * 3600 * 24)) / (1000 * 3600));
//       const diffMinutes = Math.floor((diffTime % (1000 * 3600)) / (1000 * 60));
  
//       return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
//     };
    
//   return (
//     <Container className="mt-5">
//       <Row className="mb-4">
//         <Col>
//           <h2 className="fw-bold display-5">Welcome, {user?.fullName}</h2>
//           <p className="fs-5 text-muted mb-1"><strong>Email:</strong> {user?.email}</p>
//           <p className="fs-5 text-muted"><strong>Role:</strong> <span className="text-capitalize">{user?.role}</span></p>
//         </Col>
//       </Row>

//       {/* Verified Parent Info for Students */}
//       {user?.role === "student" && verifiedParent && (
//         <Container>
//         <Row className="mb-4">
//           <Col>
//             <Card className="shadow-sm border-info">
//               <Card.Header className="bg-info text-white">
//                 👨‍👩‍👧 Verified Parent Details
//               </Card.Header>
//               <Card.Body>
//                 <p><strong>Name:</strong> {verifiedParent.full_name}</p>
//                 <p><strong>Email:</strong> {verifiedParent.email}</p>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//         <section className="homepage-meetings py-5">
//         {user?.role === "student" && (
//             <Button variant="primary" onClick={() => navigate("/student-dashboard")}>
//               🎓 Student Dashboard
//             </Button>
//           )}
//       <Container>
//       <Row className="mb-4">
//       <Col className="d-flex flex-wrap gap-3">
      
//           </Col>
//         </Row>
//         <h2 className="text-center text-primary mb-4">Upcoming Meetings</h2>

//         {loading ? (
//           <div className="text-center">Loading meetings...</div>
//         ) : (
//           <Row className="g-4">
//             {teacherMeetings.map((m) => (
//               <Col md={6} lg={4} key={m.id}>
//                 <Card className={`mb-4 ${getCardColorClass(m.date)}`} style={{
//                   borderRadius: "12px",
//                   boxShadow: getCardColorClass(m.date) === 'highlight-card' ? "0 0 15px red" :
//                              getCardColorClass(m.date) === 'warning-card' ? "0 0 15px orange" : 
//                              getCardColorClass(m.date) === 'success-card' ? "0 0 15px #28a745" : "0 4px 12px rgba(0,0,0,0.2)", 
//                   backgroundColor: getCardColorClass(m.date) === 'highlight-card' ? "#ffe6e6" : 
//                                    getCardColorClass(m.date) === 'warning-card' ? "#fff3cd" :
//                                    "#d4edda", 
//                   color: "black",
//                   overflow: "hidden", // Ensure content doesn't overflow
//                 }}>
//                   <Row className="g-0">
//                     <Col md={4}>
//                       {/* Countdown Timer */}
//                       <div className="countdown" style={{
//                         marginTop: "100px",
//                         marginLeft: "50px",
//                         fontSize: "2rem", 
//                         fontWeight: "bold", 
//                         color: getCardColorClass(m.date) === 'highlight-card' ? "red" : 
//                                getCardColorClass(m.date) === 'warning-card' ? "orange" : 
//                                getCardColorClass(m.date) === 'success-card' ? "#28a745" : "black"
//                       }}>
//                         {getCountdown(m.date)}
//                       </div>
//                     </Col>
//                     <Col md={8}>
//                       <Card.Body>
//                         <Card.Title>{m.title}</Card.Title>
//                         <Card.Text><strong>Date:</strong> {m.date} at {m.time}</Card.Text>
//                         <Card.Text><strong>Speaker:</strong> {m.speaker_name}</Card.Text>
//                         <Card.Text><strong>Host:</strong> {m.organization}</Card.Text>
//                         <Card.Text>{m.description?.substring(0, 100)}...</Card.Text>
//                         <a href={m.link} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
//                           Join Link
//                         </a>
//                       </Card.Body>
//                     </Col>
//                   </Row>
//                 </Card>
//               </Col>
//             ))}
//           </Row>
//         )}
//       </Container>
//     </section>
//         </Container>
//       )}
// {user?.role === "admin" && (
//   <Button variant="dark" onClick={() => navigate("/admin-details")}>
//     🛠️ Admin Dashboard
//   </Button>
// )}

//       {/* Verified Child Info for Parents */}
//       {user?.role === "parent" && verifiedChild && (
//         <Row className="mb-4">
//           <Col>
//             <Card className="shadow-sm border-success">
//               <Card.Header className="bg-success text-white">
//                 👶 Verified Child Details
//               </Card.Header>
//               <Card.Body>
//                 <p><strong>Name:</strong> {verifiedChild.full_name}</p>
//                 <p><strong>Email:</strong> {verifiedChild.email}</p>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Buttons for Role-based Dashboards */}
//       <Row className="mb-4">
//         <Col className="d-flex flex-wrap gap-3">
          
//           {user?.role === "parent" && (
//             <>
//               <Button variant="success" onClick={() => navigate("/parent-dashboard")}>
//                 👪 Parent Dashboard
//               </Button>
//               <Button variant="outline-secondary" onClick={() => setShowOffcanvas(true)}>
//                 🔗 Link Your Child
//               </Button>
//             </>
//           )}
//           {user?.role === "teacher" && (
//             <Button variant="warning" onClick={() => navigate("/teacher-dashboard")}>
//               📚 Teacher Dashboard
//             </Button>
//           )}
//           {/* <Button variant="outline-danger" onClick={handleLogout}>
//             🔒 Logout
//           </Button> */}
//         </Col>
//       </Row>

//       {/* Offcanvas for Parent-Child Linking */}
//       <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" >
//         <Offcanvas.Header closeButton>
//           <Offcanvas.Title>Link Your Child</Offcanvas.Title>
//         </Offcanvas.Header>
//         <Offcanvas.Body>
//           <p className="text-muted">Enter your child's email to send them a verification request.</p>
//           <Form>
//             <Form.Group controlId="childEmail">
//               <Form.Label>Child's Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter email"
//                 value={childEmail}
//                 onChange={(e) => setChildEmail(e.target.value)}
//               />
//             </Form.Group>
//             <Button variant="primary" className="mt-3" onClick={handleRequestApproval}>
//               Send Approval Request
//             </Button>
//           </Form>
//           {message && <Alert variant="success" className="mt-3">{message}</Alert>}
//           {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
//         </Offcanvas.Body>
//       </Offcanvas>
//     </Container>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Button, Alert, Form, Offcanvas, Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LogOut, User, Users, GraduationCap, Settings, Link as LinkIcon, Calendar,
} from "lucide-react";
import "../styles/hover.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [verifiedChild, setVerifiedChild] = useState(null);
  const [verifiedParent, setVerifiedParent] = useState(null);
  const [childEmail, setChildEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [teacherMeetings, setTeacherMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      userData.role === "student"
        ? fetchVerifiedParent(userData.id)
        : fetchVerifiedChild(userData.id);
    }
  }, []);

  const fetchVerifiedParent = async (childId) => {
    try {
      const { data } = await axios.get(`https://enyatra.onrender.com/api/get-parent/${childId}`);
      setVerifiedParent(data);
    } catch (err) {
      console.error("Error fetching parent:", err);
    }
  };

  const fetchVerifiedChild = async (parentId) => {
    try {
      const { data } = await axios.get(`https://enyatra.onrender.com/api/get-verified-child/${parentId}`);
      setVerifiedChild(data);
    } catch (err) {
      console.error("Error fetching child:", err);
    }
  };

  const handleRequestApproval = async () => {
    try {
      const res = await axios.post("https://enyatra.onrender.com/api/verify-parent", {
        parentEmail: user.email,
        childEmail,
      });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error sending request");
      setMessage("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch("https://enyatra.onrender.com/api/get-all-meetings");
        const data = await res.json();
        setTeacherMeetings(data.meetings);
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const getCardColorClass = (meetingDate) => {
    const daysLeft = (new Date(meetingDate) - new Date()) / (1000 * 3600 * 24);
    if (daysLeft <= 3) return "border-danger";
    if (daysLeft <= 7) return "border-warning";
    return "border-success";
  };

  const getCountdown = (meetingDate) => {
    const diff = new Date(meetingDate) - new Date();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold display-6">
            <User className="me-2" />
            Welcome, {user?.fullName}
          </h2>
          <p className="text-muted"><strong>Email:</strong> {user?.email}</p>
          <p className="text-muted"><strong>Role:</strong> {user?.role}</p>
        </Col>
        <Col>
        <Button variant="outline-danger" onClick={handleLogout} style={{marginLeft:"70%"}}>
            <LogOut className="me-2" /> Logout
          </Button>
        </Col>
      </Row>

      {user?.role === "student" && verifiedParent && (
        <Card className="mb-4 shadow-sm border-info">
          <Card.Header className="bg-info text-white">
            <Users className="me-2" /> Verified Parent Details
          </Card.Header>
          <Card.Body>
            <p><strong>Name:</strong> {verifiedParent.full_name}</p>
            <p><strong>Email:</strong> {verifiedParent.email}</p>
          </Card.Body>
        </Card>
      )}
      <center>
      <Button variant="primary" onClick={() => navigate("/student-dashboard")}>
              <GraduationCap className="me-2" /> Student Dashboard
      </Button></center><br/><br/>

      {user?.role === "parent" && verifiedChild && (
        <Card className="mb-4 shadow-sm border-success">
          <Card.Header className="bg-success text-white">
            <User className="me-2" /> Verified Child Details
          </Card.Header>
          <Card.Body>
            <p><strong>Name:</strong> {verifiedChild.full_name}</p>
            <p><strong>Email:</strong> {verifiedChild.email}</p>
          </Card.Body>
        </Card>
      )}

      {/* Buttons */}
      <Row className="mb-4">
        <Col className="d-flex flex-wrap gap-3">
          {user?.role === "parent" && (
            <>
              <Button variant="success" onClick={() => navigate("/parent-dashboard")}>
                <Users className="me-2" /> Parent Dashboard
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowOffcanvas(true)}>
                <LinkIcon className="me-2" /> Link Child
              </Button>
            </>
          )}
          {user?.role === "teacher" && (
            <Button variant="warning" onClick={() => navigate("/teacher-dashboard")}>
              <GraduationCap className="me-2" /> Teacher Dashboard
            </Button>
          )}
          {user?.role === "admin" && (
            <Button variant="dark" onClick={() => navigate("/admin-details")}>
              <Settings className="me-2" /> Admin Dashboard
            </Button>
          )}
          
        </Col>
      </Row>

      {/* Upcoming Meetings */}
      {user?.role === "student" && (
        <>
          <h3 className="mb-3 text-success"><Calendar className="me-2" />Upcoming Meetings</h3>
          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <Row>
              {teacherMeetings.map((m) => (
                <Col md={6} lg={4} key={m.id}>
                  <Card className={`mb-4 shadow ${getCardColorClass(m.date)}`}>
                    <Card.Body>
                      <Card.Title>{m.title}</Card.Title>
                      <Card.Text><strong>Speaker:</strong> {m.speaker_name}</Card.Text>
                      <Card.Text><strong>Date:</strong> {m.date} at {m.time}</Card.Text>
                      <Card.Text><strong>Host:</strong> {m.organization}</Card.Text>
                      <Card.Text>{m.description?.substring(0, 100)}...</Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <a href={m.link} className="btn btn-outline-primary btn-sm" target="_blank" rel="noreferrer">
                          Join
                        </a>
                        <span className="text-muted small">{getCountdown(m.date)}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* Offcanvas Link Child */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Link Your Child</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group controlId="childEmail">
              <Form.Label>Child's Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter child's email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" className="mt-3" onClick={handleRequestApproval}>
              Send Approval Request
            </Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Dashboard;
