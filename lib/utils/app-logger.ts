/* eslint-disable no-console */
/**
 * @file Logging Policy
 *
 * @description
 * 공통 로깅 유틸 사용 규칙
 *
 * ## Rules
 * - ❌ console.log / console.warn 직접 사용 금지 (appLogger 사용)
 * - ✅ console.error 직접 사용 허용 (운영 환경 노출 및 ESLint 허용)
 * - 개발 중 디버깅용 로그: `appLogger.log`
 * - 개발 중 경고성 이벤트: `appLogger.warn`
 *
 * ## Environment Policy
 * - development: log / warn 출력
 * - production: log / warn 무력화 (에러는 console.error 직접 사용)
 *
 * ## Rationale
 * - 운영 환경 콘솔 노이즈 최소화
 * - 에러 상황은 브라우저/서버 기본 기능을 통해 즉시 확인 가능하도록 함
 *
 * @example
 * appLogger.log('데이터 로드 완료', data);
 * appLogger.warn('API 응답 지연', { latency });
 * console.error('네트워크 연결 불가', error);
 */

import { isDev } from '../../constants/env'

export const appLogger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },
}
