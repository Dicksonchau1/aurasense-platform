@echo off
REM Automated setup for Jest and React Testing Library, then run all tests
cd /d %~dp0

REM Install dependencies
call npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest @types/react @types/testing-library__jest-dom @types/testing-library__react

REM Initialize Jest config if not present
if not exist jest.config.js (
  npx ts-jest config:init
)

REM Run tests
npx jest src/components/atlas/sections/__tests__ --passWithNoTests
