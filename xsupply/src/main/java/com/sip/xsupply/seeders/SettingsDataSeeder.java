//package com.sip.xsupply.seeders;
//
//import com.sip.xsupply.landing_page.settings.Settings;
//import com.sip.xsupply.landing_page.settings.SettingsRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.time.LocalDateTime;
//
//@Configuration
//@RequiredArgsConstructor
//public class SettingsDataSeeder {
//    private final SettingsRepository settingsRepository;
//
//    @Bean
//    public CommandLineRunner seedSettings() {
//        return args -> {
//            if (settingsRepository.count() == 0) {
//                Settings settings = new Settings();
//                settings.setTitle("Smart Routes For Your Goods");
//                settings.setAboutUs("XsupplY connect shippers and carriers, matching offer and demand, and integrating innovative technologies.\n\nThe comprehensive offer of the platform provide a customer-centric journey to all its users.\n\n");
//                settings.setAboutUs2("XsupplY emerges as an innovative digital logistics solution, designed to streamline logistics operations, offering real time pricing and access to service, providing tracking, route optimization, and consolidated service in a one-stop-shop. This platform is designed not only to be a leap forward integrating logistics with technology, but also a strategic response to the challenges facing the logistics industry in Tunisia and beyond.\n\n");
//                settings.setAboutUs3("XsupplY bring considerable value to the logistics sector. By streamlining operations and decision-making, it contributes to huge time and cost savings for businesses increasing their competitiveness and boosting their growth. Real-time pricing and tracking increases visibility and transparency, contributing to customer satisfaction and retention. Moreover, advanced digital solutions offer optimized route planning, enhanced fuel efficiency, and reduced waste, bringing logistical procedures into line with the growing emphasis on environmental responsibility and sustainability on a worldwide scale.\n\n");
//                settings.setObjective("The objective of XsupplY is to disrupt the logistics business. We view the value of XsupplY through the prism of the 7Rs of logistics (Right product, right quantity, right condition, right place, right time, right customer) to propose a fair journey for all, shippers, carriers, and society.\n\n");
//                settings.setMission("XsupplY is the digital platform that connects shippers (buyers) and carriers (sellers) to digitalize the logistics service offer, to facilitate the contact between different stakeholders and to optimize empty spaces and flows of goods. The integration of all services and data within the same platform will offer a better journey for both ends.\n\n");
//                settings.setMotto("“XsupplY Smart Routes For Your Goods” is our motto, smart routes do not only stand for the route optimization provided, but also for smart ways of booking your shipment, smart connections with providers, smart quality assurance of the service, smart analysis of your data and of course, smart social and environmental impact of your business.");
//                settings.setVision("XsupplY will change the reality of logistics in Tunisia and in the region. From one side, we will contribute to improve our LPI and to increase the contribution of logistics in our GDP as a main lever and a corner stone of economic development. From the other side, we will develop regional economic exchange and facilitate access to offers with optimized routes and solutions.\n\nThe X and Y will no longer refer to men and women but to XsupplY.");
//                settings.setServiceTitle("Premium logistics services to shape your supply chain");
//                settings.setPhoneNumber(55412365L);
//                settings.setWhatsappNumber(25412365L);
//                settings.setEmail("supply@supply.com");
//                settings.setBanner("http://xsupply2.smart-it-partner.com:10004/api/v1/settings/file/1742394713645-c238c6c7-da6b-404c-a02a-396ac5c8756c.mp4");
//                settings.setLogo("http://xsupply2.smart-it-partner.com:10004/api/v1/settings/file/1742394713632-7ad43339-074b-4217-94d9-809111a1af96.png");
//                settings.setAddress("Ariana");
//                settings.setStartTime(LocalDateTime.of(2025, 3, 19, 8, 0));
//                settings.setEndTime(LocalDateTime.of(2025, 3, 19, 20, 0));
//                settings.setIsActive(true);
//
//                settingsRepository.save(settings);
//            }
//        };
//    }}
