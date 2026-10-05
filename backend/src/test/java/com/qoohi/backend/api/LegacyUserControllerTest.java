package com.qoohi.backend.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qoohi.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LegacyUserControllerTest {
  private final JdbcTemplate db = mock(JdbcTemplate.class);
  private final LegacyUserController controller = new LegacyUserController(
    db, mock(AuthService.class), new ObjectMapper());

  @Test
  void healthChecksTheDatabaseBeforeReportingItHealthy() {
    when(db.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

    var response = controller.health();

    assertEquals(true, response.get("ok"));
    assertEquals("postgresql", response.get("database"));
    verify(db).queryForObject("SELECT 1", Integer.class);
  }
}
