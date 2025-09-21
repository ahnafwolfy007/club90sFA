// ==================================================
// SMOOTH SCROLL IMPLEMENTATION
// ==================================================

// utils/smoothScroll.js
import Lenis from '@studio-freight/lenis'

export const initSmoothScroll = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
    autoResize: true,
    syncTouch: true,
    syncTouchLerp: 0.1,
    touchInertiaMultiplier: 35,
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Scroll to element function
  lenis.scrollTo = (target, options = {}) => {
    const defaultOptions = {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    }
    lenis.scrollTo(target, { ...defaultOptions, ...options })
  }

  return lenis
}

// Custom hook for smooth scroll
export const useSmoothScroll = () => {
  const scrollTo = (target, options) => {
    if (window.lenis) {
      window.lenis.scrollTo(target, options)
    }
  }

  return { scrollTo }
}