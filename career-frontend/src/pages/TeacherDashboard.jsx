
// import React, { useState, useEffect } from 'react';
// import { Container, Card, Accordion, Form, Button, Alert, Row, Col, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
// import Select from 'react-select';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const TeacherDashboard = () => {
//   const [teacherDetails, setTeacherDetails] = useState({
//     fullName: '',
//     email: '',
//     phoneNumber: '',
//     highestEducation: '',
//     subjects: [],
//     yearsOfExperience: '',
//     careerInterests: [],
//     mentorshipInterest: false,
//     connectWithPeers: false,
//   });
//   //const [customCareerInterest, setCustomCareerInterest] = useState('');
// const [customGuidanceArea, setCustomGuidanceArea] = useState('');
// const [customMentorshipTopic, setCustomMentorshipTopic] = useState('');


//   const [dropdownOptions, setDropdownOptions] = useState({
//     careerInterests: [],
//     guidanceAreas: [],
//     interactionModes: [],
//     mentorshipTopics: [],
//     contributedResources: [],
//   });
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem("user"));
//     if (userData?.user_id) checkDetailsFilled(userData.user_id);
  
//     fetch('http://localhost:5000/api/dropdown-options')
//       .then((response) => response.json())
//       .then((data) => setDropdownOptions(data))
//       .catch((error) => console.error('Error fetching dropdown options:', error));
//   }, []);
    
//   const [formCompleted, setFormCompleted] = useState(false);

 
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem("user"));
//   if (userData && userData.user_id) {
//     checkDetailsFilled(userData.user_id);
//   }
  
//     // Optional: Fetch dropdown options (career-related)
//     fetch('http://localhost:5000/api/dropdown-options')
//   .then((response) => response.json())
//   .then((data) => {
//     console.log("Dropdown options response:", data); // 🔍 debug it
//     if (Array.isArray(data)) {
//       setCareerOptions(data);
//     } else if (data.careerOptions) {
//       setCareerOptions(data.careerOptions); // ✅ this is likely what you want
//     }
//   })
//   .catch((error) => console.error('Error fetching career options:', error));

//   }, []);

  
//   const checkDetailsFilled = async (user_id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/user-details/${user_id}`);
//       const data = await response.json();
  
//       console.log("Fetched Teacher Details:", data); // 🔍 Debug
  
//       if (response.ok && data.details && data.details.is_DetailsFilled) {
//         // Fill the dashboard with TeacherDetails + CareerGuidanceDetails
//         const teacherResponse = await fetch(`http://localhost:5000/api/teacher-details/${user_id}`);
//         const teacherData = await teacherResponse.json();
  
