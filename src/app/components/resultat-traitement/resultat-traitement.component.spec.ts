import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultatTraitementComponent } from './resultat-traitement.component';

describe('ResultatTraitementComponent', () => {
  let component: ResultatTraitementComponent;
  let fixture: ComponentFixture<ResultatTraitementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultatTraitementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultatTraitementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
