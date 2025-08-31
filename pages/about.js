import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/firebase';

export default function About() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              About Chrysp Lite
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A lightweight, modern social hub built for the future of social networking
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-gray-800 rounded-xl p-8 md:p-12 shadow-2xl border border-gray-700">
            {/* Introduction */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-6 text-blue-400">
                Welcome to the New Era
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Chrysp Lite represents a complete transformation from our legacy system into a cutting-edge social platform. 
                Built with modern web technologies, it delivers exceptional performance, scalability, and user experience.
              </p>
              <div className="bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500">
                <p className="text-gray-200 font-medium">
                  <span className="text-blue-400 font-bold">Major Revamp:</span> We&apos;ve completely rebuilt our platform from a legacy PHP + MySQL stack 
                  to a modern Next.js + Firebase architecture, ensuring better performance, enhanced scalability, and an 
                  improved developer experience.
                </p>
              </div>
            </section>

            {/* Technology Stack */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-6 text-purple-400">
                Built with Modern Technology
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-300">Frontend</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Next.js for server-side rendering
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      React for dynamic UI components
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Tailwind CSS for responsive design
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-purple-300">Backend</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Firebase for real-time database
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Firebase Auth for secure authentication
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Cloud storage for media handling
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-6 text-green-400">
                Key Features
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-green-300">Secure Authentication</h3>
                      <p className="text-gray-300">
                        Firebase-powered authentication system with email verification, password reset, and secure session management.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-blue-300">Dynamic Profiles</h3>
                      <p className="text-gray-300">
                        Customizable user profiles with bio updates, profile pictures, and personal information management.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-500 rounded-full p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-purple-300">Real-time Posts</h3>
                      <p className="text-gray-300">
                        Share thoughts, updates, and content with real-time publishing and instant feed updates across all users.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-yellow-300">Interactive UI</h3>
                      <p className="text-gray-300">
                        Modern, responsive interface with smooth animations, dark theme support, and intuitive navigation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Benefits */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-6 text-orange-400">
                Why We Rebuilt Everything
              </h2>
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-6 border border-orange-500/20">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">10x</div>
                    <p className="text-gray-300">Faster page loads with Next.js SSR</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">99.9%</div>
                    <p className="text-gray-300">Uptime with Firebase infrastructure</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">Real-time</div>
                    <p className="text-gray-300">Updates without page refreshes</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-200">
                Ready to Experience Chrysp Lite?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Join our modern social platform and be part of the future of social networking.
              </p>
              <div className="space-x-4">
                {!user ? (
                  <>
                    <button
                      onClick={() => router.push('/signup')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}