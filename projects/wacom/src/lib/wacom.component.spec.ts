import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WacomComponent } from './wacom.component';

describe('WacomComponent', () => {
  let component: WacomComponent;
  let fixture: ComponentFixture<WacomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WacomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WacomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
