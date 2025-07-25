package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TokenDTO {
    private String token;

    public TokenDTO() {}

    public TokenDTO(String token) {
        this.token = token;
    }

}
