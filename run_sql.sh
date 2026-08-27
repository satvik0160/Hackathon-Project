#!/bin/bash
# split the seed_generated.sql and execute
# Actually, since it's inside a DO $$ BEGIN ... END $$, we can't easily chunk it if it's one block.
