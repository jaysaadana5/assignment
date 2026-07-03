"""
Test suite for SSoC Season 5 - Campus Advocate Leaderboard Feature
Tests: Advocate Tasks CRUD, Task Completions, and Leaderboard API
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data prefix for cleanup
TEST_PREFIX = "TEST_LB_"


class TestAdvocateTasksCRUD:
    """Tests for /api/advocate-tasks endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_task_ids = []
        yield
        # Cleanup: Delete test tasks
        for task_id in self.test_task_ids:
            try:
                requests.delete(f"{BASE_URL}/api/advocate-tasks/{task_id}")
            except:
                pass
    
    def test_get_advocate_tasks(self):
        """GET /api/advocate-tasks - returns all tasks"""
        response = requests.get(f"{BASE_URL}/api/advocate-tasks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/advocate-tasks returned {len(data)} tasks")
    
    def test_create_advocate_task(self):
        """POST /api/advocate-tasks - create a new task with name, description, points"""
        task_data = {
            "name": f"{TEST_PREFIX}Host Workshop",
            "description": "Host a campus workshop about open source",
            "points": 25
        }
        response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json=task_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "task" in data
        
        # Verify task data
        task = data["task"]
        assert task["name"] == task_data["name"]
        assert task["description"] == task_data["description"]
        assert task["points"] == task_data["points"]
        assert "id" in task
        
        self.test_task_ids.append(task["id"])
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/advocate-tasks")
        tasks = get_response.json()
        created_task = next((t for t in tasks if t["id"] == task["id"]), None)
        assert created_task is not None
        assert created_task["name"] == task_data["name"]
        print(f"✓ POST /api/advocate-tasks created task with id: {task['id']}")
    
    def test_update_advocate_task(self):
        """PUT /api/advocate-tasks/{id} - update a task"""
        # First create a task
        create_response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json={"name": f"{TEST_PREFIX}Original Task", "description": "Original desc", "points": 10}
        )
        task_id = create_response.json()["task"]["id"]
        self.test_task_ids.append(task_id)
        
        # Update the task
        update_data = {
            "name": f"{TEST_PREFIX}Updated Task",
            "description": "Updated description",
            "points": 50
        }
        update_response = requests.put(
            f"{BASE_URL}/api/advocate-tasks/{task_id}",
            json=update_data
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data.get("success") == True
        
        # Verify update with GET
        get_response = requests.get(f"{BASE_URL}/api/advocate-tasks")
        tasks = get_response.json()
        updated_task = next((t for t in tasks if t["id"] == task_id), None)
        assert updated_task is not None
        assert updated_task["name"] == update_data["name"]
        assert updated_task["description"] == update_data["description"]
        assert updated_task["points"] == update_data["points"]
        print(f"✓ PUT /api/advocate-tasks/{task_id} updated successfully")
    
    def test_update_nonexistent_task(self):
        """PUT /api/advocate-tasks/{id} - returns 404 for non-existent task"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/advocate-tasks/{fake_id}",
            json={"name": "Test", "points": 10}
        )
        assert response.status_code == 404
        print(f"✓ PUT /api/advocate-tasks/{fake_id} returned 404 as expected")
    
    def test_delete_advocate_task(self):
        """DELETE /api/advocate-tasks/{id} - delete task and its completions"""
        # Create a task
        create_response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json={"name": f"{TEST_PREFIX}Task to Delete", "points": 15}
        )
        task_id = create_response.json()["task"]["id"]
        
        # Delete the task
        delete_response = requests.delete(f"{BASE_URL}/api/advocate-tasks/{task_id}")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data.get("success") == True
        
        # Verify deletion with GET
        get_response = requests.get(f"{BASE_URL}/api/advocate-tasks")
        tasks = get_response.json()
        deleted_task = next((t for t in tasks if t["id"] == task_id), None)
        assert deleted_task is None
        print(f"✓ DELETE /api/advocate-tasks/{task_id} deleted successfully")


class TestTaskCompletions:
    """Tests for /api/task-completions endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data - create a test task and get an advocate"""
        # Create a test task
        task_response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json={"name": f"{TEST_PREFIX}Completion Test Task", "points": 20}
        )
        self.test_task_id = task_response.json()["task"]["id"]
        
        # Get an existing advocate (or create one if needed)
        advocates_response = requests.get(f"{BASE_URL}/api/campus-advocates")
        advocates = advocates_response.json()
        if advocates:
            self.test_advocate_id = advocates[0]["id"]
        else:
            # Create a test advocate
            adv_response = requests.post(
                f"{BASE_URL}/api/campus-advocates",
                json={"name": f"{TEST_PREFIX}Test Advocate", "email": f"{TEST_PREFIX}test@example.com", "college": "Test College"}
            )
            self.test_advocate_id = adv_response.json().get("advocate", {}).get("id", str(uuid.uuid4()))
        
        yield
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/advocate-tasks/{self.test_task_id}")
    
    def test_get_task_completions(self):
        """GET /api/task-completions - returns all completions"""
        response = requests.get(f"{BASE_URL}/api/task-completions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/task-completions returned {len(data)} completions")
    
    def test_assign_task_completion(self):
        """POST /api/task-completions/assign - mark task as completed by advocate"""
        assign_data = {
            "task_id": self.test_task_id,
            "advocate_id": self.test_advocate_id
        }
        response = requests.post(
            f"{BASE_URL}/api/task-completions/assign",
            json=assign_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify completion exists
        completions_response = requests.get(f"{BASE_URL}/api/task-completions")
        completions = completions_response.json()
        completion = next(
            (c for c in completions if c["task_id"] == self.test_task_id and c["advocate_id"] == self.test_advocate_id),
            None
        )
        assert completion is not None
        print(f"✓ POST /api/task-completions/assign created completion")
        
        # Cleanup - unassign
        requests.post(
            f"{BASE_URL}/api/task-completions/unassign",
            json=assign_data
        )
    
    def test_assign_duplicate_completion(self):
        """POST /api/task-completions/assign - returns error for duplicate assignment"""
        assign_data = {
            "task_id": self.test_task_id,
            "advocate_id": self.test_advocate_id
        }
        # First assignment
        requests.post(f"{BASE_URL}/api/task-completions/assign", json=assign_data)
        
        # Duplicate assignment
        response = requests.post(
            f"{BASE_URL}/api/task-completions/assign",
            json=assign_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        assert "already assigned" in data.get("message", "").lower()
        print(f"✓ POST /api/task-completions/assign correctly rejected duplicate")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/task-completions/unassign", json=assign_data)
    
    def test_unassign_task_completion(self):
        """POST /api/task-completions/unassign - remove a completion"""
        assign_data = {
            "task_id": self.test_task_id,
            "advocate_id": self.test_advocate_id
        }
        # First assign
        requests.post(f"{BASE_URL}/api/task-completions/assign", json=assign_data)
        
        # Then unassign
        response = requests.post(
            f"{BASE_URL}/api/task-completions/unassign",
            json=assign_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify completion is removed
        completions_response = requests.get(f"{BASE_URL}/api/task-completions")
        completions = completions_response.json()
        completion = next(
            (c for c in completions if c["task_id"] == self.test_task_id and c["advocate_id"] == self.test_advocate_id),
            None
        )
        assert completion is None
        print(f"✓ POST /api/task-completions/unassign removed completion")
    
    def test_unassign_nonexistent_completion(self):
        """POST /api/task-completions/unassign - returns error for non-existent completion"""
        response = requests.post(
            f"{BASE_URL}/api/task-completions/unassign",
            json={"task_id": str(uuid.uuid4()), "advocate_id": str(uuid.uuid4())}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        print(f"✓ POST /api/task-completions/unassign correctly handled non-existent completion")


class TestLeaderboard:
    """Tests for /api/leaderboard endpoint"""
    
    def test_get_leaderboard(self):
        """GET /api/leaderboard - returns ranked leaderboard with scores"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "leaderboard" in data
        assert "total_tasks" in data
        assert "total_advocates" in data
        assert isinstance(data["leaderboard"], list)
        assert isinstance(data["total_tasks"], int)
        assert isinstance(data["total_advocates"], int)
        
        print(f"✓ GET /api/leaderboard returned {len(data['leaderboard'])} advocates, {data['total_tasks']} tasks")
    
    def test_leaderboard_entry_structure(self):
        """GET /api/leaderboard - verify each entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        data = response.json()
        
        if data["leaderboard"]:
            entry = data["leaderboard"][0]
            required_fields = ["id", "name", "score", "tasks_completed", "total_tasks", "rank"]
            for field in required_fields:
                assert field in entry, f"Missing field: {field}"
            
            # Verify rank is 1 for first entry
            assert entry["rank"] == 1
            print(f"✓ Leaderboard entry has all required fields: {required_fields}")
        else:
            print("⚠ No advocates in leaderboard to verify structure")
    
    def test_leaderboard_sorted_by_score(self):
        """GET /api/leaderboard - verify leaderboard is sorted by score descending"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        data = response.json()
        
        leaderboard = data["leaderboard"]
        if len(leaderboard) > 1:
            for i in range(len(leaderboard) - 1):
                assert leaderboard[i]["score"] >= leaderboard[i + 1]["score"], \
                    f"Leaderboard not sorted: {leaderboard[i]['score']} < {leaderboard[i + 1]['score']}"
            print(f"✓ Leaderboard is correctly sorted by score descending")
        else:
            print("⚠ Not enough entries to verify sorting")
    
    def test_leaderboard_ranks_sequential(self):
        """GET /api/leaderboard - verify ranks are sequential"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        data = response.json()
        
        leaderboard = data["leaderboard"]
        for i, entry in enumerate(leaderboard):
            assert entry["rank"] == i + 1, f"Rank mismatch: expected {i + 1}, got {entry['rank']}"
        
        print(f"✓ Leaderboard ranks are sequential (1 to {len(leaderboard)})")


class TestLeaderboardIntegration:
    """Integration tests for leaderboard scoring"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_task_ids = []
        self.test_advocate_id = None
        
        # Get an existing advocate
        advocates_response = requests.get(f"{BASE_URL}/api/campus-advocates")
        advocates = advocates_response.json()
        if advocates:
            self.test_advocate_id = advocates[0]["id"]
            self.test_advocate_name = advocates[0]["name"]
        
        yield
        
        # Cleanup tasks
        for task_id in self.test_task_ids:
            requests.delete(f"{BASE_URL}/api/advocate-tasks/{task_id}")
    
    def test_score_updates_after_task_completion(self):
        """Verify score updates correctly when task is assigned"""
        if not self.test_advocate_id:
            pytest.skip("No advocates available for testing")
        
        # Get initial score
        initial_response = requests.get(f"{BASE_URL}/api/leaderboard")
        initial_data = initial_response.json()
        initial_entry = next(
            (e for e in initial_data["leaderboard"] if e["id"] == self.test_advocate_id),
            {"score": 0}
        )
        initial_score = initial_entry["score"]
        
        # Create a task with specific points
        task_points = 30
        task_response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json={"name": f"{TEST_PREFIX}Score Test Task", "points": task_points}
        )
        task_id = task_response.json()["task"]["id"]
        self.test_task_ids.append(task_id)
        
        # Assign task to advocate
        requests.post(
            f"{BASE_URL}/api/task-completions/assign",
            json={"task_id": task_id, "advocate_id": self.test_advocate_id}
        )
        
        # Check updated score
        updated_response = requests.get(f"{BASE_URL}/api/leaderboard")
        updated_data = updated_response.json()
        updated_entry = next(
            (e for e in updated_data["leaderboard"] if e["id"] == self.test_advocate_id),
            None
        )
        
        assert updated_entry is not None
        assert updated_entry["score"] == initial_score + task_points, \
            f"Score should be {initial_score + task_points}, got {updated_entry['score']}"
        
        print(f"✓ Score updated correctly: {initial_score} -> {updated_entry['score']} (+{task_points})")
        
        # Cleanup - unassign
        requests.post(
            f"{BASE_URL}/api/task-completions/unassign",
            json={"task_id": task_id, "advocate_id": self.test_advocate_id}
        )
    
    def test_delete_task_removes_completions(self):
        """Verify deleting a task also removes its completions"""
        if not self.test_advocate_id:
            pytest.skip("No advocates available for testing")
        
        # Create a task
        task_response = requests.post(
            f"{BASE_URL}/api/advocate-tasks",
            json={"name": f"{TEST_PREFIX}Delete Completion Test", "points": 15}
        )
        task_id = task_response.json()["task"]["id"]
        
        # Assign to advocate
        requests.post(
            f"{BASE_URL}/api/task-completions/assign",
            json={"task_id": task_id, "advocate_id": self.test_advocate_id}
        )
        
        # Verify completion exists
        completions_before = requests.get(f"{BASE_URL}/api/task-completions").json()
        completion_exists = any(
            c["task_id"] == task_id and c["advocate_id"] == self.test_advocate_id
            for c in completions_before
        )
        assert completion_exists, "Completion should exist before delete"
        
        # Delete task
        requests.delete(f"{BASE_URL}/api/advocate-tasks/{task_id}")
        
        # Verify completion is removed
        completions_after = requests.get(f"{BASE_URL}/api/task-completions").json()
        completion_still_exists = any(
            c["task_id"] == task_id and c["advocate_id"] == self.test_advocate_id
            for c in completions_after
        )
        assert not completion_still_exists, "Completion should be removed after task delete"
        
        print(f"✓ Deleting task also removed its completions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
