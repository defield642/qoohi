package com.qoohi.backend.api;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public service landing endpoint for the Render web service. */
@RestController
public class RootController {

  @GetMapping("/")
  public Map<String, Object> root() {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("name", "QOOHI API");
    response.put("status", "online");
    response.put("database", "postgresql");
    response.put("health", "/api/health");
    response.put("oauthStart", "/api/auth/oauth/google/start");
    response.put("api", "/api");
    return response;
  }
}
