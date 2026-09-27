package com.qoohi.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI; import java.net.URLEncoder; import java.net.http.*; import java.nio.charset.StandardCharsets; import java.util.*;

@Service
public class MapsService {
  private final ObjectMapper json; private final String key;
  public MapsService(ObjectMapper json,@Value("${qoohi.places-api-key:}") String key){this.json=json;this.key=key;}
  public List<Map<String,Object>> suggest(String q){ if(key.isBlank()||q==null||q.trim().length()<3)return List.of(); try{
    String url="https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+enc(q)+"&components=country:ke&types=establishment&key="+enc(key);
    JsonNode root=json.readTree(HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create(url)).GET().build(),HttpResponse.BodyHandlers.ofString()).body()); List<Map<String,Object>> out=new ArrayList<>();
    for(JsonNode n:root.path("predictions")) out.add(Map.of("placeId",n.path("place_id").asText(),"text",n.path("description").asText())); return out;
  }catch(Exception e){return List.of();} }
  public Map<String,Object> details(String placeId){ if(key.isBlank()) throw new IllegalArgumentException("Google Places API key is not configured."); try{
    String url="https://maps.googleapis.com/maps/api/place/details/json?place_id="+enc(placeId)+"&fields=name,formatted_address,formatted_phone_number,geometry,photos&key="+enc(key);
    JsonNode n=json.readTree(HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create(url)).GET().build(),HttpResponse.BodyHandlers.ofString()).body()).path("result"); Map<String,Object> out=new HashMap<>(); out.put("name",n.path("name").asText()); out.put("location",n.path("formatted_address").asText()); out.put("phone",n.path("formatted_phone_number").asText()); out.put("latitude",n.path("geometry").path("location").path("lat").asDouble()); out.put("longitude",n.path("geometry").path("location").path("lng").asDouble());
    if(n.path("photos").isArray()&&!n.path("photos").isEmpty()) out.put("photo_url","https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference="+enc(n.path("photos").get(0).path("photo_reference").asText())+"&key="+enc(key)); return out;
  }catch(Exception e){throw new IllegalArgumentException("Unable to read this Google Maps place.");} }
  private String enc(String s){return URLEncoder.encode(s,StandardCharsets.UTF_8);}
}
