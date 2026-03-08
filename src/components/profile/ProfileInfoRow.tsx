import { motion } from 'framer-motion';

interface ProfileInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  index?: number;
}

export const ProfileInfoRow = ({ icon: Icon, label, value, index = 0 }: ProfileInfoRowProps) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
    className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 active:scale-[0.99]"
  >
    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm">
      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-sm sm:text-[15px] text-foreground truncate mt-0.5">{value}</p>
    </div>
  </motion.div>
);
