import { forceCollide, type SimulationNodeDatum } from 'd3-force';
import type { ConfigureForcesOptions, NodeRuntime } from './graphForceTypes';
import { getCollisionRadius } from './graphForceUtils';

export function configureForces({
  fg,
  nodeCount,
  reducedEffects = false,
}: ConfigureForcesOptions): void {
  const isSparse = nodeCount <= 10;
  const isMedium = nodeCount <= 50;

  const chargeStrength = reducedEffects
    ? isSparse
      ? -320
      : isMedium
        ? -200
        : -110
    : isSparse
      ? -400
      : isMedium
        ? -250
        : -150;

  const linkDistance = reducedEffects
    ? isSparse
      ? 140
      : isMedium
        ? 84
        : 54
    : isSparse
      ? 160
      : isMedium
        ? 90
        : 60;

  fg.d3Force('charge')?.strength(chargeStrength).distanceMax(600);
  fg.d3Force('link')?.distance(linkDistance).strength(isSparse ? 0.3 : 0.5);
  fg.d3Force(
    'collision',
    forceCollide()
      .radius((datum: SimulationNodeDatum) => {
        const node = datum as NodeRuntime;
        const padding = isSparse ? (reducedEffects ? 16 : 20) : reducedEffects ? 6 : 8;
        return getCollisionRadius(node) + padding;
      })
      .strength(reducedEffects ? 0.7 : 0.85)
      .iterations(reducedEffects ? 1 : 2)
  );
  fg
    .d3Force('center')
    ?.strength(reducedEffects ? (isSparse ? 0.045 : 0.03) : isSparse ? 0.05 : 0.02);
  fg.d3ReheatSimulation();
}
