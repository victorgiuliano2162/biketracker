package br.com.biketracker.app.controllers;


import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.user.UserRequest;
import br.com.biketracker.app.entities.dtos.user.UserResponse;
import br.com.biketracker.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        try {

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
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage()+"/n"+request.toString(), ex);
        }

    }

    //TODO allow only authenticated requests to acesses this method
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        User user = userService.findById(id);
        return user != null ? ResponseEntity.ok(UserResponse.from(user)) : ResponseEntity.notFound().build();
    }


}
