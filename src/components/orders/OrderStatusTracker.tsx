import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const demandSteps = [
  { status: 'requested', label: 'Requested', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export const OrderStatusTracker = ({ status, type = 'order' }: OrderStatusTrackerProps) => {
  const steps = type === 'demand' ? demandSteps : orderSteps;
  
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">Order Cancelled</span>
      </div>
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
                  <div 
                    className={cn(
                      "flex-1 h-1 rounded-full transition-colors",
                      index <= currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                    isCompleted 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-muted text-muted-foreground",
                    isCurrent && "ring-2 ring-primary/30 ring-offset-2"
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-1 rounded-full transition-colors",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs text-center font-medium",
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
