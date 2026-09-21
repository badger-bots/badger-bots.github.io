---
title: Low-Level Control
layout: default
parent: Teams
nav_order: 3
---

# Motion Control Team

**Team Lead**: Tund Theerawit and Ashvin Anilkumar

**Team Description**: Gives our robot the basic movements needed to play soccer: walking, kicking, dribbling, getting up, and stopping.

**Team Members**: Joe Skantz, Golsa Moinshaghaghi

## Proprioception Motions

1. Walking controller
2. Falling controller  
3. Fall prediction
4. Stopping controller (safe stop):
   1. Develop a walk controller that brings the robot to a standing pose and can be invoked any time we want the robot to stop.
   2. The project is complete when the robot can be safely stopped in the middle of dynamic motions like sprinting.
   3. During games and testing, robots are frequently interrupted and made to stop; this controller makes sure they do it safely.
5. Fast head scan
6. Non-vision kicks
7. Getting up from the ground
8. Walking sideways
9. Goalie policy

## End-to-end Motions

1. Intercepting ball
2. Dribbling
3. New vision kick
4. Ball tracking

## System Identification

1. System ID workflow to identify contact coefficients.
2. Match simulation with actual movement.

## Figure out GPU allocation for training

1. CHTC? (needs to containerise the repo)
2. PAL PC? (PAL 5 or PAL 3)

## W&B logging

1. [https://wandb.ai/Motion\_Control\_Team](https://wandb.ai/Motion_Control_Team)