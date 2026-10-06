package com.kscold.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

// 로그인은 JWT로만 처리한다. 스프링이 기본으로 만드는 임시 비밀번호 사용자는 쓰이지 않으므로 만들지 않는다.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableMongoAuditing
@EnableScheduling
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}
