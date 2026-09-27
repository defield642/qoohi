package com.qoohi.backend.api;

import com.fasterxml.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.net.URI; import java.net.http.*; import java.util.*;

@RestController @RequestMapping("/api/ai")
public class AiController {
  private final ObjectMapper json; private final JdbcTemplate db; private final String environmentKey; private final String model;
  public AiController(ObjectMapper json,JdbcTemplate db,@Value("${OPENROUTER_API_KEY:}") String environmentKey,@Value("${OPENROUTER_MODEL:openrouter/free}") String model){this.json=json;this.db=db;this.environmentKey=environmentKey;this.model=model;}
  @PostMapping({"/chat","/materials","/topic-guide"}) public Map<String,Object> generate(@RequestBody Map<String,Object> body,HttpServletRequest request){
    Object messages=body.get("messages");
    String prompt=String.valueOf(body.getOrDefault("prompt",body.getOrDefault("message",body.getOrDefault("topic","Help a Kenyan CBC learner."))));
    if(messages instanceof List<?> list&&!list.isEmpty()){Object last=list.get(list.size()-1);if(last instanceof Map<?,?> item){Object content=item.containsKey("content")?item.get("content"):"Help a Kenyan CBC learner.";prompt=String.valueOf(content);}}
    String key=environmentKey;
    try { List<Map<String,Object>> settings=db.queryForList("SELECT setting_value FROM ai_settings WHERE setting_key='openrouter_api_key' LIMIT 1"); if(!settings.isEmpty()&&!String.valueOf(settings.get(0).getOrDefault("setting_value","")).isBlank()) key=String.valueOf(settings.get(0).get("setting_value")); } catch(Exception ignored) { }
    if(key==null||key.isBlank()) { Map<String,Object> fallback=new HashMap<>(); fallback.put("ok",true); fallback.put("content","AI is not configured. Add an OpenRouter API key in the admin settings."); if(request.getRequestURI().endsWith("topic-guide"))fallback.put("guide",fallback.get("content")); return fallback; }
    try { Map<String,Object> payload=Map.of("model",model,"messages",List.of(Map.of("role","system","content","You are QOOHI CBC tutor for Kenya. Follow the current Kenyan CBC structure, use age-appropriate language, distinguish English and Kiswahili accurately, teach in sequence, and include a short quiz after each major section."),Map.of("role","user","content",prompt)),"temperature",0.6); HttpRequest req=HttpRequest.newBuilder(URI.create("https://openrouter.ai/api/v1/chat/completions")).header("Authorization","Bearer "+key).header("Content-Type","application/json").header("HTTP-Referer","https://qoohi-web.onrender.com").header("X-Title","QOOHI").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build(); HttpResponse<String> response=HttpClient.newHttpClient().send(req,HttpResponse.BodyHandlers.ofString()); if(response.statusCode()<200||response.statusCode()>=300)throw new IllegalStateException("OpenRouter HTTP "+response.statusCode()+": "+response.body()); JsonNode root=json.readTree(response.body()); String content=root.path("choices").path(0).path("message").path("content").asText("AI response unavailable."); Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("content",content);out.put("reply",content);out.put("provider","openrouter");if(request.getRequestURI().endsWith("topic-guide"))out.put("guide",content);return out; } catch(Exception e){throw new IllegalArgumentException("AI service unavailable: "+e.getMessage());}
  }
  @PostMapping("/subject-image") public Map<String,Object> subjectImage(@RequestBody Map<String,Object> body){return Map.of("ok",true,"url","https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80","subject",body.getOrDefault("subject","Learning"));}
  @PostMapping("/teacher-suggest") public Map<String,Object> teacherSuggest(){Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("teacher",null);out.put("reason","No teacher recommendation is available yet.");return out;}
  @PostMapping("/materials/download") public Map<String,Object> materialDownload(){return Map.of("ok",true,"message","Material download recorded.");}
  @PostMapping("/image/download") public Map<String,Object> imageDownload(){return Map.of("ok",true,"message","Image download recorded.");}
  @PostMapping("/stream") public Map<String,Object> stream(@RequestBody Map<String,Object> body,HttpServletRequest request){return generate(body,request);}
}
