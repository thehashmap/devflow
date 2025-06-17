package com.devflow.analysis.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.concurrent.Executor;

@Configuration
public class CodeAnalysisConfig {

    // RabbitMQ Configuration
    @Bean
    public TopicExchange analysisStatusExchange() {
        return new TopicExchange("analysis.status.exchange");
    }

    @Bean
    public TopicExchange reportGenerationExchange() {
        return new TopicExchange("report.generation.exchange");
    }

    @Bean
    public Queue analysisCompletedQueue() {
        return QueueBuilder.durable("analysis.completed.queue").build();
    }

    @Bean
    public Queue analysisFailedQueue() {
        return QueueBuilder.durable("analysis.failed.queue").build();
    }

    @Bean
    public Queue reportGenerationQueue() {
        return QueueBuilder.durable("report.generation.queue").build();
    }

    @Bean
    public Binding analysisCompletedBinding() {
        return BindingBuilder
                .bind(analysisCompletedQueue())
                .to(analysisStatusExchange())
                .with("analysis.status.completed");
    }

    @Bean
    public Binding analysisFailedBinding() {
        return BindingBuilder
                .bind(analysisFailedQueue())
                .to(analysisStatusExchange())
                .with("analysis.status.failed");
    }

    @Bean
    public Binding reportGenerationBinding() {
        return BindingBuilder
                .bind(reportGenerationQueue())
                .to(reportGenerationExchange())
                .with("report.generate");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }

    // WebClient Configuration for Ollama
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)); // 10MB
    }

    // Async Configuration
    @Bean(name = "analysisTaskExecutor")
    public Executor analysisTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("analysis-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}

