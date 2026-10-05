package com.qoohi.backend.api;

import com.qoohi.backend.service.AuthService;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api")
public class TeacherController {
  private final JdbcTemplate db;
  private final AuthService auth;
  public TeacherController(JdbcTemplate db, AuthService auth) { this.db = db; this.auth = auth; }

  @GetMapping("/teacher/workspace")
  public Map<String,Object> workspace(@RequestHeader("Authorization") String header) {
    Map<String,Object> teacher = teacher(header);
    return Map.of("ok", true, "currentTeacher", teacher,
      "students", db.queryForList("SELECT id,full_name,email,whatsapp,role,balance,home_location FROM users WHERE role IN ('student','parent') ORDER BY full_name"),
      "children", db.queryForList("SELECT p.*,u.full_name parent_name,u.email parent_email FROM parent_students p JOIN users u ON u.id=p.parent_user_id ORDER BY p.child_name"),
      "institutionLearners", db.queryForList("SELECT s.id,s.full_name,s.parent_name,s.parent_email,s.grade_key,s.class_name,s.institution_id FROM school_students s ORDER BY s.full_name"),
      "classes", db.queryForList("SELECT c.id,c.name,c.created_at,COUNT(cs.student_user_id) AS student_count FROM teacher_classes c LEFT JOIN teacher_class_students cs ON cs.class_id=c.id WHERE c.teacher_id=? GROUP BY c.id ORDER BY c.name", teacher.get("id")),
      "progress", db.queryForList("SELECT p.*,u.full_name student_name FROM teacher_progress p LEFT JOIN users u ON u.id=p.student_user_id WHERE p.teacher_id=? ORDER BY p.created_at DESC LIMIT 100", teacher.get("id")),
      "assignments", db.queryForList("SELECT id,class_id,title,filename,created_at FROM teacher_assignments WHERE teacher_id=? ORDER BY created_at DESC", teacher.get("id")));
  }

