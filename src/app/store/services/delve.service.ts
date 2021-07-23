import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SearchService } from 'universal-search-engine-angular'

@Injectable()
export class DelveService {
  constructor(private service: SearchService) {}

  search(
    term: string,
    currentUserId: string,
    indexName: string,
    apiKey: string,
    searchParameters: any
  ) : Observable<any> {

    // console.log('delveService');
    // console.log('term', term);
    // console.log('currentUserId', currentUserId);
    // console.log('indexName', indexName);
    // console.log('apiKey', apiKey);
    // if (term === '') {
    //   return of([]);
    // }

    return this.service
      .searchQuery(indexName, term, apiKey, 10, currentUserId, searchParameters)
      .pipe(
        map((response: any) => {
          if (!response?.hits?.hits) {
            return []
          }
          return response.hits.hits
        })
      )
  }
}