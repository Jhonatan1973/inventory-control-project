package br.org.ccb.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;

    private String sectors;

    @Column(name = "online")
    private Boolean online = false;

    @Column(name = "last_modified")
    private String lastModified;
}
