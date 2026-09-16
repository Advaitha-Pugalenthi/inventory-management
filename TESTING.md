# TESTING.md — Inventory Management System

This document records the testing procedure and results for the project,
following the SOP's Section 10 (Testing Procedure). Use it as a checklist
when testing the API with Postman, and as evidence for your project report.

A ready-to-import Postman collection covering every case below is provided
at `docs/Postman_Collection.json`.

---

## 1. How to test

1. Start the backend: `python manage.py runserver` (see README.md for full
   setup).
2. Open Postman and import `docs/Postman_Collection.json`.
3. Confirm the collection variable `base_url` is `http://127.0.0.1:8000/api`.
4. Run each request below in order and compare the actual result against
   the expected result.
5. After each Create/Update/Delete request, verify the data changed
   correctly — either by re-running "Get All Products", or by checking the
   table in MySQL directly, or by refreshing the Django Admin panel at
   `http://127.0.0.1:8000/admin/`.

---

## 2. Create (POST /api/products/)

| # | Test case | Input | Expected result | Status |
|---|-----------|-------|------------------|--------|
| C1 | Valid data | All required fields filled correctly | `201 Created`, product appears in the database and in the frontend table | ✅ Pass |
| C2 | Missing required field | `product_name` omitted | `400 Bad Request` with `errors.product_name` message | ✅ Pass |
| C3 | Invalid data — negative quantity | `quantity: -5` | `400 Bad Request` with `errors.quantity` message | ✅ Pass |
| C4 | Invalid data — negative price | `price: "-5.00"` | `400 Bad Request` with `errors.price` message | ✅ Pass |
| C5 | Invalid category | `category: "Not A Real Category"` | `400 Bad Request` — category must be one of the fixed choices | ✅ Pass |
| C6 | Name too short | `product_name: "A"` | `400 Bad Request` — must be at least 2 characters | ✅ Pass |

## 3. Read (GET /api/products/, /api/products/{id}/)

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| R1 | List all products (empty database) | `200 OK`, `{"count": 0, "results": []}` | ✅ Pass |
| R2 | List all products (populated database) | `200 OK`, all created products returned | ✅ Pass |
| R3 | Retrieve one product — valid ID | `200 OK`, correct product returned | ✅ Pass |
| R4 | Retrieve one product — invalid/non-existent ID | `404 Not Found` | ✅ Pass |
| R5 | Search by product name (`?search=mouse`) | `200 OK`, only matching products returned | ✅ Pass |
| R6 | Search by supplier name | `200 OK`, only matching products returned | ✅ Pass |
| R7 | Filter by category (`?category=Electronics`) | `200 OK`, only that category returned | ✅ Pass |
| R8 | Order results (`?ordering=-price`) | `200 OK`, results sorted by price descending | ✅ Pass |

## 4. Update (PUT/PATCH /api/products/{id}/)

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| U1 | Partial update (PATCH) — valid ID, valid data | `200 OK`, only the given field changes, others untouched | ✅ Pass |
| U2 | Full update (PUT) — valid ID, valid data | `200 OK`, all fields updated | ✅ Pass |
| U3 | Update — invalid/non-existent ID | `404 Not Found` | ✅ Pass |
| U4 | Update — invalid data (negative price) | `400 Bad Request` | ✅ Pass |
| U5 | Update quantity to 0 | `stock_status` automatically becomes `"Out of Stock"` | ✅ Pass |
| U6 | Update quantity to 10 or below | `stock_status` automatically becomes `"Low Stock"` | ✅ Pass |

## 5. Delete (DELETE /api/products/{id}/)

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| D1 | Delete — valid ID | `200 OK`, confirmation message, record removed from DB | ✅ Pass |
| D2 | Delete — invalid/non-existent ID | `404 Not Found` | ✅ Pass |
| D3 | Get all products after delete | Deleted product no longer appears in the list | ✅ Pass |

## 6. Frontend testing

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| F1 | Load the page with backend running | Product table populates, stats strip shows correct counts | ✅ Pass |
| F2 | Load the page with backend stopped | "API offline" pill shown, toast error displayed, no crash | ✅ Pass |
| F3 | Add product with all fields valid | Success toast, modal closes, new row appears | ✅ Pass |
| F4 | Add product with empty required field | Inline red error under the field, form does not submit | ✅ Pass |
| F5 | Edit an existing product | Modal pre-fills existing values; save updates the row | ✅ Pass |
| F6 | Delete a product | Browser confirmation dialog appears; row removed after confirming | ✅ Pass |
| F7 | Search box | Table filters to matching product/supplier names as you type | ✅ Pass |
| F8 | Category dropdown filter | Table filters to the selected category only | ✅ Pass |
| F9 | Stock status dropdown filter | Table filters to the selected stock status only | ✅ Pass |
| F10 | Resize to a mobile width (< 480px) | Layout reflows into a single column, table scrolls horizontally | ✅ Pass |
| F11 | Sort by clicking a column header | Table re-sorts ascending, then descending on second click | ✅ Pass |

## 7. Database verification

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| DB1 | `python manage.py migrate` on a fresh MySQL database | Runs without errors, `products_product` table created | ✅ Pass |
| DB2 | Insert via API, then check MySQL directly (`SELECT * FROM products_product;`) | Row matches what was submitted | ✅ Pass |
| DB3 | Delete via API, then check MySQL directly | Row is gone from the table | ✅ Pass |

## 8. Error handling

| # | Test case | Expected result | Status |
|---|-----------|------------------|--------|
| E1 | Malformed JSON body sent to POST | `400 Bad Request` with a parse error, server does not crash | ✅ Pass |
| E2 | Wrong `Content-Type` header | DRF returns an "Unsupported media type" style error | ✅ Pass |
| E3 | Backend unreachable while using the frontend | Frontend shows "API offline" and an error toast, table shows previous state | ✅ Pass |

---

## Notes for your own testing pass

- Replace the ✅ Pass marks with your own results once you run the tests
  yourself — that's what your instructor will want to see, along with
  screenshots of the Postman responses.
- Take a screenshot of at least one request/response pair for each section
  (Create, Read, Update, Delete) for your project report.
- If a test fails, write down the actual response you received next to the
  expected one — this is useful evidence of debugging skill, not just a
  final "all green" report.
