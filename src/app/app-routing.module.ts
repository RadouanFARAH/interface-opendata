import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { PersonneMoraleGestionnaireComponent } from './components/personne-morale-gestionnaire/personne-morale-gestionnaire.component';
import { PersonneDetailsComponent } from './components/personne-details/personne-details.component';
import { AgenceDataService } from './services/agenceData.service';
import { PmDataService } from './services/pmData.service';
import { AuthGuard } from './services/auth.guard';
import { NotAuthGuard } from './services/not-auth.guard';
import { AgentsPageComponent } from './components/agents-page/agents-page.component';
import { DrPageComponent } from './components/dr-page/dr-page.component';
import { DsPageComponent } from './components/ds-page/ds-page.component';

const role = localStorage.getItem('role');
console.log('routing', role, role === 'BO');
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate:[NotAuthGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'pmg',
        component: PersonneMoraleGestionnaireComponent,
        resolve: { codes: PmDataService,villes: AgenceDataService},
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'details',
        component: PersonneDetailsComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pmg',
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'agence/:codeagence',
    component: AgentsPageComponent,
    resolve:{villes: AgenceDataService}
  },
  {
    path: 'ds/:codedr',
    component: DsPageComponent,
    resolve:{villes: AgenceDataService}
  },
  {
    path: 'dr/:codeds',
    component: DrPageComponent,
    resolve:{villes: AgenceDataService}
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
