package com.qoohi.backend.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController @RequestMapping("/api/mpesa")
public class MpesaController {
  private final RestClient http = RestClient.builder().build();
  @Value("${daraja.base-url:https://sandbox.safaricom.co.ke}") String baseUrl;
  @Value("${daraja.consumer-key:}") String consumerKey; @Value("${daraja.consumer-secret:}") String consumerSecret;
  @Value("${daraja.short-code:}") String shortCode; @Value("${daraja.passkey:}") String passkey;
  @Value("${daraja.callback-url:http://localhost:8080/api/mpesa/callback}") String callbackUrl;

  @PostMapping("/stk-push") public ResponseEntity<?> stk(@Valid @RequestBody StkRequest request) {
    if (consumerKey.isBlank() || consumerSecret.isBlank() || shortCode.isBlank() || passkey.isBlank()) return ResponseEntity.status(503).body(Map.of("error", "M-Pesa Daraja credentials are not configured."));
    try {
      TokenResponse token = http.get().uri(baseUrl+"/oauth/v1/generate?grant_type=client_credentials").headers(h->h.setBasicAuth(consumerKey,consumerSecret)).retrieve().body(TokenResponse.class);
      String timestamp=LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")); String password=Base64.getEncoder().encodeToString((shortCode+passkey+timestamp).getBytes(StandardCharsets.UTF_8)); String phone=normalizePhone(request.phone());
      Map<String,Object> body=new LinkedHashMap<>(); body.put("BusinessShortCode",shortCode); body.put("Password",password); body.put("Timestamp",timestamp); body.put("TransactionType","CustomerPayBillOnline"); body.put("Amount",request.amount()); body.put("PartyA",phone); body.put("PartyB",shortCode); body.put("PhoneNumber",phone); body.put("CallBackURL",callbackUrl); body.put("AccountReference",request.accountReference()); body.put("TransactionDesc",request.description());
      return ResponseEntity.ok(http.post().uri(baseUrl+"/mpesa/stkpush/v1/processrequest").contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(Map.class));
    } catch(Exception e) { return ResponseEntity.status(502).body(Map.of("error","Daraja request failed.")); }
  }
  @PostMapping("/callback") public Map<String,String> callback(@RequestBody Map<String,Object> payload){return Map.of("ResultCode","0","ResultDesc","Accepted");}
  private String normalizePhone(String phone){String p=phone.replaceAll("\\D","");if(p.startsWith("0"))return "254"+p.substring(1);if(p.startsWith("7")||p.startsWith("1"))return "254"+p;return p;}
  public record StkRequest(@NotBlank String phone,@NotNull @DecimalMin("1.0") Double amount,@NotBlank String accountReference,@NotBlank String description){}
  public record TokenResponse(String access_token){}
}
