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
    try { log.info("Verification email send starting purpose={} recipient={} transport={}", purpose, email, resendApiKey!=null&&!resendApiKey.isBlank()?"resend":"smtp"); sendEmail(email,subject,text); log.info("Verification email sent for purpose={} recipient={}",purpose,email); }
    catch (Exception e) { log.error("Verification email failed for purpose={} recipient={}. Check RESEND_API_KEY/EMAIL_FROM or SMTP configuration.",purpose,email,e); throw new IllegalStateException("Verification email could not be sent. Please try again later.",e); }
  }
  public void sendAdminCode(String email, String purpose) {
    email=normalize(email); String code=randomAdminCode();
    db.update("INSERT INTO auth_codes(email,code_hash,purpose,expires_at) VALUES (?,?,?,?)", email, hash(code), purpose, OffsetDateTime.now().plusMinutes(expiry));
    String subject="QOOHI administrator verification code"; String text="Your QOOHI administrator verification code is "+code+". It expires in "+expiry+" minutes.";
    try { log.info("Admin verification email send starting purpose={} recipient={}",purpose,email); sendEmail(email,subject,text); log.info("Admin verification email sent for purpose={} recipient={}",purpose,email); }
    catch (Exception e) { log.error("Admin verification email failed for purpose={} recipient={}",purpose,email,e); throw new IllegalStateException("Verification email could not be sent. Please try again later.",e); }
  }
  private void sendEmail(String recipient,String subject,String text) throws Exception {
    if (resendApiKey!=null&&!resendApiKey.isBlank()) {
      if (from.isBlank()) throw new IllegalStateException("EMAIL_FROM is required when using Resend.");
      String body=json.writeValueAsString(Map.of("from",from,"to",List.of(recipient),"subject",subject,"text",text));
      log.info("Email send starting provider=resend recipient={} from={}", recipient, from);
      HttpResponse<String> response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("https://api.resend.com/emails")).header("Authorization","Bearer "+resendApiKey).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
      log.info("Email send resolved provider=resend recipient={} status={} response={}", recipient, response.statusCode(), response.body());
      if(response.statusCode()<200||response.statusCode()>=300) throw new IllegalStateException("Resend HTTP "+response.statusCode()+": "+response.body());
      return;
    }
    if(from.isBlank()) throw new IllegalStateException("No email sender configured. Set RESEND_API_KEY and EMAIL_FROM, or SMTP_HOST/SMTP_USER/SMTP_PASS.");
    SimpleMailMessage m=new SimpleMailMessage(); m.setFrom(from); m.setTo(recipient); m.setSubject(subject); m.setText(text);
    log.info("Email send starting provider=smtp recipient={} from={}", recipient, from);
    mail.send(m);
    log.info("Email send resolved provider=smtp recipient={}", recipient);
  }
  public Map<String,Object> verify(String email, String code, String purpose) {
    verifyCode(email,code,purpose); return db.queryForMap("SELECT * FROM users WHERE email=?",normalize(email));
  }
  public Map<String,Object> verifyCode(String email,String code,String purpose){email=normalize(email); List<Map<String,Object>> rows=db.queryForList("SELECT * FROM auth_codes WHERE email=? AND purpose=? AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1",email,purpose); if(rows.isEmpty()||!hash(code).equals(rows.get(0).get("code_hash")))throw new IllegalArgumentException("Invalid or expired verification code."); db.update("UPDATE auth_codes SET consumed_at=now() WHERE id=?",rows.get(0).get("id")); return rows.get(0);}
  public UUID session(long userId, UUID institutionId) { UUID token=UUID.randomUUID(); db.update("INSERT INTO sessions(token,user_id,institution_id,expires_at) VALUES (?,?,?,?)",token,userId,institutionId,OffsetDateTime.now().plusDays(30)); return token; }
  public Map<String,Object> user(String authorization) {
    if (authorization == null || authorization.isBlank()) return null;
    String value = authorization.startsWith("Bearer ")
      ? authorization.substring("Bearer ".length()).trim()
      : authorization.trim();
    UUID token;
    try {
      token = UUID.fromString(value);
    } catch (IllegalArgumentException invalidToken) {
      return null;
    }
    List<Map<String,Object>> rows = db.queryForList(
      "SELECT u.*,s.institution_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>now()",
      token);
    return rows.isEmpty() ? null : rows.get(0);
  }
  private String hash(String value) { try { byte[] b=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); return HexFormat.of().formatHex(b); } catch(Exception e) { throw new IllegalStateException(e); } }
  private String randomAdminCode() { String upper="ABCDEFGHIJKLMNOPQRSTUVWXYZ", lower="abcdefghijklmnopqrstuvwxyz", digits="0123456789", special="!@#$%^&*()-_=+[]{}:,.?", all=upper+lower+digits+special; List<Character> chars=new ArrayList<>(); chars.add(upper.charAt(random.nextInt(upper.length()))); chars.add(lower.charAt(random.nextInt(lower.length()))); chars.add(digits.charAt(random.nextInt(digits.length()))); chars.add(special.charAt(random.nextInt(special.length()))); for(int i=4;i<32;i++) chars.add(all.charAt(random.nextInt(all.length()))); Collections.shuffle(chars,random); StringBuilder code=new StringBuilder(32); chars.forEach(code::append); return code.toString(); }
}
