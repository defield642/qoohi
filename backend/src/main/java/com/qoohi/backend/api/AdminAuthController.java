package com.qoohi.backend.api;

import com.qoohi.backend.service.AuthService;
import java.security.SecureRandom;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

/** Admin email verification and approval flow used by AdminApp. */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
  private static final String SUPERADMIN_EMAIL = "filemarshal757@gmail.com";
  private static final int ACCOUNT_LIMIT = 5;
  private final JdbcTemplate db;
  private final AuthService auth;
  private final SecureRandom random = new SecureRandom();

  public AdminAuthController(JdbcTemplate db, AuthService auth) { this.db = db; this.auth = auth; }

  @PostMapping("/send-code")
  public Map<String, Object> sendCode(@RequestBody Map<String, Object> body) {
    String email = auth.normalize(value(body, "email"));
    String mode = "login".equals(value(body, "mode")) ? "login" : "register";
    if (email.isBlank()) throw new IllegalArgumentException("Email is required.");
    if (count("SELECT count(*) FROM blocked_accounts WHERE lower(email)=lower(?)", email) > 0) throw new IllegalArgumentException("This email is permanently blocked.");
    if ("register".equals(mode) && value(body, "fullName").isBlank()) throw new IllegalArgumentException("Full name is required.");
    if ("login".equals(mode) && !SUPERADMIN_EMAIL.equals(email) && count("SELECT count(*) FROM admin_accounts WHERE lower(email)=lower(?)", email) == 0) {
      throw new IllegalArgumentException("Admin account not found.");
    }
    if ("register".equals(mode) && !SUPERADMIN_EMAIL.equals(email) && count("SELECT count(*) FROM admin_accounts") >= ACCOUNT_LIMIT) {
      throw new IllegalArgumentException("The administrator limit of 5 active accounts has been reached.");
    }
    auth.sendAdminCode(email, "admin_" + mode);
    return Map.of("ok", true, "message", "Verification code sent.");
  }

  @PostMapping("/verify-code")
  public Map<String, Object> verifyCode(@RequestBody Map<String, Object> body) {
    String email = auth.normalize(value(body, "email"));
    String mode = "login".equals(value(body, "mode")) ? "login" : "register";
    String code=value(body, "code");
    if (count("SELECT count(*) FROM blocked_accounts WHERE lower(email)=lower(?)", email) > 0) throw new IllegalArgumentException("This email is permanently blocked.");
    if(!code.matches("[A-Za-z0-9!@#$%^&*()_+=\\[\\]{}:,.?\\-]{32}")) throw new IllegalArgumentException("Admin verification code must be exactly 32 characters and include letters, numbers, and special characters.");
    auth.verifyCode(email, code, "admin_" + mode);
    Map<String, Object> account = account(email);
    if (account == null) {
      if (!"register".equals(mode) && !SUPERADMIN_EMAIL.equals(email)) throw new IllegalArgumentException("Admin account not found.");
      String name = value(body, "fullName");
      boolean superadmin = SUPERADMIN_EMAIL.equals(email);
      String key = accessKey();
      db.update("INSERT INTO admin_accounts(name,email,access_key,is_superadmin,active) VALUES(?,?,?,?,?)", name.isBlank() ? "QOOHI Superadmin" : name, email, key, superadmin, superadmin);
      account = account(email);
    }
    if (!Boolean.TRUE.equals(account.get("active"))) {
      return Map.of("ok", true, "pending", true, "message", "Registration received. A superadmin must verify this account before access is granted.");
    }
    return Map.of("ok", true, "accessKey", account.get("access_key"), "isSuperAdmin", Boolean.TRUE.equals(account.get("is_superadmin")));
  }

  @GetMapping("/check-verification")
  public Map<String, Object> checkVerification(@RequestParam String email) {
    Map<String, Object> account = account(auth.normalize(email));
    if (account == null || !Boolean.TRUE.equals(account.get("active"))) return Map.of("ok", false, "pending", true);
    return Map.of("ok", true, "accessKey", account.get("access_key"), "isSuperAdmin", Boolean.TRUE.equals(account.get("is_superadmin")));
  }

  private Map<String, Object> account(String email) {
    List<Map<String, Object>> rows = db.queryForList("SELECT * FROM admin_accounts WHERE lower(email)=lower(?)", email);
    return rows.isEmpty() ? null : rows.get(0);
  }
  private long count(String query, Object... args) { Long result = db.queryForObject(query, Long.class, args); return result == null ? 0 : result; }
  private String value(Map<String, Object> body, String key) { Object value = body.get(key); return value == null ? "" : String.valueOf(value).trim(); }
  private String accessKey() { return UUID.randomUUID()+"-"+UUID.randomUUID(); }
}
