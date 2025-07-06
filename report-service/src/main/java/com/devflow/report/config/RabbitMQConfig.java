package com.devflow.report.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ANALYSIS_RESULTS_QUEUE = "analysis.results";
    public static final String ANALYSIS_ERRORS_QUEUE = "analysis.errors";
    public static final String REPORT_NOTIFICATIONS_QUEUE = "report.notifications";
    public static final String DEVFLOW_EXCHANGE = "devflow.exchange";

    @Bean
    public TopicExchange devflowExchange() {
        return new TopicExchange(DEVFLOW_EXCHANGE);
    }

    @Bean
    public Queue analysisResultsQueue() {
        return new Queue(ANALYSIS_RESULTS_QUEUE, true);
    }

    @Bean
    public Queue analysisErrorsQueue() {
        return new Queue(ANALYSIS_ERRORS_QUEUE, true);
    }

    @Bean
    public Queue reportNotificationsQueue() {
        return new Queue(REPORT_NOTIFICATIONS_QUEUE, true);
    }

    @Bean
    public Binding analysisResultsBinding() {
        return BindingBuilder.bind(analysisResultsQueue())
                .to(devflowExchange())
                .with("analysis.completed");
    }

    @Bean
    public Binding analysisErrorsBinding() {
        return BindingBuilder.bind(analysisErrorsQueue())
                .to(devflowExchange())
                .with("analysis.failed");
    }

    @Bean
    public Binding reportNotificationsBinding() {
        return BindingBuilder.bind(reportNotificationsQueue())
                .to(devflowExchange())
                .with("report.generated");
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
}