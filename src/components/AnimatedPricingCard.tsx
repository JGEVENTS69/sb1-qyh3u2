import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, LucideIcon } from 'lucide-react';
import Button from './Button';

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  icon: LucideIcon;
  isPopular?: boolean;
  onSelect: () => void;
  current?: boolean;
  index: number;
}

const AnimatedPricingCard = ({
  title,
  price,
  features,
  icon: Icon,
  isPopular,
  onSelect,
  current,
  index,
}: PricingCardProps) => {
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
        delay: index * 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative bg-white rounded-2xl shadow-lg ${
        isPopular ? 'ring-2 ring-primary' : ''
      }`}
    >
      {isPopular && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative -top-4 flex justify-center"
        >
          <span className="bg-primary text-white px-4 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
            Top Populaire
          </span>
        </motion.div>
      )}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold">{price}</span>
              {price !== 'Gratuit' && (
                <span className="text-gray-500 ml-1 text-sm sm:text-base">
                  /mois
                </span>
              )}
            </div>
          </div>
          <Icon
            className={`h-6 w-6 sm:h-8 sm:w-8 ${
              isPopular ? 'text-yellow-500' : 'text-primary'
            }`}
          />
        </div>
        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{
                duration: 0.4,
                delay: index * 0.2 + idx * 0.1,
              }}
              className="flex items-start"
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-600">
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>
        <Button
          onClick={onSelect}
          variant={isPopular ? 'primary' : 'secondary'}
          className="w-full text-sm sm:text-base"
          disabled={current}
        >
          {current ? 'Plan actuel' : 'Sélectionner'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AnimatedPricingCard;
