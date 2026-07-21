import { motion } from "motion/react";
import { MapPin, Navigation, Compass, Calendar } from "lucide-react";

export default function WeddingVenue() {
  const mapEmbedUrl = "https://maps.google.com/maps?q=Royal%20club%20mohamed%20aly&hl=en&z=15&output=embed";
  const mapDirectionsUrl = "https://maps.app.goo.gl/wn5VsTSu8vfnTpfn8";

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      
      {/* Decorative floral background element */}
      <div className="absolute -left-16 top-1/4 w-64 h-64 border border-[#C6A96B]/10 rounded-full pointer-events-none" />
      <div className="absolute -right-16 bottom-1/4 w-80 h-80 border border-[#C6A96B]/5 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            The Location
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            The Wedding Venue
          </h2>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        {/* Venue Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Card Left: Information */}
          <motion.div
            className="lg:col-span-5 flex flex-col justify-between glass-card border border-[#C6A96B]/20 rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Subtle luxury details */}
            <div className="absolute inset-2 border border-[#C6A96B]/5 rounded-xl pointer-events-none" />

            <div className="space-y-6">
              <span className="font-serif text-[10px] tracking-[0.25em] text-[#C6A96B] uppercase block mb-1">
                Palace Wedding
              </span>
              
              <h3 className="font-serif text-2xl md:text-3xl text-[#2D2D2D] leading-tight font-light">
                Royal Mohamed Ali Club
              </h3>
              
              <div className="h-[1px] w-12 bg-[#C6A96B]/20" />

              <p className="font-sans text-xs text-[#2D2D2D]/75 leading-relaxed">
                Set on the majestic banks of the Nile, the Royal Mohamed Ali Club combines royal 19th-century aesthetics with elegant landscape architectures. A pristine, breathtaking setting for Tasneem & Yehia's romantic celebration.
              </p>

              {/* Specific details */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C6A96B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm text-[#2D2D2D] font-medium">Address</h4>
                    <p className="font-sans text-[11px] text-[#2D2D2D]/70 mt-0.5">
                      Al Monib, Giza Road, Nile Banks, Giza Governorate, Egypt
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-[#C6A96B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm text-[#2D2D2D] font-medium">Reception Area</h4>
                    <p className="font-sans text-[11px] text-[#2D2D2D]/70 mt-0.5">
                      The Grand Royal Pavilion Courtyard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 border border-[#C6A96B] hover:bg-[#C6A96B] text-[#C6A96B] hover:text-white transition-all duration-300 rounded-full font-serif text-xs uppercase tracking-widest"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions
              </a>
            </div>
          </motion.div>

          {/* Card Right: Interactive Map */}
          <motion.div
            className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#C6A96B]/20 shadow-xl relative min-h-[350px] lg:min-h-full"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Embedded map */}
            <iframe
              src={mapEmbedUrl}
              className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
