"""
Seed the database with initial learning modules.
Run this after database is created to populate learning content.
"""
import sys
sys.path.insert(0, '/home/user/Tet/backend')

from src.database import SessionLocal, engine, Base
from src.models import LearningModule
import uuid


def create_modules():
    """Create initial learning modules"""
    db = SessionLocal()

    modules = [
        # =====================================================================
        # CSS MODULES
        # =====================================================================
        {
            "skill_category": "CSS",
            "skill_specific": "CSS Basics - Selectors",
            "difficulty_level": 1,
            "estimated_duration_min": 7,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "CSS Selectors",
                "intro": "CSS selectors target HTML elements. No theory. Just what works.",
                "concepts": [
                    {
                        "name": "Element selector",
                        "code": "p { color: blue; }",
                        "explanation": "Targets all <p> tags. Changes text color."
                    },
                    {
                        "name": "Class selector",
                        "code": ".warning { color: red; }",
                        "explanation": "Targets elements with class='warning'"
                    },
                    {
                        "name": "ID selector",
                        "code": "#header { font-size: 24px; }",
                        "explanation": "Targets element with id='header'. One per page."
                    }
                ],
                "practice": {
                    "instruction": "Make all paragraphs red and the element with id='title' bold.",
                    "solution": "p { color: red; }\n#title { font-weight: bold; }"
                }
            }
        },
        {
            "skill_category": "CSS",
            "skill_specific": "CSS Flexbox - Basics",
            "difficulty_level": 3,
            "estimated_duration_min": 12,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "Flexbox Layout",
                "intro": "Flexbox arranges items in rows or columns. Most useful CSS skill.",
                "concepts": [
                    {
                        "name": "Create flex container",
                        "code": ".container { display: flex; }",
                        "explanation": "Makes children flexible. This is the start."
                    },
                    {
                        "name": "Direction",
                        "code": "flex-direction: row; /* or column */",
                        "explanation": "row = horizontal, column = vertical"
                    },
                    {
                        "name": "Spacing",
                        "code": "justify-content: space-between;",
                        "explanation": "Spreads items evenly with space between"
                    }
                ],
                "practice": {
                    "instruction": "Create a horizontal nav bar with items spaced evenly.",
                    "solution": ".nav { display: flex; justify-content: space-between; }"
                }
            }
        },
        {
            "skill_category": "CSS",
            "skill_specific": "CSS Grid - Layout",
            "difficulty_level": 4,
            "estimated_duration_min": 15,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "CSS Grid",
                "intro": "Grid is for 2D layouts. More powerful than flexbox for complex designs.",
                "concepts": [
                    {
                        "name": "Create grid",
                        "code": ".container { display: grid; grid-template-columns: 1fr 1fr 1fr; }",
                        "explanation": "Creates 3 equal columns. fr = fraction of space."
                    },
                    {
                        "name": "Gap",
                        "code": "gap: 20px;",
                        "explanation": "Space between grid items"
                    },
                    {
                        "name": "Span items",
                        "code": ".item { grid-column: span 2; }",
                        "explanation": "Make item take 2 columns"
                    }
                ],
                "practice": {
                    "instruction": "Create 3-column grid with 10px gaps.",
                    "solution": ".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }"
                }
            }
        },

        # =====================================================================
        # PYTHON MODULES
        # =====================================================================
        {
            "skill_category": "Python",
            "skill_specific": "Python Basics - Variables",
            "difficulty_level": 1,
            "estimated_duration_min": 5,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "Python Variables",
                "intro": "Variables store data. That's it.",
                "concepts": [
                    {
                        "name": "String",
                        "code": "name = 'Fracture'",
                        "explanation": "Text in quotes"
                    },
                    {
                        "name": "Number",
                        "code": "debt = 250000",
                        "explanation": "Integer (whole number)"
                    },
                    {
                        "name": "Float",
                        "code": "hours = 14.5",
                        "explanation": "Decimal number"
                    },
                    {
                        "name": "Boolean",
                        "code": "is_fucked = True",
                        "explanation": "True or False"
                    }
                ],
                "practice": {
                    "instruction": "Create variable 'goal' with value 'learn Python'",
                    "solution": "goal = 'learn Python'"
                }
            }
        },
        {
            "skill_category": "Python",
            "skill_specific": "Python Lists",
            "difficulty_level": 2,
            "estimated_duration_min": 8,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "Python Lists",
                "intro": "Lists hold multiple values. Most used data structure.",
                "concepts": [
                    {
                        "name": "Create list",
                        "code": "skills = ['Python', 'CSS', 'Git']",
                        "explanation": "Square brackets, comma separated"
                    },
                    {
                        "name": "Access item",
                        "code": "first_skill = skills[0]",
                        "explanation": "Index starts at 0"
                    },
                    {
                        "name": "Add item",
                        "code": "skills.append('JavaScript')",
                        "explanation": "Adds to end of list"
                    },
                    {
                        "name": "List length",
                        "code": "count = len(skills)",
                        "explanation": "How many items"
                    }
                ],
                "practice": {
                    "instruction": "Create list of 3 skills and add one more.",
                    "solution": "skills = ['HTML', 'CSS', 'JS']\nskills.append('Python')"
                }
            }
        },
        {
            "skill_category": "Python",
            "skill_specific": "Python Functions",
            "difficulty_level": 3,
            "estimated_duration_min": 10,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "Python Functions",
                "intro": "Functions are reusable blocks of code. Write once, use many times.",
                "concepts": [
                    {
                        "name": "Define function",
                        "code": "def greet():\n    print('Hello')",
                        "explanation": "def = define, () = parameters, : starts block"
                    },
                    {
                        "name": "With parameters",
                        "code": "def greet(name):\n    print(f'Hello {name}')",
                        "explanation": "Function takes input"
                    },
                    {
                        "name": "Return value",
                        "code": "def add(a, b):\n    return a + b",
                        "explanation": "Send result back"
                    }
                ],
                "practice": {
                    "instruction": "Write function that takes debt amount and returns 'High' if > 200000, else 'Low'",
                    "solution": "def debt_status(amount):\n    if amount > 200000:\n        return 'High'\n    else:\n        return 'Low'"
                }
            }
        },

        # =====================================================================
        # JAVASCRIPT MODULES
        # =====================================================================
        {
            "skill_category": "JavaScript",
            "skill_specific": "JavaScript Basics - Variables",
            "difficulty_level": 1,
            "estimated_duration_min": 6,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "JavaScript Variables",
                "intro": "JS variables. let and const. Forget var.",
                "concepts": [
                    {
                        "name": "let (changeable)",
                        "code": "let hours = 14;",
                        "explanation": "Can be reassigned later"
                    },
                    {
                        "name": "const (fixed)",
                        "code": "const name = 'Fracture';",
                        "explanation": "Cannot be changed"
                    },
                    {
                        "name": "String template",
                        "code": "const msg = `Hours: ${hours}`;",
                        "explanation": "Backticks for inserting variables"
                    }
                ],
                "practice": {
                    "instruction": "Create const for app name 'Fracture' and let for user count starting at 0.",
                    "solution": "const appName = 'Fracture';\nlet userCount = 0;"
                }
            }
        },
        {
            "skill_category": "JavaScript",
            "skill_specific": "JavaScript Arrays",
            "difficulty_level": 2,
            "estimated_duration_min": 8,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "JavaScript Arrays",
                "intro": "Arrays in JS. Similar to Python lists.",
                "concepts": [
                    {
                        "name": "Create array",
                        "code": "const skills = ['HTML', 'CSS', 'JS'];",
                        "explanation": "Square brackets"
                    },
                    {
                        "name": "Access item",
                        "code": "const first = skills[0];",
                        "explanation": "Index starts at 0"
                    },
                    {
                        "name": "Add item",
                        "code": "skills.push('Python');",
                        "explanation": "push() adds to end"
                    },
                    {
                        "name": "Array methods",
                        "code": "skills.map(skill => skill.toUpperCase())",
                        "explanation": "Transform each item"
                    }
                ],
                "practice": {
                    "instruction": "Create array of 3 numbers and add one more using push.",
                    "solution": "const numbers = [1, 2, 3];\nnumbers.push(4);"
                }
            }
        },

        # =====================================================================
        # GIT MODULES
        # =====================================================================
        {
            "skill_category": "Git",
            "skill_specific": "Git Basics - Init and Commit",
            "difficulty_level": 2,
            "estimated_duration_min": 10,
            "prerequisite_modules": [],
            "content_type": "text",
            "content_data": {
                "title": "Git Basics",
                "intro": "Git tracks code changes. Required for all dev jobs.",
                "concepts": [
                    {
                        "name": "Initialize repo",
                        "code": "git init",
                        "explanation": "Creates .git folder. Do once per project."
                    },
                    {
                        "name": "Check status",
                        "code": "git status",
                        "explanation": "Shows changed files"
                    },
                    {
                        "name": "Stage files",
                        "code": "git add filename.js",
                        "explanation": "Prepare files for commit"
                    },
                    {
                        "name": "Commit",
                        "code": "git commit -m 'Add feature'",
                        "explanation": "Save snapshot of changes"
                    }
                ],
                "practice": {
                    "instruction": "Stage file 'app.js' and commit with message 'Initial commit'",
                    "solution": "git add app.js\ngit commit -m 'Initial commit'"
                }
            }
        },

        # =====================================================================
        # SHORT MODULES FOR OVERWHELMED STATE
        # =====================================================================
        {
            "skill_category": "HTML",
            "skill_specific": "HTML Basic Structure",
            "difficulty_level": 1,
            "estimated_duration_min": 5,
            "prerequisite_modules": [],
            "content_type": "interactive",
            "content_data": {
                "title": "HTML Skeleton",
                "intro": "Every HTML page needs this structure.",
                "concepts": [
                    {
                        "name": "Doctype",
                        "code": "<!DOCTYPE html>",
                        "explanation": "Tells browser: this is HTML5"
                    },
                    {
                        "name": "HTML tag",
                        "code": "<html>\n  <head></head>\n  <body></body>\n</html>",
                        "explanation": "Root element. Contains everything."
                    },
                    {
                        "name": "Head section",
                        "code": "<head>\n  <title>Page Title</title>\n</head>",
                        "explanation": "Metadata. Not visible on page."
                    },
                    {
                        "name": "Body section",
                        "code": "<body>\n  <h1>Hello</h1>\n</body>",
                        "explanation": "Visible content goes here"
                    }
                ],
                "practice": {
                    "instruction": "Write minimal HTML page with title 'Fracture'",
                    "solution": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Fracture</title>\n</head>\n<body>\n</body>\n</html>"
                }
            }
        },
        {
            "skill_category": "Digital Art",
            "skill_specific": "Color Theory Basics",
            "difficulty_level": 2,
            "estimated_duration_min": 8,
            "prerequisite_modules": [],
            "content_type": "text",
            "content_data": {
                "title": "Color Basics",
                "intro": "Color choice makes or breaks design. Start here.",
                "concepts": [
                    {
                        "name": "Primary colors",
                        "explanation": "Red, Blue, Yellow. Cannot be created by mixing."
                    },
                    {
                        "name": "Complementary colors",
                        "explanation": "Opposite on color wheel. High contrast. Red/Green, Blue/Orange."
                    },
                    {
                        "name": "Analogous colors",
                        "explanation": "Next to each other. Harmonious. Blue, Blue-Green, Green."
                    },
                    {
                        "name": "Saturation",
                        "explanation": "Intensity of color. High = vibrant, Low = muted/gray."
                    }
                ],
                "practice": {
                    "instruction": "Name the complementary color of blue.",
                    "solution": "Orange"
                }
            }
        }
    ]

    # Create modules
    for module_data in modules:
        module = LearningModule(**module_data)
        db.add(module)

    db.commit()
    print(f"Created {len(modules)} learning modules")
    db.close()


if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("Database tables created")

    # Seed modules
    create_modules()
    print("Database seeded successfully")
