import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  
  return (
    <motion.div 
      className="bg-gradient-to-r from-primary-400 to-secondary-400 p-4 text-white shadow-md"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-semibold">{title}</h1>
      <motion.div
        className="h-1 bg-white bg-opacity-30 mt-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.div>
  );
};

export default Header;