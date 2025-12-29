import { CheckCircle2, Building2, CalendarDays, CreditCard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Booking flow steps definition
const bookingSteps = [
  { 
    step: 1, 
    title: "Choose Experience", 
    description: "Select business & service",
    icon: Building2,
  },
  { 
    step: 2, 
    title: "Select Package", 
    description: "Pick options & add-ons",
    icon: CreditCard,
  },
  { 
    step: 3, 
    title: "Choose Date & Time", 
    description: "View real-time availability",
    icon: CalendarDays,
  },
  { 
    step: 4, 
    title: "Details & Review", 
    description: "Complete your reservation",
    icon: CheckCircle2,
  },
];

interface BookingStepIndicatorProps {
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
}

export function BookingStepIndicator({
  currentStep,
  completedSteps = [],
  onStepClick,
}: BookingStepIndicatorProps) {
  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps
    if (completedSteps.includes(step)) {
      onStepClick?.(step);
    } else if (step > currentStep) {
      toast.info("Complete previous step first", {
        description: "Please finish the current step before moving ahead.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, step: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(step);
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto mb-12" role="navigation" aria-label="Booking progress">
        <div className="flex items-center justify-between relative">
          {/* Progress line - background */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-primary-foreground/20 hidden md:block" aria-hidden="true" />
          
          {/* Progress line - filled */}
          <div 
            className="absolute top-6 left-0 h-0.5 bg-accent transition-all hidden md:block" 
            style={{ width: `${((currentStep - 1) / (bookingSteps.length - 1)) * 100}%` }}
            aria-hidden="true"
          />
          
          {bookingSteps.map((step) => {
            const isCompleted = completedSteps.includes(step.step);
            const isCurrent = step.step === currentStep;
            const isDisabled = step.step > currentStep && !isCompleted;
            const StepIcon = step.icon;

            return (
              <Tooltip key={step.step}>
                <TooltipTrigger asChild>
                  <div 
                    className="relative flex flex-col items-center text-center z-10 flex-1"
                    role="listitem"
                  >
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.step)}
                      onKeyDown={(e) => handleKeyDown(e, step.step)}
                      disabled={isDisabled}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Step ${step.step}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                      tabIndex={0}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
                        isCompleted
                          ? 'bg-accent border-accent text-primary cursor-pointer hover:scale-105' 
                          : isCurrent
                            ? 'bg-accent border-accent text-primary ring-4 ring-accent/30'
                            : 'bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/60 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </button>
                    
                    {/* Step label - desktop only */}
                    <div className="mt-3 hidden md:block">
                      {isCurrent && (
                        <span className="text-xs block text-primary-foreground/50 mb-0.5">
                          Step {step.step} of 4
                        </span>
                      )}
                      <p className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-accent' : 'text-primary-foreground/60'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-primary-foreground/50 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent className="bg-primary text-primary-foreground border-accent/30">
                    Complete previous step first
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
