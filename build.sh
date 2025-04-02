set -e
npm install
docker-compose build
docker-compose up --build