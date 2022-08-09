import { TestBed } from '@angular/core/testing';

import { SharingFestivDataService } from './sharing-festiv-data.service';

describe('SharingFestivDataService', () => {
  let service: SharingFestivDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharingFestivDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
