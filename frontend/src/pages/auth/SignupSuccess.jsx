// pages/auth/SignupSuccess.jsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, ArrowRight, Clock } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { ScrollReveal } from '../../components/animations/ScrollReveal'
import { GoldParticles } from '../../components/animations/GoldParticles'
import { fadeInUp, scaleIn } from '../../utils/motionVariants'

export const SignupSuccess = () => {
  useEffect(() => {
    // Add celebration animation or confetti here
    document.title = 'Registration Successful - Club 90s'
  }, [])

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center relative overflow-hidden">
      {/* Background particles */}
      <GoldParticles count={50} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-noise opacity-10" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-lg mx-auto">
          {/* Success Icon */}
          <ScrollReveal variant="scaleIn" className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 200
              }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-green-gradient rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle size={48} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-display font-bold text-gradient-gold mb-4">
              Welcome to Club 90s!
            </h1>
            <p className="text-xl text-gray-300">
              Your registration was successful
            </p>
          </ScrollReveal>

          {/* Success Message */}
          <ScrollReveal variant="fadeInUp" delay={0.4}>
            <Card className="backdrop-blur-md mb-8">
              <CardBody className="p-8 text-center">
                <div className="space-y-6">
                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center justify-center space-x-3 text-gold-400"
                  >
                    <Mail size={24} />
                    <span className="text-lg font-medium">Account Pending Approval</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      Thank you for joining Club 90s Football Academy! Your account has been created 
                      and is currently pending approval from our administrators.
                    </p>
                    
                    <div className="bg-gold-500 bg-opacity-10 border border-gold-500 border-opacity-30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Clock size={20} className="text-gold-400 mt-1 flex-shrink-0" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gold-400 mb-2">What happens next?</h3>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Our team will review your application</li>
                            <li>• You'll receive an email confirmation once approved</li>
                            <li>• Approval typically takes 24-48 hours</li>
                            <li>• You'll then have full access to all features</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                      We'll send you an email at the address you provided once your account 
                      has been approved. In the meantime, feel free to explore our public content.
                    </p>
                  </motion.div>
                </div>
              </CardBody>
            </Card>
          </ScrollReveal>

          {/* Action Buttons */}
          <ScrollReveal variant="fadeInUp" delay={0.6}>
            <div className="space-y-4">
              <Button
                as={Link}
                to="/"
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight size={20} />}
              >
                Explore Club 90s
              </Button>
              
              <Button
                as={Link}
                to="/login"
                variant="outline"
                size="lg"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </ScrollReveal>

          {/* Contact Info */}
          <ScrollReveal variant="fadeInUp" delay={0.8} className="mt-8">
            <Card className="backdrop-blur-md">
              <CardBody className="p-6">
                <h3 className="font-semibold text-gold-400 mb-3 text-center">
                  Need Help?
                </h3>
                <div className="text-center text-sm text-gray-300 space-y-2">
                  <p>
                    If you have any questions about your registration or need immediate assistance, 
                    please contact our support team.
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
          <ScrollReveal variant="fadeInUp" delay={1} className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Club 90s Football Academy. All rights reserved.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}