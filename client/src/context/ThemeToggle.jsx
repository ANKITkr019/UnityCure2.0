import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggleTheme } = useTheme();

  const isSmall = size === 'sm';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={
        'relative flex items-center justify-center rounded-xl border transition-all duration-300 ' +
        (isSmall ? 'w-8 h-8 ' : 'w-10 h-10 ') +
        (theme === 'dark'
          ? 'bg-slate-800 border-white/10 text-yellow-400 hover:bg-slate-700'
          : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50 shadow-sm'
        )
      }
      title={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'}
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={isSmall ? 14 : 17} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={isSmall ? 14 : 17} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}