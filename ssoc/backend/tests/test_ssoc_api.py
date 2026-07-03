"""
SSoC Season 5 Backend API Tests
Tests for: Site Data, Organizers, Custom Fields, Footer, and other endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://advocate-hub-73.preview.emergentagent.com').rstrip('/')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"SUCCESS: Health check passed - {data}")


class TestSiteData:
    """Site data endpoint tests"""
    
    def test_get_site_data(self):
        """Test getting site data"""
        response = requests.get(f"{BASE_URL}/api/site-data")
        assert response.status_code == 200
        data = response.json()
        print(f"SUCCESS: Site data retrieved - keys: {list(data.keys())}")


class TestOrganizersAPI:
    """Organizers CRUD endpoint tests"""
    
    def test_get_organizers(self):
        """Test getting all organizers"""
        response = requests.get(f"{BASE_URL}/api/organizers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} organizers")
        return data
    
    def test_add_organizer(self):
        """Test adding a new organizer"""
        test_organizer = {
            "name": "TEST_Organizer",
            "role": "Test Role",
            "photo": "https://via.placeholder.com/140",
            "bio": "Test bio for testing",
            "linkedin": "https://linkedin.com/in/test",
            "github": "https://github.com/test",
            "twitter": "https://twitter.com/test",
            "portfolio": "https://test.com",
            "topmateLink": "https://topmate.io/test",
            "isActive": True
        }
        response = requests.post(f"{BASE_URL}/api/organizers/add", json=test_organizer)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"SUCCESS: Organizer added - {data}")
        return data.get("id")
    
    def test_organizer_persistence(self):
        """Test that added organizer persists"""
        # First add an organizer
        test_organizer = {
            "name": "TEST_Persistence_Organizer",
            "role": "Persistence Test",
            "linkedin": "https://linkedin.com/in/persistence",
            "topmateLink": "https://topmate.io/persistence",
            "isActive": True
        }
        add_response = requests.post(f"{BASE_URL}/api/organizers/add", json=test_organizer)
        assert add_response.status_code == 200
        
        # Then verify it exists in the list
        get_response = requests.get(f"{BASE_URL}/api/organizers")
        assert get_response.status_code == 200
        organizers = get_response.json()
        
        found = any(o.get("name") == "TEST_Persistence_Organizer" for o in organizers)
        assert found, "Added organizer not found in list"
        print("SUCCESS: Organizer persistence verified")


class TestCustomFieldsAPI:
    """Custom fields endpoint tests"""
    
    def test_get_custom_fields_contributor(self):
        """Test getting custom fields for contributor role"""
        response = requests.get(f"{BASE_URL}/api/custom-fields/contributor")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} custom fields for contributor")
    
    def test_get_custom_fields_mentor(self):
        """Test getting custom fields for mentor role"""
        response = requests.get(f"{BASE_URL}/api/custom-fields/mentor")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} custom fields for mentor")
    
    def test_get_custom_fields_projectadmin(self):
        """Test getting custom fields for project admin role"""
        response = requests.get(f"{BASE_URL}/api/custom-fields/projectadmin")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} custom fields for project admin")
    
    def test_get_all_custom_fields(self):
        """Test getting all custom fields organized by role"""
        response = requests.get(f"{BASE_URL}/api/all-custom-fields")
        assert response.status_code == 200
        data = response.json()
        assert "contributor" in data
        assert "mentor" in data
        assert "projectadmin" in data
        print(f"SUCCESS: Got all custom fields - contributor: {len(data['contributor'])}, mentor: {len(data['mentor'])}, projectadmin: {len(data['projectadmin'])}")


class TestFooterAPI:
    """Footer endpoint tests"""
    
    def test_get_footer(self):
        """Test getting footer data"""
        response = requests.get(f"{BASE_URL}/api/footer")
        assert response.status_code == 200
        data = response.json()
        # Check for expected keys
        assert "brandDescription" in data or "socialLinks" in data or "programLinks" in data
        print(f"SUCCESS: Footer data retrieved - keys: {list(data.keys())}")


class TestPagesAPI:
    """Content pages endpoint tests"""
    
    def test_get_all_pages(self):
        """Test getting all content pages"""
        response = requests.get(f"{BASE_URL}/api/pages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} content pages")


class TestApplyLinksAPI:
    """Apply links endpoint tests"""
    
    def test_get_apply_links(self):
        """Test getting apply links"""
        response = requests.get(f"{BASE_URL}/api/apply-links")
        assert response.status_code == 200
        data = response.json()
        print(f"SUCCESS: Apply links retrieved - {data}")


class TestProjectsAPI:
    """Projects endpoint tests"""
    
    def test_get_projects(self):
        """Test getting all projects"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} projects")


