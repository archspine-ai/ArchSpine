export const sourceFileSchema = `{
  "semantic": {
    "_thinking": "Your scratchpad for reasoning about the rules and violations. Explain your thought process step-by-step before declaring violations. Keep this concise.",
    "role": "...",
    "responsibilities": [],
    "outOfScope": [],
    "invariants": [],
    "ruleViolations": [],
    "changeIntent": {
      "architecturalIntent": "...",
      "recentChangeIntent": "..."
    },
    "publicSurface": [],
    "driftDetected": false,
    "driftReason": null,
    "localized": {
      "English": {
        "role": "...",
        "responsibilities": ["...", "..."],
        "outOfScope": ["..."]
      }
    }
  },
  "graph": {
    "dependsOn": [
      {
        "targetPath": "...",
        "relation": "import",
        "symbols": []
      }
    ]
  }
}`;

export const documentSchema = `{
  "semantic": {
    "role": "Narrative purpose of this document",
    "responsibilities": ["Topics covered", "Maintenance scope"],
    "outOfScope": ["Topics specifically excluded"],
    "localized": {
      "English": {
        "purpose": "...",
        "context_and_audience": "...",
        "key_takeaways": ["..."]
      }
    }
  }
}`;

export const configSchema = `{
  "semantic": {
    "role": "Functional purpose of this configuration file",
    "responsibilities": ["Subsystems controlled by these settings"],
    "invariants": ["Mandatory constraints or safety limits defined here"],
    "localized": {
      "English": {
        "role": "...",
        "parameter_definitions": {
          "KEY_NAME": "Impact description"
        },
        "stability_and_risks": "..."
      }
    }
  }
}`;

export const folderSchema = `{
  "role": "One sentence summarizing what this directory represents.",
  "responsibility": "A combined summary of what the components in this directory collectively achieve.",
  "localized": {
    "English": {
      "role": "...",
      "responsibility": "..."
    }
  }
}`;

export const projectSchema = `{
  "role": "High-level vision statement of the project.",
  "responsibility": "Comprehensive summary of the system modules and their orchestration.",
  "localized": {
    "English": {
      "vision": "...",
      "orchestration": "..."
    }
  }
}`;
