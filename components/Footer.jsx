'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, MessageCircle, Twitter } from 'lucide-react';
import Link from 'next/link';
const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="w-6 h-6" />,
      href: 'https://github.com/VTG56',
      hoverColor: 'hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
    },
    {
      name: 'Whatsapp',
      icon: <MessageCircle className="w-6 h-6" />,
      href: 'https://wa.me/917483166788',
      hoverColor: 'hover:text-pink-400 hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      href: 'https://twitter.com',
      hoverColor: 'hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.footer 
      className="relative bg-gray-900 border-t border-transparent"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-sm opacity-40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Copyright */}
          <motion.div 
            className="text-center md:text-left"
            variants={itemVariants}
          >
            <p className="text-gray-400 text-sm md:text-base">
              © 2025{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                Chyrp-lite
              </span>
              . All Rights Reserved.
            </p>
          </motion.div>

          {/* Social Icons */}
          <motion.div 
            className="flex items-center space-x-6"
            variants={itemVariants}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-400 transition-all duration-300 ${social.hoverColor}`}
                whileHover={{ 
                  scale: 1.2,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.3 + (index * 0.1),
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <div className="relative group">
                  {social.icon}
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-current blur-md opacity-50 rounded-full" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {social.name}
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
        
        {/* Additional glow effect at bottom */}
        <motion.div 
          className="mt-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </div>
    </motion.footer>
  );
};

export default Footer;