import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { interval, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil, tap, throttle } from 'rxjs/operators';
import { SearchParams, SearchResult, SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchService]
})

export class SearchComponent implements OnInit, OnDestroy {
  users$: Observable<SearchResult | null>;
  searchForm: FormGroup = this.fb.group({
    username: '',
    pageNumber: 1,
    perPage: 5
  }); 

  destroyed$: Subject<boolean> = new Subject();
  error: string;
  totalPageCount: number;
  pages: number[];
  maxPagesButtons = 10;
  constructor(private fb: FormBuilder, private searchService:SearchService){}

  ngOnInit() {
  
    this.users$ = this.searchService.getSearchResults$().pipe(
      tap(res=>{
        this.totalPageCount =  Math.floor((Number(res.total_count) / Number(this.searchForm.get('perPage')?.value ?? 1)));
        // TODO handle for updating page number on first load, and next events
        this.pages = Array(this.totalPageCount).fill(null).map((_, i) => i + 1).filter(val => val < this.maxPagesButtons);
      }),
      catchError(err =>{
        this.error = err;
        return of(null);
      }
    ));
      // opportunity to improve, using a switch map and no subscription
    this.searchForm.valueChanges.pipe(
          takeUntil(this.destroyed$),
          throttle( _ => interval(1000))
        ).subscribe( searchForm => {
            const searchFormValues: SearchParams = searchForm;
            if(searchFormValues.username){
              this.searchService.updateSearchArgs({ 
                  username: searchFormValues.username,
                  pageNumber: searchFormValues.pageNumber,
                  perPage: searchFormValues.perPage
              })
            }
        })
  }

  update(){
    this.searchService.updateSearchArgs(this.searchForm.value);
  }
  goTo(number){
    this.searchForm.patchValue({pageNumber: number});
    this.update();
  }
  updatePageList(){
    this.pages  = Array(this.totalPageCount).fill(null).map((_, i) => i + 1).filter(val => val < this.maxPagesButtons);
  }
  ngOnDestroy(){
    // maybe a subscription is less verbose than takeUntil with destroyed subject
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
