import { RevealDirective } from './reveal.directive';

describe('RevealDirective', () => {
  it('should create an instance', () => {
    const mockEl = { nativeElement: document.createElement('div') };
    const mockRenderer = { setStyle: () => {} } as any;
    const directive = new RevealDirective(mockEl as any, mockRenderer);
    expect(directive).toBeTruthy();
  });
});
