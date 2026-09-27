package com.qoohi.backend.api;

import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/iep-books")
public class IepBookController {
  private final JdbcTemplate db;
  public IepBookController(JdbcTemplate db){this.db=db;}
  @GetMapping public Map<String,Object> list(@RequestParam int grade){return Map.of("books",db.queryForList("SELECT id,grade,subject,title,filename,content_type,created_at FROM iep_books WHERE grade=? ORDER BY subject",grade));}
  @GetMapping("/{id}/download") public ResponseEntity<byte[]> download(@PathVariable long id){Map<String,Object> book=db.queryForMap("SELECT filename,content_type,content FROM iep_books WHERE id=?",id);String filename=String.valueOf(book.get("filename"));MediaType type;try{type=MediaType.parseMediaType(String.valueOf(book.get("content_type")));}catch(Exception e){type=MediaType.APPLICATION_PDF;}return ResponseEntity.ok().contentType(type).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+filename.replaceAll("[\\\"\\r\\n]","_")+"\"").body((byte[])book.get("content"));}
}
