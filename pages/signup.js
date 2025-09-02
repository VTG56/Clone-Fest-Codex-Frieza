// pages/signup.js - FIXED: Modularized with reusable components
'use client';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { signUp, getAuthErrorMessage } from '@/lib/auth'; // FIXED: Use centralized auth functions
import { 
  UsernameInput, 
  EmailInput, 
  PasswordInput, 
  GoogleSignInButton, 
  LoadingButton, 
  ErrorDisplay 
} from '@/components/auth/CommonAuthComponents'; // FIXED: Use reusable components

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

  // FIXED: Improved form submission with proper validation
  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signUp(formData.email, formData.password, formData.username);
      router.push('/home');
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
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
      {/* Background Effects - Same as original */}
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
            {/* Signup Card - Same styling as original */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl blur-xl" />
              
              <div className="relative bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 p-[1px]">
                  <div className="w-full h-full bg-gray-800/90 rounded-2xl" />
                </div>
                
                <div className="relative z-10">
                  {/* Header - Same as original */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Join Chyrp-lite
                    </h1>
                    <p className="text-gray-400">Create your account today</p>
                  </div>

                  {/* FIXED: Use reusable error component */}
                  <ErrorDisplay error={error} />

                  {/* Form */}
                  <div className="space-y-6">
                    {/* FIXED: Use reusable username input component */}
                    <motion.div variants={inputVariants}>
                      <UsernameInput
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </motion.div>

                    {/* FIXED: Use reusable email input component */}
                    <motion.div variants={inputVariants}>
                      <EmailInput
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </motion.div>

                    {/* FIXED: Use reusable password input component */}
                    <motion.div variants={inputVariants}>
                      <PasswordInput
                        label="Password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    {/* FIXED: Use reusable password input component for confirmation */}
                    <motion.div variants={inputVariants}>
                      <PasswordInput
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        showPassword={showConfirmPassword}
                        togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                        showMatch={true}
                        matchStatus={passwordMatch}
                      />
                    </motion.div>

                    {/* FIXED: Use reusable loading button component */}
                    <motion.div variants={inputVariants}>
                      <LoadingButton
                        isLoading={isLoading}
                        disabled={!passwordMatch}
                        onClick={handleSubmit}
                        loadingText="Creating Account..."
                      >
                        Create Account
                      </LoadingButton>
                    </motion.div>

                    {/* Divider - Same as original */}
                    <motion.div variants={inputVariants} className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700/50" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
                      </div>
                    </motion.div>

                    {/* FIXED: Use reusable Google sign-up button component */}
                    <motion.div variants={inputVariants}>
                      <GoogleSignInButton
                        isLoading={isLoading}
                        disabled={isLoading}
                        onError={setError}
                        buttonText="Continue with Google"
                        loadingText="Creating Account..."
                      />
                    </motion.div>

                    {/* Terms and Privacy - Same as original */}
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

                  {/* Login Link - Same as original */}
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