/**
 * @file Logging Policy
 *
 * @description
 * 공통 로깅 유틸 사용 규칙
 *
 * ## Rules
 * - ❌ console.log 직접 사용 금지
 * - 개발 중 디버깅용 로그: `appLogger.log`
 * - 운영 환경에서도 확인이 필요한 경고성 이벤트: `appLogger.warn`
 * - 오류 및 예외 상황: `appLogger.error`
 *
 * ## Environment Policy
 * - development: log / warn / error 출력
 * - production: warn / error 만 출력 (log는 무력화)
 *
 * ## Rationale
 * - 운영 환경 콘솔 노이즈 최소화
 * - 문제 상황(warn/error)만 명확히 드러내기 위함
 *
 * @example
 * appLogger.log('소켓 재연결 시도', { retryCount });
 * appLogger.warn('Heartbeat 지연 감지', { latency });
 * appLogger.error('소켓 연결 실패', error);
 */

import { isDev } from '@/constants/env'

export const appLogger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
