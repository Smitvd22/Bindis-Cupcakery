import React from "react";
import { motion } from "framer-motion";
import { Heart, Cake, LeafyGreen, ChefHat } from "lucide-react";

const FeatureCard = ({ feature, index }) => (
  <motion.div
    className="relative overflow-hidden bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5,
      delay: index * 0.1,
      ease: "easeOut"
    }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
  >
    <motion.div 
      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-pink-500"
      initial={{ width: 0 }}
      whileInView={{ width: "100%" }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
    />
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
      <motion.div 
        className="bg-pink-100 p-4 rounded-lg text-pink-500"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {feature.icon}
      </motion.div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 text-lg">
          {feature.title}
        </h3>
        <p className="text-gray-600">
          {feature.description}
        </p>
      </div>
    </div>
  </motion.div>
);

export default function AboutUs() {
  const features = [
    {
      icon: <LeafyGreen className="w-7 h-7" />,
      title: "100% Vegetarian",
      description: "Pure vegetarian delights crafted with care and love for nature"
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Preservative-Free",
      description: "Fresh, homemade goodness in every bite, just like mother's kitchen"
    },
    {
      icon: <Cake className="w-7 h-7" />,
      title: "Variety of Treats",
      description: "From cupcakes to ice creams, explore our diverse range of sweet delights"
    },
    {
      icon: <ChefHat className="w-7 h-7" />,
      title: "Eggless",
      description: "Baked with love, completely egg-free for everyone to enjoy and share"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            Our Sweet Story
          </motion.h2>
          
          <motion.div 
            className="w-32 h-1 bg-gradient-to-r from-pink-300 to-pink-500 mx-auto rounded-full mb-8"
            initial={{ width: 0 }}
            whileInView={{ width: "8rem" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          />

          <motion.p
            className="text-gray-700 leading-relaxed text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Welcome to Bindi's Cupcakery, where sweetness meets artistry. Every creation
            that leaves our cloud kitchen is a testament to our passion for baking and our
            commitment to quality. We take pride in crafting preservative-free, vegetarian
            desserts that bring joy to every celebration.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Find Us Here</h3>
          <motion.div 
            className="w-32 h-1 bg-gradient-to-r from-pink-300 to-pink-500 mx-auto rounded-full mb-8"
            initial={{ width: 0 }}
            whileInView={{ width: "8rem" }}
            transition={{ delay: 1, duration: 0.8 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1779.7708922126694!2d72.79214347884053!3d21.174841846525148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04ddd6c47ac89%3A0x91125e2f18dbb796!2s24%20Carats%20Mithai%20Magic!5e0!3m2!1sen!2sin!4v1739715320892!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}