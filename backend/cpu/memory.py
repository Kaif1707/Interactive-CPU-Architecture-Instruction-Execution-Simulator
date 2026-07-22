"""
Memory System for 8-bit CPU Simulator.
Manages a 256-byte RAM array (0x00 to 0xFF) with memory access tracking.
"""

from typing import List, Dict, Any

class Memory:
    def __init__(self, size: int = 256):
        self.size = size
        self.data: List[int] = [0] * size
        self.previous_data: List[int] = [0] * size
        self.last_accessed_addr: int = -1
        self.last_access_type: str = ""  # "READ" or "WRITE"
        self.read_count: int = 0
        self.write_count: int = 0

    def read(self, address: int) -> int:
        self._validate_address(address)
        self.last_accessed_addr = address
        self.last_access_type = "READ"
        self.read_count += 1
        return self.data[address]

    def write(self, address: int, value: int) -> None:
        self._validate_address(address)
        self.last_accessed_addr = address
        self.last_access_type = "WRITE"
        self.write_count += 1
        self.data[address] = value & 0xFF

    def reset(self) -> None:
        self.data = [0] * self.size
        self.previous_data = [0] * self.size
        self.last_accessed_addr = -1
        self.last_access_type = ""
        self.read_count = 0
        self.write_count = 0

    def _validate_address(self, address: int) -> None:
        if not isinstance(address, int) or not (0 <= address < self.size):
            raise ValueError(f"Out of bounds memory address: {address} (Valid: 0..{self.size - 1})")

    def get_changes(self) -> Dict[int, int]:
        changes = {}
        for i in range(self.size):
            if self.data[i] != self.previous_data[i]:
                changes[i] = self.data[i]
        self.previous_data = self.data.copy()
        return changes

    def get_state(self) -> Dict[str, Any]:
        return {
            "size": self.size,
            "data": self.data.copy(),
            "last_accessed_addr": self.last_accessed_addr,
            "last_access_type": self.last_access_type,
            "read_count": self.read_count,
            "write_count": self.write_count,
        }
