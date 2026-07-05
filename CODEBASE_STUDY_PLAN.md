# MediSync Frontend - Full Codebase Understanding Plan

## Phase 1: Project Architecture & Folder Structure
1. Read `package.json` → understand dependencies (Angular 18, Leaflet, RxJS)
2. Read `angular.json` → build config, styles, assets
3. Read `tsconfig.json` → strict mode, module resolution
4. Map the folder tree:
   ```
   src/app/
   ├── app.component.ts        → Root component (just <router-outlet>)
   ├── app.config.ts           → Providers (HttpClient, interceptors, router)
   ├── app.routes.ts           → All route definitions + guards + lazy loading
   ├── core/                   → Singleton services, models, guards, interceptors
   │   ├── models/             → TypeScript interfaces (data shapes)
   │   ├── services/           → API communication (HttpClient calls)
   │   ├── guards/             → Route protection (auth, role, guest)
   │   ├── interceptors/       → HTTP middleware (auth token, error handling)
   │   └── mock/               → Mock data (legacy, unused now)
   ├── shared/                 → Reusable UI components
   │   └── components/         → navbar, footer, pagination, star-rating, notification-panel
   ├── layouts/                → Page shells (public, user, admin/nurse/pharmacy)
   └── features/               → Feature modules by role
       ├── public/             → Home, Login, Signup, Forgot Password, Contact
       ├── user/               → Dashboard, Medicine Search, Nurse Booking, Profile, Feedback
       ├── pharmacy/           → Dashboard, Inventory, Reviews, Settings
       ├── nurse-panel/        → Dashboard, Requests, Availability, Settings
       └── admin/              → Dashboard, Users, Pharmacies, Nurses, Reports, Logs
   ```

## Phase 2: Core Layer (How Everything Connects)
1. **Models** (`core/models/`) → Read `index.ts` then each model file
   - Understand every interface: User, Pharmacy, Nurse, Medicine, Notification, Page<T>, etc.
2. **Services** (`core/services/`) → Read each service
   - How `environment.apiUrl` is used
   - How HttpClient makes GET/POST/PUT/DELETE calls
   - How Page<T> pagination works
3. **Interceptors** (`core/interceptors/`)
   - `auth.interceptor.ts` → Attaches JWT Bearer token to every request
   - `error.interceptor.ts` → Catches HTTP errors, redirects 401 to login
