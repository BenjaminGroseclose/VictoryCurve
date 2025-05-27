import { Routes } from '@angular/router';
import { TrackerComponent } from './tracker/tracker.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'tracker',
    component: TrackerComponent,
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
