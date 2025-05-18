// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Form,
//   Button,
//   Table,
//   Row,
//   Col,
//   Container,
//   InputGroup,
// } from 'react-bootstrap';
// import { Search, Filter } from 'lucide-react';

// const CollegeFilter = () => {
//   const [colleges, setColleges] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     State: '',
//     District: '',
//     Location: '',
//     UniversityType: '',
//   });

//   const [filterOptions, setFilterOptions] = useState({
//     State: [],
//     Location: [],
//     UniversityType: [],
//   });

//   const [stateDistrictMap, setStateDistrictMap] = useState({});

//   useEffect(() => {
//     const fetchFilterOptions = async () => {
//       try {
//         const response = await axios.get('http://localhost:5001/api/filters');
//         setFilterOptions({
//           State: response.data.State,
//           Location: response.data.Location,
//           UniversityType: response.data.UniversityType,
//         });
//         setStateDistrictMap(response.data.StateDistrictMap);
//       } catch (error) {
//         console.error('Error fetching filter options:', error);
//       }
//     };

//     fetchFilterOptions();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//       ...(name === 'State' ? { District: '' } : {}),
//     }));
//   };

//   const fetchColleges = async () => {
//     try {
//       const response = await axios.get('http://localhost:5001/api/colleges', {
//         params: {
//           ...filters,
//           Name: searchTerm,
//         },
//       });
//       setColleges(response.data);
//     } catch (error) {
//       console.error('Error fetching colleges:', error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetchColleges();
//   };

//   const filteredDistricts = filters.State
//     ? stateDistrictMap[filters.State] || []
//     : [];

//   return (
//     <Container className="mt-4 shadow p-4 rounded bg-light">
//       <h3 className="mb-4 text-center">🎓 College Finder</h3>
//       <Form onSubmit={handleSubmit}>
//         <Row className="mb-3">
//           <Col md={6}>
//             <InputGroup>
//               <InputGroup.Text>
//                 <Search />
//               </InputGroup.Text>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by college name"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </InputGroup>
//           </Col>
//           <Col md={6} className="text-end">
//             <Button type="submit" variant="primary">
//               <Filter size={16} className="me-1" /> Apply Filters
//             </Button>
//           </Col>
//         </Row>

//         <Row className="g-3">
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>State</Form.Label>
//               <Form.Select
//                 name="State"
//                 value={filters.State}
//                 onChange={handleChange}
//               >
//                 <option value="">Select State</option>
//                 {filterOptions.State.map((state, idx) => (
//                   <option key={idx} value={state}>
//                     {state}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>District</Form.Label>
//               <Form.Select
//                 name="District"
//                 value={filters.District}
//                 onChange={handleChange}
//               >
//                 <option value="">Select District</option>
//                 {filteredDistricts.map((district, idx) => (
//                   <option key={idx} value={district}>
//                     {district}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Location</Form.Label>
//               <Form.Select
//                 name="Location"
//                 value={filters.Location}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Location</option>
//                 {filterOptions.Location.map((location, idx) => (
//                   <option key={idx} value={location}>
//                     {location}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>University Type</Form.Label>
//               <Form.Select
//                 name="UniversityType"
//                 value={filters.UniversityType}
//                 onChange={handleChange}
//               >
//                 <option value="">Select University Type</option>
//                 {filterOptions.UniversityType.map((type, idx) => (
//                   <option key={idx} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>
//       </Form>

//       {colleges.length > 0 && (
//         <div className="mt-4 table-responsive">
//           <Table bordered hover striped>
//             <thead className="table-primary">
//               <tr>
//                 <th>#</th>
//                 <th>Name</th>
//                 <th>State</th>
//                 <th>District</th>
//                 <th>Location</th>
//                 <th>University</th>
//                 <th>Type</th>
//                 <th>Year</th>
//               </tr>
//             </thead>
//             <tbody>
//               {colleges.map((college, index) => (
//                 <tr key={index}>
//                   <td>{college['Serial Number']}</td>
//                   <td>{college['Name']}</td>
//                   <td>{college['State']}</td>
//                   <td>{college['District']}</td>
//                   <td>{college['Location']}</td>
//                   <td>{college['University Name']}</td>
//                   <td>{college['College Type']}</td>
//                   <td>{college['Year Of Establishment']}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default CollegeFilter;






