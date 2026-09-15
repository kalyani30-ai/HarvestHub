@echo off
echo 🚀 Starting Harvest Hub Application...

REM Check if MongoDB is running (Windows)
echo 📊 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    Run: mongod
    echo.
    pause
)

REM Check if ports are available
echo 🔍 Checking ports...
netstat -an | find "5000" >nul
if %ERRORLEVEL%==0 (
    echo ❌ Port 5000 is already in use
    pause
    exit /b 1
)

netstat -an | find "5173" >nul
if %ERRORLEVEL%==0 (
    echo ❌ Port 5173 is already in use
    pause
    exit /b 1
)

echo ✅ Ports are available

REM Create .env files if they don't exist
echo 📝 Setting up environment files...

REM Backend .env
if not exist "harvesthub-backend\.env" (
    echo Creating backend .env file...
    (
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo ALLOW_ANY_LOGIN=true
        echo.
        echo # MongoDB Configuration
        echo MONGO_URI=mongodb://localhost:27017/harvesthub
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=harvest_hub_jwt_secret_key_2024
        echo JWT_EXPIRE=7d
        echo.
        echo # File Upload Configuration
        echo MAX_FILE_SIZE=5242880
        echo UPLOAD_PATH=./public/uploads
    ) > harvesthub-backend\.env
    echo ✅ Backend .env created
) else (
    echo ✅ Backend .env already exists
)

REM Frontend .env
if not exist "harvest-hub-bloom\.env" (
    echo Creating frontend .env file...
    (
        echo # API Configuration
        echo VITE_API_BASE_URL=http://localhost:5000/api
    ) > harvest-hub-bloom\.env
    echo ✅ Frontend .env created
) else (
    echo ✅ Frontend .env already exists
)

REM Install dependencies
echo 📦 Installing dependencies...

echo Installing backend dependencies...
cd harvesthub-backend
call npm install
cd ..

echo Installing frontend dependencies...
cd harvest-hub-bloom
call npm install
cd ..

REM Start both servers
echo 🚀 Starting servers...

REM Start backend in a new window
echo Starting backend server...
start "Harvest Hub Backend" cmd /k "cd harvesthub-backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting frontend server...
start "Harvest Hub Frontend" cmd /k "cd harvest-hub-bloom && npm run dev"

echo.
echo 🎉 Harvest Hub is starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 MongoDB:  mongodb://localhost:27017/harvesthub
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause 