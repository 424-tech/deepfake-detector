# Deepfake Detection Tool

## Overview

This is a comprehensive deepfake detection application that offers two modes of operation:
1.  **Cloud Mode**: Integrates with Reality Defender SDK for professional-grade detection.
2.  **Local Mode**: Uses a custom, educational statistical model for offline detection without API dependencies.

## Features

-   **Dual Mode Detection**: Choose between cloud-based and local analysis.
-   **Streamlit Interface**: User-friendly web interface for image uploading and visualization.
-   **Local Analysis**:
    -   Uses `deepfake_detector.py` and `image_processor.py`.
    -   Analyzes noise patterns, pixel intensity, edges, texture, compression, and color distribution.
    -   Provides detailed feature breakdown and risk assessment.
-   **Cloud Analysis**:
    -   Integrates with Reality Defender API.
    -   Auto-discovers SDK methods.
    -   Supports async polling and multiple upload methods.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

Run the Streamlit app:

```bash
streamlit run app.py
```

### Configuration

To use the Reality Defender Cloud Mode, you need an API key.
Add it to `.streamlit/secrets.toml`:

```toml
REALITY_DEFENDER_API_KEY = "your_api_key_here"
```

If no API key is found, the app will default to Local Mode.

## Project Structure

-   `app.py`: Main Streamlit application.
-   `deepfake_detector.py`: Core logic for the local educational model.
-   `image_processor.py`: Image feature extraction for the local model.
-   `utils.py`: Visualization and helper functions.
-   `tests/`: Unit tests for local components.

## Disclaimer

The local detection model is designed for **educational purposes** and relies on statistical heuristics. It should not be considered a production-ready security tool. For professional security needs, ensure you use the Reality Defender Cloud Mode.
