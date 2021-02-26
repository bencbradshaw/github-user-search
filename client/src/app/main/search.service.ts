import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,  of,  Subject, throwError } from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

export interface SearchParams{
  username: string;
  pageNumber: number;
  perPage: number;
}
export type SearchParams$ = Subject<SearchParams>;
export interface GithubUser{
  login: string;
  avatar: string;
  avatar_url:string
  html_url: string;
}
export interface SearchResult{
  total_count: string;
  items: GithubUser[]
}

@Injectable()

export class SearchService {
  url = 'https://api.github.com/search/users';
  private searchParams$: SearchParams$ = new Subject<SearchParams>();
  constructor(private http: HttpClient) { }
  // simple error message handler, found on stackoverflow
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
        case 404: {
          return `Not Found: ${error.message}`;
        }
        case 403: {
          return `Access Denied: ${error.message}`;
        }
        case 500: {
          return `Internal Server Error: ${error.message}`;
        }
        default: {
          return `Unknown Server Error: ${error.message}`;
        }
  }
  }

  getSearchResults$(): Observable<SearchResult> {
    return this.searchParams$.pipe(switchMap(args => {
      return this.http.get(this.url,
        {
          params:{
            q:args.username,
            page: args.pageNumber.toString(),
            per_page: args.perPage.toString() 
          }
        }
      ).pipe(
          catchError(error => {
              let errorMsg: string;
              if (error.error instanceof ErrorEvent) {
                  errorMsg = `Error: ${error.error.message}`;
              } else {
                  errorMsg = this.getServerErrorMessage(error);
              }
              console.log(errorMsg);
              return throwError(errorMsg);
          }),
        map(res=>{
          const response = res as SearchResult ;
          return  Number(response.total_count) > 0 ? res : null
          })) as Observable<SearchResult>
    }))
  }

  updateSearchArgs(args: SearchParams): void {
    console.log('updating search args')
    this.searchParams$.next(args);
  }

}
