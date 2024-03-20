import { Navigation } from "components/enum/navigation";
import Image from "next/image";
import Link from "next/link";

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
    <div className="flex flex-col items-center">
      <h1 className="font-fraunces text-white font-bold text-center">
        {header}
      </h1>
      <span className="text-md font-light font-roboto text-white text-center my-4">
        {body}
      </span>
      <Image
        src={src}
        alt={alt}
        width={875}
        height={500}
        placeholder={"blur"}
        blurDataURL={blurSrc}
      />
      <span className="text-md font-light font-roboto text-white text-center my-4">
        {thankyou}
      </span>
      <Link href={action === "signups" ? Navigation.Voting : "/#rounds"}>
        <button className="btn-main">
          {action === "signups" && roundId === 21 ? "Voting" : "Home"}
        </button>
      </Link>
    </div>
  );
};
