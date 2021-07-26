import {TestBed} from '@angular/core/testing';

import {UserService} from './user.service';
import {HttpClient} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {noop} from "rxjs";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {User} from "./user";

describe('UserServiceSpec', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
  });

  describe(`getUser`, (): void => {
    it('should make the http call when the cache is empty', (): void => {
      service.getUser(1).subscribe(noop, noop);

      const request = httpMock.expectOne(`${service.rootUrl}1`);
      expect(request.request.method).toBe('GET')
      request.flush({});
    });

    it('should make the http call when the cache is populated with another user', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({});

      service.getUser(2).subscribe(noop, noop);
      const request = httpMock.expectOne(`${service.rootUrl}2`);
      request.flush({});
    });

    it('should not make the http call when the cache is populated', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({id: 1});

      // Already made the call for user 1, this time should hit the cache
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectNone(`${service.rootUrl}1`);
    });
  });

  describe(`deleteUser`, (): void => {
    it('should clear the read cache after a delete where deleted user id matches the cached user id', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({id: 1});
      // Delete the cached user
      service.deleteUser({id: 1} as User).subscribe(noop, noop);

      // The call to delete should have cleared our cache, this will result in another http call
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`);
    });

    it('should not clear the read cache after a delete where deleted user id does not match the cached user id', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({id: 1});
      // Delete a user that is not cached
      service.deleteUser({id: 2} as User).subscribe(noop, noop);

      // The call to delete should not have cleared our cache.
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectNone(`${service.rootUrl}1`);
    });
  });

  describe(`updateUser`, (): void => {
    it('should clear the read cache after an update where updated user id matches the cached user id', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({id: 1});
      // Update the cached user
      service.updateUser({id: 1} as User).subscribe(noop, noop);

      // The call to update should have cleared our cache, this will result in another http call
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`);
    });

    it('should not clear the read cache after an update where the updated user id does not match the cached user id', (): void => {
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectOne(`${service.rootUrl}1`).flush({id: 1});
      // Update a user that is not cached
      service.updateUser({id: 2} as User).subscribe(noop, noop);

      // The call to update should not have cleared our cache.
      service.getUser(1).subscribe(noop, noop);
      httpMock.expectNone(`${service.rootUrl}1`);
    });
  });
});
