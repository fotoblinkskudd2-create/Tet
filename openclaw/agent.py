"""
OpenClaw Agent Tools - Agent execution and task management framework.
"""

from __future__ import annotations

import asyncio
import json
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AgentTask:
    """A task for an agent to execute."""
    
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = ""
    description: str = ""
    prompt: str = ""
    input_data: Dict[str, Any] = field(default_factory=dict)
    context: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    timeout: float = 300.0
    retries: int = 3
    priority: int = 0
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "prompt": self.prompt,
            "input_data": self.input_data,
            "context": self.context,
            "dependencies": self.dependencies,
            "timeout": self.timeout,
            "retries": self.retries,
            "priority": self.priority,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentTask":
        data["status"] = TaskStatus(data["status"])
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        if data.get("started_at"):
            data["started_at"] = datetime.fromisoformat(data["started_at"])
        if data.get("completed_at"):
            data["completed_at"] = datetime.fromisoformat(data["completed_at"])
        return cls(**data)


@dataclass
class AgentResult:
    """Result from an agent task execution."""
    
    task_id: str
    success: bool
    output: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    execution_time: float = 0.0
    tokens_used: int = 0
    steps: List[Dict[str, Any]] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "metadata": self.metadata,
            "execution_time": self.execution_time,
            "tokens_used": self.tokens_used,
            "steps": self.steps,
            "created_at": self.created_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentResult":
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        return cls(**data)


@dataclass
class Agent:
    """An agent that can execute tasks."""
    
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = "default_agent"
    role: str = "assistant"
    system_prompt: str = "You are a helpful agent."
    capabilities: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    config: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "system_prompt": self.system_prompt,
            "capabilities": self.capabilities,
            "tools": self.tools,
            "config": self.config,
            "created_at": self.created_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Agent":
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        return cls(**data)


class AgentRunner:
    """Runner for executing agent tasks."""
    
    def __init__(
        self,
        agent: Optional[Agent] = None,
        output_dir: Optional[Union[str, Path]] = None,
    ):
        self.agent = agent or Agent()
        self.output_dir = Path(output_dir) if output_dir else Path("./agent_outputs")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._results: Dict[str, AgentResult] = {}
        self._running_tasks: Dict[str, asyncio.Task] = {}
        self._handlers: Dict[str, Callable] = {}
    
    def register_handler(
        self,
        task_type: str,
        handler: Callable[[AgentTask], AgentResult],
    ) -> None:
        self._handlers[task_type] = handler
    
    def _get_handler(self, task: AgentTask) -> Callable[[AgentTask], AgentResult]:
        task_type = task.input_data.get("type", "default")
        if task_type in self._handlers:
            return self._handlers[task_type]
        return self._default_handler
    
    def _default_handler(self, task: AgentTask) -> AgentResult:
        start_time = time.time()
        try:
            output = {
                "message": f"Processed task: {task.name}",
                "prompt": task.prompt,
                "input": task.input_data,
            }
            execution_time = time.time() - start_time
            return AgentResult(
                task_id=task.id,
                success=True,
                output=output,
                execution_time=execution_time,
            )
        except Exception as e:
            execution_time = time.time() - start_time
            return AgentResult(
                task_id=task.id,
                success=False,
                error=str(e),
                execution_time=execution_time,
            )
    
    def run_task(self, task: AgentTask) -> AgentResult:
        """Execute a single task synchronously."""
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now()
        
        handler = self._get_handler(task)
        result = handler(task)
        
        task.status = TaskStatus.COMPLETED if result.success else TaskStatus.FAILED
        task.completed_at = datetime.now()
        
        self._results[task.id] = result
        self._save_result(result)
        
        return result
    
    async def run_task_async(self, task: AgentTask) -> AgentResult:
        """Execute a single task asynchronously."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.run_task, task)
    
    def run_chain(
        self,
        tasks: List[AgentTask],
        pass_output: bool = True,
    ) -> List[AgentResult]:
        """Execute tasks in sequence, optionally passing output between them."""
        results = []
        previous_output = None
        
        for task in tasks:
            if pass_output and previous_output is not None:
                task.context["previous_output"] = previous_output
            
            result = self.run_task(task)
            results.append(result)
            
            if not result.success:
                break
            
            previous_output = result.output
        
        return results
    
    async def run_parallel(
        self,
        tasks: List[AgentTask],
        max_concurrent: int = 5,
    ) -> List[AgentResult]:
        """Execute multiple tasks in parallel."""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def bounded_run(task: AgentTask) -> AgentResult:
            async with semaphore:
                return await self.run_task_async(task)
        
        results = await asyncio.gather(
            *[bounded_run(task) for task in tasks],
            return_exceptions=True,
        )
        
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(AgentResult(
                    task_id=tasks[i].id,
                    success=False,
                    error=str(result),
                ))
            else:
                processed_results.append(result)
        
        return processed_results
    
    def run_with_retry(
        self,
        task: AgentTask,
        max_retries: Optional[int] = None,
    ) -> AgentResult:
        """Execute a task with automatic retries on failure."""
        retries = max_retries if max_retries is not None else task.retries
        last_result = None
        
        for attempt in range(retries + 1):
            result = self.run_task(task)
            last_result = result
            
            if result.success:
                return result
            
            if attempt < retries:
                time.sleep(2 ** attempt)
        
        return last_result or AgentResult(
            task_id=task.id,
            success=False,
            error="No result produced",
        )
    
    def _save_result(self, result: AgentResult) -> None:
        path = self.output_dir / f"{result.task_id}.json"
        with open(path, "w") as f:
            json.dump(result.to_dict(), f, indent=2)
    
    def load_result(self, task_id: str) -> Optional[AgentResult]:
        path = self.output_dir / f"{task_id}.json"
        if not path.exists():
            return None
        with open(path) as f:
            return AgentResult.from_dict(json.load(f))
    
    def get_results(self) -> Dict[str, AgentResult]:
        return self._results.copy()
    
    def clear_results(self) -> None:
        self._results.clear()


_default_runner: Optional[AgentRunner] = None


def get_runner() -> AgentRunner:
    """Get or create the default agent runner."""
    global _default_runner
    if _default_runner is None:
        _default_runner = AgentRunner()
    return _default_runner


def run_agent(
    task: Union[AgentTask, str],
    prompt: Optional[str] = None,
    input_data: Optional[Dict[str, Any]] = None,
    **kwargs,
) -> AgentResult:
    """Run a single agent task."""
    runner = get_runner()
    
    if isinstance(task, str):
        task = AgentTask(
            name=task,
            prompt=prompt or task,
            input_data=input_data or {},
            **kwargs,
        )
    
    return runner.run_task(task)


async def run_parallel_agents(
    tasks: List[Union[AgentTask, str]],
    max_concurrent: int = 5,
) -> List[AgentResult]:
    """Run multiple agent tasks in parallel."""
    runner = get_runner()
    
    processed_tasks = []
    for task in tasks:
        if isinstance(task, str):
            processed_tasks.append(AgentTask(name=task, prompt=task))
        else:
            processed_tasks.append(task)
    
    return await runner.run_parallel(processed_tasks, max_concurrent)


def create_agent(
    name: str,
    role: str = "assistant",
    system_prompt: str = "You are a helpful agent.",
    capabilities: Optional[List[str]] = None,
    tools: Optional[List[str]] = None,
    config: Optional[Dict[str, Any]] = None,
) -> Agent:
    """Create a new agent configuration."""
    return Agent(
        name=name,
        role=role,
        system_prompt=system_prompt,
        capabilities=capabilities or [],
        tools=tools or [],
        config=config or {},
    )
