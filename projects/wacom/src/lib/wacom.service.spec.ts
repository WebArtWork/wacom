import { TestBed } from '@angular/core/testing';

import { WacomService } from './wacom.service';

describe('WacomService', () => {
  let service: WacomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WacomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
