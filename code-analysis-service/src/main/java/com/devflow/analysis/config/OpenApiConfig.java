package com.devflow.analysis.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI codeAnalysisOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DevFlow Code Analysis Service API")
                        .description("AI-powered code analysis and quality assessment service")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("DevFlow Team")
                                .email("support@devflow.com")));
    }
}