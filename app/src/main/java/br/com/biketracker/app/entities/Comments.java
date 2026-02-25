package br.com.biketracker.app.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Comments {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private String content;

    private boolean edited;

    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    public Comments(User user, String content) {
        createAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();
        this.user = user;
        this.content = content;
        this.edited = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updateAt = LocalDateTime.now();
    }

    public void editComment(String newContent) {

        if (newContent == null || newContent.isBlank()) {
            throw new IllegalArgumentException("O conteúdo do comentário não pode estar vazio.");
        }

        if (!newContent.equals(this.content)) {
            this.content = newContent;
            this.edited = true;
        }
    }

}
