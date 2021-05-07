import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSecondComponent } from './dialog-second.component';

describe('DialogSecondComponent', () => {
  let component: DialogSecondComponent;
  let fixture: ComponentFixture<DialogSecondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogSecondComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSecondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
