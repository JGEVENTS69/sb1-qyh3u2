import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LucideIcon } from 'lucide-react';

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  index: number;
}

const AnimatedFeatureCard = ({
  icon: Icon,
  title,
  description,
  image,
  index,
}: AnimatedFeatureCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-105 group relative"
    >
      {/* Image avec l'icône placée au-dessus */}
      <div className="relative h-48 sm:h-56 md:h-48 lg:h-56 overflow-hidden">
        {/* Icône au-dessus de l'image */}
        <div className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md z-10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="mb-0.5 text-xl sm:text-xl font-semibold text-black">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default AnimatedFeatureCard;
