import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  LucideAngularModule,
  Menu, X, User, Globe, Phone, Mail, MapPin,
  Facebook, Instagram,
  Car, CarFront, Search, Fuel, Settings2, Users, Calendar, Star, Filter,
  ArrowRight, Wallet, Truck, Sparkles, Package, Tag, Clock, ShieldCheck,
  ChevronDown, Banknote,
} from 'lucide-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu, X, User, Globe, Phone, Mail, MapPin,
        Facebook, Instagram,
        Car, CarFront, Search, Fuel, Settings2, Users, Calendar, Star, Filter,
        ArrowRight, Wallet, Truck, Sparkles, Package, Tag, Clock, ShieldCheck,
        ChevronDown, Banknote,
      })
    ),
  ]
};
