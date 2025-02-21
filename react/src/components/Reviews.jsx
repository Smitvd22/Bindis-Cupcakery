import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function Reviews() {
  const [showAll, setShowAll] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHomepageReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/reviews/homepage')
        const formattedReviews = response.data.map(review => ({
          id: review.review_id,
          name: review.user_name,
          rating: review.rating,
          text: review.comment,
          productName: review.product_name,
          date: new Date(review.created_at).toLocaleDateString()
        }))
        setReviews(formattedReviews)
        setLoading(false)
      } catch (err) {
        setError('Failed to load reviews')
        setLoading(false)
      }
    }

    fetchHomepageReviews()
  }, [])

  // Show only 6 reviews initially, or all reviews if "See All Reviews" is clicked
  const visibleReviews = showAll ? reviews : reviews.slice(0, 6)

  if (loading) {
    return (
      <section className="py-16 bg-pink-50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          Loading reviews...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-pink-50">
        <div className="container mx-auto px-4 max-w-5xl text-center text-red-600">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-pink-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Customer Reviews</h2>
        <div className="w-24 h-1 bg-pink-500 mx-auto rounded-full mb-6"></div>
        
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600">No reviews to display at the moment.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {visibleReviews.map((review) => (
                <motion.div
                  key={review.id}
                  className="bg-[#d9d9d9] rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3 leading-relaxed">{review.text}</p>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.productName}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {reviews.length > 6 && (
              <div className="flex justify-end">
                <motion.button
                  className="px-6 py-2 bg-[#bfc8ed] text-gray-800 border border-black rounded-md hover:bg-[#6c79b0] hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "See All Reviews"}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}