package com.bookmyshow.controller;
import com.bookmyshow.service.CallService;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.*;


@RestController

@RequestMapping("/api")

public class CallController {



    private final CallService callService;



    public CallController(CallService callService) {

        this.callService = callService;

    }



    @PostMapping("/call")
    public String makeCall(@RequestParam String number) {

        return callService.makeCall(number);

    }

}