import React from "react";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import ApproveParent from "./ApproveParent";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import Layout from "./Layout";
import Chatbot from "./components/Chatbot";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import SelfDiscoveryAssessment from "./pages/SelfDiscoveryAssessments";
import AssessmentPage from "./pages/Assessment";
import RoadmapGenerator from "./pages/Roadmap";
import Analysis from "./pages/Analysis";
import DynamicPlan from "./pages/DynamicPlan";
import StudentLayout from "./StudentLayout";
import AssessmentLayout from "./AssessmentLayout";
import PsychometricTest from "./pages/PsychometricTest";
import BigChatbot from "./pages/Chabot";
import CareerCompare from "./pages/CareerCompare";
import Parent from "./pages/Parent";
import QuestionGeneration from "./pages/QuestionGeneration";
import Query from "./pages/Query";
import MeetingTeacher from "./pages/MeetingTeacher";
import ParentCommunityPage from "./pages/ParentCommunityPage";
import AdminPage from "./pages/AdminPage";
import GameHome from "./pages/GameHome";
import CareerJalebi from "./pages/CareerJalebi";
import AptitudeActivity from "./pages/AptitudeActivity";
import ParentLayout from "./ParentLayout";
import CollegeDetails from "./pages/CollegeDetails";
import NewsPage from "./pages/NewsPage";
import VerbalVoyage from "./pages/VerbalVoyage";
import ReasoningRace from "./pages/ReasoningRace";
import WordRiddleGame from "./pages/WordRiddleGame";
import FillInTheBlankGame from "./pages/FillInTheBlankGame";
import WordMatchGame from "./pages/WordMatchGame";
import ComprehensionQuickieGame from "./pages/ComprehensionQuickieGame";
import SentenceBuilderGame from "./pages/SentenceBuilderGame";
import Sudoku from "./pages/Sudoku";
import DescribeImage from "./pages/DescribeImage";
import ListeningActivity from "./pages/ListeningActivity";
import Nonogram from "./pages/Nonogram";
import WritingActivity from "./pages/Writing-Activity";
import SkillShoot from "./pages/SkillShoot";
import PatternRecognition from "./pages/PatternRecognition";
import TowerOfHanoi from "./pages/HanoiTower";
import DataInterpretations from "./pages/DataInterpretations";
import SentimentAnalysis from "./pages/SentimentAnalysis";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Homepage/></Layout>} />
        <Route path="/bot" element={<Chatbot/>}/>
        <Route path="/entire-page-bot" element={<AssessmentLayout><BigChatbot/></AssessmentLayout>}/>
        <Route path="/register" element={<AssessmentLayout><RegisterPage /></AssessmentLayout>} />
        <Route path="/login" element={<AssessmentLayout><LoginPage/></AssessmentLayout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/approve-parent" element={<Layout><ApproveParent /></Layout> }/>
        <Route path="/student-dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout> }/>
        <Route path="/parent-dashboard" element={<ParentLayout><ParentDashboard /></ParentLayout> }/>
        <Route path="/teacher-dashboard" element={<Layout><TeacherDashboard /></Layout> }/>
        <Route path="/self-discovery" element={<AssessmentLayout><SelfDiscoveryAssessment/></AssessmentLayout>}/>
        <Route path="/self-discovery-start" element={<AssessmentLayout><AssessmentPage/></AssessmentLayout>}/>
        <Route path="/roadmap" element={<AssessmentLayout><RoadmapGenerator/></AssessmentLayout>}/>
        <Route path="/self-discovery-analysis" element={<AssessmentLayout><Analysis/></AssessmentLayout>}/>
        <Route path="/dynamic-career-plan" element={<AssessmentLayout><DynamicPlan/></AssessmentLayout>} />
        <Route path="/psychometric-test" element={<AssessmentLayout><PsychometricTest/></AssessmentLayout>} />
        <Route path="/career-compare" element={<AssessmentLayout><CareerCompare/></AssessmentLayout>} />
        <Route path="/parent-details" element={<ParentLayout><Parent/></ParentLayout>} />
        <Route path="/genai-questions" element={<AssessmentLayout><QuestionGeneration/></AssessmentLayout>} />
        <Route path="/send-query" element={<AssessmentLayout><Query/></AssessmentLayout>} />
        <Route path="/create-meeting" element={<AssessmentLayout><MeetingTeacher/></AssessmentLayout>} />
        <Route path="/parent-community" element={<ParentLayout><ParentCommunityPage/></ParentLayout>} />
        <Route path="/admin-details" element={<AssessmentLayout><AdminPage/></AssessmentLayout>} />
        <Route path="/game-home-page" element={<AssessmentLayout><GameHome/></AssessmentLayout>} />
        <Route path="/career-jalebi" element={<AssessmentLayout><CareerJalebi/></AssessmentLayout>} />
        <Route path="/aptitude-activity" element={<AssessmentLayout><AptitudeActivity/></AssessmentLayout>} />
        <Route path="/college-details" element={<AssessmentLayout><CollegeDetails/></AssessmentLayout>} />
        <Route path="/news-details" element={<AssessmentLayout><NewsPage/></AssessmentLayout>} />
        <Route path="/verbal-voyage" element={<AssessmentLayout><VerbalVoyage/></AssessmentLayout>} />
        <Route path="/reasoning-race" element={<AssessmentLayout><ReasoningRace/></AssessmentLayout>} />
        <Route path="/wordriddle" element={<AssessmentLayout><WordRiddleGame/></AssessmentLayout>} />
        <Route path="/wordmatch" element={<AssessmentLayout><WordMatchGame /></AssessmentLayout>} />
        <Route path="/fillintheblank" element={<AssessmentLayout><FillInTheBlankGame /></AssessmentLayout>} />
        <Route path="/sentencebuilder" element={<AssessmentLayout><SentenceBuilderGame /></AssessmentLayout>} />
        <Route path="/comprehensionquickie" element={<AssessmentLayout><ComprehensionQuickieGame /></AssessmentLayout>} />
        <Route path="/sudoku" element={<AssessmentLayout><Sudoku /></AssessmentLayout>} />
        <Route path="/describe-image" element={<AssessmentLayout><DescribeImage /></AssessmentLayout>} />
        <Route path="/listening-activity" element={<AssessmentLayout><ListeningActivity /></AssessmentLayout>} />
        <Route path="/nonogram" element={<AssessmentLayout><Nonogram /></AssessmentLayout>} />
        <Route path="/writing-activity" element={<AssessmentLayout><WritingActivity /></AssessmentLayout>} />
        <Route path="/skill-shoot" element={<AssessmentLayout><SkillShoot /></AssessmentLayout>} />
        <Route path="/pattern" element={<AssessmentLayout><PatternRecognition /></AssessmentLayout>} />
        <Route path="/hanoi-tower" element={<AssessmentLayout><TowerOfHanoi /></AssessmentLayout>} />
        <Route path="/data-interpretations" element={<AssessmentLayout><DataInterpretations /></AssessmentLayout>} />
        <Route path="/sentiment-analysis" element={<AssessmentLayout><SentimentAnalysis /></AssessmentLayout>} />
      </Routes>
    </Router>
  );
};

export default App;
