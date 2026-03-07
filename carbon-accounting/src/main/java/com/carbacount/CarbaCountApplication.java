package com.carbacount;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.validation.annotation.Validated;

@SpringBootApplication(scanBasePackages = { "com.carbacount", "com.carbon" })
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = { "com.carbacount", "com.carbon" })
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = { "com.carbacount", "com.carbon" })
@EnableScheduling
@EnableAsync
@Validated
public class CarbaCountApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarbaCountApplication.class, args);
    }

}
