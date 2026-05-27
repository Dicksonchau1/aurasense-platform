FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install poetry && poetry install --no-root
COPY src/ ./src/
COPY tests/ ./tests/
CMD ["poetry", "run", "python", "-m", "atlas_learning.main"]
