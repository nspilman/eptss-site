import * as styles from "./ActionSuccessPanel.css";
import Image from "next/image";
import Link from "next/link";
import { roundedCorners } from "styles/theme.css";

interface Props {
  text: {
    header: string;
    body: string;
    thankyou: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

export const ActionSuccessPanel = ({
  text: { header, body, thankyou },
  image: { src, alt },
}: Props) => {
  return (
    <div className={styles.body}>
      <h2>{header}</h2>
      <p>{body}</p>
      <Image
        className={roundedCorners}
        src={src}
        alt={alt}
        width={500}
        height={500}
      />
      <p>{thankyou}</p>
      <Link href="/#listen">
        <button>Home</button>
      </Link>
    </div>
  );
};
