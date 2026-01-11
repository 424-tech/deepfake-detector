# Instructions for Agents

This repository contains a Streamlit application for deepfake detection.

## Key Instructions

1.  **Testing**:
    -   Always run tests before submitting changes.
    -   Use `python -m unittest discover tests` to run the test suite.
    -   Ensure both `deepfake_detector.py` and `image_processor.py` are covered by tests.

2.  **Architecture**:
    -   `app.py` is the main entry point. It handles the UI and logic switching.
    -   `deepfake_detector.py` contains the local ML logic (Isolation Forest).
    -   `image_processor.py` handles feature extraction.
    -   `utils.py` contains visualization code.

3.  **Dependencies**:
    -   The project relies on `streamlit`, `scikit-learn`, `numpy`, `pillow`, `opencv-python`, and `realitydefender`.
    -   Keep `requirements.txt` updated if you add new dependencies.

4.  **Code Style**:
    -   Follow PEP 8 guidelines.
    -   Ensure docstrings are present for new functions and classes.

5.  **Environment**:
    -   The app is designed to work both with and without the `REALITY_DEFENDER_API_KEY`.
    -   When testing or running locally without an API key, ensure the "Local Educational Model" works correctly.

## Verification

When making changes to the detection logic:
1.  Run unit tests.
2.  Verify that `app.py` can load and run (mock/local mode) without crashing.
