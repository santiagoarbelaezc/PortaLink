import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { slideInAnimation } from './shared/route-animations';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    animations: [slideInAnimation],
    template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  private contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
