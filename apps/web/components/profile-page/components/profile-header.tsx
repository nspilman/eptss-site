import { Button, Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from "@eptss/ui";
import { Camera, MapPin } from "lucide-react";
import { CalendarIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";

export default function ProfileHeader() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://bundui-images.netlify.app/avatars/08.png" alt="Profile" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
              <Camera />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <Badge variant="secondary">Pro Member</Badge>
            </div>
            <p className="text-muted-foreground">Senior Product Designer</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <EnvelopeClosedIcon className="size-4" />
                john.doe@example.com
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-4" />
                Joined March 2023
              </div>
            </div>
          </div>
          <Button variant="default">Edit Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
