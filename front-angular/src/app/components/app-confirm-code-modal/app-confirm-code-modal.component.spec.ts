import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfirmCodeModalComponent } from './app-confirm-code-modal.component';

describe('AppConfirmCodeModalComponent', () => {
  let component: AppConfirmCodeModalComponent;
  let fixture: ComponentFixture<AppConfirmCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConfirmCodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppConfirmCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
