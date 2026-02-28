package com.example.demo;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.TrustAllStrategy;
import org.apache.hc.core5.http.ssl.TLS;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.util.TimeValue;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;

@SpringBootApplication
@EnableAsync
@EnableCaching
@EnableScheduling
@ComponentScan(basePackages = {"com.example.demo"})
public class  DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
    
    @Bean
    public RestTemplate restTemplate() throws Exception {
        // Устанавливаем системные свойства для более гибкой работы с SSL
        // Включаем все возможные протоколы, включая устаревшие (для совместимости)
        System.setProperty("jdk.tls.client.protocols", "TLSv1,TLSv1.1,TLSv1.2,TLSv1.3");
        System.setProperty("https.protocols", "TLSv1,TLSv1.1,TLSv1.2,TLSv1.3");
        
        // Создаём SSL context, который принимает все сертификаты (для работы с api.eurotorg.by)
        SSLContext sslContext = SSLContextBuilder
                .create()
                .loadTrustMaterial(new TrustAllStrategy())
                .build();
        
        // Получаем все доступные протоколы из SSL context
        String[] supportedProtocols = sslContext.getDefaultSSLParameters().getProtocols();
        
        // Получаем все доступные cipher suites из SSL context
        String[] supportedCipherSuites = sslContext.getDefaultSSLParameters().getCipherSuites();
        
        // Используем все доступные протоколы и cipher suites
        // Это позволяет использовать любые протоколы и шифры, которые поддерживает JVM
        SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(
                sslContext,
                supportedProtocols, // Используем все доступные протоколы
                supportedCipherSuites, // Используем все доступные cipher suites
                (HostnameVerifier) (hostname, session) -> true // Принимаем любой hostname
        );
        
        // Настраиваем connection manager
        HttpClientConnectionManager connectionManager = PoolingHttpClientConnectionManagerBuilder
                .create()
                .setSSLSocketFactory(sslSocketFactory)
                .build();
        
        // Создаём HTTP client с настроенным SSL
        CloseableHttpClient httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .evictIdleConnections(TimeValue.ofSeconds(30))
                .evictExpiredConnections()
                .build();
        
        // Создаём request factory с таймаутами
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setConnectTimeout(10000); // 10 seconds
        factory.setConnectionRequestTimeout(10000); // 10 seconds
        
        return new RestTemplate(factory);
    }

}
