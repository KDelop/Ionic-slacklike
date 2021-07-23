import { IProfileResponse } from './../../models/interfaces/user.interfaces';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myReactions',
  pure: true
})
export class MyReactionsPipe implements PipeTransform {
  public transform(
    userIds: string[],
    currentUser: IProfileResponse,
    iconName: any
  ): any {
    if (!userIds || !userIds.length || !currentUser) {
      return '';
    }

    let text = '';
    userIds.forEach(id => {
      if (id === currentUser.id) {
        text = 'iReacted';
      }
    });
    return text;
  }
}
