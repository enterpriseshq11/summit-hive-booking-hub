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
    <nav className="grid grid-cols-2 gap-2 max-w-xs sm:max-w-md sm:flex sm:flex-wrap sm:justify-center" aria-label="Page sections">
      {sections.map((section, index) => (
        <Button
          key={section.id}
          variant="outline"
          size="sm"
          onClick={() => scrollToSection(section.id)}
          className={`rounded-full border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            index === sections.length - 1 ? "col-span-2 mx-auto max-w-[50%] sm:col-span-1 sm:max-w-none" : ""
          }`}
          aria-label={`Jump to ${section.label} section`}
        >
          {section.label}
        </Button>
      ))}
    </nav>
  );
}
