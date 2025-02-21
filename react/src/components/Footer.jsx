import { Phone, MapPin, Instagram, Facebook, Clock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f0adbc] py-6">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Sweet Connect Section */}
          <div className="text-center">
            <h3 className="font-bold text-pink-600 mb-4 flex items-center gap-1 justify-center">
              <Heart className="h-3 w-3 fill-pink-600" />
              <span>Connect with us</span>
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-gray-700 justify-center">
                <Phone className="h-5 w-5 stroke-2" />
                <span>8849130189</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 justify-center">
                <MapPin className="h-5 w-5 stroke-2" />
                <span>Cloud kitchen in Parle Point, Surat</span>
              </div>
            </div>
          </div>

          {/* Social Section */}
          <div className="text-center">
            <h3 className="font-bold text-pink-600 mb-4">
              Let's Be Dessert Friends
            </h3>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/bindis_cupcakery/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-pink-600 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-7 w-7 stroke-2" />
              </a>
              <a
                href="https://www.facebook.com/bindi.malji/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-pink-600 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-7 w-7 stroke-2" />
              </a>
            </div>
          </div>

          {/* Hours Section */}
          <div className="text-center">
            <h3 className="font-bold text-pink-600 mb-4 flex items-center gap-2 justify-center">
              <Clock className="h-5 w-5 stroke-2" />
              <span>Baking Hours</span>
            </h3>
            <div className="space-y-1 text-gray-700">
              <p className="hover:text-pink-600 transition-colors">11:00 AM - 7:00 PM</p>
              <p className="text-sm">Spreading sweetness daily!</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
