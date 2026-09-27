package com.qoohi.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class AuthService {
  private final JdbcTemplate db; private final JavaMailSender mail; private final SecureRandom random = new SecureRandom();
  private final long expiry; private final String from;
  public AuthService(JdbcTemplate db, JavaMailSender mail, @Value("${qoohi.otp-expiry-minutes:10}") long expiry, @Value("${spring.mail.username:}") String from) { this.db=db; this.mail=mail; this.expiry=expiry; this.from=from; }
  public String normalize(String email) { return email == null ? "" : email.trim().toLowerCase(Locale.ROOT); }
  public void sendCode(String email, String purpose) {
    email=normalize(email); String code=String.format("%06d", random.nextInt(1_000_000));
    db.update("INSERT INTO auth_codes(email,code_hash,purpose,expires_at) VALUES (?,?,?,?)", email, hash(code), purpose, OffsetDateTime.now().plusMinutes(expiry));
    try { if (!from.isBlank()) { SimpleMailMessage m=new SimpleMailMessage(); m.setFrom(from); m.setTo(email); m.setSubject("QOOHI verification code"); m.setText("Your QOOHI code is "+code+". It expires in "+expiry+" minutes."); mail.send(m); } } catch (Exception ignored) {}
    System.out.println("QOOHI OTP for "+email+": "+code);
  }
  public Map<String,Object> verify(String email, String code, String purpose) {
    verifyCode(email,code,purpose); return db.queryForMap("SELECT * FROM users WHERE email=?",normalize(email));
  }
  public Map<String,Object> verifyCode(String email,String code,String purpose){email=normalize(email); List<Map<String,Object>> rows=db.queryForList("SELECT * FROM auth_codes WHERE email=? AND purpose=? AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1",email,purpose); if(rows.isEmpty()||!hash(code).equals(rows.get(0).get("code_hash")))throw new IllegalArgumentException("Invalid or expired verification code."); db.update("UPDATE auth_codes SET consumed_at=now() WHERE id=?",rows.get(0).get("id")); return rows.get(0);}
  public UUID session(long userId, UUID institutionId) { UUID token=UUID.randomUUID(); db.update("INSERT INTO sessions(token,user_id,institution_id,expires_at) VALUES (?,?,?,?)",token,userId,institutionId,OffsetDateTime.now().plusDays(30)); return token; }
  public Map<String,Object> user(String auth) { try { UUID token=UUID.fromString(auth==null?"":auth.replaceFirst("Bearer ","")); return db.queryForMap("SELECT u.*,s.institution_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>now()",token); } catch(Exception e) { return null; } }
  private String hash(String value) { try { byte[] b=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); return HexFormat.of().formatHex(b); } catch(Exception e) { throw new IllegalStateException(e); } }
}
