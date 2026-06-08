'use client';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

// ── Page Transition ──────────────────────────────────────────────
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease }}>
      {children}
    </motion.div>
  );
}

// ── Stagger container — animates children one by one ─────────────
export function StaggerContainer({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}>
      {children}
    </motion.div>
  );
}

// ── Stagger item ─────────────────────────────────────────────────
export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden:   { opacity: 0, y: 22, scale: 0.97 },
        visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.42, ease } },
      }}>
      {children}
    </motion.div>
  );
}

// ── List item — for order cards / table rows ─────────────────────
export function ListItem({ children, className = '', index = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease }}>
      {children}
    </motion.div>
  );
}

// ── Fade in when scrolled into view ─────────────────────────────
export function FadeInView({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, ease }}>
      {children}
    </motion.div>
  );
}

// ── Slide up from bottom ──────────────────────────────────────────
export function SlideUp({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}>
      {children}
    </motion.div>
  );
}

// ── Scale in — for cards / modals ────────────────────────────────
export function ScaleIn({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease }}>
      {children}
    </motion.div>
  );
}

// ── Animated button ──────────────────────────────────────────────
export function MotionButton({ children, className = '', onClick, disabled, type = 'button' }) {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}>
      {children}
    </motion.button>
  );
}

// ── Number counter animation ─────────────────────────────────────
export function AnimatedNumber({ value, className = '' }) {
  return (
    <motion.span
      key={value}
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}>
      {value}
    </motion.span>
  );
}
