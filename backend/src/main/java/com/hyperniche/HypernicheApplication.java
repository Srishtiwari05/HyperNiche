package com.hyperniche;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HypernicheApplication {

    public static void main(String[] args) {
        SpringApplication.run(HypernicheApplication.class, args);
    }
}
