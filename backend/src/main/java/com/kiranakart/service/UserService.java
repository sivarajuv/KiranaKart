package com.kiranakart.service;

import com.kiranakart.model.User;
import com.kiranakart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, Map<String, String> updates) {
        User user = getUserById(id);
        if (updates.containsKey("fullName")) user.setFullName(updates.get("fullName"));
        if (updates.containsKey("email")) user.setEmail(updates.get("email"));
        if (updates.containsKey("role")) user.setRole(User.Role.valueOf(updates.get("role")));
        return userRepository.save(user);
    }

    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void initDefaultUsers() {
        if (userRepository.count() == 0) {
            // Create default ADMIN
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@freshmart.com");
            admin.setFullName("Shop Admin");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);

            // Create default CASHIER
            User cashier = new User();
            cashier.setUsername("cashier");
            cashier.setEmail("cashier@freshmart.com");
            cashier.setFullName("Shop Cashier");
            cashier.setPassword(passwordEncoder.encode("Cashier@123"));
            cashier.setRole(User.Role.CASHIER);
            cashier.setEnabled(true);
            userRepository.save(cashier);

            System.out.println("✅ Default users created:");
            System.out.println("   ADMIN    → username: admin     | password: Admin@123");
            System.out.println("   CASHIER  → username: cashier   | password: Cashier@123");
        }
    }
}
