# Inventory Management System (Full-Stack CRUD)

A complete, working Inventory Management System built as a full-stack CRUD
web application:

- **Frontend:** HTML, CSS, JavaScript (no framework, no build step)
- **Backend:** Java 17+, Spring Boot 3 REST API (Maven)
- **Database:** MySQL / H2
- **API testing:** Postman

Manage products with: Product ID, Product Name, Category, Quantity, Price,
Supplier, Stock Status (auto-calculated), and Created Date — with full
Create, Read, Update and Delete operations, search, category and stock
filtering, form validation on both the frontend and backend.

---

## Table of contents

1. [Project structure](#project-structure)
2. [Architecture](#architecture)
3. [Prerequisites (Windows)](#prerequisites-windows)
4. [Step-by-step setup (Windows + VS Code)](#step-by-step-setup-windows--vs-code)
5. [Running the project day-to-day](#running-the-project-day-to-day)
6. [API overview](#api-overview)
7. [Testing with Postman](#testing-with-postman)
8. [Troubleshooting](#troubleshooting)
9. [Pushing this project to GitHub](#pushing-this-project-to-github)
10. [Future enhancements](#future-enhancements)

---

## Project structure

```
Inventory_Management_CRUD/
│
├── backend/                       Java Spring Boot 3 REST API
│   ├── pom.xml                    Maven configuration file
│   └── src/
│       └── main/
│           ├── java/com/inventory/
│           │   ├── InventoryApplication.java    Main Entry Point
│           │   ├── controller/ProductController.java  REST API logic
│           │   ├── model/Product.java            JPA Product Entity
│           │   ├── repository/ProductRepository.java Data Repository
│           │   └── service/ProductService.java    Business Logic
│           └── resources/
│               └── application.properties       Spring Boot Configuration
│
├── frontend/                      Plain HTML/CSS/JS client
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js                  Talks to the API with fetch()
│
├── docs/
│   ├── ER_Diagram.md              Database design / ER diagram
│   ├── API_Documentation.md       Full endpoint reference
│   └── Postman_Collection.json    Import this into Postman
│
├── README.md                      You are here
├── TESTING.md                     Test cases and results
└── .gitignore
```

## Architecture

```
Browser (HTML/CSS/JS)
        │  fetch() → JSON over HTTP
        ▼
Java Spring Boot REST API  (/api/products/...)
        │  Spring Data JPA / Hibernate
        ▼
MySQL database  (products table)
```

See `docs/ER_Diagram.md` for the full database design.

---

## Prerequisites (Windows)

Install these before you start. Links go to the official installers.

1. **Java Development Kit (JDK 17 or higher)** — https://adoptium.net/
2. **Apache Maven 3.8+** — https://maven.apache.org/download.cgi
3. **MySQL Community Server 8.x** — https://dev.mysql.com/downloads/installer/
   - Remember the **root password** you set during installation.
4. **VS Code** — https://code.visualstudio.com/
   - Recommended extension: "Extension Pack for Java" (Microsoft).
5. **Postman** — https://www.postman.com/downloads/

---

## Step-by-step setup (Windows + VS Code)

### 1. Open project in terminal

```powershell
cd backend
```

### 2. Run Java Spring Boot Server

```powershell
mvn spring-boot:run
```

This installs Django, Django REST Framework, django-cors-headers,
mysqlclient, python-decouple, and django-filter.

> **If `mysqlclient` fails to install on Windows:** it sometimes needs
> Microsoft C++ Build Tools. The easiest fix is to install it via a
> pre-built wheel instead:
> ```powershell
> pip install --only-binary :all: mysqlclient
> ```
> If that still fails, install "Microsoft C++ Build Tools" from
> https://visualstudio.microsoft.com/visual-cpp-build-tools/ and re-run
> `pip install -r requirements.txt`.

### 5. Create the MySQL database

Open MySQL Workbench (or the `mysql` command line) and run:

```sql
CREATE DATABASE inventory_db CHARACTER SET utf8mb4;
```

That's it — Django will create the tables inside it in step 7.

### 6. Configure your environment variables

Copy the example environment file and edit it:

```powershell
copy .env.example .env
```

Open `.env` in VS Code and fill in your real MySQL password:

```
SECRET_KEY=replace-this-with-a-long-random-secret-key
DEBUG=True
DB_NAME=inventory_db
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_HOST=localhost
DB_PORT=3306
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

> `.env` is listed in `.gitignore` and will never be committed to Git —
> that's exactly how secrets should be handled (see SOP Section 11).

### 7. Run database migrations

```powershell
python manage.py migrate
```

This creates the `products_product` table (and Django's own internal
tables) inside `inventory_db`. You should see a list of
"Applying … OK" lines.

### 8. Create an admin superuser

```powershell
python manage.py createsuperuser
```

Follow the prompts (username, email, password) — you'll use this to log
into the Django Admin panel.

### 9. Start the backend server

```powershell
python manage.py runserver
```

Leave this terminal running. You should see:

```
Starting development server at http://127.0.0.1:8000/
```

Visit `http://127.0.0.1:8000/api/products/` in your browser — you should
see `{"count": 0, "next": null, "previous": null, "results": []}`.

### 10. Open the frontend

Open a **second** terminal (keep the backend running in the first one) or
simply open the file directly:

- **Option A (simplest):** In VS Code's file explorer, right-click
  `frontend/index.html` → "Reveal in File Explorer" → double-click the
  file to open it in your browser.
- **Option B (recommended):** Install the VS Code extension "Live Server",
  right-click `frontend/index.html` → "Open with Live Server". This serves
  the page at `http://127.0.0.1:5500/frontend/index.html` and avoids some
  browser quirks with `file://` pages.

You should see the Inventory Control dashboard, with the "API connected"
pill showing in the top-right corner. Try adding, editing, searching, and
deleting a product.

> If you use a different port than `5500` for the frontend, update
> `FRONTEND_ORIGIN` in your `.env` file and restart the backend server.

---

## Running the project day-to-day

Once set up, every time you want to work on the project:

```powershell
cd backend
venv\Scripts\activate
python manage.py runserver
```

...then open `frontend/index.html` (or Live Server) in your browser.

---

## Django Admin panel

Visit `http://127.0.0.1:8000/admin/` and log in with the superuser you
created in step 8. From here you can view, search, filter, add, edit, and
delete products directly — useful for quickly seeding test data or
double-checking what the API is doing.

---

## API overview

Full details, including example requests and responses, are in
`docs/API_Documentation.md`. Quick reference:

| Operation  | Method | Endpoint                  |
|------------|--------|-----------------------------|
| Create     | POST   | `/api/products/`            |
| List/search/filter | GET | `/api/products/?search=&category=&ordering=` |
| Retrieve one | GET  | `/api/products/{id}/`       |
| Full update  | PUT  | `/api/products/{id}/`       |
| Partial update | PATCH | `/api/products/{id}/`     |
| Delete     | DELETE | `/api/products/{id}/`       |

---

## Testing with Postman

1. Open Postman.
2. `File > Import` → select `docs/Postman_Collection.json`.
3. Make sure the backend server is running (`python manage.py runserver`).
4. Run each request in the collection. See `TESTING.md` for the full list
   of test cases and expected results (valid data, missing fields,
   invalid IDs, etc.).

---

## Troubleshooting

| Problem | Likely cause / fix |
|---------|----------------------|
| `django.db.utils.OperationalError: (2002, ...)` | MySQL server isn't running, or `DB_HOST`/`DB_PORT` in `.env` are wrong. Start MySQL and check the values. |
| `django.db.utils.OperationalError: (1045, "Access denied for user...")` | Wrong `DB_USER`/`DB_PASSWORD` in `.env`. |
| `Unknown database 'inventory_db'` | You skipped step 5 — run the `CREATE DATABASE` SQL command. |
| Frontend shows "API offline" | The Django server isn't running, or it's running on a different port than `http://127.0.0.1:8000`. Check the terminal running `runserver`. |
| Browser console shows a CORS error | Add your frontend's exact origin (e.g. `http://127.0.0.1:5500`) to `FRONTEND_ORIGIN` in `.env` and restart the server. While `DEBUG=True`, all local origins are allowed by default, so this usually only matters in production. |
| `mysqlclient` fails to install | See the note in step 4 above about Build Tools / pre-built wheels. |
| `ModuleNotFoundError: No module named 'django'` | Your virtual environment isn't activated — run `venv\Scripts\activate` again. |

---

## Pushing this project to GitHub

```powershell
# From the Inventory_Management_CRUD folder (not inside backend/)
git init
git add .
git commit -m "Initial commit: Inventory Management System (Django + MySQL CRUD)"

# Create an empty repository on GitHub first (github.com/new), then:
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

After the first push, keep committing as you make changes:

```powershell
git add .
git commit -m "Describe what you changed"
git push
```

**Never commit your `.env` file** — it's already excluded by
`.gitignore`, but always double check with `git status` before committing
that no secrets are staged.

---

## Future enhancements

Ideas for extending this project further:

- User authentication (login) so only authorized staff can add/edit/delete
  products.
- Splitting `category` and `supplier` into their own database tables with
  foreign keys (see the extended ER diagram in `docs/ER_Diagram.md`).
- Low-stock email/SMS alerts.
- CSV/Excel import and export of the product list.
- Pagination controls and bulk actions in the frontend table.
- Deploying the backend (e.g. on Render/Railway) and the frontend (e.g. on
  Netlify/Vercel) so the system is reachable outside your own machine.
