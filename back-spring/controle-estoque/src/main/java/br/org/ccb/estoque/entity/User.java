package br.org.ccb.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Column(name = "confirmed")
    private Boolean confirmed = false;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(name = "role_id")
    private Long roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @Column(name = "sector_id")
    private Long sectorId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sector_id", insertable = false, updatable = false)
    private Sector sector;

    @Column(name = "online")
    private Boolean online = false;

    @Column(name = "last_modified")
    private String lastModified;
}
