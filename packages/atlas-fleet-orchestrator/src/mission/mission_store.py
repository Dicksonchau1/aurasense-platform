# Simple in-memory mission store for demonstration
from typing import Dict, Any

class MissionStore:
    def __init__(self):
        self.missions: Dict[str, Any] = {}
        self.queue: list = []

    def add_mission(self, mission_id: str, mission: dict):
        self.missions[mission_id] = mission
        self.queue.append(mission_id)

    def get_mission(self, mission_id: str):
        return self.missions.get(mission_id)

    def get_queue(self, lane=None, priority=None):
        # Optionally filter by lane/priority
        result = [self.missions[mid] for mid in self.queue]
        if lane:
            result = [m for m in result if m.get('lane') == lane]
        if priority:
            result = [m for m in result if m.get('priority') == priority]
        return result

    def preempt_mission(self, mission_id: str):
        mission = self.missions.get(mission_id)
        if mission and mission_id in self.queue:
            self.queue.remove(mission_id)
            mission['state'] = 'PREEMPTED'
        return mission

    def resume_mission(self, mission_id: str):
        mission = self.missions.get(mission_id)
        if mission and mission['state'] == 'PREEMPTED':
            mission['state'] = 'QUEUED'
            self.queue.append(mission_id)
        return mission
