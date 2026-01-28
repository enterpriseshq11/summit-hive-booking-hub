import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CareerAvailability } from "@/hooks/useCareerApplications";

interface AvailabilityStepProps {
  availability: Partial<CareerAvailability>;
  setAvailability: (availability: Partial<CareerAvailability>) => void;
}

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const TIME_BLOCKS = [
  { value: "morning", label: "Morning (6am-12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-6pm)" },
  { value: "evening", label: "Evening (6pm-10pm)" },
];

export function AvailabilityStep({ availability, setAvailability }: AvailabilityStepProps) {
  const toggleDay = (day: string) => {
    const current = availability.daysAvailable || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setAvailability({ ...availability, daysAvailable: updated });
  };

  const toggleTimeBlock = (block: string) => {
    const current = availability.timeBlocks || [];
    const updated = current.includes(block)
      ? current.filter((b) => b !== block)
      : [...current, block];
    setAvailability({ ...availability, timeBlocks: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Availability</h2>
        <p className="text-muted-foreground text-sm">
          Let us know when you're available to work.
        </p>
      </div>

      {/* Days Available */}
      <div className="space-y-3">
        <Label>Days Available *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAYS.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={availability.daysAvailable?.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <Label htmlFor={`day-${day.value}`} className="font-normal">
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Time Blocks */}
      <div className="space-y-3">
        <Label>Preferred Time Blocks *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIME_BLOCKS.map((block) => (
            <div key={block.value} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${block.value}`}
                checked={availability.timeBlocks?.includes(block.value)}
                onCheckedChange={() => toggleTimeBlock(block.value)}
              />
              <Label htmlFor={`time-${block.value}`} className="font-normal">
                {block.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Earliest Start Date */}
      <div className="space-y-2">
        <Label htmlFor="earliestStart">Earliest Available Start Date *</Label>
        <Input
          id="earliestStart"
          type="date"
          value={availability.earliestStartDate || ""}
          onChange={(e) =>
            setAvailability({ ...availability, earliestStartDate: e.target.value })
          }
        />
      </div>

      {/* Upcoming Time Off */}
      <div className="space-y-2">
        <Label htmlFor="timeOff">Any planned time off in the next 60 days?</Label>
        <Textarea
          id="timeOff"
          value={availability.upcomingTimeOff || ""}
          onChange={(e) =>
            setAvailability({ ...availability, upcomingTimeOff: e.target.value })
          }
          placeholder="e.g., Vacation March 15-20, Doctor appointment every Tuesday morning, etc."
          className="min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          Optional. This helps us plan your schedule if hired.
        </p>
      </div>
    </div>
  );
}
