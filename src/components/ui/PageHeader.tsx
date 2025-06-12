import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  bgImage?: string;
  breadcrumbs?: { label: string; path: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  bgImage = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=2000&q=80",
  breadcrumbs = [],
}) => {
  return (
    <div className="relative bg-gradient-to-r from-vet-blue/90 to-vet-teal/90 text-white py-20 md:py-28">
      {/* Background Image with Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 0.3, scale: 1.1 }}
        transition={{
          duration: 8,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></motion.div>

      <div className="container-custom relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm mb-6 text-white/80"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-white/60" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </motion.div>
        )}

        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2"
          >
            <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium inline-block">
              Koney's Veterinary Hospital
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl opacity-90"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
