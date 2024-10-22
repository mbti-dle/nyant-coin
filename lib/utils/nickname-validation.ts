const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ]{2,10}$/

export const validateNickname = (nickname: string) => {
  if (nickname.length < 2 || nickname.length > 10) {
    return '최소 2자 이상 입력해 주세요.'
  } else if (!NICKNAME_REGEX.test(nickname)) {
    return '특수문자나 공백을 사용할 수 없습니다.'
  }
  return ''
}
