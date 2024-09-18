import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { PersonneMoraleGestionnaireComponent } from './components/personne-morale-gestionnaire/personne-morale-gestionnaire.component';
import { PersonneDetailsComponent } from './components/personne-details/personne-details.component';
import { PmDataService } from './services/pmData.service';
import { AuthGuard } from './services/auth.guard';
import { NotAuthGuard } from './services/not-auth.guard';
import { AgentsPageComponent } from './components/agents-page/agents-page.component';
import { NewDemandeComponent } from './components/new-demande/new-demande.component';
import { TokenGuard } from './services/token.guard';
import { SimulatorComponent } from './pages/simulator/simulator.component';


const role = localStorage.getItem('role');
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthGuard]
  },
  {
    path: 'ajouter',
    component: NewDemandeComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'pmg',
        component: PersonneMoraleGestionnaireComponent,
        resolve: { codes: PmDataService },
        runGuardsAndResolvers: 'always',
        canActivate: [TokenGuard]

      },
      {
        path: 'details',
        component: PersonneDetailsComponent,
        runGuardsAndResolvers: 'always',
        canActivate: [TokenGuard]

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
    canActivate: [TokenGuard]
  },
  {
    path: 'simulation',
    component: SimulatorComponent,
    canActivate: [TokenGuard]
  },
  {
    path: 'agence/:codeagence',
    component: AgentsPageComponent
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
export class AppRoutingModule { }
