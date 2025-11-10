package com.puthelp.service;

import com.puthelp.dto.content.ContentDto;
import com.puthelp.entity.Category;
import com.puthelp.entity.Content;
import com.puthelp.entity.Kierunek;
import com.puthelp.entity.User;
import com.puthelp.repository.CategoryRepository;
import com.puthelp.repository.ContentRepository;
import com.puthelp.repository.KierunekRepository;
import com.puthelp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContentService {
    
    @Autowired
    private ContentRepository contentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private KierunekRepository kierunekRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public ContentDto createContent(ContentDto contentDto, String authorUsername) {
        User author = userRepository.findByUsername(authorUsername)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        
        Content content = new Content();
        content.setTitle(contentDto.getTitle());
        content.setBody(contentDto.getBody());
        content.setSummary(contentDto.getSummary());
        content.setType(contentDto.getType());
        content.setStatus(Content.ContentStatus.DRAFT); // Always start as draft
        content.setAuthor(author);
        content.setTags(contentDto.getTags());
        
        // Set kierunek if provided
        if (contentDto.getKierunekId() != null) {
            Kierunek kierunek = kierunekRepository.findById(contentDto.getKierunekId())
                    .orElse(null);
            content.setKierunek(kierunek);
        }
        
        // Set category if provided
        if (contentDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(contentDto.getCategoryId())
                    .orElse(null);
            content.setCategory(category);
        }
        
        Content savedContent = contentRepository.save(content);
        return convertToDto(savedContent);
    }
    
    public ContentDto updateContent(Long id, ContentDto contentDto, String username) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        // Check if user can edit this content
        if (!canUserEditContent(content, username)) {
            throw new RuntimeException("Access denied");
        }
        
        content.setTitle(contentDto.getTitle());
        content.setBody(contentDto.getBody());
        content.setSummary(contentDto.getSummary());
        content.setType(contentDto.getType());
        content.setTags(contentDto.getTags());
        
        // Update kierunek if provided
        if (contentDto.getKierunekId() != null) {
            Kierunek kierunek = kierunekRepository.findById(contentDto.getKierunekId())
                    .orElse(null);
            content.setKierunek(kierunek);
        }
        
        // Update category if provided
        if (contentDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(contentDto.getCategoryId())
                    .orElse(null);
            content.setCategory(category);
        }
        
        Content savedContent = contentRepository.save(content);
        return convertToDto(savedContent);
    }
    
    public ContentDto publishContent(Long id, String username) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (!canUserPublishContent(content, username)) {
            throw new RuntimeException("Access denied");
        }
        
        content.setStatus(Content.ContentStatus.PUBLISHED);
        content.setPublishedAt(LocalDateTime.now());
        
        Content savedContent = contentRepository.save(content);
        return convertToDto(savedContent);
    }
    
    public void deleteContent(Long id, String username) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (!canUserEditContent(content, username)) {
            throw new RuntimeException("Access denied");
        }
        
        contentRepository.delete(content);
    }
    
    public Optional<ContentDto> getContentById(Long id) {
        return contentRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public Optional<ContentDto> getPublishedContentById(Long id) {
        return contentRepository.findById(id)
                .filter(content -> content.getStatus() == Content.ContentStatus.PUBLISHED)
                .map(this::convertToDto);
    }
    
    public ContentDto incrementViewCount(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        content.setViewCount(content.getViewCount() + 1);
        Content savedContent = contentRepository.save(content);
        return convertToDto(savedContent);
    }
    
    public Page<ContentDto> getPublishedContent(Pageable pageable) {
        Page<Content> contentPage = contentRepository.findByStatus(Content.ContentStatus.PUBLISHED, pageable);
        List<ContentDto> contentDtos = contentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(contentDtos, pageable, contentPage.getTotalElements());
    }
    
    public Page<ContentDto> getContentByKierunek(Long kierunekId, Pageable pageable) {
        Page<Content> contentPage = contentRepository.findByKierunekIdAndPublished(kierunekId, pageable);
        List<ContentDto> contentDtos = contentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(contentDtos, pageable, contentPage.getTotalElements());
    }
    
    public Page<ContentDto> getContentByCategory(Long categoryId, Pageable pageable) {
        Page<Content> contentPage = contentRepository.findByCategoryIdAndPublished(categoryId, pageable);
        List<ContentDto> contentDtos = contentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(contentDtos, pageable, contentPage.getTotalElements());
    }
    
    public Page<ContentDto> searchContent(String query, Pageable pageable) {
        Page<Content> contentPage = contentRepository.searchPublishedContent(query, pageable);
        List<ContentDto> contentDtos = contentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(contentDtos, pageable, contentPage.getTotalElements());
    }
    
    public Page<ContentDto> getMyContent(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Page<Content> contentPage = contentRepository.findByAuthorId(user.getId(), pageable);
        List<ContentDto> contentDtos = contentPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(contentDtos, pageable, contentPage.getTotalElements());
    }
    
    private boolean canUserEditContent(Content content, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Author can always edit their own content
        if (content.getAuthor().getId().equals(user.getId())) {
            return true;
        }
        
        // Moderators and admins can edit any content
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("MODERATOR") || 
                                role.getName().name().equals("ADMIN"));
    }
    
    private boolean canUserPublishContent(Content content, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only moderators and admins can publish content
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("MODERATOR") || 
                                role.getName().name().equals("ADMIN"));
    }
    
    private ContentDto convertToDto(Content content) {
        ContentDto dto = new ContentDto();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        dto.setBody(content.getBody());
        dto.setSummary(content.getSummary());
        dto.setType(content.getType());
        dto.setStatus(content.getStatus());
        dto.setTags(content.getTags());
        dto.setViewCount(content.getViewCount());
        dto.setCreatedAt(content.getCreatedAt());
        dto.setUpdatedAt(content.getUpdatedAt());
        dto.setPublishedAt(content.getPublishedAt());
        
        // Safely handle author information
        try {
            if (content.getAuthor() != null) {
                dto.setAuthorId(content.getAuthor().getId());
                dto.setAuthorUsername(content.getAuthor().getUsername());
            }
        } catch (Exception e) {
            // Handle any lazy loading issues
            dto.setAuthorId(null);
            dto.setAuthorUsername("Unknown");
        }
        
        // Safely handle kierunek information
        try {
            if (content.getKierunek() != null) {
                dto.setKierunekId(content.getKierunek().getId());
                dto.setKierunekName(content.getKierunek().getName());
            }
        } catch (Exception e) {
            // Handle any lazy loading issues
            dto.setKierunekId(null);
            dto.setKierunekName(null);
        }
        
        // Safely handle category information
        try {
            if (content.getCategory() != null) {
                dto.setCategoryId(content.getCategory().getId());
                dto.setCategoryName(content.getCategory().getName());
            }
        } catch (Exception e) {
            // Handle any lazy loading issues
            dto.setCategoryId(null);
            dto.setCategoryName(null);
        }
        
        return dto;
    }
}
