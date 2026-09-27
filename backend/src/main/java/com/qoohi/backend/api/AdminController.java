package com.qoohi.backend.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/admin")
public class AdminController {
  private final JdbcTemplate db; public AdminController(JdbcTemplate db){this.db=db;}
  @GetMapping("/overview") public Map<String,Object> overview(){return Map.of("users",db.queryForObject("SELECT count(*) FROM users",Long.class),"institutions",db.queryForObject("SELECT count(*) FROM institutions",Long.class),"students",db.queryForObject("SELECT count(*) FROM school_students",Long.class),"teachers",db.queryForObject("SELECT count(*) FROM users WHERE role='teacher'",Long.class));}
  @GetMapping("/users/all") public Map<String,Object> users(){return Map.of("users",db.queryForList("SELECT id,full_name,email,whatsapp,role,created_at FROM users ORDER BY created_at DESC"));}
  @GetMapping("/accounts") public Map<String,Object> accounts(@RequestHeader(value="x-admin-key",required=false) String key){Map<String,Object> admin=require(key);return Map.of("accounts",db.queryForList("SELECT id,name,email,is_superadmin,active,created_at FROM admin_accounts ORDER BY created_at"),"isSuperAdmin",Boolean.TRUE.equals(admin.get("is_superadmin")));}
  @PostMapping("/verify-account") public Map<String,Object> verifyAccount(@RequestHeader(value="x-admin-key",required=false) String key,@RequestBody Map<String,Object> body){requireSuperadmin(key);long id=number(body.get("id"));db.update("UPDATE admin_accounts SET active=true WHERE id=? AND is_superadmin=false",id);return Map.of("ok",true,"message","Admin account verified.");}
  @PostMapping("/remove-account") public Map<String,Object> removeAccount(@RequestHeader(value="x-admin-key",required=false) String key,@RequestBody Map<String,Object> body){requireSuperadmin(key);long id=number(body.get("id"));db.update("DELETE FROM admin_accounts WHERE id=? AND is_superadmin=false",id);return Map.of("ok",true,"message","Admin account removed.");}
  private Map<String,Object> require(String key){List<Map<String,Object>> rows=db.queryForList("SELECT * FROM admin_accounts WHERE access_key=? AND active=true",key==null?"":key);if(rows.isEmpty())throw new IllegalArgumentException("Admin session expired.");return rows.get(0);}
  private void requireSuperadmin(String key){if(!Boolean.TRUE.equals(require(key).get("is_superadmin")))throw new IllegalArgumentException("Superadmin access required.");}
  private long number(Object value){try{return Long.parseLong(String.valueOf(value));}catch(Exception e){throw new IllegalArgumentException("Account id is required.");}}
}
