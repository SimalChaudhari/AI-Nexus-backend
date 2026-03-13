# Payment API – Test Steps

Backend base URL: `http://localhost:3000/api` (or set `BASE` below).

## 1. Login to get JWT

**PowerShell:**
```powershell
$BASE = "http://localhost:3000/api"
$login = Invoke-RestMethod -Uri "$BASE/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
$token = $login.access_token
Write-Host "Token: $token"
```

**curl (bash/Git Bash):**
```bash
BASE=http://localhost:3000/api
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}')
TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with a real user.

---

## 2. Create checkout (card-only)

Use the `access_token` from step 1 as `Authorization: Bearer <token>`.

**PowerShell:**
```powershell
$body = @{
  items = @(
    @{ id = "your-course-id"; name = "Test Course"; price = 9.99; quantity = 1 }
  )
  successUrl = "http://localhost:3030/product/checkout/success"
  cancelUrl  = "http://localhost:3030/product/checkout"
  currency   = "USD"
} | ConvertTo-Json -Depth 4

Invoke-RestMethod -Uri "$BASE/payments/create-checkout-cards" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body $body
```

**curl:**
```bash
curl -s -X POST "$BASE/payments/create-checkout-cards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"id":"your-course-id","name":"Test Course","price":9.99,"quantity":1}],
    "successUrl": "http://localhost:3030/product/checkout/success",
    "cancelUrl": "http://localhost:3030/product/checkout",
    "currency": "USD"
  }'
```

**Expected success response:** `{"url":"https://...","sessionId":"..."}` — open `url` in browser to complete payment on WooshPay.

---

## 3. Quick negative tests

- **No token** → 401 Unauthorized  
  `curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/payments/create-checkout-cards" -H "Content-Type: application/json" -d '{"items":[{"id":"c1","name":"C","price":1,"quantity":1}],"successUrl":"https://e.com/s","cancelUrl":"https://e.com/c"}'`

- **Empty items** → 400 "Cart is empty"  
  (same as above but with valid token and `"items": []`)

---

## Endpoints summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| POST   | `/api/auth/login` | No | Get JWT (body: `email`, `password`) |
| POST   | `/api/payments/create-checkout` | Bearer | Checkout (default payment methods) |
| POST   | `/api/payments/create-checkout-cards` | Bearer | Checkout (card only) |
| POST   | `/api/payments/webhook` | Signature (WooshPay) | Called by WooshPay after payment |
