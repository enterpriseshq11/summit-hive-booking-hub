import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, MembershipSignupForm } from "@/components/booking";
import { Dumbbell, Check, Users, ArrowRight, Clock, Zap, Heart, Trophy, ChevronRight, Quote, Shield } from "lucide-react";

export default function Fitness() {
  const { data: business } = useBusinessByType("fitness");
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  const membershipTiers = [
    {
      name: "Essential",
      tagline: "Start your journey",
      features: ["24/7 gym access", "Locker room access", "Free WiFi", "Equipment orientation"]
    },
    {
      name: "Performance",
      tagline: "Elevate your training",
      features: ["All Essential benefits", "Group fitness classes", "Sauna & steam access", "Monthly guest pass"],
      highlighted: true
    },
    {
      name: "Elite",
      tagline: "Unlimited potential",
      features: ["All Performance benefits", "Spa & recovery discounts", "Priority class booking", "Unlimited guest access"]
    }
  ];

  const scrollToForm = () => {
    const formSection = document.getElementById('membership-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMembershipForm(true);
  };

  const handleMembershipSuccess = (membershipId: string) => {
    setShowMembershipForm(false);
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
              <Dumbbell className="h-4 w-4" />
              24/7 Fitness Center
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
              Total Fitness by A-Z
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium mb-4">Transform Your Potential</p>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl">
              {business?.description || "State-of-the-art equipment, expert guidance, and a community dedicated to helping you achieve your fitness goals."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
            
            <p className="text-primary-foreground/50 text-sm mt-4 flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              No obligation. Response within 24 hours.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} aria-hidden="true" />
      </section>

      {/* Next Available Widget */}
      <section className="py-12 container bg-background">
        <Card className="max-w-4xl mx-auto shadow-premium border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Next Available Orientations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <NextAvailableWidget
              businessType="fitness"
              title="Next Available Orientations"
              showPrice={false}
              limit={3}
            />
          </CardContent>
        </Card>
      </section>

      {/* Membership Tiers Section */}
      <section id="membership-form-section" className="py-20 container bg-background">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Membership Options</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the membership that fits your lifestyle. You'll review everything before payment.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {membershipTiers.map((tier) => (
            <Card 
              key={tier.name} 
              onClick={scrollToForm}
              className={`cursor-pointer hover:shadow-premium-hover transition-all duration-300 shadow-premium group ${
                tier.highlighted ? "ring-2 ring-accent relative border-accent/30" : "hover:border-accent/30"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && scrollToForm()}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-primary text-xs px-3 py-1 rounded-full font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className={tier.highlighted ? "pt-8" : ""}>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{tier.name}</CardTitle>
                <p className="text-accent font-medium">{tier.tagline}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Learn More <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Single CTA for section */}
        <div className="text-center">
          <Dialog open={showMembershipForm} onOpenChange={setShowMembershipForm}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
                <Dumbbell className="h-5 w-5 mr-2" />
                Start Membership
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Start Your Fitness Journey</DialogTitle>
              </DialogHeader>
              <MembershipSignupForm onSuccess={handleMembershipSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Why Total Fitness */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Why Total Fitness</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              More than a gym—a complete fitness experience designed around your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: "24/7 Access", description: "Train on your schedule, day or night" },
              { icon: Zap, title: "Modern Equipment", description: "State-of-the-art machines and free weights" },
              { icon: Users, title: "Expert Staff", description: "Certified trainers ready to help" },
              { icon: Heart, title: "Recovery Focus", description: "Sauna, steam, and recovery amenities" }
            ].map((benefit) => (
              <Card key={benefit.title} className="bg-primary-foreground/5 border-primary-foreground/10 hover:border-accent/30 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-primary-foreground mb-2">{benefit.title}</h3>
                  <p className="text-primary-foreground/60 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Getting started is simple. We'll guide you every step of the way.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-accent/30" aria-hidden="true" />
              
              {[
                { step: "1", title: "Choose Your Membership", description: "Select the plan that matches your fitness goals and lifestyle." },
                { step: "2", title: "Complete Your Profile", description: "Tell us about yourself so we can personalize your experience." },
                { step: "3", title: "Start Training", description: "Get oriented with our facility and begin your transformation." }
              ].map((item, index) => (
                <div key={item.step} className="relative flex gap-6 pb-8 last:pb-0">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-lg flex-shrink-0 z-10">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 text-sm">
              No obligation. You'll review everything before payment.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Member Stories</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Real results from real members.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote: "The 24/7 access completely changed my routine. I can finally work out when it fits my schedule, not the other way around.",
                author: "Member",
                badge: "Fitness Member"
              },
              {
                quote: "The staff here actually cares about your progress. They remember your name and check in on your goals.",
                author: "Guest",
                badge: "Performance Member"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-primary-foreground/5 border-primary-foreground/10">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-accent/40 mb-4" aria-hidden="true" />
                  <p className="text-primary-foreground/80 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/60 text-sm">— {testimonial.author}</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                      {testimonial.badge}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about membership.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="booking" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">How do I get started?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  Simply click "Join Now" to begin. You'll select your membership, complete a brief profile, and schedule your orientation. Our team will guide you through everything.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="commitment" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">Is there a long-term commitment?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  No long-term contracts required. All memberships are month-to-month with the flexibility to cancel anytime.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="classes" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">What classes are available?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  We offer a variety of group fitness classes including strength training, cardio, yoga, and more. Class access depends on your membership level.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="guests" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">Can I bring guests?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  Yes! Guest privileges vary by membership level. Some memberships include monthly guest passes, while Elite members enjoy unlimited guest access.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="pricing" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">How does pricing work?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Ready to Transform?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto text-lg">
            Take the first step toward your fitness goals. Our team is ready to support your journey.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToForm}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            Join Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-primary-foreground/50 text-sm mt-4">
            No obligation. Response within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
