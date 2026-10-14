import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AtSign, Key, ChevronRight, LayoutTemplate } from 'lucide-react';
import bgImage from '../assets/loginBackground.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Top Left Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-6 w-12 h-12 bg-[#f5e6de] rounded-full flex items-center justify-center shadow-md hover:bg-[#ebd5c8] transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </motion.button>

      <motion.div 
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* Glassmorphism Login Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-[32px] p-8 flex flex-col relative overflow-hidden"
          >
            {/* Soft pink gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-center mb-10 text-gray-800">
              <span className="font-medium text-sm text-[#5f6871] tracking-wide">Creativestyle_</span>
              <button className="text-sm font-semibold hover:opacity-70 transition-opacity">Sign up</button>
            </div>

            <div className="relative z-10 flex justify-between items-end mb-8">
              <h1 className="text-4xl font-normal text-gray-900">Log in</h1>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-400 rounded-full text-xs font-medium text-gray-700 hover:bg-white/30 transition-colors">
                <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ fontSize: '10px'}}>P</span>
                Pinterest
              </button>
            </div>

            <form className="relative z-10 flex flex-col gap-4 mb-8">
              {/* Email Input */}
              <div className="bg-white/40 border border-white/50 backdrop-blur-sm rounded-full p-1.5 flex items-center gap-3 transition-all focus-within:bg-white/60 focus-within:shadow-md">
                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                  <AtSign className="w-4 h-4 text-gray-600" />
                </div>
                <input 
                  type="email" 
                  placeholder="e-mail address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 placeholder-gray-500 font-medium"
                />
              </div>

              {/* Password Input */}
              <div className="bg-white/40 border border-white/50 backdrop-blur-sm rounded-full p-1.5 flex items-center gap-3 transition-all focus-within:bg-white/60 focus-within:shadow-md">
                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                  <Key className="w-4 h-4 text-gray-600" />
                </div>
                <input 
                  type="password" 
                  placeholder="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 placeholder-gray-500 font-medium"
                />
                <button type="button" className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                  I forgot
                </button>
              </div>
            </form>

            <div className="relative z-10 flex justify-between items-end mt-auto">
              <p className="text-[9px] leading-tight text-gray-600 max-w-[200px]">
                Tidak semua orang suka dengan keramaian, ada sebagian dari mereka nyaman dengan kesendirian, dan hanya akan bercerita kepada orang Baca Selengkapnya.
                <br /><br />
                <span className="font-semibold text-gray-800 cursor-pointer">Click here for more info.</span>
              </p>
              
              {/* Submit Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-8 bg-[#1f1e21] rounded-full flex items-center justify-end pr-1 shadow-lg"
              >
                <div className="w-6 h-6 rounded-full bg-[#353437] flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Dark References Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-[#1f1e21] rounded-[24px] p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[140px]"
          >
            <div>
              <h2 className="text-2xl font-normal">References</h2>
              <p className="text-sm text-gray-400 mt-1">By Pinterest</p>
            </div>
            <div className="flex justify-end mt-4">
              <span className="text-xs text-gray-300 font-medium cursor-pointer hover:text-white transition-colors">
                Discover
              </span>
            </div>
          </motion.div>
          
        </div>


        {/* RIGHT COLUMN */}
        <motion.div 
          variants={itemVariants}
          className="hidden md:flex justify-center items-center w-full"
        >
          {/* The White Card Container */}
          <div className="bg-white rounded-[40px] shadow-2xl relative overflow-hidden w-full max-w-[340px] h-[580px] flex">
            
            {/* The Pink Circle (Centered vertically, offset slightly to the right, behind the left panel) */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[20%] w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-[#fcb3b8] to-[#fcd9dd] opacity-80 blur-[1px]"
            />

            {/* Left Glass Panel (~55% width, sits on top of the circle) */}
            <div className="absolute top-0 left-0 w-[55%] h-full bg-[#f4f5f7]/70 backdrop-blur-md rounded-l-[40px] rounded-r-3xl p-7 flex flex-col z-10">
              
              {/* Top Text */}
              <div className="mt-2">
                <h2 className="text-[56px] font-medium leading-[0.9] tracking-tight text-gray-900 -ml-1">Jan</h2>
                <h2 className="text-[44px] font-medium leading-[1] tracking-tight text-[#a0a5aa] -ml-1 mt-1">2025</h2>
              </div>

              {/* Middle Text */}
              <div className="mt-auto mb-auto">
                <p className="text-[11px] text-gray-700 leading-snug font-medium">
                  Selasa 06<br/>
                  January 2025<br/>
                  Pinterest
                </p>
              </div>

              {/* Bottom Logo */}
              <div className="flex flex-col items-center self-start gap-1 mb-2">
                <div className="relative w-8 h-5 flex items-center justify-center">
                  <div className="absolute w-8 h-4 border-2 border-black rounded-full" style={{ borderBottomColor: 'transparent' }} />
                  <span className="text-[10px] font-black z-10 mt-1 tracking-tighter">CS</span>
                </div>
                <span className="text-[9px] font-bold text-black tracking-wide">Creative.style</span>
              </div>
            </div>

            {/* Right Side Content Container */}
            <div className="absolute top-0 right-0 w-[45%] h-full p-7 flex flex-col justify-between z-10 pointer-events-none">
              
              {/* Top Right Text */}
              <div className="mt-2 text-right">
                <p className="text-[10px] text-gray-600 font-medium leading-tight">
                  Minimalism style<br/>Typography
                </p>
              </div>

              {/* Bottom Right Button */}
              <div className="mb-2 flex justify-end pointer-events-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#1a1a1a] rounded-full pl-3 pr-1 py-1 flex items-center gap-2 shadow-lg"
                >
                  <span className="text-[9px] font-medium text-white tracking-wide">Click Here</span>
                  <div className="w-6 h-6 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                </motion.button>
              </div>
            </div>

          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
