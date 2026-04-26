package com.backend.backend.services;

import com.backend.backend.models.Ticket;
import com.backend.backend.repositories.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        sampleTicket = new Ticket();
        sampleTicket.setId("ticket-001");
        sampleTicket.setUserId("user-001");
        sampleTicket.setResourceId("resource-001");
        sampleTicket.setResourceName("Lab A");
        sampleTicket.setCategory("HARDWARE");
        sampleTicket.setPriority("MEDIUM");
        sampleTicket.setDescription("Projector is not working properly");
        sampleTicket.setContactDetails("user@example.com");
    }

    @Test
    @DisplayName("createTicket - should force status to OPEN and set timestamps")
    void createTicket_shouldSetStatusOpenAndTimestamps() {
        sampleTicket.setStatus("IN_PROGRESS"); // caller tries to set a different status

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.createTicket(sampleTicket);

        assertThat(result.getStatus()).isEqualTo("OPEN");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(ticketRepository, times(1)).save(sampleTicket);
    }

    @Test
    @DisplayName("getAllTickets - should return all tickets from repository")
    void getAllTickets_shouldReturnAll() {
        when(ticketRepository.findAll()).thenReturn(List.of(sampleTicket));

        List<Ticket> result = ticketService.getAllTickets();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("ticket-001");
        verify(ticketRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getTicketsByUserId - should delegate to findByUserId")
    void getTicketsByUserId_shouldReturnUserTickets() {
        when(ticketRepository.findByUserId("user-001")).thenReturn(List.of(sampleTicket));

        List<Ticket> result = ticketService.getTicketsByUserId("user-001");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("user-001");
        verify(ticketRepository, times(1)).findByUserId("user-001");
    }

    @Test
    @DisplayName("getTicketById - should return empty Optional when ticket does not exist")
    void getTicketById_notFound_shouldReturnEmpty() {
        when(ticketRepository.findById("unknown-id")).thenReturn(Optional.empty());

        Optional<Ticket> result = ticketService.getTicketById("unknown-id");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getTicketById - should return ticket when it exists")
    void getTicketById_found_shouldReturnTicket() {
        when(ticketRepository.findById("ticket-001")).thenReturn(Optional.of(sampleTicket));

        Optional<Ticket> result = ticketService.getTicketById("ticket-001");

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo("ticket-001");
    }

    @Test
    @DisplayName("updateTicket - should refresh updatedAt and call save")
    void updateTicket_shouldRefreshUpdatedAt() {
        Instant before = Instant.now().minusSeconds(60);
        sampleTicket.setUpdatedAt(before);

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.updateTicket(sampleTicket);

        assertThat(result.getUpdatedAt()).isAfter(before);
        verify(ticketRepository, times(1)).save(sampleTicket);
    }

    @Test
    @DisplayName("deleteTicket - should call deleteById once")
    void deleteTicket_shouldCallDeleteById() {
        doNothing().when(ticketRepository).deleteById("ticket-001");

        ticketService.deleteTicket("ticket-001");

        verify(ticketRepository, times(1)).deleteById("ticket-001");
    }
}
