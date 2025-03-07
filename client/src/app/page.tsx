'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-60 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md ${scrollY > 50 ? 'bg-gray-800/95 shadow-xl' : 'bg-transparent'} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="transform hover:scale-105 transition-transform duration-300"
          >
            <Image src="/logo.svg" alt="DeWorkHub" width={60} height={50} className="object-contain" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-4"
          >
            <Link href="/login">
              <button className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
                Sign Up
              </button>
            </Link>
          </motion.div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Empowering Web3 Freelancers
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-8">
            A decentralized platform ensuring instant payments and fair governance for freelancers and startups.
          </p>
          <div className="flex gap-6 justify-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/register">
                <button className="px-8 py-4 bg-blue-500 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-blue-500/50">
                  Get Started
                </button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login">
                <button className="px-8 py-4 border-2 border-blue-500 text-blue-500 rounded-xl text-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300">
                  Login
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float animation-delay-2000">
          <div className="w-12 h-12 rounded-full bg-blue-500/30 backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float animation-delay-1000">
          <div className="w-8 h-8 rounded-full bg-purple-500/30 backdrop-blur-sm"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-3000">
          <div className="w-16 h-16 rounded-full bg-pink-500/20 backdrop-blur-sm"></div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "$14M+", label: "Total Value Locked" },
              { value: "12K+", label: "Active Freelancers" },
              { value: "5K+", label: "Completed Projects" },
              { value: "35+", label: "Countries Represented" }
            ].map((stat, index) => (
              <div key={index} className="p-6 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{stat.value}</h3>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-800/50 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Why Choose DeWorkHub?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
              Our platform combines blockchain technology with user-friendly design to create the ultimate freelancing experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ 
              { title: "Instant Payments", description: "Smart contracts ensure freelancers get paid instantly upon work approval, no more waiting for payments to clear.", icon: "💸" },
              { title: "DAO Governance", description: "Platform policies are voted on by the community, ensuring fairness and transparency for all members.", icon: "🌐" },
              { title: "Low Fees", description: "Just 2% fee compared to 20% on traditional platforms. Keep more of what you earn.", icon: "⚡" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-900/80 rounded-2xl shadow-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              How DeWorkHub Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A seamless experience from project creation to payment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Create Profile", description: "Set up your decentralized identity and showcase your skills." },
              { step: "2", title: "Post or Find Work", description: "Create a project or browse available opportunities." },
              { step: "3", title: "Secure Payment", description: "Funds are locked in smart contracts before work begins." },
              { step: "4", title: "Get Paid Instantly", description: "Receive payment directly to your wallet upon approval." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative p-8 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-10 w-14 h-0.5 bg-blue-500/30">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-3 mt-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-800/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              What Users Are Saying
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied freelancers and clients
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Alex Chen", role: "Blockchain Developer", quote: "I've increased my earnings by 40% since switching to DeWorkHub. The instant payments are a game-changer.", avatar: "/avatars/alex.jpg" },
              { name: "Maria Rodriguez", role: "UI/UX Designer", quote: "As a designer, I love that my clients can see my portfolio directly on-chain. Plus, the community governance means my voice matters.", avatar: "/avatars/maria.jpg" },
              { name: "James Wilson", role: "Startup Founder", quote: "Finding quality Web3 talent used to be difficult. DeWorkHub simplified our hiring process and reduced our costs significantly.", avatar: "/avatars/james.jpg" },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-900/80 rounded-2xl shadow-lg border border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/30 mr-4 flex items-center justify-center text-2xl font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-blue-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-400 italic">&quot{testimonial.quote}&quot</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-3xl border border-blue-500/30 text-center relative z-10"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Freelancing Career?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of freelancers already earning more with less friction.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/register">
              <button className="px-10 py-5 bg-blue-500 text-white rounded-xl text-xl font-semibold shadow-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-blue-500/50">
                Start Your Journey Today
              </button>
            </Link>
          </motion.div>
          <p className="text-gray-400 mt-6">No hidden fees. Cancel anytime.</p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <Image src="/logo.svg" alt="DeWorkHub" width={150} height={60} className="object-contain mb-4" />
              <p className="text-gray-400 mb-4">Decentralized freelancing for the Web3 era.</p>
              <div className="flex space-x-4">
                {['twitter', 'discord', 'github', 'telegram'].map((social) => (
                  <a key={social} href={`#${social}`} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                      {social.charAt(0).toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: "Platform", links: ["How it Works", "Pricing", "Marketplace", "Features"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Blog"] },
              { title: "Resources", links: ["Documentation", "Support", "API", "Contact Us"] }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-white mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} DeWorkHub. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom animations styles */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -15px) scale(1.1); }
          50% { transform: translate(-15px, 25px) scale(0.9); }
          75% { transform: translate(15px, 25px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 15s infinite alternate;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;