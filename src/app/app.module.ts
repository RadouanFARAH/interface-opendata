import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableExporterModule } from 'mat-table-exporter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HomeComponent } from './pages/home/home.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { PersonnePhysiqueComponent } from './components/personne-physique/personne-physique.component';
import { PersonneMoraleComponent } from './components/personne-morale/personne-morale.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';
import {MatNativeDateModule} from '@angular/material/core';
import { RegisterComponent } from './pages/register/register.component';
import { PersonnePhysiqueGestionnaireComponent } from './components/personne-physique-gestionnaire/personne-physique-gestionnaire.component';
import { PersonneMoraleGestionnaireComponent } from './components/personne-morale-gestionnaire/personne-morale-gestionnaire.component';
import { PersonneDetailsComponent } from './components/personne-details/personne-details.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { DialogSecondComponent } from './components/dialog-second/dialog-second.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ResultatTraitementComponent } from './components/resultat-traitement/resultat-traitement.component';
import {SafeHtmlPipe} from './santi.pipe'

const MaterialAngularModules = [
  MatCheckboxModule,
  MatButtonModule,
  MatInputModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatStepperModule,
  MatTabsModule,
  MatExpansionModule,
  MatButtonToggleModule,
  MatChipsModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatNativeDateModule
];

@NgModule({
  declarations: [AppComponent, LoginComponent, HomeComponent, MainNavComponent, PersonnePhysiqueComponent, PersonneMoraleComponent, RegisterComponent, PersonnePhysiqueGestionnaireComponent, PersonneMoraleGestionnaireComponent, PersonneDetailsComponent, DialogComponent, DialogSecondComponent, ResultatTraitementComponent, SafeHtmlPipe],
  imports: [MatTableExporterModule, HttpClientModule,BrowserModule,FormsModule,ReactiveFormsModule, AppRoutingModule, BrowserAnimationsModule, MaterialAngularModules, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, NgbModule],
  providers: [{
    provide:HTTP_INTERCEPTORS,
    useClass:TokenInterceptorService,
    multi:true
  }],
  bootstrap: [AppComponent],
})
export class AppModule {}
