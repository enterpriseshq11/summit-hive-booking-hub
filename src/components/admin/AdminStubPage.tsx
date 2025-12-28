import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AdminStubPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function AdminStubPage({ title, description, icon }: AdminStubPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            {icon || <AlertCircle className="h-5 w-5 text-muted-foreground" />}
            <CardTitle className="text-lg">Phase 2 Stub</CardTitle>
          </div>
          <CardDescription>
            This page is a placeholder. Full functionality will be implemented in Phase 3+.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data loaded in Phase 2. The admin interface structure and navigation 
            are in place to support future development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
