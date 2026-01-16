import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Star, CalendarDays, Zap, Heart, Check, ArrowRight, ArrowLeft, Eye } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Choose Your Experience",
    description: "Browse our four unique experiences: The Summit for events, The Hive for coworking, Restoration for spa treatments, or Total Fitness for gym access.",
    example: "Example: Sarah selects 'The Summit' for her company holiday party.",
    icon: Star,
  },
  {
    number: 2,
    title: "See Real-Time Availability",
    description: "Our calendar shows you exactly what's open. Pick the date and time that works best for you.",
    example: "Example: She sees December 14th at 6 PM is available and selects it.",
    icon: CalendarDays,
  },
  {
    number: 3,
    title: "Confirm & Pay Deposit",
    description: "Review your booking details and pricing. Pay a small deposit to secure your spot. No surprises.",
    example: "Example: Sarah reviews the details and pays a 25% deposit to lock in her date.",
    icon: Zap,
  },
  {
    number: 4,
    title: "Show Up — We Handle the Rest",
    description: "Everything's ready when you arrive. Our team handles setup, coordination, and cleanup.",
    example: "Example: On December 14th, Sarah arrives to a fully prepared venue. Perfect party!",
    icon: Heart,
  },
];

export function ExampleBookingModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setCurrentStep(0);
    }}>
      <DialogTrigger asChild>
        <ButtonSecondary icon={<Eye className="h-4 w-4" />}>
          See an Example Booking
        </ButtonSecondary>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Example Booking Walkthrough</DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-accent"
                  : index < currentStep
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <step.icon className="h-8 w-8 text-accent" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-3">
            Step {step.number} of 4
          </div>
          
          <h3 className="text-lg font-bold mb-3">{step.title}</h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
          
          <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground italic">
            {step.example}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <ButtonPrimary onClick={handleNext} showArrow={true}>
              Next Step
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={handleClose} icon={<Check className="h-4 w-4" />} showArrow={false}>
              Got It!
            </ButtonPrimary>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
