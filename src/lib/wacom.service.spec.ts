import { TestBed } from '@angular/core/testing';

import { WacomService } from './wacom.service';

describe('WacomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WacomService = TestBed.get(WacomService);
    expect(service).toBeTruthy();
  });
});
