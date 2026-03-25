# Shipment System Architecture

## System Overview Diagram

```mermaid
graph TB
    Customer[Customer Browser]
    Frontend[Next.js Frontend]
    PaymentAPI[Payment API :3001]
    Shiprocket[Shiprocket API]
    Razorpay[Razorpay API]
    
    Customer -->|Add to Cart| Frontend
    Customer -->|Checkout| Frontend
    Frontend -->|Create Payment| PaymentAPI
    PaymentAPI -->|Create Order| Razorpay
    Razorpay -->|Payment Modal| Customer
    Customer -->|Complete Payment| Razorpay
    Razorpay -->|Payment Success| Frontend
    Frontend -->|Verify Payment| PaymentAPI
    Frontend -->|Create Shipment| PaymentAPI
    PaymentAPI -->|Authenticate| Shiprocket
    PaymentAPI -->|Create Order| Shiprocket
    Shiprocket -->|Shipment ID| PaymentAPI
    PaymentAPI -->|Shipment Data| Frontend
    Frontend -->|Track Shipment| PaymentAPI
    PaymentAPI -->|Get Tracking| Shiprocket
    Shiprocket -->|Tracking Info| PaymentAPI
    PaymentAPI -->|Tracking Data| Frontend
    Frontend -->|Display Tracking| Customer
```

## Complete Order Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant P as Payment API
    participant R as Razorpay
    participant S as Shiprocket
    
    C->>F: Add Products to Cart
    C->>F: Proceed to Checkout
    C->>F: Fill Shipping Details
    C->>F: Fill Payment Info
    C->>F: Click Place Order
    
    F->>P: POST /payment/create-order
    P->>R: Create Razorpay Order
    R-->>P: Order ID
    P-->>F: Order Created
    
    F->>C: Open Payment Modal
    C->>R: Complete Payment
    R-->>F: Payment Success
    
    F->>P: POST /payment/verify
    P->>P: Verify Signature
    P-->>F: Payment Verified
    
    F->>P: POST /shipment/create-order
    P->>S: Authenticate
    S-->>P: Token
    P->>S: Create Shipment Order
    S-->>P: Shipment ID + AWB
    P-->>F: Shipment Created
    
    F->>F: Clear Cart
    F->>C: Redirect to Orders
    
    Note over F,P: Customer Can Track
    C->>F: View Order Tracking
    F->>P: GET /shipment/track/:id
    P->>S: Get Tracking Data
    S-->>P: Tracking Info
    P-->>F: Tracking Data
    F->>C: Display Tracking Timeline
```

## Component Architecture

```mermaid
graph TB
    subgraph Frontend
        Checkout[Checkout Page]
        ReviewOrder[Review Order Component]
        ShipmentService[Shipment Service]
        PaymentService[Payment Service]
        OrderTracking[Order Tracking Component]
    end
    
    subgraph PaymentAPI
        ShipmentRoutes[Shipment Routes]
        PaymentRoutes[Payment Routes]
        ShiprocketHelper[Shiprocket Helper]
        RazorpayHelper[Razorpay Helper]
        AuthMiddleware[Auth Middleware]
    end
    
    subgraph External
        Shiprocket[Shiprocket API]
        Razorpay[Razorpay API]
    end
    
    Checkout --> ReviewOrder
    ReviewOrder --> PaymentService
    ReviewOrder --> ShipmentService
    
    PaymentService --> PaymentRoutes
    ShipmentService --> ShipmentRoutes
    
    ShipmentRoutes --> AuthMiddleware
    ShipmentRoutes --> ShiprocketHelper
    PaymentRoutes --> RazorpayHelper
    
    ShiprocketHelper --> Shiprocket
    RazorpayHelper --> Razorpay
    
    OrderTracking --> ShipmentService
```

## Shipment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PaymentPending
    PaymentPending --> PaymentCompleted: Payment Success
    PaymentPending --> PaymentFailed: Payment Failed
    
    PaymentCompleted --> ShipmentCreating: Create Shipment
    ShipmentCreating --> ShipmentCreated: Shiprocket Success
    ShipmentCreating --> ShipmentFailed: Shiprocket Error
    
    ShipmentCreated --> AWBAssigned: Assign AWB
    AWBAssigned --> PickupRequested: Request Pickup
    PickupRequested --> PickupScheduled: Pickup Confirmed
    
    PickupScheduled --> InTransit: Courier Picked Up
    InTransit --> OutForDelivery: Reached Destination
    OutForDelivery --> Delivered: Customer Received
    
    PaymentFailed --> [*]
    ShipmentFailed --> ManualIntervention
    ManualIntervention --> ShipmentCreated
    Delivered --> [*]
```

## Data Flow

