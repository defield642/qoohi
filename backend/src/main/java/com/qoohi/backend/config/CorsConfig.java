package com.qoohi.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
public class CorsConfig {
  @Bean CorsFilter corsFilter(@Value("${qoohi.frontend-origin:http://localhost:5000}") String origin) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOriginPatterns(List.of(origin, "http://localhost:*", "https://*.qoohi.app"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("*")); c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**", c);
    return new CorsFilter(s);
  }
}
