import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

const Team = () => {
  const team = [
    {
      name: 'Patil Uday',
      role: 'Frontend Developer',
      image: 'https://images.unsplash.com/photo-1738369350430-87d667611998?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D',
      bio: 'Passionate about creating beautiful and intuitive user interfaces.',
      social: {
        github: 'https://github.com/patiluday',
        linkedin: 'https://linkedin.com/in/patiluday',
        email: 'uday@dropx.com'
      }
    },
    {
      name: 'Tribhuvan Om',
      role: 'Backend Developer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
      bio: ' Continuing with the Team.tsx file content from where we left off:

      bio: 'Specializing in WebRTC and real-time communication systems.',
      social: {
        github: 'https://github.com/tribhuvanom',
        linkedin: 'https://linkedin.com/in/tribhuvanom',
        email: 'om@dropx.com'
      }
    },
    {
      name: 'Yadav Dron',
      role: 'System Architect',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
      bio: 'Expert in building scalable and secure distributed systems.',
      social: {
        github: 'https://github.com/yadavdron',
        linkedin: 'https://linkedin.com/in/yadavdron',
        email: 'dron@dropx.com'
      }
    }
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
          Meet Our <span className="text-indigo-600">Team</span>
        </h1>
        <p className="text-xl text-gray-600">
          The talented people behind DropX
        </p>
      </motion.div>

      {/* Team Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        {team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square overflow-hidden"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-indigo-600 font-medium mb-4">{member.role}</p>
              <p className="text-gray-600 mb-6">{member.bio}</p>
              <div className="flex justify-center space-x-4">
                <motion.a
                  whileHover={{ scale: 1.2 }}
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2 }}
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2 }}
                  href={`mailto:${member.social.email}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto mt-20"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Values
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="text-gray-600">
              We constantly push the boundaries of what's possible in file sharing technology.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-3">Security</h3>
            <p className="text-gray-600">
              Your privacy and data security are our top priorities.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-3">Simplicity</h3>
            <p className="text-gray-600">
              We believe in making technology accessible and easy to use for everyone.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Team;