package br.com.biketracker.app.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping
    public String hello() {
        return "Hello World";
    }


}
