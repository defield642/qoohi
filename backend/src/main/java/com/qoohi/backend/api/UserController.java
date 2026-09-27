package com.qoohi.backend.api;

import com.qoohi.backend.service.AuthService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api")
public class UserController {
  private final JdbcTemplate db; private final AuthService auth;
  public UserController(JdbcTemplate db,AuthService auth){this.db=db;this.auth=auth;}
  @PostMapping("/auth/request-code") public Map<String,Object> request(@RequestBody Map<String,Object>b){String email=auth.normalize(String.valueOf(b.getOrDefault("email",""))); if(email.isBlank())throw new IllegalArgumentException("Email is required."); if(db.queryForObject("SELECT count(*) FROM users WHERE email=?",Integer.class,email)==0) throw new IllegalArgumentException("No QOOHI user exists for this email. Ask an institution to register you first."); auth.sendCode(email,"user_login"); return Map.of("ok",true,"message","Login code sent.");}
  @PostMapping("/teacher/profile") public Map<String,Object> teacherProfile(@RequestHeader("Authorization")String h,@RequestBody Map<String,Object>b){Map<String,Object>u=required(h);if(!"teacher".equals(u.get("role")))throw new IllegalArgumentException("Teacher login required.");db.update("UPDATE users SET home_location=?,latitude=?,longitude=?,subjects_json=? WHERE id=?",b.get("location"),b.get("latitude"),b.get("longitude"),b.getOrDefault("subjects","[]"),u.get("id"));db.update("INSERT INTO teacher_profiles(user_id,location_label,latitude,longitude,subjects_json) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET location_label=excluded.location_label,latitude=excluded.latitude,longitude=excluded.longitude,subjects_json=excluded.subjects_json",u.get("id"),b.get("location"),b.get("latitude"),b.get("longitude"),b.getOrDefault("subjects","[]"));return Map.of("ok",true);}
  @GetMapping("/notifications") public Map<String,Object> notifications(@RequestHeader("Authorization")String h){Map<String,Object>u=required(h);return Map.of("notifications",db.queryForList("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",u.get("id")));}
  private Map<String,Object> required(String h){Map<String,Object>u=auth.user(h);if(u==null)throw new IllegalArgumentException("Login required.");return u;}
}