  @PostMapping("/teacher/classes")
  public Map<String,Object> createClass(@RequestHeader("Authorization") String header, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header); String name = text(body.get("name"));
    if (name.isBlank()) throw new IllegalArgumentException("Class name is required.");
    db.update("INSERT INTO teacher_classes(teacher_id,name) VALUES(?,?) ON CONFLICT(teacher_id,name) DO NOTHING", teacher.get("id"), name);
    return Map.of("ok", true, "message", "Class created.");
  }

  @PostMapping("/teacher/classes/{classId}/students")
  public Map<String,Object> addStudent(@RequestHeader("Authorization") String header, @PathVariable long classId, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header); long student = number(body.get("studentUserId"));
    if (db.queryForObject("SELECT count(*) FROM teacher_classes WHERE id=? AND teacher_id=?", Integer.class, classId, teacher.get("id")) == 0) throw new IllegalArgumentException("Class not found.");
    db.update("INSERT INTO teacher_class_students(class_id,student_user_id) VALUES(?,?) ON CONFLICT DO NOTHING", classId, student);
    return Map.of("ok", true, "message", "Student added to class.");
  }

  @PostMapping("/teacher/progress")
  public Map<String,Object> progress(@RequestHeader("Authorization") String header, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header); String type = text(body.get("recordType"));
    if (!Set.of("grade", "attendance").contains(type)) throw new IllegalArgumentException("Record type must be grade or attendance.");
    db.update("INSERT INTO teacher_progress(teacher_id,student_user_id,parent_student_id,subject,record_type,value,notes) VALUES(?,?,?,?,?,?,?)", teacher.get("id"), nullableNumber(body.get("studentUserId")), nullableNumber(body.get("parentStudentId")), text(body.get("subject")), type, text(body.get("value")), text(body.get("notes")));
    return Map.of("ok", true, "message", "Progress saved.");
  }

  @PostMapping(value="/teacher/assignments", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String,Object> assignment(@RequestHeader("Authorization") String header, @RequestParam long classId, @RequestParam String title, @RequestParam MultipartFile file) throws Exception {
    Map<String,Object> teacher = teacher(header); String type = file.getContentType() == null ? "" : file.getContentType();
    if (file.isEmpty() || (!type.equalsIgnoreCase("application/pdf") && !String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT).endsWith(".pdf"))) throw new IllegalArgumentException("Assignments must be PDF files.");
    if (db.queryForObject("SELECT count(*) FROM teacher_classes WHERE id=? AND teacher_id=?", Integer.class, classId, teacher.get("id")) == 0) throw new IllegalArgumentException("Class not found.");
    db.update("INSERT INTO teacher_assignments(teacher_id,class_id,title,filename,content_type,content) VALUES(?,?,?,?,?,?)", teacher.get("id"), classId, text(title), file.getOriginalFilename() == null ? "assignment.pdf" : file.getOriginalFilename(), "application/pdf", file.getBytes());
    return Map.of("ok", true, "message", "Assignment uploaded.");
  }

  @GetMapping("/teacher/assignments/{id}/download")
  public ResponseEntity<byte[]> download(@RequestHeader("Authorization") String header, @PathVariable long id) {
    Map<String,Object> teacher = teacher(header); Map<String,Object> file = db.queryForMap("SELECT filename,content_type,content FROM teacher_assignments WHERE id=? AND teacher_id=?", id, teacher.get("id"));
    return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + text(file.get("filename")).replaceAll("[\\\"\\r\\n]", "_") + "\"").body((byte[]) file.get("content"));
  }

  @GetMapping("/parent/teacher-updates")
  public Map<String,Object> parentUpdates(@RequestHeader("Authorization") String header) {
    Map<String,Object> parent = auth.user(header); if (parent == null) throw new IllegalArgumentException("Session expired.");
    return Map.of("updates", db.queryForList("SELECT p.*,ps.child_name, t.full_name teacher_name FROM teacher_progress p JOIN parent_students ps ON ps.id=p.parent_student_id JOIN users t ON t.id=p.teacher_id WHERE ps.parent_user_id=? ORDER BY p.created_at DESC LIMIT 100", parent.get("id")));
  }

  @PostMapping("/teacher/pricing")
  public Map<String,Object> pricing(@RequestHeader("Authorization") String header, @RequestBody Map<String,Object> body) {
    Map<String,Object> user = teacher(header); String specs = text(body.get("specializations"));
    if (specs.isBlank()) throw new IllegalArgumentException("Specialization is required before setting prices.");
    db.update("UPDATE users SET specializations=? WHERE id=?", specs, user.get("id"));
    db.update("INSERT INTO teacher_prices(teacher_id,daily,weekly,monthly,six_month,yearly) VALUES(?,?,?,?,?,?) ON CONFLICT(teacher_id) DO UPDATE SET daily=excluded.daily,weekly=excluded.weekly,monthly=excluded.monthly,six_month=excluded.six_month,yearly=excluded.yearly,updated_at=now()", user.get("id"), money(body.get("daily")), money(body.get("weekly")), money(body.get("monthly")), money(body.get("sixMonth")), money(body.get("yearly")));
    return Map.of("ok", true, "message", "Specialization and teacher prices saved.");
  }

  @GetMapping("/marketplace/teachers")
  public Map<String,Object> marketplaceTeachers() {
    return Map.of("teachers", db.queryForList(
      "SELECT u.id,u.full_name," +
      "COALESCE(NULLIF(u.specializations,''),NULLIF(tp.subjects_json,''),'[]') AS specializations," +
      "COALESCE(NULLIF(tp.location_label,''),'') AS home_location," +
      "string_agg(DISTINCT i.name, ', ' ORDER BY i.name) AS institution_names," +
      "p.daily,p.weekly,p.monthly,p.six_month,p.yearly " +
      "FROM users u LEFT JOIN teacher_prices p ON p.teacher_id=u.id " +
      "LEFT JOIN teacher_profiles tp ON tp.user_id=u.id " +
      "LEFT JOIN institution_staff ist ON ist.user_id=u.id " +
      "LEFT JOIN institutions i ON i.id=ist.institution_id " +
      "WHERE u.role='teacher' GROUP BY u.id,tp.subjects_json,tp.location_label,p.daily,p.weekly,p.monthly,p.six_month,p.yearly " +
      "ORDER BY u.full_name"
    ), "platformTiers", Map.of("daily", 400, "weekly", 1000, "monthly", 2500, "sixMonth", 6500, "yearly", 10000));
  }

  @GetMapping("/teacher/learners")
  public Map<String,Object> learners(@RequestHeader("Authorization") String header) {
    teacher(header);
    return Map.of("learners", db.queryForList(
      "SELECT row_number() OVER (ORDER BY display_name,source_type,grade_level) AS learner_key,display_name,source_type,grade_level,interests_json FROM (" +
      "SELECT u.full_name AS display_name,'student' AS source_type,u.grade_level,u.subjects_json AS interests_json FROM users u WHERE u.role='student' " +
      "UNION ALL SELECT p.child_name,'parent',p.grade_level,p.subjects_json FROM parent_students p " +
      "UNION ALL SELECT s.full_name,'institution',s.grade_key,s.subjects_json FROM school_students s" +
      ") directory ORDER BY display_name"
    ));
  }

  private Map<String,Object> teacher(String header) { Map<String,Object> user = auth.user(header); if (user == null || !"teacher".equals(user.get("role"))) throw new IllegalArgumentException("Teacher login required."); return user; }
  private String text(Object value) { return value == null ? "" : String.valueOf(value).trim(); }
  private long number(Object value) { try { return Long.parseLong(text(value)); } catch (Exception e) { throw new IllegalArgumentException("Student or class id is required."); } }
  private Long nullableNumber(Object value) { String v = text(value); return v.isBlank() ? null : number(v); }
  private double money(Object value) { try { return Math.max(0, Double.parseDouble(text(value))); } catch (Exception e) { return 0; } }
}
