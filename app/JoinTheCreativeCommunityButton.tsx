import { Button } from "@/components/ui/button"
import { Navigation } from "@/enum/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

export const JoinTheCreativeCommunity = () => {

    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href={Navigation.Waitlist}>
        <Button className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] text-lg py-6 px-10 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl">
          Get notified about the next round
        </Button>
        </Link>
      </motion.div>
    )
}