package com.kiranakart.config;

import com.kiranakart.service.ProductService;
import com.kiranakart.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) {
        userService.initDefaultUsers();
        productService.initializeSampleData();
        System.out.println("✅ Sample grocery data initialized!");
    }
}
