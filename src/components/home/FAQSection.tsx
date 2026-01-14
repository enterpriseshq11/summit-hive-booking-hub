import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

const faqs = [
  {
    question: "How does booking work?",
    answer: "Browse our experiences, select your preferred date and time, and confirm your booking online. You'll receive instant confirmation and can manage your booking from your account. Most bookings take less than 2 minutes.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "You can cancel or reschedule most bookings up to 48 hours in advance for a full refund. Event venue bookings may have different terms based on the size and complexity. Check your confirmation email for specific cancellation details.",
  },
  {
    question: "Is a deposit required?",
    answer: "Some bookings require a deposit to secure your reservation, especially for The Summit events. The deposit amount (typically 25-50%) is clearly shown before you confirm. The remaining balance is due before or at your appointment.",
  },
  {
    question: "How far in advance should I book?",
    answer: "For spa treatments and day passes, 1-2 days in advance is usually sufficient. For The Summit events, we recommend booking 2-4 weeks ahead for best availability. Popular dates (holidays, weekends) book quickly.",
  },
  {
    question: "Do I need a membership?",
    answer: "No membership is required for most experiences. The Summit, Restoration Lounge, and Coworking day passes are open to everyone. Total Fitness offers flexible membership options, but you can also purchase single-visit passes.",
  },
  {
    question: "How do deposits work?",
    answer: "Some bookings may require a deposit to secure your reservation. The deposit amount varies by service and is clearly shown before you confirm. The remaining balance is typically due before or at the time of your appointment or event.",
  },
  {
    question: "What if there's no availability for my preferred time?",
    answer: "If your preferred time isn't available, you can join our waitlist. We'll notify you immediately if a spot opens up. You can also try adjusting your date or time preferences to see more options.",
  },
  {
    question: "How do coworking memberships and office leases work?",
    answer: "We offer flexible options from day passes to monthly memberships and private office leases. Memberships include 24/7 access, and you can upgrade or change your plan anytime. Contact us to discuss the best option for your needs.",
  },
  {
    question: "What should I bring to my spa appointment?",
    answer: "Just bring yourself! We provide robes, slippers, and all necessary amenities. Arrive 10-15 minutes early to check in and relax. For certain treatments, you may be asked to complete a brief intake form.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-semibold text-accent mb-4">
              <HelpCircle className="h-4 w-4" />
              Common Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know before you book
            </p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 py-1 data-[state=open]:border-accent/40"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-foreground [&>svg]:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Need Help Block with Call/Text CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-card border-2 text-center">
            <p className="font-bold text-lg mb-2">Still have questions?</p>
            <p className="text-sm text-muted-foreground mb-6">
              Our team is happy to help with anything not covered here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={SITE_CONFIG.contact.phoneLink} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors font-medium"
              >
                <Phone className="h-4 w-4" />
                Call {SITE_CONFIG.contact.phone}
              </a>
              <a 
                href={`sms:+1${SITE_CONFIG.contact.phone.replace(/\D/g, '')}`} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Text Us
              </a>
              <a 
                href={SITE_CONFIG.contact.emailLink} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors font-medium"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
