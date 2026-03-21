"""
OpenClaw Model Tools - Model persistence, versioning, and management.
"""

from __future__ import annotations

import json
import os
import pickle
import shutil
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Type, Union


class ModelFormat(Enum):
    PICKLE = "pickle"
    JSON = "json"
    SAFE_JSON = "safe_json"
    CUSTOM = "custom"


class ModelState(Enum):
    DRAFT = "draft"
    TRAINING = "training"
    VALIDATED = "validated"
    DEPLOYED = "deployed"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


@dataclass
class ModelMetadata:
    """Metadata for a saved model."""
    
    id: str
    name: str
    version: str
    format: ModelFormat
    state: ModelState = ModelState.DRAFT
    description: str = ""
    tags: List[str] = field(default_factory=list)
    author: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    parent_id: Optional[str] = None
    checksum: Optional[str] = None
    size_bytes: int = 0
    metrics: Dict[str, float] = field(default_factory=dict)
    config: Dict[str, Any] = field(default_factory=dict)
    custom_data: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "format": self.format.value,
            "state": self.state.value,
            "description": self.description,
            "tags": self.tags,
            "author": self.author,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "parent_id": self.parent_id,
            "checksum": self.checksum,
            "size_bytes": self.size_bytes,
            "metrics": self.metrics,
            "config": self.config,
            "custom_data": self.custom_data,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ModelMetadata":
        data["format"] = ModelFormat(data["format"])
        data["state"] = ModelState(data["state"])
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        return cls(**data)


@dataclass
class ModelConfig:
    """Configuration for model saving/loading."""
    
    base_dir: str = "./models"
    format: ModelFormat = ModelFormat.PICKLE
    compress: bool = False
    include_metadata: bool = True
    version_prefix: str = "v"
    max_versions: int = 10
    auto_version: bool = True
    validate_on_save: bool = True
    backup_enabled: bool = True
    backup_dir: Optional[str] = None


