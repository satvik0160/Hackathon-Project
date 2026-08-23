import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, role } = formData;
    
    if (!username || !email || !password || !confirmPassword || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password, role });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      import('../../utils/helpers').then(({ parseApiError }) => {
        toast.error(parseApiError(error));
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-container flex items-center justify-center min-h-screen py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-container w-full max-w-md p-6"
      >
        <div className="auth-card card p-8">
          <div className="auth-header text-center mb-8 flex flex-col items-center">
            <div className="auth-logo mb-4 bg-primary/10 p-3 rounded-full inline-flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Join DevAstra</h1>
            <p className="text-muted">Create an account to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input 
                id="username"
                name="username"
                type="text" 
                className="form-input" 
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input 
                id="email"
                name="email"
                type="email" 
                className="form-input" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="role">Role</label>
              <select 
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="STUDENT">Student/Learner</option>
                <option value="INSTITUTION_ADMIN">Institution/Educator</option>
                <option value="INDUSTRY">Industry Professional</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                id="password"
                name="password"
                type="password" 
                className="form-input" 
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type="password" 
                className="form-input" 
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full mt-4 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
