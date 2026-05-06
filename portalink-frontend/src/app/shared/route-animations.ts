import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
  animateChild,
} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0, // Ensure both are hidden initially to prevent flickers
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)', visibility: 'visible' })
    ], { optional: true }),
    
    query(':leave', [
      animate('0.3s ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
    ], { optional: true }),
    
    query(':enter', [
      animate('0.7s cubic-bezier(0.23, 1, 0.32, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),

    query(':enter', animateChild(), { optional: true })
  ])
]);
