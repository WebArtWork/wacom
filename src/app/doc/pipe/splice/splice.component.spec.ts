import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpliceComponent } from './splice.component';

describe('SpliceComponent', () => {
  let component: SpliceComponent;
  let fixture: ComponentFixture<SpliceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpliceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpliceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
