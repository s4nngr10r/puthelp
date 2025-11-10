package com.puthelp.repository;

import com.puthelp.entity.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    
    Page<Content> findByStatus(Content.ContentStatus status, Pageable pageable);
    
    Page<Content> findByType(Content.ContentType type, Pageable pageable);
    
    Page<Content> findByAuthorId(Long authorId, Pageable pageable);
    
    Optional<Content> findByIdAndStatus(Long id, Content.ContentStatus status);
    
    @Query("SELECT c FROM Content c WHERE c.kierunek.id = :kierunekId AND c.status = 'PUBLISHED'")
    Page<Content> findByKierunekIdAndPublished(@Param("kierunekId") Long kierunekId, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.category.id = :categoryId AND c.status = 'PUBLISHED'")
    Page<Content> findByCategoryIdAndPublished(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.body) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.tags) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "c.status = 'PUBLISHED'")
    Page<Content> searchPublishedContent(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.status = 'PUBLISHED' ORDER BY c.viewCount DESC")
    Page<Content> findMostPopular(Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.status = 'PUBLISHED' ORDER BY c.createdAt DESC")
    Page<Content> findLatest(Pageable pageable);
}
