const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const nodemailer = require("nodemailer");
require("dotenv").config();
const axios = require("axios");
const axiosRetry = require('axios-retry');
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")
const pdf = require('html-pdf');
const pdfParser = require('pdf-parse');
const fs = require('fs');
const multer = require('multer');
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const rax = require('retry-axios');



// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';
    if (file.fieldname === 'thumbnail') {
      folder = 'uploads/thumbnails/';
    } else if (file.fieldname === 'attachments') {
      folder = 'uploads/attachments/';
    }
    cb(null, folder);  // Save in the respective folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
  }
});

const upload = multer({ storage: storage });

const authenticateToken = require("../middleware/authMiddleware"); // Import middleware

router.get("/user", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT full_name, email, role FROM "Users" WHERE id = $1`,
            [req.user.id] // Use authenticated user ID
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "User not found." });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user data." });
    }
});



// 📌 Send OTP
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  try {
    await pool.query("INSERT INTO OTP (email, otp_code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp_code = $2, expires_at = $3", [email, otpCode, expiry]);

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpCode}. It is valid for 10 minutes.`,
    });

    res.json({ message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP." });
  }
});

// 📌 Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query("SELECT * FROM OTP WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()", [email, otp]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed." });
  }
});

// 📌 Register User
router.post("/register", async (req, res) => {
    const { fullName, email, password, role } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await pool.query(`SELECT * FROM "Users" WHERE email = $1`, [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "Email already registered!" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert user into the database
      await pool.query(
        `INSERT INTO "Users" (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        [fullName, email, hashedPassword, role]
      );
  
      res.json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ message: "Registration failed.", error: error.message });
    }
  });
  

// 📌 Login User

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  // Inside your parent-child linking endpoint

    try {
      // Check if the user exists
      const userQuery = await pool.query(`SELECT * FROM "Users" WHERE email = $1`, [email]);
  
      if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      const user = userQuery.rows[0];

      // Check if the password matches
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY, // Store in .env file
        { expiresIn: "1h" } // Token expires in 1 hour
      );

      res.json({
        message: "Login successful",
        token, // Send token to the frontend
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/user", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access Denied: No Token Provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token

        const userQuery = await pool.query(
            `SELECT id, full_name, email, role FROM "Users" WHERE id = $1`, 
            [decoded.id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(userQuery.rows[0]); // Return user data
    } catch (error) {
        return res.status(401).json({ error: "Invalid or Expired Token" });
    }
});
// router.get("/user-details/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const userRes = await pool.query(
//       `SELECT id, full_name, email, role, assessment_completed FROM "Users" WHERE id = $1`,
//       [userId]
//     );
//     if (userRes.rows.length === 0)
//       return res.status(404).json({ message: "User not found" });

//     const user = userRes.rows[0];
//     const { assessment_completed, ...userBasic } = user;

//     let details = null;
//     let verifiedParent = null;
//     let verifiedChild = null;
//     let careerInterests = [];
//     let subjectInterests = [];

//     if (user.role === "student") {
//       const detailsRes = await pool.query(
//         `SELECT * FROM StudentDetails WHERE user_id = $1`,
//         [userId]
//       );
//       if (detailsRes.rows.length > 0) details = detailsRes.rows[0];

//       const careerRes = await pool.query(
//         `SELECT ci.id, ci.name FROM StudentCareerInterests sci
//          JOIN Career_interests ci ON sci.career_id = ci.id WHERE sci.user_id = $1`,
//         [userId]
//       );
//       careerInterests = careerRes.rows;

//       const subjectRes = await pool.query(
//         `SELECT si.id, si.name FROM StudentSubjectInterests ssi
//          JOIN Subject_interests si ON ssi.subject_id = si.id WHERE ssi.user_id = $1`,
//         [userId]
//       );
//       subjectInterests = subjectRes.rows;

//       const parentRes = await pool.query(
//         `SELECT u.full_name, u.email FROM ParentChildLinks p
//          JOIN "Users" u ON p.parent_id = u.id
//          WHERE p.child_id = $1 AND p.status = 'approved'`,
//         [userId]
//       );
//       if (parentRes.rows.length > 0) verifiedParent = parentRes.rows[0];
//     } else if (user.role === "parent") {
//       const detailsRes = await pool.query(
//         `SELECT * FROM ParentDetails WHERE user_id = $1`,
//         [userId]
//       );
//       if (detailsRes.rows.length > 0) details = detailsRes.rows[0];

//       const childRes = await pool.query(
//         `SELECT u.full_name, u.email FROM ParentChildLinks p
//          JOIN "Users" u ON p.child_id = u.id
//          WHERE p.parent_id = $1 AND p.status = 'approved'`,
//         [userId]
//       );
//       if (childRes.rows.length > 0) verifiedChild = childRes.rows[0];
//     } else if (user.role === "teacher") {
//       const detailsRes = await pool.query(
//         `SELECT * FROM TeacherDetails WHERE user_id = $1`,
//         [userId]
//       );
//       if (detailsRes.rows.length > 0) details = detailsRes.rows[0];
//     }

//     res.json({
//       user: userBasic,
//       details: {
//         ...details,
//         career_interest: careerInterests.map((ci) => ci.name),
//         subject_interest: subjectInterests.map((si) => si.name),
//         assessment_completed: assessment_completed, // ✅ Added here
//       },
//       verifiedParent,
//       verifiedChild,
//     });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// Save user details route
router.post("/save-user-details", async (req, res) => {
  try {
    const { userId, dob, grade, school_board, school_name, career_interest, subject_interest } = req.body;

    // Validate required fields
    if (!userId || !dob || !grade || !school_board || !school_name || !career_interest || !subject_interest) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // Convert arrays to JSON strings (PostgreSQL JSONB format)
    const careerInterestJSON = JSON.stringify(career_interest);
    const subjectInterestJSON = JSON.stringify(subject_interest);

    // Check if user details already exist
    const existingDetails = await pool.query("SELECT * FROM StudentDetails WHERE user_id = $1", [userId]);

    if (existingDetails.rows.length > 0) {
      // If details exist, update them
      await pool.query(
        `UPDATE StudentDetails 
         SET dob = $1, grade = $2, school_board = $3, school_name = $4, career_interest = $5, subject_interest = $6
         WHERE user_id = $7`,
        [dob, grade, school_board, school_name, careerInterestJSON, subjectInterestJSON, userId]
      );
    } else {
      // Insert new details
      await pool.query(
        `INSERT INTO StudentDetails (user_id, dob, grade, school_board, school_name, career_interest, subject_interest)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, dob, grade, school_board, school_name, careerInterestJSON, subjectInterestJSON]
      );
    }

    // Update is_DetailsFilled in Users table
    await pool.query(`UPDATE "Users" SET is_DetailsFilled = TRUE WHERE id = $1`, [userId]);

    return res.status(200).json({ message: "Details saved successfully." });
  } catch (error) {
    console.error("Error saving user details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// // Fetch user details based on user ID
// router.get("/user-details/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Check if user details are filled
//     const userResult = await pool.query(`SELECT is_DetailsFilled FROM "Users" WHERE id = $1`, [userId]);
    
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!userResult.rows[0].is_DetailsFilled) {
//       return res.status(200).json({ is_DetailsFilled: false });
//     }

//     // Fetch student details if is_DetailsFilled is TRUE
//     const result = await pool.query(
//       "SELECT dob, grade, school_board, school_name, career_interest, subject_interest FROM StudentDetails WHERE user_id = $1",
//       [userId]
//     );

//     if (result.rows.length > 0) {
//       res.json({ is_DetailsFilled: true, ...result.rows[0] });
//     } else {
//       res.status(404).json({ message: "Details not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

const TOGETHER_MODEL ='meta-llama/Llama-3.3-70B-Instruct-Turbo'
// Check how the response from Together API is being handled
router.get("/puzzles", async (req, res) => {
  try {
    const prompt = `Generate a JSON array of 10 unique career-themed word puzzles. Each puzzle should have a clue and an answer.`;
    
    const response = await fetch(TOGETHER_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    // Extract and clean the response content to remove unwanted Markdown
    const puzzleContent = data.choices[0].message.content;
    console.log("Raw AI Response:", puzzleContent);  // Debug log to inspect raw response
    
    // Clean the response to remove backticks and other unwanted characters
    const cleanContent = puzzleContent.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("Cleaned Response:", cleanContent); // Log cleaned content for verification

    try {
      // Parse the cleaned content as JSON
      const puzzles = JSON.parse(cleanContent);
      res.json({ puzzles });
    } catch (parseError) {
      console.error("Error parsing the puzzle data:", parseError);
      res.status(500).json({ error: "Error parsing puzzle data" });
    }

  } catch (err) {
    console.error("Error fetching puzzles:", err);
    res.status(500).json({ error: "Error fetching puzzles" });
  }
});







// GET teacher details
router.post("/teacher-details/:userId", async (req, res) => {
  const { userId } = req.params;
  const {
    fullName,
    email,
    phoneNumber,
    highestEducation,
    subjects,
    yearsOfExperience,
    careerInterests,
    mentorshipInterest,
    connectWithPeers,
    guidanceAreas,
    interactionModes,
  } = req.body;

  console.log("Received Teacher Details:", req.body);  // Log incoming data

  try {
    const existing = await pool.query(
      `SELECT * FROM TeacherDetails WHERE user_id = $1`,
      [userId]
    );

    const subjectsArray = subjects.split(',').map(s => s.trim());
    const careerInterestsArray = careerInterests;
    const guidanceAreasArray = guidanceAreas;
    const interactionModesArray = interactionModes;

    const values = [
      userId,
      phoneNumber,
      highestEducation,
      subjectsArray,
      yearsOfExperience,
      careerInterestsArray,
      mentorshipInterest,
      connectWithPeers,
      guidanceAreasArray,
      interactionModesArray,
    ];

    if (existing.rows.length > 0) {
      // Update existing teacher details
      await pool.query(
        `UPDATE TeacherDetails
         SET phone_number = $2,
             highest_education = $3,
             subjects = $4,
             years_of_experience = $5,
             career_interests = $6,
             mentorship_interest = $7,
             connect_with_peers = $8,
             guidance_areas = $9,
             interaction_modes = $10
         WHERE user_id = $1`,
        values
      );
    } else {
      // Insert new teacher details
      await pool.query(
        `INSERT INTO TeacherDetails (
           user_id,
           phone_number,
           highest_education,
           subjects,
           years_of_experience,
           career_interests,
           mentorship_interest,
           connect_with_peers,
           guidance_areas,
           interaction_modes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        values
      );
    }

    // Mark as details filled
    await pool.query(
      `UPDATE "Users" SET is_detailsfilled = true WHERE id = $1`,
      [userId]
    );

    res.status(200).json({ message: "Teacher details saved successfully" });
  } catch (error) {
    console.error("Error saving teacher details:", error);
    res.status(500).json({ message: "Error saving teacher details" });
  }
});

// Fetch all dropdown options
router.get('/dropdown-options', async (req, res) => {
  try {
    const careerInterests = await pool.query('SELECT name FROM teacher_career_interests');
    const guidanceAreas = await pool.query('SELECT name FROM guidance_areas');
    const interactionModes = await pool.query('SELECT name FROM interaction_modes');
    const mentorshipTopics = await pool.query('SELECT name FROM mentorship_topics');
    const contributedResources = await pool.query('SELECT name FROM contributed_resources');

    res.json({
      careerInterests: careerInterests.rows.map(row => row.name),
      guidanceAreas: guidanceAreas.rows.map(row => row.name),
      interactionModes: interactionModes.rows.map(row => row.name),
      mentorshipTopics: mentorshipTopics.rows.map(row => row.name),
      contributedResources: contributedResources.rows.map(row => row.name),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ✅ Check if teacher has completed registration
router.get("/teachers/:id", async (req, res) => {
  const teacherId = req.params.id;
  try {
    const result = await pool.query(`SELECT is_detailsfilled, full_name, email, role FROM "Users" WHERE id = $1`, [teacherId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Teacher not found" });

    const user = result.rows[0];
    res.json({
      registrationComplete: user.is_detailsfilled,
      teacher: {
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/meetings', upload.fields([{ name: 'thumbnail' }, { name: 'attachments' }]), async (req, res) => {
  try {
    const {
      teacherId,
      title,
      link,
      date,
      time,
      duration,
      type,
      speakerName,
      speakerBio,
      speakerEmail,
      organization,
      audience,
      maxParticipants,
      venue,
      language,
      tags,
      description,
      status
    } = req.body;

    const thumbnail = req.files['thumbnail']?.[0]?.filename || null;
    const attachments = req.files['attachments']?.map(file => file.filename) || [];

    const result = await pool.query(
      `INSERT INTO Meetings 
        (teacher_id, title, link, date, time, duration, type, speaker_name, speaker_bio, speaker_email, organization, audience, max_participants, venue, language, tags, description, thumbnail, attachments, status)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        teacherId,
        title,
        link,
        date,
        time,
        duration,
        type,
        speakerName,
        speakerBio,
        speakerEmail,
        organization,
        audience,
        maxParticipants,
        venue,
        language,
        tags ? JSON.parse(tags) : [],
        description,
        thumbnail,
        attachments,
        status
      ]
    );

    res.status(201).json({ message: 'Meeting created successfully', meeting: result.rows[0] });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/meetings/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM meetings WHERE teacher_id = $1', [teacherId]);
    res.json({ meetings: result.rows });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-all-meetings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meetings');
    res.json({ meetings: result.rows });
  } catch (error) {
    console.error('Error fetching all meetings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// // GET teacher details
// router.get('/teacher-details', async (req, res) => {
//   const email = req.query.email;
//   if (!email) return res.status(400).json({ error: 'Email is required' });

//   try {
//     // 1. Get user basic info
//     const userResult = await pool.query(
//       'SELECT full_name, email, role FROM "Users" WHERE email = $1',
//       [email]
//     );
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const user = userResult.rows[0];

//     // 2. Get TeacherDetails
//     const teacherResult = await pool.query(
//       'SELECT * FROM TeacherDetails WHERE email = $1',
//       [email]
//     );

//     const teacherDetails = teacherResult.rows[0] || {};

//     // 3. Get CareerGuidanceDetails
//     const guidanceResult = await pool.query(
//       'SELECT * FROM CareerGuidanceDetails WHERE email = $1',
//       [email]
//     );

//     const guidanceDetails = guidanceResult.rows[0] || {
//       mentorship_areas: [],
//       interaction_modes: [],
//       topics_you_can_mentor: [],
//       resources_you_can_contribute: [],
//     };

//     res.json({
//       ...user,
//       ...teacherDetails,
//       ...guidanceDetails,
//     });
//   } catch (err) {
//     console.error('Error:', err.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // Save or update teacher details
// router.post('/save-teacher-details', async (req, res) => {
//   const {
//     fullName,
//     email,
//     phoneNumber,
//     highestEducation,
//     subjects,
//     yearsOfExperience,
//     careerInterests,
//     mentorshipInterest,
//     connectWithPeers,
//     guidanceAreas,
//     interactionModes,
//     mentorshipTopics,
//     contributedResources,
//   } = req.body;

//   try {
//     // 1. Get user ID from Users table
//     const userRes = await pool.query(
//       'SELECT id FROM "Users" WHERE email = $1',
//       [email]
//     );

//     if (userRes.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const userId = userRes.rows[0].id;

//     // 2. Check if teacher details already exist
//     const teacherRes = await pool.query(
//       'SELECT id FROM teacher_details WHERE email = $1',
//       [email]
//     );

//     let teacherId;

//     if (teacherRes.rows.length > 0) {
//       // Existing teacher - Update
//       teacherId = teacherRes.rows[0].id;

//       // Update users table to mark details filled
//       await pool.query(
//         `UPDATE "Users" SET is_detailsfilled = true WHERE id = $1`,
//         [userId]
//       );

//       // Update teacher_details
//       await pool.query(
//         `UPDATE teacher_details SET
//           full_name = $1,
//           phone_number = $2,
//           highest_education = $3,
//           subjects = $4,
//           years_of_experience = $5
//         WHERE id = $6`,
//         [
//           fullName,
//           phoneNumber,
//           highestEducation,
//           subjects,
//           yearsOfExperience,
//           teacherId,
//         ]
//       );

//       // Update career_guidance_details
//       await pool.query(
//         `UPDATE career_guidance_details SET
//           career_interests = $1,
//           mentorship_interest = $2,
//           connect_with_peers = $3,
//           guidance_areas = $4,
//           interaction_modes = $5,
//           mentorship_topics = $6,
//           contributed_resources = $7
//         WHERE user_id = $8`,
//         [
//           careerInterests,
//           mentorshipInterest,
//           connectWithPeers,
//           guidanceAreas,
//           interactionModes,
//           mentorshipTopics,
//           contributedResources,
//           userId,
//         ]
//       );
//     } else {
//       // New teacher - Insert

//       const newTeacher = await pool.query(
//         `INSERT INTO teacher_details
//         (full_name, email, phone_number, highest_education, subjects, years_of_experience)
//         VALUES ($1, $2, $3, $4, $5, $6)
//         RETURNING id`,
//         [
//           fullName,
//           email,
//           phoneNumber,
//           highestEducation,
//           subjects,
//           yearsOfExperience,
//         ]
//       );

//       teacherId = newTeacher.rows[0].id;

//       // Mark user as details-filled
//       await pool.query(
//         `UPDATE users SET is_detailsfilled = true WHERE id = $1`,
//         [userId]
//       );

//       // Insert into career_guidance_details
//       await pool.query(
//         `INSERT INTO career_guidance_details
//         (user_id, career_interests, mentorship_interest, connect_with_peers, guidance_areas, interaction_modes, mentorship_topics, contributed_resources)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//         [
//           userId,
//           careerInterests,
//           mentorshipInterest,
//           connectWithPeers,
//           guidanceAreas,
//           interactionModes,
//           mentorshipTopics,
//           contributedResources,
//         ]
//       );
//     }

//     res.status(200).json({ message: 'Teacher details saved successfully' });
//   } catch (err) {
//     console.error('Error saving teacher details:', err.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


const TOGETHER_AI_URL = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_AI_API_KEY ="tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM";

router.post("/ask", async (req, res) => {
    const { message } = req.body;
  
    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message cannot be empty" });
    }
  
    try {
        const response = await axios.post(
            "https://api.together.xyz/v1/chat/completions",
            {
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
                messages: [
                    {
                        role: "system",
                        content: "Provide short, clear, and accurate responses. Keep answers under 3 sentences based on the input.",
                    },
                    { role: "user", content: message },
                ],
                temperature: 0.7, // Lowered for accuracy and predictability
                max_tokens: 150, // Reduced for concise answers
                top_p: 0.9,
                frequency_penalty: 0.2,
                presence_penalty: 0,
            },
            {
                headers: {
                    Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
  
        let botResponse = response.data.choices[0]?.message?.content.trim() || "No response available";
  
        // Shortening response by limiting length
        const formattedResponse = botResponse
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => `• ${line.trim()}`)
            .join("\n");
  
        res.json({ response: formattedResponse });
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to get a response from Together AI" });
    }
  });

// // POST /api/student/self-discovery
// router.post('/self-discovery', authMiddleware, async (req, res) => {
//   const { strengths, weaknesses, hobbies, motivationFactors, careerDreams, preferredWorkStyle } = req.body;
//   await SelfDiscovery.create({ userId: req.user.id, strengths, weaknesses, hobbies, motivationFactors, careerDreams, preferredWorkStyle });
//   res.json({ message: 'Saved' });
// });



// router.get('/details', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Fetch basic user details from Users table
//     const userResult = await pool.query(
//       `SELECT id, full_name, email, role, dob FROM "Users" WHERE id = $1`,
//       [userId]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const user = userResult.rows[0];

//     // Fetch additional fields if role is student
//     let careerInterest = [];
//     let subjectInterest = [];

//     if (user.role === 'Student') {
//       const studentResult = await pool.query(
//         `SELECT career_interest, subject_interest FROM StudentDetails WHERE user_id = $1`,
//         [userId]
//       );

//       if (studentResult.rows.length > 0) {
//         careerInterest = studentResult.rows[0].career_interest || [];
//         subjectInterest = studentResult.rows[0].subject_interest || [];
//       }
//     }

//     return res.json({
//       id: user.id,
//       fullName: user.full_name,
//       email: user.email,
//       role: user.role,
//       dob: user.dob,
//       career_interest: careerInterest,
//       subject_interest: subjectInterest,
//     });
//   } catch (error) {
//     console.error('Error fetching user details:', error);
//     return res.status(500).json({ error: 'Server error' });
//   }
// });

// Simple test endpoint
router.get('/user/:id', (req, res) => {
  res.send(`User ID is ${req.params.id}`);
});

// Generate roadmap endpoint
router.post('/generate-roadmap', async (req, res) => {
  const { current, desired } = req.body;

  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: 'user',
            content: `You are a career guidance AI assisting a student currently in "${current}" who wants to become a "${desired}" in the future.

Generate a 5 to 7 step roadmap tailored to a student’s journey — focusing on subject choices, foundational skills, courses taken, activities involved, and academic and curriculm ans well as exam based.

Respond only with a valid JSON array. Each item must include:

"step": Step number with a short title (e.g., "Step 1: Explore Interests")

"description": Clear, age-appropriate guidance for that step.

✨ Focus on:

Choosing relevant subjects

Building foundational skills

Exploring career paths

Developing hobbies or joining clubs

Participating in school projects or online courses

Setting academic goals

⚠️ No intro text, explanations, or summaries.`,
          },
        ],
        max_tokens: 700,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the output text
    const aiMessage = response.data.choices[0]?.message?.content || '';

    console.log('Raw AI response:', aiMessage);

    // Try to extract valid JSON even if wrapped in code block
    const match = aiMessage.match(/\[.*\]/s);
    if (!match) throw new Error("No valid JSON array found in response.");

    const roadmap = JSON.parse(match[0]);

    // Optional: sanitize step titles and descriptions
    const sanitized = roadmap.map((step, i) => ({
      step: step.step || `Step ${i + 1}`,
      description: step.description?.trim() || '',
    }));

    res.json({ roadmap: sanitized });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Failed to generate roadmap',
      details: err.message,
    });
  }
});



// Helper: Extract and parse clean JSON
const extractJSON = (content) => {
  try {
    // Remove markdown code blocks if any
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/^```json|```$/g, "").trim();
    }

    // Try to find start and end of the JSON manually
    const startIndex = content.indexOf("[");
    const endIndex = content.lastIndexOf("]") + 1;

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("JSON boundaries not found");
    }

    const jsonSubstring = content.substring(startIndex, endIndex);
    return JSON.parse(jsonSubstring);
  } catch (err) {
    console.error("❌ Failed to parse JSON from model response:\n", content);
    throw new Error("Invalid JSON format returned by AI");
  }
};

// Main Question Generator
const generateAllQuestionsSinglePrompt = async (difficulty) => {
  const prompt = `You are a helpful self-discovery test generator.

Generate a total of 20 multiple-choice questions, evenly split across the following 4 categories:
1. Self-Awareness
2. Learning Style
3. Career Interest
4. Subject Preference

Requirements:
- Each category must have exactly 5 questions.
- Each question must include:
  - "question": the question text
  - "options": an array of exactly 4 short answer options
  - "answer": one correct answer from the options

Format the output as a single valid JSON array with the following structure:

[
  {
    "category": "self-awareness",
    "questions": [
      {
        "question": "Sample question?",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }
    ]
  },
  {
    "category": "learning-style",
    "questions": [
      ...
    ]
  },
  ...
]

❗Return only the final JSON array. Do not include any explanations, markdown, or extra text.
Ensure all questions are appropriate for difficulty level: ${difficulty}.
Ensure the JSON is valid and complete.
`;

  const response = await axios.post(
    TOGETHER_AI_URL,
    {
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 2048,
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from Together AI");
  }

  return extractJSON(content);
};

// Express Route
router.post("/generate-psychometric", async (req, res) => {
  try {
    const { dob } = req.body;

    if (!dob) {
      return res.status(400).json({ success: false, error: "DOB is required" });
    }

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    const difficulty = age + 2;

    const questions = await generateAllQuestionsSinglePrompt(difficulty);
    res.json({ success: true, message: "Questions generated successfully", questions });
  } catch (err) {
    console.error("🚨 Generation error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate questions" });
  }
});


// 🔍 Analyze Responses with AI
async function analyzeResponsesWithAI(responses) {
  const prompt = `
Analyze the following user responses to psychometric questions.
Generate a category-wise analysis in JSON format. Each category should include:
- category the generating categories for json should exactly be in this name (string) "Self awareness","Learning Style","Career interest","Subject preference"
- score (1-100, number) based on their ability
- description (string, simple and easy to understand)

User responses: ${JSON.stringify(responses)}
Respond strictly in JSON format:
[
  {
    "category": "",
    "score": number,
    "description": "string"
  }
]
  `;

  try {
    const response = await axios.post(
      TOGETHER_AI_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
        },
      }
    );

    const rawContent = response.data.choices[0].message.content.trim();
    const cleanContent = rawContent.replace(/^```json|```$/g, "").trim();

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error analyzing responses:", error?.response?.data || error);
    throw new Error("Failed to analyze responses");
  }
}

// 🧠 API: Analyze User Responses
router.post("/analyze-responses", async (req, res) => {
  const { responses } = req.body;

  if (!responses || Object.keys(responses).length === 0) {
    return res.status(400).json({ error: "No responses submitted" });
  }

  try {
    const analysisResult = await analyzeResponsesWithAI(responses);
    res.json({ report: analysisResult });
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze responses" });
  }
});


router.post("/save-psychometric-results", async (req, res) => {
  const { user_id, analysis } = req.body;

  if (!user_id || !analysis) {
    return res.status(400).json({ success: false, error: "Missing data." });
  }

  try {
    const mapped = {};
    analysis.forEach((item) => {
      const key = item.category.toLowerCase().replace(/ /g, "_"); // e.g., "Self Awareness" -> "self_awareness"
      mapped[`${key}_score`] = item.score;
      mapped[`${key}_insight`] = item.description;
    });

    const existing = await pool.query(
      "SELECT * FROM psychometricresults WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      // Update existing results
      await pool.query(
        `UPDATE psychometricresults SET 
          self_awareness_score = $1,
          self_awareness_insight = $2,
          learning_style_score = $3,
          learning_style_insight = $4,
          career_interest_score = $5,
          career_interest_insight = $6,
          subject_preference_score = $7,
          subject_preference_insight = $8,
          completed = true
        WHERE user_id = $9`,
        [
          mapped.self_awareness_score,
          mapped.self_awareness_insight,
          mapped.learning_style_score,
          mapped.learning_style_insight,
          mapped.career_interest_score,
          mapped.career_interest_insight,
          mapped.subject_preference_score,
          mapped.subject_preference_insight,
          user_id,
        ]
      );
    } else {
      // Insert new results
      await pool.query(
        `INSERT INTO psychometricresults (
          user_id,
          self_awareness_score, self_awareness_insight,
          learning_style_score, learning_style_insight,
          career_interest_score, career_interest_insight,
          subject_preference_score, subject_preference_insight,
          completed
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          user_id,
          mapped.self_awareness_score,
          mapped.self_awareness_insight,
          mapped.learning_style_score,
          mapped.learning_style_insight,
          mapped.career_interest_score,
          mapped.career_interest_insight,
          mapped.subject_preference_score,
          mapped.subject_preference_insight,
          true,
        ]
      );
    }

    // Mark assessment completed in Users table
    await pool.query(
      `UPDATE "Users" SET assessment_completed = true WHERE id = $1`,
      [user_id]
    );

    // Fetch user info
    const userInfo = await pool.query(
      `SELECT id, full_name, role, email FROM "Users" WHERE id = $1`,
      [user_id]
    );

    return res.json({
      success: true,
      message: "Psychometric results saved successfully.",
      user: userInfo.rows[0],
    });
  } catch (err) {
    console.error("Error saving psychometric results:", err);
    res.status(500).json({ success: false, error: "Database error." });
  }
});

router.get("/user-details/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user from Users table
    const userRes = await pool.query(
      `SELECT id, full_name, email, role, assessment_completed, is_detailsfilled , is_psychometrictestcompleted FROM "Users" WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = userRes.rows[0];
    const { assessment_completed, is_detailsfilled, ...userBasic } = user;

    if (!is_detailsfilled) {
      return res.status(200).json({
        is_detailsfilled: false,
        user: userBasic,
      });
    }

    let details = null;
    let verifiedParent = null;
    let verifiedChild = null;

    if (user.role === "student") {
      // ✅ Get all student details including career/subject interests
      const detailsRes = await pool.query(
        `SELECT * FROM StudentDetails WHERE user_id = $1`,
        [userId]
      );
      if (detailsRes.rows.length > 0) details = detailsRes.rows[0];

      // ✅ Get parent info if approved
      const parentRes = await pool.query(
        `SELECT u.full_name, u.email FROM ParentChildLinks p
         JOIN "Users" u ON p.parent_id = u.id
         WHERE p.child_id = $1 AND p.status = 'approved'`,
        [userId]
      );
      if (parentRes.rows.length > 0) verifiedParent = parentRes.rows[0];
    }

    // You can keep parent and teacher logic unchanged
    else if (user.role === "parent") {
      const detailsRes = await pool.query(
        `SELECT * FROM ParentDetails WHERE user_id = $1`,
        [userId]
      );
      if (detailsRes.rows.length > 0) details = detailsRes.rows[0];

      const childRes = await pool.query(
        `SELECT u.full_name, u.email FROM ParentChildLinks p
         JOIN "Users" u ON p.child_id = u.id
         WHERE p.parent_id = $1 AND p.status = 'approved'`,
        [userId]
      );
      if (childRes.rows.length > 0) verifiedChild = childRes.rows[0];
    } else if (user.role === "teacher") {
      const detailsRes = await pool.query(
        `SELECT * FROM TeacherDetails WHERE user_id = $1`,
        [userId]
      );
      if (detailsRes.rows.length > 0) details = detailsRes.rows[0];
    }

    return res.status(200).json({
      is_detailsfilled: true,
      user: userBasic,
      details: {
        ...details,
        assessment_completed,
      },
      verifiedParent,
      verifiedChild,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/check-psychometric-status/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user from Users table to get `is_psychometrictestcompleted`
    const userRes = await pool.query(
      `SELECT id, is_psychometrictestcompleted FROM "Users" WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = userRes.rows[0];

    // Check if psychometric test is completed
    const { is_psychometrictestcompleted } = user;

    return res.status(200).json({
      is_psychometrictestcompleted,
    });
  } catch (error) {
    console.error("Error checking psychometric test status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Backend Route to fetch self-discovery analysis
router.get("/self-discovery/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         self_awareness_score, self_awareness_insight,
         learning_style_score, learning_style_insight,
         career_interest_score, career_interest_insight,
         subject_preference_score, subject_preference_insight,
         created_at
       FROM psychometricresults 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No self-discovery analysis found for this student." });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching self-discovery analysis:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// 🧠 Function to call Together AI
const generateCareerPlan = async (subjects) => {
  const prompt = `
A student has selected these core subjects: ${subjects.join(", ")}.
Based on this, suggest the top 5 potential career paths.

For each career path, provide the following details:
- A simple reason why it's a good fit for the selected subjects
- The average salary (in INR per year, approximate)
- The exam eligibility (minimum qualification needed)
- The common entrance exams (if any)
- Some top companies that hire for this career
- Common roles or job titles in this field

Respond ONLY in the following JSON array format:
[
  {
    "career": "Career Title",
    "reason": "Simple reason why it's a good fit",
    "salary": "₹X,XX,XXX per year",
    "exam_eligibility": "Minimum qualification required",
    "entrance_exams": ["Exam 1", "Exam 2"],
    "companies": ["Company A", "Company B"],
    "roles": ["Role 1", "Role 2"]
  }
]

Only return a valid JSON array without any extra text or explanation.

`;

  try {
    const res = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = res.data.choices[0].message.content;

    // 🧼 Try to safely parse JSON even if it comes with extra characters
    const startIdx = content.indexOf("[");
    const endIdx = content.lastIndexOf("]");
    const jsonString = content.slice(startIdx, endIdx + 1);

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Error fetching from Together AI:", err.message);
    return [
      {
        career: "Error",
        reason: "Failed to generate career plan. Check API or try again.",
        steps: ["Ensure API key is correct", "Check internet", "Retry later"]
      }
    ];
  }
};

// 🚀 POST route to generate plan
router.post("/generate-dynamic-career-plan", async (req, res) => {
  const { subjects } = req.body;

  if (!subjects || !subjects.length) {
    return res.status(400).json({ message: "Subjects are required." });
  }

  try {
    const careers = await generateCareerPlan(subjects);
    res.json({ careers });
  } catch (err) {
    console.error("Route error:", err.message);
    res.status(500).json({ message: "Server error generating plan." });
  }
});



const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60 });

const questionCache = {};


// // 🔁 Dynamic Prompt for AI Question Generation
// const getPrompt = (module, details, interestType) => {
//   return `
// You are a psychometric test creator for students. Based on the following student profile and test module, generate 5 unique multiple-choice questions. Each question should assess the student based on the module’s theme and include 4 meaningful options.

// Student Profile:
// - Name: ${details.full_name}
// - Grade: ${details.grade}
// - School Board: ${details.school_board}
// - School Name: ${details.school_name}
// - Subject Interests: ${details.subject_interest?.join(", ")}
// ${interestType === 'both' ? `- Career Interests: ${details.career_interests?.join(", ")}` : ""}

// Current Module: ${module}

// Instructions:
// - The questions should reflect the student's interests and background.
// - Use a variety of cognitive, behavioral, and scenario-based formats.
// - Each question must be unique and related to the module "${module}".
// - Avoid repetition from past questions.
// - Return the response in JSON format like:
// [
//   {
//     "question": "string",
//     "options": ["option1", "option2", "option3", "option4"]
//   }
// ]
// `;
// };


// // Route: /api/generate-psychometric-new
// router.post("/generate-psychometric-new", async (req, res) => {
//   const { module, userId } = req.body;

//   try {
//     // Fetch student details from DB
//     const userResponse = await axios.get(`http://localhost:5000/api/user-details/${userId}`);
//     const details = userResponse.data.details;
//     const key = `${userId}-${module}`;

//     // If questions already exist, return them
//     if (questionCache[key]) {
//       return res.json({ questions: questionCache[key] });
//     }

//     const prompt = getPrompt(module, details);

//     const aiResponse = await axios.post(
//       "https://api.together.xyz/v1/chat/completions", // or OpenAI endpoint
//       {
//         model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // or your preferred Together AI model
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     const messageContent = aiResponse.data.choices[0].message.content;

//     let questions = [];
//     try {
//       questions = JSON.parse(messageContent);
//     } catch (err) {
//       console.error("AI Response was not valid JSON:", messageContent);
//       return res.status(400).json({ error: "Failed to parse AI response." });
//     }

//     if (!questions.length) {
//       return res.status(400).json({ error: "No questions generated." });
//     }

//     // Cache to avoid duplicates
//     questionCache[key] = questions;

//     res.json({ questions });
//   } catch (err) {
//     console.error("Error generating questions:", err);
//     res.status(500).json({ error: "No more unique questions available for this module." });
//   }
// });


// const getPrompt = (module, details, interestType = "both") => {
//   return `You are a psychometric test creator for students. Based on the following student profile and test module, generate 3 unique multiple-choice questions. Each question should assess the student based on the module’s theme and include 4 meaningful options.

// Student Profile:
// - Name: ${details.full_name}
// - Grade: ${details.grade}
// - School Board: ${details.school_board}
// - School Name: ${details.school_name}
// - Subject Interests: ${details.subject_interest?.join(", ")}
// ${interestType === "both" ? `- Career Interests: ${details.career_interest?.join(", ")}` : ""}

// Current Module: ${module}

// Instructions:
// - The questions should reflect the student's interests and background.
// - Use a variety of cognitive, behavioral, and scenario-based formats.
// - Each question must be unique and related to the module "${module}".
// - Avoid repetition from past questions.
// - Return the response in JSON format like:
// [
//   {
//     "question": "string",
//     "options": ["option1", "option2", "option3", "option4"]
//   }
// ]`;
// };

// // 🚀 Route to generate psychometric questions
// router.post("/generate-psychometric-new", async (req, res) => {
//   const { module, userId } = req.body;

//   if (!module || !userId) {
//     return res.status(400).json({ error: "Missing module or userId" });
//   }

//   try {
//     // Fetch user details
//     const userResponse = await axios.get(`http://localhost:5000/api/user-details/${userId}`);
//     const details = userResponse.data.details;
//     const key = `${userId}-${module}`;

//     // Serve from cache if available
//     if (questionCache[key]) {
//       return res.json({ questions: questionCache[key] });
//     }

//     const prompt = getPrompt(module, details, "both");

//     const aiResponse = await axios.post(
//       "https://api.together.xyz/v1/chat/completions",
//       {
//         model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const messageContent = aiResponse.data.choices[0].message.content.trim();

//     let questions = [];
//     try {
//       // Try parsing directly
//       questions = JSON.parse(messageContent);
//     } catch (e) {
//       // Fallback: extract JSON-like block from string response
//       const jsonStart = messageContent.indexOf("[");
//       const jsonEnd = messageContent.lastIndexOf("]");
//       const jsonString = messageContent.substring(jsonStart, jsonEnd + 1);
//       questions = JSON.parse(jsonString);
//     }

//     if (!Array.isArray(questions) || questions.length === 0) {
//       throw new Error("Invalid or empty questions array from AI");
//     }

//     // Cache the questions
//     questionCache[key] = questions;

//     res.json({ questions });
//   } catch (error) {
//     console.error("Error generating questions:", error.message || error);
//     res.status(500).json({ error: "Failed to generate psychometric questions" });
//   }
// });


// //💾 Save Module Responses
// router.post("/save-module", async (req, res) => {
//   const { module, responses } = req.body;
//   if (!module || !Array.isArray(responses)) {
//     return res.status(400).json({ error: "Module and responses are required" });
//   }
//   try {
//     console.log(`✅ Saved responses for ${module}:`, responses);
//     return res.json({ success: true });
//   } catch (err) {
//     console.error("Error saving responses:", err.message);
//     return res.status(500).json({ error: "Failed to save responses" });
//   }
// });


// router.post("/batch-generate", async (req, res) => {
//   const { userId, interestType, module } = req.body;

//   try {
//     const questions = await generatePsychometricQuestions(userId, module, interestType);
//     res.json({ questions });
//   } catch (error) {
//     console.error("Error in batch generation:", error.message);
//     res.status(500).json({ message: "Error generating batch questions." });
//   }
// });


// // 📊 Analyze Results
// router.post("/analyze-psychometric-results", async (req, res) => {
//   const { moduleScores, studentName, userId } = req.body;

//   if (!studentName || !userId || !Array.isArray(moduleScores)) {
//     return res.status(400).json({ error: "Invalid input for analysis." });
//   }

//   const reportPrompt = `Generate a short and professional AI-based psychometric analysis report for a student named "${studentName}". 
// Use the following module scores (out of 100) to describe their cognitive, personality, emotional, problem-solving, decision-making, leadership, stress management, risk-taking, adaptability, subject interest, career interest, and soft skill orientation traits:

// ${moduleScores.map(s => `${s.module}: ${s.score}`).join("\n")}

// Return ONLY valid JSON like this (NO markdown formatting, NO explanation, NO triple backticks):
// {
//   "overall_analysis": "Brief paragraph analyzing the overall psychometric profile.",
//   "categories": [
//     {
//       "module": "Module Name",
//       "score": 87,
//       "analysis": "Short paragraph about performance in this module."
//     }
//   ]
// }
// `;

//   try {
//     const response = await axios.post(
//       TOGETHER_AI_URL,
//       {
//         model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
//         messages: [{ role: "user", content: reportPrompt }],
//         max_tokens: 2048,
//       },
//       {
//         headers: { Authorization: `Bearer ${TOGETHER_AI_API_KEY}` },
//       }
//     );

//     let content = response.data.choices[0].message.content.trim();

//     // 🔧 Remove triple backticks if present
//     if (content.startsWith("```")) {
//       content = content.replace(/```(?:json)?/g, "").trim();
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(content);
//     } catch (parseErr) {
//       console.error("Failed to parse AI response:", content);
//       return res.status(500).json({ error: "Invalid response format from AI." });
//     }

//     // Save result to PsychometricTestResults
//     await pool.query(
//       `INSERT INTO PsychometricTestResults (user_id, overall_analysis, category_results) VALUES ($1, $2, $3)`,
//       [userId, parsed.overall_analysis, JSON.stringify(parsed.categories)]
//     );

//     // ✅ Mark test as completed
//     await pool.query(
//       `UPDATE "Users" SET is_Psychometrictestcompleted = true WHERE id = $1`,
//       [userId]
//     );

//     return res.json(parsed);

//   } catch (err) {
//     console.error("Error generating psychometric report:", err.message);
//     if (err.response?.status === 429) {
//       return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
//     }
//     return res.status(500).json({ error: "Failed to generate report" });
//   }
// });

// router.get("/psychometric-result/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const result = await pool.query(
//       `SELECT category_results, overall_analysis
//        FROM PsychometricTestResults
//        WHERE user_id = $1
//        ORDER BY created_at DESC
//        LIMIT 1`,
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "No results found" });
//     }

//     res.json({
//       category_results: result.rows[0].category_results,
//       summary: result.rows[0].overall_analysis,
//     });
//   } catch (err) {
//     console.error("Error fetching psychometric result:", err);
//     res.status(500).json({ message: "Server error fetching results" });
//   }
// });

// 🔧 Prompt Generator
const getPrompt = (module, details, interestType = "both") => {
  let interestSection = "";

  if (interestType === "subject") {
    interestSection = `- Subject Interests: ${details.subject_interest?.join(", ")}`;
  } else if (interestType === "both") {
    interestSection = `- Subject Interests: ${details.subject_interest?.join(", ")}\n- Career Interests: ${details.career_interest?.join(", ")}`;
  }

  return `You are a psychometric test creator for students. Based on the following student profile and test module, generate 10 unique multiple-choice questions. Each question should assess the student based on the module’s theme and include 4 meaningful options.

Student Profile:
- Name: ${details.full_name}
- Grade: ${details.grade}
- School Board: ${details.school_board}
- School Name: ${details.school_name}
${interestSection}

Current Module: ${module}

Instructions:
- The questions should reflect the student's background${interestType === "none" ? "" : " and interests"}.
- Use a variety of cognitive, behavioral, and scenario-based formats.
- Each question must be unique and related to the module "${module}".
- Return only JSON like:
[
  {
    "question": "string",
    "options": ["option1", "option2", "option3", "option4"]
  }
]`;
};


// 🔄 Centralized Question Generator
const generatePsychometricQuestions = async (userId, module, interestType = "both", isFirstModule = false) => {
  const key = `${userId}-${module}-${interestType}-${isFirstModule}`;

  if (questionCache[key]) return questionCache[key];

  const { data } = await axios.get(`http://localhost:5000/api/user-details/${userId}`);
  const details = data.details;

  // 👇 Use interestType only for first module, otherwise set to "none"
  const actualInterestType = isFirstModule ? interestType : "none";

  const prompt = getPrompt(module, details, actualInterestType);

  const aiResponse = await axios.post(
    TOGETHER_AI_URL,
    {
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  let content = aiResponse.data.choices[0].message.content.trim();

  try {
    return (questionCache[key] = JSON.parse(content));
  } catch (e) {
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]");
    const jsonString = content.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);
    questionCache[key] = parsed;
    return parsed;
  }
};


// 🚀 Route: Generate Questions (Single Module)
router.post("/generate-psychometric-new", async (req, res) => {
  const { module, userId, interestType = "both", isFirstModule = false } = req.body;
  if (!module || !userId) return res.status(400).json({ error: "Missing module or userId" });

  try {
    const questions = await generatePsychometricQuestions(userId, module, interestType, isFirstModule);
    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error.message);
    res.status(500).json({ error: "Failed to generate psychometric questions" });
  }
});


// 🧠 Route: Batch Generate Questions
router.post("/batch-generate", async (req, res) => {
  const { userId, module, interestType = "both" } = req.body;

  try {
    const questions = await generatePsychometricQuestions(userId, module, interestType);
    res.json({ questions });
  } catch (error) {
    console.error("Error in batch generation:", error.message);
    res.status(500).json({ message: "Error generating batch questions." });
  }
});

// 💾 Route: Save Module Responses
router.post("/save-module", async (req, res) => {
  const { module, responses } = req.body;
  if (!module || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Module and responses are required" });
  }

  try {
    console.log(`✅ Saved responses for ${module}:`, responses);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error saving responses:", err.message);
    return res.status(500).json({ error: "Failed to save responses" });
  }
});

// 📍 Route: Check if assessment is completed
router.get("/can-take-psychometric/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT is_Psychometrictestcompleted FROM "Users" WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCompleted = result.rows[0].is_psychometrictestcompleted;

    if (isCompleted) {
      // Already completed, fetch results directly
      const testResult = await pool.query(
        `SELECT overall_scores, module_analysis, radar_data, career_predictions
         FROM PsychometricTestResults
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      return res.json({
        canTakeTest: false,
        message: "Assessment already completed",
        results: testResult.rows[0] || null
      });
    } else {
      // Not completed, allow assessment
      return res.json({ canTakeTest: true, message: "Assessment not yet taken" });
    }

  } catch (err) {
    console.error("Error checking assessment status:", err.message);
    res.status(500).json({ message: "Server error checking test status" });
  }
});


router.post("/analyze-psychometric-results", async (req, res) => {
  const { moduleScores, studentName, userId } = req.body;

  if (!studentName || !userId || !Array.isArray(moduleScores)) {
    return res.status(400).json({ error: "Invalid input for analysis." });
  }

  const reportPrompt = `Generate a short and simple professional AI-based psychometric analysis report for a student named "${studentName}". 
Use the following module scores (out of 100) to describe their cognitive, personality, emotional, problem-solving, decision-making, leadership, stress management, risk-taking, adaptability, subject interest, career interest, and soft skill orientation traits:

${moduleScores.map(s => `${s.module}: ${s.score}`).join("\n")}

Return ONLY valid JSON like this (NO markdown formatting, NO explanation, NO triple backticks):
{
  "overall_analysis": "Brief paragraph analyzing the overall psychometric profile.",
  "categories": [
    {
      "module": "Module Name",
      "score": 87,
      "analysis": "Short paragraph about performance in this module."
    }
  ]
}
`;

  const predictionPrompt = `Based on the following psychometric scores, predict the top 5 most suitable careers and related courses for the student in a tree-like JSON format.
Each career should contain 5-6 related courses with a short one-line description and a score (0-100) indicating relevance.

Module Scores:
${moduleScores.map(s => `${s.module}: ${s.score}`).join("\n")}

Return only valid JSON in the following format:
[
  {
    "career": "Career Name",
    "score": number,
    "recommended_courses": [
      {
        "course": "Course Name",
        "score": number,
        "description": "Short detail"
      }
    ]
  }
]
`;

  try {
    // 1. AI Psychometric Analysis Report
    const analysisRes = await axios.post(
      TOGETHER_AI_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [{ role: "user", content: reportPrompt }],
        max_tokens: 2048,
      },
      {
        headers: { Authorization: `Bearer ${TOGETHER_AI_API_KEY}` },
      }
    );

    let analysisContent = analysisRes.data.choices[0].message.content.trim();
    if (analysisContent.startsWith("```")) {
      analysisContent = analysisContent.replace(/```(?:json)?/g, "").trim();
    }

    const parsedAnalysis = JSON.parse(analysisContent);

    // 2. AI Career/Course Prediction
    const predictionRes = await axios.post(
      TOGETHER_AI_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [{ role: "user", content: predictionPrompt }],
        max_tokens: 2048,
      },
      {
        headers: { Authorization: `Bearer ${TOGETHER_AI_API_KEY}` },
      }
    );

    let predictionContent = predictionRes.data.choices[0].message.content.trim();
    if (predictionContent.startsWith("```")) {
      predictionContent = predictionContent.replace(/```(?:json)?/g, "").trim();
    }

    const parsedPrediction = JSON.parse(predictionContent);

    // 3. Save to DB
    await pool.query(
      `INSERT INTO PsychometricTestResults (user_id, overall_scores, module_analysis, radar_data, career_predictions)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET 
         overall_scores = EXCLUDED.overall_scores,
         module_analysis = EXCLUDED.module_analysis,
         radar_data = EXCLUDED.radar_data,
         career_predictions = EXCLUDED.career_predictions`,
      [
        userId,
        JSON.stringify(moduleScores), // overall_scores
        JSON.stringify(parsedAnalysis.categories), // module_analysis
        JSON.stringify(moduleScores), // radar_data (same for now)
        JSON.stringify(parsedPrediction), // career_predictions
      ]
    );

    await pool.query(
      `UPDATE "Users" SET is_Psychometrictestcompleted = true WHERE id = $1`,
      [userId]
    );

    res.json({
      summary: parsedAnalysis.overall_scores,
      module_analysis: parsedAnalysis.categories,
      radar_data: moduleScores,
      career_predictions: parsedPrediction,
    });

  } catch (err) {
    console.error("Error generating psychometric report:", err.message);
    if (err.response?.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    return res.status(500).json({ error: "Failed to generate report" });
  }
});

// 📥 Route: Get Psychometric Results
router.get("/psychometric-result/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT overall_scores, module_analysis, radar_data, career_predictions
       FROM PsychometricTestResults
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    res.json({
      overall_scores: result.rows[0].overall_scores,
      module_analysis: result.rows[0].module_analysis,
      radar_data: result.rows[0].radar_data,
      career_predictions: result.rows[0].career_predictions,
    });
  } catch (err) {
    console.error("Error fetching psychometric result:", err.message);
    res.status(500).json({ message: "Server error fetching results" });
  }
});


router.post("/request-retake", async (req, res) => {
  try {
    const { userId, dateTaken } = req.body;

    const userQuery = await pool.query(
      `SELECT u.full_name, u.email, u.role, d.grade, d.school_name, d.career_interest, d.subject_interest
       FROM "Users" u
       JOIN StudentDetails d ON u.id = d.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userQuery.rows[0];

    const mailOptions = {
      from: user.email,
      to: process.env.SMTP_EMAIL,
      subject: `Retake Request: Psychometric Assessment from ${user.full_name}`,
      html: `
        <h3>Retake Request Received</h3>
        <p><strong>Name:</strong> ${user.full_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Grade:</strong> ${user.grade || "N/A"}</p>
        <p><strong>School:</strong> ${user.school_name || "N/A"}</p>
        <p><strong>Career Interests:</strong> ${(user.career_interest || []).join(", ")}</p>
        <p><strong>Subject Interests:</strong> ${(user.subject_interest || []).join(", ")}</p>
        <p><strong>Request Date:</strong> ${new Date(dateTaken).toLocaleString()}</p>
        <p><strong>Reason:</strong> Student has completed the assessment and requested to retake it.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Retake request email sent to admin." });
  } catch (error) {
    console.error("Error sending retake email:", error);
    return res.status(500).json({ message: "Failed to send retake request." });
  }
});

router.post('/compare', async (req, res) => {
  const { inputA, inputB } = req.body;

  const messages = [
    {
      role: 'system',
      content:
        `You are a helpful AI that compares two topics in a simple and structured way for school students. Return the comparison in valid JSON format with the following fields for each topic:\n\n` +
        `title: name of the topic,\nreason: simple 2 line reason why it's a good fit,\nsalary: average salary in INR per year (approximate),\nexam_eligibility: minimum qualification or requirement,\nentrance_exams: common entrance exams (if any),\ncompanies: top companies that hire for this field,\nroles: common roles or job titles.\n\nReturn your entire answer as a JSON object like this:\n{\n  "A": { ... },\n  "B": { ... }\n}`
    },
    {
      role: 'user',
      content: `Compare "${inputA}" and "${inputB}" as described.`
    }
  ];

  try {
    const response = await axios.post(
      TOGETHER_AI_URL,
      {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiContent = response.data.choices?.[0]?.message?.content;

    // Ensure it’s valid JSON (fixes minor format issues if any)
    const startIndex = aiContent.indexOf('{');
    const endIndex = aiContent.lastIndexOf('}');
    const validJson = aiContent.slice(startIndex, endIndex + 1);
    const parsed = JSON.parse(validJson);

    res.json({ result: parsed });
  } catch (err) {
    console.error('Together AI Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }});


router.get("/parent-datas/:parentId", async (req, res) => {
  const { parentId } = req.params;

  try {
    // Get approved children for parent
    const childrenQuery = await pool.query(
      `SELECT u.id, u.full_name, u.email, sd.grade, sd.school_name, u.is_psychometrictestcompleted
       FROM ParentChildLinks pcl
       JOIN "Users" u ON pcl.child_id = u.id
       LEFT JOIN StudentDetails sd ON u.id = sd.user_id
       WHERE pcl.parent_id = $1 AND pcl.status = 'approved'`,
      [parentId]
    );

    const children = await Promise.all(
      childrenQuery.rows.map(async (child) => {
        let report = null;
        let selfDiscovery = null;

        if (child.is_psychometrictestcompleted) {
          const reportQuery = await pool.query(
            `SELECT overall_scores, category_results FROM PsychometricTestResults WHERE user_id = $1`,
            [child.id]
          );

          if (reportQuery.rows.length > 0) {
            report = reportQuery.rows[0];
          }
        }

        // Fetch Self Discovery Assessment Analysis if available
        const discoveryQuery = await pool.query(
          `SELECT self_awareness_score, self_awareness_insight,
                  learning_style_score, learning_style_insight,
                  career_interest_score, career_interest_insight,
                  subject_preference_score, subject_preference_insight
           FROM PsychometricResults WHERE user_id = $1 AND completed = true`,
          [child.id]
        );

        if (discoveryQuery.rows.length > 0) {
          selfDiscovery = discoveryQuery.rows[0];
        }

        return {
          id: child.id,
          name: child.full_name,
          email: child.email,
          grade: child.grade,
          school: child.school_name,
          testCompleted: child.is_psychometrictestcompleted,
          report: report || null,
          selfDiscovery: selfDiscovery || null,
        };
      })
    );

    res.json({ children });
  } catch (error) {
    console.error("Error fetching parent dashboard data:", error);
    res.status(500).json({ message: "Server error fetching dashboard info." });
  }
});

const db = require("../db"); // or wherever your db.js file is

router.post("/community-message", async (req, res) => {
  const { userId, fullName, email, message } = req.body;

  try {
    await db.query(
      "INSERT INTO parent_community_messages (user_id, full_name, email, message) VALUES ($1, $2, $3, $4)",
      [userId, fullName, email, message]
    );
    res.status(200).json({ message: "Message posted successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Error saving message" });
  }
});

router.get("/community-messages", async (req, res) => {
  const { filter } = req.query;

  let filterCondition = "";
  if (filter === "week") {
    filterCondition = `WHERE created_at >= NOW() - INTERVAL '7 days'`;
  } else if (filter === "month") {
    filterCondition = `WHERE created_at >= NOW() - INTERVAL '1 month'`;
  }

  try {
    const messagesQuery = `
      SELECT id, user_id, full_name, email, message, created_at
      FROM parent_community_messages
      ${filterCondition}
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(messagesQuery);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});




router.post('/generate-questions', async (req, res) => {
  const { subject, difficulty, type, numQuestions, bloom } = req.body;

  const prompt = `
Generate ${numQuestions} ${type} questions in ${subject} at a ${difficulty} level.
The questions should align with the '${bloom}' level of Bloom's Taxonomy.
Each question should include:
1. The question
2. Options (A, B, C, D) if applicable
3. The correct answer
4. A brief explanation
`;

  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.choices[0].message.content;
    res.json({ questions: generatedText });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
});

router.post('/generate-quiz', async (req, res) => {
  const { subject, difficulty, type, numQuestions, bloom } = req.body;

  const prompt = `
Generate ${numQuestions} ${type} questions in ${subject} at a ${difficulty} level.
Each question should align with the '${bloom}' level of Bloom's Taxonomy.
Format the questions like:
1. Question text?
A) Option 1
B) Option 2
C) Option 3
D) Option 4
Answer: C
`;

  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = response.data.choices[0].message.content;
    console.log("=== RAW RESPONSE ===\n", raw);

    const blocks = raw.split(/\n(?=\d+\.)/); // split on numbered questions

    const questions = blocks.map((block, index) => {
      const match = block.match(/\d+\.\s*([\s\S]*?)\nA[\).]?\s*([\s\S]*?)\nB[\).]?\s*([\s\S]*?)\nC[\).]?\s*([\s\S]*?)\nD[\).]?\s*([\s\S]*?)\nAnswer:?[\s\-]*(\w)/i);
      if (!match) {
        console.warn(`⚠️ Failed to parse question ${index + 1}:`, block);
        return null;
      }

      return {
        question: match[1].trim(),
        options: [match[2].trim(), match[3].trim(), match[4].trim(), match[5].trim()],
        correct: match[6].toUpperCase()
      };
    }).filter(Boolean);

    if (questions.length === 0) {
      console.warn('⚠️ No valid questions parsed.');
    }

    res.json({ questions });
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
});


router.post('/send-query', async (req, res) => {
  const { userId, name, email, message } = req.body;

  if (!userId || !email || !name || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Insert query into the database
    await pool.query(
      'INSERT INTO UserQueries (user_id, name, email, message) VALUES ($1, $2, $3, $4)',
      [userId, name, email, message]
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nt2.0kalkipioneers@gmail.com',
        pass: 'oepr vzbe szvd pczv'
      }
    });

    await transporter.sendMail({
      from: email,
      to: 'nt2.0kalkipioneers@gmail.com',
      subject: 'New Query from Student',
      text: `From: ${name} <${email}>\n\n${message}`
    });

    res.json({ success: true, message: 'Query submitted and email sent!' });
  } catch (err) {
    console.error('Error handling query:', err);
    res.status(500).json({ error: 'Failed to submit query.' });
  }
});

router.post('/generate-report', (req, res) => {
  const { name, email, score, total, questions, answers } = req.body;
  const reportHtml = `
    <h1>Quiz Report</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Score:</strong> ${score}/${total}</p>
    <hr/>
    ${questions.map((q, idx) => `
      <div>
        <p><strong>Q${idx + 1}:</strong> ${q.question}</p>
        <p>Your Answer: ${answers[idx] || 'Not Answered'}</p>
        <p>Correct Answer: ${q.correct}</p>
      </div>
    `).join('<hr/>')}
  `;

  pdf.create(reportHtml).toFile('./quiz-report.pdf', (err, result) => {
    if (err) return res.status(500).send(err);
    res.download(result.filename);
  });
});

const DIRECTIONS = [
  { dx: 0, dy: 1 },   // down
  { dx: 1, dy: 0 },   // right
  { dx: 0, dy: -1 },  // up
  { dx: -1, dy: 0 },  // left
  { dx: 1, dy: 1 },   // down-right
  { dx: -1, dy: -1 }, // up-left
  { dx: 1, dy: -1 },  // up-right
  { dx: -1, dy: 1 },  // down-left
];

async function getCareerWordsFromAI(count = 5) {
  const prompt = `Generate ${count} unique career-related words (max 10 letters) and a challenging clue for each, formatted as a JSON array of objects like [{ "answer": "jobname", "clue": "clue here" }, ...]`;

  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error fetching words from AI:', error);
    return [];
  }
}

function placeWords(grid, size, words) {
  const answers = [];
  const questions = [];

  for (const { answer, clue } of words) {
    let placed = false;
    const attempts = 100;

    for (let i = 0; i < attempts && !placed; i++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);
      let x = startX;
      let y = startY;

      const coords = [];
      let valid = true;

      for (const char of answer.toLowerCase()) {
        if (
          x < 0 || x >= size || y < 0 || y >= size ||
          (grid[y][x] !== '' && grid[y][x] !== char)
        ) {
          valid = false;
          break;
        }
        coords.push({ row: y, col: x });
        x += dir.dx;
        y += dir.dy;
      }

      if (valid) {
        coords.forEach((cell, i) => {
          grid[cell.row][cell.col] = answer[i].toLowerCase();
        });

        answers.push(answer.toLowerCase());
        questions.push(clue);
        placed = true;
      }
    }
  }

  return { grid, questions, answers };
}

async function generateGrid(size = 10) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const words = await getCareerWordsFromAI(6);
  const { questions, answers } = placeWords(grid, size, words);

  // Fill empty cells with random letters
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { questions, answers, grid };
}

router.get('/riddle', async (req, res) => {
  const riddle = await generateGrid(10);
  console.log('Answers:', riddle.answers); // Log in the server console
  res.json({
    ...riddle,
    debugAnswers: riddle.answers // include in response temporarily
  });
});


const shapeSets = {
  4: ["🔴", "🟢", "🔷", "🟡"],
  5: ["🔴", "🟢", "🔷", "🟡", "🟣"],
  6: ["🔴", "🟢", "🔷", "🟡", "🟣", "🟤"],
  7: ["🔴", "🟢", "🔷", "🟡", "🟣", "🟤", "⚫"],
  9: ["🔴", "🟢", "🔷", "🟡", "🟣", "🟤", "⚫", "🔶", "⬛"],
};

// Helper function to check validity
function isValidGrid(grid, row, col, shape) {
  const size = grid.length;

  // Check row and column for clashes
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === shape || grid[i][col] === shape) {
      return false;
    }
  }

  // Check diagonals
  if (row === col) {
    for (let i = 0; i < size; i++) {
      if (grid[i][i] === shape) return false;
    }
  }

  if (row + col === size - 1) {
    for (let i = 0; i < size; i++) {
      if (grid[i][size - i - 1] === shape) return false;
    }
  }

  return true;
}

// Backtracking puzzle generation
function generatePuzzle(size) {
  const shapes = shapeSets[size];
  let grid = Array(size).fill(null).map(() => Array(size).fill(null));

  const fillGrid = (row, col) => {
    if (row === size) return true;
    if (col === size) return fillGrid(row + 1, 0);
    
    const availableShapes = [...shapes];
    for (let i = 0; i < row; i++) {
      const shapeIndex = availableShapes.indexOf(grid[i][col]);
      if (shapeIndex !== -1) availableShapes.splice(shapeIndex, 1);
    }
    for (let i = 0; i < col; i++) {
      const shapeIndex = availableShapes.indexOf(grid[row][i]);
      if (shapeIndex !== -1) availableShapes.splice(shapeIndex, 1);
    }

    // Try each available shape
    for (let shape of availableShapes) {
      if (isValidGrid(grid, row, col, shape)) {
        grid[row][col] = shape;
        if (fillGrid(row, col + 1)) {
          return true;
        }
      }
    }

    grid[row][col] = null; // Backtrack
    return false;
  };

  fillGrid(0, 0);

  // Generate a solvable puzzle by removing some values
  const removeValues = (level) => {
    const totalCells = size * size;
    const cellsToRemove = level === 1 ? 2 : level === 2 ? 5 : level === 3 ? 7 : 10;
    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      grid[row][col] = null;
    }
  };

  removeValues(size);

  return { grid, shapes };
}

router.get("/puzzle/:level", (req, res) => {
  const level = parseInt(req.params.level);
  const size = level === 1 ? 4 : level + 3;
  const { grid, shapes } = generatePuzzle(size);
  res.json({ puzzle: grid, shapes });
});



// const MODEL_PATH = "model/vosk-model-small-en-us-0.15";
// vosk.setLogLevel(0); // Optional
// const model = new vosk.Model(MODEL_PATH);

// if (!fs.existsSync(MODEL_PATH)) {
//   console.error("Vosk model not found. Download and extract it first.");
//   process.exit();
// }

// router.post("/analyze", upload.single("audio"), (req, res) => {
//   const inputPath = req.file.path;
//   const outputPath = inputPath + ".wav";

//   ffmpeg(inputPath)
//     .audioChannels(1)
//     .audioFrequency(16000)
//     .format("wav")
//     .on("end", () => {
//       const wfStream = fs.createReadStream(outputPath, { highWaterMark: 4096 });
//       const rec = new vosk.KaldiRecognizer(model, 16000);
//       rec.setWords(true);

//       wfStream.on("data", (data) => {
//         rec.acceptWaveform(data);
//       });

//       wfStream.on("end", () => {
//         const result = JSON.parse(rec.finalResult());
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//         return res.json({ transcription: result.text });
//       });
//     })
//     .on("error", (err) => {
//       console.error("ffmpeg error:", err);
//       return res.status(500).json({ error: "Failed to process audio" });
//     })
//     .save(outputPath);
// });


const story = `It was a foggy morning in Elmsworth when Mia found an old journal in her grandmother’s attic...`;

const generateQuestions = () => {
  const mcqs = [
    {
      "id": 16,
      "type": "mcq",
      "question": "What time of day was it when Mia found the journal?",
      "options": ["Morning", "Afternoon", "Evening", "Night"],
      "answer": "Morning"
    },
    {
      "id": 17,
      "type": "mcq",
      "question": "What material was the journal made of?",
      "options": ["Paper", "Cloth", "Leather", "Plastic"],
      "answer": "Leather"
    },
    {
      "id": 18,
      "type": "mcq",
      "question": "Where was the journal found?",
      "options": ["Library", "Basement", "Attic", "Shed"],
      "answer": "Attic"
    },
    {
      "id": 19,
      "type": "mcq",
      "question": "Who was Thomas to Mia?",
      "options": ["Great-grandfather", "Uncle", "Cousin", "Father"],
      "answer": "Great-grandfather"
    },
    {
      "id": 20,
      "type": "mcq",
      "question": "What natural event was described in the journal?",
      "options": ["Earthquake", "Storms", "Volcano", "Hurricane"],
      "answer": "Storms"
    },
    {
      "id": 21,
      "type": "mcq",
      "question": "What did Thomas write about besides ships and stars?",
      "options": ["Dreams", "Lights", "People", "Animals"],
      "answer": "Lights"
    },
    {
      "id": 22,
      "type": "mcq",
      "question": "What did Mia find at the top of the lighthouse?",
      "options": ["Binoculars", "Telescope", "Lantern", "Chair"],
      "answer": "Telescope"
    },
    {
      "id": 23,
      "type": "mcq",
      "question": "What color was the lighthouse described as?",
      "options": ["White", "Red", "Not described", "Blue"],
      "answer": "Not described"
    },
    {
      "id": 24,
      "type": "mcq",
      "question": "What did Mia hear when the radio came on?",
      "options": ["Music", "A warning", "A calm voice", "A scream"],
      "answer": "A calm voice"
    },
    {
      "id": 25,
      "type": "mcq",
      "question": "What was the radio’s condition before it came alive?",
      "options": ["Rusty", "Broken", "Flickering", "Dead"],
      "answer": "Dead"
    },
    {
      "id": 26,
      "type": "mcq",
      "question": "What filled the air as the radio turned on?",
      "options": ["Fog", "Music", "A low hum", "Static noise"],
      "answer": "A low hum"
    },
    {
      "id": 27,
      "type": "mcq",
      "question": "What did Mia do after seeing the flash of light?",
      "options": ["Panicked", "Left immediately", "Heard the radio", "Closed the journal"],
      "answer": "Heard the radio"
    },
    {
      "id": 28,
      "type": "mcq",
      "question": "What was the telescope pointing toward?",
      "options": ["Mountains", "The sea", "A house", "The clouds"],
      "answer": "The sea"
    },
    {
      "id": 29,
      "type": "mcq",
      "question": "What happened to the light after the voice spoke?",
      "options": ["It exploded", "It blinked again", "It disappeared", "It changed color"],
      "answer": "It disappeared"
    },
    {
      "id": 30,
      "type": "mcq",
      "question": "How did Mia feel about the lighthouse later?",
      "options": ["Avoided it", "Feared it", "Returned often", "Forgot about it"],
      "answer": "Returned often"
    },
    {
      "id": 31,
      "type": "mcq",
      "question": "Where was the story set?",
      "options": ["Rivertown", "Elmsworth", "Seaside", "Brighton"],
      "answer": "Elmsworth"
    },
    {
      "id": 32,
      "type": "mcq",
      "question": "What genre does this story best represent?",
      "options": ["Science fiction", "Mystery", "Biography", "Fantasy"],
      "answer": "Mystery"
    },
    {
      "id": 33,
      "type": "mcq",
      "question": "What type of weather opened the story?",
      "options": ["Rainy", "Foggy", "Stormy", "Snowy"],
      "answer": "Foggy"
    },
    {
      "id": 34,
      "type": "mcq",
      "question": "What did the journal NOT describe?",
      "options": ["Stars", "Storms", "People", "Ships"],
      "answer": "People"
    },
    {
      "id": 35,
      "type": "mcq",
      "question": "What sound did Thomas report hearing?",
      "options": ["Music", "Whispers", "Thunder", "Shouting"],
      "answer": "Whispers"
    }
  ];

  const nonMcqs = [
    {
      "id": 1,
      "type": "non-mcq",
      "question": "Who originally wrote the journal Mia discovered?",
      "answer": "Thomas"
    },
    {
      "id": 2,
      "type": "non-mcq",
      "question": "What kind of handwriting was found in the journal?",
      "answer": "Elegant handwriting"
    },
    {
      "id": 3,
      "type": "non-mcq",
      "question": "What did the lighthouse smell like?",
      "answer": "Salt and time"
    },
    {
      "id": 4,
      "type": "non-mcq",
      "question": "What object was found still pointing out to sea?",
      "answer": "A dusty telescope"
    },
    {
      "id": 5,
      "type": "non-mcq",
      "question": "Describe Mia`s reaction to finding the journal.",
      "answer": "She was curious and a bit spooked"
    },
    {
      "id": 6,
      "type": "non-mcq",
      "question": "What stopped appearing in the journal after the strange entry?",
      "answer": "There were no more pages"
    },
    {
      "id": 7,
      "type": "non-mcq",
      "question": "What was the lighthouse`s current state?",
      "answer": "Abandoned"
    },
    {
      "id": 8,
      "type": "non-mcq",
      "question": "What was blinking on the horizon?",
      "answer": "A flash of light"
    },
    {
      "id": 9,
      "type": "non-mcq",
      "question": "What happened after the radio went dead?",
      "answer": "The light outside disappeared"
    },
    {
      "id": 10,
      "type": "non-mcq",
      "question": "Why didn't Mia tell anyone about her experience?",
      "answer": "She chose to keep it to herself"
    },
    {
      "id": 11,
      "type": "non-mcq",
      "question": "What does the quote 'The sea remembers' imply?",
      "answer": "The sea holds memories or secrets"
    },
    {
      "id": 12,
      "type": "non-mcq",
      "question": "What made Mia return to the lighthouse repeatedly?",
      "answer": "She was seeking answers from the sea"
    },
    {
      "id": 13,
      "type": "non-mcq",
      "question": "What items were involved in the mysterious events?",
      "answer": "The journal, telescope, and radio"
    },
    {
      "id": 14,
      "type": "non-mcq",
      "question": "What caused Mia to go to the attic?",
      "answer": "She stumbled upon the journal there"
    },
    {
      "id": 15,
      "type": "non-mcq",
      "question": "What did Thomas see across the sea?",
      "answer": "Strange lights dancing"
    }
  ];

  return [...mcqs, ...nonMcqs];
};

router.get('/story', (req, res) => {
  res.json({ story, questions: generateQuestions() });
});





const redis = require('redis');
// Initialize Redis client for caching (optional, can be replaced with an in-memory cache for local development)
const client = redis.createClient({ host: 'localhost', port: 6379 });

// Create an axios instance and attach retry-axios functionality
const axiosInstance = axios.create();
rax.attach(axiosInstance);

// Set retry configuration
axiosInstance.defaults.raxConfig = {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // Exponential backoff delay
  shouldRetry: (error) => {
    // Retry on network errors or 5xx server errors
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  },
};

// Helper function: Ask Together AI
async function askAI(messages) {
  const response = await axiosInstance.post(
    'https://api.together.ai/endpoint',  // Replace with actual API endpoint
    {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${TOGETHER_AI_API_KEY}`,  // Replace with your actual API key
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

// Helper function: Safely parse broken AI JSON
function safeJsonParse(raw) {
  try {
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']');
    const jsonString = raw.substring(jsonStart, jsonEnd + 1);

    // Sanitize common AI mistakes
    const sanitized = jsonString
      .replace(/\n/g, ' ')        // Remove newlines
      .replace(/\r/g, '')         // Remove carriage returns
      .replace(/\\"/g, "'")       // Replace escaped quotes
      .replace(/“|”/g, '"')       // Fix fancy quotes
      .replace(/‘|’/g, "'");      // Fix fancy apostrophes

    return JSON.parse(sanitized);
  } catch (err) {
    console.error('Safe JSON parse failed:', err.message);
    throw err;
  }
}

// Helper function: Generate 2 questions for a topic
async function generateQuestionsForTopic(topic) {
  const prompt = `
You must reply ONLY with a JSON array.

Generate 2 short multiple-choice questions about ${topic} for children (grades 9-10).
Each question must include:
- A clear question
- 4 options (A, B, C, D)
- Correct answer letter ("A", "B", "C", or "D")

Example format:
[
  {
    "question": "What is the synonym of 'happy'?",
    "options": ["sad", "joyful", "angry", "tired"],
    "answer": "B"
  },
  ...
]
`;

  const rawResponse = await askAI([{ role: "user", content: prompt }]);
  return safeJsonParse(rawResponse);
}

// Route: Fetch tasks and story starter
router.get('/fetchTasks', async (req, res) => {
  try {
    const topics = [
      "Synonyms",
      "Antonyms",
      "Tenses",
      "Voices",
      "Direct and Indirect Speech"
    ];

    const allQuestions = [];

    for (const topic of topics) {
      const questions = await generateQuestionsForTopic(topic);
      allQuestions.push(...questions);
    }

    // Generate story starter
    const storyPrompt = `
Generate a short 1-2 line creative story starter for grade 9-10 children.
Reply only with the story sentence. No headings, no extra text.
`;

    const storyStarter = await askAI([{ role: "user", content: storyPrompt }]);

    res.json({ tasks: allQuestions, storyStarter });
  } catch (error) {
    console.error('Error fetching tasks from AI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// Route 2: Evaluate Level 1 Answers (MCQ Evaluation)
router.post('/evaluateLevel1', async (req, res) => {
  const { answersData } = req.body;
  try {
    if (!Array.isArray(answersData)) {
      return res.status(400).json({ error: 'Invalid input format for answersData.' });
    }

    let score = 0;
    answersData.forEach(item => {
      if (item.correctAnswer === item.userAnswer) {
        score += 15;
      }
    });

    res.json({ score });
  } catch (error) {
    console.error('Error evaluating level 1:', error.message);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// Route 3: Evaluate Level 2 Creative Writing (Creative Writing Evaluation)
router.post('/evaluateLevel2', async (req, res) => {
  const { level2Input } = req.body;
  try {
    if (!level2Input || typeof level2Input !== 'string') {
      return res.status(400).json({ error: 'Invalid writing input for evaluation.' });
    }

    const evalPrompt = `
Act as a creative writing judge. Score the following writing based on:
- Creativity (0-10)
- Grammar (0-10)
- Engagement (0-5)

Then provide 1-2 sentence feedback.

Example output:
{
  "creativity": 9,
  "grammar": 8,
  "engagement": 5,
  "feedback": "Very imaginative story with excellent language skills!"
}

Here is the writing:
"""${level2Input}"""
`;

    const evalResponse = await askAI([{ role: "user", content: evalPrompt }]);

    const evalJsonStart = evalResponse.indexOf('{');
    const evalJson = evalResponse.substring(evalJsonStart);

    // Safely parse the evaluation result
    const result = safeJsonParse(evalJson);

    if (!result) {
      return res.status(500).json({ error: 'Failed to parse AI evaluation result' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error evaluating level 2:', error.message || error.response?.data);
    res.status(500).json({ error: 'Writing evaluation failed' });
  }
});


const { v4: uuidv4 } = require('uuid');

const NUM_QUESTIONS = 10;

const TOGETHER_API_KEY = '77a33fe9a913e848e6eb311f816740ff928d2146260bd643fd0d0d916a3976ed';

const sessions = {};

router.get('/start-game', async (req, res) => {
  const sessionId = uuidv4();

  try {
    const { datasets, questions } = await generateDatasetsAndQuestions();

    sessions[sessionId] = {
      datasets,
      questions,
      score: 0
    };

    res.json({
      session_id: sessionId,
      datasets,
      questions
    });
  } catch (err) {
    console.error('Game generation failed:', err.message);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.post('/submit-answer', (req, res) => {
  const { session_id, question_index, user_answer } = req.body;

  const session = sessions[session_id];
  if (!session) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  const question = session.questions[question_index];
  const is_correct = user_answer === question.answer;

  if (is_correct) {
    session.score += 1;
  }

  const next_question = question_index + 1 < session.questions.length;

  res.json({
    is_correct,
    next_question,
    score: session.score
  });
});

async function generateDatasetsAndQuestions() {
  // Randomly assign medium and hard difficulties (ensuring both are present)
  const difficulties = Array(NUM_QUESTIONS)
    .fill()
    .map(() => (Math.random() < 0.5 ? 'medium' : 'hard'))
    .sort(() => Math.random() - 0.5); // Shuffle to avoid predictable order
  const datasetTypes = ['Table', 'Pie Chart', 'Bar Chart'];

  // Updated question styles for medium/hard difficulty, removing simple ones
  const questionStyles = [
    'calculate the total sum of a specific category',
    'calculate the average across multiple items',
    'find percentage difference between two items',
    'detect the increasing or decreasing trend',
    'compare two categories and identify the larger one',
    'find the item with closest value to a given number',
    'identify outlier (item significantly different from others)',
    'calculate ratio between two categories',
    'find the second highest value after sorting',
    'combine values from multiple categories to find a total'
  ];

  // Ensure uniqueness by assigning distinct themes
  const themes = [
    'sales revenue',
    'healthcare metrics',
    'sports performance',
    'educational outcomes',
    'technology adoption',
    'environmental data',
    'e-commerce trends',
    'financial budgets',
    'transportation stats',
    'social media engagement'
  ].slice(0, NUM_QUESTIONS); // Use exactly 10 unique themes

  // Shuffle arrays to ensure variety
  const shuffledDatasetTypes = datasetTypes
    .concat(datasetTypes, datasetTypes) // Ensure enough types
    .slice(0, NUM_QUESTIONS)
    .sort(() => Math.random() - 0.5);
  const shuffledStyles = questionStyles.sort(() => Math.random() - 0.5);
  const shuffledThemes = themes.sort(() => Math.random() - 0.5);

  const instructions = difficulties.map((difficulty, idx) => {
    const type = shuffledDatasetTypes[idx];
    const style = shuffledStyles[idx];
    const theme = shuffledThemes[idx];

    const difficultyRules = difficulty === 'medium'
      ? '- Require one-step reasoning (e.g., basic calculations, comparisons, or simple trend detection). Avoid trivial questions like finding max/min.'
      : '- Require multi-step reasoning (e.g., combining values, calculating percentages, identifying complex trends, or ratios). Ensure calculations involve at least two operations.';

    return `
Question ${idx + 1}:
Dataset Type: ${type}
Difficulty: ${difficulty}
Question Style: ${style}
Theme: ${theme}
Rules:
- Dataset must relate to the theme: "${theme}".
- Table: Max 4 rows x 4 columns.
- Pie Chart / Bar Chart: Max 6 entries.
- Every Pie/Bar entry must have a color (avoid white or black).
- Create one question matching the style: "${style}".
- Exactly 4 unique options per question.
- Correct answer must be present among options.
- Randomize option order.
- ${difficultyRules}
    `;
  }).join('\n');

  const finalPrompt = `
You are a professional dataset and quiz creator.

**Dataset Rules:**
- Create realistic datasets for tables, pie charts, or bar charts based on the specified theme.
- Table size: up to 4 rows × 4 columns.
- Pie/Bar: maximum 6 categories.
- Every Pie/Bar item must have:
  - A meaningful, human-readable category name (e.g., "Smartphones", "Vegetables", "Countries").
  - A color (avoid white or black).
- Ensure datasets are unique and tied to the given theme (e.g., sales, health, sports).

**Question Rules:**
- Write 1 multiple-choice question per dataset.
- Follow the specific "Question Style" (e.g., calculate average, detect trend).
- Medium difficulty: One-step reasoning (e.g., comparisons, basic calculations).
- Hard difficulty: Multi-step reasoning (e.g., percentage changes, combined values, trends).
- Always 4 unique options.
- Correct answer randomly among them.
- Ensure questions are distinct in style and dataset content.

**Output strictly in JSON:**
[
{
  "dataset_type": "Table" | "Pie Chart" | "Bar Chart",
  "dataset": [...],
  "question_text": "...",
  "options": ["...", "...", "...", "..."],
  "answer": "..."
},
...
]

NO explanation or extra text. Only valid JSON.

${instructions}
`;

  try {
    const response = await axios.post(
      TOGETHER_AI_URL,
      {
        model: TOGETHER_MODEL,
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 4096
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices?.[0]?.message?.content;
    console.log("TOGETHER AI RAW RESPONSE:\n", aiResponse);

    const jsonStart = aiResponse.indexOf('[');
    if (jsonStart === -1) {
      throw new Error("No JSON array found in AI response.");
    }

    const jsonString = aiResponse.slice(jsonStart);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed) || parsed.length !== NUM_QUESTIONS) {
      throw new Error("Parsed AI output is invalid.");
    }

    const datasets = parsed.map(q => ({ dataset_type: q.dataset_type, dataset: q.dataset }));
    const questions = parsed.map(q => ({
      question_text: q.question_text,
      options: q.options,
      answer: q.answer
    }));

    return { datasets, questions };
  } catch (err) {
    console.error("Failed to generate datasets/questions:", err.message);
    throw err;
  }
}

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

// For extended analysis
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();


router.get("/sentiment-analysis", async (req, res) => {
  try {
    const { role = 'all', from = '2000-01-01', to = '2100-01-01' } = req.query;

    // Adjust query to join Users table for fetching roles
    const baseQuery = `
      SELECT uq.message, u.role AS user_role, uq.created_at
      FROM UserQueries uq
      JOIN "Users" u ON u.id = uq.user_id
      WHERE uq.created_at BETWEEN $1 AND $2
      ${role !== 'all' ? "AND u.role = $3" : ""}
    `;

    const values = role !== 'all' ? [from, to, role] : [from, to];
    const result = await pool.query(baseQuery, values);

    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const emotionCategories = {
      joy: 0,
      anger: 0,
      sadness: 0,
      fear: 0,
      surprise: 0,
      trust: 0
    };
    const timeline = {}; // For date-wise sentiment trend

    result.rows.forEach(row => {
      const analysis = sentiment.analyze(row.message);
      const score = analysis.score;

      // Categorize sentiment
      if (score > 1) sentiments.positive++;
      else if (score < -1) sentiments.negative++;
      else sentiments.neutral++;

      // Emotion detection (simple keyword-based)
      const tokens = tokenizer.tokenize(row.message.toLowerCase());
      tokens.forEach(token => {
        if (["happy", "joy", "excited", "love"].includes(token)) emotionCategories.joy++;
        if (["angry", "mad", "rage", "furious"].includes(token)) emotionCategories.anger++;
        if (["sad", "cry", "upset", "depressed"].includes(token)) emotionCategories.sadness++;
        if (["afraid", "scared", "fear", "nervous"].includes(token)) emotionCategories.fear++;
        if (["surprise", "shocked", "amazed"].includes(token)) emotionCategories.surprise++;
        if (["trust", "reliable", "secure"].includes(token)) emotionCategories.trust++;
      });

      // Group by date for timeline chart
      const date = new Date(row.created_at).toISOString().split("T")[0];
      if (!timeline[date]) timeline[date] = { positive: 0, neutral: 0, negative: 0 };
      if (score > 1) timeline[date].positive++;
      else if (score < -1) timeline[date].negative++;
      else timeline[date].neutral++;
    });

    res.json({
      sentiments,
      emotions: emotionCategories,
      timeline: Object.entries(timeline).map(([date, values]) => ({ date, ...values }))
    });

  } catch (err) {
    console.error("Sentiment analysis error:", err);
    res.status(500).json({ error: "Failed to perform sentiment analysis." });
  }
});

module.exports = router;