package com.qoohi.backend.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiErrorHandler {
  private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<Map<String,String>> invalidRequest(IllegalArgumentException error) {
    return ResponseEntity.badRequest().body(Map.of("error", message(error, "Invalid request.")));
  }

  @ExceptionHandler(EmptyResultDataAccessException.class)
  ResponseEntity<Map<String,String>> missingRecord(EmptyResultDataAccessException error) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(Map.of("error", "The requested record was not found."));
  }

  @ExceptionHandler(DataAccessException.class)
  ResponseEntity<Map<String,String>> databaseUnavailable(DataAccessException error) {
    log.error("Database operation failed while handling an API request.", error);
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
      .body(Map.of("error", "The database could not complete this request. Please try again."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String,String>> unexpected(Exception error) {
    if (error instanceof ErrorResponse frameworkError) {
      HttpStatusCode status = frameworkError.getStatusCode();
      String detail = frameworkError.getBody().getDetail();
      String message = detail == null || detail.isBlank()
        ? "The request could not be processed."
        : detail;
      return ResponseEntity.status(status).body(Map.of("error", message));
    }
    log.error("Unexpected failure while handling an API request.", error);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(Map.of("error", "An unexpected server error occurred. Please try again."));
  }

  private String message(IllegalArgumentException error, String fallback) {
    return error.getMessage() == null || error.getMessage().isBlank() ? fallback : error.getMessage();
  }
}
