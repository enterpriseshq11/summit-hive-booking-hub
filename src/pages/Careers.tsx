import { SEOHead } from "@/components/seo";
import { Link } from "react-router-dom";
import { Building2, Dumbbell, Sparkles, Wrench, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCareerOpenings, CareerTeam } from "@/hooks/useCareerApplications";

const teamCards: {
  team: CareerTeam;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}[] = [
  {
    team: "spa",
    title: "A-Z Restoration (Spa)",
    description: "Join our wellness team as a massage therapist, yoga instructor, esthetician, or front desk specialist.",
    icon: Sparkles,
    href: "/careers/spa",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    team: "fitness",
    title: "A-Z Total Fitness",
    description: "Help members achieve their fitness goals as a personal trainer, coach, or group fitness instructor.",
    icon: Dumbbell,
    href: "/careers/fitness",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    team: "contracting",
    title: "A-Z Contracting",
    description: "Join our contractor network for residential and commercial projects across Northwest Ohio.",
    icon: Wrench,
    href: "/careers/contracting",
    color: "bg-blue-500/10 text-blue-500",
  },
];

export default function Careers() {
  const { data: openings = [], isLoading } = useCareerOpenings();

  return (
    <>
      <SEOHead
        title="Careers at A-Z Enterprises | Join Our Team"
        description="Explore career opportunities at A-Z Enterprises. Join our spa, fitness, or contracting teams in Wapakoneta, Ohio."
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                <Building2 className="h-3 w-3 mr-1" />
                Now Hiring
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Build Your Career With A-Z Enterprises
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join a growing team that values excellence, community, and personal growth. 
                We're looking for passionate individuals to help us deliver exceptional experiences.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <a href="#choose-your-team" onClick={(e) => { e.preventDefault(); document.getElementById('choose-your-team')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Choose Your Team
                  </a>
                </Button>
                <Button asChild size="lg">
                  <a href="#open-positions" onClick={(e) => { e.preventDefault(); document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    View Open Positions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-16 container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join A-Z Enterprises?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We work with your schedule. Full-time, part-time, and contract positions available.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competitive Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn what you deserve with competitive rates, tips, and commission opportunities.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build your career with training, mentorship, and advancement paths within our businesses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Choose a Team */}
        <section id="choose-your-team" className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">Choose Your Team</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Select the team that best fits your skills and passion. Each has unique opportunities and benefits.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {teamCards.map((team) => (
                <Card key={team.team} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${team.color} flex items-center justify-center mb-4`}>
                      <team.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{team.title}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full group-hover:bg-accent group-hover:text-primary">
                      <Link to={team.href}>
                        Apply Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-16 container">
          <h2 className="text-3xl font-bold text-center mb-4">Open Positions</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Click on any position to go directly to the application form with your role pre-selected.
          </p>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading positions...</div>
          ) : openings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No specific positions posted right now.</p>
              <p className="text-sm text-muted-foreground">
                But we're always looking for talent! Choose a team above to submit a general application.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {openings.map((opening) => (
                <Card key={opening.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {opening.team}
                          </Badge>
                          {opening.employment_type && (
                            <Badge variant="secondary">{opening.employment_type}</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{opening.role}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {opening.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {opening.location}
                            </span>
                          )}
                        </div>
                        {opening.description && (
                          <p className="text-sm text-muted-foreground mt-2">{opening.description}</p>
                        )}
                      </div>
                      <Button asChild className="shrink-0">
                        <Link to={opening.apply_route || `/careers/${opening.team}`}>
                          Apply
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Team?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Take the first step toward a rewarding career. Our application process is quick and easy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/careers/spa">Apply to Spa</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/careers/fitness">Apply to Fitness</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/careers/contracting">Apply to Contracting</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
