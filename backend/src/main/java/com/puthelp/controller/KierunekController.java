package com.puthelp.controller;

import com.puthelp.dto.response.MessageResponse;
import com.puthelp.entity.Kierunek;
import com.puthelp.repository.KierunekRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/kieruneks")
public class KierunekController {
    
    @Autowired
    private KierunekRepository kierunekRepository;
    
    // Public endpoints
    @GetMapping("/public")
    public ResponseEntity<List<Kierunek>> getAllActiveKieruneks() {
        List<Kierunek> kieruneks = kierunekRepository.findByIsActiveTrue();
        return ResponseEntity.ok(kieruneks);
    }
    
    @GetMapping("/public/{id}")
    public ResponseEntity<Kierunek> getKierunekById(@PathVariable Long id) {
        Optional<Kierunek> kierunek = kierunekRepository.findById(id);
        return kierunek.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Kierunek>> getAllKieruneks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Kierunek> kieruneks = kierunekRepository.findAll(pageable);
        return ResponseEntity.ok(kieruneks);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createKierunek(@Valid @RequestBody Kierunek kierunek) {
        try {
            if (kierunekRepository.existsByCode(kierunek.getCode())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Kierunek code is already taken!"));
            }
            
            if (kierunekRepository.existsByName(kierunek.getName())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Kierunek name is already taken!"));
            }
            
            Kierunek savedKierunek = kierunekRepository.save(kierunek);
            return ResponseEntity.ok(savedKierunek);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateKierunek(@PathVariable Long id, @Valid @RequestBody Kierunek kierunekDetails) {
        try {
            Optional<Kierunek> optionalKierunek = kierunekRepository.findById(id);
            if (optionalKierunek.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Kierunek kierunek = optionalKierunek.get();
            
            // Check if code is taken by another kierunek
            if (!kierunek.getCode().equals(kierunekDetails.getCode()) && 
                kierunekRepository.existsByCode(kierunekDetails.getCode())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Kierunek code is already taken!"));
            }
            
            // Check if name is taken by another kierunek
            if (!kierunek.getName().equals(kierunekDetails.getName()) && 
                kierunekRepository.existsByName(kierunekDetails.getName())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Kierunek name is already taken!"));
            }
            
            kierunek.setName(kierunekDetails.getName());
            kierunek.setCode(kierunekDetails.getCode());
            kierunek.setDescription(kierunekDetails.getDescription());
            kierunek.setIsActive(kierunekDetails.getIsActive());
            
            Kierunek updatedKierunek = kierunekRepository.save(kierunek);
            return ResponseEntity.ok(updatedKierunek);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteKierunek(@PathVariable Long id) {
        try {
            Optional<Kierunek> optionalKierunek = kierunekRepository.findById(id);
            if (optionalKierunek.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Kierunek kierunek = optionalKierunek.get();
            // Instead of deleting, mark as inactive if there are associated users/content
            kierunek.setIsActive(false);
            kierunekRepository.save(kierunek);
            
            return ResponseEntity.ok(new MessageResponse("Kierunek deactivated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
