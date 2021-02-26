import { TestBed } from '@angular/core/testing';

import { SearchParams, SearchParams$, SearchService } from './search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
describe('SearchService', () => {

  let service: SearchService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SearchService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
// test failing, need to fix async 
  it('should find user by username', done => {
    const results$ = service.getSearchResults$().subscribe(response => {
      expect(response.items[0].login).toEqual('bencbradshaw');
      done()
    })
    service.updateSearchArgs({username: 'bencbradshaw', pageNumber: 1, perPage: 5});
  })

});