class ModelSaver:
    """Handles model persistence with versioning and metadata."""
    
    def __init__(self, config: Optional[ModelConfig] = None):
        self.config = config or ModelConfig()
        self.base_dir = Path(self.config.base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        if self.config.backup_enabled:
            self.backup_dir = Path(self.config.backup_dir or f"{self.config.base_dir}/backups")
            self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        self._metadata_cache: Dict[str, ModelMetadata] = {}
        self._custom_savers: Dict[str, Callable] = {}
        self._custom_loaders: Dict[str, Callable] = {}
        
        self._load_metadata_cache()
    
    def _load_metadata_cache(self) -> None:
        for model_dir in self.base_dir.iterdir():
            if model_dir.is_dir():
                meta_path = model_dir / "metadata.json"
                if meta_path.exists():
                    with open(meta_path) as f:
                        metadata = ModelMetadata.from_dict(json.load(f))
                        self._metadata_cache[metadata.id] = metadata
    
    def _get_model_dir(self, model_id: str) -> Path:
        return self.base_dir / model_id
    
    def _generate_version(self, name: str) -> str:
        existing = [
            m for m in self._metadata_cache.values() 
            if m.name == name
        ]
        if not existing:
            return f"{self.config.version_prefix}1"
        
        versions = []
        for m in existing:
            v = m.version.replace(self.config.version_prefix, "")
            try:
                versions.append(int(v))
            except ValueError:
                pass
        
        next_version = max(versions) + 1 if versions else 1
        return f"{self.config.version_prefix}{next_version}"
    
    def _generate_id(self) -> str:
        import uuid
        return str(uuid.uuid4())[:12]
    
    def _calculate_checksum(self, file_path: Path) -> str:
        import hashlib
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()[:16]
    
    def register_custom_saver(
        self,
        format_name: str,
        saver: Callable[[Any, Path], None],
    ) -> None:
        self._custom_savers[format_name] = saver
    
    def register_custom_loader(
        self,
        format_name: str,
        loader: Callable[[Path], Any],
    ) -> None:
        self._custom_loaders[format_name] = loader
    
    def save(
        self,
        model: Any,
        name: str,
        version: Optional[str] = None,
        description: str = "",
        tags: Optional[List[str]] = None,
        author: str = "",
        parent_id: Optional[str] = None,
        metrics: Optional[Dict[str, float]] = None,
        config: Optional[Dict[str, Any]] = None,
        custom_data: Optional[Dict[str, Any]] = None,
        format: Optional[ModelFormat] = None,
    ) -> ModelMetadata:
        """Save a model with full metadata."""
        
        model_id = self._generate_id()
        model_version = version or (
            self._generate_version(name) if self.config.auto_version else "v1"
        )
        model_format = format or self.config.format
        
        model_dir = self._get_model_dir(model_id)
        model_dir.mkdir(parents=True, exist_ok=True)
        
        model_file = model_dir / "model"
        if model_format == ModelFormat.PICKLE:
            model_file = model_dir / "model.pkl"
            with open(model_file, "wb") as f:
                pickle.dump(model, f)
        elif model_format == ModelFormat.JSON:
            model_file = model_dir / "model.json"
            with open(model_file, "w") as f:
                json.dump(model, f, indent=2, default=str)
        elif model_format == ModelFormat.SAFE_JSON:
            model_file = model_dir / "model.json"
            safe_model = self._make_json_safe(model)
            with open(model_file, "w") as f:
                json.dump(safe_model, f, indent=2)
        elif model_format == ModelFormat.CUSTOM:
            model_file = model_dir / "model.custom"
            if "custom" in self._custom_savers:
                self._custom_savers["custom"](model, model_file)
            else:
                raise ValueError("No custom saver registered")
        
        checksum = self._calculate_checksum(model_file)
        size_bytes = model_file.stat().st_size
        
        metadata = ModelMetadata(
            id=model_id,
            name=name,
            version=model_version,
            format=model_format,
            description=description,
            tags=tags or [],
            author=author,
            parent_id=parent_id,
            checksum=checksum,
            size_bytes=size_bytes,
            metrics=metrics or {},
            config=config or {},
            custom_data=custom_data or {},
        )
        
        if self.config.include_metadata:
            meta_path = model_dir / "metadata.json"
            with open(meta_path, "w") as f:
                json.dump(metadata.to_dict(), f, indent=2)
        
        self._metadata_cache[model_id] = metadata
        
        if self.config.backup_enabled:
            self._create_backup(model_id)
        
        self._cleanup_old_versions(name)
        
        return metadata
    
    def load(
        self,
        model_id: str,
        validate: bool = True,
    ) -> Any:
        """Load a model by ID."""
        model_dir = self._get_model_dir(model_id)
        
        if not model_dir.exists():
            raise FileNotFoundError(f"Model {model_id} not found")
        
        metadata = self._metadata_cache.get(model_id)
        if not metadata:
            meta_path = model_dir / "metadata.json"
            if meta_path.exists():
                with open(meta_path) as f:
                    metadata = ModelMetadata.from_dict(json.load(f))
                    self._metadata_cache[model_id] = metadata
        
        if validate and metadata:
            model_file = self._get_model_file(model_dir, metadata.format)
            if metadata.checksum:
                actual_checksum = self._calculate_checksum(model_file)
                if actual_checksum != metadata.checksum:
                    raise ValueError(
                        f"Checksum mismatch for model {model_id}. "
                        f"Expected: {metadata.checksum}, Got: {actual_checksum}"
                    )
        
        model_file = self._get_model_file(model_dir, metadata.format if metadata else ModelFormat.PICKLE)
        
        if metadata and metadata.format == ModelFormat.PICKLE:
            with open(model_file, "rb") as f:
                return pickle.load(f)
        elif metadata and metadata.format in (ModelFormat.JSON, ModelFormat.SAFE_JSON):
            with open(model_file) as f:
                return json.load(f)
        elif metadata and metadata.format == ModelFormat.CUSTOM:
            if "custom" in self._custom_loaders:
                return self._custom_loaders["custom"](model_file)
            raise ValueError("No custom loader registered")
        else:
            with open(model_file, "rb") as f:
                return pickle.load(f)
    
    def _get_model_file(self, model_dir: Path, format: ModelFormat) -> Path:
        if format == ModelFormat.PICKLE:
            return model_dir / "model.pkl"
        elif format in (ModelFormat.JSON, ModelFormat.SAFE_JSON):
            return model_dir / "model.json"
        elif format == ModelFormat.CUSTOM:
            return model_dir / "model.custom"
        return model_dir / "model"
    
    def _make_json_safe(self, obj: Any) -> Any:
        """Convert object to JSON-safe representation."""
        if isinstance(obj, (str, int, float, bool, type(None))):
            return obj
        if isinstance(obj, (list, tuple)):
            return [self._make_json_safe(item) for item in obj]
        if isinstance(obj, dict):
            return {str(k): self._make_json_safe(v) for k, v in obj.items()}
        return str(obj)
    
    def _create_backup(self, model_id: str) -> None:
        if not self.config.backup_enabled:
            return
        
        model_dir = self._get_model_dir(model_id)
        backup_path = self.backup_dir / f"{model_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copytree(model_dir, backup_path)
    
    def _cleanup_old_versions(self, name: str) -> None:
        if self.config.max_versions <= 0:
            return
        
        versions = [
            m for m in self._metadata_cache.values()
            if m.name == name
        ]
        versions.sort(key=lambda x: x.created_at, reverse=True)
        
        for old_version in versions[self.config.max_versions:]:
            self.delete(old_version.id)
    
    def delete(self, model_id: str) -> bool:
        """Delete a model by ID."""
        model_dir = self._get_model_dir(model_id)
        
        if not model_dir.exists():
            return False
        
        shutil.rmtree(model_dir)
        self._metadata_cache.pop(model_id, None)
        return True
    
    def get_metadata(self, model_id: str) -> Optional[ModelMetadata]:
        """Get metadata for a model."""
        return self._metadata_cache.get(model_id)
    
    def list_models(
        self,
        name: Optional[str] = None,
        tags: Optional[List[str]] = None,
        state: Optional[ModelState] = None,
    ) -> List[ModelMetadata]:
        """List models with optional filters."""
        results = list(self._metadata_cache.values())
        
        if name:
            results = [m for m in results if m.name == name]
        
        if tags:
            results = [
                m for m in results 
                if any(tag in m.tags for tag in tags)
            ]
        
        if state:
            results = [m for m in results if m.state == state]
        
        return sorted(results, key=lambda x: x.created_at, reverse=True)
    
    def get_latest(self, name: str) -> Optional[ModelMetadata]:
        """Get the latest version of a model by name."""
        versions = self.list_models(name=name)
        return versions[0] if versions else None
    
    def update_state(
        self,
        model_id: str,
        new_state: ModelState,
    ) -> Optional[ModelMetadata]:
        """Update the state of a model."""
        metadata = self._metadata_cache.get(model_id)
        if not metadata:
            return None
        
        metadata.state = new_state
        metadata.updated_at = datetime.now()
        
        model_dir = self._get_model_dir(model_id)
        meta_path = model_dir / "metadata.json"
        with open(meta_path, "w") as f:
            json.dump(metadata.to_dict(), f, indent=2)
        
        return metadata
    
    def update_metrics(
        self,
        model_id: str,
        metrics: Dict[str, float],
    ) -> Optional[ModelMetadata]:
        """Update metrics for a model."""
        metadata = self._metadata_cache.get(model_id)
        if not metadata:
            return None
        
        metadata.metrics.update(metrics)
        metadata.updated_at = datetime.now()
        
        model_dir = self._get_model_dir(model_id)
        meta_path = model_dir / "metadata.json"
        with open(meta_path, "w") as f:
            json.dump(metadata.to_dict(), f, indent=2)
        
        return metadata
    
    def export_model(
        self,
        model_id: str,
        export_path: Union[str, Path],
        include_metadata: bool = True,
    ) -> Path:
        """Export a model to an external location."""
        model_dir = self._get_model_dir(model_id)
        
        if not model_dir.exists():
            raise FileNotFoundError(f"Model {model_id} not found")
        
        export_path = Path(export_path)
        export_path.mkdir(parents=True, exist_ok=True)
        
        for item in model_dir.iterdir():
            if item.is_file():
                if not include_metadata and item.name == "metadata.json":
                    continue
                shutil.copy2(item, export_path / item.name)
        
        return export_path


_default_saver: Optional[ModelSaver] = None


def get_saver(config: Optional[ModelConfig] = None) -> ModelSaver:
    """Get or create the default model saver."""
    global _default_saver
    if _default_saver is None or config:
        _default_saver = ModelSaver(config)
    return _default_saver


def save_model(
    model: Any,
    name: str,
    version: Optional[str] = None,
    description: str = "",
    tags: Optional[List[str]] = None,
    metrics: Optional[Dict[str, float]] = None,
    **kwargs,
) -> ModelMetadata:
    """Save a model using the default saver."""
    return get_saver().save(
        model=model,
        name=name,
        version=version,
        description=description,
        tags=tags,
        metrics=metrics,
        **kwargs,
    )


def load_model(
    model_id: str,
    validate: bool = True,
) -> Any:
    """Load a model using the default saver."""
    return get_saver().load(model_id, validate=validate)


def list_saved_models(
    name: Optional[str] = None,
    tags: Optional[List[str]] = None,
    state: Optional[ModelState] = None,
) -> List[ModelMetadata]:
    """List saved models."""
    return get_saver().list_models(name=name, tags=tags, state=state)
