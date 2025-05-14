import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ListTodo, StickyNote, UserCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Onboarding: React.FC = () => {
  const { setIsFirstTimeUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: 'Welcome to TaskNote!',
      description: 'Your personal task and note manager. Let\'s get you started with a quick tour.',
      icon: <CheckCircle2 className="w-12 h-12 text-primary-500" />
    },
    {
      title: 'Manage Tasks',
      description: 'Create, edit, and delete tasks. Star important ones to keep track of priorities.',
      icon: <ListTodo className="w-12 h-12 text-primary-500" />
    },
    {
      title: 'Take Notes',
      description: 'Create notes to keep track of ideas, reminders, or anything else you need to remember.',
      icon: <StickyNote className="w-12 h-12 text-primary-500" />
    },
    {
      title: 'Your Profile',
      description: 'View your profile information and log out when you\'re done.',
      icon: <UserCircle className="w-12 h-12 text-primary-500" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsFirstTimeUser(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl shadow-lg-soft w-full max-w-md overflow-hidden"
        >
          <div className="relative">
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2" />
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                {steps[currentStep].icon}
              </div>
              
              <h2 className="text-2xl font-semibold text-center mb-2">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                {steps[currentStep].description}
              </p>
              
              <div className="flex justify-center space-x-2 mb-6">
                {steps.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Onboarding;