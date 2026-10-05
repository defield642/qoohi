package com.qoohi.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DataSourceConfigTest {
  private final DataSourceConfig config = new DataSourceConfig();

  @Test
  void missingDatabaseUrlFailsWithConfigurationGuidance() {
    IllegalStateException error = assertThrows(
      IllegalStateException.class,
      () -> config.dataSource(""));

    assertEquals("DATABASE_URL must be configured before starting the backend.", error.getMessage());
  }

  @Test
  void postgresConnectionUriEncodesCredentialsInJdbcUrl() {
    try (HikariDataSource dataSource = (HikariDataSource) config.dataSource(
      "postgresql://user%40example:pass%25word@localhost:5432/qoohi?sslmode=require")) {
      assertEquals(
        "jdbc:postgresql://localhost:5432/qoohi?sslmode=require&user=user%40example&password=pass%25word",
        dataSource.getJdbcUrl());
    }
  }
}
