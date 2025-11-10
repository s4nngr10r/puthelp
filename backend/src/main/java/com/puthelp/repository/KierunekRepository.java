package com.puthelp.repository;

import com.puthelp.entity.Kierunek;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KierunekRepository extends JpaRepository<Kierunek, Long> {
    
    Optional<Kierunek> findByCode(String code);
    
    Optional<Kierunek> findByName(String name);
    
    Boolean existsByCode(String code);
    
    Boolean existsByName(String name);
    
    List<Kierunek> findByIsActiveTrue();
    
    Page<Kierunek> findByIsActiveTrue(Pageable pageable);
}
