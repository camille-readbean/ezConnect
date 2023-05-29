# syntax=docker/dockerfile:1
FROM python:3.11.3-bullseye
ADD ezConnect /usr/src/app/ezConnect
WORKDIR /usr/src/app/ezConnect
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
COPY ezConnect/prodconfig.py ./config.py
RUN apt update; apt -y install libpq-dev; apt-get clean && rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements.txt
COPY init_ezconnectflask.sh init_ezconnectflask.sh
EXPOSE 5000
RUN pip install -r requirements.txt --no-cache-dir
