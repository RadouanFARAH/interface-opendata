import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonneMoraleGestionnaireComponent } from './personne-morale-gestionnaire.component';

describe('PersonneMoraleGestionnaireComponent', () => {
  let component: PersonneMoraleGestionnaireComponent;
  let fixture: ComponentFixture<PersonneMoraleGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonneMoraleGestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonneMoraleGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
