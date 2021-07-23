import { Injectable } from '@angular/core'
import {
  cloneDeep,
  includes,
  startsWith,
  concat,
  find,
  uniqBy,
  flatten,
} from 'lodash'
import { IProfileResponse } from '../../models'

@Injectable()
export class UniversalSearchService {
  /**
   * this method is used for person data for filteration
   * supporting priority to username, email.
   * @param term an string for search
   * @param arr chunk of data
   * return the filtered data of starts with array and includes array.
   */
  // email, username, firstName, lastName
  public filterByIProfile(term: string, arr: IProfileResponse[]): any[] {
    let filteredArr: any[]
    let array = cloneDeep(arr)

    const whiteSpaceRegex = /\s/gm
    if (whiteSpaceRegex.test(term)) {
      const names: string[] = term.split(' ')
      names.forEach((name: string) => {
        filteredArr = this.performIncludesFilter(array, name)
        array = cloneDeep(filteredArr)
      })
      const final: any[] = this.performStartsWithFilter(filteredArr, term)
      return final
    } else {
      // get filtered result
      filteredArr = this.performIncludesFilter(array, term)
      // sort data and return
      const final: any[] = this.performStartsWithFilter(filteredArr, term)
      return final
    }
  }

  // filtering data for own usage
  private performIncludesFilter(arr: any[], term: string): any[] {
    const usernameArr: any[] = []
    const fnameArr: any[] = []
    const lnameArr: any[] = []
    const emailArr: any[] = []
    arr.forEach((item: IProfileResponse) => {
      try {
        if (!item?.org_user?.isEnabled) {
          return []
        }
        if (
          item.username &&
          includes(item.username.toLocaleLowerCase(), term)
        ) {
          usernameArr.push(item)
        } else if (
          item.firstName &&
          includes(item.firstName.toLocaleLowerCase(), term)
        ) {
          fnameArr.push(item)
        } else if (
          item.lastName &&
          includes(item.lastName.toLocaleLowerCase(), term)
        ) {
          lnameArr.push(item)
        } else if (
          item.email &&
          includes(item.email.toLocaleLowerCase(), term)
        ) {
          emailArr.push(item)
        }
      } catch (error) {
        console.log(error, item)
      }
    })
    return [...usernameArr, ...fnameArr, ...lnameArr, ...emailArr]
  }

  private performStartsWithFilter(arr, term): IProfileResponse[] {
    let startsWithArr: IProfileResponse[]
    const includesArr: IProfileResponse[] = []
    startsWithArr = arr.filter((item: IProfileResponse) => {
      if (!item?.org_user?.isEnabled) {
        return []
      }
      if (startsWith(item.firstName.toLocaleLowerCase(), term)) {
        return item
      } else {
        includesArr.push(item)
      }
    })
    return this.shuffleResults(concat(startsWithArr, includesArr))
  }

  public shuffleResults(arr: IProfileResponse[]): IProfileResponse[] {
    const a = []
    const z = []
    if (arr) {
      arr.forEach((item: IProfileResponse) => {
        if (item?.org_user?.isEnabled) {
          a.push(item)
        } else {
          z.push(item)
        }
      })
    }
    return concat(a, z)
  }
}
