import { useAuthModal } from "@/components/client/context/EmailAuthModalContext";
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export const JoinTheCreativeCommunity = () => {
  const { setIsOpen } = useAuthModal();

    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] text-lg py-6 px-10 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl" onClick={setIsOpen}>
          Join the Creative Community
        </Button>
      </motion.div>
    )
}