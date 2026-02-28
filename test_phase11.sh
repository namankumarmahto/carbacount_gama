#!/bin/bash
echo "Registering Industry A..."
curl -s -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d '{"name":"User A", "email":"userA@a.com", "password":"password", "industryName":"Industry A"}'
echo -e "\nLogging in Industry A..."
TOKEN_A=$(curl -s -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d '{"email":"userA@a.com", "password":"password"}' | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
PLANT_A=$(docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d carbon_db -t -c "SELECT p.id FROM plant p JOIN users u ON p.tenant_id = u.tenant_id WHERE u.email='userA@a.com' LIMIT 1" | xargs)

echo "Adding Emission for Industry A (Plant $PLANT_A)..."
curl -s -X POST http://localhost:8081/api/emissions -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_A" -d "{\"plantId\":\"$PLANT_A\", \"scope1\":100, \"scope2\":50, \"scope3\":10, \"recordedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"

echo -e "\n\nRegistering Industry B..."
curl -s -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d '{"name":"User B", "email":"userB@b.com", "password":"password", "industryName":"Industry B"}'
echo -e "\nLogging in Industry B..."
TOKEN_B=$(curl -s -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d '{"email":"userB@b.com", "password":"password"}' | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
PLANT_B=$(docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d carbon_db -t -c "SELECT p.id FROM plant p JOIN users u ON p.tenant_id = u.tenant_id WHERE u.email='userB@b.com' LIMIT 1" | xargs)

echo "Adding Emission for Industry B (Plant $PLANT_B)..."
curl -s -X POST http://localhost:8081/api/emissions -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_B" -d "{\"plantId\":\"$PLANT_B\", \"scope1\":500, \"scope2\":200, \"scope3\":50, \"recordedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"

echo -e "\n\n--- RESULTS ---"
echo "Dashboard Industry A:"
curl -s -X GET http://localhost:8081/api/dashboard -H "Authorization: Bearer $TOKEN_A" | jq .
echo "Dashboard Industry B:"
curl -s -X GET http://localhost:8081/api/dashboard -H "Authorization: Bearer $TOKEN_B" | jq .
