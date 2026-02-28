package com.carbon.accounting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.validation.annotation.Validated;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@Validated
public class CarbonAccountingApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarbonAccountingApplication.class, args);
	}

}
