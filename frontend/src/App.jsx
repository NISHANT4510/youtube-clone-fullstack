import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import VideoPage from './pages/VideoPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ChannelPage from './pages/Channel/ChannelPage';

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Routes>
        <Route path="/" element={<Home sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/channel/:id" element={<ChannelPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={router.future}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
