/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, FileText, DollarSign, Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PostJobs = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [skillTags, setSkillTags] = useState<string[]>([]);

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequiredSkills(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = requiredSkills.trim();
      
      if (skill && !skillTags.includes(skill)) {
        setSkillTags([...skillTags, skill]);
        setRequiredSkills('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillTags(skillTags.filter(skill => skill !== skillToRemove));
  };

  const handlePostJob = async () => {
    if (!title || !description || (!requiredSkills && skillTags.length === 0) || !budget) {
      // Shake animation for the form
      formRef.current?.classList.add('shake');
      setTimeout(() => {
        formRef.current?.classList.remove('shake');
      }, 500);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Unauthorized. Please login.');
        setIsSubmitting(false);
        return;
      }

      // Combine input skills with tags
      const allSkills = [...skillTags];
      if (requiredSkills.trim()) {
        allSkills.push(requiredSkills.trim());
      }

      await axios.post('/api/jobs', 
        { title, description, requiredSkills: allSkills, budget },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccess(true);
      
      // Reset form after submission
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setRequiredSkills('');
        setBudget('');
        setSkillTags([]);
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error posting job:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
      errorToast.innerHTML = 'Failed to post job. Please try again.';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        errorToast.style.opacity = '0';
        errorToast.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => document.body.removeChild(errorToast), 500);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.4, 
        ease: "easeOut" 
      }
    })
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto my-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background shape */}
      <motion.div
        className="absolute -top-10 -left-10 w-64 h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full filter blur-3xl opacity-20 z-0"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        className="absolute -bottom-20 -right-10 w-72 h-72 bg-gradient-to-tr from-indigo-600 to-pink-600 rounded-full filter blur-3xl opacity-20 z-0"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div 
        ref={formRef}
        className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-xl border border-gray-700"
        initial={{ boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)" }}
        whileHover={{ boxShadow: "0 15px 40px -15px rgba(59, 130, 246, 0.4)" }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-between mb-8"
          custom={0}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Post a New Job</h2>
          <Briefcase className="w-8 h-8 text-blue-500" />
        </motion.div>

        {/* Success message */}
        {showSuccess && (
          <motion.div 
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center p-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Job Posted Successfully!</h3>
              <p className="text-gray-300">Your job has been listed and is now visible to freelancers</p>
            </motion.div>
          </motion.div>
        )}

        <div className="space-y-6">
          <motion.div custom={1} variants={itemVariants}>
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Job Title
              </label>
              <motion.div
                initial={false}
                animate={{ 
                  boxShadow: focusedField === 'title' 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 0 0 1px rgba(75, 85, 99, 0.5)'
                }}
                className="relative rounded-lg overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer Needed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-3 pr-10 bg-gray-800/50 border-gray-700 rounded-lg focus:outline-none text-white"
                />
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === 'title' ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div custom={2} variants={itemVariants}>
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Job Description
              </label>
              <motion.div
                initial={false}
                animate={{ 
                  boxShadow: focusedField === 'description' 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 0 0 1px rgba(75, 85, 99, 0.5)'
                }}
                className="relative rounded-lg overflow-hidden"
              >
                <textarea
                  placeholder="Describe the job requirements, responsibilities, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-3 bg-gray-800/50 border-gray-700 rounded-lg focus:outline-none min-h-32 text-white"
                />
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === 'description' ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div custom={3} variants={itemVariants}>
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                Required Skills
              </label>
              <motion.div
                initial={false}
                animate={{ 
                  boxShadow: focusedField === 'skills' 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 0 0 1px rgba(75, 85, 99, 0.5)'
                }}
                className="relative rounded-lg overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Add skills (press Enter or comma to add)"
                  value={requiredSkills}
                  onChange={handleSkillsChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocusedField('skills')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-3 bg-gray-800/50 border-gray-700 rounded-lg focus:outline-none text-white"
                />
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === 'skills' ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skillTags.map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600/30 text-blue-400 border border-blue-500/30"
                    >
                      {skill}
                      <XCircle 
                        className="ml-2 w-4 h-4 cursor-pointer hover:text-red-400 transition-colors"
                        onClick={() => removeSkill(skill)}
                      />
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div custom={4} variants={itemVariants}>
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                <DollarSign className="w-4 h-4 mr-2" />
                Budget
              </label>
              <motion.div
                initial={false}
                animate={{ 
                  boxShadow: focusedField === 'budget' 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 0 0 1px rgba(75, 85, 99, 0.5)'
                }}
                className="relative rounded-lg overflow-hidden"
              >
                <input
                  type="number"
                  placeholder="Enter your budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onFocus={() => setFocusedField('budget')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-3 pr-10 bg-gray-800/50 border-gray-700 rounded-lg focus:outline-none text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">USD</div>
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === 'budget' ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            custom={5}
            variants={itemVariants}
            className="pt-4"
          >
            <motion.button
              onClick={handlePostJob}
              className="w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center focus:outline-none transition-all overflow-hidden relative"
              initial={{ background: "linear-gradient(to right, #3b82f6, #6366f1)" }}
              whileHover={{ 
                scale: 1.02,
                background: "linear-gradient(to right, #2563eb, #4f46e5)" 
              }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                animate={{ 
                  x: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }}
                style={{
                  background: "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(99,102,241,0.3) 50%, rgba(59,130,246,0) 100%)"
                }}
              />
              
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
              ) : (
                <Briefcase className="w-5 h-5 mr-2 text-white" />
              )}
              <span className="text-white">
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </motion.div>
  );
};

export default PostJobs;