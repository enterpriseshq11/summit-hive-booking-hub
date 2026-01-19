import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Camera, 
  Sparkles, 
  Share2, 
  Users, 
  Crown, 
  Check, 
  Play,
  Pause,
  X,
  RotateCw,
  PartyPopper,
  GraduationCap,
  Heart,
  Zap,
  Video,
  Star,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface PhotoBooth360SectionProps {
  onRequestBooking: () => void;
}

export default function PhotoBooth360Section({ onRequestBooking }: PhotoBooth360SectionProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const yOffset = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Auto-rotate overlay examples
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOverlay((prev) => (prev + 1) % overlayExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const overlayExamples = [
    { text: "Happy 30th Sarah!", type: "Birthday", icon: PartyPopper },
    { text: "Class of 2026", type: "Graduation", icon: GraduationCap },
    { text: "John & Emily", type: "Wedding", icon: Heart },
    { text: "ACME Corp Annual Gala", type: "Corporate", icon: Crown },
  ];

  const benefits = [
    {
      icon: Video,
      title: "Cinematic Slow-Motion Capture",
      desc: "Professional 360° video at 120fps creates stunning slow-motion moments"
    },
    {
      icon: Sparkles,
      title: "Custom Event Overlays",
      desc: "Your name, logo, or message branded directly into every video"
    },
    {
      icon: Share2,
      title: "Instant Social Sharing",
      desc: "Guests receive their videos immediately to share everywhere"
    },
    {
      icon: Users,
      title: "High-Energy Crowd Engagement",
      desc: "Creates excitement and unforgettable moments all night long"
    },
    {
      icon: Zap,
      title: "Premium Production Quality",
      desc: "Studio-grade lighting and equipment for flawless results"
    },
    {
      icon: Star,
      title: "Unforgettable Memories",
      desc: "Transform your event from standard to extraordinary"
    }
  ];

  const includedEvents = [
    { type: "Birthday Parties", icon: PartyPopper, desc: "All birthday celebrations" },
    { type: "Graduation Parties", icon: GraduationCap, desc: "Celebrate achievements in style" },
    { type: "Weddings", icon: Heart, desc: "Your perfect day, elevated" }
  ];

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="360-photo-booth" 
      className="relative overflow-hidden"
    >
      {/* Hero Video Section - Full Width Cinematic */}
      <div className="relative min-h-[80vh] md:min-h-[90vh] flex items-center bg-primary">
        {/* Background Video - Placeholder with animated gradient until real video */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient background simulating 360 motion */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-black to-primary" />
          
          {/* Rotating light sweep effect */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{ rotate: rotateValue }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-32 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          </motion.div>
          
          {/* Circular motion blur effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_70%)]" />
          
          {/* Gold accent glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* 360° motion indicator rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div 
              className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] border border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] border border-accent/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] border-2 border-accent/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent/60 rounded-full"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${20 + ((i % 4) * 20)}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + (i * 0.3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Video Overlay & Content */}
        <div className="relative z-10 container py-20">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/40 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Camera className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Signature Experience</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Turn Your Event Into a{" "}
              <span className="text-accent relative">
                Cinematic Experience
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </span>
            </motion.h2>
            
            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Our 360 Photo Booth captures slow-motion, high-energy moments your guests will talk about and share instantly.
            </motion.p>
            
            {/* Play Button / CTA */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="group bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30 backdrop-blur-sm font-semibold gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-30" />
                  <Play className="h-5 w-5 text-accent fill-accent relative z-10" />
                </div>
                Watch in Action
              </Button>
              
              <Button
                size="lg"
                onClick={onRequestBooking}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
              >
                Reserve The Summit
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
            
            {/* Rotating 360° indicator */}
            <motion.div 
              className="mt-12 inline-flex items-center gap-3 text-primary-foreground/60"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RotateCw className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-medium">360° Slow-Motion Capture</span>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Custom Branding Showcase */}
      <div className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Interactive Overlay Preview */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Phone/Video Frame Mock */}
                <div className="relative mx-auto max-w-sm">
                  {/* Rotating glow behind */}
                  <motion.div 
                    className="absolute -inset-8 bg-accent/20 rounded-3xl blur-2xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  <div className="relative bg-gradient-to-br from-primary via-black to-primary rounded-3xl p-1 shadow-2xl">
                    <div className="bg-black rounded-2xl aspect-[9/16] overflow-hidden relative">
                      {/* Simulated 360 content */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
                      
                      {/* Center rotating element */}
                      <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-48 h-48 border-2 border-accent/40 rounded-full" />
                      </motion.div>
                      
                      {/* Silhouette placeholder */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Users className="h-24 w-24 text-primary-foreground/30" />
                      </div>
                      
                      {/* Custom Overlay - Animated */}
                      <motion.div 
                        className="absolute bottom-8 left-0 right-0 text-center"
                        key={activeOverlay}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/90 rounded-lg">
                          {(() => {
                            const Icon = overlayExamples[activeOverlay].icon;
                            return <Icon className="h-4 w-4 text-primary" />;
                          })()}
                          <span className="font-bold text-primary text-lg">
                            {overlayExamples[activeOverlay].text}
                          </span>
                        </div>
                        <p className="text-accent text-xs mt-2 font-medium">
                          {overlayExamples[activeOverlay].type} Event
                        </p>
                      </motion.div>
                      
                      {/* Recording indicator */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-white/80 font-medium">360°</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <motion.div 
                    className="absolute -top-4 -right-4 bg-accent text-primary px-3 py-1.5 rounded-full text-sm font-bold shadow-gold"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Personalized!
                  </motion.div>
                </div>
                
                {/* Overlay selector dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {overlayExamples.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveOverlay(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === activeOverlay 
                          ? "bg-accent w-6" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Show overlay example ${i + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Right - Content */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    Your Event. Your Brand.{" "}
                    <span className="text-accent">Your Moment.</span>
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Every 360 video features custom overlays personalized for your event. 
                    From birthday messages to wedding monograms to corporate logos—your branding 
                    is captured in every unforgettable moment.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {[
                    "Guest initials & birthday names",
                    "Couple names for weddings",
                    "Business logos & event titles",
                    "Custom phrases & hashtags"
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + (i * 0.1), duration: 0.4 }}
                    >
                      <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  Customization is included at no extra cost—just tell us your vision.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-20 container">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            The Complete 360 Experience
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create share-worthy content that elevates your event
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
              >
                <Card className="h-full group hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 overflow-hidden relative">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" />
                  
                  <CardContent className="pt-6 relative">
                    <motion.div 
                      className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="h-6 w-6 text-accent" />
                    </motion.div>
                    <h4 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Included Events - High Visibility Callout */}
      <div className="py-20 bg-primary">
        <div className="container">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Large Badge */}
            <div className="text-center mb-10">
              <motion.div 
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-full font-bold text-lg shadow-gold mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-5 w-5" />
                INCLUDED WITH YOUR BOOKING
              </motion.div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                No Extra Cost. Just Book.
              </h3>
              <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto">
                The 360 Photo Booth experience comes standard with select Summit bookings—
                premium value built right into your event.
              </p>
            </div>
            
            {/* Included Event Types */}
            <div className="grid md:grid-cols-3 gap-6">
              {includedEvents.map((event, i) => {
                const Icon = event.icon;
                return (
                  <motion.div
                    key={event.type}
                    className="relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + (i * 0.15), duration: 0.5 }}
                  >
                    <Card className="bg-primary-foreground/5 border-accent/30 hover:border-accent/50 transition-colors h-full">
                      <CardContent className="pt-8 pb-6 text-center">
                        <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-8 w-8 text-accent" />
                        </div>
                        <h4 className="text-xl font-bold text-primary-foreground mb-2">
                          {event.type}
                        </h4>
                        <p className="text-primary-foreground/70 text-sm mb-4">
                          {event.desc}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium text-accent">360 Included</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Floating star accent */}
                    <motion.div 
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <Star className="h-6 w-6 text-accent fill-accent" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* CTA */}
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                size="lg"
                onClick={onRequestBooking}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all text-lg px-8 py-6"
              >
                Book Your Event
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-primary-foreground/60 text-sm mt-4">
                Victoria will confirm 360 Photo Booth availability with your booking
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black border-none overflow-hidden">
          <div className="relative aspect-video bg-black">
            {/* Placeholder - Replace with actual video when available */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary">
              <div className="text-center">
                <motion.div 
                  className="mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-32 h-32 border-4 border-accent/40 rounded-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-accent" />
                  </div>
                </motion.div>
                <p className="text-primary-foreground text-lg font-medium mb-2">
                  360 Photo Booth Demo Video
                </p>
                <p className="text-primary-foreground/60 text-sm">
                  Coming Soon — Real footage from Summit events
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
