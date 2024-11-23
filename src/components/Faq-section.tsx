import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FAQSection = () => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null
  );

  const toggleQuestion = (index: number) => {
    setActiveQuestionIndex(activeQuestionIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'Comment puis-je ajouter une boîte à livres ?',
      answer: 'Connectez-vous à votre compte, cliquez sur "Ajouter une boîte" et suivez les étapes pour l\'enregistrer.'
    },
    {
      question: "Puis-je modifier une boîte après l'avoir ajoutée ?",
      answer: 'Oui, vous pouvez modifier ou supprimer les boîtes que vous avez ajoutées à tout moment depuis votre tableau de bord.'
    },
    {
      question: "Comment signaler un problème ou une boîte qui n'existe plus ?",
      answer: [
        'Utilisez le bouton "Signaler" sur la page de la boîte pour nous informer, et notre équipe contactera le propriétaire pour prendre les mesures nécessaires.',
        'Cette option est uniquement disponible pour les membres Premium !'
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-primary to-primary-dark">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Questions fréquentes
        </h2>
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white backdrop-blur-sm rounded-lg p-6 cursor-pointer transition ${
                activeQuestionIndex === index ? 'bg-white' : ''
              }`}
              onClick={() => toggleQuestion(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-primary">
                  {faq.question}
                </h3>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: activeQuestionIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <FiChevronDown className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
              <motion.div
                className="overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={
                  activeQuestionIndex === index
                    ? { opacity: 1, height: 'auto' }
                    : { opacity: 0, height: 0 }
                }
                transition={{ duration: 0.5, ease: [0.08, 0.62, 0.23, 0.98] }}
              >
                {Array.isArray(faq.answer) ? (
                  <div className="mt-4 space-y-2">
                    <span className="block text-sm text-gray-600">{faq.answer[0]}</span>
                    <span className="block text-sm font-bold text-red-500">{faq.answer[1]}</span>
                  </div>
                ) : (
                  <span className="block mt-4 text-sm text-gray-600">{faq.answer}</span>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;