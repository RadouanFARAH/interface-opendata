import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { PersonneMoraleComponent } from './components/personne-morale/personne-morale.component';
import { PersonnePhysiqueComponent } from './components/personne-physique/personne-physique.component';
import { RegisterComponent } from './pages/register/register.component';
import { PersonnePhysiqueGestionnaireComponent } from './components/personne-physique-gestionnaire/personne-physique-gestionnaire.component';
import { PersonneMoraleGestionnaireComponent } from './components/personne-morale-gestionnaire/personne-morale-gestionnaire.component';
import { PpDataService } from './services/ppdata.service';
import { PersonneDetailsComponent } from './components/personne-details/personne-details.component';
import { AgenceDataService } from './services/agenceData.service';
import { PmDataService } from './services/pmData.service';
import { PmDataNewService } from './services/pmDataNew.service';
import { AuthGuard } from './services/auth.guard';
import { NotAuthGuard } from './services/not-auth.guard';
const role = localStorage.getItem('role');
console.log('routing', role, role === 'BO');
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
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
        path: '',
        pathMatch: 'full',
        redirectTo: 'pmg',
      },
      {
        path: 'pm',
        component: PersonneMoraleComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'pp',
        component: PersonnePhysiqueComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'ppg',
        component: PersonnePhysiqueGestionnaireComponent,
        resolve: { pps: PpDataService, agences: AgenceDataService, ppsn:PmDataNewService },
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'pmg',
        component: PersonneMoraleGestionnaireComponent,
        resolve: { codes: PmDataService},
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'details',
        component: PersonneDetailsComponent,
        resolve: { villes: AgenceDataService},
        runGuardsAndResolvers: 'always'
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
