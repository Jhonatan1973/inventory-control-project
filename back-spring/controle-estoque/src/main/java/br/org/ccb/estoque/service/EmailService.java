package br.org.ccb.estoque.service;

import br.org.ccb.estoque.repository.EmailVerificationTokenRepository;
import br.org.ccb.estoque.validity.EmailVerificationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailVerificationTokenRepository tokenRepo;

    public void sendVerificationEmail(String email) {
        String token = generateRandomToken();
        EmailVerificationToken evToken = new EmailVerificationToken();
        evToken.setEmail(email);
        evToken.setToken(token);
        evToken.setExpiration(LocalDateTime.now().plusMinutes(15));
        tokenRepo.save(evToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("jhonatandomingues1122@outlook.com");

        message.setSubject("Seu código de verificação");
        message.setText("Olá! Seu código para confirmar seu e-mail é: " + token);
        mailSender.send(message);
    }
    public void sendPasswordResetEmail(String email, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("jhonatandomingues1122@outlook.com");

        message.setSubject("Redefinição de senha");
        message.setText("Olá! Para redefinir sua senha, clique no link abaixo:\n" + resetLink);
        mailSender.send(message);
    }
    public boolean verifyToken(String email, String token) {
        Optional<EmailVerificationToken> evTokenOpt = tokenRepo.findByEmailAndToken(email, token);
        if (evTokenOpt.isPresent()) {
            EmailVerificationToken evToken = evTokenOpt.get();
            if (evToken.getExpiration().isAfter(LocalDateTime.now())) {
                tokenRepo.delete(evToken);
                return true;
            }
        }
        return false;
    }
    private String generateRandomToken() {
        int token = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(token);
    }
}
