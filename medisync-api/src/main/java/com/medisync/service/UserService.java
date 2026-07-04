package com.medisync.service;

import com.medisync.dto.AddressRequest;
import com.medisync.dto.UpdateProfileRequest;
import com.medisync.entity.User;
import com.medisync.entity.UserAddress;
import com.medisync.repository.UserAddressRepository;
import com.medisync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final UserAddressRepository addressRepo;
    private final PasswordEncoder passwordEncoder;

    public User getProfile(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String email, UpdateProfileRequest req) {
        User user = getProfile(email);
        if (req.getUsername() != null && !req.getUsername().equals(user.getUsername())) {
            if (userRepo.existsByUsername(req.getUsername()))
                throw new RuntimeException("Username already taken");
            user.setUsername(req.getUsername());
        }
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        return userRepo.save(user);
    }

    public void deactivate(String email) {
        User user = getProfile(email);
        user.setIsActive(false);
        user.setStatus("inactive");
        userRepo.save(user);
    }

    public void reactivate(String email, String password) {
        User user = getProfile(email);
        if (!passwordEncoder.matches(password, user.getPasswordHash()))
            throw new RuntimeException("Invalid password");
        user.setIsActive(true);
        user.setStatus("active");
        userRepo.save(user);
    }

    public List<UserAddress> getAddresses(String email) {
        User user = getProfile(email);
        return addressRepo.findByUserUserId(user.getUserId());
    }

    public UserAddress addAddress(String email, AddressRequest req) {
        User user = getProfile(email);
        UserAddress addr = new UserAddress();
        addr.setUser(user);
        addr.setAddressLine(req.getAddressLine());
        addr.setCity(req.getCity());
        addr.setState(req.getState());
        addr.setPincode(req.getPincode());
        addr.setLatitude(req.getLatitude());
        addr.setLongitude(req.getLongitude());
        addr.setIsDefault(req.getIsDefault());
        return addressRepo.save(addr);
    }

    public UserAddress updateAddress(String email, Long addressId, AddressRequest req) {
        User user = getProfile(email);
        UserAddress addr = addressRepo.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!addr.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Access denied");
        addr.setAddressLine(req.getAddressLine());
        addr.setCity(req.getCity());
        addr.setState(req.getState());
        addr.setPincode(req.getPincode());
        addr.setLatitude(req.getLatitude());
        addr.setLongitude(req.getLongitude());
        addr.setIsDefault(req.getIsDefault());
        return addressRepo.save(addr);
    }

    public void deleteAddress(String email, Long addressId) {
        User user = getProfile(email);
        UserAddress addr = addressRepo.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!addr.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Access denied");
        addressRepo.delete(addr);
    }
}
