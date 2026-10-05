package com.qoohi.backend.api;

import com.qoohi.backend.service.AuthService;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.net.URI;
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
      "students", db.queryForList("SELECT DISTINCT u.id,u.full_name,u.email,u.whatsapp,u.role,u.balance,u.home_location FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN users u ON m.learner_type='user' AND u.id=m.learner_id WHERE c.teacher_id=? AND u.role='student' ORDER BY u.full_name", teacher.get("id")),
      "children", db.queryForList("SELECT DISTINCT p.*,u.full_name parent_name,u.email parent_email FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN parent_students p ON m.learner_type='parent_child' AND p.id=m.learner_id JOIN users u ON u.id=p.parent_user_id WHERE c.teacher_id=? ORDER BY p.child_name", teacher.get("id")),
      "institutionLearners", db.queryForList("SELECT DISTINCT s.id,s.full_name,s.grade_key,s.class_name,s.institution_id FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN school_students s ON m.learner_type='institution' AND s.id=m.learner_id WHERE c.teacher_id=? ORDER BY s.full_name", teacher.get("id")),
      "classes", db.queryForList("SELECT c.id,c.name,c.subject,c.grade,c.description,c.created_at,COUNT(DISTINCT (cs.learner_type,cs.learner_id)) FILTER (WHERE cs.learner_id IS NOT NULL) AS student_count,c.lesson_count AS current_lesson FROM teacher_classes c LEFT JOIN teacher_class_members cs ON cs.class_id=c.id WHERE c.teacher_id=? GROUP BY c.id ORDER BY c.name", teacher.get("id")),
      "progress", db.queryForList("SELECT p.*,u.full_name student_name FROM teacher_progress p LEFT JOIN users u ON u.id=p.student_user_id WHERE p.teacher_id=? ORDER BY p.created_at DESC LIMIT 100", teacher.get("id")),
      "assignments", db.queryForList("SELECT id,class_id,title,filename,created_at FROM teacher_assignments WHERE teacher_id=? ORDER BY created_at DESC", teacher.get("id")));
  }

  @GetMapping("/teacher/classes")
  public Map<String,Object> classes(@RequestHeader("Authorization") String header) {
    Map<String,Object> teacher = teacher(header);
    return Map.of("classes", db.queryForList(
      "SELECT c.id,c.name,c.subject,c.grade,c.description,c.created_at,COUNT(DISTINCT (m.learner_type,m.learner_id)) FILTER (WHERE m.learner_id IS NOT NULL) AS student_count,c.lesson_count AS current_lesson " +
      "FROM teacher_classes c LEFT JOIN teacher_class_members m ON m.class_id=c.id " +
      "WHERE c.teacher_id=? GROUP BY c.id ORDER BY c.created_at DESC,c.name", teacher.get("id")));
  }

  @GetMapping("/teacher/classes/{classId}/available-learners")
  public Map<String,Object> availableClassLearners(@RequestHeader("Authorization") String header, @PathVariable long classId) {
    Map<String,Object> teacher = teacher(header);
    teacherClass(teacher, classId);
    return Map.of("learners", db.queryForList(
      "SELECT available.learner_type AS \"learnerType\",available.learner_id AS \"learnerId\",available.full_name AS \"fullName\",available.grade " +
      "FROM (" +
      " SELECT 'user' AS learner_type,u.id AS learner_id,u.full_name,u.grade_level AS grade FROM users u WHERE u.role='student' " +
      " UNION ALL SELECT 'parent_child',p.id,p.child_name,p.grade_level FROM parent_students p " +
      " UNION ALL SELECT 'institution',s.id,s.full_name,s.grade_key FROM school_students s " +
      ") available WHERE NOT EXISTS (SELECT 1 FROM teacher_class_members m WHERE m.class_id=? AND m.learner_type=available.learner_type AND m.learner_id=available.learner_id) " +
      "ORDER BY lower(available.full_name) LIMIT 250", classId));
  }

  @GetMapping("/teacher/classes/{classId}")
  public Map<String,Object> classDetails(@RequestHeader("Authorization") String header, @PathVariable long classId) {
    Map<String,Object> teacher = teacher(header);
    Map<String,Object> classInfo = teacherClass(teacher, classId);
    List<Map<String,Object>> learners = db.queryForList(
      "SELECT m.learner_type AS \"learnerType\",m.learner_id AS \"learnerId\",m.enrolled_at AS \"enrolledAt\",u.full_name AS \"fullName\",u.email AS email,u.grade_level AS grade " +
      "FROM teacher_class_members m JOIN users u ON m.learner_type='user' AND u.id=m.learner_id WHERE m.class_id=? " +
      "UNION ALL SELECT m.learner_type,m.learner_id,m.enrolled_at,p.child_name,NULL,p.grade_level FROM teacher_class_members m JOIN parent_students p ON m.learner_type='parent_child' AND p.id=m.learner_id WHERE m.class_id=? " +
      "UNION ALL SELECT m.learner_type,m.learner_id,m.enrolled_at,s.full_name,NULL,s.grade_key FROM teacher_class_members m JOIN school_students s ON m.learner_type='institution' AND s.id=m.learner_id WHERE m.class_id=? " +
      "ORDER BY \"fullName\"", classId, classId, classId);
    return Map.of(
      "class", classInfo,
      "learners", learners,
      "lessons", db.queryForList("SELECT id,lesson_number AS \"lessonNumber\",title,subject,starts_at,meeting_url,notes,notes_filename AS \"notesFilename\",created_at FROM teacher_lessons WHERE class_id=? ORDER BY lesson_number", classId),
      "assignments", db.queryForList("SELECT id,title,subject,instructions,due_at,link_url,filename,created_at FROM teacher_assignments WHERE class_id=? AND teacher_id=? ORDER BY created_at DESC", classId, teacher.get("id")),
      "submissions", db.queryForList(
        "SELECT s.id AS \"submissionId\",s.assignment_id AS \"assignmentId\",s.learner_type AS \"learnerType\",s.learner_id AS \"learnerId\",s.filename,s.submitted_at AS \"submittedAt\",s.score,s.max_score AS \"maxScore\",s.feedback,s.marked_at AS \"markedAt\",a.title AS \"assignmentTitle\",u.full_name AS \"learnerName\" " +
        "FROM teacher_assignment_submissions s JOIN teacher_assignments a ON a.id=s.assignment_id " +
        "JOIN LATERAL (SELECT u.full_name FROM users u WHERE s.learner_type='user' AND u.id=s.learner_id UNION ALL SELECT p.child_name FROM parent_students p WHERE s.learner_type='parent_child' AND p.id=s.learner_id UNION ALL SELECT i.full_name FROM school_students i WHERE s.learner_type='institution' AND i.id=s.learner_id LIMIT 1) u ON true " +
        "WHERE a.class_id=? AND a.teacher_id=? ORDER BY s.submitted_at DESC", classId, teacher.get("id")));
  }

  @PostMapping("/teacher/classes")
  public Map<String,Object> createClass(@RequestHeader("Authorization") String header, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header); String name = text(body.get("name"));
    if (name.isBlank()) throw new IllegalArgumentException("Class name is required.");
    db.update("INSERT INTO teacher_classes(teacher_id,name,subject,grade,description) VALUES(?,?,?,?,?) ON CONFLICT(teacher_id,name) DO UPDATE SET subject=COALESCE(NULLIF(excluded.subject,''),teacher_classes.subject),grade=COALESCE(NULLIF(excluded.grade,''),teacher_classes.grade),description=COALESCE(NULLIF(excluded.description,''),teacher_classes.description)", teacher.get("id"), name, text(body.get("subject")), text(body.get("grade")), text(body.get("description")));
    return Map.of("ok", true, "message", "Class created.", "classes", db.queryForList("SELECT id,name,subject,grade,description,created_at FROM teacher_classes WHERE teacher_id=? ORDER BY created_at DESC,name", teacher.get("id")));
  }

  @PostMapping("/teacher/classes/{classId}/students")
  public Map<String,Object> addStudent(@RequestHeader("Authorization") String header, @PathVariable long classId, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header);
    teacherClass(teacher, classId);
    String type = text(body.get("learnerType"));
    long learnerId = number(body.get("learnerId"));
    if (!Set.of("user", "parent_child", "institution").contains(type)) throw new IllegalArgumentException("Choose a valid learner.");
    String validationQuery = switch (type) {
      case "user" -> "SELECT count(*) FROM users WHERE id=? AND role='student'";
      case "parent_child" -> "SELECT count(*) FROM parent_students WHERE id=?";
      default -> "SELECT count(*) FROM school_students WHERE id=?";
    };
    if (db.queryForObject(validationQuery, Integer.class, learnerId) == 0) throw new IllegalArgumentException("Learner not found.");
    db.update("INSERT INTO teacher_class_members(class_id,learner_type,learner_id) VALUES(?,?,?) ON CONFLICT DO NOTHING", classId, type, learnerId);
    return Map.of("ok", true, "message", "Student added to class.");
  }

  @PostMapping(value="/teacher/classes/{classId}/lessons", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  @Transactional
  public Map<String,Object> createLesson(@RequestHeader("Authorization") String header, @PathVariable long classId,
      @RequestParam String title, @RequestParam(required=false) String subject, @RequestParam(required=false) String startsAt,
      @RequestParam(required=false) String meetingUrl, @RequestParam(required=false) String notes,
      @RequestParam(required=false) MultipartFile notesFile) throws Exception {
    Map<String,Object> teacher = teacher(header);
    teacherClass(teacher, classId);
    String lessonTitle = text(title);
    String safeMeetingUrl = validWebUrl(text(meetingUrl), "Lesson link");
    if (lessonTitle.isBlank()) throw new IllegalArgumentException("Lesson title is required.");
    boolean hasNotesFile = notesFile != null && !notesFile.isEmpty();
    if (hasNotesFile && (!"application/pdf".equalsIgnoreCase(text(notesFile.getContentType()))
        && !String.valueOf(notesFile.getOriginalFilename()).toLowerCase(Locale.ROOT).endsWith(".pdf"))) {
      throw new IllegalArgumentException("Lesson notes must be a PDF file.");
    }
    if (hasNotesFile && notesFile.getSize() > 20L * 1024 * 1024) {
      throw new IllegalArgumentException("Lesson notes PDF must be 20 MB or smaller.");
    }
    int lessonNumber = db.queryForObject(
      "UPDATE teacher_classes SET lesson_count=lesson_count+1 WHERE id=? AND teacher_id=? RETURNING lesson_count",
      Integer.class, classId, teacher.get("id"));
    db.update("INSERT INTO teacher_lessons(class_id,teacher_id,lesson_number,title,subject,starts_at,meeting_url,notes,notes_filename,notes_content_type,notes_content) VALUES(?,?,?, ?,?,NULLIF(?,'')::timestamptz,?,?,?,?,?)",
      classId, teacher.get("id"), lessonNumber, lessonTitle, text(subject), text(startsAt), safeMeetingUrl,
      text(notes), hasNotesFile ? Optional.ofNullable(notesFile.getOriginalFilename()).orElse("lesson-notes.pdf") : null,
      hasNotesFile ? "application/pdf" : "application/pdf", hasNotesFile ? notesFile.getBytes() : null);
    return Map.of("ok", true, "message", "Lesson " + lessonNumber + " added.", "lessonNumber", lessonNumber);
  }

  @GetMapping("/classes")
  public Map<String,Object> learnerClasses(@RequestHeader("Authorization") String header) {
    Map<String,Object> user = auth.user(header);
    if (user == null || !Set.of("student", "parent").contains(text(user.get("role")))) throw new IllegalArgumentException("Student or parent login required.");
    List<Map<String,Object>> classes = familyClassRows(user);
    for (Map<String,Object> item : classes) {
      long classId = ((Number)item.get("id")).longValue();
      String learnerType = text(item.get("learnerType"));
      long learnerId = ((Number)item.get("learnerId")).longValue();
      item.put("lessons", db.queryForList("SELECT id,lesson_number AS \"lessonNumber\",title,subject,starts_at,meeting_url,notes,notes_filename AS \"notesFilename\" FROM teacher_lessons WHERE class_id=? ORDER BY lesson_number", classId));
      item.put("assignments", db.queryForList(
        "SELECT a.id,a.title,a.subject,a.instructions,a.due_at AS \"dueAt\",a.link_url AS \"linkUrl\",a.filename,a.created_at AS \"createdAt\",s.id AS \"submissionId\",s.filename AS \"submissionFilename\",s.submitted_at AS \"submittedAt\",s.score,s.max_score AS \"maxScore\",s.feedback,s.marked_at AS \"markedAt\" " +
        "FROM teacher_assignments a LEFT JOIN teacher_assignment_submissions s ON s.assignment_id=a.id AND s.learner_type=? AND s.learner_id=? WHERE a.class_id=? ORDER BY a.created_at DESC",
        learnerType, learnerId, classId));
    }
    return Map.of("classes", classes);
  }

  @GetMapping("/classes/lessons/{id}/notes")
  public ResponseEntity<byte[]> lessonNotes(@RequestHeader("Authorization") String header, @PathVariable long id) {
    Map<String,Object> user = auth.user(header);
    if (user == null) throw new IllegalArgumentException("Login required.");
    Map<String,Object> lesson = db.queryForMap("SELECT class_id FROM teacher_lessons WHERE id=?", id);
    long classId = ((Number)lesson.get("class_id")).longValue();
    String role = text(user.get("role"));
    if ("teacher".equals(role)) {
      teacherClass(user, classId);
    } else if (Set.of("student", "parent").contains(role)) {
      boolean enrolled = familyClassRows(user).stream()
        .anyMatch(item -> String.valueOf(item.get("id")).equals(String.valueOf(classId)));
      if (!enrolled) throw new IllegalArgumentException("Lesson notes are not available for your account.");
    } else {
      throw new IllegalArgumentException("Teacher, student, or parent login required.");
    }
    List<Map<String,Object>> files = db.queryForList(
      "SELECT notes_filename AS filename,notes_content_type AS content_type,notes_content AS content FROM teacher_lessons WHERE id=? AND notes_content IS NOT NULL",
      id);
    if (files.isEmpty()) throw new IllegalArgumentException("No PDF notes are attached to this lesson.");
    return fileResponse(files.get(0), "attachment");
  }

  @PostMapping("/teacher/progress")
  public Map<String,Object> progress(@RequestHeader("Authorization") String header, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header); String type = text(body.get("recordType"));
    if (!Set.of("grade", "attendance").contains(type)) throw new IllegalArgumentException("Record type must be grade or attendance.");
    Long studentUserId = nullableNumber(body.get("studentUserId"));
    Long parentStudentId = nullableNumber(body.get("parentStudentId"));
    if ((studentUserId == null) == (parentStudentId == null)) throw new IllegalArgumentException("Choose exactly one enrolled learner.");
    String membershipType = studentUserId == null ? "parent_child" : "user";
    long learnerId = studentUserId == null ? parentStudentId : studentUserId;
    if (db.queryForObject("SELECT count(*) FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id WHERE c.teacher_id=? AND m.learner_type=? AND m.learner_id=?", Integer.class, teacher.get("id"), membershipType, learnerId) == 0) throw new IllegalArgumentException("Learner is not enrolled in one of your classes.");
    db.update("INSERT INTO teacher_progress(teacher_id,student_user_id,parent_student_id,subject,record_type,value,notes) VALUES(?,?,?,?,?,?,?)", teacher.get("id"), studentUserId, parentStudentId, text(body.get("subject")), type, text(body.get("value")), text(body.get("notes")));
    return Map.of("ok", true, "message", "Progress saved.");
  }

  @PostMapping(value="/teacher/assignments", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String,Object> assignment(@RequestHeader("Authorization") String header, @RequestParam long classId, @RequestParam String title, @RequestParam(required=false) String subject, @RequestParam(required=false) String instructions, @RequestParam(required=false) String dueAt, @RequestParam(required=false) String linkUrl, @RequestParam(required=false) MultipartFile file) throws Exception {
    Map<String,Object> teacher = teacher(header);
    teacherClass(teacher, classId);
    if (text(title).isBlank()) throw new IllegalArgumentException("Assignment title is required.");
    String safeLink = validWebUrl(text(linkUrl), "Assignment link");
    boolean hasFile = file != null && !file.isEmpty();
    if (!hasFile && safeLink.isBlank()) throw new IllegalArgumentException("Add a PDF file or a web link for this assignment.");
    String type = hasFile && file.getContentType() != null ? file.getContentType() : "";
    if (hasFile && (!type.equalsIgnoreCase("application/pdf") && !String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT).endsWith(".pdf"))) throw new IllegalArgumentException("Assignments must be PDF files.");
    db.update("INSERT INTO teacher_assignments(teacher_id,class_id,title,subject,instructions,due_at,link_url,filename,content_type,content) VALUES(?,?,?, ?,?,NULLIF(?,'')::timestamptz,?,?,?,?)",
      teacher.get("id"), classId, text(title), text(subject), text(instructions), text(dueAt), safeLink,
      hasFile ? Optional.ofNullable(file.getOriginalFilename()).orElse("assignment.pdf") : null,
      hasFile ? "application/pdf" : null, hasFile ? file.getBytes() : null);
    return Map.of("ok", true, "message", "Assignment uploaded.");
  }

  @GetMapping("/teacher/assignments/{id}/download")
  public ResponseEntity<byte[]> download(@RequestHeader("Authorization") String header, @PathVariable long id) {
    Map<String,Object> teacher = teacher(header); Map<String,Object> file = db.queryForMap("SELECT filename,content_type,content FROM teacher_assignments WHERE id=? AND teacher_id=?", id, teacher.get("id"));
    return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + text(file.get("filename")).replaceAll("[\\\"\\r\\n]", "_") + "\"").body((byte[]) file.get("content"));
  }

  @GetMapping("/classes/assignments/{id}/file")
  public ResponseEntity<byte[]> learnerAssignmentFile(@RequestHeader("Authorization") String header, @PathVariable long id) {
    Map<String,Object> user = auth.user(header);
    if (user == null || !Set.of("student", "parent").contains(text(user.get("role")))) throw new IllegalArgumentException("Student or parent login required.");
    Map<String,Object> assignment = db.queryForMap("SELECT class_id FROM teacher_assignments WHERE id=?", id);
    List<Map<String,Object>> memberships = familyClassRows(user);
    if (memberships.stream().noneMatch(item -> String.valueOf(item.get("id")).equals(String.valueOf(assignment.get("class_id"))))) throw new IllegalArgumentException("Assignment not found for your account.");
    Map<String,Object> file = db.queryForMap("SELECT filename,content_type,content FROM teacher_assignments WHERE id=? AND content IS NOT NULL", id);
    return fileResponse(file, "inline");
  }

  @PostMapping(value="/classes/assignments/{id}/submissions", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String,Object> submitAssignment(@RequestHeader("Authorization") String header, @PathVariable long id, @RequestParam(required=false) String learnerType, @RequestParam(required=false) Long learnerId, @RequestParam MultipartFile file) throws Exception {
    Map<String,Object> user = auth.user(header);
    if (user == null || !Set.of("student", "parent").contains(text(user.get("role")))) throw new IllegalArgumentException("Student or parent login required.");
    if (file.isEmpty() || (!"application/pdf".equalsIgnoreCase(file.getContentType()) && !String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT).endsWith(".pdf"))) throw new IllegalArgumentException("Answers must be uploaded as PDF files.");
    Map<String,Object> assignment = db.queryForMap("SELECT class_id FROM teacher_assignments WHERE id=?", id);
    String actualType;
    long actualId;
    if ("student".equals(text(user.get("role")))) {
      actualType = "user";
      actualId = ((Number)user.get("id")).longValue();
    } else {
      actualType = text(learnerType);
      if (learnerId == null || !Set.of("parent_child", "institution").contains(actualType)) throw new IllegalArgumentException("Choose the child submitting this assignment.");
      actualId = learnerId;
      String ownsQuery = actualType.equals("parent_child")
        ? "SELECT count(*) FROM parent_students WHERE id=? AND parent_user_id=?"
        : "SELECT count(*) FROM school_students WHERE id=? AND lower(parent_email)=lower(?)";
      Object parentKey = actualType.equals("parent_child") ? user.get("id") : user.get("email");
      if (db.queryForObject(ownsQuery, Integer.class, actualId, parentKey) == 0) throw new IllegalArgumentException("You cannot submit work for this learner.");
    }
    long classId = ((Number)assignment.get("class_id")).longValue();
    if (db.queryForObject("SELECT count(*) FROM teacher_class_members WHERE class_id=? AND learner_type=? AND learner_id=?", Integer.class, classId, actualType, actualId) == 0) throw new IllegalArgumentException("This learner is not enrolled in the class.");
    db.update("INSERT INTO teacher_assignment_submissions(assignment_id,learner_type,learner_id,filename,content_type,content) VALUES(?,?,?,?,?,?) ON CONFLICT(assignment_id,learner_type,learner_id) DO UPDATE SET filename=excluded.filename,content_type=excluded.content_type,content=excluded.content,submitted_at=now(),score=NULL,max_score=NULL,feedback='',marked_at=NULL,marked_by=NULL",
      id, actualType, actualId, Optional.ofNullable(file.getOriginalFilename()).orElse("answer.pdf"), "application/pdf", file.getBytes());
    return Map.of("ok", true, "message", "Your answer was submitted.");
  }

  @GetMapping("/teacher/submissions/{id}/file")
  public ResponseEntity<byte[]> submissionFile(@RequestHeader("Authorization") String header, @PathVariable long id) {
    Map<String,Object> teacher = teacher(header);
    Map<String,Object> file = db.queryForMap("SELECT s.filename,s.content_type,s.content FROM teacher_assignment_submissions s JOIN teacher_assignments a ON a.id=s.assignment_id WHERE s.id=? AND a.teacher_id=?", id, teacher.get("id"));
    return fileResponse(file, "attachment");
  }

  @PostMapping("/teacher/submissions/{id}/mark")
  public Map<String,Object> markSubmission(@RequestHeader("Authorization") String header, @PathVariable long id, @RequestBody Map<String,Object> body) {
    Map<String,Object> teacher = teacher(header);
    BigDecimal score = decimal(body.get("score"), "Score");
    BigDecimal maxScore = decimal(body.get("maxScore"), "Maximum score");
    if (maxScore.signum() <= 0 || score.signum() < 0 || score.compareTo(maxScore) > 0) throw new IllegalArgumentException("Score must be between 0 and the maximum score.");
    int updated = db.update("UPDATE teacher_assignment_submissions s SET score=?,max_score=?,feedback=?,marked_at=now(),marked_by=? FROM teacher_assignments a WHERE s.id=? AND a.id=s.assignment_id AND a.teacher_id=?",
      score, maxScore, text(body.get("feedback")), teacher.get("id"), id, teacher.get("id"));
    if (updated == 0) throw new IllegalArgumentException("Submission not found.");
    return Map.of("ok", true, "message", "Mark saved.");
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
  private Map<String,Object> teacherClass(Map<String,Object> teacher, long classId) {
    List<Map<String,Object>> rows = db.queryForList("SELECT id,name,subject,grade,description,created_at,lesson_count AS \"currentLesson\" FROM teacher_classes WHERE id=? AND teacher_id=?", classId, teacher.get("id"));
    if (rows.isEmpty()) throw new IllegalArgumentException("Class not found.");
    return rows.get(0);
  }
  private List<Map<String,Object>> familyClassRows(Map<String,Object> user) {
    long userId = ((Number)user.get("id")).longValue();
    String role = text(user.get("role"));
    if ("student".equals(role)) {
      return db.queryForList(
        "SELECT c.id,c.name,c.subject,c.grade,c.description,c.lesson_count AS \"currentLesson\",t.full_name AS \"teacherName\",m.learner_type AS \"learnerType\",m.learner_id AS \"learnerId\",u.full_name AS \"learnerName\",u.grade_level AS \"learnerGrade\" " +
        "FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN users t ON t.id=c.teacher_id JOIN users u ON m.learner_type='user' AND u.id=m.learner_id " +
        "WHERE m.learner_type='user' AND m.learner_id=? ORDER BY c.name", userId);
    }
    return db.queryForList(
      "SELECT c.id,c.name,c.subject,c.grade,c.description,c.lesson_count AS \"currentLesson\",t.full_name AS \"teacherName\",m.learner_type AS \"learnerType\",m.learner_id AS \"learnerId\",p.child_name AS \"learnerName\",p.grade_level AS \"learnerGrade\" " +
      "FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN users t ON t.id=c.teacher_id JOIN parent_students p ON m.learner_type='parent_child' AND p.id=m.learner_id " +
      "WHERE m.learner_type='parent_child' AND p.parent_user_id=? " +
      "UNION ALL " +
      "SELECT c.id,c.name,c.subject,c.grade,c.description,c.lesson_count,t.full_name,m.learner_type,m.learner_id,s.full_name,s.grade_key " +
      "FROM teacher_class_members m JOIN teacher_classes c ON c.id=m.class_id JOIN users t ON t.id=c.teacher_id JOIN school_students s ON m.learner_type='institution' AND s.id=m.learner_id " +
      "WHERE m.learner_type='institution' AND lower(s.parent_email)=lower(?) ORDER BY name",
      userId, text(user.get("email")));
  }
  private String validWebUrl(String value, String label) {
    if (value.isBlank()) return "";
    try {
      URI uri = URI.create(value);
      if (!Set.of("http", "https").contains(String.valueOf(uri.getScheme()).toLowerCase(Locale.ROOT)) || uri.getHost() == null) throw new IllegalArgumentException();
      return uri.toString();
    } catch (IllegalArgumentException error) {
      throw new IllegalArgumentException(label + " must be a valid http or https URL.");
    }
  }
  private BigDecimal decimal(Object value, String label) {
    try { return new BigDecimal(text(value)); }
    catch (NumberFormatException error) { throw new IllegalArgumentException(label + " must be a valid number."); }
  }
  private ResponseEntity<byte[]> fileResponse(Map<String,Object> file, String disposition) {
    String filename = text(file.get("filename")).replaceAll("[\\\"\\r\\n]", "_");
    String contentType = text(file.get("content_type"));
    MediaType mediaType = contentType.isBlank() ? MediaType.APPLICATION_PDF : MediaType.parseMediaType(contentType);
    return ResponseEntity.ok().contentType(mediaType)
      .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
      .body((byte[])file.get("content"));
  }
  private String text(Object value) { return value == null ? "" : String.valueOf(value).trim(); }
  private long number(Object value) { try { return Long.parseLong(text(value)); } catch (Exception e) { throw new IllegalArgumentException("Student or class id is required."); } }
  private Long nullableNumber(Object value) { String v = text(value); return v.isBlank() ? null : number(v); }
  private double money(Object value) { try { return Math.max(0, Double.parseDouble(text(value))); } catch (Exception e) { return 0; } }
}
