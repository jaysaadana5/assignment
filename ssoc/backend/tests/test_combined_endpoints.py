"""
Test suite for SSoC Season 5 Combined Endpoints
Tests the critical /api/public/init and /api/admin/init endpoints
that were fixed to resolve the P0 bug where updateFomoFromData was nested inside loadFomoCounter
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://advocate-hub-73.preview.emergentagent.com')


class TestPublicInitEndpoint:
    """Tests for /api/public/init combined endpoint"""
    
    def test_public_init_returns_200(self):
        """Test that /api/public/init returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ /api/public/init returns 200 OK")
    
    def test_public_init_returns_all_expected_keys(self):
        """Test that /api/public/init returns all expected keys"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        assert response.status_code == 200
        
        data = response.json()
        expected_keys = [
            'siteData', 'formStatus', 'applyLinks', 'testimonials', 
            'faqs', 'sponsors', 'footer', 'advocates', 'pages', 'registrationCounts'
        ]
        
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        
        print(f"✅ /api/public/init returns all {len(expected_keys)} expected keys")
    
    def test_public_init_site_data_structure(self):
        """Test that siteData has expected structure"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        data = response.json()
        
        site_data = data.get('siteData', {})
        # Check for some expected site data fields
        expected_fields = ['heroBadge', 'heroDuration', 'heroContributors', 'heroProjects']
        
        for field in expected_fields:
            assert field in site_data, f"siteData missing field: {field}"
        
        print("✅ siteData has expected structure")
    
    def test_public_init_registration_counts_structure(self):
        """Test that registrationCounts has expected structure"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        data = response.json()
        
        reg_counts = data.get('registrationCounts', {})
        expected_fields = ['total', 'contributor', 'mentor', 'projectAdmin']
        
        for field in expected_fields:
            assert field in reg_counts, f"registrationCounts missing field: {field}"
            assert isinstance(reg_counts[field], int), f"registrationCounts.{field} should be int"
        
        print(f"✅ registrationCounts: total={reg_counts['total']}, contributor={reg_counts['contributor']}, mentor={reg_counts['mentor']}, projectAdmin={reg_counts['projectAdmin']}")
    
    def test_public_init_form_status_structure(self):
        """Test that formStatus has expected structure"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        data = response.json()
        
        form_status = data.get('formStatus', {})
        expected_fields = ['contributor', 'mentor', 'projectAdmin']
        
        for field in expected_fields:
            assert field in form_status, f"formStatus missing field: {field}"
            assert isinstance(form_status[field], bool), f"formStatus.{field} should be bool"
        
        print(f"✅ formStatus: contributor={form_status['contributor']}, mentor={form_status['mentor']}, projectAdmin={form_status['projectAdmin']}")
    
    def test_public_init_advocates_is_list(self):
        """Test that advocates is a list"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        data = response.json()
        
        advocates = data.get('advocates', [])
        assert isinstance(advocates, list), "advocates should be a list"
        print(f"✅ advocates is a list with {len(advocates)} items")
    
    def test_public_init_testimonials_is_list(self):
        """Test that testimonials is a list"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        data = response.json()
        
        testimonials = data.get('testimonials', [])
        assert isinstance(testimonials, list), "testimonials should be a list"
        print(f"✅ testimonials is a list with {len(testimonials)} items")


class TestAdminInitEndpoint:
    """Tests for /api/admin/init combined endpoint"""
    
    def test_admin_init_returns_200(self):
        """Test that /api/admin/init returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ /api/admin/init returns 200 OK")
    
    def test_admin_init_returns_all_expected_keys(self):
        """Test that /api/admin/init returns all expected keys"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        assert response.status_code == 200
        
        data = response.json()
        expected_keys = [
            'siteData', 'formStatus', 'applyLinks', 'footer', 'projects', 
            'mentors', 'organizers', 'advocates', 'applications', 'testimonials', 
            'sponsors', 'faqs', 'registrations', 'pages', 'referralLinks', 
            'tasks', 'completions', 'customFields'
        ]
        
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        
        print(f"✅ /api/admin/init returns all {len(expected_keys)} expected keys")
    
    def test_admin_init_registrations_is_list(self):
        """Test that registrations is a list"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        data = response.json()
        
        registrations = data.get('registrations', [])
        assert isinstance(registrations, list), "registrations should be a list"
        print(f"✅ registrations is a list with {len(registrations)} items")
    
    def test_admin_init_tasks_is_list(self):
        """Test that tasks is a list"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        data = response.json()
        
        tasks = data.get('tasks', [])
        assert isinstance(tasks, list), "tasks should be a list"
        print(f"✅ tasks is a list with {len(tasks)} items")


class TestHealthAndBasicEndpoints:
    """Tests for health check and basic endpoints"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'healthy'
        print("✅ /api/health returns healthy status")
    
    def test_registrations_count_endpoint(self):
        """Test registrations count endpoint (used by FOMO counter)"""
        response = requests.get(f"{BASE_URL}/api/registrations/count")
        assert response.status_code == 200
        
        data = response.json()
        assert 'contributor' in data
        assert 'mentor' in data
        assert 'project-admin' in data
        assert 'total' in data
        
        print(f"✅ /api/registrations/count: contributor={data['contributor']}, mentor={data['mentor']}, project-admin={data['project-admin']}, total={data['total']}")
    
    def test_leaderboard_endpoint(self):
        """Test leaderboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        
        data = response.json()
        assert 'leaderboard' in data
        assert 'total_tasks' in data
        assert 'total_advocates' in data
        assert isinstance(data['leaderboard'], list)
        
        print(f"✅ /api/leaderboard: {data['total_advocates']} advocates, {data['total_tasks']} tasks")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
