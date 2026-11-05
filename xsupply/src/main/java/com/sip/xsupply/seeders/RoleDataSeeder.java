package com.sip.xsupply.seeders;

import com.sip.xsupply.UserModule.role.Role;
import com.sip.xsupply.UserModule.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
@RequiredArgsConstructor
@Order(1)
public class RoleDataSeeder {
    private final RoleRepository roleRepository;

    @Bean
    public CommandLineRunner seedRoles() {
        return args -> {
            String[] roles = {"ADMIN", "USER"};
            for (String role : roles) {
                roleRepository.findByName(role).orElseGet(() -> roleRepository.save(Role.builder().name(role).build()));
            }
        };
    }
}
