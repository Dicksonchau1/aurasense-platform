# Subscribes to NEPA body-schema anomaly topic and acts on SERVICE_REQUEST severity events
import threading
import time

class NepaSubscriber:
    def __init__(self, anomaly_topic_client):
        self.client = anomaly_topic_client

    def subscribe(self, robot_id, callback):
        """
        Subscribe to /robots/{id}/body_schema/anomaly topic and trigger callback on SERVICE_REQUEST events.
        """
        topic = f"/robots/{robot_id}/body_schema/anomaly"

        def listen():
            for event in self.client.listen(topic):
                if event.get('event_type') == 'SERVICE_REQUEST':
                    callback(event)

        thread = threading.Thread(target=listen, daemon=True)
        thread.start()
