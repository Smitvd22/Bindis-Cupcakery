import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }} // Start with full visibility
      animate={{ opacity: 1 }} // Keep it fully visible
      exit={{ opacity: 0 }} // Fade out when unmounting
      className="fixed inset-0 z-50 flex items-center justify-center bg-pink-50"
    >
      {/* GIF Loader */}
      <div className="w-[500px] h-[500px]"> {/* Increased size */}
        <img
          src="/images/cupcake.gif" // Replace with the path to your GIF file
          alt="Loading..."
          className="w-full h-full object-contain" // Ensure proper scaling
        />
      </div>
    </motion.div>
  );
}