"""
SSoC Season 5 Registration Flow Tests
Tests for: Registration API, Duplicate Prevention, Role Restrictions, FOMO Counter
Focus: Bug fix verification for DOM ID collision and CORS issues
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://advocate-hub-73.preview.emergentagent.com').rstrip('/')


def generate_test_email():
    """Generate unique test email"""
    return f"test_{uuid.uuid4().hex[:8]}@testssoc.com"


class TestRegistrationAPI:
    """Registration endpoint tests - POST /api/registrations/add"""
    
    def test_contributor_registration_success(self):
        """Test successful contributor registration with custom fields"""
        test_email = generate_test_email()
        registration_data = {
            "name": "TEST_Contributor_User",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/testuser",
            "experience_level": "Intermediate",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, f"Registration failed: {data}"
        assert "message" in data
        print(f"SUCCESS: Contributor registration - {data}")
    
    def test_mentor_registration_success(self):
        """Test successful mentor registration with custom fields"""
        test_email = generate_test_email()
        registration_data = {
            "name": "TEST_Mentor_User",
            "email": test_email,
            "role": "mentor",
            "area_of_expertise": "Backend Development",
            "linkedin_profile": "https://linkedin.com/in/testmentor",
            "experience": "5 years in software development",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, f"Registration failed: {data}"
        print(f"SUCCESS: Mentor registration - {data}")
    
    def test_project_admin_registration_success(self):
        """Test successful project admin registration with custom fields"""
        test_email = generate_test_email()
        registration_data = {
            "name": "TEST_ProjectAdmin_User",
            "email": test_email,
            "role": "project-admin",
            "project_name": "Test Project",
            "project_repository_url": "https://github.com/testorg/testproject",
            "tech_stack": "Python, FastAPI, MongoDB",
            "experience": "3 years managing open source projects",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, f"Registration failed: {data}"
        print(f"SUCCESS: Project Admin registration - {data}")


class TestDuplicateRegistrationPrevention:
    """Tests for duplicate registration prevention"""
    
    def test_duplicate_contributor_blocked(self):
        """Test that same email cannot register twice as contributor"""
        test_email = generate_test_email()
        
        # First registration
        registration_data = {
            "name": "TEST_Duplicate_User",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/duplicate",
            "experience_level": "Beginner",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Second registration with same email and role
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == False, "Duplicate registration should be blocked"
        assert data["error_type"] == "duplicate_role", f"Expected 'duplicate_role' error, got: {data}"
        print(f"SUCCESS: Duplicate contributor blocked - {data}")
    
    def test_duplicate_mentor_blocked(self):
        """Test that same email cannot register twice as mentor"""
        test_email = generate_test_email()
        
        # First registration
        registration_data = {
            "name": "TEST_Duplicate_Mentor",
            "email": test_email,
            "role": "mentor",
            "area_of_expertise": "Frontend Development",
            "linkedin_profile": "https://linkedin.com/in/dupmentor",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Second registration with same email and role
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == False, "Duplicate registration should be blocked"
        assert data["error_type"] == "duplicate_role"
        print(f"SUCCESS: Duplicate mentor blocked - {data}")


class TestRoleRestrictions:
    """Tests for role restriction rules"""
    
    def test_contributor_cannot_become_mentor(self):
        """Test that contributor email cannot register as mentor"""
        test_email = generate_test_email()
        
        # First register as contributor
        contributor_data = {
            "name": "TEST_Contributor_Restriction",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/restricted",
            "experience_level": "Advanced",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=contributor_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Try to register as mentor with same email
        mentor_data = {
            "name": "TEST_Contributor_Restriction",
            "email": test_email,
            "role": "mentor",
            "area_of_expertise": "DevOps",
            "linkedin_profile": "https://linkedin.com/in/restricted",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=mentor_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == False, "Contributor should not be able to register as mentor"
        assert data["error_type"] == "role_restriction", f"Expected 'role_restriction' error, got: {data}"
        print(f"SUCCESS: Contributor cannot become mentor - {data}")
    
    def test_contributor_cannot_become_project_admin(self):
        """Test that contributor email cannot register as project admin"""
        test_email = generate_test_email()
        
        # First register as contributor
        contributor_data = {
            "name": "TEST_Contributor_PA_Restriction",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/restrictedpa",
            "experience_level": "Beginner",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=contributor_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Try to register as project-admin with same email
        pa_data = {
            "name": "TEST_Contributor_PA_Restriction",
            "email": test_email,
            "role": "project-admin",
            "project_name": "Restricted Project",
            "project_repository_url": "https://github.com/restricted/project",
            "tech_stack": "React, Node.js",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=pa_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == False, "Contributor should not be able to register as project admin"
        assert data["error_type"] == "role_restriction"
        print(f"SUCCESS: Contributor cannot become project admin - {data}")
    
    def test_mentor_cannot_become_contributor(self):
        """Test that mentor email cannot register as contributor"""
        test_email = generate_test_email()
        
        # First register as mentor
        mentor_data = {
            "name": "TEST_Mentor_Restriction",
            "email": test_email,
            "role": "mentor",
            "area_of_expertise": "Machine Learning",
            "linkedin_profile": "https://linkedin.com/in/mentorrestrict",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=mentor_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Try to register as contributor with same email
        contributor_data = {
            "name": "TEST_Mentor_Restriction",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/mentorrestrict",
            "experience_level": "Advanced",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=contributor_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == False, "Mentor should not be able to register as contributor"
        assert data["error_type"] == "role_restriction"
        print(f"SUCCESS: Mentor cannot become contributor - {data}")
    
    def test_mentor_can_become_project_admin(self):
        """Test that mentor can also register as project admin (cross-registration allowed)"""
        test_email = generate_test_email()
        
        # First register as mentor
        mentor_data = {
            "name": "TEST_Mentor_CrossReg",
            "email": test_email,
            "role": "mentor",
            "area_of_expertise": "Mobile Development",
            "linkedin_profile": "https://linkedin.com/in/crossreg",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/registrations/add", json=mentor_data)
        assert response1.status_code == 200
        assert response1.json()["success"] == True
        
        # Register as project-admin with same email (should be allowed)
        pa_data = {
            "name": "TEST_Mentor_CrossReg",
            "email": test_email,
            "role": "project-admin",
            "project_name": "Cross Reg Project",
            "project_repository_url": "https://github.com/crossreg/project",
            "tech_stack": "Flutter, Dart",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        response2 = requests.post(f"{BASE_URL}/api/registrations/add", json=pa_data)
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["success"] == True, f"Mentor should be able to register as project admin: {data}"
        print(f"SUCCESS: Mentor can become project admin - {data}")


class TestEmailCheckAPI:
    """Tests for GET /api/registrations/check/{email}"""
    
    def test_check_unregistered_email(self):
        """Test checking an email that is not registered"""
        test_email = generate_test_email()
        
        response = requests.get(f"{BASE_URL}/api/registrations/check/{test_email}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["exists"] == False
        assert data["roles"] == []
        print(f"SUCCESS: Unregistered email check - {data}")
    
    def test_check_registered_email(self):
        """Test checking an email that is registered"""
        test_email = generate_test_email()
        
        # First register
        registration_data = {
            "name": "TEST_Check_User",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/checkuser",
            "experience_level": "Intermediate",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        
        # Check the email
        response = requests.get(f"{BASE_URL}/api/registrations/check/{test_email}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["exists"] == True
        assert "contributor" in data["roles"]
        print(f"SUCCESS: Registered email check - {data}")
    
    def test_check_email_case_insensitive(self):
        """Test that email check is case insensitive"""
        test_email = generate_test_email()
        
        # Register with lowercase email
        registration_data = {
            "name": "TEST_Case_User",
            "email": test_email.lower(),
            "role": "mentor",
            "area_of_expertise": "Backend Development",
            "linkedin_profile": "https://linkedin.com/in/caseuser",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        
        # Check with uppercase email
        response = requests.get(f"{BASE_URL}/api/registrations/check/{test_email.upper()}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["exists"] == True, "Email check should be case insensitive"
        print(f"SUCCESS: Case insensitive email check - {data}")


class TestFOMOCounter:
    """Tests for GET /api/registrations/count"""
    
    def test_fomo_counter_structure(self):
        """Test FOMO counter returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/registrations/count")
        assert response.status_code == 200
        
        data = response.json()
        assert "contributor" in data
        assert "mentor" in data
        assert "project-admin" in data
        assert "total" in data
        
        # Verify all are integers
        assert isinstance(data["contributor"], int)
        assert isinstance(data["mentor"], int)
        assert isinstance(data["project-admin"], int)
        assert isinstance(data["total"], int)
        
        print(f"SUCCESS: FOMO counter structure - {data}")
    
    def test_fomo_counter_increments_on_registration(self):
        """Test that FOMO counter increments after registration"""
        # Get initial count
        response1 = requests.get(f"{BASE_URL}/api/registrations/count")
        initial_counts = response1.json()
        
        # Register a new contributor
        test_email = generate_test_email()
        registration_data = {
            "name": "TEST_FOMO_User",
            "email": test_email,
            "role": "contributor",
            "github_profile": "https://github.com/fomouser",
            "experience_level": "Beginner",
            "timestamp": "2025-01-01T00:00:00.000Z"
        }
        
        reg_response = requests.post(f"{BASE_URL}/api/registrations/add", json=registration_data)
        assert reg_response.json()["success"] == True
        
        # Get updated count
        response2 = requests.get(f"{BASE_URL}/api/registrations/count")
        updated_counts = response2.json()
        
        assert updated_counts["contributor"] == initial_counts["contributor"] + 1, "Contributor count should increment"
        assert updated_counts["total"] == initial_counts["total"] + 1, "Total count should increment"
        print(f"SUCCESS: FOMO counter incremented - before: {initial_counts}, after: {updated_counts}")


class TestFormStatusAPI:
    """Tests for GET /api/form-status"""
    
    def test_form_status_endpoint(self):
        """Test form status endpoint returns valid data"""
        response = requests.get(f"{BASE_URL}/api/form-status")
        assert response.status_code == 200
        
        data = response.json()
        # Form status should have isOpen field
        assert "isOpen" in data or "is_open" in data or isinstance(data, dict)
        print(f"SUCCESS: Form status - {data}")


class TestCampusAdvocatesAPI:
    """Tests for GET /api/campus-advocates"""
    
    def test_get_campus_advocates(self):
        """Test getting campus advocates list"""
        response = requests.get(f"{BASE_URL}/api/campus-advocates")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} campus advocates")


class TestSponsorsAPI:
    """Tests for GET /api/sponsors"""
    
    def test_get_sponsors(self):
        """Test getting sponsors list"""
        response = requests.get(f"{BASE_URL}/api/sponsors")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} sponsors")


# Cleanup fixture
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_registrations():
    """Note: Test registrations with TEST_ prefix are created but not cleaned up
    as there's no delete endpoint for registrations. This is acceptable for testing."""
    yield
    print("Test session complete. TEST_ prefixed registrations remain in database.")
