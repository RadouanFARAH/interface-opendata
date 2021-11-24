import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenceReorientationComponent } from './agence-reorientation.component';

describe('AgenceReorientationComponent', () => {
  let component: AgenceReorientationComponent;
  let fixture: ComponentFixture<AgenceReorientationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenceReorientationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgenceReorientationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