4. **Guards** (`core/guards/`)
   - `auth.guard.ts` → Blocks unauthenticated users
   - `role.guard.ts` → Blocks wrong roles (customer can't access /admin)
   - `guest.guard.ts` → Blocks logged-in users from login/signup pages

## Phase 3: Routing & Layouts
1. Read `app.routes.ts` completely
   - How routes map to layouts (PublicLayout, UserLayout, AdminLayout)
   - How `canActivate: [authGuard, roleGuard]` protects routes
   - How `data: { role: 'nurse' }` works with roleGuard
   - How `loadComponent: () => import(...)` does lazy loading
2. Read each layout:
   - `public-layout` → navbar + footer + router-outlet
   - `user-layout` → user-navbar + footer + router-outlet
   - `admin-layout` → sidebar + topbar + notification bell + router-outlet

## Phase 4: Public Pages (No Auth Required)
1. **Home** → Static landing page
2. **Login** → Form → calls `authService.login()` → stores token → redirects by role
3. **Signup** → 3 tabs (User/Pharmacy/Nurse) → different register APIs
4. **Forgot Password** → Email → OTP → Reset (works for all roles)
5. **Contact** → Static page

## Phase 5: User Features
1. **Dashboard** → `userService.getProfile()`, shows quick stats
2. **Medicine Search** → Tag input → `searchService.searchPrescription()` → results cards → pharmacy detail modal
   - Location dropdown → `addressService.getAddresses()`
   - Ratings → `reviewService.getPharmacyReviews()`
   - Directions → Google Maps URL
3. **Nurse Booking** → `nurseService.getServices()` + `getAvailableNurses()` → booking form → `nurseRequestService.createRequest()`
4. **Feedback/Rating** → `pharmacyService.getApprovedPharmacies()` → select → rate → `reviewService.addPharmacyReview()`
5. **Profile** → `userService.getProfile()` + `addressService.getAddresses()` → edit → save
6. **Help & Support** → Static FAQ page

## Phase 6: Pharmacy Features
1. **Dashboard** → `pharmacyService.getDashboard()` → stats (medicine count, reviews)
2. **Inventory** → `medicineService.getMedicinesByPharmacy()` → add/edit/delete/stock update
3. **Reviews** → `reviewService.getPharmacyReviews()` → read-only list
4. **Settings** → Profile edit + password change + image upload
   - Images: `pharmacyService.uploadImage()` / `getImages()` / `deleteImage()`

## Phase 7: Nurse Features
1. **Dashboard** → `nurseService.getMyProfile()` + `nurseRequestService.getNurseRequests()` → stats
2. **Requests** → `nurseRequestService.getNurseRequests()` → accept/reject → `updateRequestStatus()`
3. **Availability** → `nurseService.updateAvailability('online'/'offline')`
4. **Settings** → `nurseService.getMyProfile()` → edit → `updateProfile()` + `changePassword()`

## Phase 8: Admin Features
1. **Dashboard** → `adminService.getDashboard()` → counts + recent logs
2. **Pharmacies** → `adminService.getAllPharmacies()` → approve/reject/block/unblock
3. **Nurses** → `adminService.getAllNurses()` → approve/reject/block/unblock
4. **Users** → `adminService.getAllUsers()` → block/unblock
5. **Reports** → `adminService.getReports()` → stats display
6. **Activity Logs** → `adminService.getLogs()` → paginated table

## Phase 9: Data Flow Deep Dive
For each feature, trace the full flow:
```
User Action → Component Method → Service Method → HTTP Request
    → Backend Controller → Service → Repository → Database
    → Response → Observable → Component → Template Binding
```

Example flow for "Login":
```
1. login.component.ts: user fills form, clicks Login
2. calls authService.login({ email, password })
3. auth.service.ts: POST http://localhost:8080/api/auth/login
4. auth.interceptor: no token yet, request goes as-is
5. Backend AuthController.login() → AuthService.login()
6. Checks users table → pharmacy table → nurse table
7. Validates password (BCrypt) → generates JWT token
8. Returns { token, role, username, email }
9. auth.service.ts: storeAuth() → saves to localStorage
10. Redirects to /user/dashboard or /pharmacy/dashboard based on role
11. Next request: auth.interceptor attaches Bearer token
```

## Phase 10: Shared Components
1. **Pagination** → Input: totalItems, pageSize, currentPage. Output: pageChange event
2. **Star Rating** → Input: value. Output: ratingChange event
3. **Notification Panel** → fetches from NotificationService, shows dropdown
4. **User Navbar** → navigation links, notification bell, profile dropdown
5. **Public Navbar** → logo + Login/Signup buttons
6. **Footer** → static content

## Phase 11: Backend Connection Reference
| Frontend Service | Backend Controller | Base URL |
|---|---|---|
| AuthService | AuthController | /api/auth |
| UserService | UserController | /api/users |
| PharmacyService | PharmacyController | /api/pharmacies |
| NurseApiService | NurseController | /api/nurses |
| NurseRequestService | NurseRequestController | /api/nurse-requests |
| MedicineService | MedicineController | /api/medicines |
| SearchService | SearchController | /api/search |
| ReviewService | ReviewController | /api/reviews |
| NotificationService | NotificationController | /api/notifications |
| AddressService | AddressController | /api/addresses |
| AdminService | AdminController | /api/admin |

## Study Order (Recommended)
1. `app.config.ts` → `app.routes.ts` → Layouts
2. `core/models/index.ts` → all model files
3. `core/interceptors/` (auth + error)
4. `core/guards/` (auth, role, guest)
5. `core/services/auth.service.ts` (most important service)
6. Public features: login → signup → forgot-password
7. User features: dashboard → medicine-search → nurse-booking → feedback
8. Pharmacy features: dashboard → inventory → settings (image upload)
9. Nurse features: dashboard → requests → settings
10. Admin features: dashboard → pharmacies → nurses → users → logs
