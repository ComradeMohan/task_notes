import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CheckSquare, FileText, User, LineChart as ChartLine } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 py-2 px-4 z-10">
      <div className="flex justify-around items-center">
        <NavLink 
          to="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isActive('/') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-xs mt-1">Tasks</span>
        </NavLink>
        
        <NavLink 
          to="/notes"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isActive('/notes') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs mt-1">Notes</span>
        </NavLink>
        
        <NavLink 
          to="/progress"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isActive('/progress') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <ChartLine className="w-6 h-6" />
          <span className="text-xs mt-1">Progress</span>
        </NavLink>
        
        <NavLink 
          to="/profile"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isActive('/profile') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;