'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.08 }}
            className={`relative ${maxWidth} w-full bg-white shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl overflow-hidden`}
          >
            {/* Drag handle on mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gold-200" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold-100 flex-shrink-0">
                <h3 className="text-[15px] font-heading font-medium tracking-wide text-foreground">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors cursor-pointer">
                  <X size={16} className="text-muted" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10 cursor-pointer"
              >
                <X size={16} className="text-muted" />
              </button>
            )}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
