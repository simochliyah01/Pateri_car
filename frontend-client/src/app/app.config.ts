import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  LucideAngularModule,
  Menu, X, User, Globe, Phone, Mail, MapPin,
  Facebook, Instagram,
  Car, CarFront, Search, SearchX, Fuel, Settings2, Users, Calendar, Star, Filter,
  ArrowRight, ArrowLeft, Wallet, Truck, Sparkles, Package, Tag, Clock, ShieldCheck,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Banknote,
  Lock, Eye, EyeOff, AlertCircle, Check, CheckCircle, Loader2,
  FileText, Settings, LogOut, LayoutDashboard,
  DoorOpen, Gauge, XCircle,
  Navigation, Baby, UserPlus, Info,
  Plus, CalendarX, AlertTriangle,
  TrendingUp, TrendingDown, Bell, ExternalLink,
  RefreshCw,
  Pencil, Trash2,
  Upload,
  ArrowUpDown, ArrowUp, ArrowDown,
  Key, Wrench,
  List, LayoutGrid,
  Target,
  RotateCcw, Building2,
} from 'lucide-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu, X, User, Globe, Phone, Mail, MapPin,
        Facebook, Instagram,
        Car, CarFront, Search, SearchX, Fuel, Settings2, Users, Calendar, Star, Filter,
        ArrowRight, ArrowLeft, Wallet, Truck, Sparkles, Package, Tag, Clock, ShieldCheck,
        ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Banknote,
        Lock, Eye, EyeOff, AlertCircle, Check, CheckCircle, Loader2,
        FileText, Settings, LogOut, LayoutDashboard,
        DoorOpen, Gauge, XCircle,
        Navigation, Baby, UserPlus, Info,
        Plus, CalendarX, AlertTriangle,
        TrendingUp, TrendingDown, Bell, ExternalLink,
        RefreshCw,
        Pencil, Trash2,
        Upload,
        ArrowUpDown, ArrowUp, ArrowDown,
        Key, Wrench,
        List, LayoutGrid,
        Target,
        RotateCcw, Building2,
      })
    ),
  ]
};
