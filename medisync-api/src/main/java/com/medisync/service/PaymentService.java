package com.medisync.service;

import com.medisync.entity.NurseRequest;
import com.medisync.entity.Payment;
import com.medisync.entity.User;
import com.medisync.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Create payment record after Razorpay payment verification succeeds.
     */
    public Payment createPayment(NurseRequest request, User user, BigDecimal amount, String paymentMethod, String transactionId) {
        Payment payment = new Payment();
        payment.setRequest(request);
        payment.setUser(user);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setStatus("paid");
        return paymentRepository.save(payment);
    }

    /**
     * Get payment for a specific request.
     */
    public Optional<Payment> getPaymentByRequest(Long requestId) {
        return paymentRepository.findByRequestRequestId(requestId);
    }

    /**
     * Check if a request has been paid.
     */
    public boolean isPaid(Long requestId) {
        return paymentRepository.findByRequestRequestId(requestId)
                .map(p -> "paid".equals(p.getStatus()))
                .orElse(false);
    }
}
