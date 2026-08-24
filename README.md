# Fresh Produce Connect

I want to recreate the COMPLETE PureFarm web application shown at:

https://pure-farm-connect--purefarmapp.replit.app/

IMPORTANT:

Do NOT start implementing yet.

This is a reference application. I want to rebuild the complete application experience using my own implementation, data, and assets. Do not copy private credentials, private user data, proprietary source code, or copyrighted assets.

YOUR FIRST TASK IS ONLY DISCOVERY AND ANALYSIS.

==================================================

1. INSPECT THE COMPLETE WEBSITE

==================================================

Open and inspect:

https://pure-farm-connect--purefarmapp.replit.app/

Explore the website thoroughly.

Do not stop at /marketplace.

Follow all accessible navigation links, buttons, cards, CTAs, footer links, profile links, product links, and other internal navigation.

Identify every publicly accessible page and route.

Also identify pages that appear to require authentication.

==================================================

2. CREATE A COMPLETE ROUTE INVENTORY

==================================================

For every discovered route, document:

- Route

- Page name

- Purpose

- Main sections

- Important UI components

- User interactions

- Links to other pages

- Whether authentication is required

- Desktop layout

- Mobile layout

For example:

/

/marketplace

/product/...

/login

/register

/dashboard

etc.

Do NOT invent routes that do not exist in the reference unless they are clearly required for a discovered user flow.

==================================================

3. IDENTIFY THE COMPLETE USER FLOWS

==================================================

Analyze flows such as:

- Visitor → Home

- Visitor → Marketplace

- Marketplace → Product

- Product → Cart

- Cart → Checkout

- Login/Register

- Farmer workflow

- Seller workflow

- Dashboard workflow

- Profile workflow

- Order workflow

Document what happens when the user clicks each important CTA.

==================================================

4. ANALYZE THE DESIGN SYSTEM

==================================================

Inspect the visual design carefully.

Document:

- Primary colors

- Secondary colors

- Background colors

- Gradients

- Typography

- Font sizes

- Font weights

- Border radius

- Shadows

- Cards

- Buttons

- Inputs

- Badges

- Icons

- Navigation

- Footer

- Images

- Illustrations

- Spacing

- Grid layouts

- Responsive behavior

Pay particular attention to the agricultural/farming visual identity.

==================================================

5. IDENTIFY REUSABLE COMPONENTS

==================================================

Determine which components should be shared.

Examples:

- Header

- Footer

- Sidebar

- Navigation

- ProductCard

- CategoryCard

- SearchBar

- FilterPanel

- Button

- Modal

- Form

- DashboardCard

- OrderCard

- ProfileCard

- Notification

- MobileNavigation

Do not create duplicate components for the same visual pattern.

==================================================

6. IDENTIFY DATA MODELS

==================================================

Determine what data structures the application appears to need.

For example:

User

Farmer

Seller

Product

Category

Cart

CartItem

Order

Review

Crop

CropStage

Notification

Only include models relevant to the actual reference application.

==================================================

7. IDENTIFY RESPONSIVE BEHAVIOR

==================================================

Inspect the website at desktop and mobile widths.

Document how each major section changes between:

- Desktop

- Tablet

- Mobile

Pay attention to:

- Navigation

- Product grids

- Cards

- Tables

- Filters

- Forms

- Modals

- Sidebars

- Buttons

- Images

- Typography

- Spacing

==================================================

8. CREATE A REBUILD PLAN

==================================================

After inspection, provide a structured implementation plan in this order:

PHASE 1

Project foundation

PHASE 2

Global layout/design system

PHASE 3

Public pages

PHASE 4

Marketplace

PHASE 5

Product/details flows

PHASE 6

Authentication

PHASE 7

Farmer functionality

PHASE 8

Seller functionality

PHASE 9

Dashboards

PHASE 10

Cart/orders/checkout

PHASE 11

Responsive/mobile implementation

PHASE 12

Testing and visual comparison

==================================================

CRITICAL REQUIREMENT

==================================================

DO NOT WRITE APPLICATION CODE YET.

DO NOT MODIFY THE PROJECT YET.

First give me the complete:

1. Route inventory

2. Page inventory

3. Component inventory

4. User-flow inventory

5. Design-system analysis

6. Data-model analysis

7. Responsive analysis

8. Complete implementation plan

I will review the analysis before you start building.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a23e8d1f-d4c7-4bde-8264-1e0a2ee379db).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
