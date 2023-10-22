import Link from "next/link";
import { Navigation } from "components/enum/navigation";
import Button from "components/shared/Button/Button";

export const FAQButton = () => (<Button href={Navigation.FAQ} title="FAQ" />);
