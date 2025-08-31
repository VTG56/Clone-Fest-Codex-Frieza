"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const FaqItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-xl p-6 mb-4 cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-purple-400" />}
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <p className="text-gray-300 leading-relaxed">
              {children}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Documentation
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about this revamped legacy app, from features to tech stack.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          <FaqItem title="Getting Started">
            <h4 className="font-bold text-lg text-purple-400 mb-2">Login/Signup Flow</h4>
            The app uses a standard email and password authentication flow powered by Firebase. When you sign up, your user account is created in Firebase Authentication, and a corresponding user document is created in Firestore to store your profile data.
            <h4 className="font-bold text-lg text-pink-400 mt-4 mb-2">Google Auth</h4>
            Google authentication is also a feature. It will use Firebase&apos;s Google provider to allow for a seamless one-click login experience. This feature is not yet implemented but is a high priority.
          </FaqItem>

          <FaqItem title="Key Features">
            <h4 className="font-bold text-lg text-purple-400 mb-2">User Profiles</h4>
            Each user has a dedicated profile page. Your own profile will allow you to edit your information. When viewing another user&apos;s profile, you&apos;ll have options to follow them and send messages.
            <h4 className="font-bold text-lg text-pink-400 mt-4 mb-2">Follow/Message System</h4>
            The system will use Firestore collections to manage follower relationships and direct messages, enabling real-time interaction between users.
            <h4 className="font-bold text-lg text-purple-400 mt-4 mb-2">Posts & Feed</h4>
            The home feed is designed to display posts from users you follow, with options to like, comment, and share. Currently, the posts are mock data, but they will soon be connected to the Firestore database.
          </FaqItem>

          <FaqItem title="Tech Stack">
            <h4 className="font-bold text-lg text-purple-400 mb-2">Frontend</h4>
            The application is built with **Next.js**, a powerful React framework. **React** handles the UI components and state management, while **Tailwind CSS** is used for responsive and modern styling. **Framer Motion** provides the fluid animations.
            <h4 className="font-bold text-lg text-pink-400 mt-4 mb-2">Backend & Database</h4>
            **Firebase** serves as the backend-as-a-service. **Firebase Authentication** manages user accounts, and **Firestore** is used as the NoSQL database for storing user data and posts.
          </FaqItem>

          <FaqItem title="Future Plans">
            <h4 className="font-bold text-lg text-purple-400 mb-2">Enhanced Interactivity</h4>
            Future updates will include real-time likes, comments, and notifications powered by Firestore listeners.
            <h4 className="font-bold text-lg text-pink-400 mt-4 mb-2">Mobile Support</h4>
            Full mobile responsiveness is a priority, ensuring a smooth user experience on all devices.
            <h4 className="font-bold text-lg text-purple-400 mt-4 mb-2">Advanced Search</h4>
            Implementing an advanced search feature to help users find posts, profiles, and tags more easily.
          </FaqItem>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocsPage;
