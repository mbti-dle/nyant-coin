export interface ChatMessageModel {
  type: 'message'
  imageUrl: string
  nickname: string
  message: string
}

export interface ChatNoticeModel {
  type: 'notice'
  notice: string
}

export type ChatType = ChatMessageModel | ChatNoticeModel
