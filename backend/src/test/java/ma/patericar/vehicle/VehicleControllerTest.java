package ma.patericar.vehicle;

import ma.patericar.auth.CustomUserDetailsService;
import ma.patericar.auth.JwtService;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.vehicle.dto.VehicleDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = VehicleController.class,
    excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class}
)
@DisplayName("VehicleController — web slice tests")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    // JwtAuthenticationFilter is a @Component Filter — @WebMvcTest picks it up.
    // Mock its dependencies so the test context can start without Spring Security.
    @MockBean private JwtService jwtService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private VehicleDto buildDto(Long id, String brand, String model, String plate) {
        return VehicleDto.builder()
                .id(id)
                .brand(brand)
                .model(model)
                .year(2022)
                .licensePlate(plate)
                .category(VehicleCategory.ECONOMIQUE)
                .transmission(Transmission.MANUAL)
                .fuelType(FuelType.DIESEL)
                .seats(5)
                .pricePerDay(new BigDecimal("150.00"))
                .deposit(new BigDecimal("2000.00"))
                .status(VehicleStatus.AVAILABLE)
                .hasImage(false)
                .build();
    }

    @Test
    @DisplayName("GET /vehicles — should return 200 with list of vehicles")
    void getAllVehicles_shouldReturn200WithList() throws Exception {
        when(vehicleService.findAll()).thenReturn(List.of(
                buildDto(1L, "Dacia", "Logan", "AA-001-AA"),
                buildDto(2L, "Renault", "Clio", "BB-002-BB")
        ));

        mockMvc.perform(get("/vehicles").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].brand", is("Dacia")))
                .andExpect(jsonPath("$[0].licensePlate", is("AA-001-AA")))
                .andExpect(jsonPath("$[1].brand", is("Renault")));
    }

    @Test
    @DisplayName("GET /vehicles/{id} — should return 200 with vehicle JSON when found")
    void getVehicleById_shouldReturn200_whenFound() throws Exception {
        VehicleDto dto = buildDto(1L, "Dacia", "Duster", "CC-003-CC");
        when(vehicleService.findById(1L)).thenReturn(dto);

        mockMvc.perform(get("/vehicles/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.brand", is("Dacia")))
                .andExpect(jsonPath("$.model", is("Duster")))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));
    }

    @Test
    @DisplayName("GET /vehicles/{id} — should return 404 when vehicle not found")
    void getVehicleById_shouldReturn404_whenNotFound() throws Exception {
        when(vehicleService.findById(99L))
                .thenThrow(ResourceNotFoundException.of("Vehicle", 99L));

        mockMvc.perform(get("/vehicles/99").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /vehicles — should return 200 with empty array when no vehicles exist")
    void getAllVehicles_shouldReturn200WithEmptyArray_whenNoVehicles() throws Exception {
        when(vehicleService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/vehicles").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
