import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, Plug, Globe, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const BUSINESS_UNITS = [
  { name: "The Summit", intake: "/intake/summit", admin: "/admin/business/summit/leads" },
  { name: "Restoration Lounge (Spa)", intake: "/book-spa", admin: "/admin/business/spa/leads" },
  { name: "A-Z Total Fitness", intake: "/join-fitness", admin: "/admin/business/fitness/memberships" },
  { name: "The Hive", intake: "/the-hive", admin: "/admin/business/hive/office-listings" },
  { name: "Voice Vault", intake: "/book-voice-vault", admin: "/admin/business/voice-vault/bookings" },
  { name: "Mobile Homes", intake: "/intake/mobile-homes", admin: "/admin/business/mobile-homes/inventory" },
  { name: "Elevated by Elyse", intake: "/shop/elevated-by-elyse", admin: "/admin/business/elevated-by-elyse/leads" },
];

const TEAM = [
  { name: "Dylan Legge", role: "Owner", access: "Full system access, all settings" },
  { name: "Victoria Jackson", role: "Operations Manager", access: "Command Center, Sales, Operations, Revenue, Businesses" },
  { name: "Rose", role: "Head of Operations", access: "Command Center, Sales, Operations, Businesses (read)" },
  { name: "Elyse Legge", role: "Marketing Lead", access: "Sales, Marketing, Elevated by Elyse, Revenue (view only)" },
  { name: "Kae", role: "Ads Lead", access: "Dashboard, Marketing, Lead source data" },
  { name: "Mark Leugers", role: "Sales & Acquisitions", access: "Global Sales, Summit, Mobile Homes" },
  { name: "Nasiya", role: "Spa Lead", access: "Own schedule, Spa business unit data" },
];

const INTEGRATIONS = [
  { name: "Stripe", status: "Connected", desc: "Payment processing and revenue automation" },
  { name: "GoHighLevel", status: "Connected", desc: "Pipeline sync and marketing automation" },
  { name: "Resend", status: "Connected", desc: "Transactional email delivery" },
  { name: "PandaDoc", status: "Configured", desc: "Contract and document signing" },
  { name: "Facebook Ads", status: "Configured", desc: "Ad spend and lead tracking" },
  { name: "Google Ads", status: "Configured", desc: "Ad spend and lead tracking" },
  { name: "MH Connect", status: "Planned", desc: "Mobile home marketplace platform" },
];

const PUBLIC_PAGES = [
  { label: "Home", url: "/" },
  { label: "Booking Hub", url: "/booking" },
  { label: "Book Summit Event", url: "/book-summit" },
  { label: "Book Spa Service", url: "/book-spa" },
  { label: "Book Voice Vault", url: "/book-voice-vault" },
  { label: "Join Fitness", url: "/join-fitness" },
  { label: "The Hive", url: "/the-hive" },
  { label: "Coworking Offices", url: "/coworking/offices" },
  { label: "Gift Cards", url: "/gift-cards" },
  { label: "Promotions", url: "/promotions" },
  { label: "Dopamine Drop", url: "/dopamine-drop" },
  { label: "Careers", url: "/careers" },
  { label: "Shop", url: "/shop" },
  { label: "VIP", url: "/vip" },
  { label: "Cadence Builder", url: "/admin/settings/cadences", internal: true },
  { label: "MH Connect", url: "/admin/business/mobile-homes/mh-connect", internal: true },
];

export default function PlatformGuide() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Guide</h1>
          <p className="text-zinc-400">Living documentation for A-Z Command Platform</p>
        </div>

        {/* Platform Overview */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-400" /> Platform Overview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">A-Z Command is the internal operations platform for A-Z Enterprises. It manages leads, bookings, revenue, commissions, team performance, and integrations across all 7 business units. The platform automates Stripe payment processing, GHL pipeline sync, PandaDoc contract workflows, automated follow-up cadences, and provides real-time dashboards for every team member.</p>
          </CardContent>
        </Card>

        {/* Business Units */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-400" /> Business Units</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-zinc-400">Unit</TableHead>
                <TableHead className="text-zinc-400">Intake / Public Page</TableHead>
                <TableHead className="text-zinc-400">Admin Page</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {BUSINESS_UNITS.map((u) => (
                  <TableRow key={u.name}>
                    <TableCell className="text-zinc-200 font-medium">{u.name}</TableCell>
                    <TableCell><Link to={u.intake} className="text-amber-400 hover:underline text-sm">{u.intake}</Link></TableCell>
                    <TableCell><Link to={u.admin} className="text-amber-400 hover:underline text-sm">{u.admin}</Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Team Access */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5 text-amber-400" /> Team Access Guide</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-zinc-400">Team Member</TableHead>
                <TableHead className="text-zinc-400">Role</TableHead>
                <TableHead className="text-zinc-400">Access Scope</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {TEAM.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="text-zinc-200 font-medium">{t.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs border-zinc-700">{t.role}</Badge></TableCell>
                    <TableCell className="text-zinc-400 text-sm">{t.access}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Plug className="h-5 w-5 text-amber-400" /> Integration Status</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTEGRATIONS.map((i) => (
                <div key={i.name} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{i.name}</p>
                    <p className="text-xs text-zinc-500">{i.desc}</p>
                  </div>
                  <Badge className={i.status === "Connected" ? "bg-green-500/20 text-green-400" : i.status === "Planned" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}>
                    {i.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edge Functions & Error Log */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><ExternalLink className="h-5 w-5 text-amber-400" /> Edge Function Directory</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-zinc-300">The platform runs 40+ backend functions for payment processing, notifications, pipeline automation, and scheduled tasks.</p>
            <Link to="/admin/settings/error-log" className="text-amber-400 hover:underline text-sm inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> View Error Log
            </Link>
          </CardContent>
        </Card>

        {/* Key URLs */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Globe className="h-5 w-5 text-amber-400" /> Key URLs</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {PUBLIC_PAGES.map((p) => (
                <div key={p.url} className="flex items-center justify-between py-1.5 px-3 bg-zinc-800 rounded text-sm">
                  <span className="text-zinc-300">{p.label}</span>
                  <Link to={p.url} className="text-amber-400 hover:underline text-xs">{p.url}</Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
