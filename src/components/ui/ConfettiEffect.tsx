import React, { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#E8B4BC', '#5E2E53', '#D89AA4', '#744866', '#C67D8A'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);
    }
  }, [trigger, onComplete]);

  if (!trigger || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;