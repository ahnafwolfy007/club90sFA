// pages/auth/ForgotPassword.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { ScrollReveal } from '../../components/animations/ScrollReveal'
import { GoldParticles } from '../../components/animations/GoldParticles'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import { fadeInUp, fadeInLeft } from '../../utils/motionVariants'

export const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
      toast.success('Password reset instructions sent!')
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset instructions'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden">
        <GoldParticles count={30} />
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
                Check Your Email
              </h1>
              <p className="text-gray-400">
                We've sent password reset instructions
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeInUp" delay={0.3}>
              <Card className="backdrop-blur-md mb-8">
                <CardBody className="p-8 text-center">
                  <div className="space-y-4">
                    <Mail size={48} className="text-gold-400 mx-auto" />
                    
                    <div>
                      <p className="text-gray-300 mb-2">
                        We've sent password reset instructions to:
                      </p>
                      <p className="text-gold-400 font-medium">
                        {submittedEmail}
                      </p>
                    </div>

                    <div className="bg-gold-500 bg-opacity-10 border border-gold-500 border-opacity-30 rounded-lg p-4">
                      <p className="text-sm text-gray-300">
                        <strong>Didn't receive the email?</strong><br />
                        Check your spam folder or contact support if you continue to have issues.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </ScrollReveal>

            <ScrollReveal variant="fadeInUp" delay={0.5}>
              <div className="space-y-4">
                <Button
                  as={Link}
                  to="/login"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<ArrowLeft size={20} />}
                >
                  Back to Login
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setSubmittedEmail('')
                  }}
                >
                  Try Different Email
                </Button>
              </div>
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
                <Mail size={32} className="text-dark-950" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400">
              Enter your email to receive reset instructions
            </p>
          </ScrollReveal>

          {/* Reset Form */}
          <ScrollReveal variant="fadeInUp" delay={0.3}>
            <Card className="backdrop-blur-md">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Input */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email address"
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

                  {/* Send Instructions Button */}
                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<Send size={20} />}
                    >
                      Send Reset Instructions
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <motion.div 
                    className="text-center"
                    variants={fadeInUp}
                  >
                    <Link
                      to="/login"
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors duration-200 inline-flex items-center space-x-2"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Login</span>
                    </Link>
                  </motion.div>
                </form>
              </CardBody>
            </Card>
          </ScrollReveal>

          {/* Help Text */}
          <ScrollReveal variant="fadeInUp" delay={0.5} className="mt-8">
            <Card className="backdrop-blur-md">
              <CardBody className="p-6">
                <h3 className="font-semibold text-gold-400 mb-3 text-center">
                  Need Help?
                </h3>
                <div className="text-center text-sm text-gray-300 space-y-2">
                  <p>
                    If you're having trouble resetting your password, 
                    please contact our support team for assistance.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                    <a 
                      href="mailto:support@club90s.com" 
                      className="text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      support@club90s.com
                    </a>
                    <span className="hidden sm:inline text-gray-500">•</span>
                    <a 
                      href="tel:+1234567890" 
                      className="text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      (123) 456-7890
                    </a>
                  </div>
                </div>
              </CardBody>
            </Card>
          </ScrollReveal>

          {/* Footer */}
          <ScrollReveal variant="fadeInUp" delay={0.7} className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Club 90s Football Academy. All rights reserved.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}