# Test Login Functionality
Write-Host "🚀 Testing Login Functionality" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$API_URL = "http://localhost:5000"

# Test function
function Test-Login {
    param(
        [string]$Email,
        [string]$Password,
        [string]$ConfirmPassword,
        [string]$UserType
    )
    
    Write-Host "`n🧪 Testing $UserType login..." -ForegroundColor Yellow
    Write-Host "Email: $Email"
    Write-Host "Password: $Password"
    Write-Host "Confirm Password: $ConfirmPassword"
    
    # Validate password match
    if ($Password -ne $ConfirmPassword) {
        Write-Host "❌ Passwords do not match!" -ForegroundColor Red
        return
    }
    
    # Validate email format
    $emailRegex = "^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if ($Email -notmatch $emailRegex) {
        Write-Host "❌ Invalid email format!" -ForegroundColor Red
        return
    }
    
    try {
        $body = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL/api/${UserType}s/login" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "Token: $($response.token)"
        Write-Host "User: $($response.$UserType.name) ($($response.$UserType.email))"
        Write-Host "Role: $($response.$UserType.role)"
        
    } catch {
        $errorMessage = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorMessage)
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json
        
        Write-Host "❌ Login failed!" -ForegroundColor Red
        Write-Host "Error: $($errorData.message)" -ForegroundColor Red
    }
}

# Test cases
Write-Host "`n📋 Running test cases..." -ForegroundColor Cyan

# Test 1: Valid customer login
Test-Login -Email "customer@test.com" -Password "password123" -ConfirmPassword "password123" -UserType "customer"

# Test 2: Valid farmer login
Test-Login -Email "farmer@test.com" -Password "password123" -ConfirmPassword "password123" -UserType "farmer"

# Test 3: Invalid email
Test-Login -Email "invalid-email" -Password "password123" -ConfirmPassword "password123" -UserType "customer"

# Test 4: Wrong password
Test-Login -Email "customer@test.com" -Password "wrongpassword" -ConfirmPassword "wrongpassword" -UserType "customer"

# Test 5: Password mismatch
Test-Login -Email "customer@test.com" -Password "password123" -ConfirmPassword "differentpassword" -UserType "customer"

# Test 6: Non-existent user
Test-Login -Email "nonexistent@test.com" -Password "password123" -ConfirmPassword "password123" -UserType "customer"

Write-Host "`n🎉 Login testing completed!" -ForegroundColor Green 