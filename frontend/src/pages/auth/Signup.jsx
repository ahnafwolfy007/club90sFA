// pages/auth/Signup.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Calendar } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { ScrollReveal } from '../../components/animations/ScrollReveal'
import { GoldParticles } from '../../components/animations/GoldParticles'
import { useAuth } from '../../hooks/useAuth'
import { fadeInUp, fadeInLeft, fadeInRight } from '../../utils/motionVariants'

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signup, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm()

  const password = watch('password')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    // Remove confirm password from data
    const { confirmPassword, ...signupData } = data
    
    const result = await signup(signupData)
    
    if (result.success) {
      navigate('/auth/signup-success', { replace: true })
    } else {
      // Handle field-specific errors
      if (result.error.includes('email')) {
        setError('email', { message: result.error })
      } else if (result.error.includes('phone')) {
        setError('phone', { message: result.error })
      }
    }
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden py-8">
      {/* Background particles */}
      <GoldParticles count={40} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-noise opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <ScrollReveal variant="fadeInDown" className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <img
                src={process.env.PUBLIC_URL + '/club90s_logobg.png'}
                alt="Club 90s logo"
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
              />
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
              Join Club 90s
            </h1>
            <p className="text-gray-400">
              Create your account to get started
            </p>
          </ScrollReveal>

          {/* Signup Form */}
          <ScrollReveal variant="fadeInUp" delay={0.3}>
            <Card className="backdrop-blur-md">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div variants={fadeInLeft}>
                      <Input
                        label="First Name"
                        type="text"
                        placeholder="John"
                        leftIcon={<User size={20} />}
                        error={errors.first_name?.message}
                        {...register('first_name', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          }
                        })}
                      />
                    </motion.div>

                    <motion.div variants={fadeInRight}>
                      <Input
                        label="Last Name"
                        type="text"
                        placeholder="Doe"
                        error={errors.last_name?.message}
                        {...register('last_name', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          }
                        })}
                      />
                    </motion.div>
                  </div>

                  {/* Email Input */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john.doe@example.com"
                      leftIcon={<Mail size={20} />}
                      error={errors.email?.message}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </motion.div>

                  {/* Phone Input */}
                  <motion.div variants={fadeInRight}>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      leftIcon={<Phone size={20} />}
                      error={errors.phone?.message}
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[1-9][\d]{0,15}$/,
                          message: 'Invalid phone number'
                        }
                      })}
                    />
                  </motion.div>

                  {/* Date of Birth */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="Date of Birth"
                      type="date"
                      leftIcon={<Calendar size={20} />}
                      error={errors.date_of_birth?.message}
                      {...register('date_of_birth', {
                        required: 'Date of birth is required',
                        validate: (value) => {
                          const date = new Date(value)
                          const today = new Date()
                          const age = today.getFullYear() - date.getFullYear()
                          return age >= 13 || 'You must be at least 13 years old'
                        }
                      })}
                    />
                  </motion.div>

                  {/* Referral Field */}
                  <motion.div variants={fadeInRight}>
                    <Input
                      label="Referral (Optional)"
                      type="text"
                      placeholder="Enter existing member's name"
                      leftIcon={<UserPlus size={20} />}
                      error={errors.referral?.message}
                      {...register('referral', {
                        minLength: {
                          value: 2,
                          message: 'Referral name must be at least 2 characters'
                        }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If you know an existing member, enter their name here
                    </p>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div variants={fadeInRight}>
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      leftIcon={<Lock size={20} />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      }
                      error={errors.password?.message}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain uppercase, lowercase, number and special character'
                        }
                      })}
                    />
                  </motion.div>

                  {/* Confirm Password Input */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      leftIcon={<Lock size={20} />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      }
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match'
                      })}
                    />
                  </motion.div>

                  {/* Terms and Conditions */}
                  <motion.div variants={fadeInUp} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-gold-500 bg-dark-800 border-gold-500 rounded focus:ring-gold-500"
                      {...register('terms', {
                        required: 'You must accept the terms and conditions'
                      })}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-gold-400 hover:text-gold-300">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-gold-400 hover:text-gold-300">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.terms && (
                      <p className="text-red-400 text-xs">{errors.terms.message}</p>
                    )}
                  </motion.div>

                  {/* Signup Button */}
                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<UserPlus size={20} />}
                    >
                      Create Account
                    </Button>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gold-500 border-opacity-20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-dark-card px-4 text-gray-400">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  {/* Login Link */}
                  <motion.div 
                    className="text-center"
                    variants={fadeInUp}
                  >
                    <Link
                      to="/login"
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors duration-200"
                    >
                      Sign in to your account
                    </Link>
                  </motion.div>
                </form>
              </CardBody>
            </Card>
          </ScrollReveal>

          {/* Footer */}
          <ScrollReveal variant="fadeInUp" delay={0.5} className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Club 90s Football Academy. All rights reserved.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}