package br.com.biketracker.app.controllers;


import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.UserRequest;
import br.com.biketracker.app.entities.dtos.UserResponse;
import br.com.biketracker.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        User user = new User(
                request.name(),
                request.email(),
                request.password(),
                request.age(),
                request.weight(),
                request.bornAt(),
                request.tipoSanguineo()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(userService.save(user)));

    }

    //TODO allow only authenticated requests to acesses this method
    @GetMapping
    public ResponseEntity<UserResponse> getUser(@RequestParam String id) {
        User user = userService.findById(id);
        return user != null ? ResponseEntity.ok(UserResponse.from(user)) : ResponseEntity.notFound().build();
    }


}
