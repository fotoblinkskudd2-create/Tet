"""
OpenClaw Prompting Tools - Template-based prompt generation and management.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union


@dataclass
class PromptTemplate:
    """A reusable prompt template with variable interpolation."""
    
    name: str
    template: str
    description: str = ""
    variables: List[str] = field(default_factory=list)
    category: str = "general"
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.variables:
            self.variables = self._extract_variables()
    
    def _extract_variables(self) -> List[str]:
        pattern = r"\{(\w+)\}"
        return list(set(re.findall(pattern, self.template)))
    
    def render(self, **kwargs) -> str:
        """Render the template with provided variables."""
        missing = set(self.variables) - set(kwargs.keys())
        if missing:
            raise ValueError(f"Missing required variables: {missing}")
        return self.template.format(**kwargs)
    
    def render_partial(self, **kwargs) -> str:
        """Render with available variables, leaving others as placeholders."""
        result = self.template
        for key, value in kwargs.items():
            result = result.replace(f"{{{key}}}", str(value))
        return result
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "template": self.template,
            "description": self.description,
            "variables": self.variables,
            "category": self.category,
            "tags": self.tags,
            "created_at": self.created_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PromptTemplate":
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        return cls(**data)


class PromptBuilder:
    """Builder for constructing prompts step by step."""
    
    def __init__(self, base: str = ""):
        self._parts: List[str] = [base] if base else []
        self._context: Dict[str, Any] = {}
        self._constraints: List[str] = []
        self._examples: List[str] = []
        self._format_hints: List[str] = []
    
    def add_system(self, instruction: str) -> "PromptBuilder":
        self._parts.insert(0, f"[SYSTEM]: {instruction}")
        return self
    
    def add_user(self, content: str) -> "PromptBuilder":
        self._parts.append(f"[USER]: {content}")
        return self
    
    def add_assistant(self, content: str) -> "PromptBuilder":
        self._parts.append(f"[ASSISTANT]: {content}")
        return self
    
    def add_context(self, key: str, value: Any) -> "PromptBuilder":
        self._context[key] = value
        return self
    
    def add_constraint(self, constraint: str) -> "PromptBuilder":
        self._constraints.append(constraint)
        return self
    
    def add_example(self, example: str) -> "PromptBuilder":
        self._examples.append(example)
        return self
    
    def add_format_hint(self, hint: str) -> "PromptBuilder":
        self._format_hints.append(hint)
        return self
    
    def add_section(self, title: str, content: str) -> "PromptBuilder":
        self._parts.append(f"\n## {title}\n{content}")
        return self
    
    def add_bullet_list(self, items: List[str], title: Optional[str] = None) -> "PromptBuilder":
        if title:
            self._parts.append(f"\n{title}:")
        bullets = "\n".join(f"- {item}" for item in items)
        self._parts.append(bullets)
        return self
    
    def add_numbered_list(self, items: List[str], title: Optional[str] = None) -> "PromptBuilder":
        if title:
            self._parts.append(f"\n{title}:")
        numbered = "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
        self._parts.append(numbered)
        return self
    
    def build(self) -> str:
        """Build the final prompt string."""
        result_parts = list(self._parts)
        
        if self._context:
            context_str = "\n".join(f"{k}: {v}" for k, v in self._context.items())
            result_parts.append(f"\n[CONTEXT]\n{context_str}")
        
        if self._constraints:
            constraints_str = "\n".join(f"- {c}" for c in self._constraints)
            result_parts.append(f"\n[CONSTRAINTS]\n{constraints_str}")
        
        if self._examples:
            examples_str = "\n".join(f"Example: {e}" for e in self._examples)
            result_parts.append(f"\n[EXAMPLES]\n{examples_str}")
        
        if self._format_hints:
            format_str = "\n".join(self._format_hints)
            result_parts.append(f"\n[FORMAT]\n{format_str}")
        
        return "\n".join(result_parts)
    
    def reset(self) -> "PromptBuilder":
        self._parts = []
        self._context = {}
        self._constraints = []
        self._examples = []
        self._format_hints = []
        return self


class PromptRegistry:
    """Registry for managing prompt templates."""
    
    _instance: Optional["PromptRegistry"] = None
    _templates: Dict[str, PromptTemplate]
    _categories: Dict[str, List[str]]
    _loaded: bool
    
    def __new__(cls) -> "PromptRegistry":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._templates = {}
            cls._instance._categories = {}
            cls._instance._loaded = False
        return cls._instance
    
    def register(self, template: PromptTemplate) -> None:
        self._templates[template.name] = template
        if template.category not in self._categories:
            self._categories[template.category] = []
        self._categories[template.category].append(template.name)
    
    def unregister(self, name: str) -> bool:
        if name in self._templates:
            template = self._templates.pop(name)
            self._categories[template.category].remove(name)
            return True
        return False
    
    def get(self, name: str) -> Optional[PromptTemplate]:
        return self._templates.get(name)
    
    def list_all(self) -> List[PromptTemplate]:
        return list(self._templates.values())
    
    def list_by_category(self, category: str) -> List[PromptTemplate]:
        names = self._categories.get(category, [])
        return [self._templates[n] for n in names if n in self._templates]
    
    def list_categories(self) -> List[str]:
        return list(self._categories.keys())
    
    def search(self, query: str) -> List[PromptTemplate]:
        query_lower = query.lower()
        results = []
        for template in self._templates.values():
            if (query_lower in template.name.lower() or
                query_lower in template.description.lower() or
                any(query_lower in tag.lower() for tag in template.tags)):
                results.append(template)
        return results
    
    def save_to_file(self, path: Union[str, Path]) -> None:
        path = Path(path)
        data = {
            name: template.to_dict() 
            for name, template in self._templates.items()
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, path: Union[str, Path]) -> None:
        path = Path(path)
        if not path.exists():
            return
        with open(path) as f:
            data = json.load(f)
        for name, template_data in data.items():
            self.register(PromptTemplate.from_dict(template_data))
        self._loaded = True


_registry = PromptRegistry()


def register_prompt_template(
    name: str,
    template: str,
    description: str = "",
    category: str = "general",
    tags: Optional[List[str]] = None,
) -> PromptTemplate:
    """Register a new prompt template."""
    pt = PromptTemplate(
        name=name,
        template=template,
        description=description,
        category=category,
        tags=tags or [],
    )
    _registry.register(pt)
    return pt


def build_prompt(
    template_name: str,
    **variables,
) -> str:
    """Build a prompt from a registered template."""
    template = _registry.get(template_name)
    if template is None:
        raise KeyError(f"Template '{template_name}' not found")
    return template.render(**variables)


def list_prompt_templates(
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> List[PromptTemplate]:
    """List available prompt templates."""
    if category:
        return _registry.list_by_category(category)
    templates = _registry.list_all()
    if tags:
        templates = [
            t for t in templates
            if any(tag in t.tags for tag in tags)
        ]
    return templates


DEFAULT_TEMPLATES = {
    "openclaw_task": PromptTemplate(
        name="openclaw_task",
        template="[TASK]\nYou are an agent with the following goal: {goal}\n\n[CONTEXT]\n{context}\n\n[CONSTRAINTS]\n{constraints}\n\n[EXPECTED OUTPUT]\n{output_format}",
        description="Standard OpenClaw task prompt template",
        category="agent",
        tags=["agent", "task", "workflow"],
    ),
    "openclaw_chain": PromptTemplate(
        name="openclaw_chain",
        template="[CHAIN: {chain_name}]\n\nStep {step_number} of {total_steps}:\n{step_description}\n\nInput from previous step:\n{previous_output}\n\nProduce output for next step.",
        description="Chain-of-thought prompt for multi-step reasoning",
        category="agent",
        tags=["chain", "reasoning", "multi-step"],
    ),
    "openclaw_creative": PromptTemplate(
        name="openclaw_creative",
        template="Create {medium} about {subject}.\n\nStyle: {style}\nMood: {mood}\nLength: {length}\n\nAdditional notes: {notes}",
        description="Creative content generation prompt",
        category="creative",
        tags=["creative", "generation", "content"],
    ),
    "openclaw_analysis": PromptTemplate(
        name="openclaw_analysis",
        template="Analyze the following {content_type}:\n\n[CONTENT]\n{content}\n\n[ANALYSIS FRAMEWORK]\n{framework}\n\nProvide:\n1. Summary\n2. Key insights\n3. Recommendations",
        description="Analysis and evaluation prompt template",
        category="analysis",
        tags=["analysis", "evaluation", "review"],
    ),
    "openclaw_code": PromptTemplate(
        name="openclaw_code",
        template="[CODING TASK]\n{task_description}\n\n[LANGUAGE]\n{language}\n\n[REQUIREMENTS]\n{requirements}\n\n[CONSTRAINTS]\n{constraints}\n\nProvide:\n1. Code solution\n2. Brief explanation\n3. Example usage",
        description="Code generation and problem-solving prompt",
        category="code",
        tags=["code", "programming", "development"],
    ),
    "openclaw_reflect": PromptTemplate(
        name="openclaw_reflect",
        template="[REFLECTION]\nReview the following output:\n\n{output}\n\nEvaluate against criteria:\n{criteria}\n\nProvide:\n1. Strengths (what worked well)\n2. Weaknesses (what could improve)\n3. Suggestions for improvement\n4. Revised output (if applicable)",
        description="Self-reflection and improvement prompt",
        category="meta",
        tags=["reflection", "improvement", "meta"],
    ),
}


for template in DEFAULT_TEMPLATES.values():
    _registry.register(template)
