import { useMemo, type CSSProperties } from 'react';

const PARTICLE_COUNT = 20;
const SPARK_CLASSES = ['spark-accent', 'spark-accent2', 'spark-warn'];

interface ParticleStyle extends CSSProperties {
  '--angle': string;
  '--distance': string;
  '--delay': string;
}

export function Fireworks() {
  // randomized once per mount (not on every render) so the burst doesn't reshuffle mid-animation
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        angle: Math.random() * 360,
        distance: 34 + Math.random() * 34,
        delay: Math.random() * 0.25,
      })),
    []
  );

  return (
    <span className="fireworks" aria-hidden="true">
      {particles.map((p, i) => {
        const style: ParticleStyle = {
          '--angle': `${p.angle}deg`,
          '--distance': `${p.distance}px`,
          '--delay': `${p.delay}s`,
        };
        return <span key={i} className={`firework-particle ${SPARK_CLASSES[i % SPARK_CLASSES.length]}`} style={style} />;
      })}
    </span>
  );
}
