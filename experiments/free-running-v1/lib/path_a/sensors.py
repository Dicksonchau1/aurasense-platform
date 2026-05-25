import cv2
import sounddevice as sd
import numpy as np
import threading, queue, logging, time
from ..input_source import InputSource
from .. import substrate_io

class JetsonSensorSource(InputSource):
    def __init__(self, audio_enabled=True, video_enabled=True):
        self.audio_enabled = audio_enabled
        self.video_enabled = video_enabled
        self._audio_queue = queue.Queue()
        self._activity_window = []
        self._stop_event = threading.Event()
        if self.video_enabled:
            self._cap = cv2.VideoCapture(0)
            self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self._cap.set(cv2.CAP_PROP_FPS, 30)
        if self.audio_enabled:
            self._audio_thread = threading.Thread(target=self._audio_loop, daemon=True)
            self._audio_thread.start()
    def _audio_loop(self):
        def callback(indata, frames, time_info, status):
            self._audio_queue.put(indata.copy())
        with sd.InputStream(samplerate=16000, channels=1, blocksize=1024, callback=callback):
            while not self._stop_event.is_set():
                time.sleep(0.01)
    def envelopes(self):
        while True:
            if self.video_enabled:
                ret, frame = self._cap.read()
                if not ret:
                    logging.warning("Camera frame not available")
                    continue
                # envelope_layer_rgb must be a real function in the repo
                env = substrate_io.envelope_layer_rgb(frame)
                self._activity_window.append(time.time())
                yield env
            if self.audio_enabled:
                try:
                    audio_block = self._audio_queue.get(timeout=0.1)
                    # spectrotemporal envelope generator must be real, else warn
                    if hasattr(substrate_io, "envelope_spectrotemporal"):
                        env = substrate_io.envelope_spectrotemporal(audio_block)
                        self._activity_window.append(time.time())
                        yield env
                    else:
                        logging.warning("No spectrotemporal envelope generator; running camera-only.")
                except queue.Empty:
                    pass
    def activity_rate_hz(self) -> float:
        now = time.time()
        window = [t for t in self._activity_window if t >= now - 60]
        return len(window) / 60.0 if window else 0.0
    def close(self):
        self._stop_event.set()
        if self.video_enabled:
            self._cap.release()
    @property
    def path_label(self):
        return "A"
