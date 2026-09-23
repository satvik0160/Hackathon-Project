#!/bin/bash
# Run the answer randomization migration
# Usage: bash scripts/fix-answers.sh
echo "Randomizing quiz answer positions..."
npx @insforge/cli db push migrations/20260923000002_randomize-answer-positions.sql
echo "Done! Correct answers are now evenly distributed across A, B, C, D."
