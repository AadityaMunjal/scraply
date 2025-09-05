#!/usr/bin/env python3
"""
Notebook generation wrapper for Electron integration
"""

import sys
import json
import os
from generate import Generate


def main():
    if len(sys.argv) != 2:
        print("Error: Configuration JSON required as argument")
        sys.exit(1)

    try:
        config = json.loads(sys.argv[1])

        # Initialize the generator
        generator = Generate(config)

        # Generate the notebook
        generator.generate_notebook()

        # Check if file was created successfully
        if os.path.exists("generated_notebook.ipynb"):
            print("Notebook generated successfully as 'generated_notebook.ipynb'")

            # Read and return the notebook content
            with open("generated_notebook.ipynb", "r") as f:
                notebook_content = f.read()

            # Return the notebook content in a JSON structure
            result = {
                "success": True,
                "filename": "generated_notebook.ipynb",
                "content": notebook_content,
            }
            print(json.dumps(result))
        else:
            print("Error: Failed to generate notebook file")
            sys.exit(1)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON configuration: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
