package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.dto.LoginResponseDTO;
import br.org.ccb.estoque.dto.UserDTO;
import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.service.EmailService;
import br.org.ccb.estoque.service.JwtService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );
            Optional<User> userOpt = repo.findByEmail(user.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Usuário não encontrado.");
            }
            User foundUser = userOpt.get();
            foundUser.setOnline(true);
            repo.save(foundUser);
            String roleName = foundUser.getRole() != null ? foundUser.getRole().getName() : null;
            String sectorName = foundUser.getSector() != null ? foundUser.getSector().getName() : null;
            String token = jwtService.generateToken(foundUser.getEmail(), roleName);
            LoginResponseDTO response = new LoginResponseDTO(
                    token,
                    foundUser.getUsername(),
                    roleName,
                    sectorName
            );

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Email ou senha inválidos.");
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Falha na autenticação.");
        }
    }
    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractEmail(token);
            Optional<User> userOpt = repo.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Usuário não encontrado.");
            }
            User user = userOpt.get();
            user.setOnline(false);
            repo.save(user);
            return ResponseEntity.ok("Logout realizado com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Erro ao processar logout.");
        }
    }
    @PostMapping("/auth/sendVerificationCode")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("E-mail obrigatório");
        }
        emailService.sendVerificationEmail(email);
        return ResponseEntity.ok("Código enviado");
    }

    @PostMapping("/auth/verifyCode")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");
        if (email == null || token == null) {
            return ResponseEntity.badRequest().body("Email e token obrigatórios");
        }
        boolean valid = emailService.verifyToken(email, token);
        return valid
                ? ResponseEntity.ok("Código válido")
                : ResponseEntity.status(401).body("Código inválido ou expirado");
    }
    @PostMapping("/auth/confirmUser")
    public ResponseEntity<?> confirmUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");

        if (email == null || token == null) {
            return ResponseEntity.badRequest().body("Email e token obrigatórios");
        }

        boolean valid = emailService.verifyToken(email, token);
        if (!valid) {
            return ResponseEntity.status(401).body("Código inválido ou expirado");
        }

        Optional<User> userOpt = repo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado.");
        }

        User user = userOpt.get();
        user.setConfirmed(true);
        repo.save(user);

        String resetToken = UUID.randomUUID().toString();
        String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok("Usuário confirmado e email para redefinir senha enviado");
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String creatorEmail = auth.getName();

        Optional<User> creatorOpt = repo.findByEmail(creatorEmail);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.status(403).body("Usuário não autenticado");
        }
        User creator = creatorOpt.get();
        if (!"ADMIN".equalsIgnoreCase(String.valueOf(creator.getRole()))) {
            return ResponseEntity.status(403).body("Apenas ADMIN pode criar novos usuários");
        }
        if (newUser.getUsername() == null || newUser.getEmail() == null || newUser.getRole() == null || newUser.getPassword() == null) {
            return ResponseEntity.badRequest().body("Campos obrigatórios faltando");
        }
        if (repo.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setSector(creator.getSector());
        newUser.setId(null);
        newUser.setLastModified(null);
        newUser.setOnline(false);
        newUser.setConfirmed(false);
        User savedUser = repo.save(newUser);

        emailService.sendVerificationEmail(savedUser.getEmail());

        return ResponseEntity.ok(Map.of("message", "Usuário criado com sucesso. Um código foi enviado para o email para confirmação."));
    }
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> existingUserOpt = repo.findById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User existingUser = existingUserOpt.get();

        if (updatedUser.getUsername() != null) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }
        if (updatedUser.getSector() != null) {
            existingUser.setSector(updatedUser.getSector());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        User savedUser = repo.save(existingUser);
        return ResponseEntity.ok(savedUser);
    }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String requesterEmail = auth.getName();

        Optional<User> requesterOpt = repo.findByEmail(requesterEmail);
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(403).body("Usuário não autenticado");
        }
        User requester = requesterOpt.get();

        if (!"ADMIN".equalsIgnoreCase(String.valueOf(requester.getRole()))) {
            return ResponseEntity.status(403).body("Apenas ADMIN pode deletar usuários");
        }

        Optional<User> userOpt = repo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
        repo.deleteById(id);
        return ResponseEntity.ok("Usuário deletado com sucesso");
    }
    @GetMapping("/users")
    public ResponseEntity<?> getUsersBySector() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Optional<User> userOpt = repo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }
        User loggedUser = userOpt.get();
        List<UserDTO> usersSameSector = repo.findUsersBySectorId(loggedUser.getSectorId());

        return ResponseEntity.ok(usersSameSector);
    }
    @Setter
    @Getter
    public static class JwtResponse {
        private String token;
        private String username;
        private Long sector;
        private Long role;

        public JwtResponse(String token, String username, Long sector, Long role) {
            this.token = token;
            this.username = username;
            this.sector = sector;
            this.role = role;
        }
    }
}
