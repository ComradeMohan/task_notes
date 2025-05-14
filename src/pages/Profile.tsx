import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="My Profile" />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md-soft overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-400 to-secondary-400 p-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <User size={48} className="text-gray-500" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Mail className="text-gray-500 mr-2" />
              <span>{currentUser?.email}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 mt-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>{loading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Profile;