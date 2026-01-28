import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Briefcase,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  MessageSquare,
  ExternalLink,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import {
  CareerApplication,
  CareerApplicationStatus,
  useUpdateApplicationStatus,
} from "@/hooks/useCareerApplications";
import { useAddApplicationNote, useApplicationNotes } from "@/hooks/useCareerApplicationNotes";
import { toast } from "sonner";

interface CareerApplicationDetailModalProps {
  application: CareerApplication | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions: { value: CareerApplicationStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "reviewing", label: "Reviewing", color: "bg-amber-500" },
  { value: "interview", label: "Interview", color: "bg-purple-500" },
  { value: "offer", label: "Offer", color: "bg-green-500" },
  { value: "hired", label: "Hired", color: "bg-emerald-600" },
  { value: "rejected", label: "Rejected", color: "bg-zinc-500" },
];

export function CareerApplicationDetailModal({
  application,
  open,
  onClose,
  onUpdate,
}: CareerApplicationDetailModalProps) {
  const [newNote, setNewNote] = useState("");
  const updateStatus = useUpdateApplicationStatus();
  const addNote = useAddApplicationNote();
  const { data: notes, refetch: refetchNotes } = useApplicationNotes(application?.id || "");

  if (!application) return null;

  const { applicant, availability, role_specific, consents } = application;

  const handleStatusChange = async (newStatus: CareerApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: application.id,
        status: newStatus,
        previousStatus: application.status,
      });
      onUpdate();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote.mutateAsync({
        applicationId: application.id,
        content: newNote.trim(),
      });
      setNewNote("");
      refetchNotes();
      toast.success("Note added");
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderRoleSpecificFields = () => {
    if (!role_specific || Object.keys(role_specific).length === 0) {
      return <p className="text-zinc-400 text-sm">No role-specific information provided.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(role_specific).map(([key, value]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .replace(/_/g, " ");

          let displayValue: string;
          if (Array.isArray(value)) {
            displayValue = value.join(", ");
          } else if (typeof value === "boolean") {
            displayValue = value ? "Yes" : "No";
          } else if (value === null || value === undefined) {
            displayValue = "Not provided";
          } else {
            displayValue = String(value);
          }

          return (
            <div key={key} className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">{formattedKey}</p>
              <p className="text-sm text-white">{displayValue}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-900 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl text-white">
                {applicant.firstName} {applicant.lastName}
                {applicant.preferredName && (
                  <span className="text-zinc-400 text-base ml-2">
                    ({applicant.preferredName})
                  </span>
                )}
              </DialogTitle>
              <Badge className="capitalize">{application.team}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="text-zinc-400 hover:text-white"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-zinc-400">{application.role}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-sm text-zinc-400">
              Applied {format(new Date(application.created_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-500">ID: {application.id.slice(0, 8)}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Status & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">Status:</span>
                <Select
                  value={application.status}
                  onValueChange={(value) => handleStatusChange(value as CareerApplicationStatus)}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                >
                  <a
                    href={(() => {
                      const subject = encodeURIComponent(
                        `A-Z Enterprises Application – ${application.role} – ${applicant.firstName} ${applicant.lastName}`
                      );
                      const body = encodeURIComponent(
                        `Hi ${applicant.firstName},\n\nThanks for applying for ${application.role} at A-Z Enterprises.\n\nWe'd like to set up a quick call/interview. What times work best for you?\n\n— A-Z Enterprises Team`
                      );
                      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(applicant.email)}&su=${subject}&body=${body}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                >
                  <a href={`tel:${applicant.phone}`}>
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </a>
                </Button>
              </div>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["applicant", "experience", "availability", "role-specific", "consents", "notes"]}
              className="space-y-4"
            >
              {/* Applicant Info */}
              <AccordionItem value="applicant" className="border border-zinc-800 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-400" />
                    Applicant Information
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-zinc-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Full Name</p>
                      <p className="text-white">
                        {applicant.firstName} {applicant.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Email</p>
                      <a href={`mailto:${applicant.email}`} className="text-amber-400 hover:underline">
                        {applicant.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Phone</p>
                      <a href={`tel:${applicant.phone}`} className="text-amber-400 hover:underline">
                        {applicant.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Address</p>
                      <p className="text-white">
                        {applicant.address.street}, {applicant.address.city},{" "}
                        {applicant.address.state} {applicant.address.zip}
                      </p>
                    </div>
                    {applicant.dateOfBirth && (
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Date of Birth</p>
                        <p className="text-white">{applicant.dateOfBirth}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Authorized to Work</p>
                      <Badge variant={applicant.authorizedToWork ? "default" : "destructive"}>
                        {applicant.authorizedToWork ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Requires Sponsorship</p>
                      <Badge variant={applicant.requiresSponsorship ? "secondary" : "default"}>
                        {applicant.requiresSponsorship ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Experience & Preferences */}
              <AccordionItem value="experience" className="border border-zinc-800 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-amber-400" />
                    Experience & Preferences
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-zinc-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Years of Experience</p>
                      <p className="text-white">{applicant.yearsExperience}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Employment Type</p>
                      <Badge variant="outline" className="capitalize">
                        {applicant.employmentType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Desired Start Date</p>
                      <p className="text-white">{applicant.desiredStartDate}</p>
                    </div>
                    {applicant.currentEmployer && (
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Current Employer</p>
                        <p className="text-white">{applicant.currentEmployer}</p>
                      </div>
                    )}
                    {applicant.compensationExpectations && (
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Compensation Expectations</p>
                        <p className="text-white">{applicant.compensationExpectations}</p>
                      </div>
                    )}
                    {applicant.referralSource && (
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Referral Source</p>
                        <p className="text-white">{applicant.referralSource}</p>
                      </div>
                    )}
                  </div>
                  {applicant.preferredLocations && applicant.preferredLocations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-400 mb-2">Preferred Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {applicant.preferredLocations.map((loc) => (
                          <Badge key={loc} variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {applicant.schedulePreference && applicant.schedulePreference.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-400 mb-2">Schedule Preference</p>
                      <div className="flex flex-wrap gap-2">
                        {applicant.schedulePreference.map((pref) => (
                          <Badge key={pref} variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {applicant.resumeLink && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-400 mb-2">Resume</p>
                      <Button variant="outline" size="sm" asChild className="border-zinc-700">
                        <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Resume
                        </a>
                      </Button>
                    </div>
                  )}
                  <Separator className="my-4 bg-zinc-800" />
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Introduction</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{applicant.intro}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Availability */}
              {availability && (
                <AccordionItem value="availability" className="border border-zinc-800 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      Availability
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-zinc-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-400 mb-2">Days Available</p>
                        <div className="flex flex-wrap gap-2">
                          {availability.daysAvailable?.map((day) => (
                            <Badge key={day} variant="secondary">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 mb-2">Time Blocks</p>
                        <div className="flex flex-wrap gap-2">
                          {availability.timeBlocks?.map((block) => (
                            <Badge key={block} variant="outline">
                              {block}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Earliest Start Date</p>
                        <p className="text-white">{availability.earliestStartDate}</p>
                      </div>
                      {availability.upcomingTimeOff && (
                        <div>
                          <p className="text-xs text-zinc-400 mb-1">Upcoming Time Off</p>
                          <p className="text-white">{availability.upcomingTimeOff}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Role-Specific */}
              <AccordionItem value="role-specific" className="border border-zinc-800 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Role-Specific Information ({application.role})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-zinc-900">
                  {renderRoleSpecificFields()}
                </AccordionContent>
              </AccordionItem>

              {/* Consents */}
              <AccordionItem value="consents" className="border border-zinc-800 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Consents & Agreements
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded border ${
                          consents.certifyTruthful
                            ? "bg-green-500 border-green-500"
                            : "border-zinc-600"
                        }`}
                      >
                        {consents.certifyTruthful && (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                            <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-zinc-300">Certifies information is truthful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded border ${
                          consents.agreeToContact
                            ? "bg-green-500 border-green-500"
                            : "border-zinc-600"
                        }`}
                      >
                        {consents.agreeToContact && (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                            <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-zinc-300">Agrees to be contacted</span>
                    </div>
                    {consents.backgroundCheckConsent !== undefined && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded border ${
                            consents.backgroundCheckConsent
                              ? "bg-green-500 border-green-500"
                              : "border-zinc-600"
                          }`}
                        >
                          {consents.backgroundCheckConsent && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                              <path
                                fill="currentColor"
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-zinc-300">Consents to background check</span>
                      </div>
                    )}
                    <Separator className="my-3 bg-zinc-800" />
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Signature</p>
                      <p className="text-white font-medium">{consents.signatureFullName}</p>
                      <p className="text-xs text-zinc-500">Signed on {consents.signatureDate}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Internal Notes */}
              <AccordionItem value="notes" className="border border-zinc-800 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-400" />
                    Internal Notes ({notes?.length || 0})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-zinc-900">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add an internal note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                      />
                    </div>
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addNote.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      Add Note
                    </Button>

                    {notes && notes.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700"
                          >
                            <p className="text-sm text-white whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-zinc-500 mt-2">
                              {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
