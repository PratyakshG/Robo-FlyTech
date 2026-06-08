'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';

const STEPS = [
  { key: 'Pending',    label: 'Ordered',    icon: Clock },
  { key: 'Processing', label: 'Processing', icon: Package },
  { key: 'Shipped',    label: 'Shipped',    icon: Truck },
  { key: 'Delivered',  label: 'Delivered',  icon: CheckCircle },
];

export default function OrderStatusBar({ status, compact = false }) {
  const currentIndex = STEPS.findIndex(s => s.key === status);
  const isCancelled = status === 'Cancelled';

  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center gap-2 ${compact ? 'py-2' : 'py-3'}`}>
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Order Cancelled</span>
        </div>
      </motion.div>
    );
  }

  const progressWidth = currentIndex === 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 88;

  return (
    <div className={`w-full ${compact ? 'py-2' : 'py-4'}`}>
      <div className="relative flex items-start justify-between">

        {/* Background line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ originX: 0, left: '6%', right: '6%' }}
          className="absolute top-4 h-px bg-gray-200 z-0"
        />

        {/* Animated progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: '6%' }}
          className="absolute top-4 h-px bg-red-500 z-0"
        />

        {/* Steps */}
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done   = i < currentIndex;
          const active = i === currentIndex;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: compact ? 6 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center gap-1.5"
              style={{ width: '25%' }}>

              {/* Circle */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center border-2 transition-colors ${
                  done   ? 'bg-red-600 border-red-600 text-white' :
                  active ? 'bg-white border-red-600 text-red-600 shadow-md shadow-red-100' :
                           'bg-white border-gray-200 text-gray-300'
                }`}>
                {done
                  ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}>
                      <CheckCircle size={compact ? 12 : 14} strokeWidth={2.5} />
                    </motion.div>
                  : <Icon size={compact ? 12 : 14} strokeWidth={active ? 2.5 : 1.5} />
                }
              </motion.div>

              {/* Label */}
              {!compact && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`text-center text-xs leading-tight font-medium ${
                    done || active ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                  {step.label}
                </motion.span>
              )}

              {/* Active pulse ring */}
              {active && (
                <span className={`absolute top-0 ${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-red-400 opacity-20 animate-ping`} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Compact labels */}
      {compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between mt-1.5">
          {STEPS.map((step, i) => (
            <span key={step.key}
              className={`text-center text-[10px] leading-tight font-medium tracking-wide ${
                i <= currentIndex ? 'text-gray-700' : 'text-gray-400'
              }`}
              style={{ width: '25%' }}>
              {step.label}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
