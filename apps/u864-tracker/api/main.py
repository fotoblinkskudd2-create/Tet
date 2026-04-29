"""U-864 Tracker — FastAPI data ingestion backend."""

from __future__ import annotations

import os
from datetime import datetime
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="U-864 Tracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PollutionSample(BaseModel):
    lat: float = Field(..., ge=60.0, le=61.5)
    lng: float = Field(..., ge=4.0, le=5.5)
    mercury_ppm: float = Field(..., ge=0)
    cadmium_ppm: float = Field(0, ge=0)
    lead_ppm: float = Field(0, ge=0)
    source: Literal["official", "citizen"] = "citizen"
    sampled_at: Optional[datetime] = None


class CitizenReport(BaseModel):
    lat: float
    lng: float
    type: Literal["dead_fish", "discoloration", "water_sample", "other"]
    description: str = Field(..., min_length=10, max_length=2000)
    image_url: Optional[str] = None


_samples: list[dict] = []
_reports: list[dict] = []


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/samples")
def list_samples(
    limit: int = 100,
    source: Optional[Literal["official", "citizen"]] = None,
) -> list[dict]:
    data = _samples
    if source:
        data = [s for s in data if s["source"] == source]
    return data[-limit:]


@app.post("/samples", status_code=201)
def create_sample(sample: PollutionSample) -> dict:
    record = {
        "id": len(_samples) + 1,
        **sample.model_dump(),
        "sampled_at": (sample.sampled_at or datetime.utcnow()).isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "verified": False,
    }
    _samples.append(record)
    return record


@app.get("/reports")
def list_reports(limit: int = 50) -> list[dict]:
    return _reports[-limit:]


@app.post("/reports", status_code=201)
def create_report(report: CitizenReport) -> dict:
    record = {
        "id": len(_reports) + 1,
        **report.model_dump(),
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    _reports.append(record)
    return record


@app.get("/stats/mercury")
def mercury_stats() -> dict:
    if not _samples:
        return {"current_ppm": 0.47, "max_ppm": 0.47, "sample_count": 0}
    ppm_values = [s["mercury_ppm"] for s in _samples]
    return {
        "current_ppm": ppm_values[-1],
        "max_ppm": max(ppm_values),
        "avg_ppm": sum(ppm_values) / len(ppm_values),
        "sample_count": len(ppm_values),
    }
