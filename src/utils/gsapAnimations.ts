import gsap from 'gsap';
import { PowerUpType } from '../types/game';

/**
 * GSAP-based animation suite for tactical power-up activations,
 * piece dock highlights, and grid cell propagation waves.
 */

export function animatePowerUpButton(buttonElement: HTMLElement | null) {
  if (!buttonElement) return;

  gsap.timeline()
    .to(buttonElement, {
      scale: 1.25,
      rotate: -10,
      duration: 0.15,
      ease: 'back.out(2)',
    })
    .to(buttonElement, {
      scale: 1,
      rotate: 0,
      duration: 0.25,
      ease: 'elastic.out(1, 0.4)',
    });
}

/**
 * Propagate a smooth amber shockwave across all 81 grid cells when Prism Hammer is engaged.
 */
export function animateHammerGridPropagation() {
  const cells = document.querySelectorAll('.grid-cell-tile');
  if (!cells || cells.length === 0) return;

  gsap.fromTo(
    cells,
    {
      scale: 1,
      filter: 'brightness(1)',
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    {
      scale: 1.08,
      filter: 'brightness(1.6)',
      borderColor: 'rgba(245, 158, 11, 0.8)',
      boxShadow: '0 0 16px rgba(245, 158, 11, 0.6)',
      duration: 0.28,
      stagger: {
        grid: [9, 9],
        from: 'center',
        amount: 0.38,
        ease: 'power2.out',
      },
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      clearProps: 'scale,filter,borderColor,boxShadow',
    }
  );
}

/**
 * Animate the piece dock cards flipping, glowing, and resettling when Shuffle / Reroll is triggered.
 */
export function animateDockRerollPropagation() {
  const dockCards = document.querySelectorAll('.dock-piece-card');
  if (!dockCards || dockCards.length === 0) return;

  // Staggered 3D spin and pop
  gsap.fromTo(
    dockCards,
    {
      scale: 0.75,
      opacity: 0.2,
      y: 20,
      rotateX: 60,
      filter: 'blur(3px)',
    },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 0.45,
      stagger: 0.08,
      ease: 'back.out(2)',
      clearProps: 'scale,opacity,y,rotateX,filter',
    }
  );

  // Gentle light sweep across the board to accompany reshuffle
  const board = document.getElementById('tutorial-target-board');
  if (board) {
    gsap.fromTo(
      board,
      { filter: 'brightness(1)' },
      {
        filter: 'brightness(1.35) drop-shadow(0 0 20px rgba(129, 140, 248, 0.4))',
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        clearProps: 'filter',
      }
    );
  }
}

/**
 * Animate a specific cell being shattered by a hammer power-up
 */
export function animateCellShatter(row: number, col: number) {
  const targetCell = document.querySelector(`[data-cell-row="${row}"][data-cell-col="${col}"]`);
  if (!targetCell) return;

  gsap.timeline()
    .to(targetCell, {
      scale: 1.35,
      rotate: 15,
      filter: 'brightness(2.2)',
      duration: 0.12,
      ease: 'power4.out',
    })
    .to(targetCell, {
      scale: 0,
      opacity: 0,
      rotate: -30,
      duration: 0.22,
      ease: 'power2.in',
      clearProps: 'scale,opacity,rotate,filter',
    });

  // Ripple out to neighbors
  const neighbors = document.querySelectorAll(
    `[data-cell-row="${row - 1}"][data-cell-col="${col}"],` +
    `[data-cell-row="${row + 1}"][data-cell-col="${col}"],` +
    `[data-cell-row="${row}"][data-cell-col="${col - 1}"],` +
    `[data-cell-row="${row}"][data-cell-col="${col + 1}"]`
  );

  if (neighbors.length > 0) {
    gsap.fromTo(
      neighbors,
      { scale: 1 },
      {
        scale: 1.12,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
        clearProps: 'scale',
      }
    );
  }
}

/**
 * Main coordinator function for activating power-up animations
 */
export function triggerPowerUpAnimation(
  type: PowerUpType,
  buttonElement?: HTMLElement | null
) {
  if (buttonElement) {
    animatePowerUpButton(buttonElement);
  }

  if (type === 'hammer') {
    animateHammerGridPropagation();
  } else if (type === 'reroll') {
    animateDockRerollPropagation();
  } else if (type === 'bomb') {
    animateHammerGridPropagation();
  }
}
