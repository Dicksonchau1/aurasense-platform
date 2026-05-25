"""
LayerManager: Manages runtime learning/processing layers.
"""
from typing import List

class LayerConfig:
    def __init__(self, **kwargs):
        self.config = kwargs

class LayerDescriptor:
    def __init__(self, layer_id: str, config: LayerConfig):
        self.layer_id = layer_id
        self.config = config

class LayerManager:
    def __init__(self):
        self._layers = {}

    @property
    def admitted_count(self) -> int:
        return len(self._layers)

    def admit(self, layer_id: str, config: LayerConfig) -> bool:
        if layer_id in self._layers:
            return False
        self._layers[layer_id] = LayerDescriptor(layer_id, config)
        return True

    def release(self, layer_id: str) -> None:
        if layer_id in self._layers:
            del self._layers[layer_id]

    def list_layers(self) -> List[LayerDescriptor]:
        return list(self._layers.values())
