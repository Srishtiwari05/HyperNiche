package com.hyperniche.creators;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CreatorRepository extends JpaRepository<CreatorProfile, UUID> {

    @Query("SELECT c FROM CreatorProfile c JOIN FETCH c.user u WHERE (:niche IS NULL OR LOWER(c.niche) = LOWER(:niche))")
    Page<CreatorProfile> findByNiche(@Param("niche") String niche, Pageable pageable);
}
