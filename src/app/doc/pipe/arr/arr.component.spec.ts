import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrComponent } from './arr.component';

describe('ArrComponent', () => {
  let component: ArrComponent;
  let fixture: ComponentFixture<ArrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
