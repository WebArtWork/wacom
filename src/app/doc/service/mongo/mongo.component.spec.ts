import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoComponent } from './mongo.component';

describe('MongoComponent', () => {
  let component: MongoComponent;
  let fixture: ComponentFixture<MongoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MongoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
