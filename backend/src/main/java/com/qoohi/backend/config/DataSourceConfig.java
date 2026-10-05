package com.qoohi.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataSourceConfig {
  @Bean
  DataSource dataSource(@Value("${DATABASE_URL:}") String value) {
    if (value.isBlank()) {
      throw new IllegalStateException("DATABASE_URL must be configured before starting the backend.");
    }
    if (value.startsWith("jdbc:")) {
      HikariDataSource dataSource = new HikariDataSource();
      dataSource.setJdbcUrl(value);
      dataSource.setDriverClassName("org.postgresql.Driver");
      return dataSource;
    }

    URI uri = URI.create(value);
    String[] credentials = (uri.getUserInfo() == null ? ":" : uri.getUserInfo()).split(":", 2);
    String host = uri.getHost();
    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
    String path = uri.getPath() == null ? "/" : uri.getPath();
    String query = uri.getQuery() == null ? "" : uri.getQuery();
    String jdbc = "jdbc:postgresql://" + host + ":" + port + path + "?" + query
      + (query.isBlank() ? "" : "&")
      + "user=" + encode(credentials[0]) + "&password="
      + encode(credentials.length > 1 ? credentials[1] : "");

    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl(jdbc);
    dataSource.setDriverClassName("org.postgresql.Driver");
    return dataSource;
  }

  private String encode(String value) {
    return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
  }
}
