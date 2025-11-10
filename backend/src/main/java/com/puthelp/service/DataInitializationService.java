package com.puthelp.service;

import com.puthelp.entity.Category;
import com.puthelp.entity.Kierunek;
import com.puthelp.entity.Role;
import com.puthelp.repository.CategoryRepository;
import com.puthelp.repository.KierunekRepository;
import com.puthelp.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private KierunekRepository kierunekRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeKieruneks();
        initializeCategories();
    }
    
    private void initializeRoles() {
        // Create default roles if they don't exist
        if (!roleRepository.existsByName(Role.RoleName.STUDENT)) {
            Role studentRole = new Role(Role.RoleName.STUDENT, "Default role for students");
            roleRepository.save(studentRole);
            logger.info("Created STUDENT role");
        }
        
        if (!roleRepository.existsByName(Role.RoleName.MODERATOR)) {
            Role moderatorRole = new Role(Role.RoleName.MODERATOR, "Role for content moderators");
            roleRepository.save(moderatorRole);
            logger.info("Created MODERATOR role");
        }
        
        if (!roleRepository.existsByName(Role.RoleName.ADMIN)) {
            Role adminRole = new Role(Role.RoleName.ADMIN, "Administrator role with full access");
            roleRepository.save(adminRole);
            logger.info("Created ADMIN role");
        }
    }
    
    private void initializeKieruneks() {
        // Create default kieruneks (study programs) if they don't exist
        createKierunekIfNotExists("Informatyka", "INF", "Computer Science");
        createKierunekIfNotExists("Elektronika i Telekomunikacja", "ELE", "Electronics and Telecommunications");
        createKierunekIfNotExists("Automatyka i Robotyka", "AUT", "Automation and Robotics");
        createKierunekIfNotExists("Mechanika i Budowa Maszyn", "MEC", "Mechanical Engineering");
        createKierunekIfNotExists("Inżynieria Biomedyczna", "BIO", "Biomedical Engineering");
        createKierunekIfNotExists("Inżynieria Materiałowa", "MAT", "Materials Engineering");
        createKierunekIfNotExists("Architektura", "ARC", "Architecture");
        createKierunekIfNotExists("Budownictwo", "BUD", "Civil Engineering");
        createKierunekIfNotExists("Inżynieria Środowiska", "ENV", "Environmental Engineering");
        createKierunekIfNotExists("Energetyka", "ENE", "Energy Engineering");
    }
    
    private void createKierunekIfNotExists(String name, String code, String description) {
        if (!kierunekRepository.existsByCode(code)) {
            Kierunek kierunek = new Kierunek(name, code, description);
            kierunekRepository.save(kierunek);
            logger.info("Created kierunek: {} ({})", name, code);
        }
    }
    
    private void initializeCategories() {
        // Create default categories if they don't exist
        createCategoryIfNotExists("Academic Guidelines", "Guidelines and information about academic procedures");
        createCategoryIfNotExists("Course Information", "Information about specific courses and subjects");
        createCategoryIfNotExists("Campus Life", "Information about campus facilities and student life");
        createCategoryIfNotExists("Administrative", "Administrative procedures and requirements");
        createCategoryIfNotExists("Career & Internships", "Career guidance and internship opportunities");
        createCategoryIfNotExists("Technical Tutorials", "Technical guides and tutorials");
        createCategoryIfNotExists("Exam Preparation", "Study materials and exam preparation guides");
        createCategoryIfNotExists("Student Organizations", "Information about student clubs and organizations");
        createCategoryIfNotExists("Library & Resources", "Library services and academic resources");
        createCategoryIfNotExists("FAQ", "Frequently asked questions");
    }
    
    private void createCategoryIfNotExists(String name, String description) {
        if (!categoryRepository.existsByName(name)) {
            Category category = new Category(name, description);
            categoryRepository.save(category);
            logger.info("Created category: {}", name);
        }
    }
}
