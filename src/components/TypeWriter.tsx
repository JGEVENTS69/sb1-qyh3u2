import React, { useState, useEffect } from 'react';

interface TypeWriterProps {
  words: string[];
  speed?: number;
  delay?: number;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ 
  words, 
  speed = 100,
  delay = 2000 
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentWord = words[currentWordIndex];
      
      if (!isDeleting) {
        // Écriture
        if (currentText !== currentWord) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          // Attendre avant de commencer à effacer
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        // Effacement
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        } else {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, speed, delay]);

  return (
    <span className="inline-block min-w-[20px]">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypeWriter;