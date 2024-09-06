import { HeroActions } from "./HeroActions/HeroActions";
import { ClientHero } from "./ClientHero";

export const Hero = () => {
  return (
       <main className="flex space-y-16 relative z-10 w-full">
      <ClientHero/>
      <HeroActions />
      </main>
  );
};