/**
 * @file Logging Policy
 *
 * @description
 * 공통 로깅 유틸 사용 규칙
 *
 * ## Rules
 * - ❌ console.log 직접 사용 금지
 * - 개발 중 디버깅용 로그: `appLogger.debug`
 * - 개발 중 사용자 흐름 / 상태 확인용 로그: `appLogger.info`
 * - 운영 환경에서도 확인이 필요한 경고성 이벤트: `appLogger.warn`
 * - 오류 및 예외 상황: `appLogger.error`
 *
 * ## Environment Policy
 * - development: debug / info / warn / error 출력
 * - production: warn / error 만 출력 (debug, info는 무력화)
 *
 * ## Rationale
 * - 운영 환경 콘솔 노이즈 최소화
 * - 문제 상황(warn/error)만 명확히 드러내기 위함
 *
 * @example
 * appLogger.debug('소켓 재연결 시도', { retryCount });
 * appLogger.info('게임 상태 동기화 완료', gameId);
 * appLogger.warn('Heartbeat 지연 감지', { latency });
 * appLogger.error('소켓 연결 실패', error);
 */

const isProd = process.env.NODE_ENV === 'production'

export const appLogger = {
  debug: (...args: unknown[]) => {
    if (!isProd) {
      console.log(...args)
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
