package com.example.demo.Services;

import com.example.demo.Entities.Supplier;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.SupplierRepository;
import com.example.demo.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserDetails userDetails = createUserDetails(email);
        if (userDetails == null) {
            throw new UsernameNotFoundException("User or Supplier not found with email: " + email);
        }
        return userDetails;
    }

    public UserDetails createUserDetails(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole())
                    .build();
        }

        Optional<Supplier> supplierOpt = supplierRepository.findByEmail(email);
        if (supplierOpt.isPresent()) {
            Supplier supplier = supplierOpt.get();
            return org.springframework.security.core.userdetails.User
                    .withUsername(supplier.getEmail())
                    .password(supplier.getPassword())
                    .roles(supplier.getRole())
                    .build();
        }

        return null;
    }
}