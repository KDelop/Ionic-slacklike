export interface IReaction {
  messageId?: string
  reaction_name: string
  reaction_icon: string
}

export interface IReactionResponse extends IReaction {
  users?: string[]
}
