package com.qoohi.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AuthServiceTest {
  private final JdbcTemplate db = mock(JdbcTemplate.class);
  private final AuthService auth = new AuthService(
    db, mock(JavaMailSender.class), new ObjectMapper(), 10, "", "");

  @Test
  void malformedSessionTokenIsTreatedAsUnauthenticatedWithoutDatabaseAccess() {
    assertNull(auth.user("Bearer not-a-token"));

    verifyNoInteractions(db);
  }

  @Test
  void missingSessionIsTreatedAsUnauthenticated() {
    when(db.queryForList(any(String.class), any(Object[].class))).thenReturn(java.util.List.of());

    assertNull(auth.user(UUID.randomUUID().toString()));
  }

  @Test
  void databaseFailureIsNotMisreportedAsAnInvalidSession() {
    when(db.queryForList(any(String.class), any(Object[].class)))
      .thenThrow(new DataAccessResourceFailureException("database offline"));

    assertThrows(DataAccessResourceFailureException.class,
      () -> auth.user(UUID.randomUUID().toString()));
  }

  @Test
  void validBearerSessionReturnsItsUser() {
    UUID token = UUID.randomUUID();
    Map<String,Object> user = Map.of("id", 7L, "role", "teacher");
    when(db.queryForList(any(String.class), any(Object[].class))).thenReturn(java.util.List.of(user));

    assertEquals(user, auth.user("Bearer " + token));
    verify(db).queryForList(any(String.class), any(Object[].class));
  }
}
