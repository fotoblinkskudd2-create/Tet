#!/usr/bin/env python3
"""
Micro App Generator - Generates micro apps following Tet project patterns

Usage:
    python micro_app_generator.py cli my_app "Description"
    python micro_app_generator.py api my_feature "REST endpoint description"
    python micro_app_generator.py page my_page "UI page description"
    python micro_app_generator.py full my_full_app "Complete app description"
"""

import argparse
import os
import re
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class AppConfig:
    """Configuration for generating a micro app"""
    name: str
    description: str
    app_type: str  # cli, api, page, full
    output_dir: Path


class TemplateEngine:
    """Simple template engine for generating code files"""

    @staticmethod
    def render(template: str, context: Dict[str, str]) -> str:
        """Replace {{variable}} placeholders with context values"""
        result = template
        for key, value in context.items():
            result = result.replace(f"{{{{{key}}}}}", value)
        return result


class MicroAppGenerator:
    """Generates micro apps based on templates"""

    def __init__(self, config: AppConfig):
        self.config = config
        self.engine = TemplateEngine()
        self.base_path = Path("/home/user/Tet")

    def generate(self):
        """Main generation entry point"""
        print(f"🚀 Generating {self.config.app_type} micro app: {self.config.name}")
        print(f"📝 Description: {self.config.description}\n")

        if self.config.app_type == "cli":
            self._generate_cli_app()
        elif self.config.app_type == "api":
            self._generate_api_route()
        elif self.config.app_type == "page":
            self._generate_frontend_page()
        elif self.config.app_type == "full":
            self._generate_full_stack_app()
        else:
            raise ValueError(f"Unknown app type: {self.config.app_type}")

        print("\n✅ Generation complete!")
        self._print_next_steps()

    def _generate_cli_app(self):
        """Generate a Python CLI application"""
        file_path = self.base_path / f"{self.config.name}.py"

        template = '''#!/usr/bin/env python3
"""
{{name}} - {{description}}

Usage:
    python {{name}}.py [options] <input>
"""

import argparse
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class {{class_name}}Result:
    """Result wrapper for {{name}} operations"""
    success: bool
    message: str
    details: Optional[List[str]] = None

    def format(self) -> str:
        """Format result for user display"""
        output = []
        output.append("=" * 50)
        output.append(f"{'✅' if self.success else '❌'} {{NAME}}")
        output.append("=" * 50)
        output.append(self.message)

        if self.details:
            output.append("\\nDetails:")
            for detail in self.details:
                output.append(f"  • {detail}")

        return "\\n".join(output)


class {{class_name}}:
    """Main {{name}} application logic"""

    def __init__(self):
        self.name = "{{name}}"
        self.description = "{{description}}"

    def process(self, input_data: str) -> {{class_name}}Result:
        """Process input and return result"""
        # TODO: Implement your app logic here

        return {{class_name}}Result(
            success=True,
            message=f"Processed: {input_data}",
            details=[
                "Step 1: Input received",
                "Step 2: Processing logic (implement this!)",
                "Step 3: Return result"
            ]
        )


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="{{description}}"
    )
    parser.add_argument(
        "input",
        help="Input data to process"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )

    args = parser.parse_args()

    app = {{class_name}}()
    result = app.process(args.input)

    print(result.format())

    return 0 if result.success else 1


if __name__ == "__main__":
    exit(main())
'''

        context = {
            "name": self.config.name,
            "NAME": self.config.name.upper(),
            "description": self.config.description,
            "class_name": self._to_class_name(self.config.name)
        }

        content = self.engine.render(template, context)

        with open(file_path, 'w') as f:
            f.write(content)

        # Make executable
        os.chmod(file_path, 0o755)

        print(f"✨ Created CLI app: {file_path}")

        # Generate test file
        self._generate_test_file("cli")

    def _generate_api_route(self):
        """Generate a backend Express.js API route"""
        route_dir = self.base_path / "backend" / "src" / "routes"
        route_dir.mkdir(parents=True, exist_ok=True)

        file_path = route_dir / f"{self.config.name}.ts"

        template = '''import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * {{description}}
 */

interface {{class_name}}Request {
  data: string;
}

interface {{class_name}}Response {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * GET /api/{{name}}
 * Retrieve {{name}} data
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Implement GET logic
    const response: {{class_name}}Response = {
      success: true,
      message: '{{name}} data retrieved successfully',
      data: {
        example: 'Replace with actual data'
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve {{name}} data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/{{name}}
 * Create new {{name}} entry
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const requestData: {{class_name}}Request = req.body;

    // TODO: Implement POST logic
    // Example validation
    if (!requestData.data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: data'
      });
    }

    const response: {{class_name}}Response = {
      success: true,
      message: '{{name}} created successfully',
      data: {
        id: 'generated-id',
        ...requestData
      }
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create {{name}}',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/{{name}}/:id
 * Update existing {{name}} entry
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // TODO: Implement PUT logic

    const response: {{class_name}}Response = {
      success: true,
      message: `{{name}} ${id} updated successfully`,
      data: {
        id,
        ...updateData
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update {{name}}',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/{{name}}/:id
 * Delete {{name}} entry
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement DELETE logic

    const response: {{class_name}}Response = {
      success: true,
      message: `{{name}} ${id} deleted successfully`
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete {{name}}',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
'''

        context = {
            "name": self.config.name,
            "NAME": self.config.name.upper(),
            "description": self.config.description,
            "class_name": self._to_class_name(self.config.name)
        }

        content = self.engine.render(template, context)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"✨ Created API route: {file_path}")
        print(f"💡 Remember to import this route in your main Express app")

    def _generate_frontend_page(self):
        """Generate a Next.js React page"""
        page_dir = self.base_path / "frontend" / "src" / "pages" / self.config.name
        page_dir.mkdir(parents=True, exist_ok=True)

        file_path = page_dir / "index.tsx"

        template = '''import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * {{description}}
 */

interface {{class_name}}Data {
  id: string;
  data: string;
}

const {{class_name}}Page: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<{{class_name}}Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/{{name}}');

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: Implement form submission logic
    const formData = new FormData(e.currentTarget);
    const inputData = formData.get('data') as string;

    try {
      const response = await fetch('/api/{{name}}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Laster...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <p>Feil: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{{name}}</h1>
      <p>{{description}}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="data">
            Data:
          </label>
          <input
            type="text"
            id="data"
            name="data"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send inn
        </button>
      </form>

      {data && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h2>Resultat</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default {{class_name}}Page;
'''

        context = {
            "name": self.config.name,
            "NAME": self.config.name.upper(),
            "description": self.config.description,
            "class_name": self._to_class_name(self.config.name)
        }

        content = self.engine.render(template, context)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"✨ Created frontend page: {file_path}")
        print(f"💡 Access at: http://localhost:3000/{self.config.name}")

    def _generate_full_stack_app(self):
        """Generate a complete full-stack micro app"""
        print("🏗️  Generating full-stack app components...")

        self._generate_cli_app()
        print()
        self._generate_api_route()
        print()
        self._generate_frontend_page()
        print()
        self._generate_migration()

    def _generate_test_file(self, app_type: str):
        """Generate pytest test file for CLI app"""
        test_dir = self.base_path / "tests"
        test_dir.mkdir(exist_ok=True)

        file_path = test_dir / f"test_{self.config.name}.py"

        template = '''"""
Tests for {{name}} micro app
"""

import pytest
from {{name}} import {{class_name}}, {{class_name}}Result


class Test{{class_name}}:
    """Test suite for {{name}}"""

    def setup_method(self):
        """Setup test fixtures"""
        self.app = {{class_name}}()

    def test_initialization(self):
        """Test app initializes correctly"""
        assert self.app.name == "{{name}}"
        assert self.app.description == "{{description}}"

    def test_process_basic_input(self):
        """Test basic input processing"""
        result = self.app.process("test input")

        assert isinstance(result, {{class_name}}Result)
        assert result.success is True
        assert "test input" in result.message.lower()

    def test_result_formatting(self):
        """Test result formatting"""
        result = {{class_name}}Result(
            success=True,
            message="Test message",
            details=["Detail 1", "Detail 2"]
        )

        formatted = result.format()
        assert "Test message" in formatted
        assert "Detail 1" in formatted
        assert "Detail 2" in formatted

    def test_process_empty_input(self):
        """Test handling of empty input"""
        result = self.app.process("")
        assert isinstance(result, {{class_name}}Result)

    # TODO: Add more test cases specific to your app logic


def test_{{name}}_integration():
    """Integration test for {{name}}"""
    app = {{class_name}}()
    result = app.process("integration test data")

    assert result.success is True
    assert result.message is not None
'''

        context = {
            "name": self.config.name,
            "NAME": self.config.name.upper(),
            "description": self.config.description,
            "class_name": self._to_class_name(self.config.name)
        }

        content = self.engine.render(template, context)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"✨ Created test file: {file_path}")
        print(f"💡 Run tests with: pytest {file_path}")

    def _generate_migration(self):
        """Generate database migration file"""
        migration_dir = self.base_path / "migrations"
        migration_dir.mkdir(exist_ok=True)

        # Find next migration number
        existing_migrations = list(migration_dir.glob("*.sql"))
        next_num = len(existing_migrations) + 1

        file_path = migration_dir / f"{next_num:03d}_create_{self.config.name}_table.sql"

        template = '''-- Migration: Create {{name}} table
-- Description: {{description}}

CREATE TABLE IF NOT EXISTS {{name}} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_{{name}}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {{name}}_updated_at
    BEFORE UPDATE ON {{name}}
    FOR EACH ROW
    EXECUTE FUNCTION update_{{name}}_updated_at();

-- Create indexes
CREATE INDEX idx_{{name}}_created_at ON {{name}}(created_at DESC);

-- Add comments
COMMENT ON TABLE {{name}} IS '{{description}}';
COMMENT ON COLUMN {{name}}.id IS 'Unique identifier';
COMMENT ON COLUMN {{name}}.data IS 'Main data field';
COMMENT ON COLUMN {{name}}.metadata IS 'Additional metadata as JSON';
COMMENT ON COLUMN {{name}}.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN {{name}}.updated_at IS 'Record last update timestamp';
'''

        context = {
            "name": self.config.name,
            "description": self.config.description
        }

        content = self.engine.render(template, context)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"✨ Created migration: {file_path}")
        print(f"💡 Apply with: psql -f {file_path}")

    def _to_class_name(self, name: str) -> str:
        """Convert snake_case name to PascalCase class name"""
        parts = name.split('_')
        return ''.join(word.capitalize() for word in parts)

    def _print_next_steps(self):
        """Print helpful next steps for the user"""
        print("\n📋 Next Steps:")
        print("=" * 50)

        if self.config.app_type in ("cli", "full"):
            print(f"1. Review generated CLI: {self.config.name}.py")
            print(f"2. Run: python {self.config.name}.py --help")
            print(f"3. Run tests: pytest tests/test_{self.config.name}.py")

        if self.config.app_type in ("api", "full"):
            print(f"4. Import route in backend/src/server.ts:")
            print(f"   import {self.config.name}Routes from './routes/{self.config.name}';")
            print(f"   app.use('/api/{self.config.name}', {self.config.name}Routes);")

        if self.config.app_type in ("page", "full"):
            print(f"5. Start frontend: cd frontend && npm run dev")
            print(f"6. Visit: http://localhost:3000/{self.config.name}")

        if self.config.app_type == "full":
            print(f"7. Apply migration: psql -f migrations/*_{self.config.name}_table.sql")

        print("\n🎉 Happy coding!")


def main():
    """CLI entry point for micro app generator"""
    parser = argparse.ArgumentParser(
        description="Generate micro apps following Tet project patterns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python micro_app_generator.py cli calculator "Simple calculator app"
  python micro_app_generator.py api tasks "Task management API"
  python micro_app_generator.py page dashboard "User dashboard UI"
  python micro_app_generator.py full blog "Complete blogging system"
        """
    )

    parser.add_argument(
        "type",
        choices=["cli", "api", "page", "full"],
        help="Type of micro app to generate"
    )
    parser.add_argument(
        "name",
        help="Name of the micro app (use snake_case)"
    )
    parser.add_argument(
        "description",
        help="Brief description of the app"
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Output directory (default: current directory)"
    )

    args = parser.parse_args()

    # Validate name format
    if not re.match(r'^[a-z][a-z0-9_]*$', args.name):
        print("❌ Error: Name must be lowercase snake_case (e.g., my_app_name)")
        return 1

    config = AppConfig(
        name=args.name,
        description=args.description,
        app_type=args.type,
        output_dir=Path(args.output_dir)
    )

    try:
        generator = MicroAppGenerator(config)
        generator.generate()
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
