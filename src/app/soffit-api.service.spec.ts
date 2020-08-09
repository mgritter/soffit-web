import { TestBed } from '@angular/core/testing';

import { SoffitApiService } from './soffit-api.service';

describe('SoffitApiService', () => {
  let service: SoffitApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoffitApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
