import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Page Components ---
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import DiaryEditor from './components/Diary/DiaryEditor';
import DiaryBrowser from './components/Diary/DiaryBrowser';
import DiaryCategory from './components/Diary/DiaryCategory';

// --- Import Helper Components ---
import PrivateRoute from './components/Common/PrivateRoute';
import PublicRoute from './components/Common/PublicRoute';

// --- Import Global Styles ---
import './App.css';


function App() {
  return (
    // The AuthProvider makes authentication state available to all components
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* =============================================== */}
            {/* =============== PUBLIC ROUTES =============== */}
            {/* =============================================== */}
            {/* wrapped in PublicRoute */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />

            {/* =============================================== */}
            {/* ============== PROTECTED ROUTES =============== */}
            {/* =============================================== */}
            {/* These routes are wrapped in PrivateRoute.
                If the user is not logged in, they will be redirected to /login. */}
            
            <Route 
              path="/diary" 
              element={
                <PrivateRoute>
                  <DiaryEditor />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/browse" 
              element={
                <PrivateRoute>
                  <DiaryBrowser />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/categories" 
              element={
                <PrivateRoute>
                  <DiaryCategory />
                </PrivateRoute>
              } 
            />
            
            {/* A specific route for viewing a single category's diaries */}
            <Route 
              path="/categories/:sentiment" 
              element={
                <PrivateRoute>
                  <DiaryCategory /> 
                </PrivateRoute>
              } 
            />
            

            {/* =============================================== */}
            {/* ================= REDIRECTS =================== */}
            {/* =============================================== */}
            
            {/* Redirect the root path "/" to the main diary page */}
            <Route path="/" element={<Navigate to="/diary" replace />} />

            {/* A catch-all route for any undefined paths */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// A simple component for the 404 page
const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/diary">Go to Homepage</a>
    </div>
  );
}

export default App;