class TestMentorsAPI:
    """Mentors endpoint tests"""
    
    def test_get_mentors(self):
        """Test getting all mentors"""
        response = requests.get(f"{BASE_URL}/api/mentors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} mentors")


class TestTestimonialsAPI:
    """Testimonials endpoint tests"""
    
    def test_get_testimonials(self):
        """Test getting all testimonials"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} testimonials")


class TestFAQsAPI:
    """FAQs endpoint tests"""
    
    def test_get_faqs(self):
        """Test getting all FAQs"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} FAQs")


class TestRegistrationsAPI:
    """Registrations endpoint tests"""
    
    def test_get_registrations(self):
        """Test getting all registrations"""
        response = requests.get(f"{BASE_URL}/api/registrations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} registrations")


class TestFOMOCounterAPI:
    """FOMO Counter - Registration counts endpoint tests"""
    
    def test_get_registration_counts(self):
        """Test getting registration counts for FOMO display"""
        response = requests.get(f"{BASE_URL}/api/registrations/count")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "contributor" in data, "Missing 'contributor' count"
        assert "mentor" in data, "Missing 'mentor' count"
        assert "project-admin" in data, "Missing 'project-admin' count"
        assert "total" in data, "Missing 'total' count"
        
        # Verify counts are integers
        assert isinstance(data["contributor"], int), "contributor count should be int"
        assert isinstance(data["mentor"], int), "mentor count should be int"
        assert isinstance(data["project-admin"], int), "project-admin count should be int"
        assert isinstance(data["total"], int), "total count should be int"
        
        # Verify total is sum of all roles
        expected_total = data["contributor"] + data["mentor"] + data["project-admin"]
        assert data["total"] == expected_total, f"Total mismatch: {data['total']} != {expected_total}"
        
        print(f"SUCCESS: FOMO counts - contributor: {data['contributor']}, mentor: {data['mentor']}, project-admin: {data['project-admin']}, total: {data['total']}")


