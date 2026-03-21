"""
OpenClaw Tools Registry - Unified tool management and execution.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Type, Union

from openclaw.prompts import PromptBuilder, PromptTemplate, build_prompt
from openclaw.agent import Agent, AgentTask, AgentResult, run_agent
from openclaw.models import ModelMetadata, save_model, load_model


@dataclass
class Tool:
    """A registered tool with metadata."""
    
    name: str
    description: str
    handler: Callable
    input_schema: Dict[str, Any] = field(default_factory=dict)
    output_schema: Dict[str, Any] = field(default_factory=dict)
    category: str = "general"
    tags: List[str] = field(default_factory=list)
    requires_auth: bool = False
    rate_limit: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema,
            "output_schema": self.output_schema,
            "category": self.category,
            "tags": self.tags,
            "requires_auth": self.requires_auth,
            "rate_limit": self.rate_limit,
            "created_at": self.created_at.isoformat(),
        }


@dataclass
class ToolResult:
    """Result from tool execution."""
    
    tool_name: str
    success: bool
    output: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "execution_time": self.execution_time,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
        }


class OpenClawToolkit:
    """Main toolkit combining all OpenClaw tools."""
    
    _instance: Optional["OpenClawToolkit"] = None
    
    def __new__(cls) -> "OpenClawToolkit":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._tools: Dict[str, Tool] = {}
            cls._instance._categories: Dict[str, List[str]] = {}
            cls._instance._execution_history: List[ToolResult] = []
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._register_builtin_tools()
            self._initialized = True
    
    def _register_builtin_tools(self) -> None:
        builtin_tools = [
            Tool(
                name="prompt.build",
                description="Build a prompt using the PromptBuilder",
                handler=self._tool_prompt_build,
                category="prompt",
                tags=["prompt", "builder"],
            ),
            Tool(
                name="prompt.from_template",
                description="Build a prompt from a registered template",
                handler=self._tool_prompt_from_template,
                category="prompt",
                tags=["prompt", "template"],
            ),
            Tool(
                name="agent.run",
                description="Run an agent task",
                handler=self._tool_agent_run,
                category="agent",
                tags=["agent", "execution"],
            ),
            Tool(
                name="agent.create",
                description="Create a new agent configuration",
                handler=self._tool_agent_create,
                category="agent",
                tags=["agent", "create"],
            ),
            Tool(
                name="model.save",
                description="Save a model with metadata",
                handler=self._tool_model_save,
                category="model",
                tags=["model", "save", "persistence"],
            ),
            Tool(
                name="model.load",
                description="Load a saved model",
                handler=self._tool_model_load,
                category="model",
                tags=["model", "load"],
            ),
            Tool(
                name="model.list",
                description="List saved models",
                handler=self._tool_model_list,
                category="model",
                tags=["model", "list"],
            ),
            Tool(
                name="tool.list",
                description="List all registered tools",
                handler=self._tool_list_tools,
                category="meta",
                tags=["tool", "list", "meta"],
            ),
            Tool(
                name="tool.execute",
                description="Execute a tool by name",
                handler=self._tool_execute_tool,
                category="meta",
                tags=["tool", "execute", "meta"],
            ),
            Tool(
                name="tool.register",
                description="Register a new tool",
                handler=self._tool_register_tool,
                category="meta",
                tags=["tool", "register", "meta"],
            ),
        ]
        
        for tool in builtin_tools:
            self._tools[tool.name] = tool
            if tool.category not in self._categories:
                self._categories[tool.category] = []
            self._categories[tool.category].append(tool.name)
    
    def register_tool(
        self,
        name: str,
        handler: Callable,
        description: str = "",
        category: str = "custom",
        tags: Optional[List[str]] = None,
        input_schema: Optional[Dict[str, Any]] = None,
        output_schema: Optional[Dict[str, Any]] = None,
        requires_auth: bool = False,
        rate_limit: Optional[int] = None,
    ) -> Tool:
        """Register a new tool."""
        tool = Tool(
            name=name,
            description=description,
            handler=handler,
            input_schema=input_schema or {},
            output_schema=output_schema or {},
            category=category,
            tags=tags or [],
            requires_auth=requires_auth,
            rate_limit=rate_limit,
        )
        
        self._tools[name] = tool
        if category not in self._categories:
            self._categories[category] = []
        self._categories[category].append(name)
        
        return tool
    
    def unregister_tool(self, name: str) -> bool:
        """Unregister a tool."""
        if name in self._tools:
            tool = self._tools.pop(name)
            self._categories[tool.category].remove(name)
            return True
        return False
    
    def get_tool(self, name: str) -> Optional[Tool]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def list_tools(
        self,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[Tool]:
        """List tools with optional filters."""
        if category:
            names = self._categories.get(category, [])
            tools = [self._tools[n] for n in names if n in self._tools]
        else:
            tools = list(self._tools.values())
        
        if tags:
            tools = [
                t for t in tools
                if any(tag in t.tags for tag in tags)
            ]
        
        return tools
    
    def list_categories(self) -> List[str]:
        """List all tool categories."""
        return list(self._categories.keys())
    
    def execute(
        self,
        tool_name: str,
        **kwargs,
    ) -> ToolResult:
        """Execute a tool by name with given arguments."""
        import time
        
        tool = self._tools.get(tool_name)
        if not tool:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                error=f"Tool '{tool_name}' not found",
            )
        
        start_time = time.time()
        
        try:
            output = tool.handler(**kwargs)
            execution_time = time.time() - start_time
            
            result = ToolResult(
                tool_name=tool_name,
                success=True,
                output=output,
                execution_time=execution_time,
            )
        except Exception as e:
            execution_time = time.time() - start_time
            result = ToolResult(
                tool_name=tool_name,
                success=False,
                error=str(e),
                execution_time=execution_time,
            )
        
        self._execution_history.append(result)
        return result
    
    def get_execution_history(
        self,
        tool_name: Optional[str] = None,
        limit: int = 100,
    ) -> List[ToolResult]:
        """Get execution history."""
        history = self._execution_history
        
        if tool_name:
            history = [r for r in history if r.tool_name == tool_name]
        
        return history[-limit:]
    
    def clear_history(self) -> None:
        """Clear execution history."""
        self._execution_history.clear()
    
    def save_config(self, path: Union[str, Path]) -> None:
        """Save toolkit configuration to file."""
        path = Path(path)
        config = {
            "tools": {name: tool.to_dict() for name, tool in self._tools.items()},
            "categories": self._categories,
        }
        with open(path, "w") as f:
            json.dump(config, f, indent=2)
    
    def load_config(self, path: Union[str, Path]) -> None:
        """Load toolkit configuration from file."""
        path = Path(path)
        if not path.exists():
            return
        
        with open(path) as f:
            config = json.load(f)
        
        for name, tool_data in config.get("tools", {}).items():
            if name not in self._tools:
                self.register_tool(
                    name=name,
                    handler=lambda **kw: f"Handler for {name} not loaded",
                    description=tool_data.get("description", ""),
                    category=tool_data.get("category", "custom"),
                    tags=tool_data.get("tags", []),
                )
    
    def _tool_prompt_build(
        self,
        base: str = "",
        system: Optional[str] = None,
        user: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        constraints: Optional[List[str]] = None,
        examples: Optional[List[str]] = None,
        **kwargs,
    ) -> str:
        builder = PromptBuilder(base)
        
        if system:
            builder.add_system(system)
        if user:
            builder.add_user(user)
        if context:
            for k, v in context.items():
                builder.add_context(k, v)
        if constraints:
            for c in constraints:
                builder.add_constraint(c)
        if examples:
            for e in examples:
                builder.add_example(e)
        
        return builder.build()
    
    def _tool_prompt_from_template(
        self,
        template_name: str,
        **variables,
    ) -> str:
        return build_prompt(template_name, **variables)
    
    def _tool_agent_run(
        self,
        task_name: str,
        prompt: str,
        input_data: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        task = AgentTask(
            name=task_name,
            prompt=prompt,
            input_data=input_data or {},
            **kwargs,
        )
        result = run_agent(task)
        return result.to_dict()
    
    def _tool_agent_create(
        self,
        name: str,
        role: str = "assistant",
        system_prompt: str = "You are a helpful agent.",
        capabilities: Optional[List[str]] = None,
        tools: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        from openclaw.agent import create_agent
        agent = create_agent(
            name=name,
            role=role,
            system_prompt=system_prompt,
            capabilities=capabilities,
            tools=tools,
        )
        return agent.to_dict()
    
    def _tool_model_save(
        self,
        model: Any,
        name: str,
        version: Optional[str] = None,
        description: str = "",
        tags: Optional[List[str]] = None,
        metrics: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        metadata = save_model(
            model=model,
            name=name,
            version=version,
            description=description,
            tags=tags,
            metrics=metrics,
        )
        return metadata.to_dict()
    
    def _tool_model_load(
        self,
        model_id: str,
        validate: bool = True,
    ) -> Any:
        return load_model(model_id, validate=validate)
    
    def _tool_model_list(
        self,
        name: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        models = list_saved_models(name=name, tags=tags)
        return [m.to_dict() for m in models]
    
    def _tool_list_tools(
        self,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        tools = self.list_tools(category=category, tags=tags)
        return [t.to_dict() for t in tools]
    
    def _tool_execute_tool(
        self,
        tool_name: str,
        **kwargs,
    ) -> Dict[str, Any]:
        result = self.execute(tool_name, **kwargs)
        return result.to_dict()
    
    def _tool_register_tool(
        self,
        name: str,
        description: str,
        category: str = "custom",
        tags: Optional[List[str]] = None,
        handler_code: Optional[str] = None,
    ) -> Dict[str, Any]:
        def placeholder_handler(**kwargs):
            return {"message": f"Placeholder for {name}", "args": kwargs}
        
        tool = self.register_tool(
            name=name,
            handler=placeholder_handler,
            description=description,
            category=category,
            tags=tags or [],
        )
        return tool.to_dict()


_toolkit: Optional[OpenClawToolkit] = None


def get_toolkit() -> OpenClawToolkit:
    """Get or create the global toolkit instance."""
    global _toolkit
    if _toolkit is None:
        _toolkit = OpenClawToolkit()
    return _toolkit


def register_tool(
    name: str,
    handler: Callable,
    description: str = "",
    category: str = "custom",
    tags: Optional[List[str]] = None,
    **kwargs,
) -> Tool:
    """Register a tool in the global toolkit."""
    return get_toolkit().register_tool(
        name=name,
        handler=handler,
        description=description,
        category=category,
        tags=tags,
        **kwargs,
    )


def execute_tool(
    tool_name: str,
    **kwargs,
) -> ToolResult:
    """Execute a tool in the global toolkit."""
    return get_toolkit().execute(tool_name, **kwargs)
