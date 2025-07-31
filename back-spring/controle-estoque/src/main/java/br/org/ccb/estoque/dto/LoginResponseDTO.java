package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginResponseDTO {
    private String token;
    private String username;
    private String sectors;
    private String role;

    public LoginResponseDTO(String token, String username, String sectors, String role) {
        this.token = token;
        this.username = username;
        this.sectors = sectors;
        this.role = role;
    }

}
