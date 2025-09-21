// pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { ScrollReveal } from '../../components/animations/ScrollReveal'
import { GoldParticles } from '../../components/animations/GoldParticles'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import { fadeInUp, fadeInLeft, fadeInRight } from '../../utils/motionVariants'

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const password = watch('password')

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password
      })
      
      setIsSuccess(true)
      toast.success('Password reset successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password'
      
      if (message.includes('Invalid or expired')) {
        setTokenValid(false)
      }
      
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden">
        <GoldParticles count={30} />
        <div className="absolute inset-0 bg-noise opacity-10" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-md mx-auto">
            <ScrollReveal variant="fadeInDown" className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-red-gradient rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-3xl font-display font-bold text-red-400 mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-gray-400">
                This password reset link has expired or is invalid
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeInUp" delay={0.3}>
              <Card className="backdrop-blur-md mb-8">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-300 mb-6">
                    Password reset links expire after 1 hour for security reasons. 
                    Please request a new password reset link.
                  </p>
                  
                  <Button
                    as={Link}
                    to="/forgot-password"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Request New Reset Link
                  </Button>
                </CardBody>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden">
        <GoldParticles count={40} />
        <div className="absolute inset-0 bg-noise opacity-10" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-md mx-auto">
            <ScrollReveal variant="fadeInDown" className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-green-gradient rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
                Password Reset Complete
              </h1>
              <p className="text-gray-400">
                Your password has been successfully updated
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeInUp" delay={0.3}>
              <Card className="backdrop-blur-md mb-8">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-300 mb-6">
                    You can now sign in with your new password. 
                    You'll be redirected to the login page in a few seconds.
                  </p>
                  
                  <Button
                    as={Link}
                    to="/login"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </CardBody>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden">
      {/* Background particles */}
      <GoldParticles count={30} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-noise opacity-10" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <ScrollReveal variant="fadeInDown" className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-gradient rounded-full flex items-center justify-center">
                <Lock size={32} className="text-dark-950" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
              Set New Password
            </h1>
            <p className="text-gray-400">
              Enter your new password below
            </p>
          </ScrollReveal>

          {/* Reset Form */}
          <ScrollReveal variant="fadeInUp" delay={0.3}>
            <Card className="backdrop-blur-md">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Password Input */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
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
                  <motion.div variants={fadeInRight}>
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
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

                  {/* Password Requirements */}
                  <motion.div variants={fadeInUp} className="bg-gold-500 bg-opacity-10 border border-gold-500 border-opacity-30 rounded-lg p-4">
                    <h4 className="text-gold-400 font-medium mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase letter (A-Z)</li>
                      <li>• Contains lowercase letter (a-z)</li>
                      <li>• Contains number (0-9)</li>
                      <li>• Contains special character (@$!%*?&)</li>
                    </ul>
                  </motion.div>

                  {/* Reset Button */}
                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<Lock size={20} />}
                    >
                      Update Password
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <motion.div 
                    className="text-center"
                    variants={fadeInUp}
                  >
                    <Link
                      to="/login"
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors duration-200"
                    >
                      Back to Login
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