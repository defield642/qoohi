package com.qoohi.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class AuthService {
  private static final Logger log = LoggerFactory.getLogger(AuthService.class);
  private final JdbcTemplate db; private final JavaMailSender mail; private final SecureRandom random = new SecureRandom();
  private final long expiry; private final String from; private final String resendApiKey; private final ObjectMapper json;
  public AuthService(JdbcTemplate db, JavaMailSender mail, ObjectMapper json, @Value("${qoohi.otp-expiry-minutes:10}") long expiry, @Value("${qoohi.mail-from:${spring.mail.username:}}") String from, @Value("${qoohi.resend-api-key:}") String resendApiKey) { this.db=db; this.mail=mail; this.json=json; this.expiry=expiry; this.from=from; this.resendApiKey=resendApiKey; }
  public String normalize(String email) { return email == null ? "" : email.trim().toLowerCase(Locale.ROOT); }
  public void sendCode(String email, String purpose) {
    email=normalize(email); String code=String.format("%06d", random.nextInt(1_000_000));
    db.update("INSERT INTO auth_codes(email,code_hash,purpose,expires_at) VALUES (?,?,?,?)", email, hash(code), purpose, OffsetDateTime.now().plusMinutes(expiry));
    String subject="QOOHI verification code"; String text="Your QOOHI code is "+code+". It expires in "+expiry+" minutes.";
    try { sendEmail(email,subject,text); log.info("Verification email sent for purpose={} recipient={}",purpose,email); }
    catch (Exception e) { log.error("Verification email failed for purpose={} recipient={}. Check RESEND_API_KEY/EMAIL_FROM or SMTP configuration.",purpose,email,e); throw new IllegalStateException("Verification email could not be sent. Please try again later.",e); }
  }
  private void sendEmail(String recipient,String subject,String text) throws Exception {
    if (resendApiKey!=null&&!resendApiKey.isBlank()) {
      if (from.isBlank()) throw new IllegalStateException("EMAIL_FROM is required when using Resend.");
      String body=json.writeValueAsString(Map.of("from",from,"to",List.of(recipient),"subject",subject,"text",text));
      HttpResponse<String> response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("https://api.resend.com/emails")).header("Authorization","Bearer "+resendApiKey).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
      if(response.statusCode()<200||response.statusCode()>=300) throw new IllegalStateException("Resend HTTP "+response.statusCode()+": "+response.body());
      return;
    }
    if(from.isBlank()) throw new IllegalStateException("No email sender configured. Set RESEND_API_KEY and EMAIL_FROM, or SMTP_HOST/SMTP_USER/SMTP_PASS.");
    SimpleMailMessage m=new SimpleMailMessage(); m.setFrom(from); m.setTo(recipient); m.setSubject(subject); m.setText(text); mail.send(m);
  }
  public Map<String,Object> verify(String email, String code, String purpose) {
    verifyCode(email,code,purpose); return db.queryForMap("SELECT * FROM users WHERE email=?",normalize(email));
  }
  public Map<String,Object> verifyCode(String email,String code,String purpose){email=normalize(email); List<Map<String,Object>> rows=db.queryForList("SELECT * FROM auth_codes WHERE email=? AND purpose=? AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1",email,purpose); if(rows.isEmpty()||!hash(code).equals(rows.get(0).get("code_hash")))throw new IllegalArgumentException("Invalid or expired verification code."); db.update("UPDATE auth_codes SET consumed_at=now() WHERE id=?",rows.get(0).get("id")); return rows.get(0);}
  public UUID session(long userId, UUID institutionId) { UUID token=UUID.randomUUID(); db.update("INSERT INTO sessions(token,user_id,institution_id,expires_at) VALUES (?,?,?,?)",token,userId,institutionId,OffsetDateTime.now().plusDays(30)); return token; }
  public Map<String,Object> user(String auth) { try { UUID token=UUID.fromString(auth==null?"":auth.replaceFirst("Bearer ","")); return db.queryForMap("SELECT u.*,s.institution_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>now()",token); } catch(Exception e) { return null; } }
  private String hash(String value) { try { byte[] b=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); return HexFormat.of().formatHex(b); } catch(Exception e) { throw new IllegalStateException(e); } }
}
