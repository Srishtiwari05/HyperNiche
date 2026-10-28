package com.hyperniche.users;

import com.hyperniche.brands.BrandProfile;
import com.hyperniche.brands.BrandRepository;
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
    private final BrandRepository brandRepository;

    public UserService(UserRepository userRepository, CreatorRepository creatorRepository, BrandRepository brandRepository) {
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
        this.brandRepository = brandRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse syncUser(UUID authenticatedUserId, UserSyncRequest request) {
        UUID targetId = authenticatedUserId;
        if (targetId == null) {
            throw new IllegalArgumentException("User ID is required for sync");
        }
        if (request.id() != null && !request.id().equals(targetId)) {
            throw new IllegalArgumentException("User ID does not match authenticated session");
        }

        User user = userRepository.findById(targetId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(targetId);
            return newUser;
        });

        user.setEmail(request.email());
        if (request.role() != null && !request.role().isBlank()) {
            String roleStr = request.role().toUpperCase();
            if ("BUSINESS".equals(roleStr)) {
                roleStr = "BRAND";
            }
            user.setRole(roleStr);
        }
        user.setDisplayName(request.displayName());
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }

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
        } else if ("BRAND".equalsIgnoreCase(saved.getRole()) || "BUSINESS".equalsIgnoreCase(saved.getRole())) {
            BrandProfile bp = brandRepository.findById(saved.getId()).orElseGet(() -> {
                BrandProfile newBp = new BrandProfile(saved.getId());
                newBp.setUser(saved);
                return newBp;
            });
            bp.setCompanyName(request.companyName() != null && !request.companyName().isBlank() ? request.companyName() : saved.getDisplayName());
            if (request.industry() != null && !request.industry().isBlank()) {
                bp.setIndustry(request.industry());
            }
            if (request.websiteUrl() != null && !request.websiteUrl().isBlank()) {
                bp.setWebsiteUrl(request.websiteUrl());
            }
            if (request.whatYouSell() != null && !request.whatYouSell().isBlank()) {
                bp.setDescription(request.whatYouSell());
            } else if (saved.getBio() != null) {
                bp.setDescription(saved.getBio());
            }
            brandRepository.save(bp);
        }

        return UserResponse.fromEntity(saved);
    }
}
