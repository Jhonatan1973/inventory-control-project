package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponseDTO {
    private String token;
    private String username;
    private String roleName;
    private String sectorName;
    private Long sectorId;

    public LoginResponseDTO(String token, String username, String roleName, String sectorName, Long sectorId) {
        this.token = token;
        this.username = username;
        this.roleName = roleName;
        this.sectorName = sectorName;
        this.sectorId = sectorId;
    }

    public LoginResponseDTO() {
    }
}
