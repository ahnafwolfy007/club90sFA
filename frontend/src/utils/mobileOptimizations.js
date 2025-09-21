// ==================================================
// MOBILE-SPECIFIC OPTIMIZATIONS
// ==================================================

// utils/mobileOptimizations.js
import { useEffect, useState } from 'react';

export const initMobileOptimizations = () => {
  // Prevent zoom on input focus (iOS)
  const addMaximumScaleToMetaViewport = () => {
    const el = document.querySelector('meta[name=viewport]')
    if (el !== null) {
      let content = el.getAttribute('content')
      let re = /maximum\-scale=[0-9\.]+/g
      if (re.test(content)) {
        content = content.replace(re, 'maximum-scale=1.0')
      } else {
        content = [content, 'maximum-scale=1.0'].join(', ')
      }
      el.setAttribute('content', content)
    }
  }

  // Add touch-action for better scroll performance
  document.body.style.touchAction = 'pan-y'
  
  // Optimize scroll performance
  let ticking = false
  const updateScrollDirection = () => {
    document.body.classList.toggle('scrolling-down', window.scrollY > 0)
    ticking = false
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollDirection)
      ticking = true
    }
  })

  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      window.scrollTo(0, window.scrollY)
    }, 100)
  })

  // Add iOS-specific styles
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.documentElement.classList.add('ios')
    addMaximumScaleToMetaViewport()
  }

  // Add Android-specific styles
  if (/Android/.test(navigator.userAgent)) {
    document.documentElement.classList.add('android')
  }
}

// Custom hook for mobile detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Touch gesture hook
export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

// Device detection hooks
export const useDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
    isFirefox: false,
  })

  useEffect(() => {
    const userAgent = navigator.userAgent
    const width = window.innerWidth

    setDevice({
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isChrome: /Chrome/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent),
    })
  }, [])

  return device
}

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection type if available
    if ('connection' in navigator) {
      setConnectionType(navigator.connection.effectiveType)
      
      navigator.connection.addEventListener('change', () => {
        setConnectionType(navigator.connection.effectiveType)
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionType }
}

// Battery status hook
export const useBatteryStatus = () => {
  const [battery, setBattery] = useState({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
  })

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((batteryManager) => {
        const updateBattery = () => {
          setBattery({
            level: batteryManager.level,
            charging: batteryManager.charging,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime,
          })
        }

        updateBattery()

        batteryManager.addEventListener('chargingchange', updateBattery)
        batteryManager.addEventListener('levelchange', updateBattery)
        batteryManager.addEventListener('chargingtimechange', updateBattery)
        batteryManager.addEventListener('dischargingtimechange', updateBattery)
      })
    }
  }, [])

  return battery
}

// Viewport size hook with debouncing
export const useViewportSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    let timeoutId
    
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return size
}

// Performance monitoring
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName) => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const duration = end - start
      
      if (duration > 16) { // Longer than one frame at 60fps
        console.warn(`${componentName} render took ${duration.toFixed(2)}ms`)
      }
    }
  },

  // Measure API response time
  measureAPI: (endpoint) => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const duration = end - start
      console.log(`API ${endpoint} took ${duration.toFixed(2)}ms`)
    }
  },

  // Memory usage monitoring
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = performance.memory
      console.log({
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      })
    }
  },
}

// PWA utilities
export const pwaUtils = {
  // Check if app is running as PWA
  isPWA: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true
  },

  // Prompt user to install PWA
  promptInstall: () => {
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      let deferredPrompt
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt = e
      })

      return () => {
        if (deferredPrompt) {
          deferredPrompt.prompt()
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt')
            }
            deferredPrompt = null
          })
        }
      }
    }
  },

  // Register service worker
  registerSW: () => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }
  },
}