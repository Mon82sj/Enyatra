// import React, { useState } from 'react';
// import axios from 'axios';
// import { Form, Button, Container, Alert } from 'react-bootstrap';

// function QueryPage() {
//   const [email, setEmail] = useState('');
//   const [query, setQuery] = useState('');
//   const [status, setStatus] = useState(null);

//   const handleSend = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/send-query', {
//         userEmail: email,
//         message: query
//       });
//       setStatus({ type: 'success', text: res.data.message });
//       setEmail('');
//       setQuery('');
//     } catch (err) {
//       setStatus({ type: 'danger', text: err.response?.data?.error || 'Failed to send query.' });
//     }
//   };

//   return (
//     <Container className="p-4">
//       <h3>Submit Your Query</h3>
//       <Form>
//         <Form.Group className="mb-3">
//           <Form.Label>Your Email</Form.Label>
//           <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Your Query</Form.Label>
//           <Form.Control as="textarea" rows={4} value={query} onChange={e => setQuery(e.target.value)} />
//         </Form.Group>

//         <Button onClick={handleSend}>Send Query</Button>

//         {status && (
//           <Alert variant={status.type} className="mt-3">{status.text}</Alert>
//         )}
//       </Form>
//     </Container>
//   );
// }

// export default QueryPage;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';

function QueryPage() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleSend = async () => {
    if (!user || !query) return;

    try {
      const res = await axios.post('http://localhost:5000/api/send-query', {
        userId: user.id,
        name: user.fullName,
        email: user.email,
        message: query
      });
      setStatus({ type: 'success', text: res.data.message });
      setQuery('');
    } catch (err) {
      setStatus({ type: 'danger', text: err.response?.data?.error || 'Failed to send query.' });
    }
  };

  const handleGoBack = () => {
    navigate("/student-dashboard"); // Navigate back to previous page
  };

  return (
    <Container className="p-4">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                  ⬅ Back
            </Button><br/><br/>
      <h3>Submit Your Query</h3>

      {user && (
        <div className="mb-3">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Your Query</Form.Label>
          <Form.Control as="textarea" rows={4} value={query} onChange={e => setQuery(e.target.value)} />
        </Form.Group>

        <Button onClick={handleSend}>Send Query</Button>

        {status && (
          <Alert variant={status.type} className="mt-3">{status.text}</Alert>
        )}
      </Form>
    </Container>
  );
}

export default QueryPage;
