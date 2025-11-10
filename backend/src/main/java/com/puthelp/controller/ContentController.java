package com.puthelp.controller;

import com.puthelp.dto.content.ContentDto;
import com.puthelp.dto.response.MessageResponse;
import com.puthelp.security.UserPrincipal;
import com.puthelp.service.ContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/content")
public class ContentController {
    
    @Autowired
    private ContentService contentService;
    
    // Public endpoints
    @GetMapping("/public")
    public ResponseEntity<Page<ContentDto>> getPublishedContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ContentDto> content = contentService.getPublishedContent(pageable);
        return ResponseEntity.ok(content);
    }
    
    @GetMapping("/public/{id}")
    public ResponseEntity<ContentDto> getPublishedContentById(@PathVariable Long id) {
        Optional<ContentDto> content = contentService.getPublishedContentById(id);
        if (content.isPresent()) {
            // Increment view count
            ContentDto updatedContent = contentService.incrementViewCount(id);
            return ResponseEntity.ok(updatedContent);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/public/kierunek/{kierunekId}")
    public ResponseEntity<Page<ContentDto>> getContentByKierunek(
            @PathVariable Long kierunekId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ContentDto> content = contentService.getContentByKierunek(kierunekId, pageable);
        return ResponseEntity.ok(content);
    }
    
    @GetMapping("/public/category/{categoryId}")
    public ResponseEntity<Page<ContentDto>> getContentByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ContentDto> content = contentService.getContentByCategory(categoryId, pageable);
        return ResponseEntity.ok(content);
    }
    
    @GetMapping("/public/search")
    public ResponseEntity<Page<ContentDto>> searchContent(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ContentDto> content = contentService.searchContent(q, pageable);
        return ResponseEntity.ok(content);
    }
    
    // Protected endpoints (require authentication)
    @PostMapping
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createContent(@Valid @RequestBody ContentDto contentDto, 
                                         Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            ContentDto createdContent = contentService.createContent(contentDto, userPrincipal.getUsername());
            return ResponseEntity.ok(createdContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateContent(@PathVariable Long id, 
                                         @Valid @RequestBody ContentDto contentDto,
                                         Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            ContentDto updatedContent = contentService.updateContent(id, contentDto, userPrincipal.getUsername());
            return ResponseEntity.ok(updatedContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> publishContent(@PathVariable Long id, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            ContentDto publishedContent = contentService.publishContent(id, userPrincipal.getUsername());
            return ResponseEntity.ok(publishedContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteContent(@PathVariable Long id, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            contentService.deleteContent(id, userPrincipal.getUsername());
            return ResponseEntity.ok(new MessageResponse("Content deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<ContentDto>> getMyContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Page<ContentDto> content = contentService.getMyContent(userPrincipal.getUsername(), pageable);
        return ResponseEntity.ok(content);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ContentDto> getContentById(@PathVariable Long id) {
        Optional<ContentDto> content = contentService.getContentById(id);
        return content.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
