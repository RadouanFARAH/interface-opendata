import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnePhysiqueGestionnaireComponent } from './personne-physique-gestionnaire.component';

describe('PersonnePhysiqueGestionnaireComponent', () => {
  let component: PersonnePhysiqueGestionnaireComponent;
  let fixture: ComponentFixture<PersonnePhysiqueGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonnePhysiqueGestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonnePhysiqueGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
