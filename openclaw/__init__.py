"""
OpenClaw Tools Package - Prompt generation, Agent execution, and Model persistence.
"""

from openclaw.prompts import (
    PromptBuilder,
    PromptTemplate,
    PromptRegistry,
    build_prompt,
    register_prompt_template,
    list_prompt_templates,
)
from openclaw.agent import (
    Agent,
    AgentRunner,
    AgentTask,
    AgentResult,
    run_agent,
    run_parallel_agents,
)
from openclaw.models import (
    ModelSaver,
    ModelConfig,
    ModelMetadata,
    save_model,
    load_model,
    list_saved_models,
)
from openclaw.tools import (
    OpenClawToolkit,
    get_toolkit,
    register_tool,
    execute_tool,
)

__all__ = [
    "PromptBuilder",
    "PromptTemplate", 
    "PromptRegistry",
    "build_prompt",
    "register_prompt_template",
    "list_prompt_templates",
    "Agent",
    "AgentRunner",
    "AgentTask",
    "AgentResult",
    "run_agent",
    "run_parallel_agents",
    "ModelSaver",
    "ModelConfig",
    "ModelMetadata",
    "save_model",
    "load_model",
    "list_saved_models",
    "OpenClawToolkit",
    "get_toolkit",
    "register_tool",
    "execute_tool",
]

__version__ = "0.1.0"
