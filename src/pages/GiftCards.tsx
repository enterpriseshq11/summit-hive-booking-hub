import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Gift, 
  Dumbbell, 
  Building2, 
  Heart, 
  Check, 
  Shield, 
  Clock, 
  Mail, 
  Sparkles, 
  MapPin,
  ChevronRight,
  Star,
  Users,
  ArrowRight,
  Calendar,
  Phone,
  PartyPopper,
  Cake,
  CalendarHeart
} from "lucide-react";
import { GiftCardPurchaseModal } from "@/components/booking/GiftCardPurchaseModal";
import { GiftCardAnchorChips } from "@/components/booking/GiftCardAnchorChips";
import { StickyMobileGiftCardCTA } from "@/components/booking/StickyMobileGiftCardCTA";
import { GiftCardBulkOrderModal } from "@/components/booking/GiftCardBulkOrderModal";
import { FloatingHelpDrawer } from "@/components/booking/FloatingHelpDrawer";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import CinematicHeroBackground from "@/components/ui/CinematicHeroBackground";

const giftCardOptions = [
  { amount: 50, label: "Starter", description: "Perfect for a quick reset or add-on.", popular: false, example: "Day pass or sauna session" },
  { amount: 100, label: "Classic", description: "Ideal for a signature service.", popular: true, example: "Massage + sauna combo" },
  { amount: 200, label: "Premium", description: "Great for a deeper recovery day.", popular: false, example: "Spa package or personal training" },
  { amount: 500, label: "Ultimate", description: "Best for packages, events, or premium experiences.", popular: false, example: "VIP event or full wellness day" },
];

const redeemLocations = [
  { 
    name: "The Summit", 
    icon: Building2,
    image: "🏛️",
    desc: "Events & Venues",
    examples: ["Event deposits", "Private dining", "Conference room rentals"]
  },
  { 
    name: "The Hive", 
    icon: Building2,
    image: "🐝",
    desc: "Coworking",
    examples: ["Day passes", "Meeting rooms", "Virtual office credits"]
  },
  { 
    name: "Restoration Lounge", 
    icon: Heart,
    image: "🧘",
    desc: "Spa & Wellness",
    examples: ["Massages", "Facials", "Wellness packages"]
  },
  { 
    name: "Total Fitness", 
    icon: Dumbbell,
    image: "💪",
    desc: "Gym & Classes",
    examples: ["Personal training", "Classes", "Pro shop"]
  },
];

const faqItems = [
  {
    question: "How quickly will the gift card be delivered?",
    answer: "Email gift cards are delivered instantly. If you schedule delivery for a future date, the gift card will be sent at your specified time."
  },
  {
    question: "How does the recipient redeem the gift card?",
    answer: "Recipients receive an email with a unique gift card code. They can apply this code at checkout when booking any A-Z service online or present it in person."
  },
  {
    question: "What if the recipient never received their email?",
    answer: `Contact us at ${SITE_CONFIG.contact.phone} and we'll resend the gift card email immediately. We can also send it to a different email address if needed.`
  },
  {
    question: "Can gift cards be refunded?",
    answer: "Gift cards are non-refundable but never expire. They can be transferred to another person if the original recipient doesn't use them."
  },
  {
    question: "Do gift cards expire?",
    answer: "No! A-Z gift cards never expire. The recipient can use them whenever they're ready."
  },
  {
    question: "Can I use a gift card for part of a purchase?",
    answer: "Yes! Gift cards can be applied to any purchase. If the purchase exceeds the gift card balance, the remaining amount can be paid with another method."
  },
  {
    question: "Which A-Z locations accept gift cards?",
    answer: "Gift cards are redeemable at all A-Z Enterprises locations: The Summit, The Hive, Restoration Lounge, and Total Fitness by A-Z."
  },
];

