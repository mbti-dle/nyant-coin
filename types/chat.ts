export interface ChatMessageModel {
  imageUrl: string
  nickname: string
  message: string
}

// 해석
// export interface SystemMessageModel {
//   type: 'system'
//   message: string
// }

// export interface UserMessageModel {
//   type: 'user'
//   imageUrl?: string
//   nickName?: string
//   message: string
// }

// export type ChatMessageType = SystemMessageModel | UserMessageModel
