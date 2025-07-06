package com.devflow.report;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableMongoAuditing
@EnableAsync
public class ReportServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(ReportServiceApplication.class, args);
	}
}