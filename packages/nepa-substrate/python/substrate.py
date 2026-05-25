"""
Substrate: Canonical runtime API for NEPA substrate layer.
"""
from typing import Any
from plasticity import PlasticityController
from layer_manager import LayerManager
from reflex import ReflexInterface
from coupling_log import CouplingLog
from envelope import Envelope, EnvelopeStream
from audit_event import AuditEvent

class SubstrateConfig:
    def __init__(self, **kwargs):
        self.config = kwargs

class SubstrateStatus:
    def __init__(self, status: str = "disconnected"):
        self.status = status

class Substrate:
    def __init__(self, config: SubstrateConfig):
        self.config = config
        self._connected = False
        self._layer_manager = LayerManager()
        self._plasticity = PlasticityController()
        self._reflex = ReflexInterface()
        self._coupling_log = CouplingLog()
        self._status = SubstrateStatus()

    @property
    def connected(self) -> bool:
        return self._connected

    def connect(self) -> None:
        self._connected = True
        self._status.status = "connected"

    def disconnect(self) -> None:
        self._connected = False
        self._status.status = "disconnected"

    def status(self) -> SubstrateStatus:
        return self._status

    def get_layer_manager(self) -> LayerManager:
        return self._layer_manager

    def get_plasticity_controller(self) -> PlasticityController:
        return self._plasticity

    def get_reflex(self) -> ReflexInterface:
        return self._reflex

    def get_coupling_log(self) -> CouplingLog:
        return self._coupling_log

    def export_weights(self, path: str) -> None:
        self._plasticity.export_weights(path)

    def import_weights(self, path: str) -> None:
        self._plasticity.import_weights(path)
