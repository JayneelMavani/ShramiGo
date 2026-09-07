import requests
import json
import datetime
import random
import time

BASE_URL = "http://localhost:8000/api"

print("Starting API E2E Test...")
status = {"passed": 0, "failed": 0}

def check(condition, message):
    if condition:
        print(f"✅ {message}")
        status["passed"] += 1
    else:
        print(f"❌ {message}")
        status["failed"] += 1
        raise Exception(f"Test failed: {message}")

def get_token(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    else:
        print(f"❌ Login failed: {res.status_code} {res.text}")
        return None

def test_api():
    # 1. Register Customer
    customer_data = {
        "email": "customer@shramigo.in",
        "password": "password123",
        "full_name": "Test Customer",
        "phone": "9999999999",
        "role": "customer"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=customer_data)
    if res.status_code in [400, 409] and "already registered" in res.text:
        customer_token = get_token("customer@shramigo.in", "password123")
    else:
        check(res.status_code == 201, f"Customer registration: {res.text}")
        customer_token = res.json()["access_token"]
    
    check(customer_token is not None, "Customer login/token generation")
    customer_headers = {"Authorization": f"Bearer {customer_token}"}

    # 2. Register Worker
    worker_data = {
        "email": "worker@shramigo.in",
        "password": "password123",
        "full_name": "Test Worker",
        "phone": "8888888888",
        "role": "worker"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=worker_data)
    if res.status_code in [400, 409] and "already registered" in res.text:
        worker_token = get_token("worker@shramigo.in", "password123")
    else:
        check(res.status_code == 201, f"Worker registration: {res.text}")
        worker_token = res.json()["access_token"]
        
    check(worker_token is not None, "Worker login/token generation")
    worker_headers = {"Authorization": f"Bearer {worker_token}"}

    # 3. Customer Profile & Location
    profile_data = {"address": "123 Main St", "city": "Mumbai", "state": "MH", "pincode": "400001", "latitude": 19.0760, "longitude": 72.8777}
    res = requests.put(f"{BASE_URL}/profile/customer", json=profile_data, headers=customer_headers)
    check(res.status_code == 200, "Update Customer Profile and Location")

    # 4. Worker Profile & Location
    profile_data_w = {"address": "456 Side St", "city": "Mumbai", "state": "MH", "pincode": "400002", "bio": "Expert", "experience_years": 5, "latitude": 19.0800, "longitude": 72.8800}
    res = requests.put(f"{BASE_URL}/profile/worker", json=profile_data_w, headers=worker_headers)
    check(res.status_code == 200, "Update Worker Profile and Location")

    # 5. Worker Services & Availability
    # Get a service ID (e.g. Plumber)
    res = requests.get(f"{BASE_URL}/services")
    services = res.json()
    check(len(services) > 0, "Services exist in DB")
    plumber_service_id = next((s["id"] for s in services if "Plumber" in s["name"]), services[0]["id"])
    
    # Add service to worker
    res = requests.post(f"{BASE_URL}/worker/services", json={"service_id": plumber_service_id, "custom_price": 500, "is_active": True}, headers=worker_headers)
    check(res.status_code in [200, 201, 409], f"Add Worker Service: {res.text}") # 409 if already exists

    # Add Worker Availability
    import random
    book_date_obj = datetime.datetime.now() + datetime.timedelta(days=random.randint(1, 365))
    book_date_str = book_date_obj.strftime("%Y-%m-%d")
    book_time_str = f"{random.randint(8, 17):02d}:00"
    day = book_date_obj.strftime("%A")
    avail_req = {"day_of_week": day, "start_time": "08:00", "end_time": "18:00", "is_available": True}
    res = requests.post(f"{BASE_URL}/profile/worker/availability", json=avail_req, headers=worker_headers)
    check(res.status_code in [200, 201, 400, 409], f"Add Worker Availability: {res.text}")

    # 6. AI Recommendations & Matching
    ai_req = {"description": "My kitchen tap is leaking", "latitude": 19.0760, "longitude": 72.8777}
    res = requests.post(f"{BASE_URL}/ai/recommendations", json=ai_req, headers=customer_headers)
    check(res.status_code == 200, "AI Recommendations endpoint")
    ai_res = res.json()
    print("AI Result:", ai_res)
    check(len(ai_res.get("recommended_workers", [])) > 0 or ai_res.get("detected_service"), "AI returned some recommendation")

    # 7. Worker Discovery (Matching)
    res = requests.get(f"{BASE_URL}/workers/nearby?latitude=19.0760&longitude=72.8777&service_id={plumber_service_id}", headers=customer_headers)
    check(res.status_code == 200, "Worker matching/discovery")
    workers = res.json()
    check(len(workers) > 0, "Found nearby worker")
    worker_id = workers[0].get("id") or workers[0].get("user_id") or workers[0].get("worker", {}).get("user_id")

    # 8. Booking Lifecycle
    # Create booking
    booking_req = {
        "worker_id": worker_id,
        "service_id": plumber_service_id,
        "service_address": "123 Main St",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "problem_description": "Leaky tap",
        "booking_date": book_date_str,
        "booking_time": book_time_str
    }
    res = requests.post(f"{BASE_URL}/bookings/", json=booking_req, headers=customer_headers)
    check(res.status_code == 201, f"Customer created booking: {res.text}")
    booking_id = res.json()["id"]

    # Invalid transition: PENDING -> COMPLETED
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "completed"}, headers=worker_headers)
    check(res.status_code == 400, "Prevent invalid transition PENDING -> COMPLETED")

    # Valid transition: PENDING -> ACCEPTED
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "accepted"}, headers=worker_headers)
    check(res.status_code == 200, "Worker accepted booking")

    # Transition: ACCEPTED -> ON_THE_WAY
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "on_the_way"}, headers=worker_headers)
    check(res.status_code == 200, "Worker on the way")
    
    # Transition: ON_THE_WAY -> IN_PROGRESS
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "in_progress"}, headers=worker_headers)
    check(res.status_code == 200, "Worker started service")

    # Worker tries to complete before payment (Should fail)
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "completed"}, headers=worker_headers)
    check(res.status_code == 409, "Prevent completing service before payment is done")

    # Mark cash received (Payment Test)
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/cash-received", headers=worker_headers)
    check(res.status_code == 200, f"Worker confirmed cash payment: {res.text}")

    # Complete service
    res = requests.put(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "completed"}, headers=worker_headers)
    check(res.status_code == 200, "Worker completed service")

    # 9. Review Test
    review_req = {"booking_id": booking_id, "rating": 5, "review_text": "Great work!"}
    res = requests.post(f"{BASE_URL}/reviews", json=review_req, headers=customer_headers)
    check(res.status_code == 201, f"Customer submitted review: {res.text}")

    # Duplicate review should fail
    res = requests.post(f"{BASE_URL}/reviews", json=review_req, headers=customer_headers)
    check(res.status_code == 409, "Prevent duplicate reviews")

    # Get reviews for worker
    res = requests.get(f"{BASE_URL}/reviews/worker/{worker_id}")
    check(res.status_code == 200, "Get worker reviews")

    # 10. Notifications Check
    res = requests.get(f"{BASE_URL}/notifications/", headers=customer_headers)
    check(res.status_code == 200 and len(res.json()) > 0, "Customer received notifications")
    
    print("\n🎉 All E2E API Tests Passed successfully!")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"\n❌ E2E API Tests Failed: {e}")
        print(f"Passed: {status['passed']}, Failed: {status['failed']}")
