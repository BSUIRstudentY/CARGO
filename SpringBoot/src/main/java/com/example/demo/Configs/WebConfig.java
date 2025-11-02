// com.example.demo.Configs.WebConfig.java
package com.example.demo.Configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.resource.VersionResourceResolver;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                .resourceChain(true)  // Включает ETag + Last-Modified
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }
//penis big penis
        // Опционально: отдельно для assets (если они версионированы)
        // registry.addResourceHandler("/assets/**")
        //         .addResourceLocations("classpath:/static/assets/")
        //         .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
    }
