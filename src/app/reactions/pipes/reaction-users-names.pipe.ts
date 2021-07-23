import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'reactionUsersNames',
  pure: true,
})
export class ReactionUsersNamesPipe implements PipeTransform {
  public transform(
    userIds: number[],
    userNames: { [id: number]: string },
    iconName: string
  ): string {
    if (
      !userIds ||
      !userIds.length ||
      !userNames ||
      !Object.keys(userNames).length
    ) {
      return ''
    }
    iconName = iconName || ''
    const names: string[] = userIds.map((id) => userNames[id])
    const text = `${names.join(', ')} reacted with ${iconName}`
    return text
  }
}
