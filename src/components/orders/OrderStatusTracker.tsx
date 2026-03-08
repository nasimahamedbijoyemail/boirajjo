import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
type DemandStatus = 'requested' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderStatusTrackerProps {
  status: OrderStatus | DemandStatus;
  type?: 'order' | 'demand';
}

const orderSteps = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'out_for_delivery', label: 'Shipping', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const demandSteps = [
  { status: 'requested', label: 'Requested', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'out_for_delivery', label: 'Shipping', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export const OrderStatusTracker = ({ status, type = 'order' }: OrderStatusTrackerProps) => {
  const steps = type === 'demand' ? demandSteps : orderSteps;
  
  if (status === 'cancelled') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20"
      >
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          {type === 'demand' ? 'Request' : 'Order'} Cancelled
        </span>
      </motion.div>
    );
  }

  const currentStepIndex = steps.findIndex(step => step.status === status);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    style={{ originX: 0 }}
                    className={cn(
                      "flex-1 h-1 rounded-full transition-colors",
                      index <= currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all flex-shrink-0",
                    isCompleted 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-muted text-muted-foreground",
                    isCurrent && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
                    style={{ originX: 0 }}
                    className={cn(
                      "flex-1 h-1 rounded-full transition-colors",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-[10px] sm:text-xs text-center font-medium leading-tight",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
