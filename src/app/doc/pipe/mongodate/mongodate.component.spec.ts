import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongodateComponent } from './mongodate.component';

describe('MongodateComponent', () => {
  let component: MongodateComponent;
  let fixture: ComponentFixture<MongodateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongodateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MongodateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
