// pages/auth/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { ScrollReveal } from '../../components/animations/ScrollReveal'
import { GoldParticles } from '../../components/animations/GoldParticles'
import { useAuth } from '../../hooks/useAuth'
import { fadeInUp, fadeInLeft, fadeInRight } from '../../utils/motionVariants'

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const onSubmit = async (data) => {
    const result = await login(data)
    
    if (result.success) {
      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    } else {
      if (result.error.includes('email')) {
        setError('email', { message: result.error })
      } else if (result.error.includes('password')) {
        setError('password', { message: result.error })
      }
    }
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
              <img
                src={process.env.PUBLIC_URL + '/club90s_logobg.png'}
                alt="Club 90s logo"
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
              />
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Sign in to Club 90s Football Academy
            </p>
          </ScrollReveal>

          {/* Login Form */}
          <ScrollReveal variant="fadeInUp" delay={0.3}>
            <Card className="backdrop-blur-md">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Input */}
                  <motion.div variants={fadeInLeft}>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
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

                  {/* Password Input */}
                  <motion.div variants={fadeInRight}>
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                        required: 'Password is required'
                      })}
                    />
                  </motion.div>

                  {/* Login Button */}
                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<LogIn size={20} />}
                    >
                      Sign In
                    </Button>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gold-500 border-opacity-20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-dark-card px-4 text-gray-400">
                        Don't have an account?
                      </span>
                    </div>
                  </div>

                  {/* Signup Link */}
                  <motion.div 
                    className="text-center"
                    variants={fadeInUp}
                  >
                    <Link
                      to="/signup"
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors duration-200"
                    >
                      Create your account
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