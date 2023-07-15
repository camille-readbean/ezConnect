#!/bin/bash
# Inside backend/ folder
cd "$(dirname "$0")"
sudo docker compose cp pre_data/degrees.csv db:/degrees.csv
sudo docker compose cp pre_data/programmes.csv db:/programmes.csv
sudo docker compose cp pre_data/courses.csv db:/courses.csv
sudo docker compose cp pre_data/prerequisites.csv db:/prerequisites.csv
cd ezConnect
export APP_ENV=dev
flask db upgrade
cd ..
sudo docker compose exec db psql ezConnect -c "COPY programme FROM '/programmes.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose exec db psql ezConnect -c "COPY degree FROM '/degrees.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose exec db psql ezConnect -c "COPY course FROM '/courses.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose exec db psql ezConnect -c "COPY prerequisites FROM '/prerequisites.csv' DELIMITER ',' CSV HEADER;"
