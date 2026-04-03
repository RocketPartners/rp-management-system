# HRIS-36: Asset & Inventory Management

## Overview

Flat single-table asset management system for the HRIS. Each row in `assets` is either one individually-tracked item (laptop, monitor) or a bulk consumable (pens, cables). Replaces the over-engineered two-tier Laravel system with a simpler, more capable design.

## Design Decisions

1. **Flat model over two-tier** — no InventoryItem → Asset parent/child. Each asset is one row.
2. **INDIVIDUAL vs CONSUMABLE tracking** — individual items get serial numbers and 1:1 assignments. Consumables get quantity tracking with low-stock alerts.
3. **Check-in/check-out model** — assignments use checkout/checkin metaphor with condition comparison.
4. **JSON specifications** — flexible metadata per asset (RAM, storage, screen size) without schema changes. Category defines a spec template.
5. **Auto-generated asset tags** — prefix per category (IT-0001, FUR-0001) with auto-increment.
6. **Lifecycle state machine** — validated transitions prevent bad data (can't go RETIRED → ASSIGNED).
7. **New V18 migration** — drops V6 tables and creates new schema. V6 tables have no production data.

## Database Schema

### V18 Migration (drops V6 + creates new)

```sql
-- Drop old V6 tables
DROP TABLE IF EXISTS item_assignments;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS inventory_categories;

-- Categories
CREATE TABLE asset_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    tag_prefix VARCHAR(10) NOT NULL DEFAULT 'AST',
    spec_template JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Assets (individual items + consumables in one table)
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_tag VARCHAR(50) UNIQUE,
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    tracking_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    description TEXT,
    specifications JSONB,
    quantity INTEGER NOT NULL DEFAULT 1,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    warranty_expiry DATE,
    condition VARCHAR(20) NOT NULL DEFAULT 'NEW',
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(255),
    notes TEXT,
    image_url VARCHAR(500),
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_category FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    CONSTRAINT fk_assets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_tracking_type CHECK (tracking_type IN ('INDIVIDUAL', 'CONSUMABLE')),
    CONSTRAINT chk_asset_condition CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED')),
    CONSTRAINT chk_asset_status CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED', 'LOST', 'DISPOSED'))
);

-- Asset assignments (check-in/check-out)
CREATE TABLE asset_assignments (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    assigned_by BIGINT,
    quantity_assigned INTEGER NOT NULL DEFAULT 1,
    checked_out_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    checked_in_at TIMESTAMP,
    condition_on_checkout VARCHAR(20),
    condition_on_checkin VARCHAR(20),
    checkout_notes TEXT,
    checkin_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_OUT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_assignment_status CHECK (status IN ('CHECKED_OUT', 'RETURNED', 'OVERDUE')),
    CONSTRAINT chk_checkout_condition CHECK (condition_on_checkout IS NULL OR condition_on_checkout IN ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED')),
    CONSTRAINT chk_checkin_condition CHECK (condition_on_checkin IS NULL OR condition_on_checkin IN ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'))
);

-- Asset history (audit trail)
CREATE TABLE asset_history (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    user_id BIGINT,
    performed_by BIGINT,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_history_performed_by FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_tracking_type ON assets(tracking_type);
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignments_user ON asset_assignments(user_id);
CREATE INDEX idx_assignments_status ON asset_assignments(status);
CREATE INDEX idx_history_asset ON asset_history(asset_id);
```

### Seed Data (V19)

Categories: IT Equipment (IT), Office Supplies (SUP), Furniture (FUR), Peripherals (PER), Mobile Devices (MOB)

Sample assets: MacBook Pro, Dell Monitor, Logitech Keyboard (individual), Whiteboard Markers and USB Cables (consumable)

Sample assignments: 2-3 assets checked out to seeded users

## Backend Architecture (Spring Boot)

### Entities

| Entity | Package |
|--------|---------|
| AssetCategory | infrastructure.database.entity |
| Asset | infrastructure.database.entity |
| AssetAssignment | infrastructure.database.entity |
| AssetHistory | infrastructure.database.entity |

Key entity features:
- All extend `BaseEntity`
- Asset has inner enums: `TrackingType`, `AssetCondition`, `AssetStatus`
- AssetAssignment has inner enum: `AssignmentStatus`
- Asset has lifecycle validation method: `canTransitionTo(AssetStatus newStatus)`

### Repositories

| Repository | Custom Methods |
|------------|----------------|
| AssetCategoryRepository | findByCode(), findAllByIsActiveTrue() |
| AssetRepository | search with filters (category, status, tracking_type, keyword), findByAssetTag(), lowStock consumables |
| AssetAssignmentRepository | findActiveByAssetId(), findByUserId(), countActiveByAssetId() |
| AssetHistoryRepository | findByAssetId() ordered by createdAt desc |

### DTOs

**Requests:**
- CreateAssetRequest (name, categoryId, trackingType, serialNumber, manufacturer, model, specifications, quantity, minQuantity, purchaseDate, purchasePrice, warrantyExpiry, condition, location, notes)
- UpdateAssetRequest (same fields, all optional)
- CheckOutRequest (assetId, userId, expectedReturnDate, conditionOnCheckout, notes)
- CheckInRequest (conditionOnCheckin, notes)
- CreateCategoryRequest (name, code, description, tagPrefix, specTemplate)

**Responses:**
- AssetResponse (all fields + category name + current assignee info)
- AssetDetailResponse (extends AssetResponse + assignment history + asset history)
- AssetAssignmentResponse (assignment details with user info)
- AssetCategoryResponse (category fields + asset count)
- AssetHistoryResponse (action, user, performer, timestamps)
- DashboardStats (total, available, assigned, inRepair, retired, lowStockCount)

### Services

**AssetCategoryService:**
- getAll(), getById(), create(), update(), delete()

**AssetService:**
- list() — paginated with search/filter (keyword, categoryId, status, trackingType)
- getById() — full detail with assignments and history
- create() — auto-generate asset tag, log history
- update() — validate status transitions, log history
- delete() — only if not currently assigned
- getDashboardStats()
- getLowStockConsumables()

**AssetAssignmentService:**
- checkOut() — create assignment, update asset status to ASSIGNED, log history
- checkIn() — close assignment, update asset status to AVAILABLE, log history
- getActiveAssignments() — admin view
- getMyAssets() — employee self-service (current user's active assignments)
- getAssignmentHistory() — for a specific asset

### Controllers

**AssetCategoryController** (`/asset-categories`):
- GET / — list all categories (ASSET_VIEW)
- POST / — create category (ASSET_CREATE)
- PUT /{id} — update category (ASSET_EDIT)
- DELETE /{id} — delete category (ASSET_DELETE)

**AssetController** (`/assets`):
- GET / — paginated list with filters (ASSET_VIEW)
- GET /{id} — detail view (ASSET_VIEW)
- POST / — create asset (ASSET_CREATE)
- PUT /{id} — update asset (ASSET_EDIT)
- DELETE /{id} — delete asset (ASSET_DELETE)
- GET /dashboard-stats — summary stats (ASSET_VIEW)
- GET /low-stock — low stock consumables (ASSET_VIEW)

**AssetAssignmentController** (`/asset-assignments`):
- POST /check-out — assign asset to user (ASSET_ASSIGN)
- POST /{id}/check-in — return asset (ASSET_ASSIGN)
- GET / — list active assignments (ASSET_VIEW)
- GET /my-assets — employee self-service (authenticated)
- GET /asset/{assetId}/history — assignment history for asset (ASSET_VIEW)

### Permissions (seed in V19)

- ASSET_VIEW — view assets and assignments
- ASSET_CREATE — create new assets and categories
- ASSET_EDIT — update assets and categories
- ASSET_DELETE — delete assets and categories
- ASSET_ASSIGN — check out / check in assets

Roles: super-admin gets all, admin gets all, hr-manager gets VIEW/ASSIGN, project-manager gets VIEW

### Lifecycle State Machine

Valid transitions:
```
AVAILABLE   → ASSIGNED, IN_REPAIR, RETIRED, LOST
ASSIGNED    → AVAILABLE (via check-in), IN_REPAIR, LOST
IN_REPAIR   → AVAILABLE, RETIRED, DISPOSED
RETIRED     → DISPOSED, AVAILABLE (re-activate)
LOST        → AVAILABLE (found)
DISPOSED    → (terminal state, no transitions)
```

### Asset Tag Generation

Format: `{category.tagPrefix}-{zero-padded sequence}`
Example: IT-0001, IT-0002, SUP-0001

Logic: Query max existing tag for the category prefix, increment. Race condition handled by unique constraint + retry.

## Frontend (Phase 2 — after backend)

Will replicate the Laravel monolith pages in TSX using existing patterns:
- Admin: Asset list, create/edit, detail view, category management
- Admin: Assignment management (check-out/check-in)
- Employee: My Assets view
- Update router.tsx routes from ComingSoon to actual pages
- Navigation already wired in AuthenticatedLayout.tsx

## Not In Scope

- Asset request workflow (use HRIS-39 Tickets instead)
- Depreciation tracking
- Maintenance scheduling
- Software license tracking
- Bulk CSV import
- QR code generation (can add later)
