// pages/LandingPage.jsx
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Trophy, 
  Users, 
  Calendar, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Play,
  Award,
  Target,
  Heart,
  Zap,
  User
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { ScrollReveal } from '../components/animations/ScrollReveal'
import { GoldParticles } from '../components/animations/GoldParticles'
import { fadeInUp, staggerContainer } from '../utils/motionVariants'
import useAuthStore from '../store/authStore'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef(null)
  const numbersRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    // Hero animation
    const tl = gsap.timeline()
    tl.from('.hero-title', { 
      y: 100, 
      opacity: 0, 
      duration: 1.2, 
      ease: 'power3.out' 
    })
    .from('.hero-subtitle', { 
      y: 50, 
      opacity: 0, 
      duration: 1, 
      ease: 'power3.out' 
    }, '-=0.8')
    .from('.hero-buttons', { 
      y: 30, 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power3.out' 
    }, '-=0.6')

    // Numbers counter animation
    ScrollTrigger.create({
      trigger: numbersRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.to('.counter', {
          textContent: (i, target) => target.dataset.count,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          stagger: 0.2
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const stats = [
    { number: 500, label: 'Active Members', icon: Users },
    { number: 15, label: 'Years Experience', icon: Trophy },
    { number: 100, label: 'Matches Played', icon: Target },
    { number: 25, label: 'Trophies Won', icon: Award }
  ]

  const features = [
    {
      icon: Trophy,
      title: 'Professional Training',
      description: 'Learn from experienced coaches with proven track records in developing football talent.',
      gradient: 'from-gold-400 to-yellow-500'
    },
    {
      icon: Users,
      title: 'Community Spirit',
      description: 'Join a supportive community of players, coaches, and families passionate about football.',
      gradient: 'from-blue-400 to-purple-500'
    },
    {
      icon: Calendar,
      title: 'Regular Matches',
      description: 'Participate in weekly matches and tournaments to test your skills against other clubs.',
      gradient: 'from-green-400 to-blue-500'
    },
    {
      icon: Star,
      title: 'Player Development',
      description: 'Structured programs designed to develop technical skills, tactical awareness, and physical fitness.',
      gradient: 'from-red-400 to-pink-500'
    },
    {
      icon: Heart,
      title: 'For All Ages',
      description: 'Programs available for juniors, seniors, and veterans - everyone can enjoy the beautiful game.',
      gradient: 'from-purple-400 to-indigo-500'
    },
    {
      icon: Zap,
      title: 'Modern Facilities',
      description: 'Train on well-maintained pitches with modern equipment and changing facilities.',
      gradient: 'from-orange-400 to-red-500'
    }
  ]

  const testimonials = [
    {
      name: 'John Smith',
      role: 'Senior Player',
      content: 'Club 90s has been my second home for the past 5 years. The community here is incredible and the level of football keeps improving.',
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Sarah Johnson',
      role: 'Parent',
      content: 'My son has grown so much since joining Club 90s. Not just as a player, but as a person. The coaches really care about each child.',
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Mike Davis',
      role: 'Veteran Player',
      content: 'After 30 years of playing football, I can say Club 90s is special. Great people, great football, and great memories.',
      image: '/api/placeholder/60/60'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-gold-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={process.env.PUBLIC_URL + '/favicon.svg'}
                alt="Club 90s logo"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-xl font-display font-bold text-gradient-gold">
                Club 90s
              </span>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login"
                    className="text-gray-300 hover:text-gold-400 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Button
                    as={Link}
                    to="/signup"
                    variant="primary"
                    size="sm"
                  >
                    Join Now
                  </Button>
                </>
              ) : (
                <Link 
                  to="/dashboard"
                  className="text-gray-300 hover:text-gold-400 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GoldParticles count={60} />
        <div className="absolute inset-0 bg-noise opacity-10" />
        {/* Contrast overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div className="max-w-4xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl font-display font-bold text-gradient-gold mb-6">
              Welcome to Club 90s
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Where passion meets excellence. Join our football community and experience the beautiful game like never before.
            </p>
            
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/signup"
                variant="primary"
                size="lg"
                leftIcon={<Users />}
                className="text-lg px-8 py-4"
              >
                Join the Club
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Play />}
                className="text-lg px-8 py-4"
              >
                Watch Highlights
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gold-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={numbersRef} className="py-20 bg-dark-950/50">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fadeInUp">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gold-gradient rounded-full flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-dark-950" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                    <span className="counter" data-count={stat.number}>0</span>
                    {index === 2 && '+'}
                  </div>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-6">
              Why Choose Club 90s?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We offer more than just football. We build character, friendships, and memories that last a lifetime.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full group hover:scale-105 transition-transform duration-300">
                  <CardBody className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-dark-950/50">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-6">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our community has to say about Club 90s.
            </p>
          </ScrollReveal>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full">
                  <CardBody className="p-6">
                    <p className="text-gray-300 italic mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-dark-950" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fadeInUp">
            <Card className="bg-gold-gradient">
              <CardBody className="p-12 text-center">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-950 mb-6">
                  Ready to Join the Family?
                </h2>
                <p className="text-xl text-dark-800 mb-8 max-w-2xl mx-auto">
                  Take the first step towards an amazing football journey. Join Club 90s today and become part of something special.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    as={Link}
                    to="/signup"
                    variant="dark"
                    size="lg"
                    leftIcon={<Users />}
                    className="text-lg px-8 py-4"
                  >
                    Sign Up Now
                  </Button>
                  <Button
                    variant="outline-dark"
                    size="lg"
                    leftIcon={<Phone />}
                    className="text-lg px-8 py-4"
                  >
                    Contact Us
                  </Button>
                </div>
              </CardBody>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={process.env.PUBLIC_URL + '/favicon.svg'}
                  alt="Club 90s logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xl font-display font-bold text-gradient-gold">
                  Club 90s
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Building champions on and off the field since 2010. Join our football family today.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-gray-400 hover:text-gold-400 transition-colors">Join Now</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-gold-400 transition-colors">Login</Link></li>
                <li><span className="text-gray-400 cursor-not-allowed">Fixtures (Coming Soon)</span></li>
                <li><span className="text-gray-400 cursor-not-allowed">Results (Coming Soon)</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Programs</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 cursor-not-allowed">Youth Academy (Coming Soon)</span></li>
                <li><span className="text-gray-400 cursor-not-allowed">Senior Team (Coming Soon)</span></li>
                <li><span className="text-gray-400 cursor-not-allowed">Veterans League (Coming Soon)</span></li>
                <li><span className="text-gray-400 cursor-not-allowed">Training Camps (Coming Soon)</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  123 Football Street, Sports City
                </li>
                <li className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  info@club90s.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gold-500/20 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Club 90s Football Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}