package com.qoohi.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private final String from; private final boolean enabled;
  public NotificationService(@Value("${qoohi.twilio.account-sid:}") String sid,@Value("${qoohi.twilio.auth-token:}") String token,@Value("${qoohi.twilio.whatsapp-from:}") String from){this.from=from;enabled=!sid.isBlank()&&!token.isBlank()&&!from.isBlank();if(enabled)Twilio.init(sid,token);}
  public void whatsapp(String to,String body){if(!enabled||to==null||to.isBlank())return;try{String normalized=to.startsWith("+")?to:"+"+to.replaceAll("\\D","");Message.creator(new PhoneNumber("whatsapp:"+normalized),new PhoneNumber("whatsapp:"+from),body).create();}catch(Exception ignored){}}
}
