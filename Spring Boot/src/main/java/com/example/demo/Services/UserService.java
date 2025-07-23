package com.example.demo.Services;


import com.example.demo.Entity.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User Profile(Long id)
    {
        return userRepository.findById(id).get();
    }
    public void userUpload(User user)
    {
        userRepository.save(user);
    }
}
