package com.qoohi.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataSourceConfig {
  @Bean
  DataSource dataSource(@Value("${DATABASE_URL:postgresql://neondb_owner:npg_FwWVka8v0XMr@ep-solitary-wind-b4ktnr2o-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require}") String value) {
    if (value.startsWith("jdbc:")) { HikariDataSource ds=new HikariDataSource(); ds.setJdbcUrl(value); ds.setDriverClassName("org.postgresql.Driver"); return ds; }
    URI uri=URI.create(value); String[] credentials=(uri.getUserInfo()==null?":":uri.getUserInfo()).split(":",2); String host=uri.getHost(); int port=uri.getPort()>0?uri.getPort():5432; String path=uri.getPath()==null?"/":uri.getPath();
    String query=uri.getQuery()==null?"":uri.getQuery(); String jdbc="jdbc:postgresql://"+host+":"+port+path+"?"+query+(query.isBlank()?"":"&")+"user="+encode(credentials[0])+"&password="+encode(credentials.length>1?credentials[1]:"");
    HikariDataSource ds=new HikariDataSource(); ds.setJdbcUrl(jdbc); ds.setDriverClassName("org.postgresql.Driver"); return ds;
  }
  private String encode(String value){return java.net.URLEncoder.encode(URLDecoder.decode(value,StandardCharsets.UTF_8),StandardCharsets.UTF_8);}
}
