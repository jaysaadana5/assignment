"""Tests for Badge Gallery Wall feature (/api/gallery/badges)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://advocate-hub-73.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ===== POST /api/gallery/badges =====

class TestCreateGalleryBadge:
    def test_create_contributor(self, session):
        payload = {"name": "TEST_Contributor_A", "github": "test_contrib_a", "role": "contributor", "tagline": "Love open source"}
        r = session.post(f"{API}/gallery/badges", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST_Contributor_A"
        assert data["github"] == "test_contrib_a"
        assert data["role"] == "contributor"
        assert data["tagline"] == "Love open source"
        assert "id" in data and isinstance(data["id"], str)
        assert "created_at" in data

    def test_create_mentor(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_Mentor_B", "github": "test_mentor_b", "role": "mentor"})
        assert r.status_code == 200
        assert r.json()["role"] == "mentor"

    def test_create_admin(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_Admin_C", "github": "test_admin_c", "role": "admin"})
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_at_symbol_stripped_from_github(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_Strip", "github": "@test_strip_handle", "role": "contributor"})
        assert r.status_code == 200
        assert r.json()["github"] == "test_strip_handle"

    def test_invalid_role_rejected(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_X", "github": "test_x", "role": "superuser"})
        assert r.status_code == 422

    def test_tagline_over_140_rejected(self, session):
        r = session.post(f"{API}/gallery/badges", json={
            "name": "TEST_Long", "github": "test_long", "role": "contributor",
            "tagline": "x" * 141,
        })
        assert r.status_code == 422

    def test_tagline_exactly_140_ok(self, session):
        r = session.post(f"{API}/gallery/badges", json={
            "name": "TEST_140", "github": "test_140", "role": "contributor",
            "tagline": "y" * 140,
        })
        assert r.status_code == 200
        assert len(r.json()["tagline"]) == 140

    def test_empty_name_rejected(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "", "github": "test_e", "role": "contributor"})
        assert r.status_code == 422

    def test_empty_github_rejected(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_E", "github": "", "role": "contributor"})
        assert r.status_code == 422

    def test_missing_role_rejected(self, session):
        r = session.post(f"{API}/gallery/badges", json={"name": "TEST_NR", "github": "test_nr"})
        assert r.status_code == 422


# ===== GET /api/gallery/badges =====

class TestListGalleryBadges:
    def test_list_returns_array(self, session):
        r = session.get(f"{API}/gallery/badges")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # at least seeded data

    def test_list_excludes_mongo_id(self, session):
        r = session.get(f"{API}/gallery/badges")
        for item in r.json():
            assert "_id" not in item
            assert "id" in item
            assert "name" in item
            assert "github" in item
            assert "role" in item
            assert "created_at" in item

    def test_list_sorted_desc_by_created_at(self, session):
        r = session.get(f"{API}/gallery/badges")
        items = r.json()
        dates = [i["created_at"] for i in items]
        assert dates == sorted(dates, reverse=True), "Expected descending sort by created_at"

    def test_filter_by_mentor(self, session):
        r = session.get(f"{API}/gallery/badges", params={"role": "mentor"})
        assert r.status_code == 200
        items = r.json()
        assert all(i["role"] == "mentor" for i in items)
        assert len(items) >= 1

    def test_filter_by_contributor(self, session):
        r = session.get(f"{API}/gallery/badges", params={"role": "contributor"})
        assert r.status_code == 200
        assert all(i["role"] == "contributor" for i in r.json())

    def test_filter_by_admin(self, session):
        r = session.get(f"{API}/gallery/badges", params={"role": "admin"})
        assert r.status_code == 200
        assert all(i["role"] == "admin" for i in r.json())

    def test_invalid_filter_returns_all(self, session):
        # Non-enum role is ignored (returns all) per backend impl
        r_all = session.get(f"{API}/gallery/badges")
        r_bad = session.get(f"{API}/gallery/badges", params={"role": "invalid"})
        assert r_bad.status_code == 200
        assert len(r_bad.json()) == len(r_all.json())


# ===== GET /api/gallery/badges/count =====

class TestCountGalleryBadges:
    def test_count_structure(self, session):
        r = session.get(f"{API}/gallery/badges/count")
        assert r.status_code == 200
        data = r.json()
        for k in ("total", "contributor", "mentor", "admin"):
            assert k in data
            assert isinstance(data[k], int)

    def test_count_consistency(self, session):
        data = session.get(f"{API}/gallery/badges/count").json()
        assert data["total"] >= data["contributor"] + data["mentor"] + data["admin"]
        # total should equal sum (assuming enum enforcement)
        assert data["total"] == data["contributor"] + data["mentor"] + data["admin"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
