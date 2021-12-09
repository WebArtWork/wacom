import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickOutsideComponent } from './click-outside.component';

describe('ClickOutsideComponent', () => {
  let component: ClickOutsideComponent;
  let fixture: ComponentFixture<ClickOutsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClickOutsideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickOutsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
