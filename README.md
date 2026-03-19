🚗 Car Rental Service

Full-stack car rental application built with NestJS + Prisma (backend) and React + Vite (frontend).

✨ Features

- JWT authentication
- Role-based access control
- Car rental system (1 active rental per user)
- Admin panel (users, cars, rentals)
- Map-based car search

👥 Roles & Permissions

All roles inherit the permissions of the USER role.

- USER
  - Browse available cars
  - Rent one car at a time
  - View current rental and history

- ADMIN
  - View all cars (including rented)
  - See who is renting a car
  - Force stop active rentals
  - Update and delete users

- SUPERADMIN
  - Manage admins (create, update, delete)
  - Update and delete users
  - Cannot manage cars or rentals

🚀 Quick Start
git clone https://github.com/shulbadariy/car-rental-service.git
cd car-rental-service
Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev && npx prisma db seed
npm run start:dev
Frontend
cd frontend
npm install
cp .env.example .env
npm run dev

Open: http://localhost:5173

👤 Demo Accounts
Role	Email	Password
SUPERADMIN	admin@test.com	123456
ADMIN	admin2@test.com	123456
USER	user@test.com	123456
📝 Notes

PostgreSQL must be running locally

Only one active rental per user

Cars with active rentals cannot be deleted

📄 License

Educational project
@zpwebbear — project is ready for review 