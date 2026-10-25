package com.hyperniche.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.brand b JOIN FETCH c.creator cr " +
           "WHERE c.brand.id = :userId OR c.creator.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findUserConversations(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c WHERE c.brand.id = :brandId AND c.creator.id = :creatorId " +
           "AND (:campaignId IS NULL OR c.campaign.id = :campaignId)")
    Optional<Conversation> findExisting(
            @Param("brandId") UUID brandId,
            @Param("creatorId") UUID creatorId,
            @Param("campaignId") UUID campaignId
    );
}
