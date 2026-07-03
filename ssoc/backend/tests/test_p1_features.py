"""
Test P1 Features: Section Timestamps and Footer Preview Data
- Section timestamps endpoint
- Admin init includes sectionTimestamps
- Footer save updates timestamp
- Hero save updates timestamp
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSectionTimestamps:
    """Test section timestamps feature"""
    
    def test_section_timestamps_endpoint_exists(self):
        """GET /api/section-timestamps returns timestamps object"""
        response = requests.get(f"{BASE_URL}/api/section-timestamps")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Section timestamps: {data}")
    
    def test_admin_init_includes_section_timestamps(self):
        """GET /api/admin/init includes sectionTimestamps key"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        assert response.status_code == 200
        data = response.json()
        assert "sectionTimestamps" in data, "sectionTimestamps key missing from admin/init"
        assert isinstance(data["sectionTimestamps"], dict)
        print(f"Admin init sectionTimestamps: {data['sectionTimestamps']}")
    
    def test_footer_save_updates_timestamp(self):
        """POST /api/footer updates footer section timestamp"""
        # Get current timestamps
        ts_before = requests.get(f"{BASE_URL}/api/section-timestamps").json()
        footer_ts_before = ts_before.get("footer")
        
        # Get current footer data
        footer_response = requests.get(f"{BASE_URL}/api/footer")
        assert footer_response.status_code == 200
        footer_data = footer_response.json()
        
        # Save footer (with same data to avoid changes)
        time.sleep(1)  # Ensure timestamp difference
        save_response = requests.post(f"{BASE_URL}/api/footer", json=footer_data)
        assert save_response.status_code == 200
        
        # Verify timestamp was updated
        ts_after = requests.get(f"{BASE_URL}/api/section-timestamps").json()
        footer_ts_after = ts_after.get("footer")
        
        assert footer_ts_after is not None, "Footer timestamp not set after save"
        if footer_ts_before:
            assert footer_ts_after >= footer_ts_before, "Footer timestamp should be updated"
        print(f"Footer timestamp updated: {footer_ts_before} -> {footer_ts_after}")
    
    def test_site_data_save_updates_timestamp(self):
        """POST /api/site-data updates siteData section timestamp"""
        # Get current timestamps
        ts_before = requests.get(f"{BASE_URL}/api/section-timestamps").json()
        site_ts_before = ts_before.get("siteData")
        
        # Get current site data
        site_response = requests.get(f"{BASE_URL}/api/site-data")
        assert site_response.status_code == 200
        site_data = site_response.json()
        
        # Save site data (with same data to avoid changes)
        time.sleep(1)  # Ensure timestamp difference
        save_response = requests.post(f"{BASE_URL}/api/site-data", json=site_data)
        assert save_response.status_code == 200
        
        # Verify timestamp was updated
        ts_after = requests.get(f"{BASE_URL}/api/section-timestamps").json()
        site_ts_after = ts_after.get("siteData")
        
        assert site_ts_after is not None, "SiteData timestamp not set after save"
        if site_ts_before:
            assert site_ts_after >= site_ts_before, "SiteData timestamp should be updated"
        print(f"SiteData timestamp updated: {site_ts_before} -> {site_ts_after}")


class TestFooterPreviewData:
    """Test footer data for live preview feature"""
    
    def test_footer_endpoint_returns_all_fields(self):
        """GET /api/footer returns all fields needed for preview"""
        response = requests.get(f"{BASE_URL}/api/footer")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields for footer preview
        expected_fields = ["brandDescription", "socialLinks", "communityLinks", "resourceLinks", "legalLinks", "copyrightText"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Footer data fields: {list(data.keys())}")
    
    def test_footer_social_links_structure(self):
        """Footer socialLinks should be a dict with platform keys"""
        response = requests.get(f"{BASE_URL}/api/footer")
        assert response.status_code == 200
        data = response.json()
        
        social_links = data.get("socialLinks", {})
        assert isinstance(social_links, dict)
        print(f"Social links: {social_links}")
    
    def test_footer_link_arrays_structure(self):
        """Footer link arrays should contain objects with label and url"""
        response = requests.get(f"{BASE_URL}/api/footer")
        assert response.status_code == 200
        data = response.json()
        
        link_fields = ["communityLinks", "resourceLinks", "legalLinks"]
        for field in link_fields:
            links = data.get(field, [])
            assert isinstance(links, list), f"{field} should be a list"
            for link in links:
                assert "label" in link, f"Link in {field} missing 'label'"
                assert "url" in link, f"Link in {field} missing 'url'"
        print("All link arrays have correct structure")


class TestPublicInitRegression:
    """Regression tests for public/init endpoint (P0 fix)"""
    
    def test_public_init_returns_all_keys(self):
        """GET /api/public/init returns all expected keys"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        assert response.status_code == 200
        data = response.json()
        
        expected_keys = ["siteData", "formStatus", "applyLinks", "testimonials", "faqs", "sponsors", "footer", "advocates", "pages", "registrationCounts"]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        
        assert "error" not in data, f"Error in response: {data.get('error')}"
        print(f"Public init keys: {list(data.keys())}")
    
    def test_public_init_footer_has_preview_data(self):
        """Public init footer data should have all fields for main site footer"""
        response = requests.get(f"{BASE_URL}/api/public/init")
        assert response.status_code == 200
        data = response.json()
        
        footer = data.get("footer", {})
        assert "brandDescription" in footer
        assert "copyrightText" in footer
        print(f"Public init footer: {list(footer.keys())}")


class TestAdminInitCombinedEndpoint:
    """Test admin/init combined endpoint"""
    
    def test_admin_init_returns_all_keys(self):
        """GET /api/admin/init returns all expected keys"""
        response = requests.get(f"{BASE_URL}/api/admin/init")
        assert response.status_code == 200
        data = response.json()
        
        expected_keys = [
            "siteData", "formStatus", "applyLinks", "footer", "projects", 
            "mentors", "organizers", "advocates", "applications", "testimonials",
            "sponsors", "faqs", "registrations", "pages", "referralLinks",
            "tasks", "completions", "customFields", "sectionTimestamps"
        ]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        
        assert "error" not in data, f"Error in response: {data.get('error')}"
        print(f"Admin init has {len(data.keys())} keys including sectionTimestamps")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
