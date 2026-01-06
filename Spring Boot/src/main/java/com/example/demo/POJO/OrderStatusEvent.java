package com.example.demo.POJO;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@AllArgsConstructor
@Getter
@Setter
public class OrderStatusEvent implements Serializable {
    private Order order;

    public OrderStatusEvent(){};
}
