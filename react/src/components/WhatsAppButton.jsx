import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PhoneIcon as WhatsApp, X } from "lucide-react"

export default function WhatsAppButton() {
  const [showQR, setShowQR] = useState(false)

  const toggleQR = () => {
    setShowQR(!showQR)
  }

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleQR}
      >
        <WhatsApp className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl w-72">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowQR(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center mt-2">
                <h3 className="text-lg font-semibold mb-4">Scan to chat with us!</h3>
                <img src=".\images\WQR.png" alt="WhatsApp QR Code" className="w-[160px] h-[160px] mx-auto" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
