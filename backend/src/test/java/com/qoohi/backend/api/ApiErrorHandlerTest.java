package com.qoohi.backend.api;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApiErrorHandlerTest {
  private final ApiErrorHandler handler = new ApiErrorHandler();

  @Test
  void invalidRequestsReturnClientErrorAndUsefulMessage() {
    var response = handler.invalidRequest(new IllegalArgumentException("Class name is required."));

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Class name is required.", response.getBody().get("error"));
  }

  @Test
  void missingRecordsReturnNotFound() {
    var response = handler.missingRecord(
      new org.springframework.dao.EmptyResultDataAccessException(1));

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("The requested record was not found.", response.getBody().get("error"));
  }

  @Test
  void frameworkErrorsKeepTheirHttpStatus() {
    var response = handler.unexpected(
      new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found."));

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Route not found.", response.getBody().get("error"));
  }

  @Test
  void databaseErrorsReturnServiceUnavailableWithoutLeakingSqlDetails() {
    var response = handler.databaseUnavailable(
      new DataAccessResourceFailureException("private connection details"));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    assertEquals("The database could not complete this request. Please try again.",
      response.getBody().get("error"));
  }

  @Test
  void unexpectedErrorsReturnServerErrorWithoutLeakingDetails() {
    var response = handler.unexpected(new IllegalStateException("internal stack detail"));

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertEquals("An unexpected server error occurred. Please try again.",
      response.getBody().get("error"));
  }
}