//         setTeacherDetails(teacherData);
//         setFormCompleted(true);
//       } else {
//         setFormCompleted(false);
//       }
//     } catch (error) {
//       console.error("Error fetching teacher details:", error);
//       setFormCompleted(false);
//     }
//   };
  
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setTeacherDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   const handleMultiSelectChange = (selectedOptions, actionMeta) => {
//     const { name } = actionMeta;
//     setTeacherDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: selectedOptions ? selectedOptions.map((option) => option.value) : [],
//     }));
//   };

//   const handleToggleChange = (val, e) => {
//     const { name } = e.target;
//     setTeacherDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: val === 'yes',
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Save or update teacher details
//     fetch('http://localhost:5000/api/save-teacher-details', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(teacherDetails),
//     })
//       .then((response) => {
//         if (response.ok) {
//           alert('Details saved successfully!');
//           setFormCompleted(true);
//         } else {
//           alert('Error saving details.');
//         }
//       })
//       .catch((error) => console.error('Error saving details:', error));
//   };

//   const handleEdit = () => {
//     setFormCompleted(false);
//   };
// // ...imports and beginning of TeacherDashboard component remain unchanged

// // Add this before return()

// const [careerOptions, setCareerOptions] = useState([]);

// const handleCustomCareerInput = () => {
//   if (customCareerInterest.trim()) {
//     setTeacherDetails((prev) => ({
//       ...prev,
//       careerInterests: [...prev.careerInterests, customCareerInterest],
//     }));
//     setCustomCareerInterest('');
//   }
// };
// const [customCareerInterest, setCustomCareerInterest] = useState('');
// const careerOptionsWithOther = [
//   ...(Array.isArray(careerOptions)
//     ? careerOptions.map((opt) => ({ label: opt, value: opt }))
//     : []),
//   { label: 'Other', value: 'Other' },
// ];
// const user = JSON.parse(localStorage.getItem('user'));

// return (
//   <Container className="mt-5">
//     <Row className="mb-3">
//       <Col>
//         <h2>Teacher Dashboard</h2>
//       </Col>
//     </Row>
//     <Row className="align-items-center justify-content-between mb-3">
//     <Col>
//       <h4>Welcome, {user?.fullName || 'Teacher'} 👋</h4>
//       <p>
//         <strong>Role:</strong> {user?.role} &nbsp; | &nbsp;
//         <strong>Email:</strong> {user?.email}
//       </p>
//     </Col>
//     <Col xs="auto">
//       <Button variant="danger" onClick={() => {
//         localStorage.removeItem("user");
//         window.location.href = "/"; // Redirect to homepage/login
//       }}>
//         Logout
//       </Button>
//     </Col>
//   </Row>
//     {!formCompleted ? (<Card className="p-3">
//         <h4 className="mb-3">Complete Your Profile</h4>
//         <Form onSubmit={handleSubmit}>
//           <Accordion defaultActiveKey="0">
//             {/* Personal Information */}
//             <Accordion.Item eventKey="0">
//               <Accordion.Header>Personal Information</Accordion.Header>
//               <Accordion.Body>
//                 <Form.Group controlId="fullName">
//                   <Form.Label>Full Name</Form.Label>
//                   <Form.Control type="text" name="fullName" value={teacherDetails.fullName} onChange={handleChange} required />
//                 </Form.Group>

//                 <Form.Group controlId="email" className="mt-3">
//                   <Form.Label>Email</Form.Label>
//                   <Form.Control type="email" name="email" value={teacherDetails.email} onChange={handleChange} required />
//                 </Form.Group>

//                 <Form.Group controlId="phoneNumber" className="mt-3">
//                   <Form.Label>Phone Number</Form.Label>
//                   <Form.Control type="tel" name="phoneNumber" value={teacherDetails.phoneNumber} onChange={handleChange} required />
//                 </Form.Group>
//               </Accordion.Body>
//             </Accordion.Item>

//             {/* Education & Experience */}
//             <Accordion.Item eventKey="1">
//               <Accordion.Header>Education & Experience</Accordion.Header>
//               <Accordion.Body>
//                 <Form.Group controlId="highestEducation">
//                   <Form.Label>Highest Education</Form.Label>
//                   <Form.Select name="highestEducation" value={teacherDetails.highestEducation} onChange={handleChange} required>
//                     <option value="">Select</option>
//                     <option value="Bachelor's">Bachelor's</option>
//                     <option value="Master's">Master's</option>
//                     <option value="PhD">PhD</option>
//                     <option value="Other">Other</option>
//                   </Form.Select>
//                 </Form.Group>

//                 <Form.Group controlId="yearsOfExperience" className="mt-3">
//                   <Form.Label>Years of Experience</Form.Label>
//                   <Form.Control type="number" name="yearsOfExperience" value={teacherDetails.yearsOfExperience} onChange={handleChange} required />
//                 </Form.Group>

//                 <Form.Group controlId="subjects" className="mt-3">
//                   <Form.Label>Subjects</Form.Label>
//                   <Select
//                     isMulti
//                     name="subjects"
//                     options={[
//                       { value: 'Math', label: 'Math' },
//                       { value: 'Science', label: 'Science' },
//                       { value: 'English', label: 'English' },
//                       { value: 'History', label: 'History' },
//                       { value: 'Other', label: 'Other' }
//                     ]}
//                     onChange={(selected) =>
//                       setTeacherDetails((prev) => ({
//                         ...prev,
//                         subjects: selected.map((opt) => opt.value),
//                       }))
//                     }
//                     value={teacherDetails.subjects.map((subject) => ({
//                       label: subject,
//                       value: subject,
//                     }))}
//                   />
//                 </Form.Group>
//               </Accordion.Body>
//             </Accordion.Item>

//             {/* Career Guidance Inputs */}
//             <Accordion.Item eventKey="2">
//               <Accordion.Header>Career Guidance Preferences</Accordion.Header>
//               <Accordion.Body>
//               <Form.Group controlId="careerInterests">
//   <Form.Label>Career Interests</Form.Label>
//   <Select
//     isMulti
//     name="careerInterests"
//     options={[
//       ...(dropdownOptions.careerInterests || []).map((opt) => ({
//         label: opt,
//         value: opt,
//       })),
//       { label: 'Other', value: 'Other' }
//     ]}
//     onChange={(selected) => {
//       const values = selected.map((opt) => opt.value);
//       setTeacherDetails((prev) => ({
//         ...prev,
//         careerInterests: values.filter((val) => val !== 'Other'),
//       }));
//     }}
//     value={teacherDetails.careerInterests.map((val) => ({
//       label: val,
//       value: val,
//     }))}
//   />

//   {/* Show custom input if "Other" was clicked */}
//   {teacherDetails.careerInterests.includes('Other') && (
//     <div className="mt-2">
//       <Form.Control
//         type="text"
//         placeholder="Enter custom career interest"
//         value={customCareerInterest}
//         onChange={(e) => setCustomCareerInterest(e.target.value)}
//       />
//       <Button className="mt-2" onClick={handleCustomCareerInput}>
//         Add
//       </Button>
//     </div>
//   )}
// </Form.Group>

// <Form.Group controlId="guidanceAreas">
//   <Form.Label>Areas Where Students Need Most Guidance</Form.Label>
//   <Select
//     isMulti
//     name="guidanceAreas"
//     options={[
//       ...(dropdownOptions.guidanceAreas || []).map((opt) => ({ label: opt, value: opt })),
//       { label: 'Other', value: 'Other' }
//     ]}
//     onChange={(selected) => {
//       const values = selected.map((opt) => opt.value);
//       setTeacherDetails((prev) => ({
//         ...prev,
//         guidanceAreas: values.filter((val) => val !== 'Other'),
//       }));
//     }}
//     value={(teacherDetails.guidanceAreas || []).map((val) => ({ label: val, value: val }))}
//   />
//   {teacherDetails.guidanceAreas?.includes('Other') && (
//     <div className="mt-2">
//       <Form.Control
//         type="text"
//         placeholder="Enter custom guidance area"
//         value={customGuidanceArea}
//         onChange={(e) => setCustomGuidanceArea(e.target.value)}
//       />
//       <Button className="mt-2" onClick={() => {
//         if (customGuidanceArea.trim()) {
//           setTeacherDetails((prev) => ({
//             ...prev,
//             guidanceAreas: [...(prev.guidanceAreas || []), customGuidanceArea],
//           }));
//           setCustomGuidanceArea('');
//         }
//       }}>Add</Button>
//     </div>
//   )}
// </Form.Group>
// <Form.Group controlId="interactionModes">
//   <Form.Label>Preferred Modes of Interaction</Form.Label>
//   <Select
//     isMulti
//     name="interactionModes"
//     options={(dropdownOptions.interactionModes || []).map((opt) => ({ label: opt, value: opt }))}
//     onChange={(selected) => {
//       const values = selected.map((opt) => opt.value);
//       setTeacherDetails((prev) => ({
//         ...prev,
//         interactionModes: values,
//       }));
//     }}
//     value={(teacherDetails.interactionModes || []).map((val) => ({ label: val, value: val }))}
//   />
// </Form.Group>
// <Form.Group controlId="mentorshipTopics">
//   <Form.Label>Topics You Can Mentor On</Form.Label>
//   <Select
//     isMulti
//     name="mentorshipTopics"
//     options={[
//       ...(dropdownOptions.mentorshipTopics || []).map((opt) => ({ label: opt, value: opt })),
//       { label: 'Other', value: 'Other' }
//     ]}
//     onChange={(selected) => {
//       const values = selected.map((opt) => opt.value);
//       setTeacherDetails((prev) => ({
//         ...prev,
//         mentorshipTopics: values.filter((val) => val !== 'Other'),
//       }));
//     }}
//     value={(teacherDetails.mentorshipTopics || []).map((val) => ({ label: val, value: val }))}
//   />
//   {teacherDetails.mentorshipTopics?.includes('Other') && (
//     <div className="mt-2">
//       <Form.Control
//         type="text"
//         placeholder="Enter custom mentorship topic"
//         value={customMentorshipTopic}
//         onChange={(e) => setCustomMentorshipTopic(e.target.value)}
//       />
//       <Button className="mt-2" onClick={() => {
//         if (customMentorshipTopic.trim()) {
//           setTeacherDetails((prev) => ({
//             ...prev,
//             mentorshipTopics: [...(prev.mentorshipTopics || []), customMentorshipTopic],
//           }));
//           setCustomMentorshipTopic('');
//         }
//       }}>Add</Button>
//     </div>
//   )}
// </Form.Group>
// <Form.Group controlId="contributedResources">
//   <Form.Label>Resources You Can Contribute</Form.Label>
//   <Select
//     isMulti
//     name="contributedResources"
//     options={(dropdownOptions.contributedResources || []).map((opt) => ({ label: opt, value: opt }))}
//     onChange={(selected) => {
//       const values = selected.map((opt) => opt.value);
//       setTeacherDetails((prev) => ({
//         ...prev,
//         contributedResources: values,
//       }));
//     }}
//     value={(teacherDetails.contributedResources || []).map((val) => ({ label: val, value: val }))}
//   />
// </Form.Group>


//                 <Form.Group className="mt-3">
//                   <Form.Label>Are you interested in mentorship?</Form.Label>
//                   <ToggleButtonGroup
//                     type="radio"
//                     name="mentorshipInterest"
//                     value={teacherDetails.mentorshipInterest ? 'yes' : 'no'}
//                     onChange={(val) =>
//                       setTeacherDetails((prev) => ({
//                         ...prev,
//                         mentorshipInterest: val === 'yes',
//                       }))
//                     }
//                   >
//                     <ToggleButton id="mentorship-yes" value="yes" variant="outline-success">Yes</ToggleButton>
//                     <ToggleButton id="mentorship-no" value="no" variant="outline-danger">No</ToggleButton>
//                   </ToggleButtonGroup>
//                 </Form.Group>

//                 <Form.Group className="mt-3">
//                   <Form.Label>Connect with other teachers?</Form.Label>
//                   <ToggleButtonGroup
//                     type="radio"
//                     name="connectWithPeers"
//                     value={teacherDetails.connectWithPeers ? 'yes' : 'no'}
//                     onChange={(val) =>
//                       setTeacherDetails((prev) => ({
//                         ...prev,
//                         connectWithPeers: val === 'yes',
//                       }))
//                     }
//                   >
//                     <ToggleButton id="connect-yes" value="yes" variant="outline-success">Yes</ToggleButton>
//                     <ToggleButton id="connect-no" value="no" variant="outline-danger">No</ToggleButton>
//                   </ToggleButtonGroup>
//                 </Form.Group>
//               </Accordion.Body>
//             </Accordion.Item>
//           </Accordion>

//           <Button className="mt-4" type="submit" variant="success">Save Details</Button>
//         </Form>
//       </Card>
      
//     ) : (<Card className="p-3">
//       <h4 className="mb-3">Profile Details</h4>
//       <p><strong>Full Name:</strong> {teacherDetails.fullName}</p>
//       <p><strong>Email:</strong> {teacherDetails.email}</p>
//       <p><strong>Phone Number:</strong> {teacherDetails.phoneNumber}</p>
//       <p><strong>Highest Education:</strong> {teacherDetails.highestEducation}</p>
//       <p><strong>Subjects:</strong> {teacherDetails.subjects.join(', ')}</p>
//       <p><strong>Years of Experience:</strong> {teacherDetails.yearsOfExperience}</p>
//       <p><strong>Career Interests:</strong> {teacherDetails.careerInterests.join(', ')}</p>
//       <p><strong>Areas Where Students Need Most Guidance:</strong> {(teacherDetails.guidanceAreas || []).join(', ')}</p>
// <p><strong>Preferred Modes of Interaction:</strong> {(teacherDetails.interactionModes || []).join(', ')}</p>
// <p><strong>Topics You Can Mentor On:</strong> {(teacherDetails.mentorshipTopics || []).join(', ')}</p>
// <p><strong>Resources You Can Contribute:</strong> {(teacherDetails.contributedResources || []).join(', ')}</p>

//       <p><strong>Mentorship Interest:</strong> {teacherDetails.mentorshipInterest ? 'Yes' : 'No'}</p>
//       <p><strong>Connect with Peers:</strong> {teacherDetails.connectWithPeers ? 'Yes' : 'No'}</p>
//       <Button variant="primary" onClick={handleEdit}>Edit Details</Button>
//     </Card>
      
//     )}
//   </Container>
// );
// };

// export default TeacherDashboard;







// import React, { useState, useEffect } from 'react';
// import { Form, Button, Row, Col } from 'react-bootstrap';
// import Select from 'react-select';

// const TeacherDashboard = () => {
//   const [user, setUser] = useState(null);
//   const [teacherDetails, setTeacherDetails] = useState({
//     fullName: '',
//     email: '',
//     role: '',
//     phoneNumber: '',
//     highestEducation: '',
//     subjects: '',
//     yearsOfExperience: '',
//     careerInterests: [],
//     mentorshipInterest: '',
//     connectWithPeers: '',
//     guidanceAreas: [],
//     interactionModes: [],
//     mentorshipTopics: '',
//     contributedResources: '',
//   });

//   const [dropdownOptions, setDropdownOptions] = useState({
//     careerInterests: [],
//     guidanceAreas: [],
//     interactionModes: [],
//     mentorshipTopics: [],
//     contributedResources: [],
//   });

//   const [formCompleted, setFormCompleted] = useState(false);

//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem("user"));
//     if (userData) {
//       setUser(userData);
//       fetchUserDetails(userData.id);
//       fetchDropdownOptions();
//     }
//   }, []);

//   const fetchUserDetails = async (userId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/user-details/${userId}`);
//       const data = await response.json();
//       if (response.ok) {
//         setTeacherDetails({
//           fullName: data.user.full_name,
//           email: data.user.email,
//           role: data.user.role,
//           phoneNumber: data.details.phone_number || '',
//           highestEducation: data.details.highest_education || '',
//           subjects: data.details.subjects?.join(', ') || '',
//           yearsOfExperience: data.details.years_of_experience || '',
//           careerInterests: data.details.career_interests || [],
//           mentorshipInterest: data.details.mentorship_interest || '',
//           connectWithPeers: data.details.connect_with_peers || '',
//           guidanceAreas: data.details.guidance_areas || [],
//           interactionModes: data.details.interaction_modes || [],
//           mentorshipTopics: data.details.mentorship_topics || '',
//           contributedResources: data.details.contributed_resources || '',
//         });
//         setFormCompleted(data.is_detailsfilled);
//       }
//     } catch (error) {
//       console.error('Error fetching teacher details:', error);
//     }
//   };

//   const fetchDropdownOptions = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/dropdown-options');
//       const data = await response.json();
//       setDropdownOptions({
//         careerInterests: data.careerInterests.map((interest) => ({ label: interest, value: interest })),
//         guidanceAreas: data.guidanceAreas.map((area) => ({ label: area, value: area })),
//         interactionModes: data.interactionModes.map((mode) => ({ label: mode, value: mode })),
//         mentorshipTopics: data.mentorshipTopics.map((topic) => ({ label: topic, value: topic })),
//         contributedResources: data.contributedResources.map((resource) => ({ label: resource, value: resource })),
//       });
//     } catch (error) {
//       console.error('Error fetching dropdown options:', error);
//     }
//   };

//   const handleChange = (e, name) => {
//     const { value } = e;
//     setTeacherDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Handle the form submission logic here
//   };

//   return (
//     <div style={{marginTop:"40px",width:"60vw"}}>
//       <h3>Teacher Dashboard</h3>
//       <Form onSubmit={handleSubmit}>
//         <Row className="mb-3">
//           {/* Full Name */}
//           <Form.Group as={Col} controlId="fullName">
//             <Form.Label>Full Name</Form.Label>
//             <Form.Control
//               type="text"
//               name="fullName"
//               value={teacherDetails.fullName}
//               onChange={(e) => handleChange(e.target.value, 'fullName')}
//               disabled
//             />
//           </Form.Group>

//           {/* Email */}
//           <Form.Group as={Col} controlId="email">
//             <Form.Label>Email</Form.Label>
//             <Form.Control
//               type="email"
//               name="email"
//               value={teacherDetails.email}
//               onChange={(e) => handleChange(e.target.value, 'email')}
//               disabled
//             />
//           </Form.Group>

//           <Form.Group as={Col} controlId="role">
//             <Form.Label>Role</Form.Label>
//             <Form.Control
//               type="text"
//               name="role"
//               value={teacherDetails.role}
//               onChange={(e) => handleChange(e.target.value, 'role')}
//               disabled
//             />
//           </Form.Group>
//         </Row>

//         <Row className="mb-3">
//           {/* Phone Number */}
//           <Form.Group as={Col} controlId="phoneNumber">
//             <Form.Label>Phone Number</Form.Label>
//             <Form.Control
//               type="text"
//               name="phoneNumber"
//               value={teacherDetails.phoneNumber}
//               onChange={(e) => handleChange(e.target.value, 'phoneNumber')}
//               required
//             />
//           </Form.Group>
//         </Row>

//         <Row className="mb-3">
//           {/* Highest Education */}
//           <Form.Group as={Col} controlId="highestEducation">
//             <Form.Label>Highest Education</Form.Label>
//             <Form.Control
//               type="text"
//               name="highestEducation"
//               value={teacherDetails.highestEducation}
//               onChange={(e) => handleChange(e.target.value, 'highestEducation')}
//               required
//             />
//           </Form.Group>
//         </Row>
//         <Row className="mb-3">
//           {/* Subjects */}
//           <Form.Group as={Col} controlId="subjects">
//             <Form.Label>Languages Known</Form.Label>
//             <Form.Control
//               type="text"
//               name="subjects"
//               value={teacherDetails.subjects}
//               onChange={(e) => handleChange(e.target.value, 'subjects')}
//               required
//             />
//           </Form.Group>
//         </Row>

//         <Row className="mb-3">
//           {/* Career Interests (Multi-Select) */}
//           <Form.Group as={Col} controlId="careerInterests">
//             <Form.Label>Career Interests</Form.Label>
//             <Select
//               isMulti
//               options={dropdownOptions.careerInterests}
//               value={teacherDetails.careerInterests.map(interest => ({ label: interest, value: interest }))}
//               onChange={(selected) => handleChange({ value: selected.map(option => option.value) }, 'careerInterests')}
//             />
//           </Form.Group>
//           </Row>
//           <Row className="mb-3">
//           {/* Guidance Areas (Multi-Select) */}
//           <Form.Group as={Col} controlId="guidanceAreas">
//             <Form.Label>Guidance Areas</Form.Label>
//             <Select
//               isMulti
//               options={dropdownOptions.guidanceAreas}
//               value={teacherDetails.guidanceAreas.map(area => ({ label: area, value: area }))}
//               onChange={(selected) => handleChange({ value: selected.map(option => option.value) }, 'guidanceAreas')}
//             />
//           </Form.Group>
//         </Row>

//         <Row className="mb-3">
//           {/* Interaction Modes (Multi-Select) */}
//           <Form.Group as={Col} controlId="interactionModes">
//             <Form.Label>Interaction Modes</Form.Label>
//             <Select
//               isMulti
//               options={dropdownOptions.interactionModes}
//               value={teacherDetails.interactionModes.map(mode => ({ label: mode, value: mode }))}
//               onChange={(selected) => handleChange({ value: selected.map(option => option.value) }, 'interactionModes')}
//             />
//           </Form.Group>
//         </Row>
//         <Row className="mb-3">
//           {/* Mentorship Topics */}
//           <Form.Group as={Col} controlId="mentorshipTopics">
//             <Form.Label>Mentorship Topics</Form.Label>
//             <Form.Control
//               type="text"
//               name="mentorshipTopics"
//               value={teacherDetails.mentorshipTopics}
//               onChange={(e) => handleChange(e.target.value, 'mentorshipTopics')}
//               required
//             />
//           </Form.Group>
//         </Row>

//         <Row className="mb-3">
//           {/* Contributed Resources */}
//           <Form.Group as={Col} controlId="contributedResources">
//             <Form.Label>Contributed Resources</Form.Label>
//             <Form.Control
//               type="text"
//               name="contributedResources"
//               value={teacherDetails.contributedResources}
//               onChange={(e) => handleChange(e.target.value, 'contributedResources')}
//               required
//             />
//           </Form.Group>
//         </Row>

//         <Button type="submit" disabled={!formCompleted}>
//           Save Details
//         </Button>
//       </Form>
//     </div>
//   );
// };

// export default TeacherDashboard;


import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';


const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState({
    fullName: '',
    email: '',
    role: '',
    phoneNumber: '',
    highestEducation: '',
    subjects: '',
    yearsOfExperience: '',
    careerInterests: [],
    mentorshipInterest: false,
    connectWithPeers: false,
    guidanceAreas: [],
    interactionModes: [],
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    careerInterests: [],
    guidanceAreas: [],
    interactionModes: [],
  });

  const [formCompleted, setFormCompleted] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      console.log("User Data from localStorage:", userData);  // Log the values
      setUser(userData);
      fetchUserDetails(userData.id);
      fetchDropdownOptions();
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
          role: data.user.role,
          phoneNumber: data.details.phone_number || '',
          highestEducation: data.details.highest_education || '',
          subjects: data.details.subjects?.join(', ') || '',
          yearsOfExperience: data.details.years_of_experience || '',
          careerInterests: data.details.career_interests || [],
          mentorshipInterest: data.details.mentorship_interest || false,
          connectWithPeers: data.details.connect_with_peers || false,
          guidanceAreas: data.details.guidance_areas || [],
          interactionModes: data.details.interaction_modes || [],
        });
        setFormCompleted(data.is_detailsfilled);
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dropdown-options');
      const data = await response.json();
      setDropdownOptions({
        careerInterests: data.careerInterests.map((interest) => ({ label: interest, value: interest })),
        guidanceAreas: data.guidanceAreas.map((area) => ({ label: area, value: area })),
        interactionModes: data.interactionModes.map((mode) => ({ label: mode, value: mode })),
      });
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };

  const handleChange = (selectedOptions, name) => {
    const value = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setTeacherDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleToggle = (e, name) => {
    setTeacherDetails((prevDetails) => ({
      ...prevDetails,
      [name]: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the full teacher details to include fullName and email
    const updatedTeacherDetails = {
      ...teacherDetails,
      fullName: user?.full_name || "",  // Make sure fullName is set
      email: user?.email || "",         // Make sure email is set
    };
  
    console.log("Updated Teacher Details:", updatedTeacherDetails); // Log to check
  
    try {
      const response = await fetch(`http://localhost:5000/api/teacher-details/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTeacherDetails),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Details saved successfully!');
        setFormCompleted(true);
      } else {
        const errorData = await response.json();
        console.error('Failed to save details:', errorData);
        alert('Failed to save details. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form.');
    }
  };
  
  
  return (
    <div style={{ marginTop: "40px", width: "60vw" }}>
      <h3>Teacher Dashboard</h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          {/* Full Name */}
          <Form.Group as={Col} controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={teacherDetails.fullName}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, fullName: e.target.value })}
              disabled
            />
          </Form.Group>

          {/* Email */}
          <Form.Group as={Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={teacherDetails.email}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, email: e.target.value })}
              disabled
            />
          </Form.Group>

          {/* Role */}
          <Form.Group as={Col} controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              name="role"
              value={teacherDetails.role}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, role: e.target.value })}
              disabled
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Phone Number */}
          <Form.Group as={Col} controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={teacherDetails.phoneNumber}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, phoneNumber: e.target.value })}
              required
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Highest Education */}
          <Form.Group as={Col} controlId="highestEducation">
            <Form.Label>Highest Education</Form.Label>
            <Form.Control
              type="text"
              name="highestEducation"
              value={teacherDetails.highestEducation}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, highestEducation: e.target.value })}
              required
            />
          </Form.Group>

          {/* Years of Experience */}
          <Form.Group as={Col} controlId="yearsOfExperience">
            <Form.Label>Years of Experience</Form.Label>
            <Form.Control
              type="number"
              name="yearsOfExperience"
              value={teacherDetails.yearsOfExperience}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, yearsOfExperience: e.target.value })}
              min="0"
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Subjects */}
          <Form.Group as={Col} controlId="subjects">
            <Form.Label>Languages Known</Form.Label>
            <Form.Control
              type="text"
              name="subjects"
              value={teacherDetails.subjects}
              onChange={(e) => setTeacherDetails({ ...teacherDetails, subjects: e.target.value })}
              required
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Career Interests (Multi-Select) */}
          <Form.Group as={Col} controlId="careerInterests">
            <Form.Label>Career Interests</Form.Label>
            <Select
              isMulti
              options={dropdownOptions.careerInterests}
              value={dropdownOptions.careerInterests.filter(option => teacherDetails.careerInterests.includes(option.value))}
              onChange={(selected) => handleChange(selected, 'careerInterests')}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Guidance Areas (Multi-Select) */}
          <Form.Group as={Col} controlId="guidanceAreas">
            <Form.Label>Guidance Areas</Form.Label>
            <Select
              isMulti
              options={dropdownOptions.guidanceAreas}
              value={dropdownOptions.guidanceAreas.filter(option => teacherDetails.guidanceAreas.includes(option.value))}
              onChange={(selected) => handleChange(selected, 'guidanceAreas')}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Interaction Modes (Multi-Select) */}
          <Form.Group as={Col} controlId="interactionModes">
            <Form.Label>Interaction Modes</Form.Label>
            <Select
              isMulti
              options={dropdownOptions.interactionModes}
              value={dropdownOptions.interactionModes.filter(option => teacherDetails.interactionModes.includes(option.value))}
              onChange={(selected) => handleChange(selected, 'interactionModes')}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Mentorship Interest Toggle */}
          <Form.Group as={Col} controlId="mentorshipInterest">
            <Form.Label>Mentorship Interest</Form.Label>
            <Form.Check
              type="checkbox"
              checked={teacherDetails.mentorshipInterest}
              onChange={(e) => handleToggle(e, 'mentorshipInterest')}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          {/* Connect With Peers Toggle */}
          <Form.Group as={Col} controlId="connectWithPeers">
            <Form.Label>Connect with Peers</Form.Label>
            <Form.Check
              type="checkbox"
              checked={teacherDetails.connectWithPeers}
              onChange={(e) => handleToggle(e, 'connectWithPeers')}
            />
          </Form.Group>
        </Row>

        <Button type="submit" disabled={!formCompleted}>
          Save Details
        </Button>
        <div style={{ marginTop: '20px' }}>
  <Button
    variant="success"
    onClick={() => navigate('/create-meeting')}
    disabled={!formCompleted}
  >
    Create Meeting
  </Button>
  {!formCompleted && (
    <p style={{ color: 'red', marginTop: '10px' }}>
      Please complete your profile to create meetings.
    </p>
  )}
</div>

      </Form>
    </div>
  );
};

export default TeacherDashboard;

