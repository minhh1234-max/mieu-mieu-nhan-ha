import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { AuthModalProvider } from './AuthModalContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import Reader from './pages/Reader';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-[#050505] text-gray-950 dark:text-gray-50 transition-colors duration-500 ease-in-out">
            <Routes>
              {/* Reader view has its own layout */}
              <Route path="/read/:slug/:chapterId" element={<Reader />} />
              
              {/* Main layout */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/story/:slug" element={<StoryDetail />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin-login" element={<AdminLogin />} />
                      <Route path="/profile" element={<Profile />} />
                      {/* Add more routes as needed */}
                    </Routes>
                  </main>
                    <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
