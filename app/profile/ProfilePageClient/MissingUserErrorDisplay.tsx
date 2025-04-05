import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";

export const MissingUserErrorDisplay = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">User Profile</CardTitle>
          <CardDescription className="text-accent-secondary">Unable to load user data</CardDescription>
        </CardHeader>
        <CardContent>
          <p>There was an error loading your profile. Please try again later.</p>
        </CardContent>
      </Card>
    </div>
  );
};