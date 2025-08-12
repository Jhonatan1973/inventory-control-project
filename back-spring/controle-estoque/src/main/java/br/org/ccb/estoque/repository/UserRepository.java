package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.dto.UserDTO;
import br.org.ccb.estoque.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = {"role", "sector"})
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findBySectorId(Long sectorId);

    @Query("SELECT u FROM User u JOIN FETCH u.role JOIN FETCH u.sector WHERE u.email = :email")
    Optional<User> findByEmailWithRoleAndSector(@Param("email") String email);
    @Query("SELECT new br.org.ccb.estoque.dto.UserDTO(u.id, u.username, u.email, u.password, r.name, s.name, u.lastModified) " +
            "FROM User u " +
            "JOIN u.role r " +
            "JOIN u.sector s " +
            "WHERE u.sectorId = :sectorId")
    List<UserDTO> findUsersBySectorId(@Param("sectorId") Long sectorId);

}
