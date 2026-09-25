import { useEffect, useRef } from 'react';

const COLORS = {
  dish: '#17221f',
  dishInner: '#1b2a25',
  ring: '#345047',
  ringBright: '#5b8c7a',
  grid: '#223a33',
  pale: '#d5d9c9',
  mid: '#9eb6a1',
  dark: '#c9825c',
  selected: '#e4b363',
  text: '#edf3ef',
};

function getDisplayPosition(organism, time, reducedMotion) {
  if (reducedMotion) return organism.position;
  const phase = organism.id * 1.618 + organism.direction;
  const drift = Math.min(0.035, organism.phenotype.speed / 2800);
  return {
    x: Math.max(0.04, Math.min(0.96, organism.position.x + Math.sin(time * 0.00055 * (0.4 + organism.phenotype.speed / 100) + phase) * drift)),
    y: Math.max(0.04, Math.min(0.96, organism.position.y + Math.cos(time * 0.00047 * (0.4 + organism.phenotype.speed / 100) + phase) * drift)),
  };
}

function organismColor(pigmentation) {
  if (pigmentation >= 70) return COLORS.dark;
  if (pigmentation >= 50) return '#b59673';
  return COLORS.pale;
}

export default function PetriDish({ snapshot, selectedId, onSelect }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const positionsRef = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (time) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) return;
      const timeValue = reducedMotion ? 0 : time;
      context.clearRect(0, 0, width, height);
      context.fillStyle = COLORS.dish;
      context.fillRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      context.strokeStyle = COLORS.grid;
      context.lineWidth = 1;
      for (let index = -4; index <= 4; index += 1) {
        context.beginPath();
        context.moveTo(index * 34, -height / 2);
        context.lineTo(index * 34, height / 2);
        context.stroke();
        context.beginPath();
        context.moveTo(-width / 2, index * 34);
        context.lineTo(width / 2, index * 34);
        context.stroke();
      }
      context.strokeStyle = COLORS.ring;
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(0, 0, Math.min(width, height) * 0.43, Math.min(width, height) * 0.35, 0, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = COLORS.ringBright;
      context.lineWidth = 1.5;
      context.beginPath();
      context.ellipse(0, 0, Math.min(width, height) * 0.36, Math.min(width, height) * 0.28, 0, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      const positions = new Map();
      for (const organism of snapshot.population) {
        const position = getDisplayPosition(organism, timeValue, reducedMotion);
        const x = position.x * width;
        const y = position.y * height;
        positions.set(organism.id, { x, y });
        const radius = 3.2 + organism.phenotype.size / 28;
        const color = organismColor(organism.phenotype.pigmentation);
        context.save();
        context.translate(x, y);
        context.rotate(organism.direction + timeValue * 0.0002 * (organism.phenotype.speed / 100));
        context.fillStyle = color;
        context.strokeStyle = organism.id === selectedId ? COLORS.selected : COLORS.dish;
        context.lineWidth = organism.id === selectedId ? 2.5 : 1;
        context.beginPath();
        context.ellipse(0, 0, radius * 1.25, radius * 0.72, 0, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        if (organism.id === selectedId) {
          context.strokeStyle = COLORS.selected;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(0, 0, radius + 5, 0, Math.PI * 2);
          context.stroke();
        }
        context.restore();
        if (organism.state.energy < 0.45) {
          context.strokeStyle = COLORS.selected;
          context.lineWidth = 1.5;
          context.beginPath();
          context.arc(x, y, radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * organism.state.energy);
          context.stroke();
        }
      }
      positionsRef.current = positions;
      if (!reducedMotion) frameRef.current = window.requestAnimationFrame(draw);
    };
    resize();
    draw(performance.now());
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    return () => {
      observer?.disconnect();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [snapshot, selectedId]);

  const handleClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest = null;
    let nearestDistance = Infinity;
    for (const [id, position] of positionsRef.current) {
      const distance = Math.hypot(position.x - x, position.y - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = id;
      }
    }
    if (nearest && nearestDistance < 22) onSelect(nearest);
  };

  return (
    <section className="petri-module" aria-label="Virtual petri dish">
      <div className="module-heading">
        <div>
          <p className="eyebrow">LIVE FIELD / SELECTED VIEW</p>
          <h2>Petri dish</h2>
        </div>
        <div className="dish-readout">
          <span className="readout-key">N</span>
          <strong>{snapshot.population.length}</strong>
          <span>specimens</span>
        </div>
      </div>
      <div className="dish-stage">
        <canvas ref={canvasRef} className="petri-canvas" onClick={handleClick} role="img" aria-label={`Petri dish showing ${snapshot.population.length} moving organisms. Click a specimen to inspect it.`} />
        <div className="dish-crosshair" aria-hidden="true"><span /><span /></div>
        <div className="dish-corner dish-corner-tl">DISH 01 / LIVE</div>
        <div className="dish-corner dish-corner-br">CLICK A SPECIMEN</div>
        {!snapshot.population.length && <div className="empty-dish"><span className="empty-mark">Ø</span><strong>Population extinct</strong><span>Restart or change the environment to begin again.</span></div>}
      </div>
      <div className="dish-legend" aria-label="Dish legend">
        <span><i className="legend-swatch legend-swatch-pale" /> Pale</span>
        <span><i className="legend-swatch legend-swatch-dark" /> Dark</span>
        <span><i className="legend-ring" /> Selected</span>
        <span className="legend-note">Size maps to body mass · ring maps to energy</span>
      </div>
    </section>
  );
}
