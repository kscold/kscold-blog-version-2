package com.kscold.blog.shared.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

/**
 * 서비스 계층 AOP 로깅
 * - 모든 ApplicationService 메서드 실행 시간 측정
 * - 예외 발생 시 상세 로그 기록
 */
@Slf4j
@Aspect
@Component
public class ServiceLoggingAspect {

    @Around("execution(* com.kscold.blog..application.service.*.*(..))")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = signature.getName();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        try {
            Object result = joinPoint.proceed();
            stopWatch.stop();
            log.debug("[SERVICE] {}.{}() completed in {}ms", className, methodName, stopWatch.getTotalTimeMillis());
            return result;
        } catch (Exception e) {
            stopWatch.stop();
            log.warn("[SERVICE] {}.{}() failed after {}ms — {}: {}",
                    className, methodName, stopWatch.getTotalTimeMillis(),
                    e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
    }
}
