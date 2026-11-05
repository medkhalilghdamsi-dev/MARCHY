//package com.sip.xsupply.seeders;
//
//import com.sip.xsupply.role.Role;
//import com.sip.xsupply.role.RoleRepository;
//import com.sip.xsupply.user.User;
//import com.sip.xsupply.user.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.core.annotation.Order;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.util.List;
//
//@Configuration
//@RequiredArgsConstructor
//@Order(2)
//public class UserDataSeeder {
//    private final UserRepository userRepository;
//    private final RoleRepository roleRepository;
//    private final PasswordEncoder passwordEncoder;
//    @Value("${application.backend.base-url}")
//    private String backendBaseUrl;
//
//@Bean
//public CommandLineRunner seedAdminUser() {
//    return args -> {
//        Role adminRole = roleRepository.findByName("ADMIN")
//                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
//
//        List<User> adminUsers = List.of(
//                User.builder()
//                        .firstname("Seif Eddine")
//                        .lastname("Amara")
//                        .companyName("SIP")
//                        .email("amaraseif2@gmail.com")
//                        .password(passwordEncoder.encode("123456789"))
//                        .country("TUNISIA")
//                        .phoneNumber1(21653834156L)
//                        .verified(true)
//                        .enabled(true)
//                        .profilePicture(backendBaseUrl + "/api/v1/default.jpg")
//                        .roles(List.of(adminRole))
//                        .build(),
//
//                User.builder()
//                        .firstname("Amine")
//                        .lastname("Mezghich")
//                        .companyName("SIP")
//                        .email("amine.mezghich@gmail.com")
//                        .password(passwordEncoder.encode("123456789")) // mot de passe à personnaliser
//                        .country("TUNISIA")
//                        .phoneNumber1(98787521L)
//                        .verified(true)
//                        .enabled(true)
//                        .profilePicture(backendBaseUrl + "/api/v1/default.jpg")
//                        .roles(List.of(adminRole))
//                        .build()
//        );
//
//        for (User admin : adminUsers) {
//            userRepository.findByEmail(admin.getEmail()).ifPresentOrElse(
//                    existingUser -> {
//                        System.out.println("Admin user already exists: " + existingUser.getEmail());
//                    },
//                    () -> {
//                        userRepository.save(admin);
//                        System.out.println("Admin user created: " + admin.getEmail());
//                    }
//            );
//        }
//    };
//}
//    @Bean
//    public CommandLineRunner seedShipperUsers() {
//        return args -> {
//            Role shipperRole = roleRepository.findByName("SHIPPER")
//                    .orElseThrow(() -> new RuntimeException("Role SHIPPER not found"));
//
//            List<User> shipperUsers = List.of(
//                    User.builder()
//                            .firstname("Alaa")
//                            .lastname("Rezigui")
//                            .email("a.zigui@smart-it-partner.com")
//                            .password(passwordEncoder.encode("123456789"))
//                            .country("TUNISIA")
//                            .phoneNumber1(21629320353L)
//                            .verified(false)
//                            .enabled(true)
//                            .profilePicture("http://localhost:8088/api/v1/default.jpg")
//                            .companyName("YazakiTunisia")
//                            .roles(List.of(shipperRole))
//                            .build(),
//
//                    User.builder()
//                            .firstname("Hamdi")
//                            .lastname("MEDDEB")
//                            .email("ma.mezghich@smart-it-partner.com")
//                            .password(passwordEncoder.encode("123456789"))
//                            .country("TUNISIA")
//                            .phoneNumber1(21651363634L)
//                            .verified(true)
//                            .enabled(true)
//                            .address("Ben Arrous Tunis")
//                            .capital(200000000L)
//                            .cin("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/commercialregisters/1742489859254-12b4f261-ddf0-4660-97b2-e226bf24f2e7.pdf")
//                            .commercialRegister("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/commercialregisters/1742488495590-027314b9-3cdf-4fb9-98dc-c36ef872394b.pdf")
//                            .companyName("Délice")
//                            .companyRepresentative("Hamd MEDDEB")
//                            .drivingLicense("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/drivinglisences/1742489859255-3f48928f-1121-4300-9e41-685499b74d0e.jpg")
//                            .profilePicture("http://xsupply2.smart-it-partner.com:10004/api/v1/user/profilePicture/1742489635860-6cef8601-539b-4d26-abcb-2ed9d869b19e.jpg")
//                            .signature("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/signatures/1742489859252-55f40c56-5dda-4d02-b0c3-c3d25d42b065.png")
//                            .uniqueIdentifier("11223344")
//                            .roles(List.of(shipperRole))
//                            .build()
//            );
//
//            for (User shipper : shipperUsers) {
//                userRepository.findByEmail(shipper.getEmail()).ifPresentOrElse(
//                        existingUser -> {
//                            System.out.println("Shipper already exists: " + existingUser.getEmail());
//                        },
//                        () -> {
//                            userRepository.save(shipper);
//                            System.out.println("Shipper created: " + shipper.getEmail());
//                        }
//                );
//            }
//        };
//    }
//    @Bean
//    public CommandLineRunner seedCarrierUsers() {
//        return args -> {
//            Role carrierRole = roleRepository.findByName("CARRIER")
//                    .orElseThrow(() -> new RuntimeException("Role CARRIER not found"));
//
//            List<User> carrierUsers = List.of(
//                    User.builder()
//                            .firstname("seif")
//                            .lastname("amara")
//                            .email("seif.amara@smart-it-partner.com")
//                            .password(passwordEncoder.encode("123456789"))
//                            .country("TUNISIA")
//                            .phoneNumber1(21653834156L)
//                            .verified(false)
//                            .enabled(true)
//                            .profilePicture("http://localhost:8088/api/v1/default.jpg")
//                            .companyName("YazakiTunisia")
//                            .roles(List.of(carrierRole))
//                            .build(),
//
//                    User.builder()
//                            .firstname("Samir")
//                            .lastname("Yaakoub")
//                            .email("amine.mezghich@ensi-uma.tn")
//                            .password(passwordEncoder.encode("123456789"))
//                            .country("TUNISIA")
//                            .phoneNumber1(21698787521L)
//                            .verified(true)
//                            .enabled(true)
//                            .address("La marsa, Tunis")
//                            .capital(100000000L)
//                            .cin("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/cin/1742488495590-c48ef2e7-28c7-43ad-a5ac-f461a259584f.pdf")
//                            .commercialRegister("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/commercialregisters/1742488495590-027314b9-3cdf-4fb9-98dc-c36ef872394b.pdf")
//                            .companyName("ExpressWorldGroup")
//                            .companyRepresentative("Samir Yaakoub")
//                            .drivingLicense("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/drivinglisences/1742488495591-f6514737-fe37-454a-bba2-7d8fba02aa63.jpg")
//                            .profilePicture("http://xsupply2.smart-it-partner.com:10004/api/v1/user/profilePicture/1742488183883-dc619651-f081-4a47-993e-eb2cfdc65e6f.png")
//                            .signature("http://xsupply2.smart-it-partner.com:10004/api/v1/uploads/signatures/1742488495589-5c00ee58-f0cf-4826-8b04-f5672dac50e3.png")
//                            .uniqueIdentifier("12345678")
//                            .roles(List.of(carrierRole))
//                            .build()
//            );
//
//            for (User carrier : carrierUsers) {
//                userRepository.findByEmail(carrier.getEmail()).ifPresentOrElse(
//                        existingUser -> {
//                            System.out.println("carrier already exists: " + existingUser.getEmail());
//                        },
//                        () -> {
//                            userRepository.save(carrier);
//                            System.out.println("carrier created: " + carrier.getEmail());
//                        }
//                );
//            }
//        };
//    }
//
//
//}
