package com.carbacount.auth.repository;

import com.carbacount.auth.entity.InvitationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitationTokenRepository extends JpaRepository<InvitationToken, UUID> {
    Optional<InvitationToken> findByToken(UUID token);

    void deleteByUser(com.carbacount.user.entity.User user);
}
