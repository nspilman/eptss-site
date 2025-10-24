import { Navigation } from "@/enum/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@eptss/ui";

interface Props {
  text: {
    header: string;
    body: string;
    thankyou: string;
  };
  image: {
    src: string;
    alt: string;
    blurSrc?: string;
  };
  action?: "signups";
  roundId: number;
}

export const ActionSuccessPanel = ({
  text: { header, body, thankyou },
  image: { src, alt, blurSrc },
  action,
  roundId,
}: Props) => {
  return (
    <Card gradient className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{header}</CardTitle>
        <p className="text-md font-light text-gray-300 text-center">
          {body}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            placeholder={"blur"}
            blurDataURL={blurSrc}
          />
        </div>
        <p className="text-md font-light text-gray-300 text-center">
          {thankyou}
        </p>
        <div className="flex justify-center">
          <Link href={action === "signups" ? Navigation.Voting : "/#rounds"}>
            <Button>
              {action === "signups" && roundId === 21 ? "Voting" : "Home"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
