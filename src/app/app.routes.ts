import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { TrazabilidadToDo } from './pages/trazabilidad-to-do/trazabilidad-to-do';

export const routes: Routes = [
      {path: '',component: Home},
      {path: 'inicio',component: Home},
      {path: 'trazabilidad-todo',component: TrazabilidadToDo},
];
