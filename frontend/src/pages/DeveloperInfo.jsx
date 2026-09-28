import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, Code, Rocket, Heart, X } from 'lucide-react';

const teamMembers = [
  {
    name: 'Siddhant Singh',
    role: 'Team Leader',
    initials: 'SS',
    photo: null,
    objectPos: 'object-center',
    description: '',
  },
  {
    name: 'Satvik Khare',
    role: '',
    initials: 'SK',
    photo: null,
    objectPos: 'object-center',
    description: '',
  },
  {
    name: 'Rahul Mishra',
    role: 'Backend Developer',
    initials: 'RM',
    photo: '/team-rahul.jpeg',
    objectPos: 'object-center',
    description: '',
  },
  {
    name: 'Nitya Mishra',
    role: 'UI/UX Designer',
    initials: 'NM',
    photo: '/team-nitya.jpeg',
    objectPos: 'object-top', // Forces upper half to be visible for full-body photos
    description: '',
  },
  {
    name: 'Aryan Mishra',
    role: '',
    initials: 'AM',
    photo: null,
    objectPos: 'object-center',
    description: '',
  },
  {
    name: 'Deeksha Singh',
    role: '',
    initials: 'DS',
    photo: null,
    objectPos: 'object-center',
    description: '',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

function GlowingAvatar({ member, sizeClass = 'w-56 h-56' }) {
  return (
    <div className={`relative ${sizeClass} mx-auto rounded-full`}>
      {/* Outer glowing gradient ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-orange-400 p-[3px] shadow-[0_0_35px_rgba(99,102,241,0.35)]">
        {/* Inner dark circle padding */}
        <div className="w-full h-full bg-[#0a0a0f] rounded-full p-2 flex items-center justify-center overflow-hidden">
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className={`w-full h-full object-cover ${member.objectPos} rounded-full`}
            />
          ) : (
            <span className="text-5xl font-extrabold text-slate-600 tracking-tight">{member.initials}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Pure Circular Card */}
      <motion.div
        variants={cardVariants}
        layout
        onClick={() => setExpanded(true)}
        className="flex-1 flex flex-col items-center cursor-pointer group max-w-[320px]"
      >
        <div className="group-hover:scale-105 transition-transform duration-300 ease-out">
          {/* Massive Circular Photo - Responsive to fit 3 in a row */}
          <GlowingAvatar member={member} sizeClass="w-24 h-24 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64" />
        </div>

        {/* Text directly underneath */}
        <div className="mt-4 md:mt-6 text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">{member.name}</h3>
          <p className="text-xs sm:text-sm md:text-base font-medium text-slate-400">{member.role || 'Role TBA'}</p>
        </div>
      </motion.div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setExpanded(false)}
            />

            {/* Expanded Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-[#11111a] rounded-[2rem] border border-slate-700/50 shadow-2xl shadow-indigo-500/20 w-full max-w-xl overflow-hidden flex flex-col items-center p-6 md:p-10 pointer-events-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setExpanded(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <GlowingAvatar member={member} sizeClass="w-32 h-32 md:w-48 md:h-48" />
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mt-6">{member.name}</h3>
                <span className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {member.role || 'Role TBA'}
                </span>

                <div className="w-full mt-6 md:mt-8 pt-6 border-t border-slate-700/50 text-center">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">About</h4>
                  {member.description ? (
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                      {member.description}
                    </p>
                  ) : (
                    <p className="text-sm md:text-base text-slate-500 italic">
                      Detailed information coming soon...
                    </p>
                  )}

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 mt-6 md:mt-8">
                    <a href="#" className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 transition-colors border border-slate-700 hover:border-indigo-500/50">
                      <Github className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                    <a href="#" className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 transition-colors border border-slate-700 hover:border-blue-500/50">
                      <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                    <a href="#" className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-500/50">
                      <Mail className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function DeveloperInfo() {
  return (
    <div className="page-container max-w-7xl mx-auto p-2 md:p-8 min-h-screen">

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 md:mb-16 mt-4 md:mt-8"
      >
        <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
          Meet the <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Team</span>
        </h1>
      </motion.div>

      {/* Team Cards - Explicit Rows forced with flex-row */}
      <motion.div
        className="flex flex-col items-center gap-y-12 md:gap-y-20 mb-16 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Development Department (Top Row) */}
        <div className="w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8 md:mb-12"
          >
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-indigo-500/50" />
            <span className="text-indigo-400 text-xs md:text-sm font-bold tracking-[0.25em] uppercase">
              Development Department
            </span>
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-indigo-500/50" />
          </motion.div>
          
          <div className="flex flex-row justify-center items-start gap-2 sm:gap-6 md:gap-8 w-full max-w-5xl">
            {teamMembers.slice(0, 3).map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>

        {/* Research Department (Bottom Row) */}
        <div className="w-full flex flex-col items-center mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-8 md:mb-12"
          >
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-pink-500/50" />
            <span className="text-pink-400 text-xs md:text-sm font-bold tracking-[0.25em] uppercase">
              Research Department
            </span>
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-pink-500/50" />
          </motion.div>

          <div className="flex flex-row justify-center items-start gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl">
            {teamMembers.slice(3, 6).map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
