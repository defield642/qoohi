package com.qoohi.backend.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/admin")
public class AdminController {
  private final JdbcTemplate db; public AdminController(JdbcTemplate db){this.db=db;}
  @GetMapping("/overview") public Map<String,Object> overview(){return Map.of("users",db.queryForObject("SELECT count(*) FROM users",Long.class),"institutions",db.queryForObject("SELECT count(*) FROM institutions",Long.class),"students",db.queryForObject("SELECT count(*) FROM school_students",Long.class),"teachers",db.queryForObject("SELECT count(*) FROM users WHERE role='teacher'",Long.class));}
  @GetMapping("/users/all") public Map<String,Object> users(){return Map.of("users",db.queryForList("SELECT id,full_name,email,whatsapp,role,created_at FROM users ORDER BY created_at DESC"));}
}
