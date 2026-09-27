package com.qoohi.backend.api;

import com.fasterxml.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI; import java.net.http.*; import java.util.*;

@RestController @RequestMapping("/api/ai")
public class AiController {
  private final ObjectMapper json; private final String key; private final String model;
  public AiController(ObjectMapper json,@Value("${OPENAI_API_KEY:}") String key,@Value("${OPENAI_MODEL:gpt-4o-mini}") String model){this.json=json;this.key=key;this.model=model;}
  @PostMapping({"/chat","/materials","/topic-guide"}) public Map<String,Object> generate(@RequestBody Map<String,Object> body,HttpServletRequest request){
    String prompt=String.valueOf(body.getOrDefault("prompt",body.getOrDefault("message",body.getOrDefault("topic","Help a Kenyan CBC learner."))));
    if(key.isBlank()) { Map<String,Object> fallback=new HashMap<>(); fallback.put("ok",true); fallback.put("content","AI is not configured. Add OPENAI_API_KEY to enable QOOHI AI."); if(request.getRequestURI().endsWith("topic-guide"))fallback.put("guide",fallback.get("content")); return fallback; }
    try { Map<String,Object> payload=Map.of("model",model,"messages",List.of(Map.of("role","user","content",prompt)),"temperature",0.6); HttpRequest req=HttpRequest.newBuilder(URI.create("https://api.openai.com/v1/chat/completions")).header("Authorization","Bearer "+key).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build(); JsonNode root=json.readTree(HttpClient.newHttpClient().send(req,HttpResponse.BodyHandlers.ofString()).body()); String content=root.path("choices").path(0).path("message").path("content").asText("AI response unavailable."); Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("content",content);out.put("provider","openai");if(request.getRequestURI().endsWith("topic-guide"))out.put("guide",content);return out; } catch(Exception e){throw new IllegalArgumentException("AI service unavailable.");}
  }
  @PostMapping("/subject-image") public Map<String,Object> subjectImage(@RequestBody Map<String,Object> body){return Map.of("ok",true,"url","https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80","subject",body.getOrDefault("subject","Learning"));}
  @PostMapping("/teacher-suggest") public Map<String,Object> teacherSuggest(){Map<String,Object> out=new HashMap<>();out.put("ok",true);out.put("teacher",null);out.put("reason","No teacher recommendation is available yet.");return out;}
  @PostMapping("/materials/download") public Map<String,Object> materialDownload(){return Map.of("ok",true,"message","Material download recorded.");}
  @PostMapping("/image/download") public Map<String,Object> imageDownload(){return Map.of("ok",true,"message","Image download recorded.");}
  @PostMapping("/stream") public Map<String,Object> stream(@RequestBody Map<String,Object> body,HttpServletRequest request){return generate(body,request);}
}
