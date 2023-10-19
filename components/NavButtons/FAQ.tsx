import Link from "next/link";
import { Navigation } from "components/enum/navigation";

export const FAQButton = () => (
    <Link href={Navigation.FAQ}>
      <button className=" h-10 py-2 px-4 border-2 font-bold text-white border-white bg-transparent flex items-center rounded-md
       hover:bg-white hover:text-black hover:shadow-NavShadow hover:cursor-pointer">
      FAQ
      </button>
    </Link>
);