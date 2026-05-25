import os, psutil, threading, time, json, logging

class ThermalAbort(Exception): pass
class DiskAbort(Exception): pass

def jetson_health_monitor(out_path, interval=60, temp_limit=85, disk_limit_gb=2):
    def monitor():
        while True:
            temps = []
            for zone in os.listdir('/sys/devices/virtual/thermal'):
                if zone.startswith('thermal_zone'):
                    try:
                        with open(f'/sys/devices/virtual/thermal/{zone}/temp') as f:
                            temps.append(int(f.read()) / 1000)
                    except Exception: pass
            max_temp = max(temps) if temps else None
            disk = psutil.disk_usage('/')
            mem = psutil.virtual_memory()
            health = {
                'timestamp': time.time(),
                'max_temp': max_temp,
                'disk_free_gb': disk.free / 1e9,
                'mem_free_gb': mem.available / 1e9
            }
            with open(out_path, 'a') as f:
                f.write(json.dumps(health) + '\n')
            if max_temp and max_temp > temp_limit:
                logging.error(f"ThermalAbort: {max_temp} > {temp_limit}")
                raise ThermalAbort(f"{max_temp} > {temp_limit}")
            if disk.free < disk_limit_gb * 1e9:
                logging.error(f"DiskAbort: {disk.free / 1e9} < {disk_limit_gb}")
                raise DiskAbort(f"{disk.free / 1e9} < {disk_limit_gb}")
            time.sleep(interval)
    t = threading.Thread(target=monitor, daemon=True)
    t.start()
    return t
