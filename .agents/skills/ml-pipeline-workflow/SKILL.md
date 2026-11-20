---
name: ml-pipeline-workflow
description: Orchestrates data ingestion, preprocessing stages, tensor transformations, evaluation metrics, and tracking protocols across model training and inference loops. Use when developing machine learning pipelines, preprocessing datasets, or setting up experiment tracking.
---

# ML Pipeline Workflow Skill

Standardizes modular Machine Learning data processing, evaluation pipelines, and experiment tracking.

## 1. Modular Stage Architecture

Structure pipelines into distinct, testable stages:
```text
pipeline/
├── ingestion/       # Raw dataset loaders and API connectors
├── preprocessing/   # Tokenization, normalization, categorical encoding
├── features/        # Feature extraction & embeddings generation
├── training/        # Model definition, loss, optimizer, training loop
├── evaluation/      # Precision, recall, ROC-AUC, latency profiling
└── tracking/        # Metadata logging (MLflow, Weights & Biases)
```

## 2. Deterministic Preprocessing & Validation

- Save transformation artifacts (scalers, encoders, tokenizers) alongside model checkpoints to prevent train-serve skew.
- Validate dataset schema and integrity before pipeline runs:
  - Check for NaN/null distributions.
  - Verify label balance.
  - Assert tensor shapes at boundaries.

## 3. Evaluation & Tracking Protocol

Record hyperparameter configurations, metrics, git commit hashes, and dataset versions on every run for reproducibility.

