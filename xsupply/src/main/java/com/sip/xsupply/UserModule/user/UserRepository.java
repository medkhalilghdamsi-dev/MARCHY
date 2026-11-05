package com.sip.xsupply.UserModule.user;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = """
        SELECT DISTINCT u FROM User u\s
        LEFT JOIN u.roles r
        WHERE (:userId IS NULL OR u.id != :userId)
        AND (:roleName IS NULL OR :roleName IN (SELECT r2.name FROM u.roles r2))
        AND (:enabled IS NULL OR u.enabled = :enabled)
        AND (:searchTerm IS NULL OR LOWER(u.firstname) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
               OR LOWER(u.lastname) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
       \s""",
            countQuery = """
        SELECT COUNT(DISTINCT u) FROM User u\s
        LEFT JOIN u.roles r
        WHERE (:userId IS NULL OR u.id != :userId)
        AND (:roleName IS NULL OR :roleName IN (SELECT r2.name FROM u.roles r2))
        AND (:enabled IS NULL OR u.enabled = :enabled)
        AND (:searchTerm IS NULL OR LOWER(u.firstname) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
               OR LOWER(u.lastname) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
       \s""")
    Page<User> findUsersWithFilters(
            @Param("userId") Integer userId,
            @Param("roleName") String roleName,
            @Param("enabled") Boolean enabled,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
