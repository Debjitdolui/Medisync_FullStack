package com.medisync.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key-id}")
    @Getter
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;
    private boolean dummyMode = false;

    @PostConstruct
    public void init() {
        try {
            razorpayClient = new RazorpayClient(keyId, keySecret);
            log.info("Razorpay client initialized with key: {}", keyId);
        } catch (RazorpayException e) {
            log.warn("Failed to initialize Razorpay client. Running in DUMMY mode: {}", e.getMessage());
            dummyMode = true;
        }
    }

    /**
     * Create a Razorpay order.
     * Falls back to dummy order if Razorpay is not configured.
     */
    public Map<String, Object> createOrder(long amountInPaise, String currency, String receipt) throws RazorpayException {
        if (dummyMode) {
            return createDummyOrder(amountInPaise, currency, receipt);
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);

            Order order = razorpayClient.orders.create(orderRequest);

            Map<String, Object> result = new HashMap<>();
            result.put("id", order.get("id"));
            result.put("amount", order.get("amount"));
            result.put("currency", order.get("currency"));
            result.put("receipt", order.get("receipt"));
            result.put("status", order.get("status"));
            return result;
        } catch (RazorpayException e) {
            log.warn("Razorpay API call failed, falling back to dummy: {}", e.getMessage());
            return createDummyOrder(amountInPaise, currency, receipt);
        }
    }

    /**
     * Verify Razorpay payment signature.
     * In dummy mode, always returns true.
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (dummyMode || orderId.startsWith("order_dummy_")) {
            return true; // Dummy mode always succeeds
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);
            Utils.verifyPaymentSignature(attributes, keySecret);
            return true;
        } catch (RazorpayException e) {
            log.error("Payment signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isDummyMode() {
        return dummyMode;
    }

    private Map<String, Object> createDummyOrder(long amountInPaise, String currency, String receipt) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", "order_dummy_" + UUID.randomUUID().toString().substring(0, 14));
        result.put("amount", amountInPaise);
        result.put("currency", currency);
        result.put("receipt", receipt);
        result.put("status", "created");
        return result;
    }
}
