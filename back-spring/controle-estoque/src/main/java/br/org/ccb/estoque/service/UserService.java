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
    private UserRepository repo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private SectorRepository sectorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String roleName = user.getRole() != null ? user.getRole().getName() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(() -> roleName) // roleName ex: "admin"
        );
    }

    public User createUser(String username, String email, String password, String roleName, String sectorName) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        // Buscar Role pelo nome
        Role role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role não encontrado: " + roleName));
        user.setRole(role);

        // Buscar Sector pelo nome
        Sector sector = sectorRepo.findByName(sectorName)
                .orElseThrow(() -> new RuntimeException("Sector não encontrado: " + sectorName));
        user.setSector(sector);

        return repo.save(user);
    }
}
