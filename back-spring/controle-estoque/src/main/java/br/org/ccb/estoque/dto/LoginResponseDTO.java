package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginResponseDTO {
    private String token;
    private String username;
    private String sectors;

    public LoginResponseDTO(String token, String username, String sectors) {
        this.token = token;
        this.username = username;
        this.sectors = sectors;
    }

}