export default function GiftCards() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomAmount(value);
    setIsCustom(true);
    setSelectedAmount(null);
    if (numValue >= 25 && numValue <= 1000) {
      // Valid custom amount
    }
  };

  const getActiveAmount = () => {
    if (isCustom && customAmount) {
      const num = parseInt(customAmount);
      if (num >= 25 && num <= 1000) return num;
    }
    return selectedAmount;
  };

  const handlePurchase = () => {
    if (getActiveAmount()) {
      setIsPurchaseModalOpen(true);
    }
  };

  const handleBuyAsGift = () => {
    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold with subtler grid */}
      <section className="relative py-24 overflow-hidden bg-primary">
        {/* Cinematic Hero Background */}
        <CinematicHeroBackground />
        
        <div className="container max-w-4xl text-center relative z-10">
          {/* Premium icon with gold ring + glow */}
          <div className="relative inline-flex items-center justify-center h-24 w-24 rounded-full mb-8">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-accent/50" />
            <div className="relative h-20 w-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Gift className="h-10 w-10 text-accent" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground tracking-tight">
            Give the Gift of Wellness
          </h1>
          {/* A1: Improved subtitle contrast */}
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-3 font-medium">
            The easiest way to gift fitness, recovery, and unforgettable experiences—delivered instantly and redeemable across A-Z.
          </p>
          {/* A3: Subline text */}
          <p className="text-base text-primary-foreground/70 max-w-xl mx-auto mb-8 flex items-center justify-center gap-2">
            <PartyPopper className="h-4 w-4 text-accent" />
            Perfect for birthdays, holidays, and thank-yous.
          </p>

          {/* Hero CTA Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8 h-12 text-base"
              onClick={() => document.getElementById('amounts')?.scrollIntoView({ behavior: 'smooth' })}
              data-event="giftcard_hero_select_amount"
            >
              Select Amount
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-accent text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent font-semibold px-8 h-12 text-base"
              onClick={handleBuyAsGift}
              data-event="giftcard_hero_buy_as_gift"
            >
              Buy as a Gift
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Clock, label: "Never Expires" },
              { icon: Mail, label: "Instant Delivery" },
              { icon: Shield, label: "Secure Checkout" },
              { icon: MapPin, label: "Redeem Anywhere" },
            ].map((chip) => (
              <div 
                key={chip.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/5 border border-primary-foreground/10 text-sm text-primary-foreground/80"
              >
                <chip.icon className="h-4 w-4 text-accent" />
                {chip.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Gradient divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Anchor Chips */}
      <div className="container max-w-4xl -mt-4 relative z-10">
        <GiftCardAnchorChips />
      </div>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* Gift Card Amount Selection */}
      <section id="amounts" className="py-16 container max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Choose Your Amount</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          Pick a preset or enter a custom amount. You'll confirm delivery details before payment.
        </p>
        
        {/* C2: Increased gap between cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {giftCardOptions.map((option) => (
            <Card 
              key={option.amount} 
              onClick={() => handleAmountSelect(option.amount)}
              className={`cursor-pointer transition-all duration-200 text-center relative group ${
                selectedAmount === option.amount && !isCustom
                  ? "ring-2 ring-accent border-accent/30 shadow-gold-lg scale-[1.02]" 
                  : "hover:border-accent/40 hover:shadow-gold-lg hover:-translate-y-1 hover:bg-accent/5"
              }`}
            >
              {/* Most Popular Badge */}
              {option.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary border-0 shadow-gold">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              {/* Selected Check */}
              {selectedAmount === option.amount && !isCustom && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent flex items-center justify-center shadow-gold">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}

              <CardHeader className="pb-2">
                <CardDescription className="font-medium text-muted-foreground text-sm">{option.label}</CardDescription>
                <CardTitle className="text-5xl font-bold text-accent">${option.amount}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{option.description}</p>
                {/* C3: Example microcopy */}
                <p className="text-xs text-accent/80 italic">e.g. {option.example}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Amount Input - D1, D2, D3 improvements */}
        <div className="max-w-sm mx-auto mb-10">
          <div className="text-center text-sm text-muted-foreground mb-2">Or enter a custom amount</div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              min="25"
              max="1000"
              placeholder="e.g. 150"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className={`pl-8 text-center text-lg h-12 ${isCustom && customAmount ? "border-accent ring-1 ring-accent" : ""}`}
            />
          </div>
          {isCustom && customAmount && (parseInt(customAmount) < 25 || parseInt(customAmount) > 1000) && (
            <p className="text-xs text-destructive text-center mt-2">Amount must be between $25 and $1,000</p>
          )}
        </div>

        {/* Section CTA - D2: Increased button contrast */}
        <div className="text-center">
          <Button 
            size="lg"
            disabled={!getActiveAmount()}
            onClick={handlePurchase}
            className="bg-accent hover:bg-accent/90 text-primary font-bold px-12 h-14 text-lg shadow-gold-lg hover:shadow-gold transition-shadow"
            data-event="giftcard_amount_continue"
          >
            {getActiveAmount() ? (
              <>
                Continue with ${getActiveAmount()}
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              "Select an Amount"
            )}
          </Button>
          {/* D3: Microcopy under button */}
          <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
            <Shield className="h-3.5 w-3.5 text-accent" />
            Secure checkout • Takes under 1 minute
          </p>
        </div>
      </section>

      {/* E1, E2: Bulk/Corporate Orders Mini-Card - Enhanced */}
      <div className="container max-w-5xl pb-8">
        <Card 
          className="border-accent/30 bg-accent/5 cursor-pointer hover:border-accent/50 hover:bg-accent/10 transition-all group"
          onClick={() => setIsBulkModalOpen(true)}
          data-event="giftcard_bulk_card_click"
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-lg">Buying 10+ cards?</p>
                {/* E1: Subtext */}
                <p className="text-sm text-muted-foreground">Perfect for teams, clients, and employee gifts</p>
              </div>
            </div>
            {/* E2: Larger, more visible arrow */}
            <ArrowRight className="h-6 w-6 text-accent group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </div>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* F1, F2, F3: Redeem Anywhere - Enhanced */}
      <section id="redeem-anywhere" className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Redeem Anywhere</h2>
          {/* F3: Tagline */}
          <p className="text-accent font-medium text-center mb-2">One card. Every experience.</p>
          <p className="text-muted-foreground text-center mb-12">
            Use it at any A-Z location—choose where it fits best.
          </p>
          {/* F2: Increased spacing */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {redeemLocations.map((location) => (
              <Card 
                key={location.name} 
                onClick={() => setExpandedLocation(expandedLocation === location.name ? null : location.name)}
                className="text-center cursor-pointer transition-all hover:shadow-gold-lg hover:border-accent/30 hover:-translate-y-1 group"
                data-event={`giftcard_location_${location.name.toLowerCase().replace(/\s/g, '_')}`}
              >
                {/* F1, F2: Enhanced card with image/emoji and more padding */}
                <CardContent className="pt-8 pb-6 px-5">
                  {/* F1: Visual icon/image */}
                  <div className="text-4xl mb-3">{location.image}</div>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <location.icon className="h-6 w-6 text-accent" />
                  </div>
                  <p className="font-semibold text-lg">{location.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{location.desc}</p>
                  
                  {/* Expanded Examples */}
                  {expandedLocation === location.name && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Example uses:</p>
                      <ul className="text-xs text-left space-y-1.5">
                        {location.examples.map((ex) => (
                          <li key={ex} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-accent flex-shrink-0" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-xs text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to see examples →
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* G1, G2, G3: How It Works - Enhanced */}
      <section id="how-it-works" className="py-20 container max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">How It Works</h2>
        <p className="text-muted-foreground text-center mb-14">Simple, secure, and instant</p>
        
        {/* G3: Increased spacing in timeline */}
        <div className="relative mb-14">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
          
          {/* G3: Increased gap */}
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: "1", 
                title: "Choose Amount", 
                desc: "Select a preset value or enter a custom amount between $25-$1,000.",
                subdesc: "Pick what fits your budget.",
                icon: Gift 
              },
              { 
                step: "2", 
                title: "Personalize", 
                desc: "Add recipient details, a personal message, and schedule delivery.",
                subdesc: "Make it meaningful.",
                icon: Sparkles 
              },
              { 
                step: "3", 
                title: "Deliver Instantly", 
                desc: "Gift card is delivered immediately via email—ready to use.",
                subdesc: "They'll have it in seconds.",
                icon: Mail 
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {/* G2: Consistent icon sizing */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full bg-accent/20 blur-lg" />
                  <div className="relative h-24 w-24 rounded-full bg-accent text-primary flex items-center justify-center shadow-gold-lg">
                    <item.icon className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[220px] mx-auto mb-2">{item.desc}</p>
                {/* G1: Short description under each step */}
                <p className="text-xs text-accent font-medium">{item.subdesc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Proof Chips */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: Clock, label: "Never Expires" },
            { icon: MapPin, label: "Redeem Anywhere" },
            { icon: Shield, label: "Secure Checkout" },
          ].map((chip) => (
            <div 
              key={chip.label}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium"
            >
              <chip.icon className="h-4 w-4 text-accent" />
              {chip.label}
            </div>
          ))}
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* H1, H2, H3: FAQ Section - Enhanced */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
          {/* H1: Intro line */}
          <p className="text-muted-foreground text-center mb-12">Everything you need to know before you buy</p>
          
          <Card className="border-accent/20">
            {/* H2: Increased padding */}
            <CardContent className="p-2">
              {/* H3: Auto-expand first item on desktop */}
              <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-b-accent/10 last:border-0">
                    {/* H2: More padding */}
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-accent/5 text-left font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* I1, I2, I3: Final CTA - Enhanced */}
      <section className="py-24 bg-primary/95">
        <div className="container max-w-4xl">
          <Card className="relative overflow-hidden bg-card border-accent/20">
            {/* Gold accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
            
            {/* I1: Increased padding */}
            <CardContent className="p-10 md:p-14 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to give the gift of wellness?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Instant delivery. No expiration. Redeemable across A-Z.
              </p>
              {/* I2: Added instant delivery line */}
              <p className="text-accent font-medium mb-6 flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Instant email delivery
              </p>
              {/* I3: Subtle glow/shadow on CTA */}
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-primary font-bold px-12 h-14 text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-shadow"
                onClick={() => document.getElementById('amounts')?.scrollIntoView({ behavior: 'smooth' })}
                data-event="giftcard_final_cta"
              >
                Buy a Gift Card
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms */}
      <section className="py-10 container max-w-4xl border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Gift cards are not redeemable for cash. Questions? Call <a href={SITE_CONFIG.contact.phoneLink} className="text-accent hover:underline font-medium">{SITE_CONFIG.contact.phone}</a>.
        </p>
      </section>

      {/* Modals */}
      <GiftCardPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        selectedAmount={selectedAmount}
        customAmount={isCustom ? parseInt(customAmount) || null : null}
      />
      <GiftCardBulkOrderModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Sticky Mobile CTA */}
      <StickyMobileGiftCardCTA 
        onBuyClick={() => setIsPurchaseModalOpen(true)}
        selectedAmount={getActiveAmount()}
      />

      {/* Floating Help Drawer */}
      <FloatingHelpDrawer 
        businessType="spa"
        phoneNumber={SITE_CONFIG.contact.phone}
        email={SITE_CONFIG.contact.email}
      />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
