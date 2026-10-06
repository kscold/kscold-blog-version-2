package com.kscold.blog.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 커밋 후 리스너 선언 규칙.
 *
 * <p>이 애플리케이션은 트랜잭션 관리자 없이 동작하므로 이벤트가 항상 트랜잭션 밖에서 발행된다. Spring Framework 6.2부터 {@code
 * fallbackExecution}을 켜지 않은 리스너는 이런 이벤트를 받지 못해, 댓글·방명록 답글·Admin Night 알림 메일이 조용히 나가지 않았다.
 */
class TransactionalEventListenerConventionTest {

    @Test
    void 커밋_후_리스너는_트랜잭션이_없어도_실행되게_선언한다() {
        JavaClasses classes =
                new ClassFileImporter()
                        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                        .importPackages("com.kscold.blog");

        methods()
                .that()
                .areAnnotatedWith(TransactionalEventListener.class)
                .should(runWithoutTransaction())
                .check(classes);
    }

    private static ArchCondition<JavaMethod> runWithoutTransaction() {
        return new ArchCondition<>("fallbackExecution = true 로 선언한다") {
            @Override
            public void check(JavaMethod method, ConditionEvents events) {
                TransactionalEventListener listener =
                        method.getAnnotationOfType(TransactionalEventListener.class);
                if (!listener.fallbackExecution()) {
                    events.add(
                            SimpleConditionEvent.violated(
                                    method,
                                    method.getFullName()
                                            + " 은 fallbackExecution = true 가 없어 트랜잭션 밖에서 발행한 이벤트를 받지"
                                            + " 못한다"));
                }
            }
        };
    }
}
