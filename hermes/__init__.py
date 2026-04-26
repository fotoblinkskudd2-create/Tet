"""
OpenClaw Hermes — lightweight AI agent framework.

Quick start (fully offline):
    from hermes import HermesAgent, default_registry
    agent = HermesAgent(registry=default_registry())
    print(agent.run("2 + 3 * 4"))

With Claude as the thinking layer:
    import anthropic
    client = anthropic.Anthropic()

    def claude_think(context_block: str, user_input: str) -> str:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            system=f"You are Hermes. Context:\\n{context_block}",
            messages=[{"role": "user", "content": user_input}],
        )
        return resp.content[0].text

    agent = HermesAgent(registry=default_registry(), think_fn=claude_think)
"""
from hermes.agent import HermesAgent
from hermes.adapters import default_registry
from hermes.memory import MemoryStore
from hermes.tools import Tool, ToolRegistry

__all__ = [
    "HermesAgent",
    "MemoryStore",
    "Tool",
    "ToolRegistry",
    "default_registry",
]
