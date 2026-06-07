package ma.patericar;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Integration test that verifies the full Spring application context starts
 * successfully against an H2 in-memory database (no PostgreSQL required).
 *
 * Uses @ActiveProfiles("test") which loads application-test.yml:
 *   - H2 in-memory datasource (PostgreSQL mode)
 *   - Flyway disabled (JPA ddl-auto: create-drop)
 *   - Mail auto-configuration excluded
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
@DisplayName("Application context — integration test")
class ApplicationContextIT {

    @Test
    @DisplayName("Spring context should load without errors")
    void contextLoads() {
        assertThatCode(() -> {}).doesNotThrowAnyException();
    }
}
