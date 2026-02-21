FROM python:3.13.3-slim-bookworm 

ENV PYTHONDONTWRITEBYTECODE=1 \
PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY --from=ghcr.io/astral-sh/uv:0.10.2 /uv /uvx /bin/

COPY requirements.txt .
RUN uv pip install -r requirements.txt --system

COPY . .
RUN chmod +x ./scripts/entrypoint.sh

EXPOSE 8000

CMD ["sh", "./scripts/entrypoint.sh"]
