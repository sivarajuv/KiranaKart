package com.kiranakart;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "claude.api.key=test-key",
    "jwt.secret=TestSecretKeyForJWTTokenGenerationMustBe256BitsLongXXXXXXXXX"
})
class KiranaKartApplicationTests {
    @Test
    void contextLoads() {
    }
}
