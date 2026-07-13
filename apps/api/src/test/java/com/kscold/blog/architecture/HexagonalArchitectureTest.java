package com.kscold.blog.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * 헥사고날 아키텍처 표준 규칙을 강제해 구조가 다시 꼬이는 것을 막는다.
 *
 * <p>표준(모듈별): adapter.in.web REST 컨트롤러 (+ dto: web I/O) application.dto Command / application 출력
 * DTO application.port.in UseCase (driving 포트) application.service 유스케이스 구현 domain.model
 * 엔티티/애그리거트/VO domain.port.out 모든 driven 포트 (repository·mail·token·external·notification)
 */
class HexagonalArchitectureTest {

    private static final String ROOT = "com.kscold.blog";
    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes =
                new ClassFileImporter()
                        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                        .importPackages(ROOT);
    }

    @Test
    void 도메인은_어댑터를_의존하지_않는다() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("..domain..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("..adapter..");
        rule.check(classes);
    }

    @Test
    void 도메인은_application을_의존하지_않는다() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("..domain..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("..application..");
        rule.check(classes);
    }

    @Test
    void application은_adapter를_의존하지_않는다() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("..application..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("..adapter..");
        rule.check(classes);
    }

    @Test
    void 아웃바운드_포트는_domain_port_out에만_둔다() {
        // driven 포트 명명(*Port / *Repository / *Sender / *Provider)은 domain.port.out 에만 존재
        ArchRule rule =
                classes()
                        .that()
                        .haveSimpleNameEndingWith("Port")
                        .and()
                        .areInterfaces()
                        .and()
                        .resideOutsideOfPackage("..application.port.in..")
                        .should()
                        .resideInAPackage("..domain.port.out..");
        rule.check(classes);
    }

    @Test
    void 컨트롤러는_adapter_in_web에만_둔다() {
        // shared(HealthController 등 플랫폼 공통)는 바운디드 컨텍스트가 아니므로 제외한다.
        ArchRule rule =
                classes()
                        .that()
                        .haveSimpleNameEndingWith("Controller")
                        .and()
                        .resideOutsideOfPackage("..shared..")
                        .should()
                        .resideInAPackage("..adapter.in.web..");
        rule.check(classes);
    }

    @Test
    void 유스케이스_포트는_application_port_in에만_둔다() {
        ArchRule rule =
                classes()
                        .that()
                        .haveSimpleNameEndingWith("UseCase")
                        .should()
                        .resideInAPackage("..application.port.in..");
        rule.check(classes);
    }
}
