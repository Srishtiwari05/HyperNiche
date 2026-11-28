package com.hyperniche.users;

import com.hyperniche.creators.CreatorRepository;
import com.hyperniche.users.dto.UserSyncRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class UserSyncConcurrencyTest {
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private CreatorRepository creatorRepository;

    @Test
    void concurrentCreatorSyncsCreateOnlyOneProfile() throws Exception {
        UUID id = UUID.randomUUID();
        userRepository.saveAndFlush(new User(id, id + "@example.com", "CREATOR", "Creator", "", ""));
        UserSyncRequest request = new UserSyncRequest(id, id + "@example.com", "CREATOR", "Creator", null, "",
                "@creator", "Fashion", null, null, null, null, null, null);
        CountDownLatch start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            var first = pool.submit(() -> { start.await(); return userService.syncUser(id, request); });
            var second = pool.submit(() -> { start.await(); return userService.syncUser(id, request); });
            start.countDown();
            first.get(15, TimeUnit.SECONDS);
            second.get(15, TimeUnit.SECONDS);
            assertTrue(creatorRepository.existsById(id));
        } finally {
            pool.shutdownNow();
        }
    }
}
