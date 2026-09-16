# API Documentation — Inventory Management System

Base URL (local development): `http://127.0.0.1:8000/api/`

All request and response bodies are JSON. All endpoints are provided by
Django REST Framework's `ModelViewSet`, routed through a `DefaultRouter`.

## Product fields

| Field         | Type            | Required on create | Notes                                   |
|---------------|-----------------|---------------------|------------------------------------------|
| id            | integer         | No (auto)           | Product ID, read-only                    |
| product_name  | string (≤150)   | Yes                  | Min 2 characters                          |
| category      | string          | Yes                  | One of the fixed category choices         |
| quantity      | integer         | Yes                  | Must be `>= 0`                            |
| price         | decimal string  | Yes                  | Must be `>= 0`, 2 decimal places          |
| supplier      | string (≤150)   | Yes                  |                                            |
| stock_status  | string          | No (auto)            | `"In Stock"`, `"Low Stock"`, `"Out of Stock"` — computed from quantity, read-only |
| created_date  | ISO 8601 string | No (auto)            | Set once, on creation                     |
| updated_date  | ISO 8601 string | No (auto)            | Updated automatically on every save       |

Valid `category` values: `Electronics`, `Furniture`, `Clothing`,
`Food & Beverages`, `Stationery`, `Tools & Hardware`, `Other`.

---

## 1. Create a product

```
POST /api/products/
Content-Type: application/json
```

**Request body**
```json
{
  "product_name": "Wireless Mouse",
  "category": "Electronics",
  "quantity": 50,
  "price": "19.99",
  "supplier": "TechSupply Co"
}
```

**Success response — `201 Created`**
```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": 1,
    "product_name": "Wireless Mouse",
    "category": "Electronics",
    "quantity": 50,
    "price": "19.99",
    "supplier": "TechSupply Co",
    "stock_status": "In Stock",
    "created_date": "2026-01-10T09:15:00.123456Z",
    "updated_date": "2026-01-10T09:15:00.123456Z"
  }
}
```

**Validation error response — `400 Bad Request`**
```json
{
  "success": false,
  "errors": {
    "quantity": ["Ensure this value is greater than or equal to 0."]
  }
}
```

---

## 2. List / search / filter products

```
GET /api/products/
GET /api/products/?search=mouse
GET /api/products/?category=Electronics
GET /api/products/?ordering=-price
GET /api/products/?search=mouse&category=Electronics&ordering=quantity
```

- `search` — case-insensitive match against `product_name` and `supplier`.
- `category` — exact match against one of the category choices.
- `ordering` — any of `product_name`, `quantity`, `price`, `created_date`.
  Prefix with `-` for descending order.

**Success response — `200 OK`**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "product_name": "Office Chair",
      "category": "Furniture",
      "quantity": 5,
      "price": "149.50",
      "supplier": "FurniHouse",
      "stock_status": "Low Stock",
      "created_date": "2026-01-10T09:16:00Z",
      "updated_date": "2026-01-10T09:16:00Z"
    },
    {
      "id": 1,
      "product_name": "Wireless Mouse",
      "category": "Electronics",
      "quantity": 50,
      "price": "19.99",
      "supplier": "TechSupply Co",
      "stock_status": "In Stock",
      "created_date": "2026-01-10T09:15:00Z",
      "updated_date": "2026-01-10T09:15:00Z"
    }
  ]
}
```

---

## 3. Retrieve a single product

```
GET /api/products/{id}/
```

**Success — `200 OK`**: returns the product object (same shape as one item
in `results` above).

**Not found — `404 Not Found`**
```json
{ "detail": "Not found." }
```

---

## 4. Update a product

```
PUT /api/products/{id}/      (full update — all fields required)
PATCH /api/products/{id}/    (partial update — only send changed fields)
Content-Type: application/json
```

**Request body (PATCH example)**
```json
{ "quantity": 0 }
```

**Success response — `200 OK`**
```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": {
    "id": 1,
    "product_name": "Wireless Mouse",
    "category": "Electronics",
    "quantity": 0,
    "price": "19.99",
    "supplier": "TechSupply Co",
    "stock_status": "Out of Stock",
    "created_date": "2026-01-10T09:15:00Z",
    "updated_date": "2026-01-10T09:20:00Z"
  }
}
```

---

## 5. Delete a product

```
DELETE /api/products/{id}/
```

**Success response — `200 OK`**
```json
{
  "success": true,
  "message": "Product \"Wireless Mouse\" deleted successfully."
}
```

**Not found — `404 Not Found`**
```json
{ "detail": "Not found." }
```

---

## HTTP status code summary

| Status | Meaning                                          |
|--------|----------------------------------------------------|
| 200    | Request succeeded (list, retrieve, update, delete)  |
| 201    | Product created                                     |
| 400    | Validation failed — see `errors` in the response body |
| 404    | Product with that ID does not exist                 |
| 500    | Unexpected server error (check the Django console)  |

## Django Admin panel

In addition to the REST API, all products can be viewed and managed
through the built-in Django Admin panel at:

```
http://127.0.0.1:8000/admin/
```

Log in with the superuser account created during setup
(`python manage.py createsuperuser`).
