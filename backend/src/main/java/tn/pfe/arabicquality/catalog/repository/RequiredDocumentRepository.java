package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.pfe.arabicquality.catalog.domain.RequiredDocument;

import java.util.List;

@Repository
public interface RequiredDocumentRepository extends JpaRepository<RequiredDocument, Long> {
    List<RequiredDocument> findByCategoryIdOrderByDisplayOrderAscIdAsc(Long categoryId);
    long countByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