class TestSponsorsAPI:
    """Sponsors CRUD endpoint tests"""
    
    def test_get_sponsors(self):
        """Test getting all sponsors"""
        response = requests.get(f"{BASE_URL}/api/sponsors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} sponsors")
    
    def test_add_sponsor(self):
        """Test adding a new sponsor"""
        test_sponsor = {
            "name": "TEST_Sponsor_Platinum",
            "logo": "https://via.placeholder.com/200x100?text=TestSponsor",
            "website": "https://test-sponsor.com",
            "category": "platinum",
            "isActive": True
        }
        response = requests.post(f"{BASE_URL}/api/sponsors/add", json=test_sponsor)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        print(f"SUCCESS: Sponsor added - {data}")
        return data.get("id")
    
    def test_sponsor_persistence(self):
        """Test that added sponsor persists in database"""
        # First add a sponsor
        test_sponsor = {
            "name": "TEST_Sponsor_Persistence",
            "logo": "https://via.placeholder.com/200x100?text=Persistence",
            "website": "https://persistence-test.com",
            "category": "gold",
            "isActive": True
        }
        add_response = requests.post(f"{BASE_URL}/api/sponsors/add", json=test_sponsor)
        assert add_response.status_code == 200
        
        # Then verify it exists in the list
        get_response = requests.get(f"{BASE_URL}/api/sponsors")
        assert get_response.status_code == 200
        sponsors = get_response.json()
        
        found = any(s.get("name") == "TEST_Sponsor_Persistence" for s in sponsors)
        assert found, "Added sponsor not found in list"
        print("SUCCESS: Sponsor persistence verified")
    
    def test_update_sponsor(self):
        """Test updating a sponsor"""
        # First add a sponsor
        test_sponsor = {
            "name": "TEST_Sponsor_Update",
            "logo": "https://via.placeholder.com/200x100?text=Update",
            "website": "https://update-test.com",
            "category": "silver",
            "isActive": True
        }
        add_response = requests.post(f"{BASE_URL}/api/sponsors/add", json=test_sponsor)
        assert add_response.status_code == 200
        sponsor_id = add_response.json().get("id")
        
        # Update the sponsor
        updated_sponsor = {
            "name": "TEST_Sponsor_Updated",
            "logo": "https://via.placeholder.com/200x100?text=Updated",
            "website": "https://updated-test.com",
            "category": "bronze",
            "isActive": True
        }
        update_response = requests.put(f"{BASE_URL}/api/sponsors/{sponsor_id}", json=updated_sponsor)
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["success"] == True
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/sponsors")
        sponsors = get_response.json()
        updated = next((s for s in sponsors if s.get("id") == sponsor_id), None)
        assert updated is not None, "Updated sponsor not found"
        assert updated.get("name") == "TEST_Sponsor_Updated", "Name not updated"
        assert updated.get("category") == "bronze", "Category not updated"
        print(f"SUCCESS: Sponsor updated - {data}")
    
    def test_delete_sponsor(self):
        """Test deleting a sponsor"""
        # First add a sponsor
        test_sponsor = {
            "name": "TEST_Sponsor_Delete",
            "logo": "https://via.placeholder.com/200x100?text=Delete",
            "website": "https://delete-test.com",
            "category": "community",
            "isActive": True
        }
        add_response = requests.post(f"{BASE_URL}/api/sponsors/add", json=test_sponsor)
        assert add_response.status_code == 200
        sponsor_id = add_response.json().get("id")
        
        # Delete the sponsor
        delete_response = requests.delete(f"{BASE_URL}/api/sponsors/{sponsor_id}")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["success"] == True
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/sponsors")
        sponsors = get_response.json()
        found = any(s.get("id") == sponsor_id for s in sponsors)
        assert not found, "Deleted sponsor still exists"
        print(f"SUCCESS: Sponsor deleted - {data}")
    
    def test_sponsor_categories(self):
        """Test that sponsors can be created with all valid categories"""
        categories = ["platinum", "gold", "silver", "bronze", "community"]
        
        for category in categories:
            test_sponsor = {
                "name": f"TEST_Sponsor_{category.capitalize()}",
                "logo": f"https://via.placeholder.com/200x100?text={category}",
                "website": f"https://{category}-sponsor.com",
                "category": category,
                "isActive": True
            }
            response = requests.post(f"{BASE_URL}/api/sponsors/add", json=test_sponsor)
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            print(f"SUCCESS: Created {category} sponsor")


class TestCombinedDataAPI:
    """Combined data endpoint tests"""
    
    def test_get_combined_data(self):
        """Test getting combined projects and mentors data"""
        response = requests.get(f"{BASE_URL}/api/data")
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert "mentors" in data
        print(f"SUCCESS: Combined data - projects: {len(data['projects'])}, mentors: {len(data['mentors'])}")


# Cleanup test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests complete"""
    yield
    # Cleanup: Get all organizers and remove test ones
    try:
        response = requests.get(f"{BASE_URL}/api/organizers")
        if response.status_code == 200:
            organizers = response.json()
            test_organizers = [o for o in organizers if o.get("name", "").startswith("TEST_")]
            for org in test_organizers:
                if org.get("id"):
                    requests.delete(f"{BASE_URL}/api/organizers/{org['id']}")
                    print(f"Cleaned up test organizer: {org.get('name')}")
    except Exception as e:
        print(f"Cleanup error (organizers): {e}")
    
    # Cleanup: Get all sponsors and remove test ones
    try:
        response = requests.get(f"{BASE_URL}/api/sponsors")
        if response.status_code == 200:
            sponsors = response.json()
            test_sponsors = [s for s in sponsors if s.get("name", "").startswith("TEST_")]
            for sponsor in test_sponsors:
                if sponsor.get("id"):
                    requests.delete(f"{BASE_URL}/api/sponsors/{sponsor['id']}")
                    print(f"Cleaned up test sponsor: {sponsor.get('name')}")
    except Exception as e:
        print(f"Cleanup error (sponsors): {e}")
