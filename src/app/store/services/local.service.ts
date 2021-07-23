import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
@Injectable()
export class LocalService {
  constructor(private router: Router) {}

  public changeQueryParam(param: any) {
    let queryParams = param
    const urlTree = this.router.createUrlTree([], {
      queryParams,
      queryParamsHandling: 'merge',
      preserveFragment: true,
    })
    this.router.navigateByUrl(urlTree)
  }
}