```mermaid
graph LR
    Cart[Cart Items] --> OrderData[Order Data]
    ShippingForm[Shipping Form] --> OrderData
    
    OrderData --> PaymentOrder[Payment Order]
    PaymentOrder --> RazorpayVerification[Verify Payment]
    
    RazorpayVerification --> ShipmentOrder[Shipment Order Data]
    ShipmentOrder --> ShiprocketAPI[Shiprocket API]
    
    ShiprocketAPI --> ShipmentID[Shipment ID]
    ShipmentID --> TrackingData[Tracking Data]
    TrackingData --> CustomerView[Customer Tracking View]
```

## API Endpoint Structure

```mermaid
graph TB
    subgraph Public Endpoints
        DeliveryPrice[GET /delivery-price]
        TrackShipment[GET /track/:id]
        TrackAWB[GET /track-awb/:awb]
        Status[GET /status]
    end
    
    subgraph Authenticated Endpoints
        CreateOrder[POST /create-order]
        AssignAWB[POST /assign-awb]
        RequestPickup[POST /request-pickup]
        GetOrders[GET /orders]
        CancelShipment[POST /cancel]
        AddLocation[POST /add-pickup-location]
    end
    
    subgraph Shiprocket Integration
        Auth[Authenticate & Cache Token]
        CreateShipment[Create Shipment Order]
        AssignTracking[Assign AWB Number]
        SchedulePickup[Schedule Pickup]
        GetTracking[Get Tracking Data]
    end
    
    CreateOrder --> Auth
    Auth --> CreateShipment
    CreateShipment --> AssignTracking
    
    RequestPickup --> Auth
    Auth --> SchedulePickup
    
    TrackShipment --> Auth
    Auth --> GetTracking
```

## Security Flow

```mermaid
graph TB
    Request[API Request]
    AuthCheck{Auth Required?}
    TokenCheck{Valid Token?}
    ShiprocketAuth[Shiprocket Auth]
    ProcessRequest[Process Request]
    Response[API Response]
    Error401[401 Unauthorized]
    
    Request --> AuthCheck
    AuthCheck -->|No| ProcessRequest
    AuthCheck -->|Yes| TokenCheck
    TokenCheck -->|Valid| ShiprocketAuth
    TokenCheck -->|Invalid| Error401
    ShiprocketAuth --> ProcessRequest
    ProcessRequest --> Response
```

## Error Handling Flow

```mermaid
graph TB
    Operation[Shipment Operation]
    Success{Success?}
    PaymentDone{Payment Done?}
    NotifyCustomer[Notify Customer]
    LogError[Log Error]
    RetryLogic{Can Retry?}
    ManualReview[Flag for Manual Review]
    
    Operation --> Success
    Success -->|Yes| NotifyCustomer
    Success -->|No| PaymentDone
    PaymentDone -->|Yes| LogError
    PaymentDone -->|No| NotifyCustomer
    LogError --> RetryLogic
    RetryLogic -->|Yes| Operation
    RetryLogic -->|No| ManualReview
```

## Performance Optimization

```mermaid
graph TB
    Request[API Request]
    TokenCache{Token Cached?}
    UseCache[Use Cached Token]
    FetchNew[Fetch New Token]
    CacheToken[Cache for 23h]
    APICall[Call Shiprocket API]
    Response[Return Response]
    
    Request --> TokenCache
    TokenCache -->|Yes| UseCache
    TokenCache -->|No| FetchNew
    FetchNew --> CacheToken
    CacheToken --> APICall
    UseCache --> APICall
    APICall --> Response
```

---

## Key Design Decisions

### 1. **Separate Payment API Service**
- Runs on port 3001
- Independent from main backend
- Dedicated to payment and shipment operations
- Easier to scale and maintain

### 2. **Token Caching**
- 23-hour cache duration
- Prevents rate limiting
- Reduces authentication overhead
- Automatic refresh on expiry

### 3. **Async Shipment Creation**
- Non-blocking operation
- Payment completes first
- Shipment created in background
- Graceful error handling

### 4. **Public Tracking Endpoints**
- No auth required for tracking
- Requires shipment ID or AWB
- Better customer experience
- Reduces support load

### 5. **TypeScript Integration**
- Full type safety on frontend
- Auto-completion in IDEs
- Compile-time error checking
- Better developer experience

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Production
        LB[Load Balancer]
        Frontend1[Frontend Instance 1]
        Frontend2[Frontend Instance 2]
        PaymentAPI1[Payment API Instance 1]
        PaymentAPI2[Payment API Instance 2]
        Redis[Redis Cache]
    end
    
    subgraph External Services
        Shiprocket[Shiprocket API]
        Razorpay[Razorpay API]
    end
    
    LB --> Frontend1
    LB --> Frontend2
    Frontend1 --> PaymentAPI1
    Frontend2 --> PaymentAPI2
    PaymentAPI1 --> Redis
    PaymentAPI2 --> Redis
    PaymentAPI1 --> Shiprocket
    PaymentAPI2 --> Shiprocket
    PaymentAPI1 --> Razorpay
    PaymentAPI2 --> Razorpay
```

---

**Architecture Version:** 1.0  
**Last Updated:** November 18, 2025  
**Status:** Production Ready
