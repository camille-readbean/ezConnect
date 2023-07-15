#!/bin/bash
cd "$(dirname "$0")"
# Inside backend/tests folder
sudo docker compose --file test.docker-compose.yml stop
sudo docker compose --file test.docker-compose.yml rm -f
sudo docker compose --file test.docker-compose.yml create 
sudo docker compose --file test.docker-compose.yml start
# sudo docker compose cp pre_data/degrees.csv db:/degrees.csv
# sudo docker compose cp pre_data/programmes.csv db:/programmes.csv
# sudo docker compose cp pre_data/courses.csv db:/courses.csv
echo "PLEASE WAIT while we do 'flask db upgrade'"
sleep 1
cd ../ezConnect
export APP_ENV=testing
flask db upgrade
cd ../tests
sudo docker compose --file test.docker-compose.yml exec db psql ezConnect -c "COPY programme FROM '/pre_data/programmes.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose --file test.docker-compose.yml exec db psql ezConnect -c "COPY degree FROM '/pre_data/degrees.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose --file test.docker-compose.yml exec db psql ezConnect -c "COPY course FROM '/pre_data/courses.csv' DELIMITER ',' CSV HEADER;"
sudo docker compose --file test.docker-compose.yml exec db psql ezConnect -c "COPY prerequisites FROM '/pre_data/prerequisites.csv' DELIMITER ',' CSV HEADER;"