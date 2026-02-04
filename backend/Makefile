.PHONY: test test-integration install run clean

# Run all tests (unit + integration)
test:
	uv run python -m pytest

# Run only integration tests
test-integration:
	uv run python -m pytest tests_integration

# Run only unit tests
test-unit:
	uv run python -m pytest tests

# Install dependencies
install:
	uv sync

# Run development server
run:
	uv run uvicorn app.main:app --reload

# Clean up cache files
clean:
	rm -rf __pycache__ .pytest_cache
