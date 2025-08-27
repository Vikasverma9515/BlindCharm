// components/contact/ContactForm.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle, 
  Bug, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle,
  CheckCircle,
  Loader2,
  Mail,
  User,
  Type,
  MessageSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ContactFormProps {
  isModal?: boolean;
  onClose?: () => void;
  defaultType?: string;
}

const messageTypes = [
  { 
    id: 'bug_report', 
    label: 'Bug Report', 
    icon: Bug, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    description: 'Report a bug or technical issue'
  },
  { 
    id: 'feature_request', 
    label: 'Feature Request', 
    icon: Lightbulb, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    description: 'Suggest a new feature'
  },
  { 
    id: 'feedback', 
    label: 'General Feedback', 
    icon: MessageCircle, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    description: 'Share your thoughts and feedback'
  },
  { 
    id: 'complaint', 
    label: 'Complaint', 
    icon: AlertTriangle, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    description: 'Report an issue or concern'
  },
  { 
    id: 'question', 
    label: 'Question', 
    icon: HelpCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    description: 'Ask a question'
  },
  { 
    id: 'other', 
    label: 'Other', 
    icon: MessageSquare, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50', 
    description: 'Something else'
  },
];

export default function ContactForm({ isModal = false, onClose, defaultType = 'feedback' }: ContactFormProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    messageType: defaultType,
    subject: '',
    message: '',
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const selectedType = messageTypes.find(t => t.id === formData.messageType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStep('success');
        // Auto close modal after 3 seconds if it's a modal
        if (isModal && onClose) {
          setTimeout(() => {
            onClose();
            setStep('form');
            setFormData({
              messageType: defaultType,
              subject: '',
              message: '',
              name: session?.user?.name || '',
              email: session?.user?.email || '',
            });
          }, 3000);
        }
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const containerClass = isModal 
    ? "bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
    : "bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Us
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We'd love to hear from you!
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Message Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What can we help you with?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {messageTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.messageType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange('messageType', type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? `border-primary-500 ${type.bgColor} ${type.color}`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? type.color : 'text-gray-400'}`} />
                      <div className={`font-medium text-sm ${isSelected ? type.color : 'text-gray-900 dark:text-white'}`}>
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedType && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {selectedType.description}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder={`Brief summary of your ${selectedType?.label.toLowerCase() || 'message'}`}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  disabled={loading}
                />
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <div className="relative">
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please provide detailed information..."
                  rows={6}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                  disabled={loading}
                />
                <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Be as specific as possible to help us assist you better
                </p>
                <span className={`text-xs ${formData.message.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.message.length}/1000
                </span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.subject || !formData.message || !formData.name || !formData.email}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending message...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Message Sent Successfully! 🎉
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expected response time: 24-48 hours
            </p>
            
            {!isModal && (
              <button
                onClick={() => {
                  setStep('form');
                  setFormData({
                    messageType: defaultType,
                    subject: '',
                    message: '',
                    name: session?.user?.name || '',
                    email: session?.user?.email || '',
                  });
                }}
                className="mt-6 text-primary-600 hover:text-primary-700 font-medium"
              >
                Send another message
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}