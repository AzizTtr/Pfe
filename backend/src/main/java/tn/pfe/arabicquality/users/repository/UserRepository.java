package tn.pfe.arabicquality.users.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.pfe.arabicquality.users.domain.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByKcId(String kcId);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
           SELECT u FROM User u
            WHERE u.deletedAt IS NULL
              AND (:role IS NULL OR u.role.code = :role)
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY u.createdAt DESC
           """)
    Page<User> search(@Param("role") String role, @Param("search") String search, Pageable pageable);
}
