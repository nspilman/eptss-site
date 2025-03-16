import { Button } from "@/components/ui/primitives"
import { Navigation } from "@/enum/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

export const JoinTheCreativeCommunity = () => {

    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href={Navigation.Waitlist}>
        <Button variant="secondary" size="xl">
          Get notified about the next round
        </Button>
        </Link>
      </motion.div>
    )
}