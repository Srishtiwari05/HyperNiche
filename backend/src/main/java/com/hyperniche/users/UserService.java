package com.hyperniche.users;

import com.hyperniche.creators.CreatorProfile;
import com.hyperniche.creators.CreatorRepository;
import com.hyperniche.users.dto.UserResponse;
import com.hyperniche.users.dto.UserSyncRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;

    public UserService(UserRepository userRepository, CreatorRepository creatorRepository) {
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse syncUser(UUID authenticatedUserId, UserSyncRequest request) {
        UUID targetId = authenticatedUserId != null ? authenticatedUserId : request.id();
        if (targetId == null) {
            throw new IllegalArgumentException("User ID is required for sync");
        }

        User user = userRepository.findById(targetId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(targetId);
            return newUser;
        });

        user.setEmail(request.email());
        if (request.role() != null && !request.role().isBlank()) {
            user.setRole(request.role().toUpperCase());
        }
        user.setDisplayName(request.displayName());
        user.setAvatarUrl(request.avatarUrl());
        user.setBio(request.bio());

        User saved = userRepository.save(user);

        if ("CREATOR".equalsIgnoreCase(saved.getRole())) {
            CreatorProfile cp = creatorRepository.findById(saved.getId()).orElseGet(() -> {
                CreatorProfile newCp = new CreatorProfile(saved.getId());
                newCp.setUser(saved);
                return newCp;
            });
            if (request.handle() != null && !request.handle().isBlank()) {
                cp.setInstagramHandle(request.handle());
            }
            if (request.niche() != null && !request.niche().isBlank()) {
                cp.setNiche(request.niche());
            }
            if (request.followersCount() != null) {
                cp.setFollowersCount(request.followersCount());
            }
            if (request.websiteUrl() != null && !request.websiteUrl().isBlank()) {
                cp.setWebsiteUrl(request.websiteUrl());
            }
            if (request.rateReelInr() != null) {
                cp.setRateReelInr(request.rateReelInr());
            }
            creatorRepository.save(cp);
        }

        return UserResponse.fromEntity(saved);
    }
}
