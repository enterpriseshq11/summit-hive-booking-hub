import { Button } from "@/components/ui/button";

const sections = [
  { id: "workspaces", label: "Options" },
  { id: "why-hive", label: "Why The Hive" },
  { id: "how-it-works", label: "How It Works" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
];

export function CoworkingAnchorChips() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {sections.map((section) => (
        <Button
          key={section.id}
          variant="outline"
          size="sm"
          onClick={() => scrollToSection(section.id)}
          className="rounded-full border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-accent/50 transition-all"
        >
          {section.label}
        </Button>
      ))}
    </div>
  );
}
