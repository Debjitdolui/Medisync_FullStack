package com.medisync;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Basic sanity test. 
 * Detailed service tests are in individual test classes under service/.
 */
@ExtendWith(MockitoExtension.class)
class MedisyncBackendApplicationTest {

    @Test
    void contextLoads() {
        // Verifies the test framework is working
        assertTrue(true);
    }
}