// import React, { useState } from 'react';
// import axios from 'axios';
// import { Button, Container, Form, Row, Col, Table, Spinner, Accordion } from 'react-bootstrap';

// const CollegeDetails = () => {
//   const [filters, setFilters] = useState({
//     state: '',
//     program: '',
//     level: '',
//     institutiontype: ''
//   });

//   const [colleges, setColleges] = useState([]);
//   const [selectedCourses, setSelectedCourses] = useState({});
//   const [selectedStaff, setSelectedStaff] = useState({});  // New state to hold staff details
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const fetchColleges = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get("http://localhost:5001/api/aicte-colleges", {
//         params: filters
//       });
//       setColleges(res.data);
//     } catch (error) {
//       console.error("Error fetching colleges:", error.message);
//     }
//     setLoading(false);
//   };

//   const fetchCourseDetails = async (aicteId) => {
//     try {
//       const res = await axios.get("http://localhost:5001/api/aicte-course-details", {
//         params: { aicteid: aicteId }
//       });
//       console.log("Fetched course details for ", aicteId, " : ", res.data);  // Check the course data
//       setSelectedCourses(prev => ({ ...prev, [aicteId]: res.data }));
//     } catch (error) {
//       console.error("Error fetching course details:", error.message);
//     }
//   };

//   const fetchStaffDetails = async (aicteId) => {
//     try {
//       const res = await axios.get('http://localhost:5001/api/fetch-staff', {
//         params: {
//           aicteid: aicteId,
//           pid: '1-9722913', // Optional: Modify this based on your needs
//           year: '2024-2025' // Optional: Modify this based on your needs
//         }
//       });
//       setSelectedStaff(prev => ({ ...prev, [aicteId]: res.data }));
//     } catch (error) {
//       console.error("Error fetching staff details:", error.message);
//     }
//   };

//   const programs = [
//     "Applied Arts and Crafts", "Architecture and Town Planning", "Architecture",
//     "Town Planning", "Planning", "Engineering and Technology", "Hotel Management and Catering",
//     "Management", "MCA", "Computer Applications", "Pharmacy"
//   ];

//   const levels = ["UG", "PG", "DIPLOMA"];

//   const institutionTypes = [
//     "Central University", "Deemed to be University(Govt)", "Deemed to be University(Pvt)",
//     "Deemed University(Government)", "Deemed University(Private)", "Government", "Govt aided",
//     "Private-Aided", "Private-Self Financing", "State Government University",
//     "State Private University", "Unaided - Private", "University Managed",
//     "University Managed-Govt", "University Managed-Private"
//   ];

//   const states = [
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//     "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//     "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
//     "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
//     "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
//     "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
//     "Ladakh", "Lakshadweep", "Puducherry"
//   ];

//   return (
//     <Container className="mt-5">
//       <h2 className="mb-4 text-primary">AICTE College & Course Finder</h2>

//       <Form className="mb-4">
//         <Row>
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>State</Form.Label>
//               <Form.Select name="state" value={filters.state} onChange={handleChange}>
//                 <option value="">Select State</option>
//                 {states.map((state, idx) => (
//                   <option key={idx} value={state}>{state}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Program</Form.Label>
//               <Form.Select name="program" value={filters.program} onChange={handleChange}>
//                 <option value="">Select Program</option>
//                 {programs.map((program, idx) => (
//                   <option key={idx} value={program}>{program}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Level</Form.Label>
//               <Form.Select name="level" value={filters.level} onChange={handleChange}>
//                 <option value="">Select Level</option>
//                 {levels.map((level, idx) => (
//                   <option key={idx} value={level}>{level}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Institution Type</Form.Label>
//               <Form.Select name="institutiontype" value={filters.institutiontype} onChange={handleChange}>
//                 <option value="">Select Type</option>
//                 {institutionTypes.map((type, idx) => (
//                   <option key={idx} value={type}>{type}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Button className="mt-3" variant="primary" onClick={fetchColleges} disabled={loading}>
//           {loading ? <Spinner animation="border" size="sm" /> : "Fetch Colleges"}
//         </Button>
//       </Form>

//       {colleges.length > 0 && (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>AICTE ID</th>
//               <th>Name</th>
//               <th>Address</th>
//               <th>District</th>
//               <th>Type</th>
//               <th>Women</th>
//               <th>Minority</th>
//               <th>Course Details</th>
//               <th>Staff Details</th> {/* Added new column for staff */}
//             </tr>
//           </thead>
//           <tbody>
//             {colleges.map((college, index) => (
//               <React.Fragment key={index}>
//                 <tr>
//                   <td>{index + 1}</td>
//                   <td>{college[0]}</td>
//                   <td>{college[1]}</td>
//                   <td>{college[2]}</td>
//                   <td>{college[3]}</td>
//                   <td>{college[4]}</td>
//                   <td>{college[5]}</td>
//                   <td>{college[6]}</td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="info"
//                       onClick={() => fetchCourseDetails(college[0])}
//                     >
//                       View
//                     </Button>
//                   </td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="success"
//                       onClick={() => fetchStaffDetails(college[0])} // Fetch staff details on click
//                     >
//                       View Staff
//                     </Button>
//                   </td>
//                 </tr>
//                 {selectedStaff[college[0]] && ( // Display staff details if available
//                   <tr>
//                     <td colSpan="10">
//                       <Accordion>
//                         <Accordion.Item eventKey="1">
//                           <Accordion.Header>Staff Details</Accordion.Header>
//                           <Accordion.Body>
//                             <Table striped bordered hover responsive size="sm">
//                               <thead>
//                                 <tr>
//                                   <th>Staff Name</th>
//                                   <th>Designation</th>
//                                   <th>Email</th>
//                                   <th>Contact</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {selectedStaff[college[0]].map((staff, idx) => (
//                                   <tr key={idx}>
//                                     <td>{staff.name}</td>
//                                     <td>{staff.designation}</td>
//                                     <td>{staff.email}</td>
//                                     <td>{staff.contact}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </Table>
//                           </Accordion.Body>
//                         </Accordion.Item>
//                       </Accordion>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </Table>
//       )}
//     </Container>
//   );
// };

// export default CollegeDetails;



// import React, { useState } from 'react';
// import axios from 'axios';
// import { Button, Container, Form, Row, Col, Table, Spinner, Accordion } from 'react-bootstrap';

// const CollegeDetails = () => {
//   const [filters, setFilters] = useState({
//     state: '',
//     program: '',
//     level: '',
//     institutiontype: ''
//   });

//   const [colleges, setColleges] = useState([]);
//   const [selectedCourses, setSelectedCourses] = useState({});
//   const [selectedStaff, setSelectedStaff] = useState({}); // Stores staff details for each college
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const fetchColleges = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get("http://localhost:5001/api/aicte-colleges", {
//         params: filters
//       });
//       setColleges(res.data);
//     } catch (error) {
//       console.error("Error fetching colleges:", error.message);
//     }
//     setLoading(false);
//   };

//   const fetchCourseDetails = async (aicteId) => {
//     try {
//       const res = await axios.get("http://localhost:5001/api/aicte-course-details", {
//         params: { aicteid: aicteId }
//       });
//       setSelectedCourses(prev => ({ ...prev, [aicteId]: res.data }));
//     } catch (error) {
//       console.error("Error fetching course details:", error.message);
//     }
//   };
//   const fetchStaffDetails = async (aicteId) => {
//     try {
//       const courseData = selectedCourses[aicteId];
//       if (!courseData || courseData.length === 0) {
//         console.warn("No course data available. Please fetch course details first.");
//         return;
//       }
  
//       const pid = courseData[0][1]; // Adjust the index if needed
  
//       const response = await axios.get('http://localhost:5001/api/faculty-details', {
//         params: {
//           aicteid: aicteId,
//           pid: pid,
//           year: '2024-2025'
//         }
//       });
  
//       // Log the response to check if the data is being received correctly
//       console.log("Fetched staff details:", response.data);
  
//       // Update the state with the staff data
//       setSelectedStaff(prev => ({
//         ...prev,
//         [aicteId]: response.data || []
//       }));
//     } catch (err) {
//       console.error('Error fetching staff details:', err);
//     }
//   };
  

//   const programs = [
//     "Applied Arts and Crafts", "Architecture and Town Planning", "Architecture",
//     "Town Planning", "Planning", "Engineering and Technology", "Hotel Management and Catering",
//     "Management", "MCA", "Computer Applications", "Pharmacy"
//   ];

//   const levels = ["UG", "PG", "DIPLOMA"];

//   const institutionTypes = [
//     "Central University", "Deemed to be University(Govt)", "Deemed to be University(Pvt)",
//     "Deemed University(Government)", "Deemed University(Private)", "Government", "Govt aided",
//     "Private-Aided", "Private-Self Financing", "State Government University",
//     "State Private University", "Unaided - Private", "University Managed",
//     "University Managed-Govt", "University Managed-Private"
//   ];

//   const states = [
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//     "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//     "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
//     "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
//     "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
//     "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
//     "Ladakh", "Lakshadweep", "Puducherry"
//   ];

//   return (
//     <Container className="mt-5">
//       <h2 className="mb-4 text-primary">AICTE College & Course Finder</h2>

//       <Form className="mb-4">
//         <Row>
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>State</Form.Label>
//               <Form.Select name="state" value={filters.state} onChange={handleChange}>
//                 <option value="">Select State</option>
//                 {states.map((state, idx) => (
//                   <option key={idx} value={state}>{state}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Program</Form.Label>
//               <Form.Select name="program" value={filters.program} onChange={handleChange}>
//                 <option value="">Select Program</option>
//                 {programs.map((program, idx) => (
//                   <option key={idx} value={program}>{program}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Level</Form.Label>
//               <Form.Select name="level" value={filters.level} onChange={handleChange}>
//                 <option value="">Select Level</option>
//                 {levels.map((level, idx) => (
//                   <option key={idx} value={level}>{level}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Institution Type</Form.Label>
//               <Form.Select name="institutiontype" value={filters.institutiontype} onChange={handleChange}>
//                 <option value="">Select Type</option>
//                 {institutionTypes.map((type, idx) => (
//                   <option key={idx} value={type}>{type}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Button className="mt-3" variant="primary" onClick={fetchColleges} disabled={loading}>
//           {loading ? <Spinner animation="border" size="sm" /> : "Fetch Colleges"}
//         </Button>
//       </Form>

//       {colleges.length > 0 && (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>AICTE ID</th>
//               <th>Name</th>
//               <th>Address</th>
//               <th>District</th>
//               <th>Type</th>
//               <th>Women</th>
//               <th>Minority</th>
//               <th>Course Details</th>
//               <th>Staff Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             {colleges.map((college, index) => (
//               <React.Fragment key={index}>
//                 <tr>
//                   <td>{index + 1}</td>
//                   <td>{college[0]}</td>
//                   <td>{college[1]}</td>
//                   <td>{college[2]}</td>
//                   <td>{college[3]}</td>
//                   <td>{college[4]}</td>
//                   <td>{college[5]}</td>
//                   <td>{college[6]}</td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="info"
//                       onClick={() => fetchCourseDetails(college[0])}
//                     >
//                       View
//                     </Button>
//                   </td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="success"
//                       onClick={() => fetchStaffDetails(college[0])} // Fetch staff details dynamically
//                     >
//                       View Staff
//                     </Button>
//                   </td>
//                 </tr>

//                 {selectedCourses[college[0]] && (
//                   <tr>
//                     <td colSpan="9">
//                       <Accordion>
//                         <Accordion.Item eventKey="0">
//                           <Accordion.Header>Course Details</Accordion.Header>
//                           <Accordion.Body>
//                             <Table striped bordered hover responsive size="sm">
//                               <thead>
//                                 <tr>
//                                   <th>Course Name</th>
//                                   <th>Level</th>
//                                   <th>Shift</th>
//                                   <th>Type</th>
//                                   <th>Intake</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {selectedCourses[college[0]].map((course, idx) => (
//                                   <tr key={idx}>
//                                     <td>{course[6]}</td>
//                                     <td>{course[5]}</td>
//                                     <td>{course[8]}</td>
//                                     <td>{course[7]}</td>
//                                     <td>{course[9]}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </Table>
//                           </Accordion.Body>
//                         </Accordion.Item>
//                       </Accordion>
//                     </td>
//                   </tr>
//                 )}

// {selectedStaff[college[0]] && selectedStaff[college[0]].length > 0 && (
//   <tr>
//     <td colSpan="9">
//       <Table striped bordered hover responsive size="sm">
//         <thead>
//           <tr>
//             <th>Staff Name</th>
//             <th>Designation</th>
//             <th>Gender</th>
//             <th>Department</th>
//           </tr>
//         </thead>
//         <tbody>
//           {selectedStaff[college[0]].map((staff, idx) => (
//             <tr key={idx}>
//               <td>{staff[1]}</td> {/* Staff Name */}
//               <td>{staff[3]}</td> {/* Designation */}
//               <td>{staff[2]}</td> {/* Gender */}
//               <td>{staff[5]}</td> {/* Department */}
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </td>
//   </tr>
// )}

//               </React.Fragment>
//             ))}
//           </tbody>
//         </Table>
//       )}
//     </Container>
//   );
// };

// export default CollegeDetails;




import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Form, Row, Col, Card, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { Search, MapPin, School, User } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';


const CollegeDetails = () => {
  const [filters, setFilters] = useState({
    state: '',
    program: '',
    level: '',
    institutiontype: ''
  });

  const [colleges, setColleges] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [selectedStaff, setSelectedStaff] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [collegeSummary, setCollegeSummary] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentCollegeId, setCurrentCollegeId] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const navigate=useNavigate();
  
  const handleGoBack = () => {
    navigate("/student-dashboard"); // Navigate back to previous page
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchCollegeSummary = async (collegeName, address) => {
    try {
      const res = await axios.post('http://localhost:5001/api/college-summary', {
        college_name: collegeName,
        address: address
      });
      const summary = res.data.choices?.[0]?.message?.content || 'No summary available.';
      setCollegeSummary(summary);
      setShowSummaryModal(true);
    } catch (err) {
      setError('Error fetching AI summary: ' + err.message);
    }
  };

  const fetchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5001/api/aicte-colleges", {
        params: filters
      });
      if (res.data.message) {
        setError(res.data.message);
      } else {
        setColleges(res.data);
      }
    } catch (error) {
      setError("Error fetching colleges: " + error.message);
    }
    setLoading(false);
  };

  const fetchCourseDetails = async (aicteId) => {
    try {
      const res = await axios.get("http://localhost:5001/api/aicte-course-details", {
        params: { aicteid: aicteId }
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSelectedCourses(prev => ({ ...prev, [aicteId]: res.data }));
        setShowCourseModal(true);
      } else {
        setError("No course details available.");
      }
    } catch (error) {
      setError("Error fetching course details: " + error.message);
    }
  };

  const fetchStaffDetails = async (aicteId) => {
    try {
      const courseData = selectedCourses[aicteId];
      if (!courseData || courseData.length === 0) {
        setError("No course data available. Please fetch course details first.");
        return;
      }

      const pid = courseData[0][1];

      const response = await axios.get('http://localhost:5001/api/faculty-details', {
        params: {
          aicteid: aicteId,
          pid: pid,
          year: '2024-2025'
        }
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        setSelectedStaff(prev => ({
          ...prev,
          [aicteId]: response.data
        }));
        setCurrentCollegeId(aicteId);
        setShowFacultyModal(true);
      } else {
        setError("No faculty data available for the selected course.");
      }
    } catch (err) {
      setError("Error fetching staff details: " + err.message);
    }
  };

  const programs = ["--All--", "Applied Arts and Crafts", "Architecture and Town Planning", "Architecture", "Town Planning", "Planning", "Engineering and Technology", "Hotel Management and Catering", "Management", "MCA", "Computer Applications", "Pharmacy"].sort();
  const levels = ["--All--", "UG", "PG", "DIPLOMA"].sort();
  const institutionTypes = ["--All--", "Central University", "Deemed to be University(Govt)", "Deemed to be University(Pvt)", "Deemed University(Government)", "Deemed University(Private)", "Government", "Govt aided", "Private-Aided", "Private-Self Financing", "State Government University", "State Private University", "Unaided - Private", "University Managed", "University Managed-Govt", "University Managed-Private"].sort();
  const states = ["--All--", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"].sort();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredColleges = colleges.filter(college =>
    college[1].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="mt-5">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
            ⬅ Back
      </Button><br/><br/>
      <h2 className="mb-4 text-primary">AICTE College & Course Finder</h2>

      <Form className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>State</Form.Label>
              <Form.Select name="state" value={filters.state} onChange={handleChange}>
                <option value="">Select State</option>
                {states.map((state, idx) => (
                  <option key={idx} value={state}>{state}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Program</Form.Label>
              <Form.Select name="program" value={filters.program} onChange={handleChange}>
                <option value="">Select Program</option>
                {programs.map((program, idx) => (
                  <option key={idx} value={program}>{program}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Level</Form.Label>
              <Form.Select name="level" value={filters.level} onChange={handleChange}>
                <option value="">Select Level</option>
                {levels.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Institution Type</Form.Label>
              <Form.Select name="institutiontype" value={filters.institutiontype} onChange={handleChange}>
                <option value="">Select Type</option>
                {institutionTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Button className="mt-3" variant="primary" onClick={fetchColleges} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Fetch Colleges"}
        </Button>
      </Form>

      <Form.Control
        type="text"
        placeholder="Search for a college"
        value={searchQuery}
        onChange={handleSearch}
        className="mb-4"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {filteredColleges.length > 0 &&
          filteredColleges.map((college, idx) => (
            <Col key={college[0]} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{college[1]}</Card.Title>
                  <Card.Text>
                    <p><MapPin size={18} /> {college[2]}</p>
                    <p><School size={18} /> {college[4]}</p>
                    <p><User size={18} /> Women: {college[5]}</p>
                  </Card.Text>
                  <Button
                    variant="info"
                    onClick={() => {
                      setSelectedCollege(college[0]);
                      fetchCourseDetails(college[0]);
                    }}
                  >
                    View Course Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>

      {/* Course Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Course Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Program</th>
                <th>University</th>
                <th>Level</th>
                <th>Course</th>
                <th>Intake</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourses[selectedCollege] && selectedCourses[selectedCollege].map((course, idx) => (
                <tr key={idx}>
                  <td>{course[3]}</td>
                  <td>{course[4]}</td>
                  <td>{course[5]}</td>
                  <td>{course[6]}</td>
                  <td>{course[10]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="secondary" onClick={() => fetchStaffDetails(selectedCollege)}>
            View Faculty Details
          </Button>
        </Modal.Body>
      </Modal>

      {/* Staff Modal */}
      <Modal show={showFacultyModal} onHide={() => setShowFacultyModal(false)} size="lg" style={{ maxWidth: "80%", marginLeft: "140px" }}>
        <Modal.Header closeButton>
          <Modal.Title>Staff Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStaff[currentCollegeId] && selectedStaff[currentCollegeId].length > 0 ? (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>F.ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Designation</th>
                  <th>Date of Joining</th>
                  <th>Area of Specialisation</th>
                  <th>Appointment Type</th>
                </tr>
              </thead>
              <tbody>
                {selectedStaff[currentCollegeId]
                  .sort((a, b) => a[1].localeCompare(b[1]))
                  .map((staff, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{staff[0]}</td>
                      <td>{staff[1]}</td>
                      <td>{staff[2]}</td>
                      <td>{staff[3]}</td>
                      <td>{staff[4]}</td>
                      <td>{staff[5]}</td>
                      <td>{staff[6]}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <p>No faculty data available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFacultyModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            className="mt-2"
            onClick={() => {
              const selected = colleges.find(col => col[0] === currentCollegeId);
              if (selected) fetchCollegeSummary(selected[1], selected[2]);
            }}
          >
            Get AI Summary
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Summary Modal */}
      <Modal show={showSummaryModal} onHide={() => setShowSummaryModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>College Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ whiteSpace: 'pre-wrap' }}>{collegeSummary}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSummaryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CollegeDetails;