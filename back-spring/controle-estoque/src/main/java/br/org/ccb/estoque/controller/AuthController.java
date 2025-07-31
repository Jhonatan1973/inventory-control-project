package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.service.JwtService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            Optional<User> userOptional = repo.findByEmail(user.getEmail());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Usuário não encontrado.");
            }

            User foundUser = userOptional.get();
            String token = jwtService.generateToken(foundUser.getEmail());

            return ResponseEntity.ok(new JwtResponse(
                    token,
                    foundUser.getUsername(),
                    foundUser.getSectors(),
                    foundUser.getRole()
            ));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Email ou senha inválidos.");
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(403).body("Falha na autenticação.");
        }
    }

    @Setter
    @Getter
    public static class JwtResponse {
        private String token;
        private String username;
        private String sectors;
        private String role;

        public JwtResponse(String token, String username, String sectors, String role) {
            this.token = token;
            this.username = username;
            this.sectors = sectors;
            this.role = role;
        }
    }
}
