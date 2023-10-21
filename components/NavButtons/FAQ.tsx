import Link from "next/link";
import { Navigation } from "components/enum/navigation";
import Button from "components/shared/Tailwind_Btn/TwButton";

export const FAQButton = () => (
<Button href={Navigation.FAQ} title="FAQ" />
);
