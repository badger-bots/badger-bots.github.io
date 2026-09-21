---
title: Behavior Control
layout: default
parent: Teams
nav_order: 4
---

# Behavior Control

**Team Lead**: Daeyon Kim and Nikolas Margaritis

**Team Description**: Develops the intelligent behavior that enables our robots to coordinate with each other and make the best possible choices for what skills to use at each moment of the game.

## Multi-agent Behavior

1. Multi-agent RL
2. Dynamic positioning
3. Passing behavior

## Obstacle Avoidance

1. Teammate avoidance
2. Opponent avoidance

## Game logging (Collect real trajectory) 

Record what the robot saw and decided during a game, then replay it offline to debug and test behavior changes without the robot

1. Record game data with ros2 bag  
2. Compare behavior before and after code changes

## Learning-based Behavior 

We can collect data in sim or use real data from Game logging

1. RL-based skill selection
2. End to end behavior policy
3. Behavior tree replacement

## Head Behavior

1. Active head control
2. Ball tracking
3. Landmark scanning
4. Ball search