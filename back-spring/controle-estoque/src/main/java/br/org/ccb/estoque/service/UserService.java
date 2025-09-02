package br.org.ccb.estoque.service;

import br.org.ccb.estoque.entity.Role;
import br.org.ccb.estoque.entity.Sector;
import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.repository.RoleRepository;
import br.org.ccb.estoque.repository.SectorRepository;
import br.org.ccb.estoque.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private SectorRepository sectorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String roleName = user.getRole() != null ? user.getRole().getName() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(() -> roleName));
    }

    public Sector getSectorByName(String sectorName) {
        return sectorRepo.findByName(sectorName)
                .orElseThrow(() -> new RuntimeException("Sector not found"));
    }

    public User createUser(String username, String email, String password, String roleName, String sectorName) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        Role role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        user.setRole(role);

        Sector sector = sectorRepo.findByName(sectorName)
                .orElseThrow(() -> new RuntimeException("Sector not found: " + sectorName));
        user.setSector(sector);

        return userRepo.save(user);
    }

    public Sector getSectorByUserId(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSector();
    }
}
