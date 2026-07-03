"""
P2 Refactoring Tests - Verify code split into smaller files works correctly
Tests that all JS modules load and combined endpoints work after refactoring:
- index.html loads 4 script files: ui-components.js, content-loaders.js, registration.js, script.js
- admin.html loads external CSS (admin-styles.css) and JS (admin-app.js)
- All API endpoints still work correctly
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestJSModulesAccessibility:
    """Test that all refactored JS module files are accessible"""
    
    def test_ui_components_js_accessible(self):
        """Test /js/ui-components.js is accessible"""
        response = requests.get(f"{BASE_URL}/js/ui-components.js")
        assert response.status_code == 200
        assert "function initNavbarScroll" in response.text
        assert "function showToast" in response.text
        assert "function initFAQAccordion" in response.text
        print("ui-components.js: PASS - Contains navbar, toast, FAQ functions")
    
    def test_content_loaders_js_accessible(self):
        """Test /js/content-loaders.js is accessible"""
        response = requests.get(f"{BASE_URL}/js/content-loaders.js")
        assert response.status_code == 200
        assert "function loadFomoCounter" in response.text
        assert "function updateFomoFromData" in response.text
        assert "function applySiteData" in response.text
        assert "function loadCampusAdvocates" in response.text
        print("content-loaders.js: PASS - Contains FOMO, advocates, sponsors loaders")
    
    def test_registration_js_accessible(self):
        """Test /js/registration.js is accessible"""
        response = requests.get(f"{BASE_URL}/js/registration.js")
        assert response.status_code == 200
        assert "function openModal" in response.text
        assert "function closeModal" in response.text
        assert "function initFormSubmissions" in response.text
        print("registration.js: PASS - Contains modal and form functions")
    
    def test_script_js_accessible(self):
        """Test /script.js is accessible (entry point)"""
        response = requests.get(f"{BASE_URL}/script.js")
        assert response.status_code == 200
        assert "const API_URL" in response.text
        assert "DOMContentLoaded" in response.text
        assert "loadAllSiteData" in response.text
        print("script.js: PASS - Contains entry point and loadAllSiteData")


class TestAdminFilesAccessibility:
    """Test that admin panel external files are accessible"""
    
    def test_admin_styles_css_accessible(self):
        """Test /admin-styles.css is accessible"""
        response = requests.get(f"{BASE_URL}/admin-styles.css")
        assert response.status_code == 200
        assert ":root" in response.text
        assert "--primary:" in response.text
        assert ".login-screen" in response.text
        assert ".dashboard" in response.text
        print("admin-styles.css: PASS - Contains CSS variables and dashboard styles")
    
    def test_admin_app_js_accessible(self):
        """Test /admin-app.js is accessible"""
        response = requests.get(f"{BASE_URL}/admin-app.js")
        assert response.status_code == 200
        assert "ADMIN_EMAIL" in response.text
        assert "ADMIN_PASSWORD" in response.text
        assert "function loadAllData" in response.text
        assert "function renderProjects" in response.text
        print("admin-app.js: PASS - Contains admin credentials and render functions")


class TestHTMLFilesLoadCorrectScripts:
    """Test that HTML files reference the correct script files"""
    
    def test_index_html_loads_all_scripts(self):
        """Test index.html loads all 4 script files in correct order"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        html = response.text
        
        # Check script tags are present
        assert 'src="js/ui-components.js' in html
        assert 'src="js/content-loaders.js' in html
        assert 'src="js/registration.js' in html
        assert 'src="script.js' in html
        
        # Check order (ui-components first, script.js last)
        ui_pos = html.find('src="js/ui-components.js')
        content_pos = html.find('src="js/content-loaders.js')
        reg_pos = html.find('src="js/registration.js')
        script_pos = html.find('src="script.js')
        
        assert ui_pos < content_pos < reg_pos < script_pos, "Scripts not in correct order"
        print("index.html: PASS - Loads all 4 scripts in correct order")
    
    def test_admin_html_loads_external_files(self):
        """Test admin.html loads external CSS and JS"""
        response = requests.get(f"{BASE_URL}/admin.html")
        assert response.status_code == 200
        html = response.text
        
        # Check external CSS
        assert 'href="admin-styles.css"' in html
        
        # Check external JS
        assert 'src="admin-app.js"' in html
        
        print("admin.html: PASS - Loads external admin-styles.css and admin-app.js")


