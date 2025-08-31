'use client';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { signUp } from '@/lib/auth'; // Import your new function
import { toast } from 'react-hot-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const router = useRouter();
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password match
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const newPassword = name === 'password' ? value : formData.password;
      const newConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordMatch(newPassword === newConfirmPassword && newConfirmPassword !== '');
    }
  };

  const handleSubmit = async () => {
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }
  setIsLoading(true);
  setError('');
  
  try {
    await signUp(formData.email, formData.password, formData.username);
    router.push('/home'); // Redirect to home page on success
  } catch (err) {
    setError(err.message); // Display Firebase error
    // e.g., using a toast notification: toast.error(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="w-full max-w-md"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {/* Signup Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl blur-xl" />
              
              <div className="relative bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                {/* Neon border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 p-[1px]">
                  <div className="w-full h-full bg-gray-800/90 rounded-2xl" />
                </div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Join Chyrp-lite
                    </h1>
                    <p className="text-gray-400">Create your account today</p>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    {/* Username Input */}
                    <motion.div variants={inputVariants}>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-400/50"
                          placeholder="Choose a username"
                        />
                      </div>
                    </motion.div>

                    {/* Email Input */}
                    <motion.div variants={inputVariants}>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-400/50"
                          placeholder="Enter your email"
                        />
                      </div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div variants={inputVariants}>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-400/50"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password Input */}
                    <motion.div variants={inputVariants}>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-12 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-purple-400/50 ${
                            passwordMatch === null 
                              ? 'border-gray-600/50 focus:ring-purple-500' 
                              : passwordMatch 
                                ? 'border-green-500/50 focus:ring-green-500' 
                                : 'border-red-500/50 focus:ring-red-500'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                          {passwordMatch !== null && (
                            <div className={`${passwordMatch ? 'text-green-400' : 'text-red-400'}`}>
                              {passwordMatch ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Create Account Button */}
                    <motion.div variants={inputVariants}>
                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !passwordMatch}
                        className="w-full relative py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10">
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </span>
                        
                        {/* Hover glow effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0"
                          whileHover={{ opacity: 0.2 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Loading animation */}
                        {isLoading && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          />
                        )}
                      </motion.button>
                    </motion.div>

                    {/* Terms and Privacy */}
                    <motion.div variants={inputVariants} className="text-center">
                      <p className="text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-purple-400 hover:text-pink-400 transition-colors">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-purple-400 hover:text-pink-400 transition-colors">
                          Privacy Policy
                        </Link>
                      </p>
                    </motion.div>
                  </div>

                  {/* Login Link */}
                  <motion.div 
                    variants={inputVariants}
                    className="mt-8 pt-6 border-t border-gray-700/50 text-center"
                  >
                    <p className="text-gray-400 text-sm">
                      Already have an account?{' '}
                      <Link
                        href="/login"
                        className="text-purple-400 hover:text-pink-400 font-medium transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default SignupPage;