// components/contact/QuickContactButtons.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bug, Lightbulb, X } from 'lucide-react';
import ContactForm from './ContactForm';

export default function QuickContactButtons() {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('feedback');

  const quickButtons = [
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageCircle,
      // color: 'bg-blue-500 hover:bg-blue-600',
      color: 'bg-black hover:bg-gray-800',
      description: 'Share your thoughts'
    },
    {
      id: 'bug_report',
      label: 'Report Bug',
      icon: Bug,
      // color: 'bg-red-500 hover:bg-red-600',
      color: 'bg-black hover:bg-gray-800',
      description: 'Found an issue?'
    },
    {
      id: 'feature_request',
      label: 'Request Feature',
      icon: Lightbulb,
      // color: 'bg-yellow-500 hover:bg-yellow-600',
      color: 'bg-black hover:bg-gray-800',
      description: 'Suggest improvements'
    }
  ];

  const handleQuickContact = (type: string) => {
    setSelectedType(type);
    setShowForm(true);
  };

  return (
    <>
      {/* Quick Contact Buttons */}
      <div className="flex flex-wrap gap-1 justify-center scale-75 md:scale-80 lg:scale-100">
        {quickButtons.map((button) => {
          const Icon = button.icon;
          return (
            <motion.button
              key={button.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickContact(button.id)}
              className={`${button.color} text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-lg`}
            >
              {/* <Icon className="w-4 h-4" /> */}
              {button.label}
            </motion.button>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <ContactForm 
                isModal={true}
                onClose={() => setShowForm(false)}
                defaultType={selectedType}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}