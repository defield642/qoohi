package com.qoohi.backend.api;

import com.fasterxml.jackson.databind.*;
import com.qoohi.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.net.URI; import java.net.http.*; import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController @RequestMapping("/api/ai")
public class AiController {
  private static final int MAX_PROMPT_LENGTH = 4_000;
  private static final int MAX_MESSAGES = 30;
  private static final int REQUESTS_PER_MINUTE = 12;
  private static final AtomicInteger CLEANUP_TICK = new AtomicInteger();
  private static final String SYSTEM_PROMPT = """
    You are QOOHI's patient, supportive Kenyan CBC learning tutor. Use age-appropriate language,
    follow the learner's stated grade and subject, and distinguish English from Kiswahili accurately.
    For learning questions, teach the reasoning in sequence instead of returning an answer alone:
    state the learning goal, explain one idea at a time in numbered steps, walk through a worked
    example, offer one short guided practice with a hint, then ask one check-for-understanding
    question and let the learner try. Do not reveal a practice answer before explaining how to
    reason it out. When the learner requests a direct answer, still show the reasoning before the
    conclusion. Keep each lesson focused and pause after the check question. For non-learning
    questions about QOOHI, answer directly and do not invent facts.
    """;
  private final ObjectMapper json; private final JdbcTemplate db; private final AuthService auth; private final String environmentKey; private final String model;
  public AiController(ObjectMapper json,JdbcTemplate db,AuthService auth,@Value("${OPENROUTER_API_KEY:}") String environmentKey,@Value("${OPENROUTER_MODEL:openrouter/free}") String model){this.json=json;this.db=db;this.auth=auth;this.environmentKey=environmentKey;this.model=model;}
  @PostMapping({"/chat","/materials","/topic-guide"}) public Map<String,Object> generate(@RequestBody Map<String,Object> body,HttpServletRequest request){
    if(auth.user(request.getHeader("Authorization"))==null)enforcePublicUsageLimit(request);
    Object messages=body.get("messages");
    Object rawPrompt=body.getOrDefault("prompt",body.getOrDefault("message",body.getOrDefault("topic","Help a Kenyan CBC learner.")));
    if(!(rawPrompt instanceof String))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"AI prompt must be plain text.");
    String prompt=(String)rawPrompt;
    if(messages instanceof List<?> list&&!list.isEmpty()){
      if(list.size()>MAX_MESSAGES)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Too many conversation messages.");
      Object last=list.get(list.size()-1);
      if(last instanceof Map<?,?> item){
        Object content=item.containsKey("content")?item.get("content"):"Help a Kenyan CBC learner.";
        if(!(content instanceof String))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"AI message content must be plain text.");
        prompt=(String)content;
      }
    }
    if(prompt.length()>MAX_PROMPT_LENGTH)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Your message is too long. Please keep it under 4,000 characters.");
    String key=environmentKey;
    try { List<Map<String,Object>> settings=db.queryForList("SELECT setting_value FROM ai_settings WHERE setting_key='openrouter_api_key' LIMIT 1"); if(!settings.isEmpty()&&!String.valueOf(settings.get(0).getOrDefault("setting_value","")).isBlank()) key=String.valueOf(settings.get(0).get("setting_value")); }
    catch(Exception e) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"AI configuration could not be loaded.",e); }
    if(key==null||key.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"The AI tutor is not configured yet.");
    try { Map<String,Object> payload=Map.of("model",model,"messages",List.of(Map.of("role","system","content",SYSTEM_PROMPT),Map.of("role","user","content",prompt)),"temperature",0.6); HttpRequest req=HttpRequest.newBuilder(URI.create("https://openrouter.ai/api/v1/chat/completions")).header("Authorization","Bearer "+key).header("Content-Type","application/json").header("HTTP-Referer","https://qoohi-web.onrender.com").header("X-Title","QOOHI").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build(); HttpResponse<String> response=HttpClient.newHttpClient().send(req,HttpResponse.BodyHandlers.ofString()); if(response.statusCode()<200||response.statusCode()>=300)throw new IllegalStateException("OpenRouter HTTP "+response.statusCode()); JsonNode root=json.readTree(response.body()); String content=root.path("choices").path(0).path("message").path("content").asText(""); if(content.isBlank())throw new IllegalStateException("AI provider returned an empty response."); Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("content",content);out.put("reply",content);out.put("provider","openrouter");if(request.getRequestURI().endsWith("topic-guide"))out.put("guide",content);return out; } catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"AI service is unavailable. Please try again.",e);}
  }
  private void enforcePublicUsageLimit(HttpServletRequest request) {
    if(CLEANUP_TICK.incrementAndGet()%128==0)db.update("DELETE FROM public_ai_usage WHERE window_start < now() - interval '2 hours'");
    String clientKey=sha256(request.getRemoteAddr()==null?"unknown":request.getRemoteAddr());
    List<Map<String,Object>> admitted=db.queryForList(
      "INSERT INTO public_ai_usage(client_key,window_start,request_count) VALUES(?,date_trunc('minute',now()),1) " +
      "ON CONFLICT(client_key,window_start) DO UPDATE SET request_count=public_ai_usage.request_count+1 " +
      "WHERE public_ai_usage.request_count < ? RETURNING request_count",
      clientKey,REQUESTS_PER_MINUTE
    );
    if(admitted.isEmpty())throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"AI preview limit reached. Please try again in a minute.");
  }
  private String sha256(String value) {
    try {
      byte[] digest=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch(Exception e) { throw new IllegalStateException("Unable to create a client rate-limit key.",e); }
  }
  @PostMapping("/subject-image") public Map<String,Object> subjectImage(@RequestBody Map<String,Object> body){return Map.of("ok",true,"url","https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80","subject",body.getOrDefault("subject","Learning"));}
  @PostMapping("/teacher-suggest") public Map<String,Object> teacherSuggest(){Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("teacher",null);out.put("reason","No teacher recommendation is available yet.");return out;}
  @PostMapping("/materials/download") public Map<String,Object> materialDownload(){return Map.of("ok",true,"message","Material download recorded.");}
  @PostMapping("/image/download") public Map<String,Object> imageDownload(){return Map.of("ok",true,"message","Image download recorded.");}
  @PostMapping("/stream") public Map<String,Object> stream(@RequestBody Map<String,Object> body,HttpServletRequest request){return generate(body,request);}
}
