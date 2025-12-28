import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function GiftCards() {
  return (
    <div className="min-h-screen py-16">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <Gift className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Gift Cards</h1>
          <p className="text-lg text-muted-foreground">
            Give the gift of wellness, fitness, and unforgettable experiences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[50, 100, 200].map((amount) => (
            <Card key={amount} className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <CardTitle className="text-3xl">${amount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Valid at all A-Z businesses</p>
                <Button className="w-full">Purchase</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
