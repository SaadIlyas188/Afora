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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            className={`relative ${maxWidth} w-full bg-white shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-none`}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gold-100 flex-shrink-0">
                <h3 className="text-base font-heading font-medium tracking-wide">{title}</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-gold-50 transition-colors cursor-pointer">
                  <X size={18} className="text-muted" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 hover:bg-gold-50 transition-colors z-10 cursor-pointer"
              >
                <X size={18} className="text-muted" />
              </button>
            )}
            <div className="overflow-y-auto flex-1 p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
