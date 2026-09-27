package com.qoohi.backend.api;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestControllerAdvice public class ApiErrorHandler { @ExceptionHandler(Exception.class) ResponseEntity<Map<String,String>> error(Exception e){return ResponseEntity.badRequest().body(Map.of("error",e.getMessage()==null?"Request failed.":e.getMessage()));} }
