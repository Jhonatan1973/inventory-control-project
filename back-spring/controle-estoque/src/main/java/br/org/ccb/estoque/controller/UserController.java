package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public List<User> getUsersDoMesmoSetor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // pega o email do token (username)

        User usuarioLogado = repo.findByEmail(email).orElse(null);
        if (usuarioLogado == null) {
            return List.of(); // ou lance exceção 401/403
        }

        return repo.findBySectors(usuarioLogado.getSectors());
    }
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> existingUserOpt = repo.findById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = existingUserOpt.get();

        // Atualiza os campos apenas se não forem nulos
        if (updatedUser.getUsername() != null) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }
        if (updatedUser.getSectors() != null) {
            existingUser.setSectors(updatedUser.getSectors());
        }

        // Se mandou uma nova senha, criptografa com bcrypt
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            String hashedPassword = passwordEncoder.encode(updatedUser.getPassword());
            existingUser.setPassword(hashedPassword);
        }

        User savedUser = repo.save(existingUser);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String emailCriador = auth.getName();
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        Optional<User> usuarioCriadorOpt = repo.findByEmail(emailCriador);
        if (usuarioCriadorOpt.isEmpty()) {
            return ResponseEntity.status(403).build(); // criador não encontrado / não autorizado
        }

        User usuarioCriador = usuarioCriadorOpt.get();

        if (newUser.getUsername() == null || newUser.getEmail() == null || newUser.getRole() == null || newUser.getPassword() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Setar o setor do novo usuário igual ao setor do usuário que criou
        newUser.setSectors(usuarioCriador.getSectors());

        // Resetar campos automáticos para que o banco gere
        newUser.setId(null);
        newUser.setLastModified(null);
        newUser.setOnline(false);

        User savedUser = repo.save(newUser);
        return ResponseEntity.ok(savedUser);
    }



}