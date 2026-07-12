import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import FormAutomationTool from './pages/FormAutomation/FormAutomationTool';
import AiFormGenerator from './pages/AiFormGenerator/AiFormGenerator';
import VoiceToText from './pages/VoiceToText/VoiceToText';
import TextToVoice from './pages/TextToVoice/TextToVoice';
import CreateSplitGroup from './pages/GroupSplit/CreateSplitGroup';
import SplitGroupPage from './pages/GroupSplit/SplitGroupPage';
import SeoAnalyzer from './pages/SeoAnalyzer/SeoAnalyzer';
import Summarizer from './pages/Summarizer/Summarizer';
import CreateMeetingPoll from './pages/MeetingPoll/CreateMeetingPoll';
import MeetingPollPage from './pages/MeetingPoll/MeetingPollPage';
import DataExtractor from './pages/DataExtractor/DataExtractor';
import ImageToText from './pages/ImageToText/ImageToText';
import CsvCleaner from './pages/CsvCleaner/CsvCleaner';
import DocGenerator from './pages/DocGenerator/DocGenerator';
import CreateQuickPoll from './pages/QuickPoll/CreateQuickPoll';
import QuickPollPage from './pages/QuickPoll/QuickPollPage';
import SocialBot from './pages/SocialBot/SocialBot';
import About from './pages/About/About';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Wallet from './pages/Wallet/Wallet';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route element={<PrivateRoute />}>
            <Route path="tool/form-automation" element={<FormAutomationTool />} />
            <Route path="tool/ai-form-generator" element={<AiFormGenerator />} />
            <Route path="tool/voice-to-text" element={<VoiceToText />} />
            <Route path="tool/text-to-voice" element={<TextToVoice />} />
            <Route path="split-create" element={<CreateSplitGroup />} />
            <Route path="tool/seo-analyzer" element={<SeoAnalyzer />} />
            <Route path="tool/summarizer" element={<Summarizer />} />
            <Route path="meeting-create" element={<CreateMeetingPoll />} />
            <Route path="tool/data-extractor" element={<DataExtractor />} />
            <Route path="tool/image-to-text" element={<ImageToText />} />
            <Route path="tool/csv-cleaner" element={<CsvCleaner />} />
            <Route path="tool/doc-generator" element={<DocGenerator />} />
            <Route path="tool/social-bot" element={<SocialBot />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          <Route path="about" element={<About />} />
          <Route path="split/:code" element={<SplitGroupPage />} />
          <Route path="meeting/:code" element={<MeetingPollPage />} />
          <Route path="poll-create" element={<CreateQuickPoll />} />
          <Route path="poll/:code" element={<QuickPollPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
