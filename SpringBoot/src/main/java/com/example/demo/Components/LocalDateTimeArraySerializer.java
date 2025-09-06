package com.example.demo.Components;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.LocalDateTime;

public class LocalDateTimeArraySerializer extends StdSerializer<LocalDateTime> {
    public LocalDateTimeArraySerializer() {
        this(null);
    }

    public LocalDateTimeArraySerializer(Class<LocalDateTime> t) {
        super(t);
    }

    @Override
    public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        if (value == null) {
            gen.writeNull();
            return;
        }
        gen.writeStartArray();
        gen.writeNumber(value.getYear());
        gen.writeNumber(value.getMonthValue());
        gen.writeNumber(value.getDayOfMonth());
        gen.writeNumber(value.getHour());
        gen.writeNumber(value.getMinute());
        gen.writeNumber(value.getSecond());
        gen.writeNumber(value.getNano());
        gen.writeEndArray();
    }
}