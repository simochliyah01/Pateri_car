import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

/**
 * AppComponent test suite.
 *
 * AppComponent is standalone and imports HeaderComponent + FooterComponent,
 * each of which pulls in AuthService, SettingsService, etc.
 * To avoid the cascade of providers we override the template so Angular does
 * not need to resolve those child components during the test.
 */
describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
    })
    .overrideComponent(AppComponent, {
      // Replace template and clear imports so child components
      // (HeaderComponent, FooterComponent) are never resolved.
      set: {
        imports: [],
        template: '<div class="test-root"></div>'
      }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render without throwing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('isAuthRoute should return false for empty URL', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isAuthRoute()).toBeFalse();
  });
});
