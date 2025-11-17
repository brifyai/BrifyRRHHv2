import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/flip-cards.css';

/**
 * Componente FlipCard reutilizable con framer-motion
 * Soluciona los problemas de conflictos entre implementaciones CSS
 */
const FlipCard = ({
  front,
  back,
  isFlipped = false,
  onFlip,
  className = '',
  flipDuration = 0.8,
  perspective = 1000
}) => {
  const handleFlip = () => {
    if (onFlip) {
      onFlip(!isFlipped);
    }
  };

  return (
    <div 
      className={`flip-card ${className}`}
      style={{ perspective: `${perspective}px` }}
      onClick={handleFlip}
    >
      <motion.div
        className="flip-card-inner"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: flipDuration, 
          ease: "easeInOut" 
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="flip-card-front-content">
            {front}
          </div>
        </div>
        
        {/* Back Side */}
        <div 
          className="flip-card-back"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flip-card-back-content">
            {back}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;