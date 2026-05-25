import time, logging
from lib.path_a.jetson_health import jetson_health_monitor, ThermalAbort, DiskAbort

def main():
    monitor = jetson_health_monitor('endurance_health.json')
    start = time.time()
    try:
        while time.time() - start < 24*3600:
            time.sleep(60)
    except (ThermalAbort, DiskAbort) as e:
        logging.error(f"Endurance test failed: {e}")
        exit(1)
    logging.info("Endurance test passed: 24h with no aborts.")
if __name__ == "__main__":
    main()
