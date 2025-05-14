import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AuthRoute from './components/AuthRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Progress from './pages/Progress';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <AuthRoute>
                <Tasks />
              </AuthRoute>
            }
          />
          <Route 
            path="/notes" 
            element={
              <AuthRoute>
                <Notes />
              </AuthRoute>
            }
          />
          <Route 
            path="/progress" 
            element={
              <AuthRoute>
                <Progress />
              </AuthRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            duration: 3000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;