import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Wifi, Coffee, Users, Briefcase, Headphones } from "lucide-react";

const amenityCategories = [
  {
    id: "included",
    title: "Always Included",
    icon: Check,
    items: [
      "High-speed fiber internet",
      "Unlimited coffee, tea & water",
      "Climate-controlled environment",
      "Professional cleaning",
      "Mail handling",
    ],
  },
  {
    id: "productivity",
    title: "Productivity",
    icon: Wifi,
    items: [
      "Dedicated workstations",
      "Ergonomic seating",
      "Standing desk options",
      "Quiet zones",
      "Phone booths",
    ],
  },
  {
    id: "hospitality",
    title: "Hospitality",
    icon: Coffee,
    items: [
      "Fully-stocked coffee bar",
      "Lounge areas",
      "Kitchen access",
      "Complimentary refreshments",
      "Guest parking",
    ],
  },
  {
    id: "meetings",
    title: "Meetings & Events",
    icon: Users,
    items: [
      "Bookable conference rooms",
      "Video conferencing equipment",
      "Presentation displays",
      "Whiteboard walls",
      "Event space access",
    ],
  },
  {
    id: "business",
    title: "Business Services",
    icon: Briefcase,
    items: [
      "Professional business address",
      "Printing & scanning",
      "Package receiving",
      "Notary services (on request)",
      "Administrative support",
    ],
  },
];

interface AmenitiesAccordionProps {
  onBookMeetingRoom?: () => void;
}

export function AmenitiesAccordion({ onBookMeetingRoom }: AmenitiesAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={["included"]} className="space-y-3">
      {amenityCategories.map((category) => {
        const IconComponent = category.icon;
        return (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="border border-border rounded-lg px-4 data-[state=open]:border-accent/50 bg-card"
          >
            <AccordionTrigger className="hover:no-underline py-4 [&[data-state=open]>svg]:text-accent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
                  <IconComponent className="h-4 w-4 text-accent" />
                </div>
                <span className="font-medium">{category.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="grid sm:grid-cols-2 gap-2 pl-11">
                {category.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {category.id === "meetings" && onBookMeetingRoom && (
                <div className="pl-11 mt-4">
                  <button
                    onClick={onBookMeetingRoom}
                    className="text-sm text-accent hover:underline font-medium"
                    data-event="hive_book_meeting_room_click"
                  >
                    Book a Meeting Room →
                  </button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
