import React from 'react';
import { motion } from 'framer-motion';
import { Share2, FileUp, Send, Shield, Zap, HelpCircle } from 'lucide-react';

const HowToUse = () => {
  const steps = [
    {
      icon: Share2,
      title: 'Get Your ID',
      description: 'Your unique 4-character ID is displayed at the top of the page. Share this ID with others to connect.',
    },
    {
      icon: FileUp,
      title: 'Select Files',
      description: 'Drag and drop files into the upload area or click to browse your files.',
    },
    {
      icon: Send,
      title: 'Connect & Send',
      description: 'Enter your friend\'s ID to connect, then click "Send" to transfer your files instantly.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Transfer',
      description: 'All file transfers are encrypted end-to-end for maximum security.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized chunk size and WebRTC technology ensure rapid file transfers.',
    },
    {
      icon: HelpCircle,
      title: 'No Registration',
      description: 'Start sharing files immediately without creating an account.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          How to Use <span className="text-indigo-600">DropX</span>
        </h1>
        <p className="text-xl text-gray-600">
          Follow these simple steps to start sharing files instantly
        </p>
      </motion.div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-block p-3 bg-indigo-100 rounded-full mb-4"
              >
                <step.icon className="h-8 w-8 text-indigo-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-block p-3 bg-indigo-100 rounded-full mb-4"
              >
                <feature.icon className="h-8 w-8 text-indigo-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="max-w-3xl mx-auto mt-20"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Is DropX free to use?</h3>
            <p className="text-gray-600">
              Yes, DropX is completely free to use with no hidden charges or premium features.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">What's the maximum file size?</h3>
            <p className="text-gray-600">
              DropX supports files up to 10GB in size, making it perfect for sharing large files.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Are my files secure?</h3>
            <p className="text-gray-600">
              All file transfers are encrypted end-to-end and happen directly between peers, ensuring maximum security.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HowToUse;