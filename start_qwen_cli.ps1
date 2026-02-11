# --build flag check for changes in the Dockerfile or docker-compose.yml
$env:CLI_VERSION = "0.10.5"
docker compose build --build-arg CLI_VERSION=$env:CLI_VERSION qwen
docker compose run --remove-orphans -i qwen