class TestCombinedEndpoints:
    """Test that combined API endpoints still work after refactoring"""
    
    def test_public_init_endpoint(self):
        """Test /api/public/init returns all required data"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        assert response.status_code == 200
        data = response.json()
        
        # Check all required keys
        required_keys = ['siteData', 'formStatus', 'applyLinks', 'testimonials', 
                        'faqs', 'sponsors', 'footer', 'advocates', 'pages', 'registrationCounts']
        for key in required_keys:
            assert key in data, f"Missing key: {key}"
        
        print(f"public/init: PASS - Returns all {len(required_keys)} required keys")
    
    def test_admin_init_endpoint(self):
        """Test /api/admin/init returns all required data"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        assert response.status_code == 200
        data = response.json()
        
        # Check all required keys
        required_keys = ['siteData', 'formStatus', 'applyLinks', 'footer', 'projects',
                        'mentors', 'organizers', 'advocates', 'applications', 'testimonials',
                        'sponsors', 'faqs', 'registrations', 'pages', 'referralLinks',
                        'tasks', 'completions', 'customFields', 'sectionTimestamps']
        for key in required_keys:
            assert key in data, f"Missing key: {key}"
        
        print(f"admin/init: PASS - Returns all {len(required_keys)} required keys")


class TestAPIEndpoints:
    """Test core API endpoints still work"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("health: PASS")
    
    def test_registrations_count(self):
        """Test /api/registrations/count returns counts"""
        response = requests.get(f"{BASE_URL}/api/registrations/count")
        assert response.status_code == 200
        data = response.json()
        assert "contributor" in data
        assert "mentor" in data
        assert "project-admin" in data
        print(f"registrations/count: PASS - contributor={data['contributor']}, mentor={data['mentor']}, project-admin={data['project-admin']}")
    
    def test_leaderboard_endpoint(self):
        """Test /api/leaderboard returns leaderboard data"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert "leaderboard" in data
        assert "total_tasks" in data
        assert "total_advocates" in data
        print(f"leaderboard: PASS - {data['total_advocates']} advocates, {data['total_tasks']} tasks")
    
    def test_campus_advocates_endpoint(self):
        """Test /api/campus-advocates returns advocates"""
        response = requests.get(f"{BASE_URL}/api/campus-advocates")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"campus-advocates: PASS - {len(data)} advocates")
    
    def test_testimonials_endpoint(self):
        """Test /api/testimonials returns testimonials"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"testimonials: PASS - {len(data)} testimonials")
    
    def test_faqs_endpoint(self):
        """Test /api/faqs returns FAQs"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"faqs: PASS - {len(data)} FAQs")
    
    def test_sponsors_endpoint(self):
        """Test /api/sponsors returns sponsors"""
        response = requests.get(f"{BASE_URL}/api/sponsors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"sponsors: PASS - {len(data)} sponsors")
    
    def test_footer_endpoint(self):
        """Test /api/footer returns footer data"""
        response = requests.get(f"{BASE_URL}/api/footer")
        assert response.status_code == 200
        data = response.json()
        assert "brandDescription" in data
        assert "socialLinks" in data
        print("footer: PASS")


class TestLeaderboardPage:
    """Test leaderboard.html page loads"""
    
    def test_leaderboard_page_accessible(self):
        """Test /leaderboard.html is accessible"""
        response = requests.get(f"{BASE_URL}/leaderboard.html")
        assert response.status_code == 200
        assert "Leaderboard" in response.text
        print("leaderboard.html: PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
