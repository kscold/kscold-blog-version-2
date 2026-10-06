package com.kscold.blog.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * 보안 검사 예외(apps/api/.trivyignore.yaml)가 전제로 삼은 "취약한 기능을 쓰지 않는다"는 조건을 빌드에서 지킨다.
 *
 * <p>여기 규칙이 깨지면 해당 예외는 더 이상 유효하지 않으므로, 예외를 지우고 수정 버전으로 올려야 한다.
 */
class SecurityExceptionGuardTest {

    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes =
                new ClassFileImporter()
                        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                        .importPackages("com.kscold.blog");
    }

    @Test
    void XSLT_뷰를_쓰지_않는다() {
        // CVE-2026-47884 예외의 전제: XsltView 로 뷰를 그리지 않는다.
        noClasses()
                .should()
                .dependOnClassesThat()
                .resideInAPackage("org.springframework.web.servlet.view.xslt..")
                .check(classes);
    }
}
