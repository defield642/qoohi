package com.qoohi.backend.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicPreviewController {
  private final JdbcTemplate db;

  public PublicPreviewController(JdbcTemplate db) {
    this.db = db;
  }

  @GetMapping("/preview-stats")
  public Map<String, Object> previewStats() {
    return Map.of(
      "studentAccounts", count("SELECT count(*) FROM users WHERE role='student'"),
      "parentLinkedLearners", count("SELECT count(*) FROM parent_students"),
      "institutionLearners", count("SELECT count(*) FROM school_students"),
      "teachers", count("SELECT count(*) FROM (SELECT id FROM users WHERE role='teacher' UNION SELECT user_id AS id FROM institution_staff) directory"),
      "institutions", count("SELECT count(*) FROM institutions"),
      "classes", count("SELECT count(*) FROM school_classes"),
      "books", count("SELECT count(*) FROM iep_books"),
      "growth", growth()
    );
  }

  private List<Map<String, Object>> growth() {
    return db.query(
      """
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS month_start
        )
        SELECT
          to_char(month_start, 'Mon YYYY') AS label,
          (SELECT count(*) FROM users u
            WHERE u.role IN ('student', 'parent', 'teacher')
              AND u.created_at >= months.month_start
              AND u.created_at < months.month_start + INTERVAL '1 month') AS app_accounts,
          (SELECT count(*) FROM parent_students p
            WHERE p.created_at >= months.month_start
              AND p.created_at < months.month_start + INTERVAL '1 month') AS family_learners,
          (SELECT count(*) FROM institutions i
            WHERE i.created_at >= months.month_start
              AND i.created_at < months.month_start + INTERVAL '1 month') AS institutions,
          (SELECT count(*) FROM school_students s
            WHERE s.created_at >= months.month_start
              AND s.created_at < months.month_start + INTERVAL '1 month') AS institution_learners
        FROM months
        ORDER BY month_start
        """,
      (resultSet, rowNum) -> Map.of(
        "label", resultSet.getString("label"),
        "appAccounts", resultSet.getLong("app_accounts"),
        "familyLearners", resultSet.getLong("family_learners"),
        "institutions", resultSet.getLong("institutions"),
        "institutionLearners", resultSet.getLong("institution_learners")
      )
    );
  }

  private long count(String query) {
    Long value = db.queryForObject(query, Long.class);
    return value == null ? 0 : value;
  }
}
