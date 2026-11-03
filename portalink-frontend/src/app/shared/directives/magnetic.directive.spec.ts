import { MagneticDirective } from './magnetic.directive';

describe('MagneticDirective', () => {
  it('should create an instance', () => {
    const mockEl = { nativeElement: document.createElement('div') };
    const mockRenderer = { setStyle: () => {} } as any;
    const directive = new MagneticDirective(mockEl as any, mockRenderer);
    expect(directive).toBeTruthy();
  });
});
